import Anthropic from '@anthropic-ai/sdk';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { config } from '../config';
import { NotFoundError, ValidationError } from '../utils/errors';
import { mergeAIPriorityClauses } from './assessmentScopeService';

const anthropic = new Anthropic({ apiKey: config.ai.anthropicApiKey });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProfileInsights {
  priorityClauses: string[];
  painPoints: string[];
  summary: string;
}

export interface ProfileInterviewResult {
  reply: string;
  isComplete: boolean;
  insights?: ProfileInsights;
}

const RECORD_INSIGHTS_TOOL: Anthropic.Tool = {
  name: 'record_profile_insights',
  description:
    'Record the structured insights from this readiness interview once you have enough context, or immediately if the org gave no useful narrative detail to explore.',
  input_schema: {
    type: 'object',
    properties: {
      priorityClauses: {
        type: 'array',
        items: { type: 'string', enum: ['4', '5', '6', '7', '8', '9', '10'] },
        description: 'ISO 9001 clause numbers (4-10) that seem to need the most attention, based on the conversation.',
      },
      painPoints: {
        type: 'array',
        items: { type: 'string' },
        description: 'Short, specific pain points the org described (e.g. "no clear document control ownership").',
      },
      summary: {
        type: 'string',
        description: 'A 1-2 sentence synthesis of what this org most needs from their self-assessments.',
      },
    },
    required: ['priorityClauses', 'painPoints', 'summary'],
  },
};

function buildSystemPrompt(profile: {
  qmsStatus: string | null;
  certificationStatus: string | null;
  companySize: string | null;
  standardsKnowledgeLevel: string | null;
  hoursPerWeek: number | null;
  lastAuditSummary: string | null;
  improvementNotes: string | null;
}): string {
  return `You are a quality management readiness interviewer for Normetta, an ISO 9001 audit platform. The person you're talking to just finished setting up their organization's account.

Here's what they already told us during signup:
- QMS status: ${profile.qmsStatus ?? 'not specified'}
- Certification status: ${profile.certificationStatus ?? 'not specified'}
- Company size: ${profile.companySize ?? 'not specified'}
- Their stated ISO 9001 knowledge level: ${profile.standardsKnowledgeLevel ?? 'not specified'}
- Hours per week they can dedicate: ${profile.hoursPerWeek ?? 'not specified'}
- What they said about their last audit: ${profile.lastAuditSummary || 'nothing provided'}
- What they said they want to improve: ${profile.improvementNotes || 'nothing provided'}

Your job: ask up to 4 short, specific follow-up questions to turn any vague or missing detail above into something concrete enough to act on — particularly which ISO 9001 clauses (Context=4, Leadership=5, Planning=6, Support=7, Operation=8, Performance Evaluation=9, Improvement=10) are causing them the most trouble today, and what a good outcome from using this platform would look like for them.

Rules:
- Ask one question at a time.
- If they already gave rich detail in "last audit" or "improvement" answers above, don't re-ask about it — dig one level deeper instead (ask a genuine follow-up, not a repeat).
- If both of those fields were empty, start by asking what's prompting them to look for a QMS platform right now.
- Once you have enough to identify likely priority clauses, call record_profile_insights. Do not ask another question in the same turn you call it.
- If the user has nothing more to add or asks to skip, call record_profile_insights immediately using only what's already known — it's fine for priorityClauses or painPoints to be empty arrays in that case.`;
}

async function getProfileForOrg(organizationId: string) {
  const profile = await prisma.organizationProfile.findUnique({ where: { organizationId } });
  if (!profile) {
    throw new NotFoundError('Organization Profile', organizationId);
  }
  return profile;
}

export const organizationProfileAgentService = {
  async chat(organizationId: string, messages: ChatMessage[]): Promise<ProfileInterviewResult> {
    if (!config.ai.anthropicApiKey) {
      throw new ValidationError('Onboarding AI interview is not configured. Set ANTHROPIC_API_KEY.');
    }

    const profile = await getProfileForOrg(organizationId);

    const conversation: Anthropic.MessageParam[] =
      messages.length > 0
        ? messages.map((m) => ({ role: m.role, content: m.content }))
        : [{ role: 'user', content: "Let's get started." }];

    const response = await anthropic.messages.create({
      model: config.ai.model,
      max_tokens: 1024,
      thinking: { type: 'disabled' },
      system: buildSystemPrompt(profile),
      tools: [RECORD_INSIGHTS_TOOL],
      messages: conversation,
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === 'record_profile_insights'
    );
    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === 'text');

    if (toolUse) {
      const insights = toolUse.input as ProfileInsights;

      await prisma.organizationProfile.update({
        where: { organizationId },
        data: {
          aiProfile: insights as unknown as Prisma.InputJsonValue,
          interviewTranscript: [...messages, { role: 'assistant', content: textBlock?.text ?? '' }],
        },
      });

      if (insights.priorityClauses.length > 0) {
        const defaultTemplate = await prisma.assessmentTemplate.findFirst({
          where: { organizationId, isDefault: true },
        });

        if (defaultTemplate) {
          const currentClauses = defaultTemplate.includedClauses
            ? (JSON.parse(defaultTemplate.includedClauses as string) as string[])
            : null;
          const mergedClauses = mergeAIPriorityClauses(currentClauses, insights.priorityClauses);

          if (mergedClauses !== null && mergedClauses.length !== (currentClauses?.length ?? 0)) {
            await prisma.assessmentTemplate.update({
              where: { id: defaultTemplate.id },
              data: {
                includedClauses: JSON.stringify(mergedClauses),
                description: `${defaultTemplate.description ?? ''} Updated after your onboarding interview: ${insights.summary}`.trim(),
              },
            });
          }
        }
      }

      return {
        reply: textBlock?.text ?? '',
        isComplete: true,
        insights,
      };
    }

    return {
      reply: textBlock?.text ?? '',
      isComplete: false,
    };
  },
};
