/**
 * Milestone 13 / PR1 — Translational Development Contracts.
 *
 * Extends M3 hypothesis / M4 translational / M5 precision / M6 investigation /
 * M9 org / M10 experimental hooks, and composes with M12 therapeutic discovery
 * programme/target/intervention/assessment IDs (compatible patterns; typed
 * import deferred until #107 merges onto main).
 *
 * Does NOT run readiness engines, invent sample sizes, execute trials, ship
 * workbench UI, claim regulatory readiness, equate exploratory biomarkers with
 * qualified/clinically validated biomarkers, invent Gate C auto-approve / MoU,
 * or wire PHI/CDS / patient eligibility from restricted records.
 *
 * Binding honesty:
 * - Research decision support only — not autonomous clinical trial authorisation.
 * - A trial concept is not an approved protocol.
 * - Exploratory biomarker ≠ qualified / clinically validated biomarker.
 * - Workflow development stages ≠ regulatory approval categories.
 * - Agents may draft; humans review.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const TRANSLATIONAL_DEVELOPMENT_SCHEMA =
  "hsi-translational-development-1" as const;
export const TRANSLATIONAL_DEVELOPMENT_METHOD =
  "hsi.translational_development.v1" as const;
export const TRANSLATIONAL_DEVELOPMENT_VERSION = "0.1.0" as const;

/**
 * Research workflow development stages — NOT regulatory approval categories.
 * Do not equate these with IND/CTA/NDA/MAA or similar regulatory statuses.
 */
export const DEVELOPMENT_STAGES = [
  "exploratory_hypothesis",
  "target_characterisation",
  "preclinical_evidence_generation",
  "translational_evidence_review",
  "clinical_concept_drafting",
  "deferred",
  "stopped",
] as const;
export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number];

export const DEVELOPMENT_PROGRAMME_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_for_further_research",
  "paused",
  "superseded",
  "retired",
  "rejected",
] as const;
export type DevelopmentProgrammeLifecycle =
  (typeof DEVELOPMENT_PROGRAMME_LIFECYCLES)[number];

export const EVIDENCE_ORDINALS = [
  "not_assessed",
  "insufficient",
  "associative_only",
  "mechanistic_hypothesis",
  "preclinical_signal_declared",
  "human_translational_signal_declared",
  "conflicting",
] as const;
export type EvidenceOrdinal = (typeof EVIDENCE_ORDINALS)[number];

export const TRANSLATIONAL_ASSESSMENT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_with_gaps",
  "rejected",
  "superseded",
] as const;
export type TranslationalAssessmentLifecycle =
  (typeof TRANSLATIONAL_ASSESSMENT_LIFECYCLES)[number];

export const TRIAL_CONCEPT_LIFECYCLES = [
  "draft",
  "under_scientific_review",
  "under_statistical_review",
  "under_ethics_regulatory_review",
  "accepted_as_concept_only",
  "rejected",
  "superseded",
] as const;
export type TrialConceptLifecycle = (typeof TRIAL_CONCEPT_LIFECYCLES)[number];

/**
 * Biomarker validation status — exploratory must never collapse into qualified
 * or clinically_validated without explicit curated evidence (out of PR1).
 */
export const BIOMARKER_VALIDATION_STATUSES = [
  "exploratory",
  "analytically_characterised",
  "clinically_associated",
  "qualified_declared",
  "clinically_validated_declared",
  "insufficient",
  "not_assessed",
] as const;
export type BiomarkerValidationStatus =
  (typeof BIOMARKER_VALIDATION_STATUSES)[number];

export const BIOMARKER_CONTEXTS_OF_USE = [
  "diagnostic",
  "prognostic",
  "predictive",
  "pharmacodynamic",
  "monitoring",
  "safety",
  "susceptibility_risk",
  "not_specified",
] as const;
export type BiomarkerContextOfUse = (typeof BIOMARKER_CONTEXTS_OF_USE)[number];

export const BIOMARKER_RECORD_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_as_exploratory",
  "rejected",
  "superseded",
] as const;
export type BiomarkerRecordLifecycle =
  (typeof BIOMARKER_RECORD_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type TranslationalDevActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type TranslationalDevDataBasis = (typeof DATA_BASES)[number];

export const IDENTITY_SYSTEMS = [
  "open_targets_target",
  "open_targets_disease",
  "uniprot",
  "hgnc",
  "pmid",
  "doi",
  "nct",
  "chembl",
  "internal_fixture",
  "other",
] as const;
export type TranslationalDevIdentitySystem =
  (typeof IDENTITY_SYSTEMS)[number];

/** Compatible with M12 therapeutic discovery IDs (#107) — not imported until merged. */
const DEV_PROGRAMME_ID_RE = /^hsi-td-prog-[a-z0-9-]{3,80}$/;
const ASSESSMENT_ID_RE = /^hsi-td-assess-[a-z0-9-]{3,80}$/;
const TRIAL_CONCEPT_ID_RE = /^hsi-td-trial-[a-z0-9-]{3,80}$/;
const BIOMARKER_ID_RE = /^hsi-td-bm-[a-z0-9-]{3,80}$/;
const M12_TX_PROGRAMME_ID_RE = /^hsi-tx-prog-[a-z0-9-]{3,80}$/;
const M12_TX_TARGET_ID_RE = /^hsi-tx-tgt-[a-z0-9-]{3,80}$/;
const M12_TX_INTERVENTION_ID_RE = /^hsi-tx-int-[a-z0-9-]{3,80}$/;
const M12_TX_ASSESSMENT_ID_RE = /^hsi-tx-assess-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type TranslationalDevelopmentHonesty = {
  researchDecisionSupportOnly: true;
  notAutonomousTrialAuthorisation: true;
  trialConceptIsNotApprovedProtocol: true;
  exploratoryBiomarkerIsNotQualifiedOrClinicallyValidated: true;
  workflowStagesAreNotRegulatoryCategories: true;
  noInventedSampleSizes: true;
  noFabricatedTrialOutcomes: true;
  noPatientEligibilityFromRestrictedRecords: true;
  noTreatmentRecommendations: true;
  noWorkbenchUi: true;
  agentsDraftHumansReview: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  /** #107 merged on main; typed import optional — ID patterns remain compatible. */
  m12TherapeuticDiscoveryDependency: "id-pattern-compatible-107-merged";
};

export type TranslationalDevActor = {
  principalId: string;
  actorKind: TranslationalDevActorKind;
};

export type TranslationalDevIdentityRef = {
  system: TranslationalDevIdentitySystem;
  value: string;
  label: string | null;
  resolution:
    | "resolved_prefix"
    | "stub_only"
    | "declared_research"
    | "unresolved";
  claimSupport: "not_assessed";
};

export type DevelopmentProgramme = {
  schema: typeof TRANSLATIONAL_DEVELOPMENT_SCHEMA;
  method: typeof TRANSLATIONAL_DEVELOPMENT_METHOD;
  version: typeof TRANSLATIONAL_DEVELOPMENT_VERSION;
  id: string;
  name: string;
  therapeuticHypothesis: string;
  diseaseContext: string;
  phenotypeContext: string;
  intendedResearchIndication: string;
  developmentStage: DevelopmentStage;
  /** Explicit: stages are workflow states, not regulatory categories. */
  workflowStagesAreNotRegulatoryCategories: true;
  evidenceCutoffAt: string | null;
  lifecycle: DevelopmentProgrammeLifecycle;
  /** Optional M3 hypothesis ids. */
  hypothesisIds: readonly string[];
  /** Optional M6 investigation id. */
  investigationId: string | null;
  /** Optional M9 org id. */
  orgId: string | null;
  /** Optional M4 translational programme contract id. */
  translationalProgrammeContractId: string | null;
  /**
   * Optional M12 therapeutic discovery refs (compatible ID patterns).
   * Typed import deferred until #107 merges onto main.
   */
  therapeuticProgrammeId: string | null;
  therapeuticTargetIds: readonly string[];
  therapeuticInterventionIds: readonly string[];
  therapeuticAssessmentIds: readonly string[];
  identities: readonly TranslationalDevIdentityRef[];
  authoredBy: TranslationalDevActor;
  reviewedBy: TranslationalDevActor | null;
  dataBasis: TranslationalDevDataBasis;
  fixtureHonesty: boolean;
  honesty: TranslationalDevelopmentHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TranslationalEvidenceAssessment = {
  schema: typeof TRANSLATIONAL_DEVELOPMENT_SCHEMA;
  method: typeof TRANSLATIONAL_DEVELOPMENT_METHOD;
  version: typeof TRANSLATIONAL_DEVELOPMENT_VERSION;
  id: string;
  programmeId: string;
  summary: string;
  targetValidity: EvidenceOrdinal;
  humanBiologicalRelevance: EvidenceOrdinal;
  preclinicalEvidence: EvidenceOrdinal;
  pharmacologyEvidence: EvidenceOrdinal;
  targetEngagement: EvidenceOrdinal;
  safetyEvidence: EvidenceOrdinal;
  modelRelevance: EvidenceOrdinal;
  keyUncertainties: readonly string[];
  missingStudies: readonly string[];
  /** Never claim regulatory or clinical readiness from this assessment alone. */
  regulatoryReadinessClaimed: false;
  clinicalReadinessClaimed: false;
  efficacyClaimed: false;
  lifecycle: TranslationalAssessmentLifecycle;
  reviewedBy: TranslationalDevActor | null;
  authoredBy: TranslationalDevActor;
  dataBasis: TranslationalDevDataBasis;
  fixtureHonesty: boolean;
  honesty: TranslationalDevelopmentHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ClinicalTrialConcept = {
  schema: typeof TRANSLATIONAL_DEVELOPMENT_SCHEMA;
  method: typeof TRANSLATIONAL_DEVELOPMENT_METHOD;
  version: typeof TRANSLATIONAL_DEVELOPMENT_VERSION;
  id: string;
  programmeId: string;
  researchQuestion: string;
  investigationalIntervention: string;
  intendedPopulation: string;
  comparatorConcept: string;
  primaryObjective: string;
  exploratoryObjectives: readonly string[];
  candidateEndpoints: readonly string[];
  biomarkerStrategy: string;
  eligibilityConsiderations: readonly string[];
  statisticalAssumptions: readonly string[];
  feasibilityAssumptions: readonly string[];
  ethicalAndRegulatoryConsiderations: readonly string[];
  /** Always true in PR1 — concepts are not protocols. */
  isNotApprovedProtocol: true;
  /** Sample sizes / power numbers are never invented. */
  inventedSampleSize: null;
  inventedPowerCalculation: null;
  /** Linked NCT ids are locators only — not efficacy. */
  linkedNctIds: readonly string[];
  lifecycle: TrialConceptLifecycle;
  reviewedBy: TranslationalDevActor | null;
  authoredBy: TranslationalDevActor;
  dataBasis: TranslationalDevDataBasis;
  fixtureHonesty: boolean;
  honesty: TranslationalDevelopmentHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BiomarkerDevelopmentRecord = {
  schema: typeof TRANSLATIONAL_DEVELOPMENT_SCHEMA;
  method: typeof TRANSLATIONAL_DEVELOPMENT_METHOD;
  version: typeof TRANSLATIONAL_DEVELOPMENT_VERSION;
  id: string;
  programmeId: string;
  name: string;
  biologicalIdentity: string;
  specimenAndAssay: string;
  contextOfUse: BiomarkerContextOfUse;
  validationStatus: BiomarkerValidationStatus;
  analyticalValidity: EvidenceOrdinal;
  clinicalValidity: EvidenceOrdinal;
  clinicalUtilityEvidence: EvidenceOrdinal;
  replicationStatus: EvidenceOrdinal;
  confounders: readonly string[];
  limitations: readonly string[];
  /** Explicit discrimination — exploratory ≠ qualified / clinically validated. */
  exploratoryIsNotQualifiedOrClinicallyValidated: true;
  /** Performance metrics are never invented. */
  inventedPerformanceMetrics: null;
  predictiveClaimRequiresInteractionEvidence: true;
  identities: readonly TranslationalDevIdentityRef[];
  lifecycle: BiomarkerRecordLifecycle;
  reviewedBy: TranslationalDevActor | null;
  authoredBy: TranslationalDevActor;
  dataBasis: TranslationalDevDataBasis;
  fixtureHonesty: boolean;
  honesty: TranslationalDevelopmentHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TranslationalDevelopmentStore = {
  upsertProgramme(programme: DevelopmentProgramme): DevelopmentProgramme;
  getProgramme(id: string): DevelopmentProgramme | null;
  listProgrammes(): readonly DevelopmentProgramme[];
  upsertAssessment(
    assessment: TranslationalEvidenceAssessment,
  ): TranslationalEvidenceAssessment;
  getAssessment(id: string): TranslationalEvidenceAssessment | null;
  listAssessments(programmeId?: string): readonly TranslationalEvidenceAssessment[];
  upsertTrialConcept(concept: ClinicalTrialConcept): ClinicalTrialConcept;
  getTrialConcept(id: string): ClinicalTrialConcept | null;
  listTrialConcepts(programmeId?: string): readonly ClinicalTrialConcept[];
  upsertBiomarker(
    record: BiomarkerDevelopmentRecord,
  ): BiomarkerDevelopmentRecord;
  getBiomarker(id: string): BiomarkerDevelopmentRecord | null;
  listBiomarkers(programmeId?: string): readonly BiomarkerDevelopmentRecord[];
};

const DEFAULT_HONESTY: TranslationalDevelopmentHonesty = {
  researchDecisionSupportOnly: true,
  notAutonomousTrialAuthorisation: true,
  trialConceptIsNotApprovedProtocol: true,
  exploratoryBiomarkerIsNotQualifiedOrClinicallyValidated: true,
  workflowStagesAreNotRegulatoryCategories: true,
  noInventedSampleSizes: true,
  noFabricatedTrialOutcomes: true,
  noPatientEligibilityFromRestrictedRecords: true,
  noTreatmentRecommendations: true,
  noWorkbenchUi: true,
  agentsDraftHumansReview: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  m12TherapeuticDiscoveryDependency: "id-pattern-compatible-107-merged",
};

const PROGRAMME_TRANSITIONS: Record<
  DevelopmentProgrammeLifecycle,
  readonly DevelopmentProgrammeLifecycle[]
> = {
  draft: ["under_review", "superseded", "retired"],
  under_review: [
    "accepted_for_further_research",
    "rejected",
    "paused",
    "superseded",
  ],
  accepted_for_further_research: ["paused", "superseded", "retired"],
  paused: ["under_review", "superseded", "retired"],
  superseded: [],
  retired: [],
  rejected: ["superseded"],
};

const ASSESSMENT_TRANSITIONS: Record<
  TranslationalAssessmentLifecycle,
  readonly TranslationalAssessmentLifecycle[]
> = {
  draft: ["under_review", "superseded"],
  under_review: ["accepted_with_gaps", "rejected", "superseded"],
  accepted_with_gaps: ["superseded"],
  rejected: ["superseded"],
  superseded: [],
};

const TRIAL_TRANSITIONS: Record<
  TrialConceptLifecycle,
  readonly TrialConceptLifecycle[]
> = {
  draft: ["under_scientific_review", "superseded"],
  under_scientific_review: [
    "under_statistical_review",
    "rejected",
    "superseded",
  ],
  under_statistical_review: [
    "under_ethics_regulatory_review",
    "rejected",
    "superseded",
  ],
  under_ethics_regulatory_review: [
    "accepted_as_concept_only",
    "rejected",
    "superseded",
  ],
  accepted_as_concept_only: ["superseded"],
  rejected: ["superseded"],
  superseded: [],
};

const BIOMARKER_TRANSITIONS: Record<
  BiomarkerRecordLifecycle,
  readonly BiomarkerRecordLifecycle[]
> = {
  draft: ["under_review", "superseded"],
  under_review: ["accepted_as_exploratory", "rejected", "superseded"],
  accepted_as_exploratory: ["superseded"],
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

function assertRefList(ids: readonly string[], label: string): readonly string[] {
  if (ids.length > 50) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!REF_ID_RE.test(id)) throw Error(`Invalid ${label} id`);
    if (seen.has(id)) throw Error(`Duplicate ${label} id`);
    seen.add(id);
  }
  return [...ids];
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

function assertOptionalRef(
  value: string | null | undefined,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  if (!REF_ID_RE.test(value)) throw Error(`Invalid ${label}`);
  return value;
}

function assertHonesty(honesty: TranslationalDevelopmentHonesty): void {
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Must remain research decision support only");
  }
  if (honesty.notAutonomousTrialAuthorisation !== true) {
    throw Error("Autonomous trial authorisation forbidden");
  }
  if (honesty.trialConceptIsNotApprovedProtocol !== true) {
    throw Error("Trial concept must not be treated as approved protocol");
  }
  if (honesty.exploratoryBiomarkerIsNotQualifiedOrClinicallyValidated !== true) {
    throw Error(
      "Exploratory biomarker must not equal qualified/clinically validated",
    );
  }
  if (honesty.workflowStagesAreNotRegulatoryCategories !== true) {
    throw Error("Workflow stages must not be regulatory categories");
  }
  if (honesty.noInventedSampleSizes !== true) {
    throw Error("Invented sample sizes forbidden");
  }
  if (honesty.noFabricatedTrialOutcomes !== true) {
    throw Error("Fabricated trial outcomes forbidden");
  }
  if (honesty.noPatientEligibilityFromRestrictedRecords !== true) {
    throw Error("Patient eligibility from restricted records forbidden");
  }
  if (honesty.noTreatmentRecommendations !== true) {
    throw Error("Treatment recommendations forbidden");
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
  if (
    honesty.m12TherapeuticDiscoveryDependency !==
    "id-pattern-compatible-107-merged"
  ) {
    throw Error("M12 dependency declaration required");
  }
}

function assertActor(
  actor: TranslationalDevActor,
  label: string,
): TranslationalDevActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function validateIdentityRefs(
  refs: readonly TranslationalDevIdentityRef[],
): readonly TranslationalDevIdentityRef[] {
  if (refs.length > 40) throw Error("Too many identity refs");
  return refs.map((ref) => {
    assertClosed(ref.system, IDENTITY_SYSTEMS, "identity system");
    if (!textOk(ref.value, 200)) throw Error("Invalid identity value");
    if (ref.label !== null && !textOk(ref.label, 200)) {
      throw Error("Invalid identity label");
    }
    if (
      ref.resolution !== "resolved_prefix" &&
      ref.resolution !== "stub_only" &&
      ref.resolution !== "declared_research" &&
      ref.resolution !== "unresolved"
    ) {
      throw Error("Invalid identity resolution");
    }
    if (ref.claimSupport !== "not_assessed") {
      throw Error("Identity claimSupport must stay not_assessed");
    }
    return {
      system: ref.system,
      value: ref.value.trim(),
      label: ref.label === null ? null : ref.label.trim(),
      resolution: ref.resolution,
      claimSupport: "not_assessed" as const,
    };
  });
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    /\bapproved\s+protocol\b/.test(lower) ||
    /\bauthoris(e|ed)\s+(this\s+)?trial\b/.test(lower) ||
    /\brecruit(ment)?\s+(started|authorised)\b/.test(lower) ||
    /\bsample\s*size\s*=\s*\d/.test(lower) ||
    /\bn\s*=\s*\d{2,}\b/.test(lower) ||
    /\bpower\s*=\s*0?\.\d+/.test(lower) ||
    /\befficacy\s+(proven|demonstrated|confirmed)\b/.test(lower) ||
    /\bclinically\s+validated\s+biomarker\b/.test(lower) ||
    /\bqualified\s+biomarker\b/.test(lower) ||
    /\btreat(ment)?\s+recommendation\b/.test(lower) ||
    /\bpatient\s+is\s+eligible\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent sample sizes, claim approved protocols, efficacy, qualified biomarkers, eligibility, or treatment recommendations`,
    );
  }
}

function assertM12ProgrammeId(id: string | null): string | null {
  if (id === null) return null;
  if (!M12_TX_PROGRAMME_ID_RE.test(id)) {
    throw Error("Invalid M12 therapeuticProgrammeId (expected hsi-tx-prog-*)");
  }
  return id;
}

function assertM12IdList(
  ids: readonly string[],
  re: RegExp,
  label: string,
): readonly string[] {
  if (ids.length > 50) throw Error(`Too many ${label}`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!re.test(id)) throw Error(`Invalid ${label} id`);
    if (seen.has(id)) throw Error(`Duplicate ${label} id`);
    seen.add(id);
  }
  return [...ids];
}

function assertNctList(ids: readonly string[]): readonly string[] {
  if (ids.length > 40) throw Error("Too many NCT ids");
  const seen = new Set<string>();
  for (const id of ids) {
    if (!/^NCT\d{8}$/i.test(id)) throw Error("Invalid NCT id");
    const norm = id.toUpperCase();
    if (seen.has(norm)) throw Error("Duplicate NCT id");
    seen.add(norm);
  }
  return ids.map((id) => id.toUpperCase());
}

export function draftDevelopmentProgramme(input: {
  id: string;
  name: string;
  therapeuticHypothesis: string;
  diseaseContext: string;
  phenotypeContext: string;
  intendedResearchIndication: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: TranslationalDevActorKind;
  createdAt: string;
  developmentStage?: DevelopmentStage;
  evidenceCutoffAt?: string | null;
  hypothesisIds?: readonly string[];
  investigationId?: string | null;
  orgId?: string | null;
  translationalProgrammeContractId?: string | null;
  therapeuticProgrammeId?: string | null;
  therapeuticTargetIds?: readonly string[];
  therapeuticInterventionIds?: readonly string[];
  therapeuticAssessmentIds?: readonly string[];
  identities?: readonly TranslationalDevIdentityRef[];
  dataBasis?: TranslationalDevDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): DevelopmentProgramme {
  if (!DEV_PROGRAMME_ID_RE.test(input.id)) {
    throw Error("Invalid development programme id");
  }
  if (!textOk(input.name, 200)) throw Error("Invalid programme name");
  if (!textOk(input.therapeuticHypothesis, 4000)) {
    throw Error("Invalid therapeutic hypothesis");
  }
  if (!textOk(input.diseaseContext, 1000)) throw Error("Invalid disease context");
  if (!textOk(input.phenotypeContext, 1000)) {
    throw Error("Invalid phenotype context");
  }
  if (!textOk(input.intendedResearchIndication, 1000)) {
    throw Error("Invalid intended research indication");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(
    input.therapeuticHypothesis,
    "therapeuticHypothesis",
  );

  const developmentStage = input.developmentStage ?? "exploratory_hypothesis";
  assertClosed(developmentStage, DEVELOPMENT_STAGES, "development stage");

  const evidenceCutoffAt =
    input.evidenceCutoffAt === undefined || input.evidenceCutoffAt === null
      ? null
      : input.evidenceCutoffAt;
  if (evidenceCutoffAt !== null && !isIsoTimestamp(evidenceCutoffAt)) {
    throw Error("Invalid evidenceCutoffAt");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const programme: DevelopmentProgramme = {
    schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
    method: TRANSLATIONAL_DEVELOPMENT_METHOD,
    version: TRANSLATIONAL_DEVELOPMENT_VERSION,
    id: input.id,
    name: input.name.trim(),
    therapeuticHypothesis: input.therapeuticHypothesis.trim(),
    diseaseContext: input.diseaseContext.trim(),
    phenotypeContext: input.phenotypeContext.trim(),
    intendedResearchIndication: input.intendedResearchIndication.trim(),
    developmentStage,
    workflowStagesAreNotRegulatoryCategories: true,
    evidenceCutoffAt,
    lifecycle: "draft",
    hypothesisIds: assertRefList(input.hypothesisIds ?? [], "hypothesis"),
    investigationId: assertOptionalRef(input.investigationId, "investigationId"),
    orgId: assertOptionalRef(input.orgId, "orgId"),
    translationalProgrammeContractId: assertOptionalRef(
      input.translationalProgrammeContractId,
      "translationalProgrammeContractId",
    ),
    therapeuticProgrammeId: assertM12ProgrammeId(
      input.therapeuticProgrammeId === undefined
        ? null
        : input.therapeuticProgrammeId,
    ),
    therapeuticTargetIds: assertM12IdList(
      input.therapeuticTargetIds ?? [],
      M12_TX_TARGET_ID_RE,
      "therapeuticTarget",
    ),
    therapeuticInterventionIds: assertM12IdList(
      input.therapeuticInterventionIds ?? [],
      M12_TX_INTERVENTION_ID_RE,
      "therapeuticIntervention",
    ),
    therapeuticAssessmentIds: assertM12IdList(
      input.therapeuticAssessmentIds ?? [],
      M12_TX_ASSESSMENT_ID_RE,
      "therapeuticAssessment",
    ),
    identities: validateIdentityRefs(input.identities ?? []),
    authoredBy: assertActor(
      {principalId: input.authoredByPrincipalId, actorKind},
      "author",
    ),
    reviewedBy: null,
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateDevelopmentProgramme(programme);
}

export function validateDevelopmentProgramme(
  programme: DevelopmentProgramme,
): DevelopmentProgramme {
  if (programme.schema !== TRANSLATIONAL_DEVELOPMENT_SCHEMA) {
    throw Error("Invalid programme schema");
  }
  if (programme.method !== TRANSLATIONAL_DEVELOPMENT_METHOD) {
    throw Error("Invalid programme method");
  }
  if (programme.version !== TRANSLATIONAL_DEVELOPMENT_VERSION) {
    throw Error("Invalid programme version");
  }
  if (!DEV_PROGRAMME_ID_RE.test(programme.id)) {
    throw Error("Invalid programme id");
  }
  assertClosed(
    programme.lifecycle,
    DEVELOPMENT_PROGRAMME_LIFECYCLES,
    "programme lifecycle",
  );
  assertClosed(
    programme.developmentStage,
    DEVELOPMENT_STAGES,
    "development stage",
  );
  if (programme.workflowStagesAreNotRegulatoryCategories !== true) {
    throw Error("Workflow stages must not be regulatory categories");
  }
  assertClosed(programme.dataBasis, DATA_BASES, "data basis");
  assertHonesty(programme.honesty);
  assertActor(programme.authoredBy, "author");
  if (programme.reviewedBy !== null) {
    assertActor(programme.reviewedBy, "reviewer");
  }
  validateIdentityRefs(programme.identities);
  assertM12ProgrammeId(programme.therapeuticProgrammeId);
  assertM12IdList(
    programme.therapeuticTargetIds,
    M12_TX_TARGET_ID_RE,
    "therapeuticTarget",
  );
  assertM12IdList(
    programme.therapeuticInterventionIds,
    M12_TX_INTERVENTION_ID_RE,
    "therapeuticIntervention",
  );
  assertM12IdList(
    programme.therapeuticAssessmentIds,
    M12_TX_ASSESSMENT_ID_RE,
    "therapeuticAssessment",
  );
  if (
    programme.dataBasis === "fixture_engineering" &&
    programme.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (
    !isIsoTimestamp(programme.createdAt) ||
    !isIsoTimestamp(programme.updatedAt)
  ) {
    throw Error("Invalid programme timestamps");
  }
  if (
    programme.evidenceCutoffAt !== null &&
    !isIsoTimestamp(programme.evidenceCutoffAt)
  ) {
    throw Error("Invalid evidenceCutoffAt");
  }
  return programme;
}

export function transitionDevelopmentProgramme(input: {
  programme: DevelopmentProgramme;
  to: DevelopmentProgrammeLifecycle;
  updatedAt: string;
  actor: TranslationalDevActor;
}): DevelopmentProgramme {
  const current = validateDevelopmentProgramme(input.programme);
  assertClosed(
    input.to,
    DEVELOPMENT_PROGRAMME_LIFECYCLES,
    "programme lifecycle",
  );
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = PROGRAMME_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal programme transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_for_further_research" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject programmes");
  }
  return validateDevelopmentProgramme({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_for_further_research" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftTranslationalEvidenceAssessment(input: {
  id: string;
  programme: DevelopmentProgramme;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: TranslationalDevActorKind;
  createdAt: string;
  targetValidity?: EvidenceOrdinal;
  humanBiologicalRelevance?: EvidenceOrdinal;
  preclinicalEvidence?: EvidenceOrdinal;
  pharmacologyEvidence?: EvidenceOrdinal;
  targetEngagement?: EvidenceOrdinal;
  safetyEvidence?: EvidenceOrdinal;
  modelRelevance?: EvidenceOrdinal;
  keyUncertainties: readonly string[];
  missingStudies: readonly string[];
  dataBasis?: TranslationalDevDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): TranslationalEvidenceAssessment {
  const programme = validateDevelopmentProgramme(input.programme);
  if (!ASSESSMENT_ID_RE.test(input.id)) throw Error("Invalid assessment id");
  if (!textOk(input.summary, 4000)) throw Error("Invalid assessment summary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.summary, "assessment summary");

  const ordinals = {
    targetValidity: input.targetValidity ?? "not_assessed",
    humanBiologicalRelevance: input.humanBiologicalRelevance ?? "not_assessed",
    preclinicalEvidence: input.preclinicalEvidence ?? "not_assessed",
    pharmacologyEvidence: input.pharmacologyEvidence ?? "not_assessed",
    targetEngagement: input.targetEngagement ?? "not_assessed",
    safetyEvidence: input.safetyEvidence ?? "not_assessed",
    modelRelevance: input.modelRelevance ?? "not_assessed",
  };
  for (const [label, value] of Object.entries(ordinals)) {
    assertClosed(value, EVIDENCE_ORDINALS, label);
  }

  const keyUncertainties = assertStringList(
    input.keyUncertainties,
    "keyUncertainties",
    40,
    500,
  );
  const missingStudies = assertStringList(
    input.missingStudies,
    "missingStudies",
    40,
    500,
  );
  if (keyUncertainties.length === 0) {
    throw Error("keyUncertainties required");
  }
  if (missingStudies.length === 0) {
    throw Error("missingStudies required");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const assessment: TranslationalEvidenceAssessment = {
    schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
    method: TRANSLATIONAL_DEVELOPMENT_METHOD,
    version: TRANSLATIONAL_DEVELOPMENT_VERSION,
    id: input.id,
    programmeId: programme.id,
    summary: input.summary.trim(),
    ...ordinals,
    keyUncertainties,
    missingStudies,
    regulatoryReadinessClaimed: false,
    clinicalReadinessClaimed: false,
    efficacyClaimed: false,
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
  return validateTranslationalEvidenceAssessment(assessment);
}

export function validateTranslationalEvidenceAssessment(
  assessment: TranslationalEvidenceAssessment,
): TranslationalEvidenceAssessment {
  if (assessment.schema !== TRANSLATIONAL_DEVELOPMENT_SCHEMA) {
    throw Error("Invalid assessment schema");
  }
  if (!ASSESSMENT_ID_RE.test(assessment.id)) {
    throw Error("Invalid assessment id");
  }
  if (!DEV_PROGRAMME_ID_RE.test(assessment.programmeId)) {
    throw Error("Invalid assessment programmeId");
  }
  assertClosed(
    assessment.lifecycle,
    TRANSLATIONAL_ASSESSMENT_LIFECYCLES,
    "assessment lifecycle",
  );
  for (const [label, value] of Object.entries({
    targetValidity: assessment.targetValidity,
    humanBiologicalRelevance: assessment.humanBiologicalRelevance,
    preclinicalEvidence: assessment.preclinicalEvidence,
    pharmacologyEvidence: assessment.pharmacologyEvidence,
    targetEngagement: assessment.targetEngagement,
    safetyEvidence: assessment.safetyEvidence,
    modelRelevance: assessment.modelRelevance,
  })) {
    assertClosed(value as string, EVIDENCE_ORDINALS, label);
  }
  if (assessment.regulatoryReadinessClaimed !== false) {
    throw Error("Regulatory readiness claims forbidden");
  }
  if (assessment.clinicalReadinessClaimed !== false) {
    throw Error("Clinical readiness claims forbidden");
  }
  if (assessment.efficacyClaimed !== false) {
    throw Error("Efficacy claims forbidden");
  }
  assertClosed(assessment.dataBasis, DATA_BASES, "data basis");
  assertHonesty(assessment.honesty);
  assertActor(assessment.authoredBy, "author");
  if (assessment.reviewedBy !== null) {
    assertActor(assessment.reviewedBy, "reviewer");
  }
  if (assessment.keyUncertainties.length === 0) {
    throw Error("keyUncertainties required");
  }
  if (assessment.missingStudies.length === 0) {
    throw Error("missingStudies required");
  }
  if (
    !isIsoTimestamp(assessment.createdAt) ||
    !isIsoTimestamp(assessment.updatedAt)
  ) {
    throw Error("Invalid assessment timestamps");
  }
  return assessment;
}

export function transitionTranslationalEvidenceAssessment(input: {
  assessment: TranslationalEvidenceAssessment;
  to: TranslationalAssessmentLifecycle;
  updatedAt: string;
  actor: TranslationalDevActor;
}): TranslationalEvidenceAssessment {
  const current = validateTranslationalEvidenceAssessment(input.assessment);
  assertClosed(
    input.to,
    TRANSLATIONAL_ASSESSMENT_LIFECYCLES,
    "assessment lifecycle",
  );
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = ASSESSMENT_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal assessment transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_with_gaps" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject assessments");
  }
  return validateTranslationalEvidenceAssessment({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_with_gaps" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftClinicalTrialConcept(input: {
  id: string;
  programme: DevelopmentProgramme;
  researchQuestion: string;
  investigationalIntervention: string;
  intendedPopulation: string;
  comparatorConcept: string;
  primaryObjective: string;
  exploratoryObjectives: readonly string[];
  candidateEndpoints: readonly string[];
  biomarkerStrategy: string;
  eligibilityConsiderations: readonly string[];
  statisticalAssumptions: readonly string[];
  feasibilityAssumptions: readonly string[];
  ethicalAndRegulatoryConsiderations: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: TranslationalDevActorKind;
  createdAt: string;
  linkedNctIds?: readonly string[];
  dataBasis?: TranslationalDevDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ClinicalTrialConcept {
  const programme = validateDevelopmentProgramme(input.programme);
  if (!TRIAL_CONCEPT_ID_RE.test(input.id)) {
    throw Error("Invalid trial concept id");
  }
  for (const [label, value] of Object.entries({
    researchQuestion: input.researchQuestion,
    investigationalIntervention: input.investigationalIntervention,
    intendedPopulation: input.intendedPopulation,
    comparatorConcept: input.comparatorConcept,
    primaryObjective: input.primaryObjective,
    biomarkerStrategy: input.biomarkerStrategy,
  })) {
    if (!textOk(value, 2000)) throw Error(`Invalid ${label}`);
    assertNoForbiddenClaimLanguage(value, label);
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  const exploratoryObjectives = assertStringList(
    input.exploratoryObjectives,
    "exploratoryObjectives",
    20,
    500,
  );
  const candidateEndpoints = assertStringList(
    input.candidateEndpoints,
    "candidateEndpoints",
    20,
    500,
  );
  const eligibilityConsiderations = assertStringList(
    input.eligibilityConsiderations,
    "eligibilityConsiderations",
    40,
    500,
  );
  const statisticalAssumptions = assertStringList(
    input.statisticalAssumptions,
    "statisticalAssumptions",
    40,
    500,
  );
  const feasibilityAssumptions = assertStringList(
    input.feasibilityAssumptions,
    "feasibilityAssumptions",
    40,
    500,
  );
  const ethicalAndRegulatoryConsiderations = assertStringList(
    input.ethicalAndRegulatoryConsiderations,
    "ethicalAndRegulatoryConsiderations",
    40,
    500,
  );
  if (candidateEndpoints.length === 0) {
    throw Error("candidateEndpoints required");
  }
  if (statisticalAssumptions.length === 0) {
    throw Error("statisticalAssumptions required (declare unknowns if needed)");
  }
  if (ethicalAndRegulatoryConsiderations.length === 0) {
    throw Error("ethicalAndRegulatoryConsiderations required");
  }
  for (const assumption of statisticalAssumptions) {
    assertNoForbiddenClaimLanguage(assumption, "statisticalAssumptions");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const concept: ClinicalTrialConcept = {
    schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
    method: TRANSLATIONAL_DEVELOPMENT_METHOD,
    version: TRANSLATIONAL_DEVELOPMENT_VERSION,
    id: input.id,
    programmeId: programme.id,
    researchQuestion: input.researchQuestion.trim(),
    investigationalIntervention: input.investigationalIntervention.trim(),
    intendedPopulation: input.intendedPopulation.trim(),
    comparatorConcept: input.comparatorConcept.trim(),
    primaryObjective: input.primaryObjective.trim(),
    exploratoryObjectives,
    candidateEndpoints,
    biomarkerStrategy: input.biomarkerStrategy.trim(),
    eligibilityConsiderations,
    statisticalAssumptions,
    feasibilityAssumptions,
    ethicalAndRegulatoryConsiderations,
    isNotApprovedProtocol: true,
    inventedSampleSize: null,
    inventedPowerCalculation: null,
    linkedNctIds: assertNctList(input.linkedNctIds ?? []),
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
  return validateClinicalTrialConcept(concept);
}

export function validateClinicalTrialConcept(
  concept: ClinicalTrialConcept,
): ClinicalTrialConcept {
  if (concept.schema !== TRANSLATIONAL_DEVELOPMENT_SCHEMA) {
    throw Error("Invalid trial concept schema");
  }
  if (!TRIAL_CONCEPT_ID_RE.test(concept.id)) {
    throw Error("Invalid trial concept id");
  }
  if (!DEV_PROGRAMME_ID_RE.test(concept.programmeId)) {
    throw Error("Invalid trial concept programmeId");
  }
  assertClosed(concept.lifecycle, TRIAL_CONCEPT_LIFECYCLES, "trial lifecycle");
  if (concept.isNotApprovedProtocol !== true) {
    throw Error("Trial concept must declare isNotApprovedProtocol");
  }
  if (concept.inventedSampleSize !== null) {
    throw Error("Invented sample sizes forbidden");
  }
  if (concept.inventedPowerCalculation !== null) {
    throw Error("Invented power calculations forbidden");
  }
  assertClosed(concept.dataBasis, DATA_BASES, "data basis");
  assertHonesty(concept.honesty);
  assertActor(concept.authoredBy, "author");
  if (concept.reviewedBy !== null) {
    assertActor(concept.reviewedBy, "reviewer");
  }
  assertNctList(concept.linkedNctIds);
  if (
    !isIsoTimestamp(concept.createdAt) ||
    !isIsoTimestamp(concept.updatedAt)
  ) {
    throw Error("Invalid trial concept timestamps");
  }
  return concept;
}

export function transitionClinicalTrialConcept(input: {
  concept: ClinicalTrialConcept;
  to: TrialConceptLifecycle;
  updatedAt: string;
  actor: TranslationalDevActor;
}): ClinicalTrialConcept {
  const current = validateClinicalTrialConcept(input.concept);
  assertClosed(input.to, TRIAL_CONCEPT_LIFECYCLES, "trial lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = TRIAL_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal trial concept transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_as_concept_only" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human reviewers may accept or reject trial concepts");
  }
  return validateClinicalTrialConcept({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_as_concept_only" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftBiomarkerDevelopmentRecord(input: {
  id: string;
  programme: DevelopmentProgramme;
  name: string;
  biologicalIdentity: string;
  specimenAndAssay: string;
  contextOfUse: BiomarkerContextOfUse;
  authoredByPrincipalId: string;
  authoredByActorKind?: TranslationalDevActorKind;
  createdAt: string;
  validationStatus?: BiomarkerValidationStatus;
  analyticalValidity?: EvidenceOrdinal;
  clinicalValidity?: EvidenceOrdinal;
  clinicalUtilityEvidence?: EvidenceOrdinal;
  replicationStatus?: EvidenceOrdinal;
  confounders: readonly string[];
  limitations: readonly string[];
  identities?: readonly TranslationalDevIdentityRef[];
  dataBasis?: TranslationalDevDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): BiomarkerDevelopmentRecord {
  const programme = validateDevelopmentProgramme(input.programme);
  if (!BIOMARKER_ID_RE.test(input.id)) throw Error("Invalid biomarker id");
  if (!textOk(input.name, 200)) throw Error("Invalid biomarker name");
  if (!textOk(input.biologicalIdentity, 1000)) {
    throw Error("Invalid biological identity");
  }
  if (!textOk(input.specimenAndAssay, 1000)) {
    throw Error("Invalid specimen and assay");
  }
  assertClosed(input.contextOfUse, BIOMARKER_CONTEXTS_OF_USE, "context of use");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.name, "biomarker name");
  assertNoForbiddenClaimLanguage(
    input.biologicalIdentity,
    "biologicalIdentity",
  );

  const validationStatus = input.validationStatus ?? "exploratory";
  assertClosed(
    validationStatus,
    BIOMARKER_VALIDATION_STATUSES,
    "validation status",
  );
  // PR1 refuses elevating to qualified/clinically_validated via draft path.
  if (
    validationStatus === "qualified_declared" ||
    validationStatus === "clinically_validated_declared"
  ) {
    throw Error(
      "PR1 refuses drafting qualified/clinically_validated biomarker status — exploratory discrimination required",
    );
  }

  const ordinals = {
    analyticalValidity: input.analyticalValidity ?? "not_assessed",
    clinicalValidity: input.clinicalValidity ?? "not_assessed",
    clinicalUtilityEvidence: input.clinicalUtilityEvidence ?? "not_assessed",
    replicationStatus: input.replicationStatus ?? "not_assessed",
  };
  for (const [label, value] of Object.entries(ordinals)) {
    assertClosed(value, EVIDENCE_ORDINALS, label);
  }

  const confounders = assertStringList(input.confounders, "confounders", 40, 500);
  const limitations = assertStringList(input.limitations, "limitations", 40, 500);
  if (confounders.length === 0) throw Error("confounders required");
  if (limitations.length === 0) throw Error("limitations required");

  if (
    input.contextOfUse === "predictive" &&
    !limitations.some((l) =>
      /interaction|comparator|treatment\s+effect/i.test(l),
    )
  ) {
    throw Error(
      "Predictive contextOfUse requires a limitation noting interaction/comparator evidence needs",
    );
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const record: BiomarkerDevelopmentRecord = {
    schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
    method: TRANSLATIONAL_DEVELOPMENT_METHOD,
    version: TRANSLATIONAL_DEVELOPMENT_VERSION,
    id: input.id,
    programmeId: programme.id,
    name: input.name.trim(),
    biologicalIdentity: input.biologicalIdentity.trim(),
    specimenAndAssay: input.specimenAndAssay.trim(),
    contextOfUse: input.contextOfUse,
    validationStatus,
    ...ordinals,
    confounders,
    limitations,
    exploratoryIsNotQualifiedOrClinicallyValidated: true,
    inventedPerformanceMetrics: null,
    predictiveClaimRequiresInteractionEvidence: true,
    identities: validateIdentityRefs(input.identities ?? []),
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
  return validateBiomarkerDevelopmentRecord(record);
}

export function validateBiomarkerDevelopmentRecord(
  record: BiomarkerDevelopmentRecord,
): BiomarkerDevelopmentRecord {
  if (record.schema !== TRANSLATIONAL_DEVELOPMENT_SCHEMA) {
    throw Error("Invalid biomarker schema");
  }
  if (!BIOMARKER_ID_RE.test(record.id)) throw Error("Invalid biomarker id");
  if (!DEV_PROGRAMME_ID_RE.test(record.programmeId)) {
    throw Error("Invalid biomarker programmeId");
  }
  assertClosed(
    record.lifecycle,
    BIOMARKER_RECORD_LIFECYCLES,
    "biomarker lifecycle",
  );
  assertClosed(
    record.contextOfUse,
    BIOMARKER_CONTEXTS_OF_USE,
    "context of use",
  );
  assertClosed(
    record.validationStatus,
    BIOMARKER_VALIDATION_STATUSES,
    "validation status",
  );
  if (record.exploratoryIsNotQualifiedOrClinicallyValidated !== true) {
    throw Error(
      "Exploratory biomarker must not equal qualified/clinically validated",
    );
  }
  if (record.inventedPerformanceMetrics !== null) {
    throw Error("Invented performance metrics forbidden");
  }
  if (record.predictiveClaimRequiresInteractionEvidence !== true) {
    throw Error("Predictive claims require interaction evidence flag");
  }
  // Accepted exploratory records must remain exploratory-class statuses.
  if (
    record.lifecycle === "accepted_as_exploratory" &&
    (record.validationStatus === "qualified_declared" ||
      record.validationStatus === "clinically_validated_declared")
  ) {
    throw Error(
      "accepted_as_exploratory cannot carry qualified/clinically_validated status",
    );
  }
  assertClosed(record.dataBasis, DATA_BASES, "data basis");
  assertHonesty(record.honesty);
  assertActor(record.authoredBy, "author");
  if (record.reviewedBy !== null) {
    assertActor(record.reviewedBy, "reviewer");
  }
  validateIdentityRefs(record.identities);
  if (record.confounders.length === 0) throw Error("confounders required");
  if (record.limitations.length === 0) throw Error("limitations required");
  if (
    !isIsoTimestamp(record.createdAt) ||
    !isIsoTimestamp(record.updatedAt)
  ) {
    throw Error("Invalid biomarker timestamps");
  }
  return record;
}

export function transitionBiomarkerDevelopmentRecord(input: {
  record: BiomarkerDevelopmentRecord;
  to: BiomarkerRecordLifecycle;
  updatedAt: string;
  actor: TranslationalDevActor;
}): BiomarkerDevelopmentRecord {
  const current = validateBiomarkerDevelopmentRecord(input.record);
  assertClosed(input.to, BIOMARKER_RECORD_LIFECYCLES, "biomarker lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = BIOMARKER_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal biomarker transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted_as_exploratory" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject biomarker records");
  }
  return validateBiomarkerDevelopmentRecord({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_as_exploratory" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryTranslationalDevelopmentStore(): TranslationalDevelopmentStore & {
  programmes: Map<string, DevelopmentProgramme>;
  assessments: Map<string, TranslationalEvidenceAssessment>;
  trialConcepts: Map<string, ClinicalTrialConcept>;
  biomarkers: Map<string, BiomarkerDevelopmentRecord>;
} {
  const programmes = new Map<string, DevelopmentProgramme>();
  const assessments = new Map<string, TranslationalEvidenceAssessment>();
  const trialConcepts = new Map<string, ClinicalTrialConcept>();
  const biomarkers = new Map<string, BiomarkerDevelopmentRecord>();

  return {
    programmes,
    assessments,
    trialConcepts,
    biomarkers,
    upsertProgramme(programme) {
      const validated = validateDevelopmentProgramme(programme);
      programmes.set(validated.id, validated);
      return validated;
    },
    getProgramme(id) {
      return programmes.get(id) ?? null;
    },
    listProgrammes() {
      return [...programmes.values()];
    },
    upsertAssessment(assessment) {
      const validated = validateTranslationalEvidenceAssessment(assessment);
      assessments.set(validated.id, validated);
      return validated;
    },
    getAssessment(id) {
      return assessments.get(id) ?? null;
    },
    listAssessments(programmeId) {
      const all = [...assessments.values()];
      return programmeId
        ? all.filter((a) => a.programmeId === programmeId)
        : all;
    },
    upsertTrialConcept(concept) {
      const validated = validateClinicalTrialConcept(concept);
      trialConcepts.set(validated.id, validated);
      return validated;
    },
    getTrialConcept(id) {
      return trialConcepts.get(id) ?? null;
    },
    listTrialConcepts(programmeId) {
      const all = [...trialConcepts.values()];
      return programmeId
        ? all.filter((c) => c.programmeId === programmeId)
        : all;
    },
    upsertBiomarker(record) {
      const validated = validateBiomarkerDevelopmentRecord(record);
      biomarkers.set(validated.id, validated);
      return validated;
    },
    getBiomarker(id) {
      return biomarkers.get(id) ?? null;
    },
    listBiomarkers(programmeId) {
      const all = [...biomarkers.values()];
      return programmeId
        ? all.filter((b) => b.programmeId === programmeId)
        : all;
    },
  };
}

export function projectTranslationalDevelopmentPersistenceLines(input: {
  programme: DevelopmentProgramme;
  assessments?: readonly TranslationalEvidenceAssessment[];
  trialConcepts?: readonly ClinicalTrialConcept[];
  biomarkers?: readonly BiomarkerDevelopmentRecord[];
}): string[] {
  const programme = validateDevelopmentProgramme(input.programme);
  const lines = [
    `schema=${programme.schema}`,
    `method=${programme.method}`,
    `version=${programme.version}`,
    `programmeId=${programme.id}`,
    `lifecycle=${programme.lifecycle}`,
    `developmentStage=${programme.developmentStage}`,
    `workflowStagesAreNotRegulatory=true`,
    `hypothesisCount=${programme.hypothesisIds.length}`,
    `investigationId=${programme.investigationId ?? "null"}`,
    `orgId=${programme.orgId ?? "null"}`,
    `m12TherapeuticProgrammeId=${programme.therapeuticProgrammeId ?? "null"}`,
    `m12Targets=${programme.therapeuticTargetIds.length}`,
    `m12Interventions=${programme.therapeuticInterventionIds.length}`,
    `assessments=${(input.assessments ?? []).length}`,
    `trialConcepts=${(input.trialConcepts ?? []).length}`,
    `biomarkers=${(input.biomarkers ?? []).length}`,
    `trialConceptIsNotApprovedProtocol=true`,
    `exploratoryBiomarkerIsNotQualified=true`,
    `inventedSampleSizes=false`,
    `fabricatedTrialOutcomes=false`,
    `autonomousTrialAuthorisation=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `m12Dependency=id-pattern-compatible-107-merged`,
  ];
  for (const assessment of input.assessments ?? []) {
    validateTranslationalEvidenceAssessment(assessment);
  }
  for (const concept of input.trialConcepts ?? []) {
    validateClinicalTrialConcept(concept);
  }
  for (const biomarker of input.biomarkers ?? []) {
    validateBiomarkerDevelopmentRecord(biomarker);
  }
  return lines;
}

export function fingerprintDevelopmentProgramme(
  programme: DevelopmentProgramme,
): string {
  const validated = validateDevelopmentProgramme(programme);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildTranslationalDevelopmentPack(input: {
  programmes: readonly DevelopmentProgramme[];
  assessments: readonly TranslationalEvidenceAssessment[];
  trialConcepts: readonly ClinicalTrialConcept[];
  biomarkers: readonly BiomarkerDevelopmentRecord[];
  asOf: string;
}): {
  schema: typeof TRANSLATIONAL_DEVELOPMENT_SCHEMA;
  method: typeof TRANSLATIONAL_DEVELOPMENT_METHOD;
  version: typeof TRANSLATIONAL_DEVELOPMENT_VERSION;
  asOf: string;
  programmeCount: number;
  assessmentCount: number;
  trialConceptCount: number;
  biomarkerCount: number;
  honesty: TranslationalDevelopmentHonesty;
  programmes: readonly DevelopmentProgramme[];
  assessments: readonly TranslationalEvidenceAssessment[];
  trialConcepts: readonly ClinicalTrialConcept[];
  biomarkers: readonly BiomarkerDevelopmentRecord[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const programmes = input.programmes.map(validateDevelopmentProgramme);
  const assessments = input.assessments.map(
    validateTranslationalEvidenceAssessment,
  );
  const trialConcepts = input.trialConcepts.map(validateClinicalTrialConcept);
  const biomarkers = input.biomarkers.map(validateBiomarkerDevelopmentRecord);
  return {
    schema: TRANSLATIONAL_DEVELOPMENT_SCHEMA,
    method: TRANSLATIONAL_DEVELOPMENT_METHOD,
    version: TRANSLATIONAL_DEVELOPMENT_VERSION,
    asOf: input.asOf,
    programmeCount: programmes.length,
    assessmentCount: assessments.length,
    trialConceptCount: trialConcepts.length,
    biomarkerCount: biomarkers.length,
    honesty: {...DEFAULT_HONESTY},
    programmes,
    assessments,
    trialConcepts,
    biomarkers,
  };
}
