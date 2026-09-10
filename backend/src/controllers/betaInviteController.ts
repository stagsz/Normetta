import { Request, Response } from 'express';
import { betaInviteService } from '../services/betaInviteService';

export class BetaInviteController {
  async create(req: Request, res: Response): Promise<void> {
    const { email, expiresInDays, maxUses, metadata } = req.body;
    const createdById = (req as any).user.userId;
    const organizationId = (req as any).user.organizationId;

    const invite = await betaInviteService.create({
      email,
      expiresInDays,
      maxUses,
      metadata,
      createdById,
      organizationId,
    });

    res.status(201).json({ success: true, data: invite });
  }

  async bulkCreate(req: Request, res: Response): Promise<void> {
    const { count, expiresInDays, maxUses } = req.body;
    const createdById = (req as any).user.userId;
    const organizationId = (req as any).user.organizationId;

    const invites = await betaInviteService.bulkCreate(
      createdById,
      organizationId,
      count,
      expiresInDays,
      maxUses
    );

    res.status(201).json({ success: true, data: invites });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const invite = await betaInviteService.getById(id);
    res.json({ success: true, data: invite });
  }

  async list(req: Request, res: Response): Promise<void> {
    const organizationId = (req as any).user.organizationId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status ? (req.query.status as string).split(',') : undefined;

    const result = await betaInviteService.list(organizationId, page, pageSize, search, status);
    res.json({ success: true, data: result });
  }

  async validateCode(req: Request, res: Response): Promise<void> {
    const { code } = req.body;
    const result = await betaInviteService.validateCode(code);
    res.json({ success: true, data: result });
  }

  async trackUsage(req: Request, res: Response): Promise<void> {
    const { code, referrer } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];

    const result = await betaInviteService.trackUsage({
      code,
      ipAddress,
      userAgent,
      referrer,
    });

    res.json({ success: true, data: result });
  }

  async getAnalytics(req: Request, res: Response): Promise<void> {
    const organizationId = (req as any).user.organizationId;
    const days = parseInt(req.query.days as string) || 30;

    const analytics = await betaInviteService.getAnalytics(organizationId, days);
    res.json({ success: true, data: analytics });
  }

  async revoke(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const requestingUserId = (req as any).user.userId;

    await betaInviteService.revoke(id, requestingUserId);
    res.json({ success: true, data: { success: true } });
  }

  async sendInvite(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { email, message } = req.body;
    const requestingUserId = (req as any).user.userId;

    const invite = await betaInviteService.getById(id);

    if (invite.email && invite.email !== email) {
      res.status(400).json({ success: false, message: 'Invite already assigned to a different email' });
      return;
    }

    // Update the invite with the email if not already set
    if (!invite.email) {
      await betaInviteService.updateEmail(id, email, requestingUserId);
    }

    const result = await betaInviteService.sendInviteEmailActual(invite.code, email, message);

    res.json({ success: true, data: { email: result.emailData, inviteCode: invite.code, sent: result.sent, messageId: result.messageId, error: result.error } });
  }

  async sendReminder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const invite = await betaInviteService.getById(id);

    if (!invite.email) {
      res.status(400).json({ success: false, message: 'Cannot send reminder: invite has no email assigned' });
      return;
    }

    const result = await betaInviteService.sendInviteEmailActual(invite.code, invite.email, 'This is a reminder that you have a pending invitation to join Normetta Beta. The invitation will expire soon.');

    res.json({ success: true, data: { email: result.emailData, inviteCode: invite.code, sent: result.sent, messageId: result.messageId, error: result.error } });
  }
}

export const betaInviteController = new BetaInviteController();