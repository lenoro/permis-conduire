package com.permis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String numTelephone;
    private String adresse;
    private String groupeSanguin;
    private LocalDate dateInscription;
    private String categorieVisee;

    @Enumerated(EnumType.STRING)
    private StatutDossier statutDossier = StatutDossier.INCOMPLET;

    private String photoPath;

    @OneToMany(mappedBy = "candidat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "candidat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "candidat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Examen> examens = new ArrayList<>();

    @OneToMany(mappedBy = "candidat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Paiement> paiements = new ArrayList<>();

    public enum StatutDossier { INCOMPLET, EN_COURS, VALIDE, ARCHIVE }
}
