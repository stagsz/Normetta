function CalloutIcon({ tone }) {
  const c = 'currentColor';
  if (tone === 'pass') return (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke={c} strokeWidth="1.6"/><path d="M6 10.5l2.5 2.5 5-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  if (tone === 'fail') return (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke={c} strokeWidth="1.6"/><path d="M7 7l6 6M13 7l-6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>);
  if (tone === 'obs') return (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L18.5 17H1.5L10 2.5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 8v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="14.5" r="1" fill={c}/></svg>);
  return (<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke={c} strokeWidth="1.6"/><path d="M10 9v5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="6" r="1.1" fill={c}/></svg>);
}

export function Callout({ tone = 'info', title, children, action, onDismiss }) {
  const map = {
    info: { bg: 'var(--blue-50)',  line: 'var(--blue-100)',        fg: 'var(--blue-600)',        text: 'var(--stone-700)' },
    pass: { bg: 'var(--status-pass-bg)', line: 'var(--status-pass-line)', fg: 'var(--status-pass-fg)', text: 'var(--stone-700)' },
    obs:  { bg: 'var(--status-obs-bg)',  line: 'var(--status-obs-line)',  fg: 'var(--status-obs-fg)',  text: 'var(--stone-700)' },
    fail: { bg: 'var(--status-fail-bg)', line: 'var(--status-fail-line)', fg: 'var(--status-fail-fg)', text: 'var(--stone-700)' },
  };
  const c = map[tone] || map.info;
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: c.bg, border: `1px solid ${c.line}`, borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)', fontFamily: 'var(--font-sans)',
    }}>
      <span style={{ color: c.fg, flex: 'none', marginTop: 1 }}><CalloutIcon tone={tone} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 'var(--text-sm)', color: c.text, lineHeight: 1.5 }}>{children}</div>}
        {action && <div style={{ marginTop: 10 }}>{action}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" style={{
          flex: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2, lineHeight: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      )}
    </div>
  );
}
