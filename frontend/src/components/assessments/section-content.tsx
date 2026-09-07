'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuestionCard, Question, QuestionResponse } from './question-card';
import { SectionProgressIndicator } from './section-progress-indicator';
import { ISOSection, AuditQuestion, useQuestionsBySection } from '@/hooks/useStandards';

interface SectionContentProps {
  /** The section to display */
  section: ISOSection | null;
  /** Response data for the assessment */
  responses: Map<string, { score: 0 | 1 | 2 | 3 | 4 | 5 | null; justification: string }>;
  /** Callback when a score is changed */
  onScoreChange: (questionId: string, score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  /** Callback when justification is changed */
  onJustificationChange?: (questionId: string, justification: string) => void;
  /** Whether editing is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

function SectionContentSkeleton() {
  return (
    <div className="space-y-4">
      {/* Section header skeleton */}
      <div className="space-y-2">
        <Skeleton width={200} height={24} />
        <Skeleton width={300} height={16} />
      </div>

      {/* Progress skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton width={150} height={20} />
        <Skeleton width="100%" height={8} />
      </div>

      {/* Question cards skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton width={60} height={24} />
                  <Skeleton width={80} height={16} />
                </div>
                <Skeleton width="80%" height={20} />
              </div>
            </div>
            <Skeleton width="100%" height={100} />
            <div className="flex justify-center gap-4">
              <Skeleton width={80} height={48} />
              <Skeleton width={80} height={48} />
              <Skeleton width={80} height={48} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Displays the content of a section including its questions and progress.
 * Questions can be scored and justified inline.
 */
export function SectionContent({
  section,
  responses,
  onScoreChange,
  onJustificationChange,
  disabled = false,
  isLoading = false,
  className,
}: SectionContentProps) {
  // Fetch questions for this section
  const {
    data: questionsData,
    isLoading: questionsLoading,
    isError,
  } = useQuestionsBySection(section?.id || null);

  const questions = questionsData?.data || [];

  // Calculate progress
  const progress = useMemo(() => {
    const answered = questions.filter(q => {
      const response = responses.get(q.id);
      return response?.score !== null && response?.score !== undefined;
    }).length;
    return { answered, total: questions.length };
  }, [questions, responses]);

  // Convert API questions to QuestionCard format
  const questionCards = useMemo(() => {
    return questions.map((q): { question: Question; response: QuestionResponse | undefined } => ({
      question: {
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        guidance: q.guidance,
        standardReference: q.standardReference,
        score1Criteria: q.score1Criteria,
        score2Criteria: q.score2Criteria,
        score3Criteria: q.score3Criteria,
      },
      response: responses.get(q.id)
        ? {
            score: responses.get(q.id)!.score,
            justification: responses.get(q.id)!.justification,
          }
        : undefined,
    }));
  }, [questions, responses]);

  if (isLoading || questionsLoading) {
    return <SectionContentSkeleton />;
  }

  if (!section) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-4" />
          <p className="text-[var(--text-muted)]">Select a section to view questions</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-red-600 font-medium">Failed to load questions</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-4" />
          <p className="text-[var(--text-muted)] font-medium">No questions in this section</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            This section does not have any audit questions defined.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Section Header */}
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-lg font-bold text-[var(--brand-strong)]">
            {section.sectionNumber}
          </span>
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">{section.title}</h2>
        </div>
        {section.description && (
          <p className="text-[var(--text-muted)]">{section.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      <SectionProgressIndicator
        answered={progress.answered}
        total={progress.total}
        size="md"
        showProgressBar={true}
      />

      {/* Questions */}
      <div className="space-y-4">
        {questionCards.map(({ question, response }) => (
          <QuestionCard
            key={question.id}
            question={question}
            response={response}
            onScoreChange={(score) => onScoreChange(question.id, score)}
            onJustificationChange={
              onJustificationChange
                ? (justification) => onJustificationChange(question.id, justification)
                : undefined
            }
            disabled={disabled}
            showGuidance={true}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Compact list variant showing question summaries
 */
interface SectionQuestionListProps {
  section: ISOSection | null;
  responses: Map<string, { score: 0 | 1 | 2 | 3 | 4 | 5 | null; justification: string }>;
  onQuestionClick?: (questionId: string) => void;
  className?: string;
}

export function SectionQuestionList({
  section,
  responses,
  onQuestionClick,
  className,
}: SectionQuestionListProps) {
  const {
    data: questionsData,
    isLoading,
    isError,
  } = useQuestionsBySection(section?.id || null);

  const questions = questionsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={60} />
        ))}
      </div>
    );
  }

  if (isError || !section) {
    return null;
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {questions.map((q) => {
        const response = responses.get(q.id);
        const hasScore = response?.score !== null && response?.score !== undefined;

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onQuestionClick?.(q.id)}
            className={clsx(
              'w-full text-left p-3 rounded-xl border transition-colors',
              'hover:bg-[var(--surface-sunken)]',
              hasScore
                ? response.score === 3
                  ? 'border-l-4 border-l-green-500 bg-green-50/30'
                  : response.score === 2
                  ? 'border-l-4 border-l-yellow-500 bg-amber-50/30'
                  : 'border-l-4 border-l-red-500 bg-red-50/30'
                : 'border-[var(--border-subtle)]'
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-[var(--surface-sunken)] px-2 py-0.5 rounded">
                    {q.questionNumber}
                  </span>
                  {hasScore && (
                    <span
                      className={clsx(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        response.score === 3
                          ? 'bg-green-50 text-green-700'
                          : response.score === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      )}
                    >
                      Score: {response.score}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-body)] truncate">{q.questionText}</p>
              </div>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  !hasScore && 'bg-[var(--surface-sunken)] text-[var(--text-subtle)]',
                  hasScore &&
                    (response.score === 3
                      ? 'bg-[var(--status-pass-solid)] text-white'
                      : response.score === 2
                      ? 'bg-[var(--status-obs-solid)] text-white'
                      : 'bg-[var(--status-fail-solid)] text-white')
                )}
              >
                {hasScore ? response.score : '-'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
