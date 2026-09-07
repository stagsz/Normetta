import * as React from 'react';

/**
 * Surface container with optional header (title / subtitle / action slot).
 * The base building block for dashboards and panels.
 *
 * @startingPoint section="Display" subtitle="Card surface with header + body" viewport="700x260"
 */
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Right-aligned header slot (e.g. a Button or IconButton) */
  action?: React.ReactNode;
  /** @default "md" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** @default "sm" */
  elevation?: 'none' | 'xs' | 'sm' | 'md';
  /** Element tag to render. @default "div" */
  as?: keyof JSX.IntrinsicElements;
}

export function Card(props: CardProps): JSX.Element;
