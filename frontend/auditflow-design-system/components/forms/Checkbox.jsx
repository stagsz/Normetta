const { useState } = React;

export function Checkbox({
  label,
  description,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id,
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const fid = id || (label ? `cb-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const handle = (e) => {
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };

  return (
    <label
      htmlFor={fid}
      style={{
        display: 'flex', gap: 10, alignItems: description ? 'flex-start' : 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', flex: 'none', marginTop: description ? 1 : 0 }}>
        <input
          id={fid}
          type="checkbox"
          checked={on}
          disabled={disabled}
          onChange={handle}
          style={{ position: 'absolute', opacity: 0, width: 18, height: 18, margin: 0, cursor: 'inherit' }}
        />
        <span aria-hidden="true" style={{
          width: 18, height: 18, display: 'grid', placeItems: 'center',
          border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-xs)',
          background: on ? 'var(--brand)' : 'var(--surface-card)',
          transition: 'background var(--dur-fast), border-color var(--dur-fast)',
        }}>
          {on && (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      </span>
      {(label || description) && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {label && <span style={{ fontSize: 'var(--text-md)', color: 'var(--text-strong)', fontWeight: 'var(--fw-medium)', lineHeight: 1.3 }}>{label}</span>}
          {description && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</span>}
        </span>
      )}
    </label>
  );
}
