import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

// Types matching backend API responses
export interface OverviewData {
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

export interface SectionBreakdownData {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  compliancePercentage: number;
}

export interface TrendDataPoint {
  month: string;
  year: number;
  complianceScore: number;
  assessmentsCompleted: number;
  ncrsOpened: number;
  ncrsClosed: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return (response.data as ApiResponse<OverviewData>).data;
    },
  });
}

export function useDashboardSections(assessmentId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'sections', assessmentId],
    queryFn: async () => {
      const response = await dashboardApi.getSections(assessmentId);
      return (response.data as ApiResponse<SectionBreakdownData[]>).data;
    },
  });
}

export function useDashboardTrends() {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      const response = await dashboardApi.getTrends();
      return (response.data as ApiResponse<TrendDataPoint[]>).data;
    },
  });
}

// Combined hook that fetches all dashboard data
export function useDashboard() {
  const overview = useDashboardOverview();
  const sections = useDashboardSections();
  const trends = useDashboardTrends();

  const useDemo = typeof window !== 'undefined' && window.localStorage.getItem('demo-dashboard') === '1';

  const demo = {
    data: {
      complianceScore: 74,
      assessmentCounts: { total: 12, byStatus: { DRAFT: 2, IN_PROGRESS: 3, COMPLETED: 7 } },
      ncrCounts: { open: 3, closed: 4, total: 7, byStatus: { OPEN: 3, CLOSED: 4 }, bySeverity: { MINOR: 4, MAJOR: 2, CRITICAL: 1 } },
    },
    isLoading: false,
    isError: false,
  } as any;
  const demoSections = {
    data: [
      { sectionId: '1', sectionNumber: '4', sectionTitle: 'Context of the Organization', score: 82, questionsAnswered: 8, totalQuestions: 9, compliancePercentage: 82 },
      { sectionId: '2', sectionNumber: '5', sectionTitle: 'Leadership', score: 68, questionsAnswered: 5, totalQuestions: 6, compliancePercentage: 68 },
      { sectionId: '3', sectionNumber: '6', sectionTitle: 'Planning', score: 76, questionsAnswered: 10, totalQuestions: 12, compliancePercentage: 76 },
      { sectionId: '4', sectionNumber: '7', sectionTitle: 'Support', score: 71, questionsAnswered: 7, totalQuestions: 8, compliancePercentage: 71 },
      { sectionId: '5', sectionNumber: '8', sectionTitle: 'Operation', score: 79, questionsAnswered: 14, totalQuestions: 16, compliancePercentage: 79 },
    ],
    isLoading: false,
    isError: false,
  } as any;
  const demoTrends = {
    data: [
      { month: 'Jan', year: 2026, complianceScore: 54, assessmentsCompleted: 1, ncrsOpened: 2, ncrsClosed: 1 },
      { month: 'Feb', year: 2026, complianceScore: 58, assessmentsCompleted: 1, ncrsOpened: 1, ncrsClosed: 0 },
      { month: 'Mar', year: 2026, complianceScore: 61, assessmentsCompleted: 2, ncrsOpened: 2, ncrsClosed: 1 },
      { month: 'Apr', year: 2026, complianceScore: 66, assessmentsCompleted: 1, ncrsOpened: 1, ncrsClosed: 1 },
      { month: 'May', year: 2026, complianceScore: 68, assessmentsCompleted: 2, ncrsOpened: 2, ncrsClosed: 2 },
      { month: 'Jun', year: 2026, complianceScore: 74, assessmentsCompleted: 2, ncrsOpened: 1, ncrsClosed: 3 },
    ],
    isLoading: false,
    isError: false,
  } as any;

  if (useDemo) {
    return {
      overview: demo,
      sections: demoSections,
      trends: demoTrends,
      isLoading: false,
      isError: false,
    };
  }

  return {
    overview,
    sections,
    trends,
    isLoading: overview.isLoading || sections.isLoading || trends.isLoading,
    isError: overview.isError || sections.isError || trends.isError,
  };
}
