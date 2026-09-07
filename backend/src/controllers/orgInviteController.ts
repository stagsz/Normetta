import { Request, Response } from 'express';
import { orgInviteService } from '../services/orgInviteService';

export class OrgInviteController {
  async getOrg(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const org = await orgInviteService.getOrgBySlug(slug);
    res.json({ success: true, data: org });
  }

  async join(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const result = await orgInviteService.joinOrg(slug, req.body);
    res.status(201).json({ success: true, data: result });
  }

  async listInvites(req: Request, res: Response): Promise<void> {
    const organizationId = (req as any).user.organizationId;
    const data = await orgInviteService.listPendingInvites(organizationId);
    res.json({ success: true, data });
  }

  async pendingCount(req: Request, res: Response): Promise<void> {
    const organizationId = (req as any).user.organizationId;
    const count = await orgInviteService.pendingCount(organizationId);
    res.json({ success: true, data: { count } });
  }

  async resolveInvite(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { action, orgRoleId } = req.body;
    const requestingUserId = (req as any).user.userId;
    const result = await orgInviteService.resolveInvite(id, action, orgRoleId, requestingUserId);
    res.json({ success: true, data: result });
  }
}

export const orgInviteController = new OrgInviteController();
