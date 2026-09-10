'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { useSections } from '@/hooks/useStandards';
import { useAssessmentResponses } from '@/hooks/useAssessmentResponses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTabsNavigation, SectionNavButtons } from '@/components/assessments/section-tabs-navigation';
import { SectionContent } from '@/components/assessments/section-content';
import { SectionNavigator } from '@/components/assessments/section-navigator';
import { SaveStatusIndicator } from '@/components/ui/save-status-indicator';

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

// Treat obviously invalid IDs as not-found early so a 404/bad response
// doesn't crash into the global ErrorBoundary.
const isInvalidId = (id?: string) => {
  if (!id) return true;
  if (id.includes('undefined') || id.includes('null')) return true;
  if (/^0{8}-0{4}-4000-8000-0{3}[0-9a-fA-F]{12}$/.test(id)) return true;
  return false;
};

function AuditPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton width={40} height={40} variant="circular" />
        <div className="space-y-2">
          <Skeleton width={300} height={28} />
          <Skeleton width={200} height={20} />
        </div>
      </div>

      {/* Navigation tabs skeleton */}
      <div className="border-b border-[var(--border-subtle)] pb-2">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} width={80} height={32} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton width="100%" height={400} />
        </div>
        <div className="space-y-4">
          <Skeleton width="100%" height={300} />
        </div>
      </div>
    </div>
  );
}

export default function AssessmentAuditPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = (params?.id ?? '') as string;

  // Fetch assessment data
  const { data: assessmentData, isLoading: assessmentLoading, isError } = useAssessment(assessmentId);
  const assessment = assessmentData?.data;

  // Fetch ISO sections (filtered by assessment's template if applicable)
  const { data: sectionsData, isLoading: sectionsLoading } = useSections({ assessmentId });
  const sections = sectionsData?.data || [];

  // Track responses with auto-save
  const {
    responses,
    getResponse,
    updateResponse,
    saveStatus,
    saveNow,
    pendingCount,
    lastSaved,
    saveError,
    isLoading: responsesLoading,
  } = useAssessmentResponses({
    assessmentId,
    autoSaveDelay: 30000, // 30 seconds
    onAutoSaveSuccess: () => {
      toast.success('Progress saved', { duration: 2000 });
    },
    onAutoSaveError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Active section state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Find active section object
  const activeSection = useMemo(() => {
    if (!activeSectionId || !sections.length) return null;

    function findSection(sectionList: typeof sections, id: string): typeof sections[0] | null {
      for (const section of sectionList) {
        if (section.id === id) return section;
        if (section.children) {
          const found = findSection(section.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    return findSection(sections, activeSectionId);
  }, [activeSectionId, sections]);

  // Initialize active section to first leaf section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      // Find first leaf section
      function findFirstLeaf(section: typeof sections[0]): string {
        if (!section.children || section.children.length === 0) {
          return section.id;
        }
        return findFirstLeaf(section.children[0]);
      }
      setActiveSectionId(findFirstLeaf(sections[0]));
    }
  }, [sections, activeSectionId]);

  // Convert responses Map to format needed by SectionNavigator
  const responsesList = useMemo(() => {
    const list: Array<{
      id: string;
      score: number | null;
      section: { id: string; sectionNumber: string; title: string } | null;
    }> = [];

    responses.forEach((response, questionId) => {
      // We need section info - this would come from the questions
      // For now, include the basic response data
      list.push({
        id: questionId,
        score: response.score,
        section: response.sectionId
          ? { id: response.sectionId, sectionNumber: '', title: '' }
          : null,
      });
    });

    return list;
  }, [responses]);

  // Convert responses for SectionContent
  const responsesForContent = useMemo(() => {
    const map = new Map<string, { score: 0 | 1 | 2 | 3 | 4 | 5 | null; justification: string }>();
    responses.forEach((response, questionId) => {
      map.set(questionId, {
        score: response.score,
        justification: response.justification,
      });
    });
    return map;
  }, [responses]);

  // Handle score change
  const handleScoreChange = useCallback(
    (questionId: string, score: 0 | 1 | 2 | 3 | 4 | 5) => {
      updateResponse(questionId, { score, sectionId: activeSectionId || undefined });
    },
    [updateResponse, activeSectionId]
  );

  // Handle justification change
  const handleJustificationChange = useCallback(
    (questionId: string, justification: string) => {
      updateResponse(questionId, { justification });
    },
    [updateResponse]
  );

  // Handle section change
  const handleSectionChange = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Manual save handler
  const handleManualSave = async () => {
    try {
      await saveNow();
      toast.success('All changes saved');
    } catch {
      toast.error('Failed to save changes');
    }
  };

  // Loading state
  if (assessmentLoading || sectionsLoading) {
    return <AuditPageSkeleton />;
  }

  // Invalid ID guard
  if (isInvalidId(assessmentId)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Assessment Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-[var(--text-body)] font-medium">Invalid assessment identifier.</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              The requested audit could not be found. Please return to assessments and try again.
            </p>
            <Link href="/assessments">
              <Button className="mt-4">Back to Assessments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !assessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Assessment Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-[var(--text-body)] font-medium">Failed to load assessment</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              The assessment may have been deleted or you don't have permission to access it.
            </p>
            <Link href="/assessments">
              <Button className="mt-4">Back to Assessments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if assessment can be audited
  const canAudit = assessment.status === 'IN_PROGRESS' || assessment.status === 'DRAFT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/assessments/${assessmentId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-strong)]">{assessment.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {statusLabels[assessment.status]} - Conducting Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-14 sm:ml-0">
          {/* Save Status */}
          <SaveStatusIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            pendingCount={pendingCount}
            error={saveError}
          />

          {/* Manual Save Button */}
          <Button
            variant="outline"
            onClick={handleManualSave}
            disabled={saveStatus === 'saving' || pendingCount === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Assessment not in audit mode warning */}
      {!canAudit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Read-only Mode</p>
                <p className="text-sm text-amber-700">
                  This assessment is {statusLabels[assessment.status].toLowerCase()} and cannot be edited.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Tabs Navigation */}
      <SectionTabsNavigation
        sections={sections}
        responses={responsesList}
        activeSectionId={activeSectionId}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Questions Content */}
        <div className="lg:col-span-3">
          <SectionContent
            section={activeSection}
            responses={responsesForContent}
            onScoreChange={handleScoreChange}
            onJustificationChange={handleJustificationChange}
            disabled={!canAudit}
            isLoading={responsesLoading}
          />

          {/* Bottom Navigation */}
          <div className="mt-6 pt-6 border-t">
            <SectionNavButtons
              sections={sections}
              activeSectionId={activeSectionId}
              onSectionChange={handleSectionChange}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section Navigator */}
          <SectionNavigator
            responses={responsesList}
            activeSectionId={activeSectionId || undefined}
            onSectionClick={handleSectionChange}
          />
        </div>
      </div>
    </div>
  );
}
