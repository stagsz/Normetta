import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Request Validation Proxy Handler
 * Validates request body, query, and params against Zod schemas
 */
export function withValidation<T extends (req: Request, res: Response, next: NextFunction) => Promise<void> | void>(
  schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
  },
  handler: T
): T {
  const validatedHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Record<string, string[]> = {};

      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          errors.body = result.error.errors.map(
            (e) => `${e.path.join('.')}: ${e.message}`
          );
        } else {
          req.body = result.data;
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          errors.query = result.error.errors.map(
            (e) => `${e.path.join('.')}: ${e.message}`
          );
        } else {
          req.query = result.data;
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          errors.params = result.error.errors.map(
            (e) => `${e.path.join('.')}: ${e.message}`
          );
        } else {
          req.params = result.data;
        }
      }

      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      await Promise.resolve(handler(req, res, next));
    } catch (error) {
      next(error);
    }
  };

  return validatedHandler as T;
}

// -----------------------------------------------------------------------------
// Common Validation Schemas
// -----------------------------------------------------------------------------

export const commonSchemas = {
  // UUID parameter validation
  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  // Pagination query validation
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(1000).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Search query validation
  search: z.object({
    q: z.string().min(1).max(100).optional(),
  }),

  // Date range validation
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  ),
};

// -----------------------------------------------------------------------------
// Assessment Validation Schemas
// -----------------------------------------------------------------------------

export const assessmentSchemas = {
  create: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION']).default('INTERNAL'),
    scope: z.string().max(2000).optional(),
    objectives: z.array(z.string()).optional(),
    scheduledDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    templateId: z.string().uuid().optional(),
    teamMemberIds: z.array(z.string().uuid()).optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
    auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION']).optional(),
    scope: z.string().max(2000).optional(),
    objectives: z.array(z.string()).optional(),
    scheduledDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
  }),

  listQuery: commonSchemas.pagination.merge(commonSchemas.search).merge(
    z.object({
      status: z.string().transform((val) => val.split(',')).pipe(
        z.array(z.enum(['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']))
      ).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      leadAuditorId: z.string().uuid().optional(),
    })
  ).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  ),

  clone: z.object({
    title: z.string().min(1, 'Title is required').max(255),
  }),
};

// -----------------------------------------------------------------------------
// Question Response Validation Schemas
// -----------------------------------------------------------------------------

const responseFieldsSchema = z.object({
  score: z.number().int().min(0).max(5).optional(),
  justification: z.string().max(5000).optional(),
  verifiedSubPoints: z.array(z.string()).optional(),
  actionProposal: z.string().max(5000).optional(),
  conclusion: z.string().max(5000).optional(),
  isDraft: z.boolean().optional(),
});

export const responseSchemas = {
  create: responseFieldsSchema.extend({
    questionId: z.string().uuid(),
    isDraft: z.boolean().default(true),
  }),
  update: responseFieldsSchema,
  bulkUpdate: z.array(responseFieldsSchema.extend({ questionId: z.string().uuid() })),
};

// -----------------------------------------------------------------------------
// User Validation Schemas
// -----------------------------------------------------------------------------

export const userSchemas = {
  create: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    organizationId: z.string().uuid().optional().default('00000000-0000-4000-8000-000000000001'),
    role: z.enum(['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR', 'DEPARTMENT_HEAD', 'VIEWER']).default('VIEWER'),
    department: z.string().max(100).optional(),
  }),

  update: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    role: z.enum(['SYSTEM_ADMIN', 'QUALITY_MANAGER', 'INTERNAL_AUDITOR', 'DEPARTMENT_HEAD', 'VIEWER']).optional(),
    department: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
  }),

  // Public password-reset flow
  forgotPassword: z.object({
    email: z.string().email('Invalid email'),
  }),
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8).max(100),
  }),
};

// -----------------------------------------------------------------------------
// Corrective Action Validation Schemas
// -----------------------------------------------------------------------------

const rootCauseAnalysisSchema = z.object({
  method: z.enum(['FIVE_WHYS', 'FISHBONE', 'PARETO', 'OTHER']),
  findings: z.string(),
  rootCause: z.string(),
  contributingFactors: z.array(z.string()).optional(),
});

export const actionSchemas = {
  create: z.object({
    nonConformityId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().max(5000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    assigneeId: z.string().uuid(),
    reviewerId: z.string().uuid().optional(),
    dueDate: z.coerce.date().optional(),
    rootCauseAnalysis: rootCauseAnalysisSchema.optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED']).optional(),
    assigneeId: z.string().uuid().optional(),
    reviewerId: z.string().uuid().optional(),
    dueDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
    verifiedDate: z.coerce.date().optional(),
    rootCauseAnalysis: rootCauseAnalysisSchema.optional(),
    effectiveness: z.object({
      isEffective: z.boolean(),
      verificationMethod: z.string(),
      verificationDate: z.coerce.date(),
      verifiedBy: z.string(),
      notes: z.string().optional(),
    }).optional(),
  }),
};

// -----------------------------------------------------------------------------
// Onboarding Validation Schemas
// -----------------------------------------------------------------------------

const readinessProfileSchema = z
  .object({
    companySize: z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
    qmsStatus: z.enum(['NONE', 'BUILDING', 'INFORMAL', 'DOCUMENTED']).optional(),
    certificationStatus: z
      .enum(['NOT_CERTIFIED', 'IN_PROGRESS', 'CERTIFIED_SURVEILLANCE', 'CERTIFIED_RECERTIFYING'])
      .optional(),
    lastAuditSummary: z.string().max(2000).optional(),
    improvementNotes: z.string().max(2000).optional(),
    standardsKnowledgeLevel: z.enum(['NONE', 'BASIC', 'TRAINED', 'CERTIFIED_AUDITOR']).optional(),
    hoursPerWeek: z.number().int().min(0).max(168).optional(),
  })
  .optional();

export const onboardingSchemas = {
  setup: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    company: z.object({
      name: z.string().min(1, 'Company name required'),
      slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50, 'Slug must be at most 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
      industry: z.string().optional(),
      country: z.string().optional(),
    }),
    profile: readinessProfileSchema,
    divisions: z.array(z.object({ name: z.string().min(1) })),
    departments: z.array(
      z.object({
        name: z.string().min(1),
        divisionIndex: z.number().int().min(0).optional(),
      })
    ),
    roles: z.array(
      z.object({
        name: z.string().min(1),
        permissionLevel: z.enum(['MANAGER', 'AUDITOR', 'DEPT_HEAD', 'VIEWER']),
      })
    ),
    // Cloudflare Turnstile response token. Required by the controller when
    // TURNSTILE_SECRET_KEY is configured; optional at the schema level so
    // environments without Turnstile keep working.
    turnstileToken: z.string().max(4096).optional(),
  }),
  setupOrg: z.object({
    company: z.object({
      name: z.string().min(1, 'Company name required'),
      slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50, 'Slug must be at most 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
      industry: z.string().optional(),
      country: z.string().optional(),
    }),
    profile: readinessProfileSchema,
    divisions: z.array(z.object({ name: z.string().min(1) })),
    departments: z.array(
      z.object({
        name: z.string().min(1),
        divisionIndex: z.number().int().min(0).optional(),
      })
    ),
    roles: z.array(
      z.object({
        name: z.string().min(1),
        permissionLevel: z.enum(['MANAGER', 'AUDITOR', 'DEPT_HEAD', 'VIEWER']),
      })
    ),
  }),
};

// -----------------------------------------------------------------------------
// Org Invite Validation Schemas
// -----------------------------------------------------------------------------

export const orgInviteSchemas = {
  join: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  approve: z.object({
    action: z.enum(['approve', 'reject']),
    orgRoleId: z.string().uuid().optional(),
  }),
  slugParam: z.object({
    slug: z.string().min(1),
  }),
  inviteIdParam: z.object({
    id: z.string().uuid('Invalid invite ID'),
  }),
};

// -----------------------------------------------------------------------------
// Beta Invite Validation Schemas
// -----------------------------------------------------------------------------

export const betaInviteSchemas = {
  create: z.object({
    email: z.string().email('Invalid email').optional(),
    expiresInDays: z.coerce.number().int().min(1).max(365).default(30),
    maxUses: z.coerce.number().int().min(1).max(100).default(1),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  send: z.object({
    email: z.string().email('Invalid email'),
    message: z.string().max(2000).optional(),
  }),
  bulkCreate: z.object({
    count: z.coerce.number().int().min(1).max(100),
    expiresInDays: z.coerce.number().int().min(1).max(365).default(30),
    maxUses: z.coerce.number().int().min(1).max(100).default(1),
  }),
  listQuery: commonSchemas.pagination.merge(commonSchemas.search).merge(
    z.object({
      status: z.string().transform((val) => val.split(',')).pipe(
        z.array(z.enum(['ACTIVE', 'EXPIRED', 'USED_UP', 'REVOKED']))
      ).optional(),
    })
  ),
  codeParam: z.object({
    code: z.string().min(1, 'Invite code is required'),
  }),
  inviteIdParam: z.object({
    id: z.string().uuid('Invalid invite ID'),
  }),
  validateCode: z.object({
    code: z.string().min(1, 'Invite code is required'),
  }),
  trackUsage: z.object({
    code: z.string().min(1, 'Invite code is required'),
    referrer: z.string().url().optional(),
  }),
};
