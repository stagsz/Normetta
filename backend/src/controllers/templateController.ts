import { Request, Response } from 'express';
import { z } from 'zod';
import { templateService } from '../services/templateService';
import { withValidation } from '../proxy/validationProxy';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const templateIdParam = z.object({
  id: z.string().uuid('Invalid template ID format'),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class TemplateController {
  /**
   * GET /api/templates
   * List all templates for the user's organization
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const organizationId = req.user!.organizationId;
    const result = await templateService.list(organizationId);

    res.json({
      success: true,
      data: result.templates,
      total: result.total,
    });
  };

  /**
   * GET /api/templates/:id
   * Get a single template by ID
   */
  getById = withValidation(
    {
      params: templateIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const organizationId = req.user!.organizationId;
      const template = await templateService.getById(req.params.id, organizationId);

      res.json({
        success: true,
        data: template,
      });
    }
  );
}

export const templateController = new TemplateController();
