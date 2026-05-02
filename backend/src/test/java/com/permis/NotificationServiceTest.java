package com.permis;

import com.permis.entity.Candidat;
import com.permis.entity.Notification;
import com.permis.entity.Examen;
import com.permis.repository.CandidatRepository;
import com.permis.repository.NotificationRepository;
import com.permis.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;
    @Mock CandidatRepository candidatRepository;
    @InjectMocks NotificationService notificationService;

    @Test
    void creerNotificationAnnulation_creesNotificationSMS() {
        Candidat candidat = new Candidat();
        candidat.setId(1L);
        Examen examen = new Examen();
        examen.setId(10L);
        examen.setCandidat(candidat);
        examen.setTypeEpreuve(Examen.TypeEpreuve.CODE);
        examen.setDateExamen(LocalDateTime.of(2026, 5, 20, 9, 0));

        when(notificationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.creerNotificationAnnulation(examen);

        assertThat(result.getCandidat()).isEqualTo(candidat);
        assertThat(result.getType()).isEqualTo(Notification.TypeNotification.ANNULATION_EXAMEN);
        assertThat(result.getCanal()).isEqualTo(Notification.CanalNotification.SMS);
        assertThat(result.getStatut()).isEqualTo(Notification.StatutNotification.SIMULE);
        assertThat(result.getMessage()).contains("CODE");
    }

    @Test
    void creerNotificationManuelle_savedWithAllFields() {
        Candidat candidat = new Candidat();
        candidat.setId(2L);
        when(candidatRepository.findById(2L)).thenReturn(Optional.of(candidat));
        when(notificationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Notification n = new Notification();
        n.setCanal(Notification.CanalNotification.EMAIL);
        n.setType(Notification.TypeNotification.MANQUE_PAIEMENT);
        n.setMessage("Votre paiement est en retard.");

        Notification result = notificationService.creerNotificationManuelle(2L, n);

        assertThat(result.getCandidat()).isEqualTo(candidat);
        assertThat(result.getStatut()).isEqualTo(Notification.StatutNotification.SIMULE);
        assertThat(result.getDateEnvoi()).isNotNull();
    }
}
