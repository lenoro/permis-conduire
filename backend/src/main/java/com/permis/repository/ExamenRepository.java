package com.permis.repository;

import com.permis.entity.Examen;
import com.permis.entity.Examen.TypeEpreuve;
import com.permis.entity.Examen.ResultatExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamenRepository extends JpaRepository<Examen, Long> {
    List<Examen> findByCandidatId(Long candidatId);
    List<Examen> findByTypeEpreuve(TypeEpreuve type);
    long countByTypeEpreuveAndResultat(TypeEpreuve type, ResultatExamen resultat);
    long countByTypeEpreuve(TypeEpreuve type);
}
