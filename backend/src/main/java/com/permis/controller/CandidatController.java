package com.permis.controller;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.service.CandidatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CandidatController {
    private final CandidatService service;

    @GetMapping
    public List<Candidat> list(@RequestParam(required = false) String statut,
                                @RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) return service.search(q);
        if (statut != null) return service.findByStatut(StatutDossier.valueOf(statut));
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Candidat get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Candidat create(@RequestBody Candidat c) { return service.save(c); }

    @PutMapping("/{id}")
    public Candidat update(@PathVariable Long id, @RequestBody Candidat c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
