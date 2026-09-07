import { Router } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { withValidation, onboardingSchemas } from '../proxy/validationProxy';
import { withAuth } from '../proxy/authProxy';
import { asyncHandler } from '../proxy';

const router = Router();

router.post(
  '/setup',
  withValidation(
    { body: onboardingSchemas.setup },
    asyncHandler(onboardingController.setup.bind(onboardingController))
  )
);

// For already-authenticated users who want to set up an org
router.post(
  '/setup-org',
  withAuth(
    withValidation(
      { body: onboardingSchemas.setupOrg },
      asyncHandler(onboardingController.setupForExistingUser.bind(onboardingController))
    )
  )
);

router.get('/check-slug/:slug', asyncHandler(onboardingController.checkSlug.bind(onboardingController)));

export default router;
