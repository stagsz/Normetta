const { useState, useEffect, useRef, useId } = React;

const EASE = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic — calm, decisive

function useCountUp(target, run, ms = 900) {
  const [n, setN] = useState(run ? 0 : target);
  const raf = useRef(0);
  useEffect(() => {
    if (!run) { setN(target); return; }
    const from = 0, start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      setN(from + (target - from) * EASE(p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, run, ms]);
  return n;
}

const TONE_STOPS = {
  brand: ['var(--clay-400)', 'var(--brand)', 'var(--brand-strong)'],
  pass:  ['#5BAE6E', 'var(--status-pass-solid)', '#2F7B45'],
  obs:   ['#E0A53D', 'var(--status-obs-solid)', '#B97914'],
  fail:  ['#D2566A', 'var(--status-fail-solid)', '#A12E43'],
};
const TONE_CAPTION = { pass: 'Audit-ready', obs: 'In progress', fail: 'Needs work', brand: 'Readiness' };

export function ScoreGauge({
  value = 0, label, size = 132, thickness = 12, tone,
  animate = true, caption,
}) {
  const v = Math.max(0, Math.min(100, value));
  const auto = v >= 85 ? 'pass' : v >= 60 ? 'obs' : 'fail';
  const key = tone || auto;
  const [solid, mid, deep] = TONE_STOPS[key] || TONE_STOPS.brand;

  const uid = useId().replace(/:/g, '');
  const gradId = `gauge-grad-${uid}`;
  const glowId = `gauge-glow-${uid}`;

  const n = useCountUp(v, animate);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (n / 100) * circ;
  const cap = caption ?? TONE_CAPTION[key];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={solid} />
              <stop offset="0.55" stopColor={mid} />
              <stop offset="1" stopColor={deep} />
            </linearGradient>
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor={deep} floodOpacity="0.35" />
            </filter>
          </defs>
          {/* sunken track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--stone-200)" strokeWidth={thickness} />
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(33,29,24,0.06)" strokeWidth={thickness}
            strokeDasharray={`0.5 ${circ}`} strokeLinecap="round" />
          {/* value arc */}
          <circle
            cx={cx} cy={cx} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth={thickness}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
            filter={`url(#${glowId})`}
          />
          {/* top sheen on the arc */}
          <circle
            cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={thickness * 0.34}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transform: `translateY(${-thickness * 0.16}px)`, transformBox: 'fill-box' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.30, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(n)}<span style={{ fontSize: size * 0.14, color: 'var(--text-subtle)' }}>%</span>
          </span>
          {cap && (
            <span style={{ marginTop: size * 0.04, fontSize: size * 0.085, fontWeight: 'var(--fw-semibold)', letterSpacing: '0.04em', textTransform: 'uppercase', color: deep }}>
              {cap}
            </span>
          )}
        </div>
      </div>
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--fw-medium)' }}>{label}</span>}
    </div>
  );
}
