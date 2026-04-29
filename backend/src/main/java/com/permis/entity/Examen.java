package com.permis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Examen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Candidat candidat;

    @Enumerated(EnumType.STRING)
    private TypeEpreuve typeEpreuve;

    private LocalDateTime dateExamen;

    @Enumerated(EnumType.STRING)
    private ResultatExamen resultat;

    private String observation;

    public enum TypeEpreuve { CODE, CRENEAU, CONDUITE }
    public enum ResultatExamen { ADMIS, AJOURNE, ABSENT }
}
