import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
}

// Auth store
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /**
   * True once persisted auth state has been read back from localStorage.
   * Route guards must wait for this before treating `isAuthenticated===false`
   * as logged-out — otherwise a refresh reads the pre-hydration default and
   * redirects to `/login` with a valid stored session.
   */
  hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Assessment draft store (for auto-save)
interface DraftResponse {
  questionId: string;
  score?: number;
  justification?: string;
  verifiedSubPoints?: string[];
  actionProposal?: string;
  conclusion?: string;
}

interface AssessmentDraftState {
  assessmentId: string | null;
  responses: Record<string, DraftResponse>;
  lastSaved: Date | null;
  isDirty: boolean;
  setAssessmentId: (id: string) => void;
  updateResponse: (questionId: string, data: Partial<DraftResponse>) => void;
  clearDraft: () => void;
  markSaved: () => void;
}

export const useAssessmentDraftStore = create<AssessmentDraftState>()((set) => ({
  assessmentId: null,
  responses: {},
  lastSaved: null,
  isDirty: false,
  setAssessmentId: (id) => set({ assessmentId: id, responses: {}, isDirty: false }),
  updateResponse: (questionId, data) =>
    set((state) => ({
      responses: {
        ...state.responses,
        [questionId]: {
          ...state.responses[questionId],
          questionId,
          ...data,
        },
      },
      isDirty: true,
    })),
  clearDraft: () => set({ assessmentId: null, responses: {}, isDirty: false }),
  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
}));

// UI store
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  currentSection: string | null;
  toggleSidebar: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  setCurrentSection: (section: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  currentSection: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  setCurrentSection: (section) => set({ currentSection: section }),
}));
