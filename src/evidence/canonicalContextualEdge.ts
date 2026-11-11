/**
 * P0.1 canonical contextual evidence edge contract.
 * Single approval boundary for typed graph edges, contextual candidate relationships
 * and mechanism comparison leads. Existing representations remain input adapters;
 * none is independently authorised to promote evidence.
 */
export const CANONICAL_EDGE_SCHEMA_VERSION = "hsi-contextual-evidence-edge-1" as const;
export const REQUIRED_CONTEXT = [
  "disease", "tissue", "cellPopulation", "parentGate", "denominator",
  "species", "assay", "experimentalSystem", "endpoint", "timepoint",
] as const;
export type ContextKey = typeof REQUIRED_CONTEXT[number];
export type ContextValue = { value: string | null; status: "reported" | "not_reported" | "not_applicable"; sourceLocator?: string };
export type CanonicalContext = Record<ContextKey, ContextValue> & {
  cellState?: ContextValue; intervention?: ContextValue; treatment?: ContextValue;
  diseaseStage?: ContextValue; cohort?: ContextValue;
};
export type CanonicalEvidenceEdge = {
  schemaVersion: typeof CANONICAL_EDGE_SCHEMA_VERSION;
  id: string;
  subjectId: string;
  predicate: string;
  objectId: string;
  direction: "supports" | "opposes" | "inconclusive";
  context: CanonicalContext;
  provenance: {
    sourceId: string;
    sourceUrl: string;
    sourceLocator: string;
    evidenceRecordIds: string[];
    extractionMethod: "human" | "assisted" | "synthetic";
  };
  review: {
    state: "draft" | "in_review" | "approved" | "rejected";
    reviewerId?: string;
    reviewedAt?: string;
    independentOfSubmitter?: boolean;
  };
  submitterId: string;
  synthetic: boolean;
  limitations: string[];
};
export type ContextComparison = {
  classification: "candidate_conflict" | "context_explained_divergence" | "no_conflict" | "cannot_compare";
  missing: ContextKey[];
  mismatched: ContextKey[];
  eligibleForScientificConclusion: false;
};
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const reported = (value: ContextValue | undefined) =>
  value?.status === "reported" && nonempty(value.value) && nonempty(value.sourceLocator);
export function validateCanonicalEdge(edge: CanonicalEvidenceEdge): string[] {
  const errors: string[] = [];
  if (edge.schemaVersion !== CANONICAL_EDGE_SCHEMA_VERSION) errors.push("schemaVersion");
  for (const key of ["id","subjectId","predicate","objectId","submitterId"] as const)
    if (!nonempty(edge[key])) errors.push(key);
  if (!["supports","opposes","inconclusive"].includes(edge.direction)) errors.push("direction");
  for (const key of REQUIRED_CONTEXT) {
    const v = edge.context?.[key];
    if (!v || !["reported","not_reported","not_applicable"].includes(v.status)) errors.push(`context.${key}.status`);
    if (v?.status === "reported" && (!nonempty(v.value) || !nonempty(v.sourceLocator))) errors.push(`context.${key}.provenance`);
    if (v?.status !== "reported" && v?.value != null && nonempty(v.value)) errors.push(`context.${key}.unreported_value`);
  }
  if (!nonempty(edge.provenance?.sourceId) || !edge.provenance?.sourceUrl?.startsWith("https://") ||
      !nonempty(edge.provenance?.sourceLocator) || !edge.provenance?.evidenceRecordIds?.length)
    errors.push("provenance");
  if (edge.review?.state === "approved") {
    if (edge.synthetic || edge.provenance.extractionMethod === "synthetic") errors.push("synthetic_cannot_approve");
    for (const key of REQUIRED_CONTEXT) if (!reported(edge.context?.[key])) errors.push(`approval_missing_context.${key}`);
    if (!nonempty(edge.review.reviewerId) || !nonempty(edge.review.reviewedAt) ||
        edge.review.independentOfSubmitter !== true || edge.review.reviewerId === edge.submitterId)
      errors.push("independent_review_required");
  }
  return errors;
}
/** Missing context has precedence over mismatches: unknown never means equal. */
export function compareCanonicalEdges(a: CanonicalEvidenceEdge, b: CanonicalEvidenceEdge): ContextComparison {
  const invalid = [...validateCanonicalEdge(a),...validateCanonicalEdge(b)];
  if (invalid.length) throw new Error("Invalid canonical evidence edge: " + invalid.join(","));
  const missing = REQUIRED_CONTEXT.filter(key => !reported(a.context[key]) || !reported(b.context[key]));
  const mismatched = REQUIRED_CONTEXT.filter(key => reported(a.context[key]) && reported(b.context[key]) &&
    a.context[key].value!.trim().toLowerCase() !== b.context[key].value!.trim().toLowerCase());
  const sameRelationship = a.subjectId === b.subjectId && a.predicate === b.predicate && a.objectId === b.objectId;
  const opposite = (a.direction === "supports" && b.direction === "opposes") ||
    (a.direction === "opposes" && b.direction === "supports");
  return {
    classification: missing.length ? "cannot_compare" :
      mismatched.length || !sameRelationship ? "context_explained_divergence" :
      opposite ? "candidate_conflict" : "no_conflict",
    missing, mismatched, eligibleForScientificConclusion: false,
  };
}
