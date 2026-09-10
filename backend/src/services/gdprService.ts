import { prisma } from '../config/database';
import { UserRole } from '../types/enums';

export type EraseResult = {
  deleted: Record<string, number>;
  erred: string[];
};

async function safeDeleteMany(model: { deleteMany: (args: { where: object }) => Promise<{ count: number }> }, where: object, label: string, counts: Record<string, number>, erred: string[]): Promise<void> {
  try {
    const result = await model.deleteMany({ where } as { where: object });
    counts[label] = result.count;
  } catch {
    erred.push(label);
    counts[label] = 0;
  }
}

export async function executeUserErasure(userId: string, _actorId?: string): Promise<EraseResult> {
  const counts: Record<string, number> = {
    userOrgInvites: 0,
    assessmentTeamMembers: 0,
    directResponses: 0,
    questionResponses: 0,
    evidence: 0,
    nonConformities: 0,
    correctiveActions: 0,
    assessments: 0,
    betaInvitesCreated: 0,
    betaInviteUsages: 0,
  };
  const erred: string[] = [];

  const [memberships] = await Promise.all([
    prisma.assessmentTeamMember.deleteMany({ where: { userId } }),
    prisma.userOrgInvite.deleteMany({ where: { userId } }),
  ]);
  counts.assessmentTeamMembers = memberships.count;
  counts.userOrgInvites = 0;

  const directResponses = await prisma.questionResponse.findMany({
    where: { userId },
    select: { id: true, assessmentId: true },
  });
  const directResponseIds = directResponses.map((r) => r.id);
  counts.directResponses = directResponses.length;
  counts.questionResponses = directResponses.length;

  if (directResponseIds.length) {
    const evidenceDelete = await prisma.evidence.deleteMany({
      where: { responseId: { in: directResponseIds } },
    });
    counts.evidence = evidenceDelete.count;
  }

  const parent = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  const organizationId = parent?.organizationId;

  if (organizationId) {
    const nonConformities = await prisma.nonConformity.findMany({
      where: { assessment: { organizationId } },
      select: { id: true },
    });
    const nonConformityIds = nonConformities.map((n) => n.id);

    const correctiveActions = await prisma.correctiveAction.deleteMany({
      where: {
        OR: [
          { assignedToId: userId },
          { verifiedById: userId },
          { nonConformityId: { in: nonConformityIds } },
        ],
      },
    });
    counts.correctiveActions = correctiveActions.count;

    const nonConformityDelete = await prisma.nonConformity.deleteMany({
      where: { assessment: { organizationId } },
    });
    counts.nonConformities = nonConformityDelete.count;
  }

  const createdInvites = await prisma.betaInvite.deleteMany({
    where: { createdById: userId },
  });
  counts.betaInvitesCreated = createdInvites.count;

  const inviteUsages = await prisma.betaInviteUsage.deleteMany({
    where: { userId },
  });
  counts.betaInviteUsages = inviteUsages.count;

  const assessments = await prisma.assessment.findMany({
    where: {
      organizationId: organizationId ?? '',
      OR: [{ leadAuditorId: userId }, { teamMembers: { some: { userId } } }],
    },
    select: { id: true },
  });
  const assessmentIds = assessments.map((a) => a.id);

  if (assessmentIds.length) {
    await safeDeleteMany(prisma.questionResponse, { assessmentId: { in: assessmentIds } }, 'bulkResponses', counts, erred);
    await safeDeleteMany(prisma.assessmentTeamMember, { assessmentId: { in: assessmentIds } }, 'bulkTeamMembers', counts, erred);
    await safeDeleteMany(prisma.nonConformity, { assessmentId: { in: assessmentIds } }, 'bulkNonConformities', counts, erred);
    const assessmentDelete = await prisma.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
    counts.assessments = assessmentDelete.count;
  }

  await prisma.user.delete({ where: { id: userId } });
  counts.users = 1;

  return { deleted: counts, erred };
}

export function assertCanErase(requestingRole: UserRole, targetUserId: string, requestingUserId: string, _requestingOrgId: string): void {
  if (requestingUserId === targetUserId) {
    throw new Error('Self-erasure is not allowed');
  }
  if (requestingRole === UserRole.QUALITY_MANAGER) {
    return;
  }
  throw new Error('Access denied');
}
