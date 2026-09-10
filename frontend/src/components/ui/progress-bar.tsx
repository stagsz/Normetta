'use client';

import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'default' | 'compliance';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  colorScheme = 'default',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getColor = () => {
    if (colorScheme === 'compliance') {
      if (percentage >= 70) return 'bg-[var(--status-pass-solid)]';
      if (percentage >= 50) return 'bg-[var(--status-obs-solid)]';
      return 'bg-[var(--status-fail-solid)]';
    }
    return 'bg-[var(--brand-soft)]';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-[var(--text-body)]">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-[var(--text-muted)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          'w-full bg-[var(--stone-200)] rounded-full overflow-hidden',
          heights[size]
        )}
      >
        <div
          className={clsx(
            'progress-bar rounded-full',
            heights[size],
            getColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  colorScheme?: 'default' | 'compliance';
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  colorScheme = 'default',
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (colorScheme === 'compliance') {
      if (percentage >= 70) return 'var(--status-pass-solid)'; // green-500
      if (percentage >= 50) return 'var(--status-obs-solid)'; // amber-500
      return 'var(--status-fail-solid)'; // red-500
    }
    return 'var(--brand)'; // emerald-500
  };

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-[var(--border-subtle)]"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-2xl font-bold text-[var(--text-strong)]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
