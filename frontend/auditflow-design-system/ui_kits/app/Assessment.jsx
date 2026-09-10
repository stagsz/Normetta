const { useState: useAState } = React;

const OUTCOMES = [
  { key: 'conformant',    label: 'Conformant',    desc: 'Requirement fully met', tone: 'pass' },
  { key: 'observation',   label: 'Observation',   desc: 'Minor gap / opportunity', tone: 'obs' },
  { key: 'nonconformity', label: 'Nonconformity', desc: 'Requirement not met', tone: 'fail' },
  { key: 'notassessed',   label: 'Not assessed',  desc: 'Skip for now', tone: 'na' },
];
const TONE_OF = { conformant: 'pass', observation: 'obs', nonconformity: 'fail', notassessed: 'na' };

function OutcomeOption({ outcome, selected, onClick }) {
  const Icon = window.AFIcon;
  const iconMap = { conformant: 'check', observation: 'alert-triangle', nonconformity: 'x', notassessed: 'clock' };
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
      borderRadius: 'var(--radius-md)', width: '100%',
      border: `1.5px solid ${selected ? `var(--status-${outcome.tone}-solid)` : 'var(--border-default)'}`,
      background: selected ? `var(--status-${outcome.tone}-bg)` : 'var(--surface-card)',
      boxShadow: selected ? 'none' : 'var(--shadow-xs)',
      transition: 'border-color var(--dur-fast), background var(--dur-fast)',
    }}>
      <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center', flex: 'none',
        background: `var(--status-${outcome.tone}-solid)`, color: '#fff' }}>
        <Icon name={iconMap[outcome.key]} size={17} />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>{outcome.label}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-muted)' }}>{outcome.desc}</span>
      </span>
      <span style={{ width: 18, height: 18, borderRadius: '50%', flex: 'none',
        border: `1.5px solid ${selected ? `var(--status-${outcome.tone}-solid)` : 'var(--border-strong)'}`,
        background: selected ? `var(--status-${outcome.tone}-solid)` : 'transparent',
        display: 'grid', placeItems: 'center' }}>
        {selected && <Icon name="check" size={12} color="#fff" />}
      </span>
    </button>
  );
}

// One question = one slide. Reads/writes its OWN answer by ref, so every slide
// stays mounted and unsaved input survives swiping (form-safe carousel).
function QuestionSlide({ q, number, total, answer, onOutcome, onEvidence, onNotes }) {
  const DS = window.AuditFlowDesignSystem_900961;
  const { Card, Input, ConformanceBadge } = DS;
  const Icon = window.AFIcon;
  return (
    <div style={{ padding: '2px 4px' }}>
      <Card padding="lg" elevation="sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--brand)', padding: '3px 9px', borderRadius: 'var(--radius-sm)' }}>{q.ref}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {number} of {total}</span>
          </span>
          {answer.outcome && <ConformanceBadge status={answer.outcome} />}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.3, margin: '0 0 12px' }}>{q.text}</h2>

        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 13px', background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-md)', marginBottom: 22 }}>
          <Icon name="circle-help" size={17} color="var(--blue-600)" style={{ marginTop: 1 }} />
          <span style={{ fontSize: 13, color: 'var(--stone-700)', lineHeight: 1.5 }}>{q.guidance}</span>
        </div>

        <span className="af-eyebrow" style={{ display: 'block', marginBottom: 10 }}>Conformity rating</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {OUTCOMES.map(o => (
            <OutcomeOption key={o.key} outcome={o} selected={answer.outcome === o.key} onClick={() => onOutcome(q.ref, o.key)} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <Input label="Evidence reference" placeholder="e.g. QP-7.5 Rev 4, calibration register" value={answer.evidence || ''} onChange={(e) => onEvidence(q.ref, e.target.value)}
            iconLeft={<Icon name="paperclip" size={16} />} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)' }}>Auditor notes</label>
            <textarea value={answer.notes || ''} onChange={(e) => onNotes(q.ref, e.target.value)} placeholder="Record what you observed and any gap to close…" rows={3}
              style={{ resize: 'vertical', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
                fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', background: 'var(--surface-card)',
                boxShadow: 'var(--shadow-inset)', outline: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = 'var(--ring)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'var(--shadow-inset)'; }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Assessment() {
  const DS = window.AuditFlowDesignSystem_900961;
  const { Card, Button, Carousel, ProgressBar } = DS;
  const Icon = window.AFIcon;
  const { QUESTIONS } = window.AFData;

  const [idx, setIdx] = useAState(0);
  const [answers, setAnswers] = useAState({});
  const answeredCount = Object.keys(answers).filter(k => answers[k].outcome).length;

  const setOutcome  = (ref, outcome) => setAnswers(a => ({ ...a, [ref]: { ...a[ref], outcome } }));
  const setEvidence = (ref, v) => setAnswers(a => ({ ...a, [ref]: { ...a[ref], evidence: v } }));
  const setNotes    = (ref, v) => setAnswers(a => ({ ...a, [ref]: { ...a[ref], notes: v } }));

  return (
    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 22, alignItems: 'start' }}>
      {/* Left rail: section jump */}
      <Card padding="none" elevation="sm">
        <div style={{ padding: '16px 18px 12px' }}>
          <span className="af-eyebrow">Clause 7 — Support</span>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{answeredCount} of {QUESTIONS.length} answered</div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {QUESTIONS.map((item, i) => {
            const a = answers[item.ref] || {};
            const on = i === idx;
            const tone = a.outcome ? TONE_OF[a.outcome] : null;
            return (
              <button key={item.ref} onClick={() => setIdx(i)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '11px 18px', border: 'none', borderLeft: `2.5px solid ${on ? 'var(--brand)' : 'transparent'}`,
                background: on ? 'var(--brand-soft)' : 'transparent' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', flex: 'none',
                  background: tone ? `var(--status-${tone}-solid)` : 'var(--stone-300)' }} />
                <span className="af-mono" style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--brand-strong)' : 'var(--text-body)' }}>{item.ref}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main: question carousel */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-body)' }}>Question {idx + 1} of {QUESTIONS.length} — Clause 7 · Support</span>
          <span className="af-mono" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{Math.round((idx + 1) / QUESTIONS.length * 100)}%</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <ProgressBar value={(idx + 1) / QUESTIONS.length * 100} size="sm" />
        </div>

        <Carousel variant="page" index={idx} onSlideChange={setIdx} ariaLabel="Assessment questions">
          {QUESTIONS.map((item, i) => (
            <QuestionSlide key={item.ref} q={item} number={i + 1} total={QUESTIONS.length}
              answer={answers[item.ref] || {}} onOutcome={setOutcome} onEvidence={setEvidence} onNotes={setNotes} />
          ))}
        </Carousel>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <Button variant="secondary">Save draft</Button>
          <Button variant="primary" onClick={() => setIdx(i => Math.min(i + 1, QUESTIONS.length - 1))}
            iconRight={<Icon name="arrow-right" size={16} />} disabled={idx === QUESTIONS.length - 1}>Save &amp; next</Button>
        </div>
      </div>
    </div>
  );
}

window.AFAssessment = Assessment;
