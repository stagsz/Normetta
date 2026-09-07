import { act } from '@testing-library/react';
import { useAuthStore, useAssessmentDraftStore, useUIStore } from '../store';

// Reset all stores before each test
beforeEach(() => {
  // Clear localStorage
  localStorage.clear();

  // Reset auth store to initial state
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  // Reset assessment draft store to initial state
  useAssessmentDraftStore.setState({
    assessmentId: null,
    responses: {},
    lastSaved: null,
    isDirty: false,
  });

  // Reset UI store to initial state
  useUIStore.setState({
    sidebarOpen: true,
    mobileMenuOpen: false,
    currentSection: null,
  });
});

describe('useAuthStore', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'QUALITY_MANAGER',
    organizationId: 'org-456',
    organization: {
      id: 'org-456',
      name: 'Test Organization',
    },
  };

  const mockAccessToken = 'mock-access-token-abc123';
  const mockRefreshToken = 'mock-refresh-token-xyz789';

  describe('initial state', () => {
    it('should have null user', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have null access token', () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
    });

    it('should have null refresh token', () => {
      const state = useAuthStore.getState();
      expect(state.refreshToken).toBeNull();
    });

    it('should not be authenticated', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth (login)', () => {
    it('should set user data', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should set access token', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(mockAccessToken);
    });

    it('should set refresh token', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.refreshToken).toBe(mockRefreshToken);
    });

    it('should set isAuthenticated to true', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    it('should store access token in localStorage', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
    });

    it('should store refresh token in localStorage', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      expect(localStorage.getItem('refreshToken')).toBe(mockRefreshToken);
    });

    it('should update tokens when called again (token refresh flow)', () => {
      // Initial login
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Simulate token refresh with new tokens
      const newAccessToken = 'new-access-token-def456';
      const newRefreshToken = 'new-refresh-token-uvw123';

      act(() => {
        useAuthStore.getState().setAuth(mockUser, newAccessToken, newRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(newAccessToken);
      expect(state.refreshToken).toBe(newRefreshToken);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe(newAccessToken);
      expect(localStorage.getItem('refreshToken')).toBe(newRefreshToken);
    });

    it('should allow updating user data without changing tokens', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const updatedUser = {
        ...mockUser,
        firstName: 'Jane',
        role: 'SYSTEM_ADMIN',
      };

      act(() => {
        useAuthStore.getState().setAuth(updatedUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.user?.firstName).toBe('Jane');
      expect(state.user?.role).toBe('SYSTEM_ADMIN');
    });
  });

  describe('clearAuth (logout)', () => {
    beforeEach(() => {
      // Set up authenticated state before each test
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });
    });

    it('should clear user data', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should clear access token', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
    });

    it('should clear refresh token', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const state = useAuthStore.getState();
      expect(state.refreshToken).toBeNull();
    });

    it('should set isAuthenticated to false', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should remove access token from localStorage', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('should remove refresh token from localStorage', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should clear all auth state completely', () => {
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      const state = useAuthStore.getState();
      expect(state).toEqual(
        expect.objectContaining({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      );
    });
  });

  describe('token refresh flow', () => {
    it('should preserve user when refreshing tokens', () => {
      // Initial login
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Simulate token refresh - same user, new tokens
      const newAccessToken = 'refreshed-access-token';
      const newRefreshToken = 'refreshed-refresh-token';

      act(() => {
        useAuthStore.getState().setAuth(mockUser, newAccessToken, newRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(newAccessToken);
      expect(state.refreshToken).toBe(newRefreshToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should allow re-authentication after logout', () => {
      // Login
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Logout
      act(() => {
        useAuthStore.getState().clearAuth();
      });

      // Re-login with different user
      const newUser = {
        ...mockUser,
        id: 'user-789',
        email: 'different@example.com',
      };
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      act(() => {
        useAuthStore.getState().setAuth(newUser, newAccessToken, newRefreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.user?.id).toBe('user-789');
      expect(state.user?.email).toBe('different@example.com');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('persistence', () => {
    it('should persist user to zustand storage', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Check that zustand persist storage has the data
      const persistedData = localStorage.getItem('auth-storage');
      expect(persistedData).not.toBeNull();

      const parsed = JSON.parse(persistedData!);
      expect(parsed.state.user).toEqual(mockUser);
      expect(parsed.state.isAuthenticated).toBe(true);
    });

    it('should not persist tokens in zustand storage (security)', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Zustand persist should NOT include tokens (partialize excludes them)
      const persistedData = localStorage.getItem('auth-storage');
      const parsed = JSON.parse(persistedData!);

      // Only user and isAuthenticated should be persisted, not tokens
      expect(parsed.state.accessToken).toBeUndefined();
      expect(parsed.state.refreshToken).toBeUndefined();
    });
  });
});

describe('useAssessmentDraftStore', () => {
  describe('initial state', () => {
    it('should have null assessmentId', () => {
      const state = useAssessmentDraftStore.getState();
      expect(state.assessmentId).toBeNull();
    });

    it('should have empty responses', () => {
      const state = useAssessmentDraftStore.getState();
      expect(state.responses).toEqual({});
    });

    it('should have null lastSaved', () => {
      const state = useAssessmentDraftStore.getState();
      expect(state.lastSaved).toBeNull();
    });

    it('should not be dirty', () => {
      const state = useAssessmentDraftStore.getState();
      expect(state.isDirty).toBe(false);
    });
  });

  describe('setAssessmentId', () => {
    it('should set assessment ID', () => {
      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('assessment-123');
      });

      const state = useAssessmentDraftStore.getState();
      expect(state.assessmentId).toBe('assessment-123');
    });

    it('should reset responses when setting new ID', () => {
      // Add some responses first
      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('old-assessment');
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 3 });
      });

      // Set new assessment ID
      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('new-assessment');
      });

      const state = useAssessmentDraftStore.getState();
      expect(state.responses).toEqual({});
    });

    it('should reset isDirty when setting new ID', () => {
      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('assessment-1');
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 2 });
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(true);

      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('assessment-2');
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(false);
    });
  });

  describe('updateResponse', () => {
    it('should add new response', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('question-1', {
          score: 3,
          justification: 'Fully compliant',
        });
      });

      const state = useAssessmentDraftStore.getState();
      expect(state.responses['question-1']).toEqual({
        questionId: 'question-1',
        score: 3,
        justification: 'Fully compliant',
      });
    });

    it('should set isDirty to true', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 2 });
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(true);
    });

    it('should update existing response', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 2 });
      });

      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { justification: 'Updated reason' });
      });

      const state = useAssessmentDraftStore.getState();
      expect(state.responses['q1']).toEqual({
        questionId: 'q1',
        score: 2,
        justification: 'Updated reason',
      });
    });

    it('should preserve other responses when updating one', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 3 });
        useAssessmentDraftStore.getState().updateResponse('q2', { score: 2 });
      });

      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { justification: 'Updated' });
      });

      const state = useAssessmentDraftStore.getState();
      expect(state.responses['q2']).toEqual({
        questionId: 'q2',
        score: 2,
      });
    });
  });

  describe('clearDraft', () => {
    it('should clear assessment ID', () => {
      act(() => {
        useAssessmentDraftStore.getState().setAssessmentId('assessment-123');
        useAssessmentDraftStore.getState().clearDraft();
      });

      expect(useAssessmentDraftStore.getState().assessmentId).toBeNull();
    });

    it('should clear responses', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 3 });
        useAssessmentDraftStore.getState().clearDraft();
      });

      expect(useAssessmentDraftStore.getState().responses).toEqual({});
    });

    it('should reset isDirty', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 2 });
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(true);

      act(() => {
        useAssessmentDraftStore.getState().clearDraft();
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(false);
    });
  });

  describe('markSaved', () => {
    it('should set isDirty to false', () => {
      act(() => {
        useAssessmentDraftStore.getState().updateResponse('q1', { score: 2 });
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(true);

      act(() => {
        useAssessmentDraftStore.getState().markSaved();
      });

      expect(useAssessmentDraftStore.getState().isDirty).toBe(false);
    });

    it('should set lastSaved to current time', () => {
      const beforeSave = new Date();

      act(() => {
        useAssessmentDraftStore.getState().markSaved();
      });

      const afterSave = new Date();
      const lastSaved = useAssessmentDraftStore.getState().lastSaved;

      expect(lastSaved).not.toBeNull();
      expect(lastSaved!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(lastSaved!.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });
});

describe('useUIStore', () => {
  describe('initial state', () => {
    it('should have sidebar open', () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
    });

    it('should have mobile menu closed', () => {
      const state = useUIStore.getState();
      expect(state.mobileMenuOpen).toBe(false);
    });

    it('should have null current section', () => {
      const state = useUIStore.getState();
      expect(state.currentSection).toBeNull();
    });
  });

  describe('toggleSidebar', () => {
    it('should close sidebar when open', () => {
      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should open sidebar when closed', () => {
      act(() => {
        useUIStore.setState({ sidebarOpen: false });
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('mobile menu', () => {
    it('should open mobile menu', () => {
      act(() => {
        useUIStore.getState().openMobileMenu();
      });

      expect(useUIStore.getState().mobileMenuOpen).toBe(true);
    });

    it('should close mobile menu', () => {
      act(() => {
        useUIStore.getState().openMobileMenu();
        useUIStore.getState().closeMobileMenu();
      });

      expect(useUIStore.getState().mobileMenuOpen).toBe(false);
    });
  });

  describe('setCurrentSection', () => {
    it('should set current section', () => {
      act(() => {
        useUIStore.getState().setCurrentSection('section-4.1');
      });

      expect(useUIStore.getState().currentSection).toBe('section-4.1');
    });

    it('should allow setting to null', () => {
      act(() => {
        useUIStore.getState().setCurrentSection('section-4.1');
        useUIStore.getState().setCurrentSection(null);
      });

      expect(useUIStore.getState().currentSection).toBeNull();
    });
  });
});
