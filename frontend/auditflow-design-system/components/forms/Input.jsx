const { useState } = React;

export function Input({
  label,
  hint,
  error,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  size = 'md',
  iconLeft,
  disabled = false,
  required = false,
  onChange,
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
  const fid = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const borderColor = error
    ? 'var(--status-fail-solid)'
    : focus ? 'var(--border-focus)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', fontFamily: 'var(--font-sans)' }}>
      {label && (
        <label htmlFor={fid} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-strong)' }}>
          {label}{required && <span style={{ color: 'var(--red-500)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: heights[size] || heights.md,
        padding: '0 12px',
        background: disabled ? 'var(--stone-50)' : 'var(--surface-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--ring)' : 'var(--shadow-inset)',
        transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        opacity: disabled ? 0.6 : 1,
      }}>
        {iconLeft && <span style={{ display: 'inline-flex', color: 'var(--text-subtle)', flex: 'none' }}>{iconLeft}</span>}
        <input
          id={fid}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--text-strong)',
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: 'var(--text-xs)', color: error ? 'var(--status-fail-fg)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
