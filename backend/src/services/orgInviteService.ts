import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { NotFoundError, ConflictError, AuthorizationError, ValidationError } from '../utils/errors';
import { UserRole } from '../types/enums';

export class OrgInviteService {
  async getOrgBySlug(slug: string) {
    const org = await prisma.organization.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } });
    if (!org) throw new NotFoundError('Organization');
    return org;
  }

  async joinOrg(slug: string, data: { firstName: string; lastName: string; email: string; password: string }) {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundError('Organization');

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    const domain = data.email.split('@')[1]?.toLowerCase();
    const orgAllowedDomains = ((org.allowedDomains ?? []) as string[]).map((entry) => String(entry).toLowerCase());
    if (!domain) throw new ValidationError('Invalid invite email domain');
    if (orgAllowedDomains.length > 0 && !orgAllowedDomains.includes(domain)) {
      throw new AuthorizationError('This invite is not available for this email domain');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          emailDomain: domain,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.INTERNAL_AUDITOR,
          organizationId: org.id,
          isActive: false,
        },
      });

      const invite = await tx.userOrgInvite.create({
        data: { userId: user.id, organizationId: org.id, status: 'PENDING' },
      });

      return { inviteId: invite.id };
    });
  }

  async listPendingInvites(organizationId: string) {
    const [invites, orgRoles] = await Promise.all([
      prisma.userOrgInvite.findMany({
        where: { organizationId, status: 'PENDING' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orgRole.findMany({ where: { organizationId } }),
    ]);
    return { invites, orgRoles };
  }

  async pendingCount(organizationId: string): Promise<number> {
    return prisma.userOrgInvite.count({ where: { organizationId, status: 'PENDING' } });
  }

  async resolveInvite(inviteId: string, action: 'approve' | 'reject', orgRoleId: string | undefined, requestingUserId: string) {
    const invite = await prisma.userOrgInvite.findUnique({ where: { id: inviteId }, include: { user: true } });
    if (!invite) throw new NotFoundError('Invite');

    const requestingUser = await prisma.user.findUnique({ where: { id: requestingUserId } });
    if (!requestingUser || requestingUser.organizationId !== invite.organizationId) throw new AuthorizationError();

    if (action === 'approve') {
      if (!orgRoleId) throw new NotFoundError('OrgRole');
      await prisma.$transaction([
        prisma.userOrgInvite.update({ where: { id: inviteId }, data: { status: 'APPROVED' } }),
        prisma.user.update({ where: { id: invite.userId }, data: { isActive: true, orgRoleId } }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.userOrgInvite.update({ where: { id: inviteId }, data: { status: 'REJECTED' } }),
        prisma.user.update({ where: { id: invite.userId }, data: { isActive: false } }),
      ]);
    }

    return { success: true };
  }
}

export const orgInviteService = new OrgInviteService();
