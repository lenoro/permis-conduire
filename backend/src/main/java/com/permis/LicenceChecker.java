package com.permis;

// SDK licence — dépendances : aucune (Java 11+ standard library uniquement)
// Usage : appeler LicenceChecker.check() au démarrage de main().

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Enumeration;
import javax.crypto.*;
import javax.crypto.spec.*;

public class LicenceChecker {

    private static final String LICENCE_SERVER = "https://licence.infserv.ca/api/verify";
    private static final String APP_NAME = "permis";
    private static final int OFFLINE_TOLERANCE_DAYS = 15;
    private static final String CACHE_FILE = ".licence_cache";
    private static final String KEY_FILE = "licence.key";

    public static void check() {
        String token = readToken();
        if (token == null) {
            showMachineId();
            System.exit(1);
        }

        String machineId = getMachineId();
        CacheData cache = readCache(machineId);

        // Cache valide et récent : démarrer sans appel réseau
        if (cache != null && cache.daysSinceVerified() <= OFFLINE_TOLERANCE_DAYS
                && LocalDate.parse(cache.expiration).isAfter(LocalDate.now())) {
            return; // OK
        }

        // Appel réseau
        try {
            String result = verify(token, machineId);
            if (result.contains("\"valid\":true")) {
                String expiration = extractJson(result, "expiration");
                writeCache(machineId, expiration);
                return; // OK
            } else {
                String reason = extractJson(result, "reason");
                System.err.println("[LICENCE] Accès refusé. Raison : " + reason);
                System.exit(1);
            }
        } catch (Exception e) {
            // Réseau indisponible
            if (cache != null && cache.daysSinceVerified() <= OFFLINE_TOLERANCE_DAYS) {
                System.out.println("[LICENCE] Mode hors-ligne (" + cache.daysSinceVerified() + " jours restants).");
                return; // OK offline
            }
            System.err.println("[LICENCE] Connexion impossible et cache expiré (> " + OFFLINE_TOLERANCE_DAYS + " jours).");
            System.exit(1);
        }
    }

    private static String readToken() {
        try {
            Path p = Path.of(KEY_FILE);
            if (!Files.exists(p)) return null;
            return Files.readString(p).trim();
        } catch (Exception e) { return null; }
    }

    private static void showMachineId() {
        System.err.println("==============================================");
        System.err.println("LICENCE MANQUANTE");
        System.err.println("Envoyez ce Machine ID à votre fournisseur :");
        System.err.println(getMachineId());
        System.err.println("==============================================");
    }

    public static String getMachineId() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface ni = interfaces.nextElement();
                byte[] mac = ni.getHardwareAddress();
                if (mac != null && mac.length > 0) {
                    StringBuilder sb = new StringBuilder();
                    for (byte b : mac) sb.append(String.format("%02x", b));
                    return sha256(sb.toString());
                }
            }
        } catch (Exception ignored) {}
        return sha256("fallback-" + System.getProperty("user.name"));
    }

    private static String verify(String token, String machineId) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(5))
            .build();
        String body = "{\"token\":\"" + token + "\",\"machineId\":\"" + machineId + "\",\"app\":\"" + APP_NAME + "\"}";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(LICENCE_SERVER))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .timeout(java.time.Duration.ofSeconds(5))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }

    // --- Cache chiffré AES ---

    private static CacheData readCache(String machineId) {
        try {
            Path p = Path.of(CACHE_FILE);
            if (!Files.exists(p)) return null;
            byte[] encrypted = Files.readAllBytes(p);
            String json = decrypt(encrypted, machineId);
            String lastVerified = extractJson(json, "lastVerified");
            String expiration = extractJson(json, "expiration");
            return new CacheData(lastVerified, expiration);
        } catch (Exception e) { return null; }
    }

    private static void writeCache(String machineId, String expiration) {
        try {
            String json = "{\"lastVerified\":\"" + LocalDate.now() + "\",\"expiration\":\"" + expiration + "\"}";
            byte[] encrypted = encrypt(json, machineId);
            Files.write(Path.of(CACHE_FILE), encrypted);
        } catch (Exception ignored) {}
    }

    private static byte[] encrypt(String data, String machineId) throws Exception {
        SecretKeySpec key = deriveKey(machineId);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        byte[] result = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(encrypted, 0, result, iv.length, encrypted.length);
        return result;
    }

    private static String decrypt(byte[] data, String machineId) throws Exception {
        SecretKeySpec key = deriveKey(machineId);
        byte[] iv = new byte[16];
        byte[] encrypted = new byte[data.length - 16];
        System.arraycopy(data, 0, iv, 0, 16);
        System.arraycopy(data, 16, encrypted, 0, encrypted.length);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
    }

    private static SecretKeySpec deriveKey(String machineId) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(
            (machineId + "licence-salt-infserv").getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(hash, "AES");
    }

    private static String sha256(String input) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                .digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { return input; }
    }

    private static String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start < 0) return "";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end < 0 ? "" : json.substring(start, end);
    }

    record CacheData(String lastVerified, String expiration) {
        long daysSinceVerified() {
            return ChronoUnit.DAYS.between(LocalDate.parse(lastVerified), LocalDate.now());
        }
    }
}
