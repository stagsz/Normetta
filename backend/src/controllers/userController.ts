import { Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService';
import { withValidation, commonSchemas } from '../proxy/validationProxy';
import { UserRole } from '../types/enums';

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

const userIdParam = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

const userListQuerySchema = commonSchemas.pagination.merge(
  z.object({
    role: z.enum(['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR', 'DEPARTMENT_HEAD', 'VIEWER']).optional(),
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
      },
      z.boolean().optional()
    ),
    search: z.string().max(100).optional(),
  })
);

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
});

const changeRoleSchema = z.object({
  role: z.enum(['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR', 'DEPARTMENT_HEAD', 'VIEWER']),
});

// -----------------------------------------------------------------------------
// Controller
// -----------------------------------------------------------------------------

export class UserController {
  /**
   * GET /api/users
   * List users with optional filters (role, isActive, search) and pagination
   * Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER
   */
  list = withValidation(
    {
      query: userListQuerySchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const { role, isActive, search, page, pageSize } = req.query as unknown as {
        role?: UserRole;
        isActive?: boolean;
        search?: string;
        page: number;
        pageSize: number;
      };

      // Always restrict by organization to prevent cross-org user leakage
      const organizationId = req.user!.organizationId;

      const result = await userService.list(
        { role, isActive, search, organizationId },
        { page, limit: pageSize }
      );

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    }
  );

  /**
   * GET /api/users/:id
   * Get a single user by ID
   * Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER, or the user themselves
   */
  getById = withValidation(
    {
      params: userIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      const user = await userService.getById(req.params.id);

      // Non-admin users can only view users in their own organization or themselves
      if (req.user!.role !== UserRole.SYSTEM_ADMIN &&
          req.user!.role !== UserRole.QUALITY_MANAGER &&
          user.organizationId !== req.user!.organizationId &&
          user.id !== req.user!.userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    }
  );

  /**
   * PUT /api/users/:id
   * Update user profile (firstName, lastName, email)
   * Accessible by: SYSTEM_ADMIN, QUALITY_MANAGER, or the user themselves
   */
  update = withValidation(
    {
      params: userIdParam,
      body: updateUserSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const targetUser = await userService.getById(req.params.id);

      // Users can update their own profile
      // SYSTEM_ADMIN can update any user
      // QUALITY_MANAGER can update users in their organization
      const canUpdate =
        req.user!.role === UserRole.SYSTEM_ADMIN ||
        req.user!.userId === req.params.id ||
        (req.user!.role === UserRole.QUALITY_MANAGER &&
         targetUser.organizationId === req.user!.organizationId);

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      const updatedUser = await userService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: updatedUser,
      });
    }
  );

  /**
   * POST /api/users/:id/toggle-active
   * Activate or deactivate a user
   * Accessible by: SYSTEM_ADMIN only
   */
  toggleActive = withValidation(
    {
      params: userIdParam,
    },
    async (req: Request, res: Response): Promise<void> => {
      // SYSTEM_ADMIN only check
      if (req.user!.role !== UserRole.SYSTEM_ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Only system administrators can activate/deactivate users',
        });
        return;
      }

      // Prevent deactivating yourself
      if (req.params.id === req.user!.userId) {
        res.status(400).json({
          success: false,
          error: 'You cannot deactivate your own account',
        });
        return;
      }

      const updatedUser = await userService.toggleActive(req.params.id);

      res.json({
        success: true,
        data: updatedUser,
        message: updatedUser.isActive ? 'User activated' : 'User deactivated',
      });
    }
  );

  /**
   * POST /api/users/:id/change-role
   * Change user role
   * Accessible by: SYSTEM_ADMIN only
   */
  changeRole = withValidation(
    {
      params: userIdParam,
      body: changeRoleSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      // SYSTEM_ADMIN only check
      if (req.user!.role !== UserRole.SYSTEM_ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Only system administrators can change user roles',
        });
        return;
      }

      // Prevent changing your own role
      if (req.params.id === req.user!.userId) {
        res.status(400).json({
          success: false,
          error: 'You cannot change your own role',
        });
        return;
      }

      const { role } = req.body as { role: UserRole };
      const updatedUser = await userService.changeRole(req.params.id, role);

      res.json({
        success: true,
        data: updatedUser,
        message: `User role changed to ${role}`,
      });
    }
  );
}

export const userController = new UserController();
