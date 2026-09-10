/**
 * Audit logging utility for GDPR data-subject requests.
 *
 * Writes an append-only row to the `gdpr_audit_logs` table. A transaction
 * client may be passed so the audit row commits atomically with the operation
 * it records (e.g. anonymization). Do not reintroduce file-based logging: the
 * backend runs as Vercel serverless functions with an ephemeral, read-only FS.
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export async function writeGdprAudit(
  record: {
    action: 'export' | 'anonymize';
    userId: string;
    email: string;
    status: string;
    reason?: string;
    actorId: string;
    counts?: Record<string, number>;
    metadata?: Record<string, unknown>;
  },
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  await tx.gdprAuditLog.create({
    data: {
      action: record.action,
      targetUserId: record.userId,
      targetEmail: record.email,
      actorId: record.actorId,
      status: record.status,
      reason: record.reason ?? null,
      counts: (record.counts ?? undefined) as Prisma.InputJsonValue | undefined,
      metadata: (record.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
