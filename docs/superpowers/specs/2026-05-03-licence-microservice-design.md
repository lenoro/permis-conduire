# Système de Licences — Design

> **Pour les workers agentiques :** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Microservice de licences permettant de contrôler l'accès aux applications livrées sous forme de JAR, avec révocation à distance, tolérance offline de 15 jours, et vérification par machine.

**Architecture:** Microservice Spring Boot indépendant déployé sur `licence.infserv.ca` (port 8085 du VPS infserv.ca). Les JARs clients embarquent une classe `LicenceChecker` qui vérifie le jeton au démarrage. Un panneau admin React est servi par le même Spring Boot.

**Tech Stack:** Spring Boot 3, React 18 + TypeScript, H2 (base embarquée), AES (chiffrement cache client), Docker + nginx proxy.

---

## Scope

Ce système protège uniquement les applications livrées en **JAR offline** (ex. permis de conduire, cantine, GestionMagasin livrés à des clients). Il ne s'applique **pas** aux apps hébergées sur infserv.ca en mode SaaS.

---

## Composants

### 1. Serveur de licences (`licence-server/`)

Nouveau projet Spring Boot autonome, déployé sur le VPS infserv.ca.

- **URL :** `https://licence.infserv.ca`
- **Port interne :** 8085
- **Base de données :** H2 fichier (`/data/licences.mv.db`)
- **Auth :** Basic auth admin/123 pour les endpoints d'admin. Endpoint `/api/verify` public (pas d'auth, le token est le secret).

### 2. Panneau admin React

Interface web embarquée dans le JAR Spring Boot (servi sur `/`), accessible uniquement à toi.

**Pages :**
- Liste des licences avec statut (actif / expiré / révoqué)
- Formulaire de création
- Actions : révoquer, renouveler, copier le jeton

### 3. SDK client (`LicenceChecker.java`)

Classe Java standalone à copier dans chaque projet à livrer.

---

## Base de données

```sql
CREATE TABLE licences (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  token       VARCHAR(36) NOT NULL UNIQUE,  -- UUID
  app_name    VARCHAR(50) NOT NULL,          -- "permis", "cantine", etc.
  client_name VARCHAR(100) NOT NULL,
  machine_id  VARCHAR(64) NOT NULL,          -- SHA256(MAC adresse)
  date_debut  DATE NOT NULL,
  date_fin    DATE NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API REST

### `POST /api/verify` (public)

**Request :**
```json
{
  "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "machineId": "a3f9b2c1...",
  "app": "permis"
}
```

**Response 200 (valide) :**
```json
{ "valid": true, "expiration": "2026-12-31" }
```

**Response 200 (invalide) :**
```json
{ "valid": false, "reason": "REVOKED" }
```

Raisons possibles : `REVOKED`, `EXPIRED`, `WRONG_MACHINE`, `NOT_FOUND`.

### Endpoints admin (Basic auth admin/123)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/admin/licences` | Liste toutes les licences |
| POST | `/api/admin/licences` | Créer une licence |
| PUT | `/api/admin/licences/{id}/revoke` | Révoquer |
| PUT | `/api/admin/licences/{id}/renew` | Renouveler (nouvelle date_fin) |

---

## SDK Client — `LicenceChecker.java`

Logique au démarrage du JAR :

```
1. Lire token dans fichier "licence.key" (même dossier que le JAR)
   → Si absent : afficher le machineId et quitter
2. Calculer machineId = SHA256(adresse MAC principale)
3. Lire cache chiffré ".licence_cache"
   → Si cache valide (lastVerified ≤ 15 jours) ET expiration future → OK
4. Appeler POST https://licence.infserv.ca/api/verify
   → Si valid=true : mettre à jour le cache → démarrer
   → Si valid=false : effacer cache → bloquer avec message
   → Si réseau indisponible ET cache ≤ 15 jours → démarrer
   → Si réseau indisponible ET cache > 15 jours → bloquer
```

**Fichier `licence.key` :** texte brut, contient uniquement l'UUID du token.

**Fichier `.licence_cache` :** JSON chiffré AES avec clé dérivée du machineId :
```json
{
  "lastVerified": "2026-05-03",
  "expiration": "2026-12-31",
  "token": "xxxxxxxx-..."
}
```

---

## Flux d'activation (côté client)

1. Client lance le JAR sans `licence.key`
2. App affiche : *"Machine ID : a3f9b2c1... Envoyez ce code à votre fournisseur."* puis quitte.
3. Client t'envoie le Machine ID
4. Tu crées la licence dans le panneau admin → tu copies le token UUID
5. Tu envoies le fichier `licence.key` au client (email / Google Drive)
6. Client pose `licence.key` à côté du JAR → relance → app démarre

---

## Déploiement

Nouveau dossier sur le VPS : `/opt/licence/`

```yaml
# docker-compose.yml
services:
  licence:
    build: .
    ports: ["8085:8085"]
    volumes: ["/data/licence:/data"]
    restart: unless-stopped
```

nginx proxy :
```nginx
server {
  server_name licence.infserv.ca;
  location / { proxy_pass http://localhost:8085; }
}
```

DNS : enregistrement A `licence.infserv.ca` → même IP que infserv.ca (72.62.168.1).

---

## Structure du projet

```
licence-server/
├── backend/
│   ├── src/main/java/com/licence/
│   │   ├── entity/Licence.java
│   │   ├── repository/LicenceRepository.java
│   │   ├── service/LicenceService.java
│   │   ├── controller/VerifyController.java
│   │   ├── controller/AdminController.java
│   │   └── config/SecurityConfig.java
│   └── pom.xml
├── frontend/
│   └── src/pages/
│       ├── LicencesPage.tsx
│       └── modals/LicenceFormModal.tsx
└── sdk/
    └── LicenceChecker.java   ← à copier dans chaque app cliente
```

---

## Sécurité

- Endpoint `/api/verify` : pas d'auth (le token UUID est le secret)
- Endpoints `/api/admin/**` : Basic auth admin/123
- Cache local chiffré AES, clé = SHA256(machineId + sel fixe)
- HTTPS obligatoire (Let's Encrypt via Certbot, comme les autres apps)
- Le token UUID est à usage unique par machine — non partageable
