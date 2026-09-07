const { useState } = React;

export function Select({
  label,
  hint,
  value,
  defaultValue,
  options = [],
  placeholder,
  size = 'md',
  disabled = false,
  onChange,
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
  const fid = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', fontFamily: 'var(--font-sans)' }}>
      {label && (
        <label htmlFor={fid} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-strong)' }}>{label}</label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={fid}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: 'none', WebkitAppearance: 'none',
            width: '100%', height: heights[size] || heights.md,
            padding: '0 36px 0 12px',
            background: disabled ? 'var(--stone-50)' : 'var(--surface-card)',
            border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: focus ? 'var(--ring)' : 'var(--shadow-xs)',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)',
            color: 'var(--text-strong)', cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1, outline: 'none',
            transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
          }}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', right: 12, pointerEvents: 'none', color: 'var(--text-muted)' }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {hint && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}
