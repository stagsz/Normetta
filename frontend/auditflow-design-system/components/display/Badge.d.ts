import * as React from 'react';

/**
 * Compact pill label for counts, categories, and statuses.
 * For ISO finding outcomes specifically, prefer ConformanceBadge.
 */
export interface BadgeProps {
  children: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'brand' | 'pass' | 'obs' | 'fail' | 'info';
  /** soft = tinted bg, solid = filled. @default "soft" */
  variant?: 'soft' | 'solid';
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Leading status dot */
  dot?: boolean;
}

export function Badge(props: BadgeProps): JSX.Element;
