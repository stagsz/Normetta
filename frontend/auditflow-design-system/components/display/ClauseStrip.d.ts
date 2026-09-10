import * as React from 'react';

/** One clause segment in a ClauseStrip. */
export interface ClauseSegment {
  /** Full label, used in the hover tooltip and as the tick when `tick` is unset. */
  label?: string;
  /** Status drives the segment color. @default 'pending' */
  status?: 'pass' | 'obs' | 'fail' | 'pending';
  /** Relative width (e.g. number of controls in the clause). @default 1 (equal) */
  weight?: number;
  /** Short label shown under the segment (e.g. a clause number "7"). Falls back to `label`. */
  tick?: string | number;
}

/**
 * ClauseStrip — the signature readiness texture. A single horizontal bar
 * segmented per clause, each colored by status and optionally sized by weight.
 * Use as the at-a-glance audit overview at the top of a dashboard or report.
 *
 * @startingPoint section="Display" subtitle="Segmented per-clause readiness texture" viewport="700x150"
 */
export interface ClauseStripProps {
  clauses: ClauseSegment[];
  /** Bar height in px. @default 14 */
  height?: number;
  /** Show the clause tick labels below the bar. @default true */
  showTicks?: boolean;
  /** Show the status legend below. @default false */
  showLegend?: boolean;
  /** Pill ends vs. square. @default true */
  rounded?: boolean;
}

export function ClauseStrip(props: ClauseStripProps): JSX.Element;
