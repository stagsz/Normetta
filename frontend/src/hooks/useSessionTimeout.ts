import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

/** Time in milliseconds before showing warning toast (25 minutes) */
const WARNING_TIMEOUT = 25 * 60 * 1000;

/** Time in milliseconds before auto-logout (30 minutes) */
const LOGOUT_TIMEOUT = 30 * 60 * 1000;

/** Events that indicate user activity */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'focus',
] as const;

interface UseSessionTimeoutOptions {
  /** Override warning timeout (for testing) */
  warningTimeout?: number;
  /** Override logout timeout (for testing) */
  logoutTimeout?: number;
  /** Enable/disable the timeout (default: true) */
  enabled?: boolean;
}

/**
 * Hook to handle session timeout with warning and auto-logout.
 *
 * - Shows a warning toast at 25 minutes of inactivity
 * - Auto-logs out and redirects to login at 30 minutes
 * - Resets timer on any user activity (mouse, keyboard, touch, scroll)
 */
export function useSessionTimeout({
  warningTimeout = WARNING_TIMEOUT,
  logoutTimeout = LOGOUT_TIMEOUT,
  enabled = true,
}: UseSessionTimeoutOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, clearAuth } = useAuthStore();

  // Refs for timer IDs
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if warning has been shown to avoid duplicate toasts
  const warningShownRef = useRef(false);

  // Track last activity time for debugging
  const lastActivityRef = useRef<Date>(new Date());

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    clearTimers();
    clearAuth();
    toast.error('Session expired due to inactivity', {
      description: 'Please log in again to continue.',
      duration: 5000,
    });
    router.push('/login');
  }, [clearTimers, clearAuth, router]);

  // Show warning toast
  const showWarning = useCallback(() => {
    if (warningShownRef.current) return;

    warningShownRef.current = true;
    const remainingMinutes = Math.round((logoutTimeout - warningTimeout) / 60000);

    toast.warning('Session timeout warning', {
      description: `You will be logged out in ${remainingMinutes} minutes due to inactivity. Move your mouse or press any key to stay logged in.`,
      duration: 10000,
      id: 'session-timeout-warning',
    });
  }, [logoutTimeout, warningTimeout]);

  // Reset timers on activity
  const resetTimers = useCallback(() => {
    if (!enabled || !isAuthenticated) return;

    // Update last activity time
    lastActivityRef.current = new Date();

    // Reset warning flag
    warningShownRef.current = false;

    // Dismiss any existing warning toast
    toast.dismiss('session-timeout-warning');

    // Clear existing timers
    clearTimers();

    // Set new warning timer
    warningTimerRef.current = setTimeout(() => {
      showWarning();
    }, warningTimeout);

    // Set new logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, logoutTimeout);
  }, [enabled, isAuthenticated, clearTimers, showWarning, handleLogout, warningTimeout, logoutTimeout]);

  // Set up activity listeners and initial timers
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      clearTimers();
      return;
    }

    // Initialize timers
    resetTimers();

    // Throttle function to prevent excessive timer resets
    let lastResetTime = Date.now();
    const THROTTLE_MS = 1000; // Only reset timers once per second max

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastResetTime >= THROTTLE_MS) {
        lastResetTime = now;
        resetTimers();
      }
    };

    // Add event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, isAuthenticated, resetTimers, clearTimers]);

  // Return values for external use (e.g., manual reset or testing)
  return {
    resetTimers,
    lastActivity: lastActivityRef.current,
  };
}

export { WARNING_TIMEOUT, LOGOUT_TIMEOUT };
