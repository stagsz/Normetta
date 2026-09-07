import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from '../utils/errors';
import { UserRole } from '../types/enums';
import { emailService } from './emailService';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface UserWithOrg {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    role?: UserRole;
  }): Promise<UserWithOrg> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const domain = data.email.split('@')[1]?.toLowerCase();

    // Reject obviously invalid or unapproved addresses early so we never
    // create test/personal accounts inside a tenant.
    if (!domain) {
      throw new ValidationError('Invalid email domain');
    }
    const rejectedDomains = new Set(['example.com', 'test.com']);
    if (rejectedDomains.has(domain)) {
      throw new ValidationError('Email domain is not allowed');
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
    });

    if (!organization) {
      throw new NotFoundError('Organization', data.organizationId);
    }

    const orgAllowedDomains = ((organization.allowedDomains ?? []) as string[]).map((entry) => String(entry).toLowerCase());
    if (orgAllowedDomains.length === 0) {
      throw new ValidationError('Organization does not allow email-based registration; use an org invite or admin-created account instead');
    }
    if (!orgAllowedDomains.includes(domain)) {
      throw new AuthorizationError('Email domain is not allowed for this organization');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, AuthService.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        emailDomain: domain,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'VIEWER',
        organizationId: data.organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Login user and return tokens
   */
  async login(email: string, password: string): Promise<{ user: UserWithOrg; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            allowedDomains: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const domain = user.emailDomain?.toLowerCase();
    const orgAllowedDomains = ((user.organization?.allowedDomains ?? []) as string[]).map((entry) => String(entry).toLowerCase());
    if (!domain || (orgAllowedDomains.length > 0 && !orgAllowedDomains.includes(domain))) {
      throw new AuthenticationError('Your email domain is not allowed for this organization');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        organizationId: user.organizationId,
        organization: user.organization,
      },
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, organizationId: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive');
      }

      return this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      });
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  /**
   * Request a password reset. Generates a single-use, time-limited token,
   * stores only its SHA-256 hash, and emails the raw token as a reset link.
   * Always resolves (never throws) so the response cannot leak whether an
   * account exists for the given email.
   * @returns devResetToken in development for local testing convenience.
   */
  async requestPasswordReset(email: string): Promise<{ devResetToken?: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + AuthService.RESET_TOKEN_TTL_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiresAt,
        },
      });

      const resetUrl = `${config.email.appUrl}/reset-password?token=${token}`;
      await this.sendPasswordResetEmail(user.email, user.firstName, resetUrl);

      // Dev convenience: surface the raw token so the link can be opened
      // without a working SMTP server. Never returned in production.
      if (config.isDevelopment) {
        return { devResetToken: token };
      }
    }

    return {};
  }

  /**
   * Complete a password reset. Verifies the (hashed) token and expiry, then
   * replaces the password hash and consumes the token so it cannot be reused.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashedToken },
    });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  /**
   * Build and send the password-reset email.
   */
  private async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetUrl: string
  ): Promise<void> {
    const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <div style="text-align: center; padding: 32px 0 16px;">
          <div style="display: inline-block; width: 56px; height: 56px; border-radius: 14px; background: #0d9488; line-height: 56px; font-size: 26px; color: #fff; font-weight: 700;">A</div>
        </div>
        <h1 style="font-size: 20px; text-align: center; color: #0f172a; margin: 0 0 8px;">Reset your AuditFlow password</h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">${greeting}</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          We received a request to reset the password for your AuditFlow account.
          This link is valid for <strong>1 hour</strong>. If you didn't request this,
          you can safely ignore this email — your password won't change.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; display: inline-block;">Reset my password</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
          Or paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #0d9488; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">AuditFlow &middot; ISO 9001 Quality Management</p>
      </div>
    `;

    const text = `${greeting}\n\nWe received a request to reset your AuditFlow password. This link is valid for 1 hour:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`;

    await emailService.sendEmail({
      to,
      subject: 'Reset your AuditFlow password',
      html,
      text,
    });
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });

    // Parse expiration time
    const expiresIn = this.parseExpirationTime(config.jwt.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(time: string): number {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}

export const authService = new AuthService();
