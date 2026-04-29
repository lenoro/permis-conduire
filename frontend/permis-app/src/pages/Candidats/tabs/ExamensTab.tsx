import { useEffect, useState } from 'react';
import { Examen, TypeEpreuve, ResultatExamen } from '../../../types';
import { getExamens, addExamen, deleteExamen } from '../../../api/examenApi';
import Badge from '../../../components/Badge';

export default function ExamensTab({ candidatId }: { candidatId: number }) {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [form, setForm] = useState<Partial<Examen>>({
    typeEpreuve: 'CODE', resultat: 'ADMIS',
    dateExamen: new Date().toISOString().slice(0, 16), observation: '',
  });

  const load = () => getExamens(candidatId).then(setExamens);
  useEffect(() => { load(); }, [candidatId]);

  const add = async () => {
    await addExamen(candidatId, form as Examen);
    setForm({ typeEpreuve: 'CODE', resultat: 'ADMIS',
              dateExamen: new Date().toISOString().slice(0, 16), observation: '' });
    load();
  };

  const del = async (id: number) => { await deleteExamen(id); load(); };

  return (
    <div>
      <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 12,
                      textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ajouter un examen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={form.typeEpreuve} onChange={e => setForm(f => ({ ...f, typeEpreuve: e.target.value as TypeEpreuve }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {(['CODE', 'CRENEAU', 'CONDUITE'] as TypeEpreuve[]).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Résultat</label>
            <select value={form.resultat} onChange={e => setForm(f => ({ ...f, resultat: e.target.value as ResultatExamen }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {(['ADMIS', 'AJOURNE', 'ABSENT'] as ResultatExamen[]).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Date</label>
            <input type="datetime-local" value={form.dateExamen ?? ''}
              onChange={e => setForm(f => ({ ...f, dateExamen: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Observation</label>
            <input value={form.observation ?? ''} onChange={e => setForm(f => ({ ...f, observation: e.target.value }))}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={add}
              style={{ width: '100%', background: '#1976d2', color: '#fff', border: 'none',
                       padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              + Ajouter
            </button>
          </div>
        </div>
      </div>

      {examens.map(e => (
        <div key={e.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '10px 14px', background: '#fff', borderRadius: 8,
                   marginBottom: 8, border: '1px solid #e0e0e0' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Badge value={e.typeEpreuve} />
              <Badge value={e.resultat ?? ''} />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{e.dateExamen?.slice(0, 16)}</div>
            {e.observation && <div style={{ fontSize: 12, color: '#555' }}>{e.observation}</div>}
          </div>
          <button onClick={() => del(e.id!)}
            style={{ padding: '4px 12px', fontSize: 12, border: 'none', borderRadius: 4,
                     cursor: 'pointer', background: '#ffebee', color: '#c62828' }}>✕</button>
        </div>
      ))}
    </div>
  );
}
