/**
 * Milestone 15 / PR4 — Cross-Scale Ontology and Model Linkage.
 *
 * Extends M15 HDI / CBC / LDSM (+ optional M12/M13 id refs) with research
 * envelopes for cross-scale entity mapping, biological context annotation,
 * evidence provenance, temporal context, model linkage, relationship
 * uncertainty, and versioned ontology mappings — contracts only.
 *
 * Scientific rule (fail-closed):
 * - Molecular pathway association must NOT automatically imply organ-level
 *   causal effect.
 * - Simulation / model components may connect across scales only when a
 *   validated coupling relationship is recorded.
 * - Unsupported / uncertain couplings are preserved explicitly — never
 *   invented as validated support.
 *
 * Binding honesty:
 * - Research decision support only; fixtures until authorised.
 * - No live M11 multiscale engine; no twin product; no invented parameters.
 * - No PHI/CDS, Gate C / MoU, workbench UI, Neon migration.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const CROSS_SCALE_ONTOLOGY_SCHEMA =
  "hsi-cross-scale-ontology-1" as const;
export const CROSS_SCALE_ONTOLOGY_METHOD =
  "hsi.cross_scale_ontology.v1" as const;
export const CROSS_SCALE_ONTOLOGY_VERSION = "0.1.0" as const;

export const CSOL_BIOLOGICAL_SCALES = [
  "molecular",
  "cellular",
  "tissue",
  "organ",
  "organ_system",
  "clinical_phenotype",
  "longitudinal_outcome",
] as const;
export type CsolBiologicalScale = (typeof CSOL_BIOLOGICAL_SCALES)[number];

export const CSOL_CAPABILITY_KINDS = [
  "cross_scale_entity_mapping",
  "biological_context_annotation",
  "evidence_provenance",
  "temporal_context",
  "model_linkage",
  "relationship_uncertainty",
  "versioned_ontology_mapping",
] as const;
export type CsolCapabilityKind = (typeof CSOL_CAPABILITY_KINDS)[number];

export const CSOL_MAPPING_OUTCOMES = [
  "supported",
  "unsupported",
  "uncertain",
] as const;
export type CsolMappingOutcome = (typeof CSOL_MAPPING_OUTCOMES)[number];

export const CSOL_COUPLING_STATUSES = [
  "validated_coupling",
  "unsupported_coupling",
  "uncertain_coupling",
  "association_only_not_causal",
  "blocked_no_validated_coupling",
] as const;
export type CsolCouplingStatus = (typeof CSOL_COUPLING_STATUSES)[number];

export const CSOL_RELATIONSHIP_UNCERTAINTY_ORDINALS = [
  "not_assessed",
  "low_declared",
  "moderate_declared",
  "high_declared",
  "insufficient",
  "blocked",
] as const;
export type CsolRelationshipUncertaintyOrdinal =
  (typeof CSOL_RELATIONSHIP_UNCERTAINTY_ORDINALS)[number];

export const CSOL_CAUSAL_CLAIM_KINDS = [
  "no_causal_claim",
  "association_only",
  "validated_coupling_declared",
  "causal_effect_forbidden_without_validated_coupling",
] as const;
export type CsolCausalClaimKind = (typeof CSOL_CAUSAL_CLAIM_KINDS)[number];

export const CSOL_TEMPORAL_CONTEXT_KINDS = [
  "cross_sectional_declared",
  "longitudinal_declared",
  "snapshot_at_time",
  "interval_declared",
  "temporal_context_unknown",
] as const;
export type CsolTemporalContextKind =
  (typeof CSOL_TEMPORAL_CONTEXT_KINDS)[number];

export const CSOL_PROVENANCE_KINDS = [
  "fixture_declared",
  "literature_ref_declared",
  "curated_kg_ref_declared",
  "ontology_registry_ref",
  "explicitly_unresolved",
] as const;
export type CsolProvenanceKind = (typeof CSOL_PROVENANCE_KINDS)[number];

export const CSOL_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_unvalidated_cross_scale_coupling",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type CsolLifecycle = (typeof CSOL_LIFECYCLES)[number];

export const CSOL_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type CsolDatasetAvailability =
  (typeof CSOL_DATASET_AVAILABILITY)[number];

export const CSOL_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type CsolAccessClassification =
  (typeof CSOL_ACCESS_CLASSIFICATIONS)[number];

export const CSOL_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CsolActorKind = (typeof CSOL_ACTOR_KINDS)[number];

export const CSOL_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type CsolDataBasis = (typeof CSOL_DATA_BASES)[number];

const SPEC_ID_RE = /^hsi-csol-spec-[a-z0-9-]{3,80}$/;
const ENT_ID_RE = /^hsi-csol-ent-[a-z0-9-]{3,80}$/;
const MAP_ID_RE = /^hsi-csol-map-[a-z0-9-]{3,80}$/;
const CTX_ID_RE = /^hsi-csol-ctx-[a-z0-9-]{3,80}$/;
const PRV_ID_RE = /^hsi-csol-prv-[a-z0-9-]{3,80}$/;
const TMP_ID_RE = /^hsi-csol-tmp-[a-z0-9-]{3,80}$/;
const LNK_ID_RE = /^hsi-csol-lnk-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-csol-unc-[a-z0-9-]{3,80}$/;
const ONT_ID_RE = /^hsi-csol-ont-[a-z0-9-]{3,80}$/;
const BND_ID_RE = /^hsi-csol-bnd-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const LDSM_SPEC_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const LDSM_MDL_RE = /^hsi-ldsm-mdl-[a-z0-9-]{3,80}$/;
const TD_ID_RE = /^hsi-td-[a-z0-9-]{3,80}$/;
const THER_ID_RE = /^hsi-ther-[a-z0-9-]{3,80}$/;

/** Ordinal index for scale distance / organ-implication checks. */
const SCALE_ORDINAL: Record<CsolBiologicalScale, number> = {
  molecular: 0,
  cellular: 1,
  tissue: 2,
  organ: 3,
  organ_system: 4,
  clinical_phenotype: 5,
  longitudinal_outcome: 6,
};

export type CrossScaleOntologyHonesty = {
  researchDecisionSupportOnly: true;
  molecularAssociationIsNotOrganCausalEffect: true;
  crossScaleModelLinkageRequiresValidatedCoupling: true;
  unsupportedCouplingsMustBeRecordedExplicitly: true;
  noInventedSimulationParameters: true;
  noLiveMultiscaleEngineClaim: true;
  noPhiIngestion: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noWorkbenchUi: true;
  notClinicalCare: true;
  notDigitalTwinProduct: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type CsolActor = {
  principalId: string;
  actorKind: CsolActorKind;
};

export type CrossScaleOntologySpec = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds: readonly CsolCapabilityKind[];
  diseaseContextId: string;
  integratedDiseaseContextId: string | null;
  longitudinalModellingSpecId: string | null;
  translationalProgrammeId: string | null;
  therapeuticProgrammeId: string | null;
  datasetAvailability: CsolDatasetAvailability;
  accessClassification: CsolAccessClassification;
  containsIdentifiablePhi: false;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  lifecycle: CsolLifecycle;
  reviewedBy: CsolActor | null;
  authoredBy: CsolActor;
  dataBasis: CsolDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleEntityRef = {
  id: string;
  label: string;
  scale: CsolBiologicalScale;
  ontologySystem: string | null;
  ontologyValue: string | null;
  note: string;
};

export type CrossScaleEntityMapping = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  sourceEntity: CrossScaleEntityRef;
  targetEntity: CrossScaleEntityRef;
  mappingOutcome: CsolMappingOutcome;
  couplingStatus: CsolCouplingStatus;
  causalClaimKind: CsolCausalClaimKind;
  molecularPathwayAssociationImpliesOrganCausalEffect: false;
  relationshipSummary: string;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiologicalContextAnnotation = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  entityId: string;
  scale: CsolBiologicalScale;
  contextSummary: string;
  speciesOrModelSystem: string | null;
  tissueOrCompartment: string | null;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleEvidenceProvenance = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  subjectRecordId: string;
  provenanceKind: CsolProvenanceKind;
  sourceRef: string;
  evidenceSummary: string;
  inventedEvidence: null;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleTemporalContext = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  subjectRecordId: string;
  temporalContextKind: CsolTemporalContextKind;
  startTime: string | null;
  endTime: string | null;
  snapshotTime: string | null;
  temporalSummary: string;
  fabricatedTimeline: null;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleModelLinkage = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  sourceScale: CsolBiologicalScale;
  targetScale: CsolBiologicalScale;
  sourceModelRef: string;
  targetModelRef: string;
  entityMappingId: string;
  couplingStatus: CsolCouplingStatus;
  linkageAllowed: boolean;
  inventedParameters: null;
  liveMultiscaleEngineOperational: false;
  linkageSummary: string;
  limitations: readonly string[];
  longitudinalDiseaseStateModelId: string | null;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleRelationshipUncertainty = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  subjectRecordId: string;
  uncertaintyOrdinal: CsolRelationshipUncertaintyOrdinal;
  uncertaintySummary: string;
  unsupportedCouplingRecorded: boolean;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type VersionedOntologyMapping = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  ontologySpecId: string;
  diseaseContextId: string;
  fromSystem: string;
  fromValue: string;
  toSystem: string;
  toValue: string;
  relation: "exact" | "broad" | "narrow" | "related" | "unreviewed";
  mappingVersion: string;
  reviewDecisionId: string | null;
  mappingOutcome: CsolMappingOutcome;
  sourceRef: string;
  authoredBy: CsolActor;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleLinkageBundle = {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  ontologySpecId: string;
  entityMappingIds: readonly string[];
  biologicalContextAnnotationIds: readonly string[];
  evidenceProvenanceIds: readonly string[];
  temporalContextIds: readonly string[];
  modelLinkageIds: readonly string[];
  relationshipUncertaintyIds: readonly string[];
  versionedOntologyMappingIds: readonly string[];
  unsupportedCouplingIds: readonly string[];
  bundleVersion: string;
  limitations: readonly string[];
  datasetAvailability: CsolDatasetAvailability;
  liveMultiscaleEngineOperational: false;
  notDigitalTwinProduct: true;
  graphPromotable: false;
  lifecycle: CsolLifecycle;
  reviewedBy: CsolActor | null;
  authoredBy: CsolActor;
  dataBasis: CsolDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleOntologyHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleOntologyStore = {
  upsertSpec(record: CrossScaleOntologySpec): CrossScaleOntologySpec;
  getSpec(id: string): CrossScaleOntologySpec | null;
  listSpecs(diseaseContextId?: string): readonly CrossScaleOntologySpec[];
  upsertEntityMapping(
    record: CrossScaleEntityMapping,
  ): CrossScaleEntityMapping;
  getEntityMapping(id: string): CrossScaleEntityMapping | null;
  listEntityMappings(
    diseaseContextId?: string,
  ): readonly CrossScaleEntityMapping[];
  upsertBiologicalContext(
    record: BiologicalContextAnnotation,
  ): BiologicalContextAnnotation;
  getBiologicalContext(id: string): BiologicalContextAnnotation | null;
  listBiologicalContexts(
    diseaseContextId?: string,
  ): readonly BiologicalContextAnnotation[];
  upsertEvidenceProvenance(
    record: CrossScaleEvidenceProvenance,
  ): CrossScaleEvidenceProvenance;
  getEvidenceProvenance(id: string): CrossScaleEvidenceProvenance | null;
  listEvidenceProvenance(
    diseaseContextId?: string,
  ): readonly CrossScaleEvidenceProvenance[];
  upsertTemporalContext(
    record: CrossScaleTemporalContext,
  ): CrossScaleTemporalContext;
  getTemporalContext(id: string): CrossScaleTemporalContext | null;
  listTemporalContexts(
    diseaseContextId?: string,
  ): readonly CrossScaleTemporalContext[];
  upsertModelLinkage(record: CrossScaleModelLinkage): CrossScaleModelLinkage;
  getModelLinkage(id: string): CrossScaleModelLinkage | null;
  listModelLinkages(
    diseaseContextId?: string,
  ): readonly CrossScaleModelLinkage[];
  upsertRelationshipUncertainty(
    record: CrossScaleRelationshipUncertainty,
  ): CrossScaleRelationshipUncertainty;
  getRelationshipUncertainty(
    id: string,
  ): CrossScaleRelationshipUncertainty | null;
  listRelationshipUncertainties(
    diseaseContextId?: string,
  ): readonly CrossScaleRelationshipUncertainty[];
  upsertVersionedOntologyMapping(
    record: VersionedOntologyMapping,
  ): VersionedOntologyMapping;
  getVersionedOntologyMapping(id: string): VersionedOntologyMapping | null;
  listVersionedOntologyMappings(
    diseaseContextId?: string,
  ): readonly VersionedOntologyMapping[];
  upsertBundle(record: CrossScaleLinkageBundle): CrossScaleLinkageBundle;
  getBundle(id: string): CrossScaleLinkageBundle | null;
  listBundles(diseaseContextId?: string): readonly CrossScaleLinkageBundle[];
};

const DEFAULT_HONESTY: CrossScaleOntologyHonesty = {
  researchDecisionSupportOnly: true,
  molecularAssociationIsNotOrganCausalEffect: true,
  crossScaleModelLinkageRequiresValidatedCoupling: true,
  unsupportedCouplingsMustBeRecordedExplicitly: true,
  noInventedSimulationParameters: true,
  noLiveMultiscaleEngineClaim: true,
  noPhiIngestion: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noWorkbenchUi: true,
  notClinicalCare: true,
  notDigitalTwinProduct: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const SPEC_TRANSITIONS: Record<CsolLifecycle, readonly CsolLifecycle[]> = {
  draft: [
    "under_review",
    "blocked_unvalidated_cross_scale_coupling",
    "blocked_awaiting_authorised_dataset",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_unvalidated_cross_scale_coupling",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_unvalidated_cross_scale_coupling: ["draft", "rejected"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  rejected: [],
  superseded: [],
};

const BUNDLE_TRANSITIONS = SPEC_TRANSITIONS;

function isIsoTimestamp(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function textOk(value: string, max: number): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= max;
}

function assertClosed<T extends string>(
  value: T,
  allowed: readonly T[],
  label: string,
): void {
  if (!allowed.includes(value)) throw Error(`Invalid ${label}`);
}

function assertHonesty(honesty: CrossScaleOntologyHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.molecularAssociationIsNotOrganCausalEffect !== true) {
    throw Error(
      "Molecular pathway association must not imply organ-level causal effect",
    );
  }
  if (honesty.crossScaleModelLinkageRequiresValidatedCoupling !== true) {
    throw Error(
      "Cross-scale model linkage requires validated coupling",
    );
  }
  if (honesty.unsupportedCouplingsMustBeRecordedExplicitly !== true) {
    throw Error("Unsupported couplings must be recorded explicitly");
  }
  if (honesty.noInventedSimulationParameters !== true) {
    throw Error("Invented simulation parameters forbidden");
  }
  if (honesty.noLiveMultiscaleEngineClaim !== true) {
    throw Error("Live multiscale engine claim forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR4");
  }
  if (honesty.notClinicalCare !== true) throw Error("Not clinical care");
  if (honesty.notDigitalTwinProduct !== true) {
    throw Error("Not a digital twin product");
  }
  if (honesty.agentsDraftHumansReview !== true) {
    throw Error("Agents draft; humans review");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve forbidden");
  }
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false in PR4");
  }
  if (honesty.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  if (honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (honesty.migration !== "deferred") {
    throw Error("Migration must stay deferred");
  }
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|treatment\s+directive|organ[- ]level\s+causal\s+effect|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|invented\s+(?:parameter|parameters)|clinical\s+care)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|clinical\s+care))*/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\btreatment\s+directive\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bdigital\s+twin\s+product\b/.test(lower) ||
    /\binvented\s+parameters?\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim live twin/multiscale, invent parameters/counts, or include identifiers`,
    );
  }
}

function assertActor(actor: CsolActor, label: string): CsolActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, CSOL_ACTOR_KINDS, `${label} actorKind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertOptionalId(
  value: string | null | undefined,
  re: RegExp,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  if (!re.test(value)) throw Error(`Invalid ${label}`);
  return value;
}

function assertLimitations(limitations: readonly string[]): readonly string[] {
  if (limitations.length === 0) throw Error("limitations required");
  if (limitations.length > 16) throw Error("Too many limitations");
  return limitations.map((item, index) => {
    if (!textOk(item, 1000)) throw Error(`Invalid limitation[${index}]`);
    assertNoForbiddenClaimLanguage(item, `limitation[${index}]`);
    return item.trim();
  });
}

function assertIdList(
  values: readonly string[],
  re: RegExp,
  label: string,
  maxItems: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    return v;
  });
}

function dataBasisForAvailability(
  availability: CsolDatasetAvailability,
): CsolDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  if (availability === "fixture_only") return "fixture_engineering";
  return "fixture_engineering";
}

const ONTOLOGY_TOKEN_RE = /^[a-zA-Z0-9_.:@/-]{2,160}$/;

function assertOntologyToken(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 120 || !ONTOLOGY_TOKEN_RE.test(trimmed)) {
    throw Error(`Invalid ${label}`);
  }
  return trimmed;
}

/**
 * True when source scale is molecular (or cellular) and target reaches organ
 * or higher — the scientific rule that association alone must not imply organ
 * causal effect.
 */
export function crossesToOrganOrHigher(
  source: CsolBiologicalScale,
  target: CsolBiologicalScale,
): boolean {
  assertClosed(source, CSOL_BIOLOGICAL_SCALES, "source scale");
  assertClosed(target, CSOL_BIOLOGICAL_SCALES, "target scale");
  return (
    SCALE_ORDINAL[source] <= SCALE_ORDINAL.cellular &&
    SCALE_ORDINAL[target] >= SCALE_ORDINAL.organ
  );
}

export function isValidatedCouplingStatus(
  status: CsolCouplingStatus,
): boolean {
  return status === "validated_coupling";
}

function assertEntityRef(entity: CrossScaleEntityRef): CrossScaleEntityRef {
  if (!ENT_ID_RE.test(entity.id)) throw Error("Invalid entity id");
  if (!textOk(entity.label, 200)) throw Error("Invalid entity label");
  assertNoForbiddenClaimLanguage(entity.label, "entity label");
  assertClosed(entity.scale, CSOL_BIOLOGICAL_SCALES, "entity scale");
  const ontologySystem =
    entity.ontologySystem === null || entity.ontologySystem === undefined
      ? null
      : assertOntologyToken(entity.ontologySystem, "ontologySystem");
  const ontologyValue =
    entity.ontologyValue === null || entity.ontologyValue === undefined
      ? null
      : assertOntologyToken(entity.ontologyValue, "ontologyValue");
  if (
    (ontologySystem === null) !== (ontologyValue === null)
  ) {
    throw Error("ontologySystem and ontologyValue must both be set or both null");
  }
  const note = (entity.note ?? "").trim();
  if (note.length > 500) throw Error("Invalid entity note");
  if (note) assertNoForbiddenClaimLanguage(note, "entity note");
  return {
    id: entity.id,
    label: entity.label.trim(),
    scale: entity.scale,
    ontologySystem,
    ontologyValue,
    note,
  };
}

function deriveCausalClaimKind(input: {
  sourceScale: CsolBiologicalScale;
  targetScale: CsolBiologicalScale;
  couplingStatus: CsolCouplingStatus;
  mappingOutcome: CsolMappingOutcome;
}): CsolCausalClaimKind {
  if (crossesToOrganOrHigher(input.sourceScale, input.targetScale)) {
    if (input.couplingStatus === "validated_coupling") {
      return "validated_coupling_declared";
    }
    if (
      input.couplingStatus === "association_only_not_causal" ||
      input.mappingOutcome === "supported"
    ) {
      return "association_only";
    }
    return "causal_effect_forbidden_without_validated_coupling";
  }
  if (input.couplingStatus === "validated_coupling") {
    return "validated_coupling_declared";
  }
  if (input.mappingOutcome === "supported") return "association_only";
  return "no_causal_claim";
}

function assertCouplingConsistentWithMapping(input: {
  mappingOutcome: CsolMappingOutcome;
  couplingStatus: CsolCouplingStatus;
  sourceScale: CsolBiologicalScale;
  targetScale: CsolBiologicalScale;
}): void {
  if (
    input.mappingOutcome === "unsupported" &&
    input.couplingStatus === "validated_coupling"
  ) {
    throw Error("Unsupported mapping cannot carry validated coupling");
  }
  if (
    input.mappingOutcome === "uncertain" &&
    input.couplingStatus === "validated_coupling"
  ) {
    throw Error("Uncertain mapping cannot carry validated coupling");
  }
  if (
    crossesToOrganOrHigher(input.sourceScale, input.targetScale) &&
    input.couplingStatus === "validated_coupling" &&
    input.mappingOutcome !== "supported"
  ) {
    throw Error(
      "Organ-or-higher validated coupling requires supported mappingOutcome",
    );
  }
}

export function draftCrossScaleOntologySpec(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds?: readonly CsolCapabilityKind[];
  diseaseContextId: string;
  integratedDiseaseContextId?: string | null;
  longitudinalModellingSpecId?: string | null;
  translationalProgrammeId?: string | null;
  therapeuticProgrammeId?: string | null;
  datasetAvailability?: CsolDatasetAvailability;
  accessClassification?: CsolAccessClassification;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleOntologySpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid cross-scale ontology spec id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.scientificQuestion, 2000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(input.scientificQuestion, "scientificQuestion");
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const capabilityKinds = [
    ...new Set(input.capabilityKinds ?? [...CSOL_CAPABILITY_KINDS]),
  ];
  if (capabilityKinds.length === 0) {
    throw Error("capabilityKinds required");
  }
  for (const kind of capabilityKinds) {
    assertClosed(kind, CSOL_CAPABILITY_KINDS, "capabilityKind");
  }

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    CSOL_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  const accessClassification =
    input.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : datasetAvailability === "blocked_no_authorised_clinical_dataset"
        ? "restricted_not_ingested"
        : "authorised_pseudonymous_research");
  assertClosed(
    accessClassification,
    CSOL_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  const lifecycle: CsolLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: CrossScaleOntologySpec = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    capabilityKinds,
    diseaseContextId: input.diseaseContextId,
    integratedDiseaseContextId: assertOptionalId(
      input.integratedDiseaseContextId,
      CBC_IDC_RE,
      "integratedDiseaseContextId",
    ),
    longitudinalModellingSpecId: assertOptionalId(
      input.longitudinalModellingSpecId,
      LDSM_SPEC_RE,
      "longitudinalModellingSpecId",
    ),
    translationalProgrammeId: assertOptionalId(
      input.translationalProgrammeId,
      TD_ID_RE,
      "translationalProgrammeId",
    ),
    therapeuticProgrammeId: assertOptionalId(
      input.therapeuticProgrammeId,
      THER_ID_RE,
      "therapeuticProgrammeId",
    ),
    datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForAvailability(datasetAvailability),
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleOntologySpec(record);
}

export function validateCrossScaleOntologySpec(
  record: CrossScaleOntologySpec,
): CrossScaleOntologySpec {
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.schema !== CROSS_SCALE_ONTOLOGY_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== CROSS_SCALE_ONTOLOGY_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== CROSS_SCALE_ONTOLOGY_VERSION) {
    throw Error("Invalid version");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  assertClosed(record.lifecycle, CSOL_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    CSOL_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(
    record.accessClassification,
    CSOL_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  assertClosed(record.dataBasis, CSOL_DATA_BASES, "dataBasis");
  for (const kind of record.capabilityKinds) {
    assertClosed(kind, CSOL_CAPABILITY_KINDS, "capabilityKind");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  if (
    record.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    record.lifecycle === "accepted_with_limitations"
  ) {
    throw Error(
      "Cannot accept while dataset availability is blocked",
    );
  }
  return record;
}

export function transitionCrossScaleOntologySpec(input: {
  spec: CrossScaleOntologySpec;
  to: CsolLifecycle;
  updatedAt: string;
  actor: CsolActor;
}): CrossScaleOntologySpec {
  const current = validateCrossScaleOntologySpec(input.spec);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SPEC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error("Cannot accept while dataset blocked");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validateCrossScaleOntologySpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftCrossScaleEntityMapping(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  sourceEntity: CrossScaleEntityRef;
  targetEntity: CrossScaleEntityRef;
  mappingOutcome: CsolMappingOutcome;
  couplingStatus: CsolCouplingStatus;
  relationshipSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleEntityMapping {
  if (!MAP_ID_RE.test(input.id)) throw Error("Invalid entity mapping id");
  validateCrossScaleOntologySpec(input.ontologySpec);
  assertClosed(input.mappingOutcome, CSOL_MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(input.couplingStatus, CSOL_COUPLING_STATUSES, "couplingStatus");
  const sourceEntity = assertEntityRef(input.sourceEntity);
  const targetEntity = assertEntityRef(input.targetEntity);
  if (sourceEntity.id === targetEntity.id) {
    throw Error("Source and target entity ids must differ");
  }
  if (
    sourceEntity.scale === targetEntity.scale &&
    sourceEntity.label === targetEntity.label
  ) {
    throw Error("Degenerate same-scale same-label mapping forbidden");
  }
  assertCouplingConsistentWithMapping({
    mappingOutcome: input.mappingOutcome,
    couplingStatus: input.couplingStatus,
    sourceScale: sourceEntity.scale,
    targetScale: targetEntity.scale,
  });

  if (!textOk(input.relationshipSummary, 1000)) {
    throw Error("Invalid relationshipSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.relationshipSummary,
    "relationshipSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const causalClaimKind = deriveCausalClaimKind({
    sourceScale: sourceEntity.scale,
    targetScale: targetEntity.scale,
    couplingStatus: input.couplingStatus,
    mappingOutcome: input.mappingOutcome,
  });

  if (
    crossesToOrganOrHigher(sourceEntity.scale, targetEntity.scale) &&
    causalClaimKind === "validated_coupling_declared" &&
    input.couplingStatus !== "validated_coupling"
  ) {
    throw Error("Organ causal claim requires validated coupling");
  }

  const record: CrossScaleEntityMapping = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    sourceEntity,
    targetEntity,
    mappingOutcome: input.mappingOutcome,
    couplingStatus: input.couplingStatus,
    causalClaimKind,
    molecularPathwayAssociationImpliesOrganCausalEffect: false,
    relationshipSummary: input.relationshipSummary.trim(),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleEntityMapping(record);
}

export function validateCrossScaleEntityMapping(
  record: CrossScaleEntityMapping,
): CrossScaleEntityMapping {
  if (!MAP_ID_RE.test(record.id)) throw Error("Invalid id");
  assertEntityRef(record.sourceEntity);
  assertEntityRef(record.targetEntity);
  assertClosed(record.mappingOutcome, CSOL_MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(record.couplingStatus, CSOL_COUPLING_STATUSES, "couplingStatus");
  assertClosed(record.causalClaimKind, CSOL_CAUSAL_CLAIM_KINDS, "causalClaimKind");
  if (record.molecularPathwayAssociationImpliesOrganCausalEffect !== false) {
    throw Error(
      "Molecular pathway association must not imply organ-level causal effect",
    );
  }
  assertCouplingConsistentWithMapping({
    mappingOutcome: record.mappingOutcome,
    couplingStatus: record.couplingStatus,
    sourceScale: record.sourceEntity.scale,
    targetScale: record.targetEntity.scale,
  });
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftBiologicalContextAnnotation(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  entity: CrossScaleEntityRef;
  contextSummary: string;
  speciesOrModelSystem?: string | null;
  tissueOrCompartment?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): BiologicalContextAnnotation {
  if (!CTX_ID_RE.test(input.id)) {
    throw Error("Invalid biological context annotation id");
  }
  validateCrossScaleOntologySpec(input.ontologySpec);
  const entity = assertEntityRef(input.entity);
  if (!textOk(input.contextSummary, 1000)) {
    throw Error("Invalid contextSummary");
  }
  assertNoForbiddenClaimLanguage(input.contextSummary, "contextSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const speciesOrModelSystem =
    input.speciesOrModelSystem === undefined ||
    input.speciesOrModelSystem === null
      ? null
      : (() => {
          if (!textOk(input.speciesOrModelSystem, 200)) {
            throw Error("Invalid speciesOrModelSystem");
          }
          assertNoForbiddenClaimLanguage(
            input.speciesOrModelSystem,
            "speciesOrModelSystem",
          );
          return input.speciesOrModelSystem.trim();
        })();
  const tissueOrCompartment =
    input.tissueOrCompartment === undefined ||
    input.tissueOrCompartment === null
      ? null
      : (() => {
          if (!textOk(input.tissueOrCompartment, 200)) {
            throw Error("Invalid tissueOrCompartment");
          }
          assertNoForbiddenClaimLanguage(
            input.tissueOrCompartment,
            "tissueOrCompartment",
          );
          return input.tissueOrCompartment.trim();
        })();

  const record: BiologicalContextAnnotation = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    entityId: entity.id,
    scale: entity.scale,
    contextSummary: input.contextSummary.trim(),
    speciesOrModelSystem,
    tissueOrCompartment,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateBiologicalContextAnnotation(record);
}

export function validateBiologicalContextAnnotation(
  record: BiologicalContextAnnotation,
): BiologicalContextAnnotation {
  if (!CTX_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!ENT_ID_RE.test(record.entityId)) throw Error("Invalid entityId");
  assertClosed(record.scale, CSOL_BIOLOGICAL_SCALES, "scale");
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftCrossScaleEvidenceProvenance(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  subjectRecordId: string;
  provenanceKind: CsolProvenanceKind;
  sourceRef: string;
  evidenceSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleEvidenceProvenance {
  if (!PRV_ID_RE.test(input.id)) throw Error("Invalid evidence provenance id");
  validateCrossScaleOntologySpec(input.ontologySpec);
  if (!REF_ID_RE.test(input.subjectRecordId)) {
    throw Error("Invalid subjectRecordId");
  }
  assertClosed(input.provenanceKind, CSOL_PROVENANCE_KINDS, "provenanceKind");
  if (!REF_ID_RE.test(input.sourceRef)) throw Error("Invalid sourceRef");
  if (!textOk(input.evidenceSummary, 1000)) {
    throw Error("Invalid evidenceSummary");
  }
  assertNoForbiddenClaimLanguage(input.evidenceSummary, "evidenceSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: CrossScaleEvidenceProvenance = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    subjectRecordId: input.subjectRecordId,
    provenanceKind: input.provenanceKind,
    sourceRef: input.sourceRef,
    evidenceSummary: input.evidenceSummary.trim(),
    inventedEvidence: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleEvidenceProvenance(record);
}

export function validateCrossScaleEvidenceProvenance(
  record: CrossScaleEvidenceProvenance,
): CrossScaleEvidenceProvenance {
  if (!PRV_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.provenanceKind, CSOL_PROVENANCE_KINDS, "provenanceKind");
  if (record.inventedEvidence !== null) {
    throw Error("Invented evidence forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftCrossScaleTemporalContext(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  subjectRecordId: string;
  temporalContextKind: CsolTemporalContextKind;
  startTime?: string | null;
  endTime?: string | null;
  snapshotTime?: string | null;
  temporalSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleTemporalContext {
  if (!TMP_ID_RE.test(input.id)) throw Error("Invalid temporal context id");
  validateCrossScaleOntologySpec(input.ontologySpec);
  if (!REF_ID_RE.test(input.subjectRecordId)) {
    throw Error("Invalid subjectRecordId");
  }
  assertClosed(
    input.temporalContextKind,
    CSOL_TEMPORAL_CONTEXT_KINDS,
    "temporalContextKind",
  );
  if (!textOk(input.temporalSummary, 1000)) {
    throw Error("Invalid temporalSummary");
  }
  assertNoForbiddenClaimLanguage(input.temporalSummary, "temporalSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const startTime =
    input.startTime === undefined || input.startTime === null
      ? null
      : (() => {
          if (!isIsoTimestamp(input.startTime)) throw Error("Invalid startTime");
          return input.startTime;
        })();
  const endTime =
    input.endTime === undefined || input.endTime === null
      ? null
      : (() => {
          if (!isIsoTimestamp(input.endTime)) throw Error("Invalid endTime");
          return input.endTime;
        })();
  const snapshotTime =
    input.snapshotTime === undefined || input.snapshotTime === null
      ? null
      : (() => {
          if (!isIsoTimestamp(input.snapshotTime)) {
            throw Error("Invalid snapshotTime");
          }
          return input.snapshotTime;
        })();

  if (startTime && endTime && Date.parse(startTime) > Date.parse(endTime)) {
    throw Error("startTime must not be after endTime");
  }
  if (
    input.temporalContextKind === "snapshot_at_time" &&
    snapshotTime === null
  ) {
    throw Error("snapshot_at_time requires snapshotTime");
  }
  if (
    input.temporalContextKind === "interval_declared" &&
    (startTime === null || endTime === null)
  ) {
    throw Error("interval_declared requires startTime and endTime");
  }

  const record: CrossScaleTemporalContext = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    subjectRecordId: input.subjectRecordId,
    temporalContextKind: input.temporalContextKind,
    startTime,
    endTime,
    snapshotTime,
    temporalSummary: input.temporalSummary.trim(),
    fabricatedTimeline: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleTemporalContext(record);
}

export function validateCrossScaleTemporalContext(
  record: CrossScaleTemporalContext,
): CrossScaleTemporalContext {
  if (!TMP_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(
    record.temporalContextKind,
    CSOL_TEMPORAL_CONTEXT_KINDS,
    "temporalContextKind",
  );
  if (record.fabricatedTimeline !== null) {
    throw Error("Fabricated timeline forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftCrossScaleModelLinkage(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  entityMapping: CrossScaleEntityMapping;
  sourceModelRef: string;
  targetModelRef: string;
  linkageSummary: string;
  limitations: readonly string[];
  longitudinalDiseaseStateModelId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleModelLinkage {
  if (!LNK_ID_RE.test(input.id)) throw Error("Invalid model linkage id");
  validateCrossScaleOntologySpec(input.ontologySpec);
  validateCrossScaleEntityMapping(input.entityMapping);
  if (input.entityMapping.ontologySpecId !== input.ontologySpec.id) {
    throw Error("Entity mapping must belong to the same ontology spec");
  }
  if (!REF_ID_RE.test(input.sourceModelRef)) {
    throw Error("Invalid sourceModelRef");
  }
  if (!REF_ID_RE.test(input.targetModelRef)) {
    throw Error("Invalid targetModelRef");
  }
  if (input.sourceModelRef === input.targetModelRef) {
    throw Error("Source and target model refs must differ");
  }
  if (!textOk(input.linkageSummary, 1000)) {
    throw Error("Invalid linkageSummary");
  }
  assertNoForbiddenClaimLanguage(input.linkageSummary, "linkageSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const sourceScale = input.entityMapping.sourceEntity.scale;
  const targetScale = input.entityMapping.targetEntity.scale;
  const couplingStatus = input.entityMapping.couplingStatus;
  const scalesDiffer = sourceScale !== targetScale;
  const linkageAllowed =
    !scalesDiffer || isValidatedCouplingStatus(couplingStatus);

  if (scalesDiffer && !linkageAllowed) {
    throw Error(
      "Cross-scale model linkage refused without validated coupling relationship",
    );
  }

  const record: CrossScaleModelLinkage = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    sourceScale,
    targetScale,
    sourceModelRef: input.sourceModelRef,
    targetModelRef: input.targetModelRef,
    entityMappingId: input.entityMapping.id,
    couplingStatus,
    linkageAllowed: true,
    inventedParameters: null,
    liveMultiscaleEngineOperational: false,
    linkageSummary: input.linkageSummary.trim(),
    limitations: assertLimitations(input.limitations),
    longitudinalDiseaseStateModelId: assertOptionalId(
      input.longitudinalDiseaseStateModelId,
      LDSM_MDL_RE,
      "longitudinalDiseaseStateModelId",
    ),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleModelLinkage(record);
}

export function validateCrossScaleModelLinkage(
  record: CrossScaleModelLinkage,
): CrossScaleModelLinkage {
  if (!LNK_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.sourceScale, CSOL_BIOLOGICAL_SCALES, "sourceScale");
  assertClosed(record.targetScale, CSOL_BIOLOGICAL_SCALES, "targetScale");
  assertClosed(record.couplingStatus, CSOL_COUPLING_STATUSES, "couplingStatus");
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.linkageAllowed !== true) {
    throw Error("Stored model linkage must be allowed");
  }
  if (
    record.sourceScale !== record.targetScale &&
    !isValidatedCouplingStatus(record.couplingStatus)
  ) {
    throw Error(
      "Cross-scale model linkage requires validated coupling",
    );
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

/**
 * Record an unsupported / uncertain / blocked cross-scale coupling explicitly
 * (not discarded, not invented as validated).
 */
export function recordUnsupportedCrossScaleCoupling(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  sourceEntity: CrossScaleEntityRef;
  targetEntity: CrossScaleEntityRef;
  mappingOutcome?: CsolMappingOutcome;
  couplingStatus:
    | "unsupported_coupling"
    | "uncertain_coupling"
    | "association_only_not_causal"
    | "blocked_no_validated_coupling";
  relationshipSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleEntityMapping {
  return draftCrossScaleEntityMapping({
    id: input.id,
    ontologySpec: input.ontologySpec,
    sourceEntity: input.sourceEntity,
    targetEntity: input.targetEntity,
    mappingOutcome:
      input.mappingOutcome ??
      (input.couplingStatus === "unsupported_coupling"
        ? "unsupported"
        : input.couplingStatus === "uncertain_coupling"
          ? "uncertain"
          : "supported"),
    couplingStatus: input.couplingStatus,
    relationshipSummary: input.relationshipSummary,
    authoredByPrincipalId: input.authoredByPrincipalId,
    authoredByActorKind: input.authoredByActorKind,
    createdAt: input.createdAt,
    note: input.note ?? "Unsupported/uncertain coupling recorded explicitly",
  });
}

export function draftCrossScaleRelationshipUncertainty(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  subjectRecordId: string;
  uncertaintyOrdinal: CsolRelationshipUncertaintyOrdinal;
  uncertaintySummary: string;
  unsupportedCouplingRecorded: boolean;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleRelationshipUncertainty {
  if (!UNC_ID_RE.test(input.id)) {
    throw Error("Invalid relationship uncertainty id");
  }
  validateCrossScaleOntologySpec(input.ontologySpec);
  if (!REF_ID_RE.test(input.subjectRecordId)) {
    throw Error("Invalid subjectRecordId");
  }
  assertClosed(
    input.uncertaintyOrdinal,
    CSOL_RELATIONSHIP_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!textOk(input.uncertaintySummary, 1000)) {
    throw Error("Invalid uncertaintySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.uncertaintySummary,
    "uncertaintySummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: CrossScaleRelationshipUncertainty = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    subjectRecordId: input.subjectRecordId,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    uncertaintySummary: input.uncertaintySummary.trim(),
    unsupportedCouplingRecorded: input.unsupportedCouplingRecorded === true,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleRelationshipUncertainty(record);
}

export function validateCrossScaleRelationshipUncertainty(
  record: CrossScaleRelationshipUncertainty,
): CrossScaleRelationshipUncertainty {
  if (!UNC_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(
    record.uncertaintyOrdinal,
    CSOL_RELATIONSHIP_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (typeof record.unsupportedCouplingRecorded !== "boolean") {
    throw Error("unsupportedCouplingRecorded required");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftVersionedOntologyMapping(input: {
  id: string;
  ontologySpec: CrossScaleOntologySpec;
  fromSystem: string;
  fromValue: string;
  toSystem: string;
  toValue: string;
  relation: VersionedOntologyMapping["relation"];
  mappingVersion: string;
  reviewDecisionId?: string | null;
  mappingOutcome: CsolMappingOutcome;
  sourceRef: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): VersionedOntologyMapping {
  if (!ONT_ID_RE.test(input.id)) {
    throw Error("Invalid versioned ontology mapping id");
  }
  validateCrossScaleOntologySpec(input.ontologySpec);
  const fromSystem = assertOntologyToken(input.fromSystem, "fromSystem");
  const fromValue = assertOntologyToken(input.fromValue, "fromValue");
  const toSystem = assertOntologyToken(input.toSystem, "toSystem");
  const toValue = assertOntologyToken(input.toValue, "toValue");
  if (fromSystem === toSystem && fromValue === toValue) {
    throw Error("Self mapping is redundant");
  }
  assertClosed(
    input.relation,
    ["exact", "broad", "narrow", "related", "unreviewed"] as const,
    "relation",
  );
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(input.mappingVersion)) {
    throw Error("Invalid mappingVersion semver");
  }
  assertClosed(input.mappingOutcome, CSOL_MAPPING_OUTCOMES, "mappingOutcome");
  if (!REF_ID_RE.test(input.sourceRef)) throw Error("Invalid sourceRef");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const reviewDecisionId =
    input.reviewDecisionId === undefined || input.reviewDecisionId === null
      ? null
      : (() => {
          if (!REF_ID_RE.test(input.reviewDecisionId)) {
            throw Error("Invalid reviewDecisionId");
          }
          return input.reviewDecisionId;
        })();

  if (input.relation === "exact" && !reviewDecisionId) {
    throw Error("Exact ontology mapping requires human reviewDecisionId");
  }
  if (input.relation === "exact" && input.mappingOutcome !== "supported") {
    throw Error("Exact relation requires supported mappingOutcome");
  }

  const record: VersionedOntologyMapping = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    ontologySpecId: input.ontologySpec.id,
    diseaseContextId: input.ontologySpec.diseaseContextId,
    fromSystem,
    fromValue,
    toSystem,
    toValue,
    relation: input.relation,
    mappingVersion: input.mappingVersion,
    reviewDecisionId,
    mappingOutcome: input.mappingOutcome,
    sourceRef: input.sourceRef,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateVersionedOntologyMapping(record);
}

export function validateVersionedOntologyMapping(
  record: VersionedOntologyMapping,
): VersionedOntologyMapping {
  if (!ONT_ID_RE.test(record.id)) throw Error("Invalid id");
  assertOntologyToken(record.fromSystem, "fromSystem");
  assertOntologyToken(record.fromValue, "fromValue");
  assertOntologyToken(record.toSystem, "toSystem");
  assertOntologyToken(record.toValue, "toValue");
  assertClosed(
    record.relation,
    ["exact", "broad", "narrow", "related", "unreviewed"] as const,
    "relation",
  );
  assertClosed(record.mappingOutcome, CSOL_MAPPING_OUTCOMES, "mappingOutcome");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(record.mappingVersion)) {
    throw Error("Invalid mappingVersion");
  }
  if (record.relation === "exact" && !record.reviewDecisionId) {
    throw Error("Exact ontology mapping requires human reviewDecisionId");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftCrossScaleLinkageBundle(input: {
  id: string;
  displayName: string;
  ontologySpec: CrossScaleOntologySpec;
  bundleVersion: string;
  limitations: readonly string[];
  entityMappings?: readonly CrossScaleEntityMapping[];
  biologicalContexts?: readonly BiologicalContextAnnotation[];
  evidenceProvenance?: readonly CrossScaleEvidenceProvenance[];
  temporalContexts?: readonly CrossScaleTemporalContext[];
  modelLinkages?: readonly CrossScaleModelLinkage[];
  relationshipUncertainties?: readonly CrossScaleRelationshipUncertainty[];
  versionedOntologyMappings?: readonly VersionedOntologyMapping[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CsolActorKind;
  createdAt: string;
  note?: string;
}): CrossScaleLinkageBundle {
  if (!BND_ID_RE.test(input.id)) throw Error("Invalid linkage bundle id");
  validateCrossScaleOntologySpec(input.ontologySpec);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(input.bundleVersion)) {
    throw Error("Invalid bundleVersion semver");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const entityMappings = input.entityMappings ?? [];
  const biologicalContexts = input.biologicalContexts ?? [];
  const evidenceProvenance = input.evidenceProvenance ?? [];
  const temporalContexts = input.temporalContexts ?? [];
  const modelLinkages = input.modelLinkages ?? [];
  const relationshipUncertainties = input.relationshipUncertainties ?? [];
  const versionedOntologyMappings = input.versionedOntologyMappings ?? [];

  for (const m of entityMappings) validateCrossScaleEntityMapping(m);
  for (const b of biologicalContexts) validateBiologicalContextAnnotation(b);
  for (const e of evidenceProvenance) validateCrossScaleEvidenceProvenance(e);
  for (const t of temporalContexts) validateCrossScaleTemporalContext(t);
  for (const l of modelLinkages) validateCrossScaleModelLinkage(l);
  for (const u of relationshipUncertainties) {
    validateCrossScaleRelationshipUncertainty(u);
  }
  for (const o of versionedOntologyMappings) {
    validateVersionedOntologyMapping(o);
  }

  const unsupportedCouplingIds = entityMappings
    .filter(
      (m) =>
        m.couplingStatus === "unsupported_coupling" ||
        m.couplingStatus === "uncertain_coupling" ||
        m.couplingStatus === "blocked_no_validated_coupling" ||
        m.couplingStatus === "association_only_not_causal",
    )
    .map((m) => m.id);

  const lifecycle: CsolLifecycle =
    input.ontologySpec.datasetAvailability ===
    "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: CrossScaleLinkageBundle = {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: input.ontologySpec.diseaseContextId,
    ontologySpecId: input.ontologySpec.id,
    entityMappingIds: assertIdList(
      entityMappings.map((m) => m.id),
      MAP_ID_RE,
      "entityMappingIds",
      64,
    ),
    biologicalContextAnnotationIds: assertIdList(
      biologicalContexts.map((b) => b.id),
      CTX_ID_RE,
      "biologicalContextAnnotationIds",
      64,
    ),
    evidenceProvenanceIds: assertIdList(
      evidenceProvenance.map((e) => e.id),
      PRV_ID_RE,
      "evidenceProvenanceIds",
      64,
    ),
    temporalContextIds: assertIdList(
      temporalContexts.map((t) => t.id),
      TMP_ID_RE,
      "temporalContextIds",
      64,
    ),
    modelLinkageIds: assertIdList(
      modelLinkages.map((l) => l.id),
      LNK_ID_RE,
      "modelLinkageIds",
      64,
    ),
    relationshipUncertaintyIds: assertIdList(
      relationshipUncertainties.map((u) => u.id),
      UNC_ID_RE,
      "relationshipUncertaintyIds",
      64,
    ),
    versionedOntologyMappingIds: assertIdList(
      versionedOntologyMappings.map((o) => o.id),
      ONT_ID_RE,
      "versionedOntologyMappingIds",
      64,
    ),
    unsupportedCouplingIds: assertIdList(
      unsupportedCouplingIds,
      MAP_ID_RE,
      "unsupportedCouplingIds",
      64,
    ),
    bundleVersion: input.bundleVersion,
    limitations: assertLimitations(input.limitations),
    datasetAvailability: input.ontologySpec.datasetAvailability,
    liveMultiscaleEngineOperational: false,
    notDigitalTwinProduct: true,
    graphPromotable: false,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.ontologySpec.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleLinkageBundle(record);
}

export function validateCrossScaleLinkageBundle(
  record: CrossScaleLinkageBundle,
): CrossScaleLinkageBundle {
  if (!BND_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  assertClosed(record.lifecycle, CSOL_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    CSOL_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionCrossScaleLinkageBundle(input: {
  bundle: CrossScaleLinkageBundle;
  to: CsolLifecycle;
  updatedAt: string;
  actor: CsolActor;
}): CrossScaleLinkageBundle {
  const current = validateCrossScaleLinkageBundle(input.bundle);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = BUNDLE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal lifecycle transition ${current.lifecycle} -> ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error("Cannot accept while dataset blocked");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validateCrossScaleLinkageBundle({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryCrossScaleOntologyStore(): CrossScaleOntologyStore & {
  specs: Map<string, CrossScaleOntologySpec>;
  entityMappings: Map<string, CrossScaleEntityMapping>;
  biologicalContexts: Map<string, BiologicalContextAnnotation>;
  evidenceProvenance: Map<string, CrossScaleEvidenceProvenance>;
  temporalContexts: Map<string, CrossScaleTemporalContext>;
  modelLinkages: Map<string, CrossScaleModelLinkage>;
  relationshipUncertainties: Map<string, CrossScaleRelationshipUncertainty>;
  versionedOntologyMappings: Map<string, VersionedOntologyMapping>;
  bundles: Map<string, CrossScaleLinkageBundle>;
} {
  const specs = new Map<string, CrossScaleOntologySpec>();
  const entityMappings = new Map<string, CrossScaleEntityMapping>();
  const biologicalContexts = new Map<string, BiologicalContextAnnotation>();
  const evidenceProvenance = new Map<string, CrossScaleEvidenceProvenance>();
  const temporalContexts = new Map<string, CrossScaleTemporalContext>();
  const modelLinkages = new Map<string, CrossScaleModelLinkage>();
  const relationshipUncertainties = new Map<
    string,
    CrossScaleRelationshipUncertainty
  >();
  const versionedOntologyMappings = new Map<string, VersionedOntologyMapping>();
  const bundles = new Map<string, CrossScaleLinkageBundle>();

  const filterByDisease = <T extends {diseaseContextId: string}>(
    map: Map<string, T>,
    diseaseContextId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return diseaseContextId
      ? all.filter((r) => r.diseaseContextId === diseaseContextId)
      : all;
  };

  return {
    specs,
    entityMappings,
    biologicalContexts,
    evidenceProvenance,
    temporalContexts,
    modelLinkages,
    relationshipUncertainties,
    versionedOntologyMappings,
    bundles,
    upsertSpec(record) {
      const validated = validateCrossScaleOntologySpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(diseaseContextId) {
      return filterByDisease(specs, diseaseContextId);
    },
    upsertEntityMapping(record) {
      const validated = validateCrossScaleEntityMapping(record);
      entityMappings.set(validated.id, validated);
      return validated;
    },
    getEntityMapping(id) {
      return entityMappings.get(id) ?? null;
    },
    listEntityMappings(diseaseContextId) {
      return filterByDisease(entityMappings, diseaseContextId);
    },
    upsertBiologicalContext(record) {
      const validated = validateBiologicalContextAnnotation(record);
      biologicalContexts.set(validated.id, validated);
      return validated;
    },
    getBiologicalContext(id) {
      return biologicalContexts.get(id) ?? null;
    },
    listBiologicalContexts(diseaseContextId) {
      return filterByDisease(biologicalContexts, diseaseContextId);
    },
    upsertEvidenceProvenance(record) {
      const validated = validateCrossScaleEvidenceProvenance(record);
      evidenceProvenance.set(validated.id, validated);
      return validated;
    },
    getEvidenceProvenance(id) {
      return evidenceProvenance.get(id) ?? null;
    },
    listEvidenceProvenance(diseaseContextId) {
      return filterByDisease(evidenceProvenance, diseaseContextId);
    },
    upsertTemporalContext(record) {
      const validated = validateCrossScaleTemporalContext(record);
      temporalContexts.set(validated.id, validated);
      return validated;
    },
    getTemporalContext(id) {
      return temporalContexts.get(id) ?? null;
    },
    listTemporalContexts(diseaseContextId) {
      return filterByDisease(temporalContexts, diseaseContextId);
    },
    upsertModelLinkage(record) {
      const validated = validateCrossScaleModelLinkage(record);
      modelLinkages.set(validated.id, validated);
      return validated;
    },
    getModelLinkage(id) {
      return modelLinkages.get(id) ?? null;
    },
    listModelLinkages(diseaseContextId) {
      return filterByDisease(modelLinkages, diseaseContextId);
    },
    upsertRelationshipUncertainty(record) {
      const validated = validateCrossScaleRelationshipUncertainty(record);
      relationshipUncertainties.set(validated.id, validated);
      return validated;
    },
    getRelationshipUncertainty(id) {
      return relationshipUncertainties.get(id) ?? null;
    },
    listRelationshipUncertainties(diseaseContextId) {
      return filterByDisease(relationshipUncertainties, diseaseContextId);
    },
    upsertVersionedOntologyMapping(record) {
      const validated = validateVersionedOntologyMapping(record);
      versionedOntologyMappings.set(validated.id, validated);
      return validated;
    },
    getVersionedOntologyMapping(id) {
      return versionedOntologyMappings.get(id) ?? null;
    },
    listVersionedOntologyMappings(diseaseContextId) {
      return filterByDisease(versionedOntologyMappings, diseaseContextId);
    },
    upsertBundle(record) {
      const validated = validateCrossScaleLinkageBundle(record);
      bundles.set(validated.id, validated);
      return validated;
    },
    getBundle(id) {
      return bundles.get(id) ?? null;
    },
    listBundles(diseaseContextId) {
      return filterByDisease(bundles, diseaseContextId);
    },
  };
}

export function projectCrossScaleOntologyPersistenceLines(input: {
  specs: readonly CrossScaleOntologySpec[];
  entityMappings?: readonly CrossScaleEntityMapping[];
  biologicalContexts?: readonly BiologicalContextAnnotation[];
  evidenceProvenance?: readonly CrossScaleEvidenceProvenance[];
  temporalContexts?: readonly CrossScaleTemporalContext[];
  modelLinkages?: readonly CrossScaleModelLinkage[];
  relationshipUncertainties?: readonly CrossScaleRelationshipUncertainty[];
  versionedOntologyMappings?: readonly VersionedOntologyMapping[];
  bundles?: readonly CrossScaleLinkageBundle[];
}): string[] {
  for (const s of input.specs) validateCrossScaleOntologySpec(s);
  for (const m of input.entityMappings ?? []) {
    validateCrossScaleEntityMapping(m);
  }
  for (const b of input.biologicalContexts ?? []) {
    validateBiologicalContextAnnotation(b);
  }
  for (const e of input.evidenceProvenance ?? []) {
    validateCrossScaleEvidenceProvenance(e);
  }
  for (const t of input.temporalContexts ?? []) {
    validateCrossScaleTemporalContext(t);
  }
  for (const l of input.modelLinkages ?? []) {
    validateCrossScaleModelLinkage(l);
  }
  for (const u of input.relationshipUncertainties ?? []) {
    validateCrossScaleRelationshipUncertainty(u);
  }
  for (const o of input.versionedOntologyMappings ?? []) {
    validateVersionedOntologyMapping(o);
  }
  for (const b of input.bundles ?? []) validateCrossScaleLinkageBundle(b);

  const unsupportedCouplings = (input.entityMappings ?? []).filter(
    (m) =>
      m.couplingStatus === "unsupported_coupling" ||
      m.couplingStatus === "uncertain_coupling" ||
      m.couplingStatus === "blocked_no_validated_coupling" ||
      m.couplingStatus === "association_only_not_causal",
  ).length;

  return [
    `schema=${CROSS_SCALE_ONTOLOGY_SCHEMA}`,
    `method=${CROSS_SCALE_ONTOLOGY_METHOD}`,
    `version=${CROSS_SCALE_ONTOLOGY_VERSION}`,
    `specs=${input.specs.length}`,
    `entityMappings=${(input.entityMappings ?? []).length}`,
    `biologicalContexts=${(input.biologicalContexts ?? []).length}`,
    `evidenceProvenance=${(input.evidenceProvenance ?? []).length}`,
    `temporalContexts=${(input.temporalContexts ?? []).length}`,
    `modelLinkages=${(input.modelLinkages ?? []).length}`,
    `relationshipUncertainties=${(input.relationshipUncertainties ?? []).length}`,
    `versionedOntologyMappings=${(input.versionedOntologyMappings ?? []).length}`,
    `bundles=${(input.bundles ?? []).length}`,
    `unsupportedCouplingsRecorded=${unsupportedCouplings}`,
    `biologicalScaleCount=${CSOL_BIOLOGICAL_SCALES.length}`,
    `capabilityKindCount=${CSOL_CAPABILITY_KINDS.length}`,
    `molecularAssociationIsNotOrganCausalEffect=true`,
    `crossScaleModelLinkageRequiresValidatedCoupling=true`,
    `unsupportedCouplingsMustBeRecordedExplicitly=true`,
    `noInventedSimulationParameters=true`,
    `noLiveMultiscaleEngineClaim=true`,
    `notDigitalTwinProduct=true`,
    `notClinicalCare=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintCrossScaleLinkageBundle(
  bundle: CrossScaleLinkageBundle,
): string {
  const validated = validateCrossScaleLinkageBundle(bundle);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildCrossScaleOntologyPack(input: {
  specs: readonly CrossScaleOntologySpec[];
  entityMappings: readonly CrossScaleEntityMapping[];
  biologicalContexts: readonly BiologicalContextAnnotation[];
  evidenceProvenance: readonly CrossScaleEvidenceProvenance[];
  temporalContexts: readonly CrossScaleTemporalContext[];
  modelLinkages: readonly CrossScaleModelLinkage[];
  relationshipUncertainties: readonly CrossScaleRelationshipUncertainty[];
  versionedOntologyMappings: readonly VersionedOntologyMapping[];
  bundles: readonly CrossScaleLinkageBundle[];
  asOf: string;
}): {
  schema: typeof CROSS_SCALE_ONTOLOGY_SCHEMA;
  method: typeof CROSS_SCALE_ONTOLOGY_METHOD;
  version: typeof CROSS_SCALE_ONTOLOGY_VERSION;
  asOf: string;
  biologicalScaleCount: number;
  capabilityKindCount: number;
  specCount: number;
  entityMappingCount: number;
  biologicalContextCount: number;
  evidenceProvenanceCount: number;
  temporalContextCount: number;
  modelLinkageCount: number;
  relationshipUncertaintyCount: number;
  versionedOntologyMappingCount: number;
  bundleCount: number;
  unsupportedCouplingCount: number;
  honesty: CrossScaleOntologyHonesty;
  specs: readonly CrossScaleOntologySpec[];
  entityMappings: readonly CrossScaleEntityMapping[];
  biologicalContexts: readonly BiologicalContextAnnotation[];
  evidenceProvenance: readonly CrossScaleEvidenceProvenance[];
  temporalContexts: readonly CrossScaleTemporalContext[];
  modelLinkages: readonly CrossScaleModelLinkage[];
  relationshipUncertainties: readonly CrossScaleRelationshipUncertainty[];
  versionedOntologyMappings: readonly VersionedOntologyMapping[];
  bundles: readonly CrossScaleLinkageBundle[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validateCrossScaleOntologySpec);
  const entityMappings = input.entityMappings.map(
    validateCrossScaleEntityMapping,
  );
  const biologicalContexts = input.biologicalContexts.map(
    validateBiologicalContextAnnotation,
  );
  const evidenceProvenance = input.evidenceProvenance.map(
    validateCrossScaleEvidenceProvenance,
  );
  const temporalContexts = input.temporalContexts.map(
    validateCrossScaleTemporalContext,
  );
  const modelLinkages = input.modelLinkages.map(validateCrossScaleModelLinkage);
  const relationshipUncertainties = input.relationshipUncertainties.map(
    validateCrossScaleRelationshipUncertainty,
  );
  const versionedOntologyMappings = input.versionedOntologyMappings.map(
    validateVersionedOntologyMapping,
  );
  const bundles = input.bundles.map(validateCrossScaleLinkageBundle);
  const unsupportedCouplingCount = entityMappings.filter(
    (m) =>
      m.couplingStatus === "unsupported_coupling" ||
      m.couplingStatus === "uncertain_coupling" ||
      m.couplingStatus === "blocked_no_validated_coupling" ||
      m.couplingStatus === "association_only_not_causal",
  ).length;

  return {
    schema: CROSS_SCALE_ONTOLOGY_SCHEMA,
    method: CROSS_SCALE_ONTOLOGY_METHOD,
    version: CROSS_SCALE_ONTOLOGY_VERSION,
    asOf: input.asOf,
    biologicalScaleCount: CSOL_BIOLOGICAL_SCALES.length,
    capabilityKindCount: CSOL_CAPABILITY_KINDS.length,
    specCount: specs.length,
    entityMappingCount: entityMappings.length,
    biologicalContextCount: biologicalContexts.length,
    evidenceProvenanceCount: evidenceProvenance.length,
    temporalContextCount: temporalContexts.length,
    modelLinkageCount: modelLinkages.length,
    relationshipUncertaintyCount: relationshipUncertainties.length,
    versionedOntologyMappingCount: versionedOntologyMappings.length,
    bundleCount: bundles.length,
    unsupportedCouplingCount,
    honesty: {...DEFAULT_HONESTY},
    specs,
    entityMappings,
    biologicalContexts,
    evidenceProvenance,
    temporalContexts,
    modelLinkages,
    relationshipUncertainties,
    versionedOntologyMappings,
    bundles,
  };
}
