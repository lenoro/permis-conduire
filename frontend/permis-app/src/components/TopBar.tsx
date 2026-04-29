interface Props { title: string; onAdd?: () => void; addLabel?: string; }

export default function TopBar({ title, onAdd, addLabel = '+ Nouveau' }: Props) {
  return (
    <div style={{ background: '#fff', padding: '14px 24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #e8eaed' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#1a237e' }}>{title}</div>
      {onAdd && (
        <button onClick={onAdd}
          style={{ background: '#1976d2', color: '#fff', border: 'none',
                   padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
                   fontSize: 13, fontWeight: 600 }}>
          {addLabel}
        </button>
      )}
    </div>
  );
}
