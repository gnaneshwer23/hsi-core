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

/**
 * Lifecycle of a mapping suggestion — never equals Neon Gate C approval.
 *
 * suggested → accepted_for_curation → curated
 *   curated = HSI-side accepted + real PMID/DOI evidence link; still autoApprove=false.
 *   Human Neon path remains: Check → claim_support=supports → Approve on the REL.
 * unmapped / rejected stay honest gaps (no invented REL-*).
 */
export type IsiRelSuggestionStatus =
  | "suggested"
  | "accepted_for_curation"
  | "curated"
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
    status: "curated",
    rationale:
      "Exact ISI map REL-R011-drives-P015. HSI seed carries real PMID 16382236 (Barber 2006 Nature) — curated for human Neon Gate C (Check→claim_support=supports→Approve). Still autoApprove=false. Re-check S-P-O (paper also used on expresses-R011).",
    autoApprove: false,
    isiNodeIds: ["R011", "P015"],
  },
  {
    claimId: "HSI-C-IM-006",
    edgeId: "HSI-E-IM-006",
    suggestedIsiRelationshipId: "REL-R004-activates-P003",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-R004-activates-P003. PMID 15030775 (Agostini 2004 Immunity) — curated bridge; metabolic-inflammation object is not a KG node; autoApprove=false; Neon approve+supports is human-only.",
    autoApprove: false,
    isiNodeIds: ["R004", "P003"],
  },
  {
    claimId: "HSI-C-IM-004",
    edgeId: "HSI-E-IM-004",
    suggestedIsiRelationshipId: "REL-P021-produces-B001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-P021-produces-B001. PMID 12813013 (Pepys & Hirschfield 2003 JCI) — curated marker-axis bridge; not a T2D edge; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["P021", "B001"],
  },
  {
    claimId: "HSI-C-IM-010",
    edgeId: "HSI-E-IM-010",
    suggestedIsiRelationshipId: "REL-I023-targets-M002",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-I023-targets-M002. PMID 28845751 (Ridker CANTOS 2017 NEJM) — curated discovery bridge; not CDS; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["I023", "M002"],
  },
  {
    claimId: "HSI-C-AU-001",
    edgeId: "HSI-E-AU-001",
    suggestedIsiRelationshipId: "REL-B015-predicts_eligibility_for-I013",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-B015-predicts_eligibility_for-I013. PMID 31180194 (Herold 2019 NEJM) — curated; T1D contrast with T2D; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["B015", "I013"],
  },
  {
    claimId: "HSI-C-IM-002",
    edgeId: "HSI-E-IM-002",
    suggestedIsiRelationshipId: "REL-M001-contributes_to-D001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-M001-contributes_to-D001. PMID 11244034 (Feldmann & Maini 2001) — curated; insulin-resistance object absent from ISI; not T2D proof; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["M001", "D001"],
  },
  {
    claimId: "HSI-C-IM-003",
    edgeId: "HSI-E-IM-003",
    suggestedIsiRelationshipId: "REL-M003-contributes_to-D001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-M003-contributes_to-D001. PMID 18625622 (Emery 2008) — curated; no T2D node in ISI; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["M003", "D001"],
  },
  {
    claimId: "HSI-C-IM-005",
    edgeId: "HSI-E-IM-005",
    suggestedIsiRelationshipId: "REL-C003-produces-M001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-C003-produces-M001. PMID 2993897 (Beutler 1985 Nature) — curated; adipose/IR pair not in ISI; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["C003", "M001"],
  },
  {
    claimId: "HSI-C-T2D-010",
    edgeId: "HSI-E-T2D-010",
    suggestedIsiRelationshipId: "REL-I010-suppresses-P001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Related-axis ISI map REL-I010-suppresses-P001. PMID 7569976 (Auphan 1995 Science) — curated; hyperglycemia consequence not this paper; Aksh HITL later; autoApprove=false.",
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
  // —— Provisional RA / TNF pathway (partnerLock.provisionalLock; lockedPilot=false) ——
  {
    claimId: "HSI-C-RA-001",
    edgeId: "HSI-E-RA-001",
    suggestedIsiRelationshipId: "REL-M001-contributes_to-D001",
    matchKind: "exact_concept_pair",
    status: "curated",
    rationale:
      "Exact ISI map REL-M001-contributes_to-D001 (TNF → RA). Provisional pathway seed; PMID 11244034; autoApprove=false; lockedPilot=false until named partner confirms.",
    autoApprove: false,
    isiNodeIds: ["M001", "D001"],
  },
  {
    claimId: "HSI-C-RA-002",
    edgeId: "HSI-E-RA-002",
    suggestedIsiRelationshipId: null,
    matchKind: "marker_only",
    status: "unmapped",
    rationale:
      "Anti-CCP → RA provisional biomarker — LOINC-linked (53031-9); PMID 10662881; no durable ISI REL-* yet. Do not invent.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-RA-003",
    edgeId: "HSI-E-RA-003",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale:
      "Anti-TNF therapy → treats → RA (PMID 11087881). No durable ISI REL-* invented for this treatment edge; Gate C pending if/when mapped.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-RA-004",
    edgeId: "HSI-E-RA-004",
    suggestedIsiRelationshipId: "REL-M003-contributes_to-D001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "IL-6 → RA provisional competing axis. PMID 18625622; related_axis REL-M003-contributes_to-D001; autoApprove=false.",
    autoApprove: false,
    isiNodeIds: ["M003", "D001"],
  },
  {
    claimId: "HSI-C-RA-005",
    edgeId: "HSI-E-RA-005",
    suggestedIsiRelationshipId: "REL-M003-contributes_to-D001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Anti-TNF-refractory phenotype ↔ IL-6 axis (response heterogeneity). PMID 18625622; related_axis to REL-M003 — curator must re-check S-P-O before Neon Gate C (same honesty as PMID 16382236 handoff).",
    autoApprove: false,
    isiNodeIds: ["M003", "D001"],
  },
  {
    claimId: "HSI-C-RA-006",
    edgeId: "HSI-E-RA-006",
    suggestedIsiRelationshipId: "REL-C003-produces-M001",
    matchKind: "related_axis",
    status: "curated",
    rationale:
      "Synovial macrophages → TNF. PMID 2993897; related_axis REL-C003-produces-M001. Foundational macrophage/TNF identity paper — do not overclaim RA histology at Gate C.",
    autoApprove: false,
    isiNodeIds: ["C003", "M001"],
  },
  {
    claimId: "HSI-C-SLE-001",
    edgeId: "HSI-E-SLE-001",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "Type I IFN → SLE illustrative pathway — no curated ISI REL-* yet.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-SLE-002",
    edgeId: "HSI-E-SLE-002",
    suggestedIsiRelationshipId: null,
    matchKind: "marker_only",
    status: "unmapped",
    rationale:
      "ANA → SLE illustrative biomarker — LOINC-linked in HSI; no durable ISI REL-* yet.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-PSO-001",
    edgeId: "HSI-E-PSO-001",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "IL-17 → psoriasis illustrative pathway — no curated ISI REL-* yet.",
    autoApprove: false,
    isiNodeIds: [],
  },
  {
    claimId: "HSI-C-IBD-001",
    edgeId: "HSI-E-IBD-001",
    suggestedIsiRelationshipId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "IL-23 → IBD illustrative pathway — no curated ISI REL-* yet.",
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
    (s.status === "suggested" ||
      s.status === "accepted_for_curation" ||
      s.status === "curated") &&
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
  /** HSI-side curated (evidence-linked) — still awaiting human Neon Gate C. */
  curated: number;
  acceptedForCuration: number;
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
    curated: suggestions.filter((s) => s.status === "curated").length,
    acceptedForCuration: suggestions.filter((s) => s.status === "accepted_for_curation").length,
    bridgeCandidatesCovered: withRel.filter((s) => bridgeIds.has(s.edgeId)).length,
    bridgeCandidatesTotal: bridges.length,
    autoApproveIntoKg: false,
  };
}
