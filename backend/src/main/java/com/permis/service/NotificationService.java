package com.permis.service;

import com.permis.entity.Candidat;
import com.permis.entity.Examen;
import com.permis.entity.Notification;
import com.permis.repository.CandidatRepository;
import com.permis.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CandidatRepository candidatRepository;

    public Notification creerNotificationAnnulation(Examen examen) {
        String msg = String.format(
            "Votre examen %s du %s a été annulé.",
            examen.getTypeEpreuve(),
            examen.getDateExamen().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        );
        Notification n = Notification.builder()
            .candidat(examen.getCandidat())
            .type(Notification.TypeNotification.ANNULATION_EXAMEN)
            .canal(Notification.CanalNotification.SMS)
            .message(msg)
            .dateEnvoi(LocalDateTime.now())
            .statut(Notification.StatutNotification.SIMULE)
            .build();
        return notificationRepository.save(n);
    }

    public Notification creerNotificationManuelle(Long candidatId, Notification notification) {
        Candidat candidat = candidatRepository.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId));
        notification.setCandidat(candidat);
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setStatut(Notification.StatutNotification.SIMULE);
        return notificationRepository.save(notification);
    }

    public List<Notification> findByCandidat(Long candidatId) {
        return notificationRepository.findByCandidatIdOrderByDateEnvoiDesc(candidatId);
    }
}
