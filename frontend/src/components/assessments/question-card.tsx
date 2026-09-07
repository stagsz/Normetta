'use client';

import { clsx } from 'clsx';
import { HelpCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreGroup } from '@/components/ui/score-button';

export interface Question {
  id: string;
  questionNumber: string;
  questionText: string;
  guidance?: string | null;
  standardReference?: string | null;
  score0Criteria?: string | null;
  score1Criteria?: string | null;
  score2Criteria?: string | null;
  score3Criteria?: string | null;
  score4Criteria?: string | null;
  score5Criteria?: string | null;
}

export interface QuestionResponse {
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification?: string;
  isDraft?: boolean;
}

export const MAX_JUSTIFICATION_LENGTH = 2000;

interface QuestionCardProps {
  question: Question;
  response?: QuestionResponse;
  onScoreChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  onJustificationChange?: (justification: string) => void;
  disabled?: boolean;
  showGuidance?: boolean;
  className?: string;
}

// --- shared scoring semantics for 1–5 scale ---
export const SCORE_LABELS = ['Not Applicable', 'Non-Compliant', 'Initial', 'Developing', 'Established', 'Optimizing'] as const;
export const SCORE_SHORT_LABELS = ['N/A', 'NC', 'Initial', 'Developing', 'Established', 'Optimizing'] as const;
export const SCORE_COLORS = {
  0: { bg: 'bg-[var(--status-na-bg)]', text: 'text-[var(--status-na-fg)]', border: 'border-l-[var(--status-na-solid)]' },
  1: { bg: 'bg-[var(--status-fail-bg)]', text: 'text-[var(--status-fail-fg)]', border: 'border-l-red-500' },
  2: { bg: 'bg-[var(--status-obs-bg)]', text: 'text-[var(--status-obs-fg)]', border: 'border-l-orange-500' },
  3: { bg: 'bg-[var(--status-obs-bg)]', text: 'text-[var(--status-obs-fg)]', border: 'border-l-yellow-500' },
  4: { bg: 'bg-[var(--status-pass-bg)]', text: 'text-[var(--status-pass-fg)]', border: 'border-l-green-500' },
  5: { bg: 'bg-info-50', text: 'text-info-700', border: 'border-l-blue-500' },
} as const;

export function badgeClassesForScore(score: number) {
  return SCORE_COLORS[score as keyof typeof SCORE_COLORS] ?? SCORE_COLORS[4];
}

export function QuestionCard({
  question,
  response,
  onScoreChange,
  onJustificationChange,
  disabled = false,
  showGuidance = true,
  className,
}: QuestionCardProps) {
  const currentScore = response?.score;
  const hasScore = currentScore !== null && currentScore !== undefined;
  const justificationText = response?.justification ?? '';
  const justificationLength = justificationText.length;

  // Determine if justification is required (score 1-2 need justification, 0=N/A doesn't)
  const requiresJustification = hasScore && currentScore > 0 && currentScore < 3;
  const hasJustification = justificationText.trim().length > 0;
  const showJustificationWarning = requiresJustification && !hasJustification;
  const isOverLimit = justificationLength > MAX_JUSTIFICATION_LENGTH;

  return (
    <Card
      className={clsx(
        'border-l-4 transition-colors',
        hasScore ? SCORE_COLORS[currentScore].border : 'border-l-[var(--border-strong)]',
        className
      )}
    >
      <CardContent className="pt-6">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--brand-soft)] text-[var(--brand)]">
                {question.questionNumber}
              </span>
              {question.standardReference && (
                <span className="text-xs text-[var(--text-muted)]">
                  Ref: {question.standardReference}
                </span>
              )}
            </div>
            <p className="text-[var(--text-strong)] font-medium">{question.questionText}</p>
          </div>

          {/* Current Score Badge */}
          {hasScore && (
            <div
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium',
                currentScore === 0 && 'bg-[var(--status-na-bg)] text-[var(--status-na-fg)]',
                currentScore === 1 && 'bg-[var(--status-fail-bg)] text-[var(--status-fail-fg)]',
                currentScore === 2 && 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)]',
                currentScore === 3 && 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)]',
                currentScore === 4 && 'bg-[var(--status-pass-bg)] text-[var(--status-pass-fg)]',
                currentScore === 5 && 'bg-info-50 text-info-700'
              )}
            >
              {SCORE_LABELS[currentScore]}
            </div>
          )}
        </div>

        {/* Guidance Section */}
        {showGuidance && question.guidance && (
          <div className="mb-6 p-3 bg-info-50 rounded-xl border border-info-100">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-info-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-info-700 mb-1">Auditor Guidance</p>
                <p className="text-sm text-info-600">{question.guidance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Score Buttons */}
        <div className="mb-4">
          <p className="text-sm font-medium text-[var(--text-body)] mb-3 text-center">
            Select Compliance Score
          </p>
          <ScoreGroup
            value={currentScore ?? undefined}
            onChange={onScoreChange}
            criteria={{
              score0: question.score0Criteria,
              score1: question.score1Criteria,
              score2: question.score2Criteria,
              score3: question.score3Criteria,
              score4: question.score4Criteria,
              score5: question.score5Criteria,
            }}
            disabled={disabled}
          />
        </div>

        {/* Justification Textarea */}
        {hasScore && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor={`justification-${question.id}`}
                className="text-sm font-medium text-[var(--text-body)] flex items-center gap-1.5"
              >
                Justification / Notes
                {requiresJustification && (
                  <span className="text-[var(--status-fail-fg)] text-xs font-semibold">
                    (Required)
                  </span>
                )}
              </label>
              <span
                className={clsx(
                  'text-xs',
                  isOverLimit ? 'text-[var(--status-fail-fg)] font-medium' : 'text-[var(--text-muted)]'
                )}
              >
                {justificationLength.toLocaleString()} / {MAX_JUSTIFICATION_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              id={`justification-${question.id}`}
              value={justificationText}
              onChange={(e) => onJustificationChange?.(e.target.value)}
              placeholder={
                requiresJustification
                  ? 'Please explain why this item is not fully compliant...'
                  : 'Add notes or evidence references (optional)...'
              }
              disabled={disabled}
              rows={3}
              className={clsx(
                'w-full rounded-md border px-3 py-2 text-sm resize-y min-h-[80px] max-h-[200px]',
                'placeholder:text-[var(--text-subtle)]',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-sunken)]',
                requiresJustification && !hasJustification
                  ? 'border-[var(--status-obs-line)] focus:ring-[var(--status-obs-solid)] bg-[var(--status-obs-bg)]'
                  : isOverLimit
                  ? 'border-[var(--status-fail-line)] focus:ring-[var(--status-fail-solid)]'
                  : 'border-[var(--border-default)] focus:ring-[var(--brand)] bg-[var(--surface-card)]'
              )}
            />
            {showJustificationWarning && (
              <div className="mt-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-[var(--status-obs-fg)] flex-shrink-0" />
                <p className="text-xs text-[var(--status-obs-fg)]">
                  Justification is required for non-compliant scores
                </p>
              </div>
            )}
            {isOverLimit && (
              <div className="mt-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[var(--status-fail-fg)] flex-shrink-0" />
                <p className="text-xs text-[var(--status-fail-fg)]">
                  Justification exceeds maximum length
                </p>
              </div>
            )}
          </div>
        )}

        {/* Draft Indicator */}
        {response?.isDraft && (
          <div className="mt-4 flex items-center justify-end">
            <span className="text-xs text-[var(--text-muted)] italic">Draft - not yet saved</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact variant for list views
interface QuestionCardCompactProps {
  question: Question;
  response?: QuestionResponse;
  onClick?: () => void;
  className?: string;
}

export function QuestionCardCompact({
  question,
  response,
  onClick,
  className,
}: QuestionCardCompactProps) {
  const currentScore = response?.score;
  const hasScore = currentScore !== null && currentScore !== undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border-l-4 bg-[var(--surface-card)] border border-[var(--border-subtle)] transition-all',
        'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)]',
        hasScore ? SCORE_COLORS[currentScore].border : 'border-l-[var(--border-strong)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--surface-sunken)] text-[var(--text-body)]">
              {question.questionNumber}
            </span>
            {hasScore && (
              <span
                className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  currentScore === 0 && 'bg-[var(--status-na-bg)] text-[var(--status-na-fg)]',
                  currentScore === 1 && 'bg-[var(--status-fail-bg)] text-[var(--status-fail-fg)]',
                  currentScore === 2 && 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)]',
                  currentScore === 3 && 'bg-[var(--status-obs-bg)] text-[var(--status-obs-fg)]',
                  currentScore === 4 && 'bg-[var(--status-pass-bg)] text-[var(--status-pass-fg)]',
                  currentScore === 5 && 'bg-info-50 text-info-700'
                )}
              >
                Score: {currentScore}
              </span>
            )}
            {!hasScore && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--surface-sunken)] text-[var(--text-muted)]">
                Not scored
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-strong)] truncate">{question.questionText}</p>
        </div>
        <div className="flex-shrink-0">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              !hasScore && 'bg-[var(--surface-sunken)] text-[var(--text-subtle)]',
              currentScore === 0 && 'bg-[var(--status-na-solid)] text-white',
              currentScore === 1 && 'bg-[var(--status-fail-solid)] text-white',
              currentScore === 2 && 'bg-warning-500 text-white',
              currentScore === 3 && 'bg-[var(--status-obs-solid)] text-white',
              currentScore === 4 && 'bg-[var(--status-pass-solid)] text-white',
              currentScore === 5 && 'bg-info-500 text-white'
            )}
          >
            {hasScore ? (currentScore === 0 ? 'N/A' : currentScore) : '-'}
          </div>
        </div>
      </div>
    </button>
  );
}
