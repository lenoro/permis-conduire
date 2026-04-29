package com.permis.controller;

import com.permis.entity.Document;
import com.permis.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService service;

    @GetMapping("/api/candidats/{id}/documents")
    public List<Document> list(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/documents")
    public Document add(@PathVariable Long id, @RequestBody Document doc) {
        return service.add(id, doc);
    }

    @PutMapping("/api/documents/{id}")
    public Document update(@PathVariable Long id, @RequestBody Document doc) {
        return service.update(id, doc);
    }

    @DeleteMapping("/api/documents/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
