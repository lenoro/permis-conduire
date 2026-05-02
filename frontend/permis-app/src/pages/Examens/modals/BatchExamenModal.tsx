import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addBatchExamen } from '../../../api/examenApi';
import type { Candidat } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function BatchExamenModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [typeEpreuve, setTypeEpreuve] = useState<'CODE' | 'CRENEAU' | 'CONDUITE'>('CODE');
  const [dateExamen, setDateExamen] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    getCandidats().then(setCandidats);
  }, []);

  const toggle = (id: number | undefined) => {
    if (id === undefined) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return alert('Sélectionner au moins un candidat');
    if (!dateExamen) return alert('Saisir une date');
    await addBatchExamen({ candidatIds: [...selected], typeEpreuve, dateExamen, observation });
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 560, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Planifier un examen en lot</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Type épreuve</label>
              <select value={typeEpreuve} onChange={e => setTypeEpreuve(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="CODE">CODE</option>
                <option value="CRENEAU">CRÉNEAU</option>
                <option value="CONDUITE">CONDUITE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Date et heure</label>
              <input type="datetime-local" value={dateExamen} onChange={e => setDateExamen(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Observation</label>
              <input value={observation} onChange={e => setObservation(e.target.value)} placeholder="Optionnel"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', color: '#666' }}>
              Candidats ({candidats.length} disponibles)
            </label>
            <div style={{ border: '1px solid #ddd', borderRadius: 4, maxHeight: 200, overflowY: 'auto' }}>
              {candidats.map(c => (
                <div key={c.id} onClick={() => toggle(c.id)}
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: c.id !== undefined && selected.has(c.id) ? '#e8f0fe' : 'white' }}>
                  <input type="checkbox" checked={c.id !== undefined && selected.has(c.id)} onChange={() => toggle(c.id)} />
                  <span>{c.nom} {c.prenom}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#999' }}>{c.statutDossier}</span>
                </div>
              ))}
              {candidats.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>Aucun candidat disponible</div>}
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: 'white' }}>Fermer</button>
          <button onClick={handleConfirm} disabled={selected.size === 0}
            style={{ padding: '8px 16px', background: selected.size === 0 ? '#aaa' : '#388e3c', color: 'white', border: 'none', borderRadius: 4, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
            Confirmer ({selected.size} candidat{selected.size !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}
