'use client';

import { useState, useMemo } from 'react';
import { BarChart3, Radar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ComplianceBarChart,
  ComplianceRadarChart,
} from '@/components/charts/compliance-chart';
import { useSections, ISOSection } from '@/hooks/useStandards';

interface ResponseData {
  id: string;
  score: number | null;
  section: {
    id: string;
    sectionNumber: string;
    title: string;
  } | null;
}

interface SectionScoreSummaryProps {
  responses: ResponseData[];
}

interface SectionScore {
  section: string;
  sectionNumber: string;
  score: number;
}

type ChartType = 'bar' | 'radar';

/**
 * Calculates the compliance score for a section and its children.
 * Responses are scored 1–5 (0 = N/A and is excluded, matching the backend
 * assessmentService semantics). The percentage is
 * (actual score / max possible score) * 100, capped at 100 per question.
 */
function calculateSectionScore(
  section: ISOSection,
  responseBySectionId: Map<string, ResponseData[]>
): { totalScore: number; maxScore: number } {
  let totalScore = 0;
  let maxScore = 0;

  // Get responses for this section
  const sectionResponses = responseBySectionId.get(section.id) || [];
  for (const response of sectionResponses) {
    if (response.score !== null && response.score !== 0) {
      totalScore += response.score;
      maxScore += 5; // Scoring scale is 1–5
    }
  }

  // Recursively include children
  for (const child of section.children) {
    const childResult = calculateSectionScore(child, responseBySectionId);
    totalScore += childResult.totalScore;
    maxScore += childResult.maxScore;
  }

  return { totalScore, maxScore };
}

function SectionScoreSummarySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton width={180} height={24} />
          <div className="flex gap-1">
            <Skeleton width={36} height={36} />
            <Skeleton width={36} height={36} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton width="100%" height={280} />
      </CardContent>
    </Card>
  );
}

export function SectionScoreSummary({ responses }: SectionScoreSummaryProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const { data: sectionsData, isLoading, isError } = useSections();

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

  // Calculate scores for each main section (clauses 4-10)
  const sectionScores = useMemo<SectionScore[]>(() => {
    if (!sectionsData?.data) return [];

    const scores: SectionScore[] = [];

    for (const section of sectionsData.data) {
      const { totalScore, maxScore } = calculateSectionScore(
        section,
        responseBySectionId
      );

      // Only include sections with answered questions
      if (maxScore > 0) {
        const scorePercentage = (totalScore / maxScore) * 100;
        scores.push({
          section: section.title,
          sectionNumber: section.sectionNumber,
          score: Math.round(scorePercentage * 10) / 10, // Round to 1 decimal
        });
      }
    }

    // Sort by section number
    scores.sort((a, b) => {
      const numA = parseFloat(a.sectionNumber);
      const numB = parseFloat(b.sectionNumber);
      return numA - numB;
    });

    return scores;
  }, [sectionsData?.data, responseBySectionId]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (sectionScores.length === 0) return 0;
    const total = sectionScores.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / sectionScores.length) * 10) / 10;
  }, [sectionScores]);

  if (isLoading) {
    return <SectionScoreSummarySkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load section data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No scores to display
  if (sectionScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-3" />
            <p className="text-[var(--text-muted)] text-sm">
              No scored responses yet. Complete questions to see section scores.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Section Scores</CardTitle>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Overall: {overallScore}% compliance
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'radar' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setChartType('radar')}
              title="Radar Chart"
            >
              <Radar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === 'bar' ? (
          <ComplianceBarChart data={sectionScores} height={280} />
        ) : (
          <ComplianceRadarChart data={sectionScores} height={300} />
        )}

        {/* Score Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[var(--status-pass-solid)]" />
            <span className="text-[var(--text-muted)]">≥70% Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[var(--status-obs-solid)]" />
            <span className="text-[var(--text-muted)]">50-69% Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[var(--status-fail-solid)]" />
            <span className="text-[var(--text-muted)]">&lt;50% Non-Compliant</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
