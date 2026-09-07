const NAV = [
  { id: 'dashboard',  label: 'Dashboard',     icon: 'layout-dashboard' },
  { id: 'assessment', label: 'Self-assessment', icon: 'clipboard-check' },
  { id: 'findings',   label: 'Findings',       icon: 'flag', badge: 8 },
  { id: 'clauses',    label: 'Clause library', icon: 'book-open' },
  { id: 'reports',    label: 'Reports',        icon: 'file-text' },
];
const NAV_SECONDARY = [
  { id: 'team',     label: 'Team',     icon: 'users' },
  { id: 'settings', label: 'Settings', icon: 'sliders' },
];

function Sidebar({ active, onNavigate }) {
  const Icon = window.AFIcon;
  const item = (n) => {
    const on = active === n.id;
    return (
      <button key={n.id} onClick={() => onNavigate && onNavigate(n.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 11, width: '100%',
          padding: '9px 12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
          background: on ? 'var(--brand-soft)' : 'transparent',
          color: on ? 'var(--brand-strong)' : 'var(--stone-300)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)',
          fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
          textAlign: 'left', transition: 'background var(--dur-fast), color var(--dur-fast)',
        }}
        onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
        onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--stone-300)'; } }}
      >
        <Icon name={n.icon} size={18} strokeWidth={on ? 2.2 : 1.9} />
        <span style={{ flex: 1 }}>{n.label}</span>
        {n.badge && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, padding: '1px 7px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(189, 109, 74, 0.976)', color: '#fff',
          }}>{n.badge}</span>
        )}
      </button>
    );
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)', flex: 'none', height: '100%',
      background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column',
      padding: '20px 14px', gap: 4, boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
        <img src="../../assets/logo-full-dark.svg" alt="Normetta" style={{ height: 30 }} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 10,
        background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(189, 109, 74, 0.976)', display: 'grid', placeItems: 'center', flex: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'rgb(250, 246, 246)' }}>NW</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Northwind Mfg.</div>
          <div style={{ fontSize: 11, color: 'var(--stone-400)' }}>ISO 9001:2015</div>
        </div>
        <Icon name="chevron-down" size={15} color="var(--stone-400)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{NAV.map(item)}</div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 8px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{NAV_SECONDARY.map(item)}</div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(189, 109, 74, 0.976)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flex: 'none' }}>DO</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Dana Okoye</div>
          <div style={{ fontSize: 11, color: 'var(--stone-400)' }}>QHSE Manager</div>
        </div>
        <Icon name="log-out" size={16} color="var(--stone-400)" />
      </div>
    </aside>
  );
}

window.AFSidebar = Sidebar;
