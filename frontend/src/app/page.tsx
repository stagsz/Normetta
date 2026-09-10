import type { Metadata } from 'next';
import { landingPageMetadata, jsonLdStructuredData } from '@/lib/landing-page-metadata';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = landingPageMetadata as Metadata;

export default function Page() {
  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#0e1117] antialiased">

      {/* ===== NAV ===== */}
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#e4e2dd] bg-[#f9f8f6]/88 px-6 md:px-10 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Audit<span className="text-[#0f766e]">Flow</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Features</Link>
          <Link href="#how" className="text-sm text-[#6b7280] hover:text-[#0e1117]">How it works</Link>
          <Link href="#pricing" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Pricing</Link>
          <span className="rounded-md bg-[#0e1117]/10 px-4 py-2 text-sm font-medium text-[#0e1117]/60 cursor-not-allowed">Coming soon</span>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="mx-auto max-w-7xl md:px-10">
        <div className="grid items-center gap-8 px-6 pt-28 pb-8 md:grid-cols-2 md:gap-12 md:pt-40 md:pb-14">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0f766e]">
              <span className="block h-px w-5 bg-[#0f766e]" />
              ISO 9001 Quality Management
            </div>
            <h1 className="font-serif text-[clamp(36px,5vw,58px)] leading-[1.08] tracking-[-0.01em]">
              Audit with <em className="text-[#0f766e]">confidence,</em> not paperwork.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#6b7280]">
              Replace spreadsheets and email chains with one platform for self-assessments, audits, NCR tracking, and CAPA.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/register" className="inline-flex items-center rounded-md bg-[#0f766e] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a5c55]">Start free trial</Link>
              <Link href="#how" className="inline-flex items-center gap-2 text-sm text-[#0e1117] border-b border-[#e4e2dd] pb-[1px] hover:border-[#0e1117]">
                See how it works <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-xl border border-white/5 bg-[#1c2230] p-6 shadow-2xl shadow-[#0e1117]/12">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-1 text-xs text-white/30">AuditFlow — Dashboard</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/6 bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white tracking-tight">94%</div>
                  <div className="text-[11px] text-white/40">Compliance score</div>
                  <div className="mt-1 text-[11px] text-emerald-300">↑ 6% this quarter</div>
                </div>
                <div className="rounded-lg border border-white/6 bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white tracking-tight">12</div>
                  <div className="text-[11px] text-white/40">Open NCRs</div>
                  <div className="mt-1 text-[11px] text-emerald-300">↓ 4 from last audit</div>
                </div>
                <div className="rounded-lg border border-white/6 bg-white/5 p-3">
                  <div className="text-lg font-semibold text-white tracking-tight">3</div>
                  <div className="text-[11px] text-white/40">Audits this month</div>
                  <div className="mt-1 text-[11px] text-emerald-300">On schedule</div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-md bg-white/4 border border-white/5 px-3 py-2">
                  <span className="rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-300">Open</span>
                  <span className="flex-1 truncate text-xs text-white/55">Calibration records missing — Clause 7.1.5</span>
                  <span className="text-[11px] text-white/25">May 28</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/4 border border-white/5 px-3 py-2">
                  <span className="rounded bg-amber-300/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">Review</span>
                  <span className="flex-1 truncate text-xs text-white/55">Supplier qualification procedure update</span>
                  <span className="text-[11px] text-white/25">May 26</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/4 border border-white/5 px-3 py-2">
                  <span className="rounded bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">Closed</span>
                  <span className="flex-1 truncate text-xs text-white/55">Internal audit report Q1 — Clause 9.2</span>
                  <span className="text-[11px] text-white/25">May 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" className="border-t border-b border-[#e4e2dd] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16">
            <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-[#0f766e]">
              <span className="block h-px w-4 bg-[#0f766e]" />
              Platform capabilities
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight">Everything a QMS needs.<br />Nothing it doesn&apos;t.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b7280]">
              Built specifically for ISO 9001 — not a generic task tracker retrofitted with compliance labels.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">01</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Self-Assessment Management</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Guided clause-by-clause workflows for ISO 9001 self-assessments with evidence collection, scoring, and gap analysis.</p>
            </div>
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">02</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Audit Planning & Execution</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Schedule audits, assign auditors, define scope, and run structured sessions with real-time progress tracking.</p>
            </div>
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">03</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Non-Conformity Tracking</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Document, grade, and assign NCRs with full audit trail from discovery through resolution.</p>
            </div>
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">04</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Corrective Actions (CAPA)</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Root cause analysis, planning, owner assignment, and effectiveness verification in one closed loop.</p>
            </div>
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">05</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Reporting & Analytics</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Executive dashboards, trend analysis, and compliance reports for management reviews and audits.</p>
            </div>
            <div className="rounded-lg border border-[#e4e2dd] bg-white p-6">
              <div className="text-xs font-medium tracking-[0.06em] text-[#0f766e]">06</div>
              <div className="mt-4 text-sm font-medium text-[#0e1117]">Role-Based Access Control</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">Admin, Quality Manager, and Auditor roles with granular permissions — each user sees only what they need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW ===== */}
      <section id="how" className="relative bg-[#0e1117] overflow-hidden">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.35)_0%,transparent_70%)]" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16">
            <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-emerald-300">
              <span className="block h-px w-4 bg-emerald-300" />
              Workflow
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight text-white">From assessment to certification-ready.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">A structured four-step process that mirrors how your certification body evaluates your QMS.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {title:'Plan your audit',desc:'Define scope, select ISO 9001 clauses, set the schedule, and assign the audit team with included templates.'},
              {title:'Execute & evidence',desc:'Run structured interviews and observations. Attach evidence to findings in real time, not after.'},
              {title:'Manage findings',desc:'Raise non-conformities and observations, assign owners, due dates, and corrective actions.'},
              {title:'Close the loop',desc:'Track CAPA completion, verify effectiveness, and generate the final audit report in one click.'},
            ].map((item, idx) => (
              <div key={item.title} className="relative rounded-lg border border-white/8 bg-white/[0.04] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold" style={{background: ['rgba(251,146,60,0.15)','rgba(96,165,250,0.15)','rgba(167,139,250,0.15)','rgba(52,211,153,0.15)'][idx], border: `1px solid ${['rgba(251,146,60,0.25)','rgba(96,165,250,0.25)','rgba(167,139,250,0.25)','rgba(52,211,153,0.25)'][idx]}`}}>
                  {idx + 1}
                </div>
                <div className="mt-3 h-1 w-5 rounded-full" style={{background: ['#fb923c','#60a5fa','#a78bfa','#34d399'][idx]}} />
                <div className="mt-3 text-sm font-medium text-white">{item.title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-[#f9f8f6]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-16 text-center">
            <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-[#0f766e]">
              <span className="block h-px w-4 bg-[#0f766e]" />
              Pricing
            </div>
            <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-tight">Straightforward plans. No surprises.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">All plans include full ISO 9001:2015 clause coverage. Upgrade as your team grows.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-[#e4e2dd] bg-white p-7">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-[#6b7280]">Starter</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-4xl font-semibold tracking-tight">€49</div>
                <div className="text-xs text-[#6b7280]">per month</div>
              </div>
              <div className="mt-1 text-xs text-[#6b7280]">Up to 10 users</div>
              <div className="my-5 h-px bg-[#e4e2dd]" />
              <ul className="flex flex-col gap-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> Unlimited audits</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> Self-assessment module</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> NCR & CAPA tracking</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> Basic reporting & dashboards</li>
              </ul>
              <Link href="/register" className="mt-6 block w-full rounded-lg border border-[#e4e2dd] py-2.5 text-center text-sm font-medium text-[#0e1117] hover:border-[#0e1117]">Start 14-day trial</Link>
            </div>

            <div className="rounded-xl border border-[#0e1117] bg-[#0e1117] p-7 text-white">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-white/50">Professional</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-4xl font-semibold tracking-tight">€149</div>
                <div className="text-xs text-white/60">per month</div>
              </div>
              <div className="mt-1 text-xs text-white/50">Up to 50 users</div>
              <div className="my-5 h-px bg-white/10" />
              <ul className="flex flex-col gap-2 text-sm text-white/65">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-emerald-300">✓</span> Everything in Starter</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-emerald-300">✓</span> Advanced analytics & custom dashboards</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-emerald-300">✓</span> Evidence attachment & storage</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-emerald-300">✓</span> Audit report generation (PDF)</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-emerald-300">✓</span> Role-based access control</li>
              </ul>
              <Link href="/register" className="mt-6 block w-full rounded-lg bg-white py-2.5 text-center text-sm font-medium text-[#0e1117] hover:bg-[#d1fae5]">Start 14-day trial</Link>
            </div>

            <div className="rounded-xl border border-[#e4e2dd] bg-white p-7">
              <div className="text-xs font-medium uppercase tracking-[0.06em] text-[#6b7280]">Enterprise</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">Custom</div>
              <div className="mt-1 text-xs text-[#6b7280]">50+ users</div>
              <div className="my-5 h-px bg-[#e4e2dd]" />
              <ul className="flex flex-col gap-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> SSO / SAML integration</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> Custom audit templates</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> API access</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-[#0f766e]">✓</span> SLA-backed support</li>
              </ul>
              <a href="mailto:hello@auditflow.io" className="mt-6 block w-full rounded-lg border border-[#e4e2dd] py-2.5 text-center text-sm font-medium text-[#0e1117] hover:border-[#0e1117]">Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[#0e1117]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-10">
          <h2 className="font-serif text-[clamp(26px,4vw,38px)] leading-[1.12] tracking-tight text-white">Ready to run your next audit with confidence?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/55">Set up in minutes. No consultants, no all-day training required.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center rounded-md bg-[#0f766e] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a5c55]">Start free trial</Link>
            <a href="mailto:hello@auditflow.io" className="inline-flex items-center gap-2 border-b border-white/20 pb-[1px] text-sm text-white/60 hover:text-white">Schedule a demo <span aria-hidden>→</span></a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#e4e2dd] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="text-sm font-semibold tracking-tight">Audit<span className="text-[#0f766e]">Flow</span></div>
              <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">Enterprise-grade ISO 9001 quality management and audit platform for teams that take compliance seriously.</p>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#0e1117]">Product</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><Link href="#features" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-[#6b7280] hover:text-[#0e1117]">Pricing</Link></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Changelog</a></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#0e1117]">Use cases</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Internal audits</a></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Self-assessments</a></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Supplier audits</a></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Management review</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#0e1117]">Legal</div>
              <ul className="mt-3 flex flex-col gap-2">
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Privacy policy</a></li>
                <li><a className="text-sm text-[#6b7280] hover:text-[#0e1117]" href="#">Terms of service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#e4e2dd] pt-5 text-xs text-[#6b7280] md:flex-row">
            <span>© 2026 AuditFlow. All rights reserved.</span>
            <span>ISO 9001:2015 Quality Management Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
