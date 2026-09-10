import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/database';
import { config } from '../config';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors';

const anthropic = new Anthropic({ apiKey: config.ai.anthropicApiKey });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WhyStep {
  question: string;
  answer: string;
}

export interface RootCauseChatResult {
  reply: string;
  isComplete: boolean;
  rootCause?: string;
  whyChain?: WhyStep[];
  contributingFactors?: string[];
}

const RECORD_ROOT_CAUSE_TOOL: Anthropic.Tool = {
  name: 'record_root_cause',
  description:
    'Record the finalized root cause once the 5 Whys analysis has reached a genuine, actionable root cause.',
  input_schema: {
    type: 'object',
    properties: {
      rootCause: {
        type: 'string',
        description: 'The final identified root cause, stated in one or two clear sentences.',
      },
      whyChain: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
          },
          required: ['question', 'answer'],
        },
        description: 'The ordered sequence of why-questions and the answers that led to the root cause.',
      },
      contributingFactors: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional secondary contributing factors that are not the root cause itself.',
      },
    },
    required: ['rootCause', 'whyChain'],
  },
};

function buildSystemPrompt(ncr: { title: string; description: string; severity: string }): string {
  return `You are a quality management assistant helping a user perform a 5 Whys root cause analysis for a non-conformance identified during an ISO 9001 audit.

Non-conformance under investigation:
Title: ${ncr.title}
Description: ${ncr.description}
Severity: ${ncr.severity}

Guide the user through the 5 Whys technique:
- Your first question must start with: "What could be the reason(s) for this non-conformance?"
- After each answer, ask exactly one follow-up "why" question that drills into the cause the user just gave, going one level deeper each time.
- Keep questions concise and specific to what the user just said. Do not ask generic or repeated questions.
- Continue for up to 5 levels of "why". Stop earlier if a genuine root cause is reached (a systemic or process-level cause, not just a restatement of the symptom); continue a level or two further if the answer given is still a symptom rather than a cause.
- Once you are confident you have reached a genuine, actionable root cause, call the record_root_cause tool with the full why-chain, the root cause, and any contributing factors. Only call the tool once, and do not ask another question in the same turn that you call it.
- Do not call the tool prematurely on a shallow or vague answer.`;
}

async function getNCRForOrg(ncrId: string, organizationId: string) {
  const ncr = await prisma.nonConformity.findUnique({
    where: { id: ncrId },
    include: {
      assessment: {
        select: { organizationId: true },
      },
    },
  });

  if (!ncr) {
    throw new NotFoundError('Non-Conformity', ncrId);
  }

  if (ncr.assessment.organizationId !== organizationId) {
    throw new AuthorizationError('You do not have access to this non-conformity');
  }

  return ncr;
}

export const rootCauseAgentService = {
  async chat(ncrId: string, organizationId: string, messages: ChatMessage[]): Promise<RootCauseChatResult> {
    if (!config.ai.anthropicApiKey) {
      throw new ValidationError('Root cause AI agent is not configured. Set ANTHROPIC_API_KEY.');
    }

    const ncr = await getNCRForOrg(ncrId, organizationId);

    const conversation: Anthropic.MessageParam[] =
      messages.length > 0
        ? messages.map((m) => ({ role: m.role, content: m.content }))
        : [{ role: 'user', content: 'Begin the 5 Whys analysis.' }];

    const response = await anthropic.messages.create({
      model: config.ai.model,
      max_tokens: 1024,
      thinking: { type: 'disabled' },
      system: buildSystemPrompt(ncr),
      tools: [RECORD_ROOT_CAUSE_TOOL],
      messages: conversation,
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === 'record_root_cause'
    );
    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text');

    if (toolUse) {
      const input = toolUse.input as { rootCause: string; whyChain: WhyStep[]; contributingFactors?: string[] };
      return {
        reply: textBlock?.text ?? '',
        isComplete: true,
        rootCause: input.rootCause,
        whyChain: input.whyChain,
        contributingFactors: input.contributingFactors ?? [],
      };
    }

    return {
      reply: textBlock?.text ?? '',
      isComplete: false,
    };
  },
};
