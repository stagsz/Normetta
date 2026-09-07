import { Request, Response } from 'express';
import { onboardingService } from '../services/onboardingService';
import { verifyTurnstileToken } from '../services/turnstileService';

type SetupBody = Parameters<typeof onboardingService.setupOrganization>[0] & {
  turnstileToken?: string;
};

/** Client IP for Turnstile: Cloudflare header first, then Express (trust proxy is on). */
function clientIp(req: Request): string | undefined {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf) return cf;
  return req.ip;
}

export class OnboardingController {
  async setup(req: Request, res: Response): Promise<void> {
    const { turnstileToken, ...data } = req.body as SetupBody;
    await verifyTurnstileToken(turnstileToken, clientIp(req));
    const result = await onboardingService.setupOrganization(data);
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
