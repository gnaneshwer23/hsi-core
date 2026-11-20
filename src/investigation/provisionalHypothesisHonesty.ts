/**
 * Fail-closed provisional labels for hypotheses and experiment proposals.
 * Does not claim scientific approval, findings status, or recommendations.
 * Browser-safe.
 */

export const PROVISIONAL_HYPOTHESIS_HONESTY_SCHEMA =
  "hsi-provisional-hypothesis-honesty-1" as const;

export type ProvisionalHypothesisHonesty = {
  schemaVersion: typeof PROVISIONAL_HYPOTHESIS_HONESTY_SCHEMA;
  scientificApproval: false;
  inventsFindings: false;
  recommendsAction: false;
  hypothesesAreProvisional: true;
  experimentsAreProvisional: true;
};

export const PROVISIONAL_HYPOTHESIS_HONESTY: ProvisionalHypothesisHonesty = {
  schemaVersion: PROVISIONAL_HYPOTHESIS_HONESTY_SCHEMA,
  scientificApproval: false,
  inventsFindings: false,
  recommendsAction: false,
  hypothesesAreProvisional: true,
  experimentsAreProvisional: true,
};

/** Hypothesis chip / tagline on the workspace hyp block. */
export const PROVISIONAL_HYPOTHESIS_TAGLINE =
  "Provisional · unvalidated hypothesis" as const;

/** Experiment field label (workspace dl + brief markdown). */
export const PROVISIONAL_EXPERIMENT_LABEL =
  "Experiment (provisional, unvalidated)" as const;

/** Always-visible honesty line for brief limitations / panels. */
export const PROVISIONAL_HYPOTHESIS_HONESTY_LINE =
  "Hypotheses and experiment proposals are provisional and unvalidated — not findings, not recommendations, not scientific approval." as const;

export function assertProvisionalHypothesisHonesty(
  honesty: ProvisionalHypothesisHonesty,
): ProvisionalHypothesisHonesty {
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.inventsFindings !== false) throw Error("inventsFindings must be false");
  if (honesty.recommendsAction !== false) throw Error("recommendsAction must be false");
  if (honesty.hypothesesAreProvisional !== true) {
    throw Error("hypothesesAreProvisional must be true");
  }
  if (honesty.experimentsAreProvisional !== true) {
    throw Error("experimentsAreProvisional must be true");
  }
  return honesty;
}
