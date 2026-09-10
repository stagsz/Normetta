'use client';

import React from 'react';
import { CrownedCard } from './CrownedCard';
import { cn } from '@/lib/utils';

export interface QuestionCardProps {
  questionNumber: string;
  questionText: string;
  guidance?: string;
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification: string;
  onScoreChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  onJustificationChange: (justification: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * QuestionCard - Displays an audit question with scoring interface
 * Features crowned design with score buttons and justification textarea
 */
export function QuestionCard({
  questionNumber,
  questionText,
  guidance,
  score,
  justification,
  onScoreChange,
  onJustificationChange,
  disabled = false,
  className,
}: QuestionCardProps) {
  const scoreLabels = {
    1: 'Non-compliant',
    2: 'Partially compliant',
    3: 'Fully compliant',
  };

  const scoreColors = {
    1: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--border-subtle)]',
      text: 'text-[var(--status-fail-fg)]',
      activeBg: 'bg-[var(--status-fail-bg)]',
      activeBorder: 'border-[var(--status-fail-line)]',
      activeText: 'text-[var(--status-fail-fg)]',
    },
    2: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--border-subtle)]',
      text: 'text-[var(--status-obs-fg)]',
      activeBg: 'bg-[var(--status-obs-bg)]',
      activeBorder: 'border-[var(--status-obs-line)]',
      activeText: 'text-[var(--status-obs-fg)]',
    },
    3: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--border-subtle)]',
      text: 'text-[var(--status-pass-fg)]',
      activeBg: 'bg-[var(--status-pass-bg)]',
      activeBorder: 'border-[var(--status-pass-line)]',
      activeText: 'text-[var(--status-pass-fg)]',
    },
  };

  const getCrownColor = (): 'sage' | 'olive' | 'forest' | 'lime' => {
    if (score === 1) return 'sage';
    if (score === 2) return 'lime';
    if (score === 3) return 'forest';
    return 'sage';
  };

  return (
    <CrownedCard
      crownColor={getCrownColor()}
      className={cn('animate-fade-in', className)}
      disabled={disabled}
      crownHeight={25}
    >
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--brand-soft)] text-[var(--text-link)] font-display font-bold text-sm flex-shrink-0">
            {questionNumber}
          </span>
          <h3 className="font-display font-bold text-lg text-[var(--text-strong)] leading-tight flex-1">
            {questionText}
          </h3>
        </div>

        {guidance && (
          <div className="ml-14 p-4 bg-[var(--surface-sunken)] rounded-xl border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-muted)] leading-generous italic">
              {guidance}
            </p>
          </div>
        )}
      </div>

      {/* Score Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-strong)] mb-3">
          Compliance Score
        </label>
        <div className="grid grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((scoreValue) => {
            const colors = scoreColors[scoreValue];
            const isActive = score === scoreValue;

            return (
              <button
                key={scoreValue}
                type="button"
                onClick={() => !disabled && onScoreChange(scoreValue)}
                disabled={disabled}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-300',
                  'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isActive
                    ? cn(colors.activeBg, colors.activeBorder, colors.activeText, 'shadow-[var(--shadow-md)] scale-105')
                    : cn(colors.bg, colors.border, colors.text)
                )}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{scoreValue}</div>
                  <div className="text-xs font-medium leading-tight">
                    {scoreLabels[scoreValue]}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--brand)] rounded-full flex items-center justify-center shadow-[var(--shadow-md)]">
                    <svg
                      className="w-4 h-4 text-[var(--text-on-brand)]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Justification */}
      <div>
        <label htmlFor={`justification-${questionNumber}`} className="block text-sm font-medium text-[var(--text-strong)] mb-3">
          Justification & Evidence
        </label>
        <textarea
          id={`justification-${questionNumber}`}
          value={justification}
          onChange={(e) => !disabled && onJustificationChange(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Provide detailed justification for your score, including evidence and observations..."
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)]',
            'placeholder:text-[var(--text-subtle)] leading-generous resize-none'
          )}
        />
      </div>
    </CrownedCard>
  );
}

export default QuestionCard;
