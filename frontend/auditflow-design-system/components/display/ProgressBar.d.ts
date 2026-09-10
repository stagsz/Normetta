import * as React from 'react';

export interface ProgressSegment {
  value: number;
  tone?: 'brand' | 'pass' | 'obs' | 'fail';
  label?: string;
}

/**
 * Horizontal progress / completion bar. Pass a single `value` (0–100) or a
 * `segments` array to render a stacked conformance breakdown.
 */
export interface ProgressBarProps {
  /** Single-value percent 0–100 (ignored when segments supplied) */
  value?: number;
  /** Stacked segments that sum to ≤100 */
  segments?: ProgressSegment[];
  /** @default "brand" */
  tone?: 'brand' | 'pass' | 'obs' | 'fail';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  /** Show the numeric percent on the right. @default false */
  showValue?: boolean;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
