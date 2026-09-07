import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { withAuth, asyncHandler } from '../proxy';

const router = Router();

// All routes require authentication
router.use(withAuth((req, res, next) => next()));

// GET /api/dashboard - Get overview data (compliance score, assessment counts, NCR counts)
router.get(
  '/',
  asyncHandler(dashboardController.getOverview.bind(dashboardController))
);

// GET /api/dashboard/sections - Get section breakdown with scores by ISO section
router.get(
  '/sections',
  asyncHandler(dashboardController.getSectionBreakdown.bind(dashboardController))
);

// GET /api/dashboard/trends - Get historical trend data for the last 6 months
router.get(
  '/trends',
  asyncHandler(dashboardController.getTrends.bind(dashboardController))
);

export default router;
