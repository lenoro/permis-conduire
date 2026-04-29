package com.permis.config;

import com.permis.entity.*;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final CandidatRepository candidatRepo;

    @Override
    public void run(String... args) {
        if (candidatRepo.count() > 0) return;

        Candidat c1 = Candidat.builder()
            .nom("BENALI").prenom("Ahmed")
            .dateNaissance(LocalDate.of(1998, 6, 15))
            .numTelephone("0550123456").adresse("12 Rue des Oliviers, Alger")
            .groupeSanguin("O+").dateInscription(LocalDate.of(2025, 1, 12))
            .categorieVisee("B").statutDossier(StatutDossier.VALIDE)
            .build();

        Candidat c2 = Candidat.builder()
            .nom("HAMMADI").prenom("Sara")
            .dateNaissance(LocalDate.of(2000, 3, 20))
            .numTelephone("0661789012").adresse("5 Cité des Roses, Oran")
            .groupeSanguin("A+").dateInscription(LocalDate.of(2025, 2, 3))
            .categorieVisee("B").statutDossier(StatutDossier.EN_COURS)
            .build();

        candidatRepo.save(c1);
        candidatRepo.save(c2);
    }
}
