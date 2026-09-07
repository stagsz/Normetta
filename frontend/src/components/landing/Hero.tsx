'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <div className="mx-auto max-w-7xl md:px-10">
      <div className="grid items-center gap-8 px-6 pt-28 pb-8 md:grid-cols-2 md:gap-12 md:pt-40 md:pb-14">
        <div>
          <div className="hero-eyebrow">
            ISO 9001 Quality Management
          </div>
          <h1 className="font-serif text-[clamp(36px,5vw,58px)] leading-[1.08] tracking-[-0.01em]">
            Audit with <em className="text-[#0f766e]">confidence,</em> not paperwork.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#6b7280]">
            Replace spreadsheets and email chains with one platform for self-assessments, audits, NCR tracking, and CAPA.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn-primary">
              Start free trial
            </Link>
            <Link href="#how" className="btn-ghost">
              See how it works
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-xl border border-white/5 bg-[#1c2230] p-6 shadow-2xl shadow-[#0e1117]/12">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-1 text-xs text-white/30">Normetta — Dashboard</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/6 bg-[var(--surface-card)]/5 p-3">
                <div className="text-lg font-semibold text-white tracking-tight">94%</div>
                <div className="text-[11px] text-white/40">Compliance score</div>
                <div className="mt-1 text-[11px] text-[var(--brand-soft)]">↑ 6% this quarter</div>
              </div>
              <div className="rounded-lg border border-white/6 bg-[var(--surface-card)]/5 p-3">
                <div className="text-lg font-semibold text-white tracking-tight">12</div>
                <div className="text-[11px] text-white/40">Open NCRs</div>
                <div className="mt-1 text-[11px] text-[var(--brand-soft)]">↓ 4 from last audit</div>
              </div>
              <div className="rounded-lg border border-white/6 bg-[var(--surface-card)]/5 p-3">
                <div className="text-lg font-semibold text-white tracking-tight">3</div>
                <div className="text-[11px] text-white/40">Audits this month</div>
                <div className="mt-1 text-[11px] text-[var(--brand-soft)]">On schedule</div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-md bg-[var(--surface-card)]/4 border border-white/5 px-3 py-2">
                <span className="badge-open">Open</span>
                <span className="flex-1 truncate text-xs text-white/55">Calibration records missing — Clause 7.1.5</span>
                <span className="text-[11px] text-white/25">May 28</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-[var(--surface-card)]/4 border border-white/5 px-3 py-2">
                <span className="badge-review">Review</span>
                <span className="flex-1 truncate text-xs text-white/55">Supplier qualification procedure update</span>
                <span className="text-[11px] text-white/25">May 26</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-[var(--surface-card)]/4 border border-white/5 px-3 py-2">
                <span className="badge-closed">Closed</span>
                <span className="flex-1 truncate text-xs text-white/55">Internal audit report Q1 — Clause 9.2</span>
                <span className="text-[11px] text-white/25">May 20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}