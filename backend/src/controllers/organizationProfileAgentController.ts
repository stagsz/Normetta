import { Request, Response } from 'express';
import { z } from 'zod';
import { organizationProfileAgentService } from '../services/organizationProfileAgentService';
import { withValidation } from '../proxy/validationProxy';

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(10000),
      })
    )
    .max(50)
    .default([]),
});

export class OrganizationProfileAgentController {
  /**
   * POST /api/organization-profile/agent/chat
   * Continue (or start) the post-onboarding AI readiness interview
   */
  chat = withValidation(
    { body: chatSchema },
    async (req: Request, res: Response): Promise<void> => {
      const result = await organizationProfileAgentService.chat(req.user!.organizationId, req.body.messages);

      res.json({
        success: true,
        data: result,
      });
    }
  );
}

export const organizationProfileAgentController = new OrganizationProfileAgentController();
