package com.permis;

import com.permis.dto.BatchExamenRequest;
import com.permis.entity.Candidat;
import com.permis.entity.Examen;
import com.permis.entity.Notification;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import com.permis.service.ExamenService;
import com.permis.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamenServiceExtendedTest {

    @Mock ExamenRepository examenRepository;
    @Mock CandidatRepository candidatRepository;
    @Mock NotificationService notificationService;
    @InjectMocks ExamenService examenService;

    @Test
    void annuler_setsStatutAnnuleAndCreatesNotification() {
        Candidat candidat = new Candidat();
        candidat.setId(1L);
        Examen examen = new Examen();
        examen.setId(5L);
        examen.setCandidat(candidat);
        examen.setTypeEpreuve(Examen.TypeEpreuve.CODE);
        examen.setDateExamen(LocalDateTime.now());
        examen.setStatut(Examen.StatutExamen.PLANIFIE);

        when(examenRepository.findById(5L)).thenReturn(Optional.of(examen));
        when(examenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(notificationService.creerNotificationAnnulation(any())).thenReturn(new Notification());

        Examen result = examenService.annuler(5L);

        assertThat(result.getStatut()).isEqualTo(Examen.StatutExamen.ANNULE);
        verify(notificationService).creerNotificationAnnulation(examen);
    }

    @Test
    void addBatch_createsOneExamenPerCandidat() {
        Candidat c1 = new Candidat(); c1.setId(1L);
        Candidat c2 = new Candidat(); c2.setId(2L);

        when(candidatRepository.findById(1L)).thenReturn(Optional.of(c1));
        when(candidatRepository.findById(2L)).thenReturn(Optional.of(c2));
        when(examenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        BatchExamenRequest req = new BatchExamenRequest();
        req.setCandidatIds(List.of(1L, 2L));
        req.setTypeEpreuve(Examen.TypeEpreuve.CODE);
        req.setDateExamen(LocalDateTime.of(2026, 5, 20, 9, 0));
        req.setObservation("Session mai");

        List<Examen> result = examenService.addBatch(req);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCandidat()).isEqualTo(c1);
        assertThat(result.get(1).getCandidat()).isEqualTo(c2);
        assertThat(result.get(0).getStatut()).isEqualTo(Examen.StatutExamen.PLANIFIE);
    }
}
