import { Request, Response } from 'express';
import { z } from 'zod';
import { dashboardService } from '../services/dashboardService';
import { withValidation } from '../proxy/validationProxy';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const sectionBreakdownQuerySchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID format').optional(),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class DashboardController {
  /**
   * GET /api/dashboard
   * Get overview data: compliance score, assessment counts, NCR counts, recent activity
   */
  getOverview = withValidation(
    {},
    async (req: Request, res: Response): Promise<void> => {
      const overview = await dashboardService.getOverview(req.user!.organizationId);

      res.json({
        success: true,
        data: overview,
      });
    }
  );

  /**
   * GET /api/dashboard/sections
   * Get section breakdown with scores by ISO section
   * Optionally filter by assessmentId
   */
  getSectionBreakdown = withValidation(
    {
      query: sectionBreakdownQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { assessmentId } = req.query as { assessmentId?: string };

      const breakdown = await dashboardService.getSectionBreakdown(
        req.user!.organizationId,
        assessmentId
      );

      res.json({
        success: true,
        data: breakdown,
      });
    }
  );

  /**
   * GET /api/dashboard/trends
   * Get historical trend data for the last 6 months
   */
  getTrends = withValidation(
    {},
    async (req: Request, res: Response): Promise<void> => {
      const trends = await dashboardService.getTrends(req.user!.organizationId);

      res.json({
        success: true,
        data: trends,
      });
    }
  );
}

export const dashboardController = new DashboardController();
