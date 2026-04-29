package com.permis.repository;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidatRepository extends JpaRepository<Candidat, Long> {
    List<Candidat> findByStatutDossier(StatutDossier statut);
    List<Candidat> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);
}
