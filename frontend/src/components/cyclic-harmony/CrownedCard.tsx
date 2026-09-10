'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CrownedCardProps {
  children: React.ReactNode;
  className?: string;
  crownColor?: 'sage' | 'olive' | 'forest' | 'lime' | 'gradient';
  elevation?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  crownHeight?: number; // percentage of card width (default: 45)
}

/**
 * CrownedCard - Base component for the Cyclic Harmony design system
 * Features a semi-circle arc on top ("crown") with customizable colors
 */
export function CrownedCard({
  children,
  className,
  crownColor = 'sage',
  elevation = 'md',
  interactive = false,
  active = false,
  disabled = false,
  onClick,
  crownHeight = 45,
}: CrownedCardProps) {
  const elevationClasses = {
    sm: 'shadow-[var(--shadow-sm)]',
    md: 'shadow-soft-2',
    lg: 'shadow-soft-3',
  };

  const crownColors = {
    sage: 'bg-mint-500',
    olive: 'bg-mint-600',
    forest: 'bg-mint-700',
    lime: 'bg-mint-300',
    gradient: 'bg-gradient-to-b from-mint-300 via-mint-500 to-mint-600',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-3'
    : '';

  const activeClasses = active
    ? 'ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface-page)] scale-[1.02]'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed grayscale'
    : '';

  return (
    <div
      className={cn(
        'relative bg-[var(--surface-card)] rounded-crown overflow-visible',
        elevationClasses[elevation],
        interactiveClasses,
        activeClasses,
        disabledClasses,
        className
      )}
      onClick={!disabled ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
    >
      {/* Crown - Semi-circle arc on top */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: `${crownHeight}%` }}>
        <div
          className={cn(
            'absolute inset-0 rounded-b-full',
            crownColors[crownColor]
          )}
          style={{
            clipPath: 'ellipse(50% 100% at 50% 0%)',
          }}
        />
      </div>

      {/* Card Content */}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

export default CrownedCard;
