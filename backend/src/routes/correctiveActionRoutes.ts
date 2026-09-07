import { Router } from 'express';
import { correctiveActionController } from '../controllers/correctiveActionController';
import { withAuth, asyncHandler } from '../proxy';

// Router for routes nested under /non-conformities/:id/actions
export const ncrActionRouter = Router({ mergeParams: true });

// All routes require authentication
ncrActionRouter.use(withAuth((req, res, next) => next()));

// GET /api/non-conformities/:id/actions - List all corrective actions for a non-conformity
ncrActionRouter.get(
  '/',
  asyncHandler(correctiveActionController.listByNonConformity.bind(correctiveActionController))
);

// POST /api/non-conformities/:id/actions - Create a new corrective action for a non-conformity
ncrActionRouter.post(
  '/',
  asyncHandler(correctiveActionController.create.bind(correctiveActionController))
);

// GET /api/non-conformities/:id/actions/summary - Get summary statistics
ncrActionRouter.get(
  '/summary',
  asyncHandler(correctiveActionController.getSummary.bind(correctiveActionController))
);

// Router for standalone /actions routes
export const actionRouter = Router();

// All routes require authentication
actionRouter.use(withAuth((req, res, next) => next()));

// GET /api/actions/:id - Get a single corrective action by ID
actionRouter.get(
  '/:id',
  asyncHandler(correctiveActionController.getById.bind(correctiveActionController))
);

// PUT /api/actions/:id - Update a corrective action
actionRouter.put(
  '/:id',
  asyncHandler(correctiveActionController.update.bind(correctiveActionController))
);

// DELETE /api/actions/:id - Delete a corrective action
actionRouter.delete(
  '/:id',
  asyncHandler(correctiveActionController.delete.bind(correctiveActionController))
);

// POST /api/actions/:id/verify - Verify a completed corrective action
actionRouter.post(
  '/:id/verify',
  asyncHandler(correctiveActionController.verify.bind(correctiveActionController))
);

// POST /api/actions/:id/status - Update the status of a corrective action
actionRouter.post(
  '/:id/status',
  asyncHandler(correctiveActionController.updateStatus.bind(correctiveActionController))
);

// POST /api/actions/:id/assign - Assign a corrective action to a user
actionRouter.post(
  '/:id/assign',
  asyncHandler(correctiveActionController.assign.bind(correctiveActionController))
);

export default actionRouter;
