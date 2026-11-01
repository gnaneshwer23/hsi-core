/**
 * HSI Phase 0 — edge / claim schema + claim → marker → observation → action skeleton.
 * No auto write-back. No PHI. Aksh consumes for HITL CDS cards; ISI for graded discovery edges.
 */
import type { HsiCurationReview, HsiGrade, HsiTeachingStatus } from "./grades";

/**
 * Canonical edge predicates for the shared substrate (extensible; keep snake_case).
 *
 * Phase 0 core types stay stable for RA/TNF seeds. P1.4 adds selected systems /
 * ISI predicates as first-class labels (additive — do not rewrite RA edgeTypes).
 * Non-promoted systems/ISI predicates still alias via SYSTEMS_PREDICATE_TO_HSI_EDGE
 * / ISI_RELATIONSHIP_TO_HSI_EDGE.
 */
export const HSI_EDGE_TYPES = [
  // ── Phase 0 core (RA / immuno-metabolic / biomarker) ─────────────────────
  "associated_with",
  "contributes_to",
  "drives",
  "inhibits",
  "upregulates",
  "downregulates",
  "biomarker_of",
  "risk_factor_for",
  "treats",
  "worsens",
  "bridges_domain",
  // ── P1.4 systems (gut / neuro) — were alias-only; now first-class ────────
  /** Gut–immune modulation (Clostridia/SCFA ↔ mucosal Treg neighbourhood). */
  "modulates_immune",
  /** Metabolite production / sensing hop (e.g. butyrate → colonic Treg). */
  "produces_metabolite_sensed_by",
  /** Cholinergic / vagal brake on peripheral inflammatory tone. */
  "suppresses_peripheral_inflammation",
  /** Cross-axis neural↔immune signalling frame (inflammatory reflex). */
  "signals_via_axis",
  /** Neuroimmune association without stronger causal claim. */
  "associates_neuroimmune",
  // ── P1.4 ISI controlled relations — selected cell-spine predicates ───────
  /** Cell / cytokine production (e.g. Tfh → IL-21). */
  "produces",
  /** Activation / induction without overclaiming causation. */
  "activates",
  /** Suppression distinct from generic inhibits (cell–cell / pathway). */
  "suppresses",
  /** Lineage / state transition (e.g. naive B → plasmablast context). */
  "differentiates_into",
] as const;

/**
 * Systems cross-axis predicates promoted onto HSI_EDGE_TYPES in P1.4.
 * Identity-mapped in SYSTEMS_PREDICATE_TO_HSI_EDGE; remaining systems preds stay aliased.
 */
export const HSI_PROMOTED_SYSTEMS_PREDICATES = [
  "modulates_immune",
  "produces_metabolite_sensed_by",
  "suppresses_peripheral_inflammation",
  "signals_via_axis",
  "associates_neuroimmune",
] as const;

/**
 * ISI controlled relationship types promoted onto HSI_EDGE_TYPES in P1.4.
 * Identity-mapped in ISI_RELATIONSHIP_TO_HSI_EDGE; remaining ISI preds stay aliased.
 */
export const HSI_PROMOTED_ISI_RELATIONSHIPS = [
  "produces",
  "activates",
  "suppresses",
  "differentiates_into",
] as const;

export type HsiEdgeType = (typeof HSI_EDGE_TYPES)[number];

export const HSI_DOMAINS = [
  "t2d",
  "immuno_metabolic",
  "autoimmunity",
  "io",
  "general",
] as const;
export type HsiDomain = (typeof HSI_DOMAINS)[number];

/** Provenance stub — never invent PMIDs; leave null when unknown. */
export interface HsiProvenance {
  pmid: string | null;
  doi: string | null;
  citationLabel: string | null;
  sourceUrl: string | null;
  /** Free-text note for curators; not patient data. */
  notes: string | null;
  recordedAt: string;
}

export interface HsiClaim {
  id: string;
  assertion: string;
  domain: HsiDomain;
  /** Optional link into ISI relationship id (REL-…) when mapped. */
  isiRelationshipId: string | null;
  /** Optional Aksh clinical rule / KG node id when mapped. */
  akshNodeId: string | null;
}

/** LOINC-friendly marker fields for bench↔bedside translation. */
export interface HsiMarker {
  id: string;
  name: string;
  /** LOINC code when known; null until curated. */
  loinc: string | null;
  unit: string | null;
  /** Short biology / clinical meaning. */
  description: string;
}

/** De-identified observation shape — never store PHI here. */
export interface HsiPatientObservationStub {
  id: string;
  markerId: string;
  /** Synthetic / de-id value only in fixtures. */
  value: string | number | null;
  unit: string | null;
  /** ISO date or relative window label (e.g. "visit", "90d"). */
  observedAt: string | null;
  /** Explicit: fixture | deid_aggregate | unknown — never raw PHI. */
  dataClass: "fixture" | "deid_aggregate" | "unknown";
}

/**
 * Recommended clinician action card — HITL only.
 * Aksh may render; never auto-apply to EHR.
 */
export interface HsiActionStub {
  id: string;
  label: string;
  /** Why this action is suggested from the claim/marker. */
  rationale: string;
  requiresHitl: true;
  /** CDS-safe only when hsiGrade === established AND curation approved (enforced by helpers). */
  cdsEligibleHint: boolean;
}

/** Shared directed edge with dual grade axes. */
export interface HsiEdge {
  id: string;
  edgeType: HsiEdgeType;
  subjectId: string;
  subjectLabel: string;
  objectId: string;
  objectLabel: string;
  claimId: string;
  curationReview: HsiCurationReview;
  hsiGrade: HsiGrade;
  teachingStatus: HsiTeachingStatus;
  domain: HsiDomain;
  provenance: HsiProvenance;
  /** Bridge shortlist flag for P1 immuno-metabolic ↔ T2D work. */
  bridgeCandidate: boolean;
  /** Placeholder seed vs production-mapped. */
  seedKind: "placeholder" | "mapped";
}

/** Full translation triple used by both products. */
export interface HsiTranslationCard {
  id: string;
  claim: HsiClaim;
  edge: HsiEdge;
  marker: HsiMarker;
  observation: HsiPatientObservationStub;
  action: HsiActionStub;
}

export function isHsiEdgeType(v: unknown): v is HsiEdgeType {
  return typeof v === "string" && (HSI_EDGE_TYPES as readonly string[]).includes(v);
}

export function isHsiDomain(v: unknown): v is HsiDomain {
  return typeof v === "string" && (HSI_DOMAINS as readonly string[]).includes(v);
}
