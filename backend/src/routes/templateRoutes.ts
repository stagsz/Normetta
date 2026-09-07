import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { withAuth, asyncHandler } from '../proxy';

const router = Router();

// All routes require authentication
router.use(withAuth((req, res, next) => next()));

// GET /api/templates - List templates for the user's organization
router.get('/', asyncHandler(templateController.list.bind(templateController)));

// GET /api/templates/:id - Get a template by ID
router.get('/:id', asyncHandler(templateController.getById.bind(templateController)));

export default router;
