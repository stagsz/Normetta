import { Router } from 'express';
import { orgInviteController } from '../controllers/orgInviteController';
import { withValidation, orgInviteSchemas } from '../proxy/validationProxy';
import { withAuth, asyncHandler } from '../proxy';

const router = Router();

// Public routes
router.get('/invite/:slug', asyncHandler(orgInviteController.getOrg.bind(orgInviteController)));
router.post(
  '/invite/:slug/join',
  withValidation(
    { body: orgInviteSchemas.join },
    asyncHandler(orgInviteController.join.bind(orgInviteController))
  )
);

// Protected (admin only)
router.get('/invites', withAuth(asyncHandler(orgInviteController.listInvites.bind(orgInviteController))));
router.get('/invites/count', withAuth(asyncHandler(orgInviteController.pendingCount.bind(orgInviteController))));
router.post(
  '/invites/:id/resolve',
  withAuth(
    withValidation(
      { body: orgInviteSchemas.approve, params: orgInviteSchemas.inviteIdParam },
      asyncHandler(orgInviteController.resolveInvite.bind(orgInviteController))
    )
  )
);

export default router;
