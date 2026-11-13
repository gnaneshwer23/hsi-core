/**
 * Investigation scope registry: the single place that says which scopes an investigation or context audit
 * may run under. Replaces three copies of the disease-to-scope ternary and the literal "ssc"|"ra" unions.
 *
 * Two different questions are kept apart on purpose:
 *  - Can an investigation run under this scope? (registered here)
 *  - Who may approve it? (`reviewerScope`; null means no reviewer authority has been accepted, so human review
 *    for that scope fails closed. Adding a reviewer scope needs separate acceptance, see reviewerAuthority.ts.)
 * SSc and RA are registered as historical validation scopes, not as the product boundary.
 */
import type {Domain} from "./researchV2/universalInvestigation";
import type {HsiReviewerScope} from "./db/reviewerAuthority";

export interface InvestigationScope {
  readonly id: string;
  readonly label: string;
  readonly domains: readonly Domain[];
  /** Legacy single-disease package contexts that resolve to this scope. Empty for cross-domain scopes. */
  readonly diseaseIds: readonly string[];
  readonly reviewerScope: HsiReviewerScope | null;
}

export const INVESTIGATION_SCOPES = Object.freeze([
  {id: "ssc", label: "Systemic sclerosis (validation case)", domains: ["immunology"], diseaseIds: ["systemic_sclerosis"], reviewerScope: "ssc"},
  {id: "ra", label: "Rheumatoid arthritis (validation case)", domains: ["immunology"], diseaseIds: ["rheumatoid_arthritis"], reviewerScope: "ra"},
  {id: "gut-immune-metabolic", label: "Microbial metabolites, immune signalling and metabolism", domains: ["microbiome", "immunology", "metabolism"], diseaseIds: [], reviewerScope: null},
] as const satisfies readonly InvestigationScope[]);

export type InvestigationScopeId = (typeof INVESTIGATION_SCOPES)[number]["id"];

export function isInvestigationScopeId(value: unknown): value is InvestigationScopeId {
  return typeof value === "string" && INVESTIGATION_SCOPES.some(s => s.id === value);
}

/** Legacy package contexts are keyed by a single disease. Unknown diseases do not fall through to another scope. */
export function scopeIdForDisease(disease: unknown): InvestigationScopeId | null {
  if (typeof disease !== "string") return null;
  return INVESTIGATION_SCOPES.find(s => (s.diseaseIds as readonly string[]).includes(disease))?.id ?? null;
}

/** Reviewer authority for a scope, or null when none has been accepted (human review is then denied). */
export function reviewerScopeFor(id: InvestigationScopeId): HsiReviewerScope | null {
  return INVESTIGATION_SCOPES.find(s => s.id === id)?.reviewerScope ?? null;
}
