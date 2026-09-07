export function Card({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  elevation = 'md',
  as = 'div',
  ...rest
}) {
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-6)' };
  const shadows = { none: 'none', xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)' };
  const Tag = as;
  const hasHeader = title || subtitle || action;

  return (
    <Tag
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: shadows[elevation] ?? shadows.sm,
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        ...rest.style,
      }}
      {...rest}
    >
      {hasHeader && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          padding: `${pads[padding]} ${pads[padding]} 0`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>}
            {subtitle && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{subtitle}</span>}
          </div>
          {action && <div style={{ flex: 'none' }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: pads[padding] }}>{children}</div>
    </Tag>
  );
}
