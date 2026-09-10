'use client';

const features = [
  {
    num: '01',
    title: 'Self-Assessment Management',
    desc: 'Guided clause-by-clause workflows for ISO 9001 self-assessments with evidence collection, scoring, and gap analysis.',
  },
  {
    num: '02',
    title: 'Audit Planning &amp; Execution',
    desc: 'Schedule audits, assign auditors, define scope, and run structured sessions with real-time progress tracking.',
  },
  {
    num: '03',
    title: 'Non-Conformity Tracking',
    desc: 'Document, grade, and assign NCRs with full audit trail from discovery through resolution.',
  },
  {
    num: '04',
    title: 'Corrective Actions (CAPA)',
    desc: 'Root cause analysis, planning, owner assignment, and effectiveness verification in one closed loop.',
  },
  {
    num: '05',
    title: 'Reporting &amp; Analytics',
    desc: 'Executive dashboards, trend analysis, and compliance reports for management reviews and audits.',
  },
  {
    num: '06',
    title: 'Role-Based Access Control',
    desc: 'Admin, Quality Manager, and Auditor roles with granular permissions — each user sees only what they need.',
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-b border-[#e4e2dd] bg-[var(--surface-card)]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="mb-16">
          <div className="section-label">Platform capabilities</div>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight">
            Everything a QMS needs.<br />Nothing it doesn&apos;t.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b7280]">
            Built specifically for ISO 9001 — not a generic task tracker retrofitted with compliance labels.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="feat-card rounded-lg border border-[#e4e2dd] bg-[var(--surface-card)] p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">{feature.num}</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">{feature.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}