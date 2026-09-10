const { useState } = React;

const CS_TONES = {
  pass: 'var(--status-pass-solid)',
  obs:  'var(--status-obs-solid)',
  fail: 'var(--status-fail-solid)',
  pending: 'var(--stone-300)',
};
const CS_TRACK = 'var(--stone-200)';

/**
 * ClauseStrip — the signature readiness texture. A single horizontal bar
 * segmented per clause, each segment colored by status and (optionally) sized
 * by weight. Calm and flat by design; the gauge carries the depth.
 */
export function ClauseStrip({
  clauses = [],
  height = 14,
  showTicks = true,
  showLegend = false,
  rounded = true,
}) {
  const [hover, setHover] = useState(-1);
  const total = clauses.reduce((s, c) => s + (c.weight ?? 1), 0) || 1;
  const radius = rounded ? 'var(--radius-pill)' : 'var(--radius-xs)';

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-sans)' }}>
      <div style={{
        position: 'relative', display: 'flex', width: '100%', height,
        gap: 2, padding: 2, borderRadius: radius,
        background: CS_TRACK,
        boxShadow: 'inset 0 1px 2px rgba(33,29,24,0.10)',
      }}>
        {clauses.map((c, i) => {
          const pct = ((c.weight ?? 1) / total) * 100;
          const fill = CS_TONES[c.status] || CS_TONES.pending;
          const isEnd = i === 0 || i === clauses.length - 1;
          const segR = rounded && isEnd ? 'var(--radius-pill)' : 2;
          return (
            <div
              key={i}
              title={`${c.label || `Clause ${i + 1}`} — ${c.status || 'pending'}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              style={{
                width: `${pct}%`, height: '100%', background: fill,
                borderTopLeftRadius: i === 0 ? segR : 2,
                borderBottomLeftRadius: i === 0 ? segR : 2,
                borderTopRightRadius: i === clauses.length - 1 ? segR : 2,
                borderBottomRightRadius: i === clauses.length - 1 ? segR : 2,
                opacity: hover === -1 || hover === i ? 1 : 0.5,
                transform: hover === i ? 'scaleY(1.18)' : 'scaleY(1)',
                transition: 'opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
              }}
            />
          );
        })}
      </div>

      {showTicks && (
        <div style={{ display: 'flex', width: '100%', gap: 2, padding: '6px 2px 0', marginTop: 0 }}>
          {clauses.map((c, i) => {
            const pct = ((c.weight ?? 1) / total) * 100;
            return (
              <div key={i} style={{
                width: `${pct}%`, textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                color: hover === i ? 'var(--text-strong)' : 'var(--text-subtle)',
                fontWeight: hover === i ? 600 : 500,
                fontVariantNumeric: 'tabular-nums',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'color var(--dur-fast)',
              }}>
                {c.tick ?? c.label ?? i + 1}
              </div>
            );
          })}
        </div>
      )}

      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 12 }}>
          {[['pass', 'Conformant'], ['obs', 'Observation'], ['fail', 'Nonconformity'], ['pending', 'Not assessed']].map(([k, lbl]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: CS_TONES[k] }} />
              {lbl}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
