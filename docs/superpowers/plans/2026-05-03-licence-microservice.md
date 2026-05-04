# Licence Microservice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone licence-server microservice (Spring Boot + React) deployed on licence.infserv.ca that controls access to JAR-delivered apps via token + machine-ID verification, with a 15-day offline tolerance and a web admin panel.

**Architecture:** New standalone Spring Boot 3 project at `C:\licence-server\`. The backend exposes a public `/api/verify` endpoint and Basic-auth-protected admin endpoints. The React admin panel is built to `backend/src/main/resources/static/` and served by Spring Boot. Each JAR client embeds `LicenceChecker.java` which verifies on startup and caches the result locally (AES, 15-day TTL).

**Tech Stack:** Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, H2 (file), React 18 + TypeScript + Vite, Maven, Docker, nginx.

---

## Task 1: Bootstrap Spring Boot project

**Files:**
- Create: `C:\licence-server\backend\pom.xml`
- Create: `C:\licence-server\backend\src\main\java\com\licence\LicenceApplication.java`
- Create: `C:\licence-server\backend\src\main\resources\application.properties`

- [ ] **Step 1: Create project root**

```bash
mkdir C:\licence-server
mkdir C:\licence-server\backend\src\main\java\com\licence
mkdir C:\licence-server\backend\src\main\resources
mkdir C:\licence-server\backend\src\main\resources\static
mkdir C:\licence-server\backend\src\test\java\com\licence
cd C:\licence-server
git init
```

- [ ] **Step 2: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>
  <groupId>com.licence</groupId>
  <artifactId>licence-server</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>

  <properties>
    <java.version>17</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
          <excludes>
            <exclude>
              <groupId>org.projectlombok</groupId>
              <artifactId>lombok</artifactId>
            </exclude>
          </excludes>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

- [ ] **Step 3: Create LicenceApplication.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\LicenceApplication.java
package com.licence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LicenceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LicenceApplication.class, args);
    }
}
```

- [ ] **Step 4: Create application.properties**

```properties
# C:\licence-server\backend\src\main\resources\application.properties
server.port=8085

spring.datasource.url=jdbc:h2:file:/data/licences
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

spring.h2.console.enabled=false

app.admin.username=admin
app.admin.password=123
```

- [ ] **Step 5: Verify it compiles**

```bash
cd C:\licence-server\backend
mvn compile -q
```
Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "chore: bootstrap Spring Boot licence server"
```

---

## Task 2: Licence entity + repository

**Files:**
- Create: `C:\licence-server\backend\src\main\java\com\licence\entity\Licence.java`
- Create: `C:\licence-server\backend\src\main\java\com\licence\repository\LicenceRepository.java`

- [ ] **Step 1: Create Licence.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\entity\Licence.java
package com.licence.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "licences")
@Data
public class Licence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String token;          // UUID

    @Column(name = "app_name", nullable = false, length = 50)
    private String appName;        // "permis", "cantine"

    @Column(name = "client_name", nullable = false, length = 100)
    private String clientName;

    @Column(name = "machine_id", nullable = false, length = 64)
    private String machineId;      // SHA256 of MAC address

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

- [ ] **Step 2: Create LicenceRepository.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\repository\LicenceRepository.java
package com.licence.repository;

import com.licence.entity.Licence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LicenceRepository extends JpaRepository<Licence, Long> {
    Optional<Licence> findByToken(String token);
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd C:\licence-server\backend
mvn compile -q
```
Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add Licence entity and repository"
```

---

## Task 3: LicenceService

**Files:**
- Create: `C:\licence-server\backend\src\main\java\com\licence\service\LicenceService.java`
- Create: `C:\licence-server\backend\src\main\java\com\licence\dto\VerifyRequest.java`
- Create: `C:\licence-server\backend\src\main\java\com\licence\dto\VerifyResponse.java`
- Create: `C:\licence-server\backend\src\main\java\com\licence\dto\LicenceRequest.java`

- [ ] **Step 1: Create DTOs**

```java
// C:\licence-server\backend\src\main\java\com\licence\dto\VerifyRequest.java
package com.licence.dto;

import lombok.Data;

@Data
public class VerifyRequest {
    private String token;
    private String machineId;
    private String app;
}
```

```java
// C:\licence-server\backend\src\main\java\com\licence\dto\VerifyResponse.java
package com.licence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResponse {
    private boolean valid;
    private String expiration;  // "2026-12-31" or null
    private String reason;      // "REVOKED", "EXPIRED", "WRONG_MACHINE", "NOT_FOUND", null
}
```

```java
// C:\licence-server\backend\src\main\java\com\licence\dto\LicenceRequest.java
package com.licence.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LicenceRequest {
    private String appName;
    private String clientName;
    private String machineId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
}
```

- [ ] **Step 2: Create LicenceService.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\service\LicenceService.java
package com.licence.service;

import com.licence.dto.LicenceRequest;
import com.licence.dto.VerifyRequest;
import com.licence.dto.VerifyResponse;
import com.licence.entity.Licence;
import com.licence.repository.LicenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LicenceService {

    private final LicenceRepository repo;

    public VerifyResponse verify(VerifyRequest req) {
        Optional<Licence> opt = repo.findByToken(req.getToken());
        if (opt.isEmpty()) {
            return new VerifyResponse(false, null, "NOT_FOUND");
        }
        Licence l = opt.get();
        if (!l.getActive()) {
            return new VerifyResponse(false, null, "REVOKED");
        }
        if (l.getDateFin().isBefore(LocalDate.now())) {
            return new VerifyResponse(false, null, "EXPIRED");
        }
        if (!l.getMachineId().equals(req.getMachineId())) {
            return new VerifyResponse(false, null, "WRONG_MACHINE");
        }
        return new VerifyResponse(true, l.getDateFin().toString(), null);
    }

    public List<Licence> findAll() {
        return repo.findAll();
    }

    public Licence create(LicenceRequest req) {
        Licence l = new Licence();
        l.setToken(UUID.randomUUID().toString());
        l.setAppName(req.getAppName());
        l.setClientName(req.getClientName());
        l.setMachineId(req.getMachineId());
        l.setDateDebut(req.getDateDebut());
        l.setDateFin(req.getDateFin());
        l.setActive(true);
        return repo.save(l);
    }

    public Licence revoke(Long id) {
        Licence l = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Licence non trouvée: " + id));
        l.setActive(false);
        return repo.save(l);
    }

    public Licence renew(Long id, LocalDate newDateFin) {
        Licence l = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Licence non trouvée: " + id));
        l.setDateFin(newDateFin);
        l.setActive(true);
        return repo.save(l);
    }
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd C:\licence-server\backend
mvn compile -q
```
Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add LicenceService with verify/create/revoke/renew"
```

---

## Task 4: VerifyController + test

**Files:**
- Create: `C:\licence-server\backend\src\main\java\com\licence\controller\VerifyController.java`
- Create: `C:\licence-server\backend\src\test\java\com\licence\VerifyControllerTest.java`

- [ ] **Step 1: Write the failing test**

```java
// C:\licence-server\backend\src\test\java\com\licence\VerifyControllerTest.java
package com.licence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licence.dto.LicenceRequest;
import com.licence.dto.VerifyRequest;
import com.licence.entity.Licence;
import com.licence.repository.LicenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VerifyControllerTest {

    @Autowired MockMvc mvc;
    @Autowired LicenceRepository repo;
    @Autowired ObjectMapper mapper;

    @BeforeEach
    void setup() { repo.deleteAll(); }

    @Test
    void verifyValid() throws Exception {
        Licence l = new Licence();
        l.setToken("test-token-123");
        l.setAppName("permis");
        l.setClientName("Client Test");
        l.setMachineId("abc123");
        l.setDateDebut(LocalDate.now().minusDays(1));
        l.setDateFin(LocalDate.now().plusYears(1));
        l.setActive(true);
        repo.save(l);

        VerifyRequest req = new VerifyRequest();
        req.setToken("test-token-123");
        req.setMachineId("abc123");
        req.setApp("permis");

        mvc.perform(post("/api/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valid").value(true))
            .andExpect(jsonPath("$.expiration").exists());
    }

    @Test
    void verifyRevoked() throws Exception {
        Licence l = new Licence();
        l.setToken("revoked-token");
        l.setAppName("permis");
        l.setClientName("Client Test");
        l.setMachineId("abc123");
        l.setDateDebut(LocalDate.now().minusDays(1));
        l.setDateFin(LocalDate.now().plusYears(1));
        l.setActive(false);
        repo.save(l);

        VerifyRequest req = new VerifyRequest();
        req.setToken("revoked-token");
        req.setMachineId("abc123");
        req.setApp("permis");

        mvc.perform(post("/api/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valid").value(false))
            .andExpect(jsonPath("$.reason").value("REVOKED"));
    }

    @Test
    void verifyWrongMachine() throws Exception {
        Licence l = new Licence();
        l.setToken("machine-token");
        l.setAppName("permis");
        l.setClientName("Client Test");
        l.setMachineId("correct-machine");
        l.setDateDebut(LocalDate.now().minusDays(1));
        l.setDateFin(LocalDate.now().plusYears(1));
        l.setActive(true);
        repo.save(l);

        VerifyRequest req = new VerifyRequest();
        req.setToken("machine-token");
        req.setMachineId("wrong-machine");
        req.setApp("permis");

        mvc.perform(post("/api/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valid").value(false))
            .andExpect(jsonPath("$.reason").value("WRONG_MACHINE"));
    }

    @Test
    void verifyNotFound() throws Exception {
        VerifyRequest req = new VerifyRequest();
        req.setToken("nonexistent");
        req.setMachineId("abc123");
        req.setApp("permis");

        mvc.perform(post("/api/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valid").value(false))
            .andExpect(jsonPath("$.reason").value("NOT_FOUND"));
    }
}
```

- [ ] **Step 2: Create application-test.properties**

```properties
# C:\licence-server\backend\src\test\resources\application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd C:\licence-server\backend
mvn test -Dtest=VerifyControllerTest -q 2>&1 | tail -5
```
Expected: `FAILED` — VerifyController does not exist yet.

- [ ] **Step 4: Create VerifyController.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\controller\VerifyController.java
package com.licence.controller;

import com.licence.dto.VerifyRequest;
import com.licence.dto.VerifyResponse;
import com.licence.service.LicenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class VerifyController {

    private final LicenceService service;

    @PostMapping("/api/verify")
    public VerifyResponse verify(@RequestBody VerifyRequest req) {
        return service.verify(req);
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd C:\licence-server\backend
mvn test -Dtest=VerifyControllerTest -q 2>&1 | tail -5
```
Expected: `Tests run: 4, Failures: 0, Errors: 0`

- [ ] **Step 6: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add VerifyController with 4 passing tests"
```

---

## Task 5: AdminController + test

**Files:**
- Create: `C:\licence-server\backend\src\main\java\com\licence\controller\AdminController.java`
- Create: `C:\licence-server\backend\src\test\java\com\licence\AdminControllerTest.java`

- [ ] **Step 1: Write the failing test**

```java
// C:\licence-server\backend\src\test\java\com\licence\AdminControllerTest.java
package com.licence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.licence.dto.LicenceRequest;
import com.licence.repository.LicenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired MockMvc mvc;
    @Autowired LicenceRepository repo;
    @Autowired ObjectMapper mapper;

    @BeforeEach
    void setup() { repo.deleteAll(); }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createAndListLicence() throws Exception {
        LicenceRequest req = new LicenceRequest();
        req.setAppName("permis");
        req.setClientName("École ABC");
        req.setMachineId("machine001");
        req.setDateDebut(LocalDate.now());
        req.setDateFin(LocalDate.now().plusYears(1));

        mvc.perform(post("/api/admin/licences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").exists())
            .andExpect(jsonPath("$.clientName").value("École ABC"));

        mvc.perform(get("/api/admin/licences"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void revokeLicence() throws Exception {
        LicenceRequest req = new LicenceRequest();
        req.setAppName("permis");
        req.setClientName("Client");
        req.setMachineId("m1");
        req.setDateDebut(LocalDate.now());
        req.setDateFin(LocalDate.now().plusYears(1));

        String body = mvc.perform(post("/api/admin/licences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andReturn().getResponse().getContentAsString();

        Long id = mapper.readTree(body).get("id").asLong();

        mvc.perform(put("/api/admin/licences/" + id + "/revoke"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void listRequiresAuth() throws Exception {
        mvc.perform(get("/api/admin/licences"))
            .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:\licence-server\backend
mvn test -Dtest=AdminControllerTest -q 2>&1 | tail -5
```
Expected: `FAILED` — AdminController does not exist yet.

- [ ] **Step 3: Create AdminController.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\controller\AdminController.java
package com.licence.controller;

import com.licence.dto.LicenceRequest;
import com.licence.entity.Licence;
import com.licence.service.LicenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final LicenceService service;

    @GetMapping("/licences")
    public List<Licence> list() {
        return service.findAll();
    }

    @PostMapping("/licences")
    public Licence create(@RequestBody LicenceRequest req) {
        return service.create(req);
    }

    @PutMapping("/licences/{id}/revoke")
    public Licence revoke(@PathVariable Long id) {
        return service.revoke(id);
    }

    @PutMapping("/licences/{id}/renew")
    public Licence renew(@PathVariable Long id, @RequestParam String dateFin) {
        return service.renew(id, LocalDate.parse(dateFin));
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd C:\licence-server\backend
mvn test -Dtest=AdminControllerTest -q 2>&1 | tail -5
```
Expected: `Tests run: 3, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add AdminController with 3 passing tests"
```

---

## Task 6: Security configuration

**Files:**
- Create: `C:\licence-server\backend\src\main\java\com\licence\config\SecurityConfig.java`

- [ ] **Step 1: Create SecurityConfig.java**

```java
// C:\licence-server\backend\src\main\java\com\licence\config\SecurityConfig.java
package com.licence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/verify").permitAll()
                .requestMatchers("/", "/index.html", "/assets/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {});
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
            User.builder()
                .username(adminUsername)
                .password(encoder.encode(adminPassword))
                .roles("ADMIN")
                .build()
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 2: Run all tests**

```bash
cd C:\licence-server\backend
mvn test -q 2>&1 | tail -5
```
Expected: `Tests run: 7, Failures: 0, Errors: 0`

- [ ] **Step 3: Start server and test manually**

```bash
cd C:\licence-server\backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.datasource.url=jdbc:h2:file:./data/licences"
```

In another terminal:
```bash
curl -s -X POST http://localhost:8085/api/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"x","machineId":"y","app":"permis"}'
```
Expected: `{"valid":false,"expiration":null,"reason":"NOT_FOUND"}`

```bash
curl -s -u admin:123 http://localhost:8085/api/admin/licences
```
Expected: `[]`

Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add security config — /api/verify public, /api/admin/* requires Basic auth"
```

---

## Task 7: Bootstrap React frontend

**Files:**
- Create: `C:\licence-server\frontend\` (Vite React TS project)
- Create: `C:\licence-server\frontend\src\types.ts`
- Create: `C:\licence-server\frontend\vite.config.ts`

- [ ] **Step 1: Scaffold React project**

```bash
cd C:\licence-server
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

- [ ] **Step 2: Replace vite.config.ts**

```typescript
// C:\licence-server\frontend\vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../backend/src/main/resources/static',
    emptyOutDir: true,
  }
})
```

- [ ] **Step 3: Create types.ts**

```typescript
// C:\licence-server\frontend\src\types.ts
export interface Licence {
  id: number;
  token: string;
  appName: string;
  clientName: string;
  machineId: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  createdAt: string;
}

export interface LicenceRequest {
  appName: string;
  clientName: string;
  machineId: string;
  dateDebut: string;
  dateFin: string;
}
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd C:\licence-server\frontend
npm run dev
```
Expected: `Local: http://localhost:5173/` — Vite default page visible in browser. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "chore: bootstrap React frontend with Vite proxy to port 8085"
```

---

## Task 8: API layer

**Files:**
- Create: `C:\licence-server\frontend\src\api\licenceApi.ts`

- [ ] **Step 1: Create licenceApi.ts**

```typescript
// C:\licence-server\frontend\src\api\licenceApi.ts
import axios from 'axios';
import type { Licence, LicenceRequest } from '../types';

const auth = { username: 'admin', password: '123' };

export const getAllLicences = (): Promise<Licence[]> =>
  axios.get<Licence[]>('/api/admin/licences', { auth }).then(r => r.data);

export const createLicence = (req: LicenceRequest): Promise<Licence> =>
  axios.post<Licence>('/api/admin/licences', req, { auth }).then(r => r.data);

export const revokeLicence = (id: number): Promise<Licence> =>
  axios.put<Licence>(`/api/admin/licences/${id}/revoke`, {}, { auth }).then(r => r.data);

export const renewLicence = (id: number, dateFin: string): Promise<Licence> =>
  axios.put<Licence>(`/api/admin/licences/${id}/renew?dateFin=${dateFin}`, {}, { auth }).then(r => r.data);
```

- [ ] **Step 2: Install axios**

```bash
cd C:\licence-server\frontend
npm install axios
```

- [ ] **Step 3: Verify build compiles**

```bash
cd C:\licence-server\frontend
npm run build 2>&1 | tail -5
```
Expected: `✓ built in ...` (warning about empty App.tsx is OK)

- [ ] **Step 4: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add licenceApi.ts"
```

---

## Task 9: LicencesPage

**Files:**
- Create: `C:\licence-server\frontend\src\pages\LicencesPage.tsx`
- Modify: `C:\licence-server\frontend\src\App.tsx`

- [ ] **Step 1: Create LicencesPage.tsx**

```tsx
// C:\licence-server\frontend\src\pages\LicencesPage.tsx
import { useEffect, useState } from 'react';
import { getAllLicences, revokeLicence, renewLicence } from '../api/licenceApi';
import type { Licence } from '../types';
import LicenceFormModal from './modals/LicenceFormModal';

const statusColor = (l: Licence) => {
  if (!l.active) return { bg: '#ffebee', color: '#c62828', label: 'Révoqué' };
  if (new Date(l.dateFin) < new Date()) return { bg: '#fff3e0', color: '#e65100', label: 'Expiré' };
  return { bg: '#e8f5e9', color: '#2e7d32', label: 'Actif' };
};

export default function LicencesPage() {
  const [licences, setLicences] = useState<Licence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [renewId, setRenewId] = useState<number | null>(null);
  const [renewDate, setRenewDate] = useState('');

  const load = () => getAllLicences().then(setLicences);
  useEffect(() => { load(); }, []);

  const handleRevoke = async (id: number) => {
    if (!confirm('Révoquer cette licence ?')) return;
    await revokeLicence(id);
    load();
  };

  const handleRenew = async () => {
    if (!renewId || !renewDate) return;
    await renewLicence(renewId, renewDate);
    setRenewId(null);
    setRenewDate('');
    load();
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Licences</h2>
        <button onClick={() => setShowForm(true)}
          style={{ background: '#1a237e', color: 'white', border: 'none',
                   padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          + Nouvelle licence
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff',
                      borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            {['Client', 'App', 'Machine ID', 'Début', 'Fin', 'Statut', 'Token', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11,
                                   color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {licences.map(l => {
            const s = statusColor(l);
            return (
              <tr key={l.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>{l.clientName}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>
                  <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 8px',
                                 borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{l.appName}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                  {l.machineId.substring(0, 12)}...
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{l.dateDebut}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{l.dateFin}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: s.bg, color: s.color, padding: '2px 8px',
                                 borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(l.token); alert('Token copié !'); }}
                    style={{ background: 'none', border: '1px solid #bbb', padding: '2px 8px',
                             borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    📋 Copier
                  </button>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  {l.active && (
                    <button onClick={() => handleRevoke(l.id)}
                      style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f',
                               padding: '2px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Révoquer
                    </button>
                  )}
                  <button onClick={() => { setRenewId(l.id); setRenewDate(l.dateFin); }}
                    style={{ background: 'none', border: '1px solid #1976d2', color: '#1976d2',
                             padding: '2px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Renouveler
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {renewId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 320 }}>
            <h3 style={{ margin: '0 0 16px' }}>Renouveler la licence</h3>
            <label style={{ fontSize: 13, color: '#555' }}>Nouvelle date de fin</label>
            <input type="date" value={renewDate} onChange={e => setRenewDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd',
                       borderRadius: 6, fontSize: 14, marginTop: 6, marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setRenewId(null)}
                style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={handleRenew}
                style={{ padding: '8px 16px', background: '#1976d2', color: '#fff',
                         border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <LicenceFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace App.tsx**

```tsx
// C:\licence-server\frontend\src\App.tsx
import LicencesPage from './pages/LicencesPage';

export default function App() {
  return <LicencesPage />;
}
```

- [ ] **Step 3: Verify build**

```bash
cd C:\licence-server\frontend
npm run build 2>&1 | tail -5
```
Expected: `✓ built in ...` (will fail on missing LicenceFormModal — that's OK for now, we'll add it next)

Actually, stop — create a stub first so build passes:

```tsx
// C:\licence-server\frontend\src\pages\modals\LicenceFormModal.tsx  (STUB)
export default function LicenceFormModal(_: { onClose: () => void; onSaved: () => void }) {
  return null;
}
```

Re-run build:
```bash
npm run build 2>&1 | tail -3
```
Expected: `✓ built in ...`

- [ ] **Step 4: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add LicencesPage with list, revoke, renew"
```

---

## Task 10: LicenceFormModal

**Files:**
- Modify: `C:\licence-server\frontend\src\pages\modals\LicenceFormModal.tsx`

- [ ] **Step 1: Replace stub with full modal**

```tsx
// C:\licence-server\frontend\src\pages\modals\LicenceFormModal.tsx
import { useState } from 'react';
import { createLicence } from '../../api/licenceApi';
import type { LicenceRequest } from '../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const APPS = ['permis', 'cantine', 'gestionmagasin'];

export default function LicenceFormModal({ onClose, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState<LicenceRequest>({
    appName: 'permis',
    clientName: '',
    machineId: '',
    dateDebut: today,
    dateFin: nextYear,
  });
  const [saving, setSaving] = useState(false);

  const set = (field: keyof LicenceRequest, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const save = async () => {
    if (!form.clientName || !form.machineId) return alert('Remplissez tous les champs obligatoires.');
    setSaving(true);
    try {
      await createLicence(form);
      onSaved();
    } catch {
      alert('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof LicenceRequest, type = 'text') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>{label}</label>
      <input type={type} value={form[key] as string} onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd',
                 borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 420, maxWidth: '95vw',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '16px 24px', background: '#1a237e', color: '#fff',
                      borderRadius: '12px 12px 0 0', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Nouvelle licence</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Application</label>
            <select value={form.appName} onChange={e => set('appName', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd',
                       borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}>
              {APPS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {field('Nom du client *', 'clientName')}
          {field('Machine ID * (SHA256 de la MAC)', 'machineId')}
          {field('Date début', 'dateDebut', 'date')}
          {field('Date fin', 'dateFin', 'date')}
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid #eee',
                      display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose}
            style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: 6,
                     cursor: 'pointer', background: 'white', fontSize: 14 }}>
            Annuler
          </button>
          <button onClick={save} disabled={saving}
            style={{ padding: '8px 24px', background: '#1a237e', color: '#fff',
                     border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Création...' : '+ Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build frontend**

```bash
cd C:\licence-server\frontend
npm run build 2>&1 | tail -3
```
Expected: `✓ built in ...`

This copies the built files to `C:\licence-server\backend\src\main\resources\static\`.

- [ ] **Step 3: Test end-to-end manually**

Start Spring Boot:
```bash
cd C:\licence-server\backend
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.datasource.url=jdbc:h2:file:./data/licences"
```
Open `http://localhost:8085` — the admin panel should appear. Create a licence. Verify it appears in the list.

Stop the server.

- [ ] **Step 4: Run all backend tests**

```bash
cd C:\licence-server\backend
mvn test -q 2>&1 | tail -5
```
Expected: `Tests run: 7, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: complete admin panel — create/revoke/renew licences"
```

---

## Task 11: LicenceChecker SDK

**Files:**
- Create: `C:\licence-server\sdk\LicenceChecker.java`

- [ ] **Step 1: Create LicenceChecker.java**

```java
// C:\licence-server\sdk\LicenceChecker.java
// SDK à copier dans tout projet JAR à protéger.
// Dépendances : aucune (Java 11+ standard library uniquement)
// Usage : appeler LicenceChecker.check() au démarrage de main().

import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Enumeration;
import javax.crypto.*;
import javax.crypto.spec.*;
import java.util.Base64;

public class LicenceChecker {

    private static final String LICENCE_SERVER = "https://licence.infserv.ca/api/verify";
    private static final String APP_NAME = "permis"; // ← changer par nom de l'app
    private static final int OFFLINE_TOLERANCE_DAYS = 15;
    private static final String CACHE_FILE = ".licence_cache";
    private static final String KEY_FILE = "licence.key";

    public static void check() {
        String token = readToken();
        if (token == null) {
            showMachineId();
            System.exit(1);
        }

        String machineId = getMachineId();
        CacheData cache = readCache(machineId);

        // Cache valide et récent : démarrer sans appel réseau
        if (cache != null && cache.daysSinceVerified() <= OFFLINE_TOLERANCE_DAYS
                && LocalDate.parse(cache.expiration).isAfter(LocalDate.now())) {
            return; // OK
        }

        // Appel réseau
        try {
            String result = verify(token, machineId);
            if (result.contains("\"valid\":true")) {
                String expiration = extractJson(result, "expiration");
                writeCache(machineId, expiration);
                return; // OK
            } else {
                String reason = extractJson(result, "reason");
                System.err.println("[LICENCE] Accès refusé. Raison : " + reason);
                System.exit(1);
            }
        } catch (Exception e) {
            // Réseau indisponible
            if (cache != null && cache.daysSinceVerified() <= OFFLINE_TOLERANCE_DAYS) {
                System.out.println("[LICENCE] Mode hors-ligne (" + cache.daysSinceVerified() + " jours restants).");
                return; // OK offline
            }
            System.err.println("[LICENCE] Connexion impossible et cache expiré (> " + OFFLINE_TOLERANCE_DAYS + " jours).");
            System.exit(1);
        }
    }

    private static String readToken() {
        try {
            Path p = Path.of(KEY_FILE);
            if (!Files.exists(p)) return null;
            return Files.readString(p).trim();
        } catch (Exception e) { return null; }
    }

    private static void showMachineId() {
        System.err.println("==============================================");
        System.err.println("LICENCE MANQUANTE");
        System.err.println("Envoyez ce Machine ID à votre fournisseur :");
        System.err.println(getMachineId());
        System.err.println("==============================================");
    }

    public static String getMachineId() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface ni = interfaces.nextElement();
                byte[] mac = ni.getHardwareAddress();
                if (mac != null && mac.length > 0) {
                    StringBuilder sb = new StringBuilder();
                    for (byte b : mac) sb.append(String.format("%02x", b));
                    return sha256(sb.toString());
                }
            }
        } catch (Exception ignored) {}
        return sha256("fallback-" + System.getProperty("user.name"));
    }

    private static String verify(String token, String machineId) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(5))
            .build();
        String body = "{\"token\":\"" + token + "\",\"machineId\":\"" + machineId + "\",\"app\":\"" + APP_NAME + "\"}";
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(LICENCE_SERVER))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .timeout(java.time.Duration.ofSeconds(5))
            .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
    }

    // --- Cache chiffré AES ---

    private static CacheData readCache(String machineId) {
        try {
            Path p = Path.of(CACHE_FILE);
            if (!Files.exists(p)) return null;
            byte[] encrypted = Files.readAllBytes(p);
            String json = decrypt(encrypted, machineId);
            String lastVerified = extractJson(json, "lastVerified");
            String expiration = extractJson(json, "expiration");
            return new CacheData(lastVerified, expiration);
        } catch (Exception e) { return null; }
    }

    private static void writeCache(String machineId, String expiration) {
        try {
            String json = "{\"lastVerified\":\"" + LocalDate.now() + "\",\"expiration\":\"" + expiration + "\"}";
            byte[] encrypted = encrypt(json, machineId);
            Files.write(Path.of(CACHE_FILE), encrypted);
        } catch (Exception ignored) {}
    }

    private static byte[] encrypt(String data, String machineId) throws Exception {
        SecretKeySpec key = deriveKey(machineId);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        byte[] result = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(encrypted, 0, result, iv.length, encrypted.length);
        return result;
    }

    private static String decrypt(byte[] data, String machineId) throws Exception {
        SecretKeySpec key = deriveKey(machineId);
        byte[] iv = new byte[16];
        byte[] encrypted = new byte[data.length - 16];
        System.arraycopy(data, 0, iv, 0, 16);
        System.arraycopy(data, 16, encrypted, 0, encrypted.length);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
    }

    private static SecretKeySpec deriveKey(String machineId) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(
            (machineId + "licence-salt-infserv").getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(hash, "AES");
    }

    private static String sha256(String input) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                .digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { return input; }
    }

    private static String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start < 0) return "";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end < 0 ? "" : json.substring(start, end);
    }

    record CacheData(String lastVerified, String expiration) {
        long daysSinceVerified() {
            return ChronoUnit.DAYS.between(LocalDate.parse(lastVerified), LocalDate.now());
        }
    }
}
```

- [ ] **Step 2: Verify it compiles standalone**

```bash
cd C:\licence-server\sdk
javac LicenceChecker.java
```
Expected: no errors, `LicenceChecker.class` created.

- [ ] **Step 3: Test offline mode (no server)**

```bash
cd C:\licence-server\sdk
java -cp . LicenceChecker
```
(Add a `main` temporarily for testing:)
```java
public static void main(String[] args) {
    System.out.println("Machine ID: " + getMachineId());
}
```
Expected: prints a 64-char hex string.

Remove the test `main` after verifying.

- [ ] **Step 4: Document usage in README**

Create `C:\licence-server\sdk\README.md`:
```markdown
# LicenceChecker SDK

## Intégration dans une app Spring Boot

1. Copier `LicenceChecker.java` dans `src/main/java/com/votrenom/`
2. Changer `APP_NAME` ligne 14 par le nom de l'app (`"permis"`, `"cantine"`, etc.)
3. Appeler au début de `main()` :
   ```java
   LicenceChecker.check();
   ```
4. Livrer le JAR SANS `licence.key`. Le client voit son Machine ID au 1er lancement.
5. Créer la licence sur licence.infserv.ca avec ce Machine ID.
6. Envoyer `licence.key` au client (texte brut avec le token UUID).
```

- [ ] **Step 5: Commit**

```bash
cd C:\licence-server
git add .
git commit -m "feat: add LicenceChecker SDK with AES cache and 15-day offline tolerance"
```

---

## Task 12: Docker + déploiement

**Files:**
- Create: `C:\licence-server\Dockerfile`
- Create: `C:\licence-server\docker-compose.yml`
- Create: `C:\licence-server\.github\workflows\deploy.yml`
- Create: `C:\licence-server\.gitignore`

- [ ] **Step 1: Create .gitignore**

```gitignore
# C:\licence-server\.gitignore
backend/target/
backend/data/
frontend/node_modules/
frontend/dist/
*.class
.licence_cache
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
# C:\licence-server\Dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -q
COPY backend/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.datasource.url=jdbc:h2:file:/data/licences"]
```

- [ ] **Step 3: Create docker-compose.yml**

```yaml
# C:\licence-server\docker-compose.yml
services:
  licence:
    build: .
    ports:
      - "8085:8085"
    volumes:
      - /opt/licence/data:/data
    restart: unless-stopped
```

- [ ] **Step 4: Build React before Docker build**

```bash
cd C:\licence-server\frontend
npm run build
cd ..
```
Verify: `C:\licence-server\backend\src\main\resources\static\index.html` exists.

- [ ] **Step 5: Build Maven JAR (test)**

```bash
cd C:\licence-server\backend
mvn package -DskipTests -q
ls target/*.jar
```
Expected: `target/licence-server-1.0.0.jar`

- [ ] **Step 6: Create GitHub Actions deploy.yml**

```yaml
# C:\licence-server\.github\workflows\deploy.yml
name: Deploy Licence Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build React
        run: |
          cd frontend
          npm ci
          npm run build

      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build JAR
        run: |
          cd backend
          mvn package -DskipTests -q

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.LICENCE_HOST }}
          username: root
          password: ${{ secrets.LICENCE_SSH_PASSWORD }}
          script: |
            cd /opt/licence
            git pull origin main
            cd frontend && npm ci && npm run build && cd ..
            cd backend && mvn package -DskipTests -q && cd ..
            docker compose build --no-cache
            docker compose up -d
```

- [ ] **Step 7: Créer le repo GitHub et push**

```bash
cd C:\licence-server
git remote add origin https://github.com/lenoro/licence-server.git
git push -u origin main
```

- [ ] **Step 8: Configurer le VPS**

SSH sur le VPS et exécuter :
```bash
mkdir -p /opt/licence/data
cd /opt/licence
git clone https://github.com/lenoro/licence-server.git .
cd frontend && npm ci && npm run build && cd ..
docker compose build
docker compose up -d
```

Ajouter dans `/etc/nginx/sites-available/licence.infserv.ca` :
```nginx
server {
    server_name licence.infserv.ca;
    location / {
        proxy_pass http://localhost:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/licence.infserv.ca /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d licence.infserv.ca
```

DNS : ajouter enregistrement A `licence` → `72.62.168.1` chez Hostinger.

- [ ] **Step 9: Ajouter secrets GitHub**

Dans le repo GitHub → Settings → Secrets → Actions :
- `LICENCE_HOST` = `licence.infserv.ca`
- `LICENCE_SSH_PASSWORD` = mot de passe root VPS

- [ ] **Step 10: Run all backend tests une dernière fois**

```bash
cd C:\licence-server\backend
mvn test -q 2>&1 | tail -5
```
Expected: `Tests run: 7, Failures: 0, Errors: 0`

- [ ] **Step 11: Commit final**

```bash
cd C:\licence-server
git add .
git commit -m "chore: add Dockerfile, docker-compose and GitHub Actions deploy"
git push
```

---

## Résumé des fichiers créés

| Fichier | Rôle |
|---------|------|
| `backend/src/.../entity/Licence.java` | Entité JPA |
| `backend/src/.../repository/LicenceRepository.java` | Requêtes JPA |
| `backend/src/.../service/LicenceService.java` | Logique verify/create/revoke/renew |
| `backend/src/.../controller/VerifyController.java` | POST /api/verify (public) |
| `backend/src/.../controller/AdminController.java` | CRUD admin (Basic auth) |
| `backend/src/.../config/SecurityConfig.java` | Sécurité Spring |
| `frontend/src/api/licenceApi.ts` | Appels API |
| `frontend/src/pages/LicencesPage.tsx` | Liste + actions |
| `frontend/src/pages/modals/LicenceFormModal.tsx` | Création licence |
| `sdk/LicenceChecker.java` | SDK à intégrer dans chaque JAR |
| `Dockerfile` + `docker-compose.yml` | Déploiement |
