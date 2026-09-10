function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function Avatar({ name = '', src, size = 'md', tone = 'brand' }) {
  const dims = { xs: 22, sm: 28, md: 36, lg: 44 };
  const fonts = { xs: 9, sm: 11, md: 13, lg: 16 };
  const d = dims[size] || dims.md;
  const tones = {
    brand: ['var(--brand-soft)', 'var(--brand-strong)'],
    slate: ['var(--stone-100)', 'var(--stone-600)'],
    pass:  ['var(--status-pass-bg)', 'var(--status-pass-fg)'],
  };
  const [bg, fg] = tones[tone] || tones.brand;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: d, height: d, flex: 'none', borderRadius: '50%',
      background: bg, color: fg, overflow: 'hidden',
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: fonts[size] || 13,
      border: '1px solid var(--border-subtle)',
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : initials(name)}
    </span>
  );
}
