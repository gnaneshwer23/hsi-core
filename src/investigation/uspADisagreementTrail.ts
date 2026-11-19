/**
 * USP A — Explain scientific disagreement: pure trail helpers for the live
 * investigation workspace. Does not invent context, proven contradictions, or
 * scientific approval. Browser-safe (no Node-only imports).
 */

import type { LiveComparisonItem, LiveStructuredComparison } from "./liveBriefComparison";

export const USP_A_TRAIL_SCHEMA = "hsi-usp-a-disagreement-trail-1" as const;

export type UspATrailStepId =
  | "ask"
  | "evidence"
  | "passport"
  | "disagreement"
  | "brief";

export type UspATrailStepState = "pending" | "ready" | "active" | "complete";

export type UspATrailStep = {
  id: UspATrailStepId;
  label: string;
  state: UspATrailStepState;
  detail: string;
};

export type UspATrailHonesty = {
  potentialContradictionIsNotProven: true;
  scientificApproval: false;
  inventsContext: false;
  associationIsNotCausation: true;
  usp: "A";
};

export const USP_A_TRAIL_HONESTY: UspATrailHonesty = {
  potentialContradictionIsNotProven: true,
  scientificApproval: false,
  inventsContext: false,
  associationIsNotCausation: true,
  usp: "A",
};

export type UspATrailInput = {
  hasRun: boolean;
  candidateCount: number;
  selectedClaimId: string | null;
  selectedComparisonKey: string | null;
  comparison: LiveStructuredComparison | null | undefined;
  briefOpen: boolean;
};

export function comparisonPairKey(item: Pick<LiveComparisonItem, "leftId" | "rightId">): string {
  return `${item.leftId}::${item.rightId}`;
}

export function findComparisonItem(
  comparison: LiveStructuredComparison | null | undefined,
  key: string | null,
): LiveComparisonItem | null {
  if (!comparison || !key) return null;
  return comparison.items.find((i) => comparisonPairKey(i) === key) ?? null;
}

/** Build the five-step USP A product trail for the live workspace UI. */
export function buildUspADisagreementTrail(input: UspATrailInput): {
  schemaVersion: typeof USP_A_TRAIL_SCHEMA;
  honesty: UspATrailHonesty;
  steps: readonly UspATrailStep[];
  activeStep: UspATrailStepId;
  pairCount: number;
} {
  const pairCount = input.comparison?.pairCount ?? 0;
  const hasPassport = Boolean(input.selectedClaimId) || Boolean(input.selectedComparisonKey);
  const hasDisagreementFocus = Boolean(input.selectedComparisonKey) && pairCount > 0;

  let active: UspATrailStepId = "ask";
  if (input.briefOpen && input.hasRun) active = "brief";
  else if (hasDisagreementFocus) active = "disagreement";
  else if (hasPassport) active = "passport";
  else if (input.hasRun && input.candidateCount > 0) active = "evidence";
  else if (input.hasRun) active = "evidence";
  else active = "ask";

  const step = (
    id: UspATrailStepId,
    label: string,
    complete: boolean,
    ready: boolean,
    detail: string,
  ): UspATrailStep => ({
    id,
    label,
    state:
      active === id
        ? "active"
        : complete
          ? "complete"
          : ready
            ? "ready"
            : "pending",
    detail,
  });

  const steps: UspATrailStep[] = [
    step(
      "ask",
      "Ask",
      input.hasRun,
      true,
      input.hasRun
        ? "Question recorded for this run"
        : "Enter or reopen a research question",
    ),
    step(
      "evidence",
      "Evidence",
      input.hasRun && input.candidateCount > 0,
      input.hasRun,
      input.hasRun
        ? `${input.candidateCount} candidate claim(s) — supporting and opposing buckets`
        : "Run retrieval to load source-linked claims",
    ),
    step(
      "passport",
      "Context passport",
      hasPassport,
      input.hasRun && input.candidateCount > 0,
      hasPassport
        ? "Inspect experimental context; missing fields stay explicit"
        : "Select a claim to open its Evidence Context Passport",
    ),
    step(
      "disagreement",
      "Why findings differ",
      hasDisagreementFocus,
      pairCount > 0,
      pairCount > 0
        ? `${pairCount} structured comparison pair(s) — verification-bound; not proven contradiction`
        : "Need ≥2 candidates on the same relation for pairwise comparison",
    ),
    step(
      "brief",
      "Decision brief",
      input.briefOpen && input.hasRun,
      input.hasRun,
      input.hasRun
        ? "Evidence-linked brief with limitations (not scientific gold)"
        : "Available after a run",
    ),
  ];

  return {
    schemaVersion: USP_A_TRAIL_SCHEMA,
    honesty: USP_A_TRAIL_HONESTY,
    steps,
    activeStep: active,
    pairCount,
  };
}

export function assertUspATrailHonesty(honesty: UspATrailHonesty): UspATrailHonesty {
  if (honesty.usp !== "A") throw new Error("trail must be labelled USP A");
  if (
    honesty.scientificApproval !== false ||
    honesty.inventsContext !== false ||
    honesty.potentialContradictionIsNotProven !== true ||
    honesty.associationIsNotCausation !== true
  ) {
    throw new Error("USP A trail must keep fail-closed honesty flags");
  }
  return honesty;
}
