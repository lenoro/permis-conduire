import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCandidat } from '../../api/candidatApi';
import { getExamens, annulerExamen } from '../../api/examenApi';
import { getPaiements } from '../../api/paiementApi';
import { getNotifications } from '../../api/notificationApi';
import type { Candidat, Examen, Paiement, Notification } from '../../types';

const statutColor: Record<string, string> = {
  PLANIFIE: '#fff3e0', REALISE: '#e8f5e9', ANNULE: '#ffebee',
};

export default function HistoriqueCandidatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidatId = Number(id);

  const [candidat, setCandidat] = useState<Candidat | null>(null);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'examens' | 'paiements' | 'notifications'>('examens');

  useEffect(() => {
    getCandidat(candidatId).then(setCandidat);
    getExamens(candidatId).then(setExamens);
    getPaiements(candidatId).then(setPaiements);
    getNotifications(candidatId).then(setNotifications);
  }, [candidatId]);

  const handleAnnuler = async (examenId: number) => {
    if (!confirm('Confirmer l\'annulation ?')) return;
    try {
      await annulerExamen(examenId);
      getExamens(candidatId).then(setExamens);
    } catch {
      alert('Erreur lors de l\'annulation');
    }
  };

  const totalPaiements = paiements.reduce((s, p) => s + p.montant, 0);

  const tabs = [
    { key: 'examens' as const, label: `Examens (${examens.length})` },
    { key: 'paiements' as const, label: `Paiements (${paiements.length})` },
    { key: 'notifications' as const, label: `Notifications (${notifications.length})` },
  ];

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/candidats')}
        style={{ background: 'none', border: 'none', color: '#1a237e', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
        &larr; Retour aux candidats
      </button>

      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: '#1a237e', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {candidat?.photoPath ? (
            <img src={`/api/candidats/${candidatId}/photo`} alt="photo"
              style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 4, border: '2px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{ width: 56, height: 70, background: 'rgba(255,255,255,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Photo
            </div>
          )}
          <div>
            <h2 style={{ margin: 0 }}>{candidat?.nom} {candidat?.prenom}</h2>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
              {candidat?.categorieVisee} · {candidat?.numTelephone} · {candidat?.statutDossier}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === t.key ? 600 : 400, borderBottom: activeTab === t.key ? '2px solid #1a237e' : '2px solid transparent', color: activeTab === t.key ? '#1a237e' : '#555' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {activeTab === 'examens' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Résultat</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Observation</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Actions</th>
              </tr></thead>
              <tbody>
                {examens.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{e.typeEpreuve}</span></td>
                    <td style={{ padding: '8px 10px' }}>{e.dateExamen ? new Date(e.dateExamen).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: statutColor[e.statut ?? 'PLANIFIE'] ?? '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{e.statut ?? 'PLANIFIE'}</span></td>
                    <td style={{ padding: '8px 10px' }}>{e.resultat ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#555' }}>{e.observation ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      {(e.statut === 'PLANIFIE' || !e.statut) && (
                        <button onClick={() => handleAnnuler(e.id!)}
                          style={{ background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {examens.length === 0 && <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucun examen</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'paiements' && (
            <>
              <div style={{ background: '#e8f5e9', padding: '10px 16px', borderRadius: 6, marginBottom: 12, fontWeight: 600, color: '#2e7d32' }}>
                Total encaissé : {totalPaiements.toLocaleString('fr-DZ')} DA
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Montant</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
                </tr></thead>
                <tbody>
                  {paiements.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#2e7d32' }}>{p.montant.toLocaleString('fr-DZ')} DA</td>
                      <td style={{ padding: '8px 10px' }}>{p.modePaiement}</td>
                      <td style={{ padding: '8px 10px', color: '#555' }}>{p.datePaiement}</td>
                    </tr>
                  ))}
                  {paiements.length === 0 && <tr><td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucun paiement</td></tr>}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'notifications' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Canal</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Message</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
              </tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: n.canal === 'SMS' ? '#e3f2fd' : '#f3e5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{n.canal}</span></td>
                    <td style={{ padding: '8px 10px', color: '#555' }}>{n.type.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '8px 10px' }}>{n.message}</td>
                    <td style={{ padding: '8px 10px', color: '#999' }}>{new Date(n.dateEnvoi).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
                {notifications.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Aucune notification</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
