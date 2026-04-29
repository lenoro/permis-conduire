# Gestion Permis de Conduire — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack driving license management app (React + Spring Boot + PostgreSQL) with candidate tracking, documents, exams, payments, and reports.

**Architecture:** Monorepo with `frontend/` and `backend/` folders. Backend exposes a REST API on port 8080. Frontend (Vite + React + TypeScript) runs on port 5173 and calls the API via axios. PostgreSQL on port 5432.

**Tech Stack:** Spring Boot 3.2 · Spring Data JPA · Spring Security · PostgreSQL · Lombok · React 18 · Vite · TypeScript · Axios · React Router v6 · Docker Compose

---

## File Map

### Backend (`C:/permis de conduire/backend/`)
```
pom.xml
src/main/java/com/permis/
  PermisApplication.java
  config/SecurityConfig.java
  config/DataInitializer.java
  entity/Candidat.java          (+ StatutDossier enum)
  entity/Document.java
  entity/Examen.java             (+ TypeEpreuve + ResultatExamen enums)
  entity/Paiement.java
  repository/CandidatRepository.java
  repository/DocumentRepository.java
  repository/ExamenRepository.java
  repository/PaiementRepository.java
  service/CandidatService.java
  service/DocumentService.java
  service/ExamenService.java
  service/PaiementService.java
  controller/CandidatController.java
  controller/DocumentController.java
  controller/ExamenController.java
  controller/PaiementController.java
  controller/EtatController.java
src/main/resources/application.properties
src/test/java/com/permis/
  CandidatServiceTest.java
  CandidatControllerTest.java
```

### Frontend (`C:/permis de conduire/frontend/permis-app/`)
```
package.json
vite.config.ts
src/
  main.tsx
  App.tsx
  types/index.ts
  api/candidatApi.ts
  api/documentApi.ts
  api/examenApi.ts
  api/paiementApi.ts
  api/etatApi.ts
  components/Sidebar.tsx
  components/TopBar.tsx
  components/Badge.tsx
  pages/Candidats/CandidatsPage.tsx
  pages/Candidats/CandidatModal.tsx
  pages/Candidats/tabs/InfosTab.tsx
  pages/Candidats/tabs/DocumentsTab.tsx
  pages/Candidats/tabs/ExamensTab.tsx
  pages/Candidats/tabs/PaiementsTab.tsx
  pages/Examens/ExamensPage.tsx
  pages/Paiements/PaiementsPage.tsx
  pages/Etats/EtatsPage.tsx
```

### Root (`C:/permis de conduire/`)
```
docker-compose.yml
.gitignore
```

---

## Task 1: Initialize Git repo and backend project

**Files:**
- Create: `C:/permis de conduire/.gitignore`
- Create: `C:/permis de conduire/backend/pom.xml`
- Create: `C:/permis de conduire/backend/src/main/java/com/permis/PermisApplication.java`
- Create: `C:/permis de conduire/backend/src/main/resources/application.properties`

- [ ] **Step 1: Init git repo**

```bash
cd "C:/permis de conduire"
git init
```

- [ ] **Step 2: Create .gitignore**

```
target/
*.class
node_modules/
dist/
.env
*.log
.idea/
```

- [ ] **Step 3: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
    </parent>
    <groupId>com.permis</groupId>
    <artifactId>backend</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 4: Create PermisApplication.java**

```java
package com.permis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PermisApplication {
    public static void main(String[] args) {
        SpringApplication.run(PermisApplication.class, args);
    }
}
```

- [ ] **Step 5: Create application.properties**

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/permis_db
spring.datasource.username=permis_user
spring.datasource.password=permis_pass
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=8080
```

- [ ] **Step 6: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: initialize backend project"
```

---

## Task 2: Entities JPA

**Files:**
- Create: `backend/src/main/java/com/permis/entity/Candidat.java`
- Create: `backend/src/main/java/com/permis/entity/Document.java`
- Create: `backend/src/main/java/com/permis/entity/Examen.java`
- Create: `backend/src/main/java/com/permis/entity/Paiement.java`

- [ ] **Step 1: Create Candidat.java**

```java
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
```

- [ ] **Step 2: Create Document.java**

```java
package com.permis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Document {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private Candidat candidat;

    private String typeDocument;
    private Boolean estFourni = false;
    private LocalDate dateRemise;
}
```

- [ ] **Step 3: Create Examen.java**

```java
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
```

- [ ] **Step 4: Create Paiement.java**

```java
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
```

- [ ] **Step 5: Commit**

```bash
cd "C:/permis de conduire/backend"
git add .
git commit -m "feat: add JPA entities (Candidat, Document, Examen, Paiement)"
```

---

## Task 3: Repositories et Services

**Files:**
- Create: `backend/src/main/java/com/permis/repository/CandidatRepository.java`
- Create: `backend/src/main/java/com/permis/repository/DocumentRepository.java`
- Create: `backend/src/main/java/com/permis/repository/ExamenRepository.java`
- Create: `backend/src/main/java/com/permis/repository/PaiementRepository.java`
- Create: `backend/src/main/java/com/permis/service/CandidatService.java`
- Create: `backend/src/main/java/com/permis/service/DocumentService.java`
- Create: `backend/src/main/java/com/permis/service/ExamenService.java`
- Create: `backend/src/main/java/com/permis/service/PaiementService.java`

- [ ] **Step 1: Create repositories**

`CandidatRepository.java`:
```java
package com.permis.repository;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidatRepository extends JpaRepository<Candidat, Long> {
    List<Candidat> findByStatutDossier(StatutDossier statut);
    List<Candidat> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);
}
```

`DocumentRepository.java`:
```java
package com.permis.repository;

import com.permis.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCandidatId(Long candidatId);
}
```

`ExamenRepository.java`:
```java
package com.permis.repository;

import com.permis.entity.Examen;
import com.permis.entity.Examen.TypeEpreuve;
import com.permis.entity.Examen.ResultatExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamenRepository extends JpaRepository<Examen, Long> {
    List<Examen> findByCandidatId(Long candidatId);
    List<Examen> findByTypeEpreuve(TypeEpreuve type);
    long countByTypeEpreuveAndResultat(TypeEpreuve type, ResultatExamen resultat);
    long countByTypeEpreuve(TypeEpreuve type);
}
```

`PaiementRepository.java`:
```java
package com.permis.repository;

import com.permis.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findByCandidatId(Long candidatId);

    @Query("SELECT SUM(p.montant) FROM Paiement p WHERE p.candidat.id = :candidatId")
    Double sumMontantByCandidatId(Long candidatId);
}
```

- [ ] **Step 2: Create CandidatService.java**

```java
package com.permis.service;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.repository.CandidatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class CandidatService {
    private final CandidatRepository repo;

    public List<Candidat> findAll() { return repo.findAll(); }

    public List<Candidat> findByStatut(StatutDossier statut) {
        return repo.findByStatutDossier(statut);
    }

    public List<Candidat> search(String q) {
        return repo.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q);
    }

    public Candidat findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + id));
    }

    public Candidat save(Candidat c) { return repo.save(c); }

    public Candidat update(Long id, Candidat updated) {
        Candidat existing = findById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setDateNaissance(updated.getDateNaissance());
        existing.setNumTelephone(updated.getNumTelephone());
        existing.setAdresse(updated.getAdresse());
        existing.setGroupeSanguin(updated.getGroupeSanguin());
        existing.setDateInscription(updated.getDateInscription());
        existing.setCategorieVisee(updated.getCategorieVisee());
        existing.setStatutDossier(updated.getStatutDossier());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
```

- [ ] **Step 3: Create DocumentService.java**

```java
package com.permis.service;

import com.permis.entity.Document;
import com.permis.repository.CandidatRepository;
import com.permis.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Document> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Document add(Long candidatId, Document doc) {
        doc.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(doc);
    }

    public Document update(Long id, Document updated) {
        Document existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document non trouvé: " + id));
        existing.setTypeDocument(updated.getTypeDocument());
        existing.setEstFourni(updated.getEstFourni());
        existing.setDateRemise(updated.getDateRemise());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
```

- [ ] **Step 4: Create ExamenService.java**

```java
package com.permis.service;

import com.permis.entity.Examen;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ExamenService {
    private final ExamenRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Examen> findAll() { return repo.findAll(); }

    public List<Examen> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Examen add(Long candidatId, Examen examen) {
        examen.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(examen);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
```

- [ ] **Step 5: Create PaiementService.java**

```java
package com.permis.service;

import com.permis.entity.Paiement;
import com.permis.repository.CandidatRepository;
import com.permis.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class PaiementService {
    private final PaiementRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Paiement> findAll() { return repo.findAll(); }

    public List<Paiement> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Paiement add(Long candidatId, Paiement paiement) {
        paiement.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(paiement);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
```

- [ ] **Step 6: Commit**

```bash
cd "C:/permis de conduire/backend"
git add .
git commit -m "feat: add repositories and services"
```

---

## Task 4: Controllers REST

**Files:**
- Create: `backend/src/main/java/com/permis/controller/CandidatController.java`
- Create: `backend/src/main/java/com/permis/controller/DocumentController.java`
- Create: `backend/src/main/java/com/permis/controller/ExamenController.java`
- Create: `backend/src/main/java/com/permis/controller/PaiementController.java`
- Create: `backend/src/main/java/com/permis/controller/EtatController.java`

- [ ] **Step 1: Create CandidatController.java**

```java
package com.permis.controller;

import com.permis.entity.Candidat;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.service.CandidatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/candidats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CandidatController {
    private final CandidatService service;

    @GetMapping
    public List<Candidat> list(@RequestParam(required = false) String statut,
                                @RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) return service.search(q);
        if (statut != null) return service.findByStatut(StatutDossier.valueOf(statut));
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Candidat get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Candidat create(@RequestBody Candidat c) { return service.save(c); }

    @PutMapping("/{id}")
    public Candidat update(@PathVariable Long id, @RequestBody Candidat c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

- [ ] **Step 2: Create DocumentController.java**

```java
package com.permis.controller;

import com.permis.entity.Document;
import com.permis.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService service;

    @GetMapping("/api/candidats/{id}/documents")
    public List<Document> list(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/documents")
    public Document add(@PathVariable Long id, @RequestBody Document doc) {
        return service.add(id, doc);
    }

    @PutMapping("/api/documents/{id}")
    public Document update(@PathVariable Long id, @RequestBody Document doc) {
        return service.update(id, doc);
    }

    @DeleteMapping("/api/documents/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

- [ ] **Step 3: Create ExamenController.java**

```java
package com.permis.controller;

import com.permis.entity.Examen;
import com.permis.service.ExamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ExamenController {
    private final ExamenService service;

    @GetMapping("/api/examens")
    public List<Examen> all() { return service.findAll(); }

    @GetMapping("/api/candidats/{id}/examens")
    public List<Examen> byCandidat(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/examens")
    public Examen add(@PathVariable Long id, @RequestBody Examen examen) {
        return service.add(id, examen);
    }

    @DeleteMapping("/api/examens/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

- [ ] **Step 4: Create PaiementController.java**

```java
package com.permis.controller;

import com.permis.entity.Paiement;
import com.permis.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PaiementController {
    private final PaiementService service;

    @GetMapping("/api/paiements")
    public List<Paiement> all() { return service.findAll(); }

    @GetMapping("/api/candidats/{id}/paiements")
    public List<Paiement> byCandidat(@PathVariable Long id) { return service.findByCandidat(id); }

    @PostMapping("/api/candidats/{id}/paiements")
    public Paiement add(@PathVariable Long id, @RequestBody Paiement paiement) {
        return service.add(id, paiement);
    }

    @DeleteMapping("/api/paiements/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

- [ ] **Step 5: Create EtatController.java**

```java
package com.permis.controller;

import com.permis.entity.Candidat.StatutDossier;
import com.permis.entity.Examen.ResultatExamen;
import com.permis.entity.Examen.TypeEpreuve;
import com.permis.repository.CandidatRepository;
import com.permis.repository.ExamenRepository;
import com.permis.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/etats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EtatController {
    private final CandidatRepository candidatRepo;
    private final ExamenRepository examenRepo;
    private final PaiementRepository paiementRepo;

    @GetMapping("/statuts")
    public Map<String, Long> statuts() {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", candidatRepo.count());
        for (StatutDossier s : StatutDossier.values()) {
            result.put(s.name(), (long) candidatRepo.findByStatutDossier(s).size());
        }
        return result;
    }

    @GetMapping("/examens")
    public Map<String, Object> examens() {
        Map<String, Object> result = new LinkedHashMap<>();
        for (TypeEpreuve type : TypeEpreuve.values()) {
            long total = examenRepo.countByTypeEpreuve(type);
            long admis = examenRepo.countByTypeEpreuveAndResultat(type, ResultatExamen.ADMIS);
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("total", total);
            stats.put("admis", admis);
            stats.put("taux", total == 0 ? 0 : Math.round(admis * 100.0 / total));
            result.put(type.name(), stats);
        }
        return result;
    }
}
```

- [ ] **Step 6: Commit**

```bash
cd "C:/permis de conduire/backend"
git add .
git commit -m "feat: add REST controllers"
```

---

## Task 5: Security + DataInitializer

**Files:**
- Create: `backend/src/main/java/com/permis/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/permis/config/DataInitializer.java`

- [ ] **Step 1: Create SecurityConfig.java**

```java
package com.permis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").authenticated()
            )
            .httpBasic(basic -> {});
        return http.build();
    }

    @Bean
    public UserDetailsService users(PasswordEncoder encoder) {
        UserDetails admin = User.builder()
            .username("admin")
            .password(encoder.encode("123"))
            .roles("ADMIN")
            .build();
        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 2: Create DataInitializer.java**

```java
package com.permis.config;

import com.permis.entity.*;
import com.permis.entity.Candidat.StatutDossier;
import com.permis.entity.Examen.TypeEpreuve;
import com.permis.entity.Examen.ResultatExamen;
import com.permis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final CandidatRepository candidatRepo;

    @Override
    public void run(String... args) {
        if (candidatRepo.count() > 0) return;

        Candidat c1 = Candidat.builder()
            .nom("BENALI").prenom("Ahmed")
            .dateNaissance(LocalDate.of(1998, 6, 15))
            .numTelephone("0550123456").adresse("12 Rue des Oliviers, Alger")
            .groupeSanguin("O+").dateInscription(LocalDate.of(2025, 1, 12))
            .categorieVisee("B").statutDossier(StatutDossier.VALIDE)
            .build();

        Candidat c2 = Candidat.builder()
            .nom("HAMMADI").prenom("Sara")
            .dateNaissance(LocalDate.of(2000, 3, 20))
            .numTelephone("0661789012").adresse("5 Cité des Roses, Oran")
            .groupeSanguin("A+").dateInscription(LocalDate.of(2025, 2, 3))
            .categorieVisee("B").statutDossier(StatutDossier.EN_COURS)
            .build();

        candidatRepo.save(c1);
        candidatRepo.save(c2);
    }
}
```

- [ ] **Step 3: Verify backend builds**

```bash
cd "C:/permis de conduire/backend"
mvn clean compile -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 4: Start PostgreSQL and run backend**

Start PostgreSQL (create database `permis_db`, user `permis_user`, password `permis_pass`), then:

```bash
mvn spring-boot:run
```

Expected: Started on port 8080. Tables auto-created by Hibernate.

- [ ] **Step 5: Smoke test**

```bash
curl -u admin:123 http://localhost:8080/api/candidats
```

Expected: JSON array with 2 candidats.

- [ ] **Step 6: Commit**

```bash
cd "C:/permis de conduire/backend"
git add .
git commit -m "feat: add security and data initializer"
```

---

## Task 6: Tests backend

**Files:**
- Create: `backend/src/test/java/com/permis/CandidatServiceTest.java`

- [ ] **Step 1: Write CandidatServiceTest.java**

```java
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
```

- [ ] **Step 2: Run tests**

```bash
cd "C:/permis de conduire/backend"
mvn test -q
```

Expected: `Tests run: 4, Failures: 0, Errors: 0`

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "test: add CandidatService unit tests"
```

---

## Task 7: Frontend — Scaffolding + Types + API

**Files:**
- Create: `frontend/permis-app/` (Vite project)
- Create: `frontend/permis-app/src/types/index.ts`
- Create: `frontend/permis-app/src/api/candidatApi.ts`
- Create: `frontend/permis-app/src/api/documentApi.ts`
- Create: `frontend/permis-app/src/api/examenApi.ts`
- Create: `frontend/permis-app/src/api/paiementApi.ts`
- Create: `frontend/permis-app/src/api/etatApi.ts`

- [ ] **Step 1: Create Vite project**

```bash
cd "C:/permis de conduire/frontend"
npm create vite@latest permis-app -- --template react-ts
cd permis-app
npm install
npm install axios react-router-dom
```

- [ ] **Step 2: Create src/types/index.ts**

```typescript
export type StatutDossier = 'INCOMPLET' | 'EN_COURS' | 'VALIDE' | 'ARCHIVE';
export type TypeEpreuve = 'CODE' | 'CRENEAU' | 'CONDUITE';
export type ResultatExamen = 'ADMIS' | 'AJOURNE' | 'ABSENT';
export type ModePaiement = 'Espèces' | 'Chèque' | 'CCP';

export interface Candidat {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  numTelephone?: string;
  adresse?: string;
  groupeSanguin?: string;
  dateInscription?: string;
  categorieVisee?: string;
  statutDossier: StatutDossier;
}

export interface Document {
  id?: number;
  candidat?: { id: number };
  typeDocument: string;
  estFourni: boolean;
  dateRemise?: string;
}

export interface Examen {
  id?: number;
  candidat?: { id: number };
  typeEpreuve: TypeEpreuve;
  dateExamen?: string;
  resultat?: ResultatExamen;
  observation?: string;
}

export interface Paiement {
  id?: number;
  candidat?: { id: number };
  montant: number;
  datePaiement?: string;
  modePaiement?: string;
}

export interface StatutsEtat {
  total: number;
  INCOMPLET: number;
  EN_COURS: number;
  VALIDE: number;
  ARCHIVE: number;
}
```

- [ ] **Step 3: Create src/api/candidatApi.ts**

```typescript
import axios from 'axios';
import { Candidat } from '../types';

const BASE = 'http://localhost:8080/api/candidats';
const auth = { username: 'admin', password: '123' };

export const getCandidats = (statut?: string, q?: string) => {
  const params: Record<string, string> = {};
  if (statut) params.statut = statut;
  if (q) params.q = q;
  return axios.get<Candidat[]>(BASE, { auth, params }).then(r => r.data);
};

export const getCandidat = (id: number) =>
  axios.get<Candidat>(`${BASE}/${id}`, { auth }).then(r => r.data);

export const createCandidat = (c: Candidat) =>
  axios.post<Candidat>(BASE, c, { auth }).then(r => r.data);

export const updateCandidat = (id: number, c: Candidat) =>
  axios.put<Candidat>(`${BASE}/${id}`, c, { auth }).then(r => r.data);

export const deleteCandidat = (id: number) =>
  axios.delete(`${BASE}/${id}`, { auth });
```

- [ ] **Step 4: Create remaining API files**

`src/api/documentApi.ts`:
```typescript
import axios from 'axios';
import { Document } from '../types';

const auth = { username: 'admin', password: '123' };

export const getDocuments = (candidatId: number) =>
  axios.get<Document[]>(`http://localhost:8080/api/candidats/${candidatId}/documents`, { auth })
    .then(r => r.data);

export const addDocument = (candidatId: number, doc: Document) =>
  axios.post<Document>(`http://localhost:8080/api/candidats/${candidatId}/documents`, doc, { auth })
    .then(r => r.data);

export const updateDocument = (id: number, doc: Document) =>
  axios.put<Document>(`http://localhost:8080/api/documents/${id}`, doc, { auth })
    .then(r => r.data);

export const deleteDocument = (id: number) =>
  axios.delete(`http://localhost:8080/api/documents/${id}`, { auth });
```

`src/api/examenApi.ts`:
```typescript
import axios from 'axios';
import { Examen } from '../types';

const auth = { username: 'admin', password: '123' };

export const getAllExamens = () =>
  axios.get<Examen[]>('http://localhost:8080/api/examens', { auth }).then(r => r.data);

export const getExamens = (candidatId: number) =>
  axios.get<Examen[]>(`http://localhost:8080/api/candidats/${candidatId}/examens`, { auth })
    .then(r => r.data);

export const addExamen = (candidatId: number, e: Examen) =>
  axios.post<Examen>(`http://localhost:8080/api/candidats/${candidatId}/examens`, e, { auth })
    .then(r => r.data);

export const deleteExamen = (id: number) =>
  axios.delete(`http://localhost:8080/api/examens/${id}`, { auth });
```

`src/api/paiementApi.ts`:
```typescript
import axios from 'axios';
import { Paiement } from '../types';

const auth = { username: 'admin', password: '123' };

export const getAllPaiements = () =>
  axios.get<Paiement[]>('http://localhost:8080/api/paiements', { auth }).then(r => r.data);

export const getPaiements = (candidatId: number) =>
  axios.get<Paiement[]>(`http://localhost:8080/api/candidats/${candidatId}/paiements`, { auth })
    .then(r => r.data);

export const addPaiement = (candidatId: number, p: Paiement) =>
  axios.post<Paiement>(`http://localhost:8080/api/candidats/${candidatId}/paiements`, p, { auth })
    .then(r => r.data);

export const deletePaiement = (id: number) =>
  axios.delete(`http://localhost:8080/api/paiements/${id}`, { auth });
```

`src/api/etatApi.ts`:
```typescript
import axios from 'axios';
import { StatutsEtat } from '../types';

const auth = { username: 'admin', password: '123' };

export const getStatuts = () =>
  axios.get<StatutsEtat>('http://localhost:8080/api/etats/statuts', { auth }).then(r => r.data);

export const getExamensStats = () =>
  axios.get<Record<string, { total: number; admis: number; taux: number }>>(
    'http://localhost:8080/api/etats/examens', { auth }
  ).then(r => r.data);
```

- [ ] **Step 5: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: scaffold React frontend with types and API clients"
```

---

## Task 8: Layout (Sidebar + TopBar + Router)

**Files:**
- Create: `frontend/permis-app/src/components/Sidebar.tsx`
- Create: `frontend/permis-app/src/components/TopBar.tsx`
- Create: `frontend/permis-app/src/components/Badge.tsx`
- Modify: `frontend/permis-app/src/App.tsx`
- Modify: `frontend/permis-app/src/main.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/candidats', icon: '👥', label: 'Candidats' },
  { to: '/examens',   icon: '📝', label: 'Examens' },
  { to: '/paiements', icon: '💰', label: 'Paiements' },
  { to: '/etats',     icon: '📊', label: 'États / Rapports' },
];

export default function Sidebar() {
  return (
    <aside style={{ width: 220, background: '#1a237e', color: '#fff',
                    display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '20px 16px', background: '#0d1561',
                    fontSize: 15, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🚗</span> Permis App
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 20px', fontSize: 13, color: '#fff',
              textDecoration: 'none', cursor: 'pointer',
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              borderLeft: isActive ? '3px solid #90caf9' : '3px solid transparent',
              fontWeight: isActive ? 700 : 400,
            })}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create TopBar.tsx**

```tsx
interface Props { title: string; onAdd?: () => void; addLabel?: string; }

export default function TopBar({ title, onAdd, addLabel = '+ Nouveau' }: Props) {
  return (
    <div style={{ background: '#fff', padding: '14px 24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #e8eaed' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#1a237e' }}>{title}</div>
      {onAdd && (
        <button onClick={onAdd}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
                   fontSize: 13, fontWeight: 600 }}>
          {addLabel}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create Badge.tsx**

```tsx
const colors: Record<string, { bg: string; color: string }> = {
  INCOMPLET: { bg: '#ffebee', color: '#c62828' },
  EN_COURS:  { bg: '#fff3e0', color: '#e65100' },
  VALIDE:    { bg: '#e8f5e9', color: '#2e7d32' },
  ARCHIVE:   { bg: '#eeeeee', color: '#616161' },
  ADMIS:     { bg: '#e8f5e9', color: '#2e7d32' },
  AJOURNE:   { bg: '#fff3e0', color: '#e65100' },
  ABSENT:    { bg: '#ffebee', color: '#c62828' },
  CODE:      { bg: '#e3f2fd', color: '#1565c0' },
  CRENEAU:   { bg: '#f3e5f5', color: '#6a1b9a' },
  CONDUITE:  { bg: '#e0f7fa', color: '#006064' },
};

export default function Badge({ value }: { value: string }) {
  const style = colors[value] ?? { bg: '#e0e0e0', color: '#333' };
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                   fontSize: 11, fontWeight: 600, background: style.bg, color: style.color }}>
      {value}
    </span>
  );
}
```

- [ ] **Step 4: Modify App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CandidatsPage from './pages/Candidats/CandidatsPage';
import ExamensPage from './pages/Examens/ExamensPage';
import PaiementsPage from './pages/Paiements/PaiementsPage';
import EtatsPage from './pages/Etats/EtatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f7fb' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/candidats" replace />} />
            <Route path="/candidats" element={<CandidatsPage />} />
            <Route path="/examens" element={<ExamensPage />} />
            <Route path="/paiements" element={<PaiementsPage />} />
            <Route path="/etats" element={<EtatsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Modify main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 6: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: add Sidebar, TopBar, Badge and routing"
```

---

## Task 9: Page Candidats

**Files:**
- Create: `frontend/permis-app/src/pages/Candidats/CandidatsPage.tsx`
- Create: `frontend/permis-app/src/pages/Candidats/CandidatModal.tsx`
- Create: `frontend/permis-app/src/pages/Candidats/tabs/InfosTab.tsx`
- Create: `frontend/permis-app/src/pages/Candidats/tabs/DocumentsTab.tsx`
- Create: `frontend/permis-app/src/pages/Candidats/tabs/ExamensTab.tsx`
- Create: `frontend/permis-app/src/pages/Candidats/tabs/PaiementsTab.tsx`

- [ ] **Step 1: Create CandidatsPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Candidat, StatutDossier } from '../../types';
import { getCandidats, deleteCandidat } from '../../api/candidatApi';
import { getStatuts } from '../../api/etatApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';
import CandidatModal from './CandidatModal';

const STATUTS: StatutDossier[] = ['INCOMPLET', 'EN_COURS', 'VALIDE', 'ARCHIVE'];

export default function CandidatsPage() {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filtre, setFiltre] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Candidat | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [data, s] = await Promise.all([
      getCandidats(filtre || undefined, search || undefined),
      getStatuts(),
    ]);
    setCandidats(data);
    setStats(s as unknown as Record<string, number>);
  };

  useEffect(() => { load(); }, [filtre, search]);

  const handleAdd = () => { setSelected(null); setShowModal(true); };
  const handleEdit = (c: Candidat) => { setSelected(c); setShowModal(true); };
  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce candidat ?')) { await deleteCandidat(id); load(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Candidats" onAdd={handleAdd} addLabel="+ Nouveau candidat" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total', val: stats.total, color: '#1976d2' },
            { label: 'Validés', val: stats.VALIDE, color: '#43a047' },
            { label: 'En cours', val: stats.EN_COURS, color: '#fb8c00' },
            { label: 'Incomplets', val: stats.INCOMPLET, color: '#e53935' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 10,
                  padding: '16px', borderLeft: `4px solid ${s.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{s.val ?? 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
                        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..."
              style={{ padding: '6px 12px', border: '1px solid #e0e0e0',
                       borderRadius: 6, fontSize: 13, width: 220 }} />
            <select value={filtre} onChange={e => setFiltre(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              <option value="">Tous les statuts</option>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Nom / Prénom', 'Catégorie', 'Statut', 'Téléphone', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidats.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}
                  onClick={() => handleEdit(c)}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    <strong>{c.nom} {c.prenom}</strong><br/>
                    <small style={{ color: '#888' }}>{c.dateInscription}</small>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {c.categorieVisee}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={c.statutDossier} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {c.numTelephone}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEdit(c)}
                      style={{ marginRight: 8, padding: '4px 12px', fontSize: 12,
                               background: '#e3f2fd', color: '#1976d2', border: 'none',
                               borderRadius: 4, cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => handleDelete(c.id!)}
                      style={{ padding: '4px 12px', fontSize: 12,
                               background: '#ffebee', color: '#c62828', border: 'none',
                               borderRadius: 4, cursor: 'pointer' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CandidatModal
          candidat={selected}
          onClose={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create CandidatModal.tsx**

```tsx
import { useState } from 'react';
import { Candidat } from '../../types';
import InfosTab from './tabs/InfosTab';
import DocumentsTab from './tabs/DocumentsTab';
import ExamensTab from './tabs/ExamensTab';
import PaiementsTab from './tabs/PaiementsTab';

const TABS = ['👤 Infos', '📄 Documents', '📝 Examens', '💰 Paiements'];

interface Props { candidat: Candidat | null; onClose: () => void; }

export default function CandidatModal({ candidat, onClose }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '80vw', maxWidth: 860,
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', background: '#1a237e', color: '#fff',
                      borderRadius: '12px 12px 0 0', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {candidat ? `${candidat.nom} ${candidat.prenom}` : 'Nouveau candidat'}
          </span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff',
                     fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {/* Tabs */}
        {candidat && (
          <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', background: '#f8f9fa' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                style={{ padding: '12px 20px', fontSize: 13, cursor: 'pointer', background: 'none',
                         border: 'none', borderBottom: tab === i ? '3px solid #1976d2' : '3px solid transparent',
                         color: tab === i ? '#1976d2' : '#666', fontWeight: tab === i ? 700 : 400 }}>
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {(tab === 0 || !candidat) && <InfosTab candidat={candidat} onSaved={onClose} />}
          {tab === 1 && candidat && <DocumentsTab candidatId={candidat.id!} />}
          {tab === 2 && candidat && <ExamensTab candidatId={candidat.id!} />}
          {tab === 3 && candidat && <PaiementsTab candidatId={candidat.id!} />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create tabs/InfosTab.tsx**

```tsx
import { useState } from 'react';
import { Candidat, StatutDossier } from '../../../types';
import { createCandidat, updateCandidat } from '../../../api/candidatApi';

const STATUTS: StatutDossier[] = ['INCOMPLET', 'EN_COURS', 'VALIDE', 'ARCHIVE'];
const CATEGORIES = ['A', 'B', 'C', 'C1', 'D', 'BE'];

interface Props { candidat: Candidat | null; onSaved: () => void; }

const empty: Candidat = {
  nom: '', prenom: '', dateNaissance: '', numTelephone: '', adresse: '',
  groupeSanguin: '', dateInscription: new Date().toISOString().slice(0, 10),
  categorieVisee: 'B', statutDossier: 'INCOMPLET',
};

export default function InfosTab({ candidat, onSaved }: Props) {
  const [form, setForm] = useState<Candidat>(candidat ?? empty);

  const set = (field: keyof Candidat, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const save = async () => {
    if (candidat?.id) await updateCandidat(candidat.id, form);
    else await createCandidat(form);
    onSaved();
  };

  const field = (label: string, key: keyof Candidat, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{label}</label>
      <input type={type} value={(form[key] as string) ?? ''}
        onChange={e => set(key, e.target.value)}
        style={{ padding: '8px 10px', border: '1px solid #e0e0e0',
                 borderRadius: 6, fontSize: 13, background: '#f8f9fa' }} />
    </div>
  );

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
          Informations personnelles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Nom', 'nom')}
          {field('Prénom', 'prenom')}
          {field('Date de naissance', 'dateNaissance', 'date')}
          {field('Téléphone', 'numTelephone')}
          {field('Groupe sanguin', 'groupeSanguin')}
          <div style={{ gridColumn: 'span 2' }}>{field('Adresse', 'adresse')}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
          Dossier
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Date inscription', 'dateInscription', 'date')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Catégorie visée</label>
            <select value={form.categorieVisee ?? 'B'} onChange={e => set('categorieVisee', e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Statut dossier</label>
            <select value={form.statutDossier} onChange={e => set('statutDossier', e.target.value as StatutDossier)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={save}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '10px 24px', borderRadius: 6, cursor: 'pointer',
                   fontSize: 14, fontWeight: 600 }}>
          💾 Enregistrer
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create tabs/DocumentsTab.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Document } from '../../../types';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../../api/documentApi';

const TYPES_DOCS = ['Certificat médical', 'Photo d\'identité', 'Justificatif résidence',
                    'Formulaire n°12', 'Copie CNI', 'Extrait naissance'];

export default function DocumentsTab({ candidatId }: { candidatId: number }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [newType, setNewType] = useState(TYPES_DOCS[0]);

  const load = () => getDocuments(candidatId).then(setDocs);
  useEffect(() => { load(); }, [candidatId]);

  const toggle = async (doc: Document) => {
    await updateDocument(doc.id!, { ...doc, estFourni: !doc.estFourni,
      dateRemise: !doc.estFourni ? new Date().toISOString().slice(0, 10) : undefined });
    load();
  };

  const addDoc = async () => {
    await addDocument(candidatId, { typeDocument: newType, estFourni: false });
    load();
  };

  const del = async (id: number) => { await deleteDocument(id); load(); };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={newType} onChange={e => setNewType(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
          {TYPES_DOCS.map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={addDoc}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          + Ajouter
        </button>
      </div>

      {docs.map(doc => (
        <div key={doc.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '12px 16px', background: doc.estFourni ? '#e8f5e9' : '#fff',
                   borderRadius: 8, marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>{doc.estFourni ? '✅' : '⬜'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.typeDocument}</div>
              {doc.dateRemise && <div style={{ fontSize: 11, color: '#888' }}>Remis le {doc.dateRemise}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggle(doc)}
              style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                       cursor: 'pointer', background: doc.estFourni ? '#fff3e0' : '#e8f5e9',
                       color: doc.estFourni ? '#e65100' : '#2e7d32' }}>
              {doc.estFourni ? 'Annuler' : 'Marquer fourni'}
            </button>
            <button onClick={() => del(doc.id!)}
              style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                       cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create tabs/ExamensTab.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Examen, TypeEpreuve, ResultatExamen } from '../../../types';
import { getExamens, addExamen, deleteExamen } from '../../../api/examenApi';
import Badge from '../../../components/Badge';

export default function ExamensTab({ candidatId }: { candidatId: number }) {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [form, setForm] = useState<Partial<Examen>>({
    typeEpreuve: 'CODE', resultat: 'ADMIS',
    dateExamen: new Date().toISOString().slice(0, 16), observation: '',
  });

  const load = () => getExamens(candidatId).then(setExamens);
  useEffect(() => { load(); }, [candidatId]);

  const add = async () => {
    await addExamen(candidatId, form as Examen);
    setForm({ typeEpreuve: 'CODE', resultat: 'ADMIS',
              dateExamen: new Date().toISOString().slice(0, 16), observation: '' });
    load();
  };

  const del = async (id: number) => { await deleteExamen(id); load(); };

  return (
    <div>
      <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 12,
                      textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ajouter un examen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={form.typeEpreuve} onChange={e => setForm(f => ({ ...f, typeEpreuve: e.target.value as TypeEpreuve }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {(['CODE', 'CRENEAU', 'CONDUITE'] as TypeEpreuve[]).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Résultat</label>
            <select value={form.resultat} onChange={e => setForm(f => ({ ...f, resultat: e.target.value as ResultatExamen }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {(['ADMIS', 'AJOURNE', 'ABSENT'] as ResultatExamen[]).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Date</label>
            <input type="datetime-local" value={form.dateExamen ?? ''}
              onChange={e => setForm(f => ({ ...f, dateExamen: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Observation</label>
            <input value={form.observation ?? ''} onChange={e => setForm(f => ({ ...f, observation: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={add}
              style={{ width: '100%', background: '#1976d2', color: '#fff', border: 'none',
                       padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      {examens.map(e => (
        <div key={e.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '10px 14px', background: '#fff', borderRadius: 8,
                   marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge value={e.typeEpreuve} />
              <Badge value={e.resultat ?? ''} />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{e.dateExamen?.slice(0, 16)}</div>
            {e.observation && <div style={{ fontSize: 12, color: '#555' }}>{e.observation}</div>}
          </div>
          <button onClick={() => del(e.id!)}
            style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                     cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create tabs/PaiementsTab.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Paiement } from '../../../types';
import { getPaiements, addPaiement, deletePaiement } from '../../../api/paiementApi';

const MODES = ['Espèces', 'Chèque', 'CCP'];

export default function PaiementsTab({ candidatId }: { candidatId: number }) {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [form, setForm] = useState<Partial<Paiement>>({
    montant: 0, modePaiement: 'Espèces',
    datePaiement: new Date().toISOString().slice(0, 10),
  });

  const load = () => getPaiements(candidatId).then(setPaiements);
  useEffect(() => { load(); }, [candidatId]);

  const add = async () => {
    await addPaiement(candidatId, form as Paiement);
    setForm({ montant: 0, modePaiement: 'Espèces', datePaiement: new Date().toISOString().slice(0, 10) });
    load();
  };

  const del = async (id: number) => { await deletePaiement(id); load(); };

  const total = paiements.reduce((sum, p) => sum + (p.montant ?? 0), 0);

  return (
    <div>
      <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                    fontSize: 16, fontWeight: 700, color: '#2e7d32' }}>
        Total payé : {total.toLocaleString('fr-DZ')} DA
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Montant (DA)</label>
            <input type="number" value={form.montant ?? 0}
              onChange={e => setForm(f => ({ ...f, montant: Number(e.target.value) }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Mode</label>
            <select value={form.modePaiement} onChange={e => setForm(f => ({ ...f, modePaiement: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Date</label>
            <input type="date" value={form.datePaiement ?? ''}
              onChange={e => setForm(f => ({ ...f, datePaiement: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <button onClick={add}
            style={{ background: '#1976d2', color: '#fff', border: 'none',
                     padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            + Ajouter
          </button>
        </div>
      </div>

      {paiements.map(p => (
        <div key={p.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '10px 14px', background: '#fff', borderRadius: 8,
                   marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2e7d32' }}>
              {(p.montant ?? 0).toLocaleString('fr-DZ')} DA
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{p.modePaiement} · {p.datePaiement}</div>
          </div>
          <button onClick={() => del(p.id!)}
            style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                     cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: add Candidats page with modal and all 4 tabs"
```

---

## Task 10: Pages Examens et Paiements

**Files:**
- Create: `frontend/permis-app/src/pages/Examens/ExamensPage.tsx`
- Create: `frontend/permis-app/src/pages/Paiements/PaiementsPage.tsx`

- [ ] **Step 1: Create ExamensPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Examen } from '../../types';
import { getAllExamens } from '../../api/examenApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>([]);

  useEffect(() => { getAllExamens().then(setExamens); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Examens" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Candidat', 'Type épreuve', 'Date', 'Résultat', 'Observation'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examens.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {e.candidat ? `Candidat #${e.candidat.id}` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={e.typeEpreuve} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {e.dateExamen?.slice(0, 16)}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={e.resultat ?? ''} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#666', borderBottom: '1px solid #f5f5f5' }}>
                    {e.observation ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create PaiementsPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Paiement } from '../../types';
import { getAllPaiements } from '../../api/paiementApi';
import TopBar from '../../components/TopBar';

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  useEffect(() => { getAllPaiements().then(setPaiements); }, []);

  const total = paiements.reduce((sum, p) => sum + (p.montant ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Paiements" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 10,
                      padding: '16px 20px', marginBottom: 20, fontSize: 18,
                      fontWeight: 700, color: '#2e7d32' }}>
          Total encaissé : {total.toLocaleString('fr-DZ')} DA
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Candidat', 'Montant', 'Mode', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.candidat ? `Candidat #${p.candidat.id}` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700,
                               color: '#2e7d32', borderBottom: '1px solid #f5f5f5' }}>
                    {(p.montant ?? 0).toLocaleString('fr-DZ')} DA
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.modePaiement}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.datePaiement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: add Examens and Paiements pages"
```

---

## Task 11: Page États

**Files:**
- Create: `frontend/permis-app/src/pages/Etats/EtatsPage.tsx`

- [ ] **Step 1: Create EtatsPage.tsx**

```tsx
import { useEffect, useState } from 'react';
import { getStatuts, getExamensStats } from '../../api/etatApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';

export default function EtatsPage() {
  const [statuts, setStatuts] = useState<Record<string, number>>({});
  const [examens, setExamens] = useState<Record<string, { total: number; admis: number; taux: number }>>({});

  useEffect(() => {
    getStatuts().then(s => setStatuts(s as unknown as Record<string, number>));
    getExamensStats().then(setExamens);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="États / Rapports" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>

        {/* Rapport 1 - Statuts */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1a237e' }}>
            📊 Candidats par statut de dossier
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { key: 'INCOMPLET', label: 'Incomplets', color: '#e53935' },
              { key: 'EN_COURS',  label: 'En cours',   color: '#fb8c00' },
              { key: 'VALIDE',    label: 'Validés',     color: '#43a047' },
              { key: 'ARCHIVE',   label: 'Archivés',    color: '#616161' },
            ].map(s => (
              <div key={s.key} style={{ background: '#f8f9fa', borderRadius: 8,
                    padding: '16px', borderLeft: `4px solid ${s.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{statuts[s.key] ?? 0}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapport 2 - Examens */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1a237e' }}>
            📝 Taux de réussite par épreuve
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Épreuve', 'Passages', 'Admis', 'Taux de réussite'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(examens).map(([type, stats]) => (
                <tr key={type}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={type} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {stats.total}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#2e7d32',
                               fontWeight: 700, borderBottom: '1px solid #f5f5f5' }}>
                    {stats.admis}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.taux}%`, borderRadius: 4,
                                      background: stats.taux >= 70 ? '#43a047' : stats.taux >= 40 ? '#fb8c00' : '#e53935' }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36 }}>{stats.taux}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: add États page with statuts and exam success rate"
```

---

## Task 12: Docker Compose + vérification finale

**Files:**
- Create: `C:/permis de conduire/docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: permis_db
      POSTGRES_USER: permis_user
      POSTGRES_PASSWORD: permis_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/permis_db
      SPRING_DATASOURCE_USERNAME: permis_user
      SPRING_DATASOURCE_PASSWORD: permis_pass
    depends_on:
      - db

  frontend:
    build: ./frontend/permis-app
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

- [ ] **Step 2: Test local (sans Docker)**

```bash
# Terminal 1 — PostgreSQL déjà démarré
# Terminal 2 — Backend
cd "C:/permis de conduire/backend"
mvn spring-boot:run

# Terminal 3 — Frontend
cd "C:/permis de conduire/frontend/permis-app"
npm run dev
```

Ouvrir http://localhost:5173 et vérifier :
- Page Candidats charge avec les stats et le tableau
- Bouton "Nouveau candidat" ouvre le modal
- Ajout d'un candidat fonctionne
- Onglets Documents / Examens / Paiements fonctionnent
- Pages Examens, Paiements, États se chargent

- [ ] **Step 3: Commit final**

```bash
cd "C:/permis de conduire"
git add .
git commit -m "feat: add docker-compose and complete application"
```
