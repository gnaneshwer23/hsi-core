/**
 * Additive mapping from CURSOR_INTEGRATION_AND_AI_PLAN / hsi-synthetic-v3
 * fixture contracts onto existing hsi-core surfaces.
 *
 * Reference-only: does NOT replace HSI services, Neon stores, auth, or UI.
 * Does NOT absorb the full JSONL/SQLite pack into git or activate live CDS/EHR.
 */
import {HSI_CDS_PHI_INVARIANTS, type HsiCdsPhiInvariants} from "../cdsPhiBoundary";

export const CURSOR_V3_CONTRACT_MAP_SCHEMA = "hsi-cursor-synthetic-v3-contract-map-1" as const;
export const CURSOR_V3_PLAN_ID = "CURSOR_INTEGRATION_AND_AI_PLAN.md" as const;
export const CURSOR_V3_NAMESPACE = "SYNTHETIC/HSI/v2" as const;

export type CursorPlanCapability =
  | "synthetic_jsonl_ingestion"
  | "typed_observation_claim_hypothesis"
  | "timeline_query"
  | "evidence_query"
  | "trial_screening"
  | "review_adjudication"
  | "permission_withdrawal"
  | "learning_registry"
  | "frontend_state_machine"
  | "http_synthetic_api";

export type HsiEquivalentSurface =
  | "researchContracts"
  | "clinicalSyntheticTimeline"
  | "syntheticValidationDataset"
  | "syntheticE2eN4Adapter"
  | "syntheticE2eN5Adapter"
  | "scientificEvaluation"
  | "investigationService"
  | "investigationDelivery"
  | "clinicalResearchScaffold"
  | "researchWorkspaceTestFixture"
  | "cdsPhiBoundary"
  | "none_additive_only";

export type CursorCapabilityMapping = {
  capability: CursorPlanCapability;
  cursorArtefact: string;
  hsiEquivalent: HsiEquivalentSurface;
  status: "already_present" | "mapped_additive" | "deferred_future";
  replacesHsiServices: false;
  patientDataIsolation: true;
  autoGraphPromotion: false;
  liveCdsOrEhr: false;
  note: string;
};

export type CursorSyntheticV3ContractMap = {
  schemaVersion: typeof CURSOR_V3_CONTRACT_MAP_SCHEMA;
  planId: typeof CURSOR_V3_PLAN_ID;
  planReferencePaths: string[];
  namespace: typeof CURSOR_V3_NAMESPACE;
  syntheticOnly: true;
  containsPhi: false;
  replacesHsiServices: false;
  neonProjectRequired: "red-wave-06625195";
  autumnSnowForbidden: true;
  gateCAutoApprove: false;
  legalBinding: false;
  inventMou: false;
  cdsPhi: HsiCdsPhiInvariants;
  recordKindBoundaries: {
    observation: "distinct_from_claim";
    claim: "distinct_from_hypothesis";
    hypothesis: "unproven_until_review";
    modelInference: "never_silent_patient_fact";
  };
  licensingQuarantine: {
    importQuarantineJsonlToCanonical: false;
    approvedCorpusRequiresHumanReview: true;
    syntheticMayEnterApprovedCorpus: false;
  };
  releaseAwareRetrieval: {
    requireReleaseManifest: true;
    draftNotGold: true;
  };
  mappings: CursorCapabilityMapping[];
  honestyBanners: string[];
};

export function buildCursorSyntheticV3ContractMap(): CursorSyntheticV3ContractMap {
  const mappings: CursorCapabilityMapping[] = [
    {
      capability: "synthetic_jsonl_ingestion",
      cursorArtefact: "core.adapt / data/*.jsonl",
      hsiEquivalent: "syntheticValidationDataset",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "HSI keeps pinned validation + e2e fixtures; full v3 JSONL stays external reference.",
    },
    {
      capability: "typed_observation_claim_hypothesis",
      cursorArtefact: "schema_contract.json discriminated kinds",
      hsiEquivalent: "researchContracts",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "researchContracts already fail-closed on synthetic promotion and mixed data classes.",
    },
    {
      capability: "timeline_query",
      cursorArtefact: "core.timeline / POST /v2/synthetic/timelines/query",
      hsiEquivalent: "clinicalSyntheticTimeline",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Synthetic timeline fixtures + FHIR notes only; no live EMIS/EHR.",
    },
    {
      capability: "evidence_query",
      cursorArtefact: "core.evidence / evidence_context_graph",
      hsiEquivalent: "syntheticE2eN4Adapter",
      status: "mapped_additive",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "N4 adapter maps support/oppose/context-mismatch slices into grounded briefs.",
    },
    {
      capability: "trial_screening",
      cursorArtefact: "core.screen / trial_screening",
      hsiEquivalent: "clinicalResearchScaffold",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Scaffold + N5 path remain candidate-for-review only; confirmedEligible forced false.",
    },
    {
      capability: "review_adjudication",
      cursorArtefact: "learning.adjudicate / pending_adjudication",
      hsiEquivalent: "investigationDelivery",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Independent brief review is human-gated; no automatic training promotion.",
    },
    {
      capability: "permission_withdrawal",
      cursorArtefact: "outputs/withdrawal.json",
      hsiEquivalent: "cdsPhiBoundary",
      status: "mapped_additive",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "HSI encodes fail-closed PHI/CDS refusal; distributed revocation remains future ops.",
    },
    {
      capability: "learning_registry",
      cursorArtefact: "outputs/learning/* model registry",
      hsiEquivalent: "scientificEvaluation",
      status: "already_present",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Phase E + gold suite register baselines; candidate activation stays false.",
    },
    {
      capability: "frontend_state_machine",
      cursorArtefact: "Required UI states table",
      hsiEquivalent: "researchWorkspaceTestFixture",
      status: "mapped_additive",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Research mechanism workflow UI consumes real /api/research/* responses with honesty banners.",
    },
    {
      capability: "http_synthetic_api",
      cursorArtefact: "POST /v2/synthetic/*",
      hsiEquivalent: "none_additive_only",
      status: "deferred_future",
      replacesHsiServices: false,
      patientDataIsolation: true,
      autoGraphPromotion: false,
      liveCdsOrEhr: false,
      note: "Explicitly deferred: no parallel synthetic HTTP server that bypasses HSI auth.",
    },
  ];

  return {
    schemaVersion: CURSOR_V3_CONTRACT_MAP_SCHEMA,
    planId: CURSOR_V3_PLAN_ID,
    planReferencePaths: [
      "/Users/gnaneshwerjadav/Downloads/CURSOR_INTEGRATION_AND_AI_PLAN.md",
      "/Users/gnaneshwerjadav/Downloads/hsi-synthetic-v3/CURSOR_INTEGRATION_AND_AI_PLAN.md",
    ],
    namespace: CURSOR_V3_NAMESPACE,
    syntheticOnly: true,
    containsPhi: false,
    replacesHsiServices: false,
    neonProjectRequired: "red-wave-06625195",
    autumnSnowForbidden: true,
    gateCAutoApprove: false,
    legalBinding: false,
    inventMou: false,
    cdsPhi: HSI_CDS_PHI_INVARIANTS,
    recordKindBoundaries: {
      observation: "distinct_from_claim",
      claim: "distinct_from_hypothesis",
      hypothesis: "unproven_until_review",
      modelInference: "never_silent_patient_fact",
    },
    licensingQuarantine: {
      importQuarantineJsonlToCanonical: false,
      approvedCorpusRequiresHumanReview: true,
      syntheticMayEnterApprovedCorpus: false,
    },
    releaseAwareRetrieval: {
      requireReleaseManifest: true,
      draftNotGold: true,
    },
    mappings,
    honestyBanners: [
      "CURSOR plan is a fixture reference — not a replacement for HSI services.",
      "Synthetic ≠ clinical ≠ eligible.",
      "No Gate C auto-approve · no invented MoU · no live CDS/EHR · no autumn-snow for HSI.",
    ],
  };
}

export function parseCursorSyntheticV3ContractMap(value: unknown): CursorSyntheticV3ContractMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid cursor synthetic v3 contract map");
  }
  const map = value as CursorSyntheticV3ContractMap;
  if (
    map.schemaVersion !== CURSOR_V3_CONTRACT_MAP_SCHEMA ||
    map.replacesHsiServices !== false ||
    map.syntheticOnly !== true ||
    map.containsPhi !== false ||
    map.autumnSnowForbidden !== true ||
    map.gateCAutoApprove !== false ||
    map.legalBinding !== false ||
    map.inventMou !== false ||
    map.licensingQuarantine.syntheticMayEnterApprovedCorpus !== false ||
    !Array.isArray(map.mappings) ||
    map.mappings.some(
      (m) =>
        m.replacesHsiServices !== false ||
        m.autoGraphPromotion !== false ||
        m.liveCdsOrEhr !== false ||
        m.patientDataIsolation !== true,
    )
  ) {
    throw new Error("Cursor contract map honesty gates violated");
  }
  return map;
}
