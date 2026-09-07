import { Router } from 'express';
import { evidenceController } from '../controllers/evidenceController';
import { withAuth, asyncHandler, uploadEvidence } from '../proxy';

// Router for routes nested under /responses/:id/evidence
export const responseEvidenceRouter = Router({ mergeParams: true });

// All routes require authentication
responseEvidenceRouter.use(withAuth((req, res, next) => next()));

// POST /api/responses/:id/evidence - Upload evidence for a response
// Uses multer middleware for multipart file handling (10MB limit, PDF/DOCX/XLSX/PNG/JPG)
responseEvidenceRouter.post(
  '/',
  uploadEvidence,
  asyncHandler(evidenceController.upload.bind(evidenceController))
);

// GET /api/responses/:id/evidence - List all evidence for a response
responseEvidenceRouter.get(
  '/',
  asyncHandler(evidenceController.listByResponse.bind(evidenceController))
);

// Router for standalone /evidence routes
export const evidenceRouter = Router();

// All routes require authentication
evidenceRouter.use(withAuth((req, res, next) => next()));

// GET /api/evidence/:id - Get evidence details by ID
evidenceRouter.get(
  '/:id',
  asyncHandler(evidenceController.getById.bind(evidenceController))
);

// GET /api/evidence/:id/download - Download evidence file
evidenceRouter.get(
  '/:id/download',
  asyncHandler(evidenceController.download.bind(evidenceController))
);

// DELETE /api/evidence/:id - Delete evidence
evidenceRouter.delete(
  '/:id',
  asyncHandler(evidenceController.delete.bind(evidenceController))
);

export default evidenceRouter;
