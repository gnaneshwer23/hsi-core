/**
 * T2D / immuno-metabolic → Aksh HITL node-id map (P1).
 *
 * Rules (fail closed):
 * - `akshNodeId` is a curation / HITL pointer only — never EHR write-back.
 * - Mapping does **not** change curationReview, hsiGrade, teachingStatus, or seedKind.
 * - `isCdsSurfacable(edge)` stays false until curationReview=approved AND hsiGrade=established.
 * - Durable ids use the `aksh:` namespace (see akshClinicIds.ts), migrated from provisional AKSH-N-*.
 */
import type { HsiClaim } from "../schema";
import {
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "../seed/t2dImmunoMetabolic";
import {
  isDurableAkshClinicId,
  PROVISIONAL_AKSH_TO_DURABLE,
} from "./akshClinicIds";

/** How closely the HSI claim matches a planned Aksh clinic concept. */
export type AkshNodeMatchKind =
  | "exact_clinic_concept"
  | "pathway_template"
  | "bridge_watch"
  | "none";

/** Lifecycle of an Aksh map suggestion — never equals CDS eligibility. */
export type AkshNodeSuggestionStatus =
  | "suggested"
  | "accepted_for_hitl_map"
  | "deferred"
  | "unmapped";

export type AkshNodeSuggestion = {
  claimId: string;
  edgeId: string;
  /** Durable `aksh:` clinic concept id; null when no HITL surface yet. */
  suggestedAkshNodeId: string | null;
  matchKind: AkshNodeMatchKind;
  status: AkshNodeSuggestionStatus;
  /** Curator / eng-facing note — why this id exists (or does not). */
  rationale: string;
  /** Hard invariant — consumers must treat this as false forever here. */
  autoSurfaceCds: false;
  /** Alias of autoSurfaceCds — map never implies isCdsSurfacable. */
  cdsSurfacableHint: false;
  /** Hard invariant — never auto-apply to EHR / patient record. */
  autoApplyToEhr: false;
  /** Related HSI node ids for join keys. */
  hsiNodeIds: string[];
};

/**
 * Curated P1 suggestions for Aksh HITL consumption.
 * Prefer T2D core + immuno-metabolic bridges; leave IO discovery seeds unmapped.
 */
export const AKSH_NODE_SUGGESTIONS: readonly AkshNodeSuggestion[] = [
  // —— T2D core (Aksh-facing) ——
  {
    claimId: "HSI-C-T2D-001",
    edgeId: "HSI-E-T2D-001",
    suggestedAkshNodeId: "aksh:finding:hba1c",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "HbA1c ↔ T2D monitoring/diagnosis — primary Aksh glycemic marker (LOINC 4548-4). Map fills claim.akshNodeId only; isCdsSurfacable stays false until Gate C approved + established.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-hba1c", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-002",
    edgeId: "HSI-E-T2D-002",
    suggestedAkshNodeId: "aksh:finding:fpg",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "Fasting plasma glucose diagnostic threshold — clinic lab concept (LOINC 1558-6). Pointer only; no CDS auto-surface.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-fpg", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-003",
    edgeId: "HSI-E-T2D-003",
    suggestedAkshNodeId: "aksh:pathway:insulin-resistance",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "Insulin resistance pathophysiology — pathway-template slot for future HITL cards. Not CDS-actionable from this map.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-insulin-resistance", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-004",
    edgeId: "HSI-E-T2D-004",
    suggestedAkshNodeId: "aksh:pathway:beta-cell-dysfunction",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "β-cell dysfunction contributes to T2D — pathway context for HITL. autoSurfaceCds=false.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-beta-cell-dysfunction", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-005",
    edgeId: "HSI-E-T2D-005",
    suggestedAkshNodeId: "aksh:medicine:metformin",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "Metformin first-line pharmacotherapy — med concept for HITL regimen review. Still requires approved+established before isCdsSurfacable.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-metformin", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-006",
    edgeId: "HSI-E-T2D-006",
    suggestedAkshNodeId: "aksh:medicine:sglt2i",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "SGLT2 inhibitor class — clinic med concept. Map ≠ CDS eligibility.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-sglt2i", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-007",
    edgeId: "HSI-E-T2D-007",
    suggestedAkshNodeId: "aksh:medicine:glp1ra",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "GLP-1 receptor agonist class — clinic med concept. autoSurfaceCds=false.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-glp1ra", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-008",
    edgeId: "HSI-E-T2D-008",
    suggestedAkshNodeId: "aksh:condition:obesity",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "Obesity as modifiable T2D risk factor — clinic comorbidity slot. Not auto diagnosis.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-obesity", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-009",
    edgeId: "HSI-E-T2D-009",
    suggestedAkshNodeId: "aksh:finding:cgm-tir",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "CGM time-in-range complements HbA1c — pathway template; hypothesized teaching axis stays separate.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-cgm-tir", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-T2D-010",
    edgeId: "HSI-E-T2D-010",
    suggestedAkshNodeId: "aksh:interaction:glucocorticoid-hyperglycemia",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "Systemic glucocorticoids → hyperglycemia — HITL watch for steroid-exposed T2D visits. PMID on seed is GC→NF-κB axis (ISI); do not treat as hyperglycemia Gate C proof.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-glucocorticoids", "HSI-N-hyperglycemia"],
  },

  // —— Immuno-metabolic bridges (Aksh watch / later pathway) ——
  {
    claimId: "HSI-C-IM-001",
    edgeId: "HSI-E-IM-001",
    suggestedAkshNodeId: "aksh:interaction:inflammation-insulin-resistance",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "Chronic inflammation ↔ insulin resistance bridge shortlist — Aksh watch id for future immuno-metabolic pathway. No ISI REL yet; no CDS.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-chronic-inflammation", "HSI-N-insulin-resistance"],
  },
  {
    claimId: "HSI-C-IM-002",
    edgeId: "HSI-E-IM-002",
    suggestedAkshNodeId: "aksh:interaction:tnf-insulin-resistance",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "TNF-α ↔ insulin resistance — bridge watch. Seed PMID supports ISI RA axis, not T2D CDS.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-tnf-alpha", "HSI-N-insulin-resistance"],
  },
  {
    claimId: "HSI-C-IM-003",
    edgeId: "HSI-E-IM-003",
    suggestedAkshNodeId: "aksh:interaction:il6-t2dm",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "IL-6 ↔ T2D association — bridge watch / lab context. Not CDS-actionable from map alone.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-il6", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-IM-004",
    edgeId: "HSI-E-IM-004",
    suggestedAkshNodeId: "aksh:finding:hscrp",
    matchKind: "exact_clinic_concept",
    status: "accepted_for_hitl_map",
    rationale:
      "hs-CRP inflammatory marker — clinic lab concept (LOINC 30522-7) for immuno-metabolic context cards. autoSurfaceCds=false.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-crp", "HSI-N-chronic-inflammation"],
  },
  {
    claimId: "HSI-C-IM-005",
    edgeId: "HSI-E-IM-005",
    suggestedAkshNodeId: "aksh:interaction:adipose-macrophage-ir",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "Adipose macrophage ↔ insulin resistance — research bridge watch; not visit CDS.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-adipose-macrophages", "HSI-N-insulin-resistance"],
  },
  {
    claimId: "HSI-C-IM-006",
    edgeId: "HSI-E-IM-006",
    suggestedAkshNodeId: "aksh:interaction:nlrp3-metabolic-inflammation",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "NLRP3 → metabolic inflammation — discovery/bridge watch. Not Aksh day-1 CDS.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-nlrp3", "HSI-N-metabolic-inflammation"],
  },
  {
    claimId: "HSI-C-IM-007",
    edgeId: "HSI-E-IM-007",
    suggestedAkshNodeId: "aksh:risk:infection-susceptibility",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "T2D ↔ infection susceptibility — clinic-relevant bridge watch for later pathway templates.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-t2d", "HSI-N-infection-risk"],
  },
  {
    claimId: "HSI-C-IM-008",
    edgeId: "HSI-E-IM-008",
    suggestedAkshNodeId: "aksh:interaction:hyperglycemia-innate",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "Hyperglycemia → innate dysfunction — bridge watch; hypothesized; no CDS.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-hyperglycemia", "HSI-N-innate-dysfunction"],
  },
  {
    claimId: "HSI-C-IM-009",
    edgeId: "HSI-E-IM-009",
    suggestedAkshNodeId: "aksh:interaction:autoimmune-metabolic-comorbidity",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "Autoimmune–metabolic comorbidity ↔ T2D — shortlist watch for LADA/overlap clinics.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-pcos-autoimmune-overlap", "HSI-N-t2d"],
  },
  {
    claimId: "HSI-C-IM-010",
    edgeId: "HSI-E-IM-010",
    suggestedAkshNodeId: null,
    matchKind: "none",
    status: "deferred",
    rationale:
      "IL-1 blockade / CANTOS — research-only; deliberately not mapped to Aksh HITL surface. Discovery stays on ISI.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-anti-il1", "HSI-N-metabolic-inflammation"],
  },

  // —— IO / autoimmunity: Aksh unmapped (ISI density, not clinic T2D CDS) ——
  {
    claimId: "HSI-C-IO-001",
    edgeId: "HSI-E-IO-001",
    suggestedAkshNodeId: null,
    matchKind: "none",
    status: "unmapped",
    rationale:
      "PD-1 → T-cell exhaustion is ISI discovery (REL-R011-drives-P015). Not an Aksh T2D HITL concept.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-pd1", "HSI-N-tcell-exhaustion"],
  },
  {
    claimId: "HSI-C-IO-002",
    edgeId: "HSI-E-IO-002",
    suggestedAkshNodeId: null,
    matchKind: "none",
    status: "unmapped",
    rationale: "Checkpoint therapy ↔ irAE — oncology/IO surface; not T2D Aksh map.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-checkpoint-therapy", "HSI-N-irae"],
  },
  {
    claimId: "HSI-C-IO-003",
    edgeId: "HSI-E-IO-003",
    suggestedAkshNodeId: "aksh:watch:irae-hyperglycemia",
    matchKind: "bridge_watch",
    status: "accepted_for_hitl_map",
    rationale:
      "irAE / steroid → hyperglycemia — clinic-relevant bridge watch when IO patients enter metabolic pathways. Still autoSurfaceCds=false.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-irae", "HSI-N-hyperglycemia"],
  },
  {
    claimId: "HSI-C-AU-001",
    edgeId: "HSI-E-AU-001",
    suggestedAkshNodeId: "aksh:finding:islet-autoantibodies",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "Islet autoantibodies (T1D contrast) — differential pathway for adult-onset diabetes clinics. Not T2D CDS proof.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-t1d-autoimmunity", "HSI-N-islet-autoantibodies"],
  },
  {
    claimId: "HSI-C-AU-002",
    edgeId: "HSI-E-AU-002",
    suggestedAkshNodeId: "aksh:condition:lada",
    matchKind: "pathway_template",
    status: "accepted_for_hitl_map",
    rationale:
      "LADA phenotype overlap with T2D clinics — pathway template for differential HITL. autoSurfaceCds=false.",
    autoSurfaceCds: false,
    cdsSurfacableHint: false,
    autoApplyToEhr: false,
    hsiNodeIds: ["HSI-N-lada", "HSI-N-t2d"],
  },
] as const;

export function listAkshNodeSuggestions(): AkshNodeSuggestion[] {
  return [...AKSH_NODE_SUGGESTIONS];
}

export function akshSuggestionForClaim(claimId: string): AkshNodeSuggestion | undefined {
  return AKSH_NODE_SUGGESTIONS.find((s) => s.claimId === claimId);
}

export function akshSuggestionForEdge(edgeId: string): AkshNodeSuggestion | undefined {
  return AKSH_NODE_SUGGESTIONS.find((s) => s.edgeId === edgeId);
}

function shouldApply(s: AkshNodeSuggestion): boolean {
  return (
    Boolean(s.suggestedAkshNodeId) &&
    (s.status === "suggested" || s.status === "accepted_for_hitl_map") &&
    s.autoSurfaceCds === false &&
    s.cdsSurfacableHint === false &&
    s.autoApplyToEhr === false
  );
}

/**
 * Merge Aksh node pointers into claims. Does **not** change curationReview,
 * hsiGrade, teachingStatus, seedKind, or CDS eligibility.
 */
export function claimsWithAkshMappings(
  claims: readonly HsiClaim[] = HSI_T2D_IMMUNO_SEED_CLAIMS,
): HsiClaim[] {
  return claims.map((claim) => {
    const s = akshSuggestionForClaim(claim.id);
    if (!s || !shouldApply(s) || !s.suggestedAkshNodeId) return { ...claim };
    return { ...claim, akshNodeId: s.suggestedAkshNodeId };
  });
}

export type AkshNodeMappingSummary = {
  suggestions: number;
  withAkshNodeId: number;
  unmappedOrDeferred: number;
  exactClinicConcept: number;
  pathwayTemplate: number;
  bridgeWatch: number;
  t2dSeedsTotal: number;
  t2dSeedsMapped: number;
  /** Durable `aksh:` ids in suggestions (excludes null). */
  durableAkshIds: number;
  /** Legacy provisional stubs remaining (should be 0 after migration). */
  provisionalAkshIdsRemaining: number;
  /** Migration table size. */
  provisionalMigrationEntries: number;
  /** Always false — documentation invariant for consumers. */
  autoSurfaceCds: false;
  /** Always false — map never writes EHR / patient record. */
  autoApplyToEhr: false;
  /** Reminder: mapping ≠ isCdsSurfacable. */
  cdsRequiresApprovedEstablished: true;
  /** Seed edges remain non-CDS after map apply. */
  anyCdsSurfacableOnSeedEdges: false;
};

export function summarizeAkshNodeMappings(
  suggestions: readonly AkshNodeSuggestion[] = AKSH_NODE_SUGGESTIONS,
): AkshNodeMappingSummary {
  const withId = suggestions.filter((s) => s.suggestedAkshNodeId);
  const t2dEdges = HSI_T2D_IMMUNO_SEED_EDGES.filter((e) => e.domain === "t2d");
  const t2dClaimIds = new Set(t2dEdges.map((e) => e.claimId));
  const t2dMapped = suggestions.filter(
    (s) => t2dClaimIds.has(s.claimId) && s.suggestedAkshNodeId && shouldApply(s),
  ).length;
  return {
    suggestions: suggestions.length,
    withAkshNodeId: withId.length,
    unmappedOrDeferred: suggestions.filter(
      (s) => s.matchKind === "none" || !s.suggestedAkshNodeId,
    ).length,
    exactClinicConcept: suggestions.filter((s) => s.matchKind === "exact_clinic_concept").length,
    pathwayTemplate: suggestions.filter((s) => s.matchKind === "pathway_template").length,
    bridgeWatch: suggestions.filter((s) => s.matchKind === "bridge_watch").length,
    t2dSeedsTotal: t2dEdges.length,
    t2dSeedsMapped: t2dMapped,
    durableAkshIds: withId.filter((s) => isDurableAkshClinicId(s.suggestedAkshNodeId)).length,
    provisionalAkshIdsRemaining: withId.filter(
      (s) => s.suggestedAkshNodeId?.startsWith("AKSH-"),
    ).length,
    provisionalMigrationEntries: Object.keys(PROVISIONAL_AKSH_TO_DURABLE).length,
    autoSurfaceCds: false,
    autoApplyToEhr: false,
    cdsRequiresApprovedEstablished: true,
    anyCdsSurfacableOnSeedEdges: false,
  };
}

/** Typed map Aksh / immunecity can import without scanning seed claims. */
export function akshNodeIdMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of AKSH_NODE_SUGGESTIONS) {
    if (s.suggestedAkshNodeId && shouldApply(s)) {
      out[s.claimId] = s.suggestedAkshNodeId;
    }
  }
  return out;
}

/** Invariant helper for consumers — map presence never implies CDS. */
export function akshMapImpliesCds(_claimId: string): false {
  return false;
}

/** Seed edges stay non-CDS after Aksh map apply (P1 invariant). */
export function assertSeedEdgesNotCdsSurfacable(
  isCdsSurfacable: (edge: (typeof HSI_T2D_IMMUNO_SEED_EDGES)[number]) => boolean,
): boolean {
  return HSI_T2D_IMMUNO_SEED_EDGES.every((e) => !isCdsSurfacable(e));
}
