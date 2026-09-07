import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { AssessmentStatus, AuditType, UserRole, TeamMemberRole } from '../types/enums';

interface TeamMemberInput {
  userId: string;
  role: string;
}

interface CreateAssessmentData {
  title: string;
  description?: string;
  auditType?: AuditType;
  scope?: string;
  objectives?: string[];
  scheduledDate?: Date;
  dueDate?: Date;
  templateId?: string;
  teamMembers?: TeamMemberInput[];
}

interface UpdateAssessmentData {
  title?: string;
  description?: string;
  status?: AssessmentStatus;
  auditType?: AuditType;
  scope?: string;
  objectives?: string[];
  scheduledDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
}

interface AssessmentFilters {
  status?: AssessmentStatus[];
  startDate?: Date;
  endDate?: Date;
  leadAuditorId?: string;
  searchTerm?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AssessmentService {
  /**
   * Create a new assessment
   */
  async create(
    organizationId: string,
    leadAuditorId: string,
    data: CreateAssessmentData
  ) {
    // Validate template exists if provided
    if (data.templateId) {
      const template = await prisma.assessmentTemplate.findFirst({
        where: {
          id: data.templateId,
          organizationId,
        },
      });
      if (!template) {
        throw new NotFoundError('Assessment Template', data.templateId);
      }
    }

    // Validate team members exist in the organization and have valid roles
    if (data.teamMembers?.length) {
      const userIds = data.teamMembers.map((tm) => tm.userId);
      const validMembers = await prisma.user.count({
        where: {
          id: { in: userIds },
          organizationId,
          isActive: true,
        },
      });
      if (validMembers !== userIds.length) {
        throw new ValidationError('One or more team members are invalid');
      }

      // Validate roles
      const validRoles = Object.values(TeamMemberRole);
      for (const tm of data.teamMembers) {
        if (!validRoles.includes(tm.role as TeamMemberRole)) {
          throw new ValidationError(`Invalid team member role: ${tm.role}`);
        }
      }
    }

    const assessment = await prisma.assessment.create({
      data: {
        title: data.title,
        description: data.description,
        auditType: data.auditType || AuditType.INTERNAL,
        scope: data.scope,
        objectives: JSON.stringify(data.objectives || []),
        scheduledDate: data.scheduledDate,
        dueDate: data.dueDate,
        organizationId,
        leadAuditorId,
        templateId: data.templateId,
        teamMembers: data.teamMembers?.length
          ? {
              create: data.teamMembers.map((tm) => ({
                user: { connect: { id: tm.userId } },
                role: tm.role as TeamMemberRole,
              })),
            }
          : undefined,
      },
      include: {
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return assessment;
  }

  /**
   * Get assessment by ID
   */
  async getById(id: string, organizationId: string) {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        responses: {
          include: {
            question: true,
            section: true,
            evidence: true,
          },
        },
        nonConformities: {
          include: {
            correctiveActions: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    return assessment;
  }

  /**
   * List assessments with filtering and pagination
   */
  async list(
    organizationId: string,
    filters: AssessmentFilters,
    pagination: PaginationParams
  ) {
    const { page, pageSize, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId,
    };

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.leadAuditorId) {
      where.leadAuditorId = filters.leadAuditorId;
    }

    if (filters.startDate || filters.endDate) {
      where.scheduledDate = {};
      if (filters.startDate) {
        where.scheduledDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledDate.lte = filters.endDate;
      }
    }

    if (filters.searchTerm) {
      // Note: SQLite's LIKE is case-insensitive for ASCII by default
      // For PostgreSQL production, add: mode: 'insensitive'
      where.OR = [
        { title: { contains: filters.searchTerm } },
        { description: { contains: filters.searchTerm } },
      ];
    }

    const [assessments, totalItems] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          leadAuditor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              responses: true,
              nonConformities: true,
            },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ]);

    // Calculate progress for each assessment
    const totalQuestions = await prisma.auditQuestion.count();
    const assessmentsWithProgress = assessments.map((assessment: any) => ({
      ...assessment,
      progress: totalQuestions > 0
        ? Math.round((assessment._count.responses / totalQuestions) * 100)
        : 0,
    }));

    return {
      data: assessmentsWithProgress,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  /**
   * Update assessment
   */
  async update(
    id: string,
    organizationId: string,
    userId: string,
    userRole: UserRole,
    data: UpdateAssessmentData
  ) {
    const assessment = await prisma.assessment.findFirst({
      where: { id, organizationId },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    // Check permissions
    const canEdit =
      userRole === UserRole.SYSTEM_ADMIN ||
      userRole === UserRole.QUALITY_MANAGER ||
      assessment.leadAuditorId === userId;

    if (!canEdit) {
      throw new AuthorizationError('You do not have permission to edit this assessment');
    }

    // Validate status transitions
    if (data.status) {
      this.validateStatusTransition(assessment.status as AssessmentStatus, data.status);
    }

    // Prepare update data, converting objectives array to JSON string if present
    const updateData: Record<string, unknown> = {
      ...data,
      ...(data.objectives && { objectives: JSON.stringify(data.objectives) }),
      ...(data.status === AssessmentStatus.COMPLETED && { completedDate: new Date() }),
    };

    const updated = await prisma.assessment.update({
      where: { id },
      data: updateData,
      include: {
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete assessment (soft delete by archiving)
   */
  async delete(id: string, organizationId: string, userId: string, userRole: UserRole) {
    const assessment = await prisma.assessment.findFirst({
      where: { id, organizationId },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    // Only admins and quality managers can delete
    if (userRole !== UserRole.SYSTEM_ADMIN && userRole !== UserRole.QUALITY_MANAGER) {
      throw new AuthorizationError('You do not have permission to delete assessments');
    }

    // Archive instead of hard delete
    await prisma.assessment.update({
      where: { id },
      data: { status: AssessmentStatus.ARCHIVED },
    });

    return { success: true };
  }

  /**
   * Calculate and update assessment scores
   */
  async calculateScores(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        responses: {
          where: { isDraft: false },
          include: {
            question: true,
            section: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    // Group responses by section
    const sectionResponses = new Map<string, typeof assessment.responses>();

    for (const response of assessment.responses) {
      const sectionId = response.sectionId || 'uncategorized';
      if (!sectionResponses.has(sectionId)) {
        sectionResponses.set(sectionId, []);
      }
      sectionResponses.get(sectionId)!.push(response);
    }

    // Calculate section scores
    const sectionScores: any[] = [];
    let totalScore = 0;
    let totalMaxScore = 0;

    for (const [sectionId, responses] of sectionResponses) {
      const section = responses[0].section;
      // Exclude null scores and score 0 (N/A) from calculations
      const validResponses = responses.filter((r: any) => r.score !== null && r.score !== 0);

      if (validResponses.length > 0) {
        const actualScore = validResponses.reduce((sum: any, r: any) => sum + (r.score || 0), 0);
        const maxPossibleScore = validResponses.length * 5; // Updated from 3 to 5 for new scoring scale
        const scorePercentage = (actualScore / maxPossibleScore) * 100;

        sectionScores.push({
          sectionId,
          sectionNumber: section?.sectionNumber || 'N/A',
          sectionTitle: section?.title || 'Uncategorized',
          score: Math.round(scorePercentage * 10) / 10,
          actualScore,
          maxPossibleScore,
          questionsAnswered: validResponses.length,
          totalQuestions: responses.length,
        });

        totalScore += actualScore;
        totalMaxScore += maxPossibleScore;
      }
    }

    const overallScore = totalMaxScore > 0
      ? Math.round((totalScore / totalMaxScore) * 1000) / 10
      : 0;

    // Update assessment with calculated scores
    await prisma.assessment.update({
      where: { id },
      data: {
        overallScore,
        sectionScores: JSON.stringify(sectionScores),
      },
    });

    return {
      overallScore,
      sectionScores,
    };
  }

  /**
   * Clone an assessment for comparison
   */
  async clone(id: string, organizationId: string, userId: string, newTitle: string) {
    const original = await prisma.assessment.findFirst({
      where: { id, organizationId },
      include: {
        teamMembers: true,
      },
    });

    if (!original) {
      throw new NotFoundError('Assessment', id);
    }

    const cloned = await prisma.assessment.create({
      data: {
        title: newTitle,
        description: original.description,
        auditType: original.auditType,
        scope: original.scope,
        objectives: original.objectives ?? undefined,
        organizationId,
        leadAuditorId: userId,
        templateId: original.templateId,
        previousAssessmentId: id,
        teamMembers: {
          create: original.teamMembers.map((tm: any) => ({
            user: { connect: { id: tm.userId } },
            role: tm.role as TeamMemberRole,
          })),
        },
      },
      include: {
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return cloned;
  }

  /**
   * Export assessments list to CSV format
   */
  async exportToCsv(organizationId: string): Promise<string> {
    const assessments = await prisma.assessment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        leadAuditor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // CSV header
    const headers = ['id', 'title', 'status', 'score', 'scheduledDate', 'completedDate', 'leadAuditor'];

    // Escape CSV field (handle commas, quotes, newlines)
    const escapeField = (field: string | null | undefined): string => {
      if (field === null || field === undefined) {
        return '';
      }
      const str = String(field);
      // If the field contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Format date for CSV
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    // Build CSV rows
    const rows = assessments.map((assessment: any) => {
      const leadAuditorName = assessment.leadAuditor
        ? `${assessment.leadAuditor.firstName} ${assessment.leadAuditor.lastName}`.trim()
        : '';

      return [
        escapeField(assessment.id),
        escapeField(assessment.title),
        escapeField(assessment.status),
        assessment.overallScore !== null ? String(assessment.overallScore) : '',
        formatDate(assessment.scheduledDate),
        formatDate(assessment.completedDate),
        escapeField(leadAuditorName),
      ].join(',');
    });

    // Combine header and rows
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: AssessmentStatus, newStatus: AssessmentStatus): void {
    const validTransitions: Record<AssessmentStatus, AssessmentStatus[]> = {
      [AssessmentStatus.DRAFT]: [AssessmentStatus.IN_PROGRESS, AssessmentStatus.ARCHIVED],
      [AssessmentStatus.IN_PROGRESS]: [AssessmentStatus.UNDER_REVIEW, AssessmentStatus.DRAFT, AssessmentStatus.ARCHIVED],
      [AssessmentStatus.UNDER_REVIEW]: [AssessmentStatus.COMPLETED, AssessmentStatus.IN_PROGRESS, AssessmentStatus.ARCHIVED],
      [AssessmentStatus.COMPLETED]: [AssessmentStatus.ARCHIVED],
      [AssessmentStatus.ARCHIVED]: [AssessmentStatus.DRAFT],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

export const assessmentService = new AssessmentService();
