import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { responsesApi } from '@/lib/api';
import { useAutoSave, AutoSaveStatus } from './useAutoSave';

export interface QuestionResponse {
  id?: string;
  questionId: string;
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification: string;
  sectionId?: string;
  isDraft: boolean;
}

interface ResponseFromApi {
  id: string;
  questionId: string;
  score: number | null;
  justification: string | null;
  sectionId: string | null;
  isDraft: boolean;
  section?: {
    id: string;
    sectionNumber: string;
    title: string;
  } | null;
}

interface UseAssessmentResponsesOptions {
  assessmentId: string;
  /** Auto-save delay in ms (default: 30000) */
  autoSaveDelay?: number;
  /** Callback when auto-save succeeds */
  onAutoSaveSuccess?: () => void;
  /** Callback when auto-save fails */
  onAutoSaveError?: (error: Error) => void;
  /** Disable auto-save entirely */
  disableAutoSave?: boolean;
}

interface UseAssessmentResponsesReturn {
  /** All responses (merged from API and local changes) */
  responses: Map<string, QuestionResponse>;
  /** Get response for a specific question */
  getResponse: (questionId: string) => QuestionResponse | undefined;
  /** Update a response (triggers auto-save) */
  updateResponse: (questionId: string, updates: Partial<Omit<QuestionResponse, 'questionId'>>) => void;
  /** Current auto-save status */
  saveStatus: AutoSaveStatus;
  /** Manually trigger save */
  saveNow: () => Promise<void>;
  /** Number of pending changes */
  pendingCount: number;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Save error message */
  saveError: string | null;
  /** Is loading initial data */
  isLoading: boolean;
  /** Error loading initial data */
  loadError: Error | null;
  /** Refetch responses from API */
  refetch: () => void;
}

export function useAssessmentResponses({
  assessmentId,
  autoSaveDelay = 30000,
  onAutoSaveSuccess,
  onAutoSaveError,
  disableAutoSave = false,
}: UseAssessmentResponsesOptions): UseAssessmentResponsesReturn {
  // Local state for tracking response changes
  const [localResponses, setLocalResponses] = useState<Map<string, QuestionResponse>>(new Map());

  // Fetch responses from API
  const {
    data,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['assessment-responses', assessmentId],
    queryFn: async () => {
      const result = await responsesApi.getByAssessment(assessmentId);
      return result.data as { success: boolean; data: ResponseFromApi[] };
    },
    enabled: !!assessmentId,
  });

  // Auto-save hook
  const {
    status: saveStatus,
    markChanged,
    saveNow,
    pendingCount,
    lastSaved,
    error: saveError,
  } = useAutoSave({
    assessmentId,
    delay: autoSaveDelay,
    onSuccess: onAutoSaveSuccess,
    onError: onAutoSaveError,
  });

  // Convert API responses to Map
  const apiResponses = useMemo(() => {
    const map = new Map<string, QuestionResponse>();
    if (data?.data) {
      data.data.forEach((r) => {
        map.set(r.questionId, {
          id: r.id,
          questionId: r.questionId,
          score: r.score as 0 | 1 | 2 | 3 | 4 | 5 | null,
          justification: r.justification || '',
          sectionId: r.sectionId || undefined,
          isDraft: r.isDraft,
        });
      });
    }
    return map;
  }, [data]);

  // Merge API responses with local changes (local takes precedence)
  const responses = useMemo(() => {
    const merged = new Map(apiResponses);
    localResponses.forEach((value, key) => {
      merged.set(key, value);
    });
    return merged;
  }, [apiResponses, localResponses]);

  // Get response for a specific question
  const getResponse = useCallback(
    (questionId: string): QuestionResponse | undefined => {
      return responses.get(questionId);
    },
    [responses]
  );

  // Update a response
  const updateResponse = useCallback(
    (questionId: string, updates: Partial<Omit<QuestionResponse, 'questionId'>>) => {
      const existing = responses.get(questionId);
      const updated: QuestionResponse = {
        ...existing,
        questionId,
        score: updates.score !== undefined ? updates.score : (existing?.score ?? null),
        justification:
          updates.justification !== undefined
            ? updates.justification
            : (existing?.justification ?? ''),
        sectionId: updates.sectionId !== undefined ? updates.sectionId : existing?.sectionId,
        isDraft: true,
      };

      // Update local state
      setLocalResponses((prev) => {
        const next = new Map(prev);
        next.set(questionId, updated);
        return next;
      });

      // Trigger auto-save if enabled
      if (!disableAutoSave) {
        markChanged({
          questionId,
          score: updated.score,
          justification: updated.justification,
          sectionId: updated.sectionId,
          isDraft: true,
        });
      }
    },
    [responses, disableAutoSave, markChanged]
  );

  return {
    responses,
    getResponse,
    updateResponse,
    saveStatus,
    saveNow,
    pendingCount,
    lastSaved,
    saveError,
    isLoading,
    loadError: loadError as Error | null,
    refetch,
  };
}
