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
