import { Request, Response } from 'express';
import { authService } from '../services/authService';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const { user, tokens } = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user,
        ...tokens,
      },
    });
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  }

  /**
   * POST /api/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user!.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  /**
   * GET /api/auth/me
   */
  async me(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: req.user,
    });
  }

  /**
   * POST /api/auth/forgot-password
   * Initiates a password reset and emails a reset link. Always returns a
   * generic success message so the response cannot leak account existence.
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
      // devResetToken is only present in development (see authService)
      ...(result.devResetToken ? { devResetToken: result.devResetToken } : {}),
    });
  }

  /**
   * POST /api/auth/reset-password
   * Verifies the reset token and sets a new password.
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password has been reset. You can now sign in with your new password.',
    });
  }
}

export const authController = new AuthController();
