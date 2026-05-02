# Design — Nouvelles fonctionnalités Permis de Conduire

**Date :** 2026-05-02  
**Approche retenue :** Évolution incrémentale (A)

---

## Contexte

L'application Permis de Conduire est déployée sur https://permis.infserv.ca. Stack : Spring Boot 3.2.5 + PostgreSQL + React 18 TypeScript.

Les pages ExamensPage et PaiementsPage sont actuellement en lecture seule. La création d'examens et paiements se fait uniquement via les onglets du modal candidat. Les nouvelles fonctionnalités demandées sont ajoutées de façon incrémentale sans restructurer le code existant.

---

## Fonctionnalités à implémenter

1. Boutons de création sur ExamensPage et PaiementsPage
2. Planification en lot d'examens (plusieurs candidats en une opération)
3. Historique complet d'un candidat (onglet modal amélioré + page dédiée)
4. Photo du candidat (upload fichier)
5. Notifications simulées (SMS/email enregistrés en DB)
6. Annulation d'examen avec notification automatique

---

## Backend

### 1. Modifications entités existantes

**Candidat — nouveau champ :**
- `photoPath` : `String` nullable — chemin relatif du fichier photo (ex. `photos/candidat_42.jpg`)

**Examen — nouveau champ :**
- `statut` : `Enum { PLANIFIE, REALISE, ANNULE }` — défaut `PLANIFIE`

### 2. Nouvelle entité : `Notification`

```java
@Entity
public class Notification {
    Long id;
    @ManyToOne Candidat candidat;
    Enum type;       // ANNULATION_EXAMEN, MANQUE_PAIEMENT, AUTRE
    Enum canal;      // SMS, EMAIL
    String message;
    LocalDateTime dateEnvoi;
    Enum statut;     // SIMULE (toujours pour l'instant)
}
```

La relation `Candidat` → `Notification` est `OneToMany` (liste dans Candidat, `CascadeType.ALL`).

### 3. Nouveaux endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `POST` | `/api/candidats/{id}/photo` | Upload photo (multipart/form-data) |
| `GET` | `/api/uploads/photos/{filename}` | Servir le fichier photo |
| `POST` | `/api/examens/batch` | Créer un examen pour N candidats |
| `PUT` | `/api/examens/{id}/annuler` | Annuler un examen + notification auto |
| `GET` | `/api/candidats/{id}/notifications` | Liste notifications d'un candidat |
| `POST` | `/api/candidats/{id}/notifications` | Créer notification manuelle |

### 4. Upload de fichiers

- Dossier de stockage : `/opt/permis/uploads/photos/` (VPS) / `./uploads/photos/` (dev)
- Nom de fichier : `candidat_{id}_{timestamp}.{ext}`
- Taille max : 5 MB
- Types acceptés : JPEG, PNG
- Le chemin relatif est sauvegardé dans `Candidat.photoPath`
- `StaticResourceConfig` expose `/api/uploads/**` → dossier physique

### 5. Logique annulation examen

Quand `PUT /api/examens/{id}/annuler` est appelé :
1. `examen.statut` → `ANNULE`
2. Créer une `Notification` pour le candidat de l'examen :
   - type : `ANNULATION_EXAMEN`
   - canal : `SMS`
   - message : `"Votre examen {typeEpreuve} du {dateExamen} a été annulé."`
   - statut : `SIMULE`

### 6. Endpoint batch examen

`POST /api/examens/batch` reçoit :
```json
{
  "candidatIds": [1, 3, 7],
  "typeEpreuve": "CODE",
  "dateExamen": "2026-05-20T09:00:00",
  "observation": "optionnel"
}
```
Crée un `Examen` `PLANIFIE` pour chaque candidat et retourne la liste des examens créés.

---

## Frontend

### 1. ExamensPage (`/examens`)

**Nouveaux éléments :**
- Bouton **"+ Nouvel examen"** → ouvre le modal `ExamenFormModal` (sélection d'un candidat + champs examen)
- Bouton **"+ Planifier en lot"** → ouvre le modal `BatchExamenModal`
- Colonne **Statut** dans le tableau (badge coloré : PLANIFIÉ/RÉALISÉ/ANNULÉ)
- Colonne **Actions** : bouton "Annuler" visible uniquement si `statut === PLANIFIE`
- Nom du candidat cliquable → navigue vers `/candidats/:id/historique`

### 2. PaiementsPage (`/paiements`)

**Nouvel élément :**
- Bouton **"+ Nouveau paiement"** → ouvre un modal `PaiementFormModal` (sélection candidat + champs paiement)
- Nom du candidat cliquable → navigue vers `/candidats/:id/historique`

### 3. Modal `BatchExamenModal`

Champs : type épreuve, date, observation (optionnel).  
Liste scrollable de candidats avec cases à cocher — filtrée sur `statutDossier IN [EN_COURS, INCOMPLET]`.  
Bouton "Confirmer (N candidats)" — désactivé si aucun candidat sélectionné.  
Appelle `POST /api/examens/batch`.

### 4. Page Historique `/candidats/:id/historique`

Nouvelle page avec 3 onglets :
- **Examens** : tableau complet avec statut + résultat + observation + bouton Annuler si PLANIFIÉ
- **Paiements** : tableau avec total encaissé en haut
- **Notifications** : tableau des notifications envoyées

En-tête : nom/prénom du candidat + photo (si disponible) + lien retour vers `/candidats`.

### 5. Modal candidat — onglet Infos (photo)

- Zone photo à gauche du formulaire : affiche la photo si `photoPath` renseigné, sinon placeholder gris
- Bouton "Changer photo" → input file (accept=".jpg,.jpeg,.png", max 5MB) → `POST /api/candidats/{id}/photo`
- Mise à jour immédiate de l'aperçu après upload

### 6. Modal candidat — nouvel onglet Notifications

Ajout d'un 5ème onglet "Notifications" dans `CandidatModal` :
- Formulaire : canal (SMS/EMAIL), type (MANQUE_PAIEMENT / AUTRE), message (textarea)
- Bouton "Envoyer" → `POST /api/candidats/{id}/notifications`
- Tableau des notifications existantes sous le formulaire

### 7. ExamensTab (dans modal candidat)

- Ajout colonne Statut
- Bouton "Annuler" sur les examens PLANIFIÉS (appelle `PUT /api/examens/{id}/annuler`)

---

## Nouvelles routes React Router

```
/candidats/:id/historique   → HistoriqueCandidatPage
```

---

## Nouveaux fichiers

### Backend
- `entity/Notification.java`
- `repository/NotificationRepository.java`
- `service/NotificationService.java`
- `controller/NotificationController.java`
- `controller/UploadController.java`
- `config/StaticResourceConfig.java`

### Frontend
- `pages/Candidats/HistoriqueCandidatPage.tsx`
- `pages/Examens/modals/BatchExamenModal.tsx`
- `pages/Examens/modals/ExamenFormModal.tsx`
- `pages/Paiements/modals/PaiementFormModal.tsx`
- `pages/Candidats/tabs/NotificationsTab.tsx`
- `api/notificationApi.ts`

---

## Fichiers modifiés

### Backend
- `entity/Candidat.java` — ajout `photoPath`, relation Notifications
- `entity/Examen.java` — ajout `statut`
- `controller/ExamenController.java` — endpoints batch + annuler
- `controller/CandidatController.java` — endpoint photo

### Frontend
- `pages/Examens/ExamensPage.tsx` — boutons + colonne statut + actions
- `pages/Paiements/PaiementsPage.tsx` — bouton nouveau paiement
- `pages/Candidats/CandidatModal.tsx` — ajout onglet Notifications
- `pages/Candidats/tabs/InfosTab.tsx` — zone photo
- `pages/Candidats/tabs/ExamensTab.tsx` — colonne statut + bouton annuler
- `types/index.ts` — nouveaux types Notification, StatutExamen
- `App.tsx` — nouvelle route historique
- `api/examenApi.ts` — batch + annuler
- `api/candidatApi.ts` — upload photo

---

## Non inclus dans ce plan

- Envoi réel de SMS ou emails (intégration Twilio/SMTP)
- Authentification par rôle
- Export PDF des notifications
