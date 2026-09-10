const { useState } = React;

export function Switch({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  id,
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const fid = id || (label ? `sw-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  };

  return (
    <label
      htmlFor={fid}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <button
        id={fid}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        style={{
          position: 'relative', width: 38, height: 22, flex: 'none', padding: 0,
          borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'inherit',
          background: on ? 'var(--brand)' : 'var(--stone-300)',
          transition: 'background var(--dur-medium) var(--ease-standard)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-medium) var(--ease-emphasized)',
        }}/>
      </button>
      {label && <span style={{ fontSize: 'var(--text-md)', color: 'var(--text-strong)', fontWeight: 'var(--fw-medium)' }}>{label}</span>}
    </label>
  );
}
