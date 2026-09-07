'use client';

import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress, ProgressBar } from '@/components/ui/progress-bar';
import {
  ComplianceBarChart,
  ComplianceRadarChart,
  TrendLineChart,
} from '@/components/charts/compliance-chart';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state';

export default function DashboardPage() {
  const { overview, sections, trends, isLoading } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasNoAssessments = !overview.data?.assessmentCounts?.total;
  if (hasNoAssessments) {
    return <DashboardEmptyState />;
  }

  const sectionScores = (sections.data || []).map((s) => ({
    section: s.sectionTitle,
    sectionNumber: s.sectionNumber,
    score: s.score,
  }));

  const trendData = (trends.data || []).map((t) => ({
    date: t.month,
    score: t.complianceScore,
  }));

  const calculateTrend = () => {
    const data = trends.data || [];
    if (data.length < 2) return { direction: 'UP' as const, change: 0 };
    const current = data[data.length - 1]?.complianceScore || 0;
    const previous = data[data.length - 2]?.complianceScore || 0;
    const change = Math.abs(current - previous);
    return {
      direction: current >= previous ? 'UP' as const : 'DOWN' as const,
      change: Math.round(change * 10) / 10,
    };
  };

  const trendInfo = calculateTrend();
  const overviewData = overview.data;
  const complianceScore = overviewData?.complianceScore || 0;
  const ncrCounts = overviewData?.ncrCounts;
  const openNCRs = ncrCounts?.open || 0;
  const closedNCRs = ncrCounts?.closed || 0;

  const statCards = [
    { label: 'Overall Compliance', value: `${complianceScore.toFixed(1)}%`, trend: trendInfo },
    { label: 'Total Assessments', value: overviewData?.assessmentCounts?.total || 0 },
    { label: 'Active Non-Conformities', value: openNCRs },
    { label: 'NCRs Closed', value: closedNCRs },
  ];

  return (
    <div className="space-y-6">
      {/* Hero: Score gauge + system overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        {/* Left — readiness card */}
        <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Audit readiness
            </span>
            <CircularProgress value={complianceScore} size={156} strokeWidth={14} colorScheme="compliance" />
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--status-pass-fg)]">
              {trendInfo.direction === 'UP' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>+{trendInfo.change} pts since last review</span>
            </div>
            <Link href="/assessments/new" className="w-full">
              <Button className="w-full" iconLeft={<ClipboardCheck className="h-4 w-4" />}>
                Continue self-assessment
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Right — stats overview */}
        <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-[var(--text-strong)]">
              This management system at a glance
            </CardTitle>
            <p className="text-xs text-[var(--text-muted)]">
              {overviewData?.assessmentCounts?.total || 0} assessments across ISO 9001:2015
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {statCards.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[var(--text-strong)] leading-none tracking-tight">
                      {item.value}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conformity breakdown */}
            <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-body)]">Overall conformity</span>
                <span className="text-sm font-bold text-[var(--text-strong)]">
                  {complianceScore.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={complianceScore}
                showPercentage={false}
                size="lg"
                colorScheme="compliance"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Status Breakdown */}
      {overviewData?.assessmentCounts && (
        <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle>Assessment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(overviewData.assessmentCounts.byStatus).map(([status, count]) => (
                <div key={status} className="p-4 bg-[var(--surface-sunken)] rounded-xl text-center border border-[var(--border-subtle)]">
                  <p className="text-2xl font-bold text-[var(--text-strong)]">{count}</p>
                  <p className="text-sm text-[var(--text-muted)] capitalize mt-1">
                    {status.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NCR Status Breakdown */}
      {overviewData?.ncrCounts && overviewData.ncrCounts.total > 0 && (
        <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle>Non-Conformity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(overviewData.ncrCounts.byStatus).map(([status, count]) => (
                <div key={status} className="p-4 bg-[var(--surface-sunken)] rounded-xl text-center border border-[var(--border-subtle)]">
                  <p className="text-2xl font-bold text-[var(--text-strong)]">{count}</p>
                  <p className="text-sm text-[var(--text-muted)] capitalize mt-1">
                    {status.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      {sectionScores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
            <CardHeader>
              <CardTitle>Compliance by Section</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceBarChart data={sectionScores} height={280} />
            </CardContent>
          </Card>

          <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceRadarChart data={sectionScores} height={280} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card className="border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle>Compliance Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={trendData} height={250} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
