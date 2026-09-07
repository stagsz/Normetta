import { Router } from 'express';
import { betaInviteController } from '../controllers/betaInviteController';
import { withValidation, betaInviteSchemas } from '../proxy/validationProxy';
import { withAuth, asyncHandler } from '../proxy';

const router = Router();

// Public routes (for invite validation and tracking)
router.post(
  '/invite/validate',
  withValidation(
    { body: betaInviteSchemas.validateCode },
    asyncHandler(betaInviteController.validateCode.bind(betaInviteController))
  )
);

router.post(
  '/invite/track',
  withValidation(
    { body: betaInviteSchemas.trackUsage },
    asyncHandler(betaInviteController.trackUsage.bind(betaInviteController))
  )
);

// Protected routes (admin only)
router.post(
  '/beta-invites',
  withAuth(
    withValidation(
      { body: betaInviteSchemas.create },
      asyncHandler(betaInviteController.create.bind(betaInviteController))
    )
  )
);

router.post(
  '/beta-invites/bulk',
  withAuth(
    withValidation(
      { body: betaInviteSchemas.bulkCreate },
      asyncHandler(betaInviteController.bulkCreate.bind(betaInviteController))
    )
  )
);

router.get(
  '/beta-invites',
  withAuth(asyncHandler(betaInviteController.list.bind(betaInviteController)))
);

router.get(
  '/beta-invites/analytics',
  withAuth(asyncHandler(betaInviteController.getAnalytics.bind(betaInviteController)))
);

router.get(
  '/beta-invites/:id',
  withAuth(
    withValidation(
      { params: betaInviteSchemas.inviteIdParam },
      asyncHandler(betaInviteController.getById.bind(betaInviteController))
    )
  )
);

router.post(
  '/beta-invites/:id/send',
  withAuth(
    withValidation(
      { body: betaInviteSchemas.send, params: betaInviteSchemas.inviteIdParam },
      asyncHandler(betaInviteController.sendInvite.bind(betaInviteController))
    )
  )
);

router.post(
  '/beta-invites/:id/revoke',
  withAuth(asyncHandler(betaInviteController.revoke.bind(betaInviteController)))
);

router.post(
  '/beta-invites/:id/reminder',
  withAuth(asyncHandler(betaInviteController.sendReminder.bind(betaInviteController)))
);

export default router;