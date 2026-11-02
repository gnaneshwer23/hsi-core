/**
 * Aksh ↔ HSI gateway — contracts and stubs only.
 * No PHI to research DBs (ISI autumn-snow / HSI red-wave research packs).
 * Reuses HITL map pointers + CDS/PHI boundary; does not wire live Aksh CDS.
 */
import { HSI_CDS_PHI_INVARIANTS, type HsiCdsPhiInvariants } from "./cdsPhiBoundary";
import { AKSH_HITL_MAP_SCHEMA, AKSH_HITL_STUB_SCHEMA } from "./akshHitlSchemas";

export const AKSH_HSI_GATEWAY_SCHEMA = "hsi-aksh-gateway-contract-1" as const;

export const GATEWAY_PURPOSES = [
  "hitl_map_pointer",
  "research_concept_xref",
  "synthetic_timeline_handoff",
  "trials_criterion_stub",
] as const;
export type GatewayPurpose = (typeof GATEWAY_PURPOSES)[number];

export type GatewayPlane = "aksh_clinic" | "hsi_research" | "hsi_clinical_synthetic" | "hsi_trials_stub";

export type GatewayRequestStub = {
  requestId: string;
  purpose: GatewayPurpose;
  fromPlane: GatewayPlane;
  toPlane: GatewayPlane;
  /** Concept / claim ids only — never MRN / NHS number / free-text notes with PHI. */
  payloadKeys: string[];
  syntheticOnly: boolean;
  containsPhi: boolean;
};

export type GatewayDecision =
  | { allow: true; reason: string }
  | { allow: false; reason: GatewayDenyReason };

export type GatewayDenyReason =
  | "phi_to_research_db"
  | "live_emis"
  | "cds_surface"
  | "ehr_write_back"
  | "unknown_purpose"
  | "cross_plane_forbidden"
  | "missing_synthetic_flag";

export type AkshHsiGatewayContract = {
  schemaVersion: typeof AKSH_HSI_GATEWAY_SCHEMA;
  product: "Aksh↔HSI gateway";
  maturity: "in_development";
  invariants: HsiCdsPhiInvariants;
  allowedPurposes: readonly GatewayPurpose[];
  /** Research DB targets that must never receive PHI. */
  researchDbTargets: readonly string[];
  akshHitlMapSchema: typeof AKSH_HITL_MAP_SCHEMA;
  akshHitlStubSchema: typeof AKSH_HITL_STUB_SCHEMA;
  honesty: string[];
};

export const RESEARCH_DB_TARGETS = [
  "isi_neon_autumn_snow",
  "hsi_neon_red_wave_research_packs",
  "isi_kg_json",
  "hsi_discovery_exports",
] as const;

export function gatewayContract(): AkshHsiGatewayContract {
  return {
    schemaVersion: AKSH_HSI_GATEWAY_SCHEMA,
    product: "Aksh↔HSI gateway",
    maturity: "in_development",
    invariants: { ...HSI_CDS_PHI_INVARIANTS },
    allowedPurposes: GATEWAY_PURPOSES,
    researchDbTargets: RESEARCH_DB_TARGETS,
    akshHitlMapSchema: AKSH_HITL_MAP_SCHEMA,
    akshHitlStubSchema: AKSH_HITL_STUB_SCHEMA,
    honesty: [
      "Gateway stubs only — no live Aksh CDS engines in hsi-core.",
      "PHI must never cross into research DB targets (ISI / HSI packs).",
      "HITL map pointers are read-only; cdsSurfacable stays Aksh-side under HITL.",
      "Synthetic timeline / trials stubs may cross as syntheticOnly payloads.",
      "liveEmis=false · ehrWriteBack=false · phiToLlm=false.",
    ],
  };
}

const RESEARCH_PLANES: GatewayPlane[] = ["hsi_research"];

/**
 * Policy decision for a gateway request stub.
 * Fail closed on PHI → research, live EMIS, CDS surface, EHR write-back.
 */
export function decideGatewayRequest(req: GatewayRequestStub): GatewayDecision {
  if (!GATEWAY_PURPOSES.includes(req.purpose)) {
    return { allow: false, reason: "unknown_purpose" };
  }
  if (req.containsPhi && RESEARCH_PLANES.includes(req.toPlane)) {
    return { allow: false, reason: "phi_to_research_db" };
  }
  if (req.containsPhi && req.toPlane === "hsi_trials_stub") {
    return { allow: false, reason: "phi_to_research_db" };
  }
  if (
    req.fromPlane === "aksh_clinic" &&
    RESEARCH_PLANES.includes(req.toPlane) &&
    !req.syntheticOnly
  ) {
    return { allow: false, reason: "missing_synthetic_flag" };
  }
  // Allowed stub paths
  if (req.purpose === "hitl_map_pointer" && req.toPlane === "aksh_clinic" && !req.containsPhi) {
    return { allow: true, reason: "HITL map pointer into Aksh display (not CDS)." };
  }
  if (req.purpose === "research_concept_xref" && req.syntheticOnly && !req.containsPhi) {
    return { allow: true, reason: "Synthetic concept xref without PHI." };
  }
  if (
    req.purpose === "synthetic_timeline_handoff" &&
    req.syntheticOnly &&
    !req.containsPhi &&
    req.toPlane === "hsi_clinical_synthetic"
  ) {
    return { allow: true, reason: "Synthetic clinical timeline handoff." };
  }
  if (
    req.purpose === "trials_criterion_stub" &&
    req.syntheticOnly &&
    !req.containsPhi &&
    req.toPlane === "hsi_trials_stub"
  ) {
    return { allow: true, reason: "Synthetic trials criterion stub." };
  }
  return { allow: false, reason: "cross_plane_forbidden" };
}

export type GatewayAuditEvent = {
  requestId: string;
  purpose: GatewayPurpose;
  allow: boolean;
  reason: string;
  containsPhi: false | true;
  researchDbWrite: false;
  timestamp: string;
};

/** Build an audit stub — researchDbWrite always false in this MVP. */
export function gatewayAuditEvent(
  req: GatewayRequestStub,
  decision: GatewayDecision,
  now?: Date,
): GatewayAuditEvent {
  return {
    requestId: req.requestId,
    purpose: req.purpose,
    allow: decision.allow,
    reason: decision.allow ? decision.reason : decision.reason,
    containsPhi: req.containsPhi,
    researchDbWrite: false,
    timestamp: (now ?? new Date()).toISOString(),
  };
}
