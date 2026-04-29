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
