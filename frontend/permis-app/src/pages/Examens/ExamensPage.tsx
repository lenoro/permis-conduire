import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllExamens, annulerExamen } from '../../api/examenApi';
import type { Examen } from '../../types';
import ExamenFormModal from './modals/ExamenFormModal';
import BatchExamenModal from './modals/BatchExamenModal';

const statutColor: Record<string, string> = {
  PLANIFIE: '#fff3e0',
  REALISE: '#e8f5e9',
  ANNULE: '#ffebee',
};

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const navigate = useNavigate();

  const load = () => getAllExamens().then(setExamens);

  useEffect(() => { load(); }, []);

  const handleAnnuler = async (id: number) => {
    if (!confirm('Confirmer l\'annulation de cet examen ?')) return;
    await annulerExamen(id);
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Examens</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            + Nouvel examen
          </button>
          <button onClick={() => setShowBatch(true)}
            style={{ background: '#388e3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            + Planifier en lot
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1a237e', color: 'white' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Candidat</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Statut</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Résultat</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Observation</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examens.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 12px' }}>
                <span
                  onClick={() => navigate(`/candidats/${e.candidat.id}/historique`)}
                  style={{ color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}>
                  {e.candidat.nom} {e.candidat.prenom}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{e.typeEpreuve}</span>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>
                {e.dateExamen ? new Date(e.dateExamen).toLocaleDateString('fr-FR') : '—'}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ background: statutColor[e.statut ?? 'PLANIFIE'] ?? '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{e.statut ?? 'PLANIFIE'}</span>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>{e.resultat ?? '—'}</td>
              <td style={{ padding: '8px 12px', fontSize: 13 }}>{e.observation ?? '—'}</td>
              <td style={{ padding: '8px 12px' }}>
                {(!e.statut || e.statut === 'PLANIFIE') && (
                  <button onClick={() => handleAnnuler(e.id)}
                    style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', padding: '2px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                    Annuler
                  </button>
                )}
              </td>
            </tr>
          ))}
          {examens.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#999' }}>Aucun examen</td></tr>
          )}
        </tbody>
      </table>

      {showForm && <ExamenFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showBatch && <BatchExamenModal onClose={() => setShowBatch(false)} onSaved={() => { setShowBatch(false); load(); }} />}
    </div>
  );
}
