/**
 * Milestone 10 / PR1 — Experimental Lifecycle Contracts.
 *
 * Distinguishes proposal → approved plan (versioned protocol) → executed
 * procedure → raw observations → derived results → interpretations.
 * Reuses M3 hypothesis registry ids, M6 investigation ids, and N7 experiment
 * ledger ids as references — does not fork N7 outcome classes.
 *
 * Binding honesty:
 * - Agents propose; researchers approve.
 * - AI / agents cannot self-approve experiments.
 * - No fabricated observations or invented wet-lab results.
 * - Fixtures must declare fixture honesty.
 * - Review / approval ≠ experimental validation ≠ graph promotion.
 * - No Gate C auto-approve, MoU invention, PHI/CDS, lab instrument control,
 *   or closed-loop discovery claims in PR1.
 * - Persistence: validated contracts + thin in-memory store; Neon migration deferred.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./evidence/researchEvidenceCorpus";

export const EXPERIMENTAL_LIFECYCLE_SCHEMA =
  "hsi-experimental-lifecycle-1" as const;
export const EXPERIMENTAL_LIFECYCLE_METHOD =
  "hsi.experimental_lifecycle.v1" as const;
export const EXPERIMENTAL_LIFECYCLE_VERSION = "0.1.0" as const;

/** Closed proposal lifecycle — transitions are fail-closed. */
export const EXPERIMENT_PROPOSAL_LIFECYCLES = [
  "draft",
  "submitted_for_review",
  "researcher_approved",
  "researcher_rejected",
  "protocol_bound",
  "superseded",
  "withdrawn",
] as const;
export type ExperimentProposalLifecycle =
  (typeof EXPERIMENT_PROPOSAL_LIFECYCLES)[number];

export const PROTOCOL_LIFECYCLES = [
  "draft",
  "active",
  "superseded",
  "retired",
] as const;
export type ExperimentProtocolLifecycle =
  (typeof PROTOCOL_LIFECYCLES)[number];

export const EXECUTION_LIFECYCLES = [
  "planned",
  "blocked_awaiting_authorisation",
  "in_progress",
  "completed_fixture",
  "completed_authorised",
  "failed_technical",
  "cancelled",
] as const;
export type ExperimentExecutionLifecycle =
  (typeof EXECUTION_LIFECYCLES)[number];

export const RESULT_LAYER_KINDS = [
  "raw_observation",
  "derived_result",
  "interpretation",
] as const;
export type ResultLayerKind = (typeof RESULT_LAYER_KINDS)[number];

export const ACTOR_KINDS = ["human", "ai_agent", "service"] as const;
export type ExperimentalActorKind = (typeof ACTOR_KINDS)[number];

export const DATA_BASES = [
  "fixture_engineering",
  "authorised_public_data",
  "partner_lab_agreement",
] as const;
export type ExperimentalDataBasis = (typeof DATA_BASES)[number];

const PROPOSAL_ID_RE = /^hsi-exp-prop-[a-z0-9-]{3,80}$/;
const PROTOCOL_ID_RE = /^hsi-exp-prot-[a-z0-9-]{3,80}$/;
const EXECUTION_ID_RE = /^hsi-exp-exec-[a-z0-9-]{3,80}$/;
const RESULT_ID_RE = /^hsi-exp-res-[a-z0-9-]{3,80}$/;
const REF_ID_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;
const PRINCIPAL_RE = /^[a-zA-Z0-9_.:@-]{3,128}$/;

export type ExperimentalLifecycleHonesty = {
  agentsProposeResearchersApprove: true;
  aiCannotSelfApproveExperiments: true;
  proposalDistinctFromApprovedPlan: true;
  approvedPlanDistinctFromExecution: true;
  executionDistinctFromObservation: true;
  observationDistinctFromDerivedResult: true;
  derivedResultDistinctFromInterpretation: true;
  fabricatedObservations: false;
  closedLoopDiscoveryComplete: false;
  labInstrumentControl: false;
  computationalPipelineExecuted: false;
  gateCAutoApprove: false;
  mouInvented: false;
  phiCdsWired: false;
  scientificApproval: false;
  graphPromotable: false;
  neonProjectPolicy: "red-wave-only";
  migration: "deferred";
};

export type ExperimentProposalLinks = {
  hypothesisIds: readonly string[];
  investigationId: string | null;
  /** N7 experiment ledger record ids (prediction lineage) when known. */
  n7ExperimentRecordIds: readonly string[];
  evidenceLedgerRecordIds: readonly string[];
};

export type ExperimentProposal = {
  schema: typeof EXPERIMENTAL_LIFECYCLE_SCHEMA;
  method: typeof EXPERIMENTAL_LIFECYCLE_METHOD;
  version: typeof EXPERIMENTAL_LIFECYCLE_VERSION;
  id: string;
  title: string;
  rationale: string;
  falsifier: string;
  proposedBy: {
    principalId: string;
    actorKind: ExperimentalActorKind;
  };
  /** Set only by human researcher approval — never by AI self-approval. */
  approvedBy: {
    principalId: string;
    actorKind: "human";
    approvedAt: string;
  } | null;
  lifecycle: ExperimentProposalLifecycle;
  links: ExperimentProposalLinks;
  boundProtocolId: string | null;
  boundProtocolVersion: number | null;
  dataBasis: ExperimentalDataBasis;
  fixtureHonesty: boolean;
  honesty: ExperimentalLifecycleHonesty;
  createdAt: string;
  updatedAt: string;
  note: string;
};

/** Versioned protocol — content immutable per version; deviations are additive. */
export type ExperimentProtocolVersion = {
  protocolId: string;
  protocolVersion: number;
  parentProtocolVersion: number | null;
  title: string;
  objective: string;
  procedureSteps: readonly string[];
  controls: readonly string[];
  materials: readonly string[];
  safetyNotes: readonly string[];
  deviations: readonly string[];
  /** Optional N7 protocol id when projecting onto experiment ledger. */
  n7ProtocolId: string | null;
  lifecycle: ExperimentProtocolLifecycle;
  dataBasis: ExperimentalDataBasis;
  fixtureHonesty: boolean;
  createdAt: string;
  createdByPrincipalId: string;
  note: string;
};

export type ExperimentExecution = {
  id: string;
  proposalId: string;
  protocolId: string;
  protocolVersion: number;
  lifecycle: ExperimentExecutionLifecycle;
  /** Planned / blocked executions must not invent observations. */
  observationsAttached: false | true;
  startedAt: string | null;
  completedAt: string | null;
  blockedReason: string | null;
  executedByPrincipalId: string | null;
  dataBasis: ExperimentalDataBasis;
  fixtureHonesty: boolean;
  /** Real lab run claim — always false in PR1 contracts. */
  realLabRunClaimed: false;
  n7ExperimentRecordId: string | null;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type ExperimentalResultEnvelope = {
  id: string;
  executionId: string;
  layer: ResultLayerKind;
  /** Pointer / summary only — never invent measured values as live claims. */
  summary: string;
  artifactPointers: readonly string[];
  /** Interpretation layer may reference prior derived/raw ids. */
  dependsOnResultIds: readonly string[];
  dataBasis: ExperimentalDataBasis;
  fixtureHonesty: boolean;
  fabricated: false;
  scientificApproval: false;
  graphPromotable: false;
  createdAt: string;
  createdByPrincipalId: string;
  note: string;
};

export type ExperimentalLifecycleStore = {
  upsertProposal(proposal: ExperimentProposal): ExperimentProposal;
  getProposal(id: string): ExperimentProposal | null;
  listProposals(): readonly ExperimentProposal[];
  upsertProtocol(protocol: ExperimentProtocolVersion): ExperimentProtocolVersion;
  getProtocol(
    protocolId: string,
    protocolVersion: number,
  ): ExperimentProtocolVersion | null;
  listProtocols(protocolId?: string): readonly ExperimentProtocolVersion[];
  upsertExecution(execution: ExperimentExecution): ExperimentExecution;
  getExecution(id: string): ExperimentExecution | null;
  listExecutions(): readonly ExperimentExecution[];
  upsertResult(result: ExperimentalResultEnvelope): ExperimentalResultEnvelope;
  getResult(id: string): ExperimentalResultEnvelope | null;
  listResults(executionId?: string): readonly ExperimentalResultEnvelope[];
};

const DEFAULT_HONESTY: ExperimentalLifecycleHonesty = {
  agentsProposeResearchersApprove: true,
  aiCannotSelfApproveExperiments: true,
  proposalDistinctFromApprovedPlan: true,
  approvedPlanDistinctFromExecution: true,
  executionDistinctFromObservation: true,
  observationDistinctFromDerivedResult: true,
  derivedResultDistinctFromInterpretation: true,
  fabricatedObservations: false,
  closedLoopDiscoveryComplete: false,
  labInstrumentControl: false,
  computationalPipelineExecuted: false,
  gateCAutoApprove: false,
  mouInvented: false,
  phiCdsWired: false,
  scientificApproval: false,
  graphPromotable: false,
  neonProjectPolicy: "red-wave-only",
  migration: "deferred",
};

const PROPOSAL_TRANSITIONS: Record<
  ExperimentProposalLifecycle,
  readonly ExperimentProposalLifecycle[]
> = {
  draft: ["submitted_for_review", "withdrawn"],
  submitted_for_review: [
    "researcher_approved",
    "researcher_rejected",
    "withdrawn",
  ],
  researcher_approved: ["protocol_bound", "superseded", "withdrawn"],
  researcher_rejected: ["superseded", "withdrawn"],
  protocol_bound: ["superseded", "withdrawn"],
  superseded: [],
  withdrawn: [],
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

function assertHonesty(honesty: ExperimentalLifecycleHonesty): void {
  if (honesty.agentsProposeResearchersApprove !== true) {
    throw Error("Agents propose; researchers approve");
  }
  if (honesty.aiCannotSelfApproveExperiments !== true) {
    throw Error("AI cannot self-approve experiments");
  }
  if (honesty.fabricatedObservations !== false) {
    throw Error("Fabricated observations forbidden");
  }
  if (honesty.closedLoopDiscoveryComplete !== false) {
    throw Error("Closed-loop discovery must not be claimed");
  }
  if (honesty.labInstrumentControl !== false) {
    throw Error("Lab instrument control must not be claimed");
  }
  if (honesty.gateCAutoApprove !== false) throw Error("Gate C auto-approve forbidden");
  if (honesty.mouInvented !== false) throw Error("MoU must not be invented");
  if (honesty.phiCdsWired !== false) throw Error("PHI/CDS must stay unwired");
  if (honesty.scientificApproval !== false) {
    throw Error("Scientific approval must stay false in PR1 contracts");
  }
  if (honesty.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (honesty.neonProjectPolicy !== "red-wave-only") {
    throw Error("Neon red-wave only");
  }
  if (honesty.migration !== "deferred") throw Error("Migration must stay deferred");
}

export function draftExperimentProposal(input: {
  id: string;
  title: string;
  rationale: string;
  falsifier: string;
  proposedByPrincipalId: string;
  proposedByActorKind?: ExperimentalActorKind;
  createdAt: string;
  hypothesisIds?: readonly string[];
  investigationId?: string | null;
  n7ExperimentRecordIds?: readonly string[];
  evidenceLedgerRecordIds?: readonly string[];
  dataBasis?: ExperimentalDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ExperimentProposal {
  if (!PROPOSAL_ID_RE.test(input.id)) throw Error("Invalid proposal id");
  if (!textOk(input.title, 200)) throw Error("Invalid proposal title");
  if (!textOk(input.rationale, 4000)) throw Error("Invalid proposal rationale");
  if (!textOk(input.falsifier, 2000)) throw Error("Proposal requires falsifier");
  if (!PRINCIPAL_RE.test(input.proposedByPrincipalId)) {
    throw Error("Invalid proposer principal");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const actorKind = input.proposedByActorKind ?? "ai_agent";
  assertClosed(actorKind, ACTOR_KINDS, "actor kind");
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

  const proposal: ExperimentProposal = {
    schema: EXPERIMENTAL_LIFECYCLE_SCHEMA,
    method: EXPERIMENTAL_LIFECYCLE_METHOD,
    version: EXPERIMENTAL_LIFECYCLE_VERSION,
    id: input.id,
    title: input.title.trim(),
    rationale: input.rationale.trim(),
    falsifier: input.falsifier.trim(),
    proposedBy: {
      principalId: input.proposedByPrincipalId,
      actorKind,
    },
    approvedBy: null,
    lifecycle: "draft",
    links: {
      hypothesisIds: assertRefList(input.hypothesisIds ?? [], "hypothesis"),
      investigationId,
      n7ExperimentRecordIds: assertRefList(
        input.n7ExperimentRecordIds ?? [],
        "n7 experiment",
      ),
      evidenceLedgerRecordIds: assertRefList(
        input.evidenceLedgerRecordIds ?? [],
        "evidence ledger",
      ),
    },
    boundProtocolId: null,
    boundProtocolVersion: null,
    dataBasis,
    fixtureHonesty,
    honesty: {...DEFAULT_HONESTY},
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentProposal(proposal);
}

export function validateExperimentProposal(
  proposal: ExperimentProposal,
): ExperimentProposal {
  if (proposal.schema !== EXPERIMENTAL_LIFECYCLE_SCHEMA) {
    throw Error("Invalid proposal schema");
  }
  if (proposal.method !== EXPERIMENTAL_LIFECYCLE_METHOD) {
    throw Error("Invalid proposal method");
  }
  if (proposal.version !== EXPERIMENTAL_LIFECYCLE_VERSION) {
    throw Error("Invalid proposal version");
  }
  if (!PROPOSAL_ID_RE.test(proposal.id)) throw Error("Invalid proposal id");
  assertClosed(proposal.lifecycle, EXPERIMENT_PROPOSAL_LIFECYCLES, "lifecycle");
  assertClosed(proposal.proposedBy.actorKind, ACTOR_KINDS, "actor kind");
  assertClosed(proposal.dataBasis, DATA_BASES, "data basis");
  assertHonesty(proposal.honesty);
  if (
    proposal.dataBasis === "fixture_engineering" &&
    proposal.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (!isIsoTimestamp(proposal.createdAt) || !isIsoTimestamp(proposal.updatedAt)) {
    throw Error("Invalid proposal timestamps");
  }

  if (proposal.approvedBy !== null) {
    if (proposal.approvedBy.actorKind !== "human") {
      throw Error("Only human researchers may approve experiments");
    }
    if (!PRINCIPAL_RE.test(proposal.approvedBy.principalId)) {
      throw Error("Invalid approver principal");
    }
    if (!isIsoTimestamp(proposal.approvedBy.approvedAt)) {
      throw Error("Invalid approvedAt");
    }
    if (
      proposal.lifecycle !== "researcher_approved" &&
      proposal.lifecycle !== "protocol_bound" &&
      proposal.lifecycle !== "superseded" &&
      proposal.lifecycle !== "withdrawn"
    ) {
      throw Error("Approval stamp requires approved lifecycle");
    }
  } else if (
    proposal.lifecycle === "researcher_approved" ||
    proposal.lifecycle === "protocol_bound"
  ) {
    throw Error("Approved lifecycle requires human approval stamp");
  }

  if (
    proposal.proposedBy.actorKind !== "human" &&
    proposal.approvedBy !== null &&
    proposal.approvedBy.principalId === proposal.proposedBy.principalId
  ) {
    throw Error("AI cannot self-approve experiments");
  }

  if (proposal.lifecycle === "protocol_bound") {
    if (!proposal.boundProtocolId || proposal.boundProtocolVersion === null) {
      throw Error("protocol_bound requires protocol binding");
    }
    if (!PROTOCOL_ID_RE.test(proposal.boundProtocolId)) {
      throw Error("Invalid bound protocol id");
    }
    if (
      !Number.isInteger(proposal.boundProtocolVersion) ||
      proposal.boundProtocolVersion < 1
    ) {
      throw Error("Invalid bound protocol version");
    }
  } else if (
    proposal.boundProtocolId !== null ||
    proposal.boundProtocolVersion !== null
  ) {
    throw Error("Protocol binding only allowed in protocol_bound lifecycle");
  }

  assertRefList(proposal.links.hypothesisIds, "hypothesis");
  assertRefList(proposal.links.n7ExperimentRecordIds, "n7 experiment");
  assertRefList(proposal.links.evidenceLedgerRecordIds, "evidence ledger");
  if (
    proposal.links.investigationId !== null &&
    !REF_ID_RE.test(proposal.links.investigationId)
  ) {
    throw Error("Invalid investigationId");
  }

  return proposal;
}

/**
 * Fail-closed proposal transition.
 * AI / agent actors cannot perform researcher_approved.
 */
export function transitionExperimentProposal(input: {
  proposal: ExperimentProposal;
  to: ExperimentProposalLifecycle;
  updatedAt: string;
  actor: {principalId: string; actorKind: ExperimentalActorKind};
  note?: string;
}): ExperimentProposal {
  const prior = validateExperimentProposal(input.proposal);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  if (!PRINCIPAL_RE.test(input.actor.principalId)) {
    throw Error("Invalid transition actor");
  }
  assertClosed(input.actor.actorKind, ACTOR_KINDS, "actor kind");
  assertClosed(input.to, EXPERIMENT_PROPOSAL_LIFECYCLES, "lifecycle");

  const allowed = PROPOSAL_TRANSITIONS[prior.lifecycle];
  if (!allowed.includes(input.to)) {
    throw Error(
      `Illegal proposal transition ${prior.lifecycle} → ${input.to}`,
    );
  }

  if (input.to === "researcher_approved") {
    if (input.actor.actorKind !== "human") {
      throw Error("Only human researchers may approve experiments");
    }
    if (
      prior.proposedBy.actorKind !== "human" &&
      input.actor.principalId === prior.proposedBy.principalId
    ) {
      throw Error("AI cannot self-approve experiments");
    }
  }

  if (input.to === "protocol_bound") {
    throw Error("Use bindProposalToProtocol for protocol_bound");
  }

  const approvedBy =
    input.to === "researcher_approved"
      ? {
          principalId: input.actor.principalId,
          actorKind: "human" as const,
          approvedAt: input.updatedAt,
        }
      : input.to === "researcher_rejected" ||
          input.to === "submitted_for_review" ||
          input.to === "draft"
        ? null
        : prior.approvedBy;

  const next: ExperimentProposal = {
    ...prior,
    lifecycle: input.to,
    approvedBy,
    boundProtocolId: null,
    boundProtocolVersion: null,
    updatedAt: input.updatedAt,
    note: input.note !== undefined ? input.note.trim() : prior.note,
    honesty: {...DEFAULT_HONESTY},
  };
  return validateExperimentProposal(next);
}

export function draftExperimentProtocolVersion(input: {
  protocolId: string;
  protocolVersion: number;
  parentProtocolVersion?: number | null;
  title: string;
  objective: string;
  procedureSteps: readonly string[];
  controls?: readonly string[];
  materials?: readonly string[];
  safetyNotes?: readonly string[];
  deviations?: readonly string[];
  n7ProtocolId?: string | null;
  lifecycle?: ExperimentProtocolLifecycle;
  dataBasis?: ExperimentalDataBasis;
  fixtureHonesty?: boolean;
  createdAt: string;
  createdByPrincipalId: string;
  note?: string;
}): ExperimentProtocolVersion {
  if (!PROTOCOL_ID_RE.test(input.protocolId)) throw Error("Invalid protocol id");
  if (!Number.isInteger(input.protocolVersion) || input.protocolVersion < 1) {
    throw Error("Invalid protocol version");
  }
  if (!textOk(input.title, 200)) throw Error("Invalid protocol title");
  if (!textOk(input.objective, 2000)) throw Error("Invalid protocol objective");
  if (
    !Array.isArray(input.procedureSteps) ||
    input.procedureSteps.length < 1 ||
    input.procedureSteps.length > 40
  ) {
    throw Error("Invalid procedure steps");
  }
  for (const step of input.procedureSteps) {
    if (!textOk(step, 1000)) throw Error("Invalid procedure step");
  }
  if (!PRINCIPAL_RE.test(input.createdByPrincipalId)) {
    throw Error("Invalid protocol author");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  const lifecycle = input.lifecycle ?? "draft";
  assertClosed(lifecycle, PROTOCOL_LIFECYCLES, "protocol lifecycle");
  const dataBasis = input.dataBasis ?? "fixture_engineering";
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  const parent =
    input.parentProtocolVersion === undefined
      ? input.protocolVersion === 1
        ? null
        : input.protocolVersion - 1
      : input.parentProtocolVersion;
  if (input.protocolVersion === 1 && parent !== null) {
    throw Error("Version 1 cannot have parent");
  }
  if (input.protocolVersion > 1 && parent === null) {
    throw Error("Version >1 requires parentProtocolVersion");
  }
  if (parent !== null && (!Number.isInteger(parent) || parent < 1)) {
    throw Error("Invalid parentProtocolVersion");
  }
  const n7ProtocolId =
    input.n7ProtocolId === undefined || input.n7ProtocolId === null
      ? null
      : input.n7ProtocolId;
  if (n7ProtocolId !== null && !REF_ID_RE.test(n7ProtocolId)) {
    throw Error("Invalid n7ProtocolId");
  }

  const protocol: ExperimentProtocolVersion = {
    protocolId: input.protocolId,
    protocolVersion: input.protocolVersion,
    parentProtocolVersion: parent,
    title: input.title.trim(),
    objective: input.objective.trim(),
    procedureSteps: input.procedureSteps.map((s) => s.trim()),
    controls: [...(input.controls ?? [])],
    materials: [...(input.materials ?? [])],
    safetyNotes: [...(input.safetyNotes ?? [])],
    deviations: [...(input.deviations ?? [])],
    n7ProtocolId,
    lifecycle,
    dataBasis,
    fixtureHonesty,
    createdAt: input.createdAt,
    createdByPrincipalId: input.createdByPrincipalId,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentProtocolVersion(protocol);
}

export function validateExperimentProtocolVersion(
  protocol: ExperimentProtocolVersion,
): ExperimentProtocolVersion {
  if (!PROTOCOL_ID_RE.test(protocol.protocolId)) throw Error("Invalid protocol id");
  if (!Number.isInteger(protocol.protocolVersion) || protocol.protocolVersion < 1) {
    throw Error("Invalid protocol version");
  }
  assertClosed(protocol.lifecycle, PROTOCOL_LIFECYCLES, "protocol lifecycle");
  assertClosed(protocol.dataBasis, DATA_BASES, "data basis");
  if (
    protocol.dataBasis === "fixture_engineering" &&
    protocol.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (!textOk(protocol.title, 200) || !textOk(protocol.objective, 2000)) {
    throw Error("Invalid protocol text");
  }
  if (
    !Array.isArray(protocol.procedureSteps) ||
    protocol.procedureSteps.length < 1 ||
    protocol.procedureSteps.length > 40
  ) {
    throw Error("Invalid procedure steps");
  }
  for (const step of protocol.procedureSteps) {
    if (!textOk(step, 1000)) throw Error("Invalid procedure step");
  }
  for (const list of [
    protocol.controls,
    protocol.materials,
    protocol.safetyNotes,
    protocol.deviations,
  ]) {
    if (list.length > 40) throw Error("Protocol list too long");
    for (const item of list) {
      if (!textOk(item, 1000)) throw Error("Invalid protocol list item");
    }
  }
  if (!PRINCIPAL_RE.test(protocol.createdByPrincipalId)) {
    throw Error("Invalid protocol author");
  }
  if (!isIsoTimestamp(protocol.createdAt)) throw Error("Invalid createdAt");
  return protocol;
}

/**
 * Bind a researcher-approved proposal to an active protocol version.
 * Creates the approved-plan layer without inventing execution or observations.
 */
export function bindProposalToProtocol(input: {
  proposal: ExperimentProposal;
  protocol: ExperimentProtocolVersion;
  updatedAt: string;
  actor: {principalId: string; actorKind: ExperimentalActorKind};
}): ExperimentProposal {
  const prior = validateExperimentProposal(input.proposal);
  const protocol = validateExperimentProtocolVersion(input.protocol);
  if (!isIsoTimestamp(input.updatedAt)) throw Error("Invalid updatedAt");
  if (prior.lifecycle !== "researcher_approved") {
    throw Error("Only researcher_approved proposals may bind protocol");
  }
  if (input.actor.actorKind !== "human") {
    throw Error("Only human researchers may bind approved plans");
  }
  if (protocol.lifecycle !== "active" && protocol.lifecycle !== "draft") {
    throw Error("Protocol must be draft or active to bind");
  }
  if (prior.approvedBy === null) {
    throw Error("Approved proposal missing approval stamp");
  }

  const next: ExperimentProposal = {
    ...prior,
    lifecycle: "protocol_bound",
    boundProtocolId: protocol.protocolId,
    boundProtocolVersion: protocol.protocolVersion,
    updatedAt: input.updatedAt,
    honesty: {...DEFAULT_HONESTY},
  };
  return validateExperimentProposal(next);
}

export function draftExperimentExecution(input: {
  id: string;
  proposal: ExperimentProposal;
  protocol: ExperimentProtocolVersion;
  createdAt: string;
  lifecycle?: ExperimentExecutionLifecycle;
  blockedReason?: string | null;
  executedByPrincipalId?: string | null;
  n7ExperimentRecordId?: string | null;
  dataBasis?: ExperimentalDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ExperimentExecution {
  const proposal = validateExperimentProposal(input.proposal);
  const protocol = validateExperimentProtocolVersion(input.protocol);
  if (!EXECUTION_ID_RE.test(input.id)) throw Error("Invalid execution id");
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");
  if (proposal.lifecycle !== "protocol_bound") {
    throw Error("Execution requires protocol_bound proposal");
  }
  if (
    proposal.boundProtocolId !== protocol.protocolId ||
    proposal.boundProtocolVersion !== protocol.protocolVersion
  ) {
    throw Error("Execution protocol must match bound proposal protocol");
  }

  const lifecycle = input.lifecycle ?? "planned";
  assertClosed(lifecycle, EXECUTION_LIFECYCLES, "execution lifecycle");
  if (
    lifecycle === "completed_authorised" ||
    lifecycle === "in_progress"
  ) {
    // PR1: do not invent live lab progress — only planned / blocked / fixture.
    throw Error(
      "Live authorised execution lifecycles require verified lab connectors (out of PR1)",
    );
  }
  if (
    lifecycle === "blocked_awaiting_authorisation" &&
    !textOk(input.blockedReason ?? "", 500)
  ) {
    throw Error("Blocked execution requires blockedReason");
  }
  if (lifecycle === "completed_fixture" && input.dataBasis === "partner_lab_agreement") {
    throw Error("Fixture completion cannot claim partner lab agreement");
  }

  const dataBasis = input.dataBasis ?? proposal.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  const n7ExperimentRecordId =
    input.n7ExperimentRecordId === undefined ||
    input.n7ExperimentRecordId === null
      ? null
      : input.n7ExperimentRecordId;
  if (n7ExperimentRecordId !== null && !REF_ID_RE.test(n7ExperimentRecordId)) {
    throw Error("Invalid n7ExperimentRecordId");
  }
  const executedBy =
    input.executedByPrincipalId === undefined ||
    input.executedByPrincipalId === null
      ? null
      : input.executedByPrincipalId;
  if (executedBy !== null && !PRINCIPAL_RE.test(executedBy)) {
    throw Error("Invalid executedBy principal");
  }

  const execution: ExperimentExecution = {
    id: input.id,
    proposalId: proposal.id,
    protocolId: protocol.protocolId,
    protocolVersion: protocol.protocolVersion,
    lifecycle,
    observationsAttached: false,
    startedAt: null,
    completedAt:
      lifecycle === "completed_fixture" || lifecycle === "cancelled"
        ? input.createdAt
        : null,
    blockedReason:
      lifecycle === "blocked_awaiting_authorisation"
        ? (input.blockedReason ?? "").trim()
        : null,
    executedByPrincipalId: executedBy,
    dataBasis,
    fixtureHonesty,
    realLabRunClaimed: false,
    n7ExperimentRecordId,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentExecution(execution);
}

export function validateExperimentExecution(
  execution: ExperimentExecution,
): ExperimentExecution {
  if (!EXECUTION_ID_RE.test(execution.id)) throw Error("Invalid execution id");
  if (!PROPOSAL_ID_RE.test(execution.proposalId)) {
    throw Error("Invalid execution proposal id");
  }
  if (!PROTOCOL_ID_RE.test(execution.protocolId)) {
    throw Error("Invalid execution protocol id");
  }
  assertClosed(execution.lifecycle, EXECUTION_LIFECYCLES, "execution lifecycle");
  assertClosed(execution.dataBasis, DATA_BASES, "data basis");
  if (execution.realLabRunClaimed !== false) {
    throw Error("Real lab run must not be claimed in PR1");
  }
  if (
    execution.dataBasis === "fixture_engineering" &&
    execution.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (
    (execution.lifecycle === "completed_authorised" ||
      execution.lifecycle === "in_progress") &&
    execution.realLabRunClaimed === false
  ) {
    // Still refuse inventing these states without connectors.
    throw Error("Authorised/in_progress execution not available in PR1");
  }
  if (
    execution.lifecycle === "blocked_awaiting_authorisation" &&
    !textOk(execution.blockedReason ?? "", 500)
  ) {
    throw Error("Blocked execution requires blockedReason");
  }
  if (!isIsoTimestamp(execution.createdAt) || !isIsoTimestamp(execution.updatedAt)) {
    throw Error("Invalid execution timestamps");
  }
  return execution;
}

export function draftExperimentalResult(input: {
  id: string;
  execution: ExperimentExecution;
  layer: ResultLayerKind;
  summary: string;
  artifactPointers?: readonly string[];
  dependsOnResultIds?: readonly string[];
  createdAt: string;
  createdByPrincipalId: string;
  dataBasis?: ExperimentalDataBasis;
  fixtureHonesty?: boolean;
  note?: string;
}): ExperimentalResultEnvelope {
  const execution = validateExperimentExecution(input.execution);
  if (!RESULT_ID_RE.test(input.id)) throw Error("Invalid result id");
  assertClosed(input.layer, RESULT_LAYER_KINDS, "result layer");
  if (!textOk(input.summary, 4000)) throw Error("Invalid result summary");
  if (!PRINCIPAL_RE.test(input.createdByPrincipalId)) {
    throw Error("Invalid result author");
  }
  if (!isIsoTimestamp(input.createdAt)) throw Error("Invalid createdAt");

  // Results attach only after a declared execution completion (fixture) or
  // when explicitly recording that observations are still blocked.
  if (
    execution.lifecycle !== "completed_fixture" &&
    input.layer === "raw_observation"
  ) {
    throw Error(
      "Raw observations require completed_fixture execution in PR1 (no fabricated live observations)",
    );
  }
  if (
    input.layer !== "raw_observation" &&
    (input.dependsOnResultIds ?? []).length === 0
  ) {
    throw Error("Derived/interpretation layers require dependsOnResultIds");
  }

  const dataBasis = input.dataBasis ?? execution.dataBasis;
  assertClosed(dataBasis, DATA_BASES, "data basis");
  const fixtureHonesty =
    input.fixtureHonesty ?? dataBasis === "fixture_engineering";
  if (dataBasis === "fixture_engineering" && !fixtureHonesty) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }

  const result: ExperimentalResultEnvelope = {
    id: input.id,
    executionId: execution.id,
    layer: input.layer,
    summary: input.summary.trim(),
    artifactPointers: [...(input.artifactPointers ?? [])],
    dependsOnResultIds: assertRefList(
      input.dependsOnResultIds ?? [],
      "dependsOn result",
    ),
    dataBasis,
    fixtureHonesty,
    fabricated: false,
    scientificApproval: false,
    graphPromotable: false,
    createdAt: input.createdAt,
    createdByPrincipalId: input.createdByPrincipalId,
    note: (input.note ?? "").trim(),
  };
  return validateExperimentalResult(result);
}

export function validateExperimentalResult(
  result: ExperimentalResultEnvelope,
): ExperimentalResultEnvelope {
  if (!RESULT_ID_RE.test(result.id)) throw Error("Invalid result id");
  if (!EXECUTION_ID_RE.test(result.executionId)) {
    throw Error("Invalid result execution id");
  }
  assertClosed(result.layer, RESULT_LAYER_KINDS, "result layer");
  assertClosed(result.dataBasis, DATA_BASES, "data basis");
  if (result.fabricated !== false) throw Error("Fabricated results forbidden");
  if (result.scientificApproval !== false) {
    throw Error("Scientific approval must stay false");
  }
  if (result.graphPromotable !== false) throw Error("Graph promotion forbidden");
  if (
    result.dataBasis === "fixture_engineering" &&
    result.fixtureHonesty !== true
  ) {
    throw Error("Fixture dataBasis requires fixtureHonesty");
  }
  if (!textOk(result.summary, 4000)) throw Error("Invalid result summary");
  if (result.artifactPointers.length > 40) {
    throw Error("Too many artifact pointers");
  }
  for (const pointer of result.artifactPointers) {
    if (!textOk(pointer, 500)) throw Error("Invalid artifact pointer");
  }
  assertRefList(result.dependsOnResultIds, "dependsOn result");
  if (
    result.layer !== "raw_observation" &&
    result.dependsOnResultIds.length === 0
  ) {
    throw Error("Derived/interpretation layers require dependsOnResultIds");
  }
  if (!PRINCIPAL_RE.test(result.createdByPrincipalId)) {
    throw Error("Invalid result author");
  }
  if (!isIsoTimestamp(result.createdAt)) throw Error("Invalid createdAt");
  return result;
}

export function createMemoryExperimentalLifecycleStore(): ExperimentalLifecycleStore & {
  proposals: Map<string, ExperimentProposal>;
  protocols: Map<string, ExperimentProtocolVersion>;
  executions: Map<string, ExperimentExecution>;
  results: Map<string, ExperimentalResultEnvelope>;
} {
  const proposals = new Map<string, ExperimentProposal>();
  const protocols = new Map<string, ExperimentProtocolVersion>();
  const executions = new Map<string, ExperimentExecution>();
  const results = new Map<string, ExperimentalResultEnvelope>();

  const protocolKey = (protocolId: string, protocolVersion: number) =>
    `${protocolId}@${protocolVersion}`;

  return {
    proposals,
    protocols,
    executions,
    results,
    upsertProposal(proposal) {
      const validated = validateExperimentProposal(proposal);
      proposals.set(validated.id, validated);
      return validated;
    },
    getProposal(id) {
      return proposals.get(id) ?? null;
    },
    listProposals() {
      return [...proposals.values()];
    },
    upsertProtocol(protocol) {
      const validated = validateExperimentProtocolVersion(protocol);
      protocols.set(
        protocolKey(validated.protocolId, validated.protocolVersion),
        validated,
      );
      return validated;
    },
    getProtocol(protocolId, protocolVersion) {
      return protocols.get(protocolKey(protocolId, protocolVersion)) ?? null;
    },
    listProtocols(protocolId) {
      const all = [...protocols.values()];
      return protocolId
        ? all.filter((p) => p.protocolId === protocolId)
        : all;
    },
    upsertExecution(execution) {
      const validated = validateExperimentExecution(execution);
      executions.set(validated.id, validated);
      return validated;
    },
    getExecution(id) {
      return executions.get(id) ?? null;
    },
    listExecutions() {
      return [...executions.values()];
    },
    upsertResult(result) {
      const validated = validateExperimentalResult(result);
      results.set(validated.id, validated);
      return validated;
    },
    getResult(id) {
      return results.get(id) ?? null;
    },
    listResults(executionId) {
      const all = [...results.values()];
      return executionId
        ? all.filter((r) => r.executionId === executionId)
        : all;
    },
  };
}

export function projectExperimentalLifecyclePersistenceLines(input: {
  proposal: ExperimentProposal;
  protocol?: ExperimentProtocolVersion | null;
  execution?: ExperimentExecution | null;
  results?: readonly ExperimentalResultEnvelope[];
}): string[] {
  const proposal = validateExperimentProposal(input.proposal);
  const lines = [
    `schema=${proposal.schema}`,
    `method=${proposal.method}`,
    `version=${proposal.version}`,
    `proposalId=${proposal.id}`,
    `proposalLifecycle=${proposal.lifecycle}`,
    `hypotheses=${proposal.links.hypothesisIds.length}`,
    `n7Links=${proposal.links.n7ExperimentRecordIds.length}`,
    `aiSelfApprove=false`,
    `fabricatedObservations=false`,
    `closedLoop=false`,
    `labControl=false`,
    `graphPromotable=false`,
    `neon=red-wave-only`,
    `migration=deferred`,
  ];
  if (input.protocol) {
    const protocol = validateExperimentProtocolVersion(input.protocol);
    lines.push(
      `protocolId=${protocol.protocolId}`,
      `protocolVersion=${protocol.protocolVersion}`,
    );
  }
  if (input.execution) {
    const execution = validateExperimentExecution(input.execution);
    lines.push(
      `executionId=${execution.id}`,
      `executionLifecycle=${execution.lifecycle}`,
      `realLabRun=false`,
    );
  }
  if (input.results?.length) {
    for (const result of input.results) {
      validateExperimentalResult(result);
    }
    lines.push(`results=${input.results.length}`);
  }
  return lines;
}

export function fingerprintExperimentProposal(
  proposal: ExperimentProposal,
): string {
  const validated = validateExperimentProposal(proposal);
  return createHash("sha256")
    .update(canonicalEvidenceJson(validated))
    .digest("hex");
}

export function buildExperimentalLifecyclePack(input: {
  proposals: readonly ExperimentProposal[];
  protocols: readonly ExperimentProtocolVersion[];
  executions: readonly ExperimentExecution[];
  results: readonly ExperimentalResultEnvelope[];
  asOf: string;
}): {
  schema: typeof EXPERIMENTAL_LIFECYCLE_SCHEMA;
  method: typeof EXPERIMENTAL_LIFECYCLE_METHOD;
  version: typeof EXPERIMENTAL_LIFECYCLE_VERSION;
  asOf: string;
  proposalCount: number;
  protocolCount: number;
  executionCount: number;
  resultCount: number;
  honesty: ExperimentalLifecycleHonesty;
  proposals: readonly ExperimentProposal[];
  protocols: readonly ExperimentProtocolVersion[];
  executions: readonly ExperimentExecution[];
  results: readonly ExperimentalResultEnvelope[];
} {
  if (!isIsoTimestamp(input.asOf)) throw Error("Invalid asOf");
  const proposals = input.proposals.map(validateExperimentProposal);
  const protocols = input.protocols.map(validateExperimentProtocolVersion);
  const executions = input.executions.map(validateExperimentExecution);
  const results = input.results.map(validateExperimentalResult);
  return {
    schema: EXPERIMENTAL_LIFECYCLE_SCHEMA,
    method: EXPERIMENTAL_LIFECYCLE_METHOD,
    version: EXPERIMENTAL_LIFECYCLE_VERSION,
    asOf: input.asOf,
    proposalCount: proposals.length,
    protocolCount: protocols.length,
    executionCount: executions.length,
    resultCount: results.length,
    honesty: {...DEFAULT_HONESTY},
    proposals,
    protocols,
    executions,
    results,
  };
}
