import { useEffect, useState } from 'react';
import { getAllExamens, annulerExamen } from '../../api/examenApi';
import type { Examen } from '../../types';
import ExamenFormModal from './modals/ExamenFormModal';
import BatchExamenModal from './modals/BatchExamenModal';
import SaisirResultatsModal from './modals/SaisirResultatsModal';

const resultatColor: Record<string, string> = {
  ADMIS: '#43a047',
  AJOURNE: '#fb8c00',
  ABSENT: '#e53935',
};

interface Session {
  key: string;
  typeEpreuve: string;
  date: string;
  dateRaw: string;
  examens: Examen[];
  tousRealises: boolean;
  hasResults: boolean;
}

function groupSessions(examens: Examen[]): Session[] {
  const map = new Map<string, Examen[]>();
  for (const e of examens) {
    const date = e.dateExamen ? e.dateExamen.slice(0, 10) : 'sans-date';
    const key = `${date}__${e.typeEpreuve}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries())
    .map(([key, exs]) => ({
      key,
      typeEpreuve: exs[0].typeEpreuve,
      date: exs[0].dateExamen ? new Date(exs[0].dateExamen).toLocaleDateString('fr-FR') : '—',
      dateRaw: exs[0].dateExamen?.slice(0, 10) ?? '',
      examens: exs,
      tousRealises: exs.every(e => e.statut === 'REALISE'),
      hasResults: exs.some(e => e.resultat),
    }))
    .sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));
}

const typeColor: Record<string, string> = {
  CODE: '#1565c0',
  CRENEAU: '#6a1b9a',
  CONDUITE: '#2e7d32',
};

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [sessionToSaisir, setSessionToSaisir] = useState<Session | null>(null);

  const load = () => getAllExamens().then(setExamens);
  useEffect(() => { load(); }, []);

  const handleAnnuler = async (id: number) => {
    if (!confirm('Confirmer l\'annulation de cet examen ?')) return;
    await annulerExamen(id);
    load();
  };

  const sessions = groupSessions(examens);

  const toggle = (key: string) => setOpenKey(prev => prev === key ? null : key);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Examens</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#1a237e', color: 'white', border: 'none',
                     padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            + Nouvel examen
          </button>
          <button onClick={() => setShowBatch(true)}
            style={{ background: '#388e3c', color: 'white', border: 'none',
                     padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            + Planifier en lot
          </button>
        </div>
      </div>

      {/* Maître-Détail */}
      {sessions.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, textAlign: 'center',
                      color: '#999', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          Aucun examen planifié
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sessions.map(s => {
            const isOpen = openKey === s.key;
            const nbPlanifies = s.examens.filter(e => e.statut === 'PLANIFIE' || !e.statut).length;
            const nbRealises = s.examens.filter(e => e.statut === 'REALISE').length;
            const nbAnnules = s.examens.filter(e => e.statut === 'ANNULE').length;

            return (
              <div key={s.key} style={{ background: '#fff', borderRadius: 8,
                                        border: isOpen ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                        overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Ligne maître — cliquable */}
                <div onClick={() => toggle(s.key)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', cursor: 'pointer',
                            background: isOpen ? '#e3f2fd' : '#fff',
                            transition: 'background 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Chevron */}
                    <span style={{ fontSize: 14, color: '#888', transition: 'transform 0.2s',
                                   display: 'inline-block',
                                   transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    {/* Type badge */}
                    <span style={{ background: typeColor[s.typeEpreuve] ?? '#555',
                                   color: '#fff', padding: '3px 10px', borderRadius: 4,
                                   fontSize: 12, fontWeight: 700 }}>
                      {s.typeEpreuve}
                    </span>
                    {/* Date */}
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.date}</span>
                    {/* Nb candidats */}
                    <span style={{ fontSize: 13, color: '#666' }}>
                      {s.examens.length} candidat{s.examens.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Indicateurs */}
                    {nbPlanifies > 0 && (
                      <span style={{ background: '#fff3e0', color: '#e65100', padding: '2px 10px',
                                     borderRadius: 4, fontSize: 12 }}>
                        {nbPlanifies} planifié{nbPlanifies > 1 ? 's' : ''}
                      </span>
                    )}
                    {nbRealises > 0 && (
                      <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 10px',
                                     borderRadius: 4, fontSize: 12 }}>
                        {nbRealises} réalisé{nbRealises > 1 ? 's' : ''}
                      </span>
                    )}
                    {nbAnnules > 0 && (
                      <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 10px',
                                     borderRadius: 4, fontSize: 12 }}>
                        {nbAnnules} annulé{nbAnnules > 1 ? 's' : ''}
                      </span>
                    )}
                    {/* Bouton saisir résultats */}
                    {nbPlanifies > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); setSessionToSaisir(s); }}
                        style={{ background: '#1976d2', color: '#fff', border: 'none',
                                 padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
                                 fontSize: 12, fontWeight: 600 }}>
                        Saisir résultats
                      </button>
                    )}
                  </div>
                </div>

                {/* Détail — candidats */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #e0e0e0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          {['Candidat', 'Statut', 'Résultat', 'Observation', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11,
                                                  color: '#888', textTransform: 'uppercase',
                                                  letterSpacing: '0.4px', borderBottom: '1px solid #eee' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.examens.map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>
                              {e.candidat?.nom} {e.candidat?.prenom}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4,
                                             background: e.statut === 'REALISE' ? '#e8f5e9'
                                               : e.statut === 'ANNULE' ? '#ffebee' : '#fff3e0',
                                             color: e.statut === 'REALISE' ? '#2e7d32'
                                               : e.statut === 'ANNULE' ? '#c62828' : '#e65100' }}>
                                {e.statut ?? 'PLANIFIE'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 13 }}>
                              {e.resultat ? (
                                <span style={{ color: resultatColor[e.resultat], fontWeight: 600 }}>
                                  {e.resultat}
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 13, color: '#555' }}>
                              {e.observation ?? '—'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {(e.statut === 'PLANIFIE' || !e.statut) && (
                                <button onClick={() => handleAnnuler(e.id!)}
                                  style={{ background: 'none', border: '1px solid #d32f2f',
                                           color: '#d32f2f', padding: '2px 10px', borderRadius: 4,
                                           cursor: 'pointer', fontSize: 12 }}>
                                  Annuler
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && <ExamenFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showBatch && <BatchExamenModal onClose={() => setShowBatch(false)} onSaved={() => { setShowBatch(false); load(); }} />}
      {sessionToSaisir && (
        <SaisirResultatsModal
          examens={sessionToSaisir.examens.filter(e => e.statut !== 'ANNULE')}
          onClose={() => setSessionToSaisir(null)}
          onSaved={() => { setSessionToSaisir(null); load(); }}
        />
      )}
    </div>
  );
}
