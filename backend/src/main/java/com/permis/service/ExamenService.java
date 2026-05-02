package com.permis.service;

import com.permis.dto.BatchExamenRequest;
import com.permis.entity.Candidat;
import com.permis.entity.Examen;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final CandidatRepository candidatRepository;
    private final NotificationService notificationService;

    public List<Examen> findAll() {
        return examenRepository.findAll();
    }

    public List<Examen> findByCandidat(Long candidatId) {
        return examenRepository.findByCandidatId(candidatId);
    }

    public Examen add(Long candidatId, Examen examen) {
        Candidat candidat = candidatRepository.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId));
        examen.setCandidat(candidat);
        if (examen.getStatut() == null) {
            examen.setStatut(Examen.StatutExamen.PLANIFIE);
        }
        return examenRepository.save(examen);
    }

    public Examen update(Long id, Examen data) {
        Examen examen = examenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Examen non trouvé: " + id));
        examen.setResultat(data.getResultat());
        examen.setObservation(data.getObservation());
        if (data.getStatut() != null) examen.setStatut(data.getStatut());
        return examenRepository.save(examen);
    }

    public void delete(Long id) {
        examenRepository.deleteById(id);
    }

    public Examen annuler(Long id) {
        Examen examen = examenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Examen non trouvé: " + id));
        examen.setStatut(Examen.StatutExamen.ANNULE);
        Examen saved = examenRepository.save(examen);
        notificationService.creerNotificationAnnulation(saved);
        return saved;
    }

    @Transactional
    public List<Examen> addBatch(BatchExamenRequest req) {
        return req.getCandidatIds().stream().map(candidatId -> {
            Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId));
            Examen examen = new Examen();
            examen.setCandidat(candidat);
            examen.setTypeEpreuve(req.getTypeEpreuve());
            examen.setDateExamen(req.getDateExamen());
            examen.setObservation(req.getObservation());
            examen.setStatut(Examen.StatutExamen.PLANIFIE);
            return examenRepository.save(examen);
        }).toList();
    }
}
