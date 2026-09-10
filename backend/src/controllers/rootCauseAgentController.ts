import { Request, Response } from 'express';
import { z } from 'zod';
import { rootCauseAgentService } from '../services/rootCauseAgentService';
import { withValidation } from '../proxy/validationProxy';

const ncrIdParam = z.object({
  id: z.string().uuid('Invalid non-conformity ID format'),
});

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

export class RootCauseAgentController {
  /**
   * POST /api/non-conformities/:id/root-cause-agent/chat
   * Continue (or start) a 5 Whys root cause analysis chat for an NCR
   */
  chat = withValidation(
    {
      params: ncrIdParam,
      body: chatSchema,
    },
    async (req: Request, res: Response): Promise<void> => {
      const result = await rootCauseAgentService.chat(
        req.params.id,
        req.user!.organizationId,
        req.body.messages
      );

      res.json({
        success: true,
        data: result,
      });
    }
  );
}

export const rootCauseAgentController = new RootCauseAgentController();
