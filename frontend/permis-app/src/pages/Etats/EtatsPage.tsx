import { useEffect, useState } from 'react';
import { getStatuts, getExamensStats } from '../../api/etatApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';

export default function EtatsPage() {
  const [statuts, setStatuts] = useState<Record<string, number>>({});
  const [examens, setExamens] = useState<Record<string, { total: number; admis: number; taux: number }>>({});

  useEffect(() => {
    getStatuts().then(s => setStatuts(s as unknown as Record<string, number>));
    getExamensStats().then(setExamens);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="États / Rapports" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>

        {/* Rapport 1 - Statuts */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1a237e' }}>
            📊 Candidats par statut de dossier
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { key: 'INCOMPLET', label: 'Incomplets', color: '#e53935' },
              { key: 'EN_COURS',  label: 'En cours',   color: '#fb8c00' },
              { key: 'VALIDE',    label: 'Validés',     color: '#43a047' },
              { key: 'ARCHIVE',   label: 'Archivés',    color: '#616161' },
            ].map(s => (
              <div key={s.key} style={{ background: '#f8f9fa', borderRadius: 8,
                    padding: '16px', borderLeft: `4px solid ${s.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{statuts[s.key] ?? 0}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapport 2 - Examens */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 20,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1a237e' }}>
            📝 Taux de réussite par épreuve
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Épreuve', 'Passages', 'Admis', 'Taux de réussite'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(examens).map(([type, stats]) => (
                <tr key={type}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={type} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {stats.total}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#2e7d32',
                               fontWeight: 700, borderBottom: '1px solid #f5f5f5' }}>
                    {stats.admis}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.taux}%`, borderRadius: 4,
                                      background: stats.taux >= 70 ? '#43a047' : stats.taux >= 40 ? '#fb8c00' : '#e53935' }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36 }}>{stats.taux}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
