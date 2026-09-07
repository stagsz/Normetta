import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentsApi } from '@/lib/api';

// Types matching backend API responses
export interface Assessment {
  id: string;
  title: string;
  description: string | null;
  status: string;
  auditType: string;
  overallScore: number | null;
  scope: string | null;
  objectives: string | null;
  scheduledDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  leadAuditorId: string;
  templateId: string | null;
  leadAuditor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    responses: number;
    nonConformities: number;
  };
  progress: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AssessmentsListResponse {
  success: boolean;
  data: Assessment[];
  pagination: PaginationInfo;
}

export interface AssessmentsListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAssessments(params: AssessmentsListParams = {}) {
  return useQuery({
    queryKey: ['assessments', params],
    queryFn: async () => {
      const response = await assessmentsApi.list(params);
      return response.data as AssessmentsListResponse;
    },
  });
}

// Extended Assessment type for detail view (includes nested data)
export interface AssessmentDetail extends Assessment {
  responses?: Array<{
    id: string;
    score: number | null;
    justification: string | null;
    question: {
      id: string;
      questionNumber: string;
      questionText: string;
    };
    section: {
      id: string;
      sectionNumber: string;
      title: string;
    } | null;
    evidence: Array<{
      id: string;
      fileName: string;
      fileSize: number;
    }>;
  }>;
  teamMembers?: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  nonConformities?: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
  }>;
  template?: {
    id: string;
    name: string;
  } | null;
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      const response = await assessmentsApi.getById(id);
      return response.data as { success: boolean; data: AssessmentDetail };
    },
    enabled: !!id,
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; [key: string]: unknown }) => {
      const { id, ...updateData } = data;
      const response = await assessmentsApi.update(id, updateData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both assessments list and detail
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment', variables.id] });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await assessmentsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate assessments list to refresh
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}
