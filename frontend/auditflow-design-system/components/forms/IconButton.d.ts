import * as React from 'react';

/**
 * Square icon-only button. Always pass `label` for accessibility (used as
 * aria-label + tooltip). Use for toolbar actions, table row actions, close buttons.
 */
export interface IconButtonProps {
  /** The icon node (SVG / icon font glyph) */
  children: React.ReactNode;
  /** Accessible label — required */
  label: string;
  /** @default "secondary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function IconButton(props: IconButtonProps): JSX.Element;
