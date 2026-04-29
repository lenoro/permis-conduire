import { NavLink } from 'react-router-dom';

const links = [
  { to: '/candidats', icon: '👥', label: 'Candidats' },
  { to: '/examens',   icon: '📝', label: 'Examens' },
  { to: '/paiements', icon: '💰', label: 'Paiements' },
  { to: '/etats',     icon: '📊', label: 'États / Rapports' },
];

export default function Sidebar() {
  return (
    <aside style={{ width: 220, background: '#1a237e', color: '#fff',
                    display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '20px 16px', background: '#0d1561',
                    fontSize: 15, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🚗</span> Permis App
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 20px', fontSize: 13, color: '#fff',
              textDecoration: 'none', cursor: 'pointer',
              background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
              borderLeft: isActive ? '3px solid #90caf9' : '3px solid transparent',
              fontWeight: isActive ? 700 : 400,
            })}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
