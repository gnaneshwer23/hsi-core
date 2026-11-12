/** Deterministic synthetic teaching taxonomy; no provider, source, approval or backend-science mutation. */
export type AuditStudy = {
  context: Record<"species" | "tissue" | "cellState" | "stage" | "assay" | "outcome", string>;
  finding: "Increase" | "Decrease";
};
export type AuditTeachingOutcome =
  | "Genuine contradiction"
  | "Contextual difference"
  | "Insufficient evidence"
  | "Unresolved disagreement"
  | "Not directly comparable";
export const AUDIT_TEACHING_OUTCOMES: AuditTeachingOutcome[] = [
  "Genuine contradiction",
  "Contextual difference",
  "Insufficient evidence",
  "Unresolved disagreement",
  "Not directly comparable",
];

/** Public teaching taxonomy only. Never upgrades the backend's potential-conflict scientific state. */
export function illustrativeAuditOutcome(
  a: AuditStudy,
  b: AuditStudy,
  complete: boolean,
  controlledSyntheticAssumption: boolean,
): { outcome: AuditTeachingOutcome; reason: string } {
  if (!complete)
    return {
      outcome: "Insufficient evidence",
      reason: "Required context is missing. Do not fill gaps with an inferred match.",
    };
  if (
    a.context.species !== b.context.species ||
    a.context.assay !== b.context.assay ||
    a.context.outcome !== b.context.outcome
  )
    return {
      outcome: "Not directly comparable",
      reason:
        "Species, measurement or outcome differ. Align the estimand before comparing the direction of a finding.",
    };
  if (
    a.context.tissue !== b.context.tissue ||
    a.context.cellState !== b.context.cellState ||
    a.context.stage !== b.context.stage
  )
    return {
      outcome: "Contextual difference",
      reason:
        "Tissue, cell state or disease stage differs. A change in biological context may explain the observations; it does not prove why they differ.",
    };
  if (a.finding !== b.finding && controlledSyntheticAssumption)
    return {
      outcome: "Genuine contradiction",
      reason:
        "Only within this fictional controlled scenario, comparability and alternative explanations are stipulated as resolved. This is a teaching assumption, not an actual scientific determination.",
    };
  return {
    outcome: "Unresolved disagreement",
    reason:
      a.finding === b.finding
        ? "The chosen observations now agree in direction, but this exercise does not establish consensus or scientific support. Independent evidence review is still absent."
        : "Opposing observations in apparently matched contexts remain unresolved until study quality, uncertainty and independent review are assessed.",
  };
}
