interface ReadinessProfileData {
  qmsStatus?: 'NONE' | 'BUILDING' | 'INFORMAL' | 'DOCUMENTED';
  certificationStatus?: 'NOT_CERTIFIED' | 'IN_PROGRESS' | 'CERTIFIED_SURVEILLANCE' | 'CERTIFIED_RECERTIFYING';
}

export interface RecommendedScope {
  name: string;
  description: string;
  includedClauses: string[];
}

const CERTIFICATION_NEEDS_FULL_SCOPE: NonNullable<ReadinessProfileData['certificationStatus']>[] = [
  'IN_PROGRESS',
  'CERTIFIED_SURVEILLANCE',
  'CERTIFIED_RECERTIFYING',
];

/**
 * Derives a recommended starter assessment scope from the org's readiness
 * profile, based only on the structured (non-narrative) answers — the
 * free-text answers (lastAuditSummary, improvementNotes) aren't parsed here;
 * that's deferred to a later AI-interview phase.
 *
 * Returns null when the right recommendation is simply the full assessment
 * (no separate scoped template is created in that case).
 */
export function deriveAssessmentScope(profile?: ReadinessProfileData | null): RecommendedScope | null {
  if (!profile) return null;

  // Pursuing or maintaining certification implies full clause coverage
  // regardless of current QMS maturity.
  if (profile.certificationStatus && CERTIFICATION_NEEDS_FULL_SCOPE.includes(profile.certificationStatus)) {
    return null;
  }

  switch (profile.qmsStatus) {
    case 'NONE':
    case 'BUILDING':
      return {
        name: 'Recommended: Foundations Check',
        description:
          "Scoped to Context (4), Leadership (5), and Support (7) — the foundational clauses to establish before a full operational review. Recommended because you're building your QMS.",
        includedClauses: ['4', '5', '7'],
      };
    case 'INFORMAL':
      return {
        name: 'Recommended: Core Operations Review',
        description:
          'Scoped to Context (4), Leadership (5), Planning (6), Support (7), and Operation (8) — covers your day-to-day processes without Performance Evaluation (9) and Improvement (10), which are premature without documented practices. Recommended based on your informal QMS practices.',
        includedClauses: ['4', '5', '6', '7', '8'],
      };
    case 'DOCUMENTED':
    default:
      return null;
  }
}

const VALID_CLAUSES = new Set(['4', '5', '6', '7', '8', '9', '10']);

/**
 * Folds AI-interview-identified priority clauses into an existing template's
 * clause scope. A `null` currentIncludedClauses means "full assessment" —
 * already covers everything, so there's nothing to add. Otherwise returns
 * the sorted union, so the template stays an editable default rather than a
 * silently different recommendation.
 */
export function mergeAIPriorityClauses(
  currentIncludedClauses: string[] | null,
  priorityClauses: string[]
): string[] | null {
  if (currentIncludedClauses === null) return null;

  const valid = priorityClauses.filter((c) => VALID_CLAUSES.has(c));
  const merged = new Set([...currentIncludedClauses, ...valid]);
  return Array.from(merged).sort((a, b) => Number(a) - Number(b));
}
