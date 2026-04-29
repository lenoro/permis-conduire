import axios from 'axios';
import { StatutsEtat } from '../types';

const auth = { username: 'admin', password: '123' };

export const getStatuts = () =>
  axios.get<StatutsEtat>('http://localhost:8080/api/etats/statuts', { auth }).then(r => r.data);

export const getExamensStats = () =>
  axios.get<Record<string, { total: number; admis: number; taux: number }>>(
    'http://localhost:8080/api/etats/examens', { auth }
  ).then(r => r.data);
