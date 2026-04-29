package com.permis;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.repository.CandidatRepository;
import com.permis.service.CandidatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidatServiceTest {

    @Mock CandidatRepository repo;
    @InjectMocks CandidatService service;

    @Test
    void findAll_returnsAllCandidats() {
        List<Candidat> data = List.of(
            Candidat.builder().id(1L).nom("BENALI").prenom("Ahmed").build(),
            Candidat.builder().id(2L).nom("HAMMADI").prenom("Sara").build()
        );
        when(repo.findAll()).thenReturn(data);

        List<Candidat> result = service.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNom()).isEqualTo("BENALI");
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(99L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("99");
    }

    @Test
    void save_persistsCandidat() {
        Candidat c = Candidat.builder().nom("TEST").prenom("User").build();
        when(repo.save(c)).thenReturn(Candidat.builder().id(1L).nom("TEST").prenom("User").build());

        Candidat saved = service.save(c);

        assertThat(saved.getId()).isEqualTo(1L);
        verify(repo).save(c);
    }

    @Test
    void findByStatut_filtersCorrectly() {
        List<Candidat> valides = List.of(
            Candidat.builder().statutDossier(StatutDossier.VALIDE).build()
        );
        when(repo.findByStatutDossier(StatutDossier.VALIDE)).thenReturn(valides);

        List<Candidat> result = service.findByStatut(StatutDossier.VALIDE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatutDossier()).isEqualTo(StatutDossier.VALIDE);
    }
}
