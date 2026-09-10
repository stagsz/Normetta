'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ISOSection, AuditQuestion, useQuestionsBySection } from '@/hooks/useStandards';

interface ScoreCriteriaProps {
  score1: string | null;
  score2: string | null;
  score3: string | null;
}

function ScoreCriteria({ score1, score2, score3 }: ScoreCriteriaProps) {
  const criticityBadge = (score: number, colorKey: 'fail' | 'obs' | 'pass') => {
    const map: Record<'fail' | 'obs' | 'pass', {solid: string; bg: string; fg: string}> = {
      fail: {solid: 'var(--status-fail-solid)', bg: 'bg-red-50', fg: 'text-red-700'},
      obs: {solid: 'var(--status-obs-solid)', bg: 'bg-amber-50', fg: 'text-amber-700'},
      pass: {solid: 'var(--status-pass-solid)', bg: 'bg-green-50', fg: 'text-green-700'},
    }[colorKey];
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white`} style={{backgroundColor: map.solid}}>
        {score}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Score 1 – legacy minimum on a 1–5 scale */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          {criticityBadge(1, 'fail')}
          <span className="text-sm font-medium text-red-700">Non-Compliant</span>
        </div>
        <p className="text-xs text-red-600">{score1 ?? 'Critical gap — no evidence / not addressed.'}</p>
      </div>

      {/* Score 2 – initial threshold on 1–5 scale */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          {criticityBadge(2, 'obs')}
          <span className="text-sm font-medium text-amber-700">Initial / Partial</span>
        </div>
        <p className="text-xs text-amber-600">{score2 ?? 'Initial implementation / partially meets requirement.'}</p>
      </div>

      {/* Score 3+ – developing / established / optimizing bucket for UI clue */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          {criticityBadge(3, 'pass')}
          <span className="text-sm font-medium text-green-700">Developing+ / Established</span>
        </div>
        <p className="text-xs text-green-600">{score3 ?? 'Process is defined, functioning and monitored.'}</p>
      </div>
    </div>
  );
}

interface QuestionItemProps {
  question: AuditQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}

function QuestionItem({ question, isExpanded, onToggle }: QuestionItemProps) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      {/* Question header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--surface-sunken)] transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--text-subtle)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--text-subtle)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--brand-soft)] text-[var(--brand)]">
              {question.questionNumber}
            </span>
            {question.standardReference && (
              <span className="text-xs text-[var(--text-muted)]">
                Ref: {question.standardReference}
              </span>
            )}
            {!question.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--surface-sunken)] text-[var(--text-muted)]">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-strong)]">{question.questionText}</p>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="ml-8 space-y-4">
            {/* Guidance section */}
            {question.guidance && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Auditor Guidance
                    </p>
                    <p className="text-sm text-blue-600">{question.guidance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score criteria */}
            <div>
              <p className="text-xs font-medium text-[var(--text-body)] uppercase tracking-wide mb-2">
                Scoring Criteria
              </p>
              <ScoreCriteria
                score1={question.score1Criteria}
                score2={question.score2Criteria}
                score3={question.score3Criteria}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Skeleton width={20} height={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton width={60} height={20} />
                <Skeleton width={80} height={16} />
              </div>
              <Skeleton width="100%" height={16} />
              <Skeleton width="80%" height={16} className="mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SectionDetailPanelProps {
  section: ISOSection | null;
}

export function SectionDetailPanel({ section }: SectionDetailPanelProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const { data: questionsData, isLoading: isLoadingQuestions } =
    useQuestionsBySection(section?.id ?? null);

  const questions = questionsData?.data ?? [];
  const questionCount = section?._count?.questions ?? 0;

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const expandAllQuestions = () => {
    setExpandedQuestions(new Set(questions.map((q) => q.id)));
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions(new Set());
  };

  // Empty state - no section selected
  if (!section) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center py-12">
          <div className="text-center text-[var(--text-muted)]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-[var(--text-subtle)]" />
            <p className="font-medium">Select a section</p>
            <p className="text-sm mt-1">
              Click on a section to view its details and questions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[var(--brand-soft)] rounded-xl flex-shrink-0">
            <BookOpen className="w-5 h-5 text-[var(--brand-strong)]" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg">
              {section.sectionNumber} {section.title}
            </CardTitle>
            {section.description && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{section.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {/* Section metadata */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Section Number
            </p>
            <p className="font-medium text-[var(--text-strong)]">{section.sectionNumber}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Questions
            </p>
            <p className="font-medium text-[var(--text-strong)]">{questionCount}</p>
          </div>
        </div>

        {/* Subsections summary */}
        {section.children.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">
              Subsections ({section.children.length})
            </p>
            <div className="space-y-1">
              {section.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between py-1.5 px-2 bg-[var(--surface-sunken)] rounded"
                >
                  <span className="text-sm text-[var(--text-body)]">
                    <span className="font-medium">{child.sectionNumber}</span>{' '}
                    {child.title}
                  </span>
                  {(child._count?.questions ?? 0) > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {child._count?.questions} questions
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions section */}
        {questionCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Audit Questions
              </p>
              {questions.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={expandAllQuestions}
                    className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-[var(--text-subtle)]">|</span>
                  <button
                    onClick={collapseAllQuestions}
                    className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>

            {isLoadingQuestions ? (
              <QuestionsLoadingSkeleton />
            ) : questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isExpanded={expandedQuestions.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[var(--text-subtle)]" />
                <p className="text-sm">No questions found for this section</p>
              </div>
            )}
          </div>
        )}

        {/* No content message */}
        {section.children.length === 0 && questionCount === 0 && (
          <div className="text-center py-6 text-[var(--text-muted)]">
            <FileText className="w-8 h-8 mx-auto mb-2 text-[var(--text-subtle)]" />
            <p className="text-sm">No questions defined for this section</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
