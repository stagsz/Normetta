import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nonConformitiesApi } from '@/lib/api';

// Types matching backend API responses
export interface NonConformity {
  id: string;
  title: string;
  description: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  rootCause: string | null;
  rootCauseMethod: string | null;
  identifiedDate: string;
  createdAt: string;
  updatedAt: string;
  assessmentId: string;
  responseId: string | null;
  assessment: {
    id: string;
    title: string;
    status: string;
  };
  response: {
    id: string;
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
  } | null;
  correctiveActions: Array<{
    id: string;
    status: string;
    priority: string;
    targetDate: string | null;
  }>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NonConformitiesListResponse {
  success: boolean;
  data: NonConformity[];
  pagination: PaginationInfo;
}

export interface NonConformitiesListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  severity?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useNonConformities(params: NonConformitiesListParams = {}) {
  return useQuery({
    queryKey: ['nonConformities', params],
    queryFn: async () => {
      const response = await nonConformitiesApi.list(params);
      return response.data as NonConformitiesListResponse;
    },
  });
}

export function useNonConformity(id: string) {
  return useQuery({
    queryKey: ['nonConformity', id],
    queryFn: async () => {
      const response = await nonConformitiesApi.getById(id);
      return response.data as { success: boolean; data: NonConformity };
    },
    enabled: !!id,
  });
}

export function useDeleteNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await nonConformitiesApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
    },
  });
}

export function useTransitionNCRStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await nonConformitiesApi.transition(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
      queryClient.invalidateQueries({ queryKey: ['nonConformity'] });
    },
  });
}

export interface UpdateNCRData {
  title?: string;
  description?: string;
  severity?: string;
  rootCause?: string | null;
  rootCauseMethod?: string | null;
}

export function useUpdateNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNCRData }) => {
      const response = await nonConformitiesApi.update(id, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nonConformities'] });
      queryClient.invalidateQueries({ queryKey: ['nonConformity', variables.id] });
    },
  });
}
