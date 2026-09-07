import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { ActionStatus, Priority, UserRole, NCRStatus } from '../types/enums';

interface CreateActionData {
  description: string;
  priority?: Priority;
  assignedToId?: string | null;
  targetDate?: Date | null;
}

interface UpdateActionData {
  description?: string;
  priority?: Priority;
  assignedToId?: string | null;
  targetDate?: Date | null;
}

interface ActionFilters {
  status?: ActionStatus;
  priority?: Priority;
  assignedToId?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Valid status transitions for corrective action workflow
const VALID_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  [ActionStatus.PENDING]: [ActionStatus.IN_PROGRESS],
  [ActionStatus.IN_PROGRESS]: [ActionStatus.COMPLETED, ActionStatus.PENDING],
  [ActionStatus.COMPLETED]: [ActionStatus.VERIFIED, ActionStatus.IN_PROGRESS],
  [ActionStatus.VERIFIED]: [], // Terminal state
};

export class CorrectiveActionService {
  /**
   * List all corrective actions for a non-conformity
   */
  async listByNonConformity(
    ncrId: string,
    organizationId: string,
    filters: ActionFilters = {},
    options: ListOptions = {}
  ) {
    // Verify NCR exists and belongs to the organization
    const ncr = await prisma.nonConformity.findUnique({
      where: { id: ncrId },
      include: {
        assessment: {
          select: { organizationId: true },
        },
      },
    });

    if (!ncr) {
      throw new NotFoundError('Non-Conformity', ncrId);
    }

    if (ncr.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this non-conformity');
    }

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      nonConformityId: ncrId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    const [actions, total] = await Promise.all([
      prisma.correctiveAction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          verifiedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.correctiveAction.count({ where }),
    ]);

    return {
      data: actions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single corrective action by ID
   */
  async getById(actionId: string, organizationId: string) {
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            title: true,
            status: true,
            severity: true,
            assessment: {
              select: {
                id: true,
                title: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    return action;
  }

  /**
   * Create a new corrective action for a non-conformity
   */
  async create(
    ncrId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: CreateActionData
  ) {
    // Verify NCR exists and user has permission
    const ncr = await prisma.nonConformity.findUnique({
      where: { id: ncrId },
      include: {
        assessment: {
          select: {
            id: true,
            organizationId: true,
            status: true,
            leadAuditorId: true,
            teamMembers: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!ncr) {
      throw new NotFoundError('Non-Conformity', ncrId);
    }

    // Verify organization access
    if (ncr.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this non-conformity');
    }

    // Check if user can create actions
    const canCreate = this.canManageAction(ncr.assessment, userId, userRole);
    if (!canCreate) {
      throw new AuthorizationError('You do not have permission to create corrective actions');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(ncr.assessment.status)) {
      throw new ValidationError('Cannot create corrective actions for a completed or archived assessment');
    }

    // Validate NCR status - cannot add actions to closed NCRs
    if (ncr.status === NCRStatus.CLOSED) {
      throw new ValidationError('Cannot create corrective actions for a closed non-conformity');
    }

    // Validate priority if provided
    const priority = data.priority || Priority.MEDIUM;
    if (!Object.values(Priority).includes(priority)) {
      throw new ValidationError(`Invalid priority: ${priority}. Must be one of: ${Object.values(Priority).join(', ')}`);
    }

    // If assignedToId is provided, validate the user exists and belongs to the organization
    if (data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });

      if (!assignee) {
        throw new NotFoundError('User', data.assignedToId);
      }

      if (assignee.organizationId !== organizationId) {
        throw new ValidationError('Assigned user must belong to the same organization');
      }
    }

    // Create the corrective action
    const action = await prisma.correctiveAction.create({
      data: {
        nonConformityId: ncrId,
        description: data.description,
        priority,
        status: ActionStatus.PENDING,
        assignedToId: data.assignedToId || null,
        targetDate: data.targetDate || null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return action;
  }

  /**
   * Update a corrective action
   */
  async update(
    actionId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: UpdateActionData
  ) {
    // Get action with NCR and assessment context
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            status: true,
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    // Check if user can update actions
    const canUpdate = this.canManageAction(action.nonConformity.assessment, userId, userRole);
    if (!canUpdate) {
      throw new AuthorizationError('You do not have permission to update this corrective action');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(action.nonConformity.assessment.status)) {
      throw new ValidationError('Cannot update corrective actions for a completed or archived assessment');
    }

    // Cannot update a verified action
    if (action.status === ActionStatus.VERIFIED) {
      throw new ValidationError('Cannot update a verified corrective action');
    }

    // Validate priority if provided
    if (data.priority && !Object.values(Priority).includes(data.priority)) {
      throw new ValidationError(`Invalid priority: ${data.priority}. Must be one of: ${Object.values(Priority).join(', ')}`);
    }

    // If assignedToId is provided, validate the user exists and belongs to the organization
    if (data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });

      if (!assignee) {
        throw new NotFoundError('User', data.assignedToId);
      }

      if (assignee.organizationId !== organizationId) {
        throw new ValidationError('Assigned user must belong to the same organization');
      }
    }

    // Update the corrective action
    const updated = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate }),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete a corrective action
   */
  async delete(
    actionId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ) {
    // Get action with NCR and assessment context
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            status: true,
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    // Check if user can delete actions (only admins and quality managers)
    if (userRole !== UserRole.SYSTEM_ADMIN && userRole !== UserRole.QUALITY_MANAGER) {
      throw new AuthorizationError('Only system administrators and quality managers can delete corrective actions');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(action.nonConformity.assessment.status)) {
      throw new ValidationError('Cannot delete corrective actions from a completed or archived assessment');
    }

    // Cannot delete if NCR is closed
    if (action.nonConformity.status === NCRStatus.CLOSED) {
      throw new ValidationError('Cannot delete corrective actions from a closed non-conformity');
    }

    // Cannot delete a verified action
    if (action.status === ActionStatus.VERIFIED) {
      throw new ValidationError('Cannot delete a verified corrective action');
    }

    // Delete the corrective action
    await prisma.correctiveAction.delete({
      where: { id: actionId },
    });

    return { success: true, deletedId: actionId };
  }

  /**
   * Update the status of a corrective action following workflow rules
   */
  async updateStatus(
    actionId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    newStatus: ActionStatus
  ) {
    // Get action with NCR and assessment context
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            status: true,
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    // Check if user can update status
    const canUpdate = this.canManageAction(action.nonConformity.assessment, userId, userRole);
    if (!canUpdate) {
      throw new AuthorizationError('You do not have permission to update the status of this corrective action');
    }

    // Validate the new status is a valid enum value
    if (!Object.values(ActionStatus).includes(newStatus)) {
      throw new ValidationError(`Invalid status: ${newStatus}. Must be one of: ${Object.values(ActionStatus).join(', ')}`);
    }

    // Check if transition is valid
    const currentStatus = action.status as ActionStatus;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { status: newStatus };

    // Set completedDate when transitioning to COMPLETED
    if (newStatus === ActionStatus.COMPLETED) {
      updateData.completedDate = new Date();
    }

    // Update the status
    const updated = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Verify a completed corrective action
   * Only actions with COMPLETED status can be verified
   */
  async verify(
    actionId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    effectivenessNotes?: string
  ) {
    // Get action with NCR and assessment context
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            status: true,
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    // Check if user can verify actions (only lead auditor, quality managers, or admins)
    const canVerify = this.canVerifyAction(action.nonConformity.assessment, userId, userRole);
    if (!canVerify) {
      throw new AuthorizationError('You do not have permission to verify corrective actions. Only lead auditors, quality managers, or system administrators can verify actions.');
    }

    // Validate current status - must be COMPLETED
    if (action.status !== ActionStatus.COMPLETED) {
      throw new ValidationError(`Cannot verify an action with status ${action.status}. Action must be COMPLETED first.`);
    }

    // Update the action with verification details
    const updated = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        status: ActionStatus.VERIFIED,
        verifiedById: userId,
        verifiedDate: new Date(),
        effectivenessNotes: effectivenessNotes || null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Assign a corrective action to a user
   */
  async assign(
    actionId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    assignedToId: string
  ) {
    // Get action with NCR and assessment context
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
      include: {
        nonConformity: {
          select: {
            id: true,
            status: true,
            assessment: {
              select: {
                id: true,
                organizationId: true,
                status: true,
                leadAuditorId: true,
                teamMembers: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!action) {
      throw new NotFoundError('Corrective Action', actionId);
    }

    // Verify organization access
    if (action.nonConformity.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this corrective action');
    }

    // Check if user can assign actions
    const canAssign = this.canManageAction(action.nonConformity.assessment, userId, userRole);
    if (!canAssign) {
      throw new AuthorizationError('You do not have permission to assign this corrective action');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(action.nonConformity.assessment.status)) {
      throw new ValidationError('Cannot assign corrective actions for a completed or archived assessment');
    }

    // Cannot modify a verified action
    if (action.status === ActionStatus.VERIFIED) {
      throw new ValidationError('Cannot assign a verified corrective action');
    }

    // Validate the assignee exists and belongs to the organization
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!assignee) {
      throw new NotFoundError('User', assignedToId);
    }

    if (assignee.organizationId !== organizationId) {
      throw new ValidationError('Assigned user must belong to the same organization');
    }

    // Update the assignment
    const updated = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        assignedToId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get summary statistics for corrective actions in a non-conformity
   */
  async getSummaryByNCR(ncrId: string, organizationId: string) {
    // Verify NCR exists and belongs to the organization
    const ncr = await prisma.nonConformity.findUnique({
      where: { id: ncrId },
      include: {
        assessment: {
          select: { organizationId: true },
        },
      },
    });

    if (!ncr) {
      throw new NotFoundError('Non-Conformity', ncrId);
    }

    if (ncr.assessment.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this non-conformity');
    }

    // Get counts by status
    const statusCounts = await prisma.correctiveAction.groupBy({
      by: ['status'],
      where: { nonConformityId: ncrId },
      _count: { id: true },
    });

    // Get counts by priority
    const priorityCounts = await prisma.correctiveAction.groupBy({
      by: ['priority'],
      where: { nonConformityId: ncrId },
      _count: { id: true },
    });

    // Get total count
    const total = await prisma.correctiveAction.count({
      where: { nonConformityId: ncrId },
    });

    // Get overdue count (targetDate < now and status not COMPLETED or VERIFIED)
    const now = new Date();
    const overdueCount = await prisma.correctiveAction.count({
      where: {
        nonConformityId: ncrId,
        targetDate: { lt: now },
        status: { notIn: [ActionStatus.COMPLETED, ActionStatus.VERIFIED] },
      },
    });

    // Transform into a more usable format
    const byStatus: Record<string, number> = {};
    for (const item of statusCounts) {
      byStatus[item.status] = item._count.id;
    }

    const byPriority: Record<string, number> = {};
    for (const item of priorityCounts) {
      byPriority[item.priority] = item._count.id;
    }

    return {
      total,
      byStatus: {
        [ActionStatus.PENDING]: byStatus[ActionStatus.PENDING] || 0,
        [ActionStatus.IN_PROGRESS]: byStatus[ActionStatus.IN_PROGRESS] || 0,
        [ActionStatus.COMPLETED]: byStatus[ActionStatus.COMPLETED] || 0,
        [ActionStatus.VERIFIED]: byStatus[ActionStatus.VERIFIED] || 0,
      },
      byPriority: {
        [Priority.LOW]: byPriority[Priority.LOW] || 0,
        [Priority.MEDIUM]: byPriority[Priority.MEDIUM] || 0,
        [Priority.HIGH]: byPriority[Priority.HIGH] || 0,
        [Priority.CRITICAL]: byPriority[Priority.CRITICAL] || 0,
      },
      overdueCount,
      completedCount: (byStatus[ActionStatus.COMPLETED] || 0) + (byStatus[ActionStatus.VERIFIED] || 0),
      pendingCount: (byStatus[ActionStatus.PENDING] || 0) + (byStatus[ActionStatus.IN_PROGRESS] || 0),
    };
  }

  /**
   * Check if user can manage actions (create/update/assign) for an assessment
   */
  private canManageAction(
    assessment: {
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always manage actions
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can manage actions
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can manage actions
    const isTeamMember = assessment.teamMembers.some((tm) => tm.userId === userId);
    if (isTeamMember && userRole === UserRole.INTERNAL_AUDITOR) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can verify actions (only lead auditor, quality managers, or admins)
   */
  private canVerifyAction(
    assessment: {
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always verify actions
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can verify actions
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    return false;
  }
}

export const correctiveActionService = new CorrectiveActionService();
