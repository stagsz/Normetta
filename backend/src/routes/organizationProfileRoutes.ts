import { Router } from 'express';
import { organizationProfileAgentController } from '../controllers/organizationProfileAgentController';
import { withAuth, asyncHandler } from '../proxy';

const router = Router();

router.use(withAuth((req, res, next) => next()));

// POST /api/organization-profile/agent/chat - AI-guided post-onboarding readiness interview
router.post('/agent/chat', asyncHandler(organizationProfileAgentController.chat.bind(organizationProfileAgentController)));

export default router;
