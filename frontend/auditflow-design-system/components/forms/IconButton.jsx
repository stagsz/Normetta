const { useState } = React;

const IB_SIZES = { sm: 30, md: 38, lg: 46 };

export function IconButton({
  children,
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const dim = IB_SIZES[size] || IB_SIZES.md;

  // Raised (skeuomorphic) styling for the solid variants; ghost/danger stay flat.
  const raised = {
    primary: {
      rest: {
        color: '#fff',
        backgroundImage: 'linear-gradient(180deg, color-mix(in srgb, var(--clay-300) 72%, #fff) 0%, var(--clay-400) 5%, var(--clay-500) 45%, var(--clay-700) 52%, var(--clay-600) 94%, var(--clay-500) 100%)',
        border: '1px solid var(--clay-800)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 -1px 1px rgba(33,29,24,0.32), 0 1px 1px rgba(33,29,24,0.10), 0 2px 6px rgba(74,37,23,0.34)',
      },
      active: {
        color: '#fff',
        backgroundImage: 'linear-gradient(180deg, var(--clay-800) 0%, var(--clay-700) 46%, var(--clay-600) 54%, var(--clay-500) 100%)',
        border: '1px solid var(--clay-900)',
        boxShadow: 'inset 0 2px 5px rgba(33,29,24,0.45), inset 0 1px 1px rgba(33,29,24,0.30)',
      },
    },
    secondary: {
      rest: {
        color: 'var(--text-body)',
        backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FCFAF6 48%, var(--stone-50) 100%)',
        border: '1px solid var(--border-default)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 1px rgba(33,29,24,0.14), 0 1px 1px rgba(33,29,24,0.10), 0 2px 3px rgba(33,29,24,0.07)',
      },
      active: {
        color: 'var(--text-body)',
        backgroundImage: 'linear-gradient(180deg, var(--stone-100) 0%, #FCFAF6 60%, #FFFFFF 100%)',
        border: '1px solid var(--border-default)',
        boxShadow: 'inset 0 2px 4px rgba(33,29,24,0.30), inset 0 1px 1px rgba(33,29,24,0.20)',
      },
    },
  };

  const flat = {
    ghost: { bg: hover ? 'var(--stone-100)' : 'transparent', fg: 'var(--text-body)', bd: 'transparent' },
    danger: { bg: hover ? 'var(--red-50)' : 'transparent', fg: 'var(--red-600)', bd: 'transparent' },
  };

  const isRaised = raised[variant];
  const r = isRaised && (active && !disabled ? isRaised.active : isRaised.rest);
  const f = !isRaised && (flat[variant] || flat.ghost);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: isRaised && active && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background-image var(--dur-fast) var(--ease-standard), background var(--dur-fast), box-shadow var(--dur-fast), transform var(--dur-fast)',
        ...(isRaised
          ? r
          : { color: f.fg, background: f.bg, border: `1px solid ${f.bd}`, boxShadow: active && !disabled ? 'inset 0 1px 3px rgba(33,29,24,0.14)' : 'none' }),
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
