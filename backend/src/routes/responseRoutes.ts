import { Router } from 'express';
import { responseController } from '../controllers/responseController';
import { withAuth, asyncHandler } from '../proxy';

const router = Router({ mergeParams: true }); // mergeParams allows access to parent route params (:id)

// All routes require authentication
router.use(withAuth((req, res, next) => next()));

// GET /api/assessments/:id/responses - Get all responses for an assessment
router.get(
  '/',
  asyncHandler(responseController.getByAssessment.bind(responseController))
);

// POST /api/assessments/:id/responses - Create or update a single response (upsert)
router.post(
  '/',
  asyncHandler(responseController.createOrUpdate.bind(responseController))
);

// PUT /api/assessments/:id/responses/bulk - Bulk update multiple responses
router.put(
  '/bulk',
  asyncHandler(responseController.bulkUpdate.bind(responseController))
);

// POST /api/assessments/:id/responses/draft - Save draft response (auto-save)
router.post(
  '/draft',
  asyncHandler(responseController.saveDraft.bind(responseController))
);

// GET /api/assessments/:id/responses/:questionId - Get a single response by question ID
router.get(
  '/:questionId',
  asyncHandler(responseController.getByQuestionId.bind(responseController))
);

export default router;
