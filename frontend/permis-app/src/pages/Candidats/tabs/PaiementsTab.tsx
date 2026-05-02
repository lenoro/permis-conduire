import { useEffect, useState } from 'react';
import type { ModePaiement, Paiement } from '../../../types';
import { getPaiements, addPaiement, deletePaiement } from '../../../api/paiementApi';

const MODES = ['Espèces', 'Chèque', 'CCP'];

export default function PaiementsTab({ candidatId }: { candidatId: number }) {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [form, setForm] = useState<Partial<Paiement>>({
    montant: 0, modePaiement: 'Espèces',
    datePaiement: new Date().toISOString().slice(0, 10),
  });

  const load = () => getPaiements(candidatId).then(setPaiements);
  useEffect(() => { load(); }, [candidatId]);

  const add = async () => {
    await addPaiement(candidatId, form as Paiement);
    setForm({ montant: 0, modePaiement: 'Espèces', datePaiement: new Date().toISOString().slice(0, 10) });
    load();
  };

  const del = async (id: number) => { await deletePaiement(id); load(); };

  const total = paiements.reduce((sum, p) => sum + (p.montant ?? 0), 0);

  return (
    <div>
      <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                    fontSize: 16, fontWeight: 700, color: '#2e7d32' }}>
        Total payé : {total.toLocaleString('fr-DZ')} DA
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Montant (DA)</label>
            <input type="number" value={form.montant ?? 0}
              onChange={e => setForm(f => ({ ...f, montant: Number(e.target.value) }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Mode</label>
            <select value={form.modePaiement} onChange={e => setForm(f => ({ ...f, modePaiement: e.target.value as ModePaiement }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Date</label>
            <input type="date" value={form.datePaiement ?? ''}
              onChange={e => setForm(f => ({ ...f, datePaiement: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <button onClick={add}
            style={{ background: '#1976d2', color: '#fff', border: 'none',
                     padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            + Ajouter
          </button>
        </div>
      </div>

      {paiements.map(p => (
        <div key={p.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '10px 14px', background: '#fff', borderRadius: 8,
                   marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2e7d32' }}>
              {(p.montant ?? 0).toLocaleString('fr-DZ')} DA
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{p.modePaiement} · {p.datePaiement}</div>
          </div>
          <button onClick={() => del(p.id!)}
            style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                     cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
        </div>
      ))}
    </div>
  );
}
