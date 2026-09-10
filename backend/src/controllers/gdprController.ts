import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { withValidation } from '../proxy/validationProxy';
import { UserRole } from '../types/enums';
import { writeGdprAudit } from '../utils/gdprAudit';

const userIdParam = z.object({ id: z.string().uuid('Invalid user ID format') });
const actionBody = z.object({ action: z.enum(['export', 'erase']) });

export class GdprController {
  exportOrErase = withValidation(
    { params: userIdParam, body: actionBody },
    async (req: Request, res: Response): Promise<void> => {
      const targetUserId = req.params.id;
      const requestingUserId = req.user!.userId;
      const requestingRole = req.user!.role;
      const requestingOrgId = req.user!.organizationId;

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              allowedDomains: true,
            },
          },
        },
      });
      if (!targetUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const isSelf = requestingUserId === targetUserId;
      const isAdmin = requestingRole === UserRole.SYSTEM_ADMIN;
      const isSameOrg = targetUser.organizationId === requestingOrgId;
      if (!isSelf && !isAdmin && !isSameOrg) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const action = req.body.action as 'export' | 'erase';
      const actorId = requestingUserId;

      if (action === 'export') {
        const [assessments, directResponses, teamMemberships, receivedInvites, createdInvites, inviteUsages] =
          await Promise.all([
            prisma.assessment.findMany({
              where: { organizationId: targetUser.organizationId },
              include: {
                leadAuditor: { select: { id: true } },
                teamMembers: { where: { userId: targetUserId } },
                responses: {
                  where: { userId: targetUserId },
                  include: {
                    evidence: {
                      where: { uploadedById: targetUserId },
                    },
                  },
                },
                nonConformities: {
                  include: {
                    correctiveActions: {
                      where: {
                        OR: [
                          { assignedToId: targetUserId },
                          { verifiedById: targetUserId },
                        ],
                      },
                    },
                  },
                },
              },
            }),
            prisma.questionResponse.findMany({
              where: { userId: targetUserId },
              include: {
                assessment: { select: { id: true, title: true } },
                evidence: { where: { uploadedById: targetUserId } },
              },
            }),
            prisma.assessmentTeamMember.findMany({ where: { userId: targetUserId } }),
            prisma.userOrgInvite.findMany({ where: { userId: targetUserId } }),
            prisma.betaInvite.findMany({ where: { createdById: targetUserId } }),
            prisma.betaInviteUsage.findMany({ where: { userId: targetUserId } }),
          ]);

        const payload = {
          user: targetUser,
          counts: { assessments: assessments.length, responses: directResponses.length, teamMemberships: teamMemberships.length, receivedInvites: receivedInvites.length, createdInvites: createdInvites.length, inviteUsages: inviteUsages.length },
          assessments: assessments.map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            leadAuditorId: a.leadAuditorId,
            teamMembers: a.teamMembers.map((m) => ({ id: m.id, role: m.role })),
            nonConformities: a.nonConformities.map((n) => ({
              id: n.id,
              status: n.status,
              correctiveActions: n.correctiveActions
                .filter((c) => c.assignedToId === targetUserId || c.verifiedById === targetUserId)
                .map((c) => ({ id: c.id, status: c.status, assignedToId: c.assignedToId, verifiedById: c.verifiedById })),
            })),
          })),
          responses: directResponses.map((r) => ({ id: r.id, assessmentId: r.assessmentId, questionId: r.questionId, score: r.score, isDraft: r.isDraft, evidence: r.evidence.map((e) => ({ id: e.id, fileName: e.fileName, mimeType: e.mimeType, uploadedAt: e.uploadedAt })) })),
          teamMemberships,
          receivedInvites: receivedInvites.map((inv) => ({ id: inv.id, status: inv.status })),
          createdInvites: createdInvites.map((inv) => ({ id: inv.code, status: inv.status })),
          inviteUsages: inviteUsages.map((usage) => ({ id: usage.id })),
          metadata: { exportedAt: new Date().toISOString(), actorId, retentionReference: 'GDPR data-export request' },
        };

        await writeGdprAudit({
          action: 'export',
          userId: targetUserId,
          email: targetUser.email,
          status: 'exported',
          actorId,
          metadata: { exportedAt: payload.metadata.exportedAt, retentionReference: payload.metadata.retentionReference },
        });

        res.json({ success: true, data: payload });
        return;
      }

      if (action === 'erase') {
        if (isSelf) {
          res.status(400).json({ success: false, error: 'Self-erasure is not allowed via this endpoint' });
          return;
        }
        if (!isAdmin && !isSameOrg) {
          res.status(403).json({ success: false, error: 'Access denied' });
          return;
        }

        // Guard: don't strand an org without an active admin/quality manager.
        if (
          targetUser.isActive &&
          (targetUser.role === UserRole.SYSTEM_ADMIN || targetUser.role === UserRole.QUALITY_MANAGER)
        ) {
          const remaining = await prisma.user.count({
            where: {
              organizationId: targetUser.organizationId,
              role: targetUser.role,
              isActive: true,
              id: { not: targetUserId },
            },
          });
          if (remaining === 0) {
            res.status(409).json({
              success: false,
              error: `Cannot anonymize the organization's last active ${targetUser.role}`,
            });
            return;
          }
        }

        // Erasure is implemented as anonymization-in-place: PII is scrubbed and
        // the account is deactivated, but the row (and all its FK references) is
        // retained so ISO 9001 quality/audit records stay intact.
        const [questionResponses, evidence, teamMemberships] = await Promise.all([
          prisma.questionResponse.count({ where: { userId: targetUserId } }),
          prisma.evidence.count({ where: { uploadedById: targetUserId } }),
          prisma.assessmentTeamMember.count({ where: { userId: targetUserId } }),
        ]);

        const anonymizedEmail = `anonymized+${targetUserId}@deleted.invalid`;
        const anonymizedAt = new Date().toISOString();

        const { invitesCancelled } = await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: targetUserId },
            data: {
              email: anonymizedEmail,
              emailDomain: '',
              firstName: 'Anonymized',
              lastName: 'User',
              passwordHash: '',
              refreshToken: null,
              isActive: false,
            },
          });

          const cancelled = await tx.userOrgInvite.updateMany({
            where: { userId: targetUserId, status: 'PENDING' },
            data: { status: 'REJECTED' },
          });

          const counts = {
            responsesRetained: questionResponses,
            evidenceRetained: evidence,
            teamMembershipsRetained: teamMemberships,
            invitesCancelled: cancelled.count,
          };

          await writeGdprAudit(
            {
              action: 'anonymize',
              userId: targetUserId,
              email: targetUser.email,
              status: 'anonymized',
              actorId,
              counts,
              metadata: { anonymizedAt, retentionReference: 'GDPR erasure request' },
            },
            tx
          );

          return { invitesCancelled: cancelled.count };
        });

        res.json({
          success: true,
          data: {
            userId: targetUserId,
            status: 'anonymized',
            counts: {
              responsesRetained: questionResponses,
              evidenceRetained: evidence,
              teamMembershipsRetained: teamMemberships,
              invitesCancelled,
            },
            metadata: { anonymizedAt, actorId, retentionReference: 'GDPR erasure request' },
          },
        });
        return;
      }

      res.status(400).json({ success: false, error: 'Unsupported action' });
    }
  );
}
