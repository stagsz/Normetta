import { Request, Response } from 'express';
import { z } from 'zod';
import { nonConformityService } from '../services/nonConformityService';
import { withValidation, commonSchemas } from '../proxy/validationProxy';
import { Severity, NCRStatus } from '../types/enums';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const assessmentIdParam = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
});

const ncrIdParam = z.object({
  id: z.string().uuid('Invalid non-conformity ID format'),
});

const ncrListQuerySchema = commonSchemas.pagination.merge(
  z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).optional(),
    search: z.string().max(100).optional(),
  })
);

const createNCRSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(5000),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']),
  responseId: z.string().uuid('Invalid response ID format').nullable().optional(),
  rootCause: z.string().max(5000).nullable().optional(),
  rootCauseMethod: z.string().max(100).nullable().optional(),
});

const updateNCRSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(5000).optional(),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).optional(),
  rootCause: z.string().max(5000).nullable().optional(),
  rootCauseMethod: z.string().max(100).nullable().optional(),
});

const transitionStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class NonConformityController {
  /**
   * GET /api/non-conformities
   * List all non-conformities for the organization with optional filters
   */
  listAll = withValidation(
    {
      query: ncrListQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { status, severity, search, page, pageSize, sortBy, sortOrder } = req.query as unknown as {
        status?: NCRStatus;
        severity?: Severity;
        search?: string;
        page: number;
        pageSize: number;
        sortBy?: string;
        sortOrder: 'asc' | 'desc';
      };

      const result = await nonConformityService.listAll(
        req.user!.organizationId,
        { status, severity, search },
        { page, limit: pageSize, sortBy, sortOrder }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /api/assessments/:id/non-conformities
   * List all non-conformities for an assessment with optional filters
   */
  listByAssessment = withValidation(
    {
      params: assessmentIdParam,
      query: ncrListQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { status, severity, search, page, pageSize, sortBy, sortOrder } = req.query as unknown as {
        status?: NCRStatus;
        severity?: Severity;
        search?: string;
        page: number;
        pageSize: number;
        sortBy?: string;
        sortOrder: 'asc' | 'desc';
      };

      const result = await nonConformityService.listByAssessment(
        req.params.id,
        req.user!.organizationId,
        { status, severity, search },
        { page, limit: pageSize, sortBy, sortOrder }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /api/non-conformities/:id
   * Get a single non-conformity by ID
   */
  getById = withValidation(
    {
      params: ncrIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const ncr = await nonConformityService.getById(
        req.params.id,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: ncr,
      });
    }
  );

  /**
   * POST /api/assessments/:id/non-conformities
   * Create a new non-conformity for an assessment
   */
  create = withValidation(
    {
      params: assessmentIdParam,
      body: createNCRSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const ncr = await nonConformityService.create(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.status(201).json({
        success: true,
        data: ncr,
      });
    }
  );

  /**
   * PUT /api/non-conformities/:id
   * Update a non-conformity
   */
  update = withValidation(
    {
      params: ncrIdParam,
      body: updateNCRSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const ncr = await nonConformityService.update(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.json({
        success: true,
        data: ncr,
      });
    }
  );

  /**
   * DELETE /api/non-conformities/:id
   * Delete a non-conformity
   */
  delete = withValidation(
    {
      params: ncrIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const result = await nonConformityService.delete(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Non-conformity deleted successfully',
        deletedId: result.deletedId,
      });
    }
  );

  /**
   * POST /api/non-conformities/:id/transition
   * Transition NCR status following workflow rules
   */
  transitionStatus = withValidation(
    {
      params: ncrIdParam,
      body: transitionStatusSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.body as { status: NCRStatus };

      const ncr = await nonConformityService.transitionStatus(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        status
      );

      res.json({
        success: true,
        data: ncr,
        message: `Status transitioned to ${status}`,
      });
    }
  );

  /**
   * POST /api/assessments/:id/non-conformities/generate
   * Auto-create NCRs from score=1 responses
   */
  generateFromFailingResponses = withValidation(
    {
      params: assessmentIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const result = await nonConformityService.createFromFailingResponses(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role
      );

      res.status(201).json({
        success: true,
        data: result.ncrs,
        created: result.created,
        message: result.message,
      });
    }
  );

  /**
   * GET /api/assessments/:id/non-conformities/summary
   * Get summary statistics for NCRs in an assessment
   */
  getSummary = withValidation(
    {
      params: assessmentIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const summary = await nonConformityService.getSummary(
        req.params.id,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: summary,
      });
    }
  );
}

export const nonConformityController = new NonConformityController();
