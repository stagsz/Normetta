/**
 * Re-export Prisma enums for use throughout the application.
 *
 * With PostgreSQL, enums are defined natively in the database schema (schema.prisma)
 * and exported by Prisma Client. This file re-exports them for convenience and
 * maintains backward compatibility with existing imports.
 */

export {
  UserRole,
  AssessmentStatus,
  AuditType,
  TeamMemberRole,
  Severity,
  NCRStatus,
  ActionStatus,
  Priority,
  EvidenceType,
  BetaInviteStatus,
  CompanySize,
  QMSStatus,
  CertificationStatus,
  StandardsKnowledgeLevel,
} from '@prisma/client';

// Re-export types for TypeScript usage
export type {
  UserRole as UserRoleType,
  AssessmentStatus as AssessmentStatusType,
  AuditType as AuditTypeType,
  TeamMemberRole as TeamMemberRoleType,
  Severity as SeverityType,
  NCRStatus as NCRStatusType,
  ActionStatus as ActionStatusType,
  Priority as PriorityType,
  EvidenceType as EvidenceTypeType,
  BetaInviteStatus as BetaInviteStatusType,
  CompanySize as CompanySizeType,
  QMSStatus as QMSStatusType,
  CertificationStatus as CertificationStatusType,
  StandardsKnowledgeLevel as StandardsKnowledgeLevelType,
} from '@prisma/client';
