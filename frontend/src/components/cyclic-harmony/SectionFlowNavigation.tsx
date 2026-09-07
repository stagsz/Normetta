'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProcessStageCard } from './ProcessStageCard';
import { ProgressConnector } from './ProgressConnector';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface SectionStage {
  id: string;
  title: string;
  icon: LucideIcon;
  sectionNumber: string;
  description?: string;
  progress: number; // 0-100
  totalQuestions: number;
  answeredQuestions: number;
}

export interface SectionFlowNavigationProps {
  sections: SectionStage[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

/**
 * SectionFlowNavigation - Horizontal scrollable section flow
 * Displays ISO sections as process stages with progress connectors
 */
export function SectionFlowNavigation({
  sections,
  activeSectionId,
  onSectionChange,
  className,
}: SectionFlowNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [sections]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 350; // Approximate card width + gap
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const getStageStatus = (section: SectionStage): 'pending' | 'active' | 'completed' => {
    if (section.id === activeSectionId) return 'active';
    if (section.progress === 100) return 'completed';
    return 'pending';
  };

  return (
    <div className={cn('relative bg-[var(--surface-sunken)] rounded-crown-lg p-6', className)}>
      {/* Section Flow Title */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-[var(--text-strong)] mb-2">
          Audit Journey
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-generous">
          Navigate through ISO 9001 sections to complete your assessment
        </p>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[var(--surface-card)] rounded-full shadow-soft-2 flex items-center justify-center hover:bg-[var(--surface-raised)] transition-colors duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text-link)]" />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[var(--surface-card)] rounded-full shadow-soft-2 flex items-center justify-center hover:bg-[var(--surface-raised)] transition-colors duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-[var(--text-link)]" />
          </button>
        )}

        {/* Scrollable Section Cards */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex items-center gap-0 min-w-max px-8">
            {sections.map((section, index) => {
              const status = getStageStatus(section);

              return (
                <React.Fragment key={section.id}>
                  {/* Stage Card */}
                  <div className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ProcessStageCard
                      icon={section.icon}
                      title={section.title}
                      description={section.description}
                      stageNumber={section.sectionNumber}
                      status={status}
                      progress={section.progress}
                      onClick={() => onSectionChange(section.id)}
                    />
                  </div>

                  {/* Connector (except after last card) */}
                  {index < sections.length - 1 && (
                    <ProgressConnector
                      active={status === 'active'}
                      completed={status === 'completed'}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--status-pass-solid)]" />
              <span className="text-[var(--text-muted)]">
                Completed: {sections.filter((s) => s.progress === 100).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--brand)]" />
              <span className="text-[var(--text-muted)]">
                In Progress: {sections.filter((s) => s.progress > 0 && s.progress < 100).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--text-muted)] opacity-40" />
              <span className="text-[var(--text-muted)]">
                Pending: {sections.filter((s) => s.progress === 0).length}
              </span>
            </div>
          </div>

          <div className="font-medium text-[var(--text-strong)]">
            {sections.reduce((sum, s) => sum + s.answeredQuestions, 0)} /{' '}
            {sections.reduce((sum, s) => sum + s.totalQuestions, 0)} Questions Answered
          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default SectionFlowNavigation;
