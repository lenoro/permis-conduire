import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Paiement } from '../../types';
import { getAllPaiements } from '../../api/paiementApi';
import TopBar from '../../components/TopBar';
import PaiementFormModal from './modals/PaiementFormModal';

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const load = () => getAllPaiements().then(setPaiements);

  useEffect(() => { load(); }, []);

  const total = paiements.reduce((sum, p) => sum + (p.montant ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Paiements" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 10,
                        padding: '16px 20px', fontSize: 18,
                        fontWeight: 700, color: '#2e7d32' }}>
            Total encaissé : {total.toLocaleString('fr-DZ')} DA
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
            + Nouveau paiement
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Candidat', 'Montant', 'Mode', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.candidat
                      ? <span onClick={() => navigate(`/candidats/${p.candidat?.id}/historique`)}
                          style={{ color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}>
                          {p.candidat.nom} {p.candidat.prenom}
                        </span>
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700,
                               color: '#2e7d32', borderBottom: '1px solid #f5f5f5' }}>
                    {(p.montant ?? 0).toLocaleString('fr-DZ')} DA
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.modePaiement}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {p.datePaiement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && <PaiementFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}
