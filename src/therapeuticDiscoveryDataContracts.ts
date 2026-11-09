/**
 * Milestone 12 / PR1 — Therapeutic Discovery Data Contracts.
 *
 * Extends M3 hypothesis / M4 translational / M6 investigation / M9 org hooks
 * with programme → target candidate → compound/intervention → target–intervention
 * assessment envelopes. Does NOT pull ChEMBL live, run a repurposing engine,
 * ship workbench UI, invent target scores, claim efficacy/safety/clinical
 * suitability, issue treatment recommendations, invent MoU / Gate C
 * auto-approve, or wire PHI/CDS.
 *
 * Binding honesty:
 * - Association / OT score ≠ causation, efficacy, target validation, or safety.
 * - Biological plausibility ≠ predictive validity.
 * - Agents may draft candidates; researchers decide investigation priority.
 * - HSI decides which hypotheses deserve investigation — does not manufacture certainty.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const THERAPEUTIC_DISCOVERY_SCHEMA =
  "hsi-therapeutic-discovery-data-1" as const;
export const THERAPEUTIC_DISCOVERY_METHOD =
  "hsi.therapeutic_discovery_data.v1" as const;
export const THERAPEUTIC_DISCOVERY_VERSION = "0.1.0" as const;

/** Closed programme lifecycle — transitions are fail-closed. */
export const THERAPEUTIC_PROGRAMME_LIFECYCLES = [
  "proposed",
  "scoped",
  "active_investigation",
  "paused",
  "superseded",
  "retired",
  "rejected",
] as const;
export type TherapeuticProgrammeLifecycle =
  (typeof THERAPEUTIC_PROGRAMME_LIFECYCLES)[number];

export const TARGET_CANDIDATE_LIFECYCLES = [
  "proposed",
  "under_review",
  "prioritised_for_investigation",
  "deprioritised",
  "rejected",
  "superseded",
] as const;
export type TargetCandidateLifecycle =
  (typeof TARGET_CANDIDATE_LIFECYCLES)[number];

/**
 * Intervention kind — molecular compound vs modality vs experimental
 * intervention vs approved medicine. Never collapse these.
 */
export const INTERVENTION_KINDS = [
  "molecular_compound",
  "modality",
  "experimental_intervention",
  "approved_medicine",
] as const;
export type InterventionKind = (typeof INTERVENTION_KINDS)[number];

export const INTERVENTION_LIFECYCLES = [
  "proposed",
  "catalogued",
  "linked_to_assessment",
  "superseded",
  "retired",
] as const;
export type InterventionLifecycle = (typeof INTERVENTION_LIFECYCLES)[number];

export const TARGET_INTERVENTION_ASSESSMENT_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted_for_further_investigation",
  "rejected",
  "superseded",
] as const;
export type TargetInterventionAssessmentLifecycle =
  (typeof TARGET_INTERVENTION_ASSESSMENT_LIFECYCLES)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type TherapeuticActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type TherapeuticDataBasis = (typeof DATA_BASES)[number];

/** Evidence / identity refs — stubs OK; never invent claim support. */
export const THERAPEUTIC_IDENTITY_SYSTEMS = [
  "open_targets_target",
  "open_targets_disease",
  "uniprot",
  "hgnc",
  "chembl",
  "reactome",
  "pmid",
  "doi",
  "nct",
  "smiles_public",
  "internal_fixture",
  "other",
] as const;
export type TherapeuticIdentitySystem =
  (typeof THERAPEUTIC_IDENTITY_SYSTEMS)[number];

export const EVIDENCE_STRENGTH_ORDINALS = [
  "not_assessed",
  "associative_only",
  "mechanistic_hypothesis",
  "preclinical_signal_declared",
  "human_translational_signal_declared",
  "insufficient",
] as const;
export type EvidenceStrengthOrdinal =
  (typeof EVIDENCE_STRENGTH_ORDINALS)[number];

/**
 * Assessment conclusion kinds — never efficacy / safety / clinical suitability.
 */
export const ASSESSMENT_CONCLUSION_KINDS = [
  "further_investigation_warranted",
  "insufficient_evidence",
  "associative_only_not_actionable",
  "conflicting_signals",
  "out_of_scope",
  "not_assessed",
] as const;
export type AssessmentConclusionKind =
  (typeof ASSESSMENT_CONCLUSION_KINDS)[number];

const PROGRAMME_ID_RE = /^hsi-tx-prog-[a-z0-9-]{3,80}$/;
const TARGET_ID_RE = /^hsi-tx-tgt-[a-z0-9-]{3,80}$/;
const INTERVENTION_ID_RE = /^hsi-tx-int-[a-z0-9-]{3,80}$/;
const ASSESSMENT_ID_RE = /^hsi-tx-assess-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const CHEMBL_ID = /^CHEMBL[0-9]+$/i;
const UNIPROT_ID = /^[A-NR-Z][0-9][A-Z0-9]{3}[0-9]$|^[OPQ][0-9][A-Z0-9]{3}[0-9]$/i;

export type TherapeuticDiscoveryHonesty = {
  associationIsNotCausation: true;
  associationIsNotEfficacy: true;
  associationIsNotSafety: true;
  associationIsNotClinicalSuitability: true;
  biologicalPlausibilityIsNotPredictiveValidity: true;
  noFabricatedTargetScores: true;
  noTreatmentRecommendations: true;
  noChemblLivePull: true;
  noRepurposingEngine: true;
  noWorkbenchUi: true;
  agentsDraftResearchersDecide: true;
  doesNotManufactureCertainty: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type TherapeuticActor = {
  principalId: string;
  actorKind: TherapeuticActorKind;
};

export type TherapeuticIdentityRef = {
  system: TherapeuticIdentitySystem;
  value: string;
  label: string | null;
  /** Stub recognition ≠ live fetch ≠ claim support. */
  resolution:
    | "resolved_prefix"
    | "stub_only"
    | "declared_research"
    | "unresolved";
  claimSupport: "not_assessed";
};

export type TherapeuticProgramme = {
  schema: typeof THERAPEUTIC_DISCOVERY_SCHEMA;
  method: typeof THERAPEUTIC_DISCOVERY_METHOD;
  version: typeof THERAPEUTIC_DISCOVERY_VERSION;
  id: string;
  name: string;
  researchQuestion: string;
  diseaseContext: string;
  indicationScope: string;
  lifecycle: TherapeuticProgrammeLifecycle;
  /** Optional M6 investigation id. */
  investigationId: string | null;
  /** Optional M3 hypothesis ids. */
  hypothesisIds: readonly string[];
  /** Optional M9 org id. */
  orgId: string | null;
  /** Optional M4 translational programme contract id. */
  translationalProgrammeContractId: string | null;
  identities: readonly TherapeuticIdentityRef[];
  authoredBy: TherapeuticActor;
  dataBasis: TherapeuticDataBasis;
  fixtureHonesty: boolean;
  honesty: TherapeuticDiscoveryHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TargetCandidate = {
  schema: typeof THERAPEUTIC_DISCOVERY_SCHEMA;
  method: typeof THERAPEUTIC_DISCOVERY_METHOD;
  version: typeof THERAPEUTIC_DISCOVERY_VERSION;
  id: string;
  programmeId: string;
  name: string;
  geneSymbol: string | null;
  proteinLabel: string | null;
  rationale: string;
  /** Why this target might matter — not a score. */
  biologicalPlausibilityNote: string;
  /** Explicit: plausibility ≠ predictive validity. */
  biologicalPlausibilityIsNotPredictiveValidity: true;
  /** Never a fabricated numeric ranking score. */
  inventedPriorityScore: null;
  evidenceStrength: EvidenceStrengthOrdinal;
  lifecycle: TargetCandidateLifecycle;
  identities: readonly TherapeuticIdentityRef[];
  hypothesisIds: readonly string[];
  investigationId: string | null;
  authoredBy: TherapeuticActor;
  dataBasis: TherapeuticDataBasis;
  fixtureHonesty: boolean;
  honesty: TherapeuticDiscoveryHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type CompoundOrIntervention = {
  schema: typeof THERAPEUTIC_DISCOVERY_SCHEMA;
  method: typeof THERAPEUTIC_DISCOVERY_METHOD;
  version: typeof THERAPEUTIC_DISCOVERY_VERSION;
  id: string;
  programmeId: string;
  name: string;
  /** Closed discrimination — molecular vs modality vs experimental vs approved. */
  interventionKind: InterventionKind;
  /** Public SMILES when molecular_compound; otherwise null. */
  publicSmiles: string | null;
  modalityLabel: string | null;
  approvalJurisdictionNote: string | null;
  /** Approved medicine ≠ recommendation for use in this programme. */
  approvedMedicineIsNotTreatmentRecommendation: true;
  lifecycle: InterventionLifecycle;
  identities: readonly TherapeuticIdentityRef[];
  authoredBy: TherapeuticActor;
  dataBasis: TherapeuticDataBasis;
  fixtureHonesty: boolean;
  honesty: TherapeuticDiscoveryHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TargetInterventionAssessment = {
  schema: typeof THERAPEUTIC_DISCOVERY_SCHEMA;
  method: typeof THERAPEUTIC_DISCOVERY_METHOD;
  version: typeof THERAPEUTIC_DISCOVERY_VERSION;
  id: string;
  programmeId: string;
  targetCandidateId: string;
  interventionId: string;
  summary: string;
  evidenceStrength: EvidenceStrengthOrdinal;
  conclusionKind: AssessmentConclusionKind;
  /** Required explicit denials. */
  efficacyClaimed: false;
  safetyClaimed: false;
  clinicalSuitabilityClaimed: false;
  treatmentRecommended: false;
  inventedNumericScore: null;
  supportingIdentityRefs: readonly TherapeuticIdentityRef[];
  remainingUncertainties: readonly string[];
  infoRequiredBeforeFurtherWork: readonly string[];
  lifecycle: TargetInterventionAssessmentLifecycle;
  reviewedBy: TherapeuticActor | null;
  authoredBy: TherapeuticActor;
  dataBasis: TherapeuticDataBasis;
  fixtureHonesty: boolean;
  honesty: TherapeuticDiscoveryHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type TherapeuticDiscoveryStore = {
  upsertProgramme(programme: TherapeuticProgramme): TherapeuticProgramme;
  getProgramme(id: string): TherapeuticProgramme | null;
  listProgrammes(): readonly TherapeuticProgramme[];
  upsertTarget(target: TargetCandidate): TargetCandidate;
  getTarget(id: string): TargetCandidate | null;
  listTargets(programmeId?: string): readonly TargetCandidate[];
  upsertIntervention(
    intervention: CompoundOrIntervention,
  ): CompoundOrIntervention;
  getIntervention(id: string): CompoundOrIntervention | null;
  listInterventions(programmeId?: string): readonly CompoundOrIntervention[];
  upsertAssessment(
    assessment: TargetInterventionAssessment,
  ): TargetInterventionAssessment;
  getAssessment(id: string): TargetInterventionAssessment | null;
  listAssessments(programmeId?: string): readonly TargetInterventionAssessment[];
};

const DEFAULT_HONESTY: TherapeuticDiscoveryHonesty = {
  associationIsNotCausation: true,
  associationIsNotEfficacy: true,
  associationIsNotSafety: true,
  associationIsNotClinicalSuitability: true,
  biologicalPlausibilityIsNotPredictiveValidity: true,
  noFabricatedTargetScores: true,
  noTreatmentRecommendations: true,
  noChemblLivePull: true,
  noRepurposingEngine: true,
  noWorkbenchUi: true,
  agentsDraftResearchersDecide: true,
  doesNotManufactureCertainty: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const PROGRAMME_TRANSITIONS: Record<
  TherapeuticProgrammeLifecycle,
  readonly TherapeuticProgrammeLifecycle[]
> = {
  proposed: ["scoped", "rejected", "superseded"],
  scoped: ["active_investigation", "paused", "rejected", "superseded"],
  active_investigation: ["paused", "retired", "superseded"],
  paused: ["active_investigation", "retired", "superseded"],
  superseded: [],
  retired: [],
  rejected: ["superseded"],
};

const TARGET_TRANSITIONS: Record<
  TargetCandidateLifecycle,
  readonly TargetCandidateLifecycle[]
> = {
  proposed: ["under_review", "rejected", "superseded"],
  under_review: [
    "prioritised_for_investigation",
    "deprioritised",
    "rejected",
    "superseded",
  ],
  prioritised_for_investigation: ["deprioritised", "superseded"],
  deprioritised: ["prioritised_for_investigation", "superseded"],
  rejected: ["superseded"],
  superseded: [],
};

const ASSESSMENT_TRANSITIONS: Record<
  TargetInterventionAssessmentLifecycle,
  readonly TargetInterventionAssessmentLifecycle[]
> = {
  draft: ["under_review", "superseded"],
  under_review: [
    "accepted_for_further_investigation",
    "rejected",
    "superseded",
  ],
  accepted_for_further_investigation: ["superseded"],
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

function assertHonesty(honesty: TherapeuticDiscoveryHonesty): void {
  if (honesty.associationIsNotCausation !== true) {
    throw Error("Association must not be treated as causation");
  }
  if (honesty.associationIsNotEfficacy !== true) {
    throw Error("Association must not be treated as efficacy");
  }
  if (honesty.associationIsNotSafety !== true) {
    throw Error("Association must not be treated as safety");
  }
  if (honesty.associationIsNotClinicalSuitability !== true) {
    throw Error("Association must not be treated as clinical suitability");
  }
  if (honesty.biologicalPlausibilityIsNotPredictiveValidity !== true) {
    throw Error("Biological plausibility is not predictive validity");
  }
  if (honesty.noFabricatedTargetScores !== true) {
    throw Error("Fabricated target scores forbidden");
  }
  if (honesty.noTreatmentRecommendations !== true) {
    throw Error("Treatment recommendations forbidden");
  }
  if (honesty.noChemblLivePull !== true) {
    throw Error("ChEMBL live pull forbidden in PR1");
  }
  if (honesty.noRepurposingEngine !== true) {
    throw Error("Repurposing engine forbidden in PR1");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR1");
  }
  if (honesty.agentsDraftResearchersDecide !== true) {
    throw Error("Agents draft; researchers decide");
  }
  if (honesty.doesNotManufactureCertainty !== true) {
    throw Error("Must not manufacture certainty");
  }
  if (honesty.gateCAutoApprove !== false) throw Error("Gate C auto-approve forbidden");
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false in PR1");
  }
  if (honesty.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (honesty.migration !== "deferred") throw Error("Migration must stay deferred");
}

function validateIdentityRefs(
  refs: readonly TherapeuticIdentityRef[],
): readonly TherapeuticIdentityRef[] {
  if (refs.length > 40) throw Error("Too many identity refs");
  return refs.map((ref) => {
    assertClosed(ref.system, THERAPEUTIC_IDENTITY_SYSTEMS, "identity system");
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
    if (ref.system === "chembl") {
      if (!CHEMBL_ID.test(ref.value)) throw Error("Invalid ChEMBL id");
      if (ref.resolution !== "stub_only" && ref.resolution !== "resolved_prefix") {
        throw Error("ChEMBL refs are stub/prefix only in PR1 (no live pull)");
      }
    }
    if (ref.system === "uniprot" && ref.resolution === "resolved_prefix") {
      if (!UNIPROT_ID.test(ref.value)) throw Error("Invalid UniProt accession");
    }
    return {
      system: ref.system,
      value: ref.value.trim(),
      label: ref.label === null ? null : ref.label.trim(),
      resolution: ref.resolution,
      claimSupport: "not_assessed",
    };
  });
}

function assertActor(actor: TherapeuticActor, label: string): TherapeuticActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertNoInventedScoreLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    /\btarget\s*score\s*=\s*\d/.test(lower) ||
    /\bpriority\s*score\s*=\s*\d/.test(lower) ||
    /\befficacy\s*=\s*\d/.test(lower) ||
    /\bsafety\s*score\s*=\s*\d/.test(lower) ||
    /\brecommend\s+(this\s+)?(drug|treatment|medicine)\b/.test(lower) ||
    /\btreat(ment)?\s+recommendation\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent scores or treatment recommendations`,
    );
  }
}

export function draftTherapeuticProgramme(input: {
  id: string;
  name: string;
  researchQuestion: string;
  diseaseContext: string;
  indicationScope: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: TherapeuticActorKind;
  createdAt: string;
  investigationId?: string | null;
  hypothesisIds?: readonly string[];
  orgId?: string | null;
  translationalProgrammeContractId?: string | null;
  identities?: readonly TherapeuticIdentityRef[];
  dataBasis?: TherapeuticDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): TherapeuticProgramme {
  if (!PROGRAMME_ID_RE.test(input.id)) throw Error("Invalid programme id");
  if (!textOk(input.name, 200)) throw Error("Invalid programme name");
  if (!textOk(input.researchQuestion, 2000)) {
    throw Error("Invalid research question");
  }
  if (!textOk(input.diseaseContext, 1000)) throw Error("Invalid disease context");
  if (!textOk(input.indicationScope, 1000)) {
    throw Error("Invalid indication scope");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoInventedScoreLanguage(input.researchQuestion, "researchQuestion");

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const investigationId =
    input.investigationId === undefined || input.investigationId === null
      ? null
      : input.investigationId;
  if (investigationId !== null && !REF_ID_RE.test(investigationId)) {
    throw Error("Invalid investigationId");
  }
  const orgId =
    input.orgId === undefined || input.orgId === null ? null : input.orgId;
  if (orgId !== null && !REF_ID_RE.test(orgId)) throw Error("Invalid orgId");
  const translationalProgrammeContractId =
    input.translationalProgrammeContractId === undefined ||
    input.translationalProgrammeContractId === null
      ? null
      : input.translationalProgrammeContractId;
  if (
    translationalProgrammeContractId !== null &&
    !REF_ID_RE.test(translationalProgrammeContractId)
  ) {
    throw Error("Invalid translationalProgrammeContractId");
  }

  const programme: TherapeuticProgramme = {
    schema: THERAPEUTIC_DISCOVERY_SCHEMA,
    method: THERAPEUTIC_DISCOVERY_METHOD,
    version: THERAPEUTIC_DISCOVERY_VERSION,
    id: input.id,
    name: input.name.trim(),
    researchQuestion: input.researchQuestion.trim(),
    diseaseContext: input.diseaseContext.trim(),
    indicationScope: input.indicationScope.trim(),
    lifecycle: "proposed",
    investigationId,
    hypothesisIds: assertRefList(input.hypothesisIds ?? [], "hypothesis"),
    orgId,
    translationalProgrammeContractId,
    identities: validateIdentityRefs(input.identities ?? []),
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
  return validateTherapeuticProgramme(programme);
}

export function validateTherapeuticProgramme(
  programme: TherapeuticProgramme,
): TherapeuticProgramme {
  if (programme.schema !== THERAPEUTIC_DISCOVERY_SCHEMA) {
    throw Error("Invalid programme schema");
  }
  if (programme.method !== THERAPEUTIC_DISCOVERY_METHOD) {
    throw Error("Invalid programme method");
  }
  if (programme.version !== THERAPEUTIC_DISCOVERY_VERSION) {
    throw Error("Invalid programme version");
  }
  if (!PROGRAMME_ID_RE.test(programme.id)) throw Error("Invalid programme id");
  assertClosed(
    programme.lifecycle,
    THERAPEUTIC_PROGRAMME_LIFECYCLES,
    "programme lifecycle",
  );
  assertClosed(programme.dataBasis, DATA_BASES, "data basis");
  assertHonesty(programme.honesty);
  assertActor(programme.authoredBy, "author");
  validateIdentityRefs(programme.identities);
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
  return programme;
}

export function transitionTherapeuticProgramme(input: {
  programme: TherapeuticProgramme;
  to: TherapeuticProgrammeLifecycle;
  updatedAt: string;
}): TherapeuticProgramme {
  const current = validateTherapeuticProgramme(input.programme);
  assertClosed(input.to, THERAPEUTIC_PROGRAMME_LIFECYCLES, "programme lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const allowed = PROGRAMME_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal programme transition ${current.lifecycle} → ${input.to}`,
    );
  }
  return validateTherapeuticProgramme({
    ...current,
    lifecycle: input.to,
    updatedAt: input.updatedAt,
  });
}

export function draftTargetCandidate(input: {
  id: string;
  programme: TherapeuticProgramme;
  name: string;
  rationale: string;
  biologicalPlausibilityNote: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: TherapeuticActorKind;
  createdAt: string;
  geneSymbol?: string | null;
  proteinLabel?: string | null;
  evidenceStrength?: EvidenceStrengthOrdinal;
  identities?: readonly TherapeuticIdentityRef[];
  hypothesisIds?: readonly string[];
  investigationId?: string | null;
  dataBasis?: TherapeuticDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): TargetCandidate {
  const programme = validateTherapeuticProgramme(input.programme);
  if (!TARGET_ID_RE.test(input.id)) throw Error("Invalid target candidate id");
  if (!textOk(input.name, 200)) throw Error("Invalid target name");
  if (!textOk(input.rationale, 4000)) throw Error("Invalid target rationale");
  if (!textOk(input.biologicalPlausibilityNote, 4000)) {
    throw Error("Invalid biological plausibility note");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoInventedScoreLanguage(input.rationale, "rationale");
  assertNoInventedScoreLanguage(
    input.biologicalPlausibilityNote,
    "biologicalPlausibilityNote",
  );

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  const evidenceStrength = input.evidenceStrength ?? "not_assessed";
  assertClosed(evidenceStrength, EVIDENCE_STRENGTH_ORDINALS, "evidence strength");

  const geneSymbol =
    input.geneSymbol === undefined || input.geneSymbol === null
      ? null
      : input.geneSymbol.trim();
  if (geneSymbol !== null && !textOk(geneSymbol, 40)) {
    throw Error("Invalid geneSymbol");
  }
  const proteinLabel =
    input.proteinLabel === undefined || input.proteinLabel === null
      ? null
      : input.proteinLabel.trim();
  if (proteinLabel !== null && !textOk(proteinLabel, 200)) {
    throw Error("Invalid proteinLabel");
  }
  const investigationId =
    input.investigationId === undefined
      ? programme.investigationId
      : input.investigationId;
  if (investigationId !== null && !REF_ID_RE.test(investigationId)) {
    throw Error("Invalid investigationId");
  }

  const target: TargetCandidate = {
    schema: THERAPEUTIC_DISCOVERY_SCHEMA,
    method: THERAPEUTIC_DISCOVERY_METHOD,
    version: THERAPEUTIC_DISCOVERY_VERSION,
    id: input.id,
    programmeId: programme.id,
    name: input.name.trim(),
    geneSymbol,
    proteinLabel,
    rationale: input.rationale.trim(),
    biologicalPlausibilityNote: input.biologicalPlausibilityNote.trim(),
    biologicalPlausibilityIsNotPredictiveValidity: true,
    inventedPriorityScore: null,
    evidenceStrength,
    lifecycle: "proposed",
    identities: validateIdentityRefs(input.identities ?? []),
    hypothesisIds: assertRefList(
      input.hypothesisIds ?? programme.hypothesisIds,
      "hypothesis",
    ),
    investigationId,
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
  return validateTargetCandidate(target);
}

export function validateTargetCandidate(
  target: TargetCandidate,
): TargetCandidate {
  if (target.schema !== THERAPEUTIC_DISCOVERY_SCHEMA) {
    throw Error("Invalid target schema");
  }
  if (!TARGET_ID_RE.test(target.id)) throw Error("Invalid target id");
  if (!PROGRAMME_ID_RE.test(target.programmeId)) {
    throw Error("Invalid target programmeId");
  }
  assertClosed(target.lifecycle, TARGET_CANDIDATE_LIFECYCLES, "target lifecycle");
  assertClosed(
    target.evidenceStrength,
    EVIDENCE_STRENGTH_ORDINALS,
    "evidence strength",
  );
  assertClosed(target.dataBasis, DATA_BASES, "data basis");
  assertHonesty(target.honesty);
  if (target.inventedPriorityScore !== null) {
    throw Error("Invented priority scores forbidden");
  }
  if (target.biologicalPlausibilityIsNotPredictiveValidity !== true) {
    throw Error("Biological plausibility is not predictive validity");
  }
  assertActor(target.authoredBy, "author");
  validateIdentityRefs(target.identities);
  if (
    !isIsoTimestamp(target.createdAt) ||
    !isIsoTimestamp(target.updatedAt)
  ) {
    throw Error("Invalid target timestamps");
  }
  return target;
}

export function transitionTargetCandidate(input: {
  target: TargetCandidate;
  to: TargetCandidateLifecycle;
  updatedAt: string;
  actor: TherapeuticActor;
}): TargetCandidate {
  const current = validateTargetCandidate(input.target);
  assertClosed(input.to, TARGET_CANDIDATE_LIFECYCLES, "target lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = TARGET_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(`Illegal target transition ${current.lifecycle} → ${input.to}`);
  }
  if (
    (input.to === "prioritised_for_investigation" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may prioritise or reject targets");
  }
  return validateTargetCandidate({
    ...current,
    lifecycle: input.to,
    updatedAt: input.updatedAt,
  });
}

export function draftCompoundOrIntervention(input: {
  id: string;
  programme: TherapeuticProgramme;
  name: string;
  interventionKind: InterventionKind;
  authoredByPrincipalId: string;
  authoredByActorKind?: TherapeuticActorKind;
  createdAt: string;
  publicSmiles?: string | null;
  modalityLabel?: string | null;
  approvalJurisdictionNote?: string | null;
  identities?: readonly TherapeuticIdentityRef[];
  dataBasis?: TherapeuticDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): CompoundOrIntervention {
  const programme = validateTherapeuticProgramme(input.programme);
  if (!INTERVENTION_ID_RE.test(input.id)) throw Error("Invalid intervention id");
  if (!textOk(input.name, 200)) throw Error("Invalid intervention name");
  assertClosed(input.interventionKind, INTERVENTION_KINDS, "intervention kind");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoInventedScoreLanguage(input.name, "intervention name");

  const publicSmiles =
    input.publicSmiles === undefined || input.publicSmiles === null
      ? null
      : input.publicSmiles.trim();
  const modalityLabel =
    input.modalityLabel === undefined || input.modalityLabel === null
      ? null
      : input.modalityLabel.trim();
  const approvalJurisdictionNote =
    input.approvalJurisdictionNote === undefined ||
    input.approvalJurisdictionNote === null
      ? null
      : input.approvalJurisdictionNote.trim();

  if (input.interventionKind === "molecular_compound") {
    if (publicSmiles === null || !textOk(publicSmiles, 500)) {
      throw Error("molecular_compound requires publicSmiles");
    }
  } else if (publicSmiles !== null) {
    throw Error("publicSmiles only allowed for molecular_compound");
  }

  if (input.interventionKind === "modality") {
    if (modalityLabel === null || !textOk(modalityLabel, 200)) {
      throw Error("modality requires modalityLabel");
    }
  }

  if (input.interventionKind === "approved_medicine") {
    if (
      approvalJurisdictionNote === null ||
      !textOk(approvalJurisdictionNote, 500)
    ) {
      throw Error("approved_medicine requires approvalJurisdictionNote");
    }
  } else if (approvalJurisdictionNote !== null) {
    throw Error(
      "approvalJurisdictionNote only allowed for approved_medicine",
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

  const intervention: CompoundOrIntervention = {
    schema: THERAPEUTIC_DISCOVERY_SCHEMA,
    method: THERAPEUTIC_DISCOVERY_METHOD,
    version: THERAPEUTIC_DISCOVERY_VERSION,
    id: input.id,
    programmeId: programme.id,
    name: input.name.trim(),
    interventionKind: input.interventionKind,
    publicSmiles,
    modalityLabel,
    approvalJurisdictionNote,
    approvedMedicineIsNotTreatmentRecommendation: true,
    lifecycle: "proposed",
    identities: validateIdentityRefs(input.identities ?? []),
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
  return validateCompoundOrIntervention(intervention);
}

export function validateCompoundOrIntervention(
  intervention: CompoundOrIntervention,
): CompoundOrIntervention {
  if (intervention.schema !== THERAPEUTIC_DISCOVERY_SCHEMA) {
    throw Error("Invalid intervention schema");
  }
  if (!INTERVENTION_ID_RE.test(intervention.id)) {
    throw Error("Invalid intervention id");
  }
  if (!PROGRAMME_ID_RE.test(intervention.programmeId)) {
    throw Error("Invalid intervention programmeId");
  }
  assertClosed(
    intervention.interventionKind,
    INTERVENTION_KINDS,
    "intervention kind",
  );
  assertClosed(
    intervention.lifecycle,
    INTERVENTION_LIFECYCLES,
    "intervention lifecycle",
  );
  assertClosed(intervention.dataBasis, DATA_BASES, "data basis");
  assertHonesty(intervention.honesty);
  if (intervention.approvedMedicineIsNotTreatmentRecommendation !== true) {
    throw Error("Approved medicine must not be a treatment recommendation");
  }
  assertActor(intervention.authoredBy, "author");
  validateIdentityRefs(intervention.identities);
  if (
    !isIsoTimestamp(intervention.createdAt) ||
    !isIsoTimestamp(intervention.updatedAt)
  ) {
    throw Error("Invalid intervention timestamps");
  }
  return intervention;
}

export function draftTargetInterventionAssessment(input: {
  id: string;
  programme: TherapeuticProgramme;
  target: TargetCandidate;
  intervention: CompoundOrIntervention;
  summary: string;
  conclusionKind?: AssessmentConclusionKind;
  evidenceStrength?: EvidenceStrengthOrdinal;
  supportingIdentityRefs?: readonly TherapeuticIdentityRef[];
  remainingUncertainties: readonly string[];
  infoRequiredBeforeFurtherWork: readonly string[];
  authoredByPrincipalId: string;
  authoredByActorKind?: TherapeuticActorKind;
  createdAt: string;
  dataBasis?: TherapeuticDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): TargetInterventionAssessment {
  const programme = validateTherapeuticProgramme(input.programme);
  const target = validateTargetCandidate(input.target);
  const intervention = validateCompoundOrIntervention(input.intervention);
  if (target.programmeId !== programme.id) {
    throw Error("Target programme mismatch");
  }
  if (intervention.programmeId !== programme.id) {
    throw Error("Intervention programme mismatch");
  }
  if (!ASSESSMENT_ID_RE.test(input.id)) throw Error("Invalid assessment id");
  if (!textOk(input.summary, 4000)) throw Error("Invalid assessment summary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoInventedScoreLanguage(input.summary, "assessment summary");

  const conclusionKind = input.conclusionKind ?? "not_assessed";
  assertClosed(
    conclusionKind,
    ASSESSMENT_CONCLUSION_KINDS,
    "assessment conclusion",
  );
  const evidenceStrength = input.evidenceStrength ?? "not_assessed";
  assertClosed(evidenceStrength, EVIDENCE_STRENGTH_ORDINALS, "evidence strength");

  const remainingUncertainties = assertStringList(
    input.remainingUncertainties,
    "remaining uncertainties",
    32,
    1000,
  );
  const infoRequiredBeforeFurtherWork = assertStringList(
    input.infoRequiredBeforeFurtherWork,
    "info required before further work",
    32,
    1000,
  );
  if (remainingUncertainties.length < 1) {
    throw Error("Assessment requires at least one remaining uncertainty");
  }
  if (infoRequiredBeforeFurtherWork.length < 1) {
    throw Error("Assessment requires infoRequiredBeforeFurtherWork");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const assessment: TargetInterventionAssessment = {
    schema: THERAPEUTIC_DISCOVERY_SCHEMA,
    method: THERAPEUTIC_DISCOVERY_METHOD,
    version: THERAPEUTIC_DISCOVERY_VERSION,
    id: input.id,
    programmeId: programme.id,
    targetCandidateId: target.id,
    interventionId: intervention.id,
    summary: input.summary.trim(),
    evidenceStrength,
    conclusionKind,
    efficacyClaimed: false,
    safetyClaimed: false,
    clinicalSuitabilityClaimed: false,
    treatmentRecommended: false,
    inventedNumericScore: null,
    supportingIdentityRefs: validateIdentityRefs(
      input.supportingIdentityRefs ?? [],
    ),
    remainingUncertainties,
    infoRequiredBeforeFurtherWork,
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
  return validateTargetInterventionAssessment(assessment);
}

export function validateTargetInterventionAssessment(
  assessment: TargetInterventionAssessment,
): TargetInterventionAssessment {
  if (assessment.schema !== THERAPEUTIC_DISCOVERY_SCHEMA) {
    throw Error("Invalid assessment schema");
  }
  if (!ASSESSMENT_ID_RE.test(assessment.id)) throw Error("Invalid assessment id");
  assertClosed(
    assessment.lifecycle,
    TARGET_INTERVENTION_ASSESSMENT_LIFECYCLES,
    "assessment lifecycle",
  );
  assertClosed(
    assessment.conclusionKind,
    ASSESSMENT_CONCLUSION_KINDS,
    "assessment conclusion",
  );
  assertClosed(
    assessment.evidenceStrength,
    EVIDENCE_STRENGTH_ORDINALS,
    "evidence strength",
  );
  assertClosed(assessment.dataBasis, DATA_BASES, "data basis");
  assertHonesty(assessment.honesty);
  if (assessment.efficacyClaimed !== false) throw Error("Efficacy must not be claimed");
  if (assessment.safetyClaimed !== false) throw Error("Safety must not be claimed");
  if (assessment.clinicalSuitabilityClaimed !== false) {
    throw Error("Clinical suitability must not be claimed");
  }
  if (assessment.treatmentRecommended !== false) {
    throw Error("Treatment recommendations forbidden");
  }
  if (assessment.inventedNumericScore !== null) {
    throw Error("Invented numeric scores forbidden");
  }
  assertActor(assessment.authoredBy, "author");
  if (assessment.reviewedBy !== null) {
    const reviewer = assertActor(assessment.reviewedBy, "reviewer");
    if (reviewer.actorKind !== "human") {
      throw Error("Only human researchers may review assessments");
    }
  }
  validateIdentityRefs(assessment.supportingIdentityRefs);
  if (
    !isIsoTimestamp(assessment.createdAt) ||
    !isIsoTimestamp(assessment.updatedAt)
  ) {
    throw Error("Invalid assessment timestamps");
  }
  return assessment;
}

export function transitionTargetInterventionAssessment(input: {
  assessment: TargetInterventionAssessment;
  to: TargetInterventionAssessmentLifecycle;
  updatedAt: string;
  actor: TherapeuticActor;
}): TargetInterventionAssessment {
  const current = validateTargetInterventionAssessment(input.assessment);
  assertClosed(
    input.to,
    TARGET_INTERVENTION_ASSESSMENT_LIFECYCLES,
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
    (input.to === "accepted_for_further_investigation" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject assessments");
  }
  return validateTargetInterventionAssessment({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted_for_further_investigation" ||
      input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryTherapeuticDiscoveryStore(): TherapeuticDiscoveryStore & {
  programmes: Map<string, TherapeuticProgramme>;
  targets: Map<string, TargetCandidate>;
  interventions: Map<string, CompoundOrIntervention>;
  assessments: Map<string, TargetInterventionAssessment>;
} {
  const programmes = new Map<string, TherapeuticProgramme>();
  const targets = new Map<string, TargetCandidate>();
  const interventions = new Map<string, CompoundOrIntervention>();
  const assessments = new Map<string, TargetInterventionAssessment>();

  return {
    programmes,
    targets,
    interventions,
    assessments,
    upsertProgramme(programme) {
      const validated = validateTherapeuticProgramme(programme);
      programmes.set(validated.id, validated);
      return validated;
    },
    getProgramme(id) {
      return programmes.get(id) ?? null;
    },
    listProgrammes() {
      return [...programmes.values()];
    },
    upsertTarget(target) {
      const validated = validateTargetCandidate(target);
      targets.set(validated.id, validated);
      return validated;
    },
    getTarget(id) {
      return targets.get(id) ?? null;
    },
    listTargets(programmeId) {
      const all = [...targets.values()];
      return programmeId
        ? all.filter((t) => t.programmeId === programmeId)
        : all;
    },
    upsertIntervention(intervention) {
      const validated = validateCompoundOrIntervention(intervention);
      interventions.set(validated.id, validated);
      return validated;
    },
    getIntervention(id) {
      return interventions.get(id) ?? null;
    },
    listInterventions(programmeId) {
      const all = [...interventions.values()];
      return programmeId
        ? all.filter((i) => i.programmeId === programmeId)
        : all;
    },
    upsertAssessment(assessment) {
      const validated = validateTargetInterventionAssessment(assessment);
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
  };
}

export function projectTherapeuticDiscoveryPersistenceLines(input: {
  programme: TherapeuticProgramme;
  targets?: readonly TargetCandidate[];
  interventions?: readonly CompoundOrIntervention[];
  assessments?: readonly TargetInterventionAssessment[];
}): string[] {
  const programme = validateTherapeuticProgramme(input.programme);
  const targets = (input.targets ?? []).map(validateTargetCandidate);
  const interventions = (input.interventions ?? []).map(
    validateCompoundOrIntervention,
  );
  const assessments = (input.assessments ?? []).map(
    validateTargetInterventionAssessment,
  );
  return [
    `schema=${programme.schema}`,
    `method=${programme.method}`,
    `version=${programme.version}`,
    `programmeId=${programme.id}`,
    `lifecycle=${programme.lifecycle}`,
    `investigationId=${programme.investigationId ?? "none"}`,
    `orgId=${programme.orgId ?? "none"}`,
    `hypothesisCount=${programme.hypothesisIds.length}`,
    `targets=${targets.length}`,
    `interventions=${interventions.length}`,
    `assessments=${assessments.length}`,
    `efficacyClaimed=false`,
    `safetyClaimed=false`,
    `clinicalSuitability=false`,
    `treatmentRecommended=false`,
    `fabricatedTargetScores=false`,
    `chemblLivePull=false`,
    `repurposingEngine=false`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintTherapeuticProgramme(
  programme: TherapeuticProgramme,
): string {
  const validated = validateTherapeuticProgramme(programme);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildTherapeuticDiscoveryPack(input: {
  programmes: readonly TherapeuticProgramme[];
  targets: readonly TargetCandidate[];
  interventions: readonly CompoundOrIntervention[];
  assessments: readonly TargetInterventionAssessment[];
  asOf: string;
}): {
  schema: typeof THERAPEUTIC_DISCOVERY_SCHEMA;
  method: typeof THERAPEUTIC_DISCOVERY_METHOD;
  version: typeof THERAPEUTIC_DISCOVERY_VERSION;
  asOf: string;
  programmeCount: number;
  targetCount: number;
  interventionCount: number;
  assessmentCount: number;
  honesty: TherapeuticDiscoveryHonesty;
  programmes: readonly TherapeuticProgramme[];
  targets: readonly TargetCandidate[];
  interventions: readonly CompoundOrIntervention[];
  assessments: readonly TargetInterventionAssessment[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const programmes = input.programmes.map(validateTherapeuticProgramme);
  const targets = input.targets.map(validateTargetCandidate);
  const interventions = input.interventions.map(validateCompoundOrIntervention);
  const assessments = input.assessments.map(
    validateTargetInterventionAssessment,
  );
  return {
    schema: THERAPEUTIC_DISCOVERY_SCHEMA,
    method: THERAPEUTIC_DISCOVERY_METHOD,
    version: THERAPEUTIC_DISCOVERY_VERSION,
    asOf: input.asOf,
    programmeCount: programmes.length,
    targetCount: targets.length,
    interventionCount: interventions.length,
    assessmentCount: assessments.length,
    honesty: {...DEFAULT_HONESTY},
    programmes,
    targets,
    interventions,
    assessments,
  };
}
