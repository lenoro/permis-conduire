package com.permis.controller;

import com.permis.dto.BatchExamenRequest;
import com.permis.dto.BatchResultatRequest;
import com.permis.entity.Examen;
import com.permis.service.ExamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ExamenController {
    private final ExamenService service;

    @GetMapping("/api/examens")
    public List<Examen> all() { return service.findAll(); }

    @GetMapping("/api/candidats/{id}/examens")
    public List<Examen> byCandidat(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/examens")
    public Examen add(@PathVariable Long id, @RequestBody Examen examen) {
        return service.add(id, examen);
    }

    @PutMapping("/api/examens/{id}")
    public Examen update(@PathVariable Long id, @RequestBody Examen examen) {
        return service.update(id, examen);
    }

    @DeleteMapping("/api/examens/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }

    @PutMapping("/api/examens/{id}/annuler")
    public Examen annulerExamen(@PathVariable Long id) {
        return service.annuler(id);
    }

    @PostMapping("/api/examens/batch")
    public List<Examen> addBatchExamen(@RequestBody BatchExamenRequest req) {
        return service.addBatch(req);
    }

    @PutMapping("/api/examens/batch-resultats")
    public List<Examen> batchUpdateResultats(@RequestBody BatchResultatRequest req) {
        return service.batchUpdateResultats(req);
    }
}
