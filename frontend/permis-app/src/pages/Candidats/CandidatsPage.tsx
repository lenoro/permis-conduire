import { useEffect, useState } from 'react';
import { Candidat, StatutDossier } from '../../types';
import { getCandidats, deleteCandidat } from '../../api/candidatApi';
import { getStatuts } from '../../api/etatApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';
import CandidatModal from './CandidatModal';

const STATUTS: StatutDossier[] = ['INCOMPLET', 'EN_COURS', 'VALIDE', 'ARCHIVE'];

export default function CandidatsPage() {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filtre, setFiltre] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Candidat | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [data, s] = await Promise.all([
      getCandidats(filtre || undefined, search || undefined),
      getStatuts(),
    ]);
    setCandidats(data);
    setStats(s as unknown as Record<string, number>);
  };

  useEffect(() => { load(); }, [filtre, search]);

  const handleAdd = () => { setSelected(null); setShowModal(true); };
  const handleEdit = (c: Candidat) => { setSelected(c); setShowModal(true); };
  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce candidat ?')) { await deleteCandidat(id); load(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Candidats" onAdd={handleAdd} addLabel="+ Nouveau candidat" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total', val: stats.total, color: '#1976d2' },
            { label: 'Validés', val: stats.VALIDE, color: '#43a047' },
            { label: 'En cours', val: stats.EN_COURS, color: '#fb8c00' },
            { label: 'Incomplets', val: stats.INCOMPLET, color: '#e53935' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 10,
                  padding: '16px', borderLeft: `4px solid ${s.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{s.val ?? 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
                        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher..."
              style={{ padding: '6px 12px', border: '1px solid #e0e0e0',
                       borderRadius: 6, fontSize: 13, width: 220 }} />
            <select value={filtre} onChange={e => setFiltre(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              <option value="">Tous les statuts</option>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Nom / Prénom', 'Catégorie', 'Statut', 'Téléphone', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidats.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}
                  onClick={() => handleEdit(c)}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    <strong>{c.nom} {c.prenom}</strong><br/>
                    <small style={{ color: '#888' }}>{c.dateInscription}</small>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {c.categorieVisee}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={c.statutDossier} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {c.numTelephone}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEdit(c)}
                      style={{ marginRight: 8, padding: '4px 12px', fontSize: 12,
                               background: '#e3f2fd', color: '#1976d2', border: 'none',
                               borderRadius: 4, cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => handleDelete(c.id!)}
                      style={{ padding: '4px 12px', fontSize: 12,
                               background: '#ffebee', color: '#c62828', border: 'none',
                               borderRadius: 4, cursor: 'pointer' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CandidatModal
          candidat={selected}
          onClose={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
