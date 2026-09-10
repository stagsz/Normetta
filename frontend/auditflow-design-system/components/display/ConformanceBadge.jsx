const CONFORMANCE = {
  conformant:   { label: 'Conformant',    bg: 'var(--status-pass-bg)', fg: 'var(--status-pass-fg)', line: 'var(--status-pass-line)', solid: 'var(--status-pass-solid)' },
  observation:  { label: 'Observation',   bg: 'var(--status-obs-bg)',  fg: 'var(--status-obs-fg)',  line: 'var(--status-obs-line)',  solid: 'var(--status-obs-solid)' },
  nonconformity:{ label: 'Nonconformity', bg: 'var(--status-fail-bg)', fg: 'var(--status-fail-fg)', line: 'var(--status-fail-line)', solid: 'var(--status-fail-solid)' },
  notassessed:  { label: 'Not assessed',  bg: 'var(--status-na-bg)',   fg: 'var(--status-na-fg)',   line: 'var(--status-na-line)',   solid: 'var(--status-na-solid)' },
};

function Glyph({ status }) {
  const c = 'currentColor';
  if (status === 'conformant') return (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
  if (status === 'observation') return (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v6" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="12.5" r="1.1" fill={c}/></svg>);
  if (status === 'nonconformity') return (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>);
  return (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke={c} strokeWidth="1.6" strokeDasharray="2 2"/></svg>);
}

export function ConformanceBadge({ status = 'notassessed', variant = 'soft', showIcon = true, label }) {
  const cfg = CONFORMANCE[status] || CONFORMANCE.notassessed;
  const isSolid = variant === 'solid';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)',
      lineHeight: 1, padding: '4px 10px',
      color: isSolid ? '#fff' : cfg.fg,
      background: isSolid ? cfg.solid : cfg.bg,
      border: `1px solid ${isSolid ? 'transparent' : cfg.line}`,
      borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
    }}>
      {showIcon && <Glyph status={status} />}
      {label || cfg.label}
    </span>
  );
}
