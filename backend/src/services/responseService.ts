import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '../types/enums';
import { assessmentService } from './assessmentService';

interface CreateOrUpdateResponseData {
  questionId: string;
  score?: number | null;
  justification?: string | null;
  isDraft?: boolean;
  actionProposal?: string | null;
  conclusion?: string | null;
}

interface BulkUpdateResponseData {
  questionId: string;
  score?: number | null;
  justification?: string | null;
  isDraft?: boolean;
  actionProposal?: string | null;
  conclusion?: string | null;
}

interface ResponseFilters {
  sectionId?: string;
  isDraft?: boolean;
  hasScore?: boolean;
}

export class ResponseService {
  /**
   * Get all responses for an assessment
   */
  async getByAssessment(
    assessmentId: string,
    organizationId: string,
    filters: ResponseFilters = {}
  ) {
    // Verify assessment exists and belongs to the organization
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    const where: Record<string, unknown> = {
      assessmentId,
    };

    if (filters.sectionId) {
      where.sectionId = filters.sectionId;
    }

    if (typeof filters.isDraft === 'boolean') {
      where.isDraft = filters.isDraft;
    }

    if (typeof filters.hasScore === 'boolean') {
      if (filters.hasScore) {
        where.score = { not: null };
      } else {
        where.score = null;
      }
    }

    const responses = await prisma.questionResponse.findMany({
      where,
      orderBy: [
        { section: { order: 'asc' } },
        { question: { order: 'asc' } },
      ],
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            guidance: true,
            score1Criteria: true,
            score2Criteria: true,
            score3Criteria: true,
            standardReference: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        evidence: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            description: true,
            uploadedAt: true,
          },
        },
      },
    });

    // Get total question count for progress calculation
    const totalQuestions = await prisma.auditQuestion.count({
      where: { isActive: true },
    });

    const answeredCount = responses.filter((r: any) => r.score !== null).length;
    const draftCount = responses.filter((r: any) => r.isDraft).length;

    return {
      responses,
      summary: {
        totalQuestions,
        answeredCount,
        draftCount,
        progress: totalQuestions > 0
          ? Math.round((answeredCount / totalQuestions) * 100)
          : 0,
      },
    };
  }

  /**
   * Create or update a single response (upsert)
   */
  async createOrUpdate(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: CreateOrUpdateResponseData
  ) {
    // Verify assessment exists and user has permission
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        teamMembers: {
          select: { userId: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user can edit responses
    const canEdit = this.canEditResponses(assessment, userId, userRole);
    if (!canEdit) {
      throw new AuthorizationError('You do not have permission to edit responses for this assessment');
    }

    // Validate assessment status allows editing
    if (['COMPLETED', 'ARCHIVED'].includes(assessment.status)) {
      throw new ValidationError('Cannot modify responses for a completed or archived assessment');
    }

    // Validate question exists
    const question = await prisma.auditQuestion.findUnique({
      where: { id: data.questionId },
      include: {
        section: {
          select: { id: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Audit Question', data.questionId);
    }

    // Validate score if provided
    if (data.score !== null && data.score !== undefined) {
      if (![0, 1, 2, 3, 4, 5].includes(data.score)) {
        throw new ValidationError('Score must be 1, 2, or 3');
      }
    }

    // Require justification for non-compliant scores (1 or 2) when not a draft
    if (
      data.isDraft === false &&
      data.score !== null &&
      data.score !== undefined &&
      data.score < 3 &&
      (!data.justification || data.justification.trim().length === 0)
    ) {
      throw new ValidationError('Justification is required for scores below 3');
    }

    // Upsert the response
    const response = await prisma.questionResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: data.questionId,
        },
      },
      create: {
        assessmentId,
        questionId: data.questionId,
        userId,
        sectionId: question.section?.id || null,
        score: data.score ?? null,
        justification: data.justification ?? null,
        isDraft: data.isDraft ?? true,
        actionProposal: data.actionProposal ?? null,
        conclusion: data.conclusion ?? null,
      },
      update: {
        score: data.score ?? null,
        justification: data.justification ?? null,
        isDraft: data.isDraft ?? true,
        actionProposal: data.actionProposal ?? null,
        conclusion: data.conclusion ?? null,
        userId, // Track who last modified
      },
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Trigger score recalculation if not a draft
    if (!response.isDraft) {
      await this.triggerScoreCalculation(assessmentId);
    }

    return response;
  }

  /**
   * Bulk update multiple responses
   */
  async bulkUpdate(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    responses: BulkUpdateResponseData[]
  ) {
    // Verify assessment exists and user has permission
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        teamMembers: {
          select: { userId: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user can edit responses
    const canEdit = this.canEditResponses(assessment, userId, userRole);
    if (!canEdit) {
      throw new AuthorizationError('You do not have permission to edit responses for this assessment');
    }

    // Validate assessment status allows editing
    if (['COMPLETED', 'ARCHIVED'].includes(assessment.status)) {
      throw new ValidationError('Cannot modify responses for a completed or archived assessment');
    }

    // Validate all question IDs exist
    const questionIds = responses.map((r) => r.questionId);
    const questions = await prisma.auditQuestion.findMany({
      where: { id: { in: questionIds } },
      include: {
        section: {
          select: { id: true },
        },
      },
    });

    const questionMap = new Map(questions.map((q: any) => [q.id, q]));

    const missingQuestions = questionIds.filter((id) => !questionMap.has(id));
    if (missingQuestions.length > 0) {
      throw new ValidationError(`Invalid question IDs: ${missingQuestions.join(', ')}`);
    }

    // Validate scores and justifications
    for (const response of responses) {
      if (response.score !== null && response.score !== undefined) {
        if (![0, 1, 2, 3, 4, 5].includes(response.score)) {
          throw new ValidationError(`Invalid score ${response.score} for question ${response.questionId}. Score must be 0-5`);
        }
      }

      // Require justification for non-compliant scores when not a draft
      if (
        response.isDraft === false &&
        response.score !== null &&
        response.score !== undefined &&
        response.score < 3 &&
        (!response.justification || response.justification.trim().length === 0)
      ) {
        throw new ValidationError(`Justification is required for question ${response.questionId} with score ${response.score}`);
      }
    }

    // Perform bulk upsert using a transaction
    const results = await prisma.$transaction(
      responses.map((data) => {
        const question = questionMap.get(data.questionId)!;
        return prisma.questionResponse.upsert({
          where: {
            assessmentId_questionId: {
              assessmentId,
              questionId: data.questionId,
            },
          },
          create: {
            assessmentId,
            questionId: data.questionId,
            userId,
            sectionId: (question as any).section?.id || null,
            score: data.score ?? null,
            justification: data.justification ?? null,
            isDraft: data.isDraft ?? true,
            actionProposal: data.actionProposal ?? null,
            conclusion: data.conclusion ?? null,
          },
          update: {
            score: data.score ?? null,
            justification: data.justification ?? null,
            isDraft: data.isDraft ?? true,
            actionProposal: data.actionProposal ?? null,
            conclusion: data.conclusion ?? null,
            userId,
          },
          include: {
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
              },
            },
            section: {
              select: {
                id: true,
                sectionNumber: true,
                title: true,
              },
            },
          },
        });
      })
    );

    // Trigger score recalculation if any non-draft responses
    const hasNonDraft = results.some((r: any) => !r.isDraft);
    if (hasNonDraft) {
      await this.triggerScoreCalculation(assessmentId);
    }

    return {
      updated: results.length,
      responses: results,
    };
  }

  /**
   * Save draft response (auto-save functionality)
   */
  async saveDraft(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: CreateOrUpdateResponseData
  ) {
    // Force isDraft to true for auto-save
    return this.createOrUpdate(
      assessmentId,
      organizationId,
      userId,
      userRole,
      {
        ...data,
        isDraft: true,
      }
    );
  }

  /**
   * Get a single response by assessment and question ID
   */
  async getByQuestionId(
    assessmentId: string,
    organizationId: string,
    questionId: string
  ) {
    // Verify assessment exists and belongs to the organization
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    const response = await prisma.questionResponse.findUnique({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            guidance: true,
            score1Criteria: true,
            score2Criteria: true,
            score3Criteria: true,
            standardReference: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        evidence: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            description: true,
            uploadedAt: true,
          },
        },
      },
    });

    return response;
  }

  /**
   * Check if user can edit responses for an assessment
   */
  private canEditResponses(
    assessment: {
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always edit
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can edit
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can edit
    const isTeamMember = assessment.teamMembers.some((tm) => tm.userId === userId);
    if (isTeamMember && userRole === UserRole.INTERNAL_AUDITOR) {
      return true;
    }

    return false;
  }

  /**
   * Trigger assessment score calculation
   */
  private async triggerScoreCalculation(assessmentId: string): Promise<void> {
    try {
      await assessmentService.calculateScores(assessmentId);
    } catch (error) {
      // Log the error but don't fail the response save
      console.error('Failed to calculate assessment scores:', error);
    }
  }
}

export const responseService = new ResponseService();
