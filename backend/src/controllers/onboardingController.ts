import { Request, Response } from 'express';
import { onboardingService } from '../services/onboardingService';

export class OnboardingController {
  async setup(req: Request, res: Response): Promise<void> {
    const result = await onboardingService.setupOrganization(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async setupForExistingUser(req: Request, res: Response): Promise<void> {
    const userId = (req as Request & { user?: { userId: string } }).user?.userId;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    const result = await onboardingService.setupOrgForExistingUser(userId, req.body);
    res.status(201).json({ success: true, data: result });
  }

  async checkSlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const available = await onboardingService.checkSlugAvailable(slug);
    res.json({ success: true, data: { available } });
  }
}

export const onboardingController = new OnboardingController();
