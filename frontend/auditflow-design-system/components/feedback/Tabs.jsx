const { useState } = React;

export function Tabs({ tabs = [], value, defaultValue, onChange }) {
  const isControlled = value !== undefined;
  const first = defaultValue ?? (tabs[0] && tabs[0].id);
  const [internal, setInternal] = useState(first);
  const active = isControlled ? value : internal;

  const select = (id) => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };

  return (
    <div role="tablist" style={{
      display: 'inline-flex', gap: 2, alignItems: 'center',
      padding: 3, background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => select(t.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
              cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)',
              color: on ? 'var(--text-strong)' : 'var(--text-muted)',
              background: on ? 'var(--surface-card)' : 'transparent',
              boxShadow: on ? 'var(--shadow-xs)' : 'none',
              transition: 'background var(--dur-fast), color var(--dur-fast)',
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                padding: '1px 6px', borderRadius: 'var(--radius-pill)',
                background: on ? 'var(--brand-soft)' : 'var(--stone-200)',
                color: on ? 'var(--brand-strong)' : 'var(--text-muted)',
              }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
