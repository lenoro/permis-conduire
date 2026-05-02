import axios from 'axios';
import type { Candidat } from '../types';

const BASE = '/api/candidats';
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

export const uploadPhoto = (id: number, file: File): Promise<Candidat> => {
  const form = new FormData();
  form.append('file', file);
  return axios.post<Candidat>(`${BASE}/${id}/photo`, form, { auth }).then(r => r.data);
};

export const getPhotoUrl = (id: number): string =>
  `/api/candidats/${id}/photo`;
