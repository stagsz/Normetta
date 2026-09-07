'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

/**
 * NavigationButtons - Previous/Next navigation for section flow
 * Styled with Cyclic Harmony design system
 */
export function NavigationButtons({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  previousLabel = 'Previous Section',
  nextLabel = 'Next Section',
  className,
}: NavigationButtonsProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300',
          'font-medium text-[var(--text-strong)]',
          hasPrevious
            ? 'bg-[var(--surface-card)] border-2 border-[var(--border-default)] hover:border-[var(--brand)] hover:bg-[var(--surface-raised)] hover:-translate-x-1 shadow-soft-1 hover:shadow-soft-2'
            : 'bg-[var(--surface-sunken)] text-[var(--text-subtle)] cursor-not-allowed opacity-50'
        )}
      >
        <ChevronLeft
          className={cn(
            'w-5 h-5 transition-transform duration-300',
            hasPrevious && 'group-hover:-translate-x-1'
          )}
        />
        <span>{previousLabel}</span>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300',
          'font-medium',
          hasNext
            ? 'bg-gradient-to-r from-mint-500 to-mint-600 text-[var(--text-on-brand)] hover:from-mint-400 hover:to-mint-500 hover:translate-x-1 shadow-soft-1 hover:shadow-mint-glow'
            : 'bg-[var(--surface-sunken)] text-[var(--text-subtle)] cursor-not-allowed opacity-50'
        )}
      >
        <span>{nextLabel}</span>
        <ChevronRight
          className={cn(
            'w-5 h-5 transition-transform duration-300',
            hasNext && 'group-hover:translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default NavigationButtons;
