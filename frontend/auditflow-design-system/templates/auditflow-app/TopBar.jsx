function TopBar({ title, subtitle, actions }) {
  const Icon = window.AFIcon;
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 28px', borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)', flex: 'none',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', minWidth: 240,
        background: 'var(--stone-50)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-subtle)',
      }}>
        <Icon name="search" size={16} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)' }}>Search clauses, findings…</span>
      </div>
      <button aria-label="Notifications" style={{ position: 'relative', width: 38, height: 38, display: 'grid', placeItems: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-body)' }}>
        <Icon name="bell" size={18} />
        <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: 'var(--status-fail-solid)', border: '1.5px solid var(--surface-card)' }} />
      </button>
      {actions}
    </header>
  );
}

window.AFTopBar = TopBar;
