import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { NCRStatus, Severity, UserRole } from '../types/enums';

interface CreateNCRData {
  title: string;
  description: string;
  severity: Severity;
  responseId?: string | null;
  rootCause?: string | null;
  rootCauseMethod?: string | null;
}

interface UpdateNCRData {
  title?: string;
  description?: string;
  severity?: Severity;
  rootCause?: string | null;
  rootCauseMethod?: string | null;
}

interface NCRFilters {
  status?: NCRStatus;
  severity?: Severity;
  search?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Valid status transitions for NCR workflow
const VALID_TRANSITIONS: Record<NCRStatus, NCRStatus[]> = {
  [NCRStatus.OPEN]: [NCRStatus.IN_PROGRESS],
  [NCRStatus.IN_PROGRESS]: [NCRStatus.RESOLVED, NCRStatus.OPEN],
  [NCRStatus.RESOLVED]: [NCRStatus.CLOSED, NCRStatus.IN_PROGRESS],
  [NCRStatus.CLOSED]: [], // Terminal state
};

export class NonConformityService {
  /**
   * List all non-conformities for an organization (across all assessments)
   */
  async listAll(
    organizationId: string,
    filters: NCRFilters = {},
    options: ListOptions = {}
  ) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      assessment: {
        organizationId,
      },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [nonConformities, total] = await Promise.all([
      prisma.nonConformity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          response: {
            select: {
              id: true,
              question: {
                select: {
                  id: true,
                  questionNumber: true,
                  questionText: true,
                },
              },
              section: {
                select: {
                  id: true,
                  sectionNumber: true,
                  title: true,
                },
              },
            },
          },
          correctiveActions: {
            select: {
              id: true,
              status: true,
              priority: true,
              targetDate: true,
            },
          },
        },
      }),
      prisma.nonConformity.count({ where }),
    ]);

    return {
      data: nonConformities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List all non-conformities for an assessment
   */
  async listByAssessment(
    assessmentId: string,
    organizationId: string,
    filters: NCRFilters = {},
    options: ListOptions = {}
  ) {
    // Verify assessment exists and belongs to the organization
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      assessmentId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [nonConformities, total] = await Promise.all([
      prisma.nonConformity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          response: {
            select: {
              id: true,
              question: {
                select: {
                  id: true,
                  questionNumber: true,
                  questionText: true,
                },
              },
              section: {
                select: {
                  id: true,
                  sectionNumber: true,
                  title: true,
                },
              },
            },
          },
          correctiveActions: {
            select: {
              id: true,
              status: true,
              priority: true,
              targetDate: true,
            },
          },
        },
      }),
      prisma.nonConformity.count({ where }),
    ]);

    return {
      data: nonConformities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single non-conformity by ID
   */
  async getById(
    ncrId: string,
    organizationId: string
  ) {
    const ncr = await prisma.nonConformity.findUnique({
      where: { id: ncrId },
      include: {
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
        response: {
          select: {
            id: true,
            score: true,
            justification: true,
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
                standardReference: true,
              },
            },
            section: {
              select: {
                id: true,
                sectionNumber: true,
                title: true,
              },
            },
          },
        },
        correctiveActions: {
          orderBy: { createdAt: 'asc' },
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

    return ncr;
  }

  /**
   * Create a new non-conformity for an assessment
   */
  async create(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: CreateNCRData
  ) {
    // Verify assessment exists and user has permission
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        teamMembers: {
          select: { userId: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user can create NCRs
    const canCreate = this.canManageNCR(assessment, userId, userRole);
    if (!canCreate) {
      throw new AuthorizationError('You do not have permission to create non-conformities for this assessment');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(assessment.status)) {
      throw new ValidationError('Cannot create non-conformities for a completed or archived assessment');
    }

    // Validate severity
    if (!Object.values(Severity).includes(data.severity)) {
      throw new ValidationError(`Invalid severity: ${data.severity}. Must be one of: ${Object.values(Severity).join(', ')}`);
    }

    // If responseId is provided, validate it belongs to this assessment
    if (data.responseId) {
      const response = await prisma.questionResponse.findUnique({
        where: { id: data.responseId },
      });

      if (!response) {
        throw new NotFoundError('Question Response', data.responseId);
      }

      if (response.assessmentId !== assessmentId) {
        throw new ValidationError('The response does not belong to this assessment');
      }
    }

    // Create the non-conformity
    const ncr = await prisma.nonConformity.create({
      data: {
        assessmentId,
        responseId: data.responseId || null,
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: NCRStatus.OPEN,
        rootCause: data.rootCause || null,
        rootCauseMethod: data.rootCauseMethod || null,
      },
      include: {
        response: {
          select: {
            id: true,
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
              },
            },
          },
        },
      },
    });

    return ncr;
  }

  /**
   * Update a non-conformity
   */
  async update(
    ncrId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: UpdateNCRData
  ) {
    // Get NCR with assessment context
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

    // Check if user can update NCRs
    const canUpdate = this.canManageNCR(ncr.assessment, userId, userRole);
    if (!canUpdate) {
      throw new AuthorizationError('You do not have permission to update this non-conformity');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(ncr.assessment.status)) {
      throw new ValidationError('Cannot update non-conformities for a completed or archived assessment');
    }

    // Cannot update a closed NCR
    if (ncr.status === NCRStatus.CLOSED) {
      throw new ValidationError('Cannot update a closed non-conformity');
    }

    // Validate severity if provided
    if (data.severity && !Object.values(Severity).includes(data.severity)) {
      throw new ValidationError(`Invalid severity: ${data.severity}. Must be one of: ${Object.values(Severity).join(', ')}`);
    }

    // Update the non-conformity
    const updated = await prisma.nonConformity.update({
      where: { id: ncrId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.rootCause !== undefined && { rootCause: data.rootCause }),
        ...(data.rootCauseMethod !== undefined && { rootCauseMethod: data.rootCauseMethod }),
      },
      include: {
        response: {
          select: {
            id: true,
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
              },
            },
          },
        },
        correctiveActions: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete a non-conformity
   */
  async delete(
    ncrId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ) {
    // Get NCR with assessment context
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
        correctiveActions: {
          select: { id: true },
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

    // Check if user can delete NCRs (only admins and quality managers)
    if (userRole !== UserRole.SYSTEM_ADMIN && userRole !== UserRole.QUALITY_MANAGER) {
      throw new AuthorizationError('Only system administrators and quality managers can delete non-conformities');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(ncr.assessment.status)) {
      throw new ValidationError('Cannot delete non-conformities from a completed or archived assessment');
    }

    // Cannot delete an NCR with corrective actions
    if (ncr.correctiveActions.length > 0) {
      throw new ValidationError('Cannot delete a non-conformity that has corrective actions. Delete the corrective actions first.');
    }

    // Cannot delete a closed NCR
    if (ncr.status === NCRStatus.CLOSED) {
      throw new ValidationError('Cannot delete a closed non-conformity');
    }

    // Delete the non-conformity
    await prisma.nonConformity.delete({
      where: { id: ncrId },
    });

    return { success: true, deletedId: ncrId };
  }

  /**
   * Transition NCR status following the workflow rules
   */
  async transitionStatus(
    ncrId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    newStatus: NCRStatus
  ) {
    // Get NCR with assessment context
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
        correctiveActions: {
          select: {
            id: true,
            status: true,
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

    // Check if user can transition status
    const canTransition = this.canManageNCR(ncr.assessment, userId, userRole);
    if (!canTransition) {
      throw new AuthorizationError('You do not have permission to change the status of this non-conformity');
    }

    // Validate the new status is a valid enum value
    if (!Object.values(NCRStatus).includes(newStatus)) {
      throw new ValidationError(`Invalid status: ${newStatus}. Must be one of: ${Object.values(NCRStatus).join(', ')}`);
    }

    // Check if transition is valid
    const currentStatus = ncr.status as NCRStatus;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`
      );
    }

    // Additional validation for specific transitions
    if (newStatus === NCRStatus.RESOLVED) {
      // Must have at least one corrective action
      if (ncr.correctiveActions.length === 0) {
        throw new ValidationError('Cannot resolve an NCR without any corrective actions');
      }

      // All corrective actions must be completed or verified
      const incompleteActions = ncr.correctiveActions.filter(
        (ca: any) => ca.status !== 'COMPLETED' && ca.status !== 'VERIFIED'
      );
      if (incompleteActions.length > 0) {
        throw new ValidationError('Cannot resolve an NCR until all corrective actions are completed');
      }
    }

    if (newStatus === NCRStatus.CLOSED) {
      // Must have root cause documented
      if (!ncr.rootCause || ncr.rootCause.trim().length === 0) {
        throw new ValidationError('Cannot close an NCR without documenting the root cause');
      }

      // All corrective actions must be verified
      const unverifiedActions = ncr.correctiveActions.filter(
        (ca: any) => ca.status !== 'VERIFIED'
      );
      if (unverifiedActions.length > 0) {
        throw new ValidationError('Cannot close an NCR until all corrective actions are verified');
      }
    }

    // Update the status
    const updated = await prisma.nonConformity.update({
      where: { id: ncrId },
      data: { status: newStatus },
      include: {
        response: {
          select: {
            id: true,
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
              },
            },
          },
        },
        correctiveActions: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Auto-create NCRs from score 1-2 responses
   * Score 1 = Non-Compliant (major), Score 2 = Initial/Minor
   * This can be called when finalizing an assessment or manually triggered
   */
  async createFromFailingResponses(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ) {
    // Verify assessment exists and user has permission
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        teamMembers: {
          select: { userId: true },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user can create NCRs
    const canCreate = this.canManageNCR(assessment, userId, userRole);
    if (!canCreate) {
      throw new AuthorizationError('You do not have permission to create non-conformities for this assessment');
    }

    // Validate assessment status
    if (['COMPLETED', 'ARCHIVED'].includes(assessment.status)) {
      throw new ValidationError('Cannot create non-conformities for a completed or archived assessment');
    }

    // Find all score 1-2 responses that don't already have an NCR
    // Score 1 = Non-Compliant, Score 2 = Initial
    const failingResponses = await prisma.questionResponse.findMany({
      where: {
        assessmentId,
        score: { in: [1, 2] },
        isDraft: false,
        nonConformities: {
          none: {},
        },
      },
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            standardReference: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
    });

    if (failingResponses.length === 0) {
      return {
        created: 0,
        ncrs: [],
        message: 'No failing responses found without existing NCRs',
      };
    }

    // Create NCRs for each failing response
    const createdNCRs = await prisma.$transaction(
      failingResponses.map((response: any) => {
        const sectionInfo = response.section
          ? `${response.section.sectionNumber} ${response.section.title}`
          : 'Unknown Section';

        // Determine severity based on score
        // Score 1 (Non-Compliant) = MAJOR, Score 2 (Initial) = MINOR
        const severity = response.score === 1 ? Severity.MAJOR : Severity.MINOR;

        return prisma.nonConformity.create({
          data: {
            assessmentId,
            responseId: response.id,
            title: `Non-Compliance: ${response.question.questionNumber}`,
            description: `Non-compliance identified for question ${response.question.questionNumber} in ${sectionInfo}.\n\nQuestion: ${response.question.questionText}`,
            severity,
            status: NCRStatus.OPEN,
          },
          include: {
            response: {
              select: {
                id: true,
                question: {
                  select: {
                    id: true,
                    questionNumber: true,
                    questionText: true,
                  },
                },
              },
            },
          },
        });
      })
    );

    return {
      created: createdNCRs.length,
      ncrs: createdNCRs,
      message: `Created ${createdNCRs.length} non-conformity record(s) from failing responses`,
    };
  }

  /**
   * Get summary statistics for NCRs in an assessment
   */
  async getSummary(assessmentId: string, organizationId: string) {
    // Verify assessment exists and belongs to the organization
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Get counts by status
    const statusCounts = await prisma.nonConformity.groupBy({
      by: ['status'],
      where: { assessmentId },
      _count: { id: true },
    });

    // Get counts by severity
    const severityCounts = await prisma.nonConformity.groupBy({
      by: ['severity'],
      where: { assessmentId },
      _count: { id: true },
    });

    // Get total count
    const total = await prisma.nonConformity.count({
      where: { assessmentId },
    });

    // Transform into a more usable format
    const byStatus: Record<string, number> = {};
    for (const item of statusCounts) {
      byStatus[item.status] = item._count.id;
    }

    const bySeverity: Record<string, number> = {};
    for (const item of severityCounts) {
      bySeverity[item.severity] = item._count.id;
    }

    return {
      total,
      byStatus: {
        [NCRStatus.OPEN]: byStatus[NCRStatus.OPEN] || 0,
        [NCRStatus.IN_PROGRESS]: byStatus[NCRStatus.IN_PROGRESS] || 0,
        [NCRStatus.RESOLVED]: byStatus[NCRStatus.RESOLVED] || 0,
        [NCRStatus.CLOSED]: byStatus[NCRStatus.CLOSED] || 0,
      },
      bySeverity: {
        [Severity.MINOR]: bySeverity[Severity.MINOR] || 0,
        [Severity.MAJOR]: bySeverity[Severity.MAJOR] || 0,
        [Severity.CRITICAL]: bySeverity[Severity.CRITICAL] || 0,
      },
      openCount: (byStatus[NCRStatus.OPEN] || 0) + (byStatus[NCRStatus.IN_PROGRESS] || 0),
      closedCount: byStatus[NCRStatus.CLOSED] || 0,
    };
  }

  /**
   * Check if user can manage NCRs (create/update/transition) for an assessment
   */
  private canManageNCR(
    assessment: {
      leadAuditorId: string;
      teamMembers: { userId: string }[];
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always manage NCRs
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can manage NCRs
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can manage NCRs
    const isTeamMember = assessment.teamMembers.some((tm) => tm.userId === userId);
    if (isTeamMember && userRole === UserRole.INTERNAL_AUDITOR) {
      return true;
    }

    return false;
  }
}

export const nonConformityService = new NonConformityService();
