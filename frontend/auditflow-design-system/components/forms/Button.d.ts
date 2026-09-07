import * as React from 'react';

/**
 * Primary action button. Use for the single most important action in a view;
 * pair with `secondary`/`ghost` for supporting actions and `danger` for
 * destructive ones (delete finding, reopen audit).
 *
 * @startingPoint section="Forms" subtitle="Button with all variants & sizes" viewport="700x140"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual weight. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon element rendered before the label */
  iconLeft?: React.ReactNode;
  /** Icon element rendered after the label */
  iconRight?: React.ReactNode;
  /** Stretch to container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Per-instance style overrides (merged over the computed variant styles) */
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
