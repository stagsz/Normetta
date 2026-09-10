import { prisma } from '../config/database';
import { UserRole } from '../types/enums';
import { NotFoundError, ValidationError } from '../utils/errors';

interface UserListFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  organizationId?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface UserListResult {
  users: UserWithOrg[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserWithOrg {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UserService {
  /**
   * List users with filtering and pagination
   */
  async list(
    filters: UserListFilters,
    pagination: PaginationParams
  ): Promise<UserListResult> {
    const { role, isActive, search, organizationId } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a user by ID
   */
  async getById(userId: string): Promise<UserWithOrg> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  /**
   * Update user profile (firstName, lastName, email)
   */
  async update(userId: string, data: UpdateUserData): Promise<UserWithOrg> {
    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError('User', userId);
    }

    // If email is being changed, check it's not already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailTaken) {
        throw new ValidationError('Email already in use');
      }

      const domain = data.email.split('@')[1]?.toLowerCase();
      const org = await prisma.organization.findUnique({
        where: { id: existingUser.organizationId },
        select: { allowedDomains: true },
      });
      if (!domain) {
        throw new ValidationError('Invalid email domain');
      }
      const orgAllowedDomains = ((org?.allowedDomains ?? []) as string[]).map((entry) => String(entry).toLowerCase());
      if (orgAllowedDomains.length > 0 && !orgAllowedDomains.includes(domain)) {
        throw new ValidationError('Email domain is not allowed for this organization');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Toggle user active status (activate/deactivate)
   */
  async toggleActive(userId: string): Promise<UserWithOrg> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Change user role
   */
  async changeRole(userId: string, newRole: string): Promise<UserWithOrg> {
    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole as UserRole)) {
      throw new ValidationError(`Invalid role: ${newRole}. Valid roles are: ${validRoles.join(', ')}`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole as UserRole,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }
}

export const userService = new UserService();
