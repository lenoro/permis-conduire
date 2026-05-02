import { useEffect, useState } from 'react';
import { getNotifications, addNotification } from '../../../api/notificationApi';
import type { Notification, TypeNotification, CanalNotification } from '../../../types';

interface Props {
  candidatId: number;
}

export default function NotificationsTab({ candidatId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [canal, setCanal] = useState<CanalNotification>('SMS');
  const [type, setType] = useState<TypeNotification>('MANQUE_PAIEMENT');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => getNotifications(candidatId).then(setNotifications);

  useEffect(() => { load(); }, [candidatId]);

  const handleSend = async () => {
    if (!message.trim()) return alert('Saisir un message');
    setSending(true);
    try {
      await addNotification(candidatId, { type, canal, message });
      setMessage('');
      await load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: 8, marginBottom: 16, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Canal</label>
          <select value={canal} onChange={e => setCanal(e.target.value as CanalNotification)}
            style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as TypeNotification)}
            style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4 }}>
            <option value="MANQUE_PAIEMENT">Manque paiement</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', color: '#666' }}>Message</label>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Saisir le message..."
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleSend} disabled={sending}
          style={{ padding: '7px 16px', background: '#1a237e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Envoyer
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>Aucune notification</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Canal</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Message</th>
              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 10px' }}>
                  <span style={{ background: n.canal === 'SMS' ? '#e3f2fd' : '#f3e5f5', padding: '2px 8px', borderRadius: 4 }}>{n.canal}</span>
                </td>
                <td style={{ padding: '6px 10px', color: '#555' }}>{n.type.replace(/_/g, ' ')}</td>
                <td style={{ padding: '6px 10px' }}>{n.message}</td>
                <td style={{ padding: '6px 10px', color: '#999' }}>
                  {new Date(n.dateEnvoi).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
