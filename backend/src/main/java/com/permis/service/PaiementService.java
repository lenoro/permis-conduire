package com.permis.service;

import com.permis.entity.Paiement;
import com.permis.repository.CandidatRepository;
import com.permis.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class PaiementService {
    private final PaiementRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Paiement> findAll() { return repo.findAll(); }

    public List<Paiement> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Paiement add(Long candidatId, Paiement paiement) {
        paiement.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(paiement);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
