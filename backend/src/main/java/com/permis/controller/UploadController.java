package com.permis.controller;

import com.permis.entity.Candidat;
import com.permis.repository.CandidatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/candidats/{id}/photo")
@CrossOrigin(origins = {"http://localhost:5173", "https://permis.infserv.ca"})
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final CandidatRepository candidatRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Candidat uploadPhoto(@PathVariable Long id,
                                @RequestParam("file") MultipartFile file) throws IOException {
        Candidat candidat = candidatRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));

        String ext = getExtension(file.getOriginalFilename());
        String filename = "candidat_" + id + "_" + System.currentTimeMillis() + "." + ext;

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.write(dir.resolve(filename), file.getBytes());

        candidat.setPhotoPath(filename);
        return candidatRepository.save(candidat);
    }

    @GetMapping
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) throws IOException {
        Candidat candidat = candidatRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));

        if (candidat.getPhotoPath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(uploadDir).resolve(candidat.getPhotoPath());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = Files.readAllBytes(filePath);
        String contentType = filePath.toString().endsWith(".png") ? "image/png" : "image/jpeg";
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(bytes);
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
