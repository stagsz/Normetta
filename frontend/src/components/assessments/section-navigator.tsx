'use client';

import { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { useSections, ISOSection } from '@/hooks/useStandards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ResponseData {
  id: string;
  score: number | null;
  section: {
    id: string;
    sectionNumber: string;
    title: string;
  } | null;
}

interface SectionNavigatorProps {
  responses: ResponseData[];
  onSectionClick?: (sectionId: string) => void;
  activeSectionId?: string;
}

type CompletionStatus = 'complete' | 'partial' | 'empty' | 'not-applicable';

interface SectionProgress {
  answered: number;
  total: number;
  status: CompletionStatus;
}

function calculateSectionProgress(
  section: ISOSection,
  responseBySectionId: Map<string, ResponseData[]>,
  questionCountBySectionId: Map<string, number>
): SectionProgress {
  const sectionResponses = responseBySectionId.get(section.id) || [];
  const totalQuestions = questionCountBySectionId.get(section.id) || 0;

  // If this section has children, aggregate their progress
  if (section.children.length > 0) {
    let totalAnswered = 0;
    let totalCount = 0;

    for (const child of section.children) {
      const childProgress = calculateSectionProgress(
        child,
        responseBySectionId,
        questionCountBySectionId
      );
      totalAnswered += childProgress.answered;
      totalCount += childProgress.total;
    }

    if (totalCount === 0) {
      return { answered: 0, total: 0, status: 'not-applicable' };
    }

    if (totalAnswered === 0) {
      return { answered: 0, total: totalCount, status: 'empty' };
    }

    if (totalAnswered === totalCount) {
      return { answered: totalAnswered, total: totalCount, status: 'complete' };
    }

    return { answered: totalAnswered, total: totalCount, status: 'partial' };
  }

  // Leaf section: count based on responses
  const answeredCount = sectionResponses.filter(r => r.score !== null).length;

  if (totalQuestions === 0) {
    return { answered: 0, total: 0, status: 'not-applicable' };
  }

  if (answeredCount === 0) {
    return { answered: 0, total: totalQuestions, status: 'empty' };
  }

  if (answeredCount >= totalQuestions) {
    return { answered: answeredCount, total: totalQuestions, status: 'complete' };
  }

  return { answered: answeredCount, total: totalQuestions, status: 'partial' };
}

function StatusIcon({ status }: { status: CompletionStatus }) {
  switch (status) {
    case 'complete':
      return (
        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-600" />
        </div>
      );
    case 'partial':
      return (
        <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
          <Minus className="w-3 h-3 text-amber-600" />
        </div>
      );
    case 'empty':
      return (
        <div className="w-5 h-5 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center">
          <Circle className="w-3 h-3 text-[var(--text-subtle)]" />
        </div>
      );
    case 'not-applicable':
      return (
        <div className="w-5 h-5 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center">
          <Minus className="w-3 h-3 text-[var(--text-subtle)]" />
        </div>
      );
    default:
      return null;
  }
}

interface SectionItemProps {
  section: ISOSection;
  depth: number;
  responseBySectionId: Map<string, ResponseData[]>;
  questionCountBySectionId: Map<string, number>;
  onSectionClick?: (sectionId: string) => void;
  activeSectionId?: string;
  expandedSections: Set<string>;
  toggleExpanded: (sectionId: string) => void;
}

function SectionItem({
  section,
  depth,
  responseBySectionId,
  questionCountBySectionId,
  onSectionClick,
  activeSectionId,
  expandedSections,
  toggleExpanded,
}: SectionItemProps) {
  const hasChildren = section.children.length > 0;
  const isExpanded = expandedSections.has(section.id);
  const isActive = activeSectionId === section.id;

  const progress = calculateSectionProgress(
    section,
    responseBySectionId,
    questionCountBySectionId
  );

  const handleClick = () => {
    if (hasChildren) {
      toggleExpanded(section.id);
    }
    if (onSectionClick) {
      onSectionClick(section.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full flex items-center gap-2 px-2 py-2 text-left rounded-xl transition-colors',
          'hover:bg-[var(--surface-sunken)]',
          isActive && 'bg-[var(--brand-soft)] border-l-2 border-[var(--brand)]',
          depth > 0 && 'ml-4'
        )}
      >
        {/* Expand/Collapse indicator */}
        <div className="w-4 flex-shrink-0">
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[var(--text-subtle)]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[var(--text-subtle)]" />
            )
          )}
        </div>

        {/* Status indicator */}
        <StatusIcon status={progress.status} />

        {/* Section label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-[var(--text-strong)] text-sm">
              {section.sectionNumber}
            </span>
            <span className="text-sm text-[var(--text-muted)] truncate">
              {section.title}
            </span>
          </div>
          {/* Progress count for leaf sections or parent aggregates */}
          {progress.total > 0 && (
            <div className="text-xs text-[var(--text-subtle)] mt-0.5">
              {progress.answered} / {progress.total} answered
            </div>
          )}
        </div>
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {section.children.map((child) => (
            <SectionItem
              key={child.id}
              section={child}
              depth={depth + 1}
              responseBySectionId={responseBySectionId}
              questionCountBySectionId={questionCountBySectionId}
              onSectionClick={onSectionClick}
              activeSectionId={activeSectionId}
              expandedSections={expandedSections}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionNavigatorSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton width={150} height={24} />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-2">
            <Skeleton width={16} height={16} />
            <Skeleton width={20} height={20} variant="circular" />
            <div className="flex-1">
              <Skeleton width={`${60 + (i % 3) * 10}%`} height={16} />
              <Skeleton width={60} height={12} className="mt-1" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SectionNavigator({
  responses,
  onSectionClick,
  activeSectionId,
}: SectionNavigatorProps) {
  const { data: sectionsData, isLoading, isError } = useSections();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Build a map of section ID to responses
  const responseBySectionId = useMemo(() => {
    const map = new Map<string, ResponseData[]>();
    for (const response of responses) {
      if (response.section) {
        const sectionId = response.section.id;
        if (!map.has(sectionId)) {
          map.set(sectionId, []);
        }
        map.get(sectionId)!.push(response);
      }
    }
    return map;
  }, [responses]);

  // Build a map of section ID to question counts
  const questionCountBySectionId = useMemo(() => {
    const map = new Map<string, number>();
    if (!sectionsData?.data) return map;

    // Helper to count questions in a section tree
    const countQuestions = (section: ISOSection) => {
      const count = section._count?.questions || 0;
      map.set(section.id, count);
      for (const child of section.children) {
        countQuestions(child);
      }
    };

    for (const section of sectionsData.data) {
      countQuestions(section);
    }
    return map;
  }, [sectionsData?.data]);

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Auto-expand sections with partial progress
  const sectionsWithProgress = useMemo(() => {
    if (!sectionsData?.data) return new Set<string>();

    const withProgress = new Set<string>();

    const checkSection = (section: ISOSection): boolean => {
      const progress = calculateSectionProgress(
        section,
        responseBySectionId,
        questionCountBySectionId
      );

      const hasProgress = progress.status === 'partial' || progress.status === 'complete';

      // Check children
      let childHasProgress = false;
      for (const child of section.children) {
        if (checkSection(child)) {
          childHasProgress = true;
        }
      }

      if (hasProgress || childHasProgress) {
        withProgress.add(section.id);
      }

      return hasProgress || childHasProgress;
    };

    for (const section of sectionsData.data) {
      checkSection(section);
    }

    return withProgress;
  }, [sectionsData?.data, responseBySectionId, questionCountBySectionId]);

  // Initialize expanded sections to those with progress on first load
  useEffect(() => {
    if (sectionsWithProgress.size > 0 && expandedSections.size === 0) {
      setExpandedSections(sectionsWithProgress);
    }
  }, [sectionsWithProgress, expandedSections.size]);

  const sections = sectionsData?.data || [];

  // Calculate overall progress - must be before early returns to maintain hook order
  const overallProgress = useMemo(() => {
    let totalAnswered = 0;
    let totalQuestions = 0;

    for (const section of sections) {
      const progress = calculateSectionProgress(
        section,
        responseBySectionId,
        questionCountBySectionId
      );
      totalAnswered += progress.answered;
      totalQuestions += progress.total;
    }

    return { answered: totalAnswered, total: totalQuestions };
  }, [sections, responseBySectionId, questionCountBySectionId]);

  if (isLoading) {
    return <SectionNavigatorSkeleton />;
  }

  if (isError || !sectionsData?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load sections</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">ISO 9001 Sections</CardTitle>
        <p className="text-sm text-[var(--text-muted)]">
          {overallProgress.answered} of {overallProgress.total} questions answered
        </p>
      </CardHeader>
      <CardContent className="p-2">
        {/* Legend */}
        <div className="flex items-center gap-4 px-2 py-2 mb-2 bg-[var(--surface-sunken)] rounded-xl text-xs">
          <div className="flex items-center gap-1">
            <StatusIcon status="complete" />
            <span className="text-[var(--text-muted)]">Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon status="partial" />
            <span className="text-[var(--text-muted)]">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon status="empty" />
            <span className="text-[var(--text-muted)]">Not Started</span>
          </div>
        </div>

        {/* Section tree */}
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              depth={0}
              responseBySectionId={responseBySectionId}
              questionCountBySectionId={questionCountBySectionId}
              onSectionClick={onSectionClick}
              activeSectionId={activeSectionId}
              expandedSections={expandedSections}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
