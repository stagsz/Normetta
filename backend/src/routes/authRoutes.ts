import { Router } from 'express';
import { authController } from '../controllers/authController';
import { withAuth, withValidation, asyncHandler } from '../proxy';
import { userSchemas } from '../proxy/validationProxy';

const router = Router();

// Public routes
router.post(
  '/register',
  withValidation({ body: userSchemas.create }, asyncHandler(authController.register.bind(authController)))
);

router.post(
  '/login',
  withValidation({ body: userSchemas.login }, asyncHandler(authController.login.bind(authController)))
);

// Public password-reset flow
router.post(
  '/forgot-password',
  withValidation({ body: userSchemas.forgotPassword }, asyncHandler(authController.forgotPassword.bind(authController)))
);

router.post(
  '/reset-password',
  withValidation({ body: userSchemas.resetPassword }, asyncHandler(authController.resetPassword.bind(authController)))
);

router.post(
  '/refresh',
  asyncHandler(authController.refresh.bind(authController))
);

// Protected routes
router.get(
  '/me',
  withAuth(asyncHandler(authController.me.bind(authController)))
);

router.post(
  '/change-password',
  withAuth(
    withValidation(
      { body: userSchemas.changePassword },
      asyncHandler(authController.changePassword.bind(authController))
    )
  )
);

export default router;
