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
