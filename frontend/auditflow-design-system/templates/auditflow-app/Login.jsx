function Login({ onSignIn }) {
  const DS = window.AuditFlowDesignSystem_900961;
  const { Button, Input, Checkbox } = DS;
  const Icon = window.AFIcon;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', fontFamily: 'var(--font-sans)' }}>
      {/* Form side */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40, background: 'var(--surface-card)' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <img src="../../assets/logo-full.svg" alt="Normetta" style={{ height: 32, marginBottom: 36 }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--text-strong)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 28px' }}>Sign in to continue your ISO 9001 self-assessment.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Work email" type="email" defaultValue="dana.okoye@northwind.co" iconLeft={<Icon name="users" size={16} />} />
            <Input label="Password" type="password" defaultValue="••••••••••" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox label="Keep me signed in" defaultChecked />
              <a href="#" style={{ fontSize: 13, fontWeight: 500 }}>Forgot password?</a>
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={onSignIn} iconRight={<Icon name="arrow-right" size={17} />}>Sign in</Button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: 'var(--text-muted)' }}>
            New to Normetta? <a href="#" style={{ fontWeight: 600 }}>Start a free assessment</a>
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div style={{ position: 'relative', background: 'var(--stone-900)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 56, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--clay-900) 1px, transparent 1px), linear-gradient(90deg, var(--clay-900) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.08)', marginBottom: 24 }}>
            <Icon name="shield-check" size={15} color="var(--clay-200)" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--clay-100)', letterSpacing: '0.02em' }}>Audit-ready, year round</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 380 }}>
            Know exactly where you stand before the auditor arrives.
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--stone-300)', lineHeight: 1.6, maxWidth: 360, margin: 0 }}>
            Self-assess against every ISO 9001 clause, capture evidence in one place, and close nonconformities before they become findings.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
            {[['113', 'controls tracked'], ['92%', 'audit readiness'], ['3', 'days to certification']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--clay-200)', letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 12.5, color: 'var(--stone-400)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.AFLogin = Login;
