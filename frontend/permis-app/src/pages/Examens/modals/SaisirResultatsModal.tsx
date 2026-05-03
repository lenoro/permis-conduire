import { useState } from 'react';
import type { Examen, ResultatExamen } from '../../../types';
import { batchUpdateResultats } from '../../../api/examenApi';

interface Props {
  examens: Examen[];
  onClose: () => void;
  onSaved: () => void;
}

const RESULTATS: ResultatExamen[] = ['ADMIS', 'AJOURNE', 'ABSENT'];

const resultatColor: Record<ResultatExamen, string> = {
  ADMIS: '#43a047',
  AJOURNE: '#fb8c00',
  ABSENT: '#e53935',
};

export default function SaisirResultatsModal({ examens, onClose, onSaved }: Props) {
  const [rows, setRows] = useState<{ id: number; resultat: ResultatExamen | ''; observation: string }[]>(
    examens.map(e => ({ id: e.id!, resultat: e.resultat ?? '', observation: e.observation ?? '' }))
  );
  const [saving, setSaving] = useState(false);

  const setResultat = (id: number, resultat: ResultatExamen) =>
    setRows(r => r.map(row => row.id === id ? { ...row, resultat } : row));

  const setObs = (id: number, observation: string) =>
    setRows(r => r.map(row => row.id === id ? { ...row, observation } : row));

  const allFilled = rows.every(r => r.resultat !== '');

  const save = async () => {
    if (!allFilled) return alert('Veuillez saisir un résultat pour chaque candidat.');
    setSaving(true);
    try {
      await batchUpdateResultats(rows.map(r => ({ id: r.id, resultat: r.resultat as string, observation: r.observation })));
      onSaved();
    } catch {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const session = examens[0];
  const dateStr = session?.dateExamen ? new Date(session.dateExamen).toLocaleDateString('fr-FR') : '';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '700px', maxWidth: '95vw',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', background: '#1a237e', color: '#fff',
                      borderRadius: '12px 12px 0 0', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Saisir les résultats</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{session?.typeEpreuve} — {dateStr} — {examens.length} candidat(s)</div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#666',
                             textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Candidat</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666',
                             textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Résultat</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#666',
                             textTransform: 'uppercase', borderBottom: '1px solid #eee' }}>Observation</th>
              </tr>
            </thead>
            <tbody>
              {examens.map((e, i) => {
                const row = rows[i];
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 12px', fontSize: 14, fontWeight: 500 }}>
                      {e.candidat?.nom} {e.candidat?.prenom}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {RESULTATS.map(r => (
                          <button key={r} onClick={() => setResultat(e.id!, r)}
                            style={{
                              padding: '4px 12px', fontSize: 12, borderRadius: 4, cursor: 'pointer',
                              fontWeight: row.resultat === r ? 700 : 400,
                              background: row.resultat === r ? resultatColor[r] : '#f5f5f5',
                              color: row.resultat === r ? '#fff' : '#555',
                              border: row.resultat === r ? `2px solid ${resultatColor[r]}` : '2px solid #e0e0e0',
                            }}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <input value={row.observation} onChange={e2 => setObs(e.id!, e2.target.value)}
                        placeholder="Observation (optionnel)"
                        style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0',
                                 borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee',
                      display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose}
            style={{ padding: '8px 20px', border: '1px solid #ddd', borderRadius: 6,
                     cursor: 'pointer', background: 'white', fontSize: 14 }}>
            Annuler
          </button>
          <button onClick={save} disabled={saving}
            style={{ padding: '8px 24px', background: allFilled ? '#1976d2' : '#bbb',
                     color: '#fff', border: 'none', borderRadius: 6,
                     cursor: allFilled ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Enregistrement...' : '✓ Enregistrer les résultats'}
          </button>
        </div>
      </div>
    </div>
  );
}
