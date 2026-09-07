import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { BetaInviteStatus } from '../types/enums';
import { emailService } from './emailService';

function generateInviteCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
    if (i === 3 || i === 7) code += '-';
  }
  return code;
}

interface CreateBetaInviteInput {
  email?: string;
  expiresInDays: number;
  maxUses: number;
  metadata?: Record<string, any>;
  createdById: string;
  organizationId?: string;
}

interface BetaInviteUsageData {
  code: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  userId?: string;
}

export class BetaInviteService {
  async create(data: CreateBetaInviteInput) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateInviteCode();
      const existing = await prisma.betaInvite.findUnique({ where: { code } });
      if (!existing) break;
      attempts++;
      if (attempts >= maxAttempts) {
        throw new ConflictError('Failed to generate unique invite code');
      }
    } while (true);

    const invite = await prisma.betaInvite.create({
      data: {
        code,
        email: data.email ?? null,
        status: BetaInviteStatus.ACTIVE,
        expiresAt,
        maxUses: data.maxUses,
        usedCount: 0,
        metadata: data.metadata ?? undefined,
        createdById: data.createdById,
        organizationId: data.organizationId ?? null,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    return invite;
  }

  async bulkCreate(
    createdById: string,
    organizationId: string | undefined,
    count: number,
    expiresInDays: number,
    maxUses: number
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invites: Array<{
      code: string;
      status: BetaInviteStatus;
      expiresAt: Date;
      maxUses: number;
      createdById: string;
      organizationId: string | null;
    }> = [];

    for (let i = 0; i < count; i++) {
      let code: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        code = generateInviteCode();
        const existing = await prisma.betaInvite.findUnique({ where: { code } });
        const existingInBatch = invites.find((inv) => inv.code === code);
        if (!existing && !existingInBatch) break;
        attempts++;
        if (attempts >= maxAttempts) {
          throw new ConflictError('Failed to generate unique invite code');
        }
      } while (true);

      invites.push({
        code,
        status: BetaInviteStatus.ACTIVE,
        expiresAt,
        maxUses,
        createdById,
        organizationId: organizationId ?? null,
      });
    }

    await prisma.betaInvite.createMany({ data: invites });

    const created = await prisma.betaInvite.findMany({
      where: { code: { in: invites.map((i) => i.code) } },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return created;
  }

  async getById(id: string) {
    const invite = await prisma.betaInvite.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
        usages: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!invite) throw new NotFoundError('Beta invite');
    return invite;
  }

  async getByCode(code: string) {
    const invite = await prisma.betaInvite.findUnique({
      where: { code },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!invite) throw new NotFoundError('Beta invite');
    return invite;
  }

  async list(
    organizationId: string | undefined,
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: string[]
  ) {
    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status && status.length > 0) {
      where.status = { in: status };
    } else {
      where.status = { not: BetaInviteStatus.REVOKED };
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [invites, total] = await Promise.all([
      prisma.betaInvite.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          organization: { select: { id: true, name: true, slug: true } },
          usages: { select: { id: true, converted: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.betaInvite.count({ where }),
    ]);

    return {
      invites,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async validateCode(code: string) {
    const invite = await prisma.betaInvite.findUnique({
      where: { code },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!invite) {
      return { valid: false, reason: 'Invalid invite code' };
    }

    if (invite.status !== BetaInviteStatus.ACTIVE) {
      return { valid: false, reason: `Invite is ${invite.status.toLowerCase()}` };
    }

    if (invite.expiresAt < new Date()) {
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: { status: BetaInviteStatus.EXPIRED },
      });
      return { valid: false, reason: 'Invite has expired' };
    }

    if (invite.usedCount >= invite.maxUses) {
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: { status: BetaInviteStatus.USED_UP },
      });
      return { valid: false, reason: 'Invite has been used up' };
    }

    return {
      valid: true,
      invite: {
        id: invite.id,
        code: invite.code,
        email: invite.email,
        maxUses: invite.maxUses,
        usedCount: invite.usedCount,
        expiresAt: invite.expiresAt,
        organization: invite.organization,
        createdBy: invite.createdBy,
      },
    };
  }

  async trackUsage(data: BetaInviteUsageData) {
    const validation = await this.validateCode(data.code);

    if (!validation.valid) {
      await prisma.betaInviteUsage.create({
        data: {
          betaInviteId: '',
          userId: data.userId ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          referrer: data.referrer ?? null,
          converted: false,
        },
      });
      throw new ValidationError('Invalid or expired invite code');
    }

    const invite = validation.invite!;

    const usage = await prisma.betaInviteUsage.create({
      data: {
        betaInviteId: invite.id,
        userId: data.userId ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        referrer: data.referrer ?? null,
        converted: false,
      },
    });

    await prisma.betaInvite.update({
      where: { id: invite.id },
      data: {
        usedCount: { increment: 1 },
        status: invite.usedCount + 1 >= invite.maxUses ? BetaInviteStatus.USED_UP : BetaInviteStatus.ACTIVE,
      },
    });

    return { usage, valid: true };
  }

  async markConverted(usageId: string, userId: string) {
    const usage = await prisma.betaInviteUsage.findUnique({ where: { id: usageId } });
    if (!usage) throw new NotFoundError('Usage record');

    await prisma.betaInviteUsage.update({
      where: { id: usageId },
      data: { converted: true, userId },
    });

    await prisma.betaInvite.update({
      where: { id: usage.betaInviteId },
      data: { metadata: { converted: true, convertedAt: new Date().toISOString() } },
    });

    return { success: true };
  }

  async revoke(id: string, requestingUserId: string) {
    const invite = await prisma.betaInvite.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!invite) throw new NotFoundError('Beta invite');

    if (invite.organizationId) {
      const user = await prisma.user.findUnique({ where: { id: requestingUserId } });
      if (!user || user.organizationId !== invite.organizationId) {
        throw new Error('Unauthorized');
      }
    } else if (invite.createdById !== requestingUserId) {
      throw new Error('Unauthorized');
    }

    return prisma.betaInvite.update({
      where: { id },
      data: { status: BetaInviteStatus.REVOKED },
    });
  }

  async updateEmail(id: string, email: string, requestingUserId: string) {
    const invite = await prisma.betaInvite.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!invite) throw new NotFoundError('Beta invite');

    if (invite.organizationId) {
      const user = await prisma.user.findUnique({ where: { id: requestingUserId } });
      if (!user || user.organizationId !== invite.organizationId) {
        throw new Error('Unauthorized');
      }
    } else if (invite.createdById !== requestingUserId) {
      throw new Error('Unauthorized');
    }

    return prisma.betaInvite.update({
      where: { id },
      data: { email },
    });
  }

  async sendInviteEmailActual(inviteCode: string, email: string, message?: string) {
    const emailData = await this.sendInviteEmail(inviteCode, email, message);
    const result = await emailService.sendEmail(emailData);
    return { emailData, sent: result.success, messageId: result.messageId, error: result.error };
  }

  async getAnalytics(organizationId: string | undefined, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = { createdAt: { gte: since } };
    if (organizationId) where.organizationId = organizationId;

    const invites = await prisma.betaInvite.findMany({
      where,
      include: { usages: true },
    });

    const totalInvites = invites.length;
    const totalUsages = invites.reduce((sum, inv) => sum + inv.usages.length, 0);
    const totalConverted = invites.reduce((sum, inv) => sum + inv.usages.filter((u) => u.converted).length, 0);
    const activeInvites = invites.filter((i) => i.status === BetaInviteStatus.ACTIVE).length;

    const byStatus = invites.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversionRate = totalUsages > 0 ? (totalConverted / totalUsages) * 100 : 0;

    return {
      totalInvites,
      totalUsages,
      totalConverted,
      activeInvites,
      conversionRate: Math.round(conversionRate * 100) / 100,
      byStatus,
    };
  }

  async sendInviteEmail(inviteCode: string, email: string, message?: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://normetta.com';
    const inviteUrl = `${baseUrl}/invite/${inviteCode}`;

    const subject = 'You\'re invited to join Normetta Beta';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Normetta</h1>
            <p style="color: #d1fae5; margin: 8px 0 0; font-size: 16px;">ISO 9001 Quality Management Platform</p>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 40px 30px;">
            <h2 style="color: #111827; margin: 0 0 16px; font-size: 24px;">You're invited to the Beta!</h2>
            <p style="color: #4b5563; margin: 0 0 24px; font-size: 16px;">${message || 'You have been invited to join the Normetta beta program. Click the button below to get started.'}</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Accept Invitation</a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 24px 0 0;">
              Or copy this link: <br><span style="word-break: break-all;">${inviteUrl}</span>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              This invitation expires on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
              If you didn't expect this, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
You're invited to the Normetta Beta!

${message || 'You have been invited to join the Normetta beta program.'}

Accept your invitation: ${inviteUrl}

This invitation expires soon. If you didn't expect this, please ignore this email.

Normetta - ISO 9001 Quality Management Platform
    `;

    return { subject, html, text, to: email };
  }

  async sendReminderEmail(inviteCode: string, email: string) {
    return this.sendInviteEmail(inviteCode, email, 'This is a reminder that you have a pending invitation to join Normetta Beta. The invitation will expire soon.');
  }
}

export const betaInviteService = new BetaInviteService();