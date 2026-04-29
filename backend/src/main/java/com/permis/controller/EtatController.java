package com.permis.controller;

import com.permis.entity.Candidat.StatutDossier;
import com.permis.entity.Examen.ResultatExamen;
import com.permis.entity.Examen.TypeEpreuve;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import com.permis.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/etats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EtatController {
    private final CandidatRepository candidatRepo;
    private final ExamenRepository examenRepo;
    private final PaiementRepository paiementRepo;

    @GetMapping("/statuts")
    public Map<String, Long> statuts() {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", candidatRepo.count());
        for (StatutDossier s : StatutDossier.values()) {
            result.put(s.name(), (long) candidatRepo.findByStatutDossier(s).size());
        }
        return result;
    }

    @GetMapping("/examens")
    public Map<String, Object> examens() {
        Map<String, Object> result = new LinkedHashMap<>();
        for (TypeEpreuve type : TypeEpreuve.values()) {
            long total = examenRepo.countByTypeEpreuve(type);
            long admis = examenRepo.countByTypeEpreuveAndResultat(type, ResultatExamen.ADMIS);
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", total);
            stats.put("admis", admis);
            stats.put("taux", total == 0 ? 0 : Math.round(admis * 100.0 / total));
            result.put(type.name(), stats);
        }
        return result;
    }
}
