import { useEffect, useState } from 'react';
import type { Document } from '../../../types';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../../api/documentApi';

const TYPES_DOCS = ['Certificat médical', "Photo d'identité", 'Justificatif résidence',
                    'Formulaire n°12', 'Copie CNI', 'Extrait naissance'];

export default function DocumentsTab({ candidatId }: { candidatId: number }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [newType, setNewType] = useState(TYPES_DOCS[0]);

  const load = () => getDocuments(candidatId).then(setDocs);
  useEffect(() => { load(); }, [candidatId]);

  const toggle = async (doc: Document) => {
    await updateDocument(doc.id!, { ...doc, estFourni: !doc.estFourni,
      dateRemise: !doc.estFourni ? new Date().toISOString().slice(0, 10) : undefined });
    load();
  };

  const addDoc = async () => {
    await addDocument(candidatId, { typeDocument: newType, estFourni: false });
    load();
  };

  const del = async (id: number) => { await deleteDocument(id); load(); };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={newType} onChange={e => setNewType(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
          {TYPES_DOCS.map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={addDoc}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          + Ajouter
        </button>
      </div>

      {docs.map(doc => (
        <div key={doc.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '12px 16px', background: doc.estFourni ? '#e8f5e9' : '#fff',
                   borderRadius: 8, marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>{doc.estFourni ? '✅' : '⬜'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.typeDocument}</div>
              {doc.dateRemise && <div style={{ fontSize: 11, color: '#888' }}>Remis le {doc.dateRemise}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggle(doc)}
              style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                       cursor: 'pointer', background: doc.estFourni ? '#fff3e0' : '#e8f5e9',
                       color: doc.estFourni ? '#e65100' : '#2e7d32' }}>
              {doc.estFourni ? 'Annuler' : 'Marquer fourni'}
            </button>
            <button onClick={() => del(doc.id!)}
              style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                       cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
