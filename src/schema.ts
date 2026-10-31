/**
 * HSI Phase 0 — edge / claim schema + claim → marker → observation → action skeleton.
 * No auto write-back. No PHI. Aksh consumes for HITL CDS cards; ISI for graded discovery edges.
 */
import type { HsiCurationReview, HsiGrade, HsiTeachingStatus } from "./grades";

/** Canonical edge predicates for the shared substrate (extensible; keep snake_case). */
export const HSI_EDGE_TYPES = [
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
