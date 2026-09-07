'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useSections, ISOSection } from '@/hooks/useStandards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SectionDetailPanel } from '@/components/standards/section-detail-panel';
import { CSVImportModal } from '@/components/standards/csv-import-modal';

interface SectionTreeItemProps {
  section: ISOSection;
  depth: number;
  expandedSections: Set<string>;
  toggleExpanded: (sectionId: string) => void;
  onSectionClick: (section: ISOSection) => void;
  selectedSectionId: string | null;
}

function SectionTreeItem({
  section,
  depth,
  expandedSections,
  toggleExpanded,
  onSectionClick,
  selectedSectionId,
}: SectionTreeItemProps) {
  const hasChildren = section.children.length > 0;
  const isExpanded = expandedSections.has(section.id);
  const isSelected = selectedSectionId === section.id;
  const questionCount = section._count?.questions || 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(section.id);
  };

  const handleClick = () => {
    onSectionClick(section);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl transition-colors',
          'hover:bg-[var(--surface-sunken)]',
          isSelected && 'bg-[var(--brand-soft)] border-l-2 border-[var(--brand)]'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {/* Expand/Collapse chevron */}
        <div className="w-5 flex-shrink-0">
          {hasChildren && (
            <button
              onClick={handleToggle}
              className="p-0.5 hover:bg-[var(--stone-200)] rounded"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>
          )}
        </div>

        {/* Section icon */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <BookOpen className="w-4 h-4 text-[var(--brand)]" />
          ) : (
            <FileText className="w-4 h-4 text-[var(--text-subtle)]" />
          )}
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[var(--text-strong)] text-sm">
              {section.sectionNumber}
            </span>
            <span
              className={clsx(
                'text-sm truncate',
                isSelected ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'
              )}
            >
              {section.title}
            </span>
          </div>
        </div>

        {/* Question count badge */}
        {questionCount > 0 && (
          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-[var(--surface-sunken)] text-[var(--text-muted)] rounded-full">
            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
          </span>
        )}
      </button>

      {/* Children sections */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {section.children.map((child) => (
            <SectionTreeItem
              key={child.id}
              section={child}
              depth={depth + 1}
              expandedSections={expandedSections}
              toggleExpanded={toggleExpanded}
              onSectionClick={onSectionClick}
              selectedSectionId={selectedSectionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StandardsTreeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton width={200} height={24} />
        <Skeleton width={300} height={16} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <Skeleton width={20} height={20} />
            <Skeleton width={16} height={16} variant="circular" />
            <div className="flex-1">
              <Skeleton width={`${50 + (i % 3) * 15}%`} height={18} />
            </div>
            <Skeleton width={80} height={20} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


export default function StandardsPage() {
  const { data: sectionsData, isLoading, isError, refetch } = useSections();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [selectedSection, setSelectedSection] = useState<ISOSection | null>(
    null
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportSuccess = () => {
    refetch();
  };

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

  const handleExpandAll = () => {
    if (!sectionsData?.data) return;

    const allSectionIds = new Set<string>();
    const collectIds = (sections: ISOSection[]) => {
      for (const section of sections) {
        if (section.children.length > 0) {
          allSectionIds.add(section.id);
          collectIds(section.children);
        }
      }
    };
    collectIds(sectionsData.data);
    setExpandedSections(allSectionIds);
  };

  const handleCollapseAll = () => {
    setExpandedSections(new Set());
  };

  const handleSectionClick = (section: ISOSection) => {
    setSelectedSection(section);
  };

  // Calculate total statistics
  const stats = {
    totalSections: 0,
    totalQuestions: 0,
  };

  if (sectionsData?.data) {
    const countAll = (sections: ISOSection[]) => {
      for (const section of sections) {
        stats.totalSections++;
        stats.totalQuestions += section._count?.questions || 0;
        countAll(section.children);
      }
    };
    countAll(sectionsData.data);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton width={250} height={32} />
          <Skeleton width={400} height={20} className="mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StandardsTreeSkeleton />
          </div>
          <div>
            <Card>
              <CardContent className="py-12">
                <Skeleton width="100%" height={200} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !sectionsData?.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">
            ISO 9001:2015 Standards
          </h1>
          <p className="text-[var(--text-muted)]">
            Browse the ISO 9001:2015 standard sections and audit questions
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-[var(--text-body)] font-medium">
              Failed to load standards
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Please try refreshing the page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = sectionsData.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">
            ISO 9001:2015 Standards
          </h1>
          <p className="text-[var(--text-muted)]">
            Browse the ISO 9001:2015 standard sections and audit questions
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-sunken)] rounded-xl">
            <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-body)] font-medium">
              {stats.totalSections} sections
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-sunken)] rounded-xl">
            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-body)] font-medium">
              {stats.totalQuestions} questions
            </span>
          </div>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Standard Sections</CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExpandAll}
                    className="text-xs text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-[var(--text-subtle)]">|</span>
                  <button
                    onClick={handleCollapseAll}
                    className="text-xs text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {sections.map((section) => (
                  <SectionTreeItem
                    key={section.id}
                    section={section}
                    depth={0}
                    expandedSections={expandedSections}
                    toggleExpanded={toggleExpanded}
                    onSectionClick={handleSectionClick}
                    selectedSectionId={selectedSection?.id || null}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section detail panel */}
        <div>
          <SectionDetailPanel section={selectedSection} />
        </div>
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
