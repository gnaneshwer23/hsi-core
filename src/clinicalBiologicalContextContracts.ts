/**
 * Milestone 15 / PR2 — Clinical and Biological Context Integration.
 *
 * Connects HSI Clinical + biomedical graph *services* via governed contracts:
 * resolve authorised research context → retrieve permitted longitudinal
 * clinical observations → retrieve public biological knowledge → map
 * clinical↔biology concepts → align temporal observations → assess quality →
 * identify missing measurements → record supported relationships → preserve
 * unsupported/uncertain mappings → produce a versioned integrated disease
 * context.
 *
 * Composes PR1 HDI disease-context / observation ids and optional M14 RWE /
 * LCE / interop temporal-alignment ids. References the privacy pattern in
 * `hsiClinicalBiologyBridge` without wiring live FHIR or patient facts into
 * the curated scientific KG.
 *
 * Binding honesty / fail-closed:
 * - Research decision support only; fixtures until authorised.
 * - Distinctions preserved: patient observation · population association ·
 *   established mechanism · computational inference · unvalidated hypothesis.
 * - Population association ≠ individual inference.
 * - Restricted patient observations must not promote to the public graph.
 * - No PHI ingestion, twin product, CDS/diagnosis/prescribing, Gate C / MoU,
 *   fabricated timelines, or live twin / multiscale claims.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA =
  "hsi-clinical-biological-context-1" as const;
export const CLINICAL_BIOLOGICAL_CONTEXT_METHOD =
  "hsi.clinical_biological_context.v1" as const;
export const CLINICAL_BIOLOGICAL_CONTEXT_VERSION = "0.1.0" as const;

export const KNOWLEDGE_LAYER_KINDS = [
  "patient_observation",
  "population_association",
  "established_mechanism",
  "computational_inference",
  "unvalidated_hypothesis",
] as const;
export type KnowledgeLayerKind = (typeof KNOWLEDGE_LAYER_KINDS)[number];

export const BIOLOGICAL_KNOWLEDGE_LAYER_KINDS = [
  "population_association",
  "established_mechanism",
  "computational_inference",
  "unvalidated_hypothesis",
] as const;
export type BiologicalKnowledgeLayerKind =
  (typeof BIOLOGICAL_KNOWLEDGE_LAYER_KINDS)[number];

export const RESEARCH_CONTEXT_RESOLUTION_STATUSES = [
  "resolved_fixture",
  "resolved_authorised_declared",
  "denied_no_authorisation",
  "blocked_no_authorised_dataset",
] as const;
export type ResearchContextResolutionStatus =
  (typeof RESEARCH_CONTEXT_RESOLUTION_STATUSES)[number];

export const CLINICAL_RETRIEVAL_SCOPES = [
  "fixture_longitudinal",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_retrieved",
] as const;
export type ClinicalRetrievalScope = (typeof CLINICAL_RETRIEVAL_SCOPES)[number];

export const BIOLOGY_RETRIEVAL_SCOPES = [
  "public_biomedical_fixture",
  "public_biomedical_approved",
  "blocked_patient_context_layer",
] as const;
export type BiologyRetrievalScope = (typeof BIOLOGY_RETRIEVAL_SCOPES)[number];

export const MAPPING_OUTCOMES = [
  "supported",
  "unsupported",
  "uncertain",
] as const;
export type MappingOutcome = (typeof MAPPING_OUTCOMES)[number];

export const MAPPING_CONFIDENCES = [
  "not_assessed",
  "low",
  "moderate",
  "high_declared_with_limitations",
  "insufficient",
] as const;
export type CbcMappingConfidence = (typeof MAPPING_CONFIDENCES)[number];

export const QUALITY_ORDINALS = [
  "not_assessed",
  "adequate_for_fixture_engineering",
  "adequate_with_limitations",
  "insufficient",
  "blocked",
] as const;
export type CbcQualityOrdinal = (typeof QUALITY_ORDINALS)[number];

export const MISSINGNESS_KINDS = [
  "measurement_absent",
  "measurement_not_applicable",
  "measurement_unknown",
  "temporal_gap",
] as const;
export type CbcMissingnessKind = (typeof MISSINGNESS_KINDS)[number];

export const INTEGRATED_CONTEXT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type IntegratedDiseaseContextLifecycle =
  (typeof INTEGRATED_CONTEXT_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type CbcActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type CbcDataBasis = (typeof DATA_BASES)[number];

const RES_ID_RE = /^hsi-cbc-res-[a-z0-9-]{3,80}$/;
const OBS_ID_RE = /^hsi-cbc-clr-[a-z0-9-]{3,80}$/;
const BIO_ID_RE = /^hsi-cbc-bio-[a-z0-9-]{3,80}$/;
const MAP_ID_RE = /^hsi-cbc-map-[a-z0-9-]{3,80}$/;
const TMP_ID_RE = /^hsi-cbc-tmp-[a-z0-9-]{3,80}$/;
const QLT_ID_RE = /^hsi-cbc-qlt-[a-z0-9-]{3,80}$/;
const MIS_ID_RE = /^hsi-cbc-mis-[a-z0-9-]{3,80}$/;
const REL_ID_RE = /^hsi-cbc-rel-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-cbc-unc-[a-z0-9-]{3,80}$/;
const IDC_ID_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const HDI_OBS_RE = /^hsi-hdi-obs-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_OBS_RE = /^hsi-rwe-obs-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;
const LCE_SERIES_RE = /^hsi-lce-ser-[a-z0-9-]{3,80}$/;
const SCDI_ALIGN_RE = /^hsi-scdi-tmp-[a-z0-9-]{3,80}$/;
const GRAPH_NODE_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;

export type ClinicalBiologicalContextHonesty = {
  researchDecisionSupportOnly: true;
  knowledgeLayersMustNotCollapse: true;
  populationAssociationIsNotIndividualInference: true;
  restrictedPatientObservationsMustNotPromoteToPublicGraph: true;
  noPhiIngestion: true;
  noLiveTwinOrMultiscaleClaim: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noFabricatedDiseaseTimelines: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type CbcActor = {
  principalId: string;
  actorKind: CbcActorKind;
};

export type AuthorisedResearchContextResolution = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  diseaseContextId: string;
  displayName: string;
  resolutionStatus: ResearchContextResolutionStatus;
  authorised: boolean;
  denyReason: string | null;
  datasetAvailabilityBlocked: boolean;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  containsIdentifiablePhi: false;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type PermittedClinicalObservationRetrieval = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  retrievalScope: ClinicalRetrievalScope;
  permitted: boolean;
  denyReason: string | null;
  clinicalConcept: string;
  knowledgeLayer: "patient_observation";
  subjectOrCohortRef: string;
  observedAt: string | null;
  hdiObservationId: string | null;
  rweObservationId: string | null;
  longitudinalSeriesId: string | null;
  restrictedPatientObservation: boolean;
  graphPromotable: false;
  containsIdentifiablePhi: false;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiologicalKnowledgeRetrieval = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  retrievalScope: BiologyRetrievalScope;
  permitted: boolean;
  denyReason: string | null;
  biologicalConcept: string;
  knowledgeLayer: BiologicalKnowledgeLayerKind;
  publicGraphNodeId: string | null;
  visibility: "public_biomedical";
  patientContextLayerExcluded: true;
  liveGraphQueryOperational: false;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ClinicalBiologicalConceptMapping = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  clinicalObservationRetrievalId: string;
  biologicalKnowledgeRetrievalId: string;
  clinicalConcept: string;
  biologicalConcept: string;
  mappingOutcome: MappingOutcome;
  mappingConfidence: CbcMappingConfidence;
  clinicalKnowledgeLayer: "patient_observation";
  biologicalKnowledgeLayer: BiologicalKnowledgeLayerKind;
  populationAssociationPromotedToIndividualInference: false;
  restrictedObservationPromotedToPublicGraph: false;
  liveLookupOperational: false;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TemporalObservationAlignment = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  clinicalObservationRetrievalIds: readonly string[];
  alignmentRule: string;
  alignedWindowStart: string | null;
  alignedWindowEnd: string | null;
  interopTemporalAlignmentId: string | null;
  longitudinalSeriesId: string | null;
  liveAlignmentOperational: false;
  fabricatedTimeline: null;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DataQualityAssessment = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  checksPerformed: readonly string[];
  qualityOrdinal: CbcQualityOrdinal;
  failures: readonly string[];
  fabricatedResults: null;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MissingMeasurementIdentification = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  missingConcept: string;
  missingnessKind: CbcMissingnessKind;
  rationale: string;
  relatedClinicalObservationRetrievalId: string | null;
  inventedMeasurementValue: null;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SupportedRelationshipRecord = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  conceptMappingId: string;
  relationshipSummary: string;
  knowledgeLayer: BiologicalKnowledgeLayerKind;
  mappingOutcome: "supported";
  populationAssociationIsNotIndividualInference: true;
  graphPromotable: false;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type UnsupportedUncertainMappingPreservation = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  researchContextResolutionId: string;
  diseaseContextId: string;
  conceptMappingId: string;
  mappingOutcome: "unsupported" | "uncertain";
  preservationReason: string;
  knowledgeLayer: KnowledgeLayerKind;
  discarded: false;
  inventedSupport: null;
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type IntegratedDiseaseContext = {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  researchContextResolutionId: string;
  clinicalObservationRetrievalIds: readonly string[];
  biologicalKnowledgeRetrievalIds: readonly string[];
  conceptMappingIds: readonly string[];
  temporalAlignmentIds: readonly string[];
  qualityAssessmentIds: readonly string[];
  missingMeasurementIds: readonly string[];
  supportedRelationshipIds: readonly string[];
  unsupportedUncertainMappingIds: readonly string[];
  contextVersion: string;
  lifecycle: IntegratedDiseaseContextLifecycle;
  reviewedBy: CbcActor | null;
  populationAssociationIsNotIndividualInference: true;
  restrictedPatientObservationsMustNotPromoteToPublicGraph: true;
  graphPromotable: false;
  containsIdentifiablePhi: false;
  liveTwinOperational: false;
  fabricatedTimeline: null;
  limitations: readonly string[];
  authoredBy: CbcActor;
  dataBasis: CbcDataBasis;
  fixtureHonesty: boolean;
  honesty: ClinicalBiologicalContextHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ClinicalBiologicalContextStore = {
  upsertResearchContextResolution(
    record: AuthorisedResearchContextResolution,
  ): AuthorisedResearchContextResolution;
  getResearchContextResolution(
    id: string,
  ): AuthorisedResearchContextResolution | null;
  listResearchContextResolutions(): readonly AuthorisedResearchContextResolution[];
  upsertClinicalObservationRetrieval(
    record: PermittedClinicalObservationRetrieval,
  ): PermittedClinicalObservationRetrieval;
  getClinicalObservationRetrieval(
    id: string,
  ): PermittedClinicalObservationRetrieval | null;
  listClinicalObservationRetrievals(
    diseaseContextId?: string,
  ): readonly PermittedClinicalObservationRetrieval[];
  upsertBiologicalKnowledgeRetrieval(
    record: BiologicalKnowledgeRetrieval,
  ): BiologicalKnowledgeRetrieval;
  getBiologicalKnowledgeRetrieval(
    id: string,
  ): BiologicalKnowledgeRetrieval | null;
  listBiologicalKnowledgeRetrievals(
    diseaseContextId?: string,
  ): readonly BiologicalKnowledgeRetrieval[];
  upsertConceptMapping(
    record: ClinicalBiologicalConceptMapping,
  ): ClinicalBiologicalConceptMapping;
  getConceptMapping(id: string): ClinicalBiologicalConceptMapping | null;
  listConceptMappings(
    diseaseContextId?: string,
  ): readonly ClinicalBiologicalConceptMapping[];
  upsertTemporalAlignment(
    record: TemporalObservationAlignment,
  ): TemporalObservationAlignment;
  getTemporalAlignment(id: string): TemporalObservationAlignment | null;
  listTemporalAlignments(
    diseaseContextId?: string,
  ): readonly TemporalObservationAlignment[];
  upsertQualityAssessment(
    record: DataQualityAssessment,
  ): DataQualityAssessment;
  getQualityAssessment(id: string): DataQualityAssessment | null;
  listQualityAssessments(
    diseaseContextId?: string,
  ): readonly DataQualityAssessment[];
  upsertMissingMeasurement(
    record: MissingMeasurementIdentification,
  ): MissingMeasurementIdentification;
  getMissingMeasurement(id: string): MissingMeasurementIdentification | null;
  listMissingMeasurements(
    diseaseContextId?: string,
  ): readonly MissingMeasurementIdentification[];
  upsertSupportedRelationship(
    record: SupportedRelationshipRecord,
  ): SupportedRelationshipRecord;
  getSupportedRelationship(id: string): SupportedRelationshipRecord | null;
  listSupportedRelationships(
    diseaseContextId?: string,
  ): readonly SupportedRelationshipRecord[];
  upsertUnsupportedUncertainMapping(
    record: UnsupportedUncertainMappingPreservation,
  ): UnsupportedUncertainMappingPreservation;
  getUnsupportedUncertainMapping(
    id: string,
  ): UnsupportedUncertainMappingPreservation | null;
  listUnsupportedUncertainMappings(
    diseaseContextId?: string,
  ): readonly UnsupportedUncertainMappingPreservation[];
  upsertIntegratedDiseaseContext(
    record: IntegratedDiseaseContext,
  ): IntegratedDiseaseContext;
  getIntegratedDiseaseContext(id: string): IntegratedDiseaseContext | null;
  listIntegratedDiseaseContexts(
    diseaseContextId?: string,
  ): readonly IntegratedDiseaseContext[];
};

const DEFAULT_HONESTY: ClinicalBiologicalContextHonesty = {
  researchDecisionSupportOnly: true,
  knowledgeLayersMustNotCollapse: true,
  populationAssociationIsNotIndividualInference: true,
  restrictedPatientObservationsMustNotPromoteToPublicGraph: true,
  noPhiIngestion: true,
  noLiveTwinOrMultiscaleClaim: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noFabricatedDiseaseTimelines: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const IDC_TRANSITIONS: Record<
  IntegratedDiseaseContextLifecycle,
  readonly IntegratedDiseaseContextLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
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

function assertHonesty(honesty: ClinicalBiologicalContextHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.knowledgeLayersMustNotCollapse !== true) {
    throw Error("Knowledge layers must not collapse");
  }
  if (honesty.populationAssociationIsNotIndividualInference !== true) {
    throw Error("Population association is not individual inference");
  }
  if (
    honesty.restrictedPatientObservationsMustNotPromoteToPublicGraph !== true
  ) {
    throw Error(
      "Restricted patient observations must not promote to public graph",
    );
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noLiveTwinOrMultiscaleClaim !== true) {
    throw Error("Live twin / multiscale claim forbidden");
  }
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noFabricatedDiseaseTimelines !== true) {
    throw Error("Fabricated disease timelines forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR2");
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
    throw Error("Scientific approval must stay false in PR2");
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
      /\b(?:not|no|without|never)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|personalised\s+treatment\s+effect|personalized\s+treatment\s+effect|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|fabricated\s+(?:timeline|trajectory)|individual\s+inference|patient[- ]specific\s+(?:mechanism|diagnosis))(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|live\s+(?:twin|multiscale\s+engine)|digital\s+twin\s+product|fabricated\s+(?:timeline|trajectory)|individual\s+inference))*/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bpersonalised\s+treatment\s+effect\b/.test(lower) ||
    /\bpersonalized\s+treatment\s+effect\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bdigital\s+twin\s+product\b/.test(lower) ||
    /\bfabricated\s+(?:timeline|trajectory)\b/.test(lower) ||
    /\bpatient[- ]specific\s+(?:mechanism|diagnosis)\b/.test(lower) ||
    /\bpromote[sd]?\s+to\s+(?:public\s+)?(?:graph|kg)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim live twin/multiscale, invent timelines/counts, promote patient facts to graph, or include identifiers`,
    );
  }
}

function assertActor(actor: CbcActor, label: string): CbcActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actorKind`);
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
  return values.map((v) => {
    if (!re.test(v)) throw Error(`Invalid ${label}`);
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

function assertSubjectOrCohortRef(ref: string): string {
  if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectOrCohortRef");
  const lower = ref.toLowerCase();
  if (
    /\bnhs[-_]?/.test(lower) ||
    /\bssn\b/.test(lower) ||
    /\bmrn\b/.test(lower) ||
    /\bpatient[-_]?name\b/.test(lower) ||
    /^\d{6,}$/.test(ref)
  ) {
    throw Error("Direct personal identifier patterns forbidden in subject ref");
  }
  return ref;
}

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((item, index) => {
    if (!textOk(item, maxLen)) throw Error(`Invalid ${label}[${index}]`);
    assertNoForbiddenClaimLanguage(item, `${label}[${index}]`);
    return item.trim();
  });
}

function dataBasisForResolution(
  status: ResearchContextResolutionStatus,
): CbcDataBasis {
  if (status === "resolved_authorised_declared") return "declared_research";
  return "fixture_engineering";
}

function refusePopulationAsIndividual(input: {
  biologicalKnowledgeLayer: KnowledgeLayerKind;
  claimedIndividualInference?: boolean;
}): void {
  if (
    input.biologicalKnowledgeLayer === "population_association" &&
    input.claimedIndividualInference === true
  ) {
    throw Error(
      "Fail-closed: population association must not become individual inference",
    );
  }
}

function refuseRestrictedPromotion(input: {
  restrictedPatientObservation: boolean;
  promoteToPublicGraph?: boolean;
}): void {
  if (
    input.restrictedPatientObservation &&
    input.promoteToPublicGraph === true
  ) {
    throw Error(
      "Fail-closed: restricted patient observations must not promote to public graph",
    );
  }
}

export function draftAuthorisedResearchContextResolution(input: {
  id: string;
  diseaseContextId: string;
  displayName: string;
  resolutionStatus: ResearchContextResolutionStatus;
  denyReason?: string | null;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): AuthorisedResearchContextResolution {
  if (!RES_ID_RE.test(input.id)) throw Error("Invalid research context resolution id");
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertClosed(
    input.resolutionStatus,
    RESEARCH_CONTEXT_RESOLUTION_STATUSES,
    "resolutionStatus",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");

  const authorised =
    input.resolutionStatus === "resolved_fixture" ||
    input.resolutionStatus === "resolved_authorised_declared";
  const datasetAvailabilityBlocked =
    input.resolutionStatus === "blocked_no_authorised_dataset";
  let denyReason: string | null = null;
  if (!authorised) {
    denyReason =
      input.denyReason?.trim() ||
      (input.resolutionStatus === "denied_no_authorisation"
        ? "Authorised research context not resolved"
        : "Authorised clinical/research dataset not supplied");
    if (!textOk(denyReason, 500)) throw Error("Invalid denyReason");
  } else if (input.denyReason) {
    throw Error("denyReason must be null when authorised");
  }

  if (
    input.resolutionStatus === "resolved_authorised_declared" &&
    !input.rweStudyId
  ) {
    throw Error(
      "resolved_authorised_declared requires declared rweStudyId composition",
    );
  }

  const record: AuthorisedResearchContextResolution = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    diseaseContextId: input.diseaseContextId,
    displayName: input.displayName.trim(),
    resolutionStatus: input.resolutionStatus,
    authorised,
    denyReason,
    datasetAvailabilityBlocked,
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForResolution(input.resolutionStatus),
    fixtureHonesty: input.resolutionStatus === "resolved_fixture",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateAuthorisedResearchContextResolution(record);
}

export function validateAuthorisedResearchContextResolution(
  record: AuthorisedResearchContextResolution,
): AuthorisedResearchContextResolution {
  if (record.schema !== CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA) {
    throw Error("Invalid schema");
  }
  if (record.method !== CLINICAL_BIOLOGICAL_CONTEXT_METHOD) {
    throw Error("Invalid method");
  }
  if (record.version !== CLINICAL_BIOLOGICAL_CONTEXT_VERSION) {
    throw Error("Invalid version");
  }
  if (!RES_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.resolutionStatus,
    RESEARCH_CONTEXT_RESOLUTION_STATUSES,
    "resolutionStatus",
  );
  const expectedAuthorised =
    record.resolutionStatus === "resolved_fixture" ||
    record.resolutionStatus === "resolved_authorised_declared";
  if (record.authorised !== expectedAuthorised) {
    throw Error("authorised flag inconsistent with resolutionStatus");
  }
  if (
    record.datasetAvailabilityBlocked !==
    (record.resolutionStatus === "blocked_no_authorised_dataset")
  ) {
    throw Error("datasetAvailabilityBlocked inconsistent");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("PHI forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (!isIsoTimestamp(record.createdAt) || !isIsoTimestamp(record.updatedAt)) {
    throw Error("Invalid timestamps");
  }
  return record;
}

export function draftPermittedClinicalObservationRetrieval(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  retrievalScope: ClinicalRetrievalScope;
  clinicalConcept: string;
  subjectOrCohortRef: string;
  observedAt?: string | null;
  hdiObservationId?: string | null;
  rweObservationId?: string | null;
  longitudinalSeriesId?: string | null;
  restrictedPatientObservation?: boolean;
  denyReason?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
  promoteToPublicGraph?: boolean;
}): PermittedClinicalObservationRetrieval {
  if (!OBS_ID_RE.test(input.id)) {
    throw Error("Invalid clinical observation retrieval id");
  }
  validateAuthorisedResearchContextResolution(input.researchContext);
  assertClosed(input.retrievalScope, CLINICAL_RETRIEVAL_SCOPES, "retrievalScope");
  if (!textOk(input.clinicalConcept, 300)) {
    throw Error("Invalid clinicalConcept");
  }
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const restricted =
    input.restrictedPatientObservation === true ||
    input.retrievalScope === "restricted_not_retrieved";
  refuseRestrictedPromotion({
    restrictedPatientObservation: restricted,
    promoteToPublicGraph: input.promoteToPublicGraph,
  });

  let permitted = input.researchContext.authorised;
  let denyReason: string | null = null;
  if (!input.researchContext.authorised) {
    permitted = false;
    denyReason =
      input.denyReason?.trim() ||
      "Research context not authorised for clinical observation retrieval";
  } else if (input.retrievalScope === "restricted_not_retrieved") {
    permitted = false;
    denyReason =
      input.denyReason?.trim() ||
      "Restricted patient observations not retrieved for public graph use";
  } else if (input.denyReason) {
    throw Error("denyReason must be null when retrieval permitted");
  }

  if (permitted && input.observedAt != null && !isIsoTimestamp(input.observedAt)) {
    throw Error("Invalid observedAt");
  }

  const record: PermittedClinicalObservationRetrieval = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    retrievalScope: input.retrievalScope,
    permitted,
    denyReason,
    clinicalConcept: input.clinicalConcept.trim(),
    knowledgeLayer: "patient_observation",
    subjectOrCohortRef: assertSubjectOrCohortRef(input.subjectOrCohortRef),
    observedAt: permitted ? (input.observedAt ?? null) : null,
    hdiObservationId: assertOptionalId(
      input.hdiObservationId,
      HDI_OBS_RE,
      "hdiObservationId",
    ),
    rweObservationId: assertOptionalId(
      input.rweObservationId,
      RWE_OBS_RE,
      "rweObservationId",
    ),
    longitudinalSeriesId: assertOptionalId(
      input.longitudinalSeriesId,
      LCE_SERIES_RE,
      "longitudinalSeriesId",
    ),
    restrictedPatientObservation: restricted,
    graphPromotable: false,
    containsIdentifiablePhi: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: input.retrievalScope === "fixture_longitudinal",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validatePermittedClinicalObservationRetrieval(record);
}

export function validatePermittedClinicalObservationRetrieval(
  record: PermittedClinicalObservationRetrieval,
): PermittedClinicalObservationRetrieval {
  if (!OBS_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!RES_ID_RE.test(record.researchContextResolutionId)) {
    throw Error("Invalid researchContextResolutionId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(record.retrievalScope, CLINICAL_RETRIEVAL_SCOPES, "retrievalScope");
  if (record.knowledgeLayer !== "patient_observation") {
    throw Error("Clinical retrieval knowledgeLayer must be patient_observation");
  }
  if (record.graphPromotable !== false) {
    throw Error("Clinical observations are not graph-promotable");
  }
  if (record.containsIdentifiablePhi !== false) throw Error("PHI forbidden");
  if (
    record.restrictedPatientObservation &&
    record.retrievalScope !== "restricted_not_retrieved" &&
    record.permitted
  ) {
    // Restricted rows may be retained as research envelopes but never graph-promoted.
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftBiologicalKnowledgeRetrieval(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  retrievalScope: BiologyRetrievalScope;
  biologicalConcept: string;
  knowledgeLayer: BiologicalKnowledgeLayerKind;
  publicGraphNodeId?: string | null;
  denyReason?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): BiologicalKnowledgeRetrieval {
  if (!BIO_ID_RE.test(input.id)) {
    throw Error("Invalid biological knowledge retrieval id");
  }
  validateAuthorisedResearchContextResolution(input.researchContext);
  assertClosed(input.retrievalScope, BIOLOGY_RETRIEVAL_SCOPES, "retrievalScope");
  assertClosed(
    input.knowledgeLayer,
    BIOLOGICAL_KNOWLEDGE_LAYER_KINDS,
    "knowledgeLayer",
  );
  if (!textOk(input.biologicalConcept, 300)) {
    throw Error("Invalid biologicalConcept");
  }
  assertNoForbiddenClaimLanguage(input.biologicalConcept, "biologicalConcept");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  let permitted = input.researchContext.authorised;
  let denyReason: string | null = null;
  if (!input.researchContext.authorised) {
    permitted = false;
    denyReason =
      input.denyReason?.trim() ||
      "Research context not authorised for biological knowledge retrieval";
  } else if (input.retrievalScope === "blocked_patient_context_layer") {
    permitted = false;
    denyReason =
      input.denyReason?.trim() ||
      "Patient-context graph layer blocked — public biomedical only";
  } else if (input.denyReason) {
    throw Error("denyReason must be null when retrieval permitted");
  }

  const nodeId = assertOptionalId(
    input.publicGraphNodeId,
    GRAPH_NODE_RE,
    "publicGraphNodeId",
  );
  if (permitted && !nodeId) {
    throw Error("publicGraphNodeId required when biological retrieval permitted");
  }

  const record: BiologicalKnowledgeRetrieval = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    retrievalScope: input.retrievalScope,
    permitted,
    denyReason,
    biologicalConcept: input.biologicalConcept.trim(),
    knowledgeLayer: input.knowledgeLayer,
    publicGraphNodeId: permitted ? nodeId : null,
    visibility: "public_biomedical",
    patientContextLayerExcluded: true,
    liveGraphQueryOperational: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis:
      input.retrievalScope === "public_biomedical_approved"
        ? "authorised_public_data"
        : "fixture_engineering",
    fixtureHonesty: input.retrievalScope === "public_biomedical_fixture",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateBiologicalKnowledgeRetrieval(record);
}

export function validateBiologicalKnowledgeRetrieval(
  record: BiologicalKnowledgeRetrieval,
): BiologicalKnowledgeRetrieval {
  if (!BIO_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.retrievalScope, BIOLOGY_RETRIEVAL_SCOPES, "retrievalScope");
  assertClosed(
    record.knowledgeLayer,
    BIOLOGICAL_KNOWLEDGE_LAYER_KINDS,
    "knowledgeLayer",
  );
  if (record.visibility !== "public_biomedical") {
    throw Error("Biological visibility must be public_biomedical");
  }
  if (record.patientContextLayerExcluded !== true) {
    throw Error("Patient-context layer must stay excluded");
  }
  if (record.liveGraphQueryOperational !== false) {
    throw Error("Live graph query must not be claimed");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftClinicalBiologicalConceptMapping(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  clinicalObservation: PermittedClinicalObservationRetrieval;
  biologicalKnowledge: BiologicalKnowledgeRetrieval;
  mappingOutcome: MappingOutcome;
  mappingConfidence: CbcMappingConfidence;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
  claimedIndividualInference?: boolean;
  promoteRestrictedToPublicGraph?: boolean;
}): ClinicalBiologicalConceptMapping {
  if (!MAP_ID_RE.test(input.id)) throw Error("Invalid concept mapping id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  validatePermittedClinicalObservationRetrieval(input.clinicalObservation);
  validateBiologicalKnowledgeRetrieval(input.biologicalKnowledge);
  if (
    input.clinicalObservation.diseaseContextId !==
      input.researchContext.diseaseContextId ||
    input.biologicalKnowledge.diseaseContextId !==
      input.researchContext.diseaseContextId
  ) {
    throw Error("Mapping diseaseContextId mismatch");
  }
  assertClosed(input.mappingOutcome, MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(input.mappingConfidence, MAPPING_CONFIDENCES, "mappingConfidence");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  refusePopulationAsIndividual({
    biologicalKnowledgeLayer: input.biologicalKnowledge.knowledgeLayer,
    claimedIndividualInference: input.claimedIndividualInference,
  });
  refuseRestrictedPromotion({
    restrictedPatientObservation:
      input.clinicalObservation.restrictedPatientObservation,
    promoteToPublicGraph: input.promoteRestrictedToPublicGraph,
  });

  if (
    input.mappingOutcome === "supported" &&
    (!input.clinicalObservation.permitted ||
      !input.biologicalKnowledge.permitted)
  ) {
    throw Error(
      "Supported mapping requires permitted clinical and biological retrievals",
    );
  }

  const record: ClinicalBiologicalConceptMapping = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    clinicalObservationRetrievalId: input.clinicalObservation.id,
    biologicalKnowledgeRetrievalId: input.biologicalKnowledge.id,
    clinicalConcept: input.clinicalObservation.clinicalConcept,
    biologicalConcept: input.biologicalKnowledge.biologicalConcept,
    mappingOutcome: input.mappingOutcome,
    mappingConfidence: input.mappingConfidence,
    clinicalKnowledgeLayer: "patient_observation",
    biologicalKnowledgeLayer: input.biologicalKnowledge.knowledgeLayer,
    populationAssociationPromotedToIndividualInference: false,
    restrictedObservationPromotedToPublicGraph: false,
    liveLookupOperational: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateClinicalBiologicalConceptMapping(record);
}

export function validateClinicalBiologicalConceptMapping(
  record: ClinicalBiologicalConceptMapping,
): ClinicalBiologicalConceptMapping {
  if (!MAP_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.mappingOutcome, MAPPING_OUTCOMES, "mappingOutcome");
  assertClosed(record.mappingConfidence, MAPPING_CONFIDENCES, "mappingConfidence");
  if (record.clinicalKnowledgeLayer !== "patient_observation") {
    throw Error("Clinical mapping layer must be patient_observation");
  }
  assertClosed(
    record.biologicalKnowledgeLayer,
    BIOLOGICAL_KNOWLEDGE_LAYER_KINDS,
    "biologicalKnowledgeLayer",
  );
  if (record.populationAssociationPromotedToIndividualInference !== false) {
    throw Error("Population association must not promote to individual inference");
  }
  if (record.restrictedObservationPromotedToPublicGraph !== false) {
    throw Error("Restricted observation must not promote to public graph");
  }
  if (record.liveLookupOperational !== false) {
    throw Error("Live lookup must not be claimed");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftTemporalObservationAlignment(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  clinicalObservations: readonly PermittedClinicalObservationRetrieval[];
  alignmentRule: string;
  alignedWindowStart?: string | null;
  alignedWindowEnd?: string | null;
  interopTemporalAlignmentId?: string | null;
  longitudinalSeriesId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): TemporalObservationAlignment {
  if (!TMP_ID_RE.test(input.id)) throw Error("Invalid temporal alignment id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  if (input.clinicalObservations.length === 0) {
    throw Error("At least one clinical observation required for alignment");
  }
  if (input.clinicalObservations.length > 32) {
    throw Error("Too many clinical observations for alignment");
  }
  for (const obs of input.clinicalObservations) {
    validatePermittedClinicalObservationRetrieval(obs);
    if (obs.diseaseContextId !== input.researchContext.diseaseContextId) {
      throw Error("Temporal alignment diseaseContextId mismatch");
    }
  }
  if (!textOk(input.alignmentRule, 500)) throw Error("Invalid alignmentRule");
  assertNoForbiddenClaimLanguage(input.alignmentRule, "alignmentRule");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (
    input.alignedWindowStart != null &&
    !isIsoTimestamp(input.alignedWindowStart)
  ) {
    throw Error("Invalid alignedWindowStart");
  }
  if (
    input.alignedWindowEnd != null &&
    !isIsoTimestamp(input.alignedWindowEnd)
  ) {
    throw Error("Invalid alignedWindowEnd");
  }
  if (
    input.alignedWindowStart &&
    input.alignedWindowEnd &&
    Date.parse(input.alignedWindowEnd) < Date.parse(input.alignedWindowStart)
  ) {
    throw Error("alignedWindowEnd before alignedWindowStart");
  }

  const record: TemporalObservationAlignment = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    clinicalObservationRetrievalIds: input.clinicalObservations.map((o) => o.id),
    alignmentRule: input.alignmentRule.trim(),
    alignedWindowStart: input.alignedWindowStart ?? null,
    alignedWindowEnd: input.alignedWindowEnd ?? null,
    interopTemporalAlignmentId: assertOptionalId(
      input.interopTemporalAlignmentId,
      SCDI_ALIGN_RE,
      "interopTemporalAlignmentId",
    ),
    longitudinalSeriesId: assertOptionalId(
      input.longitudinalSeriesId,
      LCE_SERIES_RE,
      "longitudinalSeriesId",
    ),
    liveAlignmentOperational: false,
    fabricatedTimeline: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateTemporalObservationAlignment(record);
}

export function validateTemporalObservationAlignment(
  record: TemporalObservationAlignment,
): TemporalObservationAlignment {
  if (!TMP_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.clinicalObservationRetrievalIds.length === 0) {
    throw Error("clinicalObservationRetrievalIds required");
  }
  assertIdList(
    record.clinicalObservationRetrievalIds,
    OBS_ID_RE,
    "clinicalObservationRetrievalId",
    32,
  );
  if (record.liveAlignmentOperational !== false) {
    throw Error("Live alignment must not be claimed");
  }
  if (record.fabricatedTimeline !== null) {
    throw Error("Fabricated timeline forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftDataQualityAssessment(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  checksPerformed: readonly string[];
  qualityOrdinal: CbcQualityOrdinal;
  failures?: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): DataQualityAssessment {
  if (!QLT_ID_RE.test(input.id)) throw Error("Invalid quality assessment id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  assertClosed(input.qualityOrdinal, QUALITY_ORDINALS, "qualityOrdinal");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const checks = assertStringList(input.checksPerformed, "checksPerformed", 24, 300);
  if (checks.length === 0) throw Error("checksPerformed required");
  const failures = assertStringList(input.failures ?? [], "failures", 24, 500);
  if (input.qualityOrdinal === "blocked" && failures.length === 0) {
    throw Error("blocked qualityOrdinal requires failures");
  }

  const record: DataQualityAssessment = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    checksPerformed: checks,
    qualityOrdinal: input.qualityOrdinal,
    failures,
    fabricatedResults: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDataQualityAssessment(record);
}

export function validateDataQualityAssessment(
  record: DataQualityAssessment,
): DataQualityAssessment {
  if (!QLT_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.qualityOrdinal, QUALITY_ORDINALS, "qualityOrdinal");
  if (record.fabricatedResults !== null) {
    throw Error("Fabricated quality results forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftMissingMeasurementIdentification(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  missingConcept: string;
  missingnessKind: CbcMissingnessKind;
  rationale: string;
  relatedClinicalObservationRetrievalId?: string | null;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): MissingMeasurementIdentification {
  if (!MIS_ID_RE.test(input.id)) throw Error("Invalid missing measurement id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  assertClosed(input.missingnessKind, MISSINGNESS_KINDS, "missingnessKind");
  if (!textOk(input.missingConcept, 300)) throw Error("Invalid missingConcept");
  if (!textOk(input.rationale, 1000)) throw Error("Invalid rationale");
  assertNoForbiddenClaimLanguage(input.missingConcept, "missingConcept");
  assertNoForbiddenClaimLanguage(input.rationale, "rationale");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: MissingMeasurementIdentification = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    missingConcept: input.missingConcept.trim(),
    missingnessKind: input.missingnessKind,
    rationale: input.rationale.trim(),
    relatedClinicalObservationRetrievalId: assertOptionalId(
      input.relatedClinicalObservationRetrievalId,
      OBS_ID_RE,
      "relatedClinicalObservationRetrievalId",
    ),
    inventedMeasurementValue: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMissingMeasurementIdentification(record);
}

export function validateMissingMeasurementIdentification(
  record: MissingMeasurementIdentification,
): MissingMeasurementIdentification {
  if (!MIS_ID_RE.test(record.id)) throw Error("Invalid id");
  assertClosed(record.missingnessKind, MISSINGNESS_KINDS, "missingnessKind");
  if (record.inventedMeasurementValue !== null) {
    throw Error("Invented measurement values forbidden");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftSupportedRelationshipRecord(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  conceptMapping: ClinicalBiologicalConceptMapping;
  relationshipSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): SupportedRelationshipRecord {
  if (!REL_ID_RE.test(input.id)) throw Error("Invalid supported relationship id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  validateClinicalBiologicalConceptMapping(input.conceptMapping);
  if (input.conceptMapping.mappingOutcome !== "supported") {
    throw Error("Supported relationship requires supported mappingOutcome");
  }
  if (!textOk(input.relationshipSummary, 1000)) {
    throw Error("Invalid relationshipSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.relationshipSummary,
    "relationshipSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: SupportedRelationshipRecord = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    conceptMappingId: input.conceptMapping.id,
    relationshipSummary: input.relationshipSummary.trim(),
    knowledgeLayer: input.conceptMapping.biologicalKnowledgeLayer,
    mappingOutcome: "supported",
    populationAssociationIsNotIndividualInference: true,
    graphPromotable: false,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateSupportedRelationshipRecord(record);
}

export function validateSupportedRelationshipRecord(
  record: SupportedRelationshipRecord,
): SupportedRelationshipRecord {
  if (!REL_ID_RE.test(record.id)) throw Error("Invalid id");
  if (record.mappingOutcome !== "supported") {
    throw Error("mappingOutcome must be supported");
  }
  if (record.populationAssociationIsNotIndividualInference !== true) {
    throw Error("Population association honesty required");
  }
  if (record.graphPromotable !== false) {
    throw Error("Supported relationships are not graph-promotable in PR2");
  }
  assertClosed(
    record.knowledgeLayer,
    BIOLOGICAL_KNOWLEDGE_LAYER_KINDS,
    "knowledgeLayer",
  );
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftUnsupportedUncertainMappingPreservation(input: {
  id: string;
  researchContext: AuthorisedResearchContextResolution;
  conceptMapping: ClinicalBiologicalConceptMapping;
  preservationReason: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): UnsupportedUncertainMappingPreservation {
  if (!UNC_ID_RE.test(input.id)) {
    throw Error("Invalid unsupported/uncertain mapping id");
  }
  validateAuthorisedResearchContextResolution(input.researchContext);
  validateClinicalBiologicalConceptMapping(input.conceptMapping);
  if (
    input.conceptMapping.mappingOutcome !== "unsupported" &&
    input.conceptMapping.mappingOutcome !== "uncertain"
  ) {
    throw Error(
      "Preservation record requires unsupported or uncertain mappingOutcome",
    );
  }
  if (!textOk(input.preservationReason, 1000)) {
    throw Error("Invalid preservationReason");
  }
  assertNoForbiddenClaimLanguage(
    input.preservationReason,
    "preservationReason",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: UnsupportedUncertainMappingPreservation = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    researchContextResolutionId: input.researchContext.id,
    diseaseContextId: input.researchContext.diseaseContextId,
    conceptMappingId: input.conceptMapping.id,
    mappingOutcome: input.conceptMapping.mappingOutcome,
    preservationReason: input.preservationReason.trim(),
    knowledgeLayer: input.conceptMapping.biologicalKnowledgeLayer,
    discarded: false,
    inventedSupport: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateUnsupportedUncertainMappingPreservation(record);
}

export function validateUnsupportedUncertainMappingPreservation(
  record: UnsupportedUncertainMappingPreservation,
): UnsupportedUncertainMappingPreservation {
  if (!UNC_ID_RE.test(record.id)) throw Error("Invalid id");
  if (
    record.mappingOutcome !== "unsupported" &&
    record.mappingOutcome !== "uncertain"
  ) {
    throw Error("mappingOutcome must be unsupported or uncertain");
  }
  if (record.discarded !== false) {
    throw Error("Unsupported/uncertain mappings must be preserved, not discarded");
  }
  if (record.inventedSupport !== null) {
    throw Error("Invented support forbidden");
  }
  assertClosed(record.knowledgeLayer, KNOWLEDGE_LAYER_KINDS, "knowledgeLayer");
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftIntegratedDiseaseContext(input: {
  id: string;
  displayName: string;
  researchContext: AuthorisedResearchContextResolution;
  clinicalObservations: readonly PermittedClinicalObservationRetrieval[];
  biologicalKnowledge: readonly BiologicalKnowledgeRetrieval[];
  conceptMappings: readonly ClinicalBiologicalConceptMapping[];
  temporalAlignments: readonly TemporalObservationAlignment[];
  qualityAssessments: readonly DataQualityAssessment[];
  missingMeasurements: readonly MissingMeasurementIdentification[];
  supportedRelationships: readonly SupportedRelationshipRecord[];
  unsupportedUncertainMappings: readonly UnsupportedUncertainMappingPreservation[];
  contextVersion: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: CbcActorKind;
  createdAt: string;
  note?: string;
}): IntegratedDiseaseContext {
  if (!IDC_ID_RE.test(input.id)) throw Error("Invalid integrated disease context id");
  validateAuthorisedResearchContextResolution(input.researchContext);
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(input.contextVersion)) {
    throw Error("Invalid contextVersion semver");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  for (const o of input.clinicalObservations) {
    validatePermittedClinicalObservationRetrieval(o);
  }
  for (const b of input.biologicalKnowledge) {
    validateBiologicalKnowledgeRetrieval(b);
  }
  for (const m of input.conceptMappings) {
    validateClinicalBiologicalConceptMapping(m);
  }
  for (const t of input.temporalAlignments) {
    validateTemporalObservationAlignment(t);
  }
  for (const q of input.qualityAssessments) {
    validateDataQualityAssessment(q);
  }
  for (const m of input.missingMeasurements) {
    validateMissingMeasurementIdentification(m);
  }
  for (const r of input.supportedRelationships) {
    validateSupportedRelationshipRecord(r);
  }
  for (const u of input.unsupportedUncertainMappings) {
    validateUnsupportedUncertainMappingPreservation(u);
  }

  const lifecycle: IntegratedDiseaseContextLifecycle =
    input.researchContext.datasetAvailabilityBlocked
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: IntegratedDiseaseContext = {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: input.researchContext.diseaseContextId,
    researchContextResolutionId: input.researchContext.id,
    clinicalObservationRetrievalIds: input.clinicalObservations.map((o) => o.id),
    biologicalKnowledgeRetrievalIds: input.biologicalKnowledge.map((b) => b.id),
    conceptMappingIds: input.conceptMappings.map((m) => m.id),
    temporalAlignmentIds: input.temporalAlignments.map((t) => t.id),
    qualityAssessmentIds: input.qualityAssessments.map((q) => q.id),
    missingMeasurementIds: input.missingMeasurements.map((m) => m.id),
    supportedRelationshipIds: input.supportedRelationships.map((r) => r.id),
    unsupportedUncertainMappingIds: input.unsupportedUncertainMappings.map(
      (u) => u.id,
    ),
    contextVersion: input.contextVersion,
    lifecycle,
    reviewedBy: null,
    populationAssociationIsNotIndividualInference: true,
    restrictedPatientObservationsMustNotPromoteToPublicGraph: true,
    graphPromotable: false,
    containsIdentifiablePhi: false,
    liveTwinOperational: false,
    fabricatedTimeline: null,
    limitations: assertLimitations(input.limitations),
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: input.researchContext.dataBasis,
    fixtureHonesty: input.researchContext.fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateIntegratedDiseaseContext(record);
}

export function validateIntegratedDiseaseContext(
  record: IntegratedDiseaseContext,
): IntegratedDiseaseContext {
  if (!IDC_ID_RE.test(record.id)) throw Error("Invalid id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!RES_ID_RE.test(record.researchContextResolutionId)) {
    throw Error("Invalid researchContextResolutionId");
  }
  assertClosed(
    record.lifecycle,
    INTEGRATED_CONTEXT_LIFECYCLES,
    "lifecycle",
  );
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(record.contextVersion)) {
    throw Error("Invalid contextVersion");
  }
  assertIdList(
    record.clinicalObservationRetrievalIds,
    OBS_ID_RE,
    "clinicalObservationRetrievalId",
    64,
  );
  assertIdList(
    record.biologicalKnowledgeRetrievalIds,
    BIO_ID_RE,
    "biologicalKnowledgeRetrievalId",
    64,
  );
  assertIdList(record.conceptMappingIds, MAP_ID_RE, "conceptMappingId", 64);
  assertIdList(record.temporalAlignmentIds, TMP_ID_RE, "temporalAlignmentId", 32);
  assertIdList(record.qualityAssessmentIds, QLT_ID_RE, "qualityAssessmentId", 32);
  assertIdList(record.missingMeasurementIds, MIS_ID_RE, "missingMeasurementId", 64);
  assertIdList(
    record.supportedRelationshipIds,
    REL_ID_RE,
    "supportedRelationshipId",
    64,
  );
  assertIdList(
    record.unsupportedUncertainMappingIds,
    UNC_ID_RE,
    "unsupportedUncertainMappingId",
    64,
  );
  if (record.populationAssociationIsNotIndividualInference !== true) {
    throw Error("Population association honesty required");
  }
  if (
    record.restrictedPatientObservationsMustNotPromoteToPublicGraph !== true
  ) {
    throw Error("Restricted observation promotion honesty required");
  }
  if (record.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (record.containsIdentifiablePhi !== false) throw Error("PHI forbidden");
  if (record.liveTwinOperational !== false) {
    throw Error("Live twin claim forbidden");
  }
  if (record.fabricatedTimeline !== null) {
    throw Error("Fabricated timeline forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionIntegratedDiseaseContext(input: {
  context: IntegratedDiseaseContext;
  to: IntegratedDiseaseContextLifecycle;
  updatedAt: string;
  actor: CbcActor;
}): IntegratedDiseaseContext {
  const current = validateIntegratedDiseaseContext(input.context);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "actor");
  const allowed = IDC_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Invalid integrated disease context transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    actor.actorKind !== "human"
  ) {
    throw Error("Human review required to accept integrated disease context");
  }
  if (
    current.lifecycle === "blocked_awaiting_authorised_dataset" &&
    input.to === "accepted_with_limitations"
  ) {
    throw Error(
      "Blocked integrated disease context cannot be accepted without authorised dataset",
    );
  }
  return validateIntegratedDiseaseContext({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryClinicalBiologicalContextStore(): ClinicalBiologicalContextStore & {
  researchContextResolutions: Map<string, AuthorisedResearchContextResolution>;
  clinicalObservationRetrievals: Map<
    string,
    PermittedClinicalObservationRetrieval
  >;
  biologicalKnowledgeRetrievals: Map<string, BiologicalKnowledgeRetrieval>;
  conceptMappings: Map<string, ClinicalBiologicalConceptMapping>;
  temporalAlignments: Map<string, TemporalObservationAlignment>;
  qualityAssessments: Map<string, DataQualityAssessment>;
  missingMeasurements: Map<string, MissingMeasurementIdentification>;
  supportedRelationships: Map<string, SupportedRelationshipRecord>;
  unsupportedUncertainMappings: Map<
    string,
    UnsupportedUncertainMappingPreservation
  >;
  integratedDiseaseContexts: Map<string, IntegratedDiseaseContext>;
} {
  const researchContextResolutions = new Map<
    string,
    AuthorisedResearchContextResolution
  >();
  const clinicalObservationRetrievals = new Map<
    string,
    PermittedClinicalObservationRetrieval
  >();
  const biologicalKnowledgeRetrievals = new Map<
    string,
    BiologicalKnowledgeRetrieval
  >();
  const conceptMappings = new Map<string, ClinicalBiologicalConceptMapping>();
  const temporalAlignments = new Map<string, TemporalObservationAlignment>();
  const qualityAssessments = new Map<string, DataQualityAssessment>();
  const missingMeasurements = new Map<
    string,
    MissingMeasurementIdentification
  >();
  const supportedRelationships = new Map<string, SupportedRelationshipRecord>();
  const unsupportedUncertainMappings = new Map<
    string,
    UnsupportedUncertainMappingPreservation
  >();
  const integratedDiseaseContexts = new Map<string, IntegratedDiseaseContext>();

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
    researchContextResolutions,
    clinicalObservationRetrievals,
    biologicalKnowledgeRetrievals,
    conceptMappings,
    temporalAlignments,
    qualityAssessments,
    missingMeasurements,
    supportedRelationships,
    unsupportedUncertainMappings,
    integratedDiseaseContexts,
    upsertResearchContextResolution(record) {
      const validated = validateAuthorisedResearchContextResolution(record);
      researchContextResolutions.set(validated.id, validated);
      return validated;
    },
    getResearchContextResolution(id) {
      return researchContextResolutions.get(id) ?? null;
    },
    listResearchContextResolutions() {
      return [...researchContextResolutions.values()];
    },
    upsertClinicalObservationRetrieval(record) {
      const validated = validatePermittedClinicalObservationRetrieval(record);
      clinicalObservationRetrievals.set(validated.id, validated);
      return validated;
    },
    getClinicalObservationRetrieval(id) {
      return clinicalObservationRetrievals.get(id) ?? null;
    },
    listClinicalObservationRetrievals(diseaseContextId) {
      return filterByDisease(clinicalObservationRetrievals, diseaseContextId);
    },
    upsertBiologicalKnowledgeRetrieval(record) {
      const validated = validateBiologicalKnowledgeRetrieval(record);
      biologicalKnowledgeRetrievals.set(validated.id, validated);
      return validated;
    },
    getBiologicalKnowledgeRetrieval(id) {
      return biologicalKnowledgeRetrievals.get(id) ?? null;
    },
    listBiologicalKnowledgeRetrievals(diseaseContextId) {
      return filterByDisease(biologicalKnowledgeRetrievals, diseaseContextId);
    },
    upsertConceptMapping(record) {
      const validated = validateClinicalBiologicalConceptMapping(record);
      conceptMappings.set(validated.id, validated);
      return validated;
    },
    getConceptMapping(id) {
      return conceptMappings.get(id) ?? null;
    },
    listConceptMappings(diseaseContextId) {
      return filterByDisease(conceptMappings, diseaseContextId);
    },
    upsertTemporalAlignment(record) {
      const validated = validateTemporalObservationAlignment(record);
      temporalAlignments.set(validated.id, validated);
      return validated;
    },
    getTemporalAlignment(id) {
      return temporalAlignments.get(id) ?? null;
    },
    listTemporalAlignments(diseaseContextId) {
      return filterByDisease(temporalAlignments, diseaseContextId);
    },
    upsertQualityAssessment(record) {
      const validated = validateDataQualityAssessment(record);
      qualityAssessments.set(validated.id, validated);
      return validated;
    },
    getQualityAssessment(id) {
      return qualityAssessments.get(id) ?? null;
    },
    listQualityAssessments(diseaseContextId) {
      return filterByDisease(qualityAssessments, diseaseContextId);
    },
    upsertMissingMeasurement(record) {
      const validated = validateMissingMeasurementIdentification(record);
      missingMeasurements.set(validated.id, validated);
      return validated;
    },
    getMissingMeasurement(id) {
      return missingMeasurements.get(id) ?? null;
    },
    listMissingMeasurements(diseaseContextId) {
      return filterByDisease(missingMeasurements, diseaseContextId);
    },
    upsertSupportedRelationship(record) {
      const validated = validateSupportedRelationshipRecord(record);
      supportedRelationships.set(validated.id, validated);
      return validated;
    },
    getSupportedRelationship(id) {
      return supportedRelationships.get(id) ?? null;
    },
    listSupportedRelationships(diseaseContextId) {
      return filterByDisease(supportedRelationships, diseaseContextId);
    },
    upsertUnsupportedUncertainMapping(record) {
      const validated = validateUnsupportedUncertainMappingPreservation(record);
      unsupportedUncertainMappings.set(validated.id, validated);
      return validated;
    },
    getUnsupportedUncertainMapping(id) {
      return unsupportedUncertainMappings.get(id) ?? null;
    },
    listUnsupportedUncertainMappings(diseaseContextId) {
      return filterByDisease(unsupportedUncertainMappings, diseaseContextId);
    },
    upsertIntegratedDiseaseContext(record) {
      const validated = validateIntegratedDiseaseContext(record);
      integratedDiseaseContexts.set(validated.id, validated);
      return validated;
    },
    getIntegratedDiseaseContext(id) {
      return integratedDiseaseContexts.get(id) ?? null;
    },
    listIntegratedDiseaseContexts(diseaseContextId) {
      return filterByDisease(integratedDiseaseContexts, diseaseContextId);
    },
  };
}

export function projectClinicalBiologicalContextPersistenceLines(input: {
  researchContextResolutions: readonly AuthorisedResearchContextResolution[];
  clinicalObservationRetrievals?: readonly PermittedClinicalObservationRetrieval[];
  biologicalKnowledgeRetrievals?: readonly BiologicalKnowledgeRetrieval[];
  conceptMappings?: readonly ClinicalBiologicalConceptMapping[];
  temporalAlignments?: readonly TemporalObservationAlignment[];
  qualityAssessments?: readonly DataQualityAssessment[];
  missingMeasurements?: readonly MissingMeasurementIdentification[];
  supportedRelationships?: readonly SupportedRelationshipRecord[];
  unsupportedUncertainMappings?: readonly UnsupportedUncertainMappingPreservation[];
  integratedDiseaseContexts?: readonly IntegratedDiseaseContext[];
}): string[] {
  for (const r of input.researchContextResolutions) {
    validateAuthorisedResearchContextResolution(r);
  }
  for (const o of input.clinicalObservationRetrievals ?? []) {
    validatePermittedClinicalObservationRetrieval(o);
  }
  for (const b of input.biologicalKnowledgeRetrievals ?? []) {
    validateBiologicalKnowledgeRetrieval(b);
  }
  for (const m of input.conceptMappings ?? []) {
    validateClinicalBiologicalConceptMapping(m);
  }
  for (const t of input.temporalAlignments ?? []) {
    validateTemporalObservationAlignment(t);
  }
  for (const q of input.qualityAssessments ?? []) {
    validateDataQualityAssessment(q);
  }
  for (const m of input.missingMeasurements ?? []) {
    validateMissingMeasurementIdentification(m);
  }
  for (const r of input.supportedRelationships ?? []) {
    validateSupportedRelationshipRecord(r);
  }
  for (const u of input.unsupportedUncertainMappings ?? []) {
    validateUnsupportedUncertainMappingPreservation(u);
  }
  for (const i of input.integratedDiseaseContexts ?? []) {
    validateIntegratedDiseaseContext(i);
  }

  return [
    `schema=${CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA}`,
    `method=${CLINICAL_BIOLOGICAL_CONTEXT_METHOD}`,
    `version=${CLINICAL_BIOLOGICAL_CONTEXT_VERSION}`,
    `researchContextResolutions=${input.researchContextResolutions.length}`,
    `clinicalObservationRetrievals=${(input.clinicalObservationRetrievals ?? []).length}`,
    `biologicalKnowledgeRetrievals=${(input.biologicalKnowledgeRetrievals ?? []).length}`,
    `conceptMappings=${(input.conceptMappings ?? []).length}`,
    `temporalAlignments=${(input.temporalAlignments ?? []).length}`,
    `qualityAssessments=${(input.qualityAssessments ?? []).length}`,
    `missingMeasurements=${(input.missingMeasurements ?? []).length}`,
    `supportedRelationships=${(input.supportedRelationships ?? []).length}`,
    `unsupportedUncertainMappings=${(input.unsupportedUncertainMappings ?? []).length}`,
    `integratedDiseaseContexts=${(input.integratedDiseaseContexts ?? []).length}`,
    `knowledgeLayersMustNotCollapse=true`,
    `populationAssociationIsNotIndividualInference=true`,
    `restrictedPatientObservationsMustNotPromoteToPublicGraph=true`,
    `noPhiIngestion=true`,
    `noLiveTwinOrMultiscaleClaim=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintIntegratedDiseaseContext(
  context: IntegratedDiseaseContext,
): string {
  const validated = validateIntegratedDiseaseContext(context);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildClinicalBiologicalContextPack(input: {
  researchContextResolutions: readonly AuthorisedResearchContextResolution[];
  clinicalObservationRetrievals: readonly PermittedClinicalObservationRetrieval[];
  biologicalKnowledgeRetrievals: readonly BiologicalKnowledgeRetrieval[];
  conceptMappings: readonly ClinicalBiologicalConceptMapping[];
  temporalAlignments: readonly TemporalObservationAlignment[];
  qualityAssessments: readonly DataQualityAssessment[];
  missingMeasurements: readonly MissingMeasurementIdentification[];
  supportedRelationships: readonly SupportedRelationshipRecord[];
  unsupportedUncertainMappings: readonly UnsupportedUncertainMappingPreservation[];
  integratedDiseaseContexts: readonly IntegratedDiseaseContext[];
  asOf: string;
}): {
  schema: typeof CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA;
  method: typeof CLINICAL_BIOLOGICAL_CONTEXT_METHOD;
  version: typeof CLINICAL_BIOLOGICAL_CONTEXT_VERSION;
  asOf: string;
  researchContextResolutionCount: number;
  clinicalObservationRetrievalCount: number;
  biologicalKnowledgeRetrievalCount: number;
  conceptMappingCount: number;
  temporalAlignmentCount: number;
  qualityAssessmentCount: number;
  missingMeasurementCount: number;
  supportedRelationshipCount: number;
  unsupportedUncertainMappingCount: number;
  integratedDiseaseContextCount: number;
  honesty: ClinicalBiologicalContextHonesty;
  researchContextResolutions: readonly AuthorisedResearchContextResolution[];
  clinicalObservationRetrievals: readonly PermittedClinicalObservationRetrieval[];
  biologicalKnowledgeRetrievals: readonly BiologicalKnowledgeRetrieval[];
  conceptMappings: readonly ClinicalBiologicalConceptMapping[];
  temporalAlignments: readonly TemporalObservationAlignment[];
  qualityAssessments: readonly DataQualityAssessment[];
  missingMeasurements: readonly MissingMeasurementIdentification[];
  supportedRelationships: readonly SupportedRelationshipRecord[];
  unsupportedUncertainMappings: readonly UnsupportedUncertainMappingPreservation[];
  integratedDiseaseContexts: readonly IntegratedDiseaseContext[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const researchContextResolutions = input.researchContextResolutions.map(
    validateAuthorisedResearchContextResolution,
  );
  const clinicalObservationRetrievals = input.clinicalObservationRetrievals.map(
    validatePermittedClinicalObservationRetrieval,
  );
  const biologicalKnowledgeRetrievals = input.biologicalKnowledgeRetrievals.map(
    validateBiologicalKnowledgeRetrieval,
  );
  const conceptMappings = input.conceptMappings.map(
    validateClinicalBiologicalConceptMapping,
  );
  const temporalAlignments = input.temporalAlignments.map(
    validateTemporalObservationAlignment,
  );
  const qualityAssessments = input.qualityAssessments.map(
    validateDataQualityAssessment,
  );
  const missingMeasurements = input.missingMeasurements.map(
    validateMissingMeasurementIdentification,
  );
  const supportedRelationships = input.supportedRelationships.map(
    validateSupportedRelationshipRecord,
  );
  const unsupportedUncertainMappings = input.unsupportedUncertainMappings.map(
    validateUnsupportedUncertainMappingPreservation,
  );
  const integratedDiseaseContexts = input.integratedDiseaseContexts.map(
    validateIntegratedDiseaseContext,
  );
  return {
    schema: CLINICAL_BIOLOGICAL_CONTEXT_SCHEMA,
    method: CLINICAL_BIOLOGICAL_CONTEXT_METHOD,
    version: CLINICAL_BIOLOGICAL_CONTEXT_VERSION,
    asOf: input.asOf,
    researchContextResolutionCount: researchContextResolutions.length,
    clinicalObservationRetrievalCount: clinicalObservationRetrievals.length,
    biologicalKnowledgeRetrievalCount: biologicalKnowledgeRetrievals.length,
    conceptMappingCount: conceptMappings.length,
    temporalAlignmentCount: temporalAlignments.length,
    qualityAssessmentCount: qualityAssessments.length,
    missingMeasurementCount: missingMeasurements.length,
    supportedRelationshipCount: supportedRelationships.length,
    unsupportedUncertainMappingCount: unsupportedUncertainMappings.length,
    integratedDiseaseContextCount: integratedDiseaseContexts.length,
    honesty: {...DEFAULT_HONESTY},
    researchContextResolutions,
    clinicalObservationRetrievals,
    biologicalKnowledgeRetrievals,
    conceptMappings,
    temporalAlignments,
    qualityAssessments,
    missingMeasurements,
    supportedRelationships,
    unsupportedUncertainMappings,
    integratedDiseaseContexts,
  };
}
