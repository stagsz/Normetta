const { useState: useFState } = React;

function Findings() {
  const DS = window.AuditFlowDesignSystem_900961;
  const { Card, Tabs, ConformanceBadge, Avatar, Badge, Button, IconButton } = DS;
  const Icon = window.AFIcon;
  const { FINDINGS } = window.AFData;
  const [tab, setTab] = useFState('open');

  const open = FINDINGS.filter(f => f.status !== 'closed');
  const ncs = FINDINGS.filter(f => f.status === 'nonconformity');
  const shown = tab === 'nc' ? ncs : tab === 'obs' ? FINDINGS.filter(f => f.status === 'observation') : open;

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'open', label: 'All open', count: open.length },
          { id: 'nc', label: 'Nonconformities', count: ncs.length },
          { id: 'obs', label: 'Observations', count: FINDINGS.filter(f => f.status === 'observation').length },
        ]} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="md" variant="secondary" iconLeft={<Icon name="filter" size={16} />}>Filter</Button>
          <Button size="md" variant="primary" style={{ background: 'rgba(189, 109, 74, 0.976)' }} iconLeft={<Icon name="plus" size={16} />}>Log finding</Button>
        </div>
      </div>

      <Card padding="none" elevation="sm">
        <div style={{ display: 'grid', gridTemplateColumns: '150px 70px 1fr 160px 130px 44px', gap: 14,
          padding: '12px 20px', background: 'var(--stone-50)', borderBottom: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-subtle)' }}>
          <span>Finding</span><span>Clause</span><span>Description</span><span>Owner</span><span>Due</span><span></span>
        </div>
        {shown.map((f, i) => (
          <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '150px 70px 1fr 160px 130px 44px', gap: 14, alignItems: 'center',
            padding: '14px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="af-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{f.id}</span>
              <ConformanceBadge status={f.status} label={f.severity} />
            </div>
            <span className="af-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)' }}>{f.clause}</span>
            <span style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.4 }}>{f.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Avatar name={f.owner} size="sm" tone="slate" />
              <span style={{ fontSize: 13.5, color: 'var(--text-body)' }}>{f.owner}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="calendar" size={15} color={f.overdue ? 'var(--status-fail-solid)' : 'var(--text-subtle)'} />
              <span className="af-mono" style={{ fontSize: 13, color: f.overdue ? 'var(--status-fail-fg)' : 'var(--text-muted)', fontWeight: f.overdue ? 600 : 400 }}>{f.due}</span>
            </div>
            <IconButton label="More actions" variant="ghost" size="sm"><Icon name="more-horizontal" size={18} /></IconButton>
          </div>
        ))}
      </Card>
    </div>
  );
}

window.AFFindings = Findings;
