import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { correctiveActionsApi } from '@/lib/api';

function invalidateActionQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['correctiveActions'] });
  queryClient.invalidateQueries({ queryKey: ['correctiveAction'] });
  queryClient.invalidateQueries({ queryKey: ['correctiveActionsSummary'] });
  queryClient.invalidateQueries({ queryKey: ['nonConformity'] });
}

// Types matching backend API responses
export interface CorrectiveAction {
  id: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetDate: string | null;
  completedDate: string | null;
  verifiedDate: string | null;
  effectivenessNotes: string | null;
  createdAt: string;
  updatedAt: string;
  nonConformityId: string;
  assignedToId: string | null;
  verifiedById: string | null;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  verifiedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface CorrectiveActionWithNCR extends CorrectiveAction {
  nonConformity: {
    id: string;
    title: string;
    status: string;
    severity: string;
    assessment: {
      id: string;
      title: string;
      organizationId: string;
      status: string;
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    };
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CorrectiveActionsListResponse {
  success: boolean;
  data: CorrectiveAction[];
  pagination: PaginationInfo;
}

export interface CorrectiveActionsListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assignedToId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActionSummary {
  total: number;
  byStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    VERIFIED: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  overdueCount: number;
  completedCount: number;
  pendingCount: number;
}

export function useCorrectiveActionsByNCR(
  ncrId: string,
  params: CorrectiveActionsListParams = {}
) {
  return useQuery({
    queryKey: ['correctiveActions', ncrId, params],
    queryFn: async () => {
      const response = await correctiveActionsApi.listByNCR(ncrId, params);
      return response.data as { success: boolean; data: CorrectiveAction[]; pagination: PaginationInfo };
    },
    enabled: !!ncrId,
  });
}

export function useCorrectiveAction(id: string) {
  return useQuery({
    queryKey: ['correctiveAction', id],
    queryFn: async () => {
      const response = await correctiveActionsApi.getById(id);
      return response.data as { success: boolean; data: CorrectiveActionWithNCR };
    },
    enabled: !!id,
  });
}

export function useCorrectiveActionSummary(ncrId: string) {
  return useQuery({
    queryKey: ['correctiveActionsSummary', ncrId],
    queryFn: async () => {
      const response = await correctiveActionsApi.getSummary(ncrId);
      return response.data as { success: boolean; data: ActionSummary };
    },
    enabled: !!ncrId,
  });
}

export interface CreateActionData {
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedToId?: string | null;
  targetDate?: string | null;
}

export function useCreateCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ncrId, data }: { ncrId: string; data: CreateActionData }) => {
      const response = await correctiveActionsApi.create(ncrId, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['correctiveActions', variables.ncrId] });
      queryClient.invalidateQueries({ queryKey: ['correctiveActionsSummary', variables.ncrId] });
      queryClient.invalidateQueries({ queryKey: ['nonConformity', variables.ncrId] });
    },
  });
}

export interface UpdateActionData {
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedToId?: string | null;
  targetDate?: string | null;
}

export function useUpdateCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActionData }) => {
      const response = await correctiveActionsApi.update(id, data);
      return response.data;
    },
    onSuccess: () => invalidateActionQueries(queryClient),
  });
}

export function useDeleteCorrectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await correctiveActionsApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correctiveActions'] });
      queryClient.invalidateQueries({ queryKey: ['correctiveActionsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['nonConformity'] });
    },
  });
}

export function useUpdateActionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await correctiveActionsApi.updateStatus(id, status);
      return response.data;
    },
    onSuccess: () => invalidateActionQueries(queryClient),
  });
}

export function useVerifyAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, effectivenessNotes }: { id: string; effectivenessNotes?: string }) => {
      const response = await correctiveActionsApi.verify(id, effectivenessNotes);
      return response.data;
    },
    onSuccess: () => invalidateActionQueries(queryClient),
  });
}

export function useAssignAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, assignedToId }: { id: string; assignedToId: string }) => {
      const response = await correctiveActionsApi.assign(id, assignedToId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correctiveActions'] });
      queryClient.invalidateQueries({ queryKey: ['correctiveAction'] });
    },
  });
}
