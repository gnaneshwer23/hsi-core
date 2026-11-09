/**
 * Milestone 17 / PR4 — Scientific Knowledge Evolution.
 *
 * Living biomedical knowledge-graph evolution contracts that extend PR3
 * continuous evidence investigation with knowledge-state envelopes, a
 * twelve-step evolution workflow, proposed-change envelopes, independent
 * scientific review requests, prior-version preservation, programme-member
 * notifications, and an append-only / tamper-evident audit trail.
 *
 * Does NOT let agents overwrite approved scientific claims, auto-promote
 * into the curated KG, invent Gate C auto-approve / MoU, ship workbench UI,
 * fabricate discoveries, wire PHI/CDS, introduce Neon migrations, or claim
 * research-gap / hypothesis-portfolio engines (PR5).
 *
 * Binding honesty:
 * - Agents investigate / propose; researchers approve; independent reviewers verify.
 * - Agents must not overwrite approved scientific claims.
 * - Audit is append-only / tamper-evident; rejected and superseded are retained.
 * - Source corrections are distinct from reinterpretations.
 * - Evolution envelopes stay non-graph-promotable until a human Gate C path exists.
 * - Persistence: validated contracts + thin in-memory store; Neon deferred.
 * - Depends on PR3 (#136) / PR2 (#134) / PR1 (#131) and ARCH-002 — stack or merge first.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA =
  "hsi-scientific-knowledge-evolution-1" as const;
export const SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD =
  "hsi.scientific_knowledge_evolution.v1" as const;
export const SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION = "0.1.0" as const;

/** Closed knowledge states for living biomedical graph evolution. */
export const KNOWLEDGE_STATES = [
  "retrieved_evidence",
  "extracted_candidate_claim",
  "verified_source",
  "reviewed_scientific_claim",
  "approved_graph_assertion",
  "disputed_assertion",
  "superseded_assertion",
  "retracted_or_invalidated_evidence",
  "unvalidated_hypothesis",
] as const;
export type KnowledgeState = (typeof KNOWLEDGE_STATES)[number];

/** Twelve-step scientific knowledge evolution workflow. */
export const EVOLUTION_WORKFLOW_STEPS = [
  "detect_new_or_changed_evidence",
  "resolve_source_identity",
  "identify_relevant_graph_entities",
  "compare_against_existing_assertions",
  "detect_agreement_disagreement",
  "evaluate_biological_context",
  "generate_proposed_changes",
  "identify_downstream_affected_investigations",
  "request_independent_scientific_review",
  "apply_approved_changes",
  "preserve_prior_graph_versions",
  "notify_authorised_programme_members",
] as const;
export type EvolutionWorkflowStepKind =
  (typeof EVOLUTION_WORKFLOW_STEPS)[number];

export const EPISODE_LIFECYCLES = [
  "draft",
  "in_progress",
  "awaiting_independent_review",
  "approved_pending_apply",
  "applied_fixture",
  "rejected_retained",
  "superseded_retained",
  "cancelled",
] as const;
export type EpisodeLifecycle = (typeof EPISODE_LIFECYCLES)[number];

export const PROPOSED_CHANGE_KINDS = [
  "source_correction",
  "reinterpretation",
  "new_assertion_candidate",
  "dispute_mark",
  "supersession",
  "retraction_invalidation",
  "hypothesis_record",
] as const;
export type ProposedChangeKind = (typeof PROPOSED_CHANGE_KINDS)[number];

export const AGREEMENT_DISAGREEMENT_STATUSES = [
  "agreement_candidate",
  "disagreement_candidate",
  "partial_overlap",
  "insufficient_comparability",
  "not_assessed",
] as const;
export type AgreementDisagreementStatus =
  (typeof AGREEMENT_DISAGREEMENT_STATUSES)[number];

export const REVIEW_REQUEST_STATUSES = [
  "requested",
  "in_review",
  "accepted_human",
  "rejected_retained",
  "cancelled",
] as const;
export type ReviewRequestStatus = (typeof REVIEW_REQUEST_STATUSES)[number];

export const AUDIT_EVENT_KINDS = [
  "episode_opened",
  "knowledge_state_recorded",
  "knowledge_state_transitioned",
  "workflow_step_recorded",
  "proposed_change_generated",
  "independent_review_requested",
  "independent_review_decided",
  "approved_change_applied_fixture",
  "prior_graph_version_preserved",
  "programme_members_notified",
  "rejected_or_superseded_retained",
] as const;
export type AuditEventKind = (typeof AUDIT_EVENT_KINDS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type KnowledgeEvolutionActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "declared_research",
] as const;
export type KnowledgeEvolutionDataBasis = (typeof DATA_BASES)[number];

const EPISODE_ID_RE = /^hsi-sp-kev-[a-z0-9-]{3,80}$/;
const STATE_ID_RE = /^hsi-sp-kst-[a-z0-9-]{3,80}$/;
const CHANGE_ID_RE = /^hsi-sp-kch-[a-z0-9-]{3,80}$/;
const STEP_ID_RE = /^hsi-sp-kstp-[a-z0-9-]{3,80}$/;
const REVIEW_ID_RE = /^hsi-sp-krv-[a-z0-9-]{3,80}$/;
const VERSION_ID_RE = /^hsi-sp-kgv-[a-z0-9-]{3,80}$/;
const NOTIFY_ID_RE = /^hsi-sp-knt-[a-z0-9-]{3,80}$/;
const DOWNSTREAM_ID_RE = /^hsi-sp-kdi-[a-z0-9-]{3,80}$/;
const AUDIT_ID_RE = /^hsi-sp-kau-[a-z0-9-]{3,80}$/;
const PROGRAMME_ID_RE = /^hsi-sp-prog-[a-z0-9-]{3,80}$/;
const EVIDENCE_ID_RE = /^hsi-sp-evid-[a-z0-9-]{3,80}$/;
const CHANGE_CEI_ID_RE = /^hsi-sp-chg-[a-z0-9-]{3,80}$/;
const WORKSTREAM_ID_RE = /^hsi-sp-ws-[a-z0-9-]{3,80}$/;
const INVESTIGATION_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@/-]{3,160}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ScientificKnowledgeEvolutionHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true;
  dependsOnPr2ResearchObjectivePlanning: true;
  dependsOnPr3ContinuousEvidenceInvestigation: true;
  extendsArch002LivingKnowledgeGraph: true;
  agentsMustNotOverwriteApprovedClaims: true;
  appendOnlyTamperEvidentAudit: true;
  retainRejectedAndSuperseded: true;
  sourceCorrectionsDistinctFromReinterpretations: true;
  notSeparateAgentPlatform: true;
  agentsInvestigateResearchersApprove: true;
  independentReviewerNotAuthoringAgent: true;
  noAutoApprovalOfPlansOrClaims: true;
  noFabricatedDiscoveries: true;
  noWorkbenchUi: true;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
  /** This PR implements knowledge-evolution proposal envelopes. */
  scientificKnowledgeEvolution: true;
  /** Research gap / hypothesis portfolio deferred to PR5. */
  researchGapHypothesisPortfolio: false;
};

export type KnowledgeEvolutionActor = {
  principalId: string;
  actorKind: KnowledgeEvolutionActorKind;
};

export type KnowledgeEvolutionEpisode = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  programmeId: string;
  topicLabel: string;
  lifecycle: EpisodeLifecycle;
  evidenceItemIds: readonly string[];
  ceiChangeIds: readonly string[];
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type KnowledgeStateRecord = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  state: KnowledgeState;
  subjectLabel: string;
  evidenceItemId: string | null;
  priorStateId: string | null;
  supersededByStateId: string | null;
  retainedAfterRejectOrSupersede: boolean;
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type EvolutionWorkflowStepRecord = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  step: EvolutionWorkflowStepKind;
  summary: string;
  relatedRefs: readonly string[];
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type ProposedKnowledgeChange = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  changeKind: ProposedChangeKind;
  /** Explicit separation: source corrections ≠ reinterpretations. */
  sourceCorrectionDistinctFromReinterpretation: true;
  summary: string;
  targetKnowledgeStateId: string | null;
  agreementStatus: AgreementDisagreementStatus;
  graphEntityRefs: readonly string[];
  notAutoApproved: true;
  graphPromotable: false;
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type DownstreamAffectedInvestigation = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  investigationRef: string;
  workstreamId: string | null;
  impactSummary: string;
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type IndependentScientificReviewRequest = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  proposedChangeIds: readonly string[];
  status: ReviewRequestStatus;
  requestedBy: KnowledgeEvolutionActor;
  independentReviewerPrincipalId: string | null;
  decidedBy: KnowledgeEvolutionActor | null;
  decidedAt: string | null;
  decisionRationale: string | null;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type GraphVersionPreserveRecord = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  priorVersionRef: string;
  preservedSnapshotRef: string;
  relatedKnowledgeStateIds: readonly string[];
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type ProgrammeMemberNotification = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  recipientPrincipalIds: readonly string[];
  message: string;
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type KnowledgeEvolutionAuditEvent = {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  id: string;
  episodeId: string;
  programmeId: string;
  eventKind: AuditEventKind;
  subjectRefs: readonly string[];
  summary: string;
  prevEventId: string | null;
  contentHash: string;
  chainHash: string;
  authoredBy: KnowledgeEvolutionActor;
  dataBasis: KnowledgeEvolutionDataBasis;
  fixtureHonesty: boolean;
  honesty: ScientificKnowledgeEvolutionHonesty;
  createdAt: string;
  note: string;
};

export type ScientificKnowledgeEvolutionStore = {
  upsertEpisode(episode: KnowledgeEvolutionEpisode): KnowledgeEvolutionEpisode;
  getEpisode(id: string): KnowledgeEvolutionEpisode | null;
  listEpisodes(programmeId?: string): readonly KnowledgeEvolutionEpisode[];
  upsertKnowledgeState(record: KnowledgeStateRecord): KnowledgeStateRecord;
  getKnowledgeState(id: string): KnowledgeStateRecord | null;
  listKnowledgeStates(programmeId?: string): readonly KnowledgeStateRecord[];
  upsertWorkflowStep(
    step: EvolutionWorkflowStepRecord,
  ): EvolutionWorkflowStepRecord;
  listWorkflowSteps(episodeId?: string): readonly EvolutionWorkflowStepRecord[];
  upsertProposedChange(
    change: ProposedKnowledgeChange,
  ): ProposedKnowledgeChange;
  listProposedChanges(episodeId?: string): readonly ProposedKnowledgeChange[];
  upsertDownstream(
    record: DownstreamAffectedInvestigation,
  ): DownstreamAffectedInvestigation;
  listDownstream(
    episodeId?: string,
  ): readonly DownstreamAffectedInvestigation[];
  upsertReviewRequest(
    request: IndependentScientificReviewRequest,
  ): IndependentScientificReviewRequest;
  listReviewRequests(
    episodeId?: string,
  ): readonly IndependentScientificReviewRequest[];
  upsertGraphVersion(
    record: GraphVersionPreserveRecord,
  ): GraphVersionPreserveRecord;
  listGraphVersions(episodeId?: string): readonly GraphVersionPreserveRecord[];
  upsertNotification(
    notification: ProgrammeMemberNotification,
  ): ProgrammeMemberNotification;
  listNotifications(
    episodeId?: string,
  ): readonly ProgrammeMemberNotification[];
  /** Append-only: never overwrites an existing audit id. */
  appendAuditEvent(
    event: KnowledgeEvolutionAuditEvent,
  ): KnowledgeEvolutionAuditEvent;
  listAuditEvents(episodeId?: string): readonly KnowledgeEvolutionAuditEvent[];
};

const DEFAULT_HONESTY: ScientificKnowledgeEvolutionHonesty = {
  dependsOnPr1ScientificProgrammeContracts: true,
  dependsOnPr2ResearchObjectivePlanning: true,
  dependsOnPr3ContinuousEvidenceInvestigation: true,
  extendsArch002LivingKnowledgeGraph: true,
  agentsMustNotOverwriteApprovedClaims: true,
  appendOnlyTamperEvidentAudit: true,
  retainRejectedAndSuperseded: true,
  sourceCorrectionsDistinctFromReinterpretations: true,
  notSeparateAgentPlatform: true,
  agentsInvestigateResearchersApprove: true,
  independentReviewerNotAuthoringAgent: true,
  noAutoApprovalOfPlansOrClaims: true,
  noFabricatedDiscoveries: true,
  noWorkbenchUi: true,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
  scientificKnowledgeEvolution: true,
  researchGapHypothesisPortfolio: false,
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

function assertHonesty(honesty: ScientificKnowledgeEvolutionHonesty): void {
  if (honesty.dependsOnPr1ScientificProgrammeContracts !== true) {
    throw Error("Must depend on PR1 scientific programme contracts");
  }
  if (honesty.dependsOnPr2ResearchObjectivePlanning !== true) {
    throw Error("Must depend on PR2 research objective planning");
  }
  if (honesty.dependsOnPr3ContinuousEvidenceInvestigation !== true) {
    throw Error("Must depend on PR3 continuous evidence investigation");
  }
  if (honesty.extendsArch002LivingKnowledgeGraph !== true) {
    throw Error("Must extend ARCH-002 living knowledge graph ownership");
  }
  if (honesty.agentsMustNotOverwriteApprovedClaims !== true) {
    throw Error("Agents must not overwrite approved scientific claims");
  }
  if (honesty.appendOnlyTamperEvidentAudit !== true) {
    throw Error("Audit must be append-only / tamper-evident");
  }
  if (honesty.retainRejectedAndSuperseded !== true) {
    throw Error("Rejected and superseded records must be retained");
  }
  if (honesty.sourceCorrectionsDistinctFromReinterpretations !== true) {
    throw Error("Source corrections must stay distinct from reinterpretations");
  }
  if (honesty.notSeparateAgentPlatform !== true) {
    throw Error("Must not invent a separate agent platform");
  }
  if (honesty.agentsInvestigateResearchersApprove !== true) {
    throw Error("Agents investigate; researchers approve");
  }
  if (honesty.independentReviewerNotAuthoringAgent !== true) {
    throw Error("Independent reviewer must not be the authoring agent");
  }
  if (honesty.noAutoApprovalOfPlansOrClaims !== true) {
    throw Error("No auto-approval of plans or claims");
  }
  if (honesty.noFabricatedDiscoveries !== true) {
    throw Error("No fabricated discoveries");
  }
  if (honesty.noWorkbenchUi !== true) {
    throw Error("Workbench UI out of scope");
  }
  if (honesty.gateCAutoApprove !== false) {
    throw Error("Gate C auto-approve refused");
  }
  if (honesty.mouInvented !== false) {
    throw Error("MoU invention refused");
  }
  if (honesty.phiCdsWired !== false) {
    throw Error("PHI/CDS wiring refused");
  }
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false");
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
  if (honesty.scientificKnowledgeEvolution !== true) {
    throw Error("Scientific knowledge evolution must be enabled in PR4");
  }
  if (honesty.researchGapHypothesisPortfolio !== false) {
    throw Error("Research gap / hypothesis portfolio deferred to PR5");
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
      !/\b(no|not)\s+auto[- ]?approv/.test(lower)) ||
    /\bgate\s*c\s+auto/.test(lower) ||
    /\bagents?\s+may\s+approve\b/.test(lower) ||
    (/\bself[- ]?approv(e|ed|al)\b/.test(lower) &&
      !/\b(no|not|cannot|must\s+not)\s+self[- ]?approv/.test(lower) &&
      !/\bcannot\s+self[- ]?approv/.test(lower)) ||
    /\btreatment\s+recommendation\b/.test(lower) ||
    /\bdiagnos(e|is|ing)\s+the\s+patient\b/.test(lower) ||
    /\blive\s+multiscale\s+engine\b/.test(lower) ||
    (/\boverwrite\s+approved\b/.test(lower) &&
      !/\b(must\s+not|cannot|no)\s+overwrite\s+approved\b/.test(lower)) ||
    (/\bpromoted\s+to\s+(the\s+)?(curated\s+)?kg\b/.test(lower) &&
      !/\b(not|no|non-)[- ]?promot/.test(lower))
  ) {
    throw Error(
      `${label} must not invent discoveries, auto-approval, self-approval, approved-claim overwrite, KG promotion, PHI/CDS directives, or live multiscale claims`,
    );
  }
}

function assertActor(
  actor: KnowledgeEvolutionActor,
  label: string,
): KnowledgeEvolutionActor {
  if (!PRINCIPAL_RE.test(actor.principalId)) {
    throw Error(`Invalid ${label} principalId`);
  }
  assertClosed(actor.actorKind, ACTOR_KINDS, `${label} actorKind`);
  return {
    principalId: actor.principalId.trim(),
    actorKind: actor.actorKind,
  };
}

function validateRefList(
  refs: readonly string[],
  label: string,
  max = 32,
): readonly string[] {
  if (refs.length > max) throw Error(`${label} exceeds max ${max}`);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    if (!REF_ID_RE.test(ref)) throw Error(`Invalid ${label} ref`);
    if (seen.has(ref)) throw Error(`Duplicate ${label} ref`);
    seen.add(ref);
    out.push(ref);
  }
  return out;
}

function validateEvidenceIds(
  ids: readonly string[],
): readonly string[] {
  if (ids.length > 32) throw Error("evidenceItemIds exceeds max 32");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!EVIDENCE_ID_RE.test(id)) throw Error("Invalid evidenceItemId");
    if (seen.has(id)) throw Error("Duplicate evidenceItemId");
    seen.add(id);
    out.push(id);
  }
  return out;
}

function validateCeiChangeIds(ids: readonly string[]): readonly string[] {
  if (ids.length > 32) throw Error("ceiChangeIds exceeds max 32");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!CHANGE_CEI_ID_RE.test(id)) throw Error("Invalid ceiChangeId");
    if (seen.has(id)) throw Error("Duplicate ceiChangeId");
    seen.add(id);
    out.push(id);
  }
  return out;
}

function sha256Hex(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

export function validateKnowledgeEvolutionEpisode(
  episode: KnowledgeEvolutionEpisode,
): KnowledgeEvolutionEpisode {
  if (episode.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (episode.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (episode.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!EPISODE_ID_RE.test(episode.id)) throw Error("Invalid episode id");
  if (!PROGRAMME_ID_RE.test(episode.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!textOk(episode.topicLabel, 200)) throw Error("Invalid topicLabel");
  assertNoForbiddenClaimLanguage(episode.topicLabel, "topicLabel");
  assertClosed(episode.lifecycle, EPISODE_LIFECYCLES, "episode lifecycle");
  const evidenceItemIds = validateEvidenceIds(episode.evidenceItemIds);
  const ceiChangeIds = validateCeiChangeIds(episode.ceiChangeIds);
  const authoredBy = assertActor(episode.authoredBy, "episode author");
  assertClosed(episode.dataBasis, DATA_BASES, "dataBasis");
  if (episode.fixtureHonesty !== true && episode.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(episode.honesty);
  if (!isIsoTimestamp(episode.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(episode.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(episode.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(episode.note, "episode note");
  return {
    ...episode,
    topicLabel: episode.topicLabel.trim(),
    evidenceItemIds,
    ceiChangeIds,
    authoredBy,
    note: episode.note.trim(),
  };
}

export function openKnowledgeEvolutionEpisode(input: {
  id: string;
  programmeId: string;
  topicLabel: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  evidenceItemIds?: readonly string[];
  ceiChangeIds?: readonly string[];
  dataBasis?: KnowledgeEvolutionDataBasis;
  note?: string;
}): KnowledgeEvolutionEpisode {
  return validateKnowledgeEvolutionEpisode({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    programmeId: input.programmeId,
    topicLabel: input.topicLabel,
    lifecycle: "draft",
    evidenceItemIds: input.evidenceItemIds ?? [],
    ceiChangeIds: input.ceiChangeIds ?? [],
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.dataBasis ?? "fixture_engineering",
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Knowledge-evolution episode opened for fixture review — non-graph-promotable.",
  });
}

export function advanceKnowledgeEvolutionEpisode(input: {
  episode: KnowledgeEvolutionEpisode;
  lifecycle: EpisodeLifecycle;
  updatedAt: string;
  actor: KnowledgeEvolutionActor;
}): KnowledgeEvolutionEpisode {
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "episode advance actor");
  assertClosed(input.lifecycle, EPISODE_LIFECYCLES, "episode lifecycle");
  if (
    (input.lifecycle === "approved_pending_apply" ||
      input.lifecycle === "applied_fixture") &&
    actor.actorKind !== "human"
  ) {
    throw Error("Only human researchers may advance to approved/applied lifecycles");
  }
  return validateKnowledgeEvolutionEpisode({
    ...input.episode,
    lifecycle: input.lifecycle,
    updatedAt: input.updatedAt,
  });
}

export function validateKnowledgeStateRecord(
  record: KnowledgeStateRecord,
): KnowledgeStateRecord {
  if (record.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (record.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (record.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!STATE_ID_RE.test(record.id)) throw Error("Invalid knowledge state id");
  if (!EPISODE_ID_RE.test(record.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(record.programmeId)) {
    throw Error("Invalid programmeId");
  }
  assertClosed(record.state, KNOWLEDGE_STATES, "knowledge state");
  if (!textOk(record.subjectLabel, 300)) throw Error("Invalid subjectLabel");
  assertNoForbiddenClaimLanguage(record.subjectLabel, "subjectLabel");
  if (
    record.evidenceItemId !== null &&
    !EVIDENCE_ID_RE.test(record.evidenceItemId)
  ) {
    throw Error("Invalid evidenceItemId");
  }
  if (record.priorStateId !== null && !STATE_ID_RE.test(record.priorStateId)) {
    throw Error("Invalid priorStateId");
  }
  if (
    record.supersededByStateId !== null &&
    !STATE_ID_RE.test(record.supersededByStateId)
  ) {
    throw Error("Invalid supersededByStateId");
  }
  if (
    record.retainedAfterRejectOrSupersede !== true &&
    record.retainedAfterRejectOrSupersede !== false
  ) {
    throw Error("Invalid retainedAfterRejectOrSupersede");
  }
  if (
    (record.state === "superseded_assertion" ||
      record.state === "retracted_or_invalidated_evidence" ||
      record.state === "disputed_assertion") &&
    record.retainedAfterRejectOrSupersede !== true
  ) {
    throw Error("Rejected, disputed, superseded, or retracted states must be retained");
  }
  const authoredBy = assertActor(record.authoredBy, "knowledge state author");
  assertClosed(record.dataBasis, DATA_BASES, "dataBasis");
  if (record.fixtureHonesty !== true && record.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(record.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(record.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(record.note, "knowledge state note");
  return {
    ...record,
    subjectLabel: record.subjectLabel.trim(),
    authoredBy,
    note: record.note.trim(),
  };
}

export function recordKnowledgeState(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  state: KnowledgeState;
  subjectLabel: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  evidenceItemId?: string | null;
  priorStateId?: string | null;
  note?: string;
}): KnowledgeStateRecord {
  const retain =
    input.state === "superseded_assertion" ||
    input.state === "retracted_or_invalidated_evidence" ||
    input.state === "disputed_assertion";
  return validateKnowledgeStateRecord({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    state: input.state,
    subjectLabel: input.subjectLabel,
    evidenceItemId: input.evidenceItemId ?? null,
    priorStateId: input.priorStateId ?? null,
    supersededByStateId: null,
    retainedAfterRejectOrSupersede: retain,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Knowledge state recorded for fixture evolution — not curated KG promotion.",
  });
}

/**
 * Transition a knowledge state. Agents must not overwrite approved graph assertions.
 * Supersession / dispute / retraction append successor records and retain priors.
 */
export function transitionKnowledgeState(input: {
  prior: KnowledgeStateRecord;
  nextId: string;
  nextState: KnowledgeState;
  subjectLabel: string;
  actor: KnowledgeEvolutionActor;
  updatedAt: string;
  note?: string;
}): {prior: KnowledgeStateRecord; next: KnowledgeStateRecord} {
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  const actor = assertActor(input.actor, "transition actor");
  if (
    input.prior.state === "approved_graph_assertion" &&
    actor.actorKind === "ai_agent"
  ) {
    throw Error(
      "Agents must not overwrite approved scientific claims — propose reviewable changes instead",
    );
  }
  if (
    input.prior.state === "approved_graph_assertion" &&
    input.nextState !== "disputed_assertion" &&
    input.nextState !== "superseded_assertion" &&
    input.nextState !== "retracted_or_invalidated_evidence" &&
    actor.actorKind === "human"
  ) {
    // Humans may dispute / supersede / retract approved assertions; silent overwrite refused.
    throw Error(
      "Approved graph assertions may only move to disputed, superseded, or retracted/invalidated",
    );
  }

  const next = validateKnowledgeStateRecord({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.nextId,
    episodeId: input.prior.episodeId,
    programmeId: input.prior.programmeId,
    state: input.nextState,
    subjectLabel: input.subjectLabel,
    evidenceItemId: input.prior.evidenceItemId,
    priorStateId: input.prior.id,
    supersededByStateId: null,
    retainedAfterRejectOrSupersede:
      input.nextState === "superseded_assertion" ||
      input.nextState === "retracted_or_invalidated_evidence" ||
      input.nextState === "disputed_assertion",
    authoredBy: actor,
    dataBasis: input.prior.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.updatedAt,
    updatedAt: input.updatedAt,
    note:
      input.note ??
      "Knowledge state transition recorded — prior retained; not curated KG overwrite.",
  });

  const prior = validateKnowledgeStateRecord({
    ...input.prior,
    supersededByStateId:
      input.nextState === "superseded_assertion" ||
      input.nextState === "retracted_or_invalidated_evidence"
        ? next.id
        : input.prior.supersededByStateId,
    retainedAfterRejectOrSupersede: true,
    updatedAt: input.updatedAt,
  });

  return {prior, next};
}

export function validateEvolutionWorkflowStepRecord(
  step: EvolutionWorkflowStepRecord,
): EvolutionWorkflowStepRecord {
  if (step.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (step.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (step.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!STEP_ID_RE.test(step.id)) throw Error("Invalid workflow step id");
  if (!EPISODE_ID_RE.test(step.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(step.programmeId)) {
    throw Error("Invalid programmeId");
  }
  assertClosed(step.step, EVOLUTION_WORKFLOW_STEPS, "workflow step");
  if (!textOk(step.summary, 500)) throw Error("Invalid workflow summary");
  assertNoForbiddenClaimLanguage(step.summary, "workflow summary");
  const relatedRefs = validateRefList(step.relatedRefs, "workflow relatedRefs");
  const authoredBy = assertActor(step.authoredBy, "workflow step author");
  if (
    (step.step === "apply_approved_changes" ||
      step.step === "request_independent_scientific_review") &&
    step.step === "apply_approved_changes" &&
    authoredBy.actorKind !== "human"
  ) {
    throw Error("Only human researchers may record apply_approved_changes");
  }
  assertClosed(step.dataBasis, DATA_BASES, "dataBasis");
  if (step.fixtureHonesty !== true && step.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(step.honesty);
  if (!isIsoTimestamp(step.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(step.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(step.note, "workflow step note");
  return {
    ...step,
    summary: step.summary.trim(),
    relatedRefs,
    authoredBy,
    note: step.note.trim(),
  };
}

export function recordEvolutionWorkflowStep(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  step: EvolutionWorkflowStepKind;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  relatedRefs?: readonly string[];
  note?: string;
}): EvolutionWorkflowStepRecord {
  return validateEvolutionWorkflowStepRecord({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    step: input.step,
    summary: input.summary,
    relatedRefs: input.relatedRefs ?? [],
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Evolution workflow step recorded — agents propose; humans approve.",
  });
}

export function validateProposedKnowledgeChange(
  change: ProposedKnowledgeChange,
): ProposedKnowledgeChange {
  if (change.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (change.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (change.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!CHANGE_ID_RE.test(change.id)) throw Error("Invalid proposed change id");
  if (!EPISODE_ID_RE.test(change.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(change.programmeId)) {
    throw Error("Invalid programmeId");
  }
  assertClosed(change.changeKind, PROPOSED_CHANGE_KINDS, "changeKind");
  if (change.sourceCorrectionDistinctFromReinterpretation !== true) {
    throw Error("Source corrections must stay distinct from reinterpretations");
  }
  const noteLower = change.note.toLowerCase();
  if (
    change.changeKind === "source_correction" &&
    (/\bthis\s+is\s+a\s+reinterpretation\b/.test(noteLower) ||
      /\blabelled\s+as\s+reinterpretation\b/.test(noteLower) ||
      /\bas\s+reinterpretation\b/.test(noteLower))
  ) {
    throw Error("Source correction must not be labelled as reinterpretation");
  }
  if (
    change.changeKind === "reinterpretation" &&
    (/\bthis\s+is\s+a\s+source\s+correction\b/.test(noteLower) ||
      /\blabelled\s+as\s+source\s+correction\b/.test(noteLower) ||
      /\bas\s+source\s+correction\b/.test(noteLower))
  ) {
    throw Error("Reinterpretation must not be labelled as source correction");
  }
  if (!textOk(change.summary, 500)) throw Error("Invalid change summary");
  assertNoForbiddenClaimLanguage(change.summary, "change summary");
  if (
    change.targetKnowledgeStateId !== null &&
    !STATE_ID_RE.test(change.targetKnowledgeStateId)
  ) {
    throw Error("Invalid targetKnowledgeStateId");
  }
  assertClosed(
    change.agreementStatus,
    AGREEMENT_DISAGREEMENT_STATUSES,
    "agreementStatus",
  );
  const graphEntityRefs = validateRefList(
    change.graphEntityRefs,
    "graphEntityRefs",
  );
  if (change.notAutoApproved !== true) {
    throw Error("Proposed changes must not be auto-approved");
  }
  if (change.graphPromotable !== false) {
    throw Error("Proposed changes must stay non-graph-promotable");
  }
  const authoredBy = assertActor(change.authoredBy, "proposed change author");
  assertClosed(change.dataBasis, DATA_BASES, "dataBasis");
  if (change.fixtureHonesty !== true && change.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(change.honesty);
  if (!isIsoTimestamp(change.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(change.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(change.note, "proposed change note");
  return {
    ...change,
    summary: change.summary.trim(),
    graphEntityRefs,
    authoredBy,
    note: change.note.trim(),
  };
}

export function generateProposedKnowledgeChange(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  changeKind: ProposedChangeKind;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  targetKnowledgeStateId?: string | null;
  agreementStatus?: AgreementDisagreementStatus;
  graphEntityRefs?: readonly string[];
  note?: string;
}): ProposedKnowledgeChange {
  const defaultNote =
    input.changeKind === "source_correction"
      ? "Source correction proposal — distinct from reinterpretation; not auto-approved."
      : input.changeKind === "reinterpretation"
        ? "Reinterpretation proposal — distinct from source correction; not auto-approved."
        : "Proposed knowledge change for independent scientific review — not auto-approved.";
  return validateProposedKnowledgeChange({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    changeKind: input.changeKind,
    sourceCorrectionDistinctFromReinterpretation: true,
    summary: input.summary,
    targetKnowledgeStateId: input.targetKnowledgeStateId ?? null,
    agreementStatus: input.agreementStatus ?? "not_assessed",
    graphEntityRefs: input.graphEntityRefs ?? [],
    notAutoApproved: true,
    graphPromotable: false,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note: input.note ?? defaultNote,
  });
}

export function validateDownstreamAffectedInvestigation(
  record: DownstreamAffectedInvestigation,
): DownstreamAffectedInvestigation {
  if (record.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (record.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (record.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!DOWNSTREAM_ID_RE.test(record.id)) {
    throw Error("Invalid downstream affected investigation id");
  }
  if (!EPISODE_ID_RE.test(record.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(record.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!INVESTIGATION_ID_RE.test(record.investigationRef)) {
    throw Error("Invalid investigationRef");
  }
  if (
    record.workstreamId !== null &&
    !WORKSTREAM_ID_RE.test(record.workstreamId)
  ) {
    throw Error("Invalid workstreamId");
  }
  if (!textOk(record.impactSummary, 500)) throw Error("Invalid impactSummary");
  assertNoForbiddenClaimLanguage(record.impactSummary, "impactSummary");
  const authoredBy = assertActor(record.authoredBy, "downstream author");
  assertClosed(record.dataBasis, DATA_BASES, "dataBasis");
  if (record.fixtureHonesty !== true && record.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(record.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(record.note, "downstream note");
  return {
    ...record,
    impactSummary: record.impactSummary.trim(),
    authoredBy,
    note: record.note.trim(),
  };
}

export function identifyDownstreamAffectedInvestigations(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  investigationRef: string;
  impactSummary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  workstreamId?: string | null;
  note?: string;
}): DownstreamAffectedInvestigation {
  return validateDownstreamAffectedInvestigation({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    investigationRef: input.investigationRef,
    workstreamId: input.workstreamId ?? null,
    impactSummary: input.impactSummary,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "ai_agent",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Downstream investigation impact advisory — not auto-approval.",
  });
}

export function validateIndependentScientificReviewRequest(
  request: IndependentScientificReviewRequest,
): IndependentScientificReviewRequest {
  if (request.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (request.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (request.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!REVIEW_ID_RE.test(request.id)) throw Error("Invalid review request id");
  if (!EPISODE_ID_RE.test(request.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(request.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (
    request.proposedChangeIds.length < 1 ||
    request.proposedChangeIds.length > 32
  ) {
    throw Error("proposedChangeIds must have 1–32 entries");
  }
  const seen = new Set<string>();
  for (const id of request.proposedChangeIds) {
    if (!CHANGE_ID_RE.test(id)) throw Error("Invalid proposedChangeId");
    if (seen.has(id)) throw Error("Duplicate proposedChangeId");
    seen.add(id);
  }
  assertClosed(request.status, REVIEW_REQUEST_STATUSES, "review status");
  const requestedBy = assertActor(request.requestedBy, "review requester");
  if (
    request.independentReviewerPrincipalId !== null &&
    !PRINCIPAL_RE.test(request.independentReviewerPrincipalId)
  ) {
    throw Error("Invalid independentReviewerPrincipalId");
  }
  if (
    request.independentReviewerPrincipalId !== null &&
    request.independentReviewerPrincipalId === requestedBy.principalId &&
    requestedBy.actorKind === "ai_agent"
  ) {
    throw Error("Independent reviewer must differ from the authoring agent");
  }
  const decidedBy =
    request.decidedBy === null
      ? null
      : assertActor(request.decidedBy, "review decider");
  if (
    (request.status === "accepted_human" ||
      request.status === "rejected_retained") &&
    (decidedBy === null || decidedBy.actorKind !== "human")
  ) {
    throw Error("Review accept/reject requires a human decider");
  }
  if (
    decidedBy !== null &&
    decidedBy.actorKind === "ai_agent" &&
    decidedBy.principalId === requestedBy.principalId
  ) {
    throw Error("Agents cannot approve their own findings");
  }
  if (request.decidedAt !== null && !isIsoTimestamp(request.decidedAt)) {
    throw Error("Invalid decidedAt");
  }
  if (
    request.decisionRationale !== null &&
    !textOk(request.decisionRationale, 1000)
  ) {
    throw Error("Invalid decisionRationale");
  }
  if (request.decisionRationale !== null) {
    assertNoForbiddenClaimLanguage(
      request.decisionRationale,
      "decisionRationale",
    );
  }
  assertClosed(request.dataBasis, DATA_BASES, "dataBasis");
  if (request.fixtureHonesty !== true && request.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(request.honesty);
  if (!isIsoTimestamp(request.createdAt)) throw Error("Invalid createdAt");
  if (!isIsoTimestamp(request.updatedAt)) throw Error("Invalid updatedAt");
  if (!textOk(request.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(request.note, "review request note");
  return {
    ...request,
    requestedBy,
    decidedBy,
    decisionRationale: request.decisionRationale?.trim() ?? null,
    note: request.note.trim(),
  };
}

export function requestIndependentScientificReview(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  proposedChangeIds: readonly string[];
  requestedByPrincipalId: string;
  requestedByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  independentReviewerPrincipalId?: string | null;
  note?: string;
}): IndependentScientificReviewRequest {
  return validateIndependentScientificReviewRequest({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    proposedChangeIds: input.proposedChangeIds,
    status: "requested",
    requestedBy: {
      principalId: input.requestedByPrincipalId,
      actorKind: input.requestedByActorKind ?? "ai_agent",
    },
    independentReviewerPrincipalId:
      input.independentReviewerPrincipalId ?? null,
    decidedBy: null,
    decidedAt: null,
    decisionRationale: null,
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note:
      input.note ??
      "Independent scientific review requested — agents cannot self-approve.",
  });
}

export function decideIndependentScientificReview(input: {
  request: IndependentScientificReviewRequest;
  status: "accepted_human" | "rejected_retained";
  decidedBy: KnowledgeEvolutionActor;
  decidedAt: string;
  decisionRationale: string;
  independentReviewerPrincipalId?: string;
}): IndependentScientificReviewRequest {
  const decidedBy = assertActor(input.decidedBy, "review decider");
  if (decidedBy.actorKind !== "human") {
    throw Error("Only human independent reviewers may decide review requests");
  }
  if (decidedBy.principalId === input.request.requestedBy.principalId) {
    throw Error("Independent reviewer must differ from the authoring agent");
  }
  return validateIndependentScientificReviewRequest({
    ...input.request,
    status: input.status,
    independentReviewerPrincipalId:
      input.independentReviewerPrincipalId ??
      input.request.independentReviewerPrincipalId ??
      decidedBy.principalId,
    decidedBy,
    decidedAt: input.decidedAt,
    decisionRationale: input.decisionRationale,
    updatedAt: input.decidedAt,
  });
}

/**
 * Apply an accepted proposed change in fixture mode.
 * Records engineering application only — still non-graph-promotable / Gate C denied.
 */
export function applyApprovedKnowledgeChange(input: {
  episode: KnowledgeEvolutionEpisode;
  review: IndependentScientificReviewRequest;
  stepId: string;
  appliedAt: string;
  actor: KnowledgeEvolutionActor;
  summary: string;
}): {
  episode: KnowledgeEvolutionEpisode;
  step: EvolutionWorkflowStepRecord;
} {
  const actor = assertActor(input.actor, "apply actor");
  if (actor.actorKind !== "human") {
    throw Error("Only human researchers may apply approved knowledge changes");
  }
  if (input.review.status !== "accepted_human") {
    throw Error("Only accepted independent reviews may be applied");
  }
  const episode = advanceKnowledgeEvolutionEpisode({
    episode: input.episode,
    lifecycle: "applied_fixture",
    updatedAt: input.appliedAt,
    actor,
  });
  const step = recordEvolutionWorkflowStep({
    id: input.stepId,
    episode,
    step: "apply_approved_changes",
    summary: input.summary,
    authoredByPrincipalId: actor.principalId,
    authoredByActorKind: "human",
    createdAt: input.appliedAt,
    relatedRefs: input.review.proposedChangeIds,
    note:
      "Approved change applied in fixture mode only — graphPromotable remains false; Gate C not invented.",
  });
  return {episode, step};
}

export function validateGraphVersionPreserveRecord(
  record: GraphVersionPreserveRecord,
): GraphVersionPreserveRecord {
  if (record.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (record.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (record.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!VERSION_ID_RE.test(record.id)) {
    throw Error("Invalid graph version preserve id");
  }
  if (!EPISODE_ID_RE.test(record.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(record.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (!REF_ID_RE.test(record.priorVersionRef)) {
    throw Error("Invalid priorVersionRef");
  }
  if (!REF_ID_RE.test(record.preservedSnapshotRef)) {
    throw Error("Invalid preservedSnapshotRef");
  }
  const relatedKnowledgeStateIds = validateRefList(
    record.relatedKnowledgeStateIds,
    "relatedKnowledgeStateIds",
  );
  for (const id of relatedKnowledgeStateIds) {
    if (!STATE_ID_RE.test(id)) {
      throw Error("Invalid relatedKnowledgeStateId");
    }
  }
  const authoredBy = assertActor(record.authoredBy, "version preserve author");
  assertClosed(record.dataBasis, DATA_BASES, "dataBasis");
  if (record.fixtureHonesty !== true && record.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(record.honesty);
  if (!isIsoTimestamp(record.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(record.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(record.note, "version preserve note");
  return {
    ...record,
    relatedKnowledgeStateIds,
    authoredBy,
    note: record.note.trim(),
  };
}

export function preservePriorGraphVersion(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  priorVersionRef: string;
  preservedSnapshotRef: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  relatedKnowledgeStateIds?: readonly string[];
  note?: string;
}): GraphVersionPreserveRecord {
  return validateGraphVersionPreserveRecord({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    priorVersionRef: input.priorVersionRef,
    preservedSnapshotRef: input.preservedSnapshotRef,
    relatedKnowledgeStateIds: input.relatedKnowledgeStateIds ?? [],
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Prior graph version preserved — rejected/superseded retained; no silent overwrite.",
  });
}

export function validateProgrammeMemberNotification(
  notification: ProgrammeMemberNotification,
): ProgrammeMemberNotification {
  if (notification.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (notification.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (notification.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!NOTIFY_ID_RE.test(notification.id)) {
    throw Error("Invalid programme member notification id");
  }
  if (!EPISODE_ID_RE.test(notification.episodeId)) {
    throw Error("Invalid episodeId");
  }
  if (!PROGRAMME_ID_RE.test(notification.programmeId)) {
    throw Error("Invalid programmeId");
  }
  if (
    notification.recipientPrincipalIds.length < 1 ||
    notification.recipientPrincipalIds.length > 32
  ) {
    throw Error("recipientPrincipalIds must have 1–32 entries");
  }
  const seen = new Set<string>();
  for (const id of notification.recipientPrincipalIds) {
    if (!PRINCIPAL_RE.test(id)) throw Error("Invalid recipientPrincipalId");
    if (seen.has(id)) throw Error("Duplicate recipientPrincipalId");
    seen.add(id);
  }
  if (!textOk(notification.message, 500)) throw Error("Invalid message");
  assertNoForbiddenClaimLanguage(notification.message, "notification message");
  const authoredBy = assertActor(
    notification.authoredBy,
    "notification author",
  );
  assertClosed(notification.dataBasis, DATA_BASES, "dataBasis");
  if (
    notification.fixtureHonesty !== true &&
    notification.fixtureHonesty !== false
  ) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(notification.honesty);
  if (!isIsoTimestamp(notification.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(notification.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(notification.note, "notification note");
  return {
    ...notification,
    message: notification.message.trim(),
    authoredBy,
    note: notification.note.trim(),
  };
}

export function notifyAuthorisedProgrammeMembers(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  recipientPrincipalIds: readonly string[];
  message: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  note?: string;
}): ProgrammeMemberNotification {
  return validateProgrammeMemberNotification({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    recipientPrincipalIds: input.recipientPrincipalIds,
    message: input.message,
    authoredBy: {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Authorised programme members notified — advisory only; not Gate C approval.",
  });
}

export function validateKnowledgeEvolutionAuditEvent(
  event: KnowledgeEvolutionAuditEvent,
): KnowledgeEvolutionAuditEvent {
  if (event.schema !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA) {
    throw Error("Unexpected SKE schema");
  }
  if (event.method !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD) {
    throw Error("Unexpected SKE method");
  }
  if (event.version !== SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION) {
    throw Error("Unexpected SKE version");
  }
  if (!AUDIT_ID_RE.test(event.id)) throw Error("Invalid audit event id");
  if (!EPISODE_ID_RE.test(event.episodeId)) throw Error("Invalid episodeId");
  if (!PROGRAMME_ID_RE.test(event.programmeId)) {
    throw Error("Invalid programmeId");
  }
  assertClosed(event.eventKind, AUDIT_EVENT_KINDS, "audit eventKind");
  const subjectRefs = validateRefList(event.subjectRefs, "audit subjectRefs");
  if (!textOk(event.summary, 500)) throw Error("Invalid audit summary");
  assertNoForbiddenClaimLanguage(event.summary, "audit summary");
  if (event.prevEventId !== null && !AUDIT_ID_RE.test(event.prevEventId)) {
    throw Error("Invalid prevEventId");
  }
  if (!/^[a-f0-9]{64}$/.test(event.contentHash)) {
    throw Error("Invalid contentHash");
  }
  if (!/^[a-f0-9]{64}$/.test(event.chainHash)) {
    throw Error("Invalid chainHash");
  }
  const authoredBy = assertActor(event.authoredBy, "audit author");
  assertClosed(event.dataBasis, DATA_BASES, "dataBasis");
  if (event.fixtureHonesty !== true && event.fixtureHonesty !== false) {
    throw Error("Invalid fixtureHonesty");
  }
  assertHonesty(event.honesty);
  if (!isIsoTimestamp(event.createdAt)) throw Error("Invalid createdAt");
  if (!textOk(event.note, 1000)) throw Error("Invalid note");
  assertNoForbiddenClaimLanguage(event.note, "audit note");
  return {
    ...event,
    summary: event.summary.trim(),
    subjectRefs,
    authoredBy,
    note: event.note.trim(),
  };
}

export function appendKnowledgeEvolutionAuditEvent(input: {
  id: string;
  episode: KnowledgeEvolutionEpisode;
  eventKind: AuditEventKind;
  summary: string;
  authoredByPrincipalId: string;
  authoredByActorKind?: KnowledgeEvolutionActorKind;
  createdAt: string;
  subjectRefs?: readonly string[];
  prevEvent?: KnowledgeEvolutionAuditEvent | null;
  note?: string;
}): KnowledgeEvolutionAuditEvent {
  const authoredBy = assertActor(
    {
      principalId: input.authoredByPrincipalId,
      actorKind: input.authoredByActorKind ?? "service",
    },
    "audit author",
  );
  const subjectRefs = input.subjectRefs ?? [];
  const contentHash = sha256Hex(
    canonicalEvidenceJson({
      id: input.id,
      episodeId: input.episode.id,
      programmeId: input.episode.programmeId,
      eventKind: input.eventKind,
      summary: input.summary.trim(),
      subjectRefs,
      prevEventId: input.prevEvent?.id ?? null,
      createdAt: input.createdAt,
      authoredBy,
    }),
  );
  const chainHash = sha256Hex(
    `${input.prevEvent?.chainHash ?? "genesis"}:${contentHash}`,
  );
  return validateKnowledgeEvolutionAuditEvent({
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    id: input.id,
    episodeId: input.episode.id,
    programmeId: input.episode.programmeId,
    eventKind: input.eventKind,
    subjectRefs,
    summary: input.summary,
    prevEventId: input.prevEvent?.id ?? null,
    contentHash,
    chainHash,
    authoredBy,
    dataBasis: input.episode.dataBasis,
    fixtureHonesty: true,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    note:
      input.note ??
      "Append-only tamper-evident audit event — prior events are never overwritten.",
  });
}

export function createMemoryScientificKnowledgeEvolutionStore(): ScientificKnowledgeEvolutionStore & {
  episodes: Map<string, KnowledgeEvolutionEpisode>;
  knowledgeStates: Map<string, KnowledgeStateRecord>;
  workflowSteps: Map<string, EvolutionWorkflowStepRecord>;
  proposedChanges: Map<string, ProposedKnowledgeChange>;
  downstream: Map<string, DownstreamAffectedInvestigation>;
  reviewRequests: Map<string, IndependentScientificReviewRequest>;
  graphVersions: Map<string, GraphVersionPreserveRecord>;
  notifications: Map<string, ProgrammeMemberNotification>;
  auditEvents: Map<string, KnowledgeEvolutionAuditEvent>;
} {
  const episodes = new Map<string, KnowledgeEvolutionEpisode>();
  const knowledgeStates = new Map<string, KnowledgeStateRecord>();
  const workflowSteps = new Map<string, EvolutionWorkflowStepRecord>();
  const proposedChanges = new Map<string, ProposedKnowledgeChange>();
  const downstream = new Map<string, DownstreamAffectedInvestigation>();
  const reviewRequests = new Map<string, IndependentScientificReviewRequest>();
  const graphVersions = new Map<string, GraphVersionPreserveRecord>();
  const notifications = new Map<string, ProgrammeMemberNotification>();
  const auditEvents = new Map<string, KnowledgeEvolutionAuditEvent>();

  return {
    episodes,
    knowledgeStates,
    workflowSteps,
    proposedChanges,
    downstream,
    reviewRequests,
    graphVersions,
    notifications,
    auditEvents,
    upsertEpisode(episode) {
      const validated = validateKnowledgeEvolutionEpisode(episode);
      episodes.set(validated.id, validated);
      return validated;
    },
    getEpisode(id) {
      return episodes.get(id) ?? null;
    },
    listEpisodes(programmeId) {
      const all = [...episodes.values()];
      return programmeId
        ? all.filter((e) => e.programmeId === programmeId)
        : all;
    },
    upsertKnowledgeState(record) {
      const validated = validateKnowledgeStateRecord(record);
      knowledgeStates.set(validated.id, validated);
      return validated;
    },
    getKnowledgeState(id) {
      return knowledgeStates.get(id) ?? null;
    },
    listKnowledgeStates(programmeId) {
      const all = [...knowledgeStates.values()];
      return programmeId
        ? all.filter((s) => s.programmeId === programmeId)
        : all;
    },
    upsertWorkflowStep(step) {
      const validated = validateEvolutionWorkflowStepRecord(step);
      workflowSteps.set(validated.id, validated);
      return validated;
    },
    listWorkflowSteps(episodeId) {
      const all = [...workflowSteps.values()];
      return episodeId ? all.filter((s) => s.episodeId === episodeId) : all;
    },
    upsertProposedChange(change) {
      const validated = validateProposedKnowledgeChange(change);
      proposedChanges.set(validated.id, validated);
      return validated;
    },
    listProposedChanges(episodeId) {
      const all = [...proposedChanges.values()];
      return episodeId ? all.filter((c) => c.episodeId === episodeId) : all;
    },
    upsertDownstream(record) {
      const validated = validateDownstreamAffectedInvestigation(record);
      downstream.set(validated.id, validated);
      return validated;
    },
    listDownstream(episodeId) {
      const all = [...downstream.values()];
      return episodeId ? all.filter((d) => d.episodeId === episodeId) : all;
    },
    upsertReviewRequest(request) {
      const validated = validateIndependentScientificReviewRequest(request);
      reviewRequests.set(validated.id, validated);
      return validated;
    },
    listReviewRequests(episodeId) {
      const all = [...reviewRequests.values()];
      return episodeId ? all.filter((r) => r.episodeId === episodeId) : all;
    },
    upsertGraphVersion(record) {
      const validated = validateGraphVersionPreserveRecord(record);
      graphVersions.set(validated.id, validated);
      return validated;
    },
    listGraphVersions(episodeId) {
      const all = [...graphVersions.values()];
      return episodeId ? all.filter((v) => v.episodeId === episodeId) : all;
    },
    upsertNotification(notification) {
      const validated = validateProgrammeMemberNotification(notification);
      notifications.set(validated.id, validated);
      return validated;
    },
    listNotifications(episodeId) {
      const all = [...notifications.values()];
      return episodeId ? all.filter((n) => n.episodeId === episodeId) : all;
    },
    appendAuditEvent(event) {
      const validated = validateKnowledgeEvolutionAuditEvent(event);
      if (auditEvents.has(validated.id)) {
        throw Error(
          "Append-only audit refused overwrite of existing audit event id",
        );
      }
      auditEvents.set(validated.id, validated);
      return validated;
    },
    listAuditEvents(episodeId) {
      const all = [...auditEvents.values()];
      return episodeId ? all.filter((e) => e.episodeId === episodeId) : all;
    },
  };
}

export function projectScientificKnowledgeEvolutionPersistenceLines(input: {
  episode: KnowledgeEvolutionEpisode;
  knowledgeStates?: readonly KnowledgeStateRecord[];
  workflowSteps?: readonly EvolutionWorkflowStepRecord[];
  proposedChanges?: readonly ProposedKnowledgeChange[];
  downstream?: readonly DownstreamAffectedInvestigation[];
  reviewRequests?: readonly IndependentScientificReviewRequest[];
  graphVersions?: readonly GraphVersionPreserveRecord[];
  notifications?: readonly ProgrammeMemberNotification[];
  auditEvents?: readonly KnowledgeEvolutionAuditEvent[];
}): string[] {
  const episode = validateKnowledgeEvolutionEpisode(input.episode);
  const knowledgeStates = (input.knowledgeStates ?? []).map(
    validateKnowledgeStateRecord,
  );
  const workflowSteps = (input.workflowSteps ?? []).map(
    validateEvolutionWorkflowStepRecord,
  );
  const proposedChanges = (input.proposedChanges ?? []).map(
    validateProposedKnowledgeChange,
  );
  const downstream = (input.downstream ?? []).map(
    validateDownstreamAffectedInvestigation,
  );
  const reviewRequests = (input.reviewRequests ?? []).map(
    validateIndependentScientificReviewRequest,
  );
  const graphVersions = (input.graphVersions ?? []).map(
    validateGraphVersionPreserveRecord,
  );
  const notifications = (input.notifications ?? []).map(
    validateProgrammeMemberNotification,
  );
  const auditEvents = (input.auditEvents ?? []).map(
    validateKnowledgeEvolutionAuditEvent,
  );

  return [
    `schema=${episode.schema}`,
    `method=${episode.method}`,
    `version=${episode.version}`,
    `programmeId=${episode.programmeId}`,
    `episodeId=${episode.id}`,
    `episodeLifecycle=${episode.lifecycle}`,
    `knowledgeStateCount=${knowledgeStates.length}`,
    `workflowStepCount=${workflowSteps.length}`,
    `proposedChangeCount=${proposedChanges.length}`,
    `downstreamCount=${downstream.length}`,
    `reviewRequestCount=${reviewRequests.length}`,
    `graphVersionCount=${graphVersions.length}`,
    `notificationCount=${notifications.length}`,
    `auditEventCount=${auditEvents.length}`,
    `agentsMustNotOverwriteApprovedClaims=true`,
    `appendOnlyTamperEvidentAudit=true`,
    `retainRejectedAndSuperseded=true`,
    `sourceCorrectionsDistinctFromReinterpretations=true`,
    `independentReviewerNotAuthoringAgent=true`,
    `noAutoApproval=true`,
    `noFabricatedDiscoveries=true`,
    `workbenchUi=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
    `scientificKnowledgeEvolution=true`,
    `researchGapHypothesisPortfolio=false`,
  ];
}

export function fingerprintKnowledgeEvolutionEpisode(
  episode: KnowledgeEvolutionEpisode,
): string {
  const validated = validateKnowledgeEvolutionEpisode(episode);
  return sha256Hex(canonicalEvidenceJson(validated));
}

export function buildScientificKnowledgeEvolutionPack(input: {
  episodes: readonly KnowledgeEvolutionEpisode[];
  knowledgeStates: readonly KnowledgeStateRecord[];
  workflowSteps: readonly EvolutionWorkflowStepRecord[];
  proposedChanges: readonly ProposedKnowledgeChange[];
  downstream: readonly DownstreamAffectedInvestigation[];
  reviewRequests: readonly IndependentScientificReviewRequest[];
  graphVersions: readonly GraphVersionPreserveRecord[];
  notifications: readonly ProgrammeMemberNotification[];
  auditEvents: readonly KnowledgeEvolutionAuditEvent[];
  asOf: string;
}): {
  schema: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA;
  method: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD;
  version: typeof SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION;
  asOf: string;
  episodeCount: number;
  knowledgeStateCount: number;
  workflowStepCount: number;
  proposedChangeCount: number;
  downstreamCount: number;
  reviewRequestCount: number;
  graphVersionCount: number;
  notificationCount: number;
  auditEventCount: number;
  honesty: ScientificKnowledgeEvolutionHonesty;
  episodes: readonly KnowledgeEvolutionEpisode[];
  knowledgeStates: readonly KnowledgeStateRecord[];
  workflowSteps: readonly EvolutionWorkflowStepRecord[];
  proposedChanges: readonly ProposedKnowledgeChange[];
  downstream: readonly DownstreamAffectedInvestigation[];
  reviewRequests: readonly IndependentScientificReviewRequest[];
  graphVersions: readonly GraphVersionPreserveRecord[];
  notifications: readonly ProgrammeMemberNotification[];
  auditEvents: readonly KnowledgeEvolutionAuditEvent[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const episodes = input.episodes.map(validateKnowledgeEvolutionEpisode);
  const knowledgeStates = input.knowledgeStates.map(
    validateKnowledgeStateRecord,
  );
  const workflowSteps = input.workflowSteps.map(
    validateEvolutionWorkflowStepRecord,
  );
  const proposedChanges = input.proposedChanges.map(
    validateProposedKnowledgeChange,
  );
  const downstream = input.downstream.map(
    validateDownstreamAffectedInvestigation,
  );
  const reviewRequests = input.reviewRequests.map(
    validateIndependentScientificReviewRequest,
  );
  const graphVersions = input.graphVersions.map(
    validateGraphVersionPreserveRecord,
  );
  const notifications = input.notifications.map(
    validateProgrammeMemberNotification,
  );
  const auditEvents = input.auditEvents.map(
    validateKnowledgeEvolutionAuditEvent,
  );
  return {
    schema: SCIENTIFIC_KNOWLEDGE_EVOLUTION_SCHEMA,
    method: SCIENTIFIC_KNOWLEDGE_EVOLUTION_METHOD,
    version: SCIENTIFIC_KNOWLEDGE_EVOLUTION_VERSION,
    asOf: input.asOf,
    episodeCount: episodes.length,
    knowledgeStateCount: knowledgeStates.length,
    workflowStepCount: workflowSteps.length,
    proposedChangeCount: proposedChanges.length,
    downstreamCount: downstream.length,
    reviewRequestCount: reviewRequests.length,
    graphVersionCount: graphVersions.length,
    notificationCount: notifications.length,
    auditEventCount: auditEvents.length,
    honesty: {...DEFAULT_HONESTY},
    episodes,
    knowledgeStates,
    workflowSteps,
    proposedChanges,
    downstream,
    reviewRequests,
    graphVersions,
    notifications,
    auditEvents,
  };
}
