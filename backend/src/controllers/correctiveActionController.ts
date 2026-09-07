import { Request, Response } from 'express';
import { z } from 'zod';
import { correctiveActionService } from '../services/correctiveActionService';
import { withValidation, commonSchemas } from '../proxy/validationProxy';
import { ActionStatus, Priority } from '../types/enums';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const ncrIdParam = z.object({
  id: z.string().uuid('Invalid non-conformity ID format'),
});

const actionIdParam = z.object({
  id: z.string().uuid('Invalid corrective action ID format'),
});

const actionListQuerySchema = commonSchemas.pagination.merge(
  z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedToId: z.string().uuid().optional(),
  })
);

const createActionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedToId: z.string().uuid('Invalid user ID format').nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
});

const updateActionSchema = z.object({
  description: z.string().min(1).max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedToId: z.string().uuid('Invalid user ID format').nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']),
});

const verifyActionSchema = z.object({
  effectivenessNotes: z.string().max(5000).optional(),
});

const assignActionSchema = z.object({
  assignedToId: z.string().uuid('Invalid user ID format'),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class CorrectiveActionController {
  /**
   * GET /api/non-conformities/:id/actions
   * List all corrective actions for a non-conformity with optional filters
   */
  listByNonConformity = withValidation(
    {
      params: ncrIdParam,
      query: actionListQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { status, priority, assignedToId, page, pageSize, sortBy, sortOrder } = req.query as unknown as {
        status?: ActionStatus;
        priority?: Priority;
        assignedToId?: string;
        page: number;
        pageSize: number;
        sortBy?: string;
        sortOrder: 'asc' | 'desc';
      };

      const result = await correctiveActionService.listByNonConformity(
        req.params.id,
        req.user!.organizationId,
        { status, priority, assignedToId },
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
   * GET /api/actions/:id
   * Get a single corrective action by ID
   */
  getById = withValidation(
    {
      params: actionIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const action = await correctiveActionService.getById(
        req.params.id,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: action,
      });
    }
  );

  /**
   * POST /api/non-conformities/:id/actions
   * Create a new corrective action for a non-conformity
   */
  create = withValidation(
    {
      params: ncrIdParam,
      body: createActionSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const action = await correctiveActionService.create(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.status(201).json({
        success: true,
        data: action,
      });
    }
  );

  /**
   * PUT /api/actions/:id
   * Update a corrective action
   */
  update = withValidation(
    {
      params: actionIdParam,
      body: updateActionSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const action = await correctiveActionService.update(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.json({
        success: true,
        data: action,
      });
    }
  );

  /**
   * DELETE /api/actions/:id
   * Delete a corrective action
   */
  delete = withValidation(
    {
      params: actionIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const result = await correctiveActionService.delete(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role
      );

      res.json({
        success: true,
        message: 'Corrective action deleted successfully',
        deletedId: result.deletedId,
      });
    }
  );

  /**
   * POST /api/actions/:id/status
   * Update the status of a corrective action following workflow rules
   */
  updateStatus = withValidation(
    {
      params: actionIdParam,
      body: updateStatusSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.body as { status: ActionStatus };

      const action = await correctiveActionService.updateStatus(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        status
      );

      res.json({
        success: true,
        data: action,
        message: `Status updated to ${status}`,
      });
    }
  );

  /**
   * POST /api/actions/:id/verify
   * Verify a completed corrective action
   */
  verify = withValidation(
    {
      params: actionIdParam,
      body: verifyActionSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { effectivenessNotes } = req.body as { effectivenessNotes?: string };

      const action = await correctiveActionService.verify(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        effectivenessNotes
      );

      res.json({
        success: true,
        data: action,
        message: 'Corrective action verified successfully',
      });
    }
  );

  /**
   * POST /api/actions/:id/assign
   * Assign a corrective action to a user
   */
  assign = withValidation(
    {
      params: actionIdParam,
      body: assignActionSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { assignedToId } = req.body as { assignedToId: string };

      const action = await correctiveActionService.assign(
        req.params.id,
        req.user!.organizationId,
        req.user!.userId,
        req.user!.role,
        assignedToId
      );

      res.json({
        success: true,
        data: action,
        message: 'Corrective action assigned successfully',
      });
    }
  );

  /**
   * GET /api/non-conformities/:id/actions/summary
   * Get summary statistics for corrective actions in a non-conformity
   */
  getSummary = withValidation(
    {
      params: ncrIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const summary = await correctiveActionService.getSummaryByNCR(
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

export const correctiveActionController = new CorrectiveActionController();
