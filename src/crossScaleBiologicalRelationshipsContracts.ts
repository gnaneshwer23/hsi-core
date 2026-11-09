/**
 * Milestone 16 / PR3 — Cross-Scale Biological Relationships.
 *
 * Extends Human Biology / Physiology Graph contracts across scales:
 * molecular · cellular · tissue · organ · organ_system · clinical_phenotype ·
 * disease_outcome.
 *
 * Capabilities:
 * - cross-scale entity mapping
 * - mechanism provenance
 * - context-dependent relationship modelling
 * - directionality
 * - temporal relationships
 * - biological uncertainty
 * - alternative explanation detection
 *
 * Composes M15 CSOL (`hsi-csol-*`), M16 PR1 HSI (`hsi-hsys-*`), and M16 PR2
 * CDMI (`hsi-cdmi-*`) via id refs — no duplicate ontology registry.
 *
 * Binding honesty / fail-closed:
 * - Distinguish direct mechanistic evidence from indirect inference.
 * - Do not infer organ-level / disease-outcome claims from molecular
 *   associations without validated intermediate relationships.
 * - Do not convert all graph edges into causal links.
 * - No whole-body physiology claim; no PHI/CDS; Gate C auto-approve false;
 *   Neon red-wave only; migration deferred; fixtures ≠ scientific validation.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA =
  "hsi-cross-scale-biological-relationships-1" as const;
export const CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD =
  "hsi.cross_scale_biological_relationships.v1" as const;
export const CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION = "0.1.0" as const;

/** Physiology / biology graph scales for M16 PR3. */
export const CSBR_BIOLOGICAL_SCALES = [
  "molecular",
  "cellular",
  "tissue",
  "organ",
  "organ_system",
  "clinical_phenotype",
  "disease_outcome",
] as const;
export type CsbrBiologicalScale = (typeof CSBR_BIOLOGICAL_SCALES)[number];

export const CSBR_CAPABILITY_KINDS = [
  "cross_scale_entity_mapping",
  "mechanism_provenance",
  "context_dependent_relationship",
  "directionality",
  "temporal_relationship",
  "biological_uncertainty",
  "alternative_explanation_detection",
] as const;
export type CsbrCapabilityKind = (typeof CSBR_CAPABILITY_KINDS)[number];

export const CSBR_EVIDENCE_MODES = [
  "direct_mechanistic_evidence",
  "indirect_inference",
  "association_only",
  "unsupported",
] as const;
export type CsbrEvidenceMode = (typeof CSBR_EVIDENCE_MODES)[number];

export const CSBR_EDGE_KINDS = [
  "association_edge",
  "mechanistic_edge_declared",
  "temporal_edge",
  "context_dependent_edge",
  "uncertain_edge",
] as const;
export type CsbrEdgeKind = (typeof CSBR_EDGE_KINDS)[number];

export const CSBR_INTERMEDIATE_STATUSES = [
  "intermediates_validated_declared",
  "intermediates_missing",
  "intermediates_uncertain",
  "blocked_no_validated_intermediates",
  "not_applicable_adjacent_or_same_band",
] as const;
export type CsbrIntermediateStatus =
  (typeof CSBR_INTERMEDIATE_STATUSES)[number];

export const CSBR_MAPPING_OUTCOMES = [
  "supported",
  "unsupported",
  "uncertain",
] as const;
export type CsbrMappingOutcome = (typeof CSBR_MAPPING_OUTCOMES)[number];

export const CSBR_PROVENANCE_KINDS = [
  "fixture_declared",
  "literature_ref_declared",
  "curated_kg_ref_declared",
  "csol_provenance_ref",
  "cdmi_mechanism_ref",
  "explicitly_unresolved",
] as const;
export type CsbrProvenanceKind = (typeof CSBR_PROVENANCE_KINDS)[number];

export const CSBR_DIRECTIONALITY_ORDINALS = [
  "not_assessed",
  "forward_association_declared",
  "reverse_association_declared",
  "bidirectional_association_declared",
  "context_dependent_direction_declared",
  "insufficient_to_evaluate",
] as const;
export type CsbrDirectionalityOrdinal =
  (typeof CSBR_DIRECTIONALITY_ORDINALS)[number];

export const CSBR_TEMPORAL_KINDS = [
  "cross_sectional_declared",
  "precedes_declared",
  "follows_declared",
  "concurrent_declared",
  "interval_declared",
  "temporal_context_unknown",
] as const;
export type CsbrTemporalKind = (typeof CSBR_TEMPORAL_KINDS)[number];

export const CSBR_UNCERTAINTY_ORDINALS = [
  "not_assessed",
  "low_declared",
  "moderate_declared",
  "high_declared",
  "insufficient",
  "blocked",
] as const;
export type CsbrUncertaintyOrdinal =
  (typeof CSBR_UNCERTAINTY_ORDINALS)[number];

export const CSBR_ALTERNATIVE_STATUSES = [
  "none_detected_declared",
  "alternative_detected_declared",
  "competing_explanations_declared",
  "insufficient_to_detect",
] as const;
export type CsbrAlternativeStatus =
  (typeof CSBR_ALTERNATIVE_STATUSES)[number];

export const CSBR_DATASET_AVAILABILITIES = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type CsbrDatasetAvailability =
  (typeof CSBR_DATASET_AVAILABILITIES)[number];

export const CSBR_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type CsbrDataBasis = (typeof CSBR_DATA_BASES)[number];

export const CSBR_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CsbrActorKind = (typeof CSBR_ACTOR_KINDS)[number];

export const CSBR_PROFILE_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_missing_validated_intermediates",
  "rejected",
  "superseded",
] as const;
export type CsbrProfileLifecycle = (typeof CSBR_PROFILE_LIFECYCLES)[number];

const SCP_ID_RE = /^hsi-csbr-scp-[a-z0-9-]{3,80}$/;
const MAP_ID_RE = /^hsi-csbr-map-[a-z0-9-]{3,80}$/;
const PRV_ID_RE = /^hsi-csbr-prv-[a-z0-9-]{3,80}$/;
const CTX_ID_RE = /^hsi-csbr-ctx-[a-z0-9-]{3,80}$/;
const DIR_ID_RE = /^hsi-csbr-dir-[a-z0-9-]{3,80}$/;
const TMP_ID_RE = /^hsi-csbr-tmp-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-csbr-unc-[a-z0-9-]{3,80}$/;
const ALT_ID_RE = /^hsi-csbr-alt-[a-z0-9-]{3,80}$/;
const PRF_ID_RE = /^hsi-csbr-prf-[a-z0-9-]{3,80}$/;
const ENT_ID_RE = /^hsi-csbr-ent-[a-z0-9-]{3,80}$/;
const CSOL_REF_RE = /^hsi-csol-[a-z0-9-]{3,80}$/;
const HSYS_REF_RE = /^hsi-hsys-[a-z0-9-]{3,80}$/;
const CDMI_REF_RE = /^hsi-cdmi-[a-z0-9-]{3,80}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

/** Ordinal index for scale-distance / organ-outcome checks. */
const SCALE_ORDINAL: Record<CsbrBiologicalScale, number> = {
  molecular: 0,
  cellular: 1,
  tissue: 2,
  organ: 3,
  organ_system: 4,
  clinical_phenotype: 5,
  disease_outcome: 6,
};

export type CrossScaleBiologicalRelationshipsHonesty = {
  researchIntelligenceOnly: true;
  notDiagnosisOrTreatmentSelection: true;
  notClinicalDecisionMaking: true;
  directMechanisticEvidenceDistinctFromIndirectInference: true;
  molecularAssociationIsNotOrganOrDiseaseOutcome: true;
  organOutcomeRequiresValidatedIntermediates: true;
  graphEdgeIsNotCausalLink: true;
  wholeBodyPhysiologyClaimed: false;
  noInventedMechanismsOrStatistics: true;
  noPhiIngestion: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  causalLinksFromAllEdges: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type CsbrActor = {
  principalId: string;
  actorKind: CsbrActorKind;
};

export type CsbrEntityRef = {
  id: string;
  label: string;
  scale: CsbrBiologicalScale;
  ontologySystem: string | null;
  ontologyValue: string | null;
  note: string;
};

export type PhysiologyGraphScope = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  coveredScales: readonly CsbrBiologicalScale[];
  capabilityKinds: readonly CsbrCapabilityKind[];
  diseaseContextId: string | null;
  optionalCsolSpecId: string | null;
  optionalHsysOrganSystemRelationshipId: string | null;
  optionalCdmiComparativeProfileId: string | null;
  datasetAvailability: CsbrDatasetAvailability;
  wholeBodyPhysiologyClaimed: false;
  containsIdentifiablePhi: false;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleEntityMappingRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  sourceEntity: CsbrEntityRef;
  targetEntity: CsbrEntityRef;
  mappingOutcome: CsbrMappingOutcome;
  edgeKind: CsbrEdgeKind;
  evidenceMode: CsbrEvidenceMode;
  intermediateStatus: CsbrIntermediateStatus;
  relationshipSummary: string;
  molecularAssociationImpliesOrganOrDiseaseOutcome: false;
  graphEdgeIsCausalLink: false;
  optionalCsolMappingId: string | null;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MechanismProvenanceRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  provenanceKind: CsbrProvenanceKind;
  evidenceMode: CsbrEvidenceMode;
  provenanceSummary: string;
  evidenceRef: string;
  directMechanisticEvidenceDistinctFromIndirectInference: true;
  optionalCsolProvenanceId: string | null;
  optionalCdmiMechanismId: string | null;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ContextDependentRelationshipRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  contextSummary: string;
  contextLabel: string;
  contextDependent: true;
  edgeKind: "context_dependent_edge";
  evidenceMode: CsbrEvidenceMode;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleDirectionalityRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  directionalityOrdinal: CsbrDirectionalityOrdinal;
  evaluationSummary: string;
  graphEdgeIsCausalLink: false;
  causalDirectionProven: false;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TemporalRelationshipRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  temporalKind: CsbrTemporalKind;
  temporalSummary: string;
  intervalStart: string | null;
  intervalEnd: string | null;
  temporalImpliesCausal: false;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiologicalUncertaintyRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  uncertaintyOrdinal: CsbrUncertaintyOrdinal;
  uncertaintySummary: string;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AlternativeExplanationRecord = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  scopeId: string;
  relatedMappingId: string;
  alternativeStatus: CsbrAlternativeStatus;
  alternativeSummary: string;
  alternativeLabel: string | null;
  primaryExplanationCollapsed: false;
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleRelationshipProfile = {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  id: string;
  displayName: string;
  scopeId: string;
  entityMappingIds: readonly string[];
  mechanismProvenanceIds: readonly string[];
  contextDependentRelationshipIds: readonly string[];
  directionalityIds: readonly string[];
  temporalRelationshipIds: readonly string[];
  biologicalUncertaintyIds: readonly string[];
  alternativeExplanationIds: readonly string[];
  profileVersion: string;
  lifecycle: CsbrProfileLifecycle;
  reviewedBy: CsbrActor | null;
  wholeBodyPhysiologyClaimed: false;
  graphEdgeIsCausalLink: false;
  molecularAssociationImpliesOrganOrDiseaseOutcome: false;
  containsIdentifiablePhi: false;
  limitations: readonly string[];
  authoredBy: CsbrActor;
  dataBasis: CsbrDataBasis;
  fixtureHonesty: boolean;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CrossScaleBiologicalRelationshipsStore = {
  upsertPhysiologyGraphScope(
    record: PhysiologyGraphScope,
  ): PhysiologyGraphScope;
  getPhysiologyGraphScope(id: string): PhysiologyGraphScope | null;
  listPhysiologyGraphScopes(): readonly PhysiologyGraphScope[];
  upsertEntityMapping(
    record: CrossScaleEntityMappingRecord,
  ): CrossScaleEntityMappingRecord;
  getEntityMapping(id: string): CrossScaleEntityMappingRecord | null;
  listEntityMappings(scopeId?: string): readonly CrossScaleEntityMappingRecord[];
  upsertMechanismProvenance(
    record: MechanismProvenanceRecord,
  ): MechanismProvenanceRecord;
  getMechanismProvenance(id: string): MechanismProvenanceRecord | null;
  listMechanismProvenances(
    scopeId?: string,
  ): readonly MechanismProvenanceRecord[];
  upsertContextDependentRelationship(
    record: ContextDependentRelationshipRecord,
  ): ContextDependentRelationshipRecord;
  getContextDependentRelationship(
    id: string,
  ): ContextDependentRelationshipRecord | null;
  listContextDependentRelationships(
    scopeId?: string,
  ): readonly ContextDependentRelationshipRecord[];
  upsertDirectionality(
    record: CrossScaleDirectionalityRecord,
  ): CrossScaleDirectionalityRecord;
  getDirectionality(id: string): CrossScaleDirectionalityRecord | null;
  listDirectionalities(
    scopeId?: string,
  ): readonly CrossScaleDirectionalityRecord[];
  upsertTemporalRelationship(
    record: TemporalRelationshipRecord,
  ): TemporalRelationshipRecord;
  getTemporalRelationship(id: string): TemporalRelationshipRecord | null;
  listTemporalRelationships(
    scopeId?: string,
  ): readonly TemporalRelationshipRecord[];
  upsertBiologicalUncertainty(
    record: BiologicalUncertaintyRecord,
  ): BiologicalUncertaintyRecord;
  getBiologicalUncertainty(id: string): BiologicalUncertaintyRecord | null;
  listBiologicalUncertainties(
    scopeId?: string,
  ): readonly BiologicalUncertaintyRecord[];
  upsertAlternativeExplanation(
    record: AlternativeExplanationRecord,
  ): AlternativeExplanationRecord;
  getAlternativeExplanation(id: string): AlternativeExplanationRecord | null;
  listAlternativeExplanations(
    scopeId?: string,
  ): readonly AlternativeExplanationRecord[];
  upsertRelationshipProfile(
    record: CrossScaleRelationshipProfile,
  ): CrossScaleRelationshipProfile;
  getRelationshipProfile(id: string): CrossScaleRelationshipProfile | null;
  listRelationshipProfiles(
    scopeId?: string,
  ): readonly CrossScaleRelationshipProfile[];
};

const DEFAULT_HONESTY: CrossScaleBiologicalRelationshipsHonesty = {
  researchIntelligenceOnly: true,
  notDiagnosisOrTreatmentSelection: true,
  notClinicalDecisionMaking: true,
  directMechanisticEvidenceDistinctFromIndirectInference: true,
  molecularAssociationIsNotOrganOrDiseaseOutcome: true,
  organOutcomeRequiresValidatedIntermediates: true,
  graphEdgeIsNotCausalLink: true,
  wholeBodyPhysiologyClaimed: false,
  noInventedMechanismsOrStatistics: true,
  noPhiIngestion: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  causalLinksFromAllEdges: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const PROFILE_TRANSITIONS: Record<
  CsbrProfileLifecycle,
  readonly CsbrProfileLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_missing_validated_intermediates",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_missing_validated_intermediates",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_missing_validated_intermediates: ["draft", "rejected"],
  rejected: [],
  superseded: [],
};

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

function assertHonesty(
  honesty: CrossScaleBiologicalRelationshipsHonesty,
): void {
  if (honesty.researchIntelligenceOnly !== true) {
    throw Error("Research intelligence only");
  }
  if (honesty.notDiagnosisOrTreatmentSelection !== true) {
    throw Error("Diagnosis/treatment selection forbidden");
  }
  if (honesty.notClinicalDecisionMaking !== true) {
    throw Error("Clinical decision-making forbidden");
  }
  if (
    honesty.directMechanisticEvidenceDistinctFromIndirectInference !== true
  ) {
    throw Error(
      "Direct mechanistic evidence must stay distinct from indirect inference",
    );
  }
  if (honesty.molecularAssociationIsNotOrganOrDiseaseOutcome !== true) {
    throw Error(
      "Molecular association must not imply organ/disease outcome",
    );
  }
  if (honesty.organOutcomeRequiresValidatedIntermediates !== true) {
    throw Error(
      "Organ/disease outcome inference requires validated intermediates",
    );
  }
  if (honesty.graphEdgeIsNotCausalLink !== true) {
    throw Error("Graph edges must not auto-become causal links");
  }
  if (honesty.wholeBodyPhysiologyClaimed !== false) {
    throw Error("Whole-body physiology claims forbidden");
  }
  if (honesty.noInventedMechanismsOrStatistics !== true) {
    throw Error("Invented mechanisms/statistics forbidden");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR3");
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
    throw Error("Scientific approval must stay false in PR3");
  }
  if (honesty.causalLinksFromAllEdges !== false) {
    throw Error("Converting all edges to causal links is forbidden");
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

function stripHonestyNegations(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never|nor)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?|whole[- ]body\s+physiology|organ[- ]level\s+causal|disease[- ]outcome\s+causal|proven\s+causation|causal\s+link\s+from\s+all\s+edges)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+selection|treatment\s+recommendation|clinical\s+decision(?:[- ]making)?))*/g,
      " ",
    );
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = stripHonestyNegations(text);
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+selection\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bclinical\s+decision(?:[- ]making)?\b/.test(lower) ||
    /\bwhole[- ]body\s+(?:physiology|simulation|model)\b/.test(lower) ||
    /\borgan[- ]level\s+causal(?:\s+effect|\s+outcome)?\b/.test(lower) ||
    /\bdisease[- ]outcome\s+causal\b/.test(lower) ||
    /\ball\s+(?:graph\s+)?edges?\s+are\s+causal\b/.test(lower) ||
    /\bproven\s+causation\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhr\s*=\s*[\d.]+\b/.test(lower) ||
    /\bor\s*=\s*[\d.]+\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/select treatments, claim whole-body physiology, organ/disease-outcome causation without intermediates, convert all edges to causal, invent effect sizes, or include identifiers`,
    );
  }
}

function assertActor(actor: CsbrActor, label: string): CsbrActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, CSBR_ACTOR_KINDS, `${label} actorKind`);
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

function assertIdList(
  values: readonly string[],
  re: RegExp,
  label: string,
  maxItems: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
    if (seen.has(v)) throw Error(`Duplicate ${label}`);
    seen.add(v);
    return v;
  });
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

function dataBasisForDataset(
  availability: CsbrDatasetAvailability,
): CsbrDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  return "fixture_engineering";
}

/**
 * True when source is molecular/cellular and target reaches organ or higher
 * (including clinical phenotype / disease outcome).
 */
export function crossesToOrganOrDiseaseOutcome(
  source: CsbrBiologicalScale,
  target: CsbrBiologicalScale,
): boolean {
  assertClosed(source, CSBR_BIOLOGICAL_SCALES, "source scale");
  assertClosed(target, CSBR_BIOLOGICAL_SCALES, "target scale");
  return (
    SCALE_ORDINAL[source] <= SCALE_ORDINAL.cellular &&
    SCALE_ORDINAL[target] >= SCALE_ORDINAL.organ
  );
}

export function scaleDistance(
  source: CsbrBiologicalScale,
  target: CsbrBiologicalScale,
): number {
  assertClosed(source, CSBR_BIOLOGICAL_SCALES, "source scale");
  assertClosed(target, CSBR_BIOLOGICAL_SCALES, "target scale");
  return Math.abs(SCALE_ORDINAL[source] - SCALE_ORDINAL[target]);
}

function deriveIntermediateStatus(input: {
  sourceScale: CsbrBiologicalScale;
  targetScale: CsbrBiologicalScale;
  declaredStatus?: CsbrIntermediateStatus;
  claimOrganOrDiseaseOutcome?: boolean;
}): CsbrIntermediateStatus {
  const crosses = crossesToOrganOrDiseaseOutcome(
    input.sourceScale,
    input.targetScale,
  );
  if (!crosses) {
    if (
      input.declaredStatus &&
      input.declaredStatus !== "not_applicable_adjacent_or_same_band" &&
      input.declaredStatus !== "intermediates_validated_declared" &&
      input.declaredStatus !== "intermediates_uncertain" &&
      input.declaredStatus !== "intermediates_missing"
    ) {
      assertClosed(
        input.declaredStatus,
        CSBR_INTERMEDIATE_STATUSES,
        "intermediateStatus",
      );
    }
    return input.declaredStatus ?? "not_applicable_adjacent_or_same_band";
  }

  const status =
    input.declaredStatus ?? "blocked_no_validated_intermediates";
  assertClosed(status, CSBR_INTERMEDIATE_STATUSES, "intermediateStatus");

  if (
    input.claimOrganOrDiseaseOutcome === true &&
    status !== "intermediates_validated_declared"
  ) {
    throw Error(
      "Fail-closed: organ/disease-outcome inference from molecular/cellular associations requires validated intermediate relationships",
    );
  }
  if (
    status === "not_applicable_adjacent_or_same_band" &&
    crosses
  ) {
    throw Error(
      "Fail-closed: organ/disease-outcome cross-scale mapping cannot use not_applicable intermediate status",
    );
  }
  return status;
}

function refuseAllEdgesCausal(claimAllEdgesCausal?: boolean): void {
  if (claimAllEdgesCausal === true) {
    throw Error(
      "Fail-closed: graph edges must not all be converted into causal links",
    );
  }
}

function refuseWholeBody(claimWholeBody?: boolean): void {
  if (claimWholeBody === true) {
    throw Error("Fail-closed: whole-body physiology claims are forbidden");
  }
}

function refuseEvidenceModeCollapse(input: {
  evidenceMode: CsbrEvidenceMode;
  claimDirectWhenIndirect?: boolean;
}): void {
  if (
    input.claimDirectWhenIndirect === true &&
    (input.evidenceMode === "indirect_inference" ||
      input.evidenceMode === "association_only" ||
      input.evidenceMode === "unsupported")
  ) {
    throw Error(
      "Fail-closed: indirect inference / association_only / unsupported must not be collapsed into direct mechanistic evidence",
    );
  }
}

function assertEntityRef(entity: CsbrEntityRef): CsbrEntityRef {
  if (!ENT_ID_RE.test(entity.id)) throw Error("Invalid entity id");
  if (!textOk(entity.label, 200)) throw Error("Invalid entity label");
  assertNoForbiddenClaimLanguage(entity.label, "entity label");
  assertClosed(entity.scale, CSBR_BIOLOGICAL_SCALES, "entity scale");
  const ontologySystem =
    entity.ontologySystem === null || entity.ontologySystem === undefined
      ? null
      : (() => {
          if (!REF_ID_RE.test(entity.ontologySystem)) {
            throw Error("Invalid ontologySystem");
          }
          return entity.ontologySystem;
        })();
  const ontologyValue =
    entity.ontologyValue === null || entity.ontologyValue === undefined
      ? null
      : (() => {
          if (!REF_ID_RE.test(entity.ontologyValue)) {
            throw Error("Invalid ontologyValue");
          }
          return entity.ontologyValue;
        })();
  if ((ontologySystem === null) !== (ontologyValue === null)) {
    throw Error(
      "ontologySystem and ontologyValue must both be set or both null",
    );
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

export function draftPhysiologyGraphScope(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  coveredScales: readonly CsbrBiologicalScale[];
  capabilityKinds?: readonly CsbrCapabilityKind[];
  diseaseContextId?: string | null;
  optionalCsolSpecId?: string | null;
  optionalHsysOrganSystemRelationshipId?: string | null;
  optionalCdmiComparativeProfileId?: string | null;
  datasetAvailability?: CsbrDatasetAvailability;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimWholeBodyPhysiology?: boolean;
}): PhysiologyGraphScope {
  if (!SCP_ID_RE.test(input.id)) {
    throw Error("Invalid physiology graph scope id");
  }
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.scientificQuestion, 1000)) {
    throw Error("Invalid scientificQuestion");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  refuseWholeBody(input.claimWholeBodyPhysiology);
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );

  if (input.coveredScales.length < 2) {
    throw Error("At least 2 coveredScales required for cross-scale scope");
  }
  if (input.coveredScales.length > CSBR_BIOLOGICAL_SCALES.length) {
    throw Error("Too many coveredScales");
  }
  const seenScales = new Set<CsbrBiologicalScale>();
  for (const scale of input.coveredScales) {
    assertClosed(scale, CSBR_BIOLOGICAL_SCALES, "coveredScale");
    if (seenScales.has(scale)) throw Error("Duplicate coveredScale");
    seenScales.add(scale);
  }

  const capabilityKinds = input.capabilityKinds ?? [...CSBR_CAPABILITY_KINDS];
  if (capabilityKinds.length === 0) {
    throw Error("At least one capabilityKind required");
  }
  const seenCaps = new Set<CsbrCapabilityKind>();
  for (const kind of capabilityKinds) {
    assertClosed(kind, CSBR_CAPABILITY_KINDS, "capabilityKind");
    if (seenCaps.has(kind)) throw Error("Duplicate capabilityKind");
    seenCaps.add(kind);
  }

  const datasetAvailability =
    input.datasetAvailability ?? "fixture_only";
  assertClosed(
    datasetAvailability,
    CSBR_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );

  const record: PhysiologyGraphScope = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    coveredScales: [...input.coveredScales],
    capabilityKinds: [...capabilityKinds],
    diseaseContextId: assertOptionalId(
      input.diseaseContextId,
      HDI_CTX_RE,
      "diseaseContextId",
    ),
    optionalCsolSpecId: assertOptionalId(
      input.optionalCsolSpecId,
      CSOL_REF_RE,
      "optionalCsolSpecId",
    ),
    optionalHsysOrganSystemRelationshipId: assertOptionalId(
      input.optionalHsysOrganSystemRelationshipId,
      HSYS_REF_RE,
      "optionalHsysOrganSystemRelationshipId",
    ),
    optionalCdmiComparativeProfileId: assertOptionalId(
      input.optionalCdmiComparativeProfileId,
      CDMI_REF_RE,
      "optionalCdmiComparativeProfileId",
    ),
    datasetAvailability,
    wholeBodyPhysiologyClaimed: false,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForDataset(datasetAvailability),
    fixtureHonesty: datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePhysiologyGraphScope(record);
}

export function validatePhysiologyGraphScope(
  record: PhysiologyGraphScope,
): PhysiologyGraphScope {
  if (!SCP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.schema !== CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION) {
    throw Error("Invalid version");
  }
  if (!textOk(record.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(record.scientificQuestion, 1000)) {
    throw Error("Invalid scientificQuestion");
  }
  if (record.coveredScales.length < 2) {
    throw Error("At least 2 coveredScales required");
  }
  for (const scale of record.coveredScales) {
    assertClosed(scale, CSBR_BIOLOGICAL_SCALES, "coveredScale");
  }
  for (const kind of record.capabilityKinds) {
    assertClosed(kind, CSBR_CAPABILITY_KINDS, "capabilityKind");
  }
  assertClosed(
    record.datasetAvailability,
    CSBR_DATASET_AVAILABILITIES,
    "datasetAvailability",
  );
  assertClosed(record.dataBasis, CSBR_DATA_BASES, "dataBasis");
  if (record.wholeBodyPhysiologyClaimed !== false) {
    throw Error("Whole-body physiology claims forbidden");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(record.updatedAt)) throw Error("Invalid updatedAt");
  return record;
}

export function draftCrossScaleEntityMappingRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  sourceEntity: CsbrEntityRef;
  targetEntity: CsbrEntityRef;
  mappingOutcome: CsbrMappingOutcome;
  edgeKind: CsbrEdgeKind;
  evidenceMode: CsbrEvidenceMode;
  intermediateStatus?: CsbrIntermediateStatus;
  relationshipSummary: string;
  optionalCsolMappingId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimOrganOrDiseaseOutcome?: boolean;
  claimAllEdgesCausal?: boolean;
  claimDirectWhenIndirect?: boolean;
}): CrossScaleEntityMappingRecord {
  if (!MAP_ID_RE.test(input.id)) throw Error("Invalid entity mapping id");
  validatePhysiologyGraphScope(input.scope);
  assertClosed(input.mappingOutcome, CSBR_MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(input.edgeKind, CSBR_EDGE_KINDS, "edgeKind");
  assertClosed(input.evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");
  refuseAllEdgesCausal(input.claimAllEdgesCausal);
  refuseEvidenceModeCollapse({
    evidenceMode: input.evidenceMode,
    claimDirectWhenIndirect: input.claimDirectWhenIndirect,
  });

  const sourceEntity = assertEntityRef(input.sourceEntity);
  const targetEntity = assertEntityRef(input.targetEntity);
  if (sourceEntity.id === targetEntity.id) {
    throw Error("Source and target entity ids must differ");
  }
  if (
    !input.scope.coveredScales.includes(sourceEntity.scale) ||
    !input.scope.coveredScales.includes(targetEntity.scale)
  ) {
    throw Error("Entity scales must be covered by physiology graph scope");
  }

  const intermediateStatus = deriveIntermediateStatus({
    sourceScale: sourceEntity.scale,
    targetScale: targetEntity.scale,
    declaredStatus: input.intermediateStatus,
    claimOrganOrDiseaseOutcome: input.claimOrganOrDiseaseOutcome,
  });

  if (
    crossesToOrganOrDiseaseOutcome(sourceEntity.scale, targetEntity.scale) &&
    input.evidenceMode === "direct_mechanistic_evidence" &&
    intermediateStatus !== "intermediates_validated_declared"
  ) {
    throw Error(
      "Fail-closed: direct mechanistic evidence across molecular/cellular → organ/disease_outcome requires validated intermediates",
    );
  }

  if (
    input.edgeKind === "mechanistic_edge_declared" &&
    input.evidenceMode === "unsupported"
  ) {
    throw Error("Unsupported evidence cannot declare a mechanistic edge");
  }

  if (!textOk(input.relationshipSummary, 1000)) {
    throw Error("Invalid relationshipSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.relationshipSummary,
    "relationshipSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: CrossScaleEntityMappingRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    sourceEntity,
    targetEntity,
    mappingOutcome: input.mappingOutcome,
    edgeKind: input.edgeKind,
    evidenceMode: input.evidenceMode,
    intermediateStatus,
    relationshipSummary: input.relationshipSummary.trim(),
    molecularAssociationImpliesOrganOrDiseaseOutcome: false,
    graphEdgeIsCausalLink: false,
    optionalCsolMappingId: assertOptionalId(
      input.optionalCsolMappingId,
      CSOL_REF_RE,
      "optionalCsolMappingId",
    ),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleEntityMappingRecord(record);
}

export function validateCrossScaleEntityMappingRecord(
  record: CrossScaleEntityMappingRecord,
): CrossScaleEntityMappingRecord {
  if (!MAP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertEntityRef(record.sourceEntity);
  assertEntityRef(record.targetEntity);
  assertClosed(record.mappingOutcome, CSBR_MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(record.edgeKind, CSBR_EDGE_KINDS, "edgeKind");
  assertClosed(record.evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");
  assertClosed(
    record.intermediateStatus,
    CSBR_INTERMEDIATE_STATUSES,
    "intermediateStatus",
  );
  if (record.molecularAssociationImpliesOrganOrDiseaseOutcome !== false) {
    throw Error(
      "Molecular association must not imply organ/disease outcome",
    );
  }
  if (record.graphEdgeIsCausalLink !== false) {
    throw Error("Graph edge must not be treated as causal link");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftMechanismProvenanceRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  provenanceKind: CsbrProvenanceKind;
  evidenceMode: CsbrEvidenceMode;
  provenanceSummary: string;
  evidenceRef: string;
  optionalCsolProvenanceId?: string | null;
  optionalCdmiMechanismId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimDirectWhenIndirect?: boolean;
}): MechanismProvenanceRecord {
  if (!PRV_ID_RE.test(input.id)) throw Error("Invalid mechanism provenance id");
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  assertClosed(input.provenanceKind, CSBR_PROVENANCE_KINDS, "provenanceKind");
  assertClosed(input.evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");
  refuseEvidenceModeCollapse({
    evidenceMode: input.evidenceMode,
    claimDirectWhenIndirect: input.claimDirectWhenIndirect,
  });

  if (
    input.mapping.evidenceMode === "direct_mechanistic_evidence" &&
    input.evidenceMode === "indirect_inference"
  ) {
    // Allowed: provenance can refine/qualify a mapping's declared mode.
  }
  if (
    input.evidenceMode === "direct_mechanistic_evidence" &&
    input.mapping.evidenceMode === "indirect_inference" &&
    input.claimDirectWhenIndirect !== false
  ) {
    // Only refuse when caller tries to upgrade without explicit honesty.
    // Default path: refuse upgrade unless mapping already direct.
  }
  if (
    input.mapping.evidenceMode !== "direct_mechanistic_evidence" &&
    input.evidenceMode === "direct_mechanistic_evidence"
  ) {
    throw Error(
      "Fail-closed: provenance cannot upgrade mapping evidenceMode to direct_mechanistic_evidence",
    );
  }

  if (!textOk(input.provenanceSummary, 1000)) {
    throw Error("Invalid provenanceSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.provenanceSummary,
    "provenanceSummary",
  );
  if (!REF_ID_RE.test(input.evidenceRef)) throw Error("Invalid evidenceRef");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  if (
    input.provenanceKind === "csol_provenance_ref" &&
    !input.optionalCsolProvenanceId
  ) {
    throw Error("csol_provenance_ref requires optionalCsolProvenanceId");
  }
  if (
    input.provenanceKind === "cdmi_mechanism_ref" &&
    !input.optionalCdmiMechanismId
  ) {
    throw Error("cdmi_mechanism_ref requires optionalCdmiMechanismId");
  }

  const record: MechanismProvenanceRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    provenanceKind: input.provenanceKind,
    evidenceMode: input.evidenceMode,
    provenanceSummary: input.provenanceSummary.trim(),
    evidenceRef: input.evidenceRef,
    directMechanisticEvidenceDistinctFromIndirectInference: true,
    optionalCsolProvenanceId: assertOptionalId(
      input.optionalCsolProvenanceId,
      CSOL_REF_RE,
      "optionalCsolProvenanceId",
    ),
    optionalCdmiMechanismId: assertOptionalId(
      input.optionalCdmiMechanismId,
      CDMI_REF_RE,
      "optionalCdmiMechanismId",
    ),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMechanismProvenanceRecord(record);
}

export function validateMechanismProvenanceRecord(
  record: MechanismProvenanceRecord,
): MechanismProvenanceRecord {
  if (!PRV_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  if (!MAP_ID_RE.test(record.relatedMappingId)) {
    throw Error("Invalid relatedMappingId");
  }
  assertClosed(record.provenanceKind, CSBR_PROVENANCE_KINDS, "provenanceKind");
  assertClosed(record.evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");
  if (
    record.directMechanisticEvidenceDistinctFromIndirectInference !== true
  ) {
    throw Error(
      "Direct mechanistic evidence must stay distinct from indirect inference",
    );
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftContextDependentRelationshipRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  contextSummary: string;
  contextLabel: string;
  evidenceMode?: CsbrEvidenceMode;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
}): ContextDependentRelationshipRecord {
  if (!CTX_ID_RE.test(input.id)) {
    throw Error("Invalid context-dependent relationship id");
  }
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  if (!textOk(input.contextSummary, 1000)) {
    throw Error("Invalid contextSummary");
  }
  if (!textOk(input.contextLabel, 200)) throw Error("Invalid contextLabel");
  assertNoForbiddenClaimLanguage(input.contextSummary, "contextSummary");
  assertNoForbiddenClaimLanguage(input.contextLabel, "contextLabel");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const evidenceMode = input.evidenceMode ?? input.mapping.evidenceMode;
  assertClosed(evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");

  const record: ContextDependentRelationshipRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    contextSummary: input.contextSummary.trim(),
    contextLabel: input.contextLabel.trim(),
    contextDependent: true,
    edgeKind: "context_dependent_edge",
    evidenceMode,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateContextDependentRelationshipRecord(record);
}

export function validateContextDependentRelationshipRecord(
  record: ContextDependentRelationshipRecord,
): ContextDependentRelationshipRecord {
  if (!CTX_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.contextDependent !== true) {
    throw Error("contextDependent must be true");
  }
  if (record.edgeKind !== "context_dependent_edge") {
    throw Error("edgeKind must be context_dependent_edge");
  }
  assertClosed(record.evidenceMode, CSBR_EVIDENCE_MODES, "evidenceMode");
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftCrossScaleDirectionalityRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  directionalityOrdinal: CsbrDirectionalityOrdinal;
  evaluationSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimCausalDirectionProven?: boolean;
  claimAllEdgesCausal?: boolean;
}): CrossScaleDirectionalityRecord {
  if (!DIR_ID_RE.test(input.id)) throw Error("Invalid directionality id");
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  assertClosed(
    input.directionalityOrdinal,
    CSBR_DIRECTIONALITY_ORDINALS,
    "directionalityOrdinal",
  );
  refuseAllEdgesCausal(input.claimAllEdgesCausal);
  if (input.claimCausalDirectionProven === true) {
    throw Error(
      "Fail-closed: causal direction proven claims are forbidden — directionality is association-scoped",
    );
  }
  if (!textOk(input.evaluationSummary, 1000)) {
    throw Error("Invalid evaluationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.evaluationSummary,
    "evaluationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: CrossScaleDirectionalityRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    directionalityOrdinal: input.directionalityOrdinal,
    evaluationSummary: input.evaluationSummary.trim(),
    graphEdgeIsCausalLink: false,
    causalDirectionProven: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleDirectionalityRecord(record);
}

export function validateCrossScaleDirectionalityRecord(
  record: CrossScaleDirectionalityRecord,
): CrossScaleDirectionalityRecord {
  if (!DIR_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(
    record.directionalityOrdinal,
    CSBR_DIRECTIONALITY_ORDINALS,
    "directionalityOrdinal",
  );
  if (record.graphEdgeIsCausalLink !== false) {
    throw Error("Graph edge must not be treated as causal link");
  }
  if (record.causalDirectionProven !== false) {
    throw Error("Causal direction proven claims forbidden");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftTemporalRelationshipRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  temporalKind: CsbrTemporalKind;
  temporalSummary: string;
  intervalStart?: string | null;
  intervalEnd?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimTemporalImpliesCausal?: boolean;
}): TemporalRelationshipRecord {
  if (!TMP_ID_RE.test(input.id)) throw Error("Invalid temporal relationship id");
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  assertClosed(input.temporalKind, CSBR_TEMPORAL_KINDS, "temporalKind");
  if (input.claimTemporalImpliesCausal === true) {
    throw Error(
      "Fail-closed: temporal relationships must not imply causal links",
    );
  }
  if (!textOk(input.temporalSummary, 1000)) {
    throw Error("Invalid temporalSummary");
  }
  assertNoForbiddenClaimLanguage(input.temporalSummary, "temporalSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const intervalStart =
    input.intervalStart === undefined || input.intervalStart === null
      ? null
      : input.intervalStart;
  const intervalEnd =
    input.intervalEnd === undefined || input.intervalEnd === null
      ? null
      : input.intervalEnd;
  if (intervalStart !== null && !isIsoTimestamp(intervalStart)) {
    throw Error("Invalid intervalStart");
  }
  if (intervalEnd !== null && !isIsoTimestamp(intervalEnd)) {
    throw Error("Invalid intervalEnd");
  }
  if (
    input.temporalKind === "interval_declared" &&
    (intervalStart === null || intervalEnd === null)
  ) {
    throw Error("interval_declared requires intervalStart and intervalEnd");
  }

  const record: TemporalRelationshipRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    temporalKind: input.temporalKind,
    temporalSummary: input.temporalSummary.trim(),
    intervalStart,
    intervalEnd,
    temporalImpliesCausal: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateTemporalRelationshipRecord(record);
}

export function validateTemporalRelationshipRecord(
  record: TemporalRelationshipRecord,
): TemporalRelationshipRecord {
  if (!TMP_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.temporalKind, CSBR_TEMPORAL_KINDS, "temporalKind");
  if (record.temporalImpliesCausal !== false) {
    throw Error("Temporal relationships must not imply causal links");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftBiologicalUncertaintyRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  uncertaintyOrdinal: CsbrUncertaintyOrdinal;
  uncertaintySummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
}): BiologicalUncertaintyRecord {
  if (!UNC_ID_RE.test(input.id)) {
    throw Error("Invalid biological uncertainty id");
  }
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  assertClosed(
    input.uncertaintyOrdinal,
    CSBR_UNCERTAINTY_ORDINALS,
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

  const record: BiologicalUncertaintyRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    uncertaintySummary: input.uncertaintySummary.trim(),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateBiologicalUncertaintyRecord(record);
}

export function validateBiologicalUncertaintyRecord(
  record: BiologicalUncertaintyRecord,
): BiologicalUncertaintyRecord {
  if (!UNC_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(
    record.uncertaintyOrdinal,
    CSBR_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftAlternativeExplanationRecord(input: {
  id: string;
  scope: PhysiologyGraphScope;
  mapping: CrossScaleEntityMappingRecord;
  alternativeStatus: CsbrAlternativeStatus;
  alternativeSummary: string;
  alternativeLabel?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  collapsePrimaryExplanation?: boolean;
}): AlternativeExplanationRecord {
  if (!ALT_ID_RE.test(input.id)) {
    throw Error("Invalid alternative explanation id");
  }
  validatePhysiologyGraphScope(input.scope);
  validateCrossScaleEntityMappingRecord(input.mapping);
  if (input.mapping.scopeId !== input.scope.id) {
    throw Error("Mapping scopeId must match physiology graph scope");
  }
  assertClosed(
    input.alternativeStatus,
    CSBR_ALTERNATIVE_STATUSES,
    "alternativeStatus",
  );
  if (input.collapsePrimaryExplanation === true) {
    throw Error(
      "Fail-closed: alternative explanations must not collapse the primary explanation",
    );
  }
  if (!textOk(input.alternativeSummary, 1000)) {
    throw Error("Invalid alternativeSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.alternativeSummary,
    "alternativeSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const needsLabel =
    input.alternativeStatus === "alternative_detected_declared" ||
    input.alternativeStatus === "competing_explanations_declared";
  const alternativeLabel =
    input.alternativeLabel === undefined || input.alternativeLabel === null
      ? null
      : input.alternativeLabel.trim();
  if (needsLabel) {
    if (!alternativeLabel || !textOk(alternativeLabel, 200)) {
      throw Error(
        "alternativeLabel required when alternatives are detected",
      );
    }
    assertNoForbiddenClaimLanguage(alternativeLabel, "alternativeLabel");
  }

  const record: AlternativeExplanationRecord = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    scopeId: input.scope.id,
    relatedMappingId: input.mapping.id,
    alternativeStatus: input.alternativeStatus,
    alternativeSummary: input.alternativeSummary.trim(),
    alternativeLabel,
    primaryExplanationCollapsed: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAlternativeExplanationRecord(record);
}

export function validateAlternativeExplanationRecord(
  record: AlternativeExplanationRecord,
): AlternativeExplanationRecord {
  if (!ALT_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(
    record.alternativeStatus,
    CSBR_ALTERNATIVE_STATUSES,
    "alternativeStatus",
  );
  if (record.primaryExplanationCollapsed !== false) {
    throw Error("Primary explanation must not be collapsed");
  }
  assertActor(record.authoredBy, "authoredBy");
  assertHonesty(record.honesty);
  return record;
}

export function draftCrossScaleRelationshipProfile(input: {
  id: string;
  displayName: string;
  scope: PhysiologyGraphScope;
  entityMappings: readonly CrossScaleEntityMappingRecord[];
  mechanismProvenances: readonly MechanismProvenanceRecord[];
  contextDependentRelationships: readonly ContextDependentRelationshipRecord[];
  directionalities: readonly CrossScaleDirectionalityRecord[];
  temporalRelationships: readonly TemporalRelationshipRecord[];
  biologicalUncertainties: readonly BiologicalUncertaintyRecord[];
  alternativeExplanations: readonly AlternativeExplanationRecord[];
  profileVersion: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CsbrActorKind;
  createdAt: string;
  note?: string;
  claimWholeBodyPhysiology?: boolean;
  claimAllEdgesCausal?: boolean;
}): CrossScaleRelationshipProfile {
  if (!PRF_ID_RE.test(input.id)) {
    throw Error("Invalid cross-scale relationship profile id");
  }
  validatePhysiologyGraphScope(input.scope);
  refuseWholeBody(input.claimWholeBodyPhysiology);
  refuseAllEdgesCausal(input.claimAllEdgesCausal);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  if (!textOk(input.profileVersion, 40)) throw Error("Invalid profileVersion");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  for (const mapping of input.entityMappings) {
    validateCrossScaleEntityMappingRecord(mapping);
    if (mapping.scopeId !== input.scope.id) {
      throw Error("Entity mapping scopeId must match profile scope");
    }
  }
  for (const provenance of input.mechanismProvenances) {
    validateMechanismProvenanceRecord(provenance);
    if (provenance.scopeId !== input.scope.id) {
      throw Error("Provenance scopeId must match profile scope");
    }
  }
  for (const context of input.contextDependentRelationships) {
    validateContextDependentRelationshipRecord(context);
    if (context.scopeId !== input.scope.id) {
      throw Error("Context relationship scopeId must match profile scope");
    }
  }
  for (const direction of input.directionalities) {
    validateCrossScaleDirectionalityRecord(direction);
    if (direction.scopeId !== input.scope.id) {
      throw Error("Directionality scopeId must match profile scope");
    }
  }
  for (const temporal of input.temporalRelationships) {
    validateTemporalRelationshipRecord(temporal);
    if (temporal.scopeId !== input.scope.id) {
      throw Error("Temporal relationship scopeId must match profile scope");
    }
  }
  for (const uncertainty of input.biologicalUncertainties) {
    validateBiologicalUncertaintyRecord(uncertainty);
    if (uncertainty.scopeId !== input.scope.id) {
      throw Error("Uncertainty scopeId must match profile scope");
    }
  }
  for (const alternative of input.alternativeExplanations) {
    validateAlternativeExplanationRecord(alternative);
    if (alternative.scopeId !== input.scope.id) {
      throw Error("Alternative explanation scopeId must match profile scope");
    }
  }

  const missingIntermediates = input.entityMappings.some(
    (m) =>
      crossesToOrganOrDiseaseOutcome(
        m.sourceEntity.scale,
        m.targetEntity.scale,
      ) &&
      (m.intermediateStatus === "blocked_no_validated_intermediates" ||
        m.intermediateStatus === "intermediates_missing"),
  );

  let lifecycle: CsbrProfileLifecycle = "draft";
  if (
    input.scope.datasetAvailability ===
    "blocked_no_authorised_clinical_dataset"
  ) {
    lifecycle = "blocked_awaiting_authorised_dataset";
  } else if (missingIntermediates) {
    lifecycle = "blocked_missing_validated_intermediates";
  }

  const record: CrossScaleRelationshipProfile = {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scopeId: input.scope.id,
    entityMappingIds: assertIdList(
      input.entityMappings.map((m) => m.id),
      MAP_ID_RE,
      "entityMappingIds",
      64,
    ),
    mechanismProvenanceIds: assertIdList(
      input.mechanismProvenances.map((p) => p.id),
      PRV_ID_RE,
      "mechanismProvenanceIds",
      64,
    ),
    contextDependentRelationshipIds: assertIdList(
      input.contextDependentRelationships.map((c) => c.id),
      CTX_ID_RE,
      "contextDependentRelationshipIds",
      64,
    ),
    directionalityIds: assertIdList(
      input.directionalities.map((d) => d.id),
      DIR_ID_RE,
      "directionalityIds",
      64,
    ),
    temporalRelationshipIds: assertIdList(
      input.temporalRelationships.map((t) => t.id),
      TMP_ID_RE,
      "temporalRelationshipIds",
      64,
    ),
    biologicalUncertaintyIds: assertIdList(
      input.biologicalUncertainties.map((u) => u.id),
      UNC_ID_RE,
      "biologicalUncertaintyIds",
      64,
    ),
    alternativeExplanationIds: assertIdList(
      input.alternativeExplanations.map((a) => a.id),
      ALT_ID_RE,
      "alternativeExplanationIds",
      64,
    ),
    profileVersion: input.profileVersion.trim(),
    lifecycle,
    reviewedBy: null,
    wholeBodyPhysiologyClaimed: false,
    graphEdgeIsCausalLink: false,
    molecularAssociationImpliesOrganOrDiseaseOutcome: false,
    containsIdentifiablePhi: false,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.scope.dataBasis,
    fixtureHonesty: input.scope.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateCrossScaleRelationshipProfile(record);
}

export function validateCrossScaleRelationshipProfile(
  record: CrossScaleRelationshipProfile,
): CrossScaleRelationshipProfile {
  if (!PRF_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!SCP_ID_RE.test(record.scopeId)) throw Error("Invalid scopeId");
  assertClosed(record.lifecycle, CSBR_PROFILE_LIFECYCLES, "lifecycle");
  if (record.wholeBodyPhysiologyClaimed !== false) {
    throw Error("Whole-body physiology claims forbidden");
  }
  if (record.graphEdgeIsCausalLink !== false) {
    throw Error("Graph edge must not be treated as causal link");
  }
  if (record.molecularAssociationImpliesOrganOrDiseaseOutcome !== false) {
    throw Error(
      "Molecular association must not imply organ/disease outcome",
    );
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  assertLimitations(record.limitations);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  assertHonesty(record.honesty);
  return record;
}

export function transitionCrossScaleRelationshipProfile(input: {
  profile: CrossScaleRelationshipProfile;
  to: CsbrProfileLifecycle;
  updatedAt: string;
  actor: CsbrActor;
}): CrossScaleRelationshipProfile {
  const current = validateCrossScaleRelationshipProfile(input.profile);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = PROFILE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid cross-scale relationship profile transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    (actor.actorKind !== "human" ||
      current.lifecycle === "blocked_awaiting_authorised_dataset" ||
      current.lifecycle === "blocked_missing_validated_intermediates")
  ) {
    throw Error(
      "accepted_with_limitations requires human reviewer and non-blocked lifecycle",
    );
  }
  return validateCrossScaleRelationshipProfile({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "under_review"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryCrossScaleBiologicalRelationshipsStore(): CrossScaleBiologicalRelationshipsStore & {
  physiologyGraphScopes: Map<string, PhysiologyGraphScope>;
  entityMappings: Map<string, CrossScaleEntityMappingRecord>;
  mechanismProvenances: Map<string, MechanismProvenanceRecord>;
  contextDependentRelationships: Map<
    string,
    ContextDependentRelationshipRecord
  >;
  directionalities: Map<string, CrossScaleDirectionalityRecord>;
  temporalRelationships: Map<string, TemporalRelationshipRecord>;
  biologicalUncertainties: Map<string, BiologicalUncertaintyRecord>;
  alternativeExplanations: Map<string, AlternativeExplanationRecord>;
  relationshipProfiles: Map<string, CrossScaleRelationshipProfile>;
} {
  const physiologyGraphScopes = new Map<string, PhysiologyGraphScope>();
  const entityMappings = new Map<string, CrossScaleEntityMappingRecord>();
  const mechanismProvenances = new Map<string, MechanismProvenanceRecord>();
  const contextDependentRelationships = new Map<
    string,
    ContextDependentRelationshipRecord
  >();
  const directionalities = new Map<string, CrossScaleDirectionalityRecord>();
  const temporalRelationships = new Map<string, TemporalRelationshipRecord>();
  const biologicalUncertainties = new Map<
    string,
    BiologicalUncertaintyRecord
  >();
  const alternativeExplanations = new Map<
    string,
    AlternativeExplanationRecord
  >();
  const relationshipProfiles = new Map<string, CrossScaleRelationshipProfile>();

  const filterByScope = <T extends {scopeId: string}>(
    map: Map<string, T>,
    scopeId?: string,
  ): readonly T[] => {
    const all = [...map.values()];
    return scopeId ? all.filter((r) => r.scopeId === scopeId) : all;
  };

  return {
    physiologyGraphScopes,
    entityMappings,
    mechanismProvenances,
    contextDependentRelationships,
    directionalities,
    temporalRelationships,
    biologicalUncertainties,
    alternativeExplanations,
    relationshipProfiles,
    upsertPhysiologyGraphScope(record) {
      const validated = validatePhysiologyGraphScope(record);
      physiologyGraphScopes.set(validated.id, validated);
      return validated;
    },
    getPhysiologyGraphScope(id) {
      return physiologyGraphScopes.get(id) ?? null;
    },
    listPhysiologyGraphScopes() {
      return [...physiologyGraphScopes.values()];
    },
    upsertEntityMapping(record) {
      const validated = validateCrossScaleEntityMappingRecord(record);
      entityMappings.set(validated.id, validated);
      return validated;
    },
    getEntityMapping(id) {
      return entityMappings.get(id) ?? null;
    },
    listEntityMappings(scopeId) {
      return filterByScope(entityMappings, scopeId);
    },
    upsertMechanismProvenance(record) {
      const validated = validateMechanismProvenanceRecord(record);
      mechanismProvenances.set(validated.id, validated);
      return validated;
    },
    getMechanismProvenance(id) {
      return mechanismProvenances.get(id) ?? null;
    },
    listMechanismProvenances(scopeId) {
      return filterByScope(mechanismProvenances, scopeId);
    },
    upsertContextDependentRelationship(record) {
      const validated = validateContextDependentRelationshipRecord(record);
      contextDependentRelationships.set(validated.id, validated);
      return validated;
    },
    getContextDependentRelationship(id) {
      return contextDependentRelationships.get(id) ?? null;
    },
    listContextDependentRelationships(scopeId) {
      return filterByScope(contextDependentRelationships, scopeId);
    },
    upsertDirectionality(record) {
      const validated = validateCrossScaleDirectionalityRecord(record);
      directionalities.set(validated.id, validated);
      return validated;
    },
    getDirectionality(id) {
      return directionalities.get(id) ?? null;
    },
    listDirectionalities(scopeId) {
      return filterByScope(directionalities, scopeId);
    },
    upsertTemporalRelationship(record) {
      const validated = validateTemporalRelationshipRecord(record);
      temporalRelationships.set(validated.id, validated);
      return validated;
    },
    getTemporalRelationship(id) {
      return temporalRelationships.get(id) ?? null;
    },
    listTemporalRelationships(scopeId) {
      return filterByScope(temporalRelationships, scopeId);
    },
    upsertBiologicalUncertainty(record) {
      const validated = validateBiologicalUncertaintyRecord(record);
      biologicalUncertainties.set(validated.id, validated);
      return validated;
    },
    getBiologicalUncertainty(id) {
      return biologicalUncertainties.get(id) ?? null;
    },
    listBiologicalUncertainties(scopeId) {
      return filterByScope(biologicalUncertainties, scopeId);
    },
    upsertAlternativeExplanation(record) {
      const validated = validateAlternativeExplanationRecord(record);
      alternativeExplanations.set(validated.id, validated);
      return validated;
    },
    getAlternativeExplanation(id) {
      return alternativeExplanations.get(id) ?? null;
    },
    listAlternativeExplanations(scopeId) {
      return filterByScope(alternativeExplanations, scopeId);
    },
    upsertRelationshipProfile(record) {
      const validated = validateCrossScaleRelationshipProfile(record);
      relationshipProfiles.set(validated.id, validated);
      return validated;
    },
    getRelationshipProfile(id) {
      return relationshipProfiles.get(id) ?? null;
    },
    listRelationshipProfiles(scopeId) {
      return filterByScope(relationshipProfiles, scopeId);
    },
  };
}

export function projectCrossScaleBiologicalRelationshipsPersistenceLines(input: {
  physiologyGraphScopes: readonly PhysiologyGraphScope[];
  entityMappings?: readonly CrossScaleEntityMappingRecord[];
  mechanismProvenances?: readonly MechanismProvenanceRecord[];
  contextDependentRelationships?: readonly ContextDependentRelationshipRecord[];
  directionalities?: readonly CrossScaleDirectionalityRecord[];
  temporalRelationships?: readonly TemporalRelationshipRecord[];
  biologicalUncertainties?: readonly BiologicalUncertaintyRecord[];
  alternativeExplanations?: readonly AlternativeExplanationRecord[];
  relationshipProfiles?: readonly CrossScaleRelationshipProfile[];
}): string[] {
  for (const r of input.physiologyGraphScopes) {
    validatePhysiologyGraphScope(r);
  }
  for (const r of input.entityMappings ?? []) {
    validateCrossScaleEntityMappingRecord(r);
  }
  for (const r of input.mechanismProvenances ?? []) {
    validateMechanismProvenanceRecord(r);
  }
  for (const r of input.contextDependentRelationships ?? []) {
    validateContextDependentRelationshipRecord(r);
  }
  for (const r of input.directionalities ?? []) {
    validateCrossScaleDirectionalityRecord(r);
  }
  for (const r of input.temporalRelationships ?? []) {
    validateTemporalRelationshipRecord(r);
  }
  for (const r of input.biologicalUncertainties ?? []) {
    validateBiologicalUncertaintyRecord(r);
  }
  for (const r of input.alternativeExplanations ?? []) {
    validateAlternativeExplanationRecord(r);
  }
  for (const r of input.relationshipProfiles ?? []) {
    validateCrossScaleRelationshipProfile(r);
  }

  return [
    `schema=${CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA}`,
    `method=${CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD}`,
    `version=${CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION}`,
    `physiologyGraphScopes=${input.physiologyGraphScopes.length}`,
    `entityMappings=${(input.entityMappings ?? []).length}`,
    `mechanismProvenances=${(input.mechanismProvenances ?? []).length}`,
    `contextDependentRelationships=${(input.contextDependentRelationships ?? []).length}`,
    `directionalities=${(input.directionalities ?? []).length}`,
    `temporalRelationships=${(input.temporalRelationships ?? []).length}`,
    `biologicalUncertainties=${(input.biologicalUncertainties ?? []).length}`,
    `alternativeExplanations=${(input.alternativeExplanations ?? []).length}`,
    `relationshipProfiles=${(input.relationshipProfiles ?? []).length}`,
    `directMechanisticEvidenceDistinctFromIndirectInference=true`,
    `molecularAssociationIsNotOrganOrDiseaseOutcome=true`,
    `organOutcomeRequiresValidatedIntermediates=true`,
    `graphEdgeIsNotCausalLink=true`,
    `wholeBodyPhysiologyClaimed=false`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintCrossScaleRelationshipProfile(
  profile: CrossScaleRelationshipProfile,
): string {
  const validated = validateCrossScaleRelationshipProfile(profile);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildCrossScaleBiologicalRelationshipsPack(input: {
  physiologyGraphScopes: readonly PhysiologyGraphScope[];
  entityMappings: readonly CrossScaleEntityMappingRecord[];
  mechanismProvenances: readonly MechanismProvenanceRecord[];
  contextDependentRelationships: readonly ContextDependentRelationshipRecord[];
  directionalities: readonly CrossScaleDirectionalityRecord[];
  temporalRelationships: readonly TemporalRelationshipRecord[];
  biologicalUncertainties: readonly BiologicalUncertaintyRecord[];
  alternativeExplanations: readonly AlternativeExplanationRecord[];
  relationshipProfiles: readonly CrossScaleRelationshipProfile[];
  asOf: string;
}): {
  schema: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA;
  method: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD;
  version: typeof CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION;
  asOf: string;
  physiologyGraphScopeCount: number;
  entityMappingCount: number;
  mechanismProvenanceCount: number;
  contextDependentRelationshipCount: number;
  directionalityCount: number;
  temporalRelationshipCount: number;
  biologicalUncertaintyCount: number;
  alternativeExplanationCount: number;
  relationshipProfileCount: number;
  biologicalScaleCount: number;
  capabilityKindCount: number;
  honesty: CrossScaleBiologicalRelationshipsHonesty;
  physiologyGraphScopes: readonly PhysiologyGraphScope[];
  entityMappings: readonly CrossScaleEntityMappingRecord[];
  mechanismProvenances: readonly MechanismProvenanceRecord[];
  contextDependentRelationships: readonly ContextDependentRelationshipRecord[];
  directionalities: readonly CrossScaleDirectionalityRecord[];
  temporalRelationships: readonly TemporalRelationshipRecord[];
  biologicalUncertainties: readonly BiologicalUncertaintyRecord[];
  alternativeExplanations: readonly AlternativeExplanationRecord[];
  relationshipProfiles: readonly CrossScaleRelationshipProfile[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const physiologyGraphScopes = input.physiologyGraphScopes.map(
    validatePhysiologyGraphScope,
  );
  const entityMappings = input.entityMappings.map(
    validateCrossScaleEntityMappingRecord,
  );
  const mechanismProvenances = input.mechanismProvenances.map(
    validateMechanismProvenanceRecord,
  );
  const contextDependentRelationships =
    input.contextDependentRelationships.map(
      validateContextDependentRelationshipRecord,
    );
  const directionalities = input.directionalities.map(
    validateCrossScaleDirectionalityRecord,
  );
  const temporalRelationships = input.temporalRelationships.map(
    validateTemporalRelationshipRecord,
  );
  const biologicalUncertainties = input.biologicalUncertainties.map(
    validateBiologicalUncertaintyRecord,
  );
  const alternativeExplanations = input.alternativeExplanations.map(
    validateAlternativeExplanationRecord,
  );
  const relationshipProfiles = input.relationshipProfiles.map(
    validateCrossScaleRelationshipProfile,
  );

  return {
    schema: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_SCHEMA,
    method: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_METHOD,
    version: CROSS_SCALE_BIOLOGICAL_RELATIONSHIPS_VERSION,
    asOf: input.asOf,
    physiologyGraphScopeCount: physiologyGraphScopes.length,
    entityMappingCount: entityMappings.length,
    mechanismProvenanceCount: mechanismProvenances.length,
    contextDependentRelationshipCount: contextDependentRelationships.length,
    directionalityCount: directionalities.length,
    temporalRelationshipCount: temporalRelationships.length,
    biologicalUncertaintyCount: biologicalUncertainties.length,
    alternativeExplanationCount: alternativeExplanations.length,
    relationshipProfileCount: relationshipProfiles.length,
    biologicalScaleCount: CSBR_BIOLOGICAL_SCALES.length,
    capabilityKindCount: CSBR_CAPABILITY_KINDS.length,
    honesty: {...DEFAULT_HONESTY},
    physiologyGraphScopes,
    entityMappings,
    mechanismProvenances,
    contextDependentRelationships,
    directionalities,
    temporalRelationships,
    biologicalUncertainties,
    alternativeExplanations,
    relationshipProfiles,
  };
}
