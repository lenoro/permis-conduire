package com.permis.service;

import com.permis.entity.Examen;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ExamenService {
    private final ExamenRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Examen> findAll() { return repo.findAll(); }

    public List<Examen> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Examen add(Long candidatId, Examen examen) {
        examen.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(examen);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
