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
