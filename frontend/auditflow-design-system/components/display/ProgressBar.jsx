export function ProgressBar({
  value = 0,
  segments,
  tone = 'brand',
  size = 'md',
  label,
  showValue = false,
}) {
  const heights = { sm: 6, md: 9, lg: 12 };
  const h = heights[size] || heights.md;
  const tones = {
    brand: 'var(--brand)', pass: 'var(--status-pass-solid)',
    obs: 'var(--status-obs-solid)', fail: 'var(--status-fail-solid)',
  };

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', fontWeight: 'var(--fw-medium)' }}>{label}</span>}
          {showValue && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{Math.round(value)}%</span>}
        </div>
      )}
      <div style={{
        display: 'flex', width: '100%', height: h, borderRadius: 'var(--radius-pill)',
        background: 'var(--stone-200)', overflow: 'hidden', gap: segments ? 2 : 0,
      }}>
        {segments
          ? segments.map((s, i) => (
              <div key={i} title={`${s.label || ''} ${s.value}%`} style={{
                width: `${s.value}%`, height: '100%',
                background: tones[s.tone] || tones.brand,
                borderRadius: 'var(--radius-pill)',
                transition: 'width var(--dur-slow) var(--ease-standard)',
              }}/>
            ))
          : (
            <div style={{
              width: `${Math.max(0, Math.min(100, value))}%`, height: '100%',
              background: tones[tone] || tones.brand, borderRadius: 'var(--radius-pill)',
              transition: 'width var(--dur-slow) var(--ease-standard)',
            }}/>
          )}
      </div>
    </div>
  );
}
