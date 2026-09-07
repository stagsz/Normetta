import { prisma } from '../config/database';
import { AssessmentStatus, NCRStatus, Severity } from '../types/enums';

interface OverviewData {
  complianceScore: number;
  assessmentCounts: {
    total: number;
    byStatus: Record<string, number>;
  };
  ncrCounts: {
    total: number;
    open: number;
    closed: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  recentActivity: {
    assessmentsThisMonth: number;
    ncrsCreatedThisMonth: number;
    ncrsClosedThisMonth: number;
  };
}

interface SectionBreakdownData {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  compliancePercentage: number;
}

interface TrendDataPoint {
  month: string;
  year: number;
  complianceScore: number;
  assessmentsCompleted: number;
  ncrsOpened: number;
  ncrsClosed: number;
}

export class DashboardService {
  /**
   * Get overview data for the dashboard
   * All queries run in parallel via Promise.all
   */
  async getOverview(organizationId: string): Promise<OverviewData> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      assessmentStatusCounts,
      totalAssessments,
      ncrStatusCounts,
      ncrSeverityCounts,
      totalNCRs,
      completedAssessments,
      assessmentsThisMonth,
      ncrsCreatedThisMonth,
      ncrsClosedThisMonth,
    ] = await Promise.all([
      prisma.assessment.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { id: true },
      }),
      prisma.assessment.count({ where: { organizationId } }),
      prisma.nonConformity.groupBy({
        by: ['status'],
        where: { assessment: { organizationId } },
        _count: { id: true },
      }),
      prisma.nonConformity.groupBy({
        by: ['severity'],
        where: { assessment: { organizationId } },
        _count: { id: true },
      }),
      prisma.nonConformity.count({
        where: { assessment: { organizationId } },
      }),
      prisma.assessment.findMany({
        where: {
          organizationId,
          status: AssessmentStatus.COMPLETED,
          overallScore: { not: null },
        },
        select: { overallScore: true },
      }),
      prisma.assessment.count({
        where: { organizationId, createdAt: { gte: startOfMonth } },
      }),
      prisma.nonConformity.count({
        where: { assessment: { organizationId }, createdAt: { gte: startOfMonth } },
      }),
      prisma.nonConformity.count({
        where: {
          assessment: { organizationId },
          status: NCRStatus.CLOSED,
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    const assessmentByStatus: Record<string, number> = {};
    for (const item of assessmentStatusCounts) {
      assessmentByStatus[item.status] = item._count.id;
    }
    for (const status of Object.values(AssessmentStatus)) {
      if (!(status as string in assessmentByStatus)) assessmentByStatus[status as string] = 0;
    }

    const ncrByStatus: Record<string, number> = {};
    for (const item of ncrStatusCounts) {
      ncrByStatus[item.status] = item._count.id;
    }
    for (const status of Object.values(NCRStatus)) {
      if (!(status as string in ncrByStatus)) ncrByStatus[status as string] = 0;
    }

    const ncrBySeverity: Record<string, number> = {};
    for (const item of ncrSeverityCounts) {
      ncrBySeverity[item.severity] = item._count.id;
    }
    for (const severity of Object.values(Severity)) {
      if (!(severity as string in ncrBySeverity)) ncrBySeverity[severity as string] = 0;
    }

    const openNCRs = (ncrByStatus[NCRStatus.OPEN] || 0) + (ncrByStatus[NCRStatus.IN_PROGRESS] || 0);
    const closedNCRs = ncrByStatus[NCRStatus.CLOSED] || 0;

    let complianceScore = 0;
    if (completedAssessments.length > 0) {
      const totalScore = completedAssessments.reduce(
        (sum: any, a: any) => sum + (a.overallScore || 0),
        0
      );
      complianceScore = Math.round((totalScore / completedAssessments.length) * 10) / 10;
    }

    return {
      complianceScore,
      assessmentCounts: { total: totalAssessments, byStatus: assessmentByStatus },
      ncrCounts: {
        total: totalNCRs,
        open: openNCRs,
        closed: closedNCRs,
        byStatus: ncrByStatus,
        bySeverity: ncrBySeverity,
      },
      recentActivity: { assessmentsThisMonth, ncrsCreatedThisMonth, ncrsClosedThisMonth },
    };
  }

  /**
   * Get section breakdown with scores by ISO section.
   * Fetches all sections and all questions in 2 queries, builds tree in memory,
   * then fetches all responses in 1 query. No recursive DB calls.
   */
  async getSectionBreakdown(
    organizationId: string,
    assessmentId?: string
  ): Promise<SectionBreakdownData[]> {
    const responseWhere: Record<string, unknown> = {
      isDraft: false,
      assessment: { organizationId },
    };
    if (assessmentId) responseWhere.assessmentId = assessmentId;

    // 1 query: all sections (top-level and children)
    const [allSections, allQuestions] = await Promise.all([
      prisma.iSOStandardSection.findMany({
        select: { id: true, parentId: true, sectionNumber: true, title: true, order: true },
        orderBy: { order: 'asc' },
      }),
      prisma.auditQuestion.findMany({
        where: { isActive: true },
        select: { id: true, sectionId: true },
      }),
    ]);

    // Build section children map and question map in memory
    const childrenOf = new Map<string | null, string[]>();
    for (const s of allSections) {
      const key = s.parentId ?? null;
      if (!childrenOf.has(key)) childrenOf.set(key, []);
      childrenOf.get(key)!.push(s.id);
    }

    const questionsBySectionId = new Map<string, string[]>();
    for (const q of allQuestions) {
      if (!q.sectionId) continue;
      if (!questionsBySectionId.has(q.sectionId)) questionsBySectionId.set(q.sectionId, []);
      questionsBySectionId.get(q.sectionId)!.push(q.id);
    }

    // Recursively collect question IDs purely in memory
    const collectQuestionIds = (sectionId: string): string[] => {
      const ids: string[] = [...(questionsBySectionId.get(sectionId) ?? [])];
      for (const childId of childrenOf.get(sectionId) ?? []) {
        ids.push(...collectQuestionIds(childId));
      }
      return ids;
    };

    const topLevelSections = allSections
      .filter((s) => s.parentId === null)
      .sort((a, b) => a.order - b.order);

    // Collect all question IDs we'll need across all sections
    const sectionQuestionMap = new Map<string, string[]>();
    const allNeededQuestionIds = new Set<string>();
    for (const section of topLevelSections) {
      const ids = collectQuestionIds(section.id);
      sectionQuestionMap.set(section.id, ids);
      ids.forEach((id) => allNeededQuestionIds.add(id));
    }

    if (allNeededQuestionIds.size === 0) return [];

    // 1 query: fetch all relevant responses
    const allResponses = await prisma.questionResponse.findMany({
      where: {
        ...responseWhere,
        questionId: { in: Array.from(allNeededQuestionIds) },
        // 0 = N/A — excluded from compliance math like in assessmentService
        score: { gt: 0 },
      },
      select: { questionId: true, score: true },
    });

    // Build response lookup by questionId
    const responsesByQuestionId = new Map<string, number[]>();
    for (const r of allResponses) {
      if (!responsesByQuestionId.has(r.questionId)) responsesByQuestionId.set(r.questionId, []);
      responsesByQuestionId.get(r.questionId)!.push(r.score as number);
    }

    const sectionBreakdown: SectionBreakdownData[] = [];

    for (const section of topLevelSections) {
      const questionIds = sectionQuestionMap.get(section.id) ?? [];
      if (questionIds.length === 0) continue;

      const scores: number[] = [];
      for (const qid of questionIds) {
        const qScores = responsesByQuestionId.get(qid) ?? [];
        scores.push(...qScores);
      }

      const questionsAnswered = scores.length;
      const totalQuestions = questionIds.length;

      if (questionsAnswered === 0) {
        sectionBreakdown.push({
          sectionId: section.id,
          sectionNumber: section.sectionNumber,
          sectionTitle: section.title,
          score: 0,
          questionsAnswered: 0,
          totalQuestions,
          compliancePercentage: 0,
        });
        continue;
      }

      const totalScore = scores.reduce((sum, s) => sum + s, 0);
      const maxPossibleScore = questionsAnswered * 5; // scoring scale is 1–5
      const scorePercentage = (totalScore / maxPossibleScore) * 100;

      sectionBreakdown.push({
        sectionId: section.id,
        sectionNumber: section.sectionNumber,
        sectionTitle: section.title,
        score: Math.round(scorePercentage * 10) / 10,
        questionsAnswered,
        totalQuestions,
        compliancePercentage: Math.round(scorePercentage * 10) / 10,
      });
    }

    return sectionBreakdown;
  }

  /**
   * Get historical trend data for the last 6 months.
   * Fetches all data in 3 queries covering the full range, buckets in memory.
   */
  async getTrends(organizationId: string): Promise<TrendDataPoint[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 3 queries total for the full 6-month window
    const [completedAssessments, ncrsOpened, ncrsClosed] = await Promise.all([
      prisma.assessment.findMany({
        where: {
          organizationId,
          status: AssessmentStatus.COMPLETED,
          completedDate: { gte: sixMonthsAgo, lt: nextMonth },
        },
        select: { overallScore: true, completedDate: true },
      }),
      prisma.nonConformity.findMany({
        where: {
          assessment: { organizationId },
          createdAt: { gte: sixMonthsAgo, lt: nextMonth },
        },
        select: { createdAt: true },
      }),
      prisma.nonConformity.findMany({
        where: {
          assessment: { organizationId },
          status: NCRStatus.CLOSED,
          updatedAt: { gte: sixMonthsAgo, lt: nextMonth },
        },
        select: { updatedAt: true },
      }),
    ]);

    // Bucket results by year-month in memory
    const bucket = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

    const assessmentsByMonth = new Map<string, { overallScore: number | null }[]>();
    for (const a of completedAssessments) {
      if (!a.completedDate) continue;
      const key = bucket(new Date(a.completedDate));
      if (!assessmentsByMonth.has(key)) assessmentsByMonth.set(key, []);
      assessmentsByMonth.get(key)!.push(a);
    }

    const ncrsOpenedByMonth = new Map<string, number>();
    for (const n of ncrsOpened) {
      const key = bucket(n.createdAt);
      ncrsOpenedByMonth.set(key, (ncrsOpenedByMonth.get(key) ?? 0) + 1);
    }

    const ncrsClosedByMonth = new Map<string, number>();
    for (const n of ncrsClosed) {
      const key = bucket(n.updatedAt);
      ncrsClosedByMonth.set(key, (ncrsClosedByMonth.get(key) ?? 0) + 1);
    }

    const trends: TrendDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = bucket(targetDate);
      const monthAssessments = assessmentsByMonth.get(key) ?? [];

      let complianceScore = 0;
      if (monthAssessments.length > 0) {
        const totalScore = monthAssessments.reduce(
          (sum, a) => sum + (a.overallScore || 0),
          0
        );
        complianceScore = Math.round((totalScore / monthAssessments.length) * 10) / 10;
      }

      trends.push({
        month: targetDate.toLocaleString('en-US', { month: 'short' }),
        year: targetDate.getFullYear(),
        complianceScore,
        assessmentsCompleted: monthAssessments.length,
        ncrsOpened: ncrsOpenedByMonth.get(key) ?? 0,
        ncrsClosed: ncrsClosedByMonth.get(key) ?? 0,
      });
    }

    return trends;
  }
}

export const dashboardService = new DashboardService();
