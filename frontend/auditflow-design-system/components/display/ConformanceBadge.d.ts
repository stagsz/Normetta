import * as React from 'react';

/**
 * The canonical ISO finding-outcome badge. Maps the four Normetta conformance
 * states to their semantic color + glyph. Use this everywhere a clause or
 * finding status is shown — not a generic Badge.
 *
 * @startingPoint section="Display" subtitle="ISO conformance status badges" viewport="700x120"
 */
export interface ConformanceBadgeProps {
  /** @default "notassessed" */
  status?: 'conformant' | 'observation' | 'nonconformity' | 'notassessed';
  /** soft = tinted, solid = filled. @default "soft" */
  variant?: 'soft' | 'solid';
  /** Show the leading status glyph. @default true */
  showIcon?: boolean;
  /** Override the default label text */
  label?: string;
}

export function ConformanceBadge(props: ConformanceBadgeProps): JSX.Element;
