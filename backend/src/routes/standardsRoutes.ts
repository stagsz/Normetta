import { Router } from 'express';
import multer from 'multer';
import { standardsController } from '../controllers/standardsController';
import { withAuth, withAuthAndRoles, asyncHandler } from '../proxy';

// Configure multer for CSV file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CSV files
  },
  fileFilter: (_req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const router = Router();

// All routes require authentication
router.use(withAuth((req, res, next) => next()));

// GET /api/standards/sections - Get all sections as tree structure
router.get(
  '/sections',
  asyncHandler(standardsController.getSections.bind(standardsController))
);

// GET /api/standards/sections/:id - Get section by ID
router.get(
  '/sections/:id',
  asyncHandler(standardsController.getSectionById.bind(standardsController))
);

// GET /api/standards/questions - Get questions with optional filters
router.get(
  '/questions',
  asyncHandler(standardsController.getQuestions.bind(standardsController))
);

// GET /api/standards/questions/:id - Get question by ID
router.get(
  '/questions/:id',
  asyncHandler(standardsController.getQuestionById.bind(standardsController))
);

// POST /api/standards/questions - Create new question (admin/quality manager only)
router.post(
  '/questions',
  withAuthAndRoles(
    ['SYSTEM_ADMIN', 'QUALITY_MANAGER'],
    asyncHandler(standardsController.createQuestion.bind(standardsController))
  )
);

// PUT /api/standards/questions/:id - Update question (admin/quality manager only)
router.put(
  '/questions/:id',
  withAuthAndRoles(
    ['SYSTEM_ADMIN', 'QUALITY_MANAGER'],
    asyncHandler(standardsController.updateQuestion.bind(standardsController))
  )
);

// POST /api/standards/import - Import questions from CSV (admin/quality manager only)
router.post(
  '/import',
  withAuthAndRoles(
    ['SYSTEM_ADMIN', 'QUALITY_MANAGER'],
    (req, res, next) => next()
  ),
  upload.single('file'),
  asyncHandler(standardsController.importCSV.bind(standardsController))
);

export default router;
