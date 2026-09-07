import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';

// Types matching backend API responses
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SYSTEM_ADMIN' | 'QUALITY_MANAGER' | 'INTERNAL_AUDITOR' | 'DEPARTMENT_HEAD' | 'VIEWER';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export function useUsers(params: UsersListParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await usersApi.list(params);
      return response.data as UsersListResponse;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await usersApi.getById(id);
      return response.data as { success: boolean; data: User };
    },
    enabled: !!id,
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await usersApi.toggleActive(userId);
      return response.data as { success: boolean; data: User; message: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await usersApi.changeRole(userId, role);
      return response.data as { success: boolean; data: User; message: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
      const response = await usersApi.update(userId, data);
      return response.data as { success: boolean; data: User };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
