/**
 * Milestone 17 / PR1 — Scientific Programme Intelligence Contracts.
 *
 * Governed research programme · workstream · programme milestone · research
 * decision envelopes that compose existing orchestrator / hypothesis /
 * therapeutic / translational / org / evidence ids. Does NOT invent a separate
 * AI agent platform, auto-approve plans or claims, allow agents to approve
 * their own findings, ship workbench UI, fabricate discoveries, invent Gate C
 * auto-approve / MoU, or wire PHI/CDS.
 *
 * Binding honesty:
 * - Agents investigate / propose; researchers approve; independent reviewers verify.
 * - Agents must not approve their own findings.
 * - Not a separate agent platform — reuse existing orchestrator and registries.
 * - Autonomous execution (later) remains bounded by explicit authorisation,
 *   resources, data permissions, and scientific review — not free-running.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const SCIENTIFIC_PROGRAMME_SCHEMA =
  "hsi-scientific-programme-intelligence-1" as const;
export const SCIENTIFIC_PROGRAMME_METHOD =
  "hsi.scientific_programme_intelligence.v1" as const;
export const SCIENTIFIC_PROGRAMME_VERSION = "0.1.0" as const;

export const RESEARCH_PROGRAMME_LIFECYCLES = [
  "draft",
  "under_review",
  "active",
  "paused",
  "completed",
  "superseded",
  "rejected",
] as const;
export type ResearchProgrammeLifecycle =
  (typeof RESEARCH_PROGRAMME_LIFECYCLES)[number];

export const RESEARCH_WORKSTREAM_LIFECYCLES = [
  "proposed",
  "under_review",
  "active",
  "paused",
  "completed",
  "superseded",
  "rejected",
] as const;
export type ResearchWorkstreamLifecycle =
  (typeof RESEARCH_WORKSTREAM_LIFECYCLES)[number];

export const PROGRAMME_MILESTONE_LIFECYCLES = [
  "planned",
  "in_progress",
  "awaiting_review",
  "accepted",
  "rejected",
  "superseded",
] as const;
export type ProgrammeMilestoneLifecycle =
  (typeof PROGRAMME_MILESTONE_LIFECYCLES)[number];

export const RESEARCH_DECISION_LIFECYCLES = [
  "draft",
  "under_review",
  "accepted",
  "rejected",
  "superseded",
] as const;
export type ResearchDecisionLifecycle =
  (typeof RESEARCH_DECISION_LIFECYCLES)[number];

export const RESEARCH_DECISION_KINDS = [
  "programme_scope_change",
  "workstream_priority",
  "milestone_acceptance",
  "investigation_go_no_go",
  "evidence_claim_disposition",
  "resource_reallocation",
  "pause_or_stop",
  "other_research_governance",
] as const;
export type ResearchDecisionKind = (typeof RESEARCH_DECISION_KINDS)[number];

export const AUTHORISATION_CLASSES = [
  "fixture_engineering_only",
  "human_gated_proposal",
  "explicit_authorisation_required",
  "blocked_no_authorisation",
] as const;
export type AuthorisationClass = (typeof AUTHORISATION_CLASSES)[number];

export const RESOURCE_CLASSES = [
  "fixture_unbounded_not_claimed",
  "declared_limited",
  "quota_enforcement_missing",
  "blocked_unspecified",
] as const;
export type ResourceClass = (typeof RESOURCE_CLASSES)[number];

export const DATA_PERMISSION_CLASSES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research_permission",
  "blocked_no_authorised_dataset",
] as const;
export type DataPermissionClass = (typeof DATA_PERMISSION_CLASSES)[number];

export const WORKSTREAM_PERMITTED_ACTION_ORDINALS = [
  "investigate_and_propose_only",
  "draft_plans_for_human_review",
  "retrieve_public_evidence",
  "compose_existing_registry_refs",
  "not_execute_autonomously",
] as const;
export type WorkstreamPermittedActionOrdinal =
  (typeof WORKSTREAM_PERMITTED_ACTION_ORDINALS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ScientificProgrammeActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type ScientificProgrammeDataBasis = (typeof DATA_BASES)[number];

export const SCIENTIFIC_PROGRAMME_IDENTITY_SYSTEMS = [
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
export type ScientificProgrammeIdentitySystem =
  (typeof SCIENTIFIC_PROGRAMME_IDENTITY_SYSTEMS)[number];

const PROGRAMME_ID_RE = /^hsi-sp-prog-[a-z0-9-]{3,80}$/;
const WORKSTREAM_ID_RE = /^hsi-sp-ws-[a-z0-9-]{3,80}$/;
const MILESTONE_ID_RE = /^hsi-sp-ms-[a-z0-9-]{3,80}$/;
const DECISION_ID_RE = /^hsi-sp-dec-[a-z0-9-]{3,80}$/;
const M12_TX_PROGRAMME_ID_RE = /^hsi-tx-prog-[a-z0-9-]{3,80}$/;
const M13_TD_PROGRAMME_ID_RE = /^hsi-td-prog-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ScientificProgrammeHonesty = {
  notSeparateAgentPlatform: true;
  agentsInvestigateResearchersApprove: true;
  independentReviewersVerify: true;
  agentsMustNotApproveOwnFindings: true;
  noAutoApprovalOfPlansOrClaims: true;
  noFabricatedDiscoveries: true;
  autonomousExecutionRequiresExplicitBounds: true;
  noWorkbenchUi: true;
  researchDecisionSupportOnly: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  m11LiveMultiscaleClaimed: false;
};

export type ScientificProgrammeActor = {
  principalId: string;
  actorKind: ScientificProgrammeActorKind;
};

export type ScientificProgrammeIdentityRef = {
  system: ScientificProgrammeIdentitySystem;
  value: string;
  label: string | null;
  resolution:
    | "resolved_prefix"
    | "stub_only"
    | "declared_research"
    | "unresolved";
  claimSupport: "not_assessed";
};

export type ResearchProgramme = {
  schema: typeof SCIENTIFIC_PROGRAMME_SCHEMA;
  method: typeof SCIENTIFIC_PROGRAMME_METHOD;
  version: typeof SCIENTIFIC_PROGRAMME_VERSION;
  id: string;
  name: string;
  purpose: string;
  scopeSummary: string;
  authorisationClass: AuthorisationClass;
  resourceClass: ResourceClass;
  dataPermissionClass: DataPermissionClass;
  /** Explicit: not a free-running agent platform. */
  notSeparateAgentPlatform: true;
  lifecycle: ResearchProgrammeLifecycle;
  investigationIds: readonly string[];
  hypothesisIds: readonly string[];
  orgId: string | null;
  therapeuticProgrammeId: string | null;
  translationalProgrammeId: string | null;
  identities: readonly ScientificProgrammeIdentityRef[];
  authoredBy: ScientificProgrammeActor;
  reviewedBy: ScientificProgrammeActor | null;
  dataBasis: ScientificProgrammeDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificProgrammeHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ResearchWorkstream = {
  schema: typeof SCIENTIFIC_PROGRAMME_SCHEMA;
  method: typeof SCIENTIFIC_PROGRAMME_METHOD;
  version: typeof SCIENTIFIC_PROGRAMME_VERSION;
  id: string;
  programmeId: string;
  name: string;
  objectiveSummary: string;
  permittedActions: readonly WorkstreamPermittedActionOrdinal[];
  /** Agents propose within the lane — they do not self-approve. */
  agentsProposeOnly: true;
  notAutonomousExecution: true;
  lifecycle: ResearchWorkstreamLifecycle;
  investigationId: string | null;
  hypothesisIds: readonly string[];
  authoredBy: ScientificProgrammeActor;
  reviewedBy: ScientificProgrammeActor | null;
  dataBasis: ScientificProgrammeDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificProgrammeHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ProgrammeMilestone = {
  schema: typeof SCIENTIFIC_PROGRAMME_SCHEMA;
  method: typeof SCIENTIFIC_PROGRAMME_METHOD;
  version: typeof SCIENTIFIC_PROGRAMME_VERSION;
  id: string;
  programmeId: string;
  workstreamId: string | null;
  name: string;
  exitCriteria: string;
  evidenceRequired: true;
  /** Milestones never auto-complete from agent output alone. */
  notAutoComplete: true;
  lifecycle: ProgrammeMilestoneLifecycle;
  authoredBy: ScientificProgrammeActor;
  reviewedBy: ScientificProgrammeActor | null;
  dataBasis: ScientificProgrammeDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificProgrammeHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ResearchDecision = {
  schema: typeof SCIENTIFIC_PROGRAMME_SCHEMA;
  method: typeof SCIENTIFIC_PROGRAMME_METHOD;
  version: typeof SCIENTIFIC_PROGRAMME_VERSION;
  id: string;
  programmeId: string;
  workstreamId: string | null;
  milestoneId: string | null;
  decisionKind: ResearchDecisionKind;
  summary: string;
  rationale: string;
  subjectRefs: readonly string[];
  /** Authoring agent principal when decision was drafted by AI — must not self-accept. */
  proposingAgentPrincipalId: string | null;
  lifecycle: ResearchDecisionLifecycle;
  decidedBy: ScientificProgrammeActor | null;
  independentReviewer: ScientificProgrammeActor | null;
  authoredBy: ScientificProgrammeActor;
  dataBasis: ScientificProgrammeDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificProgrammeHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ScientificProgrammeStore = {
  upsertProgramme(programme: ResearchProgramme): ResearchProgramme;
  getProgramme(id: string): ResearchProgramme | null;
  listProgrammes(): readonly ResearchProgramme[];
  upsertWorkstream(workstream: ResearchWorkstream): ResearchWorkstream;
  getWorkstream(id: string): ResearchWorkstream | null;
  listWorkstreams(programmeId?: string): readonly ResearchWorkstream[];
  upsertMilestone(milestone: ProgrammeMilestone): ProgrammeMilestone;
  getMilestone(id: string): ProgrammeMilestone | null;
  listMilestones(programmeId?: string): readonly ProgrammeMilestone[];
  upsertDecision(decision: ResearchDecision): ResearchDecision;
  getDecision(id: string): ResearchDecision | null;
  listDecisions(programmeId?: string): readonly ResearchDecision[];
};

const DEFAULT_HONESTY: ScientificProgrammeHonesty = {
  notSeparateAgentPlatform: true,
  agentsInvestigateResearchersApprove: true,
  independentReviewersVerify: true,
  agentsMustNotApproveOwnFindings: true,
  noAutoApprovalOfPlansOrClaims: true,
  noFabricatedDiscoveries: true,
  autonomousExecutionRequiresExplicitBounds: true,
  noWorkbenchUi: true,
  researchDecisionSupportOnly: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  m11LiveMultiscaleClaimed: false,
};

const PROGRAMME_TRANSITIONS: Record<
  ResearchProgrammeLifecycle,
  readonly ResearchProgrammeLifecycle[]
> = {
  draft: ["under_review", "rejected", "superseded"],
  under_review: ["active", "rejected", "superseded", "draft"],
  active: ["paused", "completed", "superseded"],
  paused: ["active", "completed", "superseded", "rejected"],
  completed: ["superseded"],
  superseded: [],
  rejected: ["superseded"],
};

const WORKSTREAM_TRANSITIONS: Record<
  ResearchWorkstreamLifecycle,
  readonly ResearchWorkstreamLifecycle[]
> = {
  proposed: ["under_review", "rejected", "superseded"],
  under_review: ["active", "rejected", "superseded", "proposed"],
  active: ["paused", "completed", "superseded"],
  paused: ["active", "completed", "superseded", "rejected"],
  completed: ["superseded"],
  superseded: [],
  rejected: ["superseded"],
};

const MILESTONE_TRANSITIONS: Record<
  ProgrammeMilestoneLifecycle,
  readonly ProgrammeMilestoneLifecycle[]
> = {
  planned: ["in_progress", "superseded", "rejected"],
  in_progress: ["awaiting_review", "superseded", "rejected"],
  awaiting_review: ["accepted", "rejected", "in_progress", "superseded"],
  accepted: ["superseded"],
  rejected: ["superseded"],
  superseded: [],
};

const DECISION_TRANSITIONS: Record<
  ResearchDecisionLifecycle,
  readonly ResearchDecisionLifecycle[]
> = {
  draft: ["under_review", "superseded"],
  under_review: ["accepted", "rejected", "superseded", "draft"],
  accepted: ["superseded"],
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

function assertHonesty(honesty: ScientificProgrammeHonesty): void {
  if (honesty.notSeparateAgentPlatform !== true) {
    throw Error("Must not invent a separate agent platform");
  }
  if (honesty.agentsInvestigateResearchersApprove !== true) {
    throw Error("Agents investigate; researchers approve");
  }
  if (honesty.independentReviewersVerify !== true) {
    throw Error("Independent reviewers must verify");
  }
  if (honesty.agentsMustNotApproveOwnFindings !== true) {
    throw Error("Agents must not approve their own findings");
  }
  if (honesty.noAutoApprovalOfPlansOrClaims !== true) {
    throw Error("Auto-approval of plans or claims forbidden");
  }
  if (honesty.noFabricatedDiscoveries !== true) {
    throw Error("Fabricated discoveries forbidden");
  }
  if (honesty.autonomousExecutionRequiresExplicitBounds !== true) {
    throw Error("Autonomous execution requires explicit bounds");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI forbidden in PR1");
  }
  if (honesty.researchDecisionSupportOnly !== true) {
    throw Error("Research decision support only");
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
  if (honesty.m11LiveMultiscaleClaimed !== false) {
    throw Error("M11 live multiscale must not be claimed");
  }
}

function assertNoForbiddenClaimLanguage(text: string, label: string): void {
  const lower = text.toLowerCase();
  if (
    (/\bfabricated\s+discover(?:y|ies)\b/.test(lower) &&
      !/\bno\s+fabricated\s+discover/.test(lower)) ||
    /\bdiscovered\s+that\b/.test(lower) ||
    /\bwe\s+have\s+proven\b/.test(lower) ||
    (/\bauto[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\bno\s+auto[- ]?approv/.test(lower)) ||
    /\bgate\s*c\s+auto/.test(lower) ||
    /\bagents?\s+may\s+approve\b/.test(lower) ||
    (/\bself[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\b(no|not|cannot|must\s+not)\s+self[- ]?approv/.test(lower) &&
      !/\bcannot\s+self[- ]?approv/.test(lower)) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bdiagnos(e|is|ing)\s+the\s+patient\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower)
  ) {
    throw Error(
      `${label} must not invent discoveries, auto-approval, self-approval, PHI/CDS directives, or live multiscale claims`,
    );
  }
}

function validateIdentityRefs(
  refs: readonly ScientificProgrammeIdentityRef[],
): readonly ScientificProgrammeIdentityRef[] {
  if (refs.length > 40) throw Error("Too many identity refs");
  return refs.map((ref) => {
    assertClosed(
      ref.system,
      SCIENTIFIC_PROGRAMME_IDENTITY_SYSTEMS,
      "identity system",
    );
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

function assertActor(
  actor: ScientificProgrammeActor,
  label: string,
): ScientificProgrammeActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principal`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actor kind`);
  return {principalId: actor.principalId, actorKind: actor.actorKind};
}

function assertOptionalTxProgrammeId(id: string | null): string | null {
  if (id === null) return null;
  if (!M12_TX_PROGRAMME_ID_RE.test(id)) {
    throw Error("Invalid therapeutic programme id (expected hsi-tx-prog-*)");
  }
  return id;
}

function assertOptionalTdProgrammeId(id: string | null): string | null {
  if (id === null) return null;
  if (!M13_TD_PROGRAMME_ID_RE.test(id)) {
    throw Error(
      "Invalid translational programme id (expected hsi-td-prog-*)",
    );
  }
  return id;
}

export function draftResearchProgramme(input: {
  id: string;
  name: string;
  purpose: string;
  scopeSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ScientificProgrammeActorKind;
  createdAt: string;
  authorisationClass?: AuthorisationClass;
  resourceClass?: ResourceClass;
  dataPermissionClass?: DataPermissionClass;
  investigationIds?: readonly string[];
  hypothesisIds?: readonly string[];
  orgId?: string | null;
  therapeuticProgrammeId?: string | null;
  translationalProgrammeId?: string | null;
  identities?: readonly ScientificProgrammeIdentityRef[];
  dataBasis?: ScientificProgrammeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ResearchProgramme {
  if (!PROGRAMME_ID_RE.test(input.id)) throw Error("Invalid programme id");
  if (!textOk(input.name, 200)) throw Error("Invalid programme name");
  if (!textOk(input.purpose, 2000)) throw Error("Invalid programme purpose");
  if (!textOk(input.scopeSummary, 2000)) throw Error("Invalid scope summary");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.purpose, "purpose");
  assertNoForbiddenClaimLanguage(input.scopeSummary, "scopeSummary");

  const authorisationClass =
    input.authorisationClass ?? "fixture_engineering_only";
  const resourceClass = input.resourceClass ?? "fixture_unbounded_not_claimed";
  const dataPermissionClass =
    input.dataPermissionClass ?? "fixture_engineering";
  assertClosed(authorisationClass, AUTHORISATION_CLASSES, "authorisation class");
  assertClosed(resourceClass, RESOURCE_CLASSES, "resource class");
  assertClosed(
    dataPermissionClass,
    DATA_PERMISSION_CLASSES,
    "data permission class",
  );

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const orgId =
    input.orgId === undefined || input.orgId === null ? null : input.orgId;
  if (orgId !== null && !REF_ID_RE.test(orgId)) throw Error("Invalid orgId");

  const programme: ResearchProgramme = {
    schema: SCIENTIFIC_PROGRAMME_SCHEMA,
    method: SCIENTIFIC_PROGRAMME_METHOD,
    version: SCIENTIFIC_PROGRAMME_VERSION,
    id: input.id,
    name: input.name.trim(),
    purpose: input.purpose.trim(),
    scopeSummary: input.scopeSummary.trim(),
    authorisationClass,
    resourceClass,
    dataPermissionClass,
    notSeparateAgentPlatform: true,
    lifecycle: "draft",
    investigationIds: assertRefList(
      input.investigationIds ?? [],
      "investigation",
    ),
    hypothesisIds: assertRefList(input.hypothesisIds ?? [], "hypothesis"),
    orgId,
    therapeuticProgrammeId: assertOptionalTxProgrammeId(
      input.therapeuticProgrammeId ?? null,
    ),
    translationalProgrammeId: assertOptionalTdProgrammeId(
      input.translationalProgrammeId ?? null,
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
  return validateResearchProgramme(programme);
}

export function validateResearchProgramme(
  programme: ResearchProgramme,
): ResearchProgramme {
  if (programme.schema !== SCIENTIFIC_PROGRAMME_SCHEMA) {
    throw Error("Invalid programme schema");
  }
  if (programme.method !== SCIENTIFIC_PROGRAMME_METHOD) {
    throw Error("Invalid programme method");
  }
  if (programme.version !== SCIENTIFIC_PROGRAMME_VERSION) {
    throw Error("Invalid programme version");
  }
  if (!PROGRAMME_ID_RE.test(programme.id)) throw Error("Invalid programme id");
  assertClosed(
    programme.lifecycle,
    RESEARCH_PROGRAMME_LIFECYCLES,
    "programme lifecycle",
  );
  assertClosed(
    programme.authorisationClass,
    AUTHORISATION_CLASSES,
    "authorisation class",
  );
  assertClosed(programme.resourceClass, RESOURCE_CLASSES, "resource class");
  assertClosed(
    programme.dataPermissionClass,
    DATA_PERMISSION_CLASSES,
    "data permission class",
  );
  assertClosed(programme.dataBasis, DATA_BASES, "data basis");
  assertHonesty(programme.honesty);
  if (programme.notSeparateAgentPlatform !== true) {
    throw Error("Must declare notSeparateAgentPlatform");
  }
  assertActor(programme.authoredBy, "author");
  if (programme.reviewedBy !== null) {
    const reviewer = assertActor(programme.reviewedBy, "reviewer");
    if (reviewer.actorKind !== "human") {
      throw Error("Only human researchers may review programmes");
    }
  }
  assertOptionalTxProgrammeId(programme.therapeuticProgrammeId);
  assertOptionalTdProgrammeId(programme.translationalProgrammeId);
  assertRefList(programme.investigationIds, "investigation");
  assertRefList(programme.hypothesisIds, "hypothesis");
  validateIdentityRefs(programme.identities);
  if (
    !isIsoTimestamp(programme.createdAt) ||
    !isIsoTimestamp(programme.updatedAt)
  ) {
    throw Error("Invalid programme timestamps");
  }
  return programme;
}

export function transitionResearchProgramme(input: {
  programme: ResearchProgramme;
  to: ResearchProgrammeLifecycle;
  updatedAt: string;
  actor: ScientificProgrammeActor;
}): ResearchProgramme {
  const current = validateResearchProgramme(input.programme);
  assertClosed(input.to, RESEARCH_PROGRAMME_LIFECYCLES, "programme lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = PROGRAMME_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal programme transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "active" ||
      input.to === "completed" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error(
      "Only human researchers may activate, complete, or reject programmes",
    );
  }
  return validateResearchProgramme({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "active" ||
      input.to === "completed" ||
      input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftResearchWorkstream(input: {
  id: string;
  programme: ResearchProgramme;
  name: string;
  objectiveSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ScientificProgrammeActorKind;
  createdAt: string;
  permittedActions?: readonly WorkstreamPermittedActionOrdinal[];
  investigationId?: string | null;
  hypothesisIds?: readonly string[];
  dataBasis?: ScientificProgrammeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ResearchWorkstream {
  const programme = validateResearchProgramme(input.programme);
  if (!WORKSTREAM_ID_RE.test(input.id)) throw Error("Invalid workstream id");
  if (!textOk(input.name, 200)) throw Error("Invalid workstream name");
  if (!textOk(input.objectiveSummary, 2000)) {
    throw Error("Invalid objective summary");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.objectiveSummary, "objectiveSummary");

  const permittedActions = [
    ...(input.permittedActions ?? [
      "investigate_and_propose_only",
      "draft_plans_for_human_review",
      "not_execute_autonomously",
    ]),
  ];
  if (permittedActions.length < 1 || permittedActions.length > 8) {
    throw Error("Invalid permittedActions length");
  }
  for (const action of permittedActions) {
    assertClosed(
      action,
      WORKSTREAM_PERMITTED_ACTION_ORDINALS,
      "permitted action",
    );
  }
  if (!permittedActions.includes("not_execute_autonomously")) {
    throw Error("Workstream must include not_execute_autonomously");
  }
  if (!permittedActions.includes("investigate_and_propose_only")) {
    throw Error("Workstream must include investigate_and_propose_only");
  }

  const investigationId =
    input.investigationId === undefined || input.investigationId === null
      ? null
      : input.investigationId;
  if (investigationId !== null && !REF_ID_RE.test(investigationId)) {
    throw Error("Invalid investigationId");
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const workstream: ResearchWorkstream = {
    schema: SCIENTIFIC_PROGRAMME_SCHEMA,
    method: SCIENTIFIC_PROGRAMME_METHOD,
    version: SCIENTIFIC_PROGRAMME_VERSION,
    id: input.id,
    programmeId: programme.id,
    name: input.name.trim(),
    objectiveSummary: input.objectiveSummary.trim(),
    permittedActions,
    agentsProposeOnly: true,
    notAutonomousExecution: true,
    lifecycle: "proposed",
    investigationId,
    hypothesisIds: assertRefList(input.hypothesisIds ?? [], "hypothesis"),
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
  return validateResearchWorkstream(workstream);
}

export function validateResearchWorkstream(
  workstream: ResearchWorkstream,
): ResearchWorkstream {
  if (workstream.schema !== SCIENTIFIC_PROGRAMME_SCHEMA) {
    throw Error("Invalid workstream schema");
  }
  if (!WORKSTREAM_ID_RE.test(workstream.id)) {
    throw Error("Invalid workstream id");
  }
  if (!PROGRAMME_ID_RE.test(workstream.programmeId)) {
    throw Error("Invalid workstream programmeId");
  }
  assertClosed(
    workstream.lifecycle,
    RESEARCH_WORKSTREAM_LIFECYCLES,
    "workstream lifecycle",
  );
  assertClosed(workstream.dataBasis, DATA_BASES, "data basis");
  assertHonesty(workstream.honesty);
  if (workstream.agentsProposeOnly !== true) {
    throw Error("Workstream agents must propose only");
  }
  if (workstream.notAutonomousExecution !== true) {
    throw Error("Workstream must deny autonomous execution in PR1");
  }
  if (!workstream.permittedActions.includes("not_execute_autonomously")) {
    throw Error("Workstream must include not_execute_autonomously");
  }
  assertActor(workstream.authoredBy, "author");
  if (workstream.reviewedBy !== null) {
    const reviewer = assertActor(workstream.reviewedBy, "reviewer");
    if (reviewer.actorKind !== "human") {
      throw Error("Only human researchers may review workstreams");
    }
  }
  assertRefList(workstream.hypothesisIds, "hypothesis");
  if (
    !isIsoTimestamp(workstream.createdAt) ||
    !isIsoTimestamp(workstream.updatedAt)
  ) {
    throw Error("Invalid workstream timestamps");
  }
  return workstream;
}

export function transitionResearchWorkstream(input: {
  workstream: ResearchWorkstream;
  to: ResearchWorkstreamLifecycle;
  updatedAt: string;
  actor: ScientificProgrammeActor;
}): ResearchWorkstream {
  const current = validateResearchWorkstream(input.workstream);
  assertClosed(
    input.to,
    RESEARCH_WORKSTREAM_LIFECYCLES,
    "workstream lifecycle",
  );
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = WORKSTREAM_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal workstream transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "active" ||
      input.to === "completed" ||
      input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error(
      "Only human researchers may activate, complete, or reject workstreams",
    );
  }
  return validateResearchWorkstream({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "active" ||
      input.to === "completed" ||
      input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftProgrammeMilestone(input: {
  id: string;
  programme: ResearchProgramme;
  name: string;
  exitCriteria: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ScientificProgrammeActorKind;
  createdAt: string;
  workstream?: ResearchWorkstream | null;
  dataBasis?: ScientificProgrammeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ProgrammeMilestone {
  const programme = validateResearchProgramme(input.programme);
  if (!MILESTONE_ID_RE.test(input.id)) throw Error("Invalid milestone id");
  if (!textOk(input.name, 200)) throw Error("Invalid milestone name");
  if (!textOk(input.exitCriteria, 2000)) throw Error("Invalid exit criteria");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.exitCriteria, "exitCriteria");

  let workstreamId: string | null = null;
  if (input.workstream) {
    const workstream = validateResearchWorkstream(input.workstream);
    if (workstream.programmeId !== programme.id) {
      throw Error("Workstream programme mismatch");
    }
    workstreamId = workstream.id;
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const milestone: ProgrammeMilestone = {
    schema: SCIENTIFIC_PROGRAMME_SCHEMA,
    method: SCIENTIFIC_PROGRAMME_METHOD,
    version: SCIENTIFIC_PROGRAMME_VERSION,
    id: input.id,
    programmeId: programme.id,
    workstreamId,
    name: input.name.trim(),
    exitCriteria: input.exitCriteria.trim(),
    evidenceRequired: true,
    notAutoComplete: true,
    lifecycle: "planned",
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
  return validateProgrammeMilestone(milestone);
}

export function validateProgrammeMilestone(
  milestone: ProgrammeMilestone,
): ProgrammeMilestone {
  if (milestone.schema !== SCIENTIFIC_PROGRAMME_SCHEMA) {
    throw Error("Invalid milestone schema");
  }
  if (!MILESTONE_ID_RE.test(milestone.id)) throw Error("Invalid milestone id");
  if (!PROGRAMME_ID_RE.test(milestone.programmeId)) {
    throw Error("Invalid milestone programmeId");
  }
  if (
    milestone.workstreamId !== null &&
    !WORKSTREAM_ID_RE.test(milestone.workstreamId)
  ) {
    throw Error("Invalid milestone workstreamId");
  }
  assertClosed(
    milestone.lifecycle,
    PROGRAMME_MILESTONE_LIFECYCLES,
    "milestone lifecycle",
  );
  assertClosed(milestone.dataBasis, DATA_BASES, "data basis");
  assertHonesty(milestone.honesty);
  if (milestone.evidenceRequired !== true) {
    throw Error("Milestone evidenceRequired must stay true");
  }
  if (milestone.notAutoComplete !== true) {
    throw Error("Milestone must not auto-complete");
  }
  assertActor(milestone.authoredBy, "author");
  if (milestone.reviewedBy !== null) {
    const reviewer = assertActor(milestone.reviewedBy, "reviewer");
    if (reviewer.actorKind !== "human") {
      throw Error("Only human researchers may review milestones");
    }
  }
  if (
    !isIsoTimestamp(milestone.createdAt) ||
    !isIsoTimestamp(milestone.updatedAt)
  ) {
    throw Error("Invalid milestone timestamps");
  }
  return milestone;
}

export function transitionProgrammeMilestone(input: {
  milestone: ProgrammeMilestone;
  to: ProgrammeMilestoneLifecycle;
  updatedAt: string;
  actor: ScientificProgrammeActor;
}): ProgrammeMilestone {
  const current = validateProgrammeMilestone(input.milestone);
  assertClosed(input.to, PROGRAMME_MILESTONE_LIFECYCLES, "milestone lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = MILESTONE_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal milestone transition ${current.lifecycle} → ${input.to}`,
    );
  }
  if (
    (input.to === "accepted" || input.to === "rejected") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may accept or reject milestones");
  }
  return validateProgrammeMilestone({
    ...current,
    lifecycle: input.to,
    reviewedBy:
      input.to === "accepted" || input.to === "rejected"
        ? actor
        : current.reviewedBy,
    updatedAt: input.updatedAt,
  });
}

export function draftResearchDecision(input: {
  id: string;
  programme: ResearchProgramme;
  decisionKind: ResearchDecisionKind;
  summary: string;
  rationale: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: ScientificProgrammeActorKind;
  createdAt: string;
  workstream?: ResearchWorkstream | null;
  milestone?: ProgrammeMilestone | null;
  subjectRefs?: readonly string[];
  proposingAgentPrincipalId?: string | null;
  dataBasis?: ScientificProgrammeDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ResearchDecision {
  const programme = validateResearchProgramme(input.programme);
  if (!DECISION_ID_RE.test(input.id)) throw Error("Invalid decision id");
  assertClosed(input.decisionKind, RESEARCH_DECISION_KINDS, "decision kind");
  if (!textOk(input.summary, 2000)) throw Error("Invalid decision summary");
  if (!textOk(input.rationale, 4000)) throw Error("Invalid decision rationale");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  assertNoForbiddenClaimLanguage(input.summary, "decision summary");
  assertNoForbiddenClaimLanguage(input.rationale, "decision rationale");

  let workstreamId: string | null = null;
  if (input.workstream) {
    const workstream = validateResearchWorkstream(input.workstream);
    if (workstream.programmeId !== programme.id) {
      throw Error("Workstream programme mismatch");
    }
    workstreamId = workstream.id;
  }

  let milestoneId: string | null = null;
  if (input.milestone) {
    const milestone = validateProgrammeMilestone(input.milestone);
    if (milestone.programmeId !== programme.id) {
      throw Error("Milestone programme mismatch");
    }
    milestoneId = milestone.id;
  }

  const actorKind = input.authoredByActorKind ?? "ai_agent";
  const proposingAgentPrincipalId =
    input.proposingAgentPrincipalId === undefined
      ? actorKind === "ai_agent"
        ? input.authoredByPrincipalId
        : null
      : input.proposingAgentPrincipalId;
  if (
    proposingAgentPrincipalId !== null &&
    !PRINCIPAL_RE.test(proposingAgentPrincipalId)
  ) {
    throw Error("Invalid proposingAgentPrincipalId");
  }

  const dataBasis = input.dataBasis ?? programme.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const decision: ResearchDecision = {
    schema: SCIENTIFIC_PROGRAMME_SCHEMA,
    method: SCIENTIFIC_PROGRAMME_METHOD,
    version: SCIENTIFIC_PROGRAMME_VERSION,
    id: input.id,
    programmeId: programme.id,
    workstreamId,
    milestoneId,
    decisionKind: input.decisionKind,
    summary: input.summary.trim(),
    rationale: input.rationale.trim(),
    subjectRefs: assertRefList(input.subjectRefs ?? [], "subject"),
    proposingAgentPrincipalId,
    lifecycle: "draft",
    decidedBy: null,
    independentReviewer: null,
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
  return validateResearchDecision(decision);
}

export function validateResearchDecision(
  decision: ResearchDecision,
): ResearchDecision {
  if (decision.schema !== SCIENTIFIC_PROGRAMME_SCHEMA) {
    throw Error("Invalid decision schema");
  }
  if (!DECISION_ID_RE.test(decision.id)) throw Error("Invalid decision id");
  if (!PROGRAMME_ID_RE.test(decision.programmeId)) {
    throw Error("Invalid decision programmeId");
  }
  assertClosed(
    decision.lifecycle,
    RESEARCH_DECISION_LIFECYCLES,
    "decision lifecycle",
  );
  assertClosed(decision.decisionKind, RESEARCH_DECISION_KINDS, "decision kind");
  assertClosed(decision.dataBasis, DATA_BASES, "data basis");
  assertHonesty(decision.honesty);
  assertActor(decision.authoredBy, "author");
  if (decision.decidedBy !== null) {
    const decidedBy = assertActor(decision.decidedBy, "decidedBy");
    if (decidedBy.actorKind !== "human") {
      throw Error("Only human researchers may decide");
    }
  }
  if (decision.independentReviewer !== null) {
    const reviewer = assertActor(
      decision.independentReviewer,
      "independent reviewer",
    );
    if (reviewer.actorKind !== "human") {
      throw Error("Independent reviewer must be human");
    }
    if (
      decision.proposingAgentPrincipalId !== null &&
      reviewer.principalId === decision.proposingAgentPrincipalId
    ) {
      throw Error("Independent reviewer must differ from proposing agent");
    }
    if (reviewer.principalId === decision.authoredBy.principalId) {
      throw Error("Independent reviewer must differ from decision author");
    }
  }
  assertRefList(decision.subjectRefs, "subject");
  if (
    !isIsoTimestamp(decision.createdAt) ||
    !isIsoTimestamp(decision.updatedAt)
  ) {
    throw Error("Invalid decision timestamps");
  }
  return decision;
}

export function transitionResearchDecision(input: {
  decision: ResearchDecision;
  to: ResearchDecisionLifecycle;
  updatedAt: string;
  actor: ScientificProgrammeActor;
  independentReviewer?: ScientificProgrammeActor | null;
}): ResearchDecision {
  const current = validateResearchDecision(input.decision);
  assertClosed(input.to, RESEARCH_DECISION_LIFECYCLES, "decision lifecycle");
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  const allowed = DECISION_TRANSITIONS[current.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal decision transition ${current.lifecycle} → ${input.to}`,
    );
  }

  if (input.to === "accepted" || input.to === "rejected") {
    if (actor.actorKind !== "human") {
      throw Error("Only human researchers may accept or reject decisions");
    }
    if (
      current.proposingAgentPrincipalId !== null &&
      actor.principalId === current.proposingAgentPrincipalId
    ) {
      throw Error("Agents must not approve their own findings");
    }
    if (actor.principalId === current.authoredBy.principalId) {
      throw Error("Decision author must not self-approve");
    }
  }

  let independentReviewer = current.independentReviewer;
  if (input.independentReviewer !== undefined) {
    if (input.independentReviewer === null) {
      independentReviewer = null;
    } else {
      independentReviewer = assertActor(
        input.independentReviewer,
        "independent reviewer",
      );
      if (independentReviewer.actorKind !== "human") {
        throw Error("Independent reviewer must be human");
      }
      if (
        current.proposingAgentPrincipalId !== null &&
        independentReviewer.principalId === current.proposingAgentPrincipalId
      ) {
        throw Error("Independent reviewer must differ from proposing agent");
      }
      if (independentReviewer.principalId === current.authoredBy.principalId) {
        throw Error("Independent reviewer must differ from decision author");
      }
      if (independentReviewer.principalId === actor.principalId) {
        throw Error(
          "Independent reviewer must differ from deciding researcher",
        );
      }
    }
  }

  return validateResearchDecision({
    ...current,
    lifecycle: input.to,
    decidedBy:
      input.to === "accepted" || input.to === "rejected"
        ? actor
        : current.decidedBy,
    independentReviewer,
    updatedAt: input.updatedAt,
  });
}

export function createMemoryScientificProgrammeStore(): ScientificProgrammeStore & {
  programmes: Map<string, ResearchProgramme>;
  workstreams: Map<string, ResearchWorkstream>;
  milestones: Map<string, ProgrammeMilestone>;
  decisions: Map<string, ResearchDecision>;
} {
  const programmes = new Map<string, ResearchProgramme>();
  const workstreams = new Map<string, ResearchWorkstream>();
  const milestones = new Map<string, ProgrammeMilestone>();
  const decisions = new Map<string, ResearchDecision>();

  return {
    programmes,
    workstreams,
    milestones,
    decisions,
    upsertProgramme(programme) {
      const validated = validateResearchProgramme(programme);
      programmes.set(validated.id, validated);
      return validated;
    },
    getProgramme(id) {
      return programmes.get(id) ?? null;
    },
    listProgrammes() {
      return [...programmes.values()];
    },
    upsertWorkstream(workstream) {
      const validated = validateResearchWorkstream(workstream);
      workstreams.set(validated.id, validated);
      return validated;
    },
    getWorkstream(id) {
      return workstreams.get(id) ?? null;
    },
    listWorkstreams(programmeId) {
      const all = [...workstreams.values()];
      return programmeId
        ? all.filter((w) => w.programmeId === programmeId)
        : all;
    },
    upsertMilestone(milestone) {
      const validated = validateProgrammeMilestone(milestone);
      milestones.set(validated.id, validated);
      return validated;
    },
    getMilestone(id) {
      return milestones.get(id) ?? null;
    },
    listMilestones(programmeId) {
      const all = [...milestones.values()];
      return programmeId
        ? all.filter((m) => m.programmeId === programmeId)
        : all;
    },
    upsertDecision(decision) {
      const validated = validateResearchDecision(decision);
      decisions.set(validated.id, validated);
      return validated;
    },
    getDecision(id) {
      return decisions.get(id) ?? null;
    },
    listDecisions(programmeId) {
      const all = [...decisions.values()];
      return programmeId
        ? all.filter((d) => d.programmeId === programmeId)
        : all;
    },
  };
}

export function projectScientificProgrammePersistenceLines(input: {
  programme: ResearchProgramme;
  workstreams?: readonly ResearchWorkstream[];
  milestones?: readonly ProgrammeMilestone[];
  decisions?: readonly ResearchDecision[];
}): string[] {
  const programme = validateResearchProgramme(input.programme);
  const workstreams = (input.workstreams ?? []).map(validateResearchWorkstream);
  const milestones = (input.milestones ?? []).map(validateProgrammeMilestone);
  const decisions = (input.decisions ?? []).map(validateResearchDecision);
  return [
    `schema=${programme.schema}`,
    `method=${programme.method}`,
    `version=${programme.version}`,
    `programmeId=${programme.id}`,
    `lifecycle=${programme.lifecycle}`,
    `authorisationClass=${programme.authorisationClass}`,
    `resourceClass=${programme.resourceClass}`,
    `dataPermissionClass=${programme.dataPermissionClass}`,
    `investigationCount=${programme.investigationIds.length}`,
    `hypothesisCount=${programme.hypothesisIds.length}`,
    `orgId=${programme.orgId ?? "none"}`,
    `therapeuticProgrammeId=${programme.therapeuticProgrammeId ?? "none"}`,
    `translationalProgrammeId=${programme.translationalProgrammeId ?? "none"}`,
    `workstreams=${workstreams.length}`,
    `milestones=${milestones.length}`,
    `decisions=${decisions.length}`,
    `notSeparateAgentPlatform=true`,
    `noAutoApproval=true`,
    `noFabricatedDiscoveries=true`,
    `agentsMustNotApproveOwnFindings=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
}

export function fingerprintResearchProgramme(
  programme: ResearchProgramme,
): string {
  const validated = validateResearchProgramme(programme);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildScientificProgrammePack(input: {
  programmes: readonly ResearchProgramme[];
  workstreams: readonly ResearchWorkstream[];
  milestones: readonly ProgrammeMilestone[];
  decisions: readonly ResearchDecision[];
  asOf: string;
}): {
  schema: typeof SCIENTIFIC_PROGRAMME_SCHEMA;
  method: typeof SCIENTIFIC_PROGRAMME_METHOD;
  version: typeof SCIENTIFIC_PROGRAMME_VERSION;
  asOf: string;
  programmeCount: number;
  workstreamCount: number;
  milestoneCount: number;
  decisionCount: number;
  honesty: ScientificProgrammeHonesty;
  programmes: readonly ResearchProgramme[];
  workstreams: readonly ResearchWorkstream[];
  milestones: readonly ProgrammeMilestone[];
  decisions: readonly ResearchDecision[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const programmes = input.programmes.map(validateResearchProgramme);
  const workstreams = input.workstreams.map(validateResearchWorkstream);
  const milestones = input.milestones.map(validateProgrammeMilestone);
  const decisions = input.decisions.map(validateResearchDecision);
  return {
    schema: SCIENTIFIC_PROGRAMME_SCHEMA,
    method: SCIENTIFIC_PROGRAMME_METHOD,
    version: SCIENTIFIC_PROGRAMME_VERSION,
    asOf: input.asOf,
    programmeCount: programmes.length,
    workstreamCount: workstreams.length,
    milestoneCount: milestones.length,
    decisionCount: decisions.length,
    honesty: {...DEFAULT_HONESTY},
    programmes,
    workstreams,
    milestones,
    decisions,
  };
}
