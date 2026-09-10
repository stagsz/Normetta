function Dashboard({ onOpenFindings, onStartAssessment, showBanner = true }) {
  const DS = window.AuditFlowDesignSystem_900961;
  const { Card, ScoreGauge, ConformanceBadge, ProgressBar, Badge, Button, Callout, Carousel } = DS;
  const Icon = window.AFIcon;
  const { CLAUSES, FINDINGS, ACTIVITY } = window.AFData;

  const totals = CLAUSES.reduce((a, c) => ({
    total: a.total + c.total, conformant: a.conformant + c.conformant,
    observation: a.observation + c.observation, nonconformity: a.nonconformity + c.nonconformity,
  }), { total: 0, conformant: 0, observation: 0, nonconformity: 0 });

  const Stat = ({ icon, tone, value, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center', flex: 'none',
        background: `var(--status-${tone}-bg)`, color: `var(--status-${tone}-fg)` }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );

  const ActivityCard = ({ a }) => (
    <Card padding="md" elevation="sm">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="af-mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.id}</span>
        {a.kind === 'audit'
          ? <Badge tone="info" dot>Audit</Badge>
          : <Badge tone={a.score >= 85 ? 'pass' : a.score >= 60 ? 'obs' : 'fail'}>{a.score}%</Badge>}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.3 }}>{a.title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{a.meta}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <Icon name={a.kind === 'audit' ? 'calendar' : 'clock'} size={14} color="var(--text-subtle)" />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.when}</span>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {showBanner && (
      <Callout tone="fail" title="2 nonconformities are blocking your certification audit"
        action={<Button size="sm" variant="danger" onClick={onOpenFindings}>Review findings</Button>}>
        Clauses 8.5.1 and 9.2.2 have open major findings past their due date. Resolve and verify before 30 June.
      </Callout>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18 }}>
        <Card padding="lg" elevation="sm">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span className="af-eyebrow">Audit readiness</span>
            <ScoreGauge value={92} size={156} thickness={14} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--status-pass-fg)', fontWeight: 600 }}>
              <Icon name="trending-up" size={15} /> +6 pts since last review
            </div>
            <Button variant="primary" fullWidth iconLeft={<Icon name="clipboard-check" size={17} />} onClick={onStartAssessment}>
              Continue self-assessment
            </Button>
          </div>
        </Card>

        <Card title="This management system at a glance" subtitle="113 controls across ISO 9001:2015 clauses 4–10" padding="lg" elevation="sm">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 6 }}>
            <Stat icon="check" tone="pass" value={totals.conformant} label="Conformant" />
            <Stat icon="alert-triangle" tone="obs" value={totals.observation} label="Observations" />
            <Stat icon="x" tone="fail" value={totals.nonconformity} label="Nonconformities" />
            <Stat icon="clock" tone="na" value={totals.total - totals.conformant - totals.observation - totals.nonconformity} label="Not yet assessed" />
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '20px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>Overall conformity</span>
            <span className="af-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>87.5%</span>
          </div>
          <ProgressBar segments={[
            { value: Math.round(totals.conformant / totals.total * 100), tone: 'pass' },
            { value: Math.round(totals.observation / totals.total * 100), tone: 'obs' },
            { value: Math.round(totals.nonconformity / totals.total * 100), tone: 'fail' },
          ]} size="lg" />
        </Card>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>Recent activity &amp; upcoming audits</h3>
          <Button size="sm" variant="ghost" iconRight={<Icon name="arrow-right" size={15} />}>View all</Button>
        </div>
        <Carousel variant="row" slideWidth={248} gap={14} ariaLabel="Recent activity and upcoming audits">
          {ACTIVITY.map(a => <ActivityCard key={a.id} a={a} />)}
        </Carousel>
      </div>

      <Card padding="none" elevation="sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>Conformity by clause</h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Self-assessment progress per ISO 9001 section</span>
          </div>
          <Button size="sm" variant="secondary" iconRight={<Icon name="arrow-right" size={15} />}>Full report</Button>
        </div>
        <div>
          {CLAUSES.map((c, i) => {
            const pct = Math.round(c.conformant / c.total * 100);
            const status = c.nonconformity > 0 ? 'nonconformity' : c.observation > 0 ? 'observation' : 'conformant';
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 200px 130px 110px', alignItems: 'center', gap: 16,
                padding: '13px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                <span className="af-mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand)' }}>{c.id}</span>
                <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-strong)' }}>{c.title}</span>
                <ProgressBar segments={[
                  { value: c.conformant / c.total * 100, tone: 'pass' },
                  { value: c.observation / c.total * 100, tone: 'obs' },
                  { value: c.nonconformity / c.total * 100, tone: 'fail' },
                ]} />
                <span className="af-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.conformant}/{c.total} · {pct}%</span>
                <div style={{ justifySelf: 'end' }}><ConformanceBadge status={status} /></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

window.AFDashboard = Dashboard;
