import * as React from 'react';

/**
 * Radial readiness gauge. Auto-colors by threshold (≥85 green, ≥60 amber,
 * else red) unless `tone` is set. The headline metric of the dashboard.
 *
 * @startingPoint section="Display" subtitle="Radial readiness score gauge" viewport="700x220"
 */
export interface ScoreGaugeProps {
  /** Percent 0–100 */
  value: number;
  label?: string;
  /** Diameter in px. @default 132 */
  size?: number;
  /** Ring thickness in px. @default 12 */
  thickness?: number;
  /** Force a color instead of the threshold auto-tone */
  tone?: 'brand' | 'pass' | 'obs' | 'fail';
  /** Animate a count-up from 0 on mount / value change. @default true */
  animate?: boolean;
  /** Caption shown under the number inside the ring. Defaults by tone (e.g. "Audit-ready"). Pass "" to hide. */
  caption?: string;
}

export function ScoreGauge(props: ScoreGaugeProps): JSX.Element;
