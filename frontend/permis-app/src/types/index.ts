export type StatutDossier = 'INCOMPLET' | 'EN_COURS' | 'VALIDE' | 'ARCHIVE';
export type TypeEpreuve = 'CODE' | 'CRENEAU' | 'CONDUITE';
export type ResultatExamen = 'ADMIS' | 'AJOURNE' | 'ABSENT';
export type ModePaiement = 'Espèces' | 'Chèque' | 'CCP';
export type StatutExamen = 'PLANIFIE' | 'REALISE' | 'ANNULE';

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
  photoPath?: string;
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
  candidat?: { id: number; nom: string; prenom: string };
  typeEpreuve: TypeEpreuve;
  dateExamen?: string;
  resultat?: ResultatExamen;
  observation?: string;
  statut?: StatutExamen;
}

export interface Paiement {
  id?: number;
  candidat?: { id: number; nom: string; prenom: string };
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
