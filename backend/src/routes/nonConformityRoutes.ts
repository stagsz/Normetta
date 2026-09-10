import { Router } from 'express';
import { nonConformityController } from '../controllers/nonConformityController';
import { rootCauseAgentController } from '../controllers/rootCauseAgentController';
import { withAuth, asyncHandler } from '../proxy';

// Router for routes nested under /assessments/:id/non-conformities
export const assessmentNCRRouter = Router({ mergeParams: true });

// All routes require authentication
assessmentNCRRouter.use(withAuth((req, res, next) => next()));

// GET /api/assessments/:id/non-conformities - List all NCRs for an assessment
assessmentNCRRouter.get(
  '/',
  asyncHandler(nonConformityController.listByAssessment.bind(nonConformityController))
);

// POST /api/assessments/:id/non-conformities - Create a new NCR for an assessment
assessmentNCRRouter.post(
  '/',
  asyncHandler(nonConformityController.create.bind(nonConformityController))
);

// POST /api/assessments/:id/non-conformities/generate - Auto-create NCRs from failing responses
assessmentNCRRouter.post(
  '/generate',
  asyncHandler(nonConformityController.generateFromFailingResponses.bind(nonConformityController))
);

// GET /api/assessments/:id/non-conformities/summary - Get NCR summary statistics
assessmentNCRRouter.get(
  '/summary',
  asyncHandler(nonConformityController.getSummary.bind(nonConformityController))
);

// Router for standalone /non-conformities routes
export const nonConformityRouter = Router();

// All routes require authentication
nonConformityRouter.use(withAuth((req, res, next) => next()));

// GET /api/non-conformities - List all NCRs for the organization
nonConformityRouter.get(
  '/',
  asyncHandler(nonConformityController.listAll.bind(nonConformityController))
);

// GET /api/non-conformities/:id - Get NCR by ID
nonConformityRouter.get(
  '/:id',
  asyncHandler(nonConformityController.getById.bind(nonConformityController))
);

// PUT /api/non-conformities/:id - Update an NCR
nonConformityRouter.put(
  '/:id',
  asyncHandler(nonConformityController.update.bind(nonConformityController))
);

// DELETE /api/non-conformities/:id - Delete an NCR
nonConformityRouter.delete(
  '/:id',
  asyncHandler(nonConformityController.delete.bind(nonConformityController))
);

// POST /api/non-conformities/:id/transition - Transition NCR status
nonConformityRouter.post(
  '/:id/transition',
  asyncHandler(nonConformityController.transitionStatus.bind(nonConformityController))
);

// POST /api/non-conformities/:id/root-cause-agent/chat - 5 Whys AI-guided root cause chat
nonConformityRouter.post(
  '/:id/root-cause-agent/chat',
  asyncHandler(rootCauseAgentController.chat.bind(rootCauseAgentController))
);

export default nonConformityRouter;
