import { useEffect, useState } from 'react';
import type { Examen } from '../../types';
import { getAllExamens } from '../../api/examenApi';
import TopBar from '../../components/TopBar';
import Badge from '../../components/Badge';

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>([]);

  useEffect(() => { getAllExamens().then(setExamens); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Examens" />
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Candidat', 'Type épreuve', 'Date', 'Résultat', 'Observation'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                                       color: '#666', textTransform: 'uppercase',
                                       borderBottom: '1px solid #eee', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examens.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {e.candidat ? `Candidat #${e.candidat.id}` : '—'}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={e.typeEpreuve} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                    {e.dateExamen?.slice(0, 16)}
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5' }}>
                    <Badge value={e.resultat ?? ''} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#666', borderBottom: '1px solid #f5f5f5' }}>
                    {e.observation ?? '—'}
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
