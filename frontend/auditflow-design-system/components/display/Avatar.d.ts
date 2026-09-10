import * as React from 'react';

/**
 * Circular user avatar. Falls back to initials from `name` when no `src`.
 */
export interface AvatarProps {
  name?: string;
  /** Image URL; when present, replaces initials */
  src?: string;
  /** @default "md" */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** @default "brand" */
  tone?: 'brand' | 'slate' | 'pass';
}

export function Avatar(props: AvatarProps): JSX.Element;
