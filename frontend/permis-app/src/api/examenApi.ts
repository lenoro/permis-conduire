import axios from 'axios';
import type { Examen } from '../types';

const auth = { username: 'admin', password: '123' };

export const getAllExamens = () =>
  axios.get<Examen[]>('/api/examens', { auth }).then(r => r.data);

export const getExamens = (candidatId: number) =>
  axios.get<Examen[]>(`/api/candidats/${candidatId}/examens`, { auth })
    .then(r => r.data);

export const addExamen = (candidatId: number, e: Examen) =>
  axios.post<Examen>(`/api/candidats/${candidatId}/examens`, e, { auth })
    .then(r => r.data);

export const deleteExamen = (id: number) =>
  axios.delete(`/api/examens/${id}`, { auth });
