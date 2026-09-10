import * as React from 'react';

/**
 * Inline banner for contextual messages — guidance, warnings, nonconformity
 * alerts, success confirmations. Tone maps to the conformance palette.
 */
export interface CalloutProps {
  /** @default "info" */
  tone?: 'info' | 'pass' | 'obs' | 'fail';
  title?: string;
  children?: React.ReactNode;
  /** Action slot below the body (e.g. a Button) */
  action?: React.ReactNode;
  /** When provided, renders a dismiss ✕ */
  onDismiss?: () => void;
}

export function Callout(props: CalloutProps): JSX.Element;
