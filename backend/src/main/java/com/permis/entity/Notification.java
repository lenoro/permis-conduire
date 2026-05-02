package com.permis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer","handler","examens","paiements","documents","notifications"})
    private Candidat candidat;

    @Enumerated(EnumType.STRING)
    private TypeNotification type;

    @Enumerated(EnumType.STRING)
    private CanalNotification canal;

    @Column(length = 500)
    private String message;

    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    private StatutNotification statut;

    public enum TypeNotification { ANNULATION_EXAMEN, MANQUE_PAIEMENT, AUTRE }
    public enum CanalNotification { SMS, EMAIL }
    public enum StatutNotification { SIMULE }
}
