const { useState } = React;

const SIZES = {
  sm: { height: 'var(--control-h-sm)', padding: '0 12px', font: 'var(--text-sm)', gap: '6px' },
  md: { height: 'var(--control-h-md)', padding: '0 16px', font: 'var(--text-md)', gap: '8px' },
  lg: { height: 'var(--control-h-lg)', padding: '0 22px', font: 'var(--text-lg)', gap: '8px' },
};

// Skeuomorphic depth recipe: a top-lit vertical gradient, a bright inner
// highlight along the top edge, a darker grounding edge at the bottom, and a
// soft drop shadow. On press, the gradient flips, the highlight gives way to an
// inset shadow, and the drop shadow collapses — the cap physically sinks in.
function raised({ top, mid, bottom, edge, highlight, drop }) {
  return {
    rest: {
      backgroundImage: `linear-gradient(180deg, ${top} 0%, ${mid} 48%, ${bottom} 100%)`,
      border: `1px solid ${edge}`,
      boxShadow: `inset 0 1px 0 ${highlight}, inset 0 -1px 1px rgba(33,29,24,0.14), 0 1px 1px rgba(33,29,24,0.10), ${drop}`,
    },
    active: {
      backgroundImage: `linear-gradient(180deg, ${bottom} 0%, ${mid} 60%, ${top} 100%)`,
      border: `1px solid ${edge}`,
      boxShadow: `inset 0 2px 4px rgba(33,29,24,0.30), inset 0 1px 1px rgba(33,29,24,0.20)`,
    },
  };
}

function variantStyle(variant, hover, active) {
  switch (variant) {
    case 'secondary': {
      const r = raised({
        top: hover ? '#FFFFFF' : '#FFFFFF',
        mid: hover ? 'var(--stone-50)' : '#FCFAF6',
        bottom: hover ? 'var(--stone-100)' : 'var(--stone-50)',
        edge: 'var(--border-default)',
        highlight: 'rgba(255,255,255,0.9)',
        drop: '0 2px 3px rgba(33,29,24,0.07)',
      });
      return { color: 'var(--text-strong)', ...(active ? r.active : r.rest) };
    }
    case 'ghost':
      return {
        background: hover ? 'var(--stone-100)' : 'transparent',
        color: 'var(--text-body)',
        border: '1px solid transparent',
        boxShadow: active ? 'inset 0 1px 3px rgba(33,29,24,0.14)' : 'none',
      };
    case 'danger': {
      const r = raised({
        top: hover ? 'var(--red-500)' : '#C9485B',
        mid: hover ? 'var(--red-600)' : 'var(--red-500)',
        bottom: hover ? 'var(--red-700)' : 'var(--red-600)',
        edge: 'var(--red-700)',
        highlight: 'rgba(255,255,255,0.28)',
        drop: '0 2px 4px rgba(122,32,48,0.30)',
      });
      return { color: '#fff', ...(active ? r.active : r.rest) };
    }
    case 'primary':
    default: {
      // Brushed-metal treatment: a multi-stop gradient with a hard reflection
      // break near the middle and reflected light brightening the bottom edge,
      // wrapped in a crisp bevel (bright top line + dark inner base).
      if (active) {
        return {
          color: 'var(--brand-on)',
          backgroundImage: 'linear-gradient(180deg, var(--clay-800) 0%, var(--clay-700) 46%, var(--clay-600) 54%, var(--clay-500) 100%)',
          border: '1px solid var(--clay-900)',
          boxShadow: 'inset 0 2px 5px rgba(33,29,24,0.45), inset 0 1px 1px rgba(33,29,24,0.30)',
        };
      }
      const top = hover ? 'color-mix(in srgb, var(--clay-200) 70%, #fff)' : 'color-mix(in srgb, var(--clay-300) 72%, #fff)';
      const up  = hover ? 'var(--clay-300)' : 'var(--clay-400)';
      const upMid = hover ? 'var(--clay-400)' : 'var(--clay-500)';
      const loMid = hover ? 'var(--clay-600)' : 'var(--clay-700)';
      const lo  = hover ? 'var(--clay-500)' : 'var(--clay-600)';
      const foot = hover ? 'var(--clay-400)' : 'var(--clay-500)';
      return {
        color: 'var(--brand-on)',
        backgroundImage: `linear-gradient(180deg, ${top} 0%, ${up} 5%, ${upMid} 45%, ${loMid} 52%, ${lo} 94%, ${foot} 100%)`,
        border: '1px solid var(--clay-800)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 -1px 1px rgba(33,29,24,0.32), 0 1px 1px rgba(33,29,24,0.10), 0 2px 6px rgba(74,37,23,0.34)',
      };
    }
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style: styleOverride,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = variantStyle(variant, hover && !disabled, active && !disabled);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--fw-semibold)',
        lineHeight: 1,
        letterSpacing: '0.005em',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: active && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background-image var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast), transform var(--dur-fast)',
        whiteSpace: 'nowrap',
        ...v,
        ...styleOverride,
      }}
      {...rest}
    >
      {iconLeft && <span style={{ display: 'inline-flex', flex: 'none' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex' }}>{iconRight}</span>}
    </button>
  );
}
