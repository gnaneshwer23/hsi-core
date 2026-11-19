/**
 * Unified scientific investigation journey trail — Stage 2 spine after audit Next-5.
 * One progressive Ask → … → Save path on `/research/workspace`.
 * Does not claim journey completion, scientific approval, or production writes.
 * Browser-safe (no Node-only imports).
 */

export const UNIFIED_JOURNEY_TRAIL_SCHEMA = "hsi-unified-journey-trail-1" as const;

export type UnifiedJourneyStepId =
  | "ask"
  | "evidence"
  | "passport"
  | "disagreement"
  | "crossDomain"
  | "gaps"
  | "brief"
  | "save";

export type UnifiedJourneyStepState = "pending" | "ready" | "active" | "complete";

export type UnifiedJourneyStep = {
  id: UnifiedJourneyStepId;
  label: string;
  state: UnifiedJourneyStepState;
  detail: string;
};

export type UnifiedJourneyHonesty = {
  researcherJourneyCompleteClaimed: false;
  scientificApproval: false;
  inventsContext: false;
  productionWritesEnabled: false;
  potentialContradictionIsNotProven: true;
  associationIsNotCausation: true;
};

export const UNIFIED_JOURNEY_HONESTY: UnifiedJourneyHonesty = {
  researcherJourneyCompleteClaimed: false,
  scientificApproval: false,
  inventsContext: false,
  productionWritesEnabled: false,
  potentialContradictionIsNotProven: true,
  associationIsNotCausation: true,
};

export type UnifiedJourneyInput = {
  hasRun: boolean;
  candidateCount: number;
  selectedClaimId: string | null;
  selectedComparisonKey: string | null;
  comparisonPairCount: number;
  crossDomainPathCount: number;
  graphLoaded: boolean;
  gapCount: number;
  briefOpen: boolean;
  libraryCount: number;
  savedThisSession: boolean;
};

export function assertUnifiedJourneyHonesty(
  honesty: UnifiedJourneyHonesty,
): UnifiedJourneyHonesty {
  if (honesty.researcherJourneyCompleteClaimed !== false) {
    throw Error("researcherJourneyCompleteClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.inventsContext !== false) throw Error("inventsContext must be false");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.potentialContradictionIsNotProven !== true) {
    throw Error("potentialContradictionIsNotProven must be true");
  }
  if (honesty.associationIsNotCausation !== true) {
    throw Error("associationIsNotCausation must be true");
  }
  return honesty;
}

/** Build the eight-step Stage 2 product trail for the live workspace. */
export function buildUnifiedJourneyTrail(input: UnifiedJourneyInput): {
  schemaVersion: typeof UNIFIED_JOURNEY_TRAIL_SCHEMA;
  honesty: UnifiedJourneyHonesty;
  steps: readonly UnifiedJourneyStep[];
  activeStep: UnifiedJourneyStepId;
} {
  const honesty = assertUnifiedJourneyHonesty(UNIFIED_JOURNEY_HONESTY);
  const hasPassport = Boolean(input.selectedClaimId) || Boolean(input.selectedComparisonKey);
  const hasDisagreement = Boolean(input.selectedComparisonKey) && input.comparisonPairCount > 0;
  const hasCross = input.crossDomainPathCount > 0;
  const hasGaps = input.gapCount > 0;
  const hasSave = input.savedThisSession || input.libraryCount > 0;

  let active: UnifiedJourneyStepId = "ask";
  if (hasSave && input.briefOpen) active = "save";
  else if (input.briefOpen && input.hasRun) active = "brief";
  else if (hasGaps && input.hasRun) active = "gaps";
  else if (hasCross) active = "crossDomain";
  else if (hasDisagreement) active = "disagreement";
  else if (hasPassport) active = "passport";
  else if (input.hasRun && input.candidateCount > 0) active = "evidence";
  else if (input.hasRun) active = "evidence";
  else active = "ask";

  const step = (
    id: UnifiedJourneyStepId,
    label: string,
    complete: boolean,
    ready: boolean,
    detail: string,
  ): UnifiedJourneyStep => ({
    id,
    label,
    state:
      active === id ? "active" : complete ? "complete" : ready ? "ready" : "pending",
    detail,
  });

  const steps: UnifiedJourneyStep[] = [
    step(
      "ask",
      "Ask",
      input.hasRun,
      true,
      input.hasRun ? "Question recorded for this run" : "Start or reopen a research question",
    ),
    step(
      "evidence",
      "Evidence",
      input.hasRun && input.candidateCount > 0,
      input.hasRun,
      input.hasRun
        ? `${input.candidateCount} candidate claim(s) — unreviewed`
        : "Run retrieval for source-linked claims",
    ),
    step(
      "passport",
      "Passport",
      hasPassport,
      input.hasRun && input.candidateCount > 0,
      hasPassport
        ? "Experimental context open — missing fields stay explicit"
        : "Select a claim for the Context Passport",
    ),
    step(
      "disagreement",
      "Why differ",
      hasDisagreement,
      input.comparisonPairCount > 0,
      input.comparisonPairCount > 0
        ? `${input.comparisonPairCount} comparison pair(s) — not proven contradiction`
        : "Need ≥2 same-relation candidates",
    ),
    step(
      "crossDomain",
      "Cross-domain",
      hasCross,
      input.graphLoaded,
      input.graphLoaded
        ? hasCross
          ? `${input.crossDomainPathCount} candidate path(s) — unreviewed`
          : "Graph loaded — pick a start concept"
        : "Sealed graph not loaded yet",
    ),
    step(
      "gaps",
      "Gaps",
      hasGaps,
      input.hasRun,
      input.hasRun
        ? hasGaps
          ? `${input.gapCount} gap(s) derived from this run`
          : "No gaps derived yet"
        : "Available after a run",
    ),
    step(
      "brief",
      "Brief",
      input.briefOpen && input.hasRun,
      input.hasRun,
      input.hasRun
        ? "Limitations + passport columns visible — briefAccepted false"
        : "Available after a run",
    ),
    step(
      "save",
      "Save",
      hasSave,
      input.hasRun,
      hasSave
        ? `${input.libraryCount || 1} browser-saved version(s) — not a server store`
        : input.hasRun
          ? "Browser library only (production writes off)"
          : "Available after a run",
    ),
  ];

  return {
    schemaVersion: UNIFIED_JOURNEY_TRAIL_SCHEMA,
    honesty,
    steps,
    activeStep: active,
  };
}
