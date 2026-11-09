/**
 * Milestone 15 / PR1 — Integrated Disease Intelligence Contracts.
 *
 * Governed envelopes for disease research context, observed disease-state
 * facts, inferred disease-state estimates, access-scoped digital patient
 * *research* models, and research-only simulation scenarios — composing
 * optional M14 RWE / longitudinal / (reserved) cohort ids.
 *
 * Does NOT ship a separate digital twin product, run autonomous
 * diagnosis/prescribing/treatment, ingest live PHI, fabricate disease
 * timelines, claim personalised treatment effects, claim a live M11
 * multiscale engine, invent Gate C / MoU, or promote identifiable records
 * into the curated scientific KG.
 *
 * Binding honesty:
 * - Research decision support only.
 * - Observed ≠ inferred.
 * - Population association ≠ individual truth.
 * - Synthetic/fixture patients ≠ scientific validation when authorised
 *   dataset is blocked.
 * - Pseudonymised data may still be personal data.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const HUMAN_DISEASE_INTELLIGENCE_SCHEMA =
  "hsi-human-disease-intelligence-1" as const;
export const HUMAN_DISEASE_INTELLIGENCE_METHOD =
  "hsi.human_disease_intelligence.v1" as const;
export const HUMAN_DISEASE_INTELLIGENCE_VERSION = "0.1.0" as const;

export const DISEASE_CONTEXT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_for_further_research",
  "blocked_awaiting_authorised_dataset",
  "superseded",
  "retired",
  "rejected",
] as const;
export type DiseaseContextLifecycle =
  (typeof DISEASE_CONTEXT_LIFECYCLES)[number];

export const MODEL_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "rejected",
  "superseded",
] as const;
export type DigitalPatientModelLifecycle = (typeof MODEL_LIFECYCLES)[number];

export const SCENARIO_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_no_live_multiscale_engine",
  "rejected",
  "superseded",
] as const;
export type SimulationScenarioLifecycle = (typeof SCENARIO_LIFECYCLES)[number];

export const EPISTEMIC_STATUSES = ["observed", "inferred"] as const;
export type EpistemicStatus = (typeof EPISTEMIC_STATUSES)[number];

export const DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type DiseaseDatasetAvailability =
  (typeof DATASET_AVAILABILITY)[number];

export const ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type DiseaseAccessClassification =
  (typeof ACCESS_CLASSIFICATIONS)[number];

export const PERMITTED_RESEARCH_USES = [
  "disease_mechanism_research",
  "observational_association_research",
  "biomarker_hypothesis_research",
  "trial_concept_research",
  "population_simulation_research",
  "methods_engineering_fixture",
] as const;
export type PermittedResearchUse = (typeof PERMITTED_RESEARCH_USES)[number];

export const MISSINGNESS_STATUSES = [
  "observed",
  "missing",
  "not_applicable",
  "unknown",
] as const;
export type DiseaseMissingnessStatus = (typeof MISSINGNESS_STATUSES)[number];

export const ESTIMATE_METHODS = [
  "literature_prior_declared",
  "cohort_association_declared",
  "model_based_declared",
  "expert_elicitation_declared",
  "other_declared",
] as const;
export type DiseaseEstimateMethod = (typeof ESTIMATE_METHODS)[number];

export const CONFIDENCE_ORDINALS = [
  "not_assessed",
  "low",
  "moderate",
  "high_declared_with_limitations",
  "insufficient",
] as const;
export type DiseaseConfidenceOrdinal = (typeof CONFIDENCE_ORDINALS)[number];

export const SUBJECT_REF_KINDS = [
  "pseudonymous_subject",
  "cohort_aggregate",
] as const;
export type DiseaseSubjectRefKind = (typeof SUBJECT_REF_KINDS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type DiseaseActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type DiseaseDataBasis = (typeof DATA_BASES)[number];

const CTX_ID_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const OBS_ID_RE = /^hsi-hdi-obs-[a-z0-9-]{3,80}$/;
const EST_ID_RE = /^hsi-hdi-est-[a-z0-9-]{3,80}$/;
const DPM_ID_RE = /^hsi-hdi-dpm-[a-z0-9-]{3,80}$/;
const SIM_ID_RE = /^hsi-hdi-sim-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const RWE_OBS_RE = /^hsi-rwe-obs-[a-z0-9-]{3,80}$/;
const RWE_ANL_RE = /^hsi-rwe-anl-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;
const LCE_RES_RE = /^hsi-lce-res-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const M13_TD_PROG_RE = /^hsi-td-prog-[a-z0-9-]{3,80}$/;
const M12_TX_PROG_RE = /^hsi-tx-prog-[a-z0-9-]{3,80}$/;

export type HumanDiseaseIntelligenceHonesty = {
  researchDecisionSupportOnly: true;
  notSeparateDigitalTwinProduct: true;
  observedIsNotInferred: true;
  populationAssociationIsNotIndividualTruth: true;
  noUnrestrictedIdentifiablePatientsInScientificKg: true;
  pseudonymisedMayStillBePersonalData: true;
  noPhiIngestion: true;
  noAutonomousDiagnosisOrPrescribing: true;
  noPersonalisedTreatmentEffectClaims: true;
  noFabricatedDiseaseTimelines: true;
  syntheticPatientsAreNotScientificValidationWhenBlocked: true;
  noLiveMultiscaleEngineClaim: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  causalIdentificationClaimed: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type DiseaseActor = {
  principalId: string;
  actorKind: DiseaseActorKind;
};

export type DiseaseResearchContext = {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  id: string;
  displayName: string;
  diseaseFocus: string;
  scientificQuestion: string;
  populationFraming: string;
  permittedResearchUses: readonly PermittedResearchUse[];
  datasetAvailability: DiseaseDatasetAvailability;
  accessClassification: DiseaseAccessClassification;
  containsIdentifiablePhi: false;
  separateDigitalTwinProduct: false;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  cohortDefinitionId: string | null;
  therapeuticProgrammeId: string | null;
  translationalProgrammeId: string | null;
  lifecycle: DiseaseContextLifecycle;
  reviewedBy: DiseaseActor | null;
  authoredBy: DiseaseActor;
  dataBasis: DiseaseDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanDiseaseIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseStateObservation = {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  id: string;
  diseaseContextId: string;
  epistemicStatus: "observed";
  clinicalConcept: string;
  observedValueDeclared: string | null;
  unit: string | null;
  observedAt: string | null;
  missingness: DiseaseMissingnessStatus;
  missingnessNote: string;
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  rweObservationId: string | null;
  longitudinalSeriesPointNote: string | null;
  containsIdentifiablePhi: false;
  isDiagnosisDirective: false;
  authoredBy: DiseaseActor;
  dataBasis: DiseaseDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanDiseaseIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseStateEstimate = {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  id: string;
  diseaseContextId: string;
  epistemicStatus: "inferred";
  estimateMethod: DiseaseEstimateMethod;
  confidenceOrdinal: DiseaseConfidenceOrdinal;
  estimateSummary: string;
  limitations: readonly string[];
  supportingObservationIds: readonly string[];
  populationAssociationIsNotIndividualTruth: true;
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  rweAnalysisId: string | null;
  longitudinalResultId: string | null;
  containsIdentifiablePhi: false;
  isDiagnosisDirective: false;
  causalIdentificationClaimed: false;
  inventedIndividualTruth: null;
  authoredBy: DiseaseActor;
  dataBasis: DiseaseDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanDiseaseIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DigitalPatientResearchModel = {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  id: string;
  diseaseContextId: string;
  displayName: string;
  subjectRefKind: "pseudonymous_subject";
  pseudonymousSubjectRef: string;
  accessClassification: DiseaseAccessClassification;
  permittedResearchUses: readonly PermittedResearchUse[];
  linkedObservationIds: readonly string[];
  linkedEstimateIds: readonly string[];
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  cohortDefinitionId: string | null;
  datasetAvailability: DiseaseDatasetAvailability;
  containsIdentifiablePhi: false;
  identifiableOutsideScientificKg: true;
  separateDigitalTwinProduct: false;
  syntheticPatientUsedAsScientificValidation: false;
  fabricatedTimeline: null;
  lifecycle: DigitalPatientModelLifecycle;
  reviewedBy: DiseaseActor | null;
  authoredBy: DiseaseActor;
  dataBasis: DiseaseDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanDiseaseIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SimulationScenario = {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  id: string;
  diseaseContextId: string;
  displayName: string;
  researchQuestion: string;
  digitalPatientModelId: string | null;
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  rweStudyId: string | null;
  longitudinalAnalysisSpecId: string | null;
  cohortDefinitionId: string | null;
  datasetAvailability: DiseaseDatasetAvailability;
  accessClassification: DiseaseAccessClassification;
  researchOnly: true;
  notPersonalisedTreatmentEffect: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  syntheticResultsAreNotScientificValidationWhenBlocked: true;
  populationAssociationIsNotIndividualTruth: true;
  fabricatedTimeline: null;
  inventedTreatmentEffect: null;
  limitations: readonly string[];
  lifecycle: SimulationScenarioLifecycle;
  reviewedBy: DiseaseActor | null;
  authoredBy: DiseaseActor;
  dataBasis: DiseaseDataBasis;
  fixtureHonesty: boolean;
  honesty: HumanDiseaseIntelligenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type HumanDiseaseIntelligenceStore = {
  upsertContext(context: DiseaseResearchContext): DiseaseResearchContext;
  getContext(id: string): DiseaseResearchContext | null;
  listContexts(): readonly DiseaseResearchContext[];
  upsertObservation(
    observation: DiseaseStateObservation,
  ): DiseaseStateObservation;
  getObservation(id: string): DiseaseStateObservation | null;
  listObservations(diseaseContextId?: string): readonly DiseaseStateObservation[];
  upsertEstimate(estimate: DiseaseStateEstimate): DiseaseStateEstimate;
  getEstimate(id: string): DiseaseStateEstimate | null;
  listEstimates(diseaseContextId?: string): readonly DiseaseStateEstimate[];
  upsertDigitalPatientModel(
    model: DigitalPatientResearchModel,
  ): DigitalPatientResearchModel;
  getDigitalPatientModel(id: string): DigitalPatientResearchModel | null;
  listDigitalPatientModels(
    diseaseContextId?: string,
  ): readonly DigitalPatientResearchModel[];
  upsertSimulationScenario(
    scenario: SimulationScenario,
  ): SimulationScenario;
  getSimulationScenario(id: string): SimulationScenario | null;
  listSimulationScenarios(
    diseaseContextId?: string,
  ): readonly SimulationScenario[];
};

const DEFAULT_HONESTY: HumanDiseaseIntelligenceHonesty = {
  researchDecisionSupportOnly: true,
  notSeparateDigitalTwinProduct: true,
  observedIsNotInferred: true,
  populationAssociationIsNotIndividualTruth: true,
  noUnrestrictedIdentifiablePatientsInScientificKg: true,
  pseudonymisedMayStillBePersonalData: true,
  noPhiIngestion: true,
  noAutonomousDiagnosisOrPrescribing: true,
  noPersonalisedTreatmentEffectClaims: true,
  noFabricatedDiseaseTimelines: true,
  syntheticPatientsAreNotScientificValidationWhenBlocked: true,
  noLiveMultiscaleEngineClaim: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  causalIdentificationClaimed: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const CONTEXT_TRANSITIONS: Record<
  DiseaseContextLifecycle,
  readonly DiseaseContextLifecycle[]
> = {
  draft: ["under_review", "blocked_awaiting_authorised_dataset", "rejected"],
  under_review: [
    "accepted_for_further_research",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "draft",
  ],
  accepted_for_further_research: ["superseded", "retired"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  superseded: [],
  retired: [],
  rejected: [],
};

const MODEL_TRANSITIONS: Record<
  DigitalPatientModelLifecycle,
  readonly DigitalPatientModelLifecycle[]
> = {
  draft: ["under_review", "blocked_awaiting_authorised_dataset", "rejected"],
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

const SCENARIO_TRANSITIONS: Record<
  SimulationScenarioLifecycle,
  readonly SimulationScenarioLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_no_live_multiscale_engine: ["draft", "rejected"],
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

function assertHonesty(honesty: HumanDiseaseIntelligenceHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.notSeparateDigitalTwinProduct !== true) {
    throw Error("Separate digital twin product forbidden");
  }
  if (honesty.observedIsNotInferred !== true) {
    throw Error("Observed must remain distinct from inferred");
  }
  if (honesty.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (honesty.noUnrestrictedIdentifiablePatientsInScientificKg !== true) {
    throw Error("Identifiable patients forbidden in scientific KG");
  }
  if (honesty.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised-may-still-be-personal-data required");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noPersonalisedTreatmentEffectClaims !== true) {
    throw Error("Personalised treatment effect claims forbidden");
  }
  if (honesty.noFabricatedDiseaseTimelines !== true) {
    throw Error("Fabricated disease timelines forbidden");
  }
  if (honesty.syntheticPatientsAreNotScientificValidationWhenBlocked !== true) {
    throw Error("Synthetic patients must not validate when dataset blocked");
  }
  if (honesty.noLiveMultiscaleEngineClaim !== true) {
    throw Error("Live multiscale engine claim forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR1");
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
    throw Error("Scientific approval must stay false in PR1");
  }
  if (honesty.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
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
  // Strip common honesty negations so limitations may say "not a diagnosis".
  const lower = text
    .toLowerCase()
    .replace(
      /\b(?:not|no|without|never)\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|treatment\s+recommendation|personalised\s+treatment\s+effect|personalized\s+treatment\s+effect|proven\s+treatment\s+effect|live\s+multiscale\s+engine|digital\s+twin\s+product|fabricated\s+(?:timeline|trajectory))\b/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bpersonalised\s+treatment\s+effect\b/.test(lower) ||
    /\bpersonalized\s+treatment\s+effect\b/.test(lower) ||
    /\bproven\s+treatment\s+effect\b/.test(lower) ||
    /\bcausal(ly)?\s+(proven|established|identified)\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower) ||
    /\bdigital\s+twin\s+product\b/.test(lower) ||
    /\bfabricated\s+(timeline|trajectory)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower) ||
    /\bunrestricted\s+patient\s+(db|database)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim personalised treatment effects, claim live multiscale/twin product, invent counts/timelines, or include identifiers`,
    );
  }
}

function assertActor(actor: DiseaseActor, label: string): DiseaseActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actorKind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertSubjectRef(
  kind: DiseaseSubjectRefKind,
  ref: string,
): {subjectRefKind: DiseaseSubjectRefKind; subjectOrCohortRef: string} {
  assertClosed(kind, SUBJECT_REF_KINDS, "subjectRefKind");
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
  return {subjectRefKind: kind, subjectOrCohortRef: ref};
}

function assertPermittedUses(
  uses: readonly PermittedResearchUse[],
): readonly PermittedResearchUse[] {
  if (uses.length === 0) throw Error("At least one permitted research use");
  if (uses.length > 8) throw Error("Too many permitted research uses");
  const seen = new Set<string>();
  for (const use of uses) {
    assertClosed(use, PERMITTED_RESEARCH_USES, "permitted research use");
    if (seen.has(use)) throw Error("Duplicate permitted research use");
    seen.add(use);
  }
  return [...uses];
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

export function draftDiseaseResearchContext(input: {
  id: string;
  displayName: string;
  diseaseFocus: string;
  scientificQuestion: string;
  populationFraming: string;
  permittedResearchUses: readonly PermittedResearchUse[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: DiseaseActorKind;
  datasetAvailability?: DiseaseDatasetAvailability;
  accessClassification?: DiseaseAccessClassification;
  dataBasis?: DiseaseDataBasis;
  fixtureHonesty?: boolean;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  cohortDefinitionId?: string | null;
  therapeuticProgrammeId?: string | null;
  translationalProgrammeId?: string | null;
  note?: string;
}): DiseaseResearchContext {
  if (!CTX_ID_RE.test(input.id)) throw Error("Invalid disease context id");
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  if (!textOk(input.diseaseFocus, 240)) throw Error("Invalid diseaseFocus");
  if (!textOk(input.scientificQuestion, 4000)) {
    throw Error("Invalid scientificQuestion");
  }
  if (!textOk(input.populationFraming, 2000)) {
    throw Error("Invalid populationFraming");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.diseaseFocus, "diseaseFocus");
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  assertNoForbiddenClaimLanguage(input.populationFraming, "populationFraming");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const datasetAvailability =
    input.datasetAvailability ?? "blocked_no_authorised_clinical_dataset";
  assertClosed(
    datasetAvailability,
    DATASET_AVAILABILITY,
    "dataset availability",
  );
  const accessClassification =
    input.accessClassification ??
    (datasetAvailability === "fixture_only"
      ? "fixture_engineering"
      : "restricted_not_ingested");
  assertClosed(
    accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const lifecycle: DiseaseContextLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const context: DiseaseResearchContext = {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseFocus: input.diseaseFocus.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    populationFraming: input.populationFraming.trim(),
    permittedResearchUses: assertPermittedUses(input.permittedResearchUses),
    datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    separateDigitalTwinProduct: false,
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    therapeuticProgrammeId: assertOptionalId(
      input.therapeuticProgrammeId,
      M12_TX_PROG_RE,
      "therapeuticProgrammeId",
    ),
    translationalProgrammeId: assertOptionalId(
      input.translationalProgrammeId,
      M13_TD_PROG_RE,
      "translationalProgrammeId",
    ),
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDiseaseResearchContext(context);
}

export function validateDiseaseResearchContext(
  context: DiseaseResearchContext,
): DiseaseResearchContext {
  if (!CTX_ID_RE.test(context.id)) throw Error("Invalid disease context id");
  assertClosed(context.lifecycle, DISEASE_CONTEXT_LIFECYCLES, "lifecycle");
  assertPermittedUses(context.permittedResearchUses);
  if (context.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (context.separateDigitalTwinProduct !== false) {
    throw Error("Separate digital twin product forbidden");
  }
  assertHonesty(context.honesty);
  assertActor(context.authoredBy, "author");
  if (context.reviewedBy !== null) assertActor(context.reviewedBy, "reviewer");
  return context;
}

export function transitionDiseaseResearchContext(input: {
  context: DiseaseResearchContext;
  to: DiseaseContextLifecycle;
  updatedAt: string;
  actor: DiseaseActor;
}): DiseaseResearchContext {
  const current = validateDiseaseResearchContext(input.context);
  assertClosed(input.to, DISEASE_CONTEXT_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = CONTEXT_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal context transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_for_further_research" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject disease contexts");
  }
  if (
    input.to === "accepted_for_further_research" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept disease context while authorised dataset is blocked",
    );
  }
  return validateDiseaseResearchContext({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_for_further_research" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftDiseaseStateObservation(input: {
  id: string;
  diseaseContext: DiseaseResearchContext;
  clinicalConcept: string;
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  missingness: DiseaseMissingnessStatus;
  missingnessNote: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: DiseaseActorKind;
  observedValueDeclared?: string | null;
  unit?: string | null;
  observedAt?: string | null;
  rweObservationId?: string | null;
  longitudinalSeriesPointNote?: string | null;
  dataBasis?: DiseaseDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): DiseaseStateObservation {
  if (!OBS_ID_RE.test(input.id)) throw Error("Invalid observation id");
  const context = validateDiseaseResearchContext(input.diseaseContext);
  if (!textOk(input.clinicalConcept, 240)) {
    throw Error("Invalid clinicalConcept");
  }
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");
  assertClosed(input.missingness, MISSINGNESS_STATUSES, "missingness");
  if (!textOk(input.missingnessNote, 1000)) {
    throw Error("Invalid missingnessNote");
  }
  assertNoForbiddenClaimLanguage(input.missingnessNote, "missingnessNote");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const subject = assertSubjectRef(
    input.subjectRefKind,
    input.subjectOrCohortRef,
  );
  const observedAt =
    input.observedAt === undefined || input.observedAt === null
      ? null
      : input.observedAt;
  if (observedAt !== null && !isIsoTimestamp(observedAt)) {
    throw Error("Invalid observedAt");
  }
  if (
    input.missingness === "observed" &&
    (input.observedValueDeclared === undefined ||
      input.observedValueDeclared === null ||
      !textOk(input.observedValueDeclared, 500))
  ) {
    throw Error("Observed missingness requires observedValueDeclared");
  }
  if (
    (input.missingness === "missing" || input.missingness === "unknown") &&
    input.observedValueDeclared
  ) {
    throw Error("Missing/unknown observations must not declare a value");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? context.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const observedValueDeclared =
    input.observedValueDeclared === undefined ||
    input.observedValueDeclared === null
      ? null
      : input.observedValueDeclared.trim();
  if (observedValueDeclared) {
    assertNoForbiddenClaimLanguage(
      observedValueDeclared,
      "observedValueDeclared",
    );
  }
  const unit =
    input.unit === undefined || input.unit === null
      ? null
      : input.unit.trim();
  if (unit && !textOk(unit, 64)) throw Error("Invalid unit");

  const observation: DiseaseStateObservation = {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    id: input.id,
    diseaseContextId: context.id,
    epistemicStatus: "observed",
    clinicalConcept: input.clinicalConcept.trim(),
    observedValueDeclared,
    unit,
    observedAt,
    missingness: input.missingness,
    missingnessNote: input.missingnessNote.trim(),
    subjectRefKind: subject.subjectRefKind,
    subjectOrCohortRef: subject.subjectOrCohortRef,
    rweObservationId: assertOptionalId(
      input.rweObservationId,
      RWE_OBS_RE,
      "rweObservationId",
    ),
    longitudinalSeriesPointNote:
      input.longitudinalSeriesPointNote === undefined ||
      input.longitudinalSeriesPointNote === null
        ? null
        : input.longitudinalSeriesPointNote.trim(),
    containsIdentifiablePhi: false,
    isDiagnosisDirective: false,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDiseaseStateObservation(observation);
}

export function validateDiseaseStateObservation(
  observation: DiseaseStateObservation,
): DiseaseStateObservation {
  if (!OBS_ID_RE.test(observation.id)) throw Error("Invalid observation id");
  if (!CTX_ID_RE.test(observation.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (observation.epistemicStatus !== "observed") {
    throw Error("Observation epistemicStatus must be observed");
  }
  if (observation.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (observation.isDiagnosisDirective !== false) {
    throw Error("Diagnosis directives forbidden");
  }
  assertHonesty(observation.honesty);
  assertActor(observation.authoredBy, "author");
  return observation;
}

export function draftDiseaseStateEstimate(input: {
  id: string;
  diseaseContext: DiseaseResearchContext;
  estimateMethod: DiseaseEstimateMethod;
  confidenceOrdinal: DiseaseConfidenceOrdinal;
  estimateSummary: string;
  limitations: readonly string[];
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: DiseaseActorKind;
  supportingObservationIds?: readonly string[];
  rweAnalysisId?: string | null;
  longitudinalResultId?: string | null;
  dataBasis?: DiseaseDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): DiseaseStateEstimate {
  if (!EST_ID_RE.test(input.id)) throw Error("Invalid estimate id");
  const context = validateDiseaseResearchContext(input.diseaseContext);
  assertClosed(input.estimateMethod, ESTIMATE_METHODS, "estimate method");
  assertClosed(
    input.confidenceOrdinal,
    CONFIDENCE_ORDINALS,
    "confidence ordinal",
  );
  if (!textOk(input.estimateSummary, 2000)) {
    throw Error("Invalid estimateSummary");
  }
  assertNoForbiddenClaimLanguage(input.estimateSummary, "estimateSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const subject = assertSubjectRef(
    input.subjectRefKind,
    input.subjectOrCohortRef,
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? context.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const estimate: DiseaseStateEstimate = {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    id: input.id,
    diseaseContextId: context.id,
    epistemicStatus: "inferred",
    estimateMethod: input.estimateMethod,
    confidenceOrdinal: input.confidenceOrdinal,
    estimateSummary: input.estimateSummary.trim(),
    limitations: assertLimitations(input.limitations),
    supportingObservationIds: assertIdList(
      input.supportingObservationIds ?? [],
      OBS_ID_RE,
      "supportingObservationIds",
      32,
    ),
    populationAssociationIsNotIndividualTruth: true,
    subjectRefKind: subject.subjectRefKind,
    subjectOrCohortRef: subject.subjectOrCohortRef,
    rweAnalysisId: assertOptionalId(
      input.rweAnalysisId,
      RWE_ANL_RE,
      "rweAnalysisId",
    ),
    longitudinalResultId: assertOptionalId(
      input.longitudinalResultId,
      LCE_RES_RE,
      "longitudinalResultId",
    ),
    containsIdentifiablePhi: false,
    isDiagnosisDirective: false,
    causalIdentificationClaimed: false,
    inventedIndividualTruth: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDiseaseStateEstimate(estimate);
}

export function validateDiseaseStateEstimate(
  estimate: DiseaseStateEstimate,
): DiseaseStateEstimate {
  if (!EST_ID_RE.test(estimate.id)) throw Error("Invalid estimate id");
  if (!CTX_ID_RE.test(estimate.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (estimate.epistemicStatus !== "inferred") {
    throw Error("Estimate epistemicStatus must be inferred");
  }
  if (estimate.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (estimate.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (estimate.isDiagnosisDirective !== false) {
    throw Error("Diagnosis directives forbidden");
  }
  if (estimate.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden");
  }
  if (estimate.inventedIndividualTruth !== null) {
    throw Error("Invented individual truth forbidden");
  }
  assertLimitations(estimate.limitations);
  assertHonesty(estimate.honesty);
  assertActor(estimate.authoredBy, "author");
  return estimate;
}

export function draftDigitalPatientResearchModel(input: {
  id: string;
  diseaseContext: DiseaseResearchContext;
  displayName: string;
  pseudonymousSubjectRef: string;
  permittedResearchUses: readonly PermittedResearchUse[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: DiseaseActorKind;
  accessClassification?: DiseaseAccessClassification;
  datasetAvailability?: DiseaseDatasetAvailability;
  linkedObservationIds?: readonly string[];
  linkedEstimateIds?: readonly string[];
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  cohortDefinitionId?: string | null;
  dataBasis?: DiseaseDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): DigitalPatientResearchModel {
  if (!DPM_ID_RE.test(input.id)) {
    throw Error("Invalid digital patient research model id");
  }
  const context = validateDiseaseResearchContext(input.diseaseContext);
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  const subject = assertSubjectRef(
    "pseudonymous_subject",
    input.pseudonymousSubjectRef,
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const datasetAvailability =
    input.datasetAvailability ?? context.datasetAvailability;
  assertClosed(
    datasetAvailability,
    DATASET_AVAILABILITY,
    "dataset availability",
  );
  if (
    datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.note?.toLowerCase().includes("scientifically validated")
  ) {
    throw Error(
      "Synthetic/fixture digital patients must not be presented as scientific validation while authorised dataset is blocked",
    );
  }

  const accessClassification =
    input.accessClassification ?? context.accessClassification;
  assertClosed(
    accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? context.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const lifecycle: DigitalPatientModelLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const model: DigitalPatientResearchModel = {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    id: input.id,
    diseaseContextId: context.id,
    displayName: input.displayName.trim(),
    subjectRefKind: "pseudonymous_subject",
    pseudonymousSubjectRef: subject.subjectOrCohortRef,
    accessClassification,
    permittedResearchUses: assertPermittedUses(input.permittedResearchUses),
    linkedObservationIds: assertIdList(
      input.linkedObservationIds ?? [],
      OBS_ID_RE,
      "linkedObservationIds",
      64,
    ),
    linkedEstimateIds: assertIdList(
      input.linkedEstimateIds ?? [],
      EST_ID_RE,
      "linkedEstimateIds",
      64,
    ),
    rweStudyId: assertOptionalId(
      input.rweStudyId ?? context.rweStudyId,
      RWE_STUDY_RE,
      "rweStudyId",
    ),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId ?? context.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId ?? context.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    datasetAvailability,
    containsIdentifiablePhi: false,
    identifiableOutsideScientificKg: true,
    separateDigitalTwinProduct: false,
    syntheticPatientUsedAsScientificValidation: false,
    fabricatedTimeline: null,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDigitalPatientResearchModel(model);
}

export function validateDigitalPatientResearchModel(
  model: DigitalPatientResearchModel,
): DigitalPatientResearchModel {
  if (!DPM_ID_RE.test(model.id)) {
    throw Error("Invalid digital patient research model id");
  }
  if (!CTX_ID_RE.test(model.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (model.subjectRefKind !== "pseudonymous_subject") {
    throw Error("Digital patient models require pseudonymous_subject");
  }
  if (model.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (model.identifiableOutsideScientificKg !== true) {
    throw Error("Identifiable records must stay outside scientific KG");
  }
  if (model.separateDigitalTwinProduct !== false) {
    throw Error("Separate digital twin product forbidden");
  }
  if (model.syntheticPatientUsedAsScientificValidation !== false) {
    throw Error("Synthetic patients must not be used as scientific validation");
  }
  if (model.fabricatedTimeline !== null) {
    throw Error("Fabricated timelines forbidden");
  }
  assertClosed(model.lifecycle, MODEL_LIFECYCLES, "lifecycle");
  assertHonesty(model.honesty);
  assertActor(model.authoredBy, "author");
  if (model.reviewedBy !== null) assertActor(model.reviewedBy, "reviewer");
  return model;
}

export function transitionDigitalPatientResearchModel(input: {
  model: DigitalPatientResearchModel;
  to: DigitalPatientModelLifecycle;
  updatedAt: string;
  actor: DiseaseActor;
}): DigitalPatientResearchModel {
  const current = validateDigitalPatientResearchModel(input.model);
  assertClosed(input.to, MODEL_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = MODEL_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal model transition ${current.lifecycle} → ${input.to}`);
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error(
      "Only human researchers may accept or reject digital patient models",
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept digital patient model while authorised dataset is blocked",
    );
  }
  return validateDigitalPatientResearchModel({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftSimulationScenario(input: {
  id: string;
  diseaseContext: DiseaseResearchContext;
  displayName: string;
  researchQuestion: string;
  subjectRefKind: DiseaseSubjectRefKind;
  subjectOrCohortRef: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  createdAt: string;
  authoredByActorKind?: DiseaseActorKind;
  digitalPatientModelId?: string | null;
  rweStudyId?: string | null;
  longitudinalAnalysisSpecId?: string | null;
  cohortDefinitionId?: string | null;
  datasetAvailability?: DiseaseDatasetAvailability;
  accessClassification?: DiseaseAccessClassification;
  dataBasis?: DiseaseDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): SimulationScenario {
  if (!SIM_ID_RE.test(input.id)) throw Error("Invalid simulation scenario id");
  const context = validateDiseaseResearchContext(input.diseaseContext);
  if (!textOk(input.displayName, 240)) throw Error("Invalid displayName");
  if (!textOk(input.researchQuestion, 4000)) {
    throw Error("Invalid researchQuestion");
  }
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  assertNoForbiddenClaimLanguage(input.researchQuestion, "researchQuestion");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const subject = assertSubjectRef(
    input.subjectRefKind,
    input.subjectOrCohortRef,
  );
  const datasetAvailability =
    input.datasetAvailability ?? context.datasetAvailability;
  assertClosed(
    datasetAvailability,
    DATASET_AVAILABILITY,
    "dataset availability",
  );
  const accessClassification =
    input.accessClassification ?? context.accessClassification;
  assertClosed(
    accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );
  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? context.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  let lifecycle: SimulationScenarioLifecycle =
    datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";
  // M11 is skipped/missing — scientific validation path that requires a live
  // multiscale engine stays blocked even for authorised_declared fixtures.
  if (
    datasetAvailability === "authorised_declared" &&
    input.note?.toLowerCase().includes("multiscale engine live")
  ) {
    lifecycle = "blocked_no_live_multiscale_engine";
  }

  const scenario: SimulationScenario = {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    id: input.id,
    diseaseContextId: context.id,
    displayName: input.displayName.trim(),
    researchQuestion: input.researchQuestion.trim(),
    digitalPatientModelId: assertOptionalId(
      input.digitalPatientModelId,
      DPM_ID_RE,
      "digitalPatientModelId",
    ),
    subjectRefKind: subject.subjectRefKind,
    subjectOrCohortRef: subject.subjectOrCohortRef,
    rweStudyId: assertOptionalId(
      input.rweStudyId ?? context.rweStudyId,
      RWE_STUDY_RE,
      "rweStudyId",
    ),
    longitudinalAnalysisSpecId: assertOptionalId(
      input.longitudinalAnalysisSpecId ?? context.longitudinalAnalysisSpecId,
      LCE_SPEC_RE,
      "longitudinalAnalysisSpecId",
    ),
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId ?? context.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    datasetAvailability,
    accessClassification,
    researchOnly: true,
    notPersonalisedTreatmentEffect: true,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    syntheticResultsAreNotScientificValidationWhenBlocked: true,
    populationAssociationIsNotIndividualTruth: true,
    fabricatedTimeline: null,
    inventedTreatmentEffect: null,
    limitations: assertLimitations(input.limitations),
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateSimulationScenario(scenario);
}

export function validateSimulationScenario(
  scenario: SimulationScenario,
): SimulationScenario {
  if (!SIM_ID_RE.test(scenario.id)) {
    throw Error("Invalid simulation scenario id");
  }
  if (!CTX_ID_RE.test(scenario.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (scenario.researchOnly !== true) {
    throw Error("Simulation scenarios must be research-only");
  }
  if (scenario.notPersonalisedTreatmentEffect !== true) {
    throw Error("Personalised treatment effects forbidden");
  }
  if (scenario.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine forbidden");
  }
  if (scenario.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (scenario.syntheticResultsAreNotScientificValidationWhenBlocked !== true) {
    throw Error("Synthetic results must not validate when dataset blocked");
  }
  if (scenario.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (scenario.fabricatedTimeline !== null) {
    throw Error("Fabricated timelines forbidden");
  }
  if (scenario.inventedTreatmentEffect !== null) {
    throw Error("Invented treatment effects forbidden");
  }
  assertClosed(scenario.lifecycle, SCENARIO_LIFECYCLES, "lifecycle");
  assertLimitations(scenario.limitations);
  assertHonesty(scenario.honesty);
  assertActor(scenario.authoredBy, "author");
  if (scenario.reviewedBy !== null) {
    assertActor(scenario.reviewedBy, "reviewer");
  }
  return scenario;
}

export function transitionSimulationScenario(input: {
  scenario: SimulationScenario;
  to: SimulationScenarioLifecycle;
  updatedAt: string;
  actor: DiseaseActor;
}): SimulationScenario {
  const current = validateSimulationScenario(input.scenario);
  assertClosed(input.to, SCENARIO_LIFECYCLES, "lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = SCENARIO_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal scenario transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error(
      "Only human researchers may accept or reject simulation scenarios",
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept simulation scenario while authorised dataset is blocked",
    );
  }
  if (
    input.to === "accepted_with_limitations" &&
    current.liveMultiscaleEngineOperational !== false
  ) {
    throw Error("Cannot accept scenario claiming live multiscale engine");
  }
  return validateSimulationScenario({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryHumanDiseaseIntelligenceStore(): HumanDiseaseIntelligenceStore & {
  contexts: Map<string, DiseaseResearchContext>;
  observations: Map<string, DiseaseStateObservation>;
  estimates: Map<string, DiseaseStateEstimate>;
  digitalPatientModels: Map<string, DigitalPatientResearchModel>;
  simulationScenarios: Map<string, SimulationScenario>;
} {
  const contexts = new Map<string, DiseaseResearchContext>();
  const observations = new Map<string, DiseaseStateObservation>();
  const estimates = new Map<string, DiseaseStateEstimate>();
  const digitalPatientModels = new Map<string, DigitalPatientResearchModel>();
  const simulationScenarios = new Map<string, SimulationScenario>();

  return {
    contexts,
    observations,
    estimates,
    digitalPatientModels,
    simulationScenarios,
    upsertContext(context) {
      const validated = validateDiseaseResearchContext(context);
      contexts.set(validated.id, validated);
      return validated;
    },
    getContext(id) {
      return contexts.get(id) ?? null;
    },
    listContexts() {
      return [...contexts.values()];
    },
    upsertObservation(observation) {
      const validated = validateDiseaseStateObservation(observation);
      observations.set(validated.id, validated);
      return validated;
    },
    getObservation(id) {
      return observations.get(id) ?? null;
    },
    listObservations(diseaseContextId) {
      const all = [...observations.values()];
      return diseaseContextId
        ? all.filter((o) => o.diseaseContextId === diseaseContextId)
        : all;
    },
    upsertEstimate(estimate) {
      const validated = validateDiseaseStateEstimate(estimate);
      estimates.set(validated.id, validated);
      return validated;
    },
    getEstimate(id) {
      return estimates.get(id) ?? null;
    },
    listEstimates(diseaseContextId) {
      const all = [...estimates.values()];
      return diseaseContextId
        ? all.filter((e) => e.diseaseContextId === diseaseContextId)
        : all;
    },
    upsertDigitalPatientModel(model) {
      const validated = validateDigitalPatientResearchModel(model);
      digitalPatientModels.set(validated.id, validated);
      return validated;
    },
    getDigitalPatientModel(id) {
      return digitalPatientModels.get(id) ?? null;
    },
    listDigitalPatientModels(diseaseContextId) {
      const all = [...digitalPatientModels.values()];
      return diseaseContextId
        ? all.filter((m) => m.diseaseContextId === diseaseContextId)
        : all;
    },
    upsertSimulationScenario(scenario) {
      const validated = validateSimulationScenario(scenario);
      simulationScenarios.set(validated.id, validated);
      return validated;
    },
    getSimulationScenario(id) {
      return simulationScenarios.get(id) ?? null;
    },
    listSimulationScenarios(diseaseContextId) {
      const all = [...simulationScenarios.values()];
      return diseaseContextId
        ? all.filter((s) => s.diseaseContextId === diseaseContextId)
        : all;
    },
  };
}

export function projectHumanDiseaseIntelligencePersistenceLines(input: {
  contexts: readonly DiseaseResearchContext[];
  observations?: readonly DiseaseStateObservation[];
  estimates?: readonly DiseaseStateEstimate[];
  digitalPatientModels?: readonly DigitalPatientResearchModel[];
  simulationScenarios?: readonly SimulationScenario[];
}): string[] {
  for (const c of input.contexts) validateDiseaseResearchContext(c);
  for (const o of input.observations ?? []) {
    validateDiseaseStateObservation(o);
  }
  for (const e of input.estimates ?? []) validateDiseaseStateEstimate(e);
  for (const m of input.digitalPatientModels ?? []) {
    validateDigitalPatientResearchModel(m);
  }
  for (const s of input.simulationScenarios ?? []) {
    validateSimulationScenario(s);
  }

  return [
    `schema=${HUMAN_DISEASE_INTELLIGENCE_SCHEMA}`,
    `method=${HUMAN_DISEASE_INTELLIGENCE_METHOD}`,
    `version=${HUMAN_DISEASE_INTELLIGENCE_VERSION}`,
    `contexts=${input.contexts.length}`,
    `observations=${(input.observations ?? []).length}`,
    `estimates=${(input.estimates ?? []).length}`,
    `digitalPatientModels=${(input.digitalPatientModels ?? []).length}`,
    `simulationScenarios=${(input.simulationScenarios ?? []).length}`,
    `notSeparateDigitalTwinProduct=true`,
    `observedIsNotInferred=true`,
    `populationAssociationIsNotIndividualTruth=true`,
    `identifiableOutsideScientificKg=true`,
    `noPhiIngestion=true`,
    `noAutonomousDiagnosisOrPrescribing=true`,
    `noPersonalisedTreatmentEffects=true`,
    `noFabricatedDiseaseTimelines=true`,
    `syntheticPatientsNotValidationWhenBlocked=true`,
    `liveMultiscaleEngine=false`,
    `m11SimulationClaimed=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintDiseaseResearchContext(
  context: DiseaseResearchContext,
): string {
  const validated = validateDiseaseResearchContext(context);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildHumanDiseaseIntelligencePack(input: {
  contexts: readonly DiseaseResearchContext[];
  observations: readonly DiseaseStateObservation[];
  estimates: readonly DiseaseStateEstimate[];
  digitalPatientModels: readonly DigitalPatientResearchModel[];
  simulationScenarios: readonly SimulationScenario[];
  asOf: string;
}): {
  schema: typeof HUMAN_DISEASE_INTELLIGENCE_SCHEMA;
  method: typeof HUMAN_DISEASE_INTELLIGENCE_METHOD;
  version: typeof HUMAN_DISEASE_INTELLIGENCE_VERSION;
  asOf: string;
  contextCount: number;
  observationCount: number;
  estimateCount: number;
  digitalPatientModelCount: number;
  simulationScenarioCount: number;
  honesty: HumanDiseaseIntelligenceHonesty;
  contexts: readonly DiseaseResearchContext[];
  observations: readonly DiseaseStateObservation[];
  estimates: readonly DiseaseStateEstimate[];
  digitalPatientModels: readonly DigitalPatientResearchModel[];
  simulationScenarios: readonly SimulationScenario[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const contexts = input.contexts.map(validateDiseaseResearchContext);
  const observations = input.observations.map(validateDiseaseStateObservation);
  const estimates = input.estimates.map(validateDiseaseStateEstimate);
  const digitalPatientModels = input.digitalPatientModels.map(
    validateDigitalPatientResearchModel,
  );
  const simulationScenarios = input.simulationScenarios.map(
    validateSimulationScenario,
  );
  return {
    schema: HUMAN_DISEASE_INTELLIGENCE_SCHEMA,
    method: HUMAN_DISEASE_INTELLIGENCE_METHOD,
    version: HUMAN_DISEASE_INTELLIGENCE_VERSION,
    asOf: input.asOf,
    contextCount: contexts.length,
    observationCount: observations.length,
    estimateCount: estimates.length,
    digitalPatientModelCount: digitalPatientModels.length,
    simulationScenarioCount: simulationScenarios.length,
    honesty: {...DEFAULT_HONESTY},
    contexts,
    observations,
    estimates,
    digitalPatientModels,
    simulationScenarios,
  };
}
