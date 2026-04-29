import { useState } from 'react';
import type { Candidat } from '../../types';
import InfosTab from './tabs/InfosTab';
import DocumentsTab from './tabs/DocumentsTab';
import ExamensTab from './tabs/ExamensTab';
import PaiementsTab from './tabs/PaiementsTab';

const TABS = ['👤 Infos', '📄 Documents', '📝 Examens', '💰 Paiements'];

interface Props { candidat: Candidat | null; onClose: () => void; }

export default function CandidatModal({ candidat, onClose }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '80vw', maxWidth: 860,
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', background: '#1a237e', color: '#fff',
                      borderRadius: '12px 12px 0 0', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {candidat ? `${candidat.nom} ${candidat.prenom}` : 'Nouveau candidat'}
          </span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff',
                     fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {/* Tabs */}
        {candidat && (
          <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', background: '#f8f9fa' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                style={{ padding: '12px 20px', fontSize: 13, cursor: 'pointer', background: 'none',
                         border: 'none', borderBottom: tab === i ? '3px solid #1976d2' : '3px solid transparent',
                         color: tab === i ? '#1976d2' : '#666', fontWeight: tab === i ? 700 : 400 }}>
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {(tab === 0 || !candidat) && <InfosTab candidat={candidat} onSaved={onClose} />}
          {tab === 1 && candidat && <DocumentsTab candidatId={candidat.id!} />}
          {tab === 2 && candidat && <ExamensTab candidatId={candidat.id!} />}
          {tab === 3 && candidat && <PaiementsTab candidatId={candidat.id!} />}
        </div>
      </div>
    </div>
  );
}
