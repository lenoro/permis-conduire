import { useEffect, useState } from 'react';
import { getCandidats } from '../../../api/candidatApi';
import { addPaiement } from '../../../api/paiementApi';
import type { Candidat, ModePaiement } from '../../../types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function PaiementFormModal({ onClose, onSaved }: Props) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [candidatId, setCandidatId] = useState('');
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState('Espèces');
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { getCandidats().then(setCandidats); }, []);

  const handleSave = async () => {
    if (!candidatId) return alert('Sélectionner un candidat');
    if (!montant || Number(montant) <= 0) return alert('Saisir un montant valide');
    try {
      await addPaiement(Number(candidatId), { montant: Number(montant), modePaiement: modePaiement as ModePaiement, datePaiement });
      onSaved();
    } catch {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: 480, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '14px 20px', fontWeight: 600 }}>Nouveau paiement</div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Candidat</label>
            <select value={candidatId} onChange={e => setCandidatId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">— Sélectionner —</option>
              {candidats.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Montant (DA)</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)} min="0"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Mode</label>
              <select value={modePaiement} onChange={e => setModePaiement(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
                <option>Espèces</option>
                <option>Chèque</option>
                <option>CCP</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Date</label>
              <input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
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
