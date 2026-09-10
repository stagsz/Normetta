export function Badge({ children, tone = 'neutral', variant = 'soft', size = 'md', dot = false }) {
  const tones = {
    neutral: { soft: ['var(--stone-100)', 'var(--stone-600)', 'var(--stone-200)'], solid: ['var(--stone-600)', '#fff'] },
    brand:   { soft: ['var(--brand-soft)', 'var(--brand-strong)', 'var(--clay-200)'], solid: ['var(--brand)', '#fff'] },
    pass:    { soft: ['var(--status-pass-bg)', 'var(--status-pass-fg)', 'var(--status-pass-line)'], solid: ['var(--status-pass-solid)', '#fff'] },
    obs:     { soft: ['var(--status-obs-bg)', 'var(--status-obs-fg)', 'var(--status-obs-line)'], solid: ['var(--status-obs-solid)', '#fff'] },
    fail:    { soft: ['var(--status-fail-bg)', 'var(--status-fail-fg)', 'var(--status-fail-line)'], solid: ['var(--status-fail-solid)', '#fff'] },
    info:    { soft: ['var(--blue-50)', 'var(--blue-600)', 'var(--blue-100)'], solid: ['var(--blue-500)', '#fff'] },
  };
  const cfg = tones[tone] || tones.neutral;
  const sizes = { sm: { fs: 'var(--text-2xs)', pad: '2px 7px' }, md: { fs: 'var(--text-xs)', pad: '3px 9px' } };
  const sz = sizes[size] || sizes.md;
  const isSolid = variant === 'solid';
  const [bg, fg, line] = isSolid ? [cfg.solid[0], cfg.solid[1], cfg.solid[0]] : cfg.soft;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-sans)', fontSize: sz.fs, fontWeight: 'var(--fw-semibold)',
      lineHeight: 1, padding: sz.pad, color: fg, background: bg,
      border: `1px solid ${isSolid ? 'transparent' : line}`,
      borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSolid ? '#fff' : cfg.solid[0], flex: 'none' }}/>}
      {children}
    </span>
  );
}
