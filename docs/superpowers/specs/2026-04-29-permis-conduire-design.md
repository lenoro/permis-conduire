# Design — Gestion Permis de Conduire

**Date :** 2026-04-29  
**Stack :** React + Vite + TypeScript · Spring Boot 3.2 · PostgreSQL · Docker Compose  
**Structure :** Monorepo (frontend/ + backend/) — identique à GestionMagasin  
**Auth :** Spring Security · admin / 123

---

## Architecture générale

```
permis-conduire/
├── frontend/
│   └── permis-app/
│       ├── src/
│       │   ├── api/           # candidatApi.ts, examenApi.ts, paiementApi.ts, documentApi.ts
│       │   ├── pages/         # Candidats/, Examens/, Paiements/, Etats/
│       │   ├── components/    # Sidebar, TopBar, DataTable, Modal, Badge
│       │   └── types/         # Candidat.ts, Examen.ts, Paiement.ts, Document.ts
│       └── package.json
├── backend/
│   └── src/main/java/com/permis/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── entity/
│       └── dto/
├── docker-compose.yml
└── .github/workflows/         # CI/CD pour infserv (phase 2)
```

**Ports locaux :** frontend :5173 · backend :8080 · PostgreSQL :5432

---

## Modèle de données

### Candidat (entité centrale)
| Champ | Type |
|-------|------|
| id | Long (PK) |
| nom, prenom | String |
| dateNaissance | LocalDate |
| numTelephone | String |
| adresse | String |
| groupeSanguin | String |
| dateInscription | LocalDate |
| categorieVisee | String — "B", "C1", etc. |
| statutDossier | Enum : INCOMPLET, EN_COURS, VALIDE, ARCHIVE |

### Document (1:N → Candidat)
| Champ | Type |
|-------|------|
| id | Long (PK) |
| candidat | FK → Candidat |
| typeDocument | String — "Certificat médical", "Photo", "Résidence"... |
| estFourni | Boolean |
| dateRemise | LocalDate |

### Examen (1:N → Candidat)
| Champ | Type |
|-------|------|
| id | Long (PK) |
| candidat | FK → Candidat |
| typeEpreuve | Enum : CODE, CRENEAU, CONDUITE |
| dateExamen | LocalDateTime |
| resultat | Enum : ADMIS, AJOURNE, ABSENT |
| observation | String |

### Paiement (1:N → Candidat)
| Champ | Type |
|-------|------|
| id | Long (PK) |
| candidat | FK → Candidat |
| montant | Double |
| datePaiement | LocalDate |
| modePaiement | String — Espèces, Chèque, CCP |

---

## Interface utilisateur — Style A (Dashboard + Sidebar)

### Sidebar
- Candidats
- Examens
- Paiements
- États / Rapports
- (Paramètres)

### Page Candidats
- Header : 4 compteurs (Total / Validés / En cours / Incomplets)
- Tableau avec colonnes : Nom/Prénom · Catégorie · Statut dossier · Examens · Solde
- Recherche texte + filtre par statut
- Bouton "Nouveau candidat"
- Clic sur ligne → modal avec 4 onglets :
  - **Infos** : formulaire données personnelles
  - **Documents** : checklist pièces fournies / manquantes
  - **Examens** : historique + ajout nouvel examen
  - **Paiements** : historique + ajout paiement

### Page Examens
- Tableau tous examens, filtrable par type et résultat
- Ajout d'un examen lié à un candidat

### Page Paiements
- Tableau tous paiements
- Solde dû par candidat

### Page États
- Rapport 1 : liste candidats par statut
- Rapport 2 : suivi paiements / soldes dus
- Rapport 3 : résultats examens (taux de réussite par type)
- Impression PDF

---

## API REST

```
POST   /api/auth/login

GET    /api/candidats                  # liste (?statut= pour filtrer)
POST   /api/candidats
GET    /api/candidats/{id}
PUT    /api/candidats/{id}
DELETE /api/candidats/{id}

GET    /api/candidats/{id}/documents
POST   /api/candidats/{id}/documents
PUT    /api/documents/{id}

GET    /api/candidats/{id}/examens
POST   /api/candidats/{id}/examens
GET    /api/examens

GET    /api/candidats/{id}/paiements
POST   /api/candidats/{id}/paiements
GET    /api/paiements

GET    /api/etats/statuts              # compteurs par statut
GET    /api/etats/soldes               # soldes dus par candidat
GET    /api/etats/examens              # taux de réussite
```

---

## Phase 2 — Déploiement infserv

- Domaine : permis.infserv.ca (à créer)
- Docker Compose sur le serveur (PostgreSQL + backend + nginx → frontend)
- CI/CD GitHub Actions identique à GestionMagasin
