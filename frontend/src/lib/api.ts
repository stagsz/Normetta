import axios from 'axios';
import { toast } from 'sonner';
import { isNetworkError, getNetworkErrorInfo } from './auth-errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Flag to prevent multiple session expired toasts
let isRefreshing = false;
let sessionExpiredToastShown = false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Reset the session expired flag on successful responses
    sessionExpiredToastShown = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (isNetworkError(error)) {
      const errorInfo = getNetworkErrorInfo();
      toast.error(errorInfo.message, { id: 'network-error' });
      return Promise.reject(error);
    }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if this is an auth endpoint (login) - don't try to refresh
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Prevent multiple refresh attempts
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } =
            response.data?.data || response.data || {};

          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          isRefreshing = false;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed
        isRefreshing = false;

        // Only show toast once per session expiration
        if (!sessionExpiredToastShown) {
          sessionExpiredToastShown = true;
          toast.error('Your session has expired. Please sign in again.', {
            id: 'session-expired',
            duration: 5000,
          });
        }

        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to login after a brief delay so toast is visible
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export const assessmentsApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get('/assessments', { params }),
  getById: (id: string) => api.get(`/assessments/${id}`),
  create: (data: {
    title: string;
    description?: string;
    auditType?: string;
    scheduledDate?: string;
    dueDate?: string;
    templateId?: string;
    teamMembers?: Array<{ userId: string; role: string }>;
  }) => api.post('/assessments', data),
  update: (id: string, data: any) => api.put(`/assessments/${id}`, data),
  delete: (id: string) => api.delete(`/assessments/${id}`),
  calculateScores: (id: string) =>
    api.post(`/assessments/${id}/calculate-scores`),
  clone: (id: string, title: string) =>
    api.post(`/assessments/${id}/clone`, { title }),
  downloadReport: (id: string) =>
    api.get(`/assessments/${id}/report`, { responseType: 'blob' }),
  downloadPowerPointReport: (id: string) =>
    api.get(`/assessments/${id}/report/powerpoint`, { responseType: 'blob' }),
  exportCsv: () =>
    api.get('/assessments/export', { responseType: 'blob' }),
};

export const responsesApi = {
  getByAssessment: (assessmentId: string) =>
    api.get(`/assessments/${assessmentId}/responses`),
  create: (assessmentId: string, data: any) =>
    api.post(`/assessments/${assessmentId}/responses`, data),
  update: (assessmentId: string, questionId: string, data: any) =>
    api.put(`/assessments/${assessmentId}/responses/${questionId}`, data),
  bulkUpdate: (assessmentId: string, responses: any[]) =>
    api.put(`/assessments/${assessmentId}/responses/bulk`, { responses }),
};

export const standardsApi = {
  getSections: (params?: { assessmentId?: string; templateId?: string }) =>
    api.get('/standards/sections', { params }),
  getQuestions: (sectionId?: string) =>
    api.get('/standards/questions', { params: { sectionId } }),
  importCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/standards/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const dashboardApi = {
  getOverview: () => api.get('/dashboard'),
  getSections: (assessmentId?: string) =>
    api.get('/dashboard/sections', { params: { assessmentId } }),
  getTrends: () => api.get('/dashboard/trends'),
};

export const correctiveActionsApi = {
  listByNCR: (ncrId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assignedToId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get(`/non-conformities/${ncrId}/actions`, { params }),
  getById: (id: string) => api.get(`/actions/${id}`),
  create: (ncrId: string, data: {
    description: string;
    priority?: string;
    assignedToId?: string | null;
    targetDate?: string | null;
  }) => api.post(`/non-conformities/${ncrId}/actions`, data),
  update: (id: string, data: {
    description?: string;
    priority?: string;
    assignedToId?: string | null;
    targetDate?: string | null;
  }) => api.put(`/actions/${id}`, data),
  delete: (id: string) => api.delete(`/actions/${id}`),
  updateStatus: (id: string, status: string) =>
    api.post(`/actions/${id}/status`, { status }),
  verify: (id: string, effectivenessNotes?: string) =>
    api.post(`/actions/${id}/verify`, { effectivenessNotes }),
  assign: (id: string, assignedToId: string) =>
    api.post(`/actions/${id}/assign`, { assignedToId }),
  getSummary: (ncrId: string) =>
    api.get(`/non-conformities/${ncrId}/actions/summary`),
};

export const templatesApi = {
  list: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
};

export const usersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => api.put(`/users/${id}`, data),
  toggleActive: (id: string) => api.post(`/users/${id}/toggle-active`),
  changeRole: (id: string, role: string) => api.post(`/users/${id}/change-role`, { role }),
};

export const nonConformitiesApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    severity?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get('/non-conformities', { params }),
  getById: (id: string) => api.get(`/non-conformities/${id}`),
  listByAssessment: (assessmentId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    severity?: string;
    search?: string;
  }) => api.get(`/assessments/${assessmentId}/non-conformities`, { params }),
  create: (assessmentId: string, data: {
    title: string;
    description: string;
    severity: string;
    responseId?: string | null;
    rootCause?: string | null;
    rootCauseMethod?: string | null;
  }) => api.post(`/assessments/${assessmentId}/non-conformities`, data),
  update: (id: string, data: {
    title?: string;
    description?: string;
    severity?: string;
    rootCause?: string | null;
    rootCauseMethod?: string | null;
  }) => api.put(`/non-conformities/${id}`, data),
  delete: (id: string) => api.delete(`/non-conformities/${id}`),
  transition: (id: string, status: string) =>
    api.post(`/non-conformities/${id}/transition`, { status }),
  generateFromFailingResponses: (assessmentId: string) =>
    api.post(`/assessments/${assessmentId}/non-conformities/generate`),
  getSummary: (assessmentId: string) =>
    api.get(`/assessments/${assessmentId}/non-conformities/summary`),
};

export interface RootCauseChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RootCauseWhyStep {
  question: string;
  answer: string;
}

export interface RootCauseChatResult {
  reply: string;
  isComplete: boolean;
  rootCause?: string;
  whyChain?: RootCauseWhyStep[];
  contributingFactors?: string[];
}

export const rootCauseAgentApi = {
  chat: (ncrId: string, messages: RootCauseChatMessage[]) =>
    api.post(`/non-conformities/${ncrId}/root-cause-agent/chat`, { messages }),
};

export interface OnboardingReadinessProfile {
  companySize?: string;
  qmsStatus?: string;
  certificationStatus?: string;
  lastAuditSummary?: string;
  improvementNotes?: string;
  standardsKnowledgeLevel?: string;
  hoursPerWeek?: number;
}

export const onboardingApi = {
  setup: (data: {
    firstName: string; lastName: string; email: string; password: string;
    company: { name: string; slug: string; industry?: string; country?: string };
    profile?: OnboardingReadinessProfile;
    divisions: { name: string }[];
    departments: { name: string; divisionIndex?: number }[];
    roles: { name: string; permissionLevel: string }[];
    /** Cloudflare Turnstile token; required by the backend when Turnstile is configured. */
    turnstileToken?: string;
  }) => api.post('/onboarding/setup', data),
  checkSlug: (slug: string) => api.get(`/onboarding/check-slug/${slug}`),
  setupOrg: (data: {
    company: { name: string; slug: string; industry?: string; country?: string };
    profile?: OnboardingReadinessProfile;
    divisions: { name: string }[];
    departments: { name: string; divisionIndex?: number }[];
    roles: { name: string; permissionLevel: string }[];
  }) => api.post('/onboarding/setup-org', data),
};

export interface ProfileInterviewInsights {
  priorityClauses: string[];
  painPoints: string[];
  summary: string;
}

export interface ProfileInterviewResult {
  reply: string;
  isComplete: boolean;
  insights?: ProfileInterviewInsights;
}

export const organizationProfileAgentApi = {
  chat: (messages: RootCauseChatMessage[]) =>
    api.post('/organization-profile/agent/chat', { messages }),
};

export const orgInviteApi = {
  getOrg: (slug: string) => api.get(`/org/invite/${slug}`),
  join: (slug: string, data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post(`/org/invite/${slug}/join`, data),
  listInvites: () => api.get('/org/invites'),
  pendingCount: () => api.get('/org/invites/count'),
  resolve: (id: string, action: 'approve' | 'reject', orgRoleId?: string) =>
    api.post(`/org/invites/${id}/resolve`, { action, orgRoleId }),
};

export const betaInviteApi = {
  create: (data: { email?: string; expiresInDays?: number; maxUses?: number; metadata?: Record<string, any> }) =>
    api.post('/beta-invites', data),
  bulkCreate: (data: { count: number; expiresInDays?: number; maxUses?: number }) =>
    api.post('/beta-invites/bulk', data),
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string[] }) =>
    api.get('/beta-invites', { params }),
  getById: (id: string) => api.get(`/beta-invites/${id}`),
  validateCode: (code: string) => api.post('/invite/validate', { code }),
  trackUsage: (code: string, referrer?: string) => api.post('/invite/track', { code, referrer }),
  getAnalytics: (days?: number) => api.get('/beta-invites/analytics', { params: { days } }),
  send: (id: string, email: string, message?: string) => api.post(`/beta-invites/${id}/send`, { email, message }),
  sendReminder: (id: string) => api.post(`/beta-invites/${id}/reminder`),
  revoke: (id: string) => api.post(`/beta-invites/${id}/revoke`),
};

export const evidenceApi = {
  upload: (
    responseId: string,
    file: File,
    description?: string,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return api.post(`/responses/${responseId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
  listByResponse: (responseId: string) =>
    api.get(`/responses/${responseId}/evidence`),
  getById: (evidenceId: string) => api.get(`/evidence/${evidenceId}`),
  download: (evidenceId: string) =>
    api.get(`/evidence/${evidenceId}/download`, { responseType: 'blob' }),
  delete: (evidenceId: string) => api.delete(`/evidence/${evidenceId}`),
};
