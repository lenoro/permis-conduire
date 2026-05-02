# Permis de Conduire — Nouvelles fonctionnalités Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter photo candidat, planification d'examens en lot, historique complet, notifications simulées et annulation d'examen à l'application Permis de Conduire.

**Architecture:** Évolution incrémentale — nouvelles entités et endpoints ajoutés au backend Spring Boot existant, nouvelles pages et modals ajoutés au frontend React sans restructurer le code existant.

**Tech Stack:** Spring Boot 3.2.5, JPA/Hibernate, PostgreSQL, Lombok, JUnit 5 + Mockito + AssertJ (backend) — React 18, TypeScript, Vite, Axios, React Router v6 (frontend)

---

## File Map

### Backend — nouveaux fichiers
- `entity/Notification.java` — entité JPA avec enums TypeNotification, CanalNotification, StatutNotification
- `repository/NotificationRepository.java` — JpaRepository<Notification, Long>
- `service/NotificationService.java` — creerNotificationAnnulation(), creerNotificationManuelle(), findByCandidat()
- `controller/NotificationController.java` — GET + POST /api/candidats/{id}/notifications
- `controller/UploadController.java` — POST /api/candidats/{id}/photo + GET /api/candidats/{id}/photo
- `dto/BatchExamenRequest.java` — DTO pour la planification en lot
- `src/test/java/com/permis/ExamenServiceExtendedTest.java` — tests annuler() + addBatch()
- `src/test/java/com/permis/NotificationServiceTest.java` — tests creerNotificationAnnulation() + creerNotificationManuelle()

### Backend — fichiers modifiés
- `entity/Examen.java` — ajouter enum StatutExamen + champ statut
- `entity/Candidat.java` — ajouter photoPath + relation notifications
- `service/ExamenService.java` — ajouter annuler() + addBatch()
- `controller/ExamenController.java` — ajouter PUT /annuler + POST /batch
- `controller/CandidatController.java` — rien à changer (upload dans UploadController)
- `resources/application.properties` — ajouter app.upload.dir

### Frontend — nouveaux fichiers
- `api/notificationApi.ts` — getNotifications(candidatId), addNotification(candidatId, n)
- `pages/Examens/modals/ExamenFormModal.tsx` — formulaire création examen (1 candidat)
- `pages/Examens/modals/BatchExamenModal.tsx` — formulaire planification en lot
- `pages/Paiements/modals/PaiementFormModal.tsx` — formulaire création paiement
- `pages/Candidats/tabs/NotificationsTab.tsx` — onglet notifications dans modal candidat
- `pages/Candidats/HistoriqueCandidatPage.tsx` — page historique /candidats/:id/historique

### Frontend — fichiers modifiés
- `types/index.ts` — ajouter StatutExamen, Notification, types request
- `api/examenApi.ts` — ajouter annulerExamen(), addBatchExamen(), getAllExamens retourne candidat name
- `api/candidatApi.ts` — ajouter uploadPhoto(), getPhoto()
- `pages/Examens/ExamensPage.tsx` — boutons + colonnes Statut/Actions + noms candidats cliquables
- `pages/Paiements/PaiementsPage.tsx` — bouton + noms candidats cliquables
- `pages/Candidats/CandidatModal.tsx` — ajouter onglet Notifications
- `pages/Candidats/tabs/InfosTab.tsx` — zone photo upload
- `pages/Candidats/tabs/ExamensTab.tsx` — colonne statut + bouton annuler
- `App.tsx` — nouvelle route /candidats/:id/historique

---

## Task 1 — Ajouter StatutExamen à Examen + photoPath à Candidat

**Files:**
- Modify: `backend/src/main/java/com/permis/entity/Examen.java`
- Modify: `backend/src/main/java/com/permis/entity/Candidat.java`
- Modify: `backend/src/main/resources/application.properties`

- [ ] **Step 1 : Ajouter l'enum StatutExamen et le champ statut dans Examen.java**

Ouvrir `backend/src/main/java/com/permis/entity/Examen.java`. Ajouter à la fin des enums existants :

```java
public enum StatutExamen { PLANIFIE, REALISE, ANNULE }
```

Ajouter le champ dans la classe, après `observation` :

```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private StatutExamen statut = StatutExamen.PLANIFIE;
```

- [ ] **Step 2 : Ajouter photoPath et la relation notifications dans Candidat.java**

Ouvrir `backend/src/main/java/com/permis/entity/Candidat.java`. Ajouter après les imports existants :

```java
import java.util.ArrayList;
```

Ajouter les champs après `statutDossier` :

```java
private String photoPath;

@OneToMany(mappedBy = "candidat", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Notification> notifications = new ArrayList<>();
```

> Note : Notification n'existe pas encore — l'IDE va signaler une erreur. Elle sera créée à la Task 2. Ignorer pour l'instant.

- [ ] **Step 3 : Ajouter le chemin d'upload dans application.properties**

Ouvrir `backend/src/main/resources/application.properties`. Ajouter en fin de fichier :

```properties
app.upload.dir=./uploads/photos
```

- [ ] **Step 4 : Démarrer le backend et vérifier que la migration Hibernate s'applique**

```bash
cd "C:/permis de conduire/backend"
./mvnw spring-boot:run
```

Dans les logs, vérifier qu'Hibernate ajoute les colonnes `statut` (sur `examen`) et `photo_path` (sur `candidat`) sans erreur. Arrêter avec Ctrl+C.

- [ ] **Step 5 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/entity/Examen.java
git add backend/src/main/java/com/permis/entity/Candidat.java
git add backend/src/main/resources/application.properties
git commit -m "feat: add StatutExamen to Examen, photoPath + notifications to Candidat"
```

---

## Task 2 — Entité Notification + Repository + Service (TDD)

**Files:**
- Create: `backend/src/main/java/com/permis/entity/Notification.java`
- Create: `backend/src/main/java/com/permis/repository/NotificationRepository.java`
- Create: `backend/src/main/java/com/permis/service/NotificationService.java`
- Create: `backend/src/test/java/com/permis/NotificationServiceTest.java`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `backend/src/test/java/com/permis/NotificationServiceTest.java` :

```java
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
import java.util.List;
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
```

- [ ] **Step 2 : Lancer le test — vérifier qu'il échoue**

```bash
cd "C:/permis de conduire/backend"
./mvnw test -Dtest=NotificationServiceTest -q
```

Résultat attendu : erreur de compilation (Notification, NotificationService, NotificationRepository n'existent pas encore).

- [ ] **Step 3 : Créer l'entité Notification**

Créer `backend/src/main/java/com/permis/entity/Notification.java` :

```java
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
```

- [ ] **Step 4 : Créer NotificationRepository**

Créer `backend/src/main/java/com/permis/repository/NotificationRepository.java` :

```java
package com.permis.repository;

import com.permis.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCandidatIdOrderByDateEnvoiDesc(Long candidatId);
}
```

- [ ] **Step 5 : Créer NotificationService**

Créer `backend/src/main/java/com/permis/service/NotificationService.java` :

```java
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
```

- [ ] **Step 6 : Lancer le test — vérifier qu'il passe**

```bash
cd "C:/permis de conduire/backend"
./mvnw test -Dtest=NotificationServiceTest -q
```

Résultat attendu : `Tests run: 2, Failures: 0, Errors: 0`

- [ ] **Step 7 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/entity/Notification.java
git add backend/src/main/java/com/permis/repository/NotificationRepository.java
git add backend/src/main/java/com/permis/service/NotificationService.java
git add backend/src/test/java/com/permis/NotificationServiceTest.java
git commit -m "feat: add Notification entity + service (TDD)"
```

---

## Task 3 — NotificationController

**Files:**
- Create: `backend/src/main/java/com/permis/controller/NotificationController.java`

- [ ] **Step 1 : Créer NotificationController**

```java
package com.permis.controller;

import com.permis.entity.Notification;
import com.permis.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidats/{candidatId}/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "https://permis.infserv.ca"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(@PathVariable Long candidatId) {
        return notificationService.findByCandidat(candidatId);
    }

    @PostMapping
    public Notification addNotification(@PathVariable Long candidatId,
                                        @RequestBody Notification notification) {
        return notificationService.creerNotificationManuelle(candidatId, notification);
    }
}
```

- [ ] **Step 2 : Tester manuellement**

Démarrer le backend (`./mvnw spring-boot:run`), puis :

```bash
curl -u admin:123 http://localhost:8080/api/candidats/1/notifications
```

Résultat attendu : `[]` (liste vide, pas d'erreur 500).

Arrêter le backend.

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/controller/NotificationController.java
git commit -m "feat: add NotificationController GET+POST"
```

---

## Task 4 — ExamenService : annuler() + addBatch() (TDD)

**Files:**
- Create: `backend/src/test/java/com/permis/ExamenServiceExtendedTest.java`
- Modify: `backend/src/main/java/com/permis/service/ExamenService.java`
- Create: `backend/src/main/java/com/permis/dto/BatchExamenRequest.java`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `backend/src/test/java/com/permis/ExamenServiceExtendedTest.java` :

```java
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
```

- [ ] **Step 2 : Lancer le test — vérifier qu'il échoue**

```bash
cd "C:/permis de conduire/backend"
./mvnw test -Dtest=ExamenServiceExtendedTest -q
```

Résultat attendu : erreur de compilation (BatchExamenRequest, méthodes annuler/addBatch non définies).

- [ ] **Step 3 : Créer BatchExamenRequest DTO**

Créer `backend/src/main/java/com/permis/dto/BatchExamenRequest.java` :

```java
package com.permis.dto;

import com.permis.entity.Examen;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class BatchExamenRequest {
    private List<Long> candidatIds;
    private Examen.TypeEpreuve typeEpreuve;
    private LocalDateTime dateExamen;
    private String observation;
}
```

- [ ] **Step 4 : Ajouter annuler() et addBatch() dans ExamenService**

Ouvrir `backend/src/main/java/com/permis/service/ExamenService.java`.

Ajouter l'injection de `NotificationService` et les deux méthodes. Le fichier complet doit ressembler à :

```java
package com.permis.service;

import com.permis.dto.BatchExamenRequest;
import com.permis.entity.Candidat;
import com.permis.entity.Examen;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final CandidatRepository candidatRepository;
    private final NotificationService notificationService;

    public List<Examen> findAll() {
        return examenRepository.findAll();
    }

    public List<Examen> findByCandidat(Long candidatId) {
        return examenRepository.findByCandidatId(candidatId);
    }

    public Examen add(Long candidatId, Examen examen) {
        Candidat candidat = candidatRepository.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId));
        examen.setCandidat(candidat);
        if (examen.getStatut() == null) {
            examen.setStatut(Examen.StatutExamen.PLANIFIE);
        }
        return examenRepository.save(examen);
    }

    public void delete(Long id) {
        examenRepository.deleteById(id);
    }

    public Examen annuler(Long id) {
        Examen examen = examenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Examen non trouvé: " + id));
        examen.setStatut(Examen.StatutExamen.ANNULE);
        Examen saved = examenRepository.save(examen);
        notificationService.creerNotificationAnnulation(examen);
        return saved;
    }

    public List<Examen> addBatch(BatchExamenRequest req) {
        return req.getCandidatIds().stream().map(candidatId -> {
            Candidat candidat = candidatRepository.findById(candidatId)
                .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId));
            Examen examen = new Examen();
            examen.setCandidat(candidat);
            examen.setTypeEpreuve(req.getTypeEpreuve());
            examen.setDateExamen(req.getDateExamen());
            examen.setObservation(req.getObservation());
            examen.setStatut(Examen.StatutExamen.PLANIFIE);
            return examenRepository.save(examen);
        }).toList();
    }
}
```

- [ ] **Step 5 : Lancer les tests — vérifier qu'ils passent**

```bash
cd "C:/permis de conduire/backend"
./mvnw test -Dtest=ExamenServiceExtendedTest -q
```

Résultat attendu : `Tests run: 2, Failures: 0, Errors: 0`

- [ ] **Step 6 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/dto/BatchExamenRequest.java
git add backend/src/main/java/com/permis/service/ExamenService.java
git add backend/src/test/java/com/permis/ExamenServiceExtendedTest.java
git commit -m "feat: add annuler() + addBatch() to ExamenService (TDD)"
```

---

## Task 5 — ExamenController : endpoints annuler + batch

**Files:**
- Modify: `backend/src/main/java/com/permis/controller/ExamenController.java`

- [ ] **Step 1 : Ajouter les imports et les endpoints dans ExamenController**

Ouvrir `backend/src/main/java/com/permis/controller/ExamenController.java`.

Ajouter les imports manquants :
```java
import com.permis.dto.BatchExamenRequest;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.List;
```

Ajouter les deux endpoints dans la classe (après `deleteExamen`) :

```java
@PutMapping("/{id}/annuler")
public Examen annulerExamen(@PathVariable Long id) {
    return examenService.annuler(id);
}

@PostMapping("/batch")
public List<Examen> addBatchExamen(@RequestBody BatchExamenRequest req) {
    return examenService.addBatch(req);
}
```

> Note : Le `@RequestMapping` existant est probablement `/api/examens`. Vérifier que les nouveaux endpoints seront accessibles via `PUT /api/examens/{id}/annuler` et `POST /api/examens/batch`.

- [ ] **Step 2 : Tester manuellement les nouveaux endpoints**

Démarrer le backend. Récupérer l'id d'un examen existant dans la DB, par exemple id=1 :

```bash
curl -u admin:123 -X PUT http://localhost:8080/api/examens/1/annuler
```

Résultat attendu : JSON de l'examen avec `"statut":"ANNULE"`.

```bash
curl -u admin:123 -X POST http://localhost:8080/api/examens/batch \
  -H "Content-Type: application/json" \
  -d '{"candidatIds":[1],"typeEpreuve":"CODE","dateExamen":"2026-06-01T09:00:00","observation":"test"}'
```

Résultat attendu : tableau JSON avec 1 examen PLANIFIE.

Arrêter le backend.

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/controller/ExamenController.java
git commit -m "feat: add PUT /examens/{id}/annuler + POST /examens/batch endpoints"
```

---

## Task 6 — UploadController (photo candidat)

**Files:**
- Create: `backend/src/main/java/com/permis/controller/UploadController.java`
- Modify: `backend/src/main/java/com/permis/controller/CandidatController.java` (ajouter endpoint GET photo)

- [ ] **Step 1 : Créer UploadController**

Créer `backend/src/main/java/com/permis/controller/UploadController.java` :

```java
package com.permis.controller;

import com.permis.entity.Candidat;
import com.permis.repository.CandidatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/candidats/{id}/photo")
@CrossOrigin(origins = {"http://localhost:5173", "https://permis.infserv.ca"})
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final CandidatRepository candidatRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Candidat uploadPhoto(@PathVariable Long id,
                                @RequestParam("file") MultipartFile file) throws IOException {
        Candidat candidat = candidatRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));

        String ext = getExtension(file.getOriginalFilename());
        String filename = "candidat_" + id + "_" + System.currentTimeMillis() + "." + ext;

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.write(dir.resolve(filename), file.getBytes());

        candidat.setPhotoPath(filename);
        return candidatRepository.save(candidat);
    }

    @GetMapping
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) throws IOException {
        Candidat candidat = candidatRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));

        if (candidat.getPhotoPath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(uploadDir).resolve(candidat.getPhotoPath());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = Files.readAllBytes(filePath);
        String contentType = filePath.toString().endsWith(".png") ? "image/png" : "image/jpeg";
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(bytes);
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
```

- [ ] **Step 2 : Tester manuellement l'upload**

Démarrer le backend. Télécharger une image de test (ex. `test.jpg`) et la stocker localement. Tester :

```bash
curl -u admin:123 -X POST http://localhost:8080/api/candidats/1/photo \
  -F "file=@test.jpg"
```

Résultat attendu : JSON du candidat avec `"photoPath":"candidat_1_TIMESTAMP.jpg"`.

```bash
curl -u admin:123 http://localhost:8080/api/candidats/1/photo --output photo.jpg
```

Résultat attendu : fichier `photo.jpg` créé localement avec l'image.

Arrêter le backend.

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add backend/src/main/java/com/permis/controller/UploadController.java
git commit -m "feat: add photo upload/download endpoint for candidat"
```

---

## Task 7 — Frontend : Types TypeScript + API clients

**Files:**
- Modify: `frontend/permis-app/src/types/index.ts`
- Modify: `frontend/permis-app/src/api/examenApi.ts`
- Modify: `frontend/permis-app/src/api/candidatApi.ts`
- Create: `frontend/permis-app/src/api/notificationApi.ts`

- [ ] **Step 1 : Mettre à jour types/index.ts**

Ouvrir `frontend/permis-app/src/types/index.ts`. Ajouter les types suivants (après les types existants) :

```typescript
export type StatutExamen = 'PLANIFIE' | 'REALISE' | 'ANNULE';

export type TypeNotification = 'ANNULATION_EXAMEN' | 'MANQUE_PAIEMENT' | 'AUTRE';
export type CanalNotification = 'SMS' | 'EMAIL';

export interface Notification {
  id: number;
  candidat: { id: number; nom: string; prenom: string };
  type: TypeNotification;
  canal: CanalNotification;
  message: string;
  dateEnvoi: string;
  statut: 'SIMULE';
}

export interface BatchExamenRequest {
  candidatIds: number[];
  typeEpreuve: TypeEpreuve;
  dateExamen: string;
  observation?: string;
}
```

Modifier l'interface `Examen` existante pour ajouter :

```typescript
statut: StatutExamen;
```

Et s'assurer que le champ `candidat` dans `Examen` retourne au moins `{ id: number; nom: string; prenom: string }` :

```typescript
candidat: { id: number; nom: string; prenom: string };
```

Modifier l'interface `Candidat` pour ajouter :

```typescript
photoPath?: string;
```

- [ ] **Step 2 : Mettre à jour examenApi.ts**

Ouvrir `frontend/permis-app/src/api/examenApi.ts`. Ajouter les imports manquants et les deux nouvelles fonctions :

```typescript
import type { BatchExamenRequest, Examen } from '../types';

// Ajouter après les fonctions existantes :

export const annulerExamen = (id: number): Promise<Examen> =>
  client.put<Examen>(`/api/examens/${id}/annuler`).then(r => r.data);

export const addBatchExamen = (req: BatchExamenRequest): Promise<Examen[]> =>
  client.post<Examen[]>('/api/examens/batch', req).then(r => r.data);
```

- [ ] **Step 3 : Mettre à jour candidatApi.ts**

Ouvrir `frontend/permis-app/src/api/candidatApi.ts`. Ajouter les deux fonctions photo :

```typescript
export const uploadPhoto = (id: number, file: File): Promise<import('../types').Candidat> => {
  const form = new FormData();
  form.append('file', file);
  return client.post(`/api/candidats/${id}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const getPhotoUrl = (id: number): string =>
  `/api/candidats/${id}/photo`;
```

- [ ] **Step 4 : Créer notificationApi.ts**

Créer `frontend/permis-app/src/api/notificationApi.ts` :

```typescript
import axios from 'axios';
import type { Notification } from '../types';

const client = axios.create({
  auth: { username: 'admin', password: '123' },
});

export const getNotifications = (candidatId: number): Promise<Notification[]> =>
  client.get<Notification[]>(`/api/candidats/${candidatId}/notifications`).then(r => r.data);

export const addNotification = (
  candidatId: number,
  n: { type: string; canal: string; message: string }
): Promise<Notification> =>
  client.post<Notification>(`/api/candidats/${candidatId}/notifications`, n).then(r => r.data);
```

- [ ] **Step 5 : Vérifier que TypeScript compile**

```bash
cd "C:/permis de conduire/frontend/permis-app"
npx tsc --noEmit
```

Résultat attendu : aucune erreur. Si des erreurs apparaissent, les corriger avant de continuer.

- [ ] **Step 6 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/types/index.ts
git add frontend/permis-app/src/api/examenApi.ts
git add frontend/permis-app/src/api/candidatApi.ts
git add frontend/permis-app/src/api/notificationApi.ts
git commit -m "feat: update TS types + API clients (Notification, StatutExamen, photo, batch)"
```

---

## Task 8 — ExamensPage : colonnes + boutons + annulation

**Files:**
- Modify: `frontend/permis-app/src/pages/Examens/ExamensPage.tsx`

- [ ] **Step 1 : Réécrire ExamensPage.tsx**

Remplacer le contenu complet du fichier par :

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllExamens, annulerExamen } from '../../api/examenApi';
import type { Examen } from '../../types';
import ExamenFormModal from './modals/ExamenFormModal';
import BatchExamenModal from './modals/BatchExamenModal';

const statutColor: Record<string, string> = {
  PLANIFIE: '#fff3e0',
  REALISE: '#e8f5e9',
  ANNULE: '#ffebee',
};

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const navigate = useNavigate();

  const load = () => getAllExamens().then(setExamens);

  useEffect(() => { load(); }, []);

  const handleAnnuler = async (id: number) => {
    if (!confirm('Confirmer l\'annulation de cet examen ?')) return;
    await annulerExamen(id);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Examens</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            + Nouvel examen
          </button>
          <button onClick={() => setShowBatch(true)}
            style={{ background: '#388e3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            + Planifier en lot
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1a237e', color: 'white' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Candidat</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Statut</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Résultat</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Observation</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examens.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 12px' }}>
                <span
                  onClick={() => navigate(`/candidats/${e.candidat.id}/historique`)}
                  style={{ color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}>
                  {e.candidat.nom} {e.candidat.prenom}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{e.typeEpreuve}</span>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>
                {e.dateExamen ? new Date(e.dateExamen).toLocaleDateString('fr-FR') : '—'}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ background: statutColor[e.statut] ?? '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{e.statut}</span>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>{e.resultat ?? '—'}</td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>{e.observation ?? '—'}</td>
              <td style={{ padding: '8px 12px' }}>
                {e.statut === 'PLANIFIE' && (
                  <button onClick={() => handleAnnuler(e.id)}
                    style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', padding: '2px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Annuler
                  </button>
                )}
              </td>
            </tr>
          ))}
          {examens.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#999' }}>Aucun examen</td></tr>
          )}
        </tbody>
      </table>

      {showForm && <ExamenFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showBatch && <BatchExamenModal onClose={() => setShowBatch(false)} onSaved={() => { setShowBatch(false); load(); }} />}
    </div>
  );
}
```

- [ ] **Step 2 : Démarrer le frontend et vérifier visuellement**

```bash
cd "C:/permis de conduire/frontend/permis-app"
npm run dev
```

Ouvrir http://localhost:5173/examens. Vérifier :
- Les boutons "+ Nouvel examen" et "+ Planifier en lot" apparaissent
- La colonne Statut est présente
- Les noms de candidats s'affichent (si le backend retourne `candidat.nom`)
- Un clic sur "Annuler" pour un examen PLANIFIÉ déclenche la confirmation

> Si les noms de candidats apparaissent vides : le backend retourne peut-être le candidat sans `nom`/`prenom` à cause du lazy loading. Dans ce cas, ouvrir `Examen.java` et changer `@ManyToOne(fetch = FetchType.LAZY)` en `@ManyToOne(fetch = FetchType.EAGER)` sur le champ `candidat`. Redémarrer le backend.

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Examens/ExamensPage.tsx
git commit -m "feat: ExamensPage — boutons création, colonne statut, annulation, noms candidats"
```

---

## Task 9 — ExamenFormModal + BatchExamenModal

**Files:**
- Create: `frontend/permis-app/src/pages/Examens/modals/ExamenFormModal.tsx`
- Create: `frontend/permis-app/src/pages/Examens/modals/BatchExamenModal.tsx`

- [ ] **Step 1 : Créer le dossier modals**

```bash
mkdir -p "C:/permis de conduire/frontend/permis-app/src/pages/Examens/modals"
```

- [ ] **Step 2 : Créer ExamenFormModal.tsx**

```tsx
import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addExamen } from '../../../api/examenApi';
import type { Candidat } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function ExamenFormModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [candidatId, setCandidatId] = useState('');
  const [typeEpreuve, setTypeEpreuve] = useState<'CODE' | 'CRENEAU' | 'CONDUITE'>('CODE');
  const [dateExamen, setDateExamen] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => { getCandidats().then(setCandidats); }, []);

  const handleSave = async () => {
    if (!candidatId) return alert('Sélectionner un candidat');
    if (!dateExamen) return alert('Saisir une date');
    await addExamen(Number(candidatId), { typeEpreuve, dateExamen, observation, statut: 'PLANIFIE' } as any);
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 480, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Nouvel examen</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Candidat</label>
            <select value={candidatId} onChange={e => setCandidatId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">— Sélectionner —</option>
              {candidats.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Type épreuve</label>
            <select value={typeEpreuve} onChange={e => setTypeEpreuve(e.target.value as any)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="CODE">CODE</option>
              <option value="CRENEAU">CRÉNEAU</option>
              <option value="CONDUITE">CONDUITE</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Date et heure</label>
            <input type="datetime-local" value={dateExamen} onChange={e => setDateExamen(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Observation</label>
            <input value={observation} onChange={e => setObservation(e.target.value)} placeholder="Optionnel"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: 'white' }}>Annuler</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer BatchExamenModal.tsx**

```tsx
import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addBatchExamen } from '../../../api/examenApi';
import type { Candidat } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function BatchExamenModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [typeEpreuve, setTypeEpreuve] = useState<'CODE' | 'CRENEAU' | 'CONDUITE'>('CODE');
  const [dateExamen, setDateExamen] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    getCandidats().then(all =>
      setCandidats(all.filter(c => c.statutDossier === 'EN_COURS' || c.statutDossier === 'INCOMPLET'))
    );
  }, []);

  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return alert('Sélectionner au moins un candidat');
    if (!dateExamen) return alert('Saisir une date');
    await addBatchExamen({ candidatIds: [...selected], typeEpreuve, dateExamen, observation });
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 560, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Planifier un examen en lot</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Type épreuve</label>
              <select value={typeEpreuve} onChange={e => setTypeEpreuve(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="CODE">CODE</option>
                <option value="CRENEAU">CRÉNEAU</option>
                <option value="CONDUITE">CONDUITE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Date et heure</label>
              <input type="datetime-local" value={dateExamen} onChange={e => setDateExamen(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Observation</label>
              <input value={observation} onChange={e => setObservation(e.target.value)} placeholder="Optionnel"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', color: '#666' }}>
              Candidats ({candidats.length} disponibles)
            </label>
            <div style={{ border: '1px solid #ddd', borderRadius: 4, maxHeight: 200, overflowY: 'auto' }}>
              {candidats.map(c => (
                <div key={c.id} onClick={() => toggle(c.id)}
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: selected.has(c.id) ? '#e8f0fe' : 'white' }}>
                  <input type="checkbox" checked={selected.has(c.id)} readOnly />
                  <span>{c.nom} {c.prenom}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#999' }}>{c.statutDossier}</span>
                </div>
              ))}
              {candidats.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>Aucun candidat disponible</div>}
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: 'white' }}>Fermer</button>
          <button onClick={handleConfirm} disabled={selected.size === 0}
            style={{ padding: '8px 16px', background: selected.size === 0 ? '#aaa' : '#388e3c', color: 'white', border: 'none', borderRadius: 4, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
            Confirmer ({selected.size} candidat{selected.size !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Tester visuellement**

Frontend démarré sur http://localhost:5173/examens. Vérifier :
- Clic sur "+ Nouvel examen" → modal s'ouvre avec liste candidats
- Clic sur "+ Planifier en lot" → modal s'ouvre, candidats EN_COURS/INCOMPLET listés
- Sélectionner candidats → bouton "Confirmer" affiche le compte
- Confirmer → examens créés, liste rafraîchie

- [ ] **Step 5 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Examens/modals/
git commit -m "feat: add ExamenFormModal + BatchExamenModal"
```

---

## Task 10 — PaiementsPage + PaiementFormModal

**Files:**
- Modify: `frontend/permis-app/src/pages/Paiements/PaiementsPage.tsx`
- Create: `frontend/permis-app/src/pages/Paiements/modals/PaiementFormModal.tsx`

- [ ] **Step 1 : Créer PaiementFormModal.tsx**

```bash
mkdir -p "C:/permis de conduire/frontend/permis-app/src/pages/Paiements/modals"
```

Créer `frontend/permis-app/src/pages/Paiements/modals/PaiementFormModal.tsx` :

```tsx
import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addPaiement } from '../../../api/paiementApi';
import type { Candidat } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function PaiementFormModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [candidatId, setCandidatId] = useState('');
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState('Espèces');
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { getCandidats().then(setCandidats); }, []);

  const handleSave = async () => {
    if (!candidatId) return alert('Sélectionner un candidat');
    if (!montant || Number(montant) <= 0) return alert('Saisir un montant valide');
    await addPaiement(Number(candidatId), { montant: Number(montant), modePaiement, datePaiement });
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 480, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Nouveau paiement</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Candidat</label>
            <select value={candidatId} onChange={e => setCandidatId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">— Sélectionner —</option>
              {candidats.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Montant (DA)</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)} min="0"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Mode</label>
              <select value={modePaiement} onChange={e => setModePaiement(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
                <option>Espèces</option>
                <option>Chèque</option>
                <option>CCP</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Date</label>
              <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: 'white' }}>Annuler</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Modifier PaiementsPage.tsx pour ajouter le bouton et le modal**

Ouvrir `frontend/permis-app/src/pages/Paiements/PaiementsPage.tsx`. Ajouter :

1. Import `useNavigate` depuis react-router-dom
2. Import `PaiementFormModal`
3. State `showForm`
4. Bouton "+ Nouveau paiement" dans l'en-tête
5. Nom du candidat cliquable vers l'historique
6. Rendu conditionnel du modal

Le fichier doit contenir ces changements clés :

```tsx
import { useNavigate } from 'react-router-dom';
import PaiementFormModal from './modals/PaiementFormModal';

// Dans le composant :
const [showForm, setShowForm] = useState(false);
const navigate = useNavigate();

// Bouton dans l'en-tête (à côté du titre) :
<button onClick={() => setShowForm(true)}
  style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
  + Nouveau paiement
</button>

// Dans chaque ligne du tableau, colonne Candidat — remplacer "Candidat #{p.candidat?.id}" par :
<span onClick={() => navigate(`/candidats/${p.candidat?.id}/historique`)}
  style={{ color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}>
  {p.candidat?.nom} {p.candidat?.prenom}
</span>

// En bas du JSX, avant la fermeture de la div racine :
{showForm && <PaiementFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
```

> Si l'interface `Paiement` dans `types/index.ts` ne contient pas `candidat`, l'ajouter : `candidat: { id: number; nom: string; prenom: string }`.

> Si le backend ne retourne pas `nom`/`prenom` dans les paiements : même correction que Task 8 Step 2 — passer `@ManyToOne` en EAGER sur `Paiement.candidat`.

- [ ] **Step 3 : Tester visuellement**

Sur http://localhost:5173/paiements. Vérifier :
- Bouton "+ Nouveau paiement" présent
- Modal s'ouvre avec liste candidats, champs montant/mode/date
- Enregistrement crée le paiement et rafraîchit la liste

- [ ] **Step 4 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Paiements/
git commit -m "feat: PaiementsPage — bouton création + PaiementFormModal"
```

---

## Task 11 — InfosTab : zone photo upload

**Files:**
- Modify: `frontend/permis-app/src/pages/Candidats/tabs/InfosTab.tsx`

- [ ] **Step 1 : Ajouter la zone photo dans InfosTab**

Ouvrir `frontend/permis-app/src/pages/Candidats/tabs/InfosTab.tsx`.

Ajouter les imports :

```typescript
import { uploadPhoto, getPhotoUrl } from '../../../api/candidatApi';
```

Ajouter le state pour la photo (après les states existants) :

```typescript
const [photoKey, setPhotoKey] = useState(0);
```

Ajouter le handler d'upload :

```typescript
const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !candidat?.id) return;
  if (file.size > 5 * 1024 * 1024) return alert('La photo ne doit pas dépasser 5 MB');
  await uploadPhoto(candidat.id, file);
  setPhotoKey(k => k + 1);
};
```

Dans le JSX, entourer le formulaire existant avec un `div` flex et ajouter la zone photo à gauche :

```tsx
<div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
  {/* Zone photo */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 90 }}>
    {candidat?.id && candidat?.photoPath ? (
      <img
        key={photoKey}
        src={getPhotoUrl(candidat.id)}
        alt="photo"
        style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
      />
    ) : (
      <div style={{ width: 80, height: 100, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 28 }}>
        📷
      </div>
    )}
    {candidat?.id && (
      <label style={{ fontSize: 11, color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}>
        Changer photo
        <input type="file" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} style={{ display: 'none' }} />
      </label>
    )}
  </div>

  {/* Formulaire existant — le déplacer ici */}
  <div style={{ flex: 1 }}>
    {/* ... contenu actuel du formulaire ... */}
  </div>
</div>
```

> Attention : s'assurer que le `candidat` prop passé à InfosTab contient `photoPath`. Si non, mettre à jour l'interface et s'assurer que le backend le retourne.

- [ ] **Step 2 : Tester visuellement**

Sur http://localhost:5173/candidats, ouvrir un candidat → onglet Infos. Vérifier :
- Zone photo grise avec icône 📷 si pas de photo
- Lien "Changer photo" cliquable → ouvre sélecteur de fichier
- Après upload → photo s'affiche immédiatement

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Candidats/tabs/InfosTab.tsx
git commit -m "feat: add photo upload zone in InfosTab"
```

---

## Task 12 — NotificationsTab + ajout dans CandidatModal

**Files:**
- Create: `frontend/permis-app/src/pages/Candidats/tabs/NotificationsTab.tsx`
- Modify: `frontend/permis-app/src/pages/Candidats/CandidatModal.tsx`

- [ ] **Step 1 : Créer NotificationsTab.tsx**

```tsx
import { useEffect, useState } from 'react';
import { getNotifications, addNotification } from '../../../api/notificationApi';
import type { Notification, TypeNotification, CanalNotification } from '../../../types';

interface Props {
  candidatId: number;
}

export default function NotificationsTab({ candidatId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [canal, setCanal] = useState<CanalNotification>('SMS');
  const [type, setType] = useState<TypeNotification>('MANQUE_PAIEMENT');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => getNotifications(candidatId).then(setNotifications);

  useEffect(() => { load(); }, [candidatId]);

  const handleSend = async () => {
    if (!message.trim()) return alert('Saisir un message');
    setSending(true);
    await addNotification(candidatId, { type, canal, message });
    setMessage('');
    await load();
    setSending(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: 8, marginBottom: 16, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Canal</label>
          <select value={canal} onChange={e => setCanal(e.target.value as CanalNotification)}
            style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as TypeNotification)}
            style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="MANQUE_PAIEMENT">Manque paiement</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Message</label>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Saisir le message..."
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleSend} disabled={sending}
          style={{ padding: '7px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Envoyer
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>Aucune notification</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Canal</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Message</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 10px' }}>
                  <span style={{ background: n.canal === 'SMS' ? '#e3f2fd' : '#f3e5f5', padding: '2px 8px', borderRadius: 4 }}>{n.canal}</span>
                </td>
                <td style={{ padding: '6px 10px', color: '#555' }}>{n.type.replace('_', ' ')}</td>
                <td style={{ padding: '6px 10px' }}>{n.message}</td>
                <td style={{ padding: '6px 10px', color: '#999' }}>
                  {new Date(n.dateEnvoi).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Ajouter l'onglet Notifications dans CandidatModal**

Ouvrir `frontend/permis-app/src/pages/Candidats/CandidatModal.tsx`.

Ajouter l'import :
```typescript
import NotificationsTab from './tabs/NotificationsTab';
```

Dans le tableau des onglets, ajouter après `💰 Paiements` :
```tsx
{ key: 'notifications', label: '🔔 Notifications' }
```

Dans le rendu conditionnel des onglets, ajouter :
```tsx
{activeTab === 'notifications' && candidat?.id && <NotificationsTab candidatId={candidat.id} />}
```

- [ ] **Step 3 : Tester visuellement**

Sur http://localhost:5173/candidats, ouvrir un candidat → vérifier que l'onglet "🔔 Notifications" est présent. Envoyer un message → vérifier qu'il apparaît dans la liste.

- [ ] **Step 4 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Candidats/tabs/NotificationsTab.tsx
git add frontend/permis-app/src/pages/Candidats/CandidatModal.tsx
git commit -m "feat: add NotificationsTab + 5th tab in CandidatModal"
```

---

## Task 13 — ExamensTab : colonne Statut + bouton Annuler

**Files:**
- Modify: `frontend/permis-app/src/pages/Candidats/tabs/ExamensTab.tsx`

- [ ] **Step 1 : Modifier ExamensTab pour ajouter Statut et Annuler**

Ouvrir `frontend/permis-app/src/pages/Candidats/tabs/ExamensTab.tsx`.

Ajouter l'import :
```typescript
import { annulerExamen } from '../../../api/examenApi';
```

Ajouter le handler d'annulation (dans le composant, avant le return) :
```typescript
const handleAnnuler = async (id: number) => {
  if (!confirm('Confirmer l\'annulation ?')) return;
  await annulerExamen(id);
  onRefresh(); // ou recharger les examens via l'API si onRefresh n'existe pas
};
```

> Si le composant n'a pas de prop `onRefresh`, remplacer par un reload local :
> ```typescript
> const [examens, setExamens] = useState<Examen[]>([]);
> const load = () => getExamens(candidatId).then(setExamens);
> useEffect(() => { load(); }, [candidatId]);
> const handleAnnuler = async (id: number) => {
>   if (!confirm('Confirmer l\'annulation ?')) return;
>   await annulerExamen(id);
>   load();
> };
> ```

Dans le tableau des examens existants, ajouter la colonne Statut et la colonne Actions :

En-tête du tableau :
```tsx
<th>Statut</th>
<th>Actions</th>
```

Dans chaque ligne :
```tsx
<td>
  <span style={{
    background: e.statut === 'PLANIFIE' ? '#fff3e0' : e.statut === 'ANNULE' ? '#ffebee' : '#e8f5e9',
    padding: '2px 8px', borderRadius: 4, fontSize: 12
  }}>{e.statut ?? 'PLANIFIE'}</span>
</td>
<td>
  {(e.statut === 'PLANIFIE' || !e.statut) && (
    <button onClick={() => handleAnnuler(e.id)}
      style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
      Annuler
    </button>
  )}
</td>
```

- [ ] **Step 2 : Tester visuellement**

Sur http://localhost:5173/candidats, ouvrir un candidat → onglet Examens. Vérifier :
- Colonne Statut présente avec badge coloré
- Bouton "Annuler" visible sur les examens PLANIFIÉS
- Clic sur "Annuler" → confirmation → examen passe à ANNULÉ

- [ ] **Step 3 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Candidats/tabs/ExamensTab.tsx
git commit -m "feat: ExamensTab — add statut column + annuler button"
```

---

## Task 14 — HistoriqueCandidatPage + route

**Files:**
- Create: `frontend/permis-app/src/pages/Candidats/HistoriqueCandidatPage.tsx`
- Modify: `frontend/permis-app/src/App.tsx`

- [ ] **Step 1 : Créer HistoriqueCandidatPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCandidat } from '../../api/candidatApi';
import { getExamens } from '../../api/examenApi';
import { getPaiements } from '../../api/paiementApi';
import { getNotifications } from '../../api/notificationApi';
import type { Candidat, Examen, Paiement, Notification } from '../../types';
import { annulerExamen } from '../../api/examenApi';

const statutColor: Record<string, string> = {
  PLANIFIE: '#fff3e0', REALISE: '#e8f5e9', ANNULE: '#ffebee',
};

export default function HistoriqueCandidatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidatId = Number(id);

  const [candidat, setCandidat] = useState<Candidat | null>(null);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'examens' | 'paiements' | 'notifications'>('examens');

  useEffect(() => {
    getCandidat(candidatId).then(setCandidat);
    getExamens(candidatId).then(setExamens);
    getPaiements(candidatId).then(setPaiements);
    getNotifications(candidatId).then(setNotifications);
  }, [candidatId]);

  const handleAnnuler = async (examenId: number) => {
    if (!confirm('Confirmer l\'annulation ?')) return;
    await annulerExamen(examenId);
    getExamens(candidatId).then(setExamens);
  };

  const totalPaiements = paiements.reduce((s, p) => s + p.montant, 0);

  const tabs = [
    { key: 'examens' as const, label: `📝 Examens (${examens.length})` },
    { key: 'paiements' as const, label: `💰 Paiements (${paiements.length})` },
    { key: 'notifications' as const, label: `🔔 Notifications (${notifications.length})` },
  ];

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/candidats')}
        style={{ background: 'none', border: 'none', color: '#1a237e', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
        ← Retour aux candidats
      </button>

      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {candidat?.photoPath ? (
            <img src={`/api/candidats/${candidatId}/photo`} alt="photo"
              style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 4, border: '2px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{ width: 56, height: 70, background: 'rgba(255,255,255,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
          )}
          <div>
            <h2 style={{ margin: 0 }}>{candidat?.nom} {candidat?.prenom}</h2>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
              {candidat?.categorieVisee} · {candidat?.numTelephone} · {candidat?.statutDossier}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === t.key ? 600 : 400, borderBottom: activeTab === t.key ? '2px solid #1a237e' : '2px solid transparent', color: activeTab === t.key ? '#1a237e' : '#555' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {activeTab === 'examens' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Résultat</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Observation</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Actions</th>
              </tr></thead>
              <tbody>
                {examens.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{e.typeEpreuve}</span></td>
                    <td style={{ padding: '8px 10px' }}>{e.dateExamen ? new Date(e.dateExamen).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: statutColor[e.statut] ?? '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{e.statut}</span></td>
                    <td style={{ padding: '8px 10px' }}>{e.resultat ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#555' }}>{e.observation ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      {e.statut === 'PLANIFIE' && (
                        <button onClick={() => handleAnnuler(e.id)}
                          style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {examens.length === 0 && <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucun examen</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'paiements' && (
            <>
              <div style={{ background: '#e8f5e9', padding: '10px 16px', borderRadius: 6, marginBottom: 12, fontWeight: 600, color: '#2e7d32' }}>
                Total encaissé : {totalPaiements.toLocaleString('fr-DZ')} DA
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Montant</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
                </tr></thead>
                <tbody>
                  {paiements.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#2e7d32' }}>{p.montant.toLocaleString('fr-DZ')} DA</td>
                      <td style={{ padding: '8px 10px' }}>{p.modePaiement}</td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{p.datePaiement}</td>
                    </tr>
                  ))}
                  {paiements.length === 0 && <tr><td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucun paiement</td></tr>}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'notifications' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Canal</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Message</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
              </tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: n.canal === 'SMS' ? '#e3f2fd' : '#f3e5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{n.canal}</span></td>
                    <td style={{ padding: '8px 10px', color: '#555' }}>{n.type.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '8px 10px' }}>{n.message}</td>
                    <td style={{ padding: '8px 10px', color: '#999' }}>{new Date(n.dateEnvoi).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
                {notifications.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucune notification</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Ajouter la route dans App.tsx**

Ouvrir `frontend/permis-app/src/App.tsx`. Ajouter l'import :

```typescript
import HistoriqueCandidatPage from './pages/Candidats/HistoriqueCandidatPage';
```

Ajouter la route (avant ou après la route `/candidats`) :

```tsx
<Route path="/candidats/:id/historique" element={<HistoriqueCandidatPage />} />
```

- [ ] **Step 3 : Tester visuellement**

Sur http://localhost:5173/examens, cliquer sur le nom d'un candidat. Vérifier :
- Navigation vers `/candidats/:id/historique`
- En-tête affiche nom, photo (si disponible), catégorie, téléphone, statut dossier
- Onglets Examens / Paiements / Notifications fonctionnels
- Bouton "← Retour aux candidats" fonctionne

- [ ] **Step 4 : Lancer le build TypeScript final**

```bash
cd "C:/permis de conduire/frontend/permis-app"
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 5 : Commit**

```bash
cd "C:/permis de conduire"
git add frontend/permis-app/src/pages/Candidats/HistoriqueCandidatPage.tsx
git add frontend/permis-app/src/App.tsx
git commit -m "feat: add HistoriqueCandidatPage + route /candidats/:id/historique"
```

---

## Task 15 — Tests backend complets + push

**Files:**
- Run all backend tests

- [ ] **Step 1 : Lancer tous les tests backend**

```bash
cd "C:/permis de conduire/backend"
./mvnw test
```

Résultat attendu : tous les tests passent (CandidatServiceTest + NotificationServiceTest + ExamenServiceExtendedTest).

- [ ] **Step 2 : Build backend complet**

```bash
./mvnw package -DskipTests
```

Résultat attendu : `BUILD SUCCESS`, JAR généré dans `target/`.

- [ ] **Step 3 : Build frontend**

```bash
cd "C:/permis de conduire/frontend/permis-app"
npm run build
```

Résultat attendu : `dist/` généré sans erreur.

- [ ] **Step 4 : Push vers GitHub (déclenchera le CI/CD)**

```bash
cd "C:/permis de conduire"
git push origin main
```

Le pipeline GitHub Actions déploiera automatiquement sur https://permis.infserv.ca.

- [ ] **Step 5 : Vérifier le déploiement sur permis.infserv.ca**

Après que le pipeline CI/CD est terminé (vérifier sur GitHub Actions), ouvrir https://permis.infserv.ca et tester :
- ExamensPage : boutons de création et colonne Statut
- PaiementsPage : bouton de création
- Modal candidat : onglet Notifications + photo
- Navigation vers l'historique d'un candidat

---

## Notes de déploiement VPS

Le dossier d'upload `/opt/permis/uploads/photos/` doit exister sur le VPS. L'ajouter dans le `docker-compose.yml` comme volume :

```yaml
permis_backend:
  volumes:
    - /opt/permis/uploads:/app/uploads
```

Et créer le dossier sur le VPS :
```bash
mkdir -p /opt/permis/uploads/photos
```

Si `docker-compose.yml` n'a pas encore ce volume, l'ajouter avant de pusher.
