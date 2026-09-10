'use client';

import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="rounded-2xl bg-[var(--brand-soft)] p-5 mb-5">
        <Icon className="h-12 w-12 text-[var(--brand-strong)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
