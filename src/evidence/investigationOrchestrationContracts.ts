/**
 * Milestone 6 / PR1 — Capability registry hooks + shared investigation contracts.
 *
 * Extends existing orchestrator / checkpoints / boundedAgentExecution /
 * research workbench / interrogative workspace. Does NOT invent a new agent
 * framework, parallel KG, planner/task-graph (PR2), Gate C approval, MoU,
 * PHI/CDS, or live SSc E2E success.
 *
 * Persistence: in-process validated contracts + JSON projection onto existing
 * Neon investigation / checkpoint infrastructure. No new migration in PR1.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

/**
 * Mirror of `BOUNDED_STAGE_IDS` in boundedAgentExecution — kept local to avoid
 * an import cycle (bounded agent → research brief → this module).
 * Tests assert equality with the executor list.
 */
export const INVESTIGATION_BOUNDED_STAGE_IDS = [
  "investigation-plan",
  "evidence-retrieval",
  "mechanism-analysis",
  "opposing-evidence",
  "gap-assessment",
  "hypothesis-comparison",
  "research-brief",
] as const;
export type InvestigationBoundedStageId = (typeof INVESTIGATION_BOUNDED_STAGE_IDS)[number];

export const INVESTIGATION_ORCHESTRATION_SCHEMA =
  "hsi-investigation-orchestration-1" as const;
export const INVESTIGATION_ORCHESTRATION_METHOD =
  "hsi.investigation_orchestration.v1" as const;
export const INVESTIGATION_ORCHESTRATION_VERSION = "0.1.0" as const;

/** Closed investigation lifecycle for M6 orchestration (fail-closed transitions). */
export const INVESTIGATION_ORCHESTRATION_STATES = [
  "draft",
  "planning",
  "awaiting_researcher_approval",
  "running",
  "awaiting_external_dependency",
  "awaiting_scientific_review",
  "paused",
  "completed_with_limitations",
  "completed",
  "failed",
  "cancelled",
] as const;
export type InvestigationOrchestrationState =
  (typeof INVESTIGATION_ORCHESTRATION_STATES)[number];

/** Interrogative workspace states (Neon `007`) — projection only. */
export type InterrogativeWorkspaceState =
  | "draft"
  | "awaiting_scientific_review"
  | "reviewed"
  | "rejected";

/** Research workbench run status (Neon `004`) — projection only. */
export type ResearchWorkbenchRunStatus = "evidence_found" | "insufficient_evidence";

export type InvestigationAuthScope = {
  /** Authenticated principal id when known; null for in-memory drafts. */
  principalId: string | null;
  authenticated: boolean;
  /** Research roles only — never invent admin elevation. */
  roles: readonly ("researcher" | "scientific_reviewer" | "research_admin")[];
  dataClass: "public_biomedical" | "licensed_partner" | "synthetic_demo";
};

export type InvestigationEntityRef = {
  kind: "concept" | "gene" | "protein" | "disease" | "trial" | "hypothesis" | "other";
  id: string;
  label: string | null;
};

export type InvestigationObjective = {
  id: string;
  text: string;
  /** Optional link to M3 hypothesis registry id. */
  hypothesisId: string | null;
};

export type InvestigationConstraint = {
  id: string;
  kind:
    | "budget"
    | "freshness"
    | "source_allowlist"
    | "no_phi"
    | "no_gate_c_auto_approve"
    | "human_review_required"
    | "other";
  text: string;
};

export type InvestigationSourceRef = {
  kind: "pmid" | "doi" | "nct" | "release_claim" | "open_targets" | "uniprot" | "fixture" | "other";
  value: string;
  /** Locator honesty — source identity ≠ claim support. */
  claimSupport: "not_assessed";
};

export type InvestigationBudgets = {
  maxStages: number;
  maxToolCallsPerStage: number;
  maxWallClockMs: number;
  maxExternalFetches: number;
};

export type InvestigationFreshness = {
  /** ISO timestamp; null means freshness not assessed. */
  asOf: string | null;
  maxAgeDays: number | null;
  stale: boolean | null;
};

export type InvestigationReviewCheckpoint = {
  id: string;
  kind:
    | "researcher_approval"
    | "scientific_review"
    | "external_dependency"
    | "operator_recovery"
    | "other";
  /** Required before continuing past this gate. */
  required: true;
  status: "pending" | "satisfied" | "waived_not_allowed" | "blocked";
  note: string;
  /** Never auto-satisfies Gate C. */
  gateCAutoApprove: false;
};

/**
 * Pointers into existing durable checkpoint / fence substrate.
 * Resume uses these — do not invent a parallel checkpoint store.
 */
export type InvestigationResumePointers = {
  /** Same investigationId used by `hsiAgentDurableCheckpoint` / bounded agent. */
  checkpointInvestigationId: string;
  /** Bounded stage ids already known to the executor. */
  boundedStageIds: readonly InvestigationBoundedStageId[];
  /** Last completed durable checkpoint task id when known. */
  lastCompletedCheckpointTaskId: string | null;
  /** Last fenced artifact ref when known. */
  lastFencedArtifactRef: string | null;
  /** Explicit: resume requires existing checkpoint recovery rules. */
  usesExistingDurableCheckpoints: true;
  parallelCheckpointStoreInvented: false;
};

export type ScientificInvestigationContract = {
  schemaVersion: typeof INVESTIGATION_ORCHESTRATION_SCHEMA;
  method: typeof INVESTIGATION_ORCHESTRATION_METHOD;
  version: typeof INVESTIGATION_ORCHESTRATION_VERSION;
  investigationId: string;
  authScope: InvestigationAuthScope;
  question: string;
  domain: "ssc_tfh_il21" | "gut_immune_t2d" | "immune_general" | "unscoped_research";
  entities: readonly InvestigationEntityRef[];
  objectives: readonly InvestigationObjective[];
  constraints: readonly InvestigationConstraint[];
  sources: readonly InvestigationSourceRef[];
  budgets: InvestigationBudgets;
  freshness: InvestigationFreshness;
  reviewCheckpoints: readonly InvestigationReviewCheckpoint[];
  status: InvestigationOrchestrationState;
  /** Monotonic plan version; planner (PR2) bumps this — PR1 keeps at 0 or 1. */
  planVersion: number;
  resume: InvestigationResumePointers;
  /** Optional projections onto existing product surfaces. */
  projections: {
    interrogativeState: InterrogativeWorkspaceState | null;
    researchWorkbenchStatus: ResearchWorkbenchRunStatus | null;
    boundedAgentBound: boolean;
    orchestratorBound: boolean;
  };
  createdAt: string;
  updatedAt: string;
  contentHash: string;
  note: string;
  honesty: {
    fixturesAreNotLiveEvidence: true;
    plannerNotImplemented: true;
    routerNotImplemented: true;
    noNewAgentFramework: true;
    noParallelKnowledgeGraph: true;
    gateCAutoApprove: false;
    cdsPhi: false;
    scientificApproval: false;
    graphPromotable: false;
    liveSscE2eSuccessClaimed: false;
    resumeUsesExistingCheckpoints: true;
    neonRedWaveOnly: true;
  };
};

export type InvestigationOrchestrationPack = {
  schemaVersion: "hsi-investigation-orchestration-pack-1";
  method: typeof INVESTIGATION_ORCHESTRATION_METHOD;
  version: typeof INVESTIGATION_ORCHESTRATION_VERSION;
  generatedAt: string;
  contracts: readonly ScientificInvestigationContract[];
  capabilityRegistryIds: readonly string[];
  honesty: ScientificInvestigationContract["honesty"];
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
const HEX24 = /^hsi-investigation-[a-f0-9]{24}$/;

const TERMINAL: ReadonlySet<InvestigationOrchestrationState> = new Set([
  "completed",
  "completed_with_limitations",
  "failed",
  "cancelled",
]);

/** Allowed directed edges for fail-closed transitions. */
const ALLOWED_TRANSITIONS: Readonly<
  Record<InvestigationOrchestrationState, readonly InvestigationOrchestrationState[]>
> = {
  draft: ["planning", "cancelled"],
  planning: ["awaiting_researcher_approval", "draft", "cancelled", "failed"],
  awaiting_researcher_approval: ["running", "planning", "paused", "cancelled"],
  running: [
    "awaiting_external_dependency",
    "awaiting_scientific_review",
    "paused",
    "completed_with_limitations",
    "completed",
    "failed",
    "cancelled",
  ],
  awaiting_external_dependency: ["running", "paused", "failed", "cancelled"],
  awaiting_scientific_review: [
    "completed",
    "completed_with_limitations",
    "paused",
    "failed",
    "cancelled",
    "running",
  ],
  paused: ["running", "planning", "awaiting_researcher_approval", "cancelled", "failed"],
  completed_with_limitations: [],
  completed: [],
  failed: [],
  cancelled: [],
};

function fail(message: string): never {
  throw new Error(message);
}

function textOk(value: string, max: number): boolean {
  const t = value.trim();
  return t.length >= 1 && t.length <= max;
}

function isoOk(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function assertId(id: string, label: string): string {
  const t = id.trim();
  if (!ID.test(t)) fail(`Invalid ${label}`);
  return t;
}

function defaultBudgets(): InvestigationBudgets {
  return {
    maxStages: INVESTIGATION_BOUNDED_STAGE_IDS.length,
    maxToolCallsPerStage: 8,
    maxWallClockMs: 120_000,
    maxExternalFetches: 24,
  };
}

function defaultHonesty(): ScientificInvestigationContract["honesty"] {
  return {
    fixturesAreNotLiveEvidence: true,
    plannerNotImplemented: true,
    routerNotImplemented: true,
    noNewAgentFramework: true,
    noParallelKnowledgeGraph: true,
    gateCAutoApprove: false,
    cdsPhi: false,
    scientificApproval: false,
    graphPromotable: false,
    liveSscE2eSuccessClaimed: false,
    resumeUsesExistingCheckpoints: true,
    neonRedWaveOnly: true,
  };
}

function hashContract(body: Omit<ScientificInvestigationContract, "contentHash">): string {
  return createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex");
}

function assertHonesty(c: ScientificInvestigationContract): void {
  if (c.honesty.gateCAutoApprove !== false) fail("Gate C auto-approve refused");
  if (c.honesty.cdsPhi !== false) fail("CDS/PHI refused");
  if (c.honesty.scientificApproval !== false || c.honesty.graphPromotable !== false) {
    fail("Investigation must stay unapproved / non-promotable");
  }
  if (c.honesty.liveSscE2eSuccessClaimed !== false) fail("Live SSc E2E success must not be claimed");
  if (c.honesty.plannerNotImplemented !== true || c.honesty.routerNotImplemented !== true) {
    fail("PR1 must not claim planner/router implemented");
  }
  if (c.honesty.noNewAgentFramework !== true || c.honesty.noParallelKnowledgeGraph !== true) {
    fail("New agent framework / parallel KG refused");
  }
  if (c.honesty.resumeUsesExistingCheckpoints !== true) {
    fail("Resume must reference existing checkpoints");
  }
  if (c.resume.usesExistingDurableCheckpoints !== true || c.resume.parallelCheckpointStoreInvented !== false) {
    fail("Parallel checkpoint store refused");
  }
  for (const cp of c.reviewCheckpoints) {
    if (cp.required !== true) fail("Review checkpoints remain required");
    if (cp.gateCAutoApprove !== false) fail("Review checkpoint cannot auto-approve Gate C");
    if (cp.status === "waived_not_allowed") fail("Waiving required review checkpoints is not allowed");
  }
}

export function validateScientificInvestigationContract(
  contract: ScientificInvestigationContract,
): void {
  if (contract.schemaVersion !== INVESTIGATION_ORCHESTRATION_SCHEMA) {
    fail("Unsupported investigation orchestration schema");
  }
  if (contract.method !== INVESTIGATION_ORCHESTRATION_METHOD) {
    fail("Unsupported investigation orchestration method");
  }
  if (!ID.test(contract.investigationId) && !HEX24.test(contract.investigationId)) {
    fail("Invalid investigationId");
  }
  if (!textOk(contract.question, 500)) fail("Question must be 1–500 characters");
  if (!INVESTIGATION_ORCHESTRATION_STATES.includes(contract.status)) fail("Invalid status");
  if (!Number.isInteger(contract.planVersion) || contract.planVersion < 0 || contract.planVersion > 10_000) {
    fail("Invalid planVersion");
  }
  if (!isoOk(contract.createdAt) || !isoOk(contract.updatedAt)) fail("Invalid timestamps");
  if (Date.parse(contract.updatedAt) < Date.parse(contract.createdAt)) {
    fail("updatedAt precedes createdAt");
  }
  if (contract.entities.length > 64 || contract.objectives.length > 32) fail("Too many entities/objectives");
  if (contract.constraints.length > 32 || contract.sources.length > 64) fail("Too many constraints/sources");
  if (contract.reviewCheckpoints.length > 24) fail("Too many review checkpoints");
  if (contract.authScope.authenticated && !contract.authScope.principalId?.trim()) {
    fail("Authenticated scope requires principalId");
  }
  if (!contract.authScope.authenticated && contract.authScope.principalId !== null) {
    fail("Unauthenticated scope must keep principalId null");
  }
  if (contract.resume.checkpointInvestigationId !== contract.investigationId) {
    fail("Resume checkpoint investigationId must match contract investigationId");
  }
  for (const stageId of contract.resume.boundedStageIds) {
    if (!(INVESTIGATION_BOUNDED_STAGE_IDS as readonly string[]).includes(stageId)) {
      fail(`Unknown bounded stage id: ${stageId}`);
    }
  }
  if (
    contract.resume.lastCompletedCheckpointTaskId !== null &&
    !(INVESTIGATION_BOUNDED_STAGE_IDS as readonly string[]).includes(
      contract.resume.lastCompletedCheckpointTaskId,
    ) &&
    !ID.test(contract.resume.lastCompletedCheckpointTaskId)
  ) {
    fail("Invalid lastCompletedCheckpointTaskId");
  }
  const {budgets} = contract;
  if (
    !Number.isInteger(budgets.maxStages) ||
    budgets.maxStages < 1 ||
    budgets.maxStages > 24 ||
    !Number.isInteger(budgets.maxToolCallsPerStage) ||
    budgets.maxToolCallsPerStage < 0 ||
    budgets.maxToolCallsPerStage > 64 ||
    !Number.isFinite(budgets.maxWallClockMs) ||
    budgets.maxWallClockMs < 1_000 ||
    budgets.maxWallClockMs > 3_600_000 ||
    !Number.isInteger(budgets.maxExternalFetches) ||
    budgets.maxExternalFetches < 0 ||
    budgets.maxExternalFetches > 500
  ) {
    fail("Invalid budgets");
  }
  assertHonesty(contract);
  const body: Omit<ScientificInvestigationContract, "contentHash"> = {...contract};
  delete (body as {contentHash?: string}).contentHash;
  const expected = hashContract(body);
  if (contract.contentHash !== expected) fail("Investigation contentHash mismatch");
}

export type DraftScientificInvestigationInput = {
  investigationId?: string;
  question: string;
  domain?: ScientificInvestigationContract["domain"];
  authScope?: Partial<InvestigationAuthScope>;
  entities?: readonly InvestigationEntityRef[];
  objectives?: readonly InvestigationObjective[];
  constraints?: readonly InvestigationConstraint[];
  sources?: readonly InvestigationSourceRef[];
  budgets?: Partial<InvestigationBudgets>;
  freshness?: Partial<InvestigationFreshness>;
  note?: string;
  createdAt?: string;
  /** Fixture / engineering drafts must keep fixture honesty. */
  fixtureHonesty?: boolean;
};

/**
 * Create a draft investigation contract bound to existing bounded-agent stage ids.
 */
export function draftScientificInvestigation(
  input: DraftScientificInvestigationInput,
): ScientificInvestigationContract {
  const question = input.question.trim();
  if (!textOk(question, 500)) fail("Question must be 1–500 characters");
  const createdAt = input.createdAt ?? new Date().toISOString();
  if (!isoOk(createdAt)) fail("Invalid createdAt");

  const investigationId =
    input.investigationId?.trim() ||
    `hsi-inv-${createHash("sha256").update(`${question}:${createdAt}`).digest("hex").slice(0, 24)}`;
  assertId(investigationId, "investigationId");

  const authScope: InvestigationAuthScope = {
    principalId: input.authScope?.principalId ?? null,
    authenticated: input.authScope?.authenticated === true,
    roles: input.authScope?.roles?.length
      ? [...input.authScope.roles]
      : (["researcher"] as const),
    dataClass: input.authScope?.dataClass ?? "synthetic_demo",
  };
  if (authScope.authenticated && !authScope.principalId?.trim()) {
    fail("Authenticated draft requires principalId");
  }
  if (!authScope.authenticated) authScope.principalId = null;

  const reviewCheckpoints: InvestigationReviewCheckpoint[] = [
    {
      id: "cp-researcher-approval",
      kind: "researcher_approval",
      required: true,
      status: "pending",
      note: "Researcher must approve the investigation plan before running (PR2 planner will populate plan).",
      gateCAutoApprove: false,
    },
    {
      id: "cp-scientific-review",
      kind: "scientific_review",
      required: true,
      status: "pending",
      note: "Authenticated scientific review required before any graph promotion or claim acceptance.",
      gateCAutoApprove: false,
    },
  ];

  const constraints: InvestigationConstraint[] = [
    {
      id: "c-no-phi",
      kind: "no_phi",
      text: "No PHI / live CDS payloads in HSI investigation contracts.",
    },
    {
      id: "c-no-gate-c",
      kind: "no_gate_c_auto_approve",
      text: "Gate C auto-approve is refused; human review remains mandatory.",
    },
    {
      id: "c-human-review",
      kind: "human_review_required",
      text: "Scientific review checkpoint must stay pending until an authenticated reviewer acts.",
    },
    ...(input.constraints ?? []),
  ];

  const body: Omit<ScientificInvestigationContract, "contentHash"> = {
    schemaVersion: INVESTIGATION_ORCHESTRATION_SCHEMA,
    method: INVESTIGATION_ORCHESTRATION_METHOD,
    version: INVESTIGATION_ORCHESTRATION_VERSION,
    investigationId,
    authScope,
    question,
    domain: input.domain ?? "unscoped_research",
    entities: [...(input.entities ?? [])],
    objectives: [...(input.objectives ?? [])],
    constraints,
    sources: [...(input.sources ?? [])],
    budgets: {...defaultBudgets(), ...(input.budgets ?? {})},
    freshness: {
      asOf: input.freshness?.asOf ?? createdAt,
      maxAgeDays: input.freshness?.maxAgeDays ?? null,
      stale: input.freshness?.stale ?? null,
    },
    reviewCheckpoints,
    status: "draft",
    planVersion: 0,
    resume: {
      checkpointInvestigationId: investigationId,
      boundedStageIds: [...INVESTIGATION_BOUNDED_STAGE_IDS],
      lastCompletedCheckpointTaskId: null,
      lastFencedArtifactRef: null,
      usesExistingDurableCheckpoints: true,
      parallelCheckpointStoreInvented: false,
    },
    projections: {
      interrogativeState: "draft",
      researchWorkbenchStatus: null,
      boundedAgentBound: true,
      orchestratorBound: true,
    },
    createdAt,
    updatedAt: createdAt,
    note:
      input.note?.trim() ||
      "M6 PR1 draft investigation contract — planner/router not implemented; fixtures ≠ live.",
    honesty: defaultHonesty(),
  };

  if (input.fixtureHonesty === false && authScope.dataClass === "synthetic_demo") {
    fail("synthetic_demo drafts require fixture honesty (default)");
  }

  const contract: ScientificInvestigationContract = {
    ...body,
    contentHash: hashContract(body),
  };
  validateScientificInvestigationContract(contract);
  return contract;
}

export function canTransitionInvestigationState(
  from: InvestigationOrchestrationState,
  to: InvestigationOrchestrationState,
): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function transitionInvestigationState(
  contract: ScientificInvestigationContract,
  to: InvestigationOrchestrationState,
  input: {
    updatedAt?: string;
    note?: string;
    lastCompletedCheckpointTaskId?: string | null;
    lastFencedArtifactRef?: string | null;
    satisfyReviewCheckpointId?: string;
  } = {},
): ScientificInvestigationContract {
  validateScientificInvestigationContract(contract);
  if (!canTransitionInvestigationState(contract.status, to)) {
    fail(`Illegal investigation transition ${contract.status} → ${to}`);
  }
  if (TERMINAL.has(contract.status)) fail("Terminal investigation cannot transition");

  const updatedAt = input.updatedAt ?? new Date().toISOString();
  if (!isoOk(updatedAt)) fail("Invalid updatedAt");
  if (Date.parse(updatedAt) < Date.parse(contract.updatedAt)) {
    fail("updatedAt must not move backwards");
  }

  let reviewCheckpoints = contract.reviewCheckpoints.map((c) => ({...c}));
  if (input.satisfyReviewCheckpointId) {
    const idx = reviewCheckpoints.findIndex((c) => c.id === input.satisfyReviewCheckpointId);
    if (idx < 0) fail("Unknown review checkpoint");
    const current = reviewCheckpoints[idx]!;
    if (current.status === "waived_not_allowed") fail("Cannot satisfy waived_not_allowed checkpoint");
    reviewCheckpoints[idx] = {...current, status: "satisfied"};
  }

  // Researcher approval required before entering running.
  if (to === "running" && contract.status === "awaiting_researcher_approval") {
    const approval = reviewCheckpoints.find((c) => c.kind === "researcher_approval");
    if (!approval || approval.status !== "satisfied") {
      fail("Researcher approval checkpoint must be satisfied before running");
    }
  }

  // Entering awaiting_scientific_review keeps scientific checkpoint pending unless already satisfied.
  if (to === "awaiting_scientific_review") {
    reviewCheckpoints = reviewCheckpoints.map((c) =>
      c.kind === "scientific_review" && c.status !== "satisfied" ? {...c, status: "pending"} : c,
    );
  }

  // completed requires scientific review satisfied.
  if (to === "completed") {
    const sci = reviewCheckpoints.find((c) => c.kind === "scientific_review");
    if (!sci || sci.status !== "satisfied") {
      fail("completed requires satisfied scientific_review checkpoint; use completed_with_limitations");
    }
  }

  const nextBody: Omit<ScientificInvestigationContract, "contentHash"> = {
    ...contract,
    status: to,
    reviewCheckpoints,
    resume: {
      ...contract.resume,
      lastCompletedCheckpointTaskId:
        input.lastCompletedCheckpointTaskId !== undefined
          ? input.lastCompletedCheckpointTaskId
          : contract.resume.lastCompletedCheckpointTaskId,
      lastFencedArtifactRef:
        input.lastFencedArtifactRef !== undefined
          ? input.lastFencedArtifactRef
          : contract.resume.lastFencedArtifactRef,
    },
    projections: {
      ...contract.projections,
      interrogativeState: projectToInterrogativeState(to),
      researchWorkbenchStatus: projectToResearchWorkbenchStatus(to, contract.projections.researchWorkbenchStatus),
    },
    updatedAt,
    note: input.note?.trim() || contract.note,
    honesty: defaultHonesty(),
  };
  delete (nextBody as {contentHash?: string}).contentHash;

  const next: ScientificInvestigationContract = {
    ...nextBody,
    contentHash: hashContract(nextBody),
  };
  validateScientificInvestigationContract(next);
  return next;
}

/** Map M6 lifecycle → existing interrogative workspace state (lossy, honest). */
export function projectToInterrogativeState(
  status: InvestigationOrchestrationState,
): InterrogativeWorkspaceState {
  switch (status) {
    case "draft":
    case "planning":
    case "awaiting_researcher_approval":
    case "running":
    case "awaiting_external_dependency":
    case "paused":
      return "draft";
    case "awaiting_scientific_review":
      return "awaiting_scientific_review";
    case "completed":
    case "completed_with_limitations":
      return "reviewed";
    case "failed":
    case "cancelled":
      return "rejected";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Map M6 lifecycle → research workbench run status when a deterministic run exists.
 * Running/incomplete states keep prior status or null.
 */
export function projectToResearchWorkbenchStatus(
  status: InvestigationOrchestrationState,
  prior: ResearchWorkbenchRunStatus | null,
): ResearchWorkbenchRunStatus | null {
  switch (status) {
    case "completed":
      return prior ?? "evidence_found";
    case "completed_with_limitations":
      return prior ?? "insufficient_evidence";
    case "failed":
    case "cancelled":
      return prior ?? "insufficient_evidence";
    case "draft":
    case "planning":
    case "awaiting_researcher_approval":
    case "running":
    case "awaiting_external_dependency":
    case "awaiting_scientific_review":
    case "paused":
      return prior;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Thin bind: attach contract identity to an existing bounded-agent investigation id.
 * Does not run the agent — only validates id alignment for orchestration hosts.
 */
export function bindContractToBoundedAgentInvestigation(
  contract: ScientificInvestigationContract,
  boundedInvestigationId: string,
): ScientificInvestigationContract {
  validateScientificInvestigationContract(contract);
  const id = boundedInvestigationId.trim();
  if (!ID.test(id) && !HEX24.test(id)) fail("Invalid bounded investigation id");
  if (id !== contract.investigationId) {
    fail("Bounded agent investigationId must equal contract investigationId (no dual identities)");
  }
  const body: Omit<ScientificInvestigationContract, "contentHash"> = {
    ...contract,
    resume: {
      ...contract.resume,
      checkpointInvestigationId: id,
      boundedStageIds: [...INVESTIGATION_BOUNDED_STAGE_IDS],
      usesExistingDurableCheckpoints: true,
      parallelCheckpointStoreInvented: false,
    },
    projections: {
      ...contract.projections,
      boundedAgentBound: true,
      orchestratorBound: true,
    },
    honesty: defaultHonesty(),
  };
  delete (body as {contentHash?: string}).contentHash;
  const next: ScientificInvestigationContract = {...body, contentHash: hashContract(body)};
  validateScientificInvestigationContract(next);
  return next;
}

/** Persistence projection lines for research-brief / ledger notes (no new table). */
export function projectInvestigationContractPersistenceLines(
  contract: ScientificInvestigationContract,
): string[] {
  validateScientificInvestigationContract(contract);
  return [
    `m6.investigation id=${contract.investigationId} status=${contract.status} planVersion=${contract.planVersion}`,
    `m6.resume checkpoints=existing lastTask=${contract.resume.lastCompletedCheckpointTaskId ?? "none"}`,
    `m6.projections interrogative=${contract.projections.interrogativeState ?? "none"} workbench=${contract.projections.researchWorkbenchStatus ?? "none"}`,
    `m6.honesty planner=not_implemented router=not_implemented gateC=false liveSscE2e=false`,
  ];
}

/** Capability registry ids declared for this PR1 pack (documentation + tests). */
export const M6_PR1_CAPABILITY_REGISTRY_IDS = [
  "m1.dynamic_retrieval",
  "m1.provenance_persist",
  "m2.structured_comparison",
  "m2.opposing_search",
  "m2.gap_verification",
  "m3.hypothesis_registry",
  "m4.translational_contracts",
  "m4.failure_taxonomy",
  "m5.precision_contracts",
  "orch.agent_orchestrator",
  "orch.checkpoints",
  "orch.fenced_artifacts",
  "orch.bounded_agent_execution",
  "orch.research_workbench",
  "orch.interrogative_workspace",
  "m6.investigation_contract",
] as const;

export function buildInvestigationOrchestrationPack(input: {
  contracts: readonly ScientificInvestigationContract[];
  generatedAt?: string;
}): InvestigationOrchestrationPack {
  if (!input.contracts.length) fail("Pack requires at least one contract");
  if (input.contracts.length > 32) fail("Too many contracts in pack");
  for (const c of input.contracts) validateScientificInvestigationContract(c);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!isoOk(generatedAt)) fail("Invalid generatedAt");
  return {
    schemaVersion: "hsi-investigation-orchestration-pack-1",
    method: INVESTIGATION_ORCHESTRATION_METHOD,
    version: INVESTIGATION_ORCHESTRATION_VERSION,
    generatedAt,
    contracts: [...input.contracts],
    capabilityRegistryIds: [...M6_PR1_CAPABILITY_REGISTRY_IDS],
    honesty: defaultHonesty(),
  };
}
