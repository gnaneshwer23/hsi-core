/**
 * Milestone 15 / PR7 — Multiscale Simulation Integration.
 *
 * Contracts + thin store connecting disease intelligence to research-only
 * simulation scenarios. Composes HDI / PCRM / CSOL (PR4) envelopes.
 *
 * Ten-step research flow:
 * 1. Select disease research question
 * 2. Identify relevant validated model components (or mark unavailable)
 * 3. Check model applicability
 * 4. Retrieve authorised input data refs (fixtures)
 * 5. Define biological/clinical assumptions
 * 6. Configure simulation
 * 7. Run approved computational model — fixture/harness only when no live
 *    engine; label honestly (M11 Skipped/Missing)
 * 8. Quantify uncertainty
 * 9. Evaluate numerical and biological validity flags
 * 10. Produce reviewable research interpretation envelope
 *
 * Model coupling declarations cover coupled variables, units, time scales,
 * assumptions, identifiability, validation evidence, and known failure
 * conditions — compose with PR4 validated-coupling rules.
 *
 * Binding honesty:
 * - Do NOT invent missing parameters.
 * - Do NOT present mechanistic sims as validated individual outcome
 *   predictions.
 * - Molecular ≠ organ without validated coupling (compose with PR4).
 * - Live M11 multiscale engine is NOT claimed.
 * - Fixtures only until authorised dataset; no PHI/CDS; Neon deferred;
 *   no workbench UI; no twin product; no Gate C / MoU invention.
 * - Persistence: validated contracts + thin in-memory store.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const MULTISCALE_SIMULATION_INTEGRATION_SCHEMA =
  "hsi-multiscale-simulation-integration-1" as const;
export const MULTISCALE_SIMULATION_INTEGRATION_METHOD =
  "hsi.multiscale_simulation_integration.v1" as const;
export const MULTISCALE_SIMULATION_INTEGRATION_VERSION = "0.1.0" as const;

export const MSI_CAPABILITY_KINDS = [
  "disease_research_question_selection",
  "validated_model_component_identification",
  "model_applicability_check",
  "authorised_input_data_retrieval",
  "biological_clinical_assumption_definition",
  "simulation_configuration",
  "approved_computational_model_run",
  "uncertainty_quantification",
  "numerical_biological_validity_evaluation",
  "research_interpretation_envelope",
] as const;
export type MsiCapabilityKind = (typeof MSI_CAPABILITY_KINDS)[number];

export const MSI_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "blocked_awaiting_authorised_dataset",
  "blocked_no_live_multiscale_engine",
  "blocked_unvalidated_cross_scale_coupling",
  "blocked_invented_parameters",
  "blocked_individual_outcome_prediction_claim",
  "rejected",
  "superseded",
] as const;
export type MsiLifecycle = (typeof MSI_LIFECYCLES)[number];

export const MSI_DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type MsiDatasetAvailability =
  (typeof MSI_DATASET_AVAILABILITY)[number];

export const MSI_ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "restricted_not_ingested",
] as const;
export type MsiAccessClassification =
  (typeof MSI_ACCESS_CLASSIFICATIONS)[number];

export const MSI_ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type MsiActorKind = (typeof MSI_ACTOR_KINDS)[number];

export const MSI_DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type MsiDataBasis = (typeof MSI_DATA_BASES)[number];

export const MSI_COMPONENT_AVAILABILITY = [
  "validated_component_declared",
  "unavailable_declared",
  "insufficient_to_assess",
  "blocked_no_validated_coupling",
] as const;
export type MsiComponentAvailability =
  (typeof MSI_COMPONENT_AVAILABILITY)[number];

export const MSI_APPLICABILITY_OUTCOMES = [
  "applicable_within_validated_domain",
  "partial_with_limitations",
  "out_of_scope_outside_validated_population",
  "out_of_scope_outside_input_domain",
  "insufficient_to_assess",
  "blocked_awaiting_authorised_dataset",
  "blocked_no_validated_coupling",
] as const;
export type MsiApplicabilityOutcome =
  (typeof MSI_APPLICABILITY_OUTCOMES)[number];

export const MSI_INPUT_AUTHORISATION_STATUSES = [
  "authorised_declared",
  "fixture_declared",
  "insufficient_authorisation",
  "blocked_not_authorised",
] as const;
export type MsiInputAuthorisationStatus =
  (typeof MSI_INPUT_AUTHORISATION_STATUSES)[number];

export const MSI_RUN_MODES = [
  "fixture_harness_only",
  "blocked_no_live_engine",
  "declared_external_engine_unavailable",
] as const;
export type MsiRunMode = (typeof MSI_RUN_MODES)[number];

export const MSI_UNCERTAINTY_ORDINALS = [
  "low_declared",
  "moderate_declared",
  "high_declared",
  "unquantified_declared",
  "insufficient",
] as const;
export type MsiUncertaintyOrdinal =
  (typeof MSI_UNCERTAINTY_ORDINALS)[number];

export const MSI_NUMERICAL_VALIDITY_FLAGS = [
  "numerically_plausible_declared",
  "numerically_suspect_declared",
  "numerically_failed_declared",
  "not_evaluated",
] as const;
export type MsiNumericalValidityFlag =
  (typeof MSI_NUMERICAL_VALIDITY_FLAGS)[number];

export const MSI_BIOLOGICAL_VALIDITY_FLAGS = [
  "biologically_plausible_declared",
  "biologically_uncertain_declared",
  "biologically_implausible_declared",
  "not_evaluated",
] as const;
export type MsiBiologicalValidityFlag =
  (typeof MSI_BIOLOGICAL_VALIDITY_FLAGS)[number];

export const MSI_IDENTIFIABILITY_STATUSES = [
  "identifiable_declared",
  "partially_identifiable_declared",
  "non_identifiable_declared",
  "insufficient_to_assess",
] as const;
export type MsiIdentifiabilityStatus =
  (typeof MSI_IDENTIFIABILITY_STATUSES)[number];

export const MSI_COUPLING_SUPPORT_STATUSES = [
  "validated_coupling_declared",
  "unsupported_coupling_declared",
  "uncertain_coupling_declared",
  "blocked_no_validated_coupling",
] as const;
export type MsiCouplingSupportStatus =
  (typeof MSI_COUPLING_SUPPORT_STATUSES)[number];

const SPEC_ID_RE = /^hsi-msi-spec-[a-z0-9-]{3,80}$/;
const DRQ_ID_RE = /^hsi-msi-drq-[a-z0-9-]{3,80}$/;
const VMC_ID_RE = /^hsi-msi-vmc-[a-z0-9-]{3,80}$/;
const APP_ID_RE = /^hsi-msi-app-[a-z0-9-]{3,80}$/;
const AID_ID_RE = /^hsi-msi-aid-[a-z0-9-]{3,80}$/;
const ASM_ID_RE = /^hsi-msi-asm-[a-z0-9-]{3,80}$/;
const CFG_ID_RE = /^hsi-msi-cfg-[a-z0-9-]{3,80}$/;
const RUN_ID_RE = /^hsi-msi-run-[a-z0-9-]{3,80}$/;
const UNC_ID_RE = /^hsi-msi-unc-[a-z0-9-]{3,80}$/;
const VAL_ID_RE = /^hsi-msi-val-[a-z0-9-]{3,80}$/;
const INT_ID_RE = /^hsi-msi-int-[a-z0-9-]{3,80}$/;
const CPL_ID_RE = /^hsi-msi-cpl-[a-z0-9-]{3,80}$/;
const BND_ID_RE = /^hsi-msi-bnd-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const HDI_CTX_RE = /^hsi-hdi-ctx-[a-z0-9-]{3,80}$/;
const HDI_SIM_RE = /^hsi-hdi-sim-[a-z0-9-]{3,80}$/;
const HDI_DPM_RE = /^hsi-hdi-dpm-[a-z0-9-]{3,80}$/;
const PCRM_SPEC_RE = /^hsi-pcrm-spec-[a-z0-9-]{3,80}$/;
const CSOL_SPEC_RE = /^hsi-csol-spec-[a-z0-9-]{3,80}$/;
const CSOL_MAP_RE = /^hsi-csol-map-[a-z0-9-]{3,80}$/;
const PCDM_SPEC_RE = /^hsi-pcdm-spec-[a-z0-9-]{3,80}$/;
const LDSM_SPEC_RE = /^hsi-ldsm-spec-[a-z0-9-]{3,80}$/;
const CBC_IDC_RE = /^hsi-cbc-idc-[a-z0-9-]{3,80}$/;
const RCB_COH_RE = /^hsi-rcb-coh-[a-z0-9-]{3,80}$/;
const RWE_STUDY_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const LCE_SPEC_RE = /^hsi-lce-spec-[a-z0-9-]{3,80}$/;

export type MultiscaleSimulationIntegrationHonesty = {
  researchDecisionSupportOnly: true;
  notValidatedIndividualOutcomePrediction: true;
  notDigitalTwinProduct: true;
  notPersonalisedTreatmentEffect: true;
  molecularDoesNotEqualOrganWithoutValidatedCoupling: true;
  doNotInventMissingParameters: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  fixtureHarnessIsNotLiveEngine: true;
  populationAssociationIsNotIndividualTruth: true;
  observedIsNotInferred: true;
  noPhiIngestion: true;
  noAutonomousDiagnosisOrPrescribing: true;
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

export type MsiActor = {
  principalId: string;
  actorKind: MsiActorKind;
};

export type MultiscaleSimulationIntegrationSpec = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds: readonly MsiCapabilityKind[];
  diseaseContextId: string;
  simulationScenarioId: string | null;
  digitalPatientModelId: string | null;
  patientContextualisedResearchSpecId: string | null;
  crossScaleOntologySpecId: string | null;
  populationModellingSpecId: string | null;
  integratedDiseaseContextId: string | null;
  longitudinalModellingSpecId: string | null;
  cohortDefinitionId: string | null;
  rweStudyId: string | null;
  longitudinalClinicalEvidenceSpecId: string | null;
  datasetAvailability: MsiDatasetAvailability;
  accessClassification: MsiAccessClassification;
  containsIdentifiablePhi: false;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  inventedParameters: null;
  notValidatedIndividualOutcomePrediction: true;
  notPersonalisedTreatmentEffect: true;
  notDigitalTwinProduct: true;
  molecularDoesNotEqualOrganWithoutValidatedCoupling: true;
  lifecycle: MsiLifecycle;
  reviewedBy: MsiActor | null;
  authoredBy: MsiActor;
  dataBasis: MsiDataBasis;
  fixtureHonesty: boolean;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type DiseaseResearchQuestionSelection = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  researchQuestion: string;
  questionScopeSummary: string;
  notClinicalCareQuestion: true;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ValidatedModelComponentIdentification = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  diseaseResearchQuestionId: string;
  componentRefId: string;
  componentLabel: string;
  availability: MsiComponentAvailability;
  crossScaleMappingId: string | null;
  availabilitySummary: string;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ModelApplicabilityCheck = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  diseaseResearchQuestionId: string | null;
  applicabilityOutcome: MsiApplicabilityOutcome;
  applicabilitySummary: string;
  outsideValidatedPopulation: boolean;
  outsideInputDomain: boolean;
  missingValidatedCoupling: boolean;
  outOfScope: boolean;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type AuthorisedInputDataRetrieval = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  authorisationStatus: MsiInputAuthorisationStatus;
  inputDataRefIds: readonly string[];
  inputSummary: string;
  containsIdentifiablePhi: false;
  inventedParameters: null;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiologicalClinicalAssumptionDefinition = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  assumptionStatements: readonly string[];
  assumptionSummary: string;
  inventedParameters: null;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ModelCouplingDeclaration = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  crossScaleOntologySpecId: string | null;
  crossScaleMappingId: string | null;
  couplingSupportStatus: MsiCouplingSupportStatus;
  coupledVariables: readonly string[];
  units: readonly string[];
  timeScales: readonly string[];
  assumptions: readonly string[];
  identifiabilityStatus: MsiIdentifiabilityStatus;
  validationEvidenceRefs: readonly string[];
  knownFailureConditions: readonly string[];
  molecularDoesNotEqualOrganWithoutValidatedCoupling: true;
  inventedParameters: null;
  couplingSummary: string;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type SimulationConfiguration = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  diseaseResearchQuestionId: string;
  authorisedInputDataId: string;
  assumptionDefinitionId: string;
  modelCouplingDeclarationId: string | null;
  configurationSummary: string;
  configuredComponentRefIds: readonly string[];
  liveMultiscaleEngineOperational: false;
  inventedParameters: null;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ApprovedComputationalModelRun = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  simulationConfigurationId: string;
  runMode: MsiRunMode;
  runSummary: string;
  harnessLabel: string;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  fixtureHarnessIsNotLiveEngine: true;
  notValidatedIndividualOutcomePrediction: true;
  inventedParameters: null;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type UncertaintyQuantification = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  approvedComputationalModelRunId: string | null;
  uncertaintyOrdinal: MsiUncertaintyOrdinal;
  uncertaintySummary: string;
  sourcesOfUncertainty: readonly string[];
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type NumericalBiologicalValidityEvaluation = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  approvedComputationalModelRunId: string;
  numericalValidityFlag: MsiNumericalValidityFlag;
  biologicalValidityFlag: MsiBiologicalValidityFlag;
  evaluationSummary: string;
  notValidatedIndividualOutcomePrediction: true;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ResearchInterpretationEnvelope = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  integrationSpecId: string;
  diseaseContextId: string;
  diseaseResearchQuestionId: string | null;
  approvedComputationalModelRunId: string | null;
  modelApplicabilityCheckId: string | null;
  uncertaintyQuantificationId: string | null;
  numericalBiologicalValidityEvaluationId: string | null;
  modelCouplingDeclarationId: string | null;
  interpretationSummary: string;
  researchOnly: true;
  reviewable: true;
  notValidatedIndividualOutcomePrediction: true;
  notPersonalisedTreatmentEffect: true;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  limitations: readonly string[];
  authoredBy: MsiActor;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MultiscaleSimulationIntegrationBundle = {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  id: string;
  displayName: string;
  diseaseContextId: string;
  integrationSpecId: string;
  diseaseResearchQuestionIds: readonly string[];
  validatedModelComponentIds: readonly string[];
  modelApplicabilityCheckIds: readonly string[];
  authorisedInputDataIds: readonly string[];
  biologicalClinicalAssumptionIds: readonly string[];
  modelCouplingDeclarationIds: readonly string[];
  simulationConfigurationIds: readonly string[];
  approvedComputationalModelRunIds: readonly string[];
  uncertaintyQuantificationIds: readonly string[];
  numericalBiologicalValidityEvaluationIds: readonly string[];
  researchInterpretationEnvelopeIds: readonly string[];
  unavailableComponentIds: readonly string[];
  bundleVersion: string;
  limitations: readonly string[];
  datasetAvailability: MsiDatasetAvailability;
  liveMultiscaleEngineOperational: false;
  m11SimulationClaimed: false;
  inventedParameters: null;
  notValidatedIndividualOutcomePrediction: true;
  notPersonalisedTreatmentEffect: true;
  notDigitalTwinProduct: true;
  molecularDoesNotEqualOrganWithoutValidatedCoupling: true;
  graphPromotable: false;
  lifecycle: MsiLifecycle;
  reviewedBy: MsiActor | null;
  authoredBy: MsiActor;
  dataBasis: MsiDataBasis;
  fixtureHonesty: boolean;
  honesty: MultiscaleSimulationIntegrationHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type MultiscaleSimulationIntegrationStore = {
  upsertSpec(
    record: MultiscaleSimulationIntegrationSpec,
  ): MultiscaleSimulationIntegrationSpec;
  getSpec(id: string): MultiscaleSimulationIntegrationSpec | null;
  listSpecs(
    diseaseContextId?: string,
  ): readonly MultiscaleSimulationIntegrationSpec[];
  upsertDiseaseResearchQuestion(
    record: DiseaseResearchQuestionSelection,
  ): DiseaseResearchQuestionSelection;
  getDiseaseResearchQuestion(
    id: string,
  ): DiseaseResearchQuestionSelection | null;
  listDiseaseResearchQuestions(
    diseaseContextId?: string,
  ): readonly DiseaseResearchQuestionSelection[];
  upsertValidatedModelComponent(
    record: ValidatedModelComponentIdentification,
  ): ValidatedModelComponentIdentification;
  getValidatedModelComponent(
    id: string,
  ): ValidatedModelComponentIdentification | null;
  listValidatedModelComponents(
    diseaseContextId?: string,
  ): readonly ValidatedModelComponentIdentification[];
  upsertModelApplicabilityCheck(
    record: ModelApplicabilityCheck,
  ): ModelApplicabilityCheck;
  getModelApplicabilityCheck(id: string): ModelApplicabilityCheck | null;
  listModelApplicabilityChecks(
    diseaseContextId?: string,
  ): readonly ModelApplicabilityCheck[];
  upsertAuthorisedInputData(
    record: AuthorisedInputDataRetrieval,
  ): AuthorisedInputDataRetrieval;
  getAuthorisedInputData(id: string): AuthorisedInputDataRetrieval | null;
  listAuthorisedInputData(
    diseaseContextId?: string,
  ): readonly AuthorisedInputDataRetrieval[];
  upsertBiologicalClinicalAssumption(
    record: BiologicalClinicalAssumptionDefinition,
  ): BiologicalClinicalAssumptionDefinition;
  getBiologicalClinicalAssumption(
    id: string,
  ): BiologicalClinicalAssumptionDefinition | null;
  listBiologicalClinicalAssumptions(
    diseaseContextId?: string,
  ): readonly BiologicalClinicalAssumptionDefinition[];
  upsertModelCouplingDeclaration(
    record: ModelCouplingDeclaration,
  ): ModelCouplingDeclaration;
  getModelCouplingDeclaration(id: string): ModelCouplingDeclaration | null;
  listModelCouplingDeclarations(
    diseaseContextId?: string,
  ): readonly ModelCouplingDeclaration[];
  upsertSimulationConfiguration(
    record: SimulationConfiguration,
  ): SimulationConfiguration;
  getSimulationConfiguration(id: string): SimulationConfiguration | null;
  listSimulationConfigurations(
    diseaseContextId?: string,
  ): readonly SimulationConfiguration[];
  upsertApprovedComputationalModelRun(
    record: ApprovedComputationalModelRun,
  ): ApprovedComputationalModelRun;
  getApprovedComputationalModelRun(
    id: string,
  ): ApprovedComputationalModelRun | null;
  listApprovedComputationalModelRuns(
    diseaseContextId?: string,
  ): readonly ApprovedComputationalModelRun[];
  upsertUncertaintyQuantification(
    record: UncertaintyQuantification,
  ): UncertaintyQuantification;
  getUncertaintyQuantification(id: string): UncertaintyQuantification | null;
  listUncertaintyQuantifications(
    diseaseContextId?: string,
  ): readonly UncertaintyQuantification[];
  upsertNumericalBiologicalValidityEvaluation(
    record: NumericalBiologicalValidityEvaluation,
  ): NumericalBiologicalValidityEvaluation;
  getNumericalBiologicalValidityEvaluation(
    id: string,
  ): NumericalBiologicalValidityEvaluation | null;
  listNumericalBiologicalValidityEvaluations(
    diseaseContextId?: string,
  ): readonly NumericalBiologicalValidityEvaluation[];
  upsertResearchInterpretationEnvelope(
    record: ResearchInterpretationEnvelope,
  ): ResearchInterpretationEnvelope;
  getResearchInterpretationEnvelope(
    id: string,
  ): ResearchInterpretationEnvelope | null;
  listResearchInterpretationEnvelopes(
    diseaseContextId?: string,
  ): readonly ResearchInterpretationEnvelope[];
  upsertBundle(
    record: MultiscaleSimulationIntegrationBundle,
  ): MultiscaleSimulationIntegrationBundle;
  getBundle(id: string): MultiscaleSimulationIntegrationBundle | null;
  listBundles(
    diseaseContextId?: string,
  ): readonly MultiscaleSimulationIntegrationBundle[];
};

const DEFAULT_HONESTY: MultiscaleSimulationIntegrationHonesty = {
  researchDecisionSupportOnly: true,
  notValidatedIndividualOutcomePrediction: true,
  notDigitalTwinProduct: true,
  notPersonalisedTreatmentEffect: true,
  molecularDoesNotEqualOrganWithoutValidatedCoupling: true,
  doNotInventMissingParameters: true,
  liveMultiscaleEngineOperational: false,
  m11SimulationClaimed: false,
  fixtureHarnessIsNotLiveEngine: true,
  populationAssociationIsNotIndividualTruth: true,
  observedIsNotInferred: true,
  noPhiIngestion: true,
  noAutonomousDiagnosisOrPrescribing: true,
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

const SPEC_TRANSITIONS: Record<MsiLifecycle, readonly MsiLifecycle[]> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "blocked_unvalidated_cross_scale_coupling",
    "blocked_invented_parameters",
    "blocked_individual_outcome_prediction_claim",
    "rejected",
  ],
  under_review: [
    "accepted_with_limitations",
    "blocked_awaiting_authorised_dataset",
    "blocked_no_live_multiscale_engine",
    "blocked_unvalidated_cross_scale_coupling",
    "blocked_invented_parameters",
    "blocked_individual_outcome_prediction_claim",
    "rejected",
    "draft",
  ],
  accepted_with_limitations: ["superseded"],
  blocked_awaiting_authorised_dataset: ["draft", "rejected"],
  blocked_no_live_multiscale_engine: ["draft", "rejected"],
  blocked_unvalidated_cross_scale_coupling: ["draft", "rejected"],
  blocked_invented_parameters: ["draft", "rejected"],
  blocked_individual_outcome_prediction_claim: ["draft", "rejected"],
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

function assertHonesty(
  honesty: MultiscaleSimulationIntegrationHonesty,
): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
  }
  if (honesty.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must not claim validated individual outcome prediction");
  }
  if (honesty.notDigitalTwinProduct !== true) {
    throw Error("Not a digital twin product");
  }
  if (honesty.notPersonalisedTreatmentEffect !== true) {
    throw Error("Not a personalised treatment effect");
  }
  if (honesty.molecularDoesNotEqualOrganWithoutValidatedCoupling !== true) {
    throw Error(
      "Molecular does not equal organ without validated coupling",
    );
  }
  if (honesty.doNotInventMissingParameters !== true) {
    throw Error("Must not invent missing parameters");
  }
  if (honesty.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine forbidden");
  }
  if (honesty.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (honesty.fixtureHarnessIsNotLiveEngine !== true) {
    throw Error("Fixture harness is not a live engine");
  }
  if (honesty.populationAssociationIsNotIndividualTruth !== true) {
    throw Error("Population association is not individual truth");
  }
  if (honesty.observedIsNotInferred !== true) {
    throw Error("Observed must stay distinct from inferred");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noAutonomousDiagnosisOrPrescribing !== true) {
    throw Error("Autonomous diagnosis/prescribing forbidden");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR7");
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
    throw Error("Scientific approval must stay false in PR7");
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
      /\b(?:not|no|without|never|does\s+not|do\s+not|must\s+not|refusing|refuse|forbidding|forbid|avoid(?:ing)?)\s+(?:a\s+|an\s+|the\s+|claim(?:ing)?\s+|present(?:ing)?\s+|invent(?:ed|ing)?\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|personalised\s+treatment\s+effect|validated\s+individual\s+outcome\s+prediction|digital\s+twin(?:\s+product)?|live\s+(?:twin|multiscale(?:\s+engine)?|m11(?:\s+claims?)?)|m11\s+(?:live\s+)?(?:multiscale\s+)?(?:simulation\s+)?(?:engine|claims?)|invented\s+parameters?|parameters)(?:\s+or\s+(?:a\s+|an\s+|the\s+)?(?:diagnosis|diagnosing|diagnose|prescription|prescribing|prescribe|personalised\s+treatment\s+effect|validated\s+individual\s+outcome\s+prediction|digital\s+twin(?:\s+product)?|live\s+(?:twin|multiscale(?:\s+engine)?|m11(?:\s+claims?)?)|m11\s+(?:live\s+)?(?:multiscale\s+)?(?:simulation\s+)?(?:engine|claims?)|invented\s+parameters?|parameters))*/g,
      " ",
    )
    .replace(
      /\b(?:without|not)\s+invent(?:ed|ing)\s+parameters?\b/g,
      " ",
    );
  if (
    /\bdiagnos(e|is|ing)\b/.test(lower) ||
    /\bprescribe\b/.test(lower) ||
    /\bpersonalised\s+treatment\s+effect\b/.test(lower) ||
    /\bvalidated\s+individual\s+outcome\s+prediction\b/.test(lower) ||
    /\bdigital\s+twin(?:\s+product)?\b/.test(lower) ||
    /\blive\s+(?:twin|multiscale\s+engine)\b/.test(lower) ||
    /\bm11\s+(?:live\s+)?(?:multiscale\s+)?(?:simulation\s+)?engine\b/.test(
      lower,
    ) ||
    /\binvent(?:ed|ing)\s+parameters?\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower)
  ) {
    throw Error(
      `${label} must not diagnose/prescribe, claim validated individual outcome prediction, twin product, live multiscale/M11 engine, invent parameters, invent counts, or include identifiers`,
    );
  }
}

function assertActor(actor: MsiActor, label: string): MsiActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, MSI_ACTOR_KINDS, `${label} actorKind`);
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

function dataBasisForAvailability(
  availability: MsiDatasetAvailability,
): MsiDataBasis {
  if (availability === "authorised_declared") return "declared_research";
  if (availability === "fixture_only") return "fixture_engineering";
  return "fixture_engineering";
}

export function isOutOfScopeApplicability(
  outcome: MsiApplicabilityOutcome,
): boolean {
  return (
    outcome === "out_of_scope_outside_validated_population" ||
    outcome === "out_of_scope_outside_input_domain"
  );
}

export function isUnavailableModelComponent(
  availability: MsiComponentAvailability,
): boolean {
  return (
    availability === "unavailable_declared" ||
    availability === "blocked_no_validated_coupling"
  );
}

export function isFixtureHarnessRun(runMode: MsiRunMode): boolean {
  return runMode === "fixture_harness_only";
}

export function draftMultiscaleSimulationIntegrationSpec(input: {
  id: string;
  displayName: string;
  scientificQuestion: string;
  capabilityKinds?: readonly MsiCapabilityKind[];
  diseaseContextId: string;
  simulationScenarioId?: string | null;
  digitalPatientModelId?: string | null;
  patientContextualisedResearchSpecId?: string | null;
  crossScaleOntologySpecId?: string | null;
  populationModellingSpecId?: string | null;
  integratedDiseaseContextId?: string | null;
  longitudinalModellingSpecId?: string | null;
  cohortDefinitionId?: string | null;
  rweStudyId?: string | null;
  longitudinalClinicalEvidenceSpecId?: string | null;
  datasetAvailability: MsiDatasetAvailability;
  accessClassification?: MsiAccessClassification;
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): MultiscaleSimulationIntegrationSpec {
  if (!SPEC_ID_RE.test(input.id)) throw Error("Invalid integration spec id");
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.scientificQuestion, 2000)) {
    throw Error("Invalid scientificQuestion");
  }
  assertNoForbiddenClaimLanguage(
    input.scientificQuestion,
    "scientificQuestion",
  );
  if (!HDI_CTX_RE.test(input.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    input.datasetAvailability,
    MSI_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const capabilityKinds =
    input.capabilityKinds && input.capabilityKinds.length > 0
      ? [...new Set(input.capabilityKinds)]
      : [...MSI_CAPABILITY_KINDS];
  for (const kind of capabilityKinds) {
    assertClosed(kind, MSI_CAPABILITY_KINDS, "capabilityKind");
  }

  const accessClassification =
    input.accessClassification ??
    (input.datasetAvailability === "authorised_declared"
      ? "authorised_pseudonymous_research"
      : input.datasetAvailability === "fixture_only"
        ? "fixture_engineering"
        : "restricted_not_ingested");
  assertClosed(
    accessClassification,
    MSI_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );

  const lifecycle: MsiLifecycle =
    input.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: MultiscaleSimulationIntegrationSpec = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    scientificQuestion: input.scientificQuestion.trim(),
    capabilityKinds,
    diseaseContextId: input.diseaseContextId,
    simulationScenarioId: assertOptionalId(
      input.simulationScenarioId,
      HDI_SIM_RE,
      "simulationScenarioId",
    ),
    digitalPatientModelId: assertOptionalId(
      input.digitalPatientModelId,
      HDI_DPM_RE,
      "digitalPatientModelId",
    ),
    patientContextualisedResearchSpecId: assertOptionalId(
      input.patientContextualisedResearchSpecId,
      PCRM_SPEC_RE,
      "patientContextualisedResearchSpecId",
    ),
    crossScaleOntologySpecId: assertOptionalId(
      input.crossScaleOntologySpecId,
      CSOL_SPEC_RE,
      "crossScaleOntologySpecId",
    ),
    populationModellingSpecId: assertOptionalId(
      input.populationModellingSpecId,
      PCDM_SPEC_RE,
      "populationModellingSpecId",
    ),
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
    cohortDefinitionId: assertOptionalId(
      input.cohortDefinitionId,
      RCB_COH_RE,
      "cohortDefinitionId",
    ),
    rweStudyId: assertOptionalId(input.rweStudyId, RWE_STUDY_RE, "rweStudyId"),
    longitudinalClinicalEvidenceSpecId: assertOptionalId(
      input.longitudinalClinicalEvidenceSpecId,
      LCE_SPEC_RE,
      "longitudinalClinicalEvidenceSpecId",
    ),
    datasetAvailability: input.datasetAvailability,
    accessClassification,
    containsIdentifiablePhi: false,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    inventedParameters: null,
    notValidatedIndividualOutcomePrediction: true,
    notPersonalisedTreatmentEffect: true,
    notDigitalTwinProduct: true,
    molecularDoesNotEqualOrganWithoutValidatedCoupling: true,
    lifecycle,
    reviewedBy: null,
    authoredBy: assertActor(
      {
        principalId: input.authoredByPrincipalId,
        actorKind: input.authoredByActorKind ?? "ai_agent",
      },
      "authoredBy",
    ),
    dataBasis: dataBasisForAvailability(input.datasetAvailability),
    fixtureHonesty: input.datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMultiscaleSimulationIntegrationSpec(record);
}

export function validateMultiscaleSimulationIntegrationSpec(
  record: MultiscaleSimulationIntegrationSpec,
): MultiscaleSimulationIntegrationSpec {
  if (!SPEC_ID_RE.test(record.id)) throw Error("Invalid integration spec id");
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  if (record.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must declare not validated individual outcome prediction");
  }
  if (record.notPersonalisedTreatmentEffect !== true) {
    throw Error("Must declare not personalised treatment effect");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.molecularDoesNotEqualOrganWithoutValidatedCoupling !== true) {
    throw Error(
      "Must declare molecular ≠ organ without validated coupling",
    );
  }
  assertClosed(record.lifecycle, MSI_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    MSI_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(
    record.accessClassification,
    MSI_ACCESS_CLASSIFICATIONS,
    "accessClassification",
  );
  assertClosed(record.dataBasis, MSI_DATA_BASES, "dataBasis");
  for (const kind of record.capabilityKinds) {
    assertClosed(kind, MSI_CAPABILITY_KINDS, "capabilityKind");
  }
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionMultiscaleSimulationIntegrationSpec(input: {
  spec: MultiscaleSimulationIntegrationSpec;
  to: MsiLifecycle;
  updatedAt: string;
  actor: MsiActor;
}): MultiscaleSimulationIntegrationSpec {
  const current = validateMultiscaleSimulationIntegrationSpec(input.spec);
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
  if (
    input.to === "accepted_with_limitations" &&
    current.liveMultiscaleEngineOperational !== false
  ) {
    throw Error("Cannot accept while claiming live multiscale engine");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validateMultiscaleSimulationIntegrationSpec({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftDiseaseResearchQuestionSelection(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  researchQuestion: string;
  questionScopeSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): DiseaseResearchQuestionSelection {
  if (!DRQ_ID_RE.test(input.id)) {
    throw Error("Invalid disease research question id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  if (!textOk(input.researchQuestion, 2000)) {
    throw Error("Invalid researchQuestion");
  }
  assertNoForbiddenClaimLanguage(input.researchQuestion, "researchQuestion");
  if (!textOk(input.questionScopeSummary, 2000)) {
    throw Error("Invalid questionScopeSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.questionScopeSummary,
    "questionScopeSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: DiseaseResearchQuestionSelection = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    researchQuestion: input.researchQuestion.trim(),
    questionScopeSummary: input.questionScopeSummary.trim(),
    notClinicalCareQuestion: true,
    limitations: assertLimitations(input.limitations),
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
  return validateDiseaseResearchQuestionSelection(record);
}

export function validateDiseaseResearchQuestionSelection(
  record: DiseaseResearchQuestionSelection,
): DiseaseResearchQuestionSelection {
  if (!DRQ_ID_RE.test(record.id)) {
    throw Error("Invalid disease research question id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.notClinicalCareQuestion !== true) {
    throw Error("Must declare not a clinical care question");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftValidatedModelComponentIdentification(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  diseaseResearchQuestion: DiseaseResearchQuestionSelection;
  componentRefId: string;
  componentLabel: string;
  availability: MsiComponentAvailability;
  crossScaleMappingId?: string | null;
  availabilitySummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): ValidatedModelComponentIdentification {
  if (!VMC_ID_RE.test(input.id)) {
    throw Error("Invalid validated model component id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  const question = validateDiseaseResearchQuestionSelection(
    input.diseaseResearchQuestion,
  );
  if (question.integrationSpecId !== spec.id) {
    throw Error("Disease research question must match integration spec");
  }
  if (!REF_ID_RE.test(input.componentRefId)) {
    throw Error("Invalid componentRefId");
  }
  if (!textOk(input.componentLabel, 240)) throw Error("Invalid componentLabel");
  assertNoForbiddenClaimLanguage(input.componentLabel, "componentLabel");
  assertClosed(input.availability, MSI_COMPONENT_AVAILABILITY, "availability");
  if (!textOk(input.availabilitySummary, 2000)) {
    throw Error("Invalid availabilitySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.availabilitySummary,
    "availabilitySummary",
  );
  if (
    input.availability === "validated_component_declared" &&
    input.crossScaleMappingId == null &&
    spec.crossScaleOntologySpecId != null
  ) {
    // Validated components may omit mapping when single-scale; cross-scale
    // molecular→organ still requires coupling declaration separately.
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: ValidatedModelComponentIdentification = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    diseaseResearchQuestionId: question.id,
    componentRefId: input.componentRefId,
    componentLabel: input.componentLabel.trim(),
    availability: input.availability,
    crossScaleMappingId: assertOptionalId(
      input.crossScaleMappingId,
      CSOL_MAP_RE,
      "crossScaleMappingId",
    ),
    availabilitySummary: input.availabilitySummary.trim(),
    limitations: assertLimitations(input.limitations),
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
  return validateValidatedModelComponentIdentification(record);
}

export function validateValidatedModelComponentIdentification(
  record: ValidatedModelComponentIdentification,
): ValidatedModelComponentIdentification {
  if (!VMC_ID_RE.test(record.id)) {
    throw Error("Invalid validated model component id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (!DRQ_ID_RE.test(record.diseaseResearchQuestionId)) {
    throw Error("Invalid diseaseResearchQuestionId");
  }
  if (!REF_ID_RE.test(record.componentRefId)) {
    throw Error("Invalid componentRefId");
  }
  assertClosed(record.availability, MSI_COMPONENT_AVAILABILITY, "availability");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftModelApplicabilityCheck(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  diseaseResearchQuestion?: DiseaseResearchQuestionSelection | null;
  applicabilityOutcome: MsiApplicabilityOutcome;
  applicabilitySummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): ModelApplicabilityCheck {
  if (!APP_ID_RE.test(input.id)) {
    throw Error("Invalid model applicability check id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  assertClosed(
    input.applicabilityOutcome,
    MSI_APPLICABILITY_OUTCOMES,
    "applicabilityOutcome",
  );
  if (!textOk(input.applicabilitySummary, 2000)) {
    throw Error("Invalid applicabilitySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.applicabilitySummary,
    "applicabilitySummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  if (
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.applicabilityOutcome === "applicable_within_validated_domain"
  ) {
    throw Error(
      "Blocked dataset cannot claim applicable_within_validated_domain",
    );
  }

  const outsideValidatedPopulation =
    input.applicabilityOutcome === "out_of_scope_outside_validated_population";
  const outsideInputDomain =
    input.applicabilityOutcome === "out_of_scope_outside_input_domain";
  const missingValidatedCoupling =
    input.applicabilityOutcome === "blocked_no_validated_coupling";
  const outOfScope = isOutOfScopeApplicability(input.applicabilityOutcome);

  const question = input.diseaseResearchQuestion
    ? validateDiseaseResearchQuestionSelection(input.diseaseResearchQuestion)
    : null;
  if (question && question.integrationSpecId !== spec.id) {
    throw Error("Disease research question must match integration spec");
  }

  const record: ModelApplicabilityCheck = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    diseaseResearchQuestionId: question?.id ?? null,
    applicabilityOutcome: input.applicabilityOutcome,
    applicabilitySummary: input.applicabilitySummary.trim(),
    outsideValidatedPopulation,
    outsideInputDomain,
    missingValidatedCoupling,
    outOfScope,
    limitations: assertLimitations(input.limitations),
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
  return validateModelApplicabilityCheck(record);
}

export function validateModelApplicabilityCheck(
  record: ModelApplicabilityCheck,
): ModelApplicabilityCheck {
  if (!APP_ID_RE.test(record.id)) {
    throw Error("Invalid model applicability check id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.applicabilityOutcome,
    MSI_APPLICABILITY_OUTCOMES,
    "applicabilityOutcome",
  );
  const expectedOutOfScope = isOutOfScopeApplicability(
    record.applicabilityOutcome,
  );
  if (record.outOfScope !== expectedOutOfScope) {
    throw Error("outOfScope inconsistent with applicabilityOutcome");
  }
  if (
    record.outsideValidatedPopulation !==
    (record.applicabilityOutcome ===
      "out_of_scope_outside_validated_population")
  ) {
    throw Error("outsideValidatedPopulation inconsistent");
  }
  if (
    record.outsideInputDomain !==
    (record.applicabilityOutcome === "out_of_scope_outside_input_domain")
  ) {
    throw Error("outsideInputDomain inconsistent");
  }
  if (
    record.missingValidatedCoupling !==
    (record.applicabilityOutcome === "blocked_no_validated_coupling")
  ) {
    throw Error("missingValidatedCoupling inconsistent");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftAuthorisedInputDataRetrieval(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  authorisationStatus: MsiInputAuthorisationStatus;
  inputDataRefIds: readonly string[];
  inputSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): AuthorisedInputDataRetrieval {
  if (!AID_ID_RE.test(input.id)) {
    throw Error("Invalid authorised input data id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  assertClosed(
    input.authorisationStatus,
    MSI_INPUT_AUTHORISATION_STATUSES,
    "authorisationStatus",
  );
  if (
    spec.datasetAvailability === "fixture_only" &&
    input.authorisationStatus === "authorised_declared"
  ) {
    throw Error("Fixture dataset cannot claim authorised_declared");
  }
  if (
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset" &&
    input.authorisationStatus === "authorised_declared"
  ) {
    throw Error("Blocked dataset cannot claim authorised_declared");
  }
  if (!textOk(input.inputSummary, 2000)) throw Error("Invalid inputSummary");
  assertNoForbiddenClaimLanguage(input.inputSummary, "inputSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: AuthorisedInputDataRetrieval = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    authorisationStatus: input.authorisationStatus,
    inputDataRefIds: assertIdList(
      input.inputDataRefIds,
      REF_ID_RE,
      "inputDataRefIds",
      32,
    ),
    inputSummary: input.inputSummary.trim(),
    containsIdentifiablePhi: false,
    inventedParameters: null,
    limitations: assertLimitations(input.limitations),
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
  return validateAuthorisedInputDataRetrieval(record);
}

export function validateAuthorisedInputDataRetrieval(
  record: AuthorisedInputDataRetrieval,
): AuthorisedInputDataRetrieval {
  if (!AID_ID_RE.test(record.id)) {
    throw Error("Invalid authorised input data id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.authorisationStatus,
    MSI_INPUT_AUTHORISATION_STATUSES,
    "authorisationStatus",
  );
  if (record.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  assertIdList(record.inputDataRefIds, REF_ID_RE, "inputDataRefIds", 32);
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftBiologicalClinicalAssumptionDefinition(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  assumptionStatements: readonly string[];
  assumptionSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): BiologicalClinicalAssumptionDefinition {
  if (!ASM_ID_RE.test(input.id)) {
    throw Error("Invalid biological/clinical assumption id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  if (input.assumptionStatements.length === 0) {
    throw Error("assumptionStatements required");
  }
  if (!textOk(input.assumptionSummary, 2000)) {
    throw Error("Invalid assumptionSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.assumptionSummary,
    "assumptionSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: BiologicalClinicalAssumptionDefinition = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    assumptionStatements: assertStringList(
      input.assumptionStatements,
      "assumptionStatements",
      16,
      1000,
    ),
    assumptionSummary: input.assumptionSummary.trim(),
    inventedParameters: null,
    limitations: assertLimitations(input.limitations),
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
  return validateBiologicalClinicalAssumptionDefinition(record);
}

export function validateBiologicalClinicalAssumptionDefinition(
  record: BiologicalClinicalAssumptionDefinition,
): BiologicalClinicalAssumptionDefinition {
  if (!ASM_ID_RE.test(record.id)) {
    throw Error("Invalid biological/clinical assumption id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  assertStringList(
    record.assumptionStatements,
    "assumptionStatements",
    16,
    1000,
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftModelCouplingDeclaration(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  couplingSupportStatus: MsiCouplingSupportStatus;
  coupledVariables: readonly string[];
  units: readonly string[];
  timeScales: readonly string[];
  assumptions: readonly string[];
  identifiabilityStatus: MsiIdentifiabilityStatus;
  validationEvidenceRefs?: readonly string[];
  knownFailureConditions: readonly string[];
  couplingSummary: string;
  crossScaleMappingId?: string | null;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): ModelCouplingDeclaration {
  if (!CPL_ID_RE.test(input.id)) {
    throw Error("Invalid model coupling declaration id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  assertClosed(
    input.couplingSupportStatus,
    MSI_COUPLING_SUPPORT_STATUSES,
    "couplingSupportStatus",
  );
  assertClosed(
    input.identifiabilityStatus,
    MSI_IDENTIFIABILITY_STATUSES,
    "identifiabilityStatus",
  );
  if (input.coupledVariables.length === 0) {
    throw Error("coupledVariables required");
  }
  if (input.units.length === 0) throw Error("units required");
  if (input.timeScales.length === 0) throw Error("timeScales required");
  if (input.assumptions.length === 0) throw Error("assumptions required");
  if (input.knownFailureConditions.length === 0) {
    throw Error("knownFailureConditions required");
  }
  if (
    input.couplingSupportStatus === "validated_coupling_declared" &&
    (input.validationEvidenceRefs ?? []).length === 0
  ) {
    throw Error(
      "Validated coupling requires at least one validationEvidenceRef",
    );
  }
  if (!textOk(input.couplingSummary, 2000)) {
    throw Error("Invalid couplingSummary");
  }
  assertNoForbiddenClaimLanguage(input.couplingSummary, "couplingSummary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: ModelCouplingDeclaration = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    crossScaleOntologySpecId: spec.crossScaleOntologySpecId,
    crossScaleMappingId: assertOptionalId(
      input.crossScaleMappingId,
      CSOL_MAP_RE,
      "crossScaleMappingId",
    ),
    couplingSupportStatus: input.couplingSupportStatus,
    coupledVariables: assertStringList(
      input.coupledVariables,
      "coupledVariables",
      16,
      240,
    ),
    units: assertStringList(input.units, "units", 16, 80),
    timeScales: assertStringList(input.timeScales, "timeScales", 16, 240),
    assumptions: assertStringList(input.assumptions, "assumptions", 16, 1000),
    identifiabilityStatus: input.identifiabilityStatus,
    validationEvidenceRefs: assertIdList(
      input.validationEvidenceRefs ?? [],
      REF_ID_RE,
      "validationEvidenceRefs",
      16,
    ),
    knownFailureConditions: assertStringList(
      input.knownFailureConditions,
      "knownFailureConditions",
      16,
      1000,
    ),
    molecularDoesNotEqualOrganWithoutValidatedCoupling: true,
    inventedParameters: null,
    couplingSummary: input.couplingSummary.trim(),
    limitations: assertLimitations(input.limitations),
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
  return validateModelCouplingDeclaration(record);
}

export function validateModelCouplingDeclaration(
  record: ModelCouplingDeclaration,
): ModelCouplingDeclaration {
  if (!CPL_ID_RE.test(record.id)) {
    throw Error("Invalid model coupling declaration id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.couplingSupportStatus,
    MSI_COUPLING_SUPPORT_STATUSES,
    "couplingSupportStatus",
  );
  assertClosed(
    record.identifiabilityStatus,
    MSI_IDENTIFIABILITY_STATUSES,
    "identifiabilityStatus",
  );
  if (record.molecularDoesNotEqualOrganWithoutValidatedCoupling !== true) {
    throw Error(
      "Must declare molecular ≠ organ without validated coupling",
    );
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  if (
    record.couplingSupportStatus === "validated_coupling_declared" &&
    record.validationEvidenceRefs.length === 0
  ) {
    throw Error(
      "Validated coupling requires at least one validationEvidenceRef",
    );
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftSimulationConfiguration(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  diseaseResearchQuestion: DiseaseResearchQuestionSelection;
  authorisedInputData: AuthorisedInputDataRetrieval;
  assumptionDefinition: BiologicalClinicalAssumptionDefinition;
  modelCouplingDeclaration?: ModelCouplingDeclaration | null;
  configurationSummary: string;
  configuredComponentRefIds: readonly string[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): SimulationConfiguration {
  if (!CFG_ID_RE.test(input.id)) {
    throw Error("Invalid simulation configuration id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  const question = validateDiseaseResearchQuestionSelection(
    input.diseaseResearchQuestion,
  );
  const authorised = validateAuthorisedInputDataRetrieval(
    input.authorisedInputData,
  );
  const assumptions = validateBiologicalClinicalAssumptionDefinition(
    input.assumptionDefinition,
  );
  if (question.integrationSpecId !== spec.id) {
    throw Error("Disease research question must match integration spec");
  }
  if (authorised.integrationSpecId !== spec.id) {
    throw Error("Authorised input data must match integration spec");
  }
  if (assumptions.integrationSpecId !== spec.id) {
    throw Error("Assumption definition must match integration spec");
  }
  const coupling = input.modelCouplingDeclaration
    ? validateModelCouplingDeclaration(input.modelCouplingDeclaration)
    : null;
  if (coupling && coupling.integrationSpecId !== spec.id) {
    throw Error("Model coupling declaration must match integration spec");
  }
  if (
    coupling &&
    coupling.couplingSupportStatus === "blocked_no_validated_coupling"
  ) {
    throw Error(
      "Cannot configure simulation under blocked_no_validated_coupling",
    );
  }
  if (!textOk(input.configurationSummary, 2000)) {
    throw Error("Invalid configurationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.configurationSummary,
    "configurationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: SimulationConfiguration = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    diseaseResearchQuestionId: question.id,
    authorisedInputDataId: authorised.id,
    assumptionDefinitionId: assumptions.id,
    modelCouplingDeclarationId: coupling?.id ?? null,
    configurationSummary: input.configurationSummary.trim(),
    configuredComponentRefIds: assertIdList(
      input.configuredComponentRefIds,
      REF_ID_RE,
      "configuredComponentRefIds",
      32,
    ),
    liveMultiscaleEngineOperational: false,
    inventedParameters: null,
    limitations: assertLimitations(input.limitations),
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
  return validateSimulationConfiguration(record);
}

export function validateSimulationConfiguration(
  record: SimulationConfiguration,
): SimulationConfiguration {
  if (!CFG_ID_RE.test(record.id)) {
    throw Error("Invalid simulation configuration id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftApprovedComputationalModelRun(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  simulationConfiguration: SimulationConfiguration;
  runMode: MsiRunMode;
  runSummary: string;
  harnessLabel: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): ApprovedComputationalModelRun {
  if (!RUN_ID_RE.test(input.id)) {
    throw Error("Invalid approved computational model run id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  const configuration = validateSimulationConfiguration(
    input.simulationConfiguration,
  );
  if (configuration.integrationSpecId !== spec.id) {
    throw Error("Simulation configuration must match integration spec");
  }
  assertClosed(input.runMode, MSI_RUN_MODES, "runMode");
  if (!textOk(input.runSummary, 2000)) throw Error("Invalid runSummary");
  assertNoForbiddenClaimLanguage(input.runSummary, "runSummary");
  if (!textOk(input.harnessLabel, 240)) throw Error("Invalid harnessLabel");
  assertNoForbiddenClaimLanguage(input.harnessLabel, "harnessLabel");
  if (
    input.runMode === "fixture_harness_only" &&
    !/fixture|harness/i.test(input.harnessLabel)
  ) {
    throw Error(
      "Fixture harness runs must label harness honestly (fixture/harness)",
    );
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: ApprovedComputationalModelRun = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    simulationConfigurationId: configuration.id,
    runMode: input.runMode,
    runSummary: input.runSummary.trim(),
    harnessLabel: input.harnessLabel.trim(),
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    fixtureHarnessIsNotLiveEngine: true,
    notValidatedIndividualOutcomePrediction: true,
    inventedParameters: null,
    limitations: assertLimitations(input.limitations),
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
  return validateApprovedComputationalModelRun(record);
}

export function validateApprovedComputationalModelRun(
  record: ApprovedComputationalModelRun,
): ApprovedComputationalModelRun {
  if (!RUN_ID_RE.test(record.id)) {
    throw Error("Invalid approved computational model run id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(record.runMode, MSI_RUN_MODES, "runMode");
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (record.fixtureHarnessIsNotLiveEngine !== true) {
    throw Error("Fixture harness is not a live engine");
  }
  if (record.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must declare not validated individual outcome prediction");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftUncertaintyQuantification(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  approvedComputationalModelRun?: ApprovedComputationalModelRun | null;
  uncertaintyOrdinal: MsiUncertaintyOrdinal;
  uncertaintySummary: string;
  sourcesOfUncertainty: readonly string[];
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): UncertaintyQuantification {
  if (!UNC_ID_RE.test(input.id)) {
    throw Error("Invalid uncertainty quantification id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  assertClosed(
    input.uncertaintyOrdinal,
    MSI_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  if (!textOk(input.uncertaintySummary, 2000)) {
    throw Error("Invalid uncertaintySummary");
  }
  assertNoForbiddenClaimLanguage(
    input.uncertaintySummary,
    "uncertaintySummary",
  );
  if (input.sourcesOfUncertainty.length === 0) {
    throw Error("sourcesOfUncertainty required");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const run = input.approvedComputationalModelRun
    ? validateApprovedComputationalModelRun(
        input.approvedComputationalModelRun,
      )
    : null;
  if (run && run.integrationSpecId !== spec.id) {
    throw Error("Model run must match integration spec");
  }

  const record: UncertaintyQuantification = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    approvedComputationalModelRunId: run?.id ?? null,
    uncertaintyOrdinal: input.uncertaintyOrdinal,
    uncertaintySummary: input.uncertaintySummary.trim(),
    sourcesOfUncertainty: assertStringList(
      input.sourcesOfUncertainty,
      "sourcesOfUncertainty",
      16,
      500,
    ),
    limitations: assertLimitations(input.limitations),
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
  return validateUncertaintyQuantification(record);
}

export function validateUncertaintyQuantification(
  record: UncertaintyQuantification,
): UncertaintyQuantification {
  if (!UNC_ID_RE.test(record.id)) {
    throw Error("Invalid uncertainty quantification id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.uncertaintyOrdinal,
    MSI_UNCERTAINTY_ORDINALS,
    "uncertaintyOrdinal",
  );
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftNumericalBiologicalValidityEvaluation(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  approvedComputationalModelRun: ApprovedComputationalModelRun;
  numericalValidityFlag: MsiNumericalValidityFlag;
  biologicalValidityFlag: MsiBiologicalValidityFlag;
  evaluationSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): NumericalBiologicalValidityEvaluation {
  if (!VAL_ID_RE.test(input.id)) {
    throw Error("Invalid numerical/biological validity evaluation id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  const run = validateApprovedComputationalModelRun(
    input.approvedComputationalModelRun,
  );
  if (run.integrationSpecId !== spec.id) {
    throw Error("Model run must match integration spec");
  }
  assertClosed(
    input.numericalValidityFlag,
    MSI_NUMERICAL_VALIDITY_FLAGS,
    "numericalValidityFlag",
  );
  assertClosed(
    input.biologicalValidityFlag,
    MSI_BIOLOGICAL_VALIDITY_FLAGS,
    "biologicalValidityFlag",
  );
  if (!textOk(input.evaluationSummary, 2000)) {
    throw Error("Invalid evaluationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.evaluationSummary,
    "evaluationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const record: NumericalBiologicalValidityEvaluation = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    approvedComputationalModelRunId: run.id,
    numericalValidityFlag: input.numericalValidityFlag,
    biologicalValidityFlag: input.biologicalValidityFlag,
    evaluationSummary: input.evaluationSummary.trim(),
    notValidatedIndividualOutcomePrediction: true,
    limitations: assertLimitations(input.limitations),
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
  return validateNumericalBiologicalValidityEvaluation(record);
}

export function validateNumericalBiologicalValidityEvaluation(
  record: NumericalBiologicalValidityEvaluation,
): NumericalBiologicalValidityEvaluation {
  if (!VAL_ID_RE.test(record.id)) {
    throw Error("Invalid numerical/biological validity evaluation id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  assertClosed(
    record.numericalValidityFlag,
    MSI_NUMERICAL_VALIDITY_FLAGS,
    "numericalValidityFlag",
  );
  assertClosed(
    record.biologicalValidityFlag,
    MSI_BIOLOGICAL_VALIDITY_FLAGS,
    "biologicalValidityFlag",
  );
  if (record.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must declare not validated individual outcome prediction");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftResearchInterpretationEnvelope(input: {
  id: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  diseaseResearchQuestion?: DiseaseResearchQuestionSelection | null;
  approvedComputationalModelRun?: ApprovedComputationalModelRun | null;
  modelApplicabilityCheck?: ModelApplicabilityCheck | null;
  uncertaintyQuantification?: UncertaintyQuantification | null;
  numericalBiologicalValidityEvaluation?: NumericalBiologicalValidityEvaluation | null;
  modelCouplingDeclaration?: ModelCouplingDeclaration | null;
  interpretationSummary: string;
  limitations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): ResearchInterpretationEnvelope {
  if (!INT_ID_RE.test(input.id)) {
    throw Error("Invalid research interpretation envelope id");
  }
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  const applicability = input.modelApplicabilityCheck
    ? validateModelApplicabilityCheck(input.modelApplicabilityCheck)
    : null;
  if (applicability && applicability.outOfScope) {
    throw Error(
      "Research interpretation refused while applicability is out of scope",
    );
  }
  if (
    applicability &&
    applicability.applicabilityOutcome === "blocked_no_validated_coupling"
  ) {
    throw Error(
      "Research interpretation refused without validated cross-scale coupling",
    );
  }
  if (!textOk(input.interpretationSummary, 4000)) {
    throw Error("Invalid interpretationSummary");
  }
  assertNoForbiddenClaimLanguage(
    input.interpretationSummary,
    "interpretationSummary",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const question = input.diseaseResearchQuestion
    ? validateDiseaseResearchQuestionSelection(input.diseaseResearchQuestion)
    : null;
  const run = input.approvedComputationalModelRun
    ? validateApprovedComputationalModelRun(
        input.approvedComputationalModelRun,
      )
    : null;
  const uncertainty = input.uncertaintyQuantification
    ? validateUncertaintyQuantification(input.uncertaintyQuantification)
    : null;
  const validity = input.numericalBiologicalValidityEvaluation
    ? validateNumericalBiologicalValidityEvaluation(
        input.numericalBiologicalValidityEvaluation,
      )
    : null;
  const coupling = input.modelCouplingDeclaration
    ? validateModelCouplingDeclaration(input.modelCouplingDeclaration)
    : null;

  const record: ResearchInterpretationEnvelope = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    integrationSpecId: spec.id,
    diseaseContextId: spec.diseaseContextId,
    diseaseResearchQuestionId: question?.id ?? null,
    approvedComputationalModelRunId: run?.id ?? null,
    modelApplicabilityCheckId: applicability?.id ?? null,
    uncertaintyQuantificationId: uncertainty?.id ?? null,
    numericalBiologicalValidityEvaluationId: validity?.id ?? null,
    modelCouplingDeclarationId: coupling?.id ?? null,
    interpretationSummary: input.interpretationSummary.trim(),
    researchOnly: true,
    reviewable: true,
    notValidatedIndividualOutcomePrediction: true,
    notPersonalisedTreatmentEffect: true,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    limitations: assertLimitations(input.limitations),
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
  return validateResearchInterpretationEnvelope(record);
}

export function validateResearchInterpretationEnvelope(
  record: ResearchInterpretationEnvelope,
): ResearchInterpretationEnvelope {
  if (!INT_ID_RE.test(record.id)) {
    throw Error("Invalid research interpretation envelope id");
  }
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.researchOnly !== true) {
    throw Error("Interpretation must be research-only");
  }
  if (record.reviewable !== true) {
    throw Error("Interpretation must be reviewable");
  }
  if (record.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must declare not validated individual outcome prediction");
  }
  if (record.notPersonalisedTreatmentEffect !== true) {
    throw Error("Must declare not personalised treatment effect");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  return record;
}

export function draftMultiscaleSimulationIntegrationBundle(input: {
  id: string;
  displayName: string;
  integrationSpec: MultiscaleSimulationIntegrationSpec;
  bundleVersion: string;
  limitations: readonly string[];
  diseaseResearchQuestions?: readonly DiseaseResearchQuestionSelection[];
  validatedModelComponents?: readonly ValidatedModelComponentIdentification[];
  modelApplicabilityChecks?: readonly ModelApplicabilityCheck[];
  authorisedInputData?: readonly AuthorisedInputDataRetrieval[];
  biologicalClinicalAssumptions?: readonly BiologicalClinicalAssumptionDefinition[];
  modelCouplingDeclarations?: readonly ModelCouplingDeclaration[];
  simulationConfigurations?: readonly SimulationConfiguration[];
  approvedComputationalModelRuns?: readonly ApprovedComputationalModelRun[];
  uncertaintyQuantifications?: readonly UncertaintyQuantification[];
  numericalBiologicalValidityEvaluations?: readonly NumericalBiologicalValidityEvaluation[];
  researchInterpretationEnvelopes?: readonly ResearchInterpretationEnvelope[];
  authoredByPrincipalId: string;
  authoredByActorKind?: MsiActorKind;
  createdAt: string;
  note?: string;
}): MultiscaleSimulationIntegrationBundle {
  if (!BND_ID_RE.test(input.id)) throw Error("Invalid bundle id");
  const spec = validateMultiscaleSimulationIntegrationSpec(
    input.integrationSpec,
  );
  if (!textOk(input.displayName, 200)) throw Error("Invalid displayName");
  assertNoForbiddenClaimLanguage(input.displayName, "displayName");
  if (!textOk(input.bundleVersion, 40)) throw Error("Invalid bundleVersion");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const diseaseResearchQuestions = (
    input.diseaseResearchQuestions ?? []
  ).map(validateDiseaseResearchQuestionSelection);
  const validatedModelComponents = (
    input.validatedModelComponents ?? []
  ).map(validateValidatedModelComponentIdentification);
  const modelApplicabilityChecks = (
    input.modelApplicabilityChecks ?? []
  ).map(validateModelApplicabilityCheck);
  const authorisedInputData = (input.authorisedInputData ?? []).map(
    validateAuthorisedInputDataRetrieval,
  );
  const biologicalClinicalAssumptions = (
    input.biologicalClinicalAssumptions ?? []
  ).map(validateBiologicalClinicalAssumptionDefinition);
  const modelCouplingDeclarations = (
    input.modelCouplingDeclarations ?? []
  ).map(validateModelCouplingDeclaration);
  const simulationConfigurations = (
    input.simulationConfigurations ?? []
  ).map(validateSimulationConfiguration);
  const approvedComputationalModelRuns = (
    input.approvedComputationalModelRuns ?? []
  ).map(validateApprovedComputationalModelRun);
  const uncertaintyQuantifications = (
    input.uncertaintyQuantifications ?? []
  ).map(validateUncertaintyQuantification);
  const numericalBiologicalValidityEvaluations = (
    input.numericalBiologicalValidityEvaluations ?? []
  ).map(validateNumericalBiologicalValidityEvaluation);
  const researchInterpretationEnvelopes = (
    input.researchInterpretationEnvelopes ?? []
  ).map(validateResearchInterpretationEnvelope);

  const unavailableComponentIds = validatedModelComponents
    .filter((c) => isUnavailableModelComponent(c.availability))
    .map((c) => c.id);

  const lifecycle: MsiLifecycle =
    spec.datasetAvailability === "blocked_no_authorised_clinical_dataset"
      ? "blocked_awaiting_authorised_dataset"
      : "draft";

  const record: MultiscaleSimulationIntegrationBundle = {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    id: input.id,
    displayName: input.displayName.trim(),
    diseaseContextId: spec.diseaseContextId,
    integrationSpecId: spec.id,
    diseaseResearchQuestionIds: diseaseResearchQuestions.map((r) => r.id),
    validatedModelComponentIds: validatedModelComponents.map((r) => r.id),
    modelApplicabilityCheckIds: modelApplicabilityChecks.map((r) => r.id),
    authorisedInputDataIds: authorisedInputData.map((r) => r.id),
    biologicalClinicalAssumptionIds: biologicalClinicalAssumptions.map(
      (r) => r.id,
    ),
    modelCouplingDeclarationIds: modelCouplingDeclarations.map((r) => r.id),
    simulationConfigurationIds: simulationConfigurations.map((r) => r.id),
    approvedComputationalModelRunIds: approvedComputationalModelRuns.map(
      (r) => r.id,
    ),
    uncertaintyQuantificationIds: uncertaintyQuantifications.map((r) => r.id),
    numericalBiologicalValidityEvaluationIds:
      numericalBiologicalValidityEvaluations.map((r) => r.id),
    researchInterpretationEnvelopeIds: researchInterpretationEnvelopes.map(
      (r) => r.id,
    ),
    unavailableComponentIds,
    bundleVersion: input.bundleVersion.trim(),
    limitations: assertLimitations(input.limitations),
    datasetAvailability: spec.datasetAvailability,
    liveMultiscaleEngineOperational: false,
    m11SimulationClaimed: false,
    inventedParameters: null,
    notValidatedIndividualOutcomePrediction: true,
    notPersonalisedTreatmentEffect: true,
    notDigitalTwinProduct: true,
    molecularDoesNotEqualOrganWithoutValidatedCoupling: true,
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
    dataBasis: dataBasisForAvailability(spec.datasetAvailability),
    fixtureHonesty: spec.datasetAvailability !== "authorised_declared",
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateMultiscaleSimulationIntegrationBundle(record);
}

export function validateMultiscaleSimulationIntegrationBundle(
  record: MultiscaleSimulationIntegrationBundle,
): MultiscaleSimulationIntegrationBundle {
  if (!BND_ID_RE.test(record.id)) throw Error("Invalid bundle id");
  if (!SPEC_ID_RE.test(record.integrationSpecId)) {
    throw Error("Invalid integrationSpecId");
  }
  if (!HDI_CTX_RE.test(record.diseaseContextId)) {
    throw Error("Invalid diseaseContextId");
  }
  if (record.liveMultiscaleEngineOperational !== false) {
    throw Error("Live multiscale engine must stay false");
  }
  if (record.m11SimulationClaimed !== false) {
    throw Error("M11 simulation claims forbidden");
  }
  if (record.inventedParameters !== null) {
    throw Error("Invented parameters forbidden");
  }
  if (record.notValidatedIndividualOutcomePrediction !== true) {
    throw Error("Must declare not validated individual outcome prediction");
  }
  if (record.notPersonalisedTreatmentEffect !== true) {
    throw Error("Must declare not personalised treatment effect");
  }
  if (record.notDigitalTwinProduct !== true) {
    throw Error("Must declare not a digital twin product");
  }
  if (record.molecularDoesNotEqualOrganWithoutValidatedCoupling !== true) {
    throw Error(
      "Must declare molecular ≠ organ without validated coupling",
    );
  }
  if (record.graphPromotable !== false) {
    throw Error("Graph promotion forbidden");
  }
  assertClosed(record.lifecycle, MSI_LIFECYCLES, "lifecycle");
  assertClosed(
    record.datasetAvailability,
    MSI_DATASET_AVAILABILITY,
    "datasetAvailability",
  );
  assertClosed(record.dataBasis, MSI_DATA_BASES, "dataBasis");
  assertLimitations(record.limitations);
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "authoredBy");
  if (record.reviewedBy) assertActor(record.reviewedBy, "reviewedBy");
  return record;
}

export function transitionMultiscaleSimulationIntegrationBundle(input: {
  bundle: MultiscaleSimulationIntegrationBundle;
  to: MsiLifecycle;
  updatedAt: string;
  actor: MsiActor;
}): MultiscaleSimulationIntegrationBundle {
  const current = validateMultiscaleSimulationIntegrationBundle(input.bundle);
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
  if (
    input.to === "accepted_with_limitations" &&
    current.liveMultiscaleEngineOperational !== false
  ) {
    throw Error("Cannot accept while claiming live multiscale engine");
  }
  if (input.to === "accepted_with_limitations" && actor.actorKind !== "human") {
    throw Error("Human review required for acceptance");
  }
  return validateMultiscaleSimulationIntegrationBundle({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryMultiscaleSimulationIntegrationStore(): MultiscaleSimulationIntegrationStore & {
  specs: Map<string, MultiscaleSimulationIntegrationSpec>;
  diseaseResearchQuestions: Map<string, DiseaseResearchQuestionSelection>;
  validatedModelComponents: Map<string, ValidatedModelComponentIdentification>;
  modelApplicabilityChecks: Map<string, ModelApplicabilityCheck>;
  authorisedInputData: Map<string, AuthorisedInputDataRetrieval>;
  biologicalClinicalAssumptions: Map<
    string,
    BiologicalClinicalAssumptionDefinition
  >;
  modelCouplingDeclarations: Map<string, ModelCouplingDeclaration>;
  simulationConfigurations: Map<string, SimulationConfiguration>;
  approvedComputationalModelRuns: Map<string, ApprovedComputationalModelRun>;
  uncertaintyQuantifications: Map<string, UncertaintyQuantification>;
  numericalBiologicalValidityEvaluations: Map<
    string,
    NumericalBiologicalValidityEvaluation
  >;
  researchInterpretationEnvelopes: Map<string, ResearchInterpretationEnvelope>;
  bundles: Map<string, MultiscaleSimulationIntegrationBundle>;
} {
  const specs = new Map<string, MultiscaleSimulationIntegrationSpec>();
  const diseaseResearchQuestions = new Map<
    string,
    DiseaseResearchQuestionSelection
  >();
  const validatedModelComponents = new Map<
    string,
    ValidatedModelComponentIdentification
  >();
  const modelApplicabilityChecks = new Map<string, ModelApplicabilityCheck>();
  const authorisedInputData = new Map<string, AuthorisedInputDataRetrieval>();
  const biologicalClinicalAssumptions = new Map<
    string,
    BiologicalClinicalAssumptionDefinition
  >();
  const modelCouplingDeclarations = new Map<string, ModelCouplingDeclaration>();
  const simulationConfigurations = new Map<string, SimulationConfiguration>();
  const approvedComputationalModelRuns = new Map<
    string,
    ApprovedComputationalModelRun
  >();
  const uncertaintyQuantifications = new Map<
    string,
    UncertaintyQuantification
  >();
  const numericalBiologicalValidityEvaluations = new Map<
    string,
    NumericalBiologicalValidityEvaluation
  >();
  const researchInterpretationEnvelopes = new Map<
    string,
    ResearchInterpretationEnvelope
  >();
  const bundles = new Map<string, MultiscaleSimulationIntegrationBundle>();

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
    diseaseResearchQuestions,
    validatedModelComponents,
    modelApplicabilityChecks,
    authorisedInputData,
    biologicalClinicalAssumptions,
    modelCouplingDeclarations,
    simulationConfigurations,
    approvedComputationalModelRuns,
    uncertaintyQuantifications,
    numericalBiologicalValidityEvaluations,
    researchInterpretationEnvelopes,
    bundles,
    upsertSpec(record) {
      const validated = validateMultiscaleSimulationIntegrationSpec(record);
      specs.set(validated.id, validated);
      return validated;
    },
    getSpec(id) {
      return specs.get(id) ?? null;
    },
    listSpecs(diseaseContextId) {
      return filterByDisease(specs, diseaseContextId);
    },
    upsertDiseaseResearchQuestion(record) {
      const validated = validateDiseaseResearchQuestionSelection(record);
      diseaseResearchQuestions.set(validated.id, validated);
      return validated;
    },
    getDiseaseResearchQuestion(id) {
      return diseaseResearchQuestions.get(id) ?? null;
    },
    listDiseaseResearchQuestions(diseaseContextId) {
      return filterByDisease(diseaseResearchQuestions, diseaseContextId);
    },
    upsertValidatedModelComponent(record) {
      const validated = validateValidatedModelComponentIdentification(record);
      validatedModelComponents.set(validated.id, validated);
      return validated;
    },
    getValidatedModelComponent(id) {
      return validatedModelComponents.get(id) ?? null;
    },
    listValidatedModelComponents(diseaseContextId) {
      return filterByDisease(validatedModelComponents, diseaseContextId);
    },
    upsertModelApplicabilityCheck(record) {
      const validated = validateModelApplicabilityCheck(record);
      modelApplicabilityChecks.set(validated.id, validated);
      return validated;
    },
    getModelApplicabilityCheck(id) {
      return modelApplicabilityChecks.get(id) ?? null;
    },
    listModelApplicabilityChecks(diseaseContextId) {
      return filterByDisease(modelApplicabilityChecks, diseaseContextId);
    },
    upsertAuthorisedInputData(record) {
      const validated = validateAuthorisedInputDataRetrieval(record);
      authorisedInputData.set(validated.id, validated);
      return validated;
    },
    getAuthorisedInputData(id) {
      return authorisedInputData.get(id) ?? null;
    },
    listAuthorisedInputData(diseaseContextId) {
      return filterByDisease(authorisedInputData, diseaseContextId);
    },
    upsertBiologicalClinicalAssumption(record) {
      const validated = validateBiologicalClinicalAssumptionDefinition(record);
      biologicalClinicalAssumptions.set(validated.id, validated);
      return validated;
    },
    getBiologicalClinicalAssumption(id) {
      return biologicalClinicalAssumptions.get(id) ?? null;
    },
    listBiologicalClinicalAssumptions(diseaseContextId) {
      return filterByDisease(biologicalClinicalAssumptions, diseaseContextId);
    },
    upsertModelCouplingDeclaration(record) {
      const validated = validateModelCouplingDeclaration(record);
      modelCouplingDeclarations.set(validated.id, validated);
      return validated;
    },
    getModelCouplingDeclaration(id) {
      return modelCouplingDeclarations.get(id) ?? null;
    },
    listModelCouplingDeclarations(diseaseContextId) {
      return filterByDisease(modelCouplingDeclarations, diseaseContextId);
    },
    upsertSimulationConfiguration(record) {
      const validated = validateSimulationConfiguration(record);
      simulationConfigurations.set(validated.id, validated);
      return validated;
    },
    getSimulationConfiguration(id) {
      return simulationConfigurations.get(id) ?? null;
    },
    listSimulationConfigurations(diseaseContextId) {
      return filterByDisease(simulationConfigurations, diseaseContextId);
    },
    upsertApprovedComputationalModelRun(record) {
      const validated = validateApprovedComputationalModelRun(record);
      approvedComputationalModelRuns.set(validated.id, validated);
      return validated;
    },
    getApprovedComputationalModelRun(id) {
      return approvedComputationalModelRuns.get(id) ?? null;
    },
    listApprovedComputationalModelRuns(diseaseContextId) {
      return filterByDisease(approvedComputationalModelRuns, diseaseContextId);
    },
    upsertUncertaintyQuantification(record) {
      const validated = validateUncertaintyQuantification(record);
      uncertaintyQuantifications.set(validated.id, validated);
      return validated;
    },
    getUncertaintyQuantification(id) {
      return uncertaintyQuantifications.get(id) ?? null;
    },
    listUncertaintyQuantifications(diseaseContextId) {
      return filterByDisease(uncertaintyQuantifications, diseaseContextId);
    },
    upsertNumericalBiologicalValidityEvaluation(record) {
      const validated =
        validateNumericalBiologicalValidityEvaluation(record);
      numericalBiologicalValidityEvaluations.set(validated.id, validated);
      return validated;
    },
    getNumericalBiologicalValidityEvaluation(id) {
      return numericalBiologicalValidityEvaluations.get(id) ?? null;
    },
    listNumericalBiologicalValidityEvaluations(diseaseContextId) {
      return filterByDisease(
        numericalBiologicalValidityEvaluations,
        diseaseContextId,
      );
    },
    upsertResearchInterpretationEnvelope(record) {
      const validated = validateResearchInterpretationEnvelope(record);
      researchInterpretationEnvelopes.set(validated.id, validated);
      return validated;
    },
    getResearchInterpretationEnvelope(id) {
      return researchInterpretationEnvelopes.get(id) ?? null;
    },
    listResearchInterpretationEnvelopes(diseaseContextId) {
      return filterByDisease(
        researchInterpretationEnvelopes,
        diseaseContextId,
      );
    },
    upsertBundle(record) {
      const validated = validateMultiscaleSimulationIntegrationBundle(record);
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

export function projectMultiscaleSimulationIntegrationPersistenceLines(input: {
  specs: readonly MultiscaleSimulationIntegrationSpec[];
  diseaseResearchQuestions?: readonly DiseaseResearchQuestionSelection[];
  validatedModelComponents?: readonly ValidatedModelComponentIdentification[];
  modelApplicabilityChecks?: readonly ModelApplicabilityCheck[];
  authorisedInputData?: readonly AuthorisedInputDataRetrieval[];
  biologicalClinicalAssumptions?: readonly BiologicalClinicalAssumptionDefinition[];
  modelCouplingDeclarations?: readonly ModelCouplingDeclaration[];
  simulationConfigurations?: readonly SimulationConfiguration[];
  approvedComputationalModelRuns?: readonly ApprovedComputationalModelRun[];
  uncertaintyQuantifications?: readonly UncertaintyQuantification[];
  numericalBiologicalValidityEvaluations?: readonly NumericalBiologicalValidityEvaluation[];
  researchInterpretationEnvelopes?: readonly ResearchInterpretationEnvelope[];
  bundles?: readonly MultiscaleSimulationIntegrationBundle[];
}): string[] {
  for (const s of input.specs) validateMultiscaleSimulationIntegrationSpec(s);
  for (const r of input.diseaseResearchQuestions ?? []) {
    validateDiseaseResearchQuestionSelection(r);
  }
  for (const r of input.validatedModelComponents ?? []) {
    validateValidatedModelComponentIdentification(r);
  }
  for (const r of input.modelApplicabilityChecks ?? []) {
    validateModelApplicabilityCheck(r);
  }
  for (const r of input.authorisedInputData ?? []) {
    validateAuthorisedInputDataRetrieval(r);
  }
  for (const r of input.biologicalClinicalAssumptions ?? []) {
    validateBiologicalClinicalAssumptionDefinition(r);
  }
  for (const r of input.modelCouplingDeclarations ?? []) {
    validateModelCouplingDeclaration(r);
  }
  for (const r of input.simulationConfigurations ?? []) {
    validateSimulationConfiguration(r);
  }
  for (const r of input.approvedComputationalModelRuns ?? []) {
    validateApprovedComputationalModelRun(r);
  }
  for (const r of input.uncertaintyQuantifications ?? []) {
    validateUncertaintyQuantification(r);
  }
  for (const r of input.numericalBiologicalValidityEvaluations ?? []) {
    validateNumericalBiologicalValidityEvaluation(r);
  }
  for (const r of input.researchInterpretationEnvelopes ?? []) {
    validateResearchInterpretationEnvelope(r);
  }
  for (const r of input.bundles ?? []) {
    validateMultiscaleSimulationIntegrationBundle(r);
  }

  const unavailableCount = (input.validatedModelComponents ?? []).filter((c) =>
    isUnavailableModelComponent(c.availability),
  ).length;
  const fixtureHarnessRunCount = (
    input.approvedComputationalModelRuns ?? []
  ).filter((r) => isFixtureHarnessRun(r.runMode)).length;

  return [
    `schema=${MULTISCALE_SIMULATION_INTEGRATION_SCHEMA}`,
    `method=${MULTISCALE_SIMULATION_INTEGRATION_METHOD}`,
    `version=${MULTISCALE_SIMULATION_INTEGRATION_VERSION}`,
    `specs=${input.specs.length}`,
    `diseaseResearchQuestions=${(input.diseaseResearchQuestions ?? []).length}`,
    `validatedModelComponents=${(input.validatedModelComponents ?? []).length}`,
    `modelApplicabilityChecks=${(input.modelApplicabilityChecks ?? []).length}`,
    `authorisedInputData=${(input.authorisedInputData ?? []).length}`,
    `biologicalClinicalAssumptions=${(input.biologicalClinicalAssumptions ?? []).length}`,
    `modelCouplingDeclarations=${(input.modelCouplingDeclarations ?? []).length}`,
    `simulationConfigurations=${(input.simulationConfigurations ?? []).length}`,
    `approvedComputationalModelRuns=${(input.approvedComputationalModelRuns ?? []).length}`,
    `uncertaintyQuantifications=${(input.uncertaintyQuantifications ?? []).length}`,
    `numericalBiologicalValidityEvaluations=${(input.numericalBiologicalValidityEvaluations ?? []).length}`,
    `researchInterpretationEnvelopes=${(input.researchInterpretationEnvelopes ?? []).length}`,
    `bundles=${(input.bundles ?? []).length}`,
    `unavailableModelComponents=${unavailableCount}`,
    `fixtureHarnessRuns=${fixtureHarnessRunCount}`,
    `capabilityKindCount=${MSI_CAPABILITY_KINDS.length}`,
    `liveMultiscaleEngineOperational=false`,
    `m11SimulationClaimed=false`,
    `notValidatedIndividualOutcomePrediction=true`,
    `notPersonalisedTreatmentEffect=true`,
    `notDigitalTwinProduct=true`,
    `molecularDoesNotEqualOrganWithoutValidatedCoupling=true`,
    `doNotInventMissingParameters=true`,
    `fixtureHarnessIsNotLiveEngine=true`,
    `noPhiIngestion=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintMultiscaleSimulationIntegrationBundle(
  bundle: MultiscaleSimulationIntegrationBundle,
): string {
  const validated = validateMultiscaleSimulationIntegrationBundle(bundle);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildMultiscaleSimulationIntegrationPack(input: {
  specs: readonly MultiscaleSimulationIntegrationSpec[];
  diseaseResearchQuestions: readonly DiseaseResearchQuestionSelection[];
  validatedModelComponents: readonly ValidatedModelComponentIdentification[];
  modelApplicabilityChecks: readonly ModelApplicabilityCheck[];
  authorisedInputData: readonly AuthorisedInputDataRetrieval[];
  biologicalClinicalAssumptions: readonly BiologicalClinicalAssumptionDefinition[];
  modelCouplingDeclarations: readonly ModelCouplingDeclaration[];
  simulationConfigurations: readonly SimulationConfiguration[];
  approvedComputationalModelRuns: readonly ApprovedComputationalModelRun[];
  uncertaintyQuantifications: readonly UncertaintyQuantification[];
  numericalBiologicalValidityEvaluations: readonly NumericalBiologicalValidityEvaluation[];
  researchInterpretationEnvelopes: readonly ResearchInterpretationEnvelope[];
  bundles: readonly MultiscaleSimulationIntegrationBundle[];
  asOf: string;
}): {
  schema: typeof MULTISCALE_SIMULATION_INTEGRATION_SCHEMA;
  method: typeof MULTISCALE_SIMULATION_INTEGRATION_METHOD;
  version: typeof MULTISCALE_SIMULATION_INTEGRATION_VERSION;
  asOf: string;
  capabilityKindCount: number;
  specCount: number;
  diseaseResearchQuestionCount: number;
  validatedModelComponentCount: number;
  modelApplicabilityCheckCount: number;
  authorisedInputDataCount: number;
  biologicalClinicalAssumptionCount: number;
  modelCouplingDeclarationCount: number;
  simulationConfigurationCount: number;
  approvedComputationalModelRunCount: number;
  uncertaintyQuantificationCount: number;
  numericalBiologicalValidityEvaluationCount: number;
  researchInterpretationEnvelopeCount: number;
  bundleCount: number;
  unavailableModelComponentCount: number;
  fixtureHarnessRunCount: number;
  honesty: MultiscaleSimulationIntegrationHonesty;
  specs: readonly MultiscaleSimulationIntegrationSpec[];
  diseaseResearchQuestions: readonly DiseaseResearchQuestionSelection[];
  validatedModelComponents: readonly ValidatedModelComponentIdentification[];
  modelApplicabilityChecks: readonly ModelApplicabilityCheck[];
  authorisedInputData: readonly AuthorisedInputDataRetrieval[];
  biologicalClinicalAssumptions: readonly BiologicalClinicalAssumptionDefinition[];
  modelCouplingDeclarations: readonly ModelCouplingDeclaration[];
  simulationConfigurations: readonly SimulationConfiguration[];
  approvedComputationalModelRuns: readonly ApprovedComputationalModelRun[];
  uncertaintyQuantifications: readonly UncertaintyQuantification[];
  numericalBiologicalValidityEvaluations: readonly NumericalBiologicalValidityEvaluation[];
  researchInterpretationEnvelopes: readonly ResearchInterpretationEnvelope[];
  bundles: readonly MultiscaleSimulationIntegrationBundle[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const specs = input.specs.map(validateMultiscaleSimulationIntegrationSpec);
  const diseaseResearchQuestions = input.diseaseResearchQuestions.map(
    validateDiseaseResearchQuestionSelection,
  );
  const validatedModelComponents = input.validatedModelComponents.map(
    validateValidatedModelComponentIdentification,
  );
  const modelApplicabilityChecks = input.modelApplicabilityChecks.map(
    validateModelApplicabilityCheck,
  );
  const authorisedInputData = input.authorisedInputData.map(
    validateAuthorisedInputDataRetrieval,
  );
  const biologicalClinicalAssumptions = input.biologicalClinicalAssumptions.map(
    validateBiologicalClinicalAssumptionDefinition,
  );
  const modelCouplingDeclarations = input.modelCouplingDeclarations.map(
    validateModelCouplingDeclaration,
  );
  const simulationConfigurations = input.simulationConfigurations.map(
    validateSimulationConfiguration,
  );
  const approvedComputationalModelRuns =
    input.approvedComputationalModelRuns.map(
      validateApprovedComputationalModelRun,
    );
  const uncertaintyQuantifications = input.uncertaintyQuantifications.map(
    validateUncertaintyQuantification,
  );
  const numericalBiologicalValidityEvaluations =
    input.numericalBiologicalValidityEvaluations.map(
      validateNumericalBiologicalValidityEvaluation,
    );
  const researchInterpretationEnvelopes =
    input.researchInterpretationEnvelopes.map(
      validateResearchInterpretationEnvelope,
    );
  const bundles = input.bundles.map(
    validateMultiscaleSimulationIntegrationBundle,
  );
  const unavailableModelComponentCount = validatedModelComponents.filter((c) =>
    isUnavailableModelComponent(c.availability),
  ).length;
  const fixtureHarnessRunCount = approvedComputationalModelRuns.filter((r) =>
    isFixtureHarnessRun(r.runMode),
  ).length;

  return {
    schema: MULTISCALE_SIMULATION_INTEGRATION_SCHEMA,
    method: MULTISCALE_SIMULATION_INTEGRATION_METHOD,
    version: MULTISCALE_SIMULATION_INTEGRATION_VERSION,
    asOf: input.asOf,
    capabilityKindCount: MSI_CAPABILITY_KINDS.length,
    specCount: specs.length,
    diseaseResearchQuestionCount: diseaseResearchQuestions.length,
    validatedModelComponentCount: validatedModelComponents.length,
    modelApplicabilityCheckCount: modelApplicabilityChecks.length,
    authorisedInputDataCount: authorisedInputData.length,
    biologicalClinicalAssumptionCount: biologicalClinicalAssumptions.length,
    modelCouplingDeclarationCount: modelCouplingDeclarations.length,
    simulationConfigurationCount: simulationConfigurations.length,
    approvedComputationalModelRunCount: approvedComputationalModelRuns.length,
    uncertaintyQuantificationCount: uncertaintyQuantifications.length,
    numericalBiologicalValidityEvaluationCount:
      numericalBiologicalValidityEvaluations.length,
    researchInterpretationEnvelopeCount:
      researchInterpretationEnvelopes.length,
    bundleCount: bundles.length,
    unavailableModelComponentCount,
    fixtureHarnessRunCount,
    honesty: {...DEFAULT_HONESTY},
    specs,
    diseaseResearchQuestions,
    validatedModelComponents,
    modelApplicabilityChecks,
    authorisedInputData,
    biologicalClinicalAssumptions,
    modelCouplingDeclarations,
    simulationConfigurations,
    approvedComputationalModelRuns,
    uncertaintyQuantifications,
    numericalBiologicalValidityEvaluations,
    researchInterpretationEnvelopes,
    bundles,
  };
}
