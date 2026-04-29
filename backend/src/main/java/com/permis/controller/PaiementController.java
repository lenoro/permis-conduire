package com.permis.controller;

import com.permis.entity.Paiement;
import com.permis.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PaiementController {
    private final PaiementService service;

    @GetMapping("/api/paiements")
    public List<Paiement> all() { return service.findAll(); }

    @GetMapping("/api/candidats/{id}/paiements")
    public List<Paiement> byCandidat(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/paiements")
    public Paiement add(@PathVariable Long id, @RequestBody Paiement paiement) {
        return service.add(id, paiement);
    }

    @DeleteMapping("/api/paiements/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
