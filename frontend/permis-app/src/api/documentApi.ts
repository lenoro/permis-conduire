import axios from 'axios';
import { Document } from '../types';

const auth = { username: 'admin', password: '123' };

export const getDocuments = (candidatId: number) =>
  axios.get<Document[]>(`http://localhost:8080/api/candidats/${candidatId}/documents`, { auth })
    .then(r => r.data);

export const addDocument = (candidatId: number, doc: Document) =>
  axios.post<Document>(`http://localhost:8080/api/candidats/${candidatId}/documents`, doc, { auth })
    .then(r => r.data);

export const updateDocument = (id: number, doc: Document) =>
  axios.put<Document>(`http://localhost:8080/api/documents/${id}`, doc, { auth })
    .then(r => r.data);

export const deleteDocument = (id: number) =>
  axios.delete(`http://localhost:8080/api/documents/${id}`, { auth });
