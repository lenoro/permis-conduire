package com.permis.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Paiement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidat_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","examens","paiements","documents","notifications"})
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Candidat candidat;

    private Double montant;
    private LocalDate datePaiement;
    private String modePaiement; // Espèces, Chèque, CCP
}
