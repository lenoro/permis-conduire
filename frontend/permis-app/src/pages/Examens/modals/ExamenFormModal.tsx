import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addExamen } from '../../../api/examenApi';
import type { Candidat } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function ExamenFormModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [candidatId, setCandidatId] = useState('');
  const [typeEpreuve, setTypeEpreuve] = useState<'CODE' | 'CRENEAU' | 'CONDUITE'>('CODE');
  const [dateExamen, setDateExamen] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => { getCandidats().then(setCandidats); }, []);

  const handleSave = async () => {
    if (!candidatId) return alert('Sélectionner un candidat');
    if (!dateExamen) return alert('Saisir une date');
    await addExamen(Number(candidatId), { typeEpreuve, dateExamen, observation });
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 480, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Nouvel examen</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Candidat</label>
            <select value={candidatId} onChange={e => setCandidatId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">— Sélectionner —</option>
              {candidats.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
            </select>
          </div>
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: 'white' }}>Annuler</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
