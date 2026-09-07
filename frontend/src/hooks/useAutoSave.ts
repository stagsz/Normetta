import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { responsesApi } from '@/lib/api';

export type AutoSaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface ResponseData {
  questionId: string;
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification?: string;
  sectionId?: string;
  isDraft?: boolean;
}

interface UseAutoSaveOptions {
  assessmentId: string;
  /** Delay in milliseconds before auto-saving (default: 30000 = 30 seconds) */
  delay?: number;
  /** Callback when save succeeds */
  onSuccess?: () => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: AutoSaveStatus;
  /** Mark a response as changed (triggers auto-save timer) */
  markChanged: (data: ResponseData) => void;
  /** Manually trigger an immediate save */
  saveNow: () => Promise<void>;
  /** Clear all pending changes without saving */
  clearChanges: () => void;
  /** Number of pending changes */
  pendingCount: number;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Error message if save failed */
  error: string | null;
}

const AUTO_SAVE_DELAY = 30000; // 30 seconds

export function useAutoSave({
  assessmentId,
  delay = AUTO_SAVE_DELAY,
  onSuccess,
  onError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store pending changes in a ref to avoid re-renders on each change
  const pendingChangesRef = useRef<Map<string, ResponseData>>(new Map());
  const [pendingCount, setPendingCount] = useState(0);

  // Timer ref for debouncing
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  const bulkUpdateMutation = useMutation({
    mutationFn: async (responses: ResponseData[]) => {
      const result = await responsesApi.bulkUpdate(assessmentId, responses);
      return result.data;
    },
    onSuccess: () => {
      if (!isMountedRef.current) return;

      setStatus('saved');
      setLastSaved(new Date());
      setError(null);

      // Invalidate assessment query to refresh data
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });

      onSuccess?.();

      // Reset status back to idle after a short delay
      setTimeout(() => {
        if (isMountedRef.current && pendingChangesRef.current.size === 0) {
          setStatus('idle');
        }
      }, 2000);
    },
    onError: (err: Error) => {
      if (!isMountedRef.current) return;

      setStatus('error');
      setError(err.message || 'Failed to save changes');
      onError?.(err);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Function to perform the actual save
  const performSave = useCallback(async () => {
    if (pendingChangesRef.current.size === 0) {
      return;
    }

    const responses = Array.from(pendingChangesRef.current.values());

    // Clear pending changes before saving
    pendingChangesRef.current.clear();
    setPendingCount(0);

    setStatus('saving');

    try {
      await bulkUpdateMutation.mutateAsync(responses);
    } catch {
      // Error is handled in mutation onError
      // Re-add failed changes back to pending
      responses.forEach((r) => {
        pendingChangesRef.current.set(r.questionId, r);
      });
      setPendingCount(pendingChangesRef.current.size);
    }
  }, [bulkUpdateMutation]);

  // Mark a response as changed
  const markChanged = useCallback(
    (data: ResponseData) => {
      // Store the change
      pendingChangesRef.current.set(data.questionId, {
        ...data,
        isDraft: true,
      });
      setPendingCount(pendingChangesRef.current.size);
      setStatus('unsaved');
      setError(null);

      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        performSave();
      }, delay);
    },
    [delay, performSave]
  );

  // Manual save function
  const saveNow = useCallback(async () => {
    // Clear timer since we're saving immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    await performSave();
  }, [performSave]);

  // Clear all pending changes
  const clearChanges = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingChangesRef.current.clear();
    setPendingCount(0);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    markChanged,
    saveNow,
    clearChanges,
    pendingCount,
    lastSaved,
    error,
  };
}
