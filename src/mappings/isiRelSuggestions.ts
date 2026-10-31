/**
 * Bridge-candidate → ISI REL-* suggestions for Gate C curation.
 *
 * Rules:
 * - Only real Immune City relationship ids (REL-{subject}-{relation}-{object}).
 * - Suggestions never invent PMIDs, never auto-approve into the KG, never CDS.
 * - teachingStatus / hsiGrade / curationReview stay orthogonal — this file only
 *   fills claim.isiRelationshipId as a curation pointer.
 * - Match kinds are honest: exact_concept_pair vs related_axis vs none.
 */
import type { HsiClaim } from "../schema";
import {
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "../seed/t2dImmunoMetabolic";

export type IsiRelMatchKind =
  | "exact_concept_pair"
  | "related_axis"
  | "marker_only"
  | "none";

/** Lifecycle of a mapping suggestion — never equals Gate C approval. */
export type IsiRelSuggestionStatus =
  | "suggested"
  | "accepted_for_curation"
  | "rejected"
  | "unmapped";

export type IsiRelSuggestion = {
  claimId: string;
  edgeId: string;
  /** Canonical ISI id when a graph edge exists; null when ISI has no analogue yet. */
  suggestedIsiRelationshipId: string | null;
  matchKind: IsiRelMatchKind;
  status: IsiRelSuggestionStatus;
  /** Curator-facing note — why this REL is (or is not) a bridge candidate. */
  rationale: string;
  /** Hard invariant — consumers must treat this as false forever here. */
  autoApprove: false;
  /** ISI node ids referenced by the suggestion (for queue UI). */
  isiNodeIds: string[];
};

/**
 * Curated Phase-0 suggestions against Immune City kg.json (canonical REL-* ids).
 * Prefer bridge candidates; include a few IO/autoimmunity seeds that already exist in ISI.
 */
export const ISI_REL_SUGGESTIONS: readonly IsiRelSuggestion[] = [
  {
    claimId: "HSI-C-IO-001",
    edgeId: "HSI-E-IO-001",
    suggestedIsiRelationshipId: "REL-R011-drives-P015",
    matchKind: "exact_concept_pair",
    status: "accepted_for_curation",
    rationale:
      "Exact ISI map REL-R011-drives-P015. HSI seed now carries real PMID 16382236 (Barber 2006 Nature) as source-verified provenance — accepted for Gate C curation handoff. Still autoApprove=false; Neon approve+supports on this relId is the human Gate C pass. Re-check S-P-O (paper also used on expresses-R011).",
    autoApprove: false,
    isiNodeIds: ["R011", "P015"],
  },
  {
    claimId: "HSI-C-IM-006",
    edgeId: "HSI-E-IM-006",
    suggestedIsiRelationshipId: "REL-R004-activates-P003",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "NLRP3 → inflammasome exists in ISI. Metabolic-inflammation object is not a KG node yet — curator must not treat this as T2D proof.",
    autoApprove: false,
    isiNodeIds: ["R004", "P003"],
  },
  {
    claimId: "HSI-C-IM-004",
    edgeId: "HSI-E-IM-004",
    suggestedIsiRelationshipId: "REL-P021-produces-B001",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "Acute-phase response produces CRP (B001). Closest marker-axis edge for hs-CRP / inflammatory burden; not a T2D edge.",
    autoApprove: false,
    isiNodeIds: ["P021", "B001"],
  },
  {
    claimId: "HSI-C-IM-010",
    edgeId: "HSI-E-IM-010",
    suggestedIsiRelationshipId: "REL-I023-targets-M002",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "Canakinumab → IL-1β is the concrete ISI pharmacology edge for IL-1 pathway blockade (research / CANTOS axis). Discovery only.",
    autoApprove: false,
    isiNodeIds: ["I023", "M002"],
  },
  {
    claimId: "HSI-C-AU-001",
    edgeId: "HSI-E-AU-001",
    suggestedIsiRelationshipId: "REL-B015-predicts_eligibility_for-I013",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "Islet autoantibodies exist in ISI (B015) via Teplizumab eligibility — T1D autoimmunity contrast with T2D clinics.",
    autoApprove: false,
    isiNodeIds: ["B015", "I013"],
  },
  {
    claimId: "HSI-C-IM-002",
    edgeId: "HSI-E-IM-002",
    suggestedIsiRelationshipId: "REL-M001-contributes_to-D001",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "TNF → RA is the nearest graded TNF inflammatory edge. Insulin-resistance object is absent from ISI KG — keep as related_axis only.",
    autoApprove: false,
    isiNodeIds: ["M001", "D001"],
  },
  {
    claimId: "HSI-C-IM-003",
    edgeId: "HSI-E-IM-003",
    suggestedIsiRelationshipId: "REL-M003-contributes_to-D001",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "IL-6 → RA is the nearest graded IL-6 inflammatory edge. No Type 2 diabetes node in ISI yet.",
    autoApprove: false,
    isiNodeIds: ["M003", "D001"],
  },
  {
    claimId: "HSI-C-IM-005",
    edgeId: "HSI-E-IM-005",
    suggestedIsiRelationshipId: "REL-C003-produces-M001",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "Macrophage → TNF is the closest myeloid inflammatory producer edge. Adipose-tissue macrophage / insulin-resistance pair is not in ISI.",
    autoApprove: false,
    isiNodeIds: ["C003", "M001"],
  },
  {
    claimId: "HSI-C-T2D-010",
    edgeId: "HSI-E-T2D-010",
    suggestedIsiRelationshipId: "REL-I010-suppresses-P001",
    matchKind: "related_axis",
    status: "suggested",
    rationale:
      "Corticosteroid → NF-κB suppression exists in ISI. Hyperglycemia consequence is not modelled — flag for Aksh HITL, not ISI completeness.",
    autoApprove: false,
    isiNodeIds: ["I010", "P001"],
  },
  // —— Explicit unmapped bridge gaps (honest none) ——
  {
    claimId: "HSI-C-IM-001",
    edgeId: "HSI-E-IM-001",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale:
      "Chronic inflammation ↔ insulin resistance bridge has no ISI relationship yet. Do not invent a REL-* id.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IM-007",
    edgeId: "HSI-E-IM-007",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "T2D → infection susceptibility — no T2D node / infection-susceptibility edge in ISI KG.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IM-008",
    edgeId: "HSI-E-IM-008",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "Hyperglycemia → innate dysfunction — neither endpoint is an ISI relationship pair yet.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IM-009",
    edgeId: "HSI-E-IM-009",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "Autoimmune–metabolic comorbidity ↔ T2D — no ISI edge; keep on bridge shortlist as gap.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IO-002",
    edgeId: "HSI-E-IO-002",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "Checkpoint therapy ↔ irAE — irAE is not a modelled ISI disease/event node yet.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IO-003",
    edgeId: "HSI-E-IO-003",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "irAE / steroid → hyperglycemia bridge — no ISI relationship; Aksh-facing later.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-AU-002",
    edgeId: "HSI-E-AU-002",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "LADA ↔ T2D phenotype overlap — no LADA / T2D nodes in ISI KG.",
    autoApprove: false,
    isiNodeIds: [],
  },
] as const;

export function listIsiRelSuggestions(): IsiRelSuggestion[] {
  return [...ISI_REL_SUGGESTIONS];
}

export function suggestionForClaim(claimId: string): IsiRelSuggestion | undefined {
  return ISI_REL_SUGGESTIONS.find((s) => s.claimId === claimId);
}

export function suggestionForEdge(edgeId: string): IsiRelSuggestion | undefined {
  return ISI_REL_SUGGESTIONS.find((s) => s.edgeId === edgeId);
}

function shouldApply(s: IsiRelSuggestion): boolean {
  return (
    Boolean(s.suggestedIsiRelationshipId) &&
    (s.status === "suggested" || s.status === "accepted_for_curation") &&
    s.autoApprove === false
  );
}

/**
 * Merge suggestion pointers into claims. Does **not** change curationReview,
 * hsiGrade, teachingStatus, or seedKind — Gate C remains human-only in ISI.
 */
export function claimsWithIsiMappings(
  claims: readonly HsiClaim[] = HSI_T2D_IMMUNO_SEED_CLAIMS,
): HsiClaim[] {
  return claims.map((claim) => {
    const s = suggestionForClaim(claim.id);
    if (!s || !shouldApply(s) || !s.suggestedIsiRelationshipId) return { ...claim };
    return { ...claim, isiRelationshipId: s.suggestedIsiRelationshipId };
  });
}

export type IsiRelMappingSummary = {
  suggestions: number;
  withRelId: number;
  unmapped: number;
  exactConceptPair: number;
  relatedAxis: number;
  bridgeCandidatesCovered: number;
  bridgeCandidatesTotal: number;
  /** Always false — documentation invariant for consumers. */
  autoApproveIntoKg: false;
};

export function summarizeIsiRelMappings(
  suggestions: readonly IsiRelSuggestion[] = ISI_REL_SUGGESTIONS,
): IsiRelMappingSummary {
  const bridges = HSI_T2D_IMMUNO_SEED_EDGES.filter((e) => e.bridgeCandidate);
  const bridgeIds = new Set(bridges.map((e) => e.id));
  const withRel = suggestions.filter((s) => s.suggestedIsiRelationshipId);
  return {
    suggestions: suggestions.length,
    withRelId: withRel.length,
    unmapped: suggestions.filter((s) => s.matchKind === "none" || !s.suggestedIsiRelationshipId).length,
    exactConceptPair: suggestions.filter((s) => s.matchKind === "exact_concept_pair").length,
    relatedAxis: suggestions.filter((s) => s.matchKind === "related_axis").length,
    bridgeCandidatesCovered: withRel.filter((s) => bridgeIds.has(s.edgeId)).length,
    bridgeCandidatesTotal: bridges.length,
    autoApproveIntoKg: false,
  };
}
