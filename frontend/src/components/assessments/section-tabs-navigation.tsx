'use client';

import { useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ISOSection } from '@/hooks/useStandards';

type CompletionStatus = 'complete' | 'partial' | 'empty' | 'not-applicable';

interface SectionProgress {
  answered: number;
  total: number;
  status: CompletionStatus;
}

interface ResponseData {
  id: string;
  score: number | null;
  section: {
    id: string;
    sectionNumber: string;
    title: string;
  } | null;
}

interface SectionTabsNavigationProps {
  /** All ISO sections (tree structure) */
  sections: ISOSection[];
  /** Assessment responses */
  responses: ResponseData[];
  /** Currently selected section ID */
  activeSectionId: string | null;
  /** Callback when section is selected */
  onSectionChange: (sectionId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate section progress based on responses
 */
function calculateSectionProgress(
  section: ISOSection,
  responseBySectionId: Map<string, ResponseData[]>,
  questionCountBySectionId: Map<string, number>
): SectionProgress {
  const sectionResponses = responseBySectionId.get(section.id) || [];
  const totalQuestions = questionCountBySectionId.get(section.id) || 0;

  // If this section has children, aggregate their progress
  if (section.children && section.children.length > 0) {
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

/**
 * Get all leaf section IDs in order (for prev/next navigation)
 */
function getLeafSections(sections: ISOSection[]): ISOSection[] {
  const leaves: ISOSection[] = [];

  function traverse(section: ISOSection) {
    if (!section.children || section.children.length === 0) {
      leaves.push(section);
    } else {
      for (const child of section.children) {
        traverse(child);
      }
    }
  }

  for (const section of sections) {
    traverse(section);
  }

  return leaves;
}

/**
 * Find the parent top-level section for a given section ID
 */
function findTopLevelParent(
  sectionId: string,
  sections: ISOSection[]
): ISOSection | null {
  for (const section of sections) {
    if (section.id === sectionId) {
      return section;
    }

    function findInChildren(parent: ISOSection, targetId: string): boolean {
      if (parent.id === targetId) {
        return true;
      }
      if (parent.children) {
        for (const child of parent.children) {
          if (findInChildren(child, targetId)) {
            return true;
          }
        }
      }
      return false;
    }

    if (section.children) {
      for (const child of section.children) {
        if (findInChildren(child, sectionId)) {
          return section;
        }
      }
    }
  }
  return null;
}

/**
 * Status indicator icon component
 */
function StatusIcon({ status, size = 'sm' }: { status: CompletionStatus; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const containerSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  switch (status) {
    case 'complete':
      return (
        <div className={clsx(containerSize, 'rounded-full bg-green-50 flex items-center justify-center')}>
          <Check className={clsx(iconSize, 'text-green-600')} />
        </div>
      );
    case 'partial':
      return (
        <div className={clsx(containerSize, 'rounded-full bg-amber-50 flex items-center justify-center')}>
          <Minus className={clsx(iconSize, 'text-amber-600')} />
        </div>
      );
    case 'empty':
      return (
        <div className={clsx(containerSize, 'rounded-full bg-[var(--surface-sunken)] flex items-center justify-center')}>
          <Circle className={clsx(iconSize, 'text-[var(--text-subtle)]')} />
        </div>
      );
    default:
      return null;
  }
}

/**
 * Section tabs navigation component providing horizontal tabs for top-level ISO sections
 * and Previous/Next navigation buttons.
 */
export function SectionTabsNavigation({
  sections,
  responses,
  activeSectionId,
  onSectionChange,
  className,
}: SectionTabsNavigationProps) {
  // Build response map by section ID
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

  // Build question count map
  const questionCountBySectionId = useMemo(() => {
    const map = new Map<string, number>();

    function countQuestions(section: ISOSection) {
      const count = section._count?.questions || 0;
      map.set(section.id, count);
      if (section.children) {
        for (const child of section.children) {
          countQuestions(child);
        }
      }
    }

    for (const section of sections) {
      countQuestions(section);
    }
    return map;
  }, [sections]);

  // Get leaf sections for prev/next navigation
  const leafSections = useMemo(() => getLeafSections(sections), [sections]);

  // Find current leaf section index
  const currentLeafIndex = useMemo(() => {
    if (!activeSectionId) return -1;
    return leafSections.findIndex(s => s.id === activeSectionId);
  }, [leafSections, activeSectionId]);

  // Find active top-level section
  const activeTopLevelSection = useMemo(() => {
    if (!activeSectionId) return sections[0] || null;
    return findTopLevelParent(activeSectionId, sections);
  }, [activeSectionId, sections]);

  // Calculate progress for each top-level section
  const sectionProgress = useMemo(() => {
    const progressMap = new Map<string, SectionProgress>();
    for (const section of sections) {
      progressMap.set(
        section.id,
        calculateSectionProgress(section, responseBySectionId, questionCountBySectionId)
      );
    }
    return progressMap;
  }, [sections, responseBySectionId, questionCountBySectionId]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (currentLeafIndex > 0) {
      onSectionChange(leafSections[currentLeafIndex - 1].id);
    }
  }, [currentLeafIndex, leafSections, onSectionChange]);

  const goToNext = useCallback(() => {
    if (currentLeafIndex < leafSections.length - 1) {
      onSectionChange(leafSections[currentLeafIndex + 1].id);
    }
  }, [currentLeafIndex, leafSections, onSectionChange]);

  // Handle tab click - navigate to first leaf child of the section
  const handleTabClick = useCallback(
    (section: ISOSection) => {
      // If section has no children, navigate directly
      if (!section.children || section.children.length === 0) {
        onSectionChange(section.id);
        return;
      }

      // Find first leaf descendant
      function findFirstLeaf(s: ISOSection): ISOSection {
        if (!s.children || s.children.length === 0) {
          return s;
        }
        return findFirstLeaf(s.children[0]);
      }

      const firstLeaf = findFirstLeaf(section);
      onSectionChange(firstLeaf.id);
    },
    [onSectionChange]
  );

  const hasPrevious = currentLeafIndex > 0;
  const hasNext = currentLeafIndex < leafSections.length - 1;
  const previousSection = hasPrevious ? leafSections[currentLeafIndex - 1] : null;
  const nextSection = hasNext ? leafSections[currentLeafIndex + 1] : null;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Section Tabs */}
      <div className="border-b border-[var(--border-subtle)]">
        <nav className="-mb-px flex space-x-1 overflow-x-auto pb-px" aria-label="Sections">
          {sections.map((section) => {
            const progress = sectionProgress.get(section.id);
            const isActive = activeTopLevelSection?.id === section.id;

            return (
              <button
                key={section.id}
                onClick={() => handleTabClick(section)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-[var(--brand)] text-[var(--brand-strong)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)] hover:border-[var(--border-default)]'
                )}
              >
                {progress && progress.status !== 'not-applicable' && (
                  <StatusIcon status={progress.status} />
                )}
                <span>{section.sectionNumber}</span>
                <span className="hidden sm:inline">{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Previous/Next Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
          {previousSection && (
            <span className="hidden md:inline text-[var(--text-muted)]">
              ({previousSection.sectionNumber})
            </span>
          )}
        </Button>

        {/* Current section indicator */}
        {activeSectionId && currentLeafIndex >= 0 && (
          <span className="text-sm text-[var(--text-muted)]">
            Section {currentLeafIndex + 1} of {leafSections.length}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={!hasNext}
          className="flex items-center gap-2"
        >
          {nextSection && (
            <span className="hidden md:inline text-[var(--text-muted)]">
              ({nextSection.sectionNumber})
            </span>
          )}
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Compact variant with just prev/next buttons
 */
interface SectionNavButtonsProps {
  sections: ISOSection[];
  activeSectionId: string | null;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export function SectionNavButtons({
  sections,
  activeSectionId,
  onSectionChange,
  className,
}: SectionNavButtonsProps) {
  const leafSections = useMemo(() => getLeafSections(sections), [sections]);

  const currentLeafIndex = useMemo(() => {
    if (!activeSectionId) return -1;
    return leafSections.findIndex(s => s.id === activeSectionId);
  }, [leafSections, activeSectionId]);

  const goToPrevious = useCallback(() => {
    if (currentLeafIndex > 0) {
      onSectionChange(leafSections[currentLeafIndex - 1].id);
    }
  }, [currentLeafIndex, leafSections, onSectionChange]);

  const goToNext = useCallback(() => {
    if (currentLeafIndex < leafSections.length - 1) {
      onSectionChange(leafSections[currentLeafIndex + 1].id);
    }
  }, [currentLeafIndex, leafSections, onSectionChange]);

  const hasPrevious = currentLeafIndex > 0;
  const hasNext = currentLeafIndex < leafSections.length - 1;
  const previousSection = hasPrevious ? leafSections[currentLeafIndex - 1] : null;
  const nextSection = hasNext ? leafSections[currentLeafIndex + 1] : null;

  return (
    <div className={clsx('flex items-center justify-between gap-4', className)}>
      <Button
        variant="outline"
        onClick={goToPrevious}
        disabled={!hasPrevious}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <div className="text-left">
          <span className="text-sm">Previous</span>
          {previousSection && (
            <p className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
              {previousSection.sectionNumber} {previousSection.title}
            </p>
          )}
        </div>
      </Button>

      <div className="text-center">
        <span className="text-sm font-medium text-[var(--text-body)]">
          {currentLeafIndex + 1} / {leafSections.length}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={goToNext}
        disabled={!hasNext}
        className="flex items-center gap-2"
      >
        <div className="text-right">
          <span className="text-sm">Next</span>
          {nextSection && (
            <p className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
              {nextSection.sectionNumber} {nextSection.title}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
