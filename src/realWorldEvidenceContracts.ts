/**
 * Milestone 14 / PR1 — Clinical Evidence and RWE Contracts.
 *
 * Extends clinical scaffold / CDS-PHI boundary / M9 org / M12 therapeutic /
 * M13 translational hooks with study → longitudinal observation → exposure →
 * outcome → analysis-result envelopes.
 *
 * Does NOT ingest live PHI, build an unrestricted central patient database,
 * run observational causal engines, ship workbench UI, invent patient counts
 * or effect estimates, claim proven treatment effects, invent Gate C
 * auto-approve / MoU, or promote identifiable records into the curated KG.
 *
 * Binding honesty:
 * - Research decision support only.
 * - Observational association ≠ proven treatment effect.
 * - Pseudonymised data may still be personal data.
 * - Identifiable patient records stay outside the general scientific KG.
 * - No authorised clinical dataset → scientific path blocked (fixtures only).
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const REAL_WORLD_EVIDENCE_SCHEMA = "hsi-real-world-evidence-1" as const;
export const REAL_WORLD_EVIDENCE_METHOD = "hsi.real_world_evidence.v1" as const;
export const REAL_WORLD_EVIDENCE_VERSION = "0.1.0" as const;

export const STUDY_DESIGNS = [
  "observational_cohort",
  "case_control",
  "cross_sectional",
  "registry_analysis",
  "target_trial_emulation_concept",
  "other_declared",
] as const;
export type StudyDesign = (typeof STUDY_DESIGNS)[number];

export const STUDY_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_for_further_research",
  "blocked_awaiting_authorised_dataset",
  "superseded",
  "retired",
  "rejected",
] as const;
export type StudyLifecycle = (typeof STUDY_LIFECYCLES)[number];

export const ACCESS_CLASSIFICATIONS = [
  "fixture_engineering",
  "authorised_pseudonymous_research",
  "authorised_aggregate_only",
  "restricted_not_ingested",
] as const;
export type AccessClassification = (typeof ACCESS_CLASSIFICATIONS)[number];

export const DATASET_AVAILABILITY = [
  "fixture_only",
  "blocked_no_authorised_clinical_dataset",
  "authorised_declared",
] as const;
export type DatasetAvailability = (typeof DATASET_AVAILABILITY)[number];

export const MISSINGNESS_STATUSES = [
  "observed",
  "missing",
  "not_applicable",
  "unknown",
] as const;
export type MissingnessStatus = (typeof MISSINGNESS_STATUSES)[number];

export const SUBJECT_REF_KINDS = [
  "pseudonymous_subject",
  "cohort_aggregate",
] as const;
export type SubjectRefKind = (typeof SUBJECT_REF_KINDS)[number];

export const OUTCOME_VALIDATION_STATUSES = [
  "not_assessed",
  "defined_only",
  "operationalised",
  "externally_validated_declared",
  "insufficient",
] as const;
export type OutcomeValidationStatus =
  (typeof OUTCOME_VALIDATION_STATUSES)[number];

export const ANALYSIS_RESULT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_limitations",
  "rejected",
  "superseded",
] as const;
export type AnalysisResultLifecycle =
  (typeof ANALYSIS_RESULT_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type RweActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type RweDataBasis = (typeof DATA_BASES)[number];

const STUDY_ID_RE = /^hsi-rwe-study-[a-z0-9-]{3,80}$/;
const OBS_ID_RE = /^hsi-rwe-obs-[a-z0-9-]{3,80}$/;
const EXPOSURE_ID_RE = /^hsi-rwe-exp-[a-z0-9-]{3,80}$/;
const OUTCOME_ID_RE = /^hsi-rwe-out-[a-z0-9-]{3,80}$/;
const ANALYSIS_ID_RE = /^hsi-rwe-anl-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const M13_TD_PROG_RE = /^hsi-td-prog-[a-z0-9-]{3,80}$/;
const M13_TRIAL_RE = /^hsi-td-trial-[a-z0-9-]{3,80}$/;
const M12_TX_PROG_RE = /^hsi-tx-prog-[a-z0-9-]{3,80}$/;

export type RealWorldEvidenceHonesty = {
  researchDecisionSupportOnly: true;
  noUnrestrictedCentralPatientDatabase: true;
  observationalAssociationIsNotProvenTreatmentEffect: true;
  identifiableRecordsOutsideScientificKg: true;
  pseudonymisedMayStillBePersonalData: true;
  noPhiIngestion: true;
  noPatientTreatmentDirectives: true;
  noFabricatedPatientCountsOrEffects: true;
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

export type RweActor = {
  principalId: string;
  actorKind: RweActorKind;
};

export type RweStudyRecord = {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  id: string;
  scientificQuestion: string;
  studyDesign: StudyDesign;
  dataSource: string;
  dataControllerOrOwner: string;
  permittedPurpose: string;
  populationDefinition: string;
  observationPeriodStart: string | null;
  observationPeriodEnd: string | null;
  protocolVersion: string;
  analysisVersion: string;
  datasetAvailability: DatasetAvailability;
  accessClassification: AccessClassification;
  /** Optional M9 org id. */
  orgId: string | null;
  /** Optional M6 investigation id. */
  investigationId: string | null;
  /** Optional M13 development programme id. */
  translationalDevelopmentProgrammeId: string | null;
  /** Optional M13 trial concept id. */
  trialConceptId: string | null;
  /** Optional M12 therapeutic programme id. */
  therapeuticProgrammeId: string | null;
  lifecycle: StudyLifecycle;
  reviewedBy: RweActor | null;
  authoredBy: RweActor;
  dataBasis: RweDataBasis;
  fixtureHonesty: boolean;
  honesty: RealWorldEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RweLongitudinalObservation = {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  id: string;
  studyId: string;
  subjectRefKind: SubjectRefKind;
  /** Pseudonymous subject or cohort aggregate ref — never direct identifiers. */
  subjectOrCohortRef: string;
  eventType: string;
  eventTime: string | null;
  observationTime: string;
  dataSource: string;
  clinicalConcept: string;
  measurementValue: string | null;
  unit: string | null;
  missingness: MissingnessStatus;
  provenance: string;
  accessClassification: AccessClassification;
  containsIdentifiablePhi: false;
  authoredBy: RweActor;
  dataBasis: RweDataBasis;
  fixtureHonesty: boolean;
  honesty: RealWorldEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RweTreatmentExposure = {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  id: string;
  studyId: string;
  subjectRefKind: SubjectRefKind;
  subjectOrCohortRef: string;
  interventionIdentity: string;
  exposureStart: string | null;
  exposureEnd: string | null;
  doseOrAdministrationNote: string | null;
  treatmentChangesNote: string | null;
  exposureUncertainty: string;
  adherenceNote: string | null;
  concomitantTreatmentContext: string | null;
  treatmentRecommended: false;
  accessClassification: AccessClassification;
  containsIdentifiablePhi: false;
  authoredBy: RweActor;
  dataBasis: RweDataBasis;
  fixtureHonesty: boolean;
  honesty: RealWorldEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RweOutcome = {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  id: string;
  studyId: string;
  subjectRefKind: SubjectRefKind;
  subjectOrCohortRef: string;
  outcomeDefinition: string;
  measurementMethod: string;
  baselineReference: string | null;
  followUpTimeNote: string | null;
  eventOrMeasurementValue: string | null;
  missingness: MissingnessStatus;
  competingEventsNote: string | null;
  validationStatus: OutcomeValidationStatus;
  efficacyClaimed: false;
  accessClassification: AccessClassification;
  containsIdentifiablePhi: false;
  authoredBy: RweActor;
  dataBasis: RweDataBasis;
  fixtureHonesty: boolean;
  honesty: RealWorldEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RweAnalysisResult = {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  id: string;
  studyId: string;
  researchQuestion: string;
  estimand: string;
  cohortVersion: string;
  analysisMethod: string;
  /** Declared estimate text only when non-invented; otherwise null. */
  statisticalEstimateSummary: string | null;
  uncertaintySummary: string;
  sensitivityAnalyses: readonly string[];
  limitations: readonly string[];
  provenance: string;
  observationalAssociationIsNotProvenTreatmentEffect: true;
  causalIdentificationClaimed: false;
  inventedPatientCount: null;
  inventedEffectEstimate: null;
  lifecycle: AnalysisResultLifecycle;
  reviewedBy: RweActor | null;
  authoredBy: RweActor;
  dataBasis: RweDataBasis;
  fixtureHonesty: boolean;
  honesty: RealWorldEvidenceHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type RealWorldEvidenceStore = {
  upsertStudy(study: RweStudyRecord): RweStudyRecord;
  getStudy(id: string): RweStudyRecord | null;
  listStudies(): readonly RweStudyRecord[];
  upsertObservation(
    observation: RweLongitudinalObservation,
  ): RweLongitudinalObservation;
  getObservation(id: string): RweLongitudinalObservation | null;
  listObservations(studyId?: string): readonly RweLongitudinalObservation[];
  upsertExposure(exposure: RweTreatmentExposure): RweTreatmentExposure;
  getExposure(id: string): RweTreatmentExposure | null;
  listExposures(studyId?: string): readonly RweTreatmentExposure[];
  upsertOutcome(outcome: RweOutcome): RweOutcome;
  getOutcome(id: string): RweOutcome | null;
  listOutcomes(studyId?: string): readonly RweOutcome[];
  upsertAnalysis(analysis: RweAnalysisResult): RweAnalysisResult;
  getAnalysis(id: string): RweAnalysisResult | null;
  listAnalyses(studyId?: string): readonly RweAnalysisResult[];
};

const DEFAULT_HONESTY: RealWorldEvidenceHonesty = {
  researchDecisionSupportOnly: true,
  noUnrestrictedCentralPatientDatabase: true,
  observationalAssociationIsNotProvenTreatmentEffect: true,
  identifiableRecordsOutsideScientificKg: true,
  pseudonymisedMayStillBePersonalData: true,
  noPhiIngestion: true,
  noPatientTreatmentDirectives: true,
  noFabricatedPatientCountsOrEffects: true,
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

const STUDY_TRANSITIONS: Record<
  StudyLifecycle,
  readonly StudyLifecycle[]
> = {
  draft: [
    "under_review",
    "blocked_awaiting_authorised_dataset",
    "superseded",
    "retired",
  ],
  under_review: [
    "accepted_for_further_research",
    "blocked_awaiting_authorised_dataset",
    "rejected",
    "superseded",
  ],
  accepted_for_further_research: [
    "blocked_awaiting_authorised_dataset",
    "superseded",
    "retired",
  ],
  blocked_awaiting_authorised_dataset: [
    "under_review",
    "superseded",
    "retired",
  ],
  superseded: [],
  retired: [],
  rejected: ["superseded"],
};

const ANALYSIS_TRANSITIONS: Record<
  AnalysisResultLifecycle,
  readonly AnalysisResultLifecycle[]
> = {
  draft: ["under_review", "superseded"],
  under_review: ["accepted_with_limitations", "rejected", "superseded"],
  accepted_with_limitations: ["superseded"],
  rejected: ["superseded"],
  superseded: [],
};

function isIsoTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 40 &&
    !Number.isNaN(Date.parse(value))
  );
}

function assertClosed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw Error(`Invalid ${label}`);
  }
}

function textOk(value: string, max: number): boolean {
  const t = value.trim();
  return t.length > 0 && t.length <= max;
}

function assertOptionalRef(
  value: string | null | undefined,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  if (!REF_ID_RE.test(value)) throw Error(`Invalid ${label}`);
  return value;
}

function assertStringList(
  values: readonly string[],
  label: string,
  maxItems: number,
  maxLen: number,
): readonly string[] {
  if (values.length > maxItems) throw Error(`Too many ${label}`);
  return values.map((v) => {
    if (!textOk(v, maxLen)) throw Error(`Invalid ${label} entry`);
    return v.trim();
  });
}

function assertActor(actor: RweActor, label: string): RweActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertHonesty(honesty: RealWorldEvidenceHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Must remain research decision support only");
  }
  if (honesty.noUnrestrictedCentralPatientDatabase !== true) {
    throw Error("Unrestricted central patient database forbidden");
  }
  if (honesty.observationalAssociationIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational association is not proven treatment effect");
  }
  if (honesty.identifiableRecordsOutsideScientificKg !== true) {
    throw Error("Identifiable records must stay outside scientific KG");
  }
  if (honesty.pseudonymisedMayStillBePersonalData !== true) {
    throw Error("Pseudonymised data may still be personal data");
  }
  if (honesty.noPhiIngestion !== true) throw Error("PHI ingestion forbidden");
  if (honesty.noPatientTreatmentDirectives !== true) {
    throw Error("Patient treatment directives forbidden");
  }
  if (honesty.noFabricatedPatientCountsOrEffects !== true) {
    throw Error("Fabricated patient counts or effects forbidden");
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
  const lower = text.toLowerCase();
  if (
    /\bproven\s+treatment\s+effect\b/.test(lower) ||
    /\bcausal(ly)?\s+(proven|established|identified)\b/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bhazard\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\bodds\s*ratio\s*=\s*[\d.]+\b/.test(lower) ||
    /\btreat(ment)?\s+recommendation\b/.test(lower) ||
    /\bpatient\s+(name|ssn|nhs\s*number|mrn)\b/.test(lower) ||
    /\bunrestricted\s+patient\s+(db|database)\b/.test(lower) ||
    /\bprescribe\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent counts/effects, claim proven treatment effects, include identifiers, or issue treatment directives`,
    );
  }
}

function assertSubjectRef(
  kind: SubjectRefKind,
  ref: string,
): {subjectRefKind: SubjectRefKind; subjectOrCohortRef: string} {
  assertClosed(kind, SUBJECT_REF_KINDS, "subject ref kind");
  if (!REF_ID_RE.test(ref)) throw Error("Invalid subjectOrCohortRef");
  if (/^(nhs|mrn|ssn|name|dob)-/i.test(ref)) {
    throw Error("Direct personal identifier refs forbidden");
  }
  return {subjectRefKind: kind, subjectOrCohortRef: ref};
}

export function draftRweStudyRecord(input: {
  id: string;
  scientificQuestion: string;
  studyDesign: StudyDesign;
  dataSource: string;
  dataControllerOrOwner: string;
  permittedPurpose: string;
  populationDefinition: string;
  protocolVersion: string;
  analysisVersion: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: RweActorKind;
  createdAt: string;
  observationPeriodStart?: string | null;
  observationPeriodEnd?: string | null;
  datasetAvailability?: DatasetAvailability;
  accessClassification?: AccessClassification;
  orgId?: string | null;
  investigationId?: string | null;
  translationalDevelopmentProgrammeId?: string | null;
  trialConceptId?: string | null;
  therapeuticProgrammeId?: string | null;
  dataBasis?: RweDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): RweStudyRecord {
  if (!STUDY_ID_RE.test(input.id)) throw Error("Invalid study id");
  if (!textOk(input.scientificQuestion, 4000)) {
    throw Error("Invalid scientific question");
  }
  assertClosed(input.studyDesign, STUDY_DESIGNS, "study design");
  for (const [label, value] of Object.entries({
    dataSource: input.dataSource,
    dataControllerOrOwner: input.dataControllerOrOwner,
    permittedPurpose: input.permittedPurpose,
    populationDefinition: input.populationDefinition,
    protocolVersion: input.protocolVersion,
    analysisVersion: input.analysisVersion,
  })) {
    if (!textOk(value, 1000)) throw Error(`Invalid ${label}`);
  }
  assertNoForbiddenClaimLanguage(input.scientificQuestion, "scientificQuestion");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const observationPeriodStart =
    input.observationPeriodStart === undefined ||
    input.observationPeriodStart === null
      ? null
      : input.observationPeriodStart;
  const observationPeriodEnd =
    input.observationPeriodEnd === undefined ||
    input.observationPeriodEnd === null
      ? null
      : input.observationPeriodEnd;
  if (observationPeriodStart !== null && !isIsoTimestamp(observationPeriodStart)) {
    throw Error("Invalid observationPeriodStart");
  }
  if (observationPeriodEnd !== null && !isIsoTimestamp(observationPeriodEnd)) {
    throw Error("Invalid observationPeriodEnd");
  }

  const datasetAvailability =
    input.datasetAvailability ?? "blocked_no_authorised_clinical_dataset";
  assertClosed(datasetAvailability, DATASET_AVAILABILITY, "dataset availability");
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

  const translationalDevelopmentProgrammeId =
    input.translationalDevelopmentProgrammeId === undefined ||
    input.translationalDevelopmentProgrammeId === null
      ? null
      : input.translationalDevelopmentProgrammeId;
  if (
    translationalDevelopmentProgrammeId !== null &&
    !M13_TD_PROG_RE.test(translationalDevelopmentProgrammeId)
  ) {
    throw Error("Invalid translationalDevelopmentProgrammeId");
  }
  const trialConceptId =
    input.trialConceptId === undefined || input.trialConceptId === null
      ? null
      : input.trialConceptId;
  if (trialConceptId !== null && !M13_TRIAL_RE.test(trialConceptId)) {
    throw Error("Invalid trialConceptId");
  }
  const therapeuticProgrammeId =
    input.therapeuticProgrammeId === undefined ||
    input.therapeuticProgrammeId === null
      ? null
      : input.therapeuticProgrammeId;
  if (
    therapeuticProgrammeId !== null &&
    !M12_TX_PROG_RE.test(therapeuticProgrammeId)
  ) {
    throw Error("Invalid therapeuticProgrammeId");
  }

  const study: RweStudyRecord = {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    id: input.id,
    scientificQuestion: input.scientificQuestion.trim(),
    studyDesign: input.studyDesign,
    dataSource: input.dataSource.trim(),
    dataControllerOrOwner: input.dataControllerOrOwner.trim(),
    permittedPurpose: input.permittedPurpose.trim(),
    populationDefinition: input.populationDefinition.trim(),
    observationPeriodStart,
    observationPeriodEnd,
    protocolVersion: input.protocolVersion.trim(),
    analysisVersion: input.analysisVersion.trim(),
    datasetAvailability,
    accessClassification,
    orgId: assertOptionalRef(input.orgId, "orgId"),
    investigationId: assertOptionalRef(input.investigationId, "investigationId"),
    translationalDevelopmentProgrammeId,
    trialConceptId,
    therapeuticProgrammeId,
    lifecycle:
      datasetAvailability === "blocked_no_authorised_clinical_dataset"
        ? "blocked_awaiting_authorised_dataset"
        : "draft",
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
  return validateRweStudyRecord(study);
}

export function validateRweStudyRecord(study: RweStudyRecord): RweStudyRecord {
  if (study.schema !== REAL_WORLD_EVIDENCE_SCHEMA) {
    throw Error("Invalid study schema");
  }
  if (!STUDY_ID_RE.test(study.id)) throw Error("Invalid study id");
  assertClosed(study.studyDesign, STUDY_DESIGNS, "study design");
  assertClosed(study.lifecycle, STUDY_LIFECYCLES, "study lifecycle");
  assertClosed(
    study.datasetAvailability,
    DATASET_AVAILABILITY,
    "dataset availability",
  );
  assertClosed(
    study.accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );
  assertClosed(study.dataBasis, DATA_BASES, "data basis");
  assertHonesty(study.honesty);
  assertActor(study.authoredBy, "author");
  if (study.reviewedBy !== null) assertActor(study.reviewedBy, "reviewer");
  if (
    study.dataBasis === "fixture_engineering" &&
    study.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (!isIsoTimestamp(study.createdAt) || !isIsoTimestamp(study.updatedAt)) {
    throw Error("Invalid study timestamps");
  }
  return study;
}

export function transitionRweStudyRecord(input: {
  study: RweStudyRecord;
  to: StudyLifecycle;
  updatedAt: string;
  actor: RweActor;
}): RweStudyRecord {
  const current = validateRweStudyRecord(input.study);
  assertClosed(input.to, STUDY_LIFECYCLES, "study lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = STUDY_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal study transition ${current.lifecycle} → ${input.to}`);
  }
  if (
    (input.to === "accepted_for_further_research" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject studies");
  }
  if (
    input.to === "accepted_for_further_research" &&
    current.datasetAvailability === "blocked_no_authorised_clinical_dataset"
  ) {
    throw Error(
      "Cannot accept study for further research while dataset availability is blocked",
    );
  }
  return validateRweStudyRecord({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_for_further_research" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftRweLongitudinalObservation(input: {
  id: string;
  study: RweStudyRecord;
  subjectRefKind: SubjectRefKind;
  subjectOrCohortRef: string;
  eventType: string;
  observationTime: string;
  dataSource: string;
  clinicalConcept: string;
  missingness: MissingnessStatus;
  provenance: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: RweActorKind;
  createdAt: string;
  eventTime?: string | null;
  measurementValue?: string | null;
  unit?: string | null;
  accessClassification?: AccessClassification;
  dataBasis?: RweDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): RweLongitudinalObservation {
  const study = validateRweStudyRecord(input.study);
  if (!OBS_ID_RE.test(input.id)) throw Error("Invalid observation id");
  const subject = assertSubjectRef(input.subjectRefKind, input.subjectOrCohortRef);
  for (const [label, value] of Object.entries({
    eventType: input.eventType,
    dataSource: input.dataSource,
    clinicalConcept: input.clinicalConcept,
    provenance: input.provenance,
  })) {
    if (!textOk(value, 1000)) throw Error(`Invalid ${label}`);
  }
  assertClosed(input.missingness, MISSINGNESS_STATUSES, "missingness");
  if (!isIsoTimestamp(input.observationTime)) {
    throw Error("Invalid observationTime");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.clinicalConcept, "clinicalConcept");

  const eventTime =
    input.eventTime === undefined || input.eventTime === null
      ? null
      : input.eventTime;
  if (eventTime !== null && !isIsoTimestamp(eventTime)) {
    throw Error("Invalid eventTime");
  }
  const measurementValue =
    input.measurementValue === undefined || input.measurementValue === null
      ? null
      : input.measurementValue.trim();
  if (measurementValue !== null) {
    if (!textOk(measurementValue, 200)) throw Error("Invalid measurementValue");
    assertNoForbiddenClaimLanguage(measurementValue, "measurementValue");
  }
  const unit =
    input.unit === undefined || input.unit === null ? null : input.unit.trim();
  if (unit !== null && !textOk(unit, 40)) throw Error("Invalid unit");

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? study.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  const accessClassification =
    input.accessClassification ?? study.accessClassification;
  assertClosed(
    accessClassification,
    ACCESS_CLASSIFICATIONS,
    "access classification",
  );

  const observation: RweLongitudinalObservation = {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    id: input.id,
    studyId: study.id,
    ...subject,
    eventType: input.eventType.trim(),
    eventTime,
    observationTime: input.observationTime,
    dataSource: input.dataSource.trim(),
    clinicalConcept: input.clinicalConcept.trim(),
    measurementValue,
    unit,
    missingness: input.missingness,
    provenance: input.provenance.trim(),
    accessClassification,
    containsIdentifiablePhi: false,
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
  return validateRweLongitudinalObservation(observation);
}

export function validateRweLongitudinalObservation(
  observation: RweLongitudinalObservation,
): RweLongitudinalObservation {
  if (!OBS_ID_RE.test(observation.id)) throw Error("Invalid observation id");
  if (!STUDY_ID_RE.test(observation.studyId)) {
    throw Error("Invalid observation studyId");
  }
  assertClosed(
    observation.subjectRefKind,
    SUBJECT_REF_KINDS,
    "subject ref kind",
  );
  assertClosed(observation.missingness, MISSINGNESS_STATUSES, "missingness");
  if (observation.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden in observations");
  }
  assertHonesty(observation.honesty);
  assertActor(observation.authoredBy, "author");
  return observation;
}

export function draftRweTreatmentExposure(input: {
  id: string;
  study: RweStudyRecord;
  subjectRefKind: SubjectRefKind;
  subjectOrCohortRef: string;
  interventionIdentity: string;
  exposureUncertainty: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: RweActorKind;
  createdAt: string;
  exposureStart?: string | null;
  exposureEnd?: string | null;
  doseOrAdministrationNote?: string | null;
  treatmentChangesNote?: string | null;
  adherenceNote?: string | null;
  concomitantTreatmentContext?: string | null;
  accessClassification?: AccessClassification;
  dataBasis?: RweDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): RweTreatmentExposure {
  const study = validateRweStudyRecord(input.study);
  if (!EXPOSURE_ID_RE.test(input.id)) throw Error("Invalid exposure id");
  const subject = assertSubjectRef(input.subjectRefKind, input.subjectOrCohortRef);
  if (!textOk(input.interventionIdentity, 1000)) {
    throw Error("Invalid interventionIdentity");
  }
  if (!textOk(input.exposureUncertainty, 1000)) {
    throw Error("Invalid exposureUncertainty");
  }
  assertNoForbiddenClaimLanguage(
    input.interventionIdentity,
    "interventionIdentity",
  );
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const exposureStart =
    input.exposureStart === undefined || input.exposureStart === null
      ? null
      : input.exposureStart;
  const exposureEnd =
    input.exposureEnd === undefined || input.exposureEnd === null
      ? null
      : input.exposureEnd;
  if (exposureStart !== null && !isIsoTimestamp(exposureStart)) {
    throw Error("Invalid exposureStart");
  }
  if (exposureEnd !== null && !isIsoTimestamp(exposureEnd)) {
    throw Error("Invalid exposureEnd");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? study.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const optionalNote = (
    value: string | null | undefined,
    label: string,
  ): string | null => {
    if (value === undefined || value === null) return null;
    if (!textOk(value, 1000)) throw Error(`Invalid ${label}`);
    assertNoForbiddenClaimLanguage(value, label);
    return value.trim();
  };

  const exposure: RweTreatmentExposure = {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    id: input.id,
    studyId: study.id,
    ...subject,
    interventionIdentity: input.interventionIdentity.trim(),
    exposureStart,
    exposureEnd,
    doseOrAdministrationNote: optionalNote(
      input.doseOrAdministrationNote,
      "doseOrAdministrationNote",
    ),
    treatmentChangesNote: optionalNote(
      input.treatmentChangesNote,
      "treatmentChangesNote",
    ),
    exposureUncertainty: input.exposureUncertainty.trim(),
    adherenceNote: optionalNote(input.adherenceNote, "adherenceNote"),
    concomitantTreatmentContext: optionalNote(
      input.concomitantTreatmentContext,
      "concomitantTreatmentContext",
    ),
    treatmentRecommended: false,
    accessClassification:
      input.accessClassification ?? study.accessClassification,
    containsIdentifiablePhi: false,
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
  return validateRweTreatmentExposure(exposure);
}

export function validateRweTreatmentExposure(
  exposure: RweTreatmentExposure,
): RweTreatmentExposure {
  if (!EXPOSURE_ID_RE.test(exposure.id)) throw Error("Invalid exposure id");
  if (!STUDY_ID_RE.test(exposure.studyId)) {
    throw Error("Invalid exposure studyId");
  }
  if (exposure.treatmentRecommended !== false) {
    throw Error("Treatment recommendations forbidden");
  }
  if (exposure.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden in exposures");
  }
  assertHonesty(exposure.honesty);
  assertActor(exposure.authoredBy, "author");
  return exposure;
}

export function draftRweOutcome(input: {
  id: string;
  study: RweStudyRecord;
  subjectRefKind: SubjectRefKind;
  subjectOrCohortRef: string;
  outcomeDefinition: string;
  measurementMethod: string;
  missingness: MissingnessStatus;
  authoredByPrincipalId: string;
  authoredByActorKind?: RweActorKind;
  createdAt: string;
  baselineReference?: string | null;
  followUpTimeNote?: string | null;
  eventOrMeasurementValue?: string | null;
  competingEventsNote?: string | null;
  validationStatus?: OutcomeValidationStatus;
  accessClassification?: AccessClassification;
  dataBasis?: RweDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): RweOutcome {
  const study = validateRweStudyRecord(input.study);
  if (!OUTCOME_ID_RE.test(input.id)) throw Error("Invalid outcome id");
  const subject = assertSubjectRef(input.subjectRefKind, input.subjectOrCohortRef);
  if (!textOk(input.outcomeDefinition, 2000)) {
    throw Error("Invalid outcomeDefinition");
  }
  if (!textOk(input.measurementMethod, 1000)) {
    throw Error("Invalid measurementMethod");
  }
  assertClosed(input.missingness, MISSINGNESS_STATUSES, "missingness");
  assertNoForbiddenClaimLanguage(input.outcomeDefinition, "outcomeDefinition");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const validationStatus = input.validationStatus ?? "defined_only";
  assertClosed(
    validationStatus,
    OUTCOME_VALIDATION_STATUSES,
    "validation status",
  );

  const optional = (
    value: string | null | undefined,
    label: string,
    max: number,
  ): string | null => {
    if (value === undefined || value === null) return null;
    if (!textOk(value, max)) throw Error(`Invalid ${label}`);
    return value.trim();
  };

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? study.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const outcome: RweOutcome = {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    id: input.id,
    studyId: study.id,
    ...subject,
    outcomeDefinition: input.outcomeDefinition.trim(),
    measurementMethod: input.measurementMethod.trim(),
    baselineReference: optional(input.baselineReference, "baselineReference", 500),
    followUpTimeNote: optional(input.followUpTimeNote, "followUpTimeNote", 500),
    eventOrMeasurementValue: optional(
      input.eventOrMeasurementValue,
      "eventOrMeasurementValue",
      500,
    ),
    missingness: input.missingness,
    competingEventsNote: optional(
      input.competingEventsNote,
      "competingEventsNote",
      1000,
    ),
    validationStatus,
    efficacyClaimed: false,
    accessClassification:
      input.accessClassification ?? study.accessClassification,
    containsIdentifiablePhi: false,
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
  return validateRweOutcome(outcome);
}

export function validateRweOutcome(outcome: RweOutcome): RweOutcome {
  if (!OUTCOME_ID_RE.test(outcome.id)) throw Error("Invalid outcome id");
  if (!STUDY_ID_RE.test(outcome.studyId)) throw Error("Invalid outcome studyId");
  if (outcome.efficacyClaimed !== false) {
    throw Error("Efficacy claims forbidden on outcomes");
  }
  if (outcome.containsIdentifiablePhi !== false) {
    throw Error("Identifiable PHI forbidden in outcomes");
  }
  assertHonesty(outcome.honesty);
  assertActor(outcome.authoredBy, "author");
  return outcome;
}

export function draftRweAnalysisResult(input: {
  id: string;
  study: RweStudyRecord;
  researchQuestion: string;
  estimand: string;
  cohortVersion: string;
  analysisMethod: string;
  uncertaintySummary: string;
  limitations: readonly string[];
  provenance: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: RweActorKind;
  createdAt: string;
  statisticalEstimateSummary?: string | null;
  sensitivityAnalyses?: readonly string[];
  dataBasis?: RweDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): RweAnalysisResult {
  const study = validateRweStudyRecord(input.study);
  if (!ANALYSIS_ID_RE.test(input.id)) throw Error("Invalid analysis id");
  for (const [label, value] of Object.entries({
    researchQuestion: input.researchQuestion,
    estimand: input.estimand,
    cohortVersion: input.cohortVersion,
    analysisMethod: input.analysisMethod,
    uncertaintySummary: input.uncertaintySummary,
    provenance: input.provenance,
  })) {
    if (!textOk(value, 2000)) throw Error(`Invalid ${label}`);
    assertNoForbiddenClaimLanguage(value, label);
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const limitations = assertStringList(input.limitations, "limitations", 40, 500);
  if (limitations.length === 0) throw Error("limitations required");
  if (
    !limitations.some((l) =>
      /observational|association|causal|confound/i.test(l),
    )
  ) {
    throw Error(
      "limitations must note observational/association/causal/confounding constraints",
    );
  }
  const sensitivityAnalyses = assertStringList(
    input.sensitivityAnalyses ?? [],
    "sensitivityAnalyses",
    40,
    500,
  );

  const statisticalEstimateSummary =
    input.statisticalEstimateSummary === undefined ||
    input.statisticalEstimateSummary === null
      ? null
      : input.statisticalEstimateSummary.trim();
  if (statisticalEstimateSummary !== null) {
    if (!textOk(statisticalEstimateSummary, 2000)) {
      throw Error("Invalid statisticalEstimateSummary");
    }
    assertNoForbiddenClaimLanguage(
      statisticalEstimateSummary,
      "statisticalEstimateSummary",
    );
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? study.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const analysis: RweAnalysisResult = {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    id: input.id,
    studyId: study.id,
    researchQuestion: input.researchQuestion.trim(),
    estimand: input.estimand.trim(),
    cohortVersion: input.cohortVersion.trim(),
    analysisMethod: input.analysisMethod.trim(),
    statisticalEstimateSummary,
    uncertaintySummary: input.uncertaintySummary.trim(),
    sensitivityAnalyses,
    limitations,
    provenance: input.provenance.trim(),
    observationalAssociationIsNotProvenTreatmentEffect: true,
    causalIdentificationClaimed: false,
    inventedPatientCount: null,
    inventedEffectEstimate: null,
    lifecycle: "draft",
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
  return validateRweAnalysisResult(analysis);
}

export function validateRweAnalysisResult(
  analysis: RweAnalysisResult,
): RweAnalysisResult {
  if (!ANALYSIS_ID_RE.test(analysis.id)) throw Error("Invalid analysis id");
  if (!STUDY_ID_RE.test(analysis.studyId)) {
    throw Error("Invalid analysis studyId");
  }
  assertClosed(
    analysis.lifecycle,
    ANALYSIS_RESULT_LIFECYCLES,
    "analysis lifecycle",
  );
  if (analysis.observationalAssociationIsNotProvenTreatmentEffect !== true) {
    throw Error("Observational association is not proven treatment effect");
  }
  if (analysis.causalIdentificationClaimed !== false) {
    throw Error("Causal identification claims forbidden in PR1");
  }
  if (analysis.inventedPatientCount !== null) {
    throw Error("Invented patient counts forbidden");
  }
  if (analysis.inventedEffectEstimate !== null) {
    throw Error("Invented effect estimates forbidden");
  }
  assertHonesty(analysis.honesty);
  assertActor(analysis.authoredBy, "author");
  if (analysis.reviewedBy !== null) {
    assertActor(analysis.reviewedBy, "reviewer");
  }
  if (analysis.limitations.length === 0) throw Error("limitations required");
  return analysis;
}

export function transitionRweAnalysisResult(input: {
  analysis: RweAnalysisResult;
  to: AnalysisResultLifecycle;
  updatedAt: string;
  actor: RweActor;
}): RweAnalysisResult {
  const current = validateRweAnalysisResult(input.analysis);
  assertClosed(input.to, ANALYSIS_RESULT_LIFECYCLES, "analysis lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = ANALYSIS_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal analysis transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_with_limitations" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject analyses");
  }
  return validateRweAnalysisResult({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_limitations" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryRealWorldEvidenceStore(): RealWorldEvidenceStore & {
  studies: Map<string, RweStudyRecord>;
  observations: Map<string, RweLongitudinalObservation>;
  exposures: Map<string, RweTreatmentExposure>;
  outcomes: Map<string, RweOutcome>;
  analyses: Map<string, RweAnalysisResult>;
} {
  const studies = new Map<string, RweStudyRecord>();
  const observations = new Map<string, RweLongitudinalObservation>();
  const exposures = new Map<string, RweTreatmentExposure>();
  const outcomes = new Map<string, RweOutcome>();
  const analyses = new Map<string, RweAnalysisResult>();

  return {
    studies,
    observations,
    exposures,
    outcomes,
    analyses,
    upsertStudy(study) {
      const validated = validateRweStudyRecord(study);
      studies.set(validated.id, validated);
      return validated;
    },
    getStudy(id) {
      return studies.get(id) ?? null;
    },
    listStudies() {
      return [...studies.values()];
    },
    upsertObservation(observation) {
      const validated = validateRweLongitudinalObservation(observation);
      observations.set(validated.id, validated);
      return validated;
    },
    getObservation(id) {
      return observations.get(id) ?? null;
    },
    listObservations(studyId) {
      const all = [...observations.values()];
      return studyId ? all.filter((o) => o.studyId === studyId) : all;
    },
    upsertExposure(exposure) {
      const validated = validateRweTreatmentExposure(exposure);
      exposures.set(validated.id, validated);
      return validated;
    },
    getExposure(id) {
      return exposures.get(id) ?? null;
    },
    listExposures(studyId) {
      const all = [...exposures.values()];
      return studyId ? all.filter((e) => e.studyId === studyId) : all;
    },
    upsertOutcome(outcome) {
      const validated = validateRweOutcome(outcome);
      outcomes.set(validated.id, validated);
      return validated;
    },
    getOutcome(id) {
      return outcomes.get(id) ?? null;
    },
    listOutcomes(studyId) {
      const all = [...outcomes.values()];
      return studyId ? all.filter((o) => o.studyId === studyId) : all;
    },
    upsertAnalysis(analysis) {
      const validated = validateRweAnalysisResult(analysis);
      analyses.set(validated.id, validated);
      return validated;
    },
    getAnalysis(id) {
      return analyses.get(id) ?? null;
    },
    listAnalyses(studyId) {
      const all = [...analyses.values()];
      return studyId ? all.filter((a) => a.studyId === studyId) : all;
    },
  };
}

export function projectRealWorldEvidencePersistenceLines(input: {
  study: RweStudyRecord;
  observations?: readonly RweLongitudinalObservation[];
  exposures?: readonly RweTreatmentExposure[];
  outcomes?: readonly RweOutcome[];
  analyses?: readonly RweAnalysisResult[];
}): string[] {
  const study = validateRweStudyRecord(input.study);
  const lines = [
    `schema=${study.schema}`,
    `method=${study.method}`,
    `version=${study.version}`,
    `studyId=${study.id}`,
    `lifecycle=${study.lifecycle}`,
    `datasetAvailability=${study.datasetAvailability}`,
    `accessClassification=${study.accessClassification}`,
    `noUnrestrictedPatientDb=true`,
    `observationalIsNotProvenEffect=true`,
    `identifiableOutsideKg=true`,
    `pseudonymisedMayStillBePersonalData=true`,
    `observations=${(input.observations ?? []).length}`,
    `exposures=${(input.exposures ?? []).length}`,
    `outcomes=${(input.outcomes ?? []).length}`,
    `analyses=${(input.analyses ?? []).length}`,
    `inventedPatientCounts=false`,
    `inventedEffectEstimates=false`,
    `phiIngestion=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
  for (const o of input.observations ?? []) {
    validateRweLongitudinalObservation(o);
  }
  for (const e of input.exposures ?? []) validateRweTreatmentExposure(e);
  for (const o of input.outcomes ?? []) validateRweOutcome(o);
  for (const a of input.analyses ?? []) validateRweAnalysisResult(a);
  return lines;
}

export function fingerprintRweStudyRecord(study: RweStudyRecord): string {
  const validated = validateRweStudyRecord(study);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildRealWorldEvidencePack(input: {
  studies: readonly RweStudyRecord[];
  observations: readonly RweLongitudinalObservation[];
  exposures: readonly RweTreatmentExposure[];
  outcomes: readonly RweOutcome[];
  analyses: readonly RweAnalysisResult[];
  asOf: string;
}): {
  schema: typeof REAL_WORLD_EVIDENCE_SCHEMA;
  method: typeof REAL_WORLD_EVIDENCE_METHOD;
  version: typeof REAL_WORLD_EVIDENCE_VERSION;
  asOf: string;
  studyCount: number;
  observationCount: number;
  exposureCount: number;
  outcomeCount: number;
  analysisCount: number;
  honesty: RealWorldEvidenceHonesty;
  studies: readonly RweStudyRecord[];
  observations: readonly RweLongitudinalObservation[];
  exposures: readonly RweTreatmentExposure[];
  outcomes: readonly RweOutcome[];
  analyses: readonly RweAnalysisResult[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const studies = input.studies.map(validateRweStudyRecord);
  const observations = input.observations.map(validateRweLongitudinalObservation);
  const exposures = input.exposures.map(validateRweTreatmentExposure);
  const outcomes = input.outcomes.map(validateRweOutcome);
  const analyses = input.analyses.map(validateRweAnalysisResult);
  return {
    schema: REAL_WORLD_EVIDENCE_SCHEMA,
    method: REAL_WORLD_EVIDENCE_METHOD,
    version: REAL_WORLD_EVIDENCE_VERSION,
    asOf: input.asOf,
    studyCount: studies.length,
    observationCount: observations.length,
    exposureCount: exposures.length,
    outcomeCount: outcomes.length,
    analysisCount: analyses.length,
    honesty: {...DEFAULT_HONESTY},
    studies,
    observations,
    exposures,
    outcomes,
    analyses,
  };
}
