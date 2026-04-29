package com.permis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Paiement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Candidat candidat;

    private Double montant;
    private LocalDate datePaiement;
    private String modePaiement; // Espèces, Chèque, CCP
}
