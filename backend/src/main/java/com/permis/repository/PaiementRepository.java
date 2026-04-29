package com.permis.repository;

import com.permis.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findByCandidatId(Long candidatId);

    @Query("SELECT SUM(p.montant) FROM Paiement p WHERE p.candidat.id = :candidatId")
    Double sumMontantByCandidatId(Long candidatId);
}
