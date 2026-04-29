import axios from 'axios';
import type { Paiement } from '../types';

const auth = { username: 'admin', password: '123' };

export const getAllPaiements = () =>
  axios.get<Paiement[]>('/api/paiements', { auth }).then(r => r.data);

export const getPaiements = (candidatId: number) =>
  axios.get<Paiement[]>(`/api/candidats/${candidatId}/paiements`, { auth })
    .then(r => r.data);

export const addPaiement = (candidatId: number, p: Paiement) =>
  axios.post<Paiement>(`/api/candidats/${candidatId}/paiements`, p, { auth })
    .then(r => r.data);

export const deletePaiement = (id: number) =>
  axios.delete(`/api/paiements/${id}`, { auth });
