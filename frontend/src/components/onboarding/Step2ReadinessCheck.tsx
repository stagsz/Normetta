'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useOnboardingStore } from '@/stores/onboardingStore';

const COMPANY_SIZE_OPTIONS = [
  { value: 'MICRO', label: '1-10 employees' },
  { value: 'SMALL', label: '11-50 employees' },
  { value: 'MEDIUM', label: '51-200 employees' },
  { value: 'LARGE', label: '200+ employees' },
];

const QMS_STATUS_OPTIONS = [
  { value: 'NONE', label: "We don't have one yet" },
  { value: 'BUILDING', label: "We're actively building one" },
  { value: 'INFORMAL', label: 'We have informal practices, not documented' },
  { value: 'DOCUMENTED', label: 'We have a documented QMS' },
];

const CERTIFICATION_STATUS_OPTIONS = [
  { value: 'NOT_CERTIFIED', label: 'Not certified' },
  { value: 'IN_PROGRESS', label: 'Working toward certification' },
  { value: 'CERTIFIED_SURVEILLANCE', label: 'Certified — surveillance audit due' },
  { value: 'CERTIFIED_RECERTIFYING', label: 'Certified — recertifying' },
];

const KNOWLEDGE_LEVEL_OPTIONS = [
  { value: 'NONE', label: "I haven't studied ISO 9001" },
  { value: 'BASIC', label: 'Basic awareness' },
  { value: 'TRAINED', label: 'Trained / working knowledge' },
  { value: 'CERTIFIED_AUDITOR', label: 'Certified auditor' },
];

export default function Step2ReadinessCheck() {
  const { profile, setProfile, setStep } = useOnboardingStore();
  const [local, setLocal] = useState(profile);

  const update = <K extends keyof typeof local>(key: K, value: (typeof local)[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    setProfile(local);
    setStep(3);
  };

  const handleBack = () => {
    setProfile(local);
    setStep(1);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        A few questions about where you stand today. This helps us recommend the right starting
        assessment and adjust how much guidance we show you — all optional, and you can update it
        later.
      </p>

      <div>
        <label htmlFor="qmsStatus" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          Do you have a quality management system today?
        </label>
        <Select
          id="qmsStatus"
          options={QMS_STATUS_OPTIONS}
          placeholder="Select an option..."
          value={local.qmsStatus ?? ''}
          onChange={(e) => update('qmsStatus', (e.target.value || undefined) as typeof local.qmsStatus)}
        />
      </div>

      <div>
        <label
          htmlFor="certificationStatus"
          className="block text-sm font-medium text-[var(--text-body)] mb-1"
        >
          Do you hold an ISO 9001 certificate today?
        </label>
        <Select
          id="certificationStatus"
          options={CERTIFICATION_STATUS_OPTIONS}
          placeholder="Select an option..."
          value={local.certificationStatus ?? ''}
          onChange={(e) =>
            update('certificationStatus', (e.target.value || undefined) as typeof local.certificationStatus)
          }
        />
      </div>

      <div>
        <label htmlFor="lastAuditSummary" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          When was your last audit, and how did it go?
        </label>
        <textarea
          id="lastAuditSummary"
          value={local.lastAuditSummary ?? ''}
          onChange={(e) => update('lastAuditSummary', e.target.value)}
          rows={3}
          placeholder="e.g. About 6 months ago — we had findings around document control"
          className="w-full rounded-xl border border-[var(--border-default)] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      <div>
        <label htmlFor="improvementNotes" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          What would you most like to improve?
        </label>
        <textarea
          id="improvementNotes"
          value={local.improvementNotes ?? ''}
          onChange={(e) => update('improvementNotes', e.target.value)}
          rows={3}
          placeholder="e.g. NCRs pile up and nobody owns follow-through"
          className="w-full rounded-xl border border-[var(--border-default)] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      <div>
        <label htmlFor="companySize" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          How many employees does your company have?
        </label>
        <Select
          id="companySize"
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Select a range..."
          value={local.companySize ?? ''}
          onChange={(e) => update('companySize', (e.target.value || undefined) as typeof local.companySize)}
        />
      </div>

      <div>
        <label
          htmlFor="standardsKnowledgeLevel"
          className="block text-sm font-medium text-[var(--text-body)] mb-1"
        >
          How much do you know about ISO 9001?
        </label>
        <Select
          id="standardsKnowledgeLevel"
          options={KNOWLEDGE_LEVEL_OPTIONS}
          placeholder="Select an option..."
          value={local.standardsKnowledgeLevel ?? ''}
          onChange={(e) =>
            update('standardsKnowledgeLevel', (e.target.value || undefined) as typeof local.standardsKnowledgeLevel)
          }
        />
      </div>

      <div>
        <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-[var(--text-body)] mb-1">
          How many hours a week can you dedicate to this?
        </label>
        <Input
          id="hoursPerWeek"
          type="number"
          min={0}
          max={168}
          placeholder="e.g. 3"
          value={local.hoursPerWeek ?? ''}
          onChange={(e) => update('hoursPerWeek', e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
          Back
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={handleContinue}>
          Skip
        </Button>
        <Button type="button" className="flex-1" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
