'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressConnectorProps {
  active?: boolean;
  completed?: boolean;
  className?: string;
}

/**
 * ProgressConnector - Dotted arc path connecting process stages
 * Visualizes flow between sections in the audit journey
 */
export function ProgressConnector({
  active = false,
  completed = false,
  className,
}: ProgressConnectorProps) {
  const strokeColor = completed
    ? '#5FA463' // status pass solid
    : active
    ? '#14B8A6' // brand teal
    : 'rgba(234, 241, 239, 0.18)'; // hairline on dark

  return (
    <div className={cn('flex items-center justify-center w-16 h-24', className)}>
      <svg
        width="64"
        height="96"
        viewBox="0 0 64 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-500',
          (active || completed) && 'animate-progress-flow'
        )}
      >
        {/* Dotted arc path */}
        <path
          d="M 8 48 Q 32 20, 56 48"
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arrow head */}
        {(active || completed) && (
          <path
            d="M 56 48 L 50 44 M 56 48 L 50 52"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}

export default ProgressConnector;
