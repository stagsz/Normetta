'use client';

import { clsx } from 'clsx';

interface ScoreButtonProps {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  selected: boolean;
  onClick: () => void;
  criteria?: string | null;
  disabled?: boolean;
}

const scoreConfig = {
0: {
  label: 'Not Applicable',
  shortLabel: '0',
    bgColor: 'bg-[var(--status-na-bg)] hover:bg-[var(--surface-raised)]',
    selectedBg: 'bg-[var(--status-na-solid)]',
    textColor: 'text-[var(--text-muted)]',
    selectedText: 'text-[var(--ink-0)]',
    borderColor: 'border-[var(--status-na-line)]',
    selectedBorder: 'border-[var(--status-na-solid)]',
    ringColor: 'ring-[var(--status-na-line)]',
  },
  1: {
    label: 'Non-Compliant',
    shortLabel: '1',
    bgColor: 'bg-[var(--status-fail-bg)] hover:bg-[var(--status-fail-line)]',
    selectedBg: 'bg-[var(--status-fail-solid)]',
    textColor: 'text-[var(--status-fail-fg)]',
    selectedText: 'text-white',
    borderColor: 'border-[var(--status-fail-line)]',
    selectedBorder: 'border-[var(--status-fail-solid)]',
    ringColor: 'ring-[var(--status-fail-line)]',
  },
  2: {
    label: 'Initial',
    shortLabel: '2',
    bgColor: 'bg-[var(--status-obs-bg)] hover:bg-[var(--status-obs-line)]',
    selectedBg: 'bg-[var(--status-obs-solid)]',
    textColor: 'text-[var(--status-obs-fg)]',
    selectedText: 'text-[var(--ink-0)]',
    borderColor: 'border-[var(--status-obs-line)]',
    selectedBorder: 'border-[var(--status-obs-solid)]',
    ringColor: 'ring-[var(--status-obs-line)]',
  },
  3: {
    label: 'Developing',
    shortLabel: '3',
    bgColor: 'bg-[rgba(184,165,31,0.14)] hover:bg-[rgba(184,165,31,0.28)]',
    selectedBg: 'bg-[#B8A51F]',
    textColor: 'text-[#E0D48A]',
    selectedText: 'text-[var(--ink-0)]',
    borderColor: 'border-[rgba(184,165,31,0.34)]',
    selectedBorder: 'border-[#B8A51F]',
    ringColor: 'ring-[rgba(184,165,31,0.4)]',
  },
  4: {
    label: 'Established',
    shortLabel: '4',
    bgColor: 'bg-[var(--status-pass-bg)] hover:bg-[var(--status-pass-line)]',
    selectedBg: 'bg-[var(--status-pass-solid)]',
    textColor: 'text-[var(--status-pass-fg)]',
    selectedText: 'text-[var(--ink-0)]',
    borderColor: 'border-[var(--status-pass-line)]',
    selectedBorder: 'border-[var(--status-pass-solid)]',
    ringColor: 'ring-[var(--status-pass-line)]',
  },
  5: {
    label: 'Optimizing',
    shortLabel: '5',
    bgColor: 'bg-[rgba(91,140,168,0.14)] hover:bg-[rgba(91,140,168,0.28)]',
    selectedBg: 'bg-[var(--blue-500)]',
    textColor: 'text-[var(--blue-100)]',
    selectedText: 'text-white',
    borderColor: 'border-[rgba(91,140,168,0.34)]',
    selectedBorder: 'border-[var(--blue-500)]',
    ringColor: 'ring-[rgba(91,140,168,0.4)]',
  },
};

export function ScoreButton({ score, selected, onClick, criteria, disabled }: ScoreButtonProps) {
  const config = scoreConfig[score];

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          'score-button flex flex-col items-center justify-center p-3 rounded-xl border-2 min-w-[90px] transition-all duration-200',
          selected
            ? `${config.selectedBg} ${config.selectedBorder} ${config.selectedText} ring-2 ring-offset-2 ring-offset-[var(--surface-card)] ${config.ringColor} shadow-[var(--shadow-md)]`
            : `${config.bgColor} ${config.borderColor} ${config.textColor}`,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-xl font-bold">{config.shortLabel}</span>
        <span className="text-xs mt-1 text-center leading-tight">{config.label}</span>
      </button>

      {/* Tooltip with criteria */}
      {criteria && criteria.trim() && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-strong)] text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10 pointer-events-none shadow-[var(--shadow-lg)]">
          <div className="font-medium mb-1">{config.label}</div>
          <div className="text-[var(--text-muted)] text-xs">{criteria}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-[var(--surface-raised)]" />
        </div>
      )}
    </div>
  );
}

interface ScoreGroupProps {
  value?: 0 | 1 | 2 | 3 | 4 | 5;
  onChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  criteria: {
    score0?: string | null;
    score1?: string | null;
    score2?: string | null;
    score3?: string | null;
    score4?: string | null;
    score5?: string | null;
  };
  disabled?: boolean;
}

export function ScoreGroup({ value, onChange, criteria, disabled }: ScoreGroupProps) {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <ScoreButton
        score={0}
        selected={value === 0}
        onClick={() => onChange(0)}
        criteria={criteria.score0 || 'Not applicable to this organization'}
        disabled={disabled}
      />
      <ScoreButton
        score={1}
        selected={value === 1}
        onClick={() => onChange(1)}
        criteria={criteria.score1 || 'No evidence, not addressed'}
        disabled={disabled}
      />
      <ScoreButton
        score={2}
        selected={value === 2}
        onClick={() => onChange(2)}
        criteria={criteria.score2 || 'Awareness exists, no formal implementation'}
        disabled={disabled}
      />
      <ScoreButton
        score={3}
        selected={value === 3}
        onClick={() => onChange(3)}
        criteria={criteria.score3 || 'Partially implemented, inconsistent'}
        disabled={disabled}
      />
      <ScoreButton
        score={4}
        selected={value === 4}
        onClick={() => onChange(4)}
        criteria={criteria.score4 || 'Fully implemented, consistent application'}
        disabled={disabled}
      />
      <ScoreButton
        score={5}
        selected={value === 5}
        onClick={() => onChange(5)}
        criteria={criteria.score5 || 'Exceeds requirements, continual improvement'}
        disabled={disabled}
      />
    </div>
  );
}
