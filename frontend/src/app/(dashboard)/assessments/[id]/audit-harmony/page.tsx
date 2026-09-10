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
  FileCheck,
  ClipboardList,
  FolderTree,
  Users,
  Target,
  Settings,
  BookOpen,
  Shield,
} from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { useSections } from '@/hooks/useStandards';
import { useAssessmentResponses } from '@/hooks/useAssessmentResponses';
import { Button } from '@/components/ui/button';
import {
  SectionFlowNavigation,
  QuestionCard,
  NavigationButtons,
  SaveStatusBadge,
  CrownedCard,
  type SectionStage,
} from '@/components/cyclic-harmony';

// Map section numbers to appropriate icons
const getSectionIcon = (sectionNumber: string) => {
  const iconMap: Record<string, any> = {
    '4': FolderTree,
    '5': Users,
    '6': Target,
    '7': Shield,
    '8': Settings,
    '9': BookOpen,
    '10': CheckCircle,
  };

  const mainSection = sectionNumber.split('.')[0];
  return iconMap[mainSection] || ClipboardList;
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

export default function AssessmentAuditHarmonyPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = (params?.id ?? '') as string;

  // Fetch assessment data
  const { data: assessmentData, isLoading: assessmentLoading, isError } = useAssessment(assessmentId);
  const assessment = assessmentData?.data;

  // Fetch ISO sections
  const { data: sectionsData, isLoading: sectionsLoading } = useSections({ assessmentId });
  const sections = sectionsData?.data || [];

  // Track responses with auto-save
  const {
    responses,
    updateResponse,
    saveStatus,
    saveNow,
    pendingCount,
    lastSaved,
    saveError,
    isLoading: responsesLoading,
  } = useAssessmentResponses({
    assessmentId,
    autoSaveDelay: 30000,
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

  // Get active section questions
  const activeQuestions = useMemo(() => {
    if (!activeSection) return [];
    return ((activeSection as any).questions || []) as { id: string; questionNumber: string; questionText: string; guidance?: string }[];
  }, [activeSection]);

  // Initialize active section to first leaf section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      function findFirstLeaf(section: typeof sections[0]): string {
        if (!section.children || section.children.length === 0) {
          return section.id;
        }
        return findFirstLeaf(section.children[0]);
      }
      setActiveSectionId(findFirstLeaf(sections[0]));
    }
  }, [sections, activeSectionId]);

  // Flatten sections for navigation
  const flattenedSections = useMemo(() => {
    const flattened: typeof sections = [];

    function flatten(sectionList: typeof sections) {
      sectionList.forEach((section) => {
        // Only include leaf sections (those with questions)
        if (!section.children || section.children.length === 0) {
          flattened.push(section);
        } else {
          flatten(section.children);
        }
      });
    }

    flatten(sections);
    return flattened;
  }, [sections]);

  // Convert to SectionStage format for navigation
  const sectionStages: SectionStage[] = useMemo(() => {
    return flattenedSections.map((section) => {
      const questions: { id: string }[] = (section as any).questions || [];
      const answeredQuestions = questions.filter((q) => {
        const response = responses.get(q.id);
        return response && response.score !== null;
      }).length;

      const progress = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

      return {
        id: section.id,
        title: section.title,
        icon: getSectionIcon(section.sectionNumber),
        sectionNumber: section.sectionNumber,
        description: section.description?.substring(0, 100),
        progress: Math.round(progress),
        totalQuestions: questions.length,
        answeredQuestions,
      };
    });
  }, [flattenedSections, responses]);

  // Find current section index for navigation
  const currentSectionIndex = useMemo(() => {
    return flattenedSections.findIndex((s) => s.id === activeSectionId);
  }, [flattenedSections, activeSectionId]);

  // Navigation handlers
  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setActiveSectionId(flattenedSections[currentSectionIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex, flattenedSections]);

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < flattenedSections.length - 1) {
      setActiveSectionId(flattenedSections[currentSectionIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex, flattenedSections]);

  // Response handlers
  const handleScoreChange = useCallback(
    (questionId: string, score: 0 | 1 | 2 | 3 | 4 | 5) => {
      updateResponse(questionId, { score, sectionId: activeSectionId || undefined });
    },
    [updateResponse, activeSectionId]
  );

  const handleJustificationChange = useCallback(
    (questionId: string, justification: string) => {
      updateResponse(questionId, { justification });
    },
    [updateResponse]
  );

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
    return (
      <div className="min-h-screen bg-harmony-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-harmony-sage border-t-harmony-forest mb-4" />
          <p className="text-harmony-dark-text font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !assessment) {
    return (
      <div className="min-h-screen bg-harmony-warm-white p-8">
        <div className="max-w-2xl mx-auto">
          <CrownedCard crownColor="sage">
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="font-display font-bold text-2xl text-harmony-dark-text mb-2">
                Assessment Not Found
              </h2>
              <p className="text-[var(--text-muted)] mb-6 leading-generous">
                The assessment may have been deleted or you don't have permission to access it.
              </p>
              <Link href="/assessments">
                <Button>Back to Assessments</Button>
              </Link>
            </div>
          </CrownedCard>
        </div>
      </div>
    );
  }

  const canAudit = assessment.status === 'IN_PROGRESS' || assessment.status === 'DRAFT';

  return (
    <div className="min-h-screen bg-harmony-warm-white">
      {/* Header */}
      <div className="bg-[var(--surface-card)] border-b border-harmony-light-beige sticky top-0 z-20 shadow-[var(--shadow-sm)]">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/assessments/${assessmentId}`}>
                <button className="w-10 h-10 rounded-xl bg-harmony-warm-gray hover:bg-harmony-light-beige transition-colors flex items-center justify-center">
                  <ArrowLeft className="h-5 w-5 text-harmony-forest" />
                </button>
              </Link>
              <div>
                <h1 className="font-display font-bold text-2xl text-harmony-dark-text">
                  {assessment.title}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {statusLabels[assessment.status]} - Conducting Audit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-14 sm:ml-0">
              <SaveStatusBadge
                status={saveStatus}
                lastSaved={lastSaved}
                pendingCount={pendingCount}
                error={saveError}
              />

              <Button
                variant="outline"
                onClick={handleManualSave}
                disabled={saveStatus === 'saving' || pendingCount === 0}
                className="bg-[var(--surface-card)] border-2 border-harmony-sage hover:bg-harmony-warm-white hover:border-harmony-olive"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        {/* Warning for read-only mode */}
        {!canAudit && (
          <CrownedCard crownColor="lime" crownHeight={15}>
            <div className="flex items-center gap-3 -mt-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-display font-bold text-amber-800">Read-only Mode</p>
                <p className="text-sm text-amber-700 leading-generous">
                  This assessment is {statusLabels[assessment.status].toLowerCase()} and cannot be edited.
                </p>
              </div>
            </div>
          </CrownedCard>
        )}

        {/* Section Flow Navigation */}
        <SectionFlowNavigation
          sections={sectionStages}
          activeSectionId={activeSectionId || ''}
          onSectionChange={setActiveSectionId}
        />

        {/* Current Section Info */}
        {activeSection && (
          <CrownedCard crownColor="olive" crownHeight={20}>
            <div className="-mt-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-harmony-lime text-harmony-forest font-display font-bold text-sm">
                      {activeSection.sectionNumber}
                    </span>
                    <h2 className="font-display font-bold text-2xl text-harmony-dark-text">
                      {activeSection.title}
                    </h2>
                  </div>
                  {activeSection.description && (
                    <p className="text-[var(--text-muted)] leading-generous ml-13">
                      {activeSection.description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-[var(--text-muted)]">Progress</div>
                  <div className="font-display font-bold text-3xl text-harmony-forest">
                    {sectionStages.find((s) => s.id === activeSectionId)?.progress || 0}%
                  </div>
                </div>
              </div>
            </div>
          </CrownedCard>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {activeQuestions.length === 0 ? (
            <CrownedCard crownColor="sage">
              <div className="text-center py-12">
                <ClipboardList className="mx-auto h-16 w-16 text-harmony-sage mb-4" />
                <p className="text-[var(--text-muted)] font-medium">
                  No questions available for this section
                </p>
              </div>
            </CrownedCard>
          ) : (
            activeQuestions.map((question, index) => {
              const response = responses.get(question.id);

              return (
                <div
                  key={question.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <QuestionCard
                    questionNumber={question.questionNumber}
                    questionText={question.questionText}
                    guidance={question.guidance || undefined}
                    score={response?.score || null}
                    justification={response?.justification || ''}
                    onScoreChange={(score) => handleScoreChange(question.id, score)}
                    onJustificationChange={(justification) =>
                      handleJustificationChange(question.id, justification)
                    }
                    disabled={!canAudit || responsesLoading}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="pt-8 border-t-2 border-harmony-light-beige">
          <NavigationButtons
            onPrevious={handlePreviousSection}
            onNext={handleNextSection}
            hasPrevious={currentSectionIndex > 0}
            hasNext={currentSectionIndex < flattenedSections.length - 1}
            previousLabel={
              currentSectionIndex > 0
                ? `${flattenedSections[currentSectionIndex - 1].sectionNumber} ${flattenedSections[currentSectionIndex - 1].title}`
                : 'Previous Section'
            }
            nextLabel={
              currentSectionIndex < flattenedSections.length - 1
                ? `${flattenedSections[currentSectionIndex + 1].sectionNumber} ${flattenedSections[currentSectionIndex + 1].title}`
                : 'Next Section'
            }
          />
        </div>
      </div>
    </div>
  );
}
