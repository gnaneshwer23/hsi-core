/**
 * Node-only: map live investigation candidates onto structuredEvidenceComparison
 * and attach a slim pack for the brief / workspace. Does not touch Neon
 * contradiction migrations or invent expert-calibrated rules.
 */
import {
  compareEvidenceUnits,
  STRUCTURED_EVIDENCE_COMPARISON_VERSION,
  type ComparableEvidenceUnit,
} from "../evidence/structuredEvidenceComparison";
import type {CandidateBiologicalContext} from "../evidence/contextualCandidateRelationships";
import {
  emptyLiveStructuredComparison,
  type LiveComparisonItem,
  type LiveComparisonOutcome,
  type LiveStructuredComparison,
} from "./liveBriefComparison";

export type LiveComparisonCandidate = {
  id: string;
  relationId: string;
  subject: string;
  object: string;
  contexts: readonly string[];
  species: string | null;
  sourceId: string;
  polarity: "supporting" | "opposing" | "uncertain";
  verification:
    | "not_run"
    | "agree_directional"
    | "agree_association_only"
    | "disputed"
    | "insufficient_abstain"
    | "check_failed";
};

const EMPTY_CONTEXT: CandidateBiologicalContext = {
  diseasePhenotype: [],
  organTissueCellState: [],
  genesProteinsPathways: [],
  experimentalSystemsSpecies: [],
  interventionsTargets: [],
};

const VERIFY_LABEL: Record<LiveComparisonCandidate["verification"], string> = {
  not_run: "not checked (ranked lower)",
  agree_directional: "both checks agree on direction",
  agree_association_only: "both checks agree association only",
  disputed: "checks disagreed",
  insufficient_abstain: "checks abstained / insufficient",
  check_failed: "model check failed",
};

function contextFor(
  c: LiveComparisonCandidate,
  contextLabels: Readonly<Record<string, string>>,
): CandidateBiologicalContext {
  return {
    ...EMPTY_CONTEXT,
    diseasePhenotype: c.contexts.map((key) => ({
      system: "hsi.live_context",
      value: key,
      label: contextLabels[key] ?? key,
    })),
    experimentalSystemsSpecies: c.species
      ? [{system: "hsi.live_species", value: c.species, label: c.species}]
      : [],
  };
}

function toUnit(
  c: LiveComparisonCandidate,
  contextLabels: Readonly<Record<string, string>>,
): ComparableEvidenceUnit {
  return {
    id: c.id,
    label: `${c.subject} ~ ${c.object}`,
    subject: {system: "hsi.live_entity", value: c.subject, label: c.subject},
    predicate: "associated_with",
    object: {system: "hsi.live_entity", value: c.object, label: c.object},
    findingPolarity: c.polarity,
    biologicalContext: contextFor(c, contextLabels),
    evidenceSourceIds: [c.sourceId],
    sourceProvider: "live_investigation",
    responseIdentity: null,
    methodologicalNote: null,
  };
}

/**
 * Verification binding: do not surface potential_contradiction when either
 * claim lacks a completed directional check (or checks disagreed / failed).
 */
export function bindComparisonOutcomeToVerification(
  engineOutcome: LiveComparisonOutcome,
  left: LiveComparisonCandidate["verification"],
  right: LiveComparisonCandidate["verification"],
): {outcome: LiveComparisonOutcome; note: string | null} {
  if (engineOutcome !== "potential_contradiction") {
    return {outcome: engineOutcome, note: null};
  }
  if (left === "not_run" || right === "not_run") {
    return {
      outcome: "insufficient_evidence",
      note: "Verification incomplete on at least one claim; polarity conflict is not treated as a contradiction candidate.",
    };
  }
  if (left === "check_failed" || right === "check_failed") {
    return {
      outcome: "insufficient_evidence",
      note: "A model check failed on at least one claim; polarity conflict is not treated as a contradiction candidate.",
    };
  }
  if (left === "disputed" || right === "disputed") {
    return {
      outcome: "insufficient_evidence",
      note: "Model checks disagreed on at least one claim; polarity conflict is not treated as a contradiction candidate.",
    };
  }
  if (left === "insufficient_abstain" || right === "insufficient_abstain") {
    return {
      outcome: "insufficient_evidence",
      note: "A check abstained on at least one claim; polarity conflict is not treated as a contradiction candidate.",
    };
  }
  return {outcome: "potential_contradiction", note: null};
}

function pairBudget(maxPairs: number | undefined): number {
  const n = maxPairs ?? 25;
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new Error("maxPairs must be an integer from 1 to 100");
  }
  return n;
}

/** Compare live candidates that share a relationId (same subject–object). */
export function buildLiveStructuredComparison(input: {
  candidates: readonly LiveComparisonCandidate[];
  contextLabels: Readonly<Record<string, string>>;
  maxPairs?: number;
}): LiveStructuredComparison {
  const maxPairs = pairBudget(input.maxPairs);
  const byRelation = new Map<string, LiveComparisonCandidate[]>();
  for (const c of input.candidates) {
    (byRelation.get(c.relationId) ?? byRelation.set(c.relationId, []).get(c.relationId)!).push(c);
  }

  const items: LiveComparisonItem[] = [];
  for (const group of byRelation.values()) {
    if (group.length < 2) continue;
    // Prefer checked pairs first so verification binding is exercised.
    const ordered = [...group].sort((a, b) => {
      const av = a.verification === "not_run" ? 1 : 0;
      const bv = b.verification === "not_run" ? 1 : 0;
      return av - bv || a.id.localeCompare(b.id);
    });
    for (let i = 0; i < ordered.length; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        if (items.length >= maxPairs) break;
        const left = ordered[i]!;
        const right = ordered[j]!;
        const cmp = compareEvidenceUnits({
          left: toUnit(left, input.contextLabels),
          right: toUnit(right, input.contextLabels),
        });
        const bound = bindComparisonOutcomeToVerification(
          cmp.outcome,
          left.verification,
          right.verification,
        );
        const leftCtx = left.contexts.map((k) => input.contextLabels[k] ?? k);
        const rightCtx = right.contexts.map((k) => input.contextLabels[k] ?? k);
        items.push({
          leftId: left.id,
          rightId: right.id,
          leftLabel: `${left.subject} ~ ${left.object}`,
          rightLabel: `${right.subject} ~ ${right.object}`,
          leftContexts: leftCtx,
          rightContexts: rightCtx,
          engineOutcome: cmp.outcome,
          outcome: bound.outcome,
          rationale: bound.note
            ? `${bound.note} Engine: ${cmp.rationale}`
            : cmp.rationale,
          verificationBindNote: bound.note,
          verificationLeft: VERIFY_LABEL[left.verification],
          verificationRight: VERIFY_LABEL[right.verification],
          sharedSubjectObject: cmp.trace.sharedSubjectObject,
          contextDepth: "coarse_metadata_only",
          needsHumanReview: true,
          potentialContradictionIsNotProven: true,
        });
      }
      if (items.length >= maxPairs) break;
    }
    if (items.length >= maxPairs) break;
  }

  const summary = {
    consistent: items.filter((i) => i.outcome === "consistent").length,
    potentialContradiction: items.filter((i) => i.outcome === "potential_contradiction")
      .length,
    contextDependent: items.filter((i) => i.outcome === "context_dependent").length,
    methodologicalDifference: items.filter((i) => i.outcome === "methodological_difference")
      .length,
    insufficientComparability: items.filter((i) => i.outcome === "insufficient_comparability")
      .length,
    insufficientEvidence: items.filter((i) => i.outcome === "insufficient_evidence").length,
  };

  const base = emptyLiveStructuredComparison(STRUCTURED_EVIDENCE_COMPARISON_VERSION);
  return {
    ...base,
    pairCount: items.length,
    summary,
    items,
  };
}
