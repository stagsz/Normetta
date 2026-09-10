import { Request, Response } from 'express';
import { z } from 'zod';
import { responseService } from '../services/responseService';
import { withValidation } from '../proxy/validationProxy';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const responseQuerySchema = z.object({
  sectionId: z.string().uuid('Invalid section ID format').optional(),
  isDraft: z.coerce.boolean().optional(),
  hasScore: z.coerce.boolean().optional(),
});

const upsertResponseSchema = z.object({
  questionId: z.string().uuid('Invalid question ID format'),
  score: z.number().int().min(0).max(5).nullable().optional(),
  justification: z.string().max(5000).nullable().optional(),
  sectionId: z.string().uuid('Invalid section ID format').optional(),
  isDraft: z.boolean().optional(),
  actionProposal: z.string().max(5000).nullable().optional(),
  conclusion: z.string().max(5000).nullable().optional(),
});

const bulkUpdateSchema = z.object({
  responses: z.array(upsertResponseSchema).min(1, 'At least one response is required'),
});

const assessmentIdParam = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class ResponseController {
  /**
   * GET /api/assessments/:id/responses
   * Get all responses for an assessment with optional filters
   */
  getByAssessment = withValidation(
    {
      params: assessmentIdParam,
      query: responseQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { sectionId, isDraft, hasScore } = req.query as {
        sectionId?: string;
        isDraft?: boolean;
        hasScore?: boolean;
      };

      const result = await responseService.getByAssessment(
        req.params.id,
        req.user!.organizationId,
        { sectionId, isDraft, hasScore }
      );

      res.json({
        success: true,
        data: result.responses,
        summary: result.summary,
      });
    }
  );

  /**
   * POST /api/assessments/:id/responses
   * Create or update a single response (upsert)
   */
  createOrUpdate = withValidation(
    {
      params: assessmentIdParam,
      body: upsertResponseSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const response = await responseService.createOrUpdate(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.status(200).json({
        success: true,
        data: response,
      });
    }
  );

  /**
   * PUT /api/assessments/:id/responses/bulk
   * Bulk update multiple responses
   */
  bulkUpdate = withValidation(
    {
      params: assessmentIdParam,
      body: bulkUpdateSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { responses } = req.body as { responses: Array<{
        questionId: string;
        score?: number | null;
        justification?: string | null;
        isDraft?: boolean;
        actionProposal?: string | null;
        conclusion?: string | null;
      }> };

      const result = await responseService.bulkUpdate(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        responses
      );

      res.json({
        success: true,
        data: result.responses,
        updated: result.updated,
      });
    }
  );

  /**
   * POST /api/assessments/:id/responses/draft
   * Save draft response (auto-save functionality)
   */
  saveDraft = withValidation(
    {
      params: assessmentIdParam,
      body: upsertResponseSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const response = await responseService.saveDraft(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.json({
        success: true,
        data: response,
      });
    }
  );

  /**
   * GET /api/assessments/:id/responses/:questionId
   * Get a single response by question ID
   */
  getByQuestionId = withValidation(
    {
      params: z.object({
        id: z.string().uuid('Invalid assessment ID format'),
        questionId: z.string().uuid('Invalid question ID format'),
      }),
    },
    async (req: Request, res: Response): Promise<void> => {
      const response = await responseService.getByQuestionId(
        req.params.id,
        req.user!.organizationId,
        req.params.questionId
      );

      res.json({
        success: true,
        data: response,
      });
    }
  );
}

export const responseController = new ResponseController();
