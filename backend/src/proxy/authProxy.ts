import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '../types/enums';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  iat: number;
  exp: number;
}

/**
 * Authentication Proxy Handler
 * Wraps request handlers with authentication verification
 */
export function withAuth<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  handler: T
): T {
  const authenticatedHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('No token provided');
      }

      const token = authHeader.substring(7);

      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true, role: true, organizationId: true },
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive');
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };

      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AuthenticationError('Invalid token'));
      } else if (error instanceof jwt.TokenExpiredError) {
        next(new AuthenticationError('Token expired'));
      } else {
        next(error);
      }
    }
  };

  return authenticatedHandler as T;
}

/**
 * Role-based Authorization Proxy Handler
 * Wraps request handlers with role verification
 */
export function withRoles<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  allowedRoles: UserRole[],
  handler: T
): T {
  const authorizedHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Role ${req.user.role} is not authorized for this action`
        );
      }

      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };

  return authorizedHandler as T;
}

/**
 * Combined Auth + Roles Proxy Handler
 */
export function withAuthAndRoles<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  allowedRoles: UserRole[],
  handler: T
): T {
  return withAuth(withRoles(allowedRoles, handler));
}

/**
 * Organization Access Proxy Handler
 * Ensures user can only access resources within their organization
 */
export function withOrgAccess<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  handler: T,
  getOrgIdFromRequest: (req: Request) => string | undefined
): T {
  const orgAccessHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceOrgId = getOrgIdFromRequest(req);

      if (resourceOrgId && resourceOrgId !== req.user.organizationId) {
        // System admins can access all organizations
        if (req.user.role !== 'SYSTEM_ADMIN') {
          throw new AuthorizationError('Access denied to this organization');
        }
      }

      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };

  return orgAccessHandler as T;
}

/**
 * Optional Auth Proxy Handler
 * Attaches user if token present, but doesn't require it
 */
export function withOptionalAuth<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  handler: T
): T {
  const optionalAuthHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
          const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            organizationId: decoded.organizationId,
          };
        } catch {
          // Token invalid, but that's okay for optional auth
        }
      }

      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };

  return optionalAuthHandler as T;
}
