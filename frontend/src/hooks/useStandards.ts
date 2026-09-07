import { useQuery } from '@tanstack/react-query';
import { standardsApi } from '@/lib/api';

export interface ISOSection {
  id: string;
  sectionNumber: string;
  title: string;
  description: string | null;
  order: number;
  parentId: string | null;
  children: ISOSection[];
  _count?: {
    questions: number;
  };
}

export interface AuditQuestion {
  id: string;
  questionNumber: string;
  questionText: string;
  guidance: string | null;
  standardReference: string | null;
  score1Criteria: string;
  score2Criteria: string;
  score3Criteria: string;
  sectionId: string;
  isActive: boolean;
  order: number;
  section?: ISOSection;
}

export interface SectionsResponse {
  success: boolean;
  data: ISOSection[];
}

export interface QuestionsResponse {
  success: boolean;
  data: AuditQuestion[];
}

export function useSections(options?: { assessmentId?: string; templateId?: string }) {
  return useQuery({
    queryKey: ['sections', options?.assessmentId, options?.templateId],
    queryFn: async () => {
      const response = await standardsApi.getSections(options);
      return response.data as SectionsResponse;
    },
  });
}

export function useQuestionsBySection(sectionId: string | null) {
  return useQuery({
    queryKey: ['questions', sectionId],
    queryFn: async () => {
      const response = await standardsApi.getQuestions(sectionId || undefined);
      return response.data as QuestionsResponse;
    },
    enabled: !!sectionId,
  });
}
