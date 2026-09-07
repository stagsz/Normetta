'use client';

import { clsx } from 'clsx';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';

interface SectionProgressIndicatorProps {
  /** Number of questions answered (with a score) */
  answered: number;
  /** Total number of questions in the section */
  total: number;
  /** Section name (optional, for display) */
  sectionName?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the progress bar */
  showProgressBar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays progress for a section showing "X of Y questions answered" with an optional progress bar.
 * Used within assessment detail pages and section navigation.
 */
export function SectionProgressIndicator({
  answered,
  total,
  sectionName,
  size = 'md',
  showProgressBar = true,
  className,
}: SectionProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
  const isComplete = answered === total && total > 0;
  const hasProgress = answered > 0;

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const progressBarSizes = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Header with icon and text */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          <CheckCircle2 className={clsx(iconSizes[size], 'text-green-500')} />
        ) : hasProgress ? (
          <ClipboardList className={clsx(iconSizes[size], 'text-[var(--brand)]')} />
        ) : (
          <Circle className={clsx(iconSizes[size], 'text-[var(--text-subtle)]')} />
        )}

        <div className="flex-1 min-w-0">
          {sectionName && (
            <p
              className={clsx(
                'font-medium text-[var(--text-strong)] truncate',
                textSizes[size]
              )}
            >
              {sectionName}
            </p>
          )}
          <p
            className={clsx(
              textSizes[size],
              isComplete
                ? 'text-green-600 font-medium'
                : hasProgress
                ? 'text-[var(--brand-strong)]'
                : 'text-[var(--text-muted)]'
            )}
          >
            {answered} of {total} question{total !== 1 ? 's' : ''} answered
            {isComplete && ' ✓'}
          </p>
        </div>

        {/* Percentage badge */}
        <span
          className={clsx(
            'flex-shrink-0 px-2 py-0.5 rounded-full font-medium',
            textSizes[size],
            isComplete
              ? 'bg-green-50 text-green-700'
              : hasProgress
              ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
              : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]'
          )}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      {showProgressBar && (
        <ProgressBar
          value={answered}
          max={total}
          size={progressBarSizes[size]}
          showPercentage={false}
          colorScheme={isComplete ? 'compliance' : 'default'}
        />
      )}
    </div>
  );
}

/**
 * Compact inline variant for use in lists or headers
 */
interface SectionProgressBadgeProps {
  answered: number;
  total: number;
  className?: string;
}

export function SectionProgressBadge({
  answered,
  total,
  className,
}: SectionProgressBadgeProps) {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
  const isComplete = answered === total && total > 0;
  const hasProgress = answered > 0;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        isComplete
          ? 'bg-green-50 text-green-700'
          : hasProgress
          ? 'bg-blue-50 text-blue-700'
          : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
        className
      )}
    >
      {isComplete && <CheckCircle2 className="h-3.5 w-3.5" />}
      <span>
        {answered}/{total}
      </span>
      <span className="text-opacity-70">({percentage}%)</span>
    </div>
  );
}

/**
 * Mini progress indicator showing just the fraction
 */
interface MiniProgressProps {
  answered: number;
  total: number;
  className?: string;
}

export function MiniProgress({ answered, total, className }: MiniProgressProps) {
  const isComplete = answered === total && total > 0;

  return (
    <span
      className={clsx(
        'text-xs',
        isComplete ? 'text-green-600 font-medium' : 'text-[var(--text-muted)]',
        className
      )}
    >
      {answered}/{total}
    </span>
  );
}
