package com.permis.service;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.repository.CandidatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class CandidatService {
    private final CandidatRepository repo;

    public List<Candidat> findAll() { return repo.findAll(); }

    public List<Candidat> findByStatut(StatutDossier statut) {
        return repo.findByStatutDossier(statut);
    }

    public List<Candidat> search(String q) {
        return repo.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q);
    }

    public Candidat findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));
    }

    public Candidat save(Candidat c) { return repo.save(c); }

    public Candidat update(Long id, Candidat updated) {
        Candidat existing = findById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setDateNaissance(updated.getDateNaissance());
        existing.setNumTelephone(updated.getNumTelephone());
        existing.setAdresse(updated.getAdresse());
        existing.setGroupeSanguin(updated.getGroupeSanguin());
        existing.setDateInscription(updated.getDateInscription());
        existing.setCategorieVisee(updated.getCategorieVisee());
        existing.setStatutDossier(updated.getStatutDossier());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
