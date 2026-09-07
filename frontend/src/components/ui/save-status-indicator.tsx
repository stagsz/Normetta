'use client';

import { clsx } from 'clsx';
import { Check, Loader2, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { AutoSaveStatus } from '@/hooks/useAutoSave';

interface SaveStatusIndicatorProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  pendingCount?: number;
  error?: string | null;
  className?: string;
}

const statusConfig: Record<
  AutoSaveStatus,
  {
    icon: typeof Check;
    label: string;
    iconClass: string;
    textClass: string;
  }
> = {
  idle: {
    icon: Cloud,
    label: 'All changes saved',
    iconClass: 'text-[var(--text-subtle)]',
    textClass: 'text-[var(--text-muted)]',
  },
  unsaved: {
    icon: CloudOff,
    label: 'Unsaved changes',
    iconClass: 'text-amber-500',
    textClass: 'text-amber-600',
  },
  saving: {
    icon: Loader2,
    label: 'Saving...',
    iconClass: 'text-blue-500 animate-spin',
    textClass: 'text-blue-600',
  },
  saved: {
    icon: Check,
    label: 'Saved',
    iconClass: 'text-green-500',
    textClass: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    label: 'Save failed',
    iconClass: 'text-red-500',
    textClass: 'text-red-600',
  },
};

export function SaveStatusIndicator({
  status,
  lastSaved,
  pendingCount = 0,
  error,
  className,
}: SaveStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Build the display label
  let displayLabel = config.label;
  if (status === 'unsaved' && pendingCount > 0) {
    displayLabel = `${pendingCount} unsaved change${pendingCount > 1 ? 's' : ''}`;
  } else if (status === 'error' && error) {
    displayLabel = error;
  }

  // Show "last saved" time for idle/saved states
  const showLastSaved = (status === 'idle' || status === 'saved') && lastSaved;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-sm',
        className
      )}
    >
      <Icon className={clsx('h-4 w-4', config.iconClass)} />
      <span className={config.textClass}>
        {displayLabel}
        {showLastSaved && (
          <span className="text-[var(--text-subtle)] ml-1">
            ({formatDistanceToNow(lastSaved, { addSuffix: true })})
          </span>
        )}
      </span>
    </div>
  );
}

// Compact version for tight spaces
interface SaveStatusBadgeProps {
  status: AutoSaveStatus;
  className?: string;
}

export function SaveStatusBadge({ status, className }: SaveStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        status === 'idle' && 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
        status === 'unsaved' && 'bg-amber-100 text-amber-700',
        status === 'saving' && 'bg-blue-50 text-blue-700',
        status === 'saved' && 'bg-green-50 text-green-700',
        status === 'error' && 'bg-red-50 text-red-700',
        className
      )}
    >
      <Icon className={clsx('h-3 w-3', status === 'saving' && 'animate-spin')} />
      <span>{config.label}</span>
    </div>
  );
}
