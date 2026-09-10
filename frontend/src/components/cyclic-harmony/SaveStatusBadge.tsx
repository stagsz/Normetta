'use client';

import React from 'react';
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SaveStatusBadgeProps {
  status: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  pendingCount?: number;
  error?: string | null;
  className?: string;
}

/**
 * SaveStatusBadge - Displays auto-save status with Cyclic Harmony styling
 */
export function SaveStatusBadge({
  status,
  lastSaved,
  pendingCount = 0,
  error,
  className,
}: SaveStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving changes...',
          bgColor: 'bg-info-50',
          borderColor: 'border-info-100',
          textColor: 'text-info-600',
          iconClass: 'animate-spin',
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved
            ? `Saved ${formatTimeSince(lastSaved)}`
            : 'All changes saved',
          bgColor: 'bg-[var(--status-pass-bg)]',
          borderColor: 'border-[var(--status-pass-line)]',
          textColor: 'text-[var(--status-pass-fg)]',
          iconClass: '',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: error || 'Failed to save',
          bgColor: 'bg-[var(--status-fail-bg)]',
          borderColor: 'border-[var(--status-fail-line)]',
          textColor: 'text-[var(--status-fail-fg)]',
          iconClass: '',
        };
      default:
        return {
          icon: Cloud,
          text: pendingCount > 0 ? `${pendingCount} unsaved changes` : 'No changes',
          bgColor: 'bg-[var(--surface-sunken)]',
          borderColor: 'border-[var(--border-subtle)]',
          textColor: 'text-[var(--text-muted)]',
          iconClass: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-4 h-4', config.textColor, config.iconClass)} />
      <span className={cn('text-sm font-medium', config.textColor)}>
        {config.text}
      </span>
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}

export default SaveStatusBadge;
