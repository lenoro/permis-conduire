import { useState } from 'react';
import type { Candidat, StatutDossier } from '../../../types';
import { createCandidat, updateCandidat } from '../../../api/candidatApi';

const STATUTS: StatutDossier[] = ['INCOMPLET', 'EN_COURS', 'VALIDE', 'ARCHIVE'];
const CATEGORIES = ['A', 'B', 'C', 'C1', 'D', 'BE'];

interface Props { candidat: Candidat | null; onSaved: () => void; }

const empty: Candidat = {
  nom: '', prenom: '', dateNaissance: '', numTelephone: '', adresse: '',
  groupeSanguin: '', dateInscription: new Date().toISOString().slice(0, 10),
  categorieVisee: 'B', statutDossier: 'INCOMPLET',
};

export default function InfosTab({ candidat, onSaved }: Props) {
  const [form, setForm] = useState<Candidat>(candidat ?? empty);

  const set = (field: keyof Candidat, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const save = async () => {
    if (candidat?.id) await updateCandidat(candidat.id, form);
    else await createCandidat(form);
    onSaved();
  };

  const field = (label: string, key: keyof Candidat, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{label}</label>
      <input type={type} value={(form[key] as string) ?? ''}
        onChange={e => set(key, e.target.value)}
        style={{ padding: '8px 10px', border: '1px solid #e0e0e0',
                 borderRadius: 6, fontSize: 13, background: '#f8f9fa' }} />
    </div>
  );

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
          Informations personnelles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Nom', 'nom')}
          {field('Prénom', 'prenom')}
          {field('Date de naissance', 'dateNaissance', 'date')}
          {field('Téléphone', 'numTelephone')}
          {field('Groupe sanguin', 'groupeSanguin')}
          <div style={{ gridColumn: 'span 2' }}>{field('Adresse', 'adresse')}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0e0e0',
                    borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
          Dossier
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Date inscription', 'dateInscription', 'date')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Catégorie visée</label>
            <select value={form.categorieVisee ?? 'B'} onChange={e => set('categorieVisee', e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Statut dossier</label>
            <select value={form.statutDossier} onChange={e => set('statutDossier', e.target.value as StatutDossier)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={save}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '10px 24px', borderRadius: 6, cursor: 'pointer',
                   fontSize: 14, fontWeight: 600 }}>
          💾 Enregistrer
        </button>
      </div>
    </div>
  );
}
