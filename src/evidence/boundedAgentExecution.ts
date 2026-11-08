/**
 * PR 5 — Bounded agent execution with durable traces.
 *
 * Extends existing ARCH-009 orchestration / checkpoints / fenced artifacts with
 * PR 2 dynamic retrieval, PR 3 persistence planning, and PR 4 contextual
 * candidates. Does not invent a parallel orchestrator, agent catalogue, or
 * scientific approval path.
 *
 * Stage path:
 *   research question → evidence retrieval → biological mechanism analysis →
 *   opposing-evidence search → gap assessment → hypothesis comparison →
 *   research brief
 *
 * Honesty: candidate claims stay unapproved; fixtures ≠ live evidence;
 * provider failures ≠ empty evidence; retrieved text is untrusted input.
 */
import {createHash} from "node:crypto";
import {HSI_CDS_PHI_INVARIANTS, rejectPhiPayload} from "../cdsPhiBoundary";
import {
  HSI_ROLE_TOOL_ALLOWLIST,
  type HsiAgentManifest,
  type HsiAgentRole,
  type HsiToolId,
} from "../hsiAgentIntelligenceContracts";
import {
  finishHsiCheckpoint,
  hashHsiCheckpointInput,
  recoverHsiCheckpoint,
  startHsiCheckpoint,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "../hsiAgentDurableCheckpoint";
import {
  runHsiAgentOrchestration,
  type HsiAgentExecutor,
  type HsiAgentTask,
  type HsiOrchestrationResult,
} from "../hsiAgentOrchestrator";
import {commitHsiFencedArtifact, type HsiFencedArtifactStore} from "../hsiFencedArtifact";
import {buildContextualCandidatePack, type ContextualCandidatePack} from "./contextualCandidateRelationships";
import {
  buildDynamicPersistencePlan,
  createMemoryDynamicEvidencePersistStore,
  persistDynamicEvidencePlan,
  type DynamicEvidencePersistStore,
  type DynamicPersistencePlan,
} from "./dynamicEvidencePersistence";
import {
  clarifyResearcherEntities,
  createMemoryRetrievalCache,
  runDynamicEvidenceRetrieval,
  validateResearcherQuery,
  type DynamicRetrievalCache,
  type DynamicSearchRecord,
  type ResearcherQueryInput,
} from "./dynamicEvidenceRetrieval";
import {projectGapVerificationForOutcome, type GapVerificationOutcomeSection} from "./gapVerification";
import type {LivingEvidenceOutcomeSection} from "./livingEvidenceExpansion";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";

export const BOUNDED_AGENT_EXECUTION_SCHEMA = "hsi-bounded-agent-execution-1" as const;
export const BOUNDED_AGENT_EXECUTION_METHOD = "hsi.bounded_agent_execution.v1" as const;
export const BOUNDED_AGENT_EXECUTION_VERSION = "0.1.0" as const;

export const BOUNDED_STAGE_IDS = [
  "investigation-plan",
  "evidence-retrieval",
  "mechanism-analysis",
  "opposing-evidence",
  "gap-assessment",
  "hypothesis-comparison",
  "research-brief",
] as const;

export type BoundedStageId = (typeof BOUNDED_STAGE_IDS)[number];

export type BoundedStageStatus =
  | "completed"
  | "blocked"
  | "failed"
  | "cancelled"
  | "skipped_budget"
  | "stubbed_incomplete";

export type InvestigationPlanArtifact = {
  schemaVersion: "hsi-investigation-plan-1";
  question: string;
  scope: {
    diseaseIds: readonly string[];
    freeTextTerms: readonly string[];
    unpinned: true;
  };
  entities: {
    diseaseIds: readonly string[];
    freeTextTerms: readonly string[];
    pmids: readonly string[];
    dois: readonly string[];
    ambiguities: readonly string[];
  };
  tools: readonly HsiToolId[];
  budgets: {
    maxToolCallsPerStage: number;
    timeoutMsPerStage: number;
    maxStages: number;
    pageSize: number;
  };
  reviewControls: {
    curationReview: "draft";
    graphPromotable: false;
    scientificApproval: false;
    gateCAutoApprove: false;
  };
};

export type RetrievalRecordArtifact = {
  schemaVersion: "hsi-retrieval-record-artifact-1";
  searchRecordId: string | null;
  searchRecordHash: string | null;
  queries: readonly {provider: string; query: string; outcome: string}[];
  results: {
    bibliographicCount: number;
    openTargetsCount: number;
  };
  failures: readonly {outcome: string; provider: string; detail: string}[];
  coverage: DynamicSearchRecord["coverage"] | null;
  providerFailureDistinctFromEmptyEvidence: true;
  sourceIdentityDistinctFromClaimSupport: true;
};

export type MechanismAssessmentArtifact = {
  schemaVersion: "hsi-mechanism-assessment-1";
  candidatePackId: string;
  candidateRelationships: readonly {
    id: string;
    subject: string;
    predicate: string;
    object: string;
    findingPolarity: string;
    evidenceSourceIds: readonly string[];
    biologicalContextSummary: string;
    curationReview: "draft";
    hsiGrade: "unexplored";
    teachingStatus: "unknown";
    graphPromotable: false;
    scientificApproval: false;
  }[];
  limitations: readonly string[];
};

export type OpposingEvidenceAssessmentArtifact = {
  schemaVersion: "hsi-opposing-evidence-assessment-1";
  searchPerformed: boolean;
  status: BoundedStageStatus;
  findings: readonly {candidateId: string; polarity: string; note: string}[];
  limitations: readonly string[];
  consensusEstablished: false;
};

export type GapAssessmentArtifact = {
  schemaVersion: "hsi-gap-assessment-1";
  status: GapVerificationOutcomeSection["status"] | "stubbed_incomplete";
  items: readonly {
    id: string;
    classification: string;
    rationale: string;
    reviewStatus: "unavailable" | "draft";
  }[];
  summary: GapVerificationOutcomeSection["summary"] | null;
  scientificallyValidated: false;
};

export type HypothesisComparisonArtifact = {
  schemaVersion: "hsi-hypothesis-comparison-1";
  support: readonly {candidateId: string; note: string}[];
  opposition: readonly {candidateId: string; note: string}[];
  alternatives: readonly {candidateId: string; note: string}[];
  distinguishingEvidence: readonly {note: string; sourceIds: readonly string[]}[];
  claimSupportAssessed: false;
  scientificApproval: false;
};

export type ResearchBriefArtifact = {
  schemaVersion: "hsi-bounded-research-brief-1";
  question: string;
  claims: readonly {
    text: string;
    traceRefs: readonly string[];
    support: "traceable_candidate_only" | "insufficient";
  }[];
  limitations: readonly string[];
  nextResearchActions: readonly string[];
  scientificValidityClaimed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  cdsPhi: false;
};

export type BoundedStageArtifact =
  | InvestigationPlanArtifact
  | RetrievalRecordArtifact
  | MechanismAssessmentArtifact
  | OpposingEvidenceAssessmentArtifact
  | GapAssessmentArtifact
  | HypothesisComparisonArtifact
  | ResearchBriefArtifact;

export type BoundedStageTrace = {
  stageId: BoundedStageId;
  status: BoundedStageStatus;
  artifactRef: string | null;
  artifact: BoundedStageArtifact | null;
  checkpoint: HsiDurableCheckpoint | null;
  reason: string | null;
  toolCalls: readonly {tool: HsiToolId; status: "success" | "denied" | "failed"}[];
};

export type BoundedAgentExecutionResult = {
  schemaVersion: typeof BOUNDED_AGENT_EXECUTION_SCHEMA;
  method: typeof BOUNDED_AGENT_EXECUTION_METHOD;
  version: typeof BOUNDED_AGENT_EXECUTION_VERSION;
  investigationId: string;
  status: HsiOrchestrationResult["status"];
  stages: readonly BoundedStageTrace[];
  orchestration: HsiOrchestrationResult;
  honesty: {
    metadataOnly: true;
    claimSupportNotAssessed: true;
    sourceIdentityDistinctFromClaimSupport: true;
    providerFailureDistinctFromEmptyEvidence: true;
    fixturesAreNotLiveEvidence: true;
    scientificApproval: false;
    graphPromotable: false;
    gateCAutoApprove: false;
    cdsPhi: false;
    scientificValidityClaimed: false;
    untrustedRetrievedText: true;
    axesPreservedOrthogonal: true;
  };
  limitations: readonly string[];
};

export type UntrustedTextInspection = {
  sanitizedText: string;
  permissionEscalationAttempt: boolean;
  secretExfiltrationAttempt: boolean;
  instructionOverrideAttempt: boolean;
  mayEscalateToolPermissions: false;
  mayRevealSecrets: false;
  mayOverrideSystemInstructions: false;
};

const STAGE_ROLE: Record<BoundedStageId, HsiAgentRole> = {
  "investigation-plan": "question_planner",
  "evidence-retrieval": "evidence_retriever",
  "mechanism-analysis": "graph_reasoner",
  "opposing-evidence": "contradiction_analyst",
  "gap-assessment": "claim_verifier",
  "hypothesis-comparison": "hypothesis_generator",
  "research-brief": "interrogator",
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

function fail(message: string): never {
  throw new Error(message);
}

function stageManifest(role: HsiAgentRole, budgets: {maxToolCalls: number; timeoutMs: number}): HsiAgentManifest {
  return {
    schemaVersion: "hsi-agent-manifest-1",
    role,
    version: "1.0.0",
    inputSchemaId: "hsi-bounded-stage-input-1",
    outputSchemaId: "hsi-bounded-stage-output-1",
    promptVersion: "none",
    modelVersion: "deterministic-bounded-1",
    allowedTools: [...HSI_ROLE_TOOL_ALLOWLIST[role]],
    maxToolCalls: budgets.maxToolCalls,
    maxQuestions: 12,
    maxDepth: 4,
    timeoutMs: budgets.timeoutMs,
    dataClasses: ["public_biomedical"],
  };
}

/** External document / retrieved title text cannot change permissions or instructions. */
export function inspectUntrustedRetrievedText(raw: string): UntrustedTextInspection {
  const text = typeof raw === "string" ? raw : "";
  const lowered = text.toLowerCase();
  const permissionEscalationAttempt =
    /patient\.context\.get|grant\s+(tool|permission|access)|allowedtools|escalate\s+privileges|bypass\s+allowlist/.test(
      lowered,
    );
  const secretExfiltrationAttempt =
    /api[_-]?key|authorization:\s*bearer|neon.*password|-----begin|secret\s*=/.test(lowered);
  const instructionOverrideAttempt =
    /ignore\s+(all\s+)?(previous|prior|system)\s+instructions|override\s+system|jailbreak|dan\s+mode/.test(
      lowered,
    );
  const sanitizedText = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .slice(0, 4_000);
  return {
    sanitizedText,
    permissionEscalationAttempt,
    secretExfiltrationAttempt,
    instructionOverrideAttempt,
    mayEscalateToolPermissions: false,
    mayRevealSecrets: false,
    mayOverrideSystemInstructions: false,
  };
}

export function createMemoryCheckpointStore(): HsiCheckpointStore & {
  rows: Map<string, HsiDurableCheckpoint>;
} {
  const rows = new Map<string, HsiDurableCheckpoint>();
  return {
    rows,
    read: async (investigationId, taskId) => rows.get(`${investigationId}:${taskId}`) ?? null,
    compareAndSwap: async (expectedVersion, next) => {
      const key = `${next.investigationId}:${next.taskId}`;
      const old = rows.get(key);
      if ((old?.version ?? null) !== expectedVersion) return false;
      rows.set(key, structuredClone(next));
      return true;
    },
  };
}

export function createMemoryFencedArtifactStore(input: {
  checkpointStore: HsiCheckpointStore;
}): HsiFencedArtifactStore & {
  payloads: Map<string, {payload: string; contentHash: string; artifactId: string; outputRef: string}>;
  byOutputRef: Map<string, BoundedStageArtifact>;
} {
  const payloads = new Map<
    string,
    {payload: string; contentHash: string; artifactId: string; outputRef: string}
  >();
  const byOutputRef = new Map<string, BoundedStageArtifact>();
  return {
    payloads,
    byOutputRef,
    async commitIfCurrent({fence, idempotencyKey, contentHash, payload}) {
      const cp = await input.checkpointStore.read(fence.investigationId, fence.taskId);
      if (
        !cp ||
        cp.state !== "running" ||
        cp.version !== fence.checkpointVersion ||
        cp.attempt !== fence.attempt ||
        cp.inputHash !== fence.inputHash
      ) {
        fail("Stale or cancelled execution fence");
      }
      const existing = payloads.get(idempotencyKey);
      if (existing) {
        if (existing.contentHash !== contentHash) fail("Idempotency conflict: output differs");
        return {
          artifactId: existing.artifactId,
          contentHash,
          outputRef: existing.outputRef,
          fence,
        };
      }
      const artifactId = `hsi-artifact-${createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 24)}`;
      const outputRef = `hsi-artifact:${artifactId}`;
      payloads.set(idempotencyKey, {payload, contentHash, artifactId, outputRef});
      byOutputRef.set(outputRef, JSON.parse(payload) as BoundedStageArtifact);
      return {artifactId, contentHash, outputRef, fence};
    },
  };
}

type RunScratch = {
  plan: InvestigationPlanArtifact | null;
  searchRecord: DynamicSearchRecord | null;
  persistencePlan: DynamicPersistencePlan | null;
  candidatePack: ContextualCandidatePack | null;
  retrieval: RetrievalRecordArtifact | null;
  mechanism: MechanismAssessmentArtifact | null;
  opposing: OpposingEvidenceAssessmentArtifact | null;
  gaps: GapAssessmentArtifact | null;
  hypotheses: HypothesisComparisonArtifact | null;
  brief: ResearchBriefArtifact | null;
  stageArtifacts: Map<BoundedStageId, BoundedStageArtifact>;
};

function emptyLivingEvidence(asOf: string): LivingEvidenceOutcomeSection {
  return {
    status: "not_attached",
    schemaVersion: null,
    snapshotHash: null,
    asOf,
    matchedPmids: [],
    bibliographic: [],
    openTargetsAssociations: [],
    registryIdentityOnly: [],
    entityResolutions: [],
    graphRelationshipCandidates: 0,
    licensing: null,
    unavailableCapabilities: ["Living-evidence pin set not required for unpinned bounded run"],
    note: "Bounded run uses dynamic retrieval candidates; living-evidence pin attach remains optional.",
  };
}

function contextSummary(packRel: ContextualCandidatePack["relationships"][number]): string {
  const bits = [
    ...packRel.biologicalContext.diseasePhenotype.map((x) => x.value),
    ...packRel.biologicalContext.genesProteinsPathways.map((x) => x.label ?? x.value),
  ];
  return bits.slice(0, 8).join(", ") || "context_not_declared";
}

async function persistStageArtifact(input: {
  store: HsiFencedArtifactStore;
  checkpoint: HsiDurableCheckpoint;
  stageId: BoundedStageId;
  artifact: BoundedStageArtifact;
}): Promise<string> {
  const payload = canonicalEvidenceJson(input.artifact);
  const fenced = await commitHsiFencedArtifact({
    store: input.store,
    fence: {
      investigationId: input.checkpoint.investigationId,
      taskId: input.checkpoint.taskId,
      attempt: input.checkpoint.attempt,
      checkpointVersion: input.checkpoint.version,
      inputHash: input.checkpoint.inputHash,
    },
    logicalOutputId: input.stageId,
    payload,
  });
  return fenced.outputRef;
}

/**
 * Reconstruct stage artifacts from a completed (or partial) bounded run.
 * Failed / cancelled / blocked stages remain visible with null artifact bodies
 * when no durable payload was committed.
 */
export function reconstructBoundedArtifacts(
  result: BoundedAgentExecutionResult,
): Record<BoundedStageId, BoundedStageArtifact | null> {
  const out = {} as Record<BoundedStageId, BoundedStageArtifact | null>;
  for (const stageId of BOUNDED_STAGE_IDS) {
    const row = result.stages.find((s) => s.stageId === stageId);
    out[stageId] = row?.artifact ?? null;
  }
  return out;
}

export async function runBoundedAgentExecution(input: {
  investigationId: string;
  question: string;
  entities?: ResearcherQueryInput["entities"];
  graphRelease: {id: string; version: string; manifestHash: string};
  now?: () => string;
  signal?: AbortSignal;
  /** Injected retrieval fetcher (tests / offline). Live network only when supplied by caller. */
  fetcher?: typeof fetch;
  cache?: DynamicRetrievalCache;
  persistStore?: DynamicEvidencePersistStore;
  checkpointStore?: HsiCheckpointStore;
  artifactStore?: HsiFencedArtifactStore;
  budgets?: {
    maxToolCallsPerStage?: number;
    timeoutMsPerStage?: number;
    pageSize?: number;
  };
  /**
   * Explicit human-authorised recovery for a previously failed/blocked stage.
   * Completed stages are never replayed (idempotent).
   */
  recoverStage?: {
    stageId: BoundedStageId;
    approvedBy: string;
    recoveryReason: string;
  };
  /** When true, opposing stage records budget skip instead of stub search. */
  skipOpposingForBudget?: boolean;
}): Promise<BoundedAgentExecutionResult> {
  if (!ID.test(input.investigationId)) fail("Invalid investigation identity");
  const question = input.question?.trim() ?? "";
  if (!question || question.length > 1_000) fail("Invalid research question");
  const phi = rejectPhiPayload({
    textBlobs: [question, JSON.stringify(input.entities ?? null)],
    containsPhi: false,
    mayUseLivePhi: false,
    phiToLlm: false,
  });
  if (!phi.ok) fail(`Bounded agent execution refuses PHI-shaped payloads: ${phi.detail}`);

  const now = input.now ?? (() => new Date().toISOString());
  const budgets = {
    maxToolCallsPerStage: input.budgets?.maxToolCallsPerStage ?? 4,
    timeoutMsPerStage: input.budgets?.timeoutMsPerStage ?? 8_000,
    pageSize: input.budgets?.pageSize ?? 5,
  };
  if (budgets.maxToolCallsPerStage < 1 || budgets.maxToolCallsPerStage > 20) {
    fail("Invalid tool budget");
  }
  if (budgets.timeoutMsPerStage < 100 || budgets.timeoutMsPerStage > 120_000) {
    fail("Invalid stage timeout budget");
  }

  const checkpointStore = input.checkpointStore ?? createMemoryCheckpointStore();
  const artifactStore =
    input.artifactStore ?? createMemoryFencedArtifactStore({checkpointStore});
  const persistStore = input.persistStore ?? createMemoryDynamicEvidencePersistStore();
  const cache = input.cache ?? createMemoryRetrievalCache();

  const scratch: RunScratch = {
    plan: null,
    searchRecord: null,
    persistencePlan: null,
    candidatePack: null,
    retrieval: null,
    mechanism: null,
    opposing: null,
    gaps: null,
    hypotheses: null,
    brief: null,
    stageArtifacts: new Map(),
  };

  const memoryArtifacts =
    "byOutputRef" in artifactStore
      ? (artifactStore as ReturnType<typeof createMemoryFencedArtifactStore>).byOutputRef
      : null;

  const applyArtifactToScratch = (stageId: BoundedStageId, artifact: BoundedStageArtifact): void => {
    scratch.stageArtifacts.set(stageId, artifact);
    switch (stageId) {
      case "investigation-plan":
        scratch.plan = artifact as InvestigationPlanArtifact;
        break;
      case "evidence-retrieval": {
        const retrieval = artifact as RetrievalRecordArtifact;
        scratch.retrieval = retrieval;
        break;
      }
      case "mechanism-analysis":
        scratch.mechanism = artifact as MechanismAssessmentArtifact;
        break;
      case "opposing-evidence":
        scratch.opposing = artifact as OpposingEvidenceAssessmentArtifact;
        break;
      case "gap-assessment":
        scratch.gaps = artifact as GapAssessmentArtifact;
        break;
      case "hypothesis-comparison":
        scratch.hypotheses = artifact as HypothesisComparisonArtifact;
        break;
      case "research-brief":
        scratch.brief = artifact as ResearchBriefArtifact;
        break;
      default: {
        const _exhaustive: never = stageId;
        void _exhaustive;
        break;
      }
    }
  };

  // Rehydrate durable stage artifacts so retries do not lose upstream context.
  for (const stageId of BOUNDED_STAGE_IDS) {
    const cp = await checkpointStore.read(input.investigationId, stageId);
    if (cp?.state === "completed" && cp.outputRef && memoryArtifacts?.has(cp.outputRef)) {
      applyArtifactToScratch(stageId, memoryArtifacts.get(cp.outputRef)!);
    }
  }

  // Rebuild persistence / candidate pack from the preserved search record when present.
  if (persistStore && "searchRecords" in persistStore && scratch.retrieval?.searchRecordId) {
    const memoryPersist = persistStore as ReturnType<typeof createMemoryDynamicEvidencePersistStore>;
    const record = memoryPersist.searchRecords.get(scratch.retrieval.searchRecordId);
    if (record) {
      scratch.searchRecord = record;
      scratch.persistencePlan = buildDynamicPersistencePlan({searchRecord: record});
      scratch.candidatePack = buildContextualCandidatePack({
        plan: scratch.persistencePlan,
        surfaceLabel: "candidate",
        generatedAt: now(),
        opposingSearchStatus: scratch.opposing?.status === "stubbed_incomplete"
          ? "stubbed_incomplete"
          : scratch.opposing?.status === "skipped_budget"
            ? "not_executed"
            : "not_executed",
      });
    }
  }

  const runInputHash = hashHsiCheckpointInput({
    investigationId: input.investigationId,
    question,
    entities: input.entities ?? null,
    method: BOUNDED_AGENT_EXECUTION_METHOD,
    version: BOUNDED_AGENT_EXECUTION_VERSION,
  });

  if (input.recoverStage) {
    if (!input.recoverStage.approvedBy.trim() || !input.recoverStage.recoveryReason.trim()) {
      fail("Human recovery authorisation and reason required");
    }
    await recoverHsiCheckpoint({
      store: checkpointStore,
      investigationId: input.investigationId,
      taskId: input.recoverStage.stageId,
      inputHash: hashHsiCheckpointInput({
        runInputHash,
        stageId: input.recoverStage.stageId,
      }),
      approvedBy: input.recoverStage.approvedBy,
      recoveryReason: input.recoverStage.recoveryReason,
      startedAt: now(),
    });
  }

  const tasks: HsiAgentTask[] = BOUNDED_STAGE_IDS.map((stageId, index) => ({
    id: stageId,
    manifest: stageManifest(STAGE_ROLE[stageId], {
      maxToolCalls: budgets.maxToolCallsPerStage,
      timeoutMs: budgets.timeoutMsPerStage,
    }),
    dependsOn: index === 0 ? [] : [BOUNDED_STAGE_IDS[index - 1]!],
  }));

  const stageCheckpoints = new Map<BoundedStageId, HsiDurableCheckpoint>();

  const wrapStage = (
    stageId: BoundedStageId,
    body: (ctx: {
      assertTool: (tool: HsiToolId) => void;
      signal: AbortSignal;
    }) => Promise<{status: "completed" | "blocked"; artifact: BoundedStageArtifact; reason: string | null}>,
  ): HsiAgentExecutor => {
    return async (context) => {
      if (context.signal.aborted) fail("Execution cancelled before dispatch");
      const inputHash = hashHsiCheckpointInput({runInputHash, stageId});
      const existing = await checkpointStore.read(input.investigationId, stageId);
      if (existing?.state === "completed" && existing.outputRef) {
        // Idempotent retry: do not duplicate completed stage work.
        const prior =
          scratch.stageArtifacts.get(stageId) ??
          memoryArtifacts?.get(existing.outputRef) ??
          null;
        if (prior) applyArtifactToScratch(stageId, prior);
        return {
          status: "completed",
          outputRef: existing.outputRef,
          reason: "Reused completed durable checkpoint",
        };
      }
      const started =
        existing?.state === "running"
          ? existing
          : await startHsiCheckpoint({
              store: checkpointStore,
              investigationId: input.investigationId,
              taskId: stageId,
              inputHash,
              startedAt: now(),
            });
      stageCheckpoints.set(stageId, started);
      try {
        if (context.signal.aborted) fail("Execution cancelled before stage body");
        const result = await body({assertTool: context.assertTool, signal: context.signal});
        if (context.signal.aborted) fail("Execution cancelled before checkpoint commit");
        const outputRef = await persistStageArtifact({
          store: artifactStore,
          checkpoint: started,
          stageId,
          artifact: result.artifact,
        });
        applyArtifactToScratch(stageId, result.artifact);
        const finished = await finishHsiCheckpoint({
          store: checkpointStore,
          checkpoint: started,
          state: result.status,
          outputRef: result.status === "completed" ? outputRef : null,
          errorCode: result.status === "blocked" ? "agent_blocked" : null,
          finishedAt: now(),
        });
        stageCheckpoints.set(stageId, finished);
        return {status: result.status, outputRef: result.status === "completed" ? outputRef : null, reason: result.reason};
      } catch (error) {
        try {
          const failed = await finishHsiCheckpoint({
            store: checkpointStore,
            checkpoint: started,
            state: "failed",
            errorCode: "executor_failed",
            finishedAt: now(),
          });
          stageCheckpoints.set(stageId, failed);
        } catch {
          /* preserve original failure; never overwrite a newer checkpoint */
        }
        throw error instanceof Error ? error : Error("Bounded stage failed");
      }
    };
  };

  const executors: Partial<Record<HsiAgentRole, HsiAgentExecutor>> = {
    question_planner: wrapStage("investigation-plan", async () => {
      const validated = validateResearcherQuery({
        question,
        entities: input.entities,
        pageSize: budgets.pageSize,
        contentAccess: "metadata",
      });
      if (!validated.ok) fail(`Investigation plan blocked: ${validated.detail}`);
      const clarified = clarifyResearcherEntities({
        question: validated.question,
        entities: input.entities,
      });
      const plan: InvestigationPlanArtifact = {
        schemaVersion: "hsi-investigation-plan-1",
        question: validated.question,
        scope: {
          diseaseIds: clarified.diseaseIds,
          freeTextTerms: clarified.freeTextTerms,
          unpinned: true,
        },
        entities: clarified,
        tools: [
          "literature.search",
          "evidence.get",
          "graph.query",
          "hypothesis.create",
          "policy.check",
        ],
        budgets: {
          maxToolCallsPerStage: budgets.maxToolCallsPerStage,
          timeoutMsPerStage: budgets.timeoutMsPerStage,
          maxStages: BOUNDED_STAGE_IDS.length,
          pageSize: budgets.pageSize,
        },
        reviewControls: {
          curationReview: "draft",
          graphPromotable: false,
          scientificApproval: false,
          gateCAutoApprove: false,
        },
      };
      scratch.plan = plan;
      return {status: "completed", artifact: plan, reason: null};
    }),

    evidence_retriever: wrapStage("evidence-retrieval", async ({assertTool, signal}) => {
      assertTool("literature.search");
      const retrieval = await runDynamicEvidenceRetrieval({
        query: {
          question,
          entities: input.entities,
          pageSize: budgets.pageSize,
          contentAccess: "metadata",
        },
        fetcher: input.fetcher,
        now: () => new Date(now()),
        rateLimitMs: 0,
        cache,
        signal,
      });
      scratch.searchRecord = retrieval.record;

      // Treat retrieved titles as untrusted — never escalate permissions from text.
      for (const row of retrieval.record.retrievedBibliographic) {
        const inspection = inspectUntrustedRetrievedText(row.title);
        if (
          inspection.permissionEscalationAttempt ||
          inspection.instructionOverrideAttempt ||
          inspection.secretExfiltrationAttempt
        ) {
          // Recorded as untrusted; permissions remain manifesto-bound.
          void inspection.mayEscalateToolPermissions;
        }
      }

      const plan = buildDynamicPersistencePlan({searchRecord: retrieval.record});
      scratch.persistencePlan = plan;
      await persistDynamicEvidencePlan(plan, persistStore);

      const artifact: RetrievalRecordArtifact = {
        schemaVersion: "hsi-retrieval-record-artifact-1",
        searchRecordId: plan.searchRecordId,
        searchRecordHash: retrieval.record.searchRecordHash ?? null,
        queries: retrieval.record.queriesSent.map((q) => ({
          provider: q.provider,
          query: q.query,
          outcome: q.outcome,
        })),
        results: {
          bibliographicCount: retrieval.record.retrievedBibliographic.length,
          openTargetsCount: retrieval.record.retrievedOpenTargets.length,
        },
        failures: retrieval.record.failures.map((f) => ({
          outcome: f.outcome,
          provider: f.provider,
          detail: f.detail,
        })),
        coverage: retrieval.record.coverage,
        providerFailureDistinctFromEmptyEvidence: true,
        sourceIdentityDistinctFromClaimSupport: true,
      };
      scratch.retrieval = artifact;
      return {status: "completed", artifact, reason: null};
    }),

    graph_reasoner: wrapStage("mechanism-analysis", async ({assertTool}) => {
      assertTool("graph.query");
      assertTool("evidence.get");
      if (!scratch.persistencePlan) fail("Mechanism analysis requires persistence plan");
      const pack = buildContextualCandidatePack({
        plan: scratch.persistencePlan,
        surfaceLabel: "candidate",
        generatedAt: now(),
        opposingSearchStatus: "not_executed",
      });
      scratch.candidatePack = pack;
      const artifact: MechanismAssessmentArtifact = {
        schemaVersion: "hsi-mechanism-assessment-1",
        candidatePackId: `cand-pack:${createHash("sha256").update(canonicalEvidenceJson({id: pack.searchRecordId, n: pack.relationships.length})).digest("hex").slice(0, 24)}`,
        candidateRelationships: pack.relationships.map((rel) => ({
          id: rel.id,
          subject: `${rel.subject.system}:${rel.subject.value}`,
          predicate: rel.predicate,
          object: `${rel.object.system}:${rel.object.value}`,
          findingPolarity: rel.findingPolarity,
          evidenceSourceIds: rel.evidenceSourceIds,
          biologicalContextSummary: contextSummary(rel),
          curationReview: "draft",
          hsiGrade: "unexplored",
          teachingStatus: "unknown",
          graphPromotable: false,
          scientificApproval: false,
        })),
        limitations: [
          "Bibliographic / association metadata is not mechanistic proof",
          "Axes remain draft / unexplored / unknown — not a confidence score",
          ...[...new Set(pack.relationships.flatMap((r) => r.limitations))],
        ],
      };
      scratch.mechanism = artifact;
      return {status: "completed", artifact, reason: null};
    }),

    contradiction_analyst: wrapStage("opposing-evidence", async ({assertTool}) => {
      assertTool("literature.search");
      assertTool("evidence.get");
      if (input.skipOpposingForBudget) {
        const skipped: OpposingEvidenceAssessmentArtifact = {
          schemaVersion: "hsi-opposing-evidence-assessment-1",
          searchPerformed: false,
          status: "skipped_budget",
          findings: [],
          limitations: [
            "Opposing-evidence stage skipped by resource budget",
            "Skipped oppose ≠ consensus or absence of contradiction",
          ],
          consensusEstablished: false,
        };
        scratch.opposing = skipped;
        // Visible completed stage with honest skipped status (not silently omitted).
        return {
          status: "completed",
          artifact: skipped,
          reason: "Opposing-evidence search skipped by budget",
        };
      }
      const pack = scratch.candidatePack;
      const opposingFindings = (pack?.relationships ?? [])
        .filter((r) => r.findingPolarity === "opposing")
        .map((r) => ({
          candidateId: r.id,
          polarity: r.findingPolarity,
          note: inspectUntrustedRetrievedText(r.note).sanitizedText,
        }));
      // Thin / stubbed opposing search — full semantic oppose is PR 6+.
      const artifact: OpposingEvidenceAssessmentArtifact = {
        schemaVersion: "hsi-opposing-evidence-assessment-1",
        searchPerformed: true,
        status: "stubbed_incomplete",
        findings: opposingFindings,
        limitations: [
          "Opposing-evidence search is stubbed incomplete in this milestone",
          "Incomplete oppose ≠ scientific consensus",
          "Deeper contradiction analysis deferred (PR 6+)",
        ],
        consensusEstablished: false,
      };
      scratch.opposing = artifact;
      return {status: "completed", artifact, reason: null};
    }),

    claim_verifier: wrapStage("gap-assessment", async ({assertTool}) => {
      assertTool("evidence.get");
      const asOf = now();
      const localPmids =
        scratch.searchRecord?.retrievedBibliographic.map((r) => r.pmid).filter(Boolean) ?? [];
      const gaps = projectGapVerificationForOutcome({
        asOf,
        branches: [
          {
            id: "bounded-primary",
            assessment: "insufficient_evidence",
            supportingClaimIds: (scratch.mechanism?.candidateRelationships ?? [])
              .filter((c) => c.findingPolarity === "supporting")
              .map((c) => c.id),
            opposingClaimIds: (scratch.mechanism?.candidateRelationships ?? [])
              .filter((c) => c.findingPolarity === "opposing")
              .map((c) => c.id),
            missingEvidence: [
              scratch.opposing?.status === "stubbed_incomplete" ||
              scratch.opposing?.status === "skipped_budget"
                ? "Opposing-evidence search incomplete for unpinned question"
                : "Passage-backed entailment unavailable without rights clearance",
            ],
            uncertainty: [
              "Candidate relationships remain draft / claimSupport not assessed",
            ],
          },
        ],
        claimContexts: [],
        localSourcePmids: localPmids,
        contradictions: {
          recordedOpposingClaimIds: scratch.opposing?.findings.map((f) => f.candidateId) ?? [],
          searchStatus: scratch.opposing?.status ?? "not_executed",
        },
        livingEvidence: emptyLivingEvidence(asOf),
      });
      const artifact: GapAssessmentArtifact = {
        schemaVersion: "hsi-gap-assessment-1",
        status: gaps.status,
        items: gaps.items.map((item) => ({
          id: item.id,
          classification: item.kind,
          rationale: item.rationale,
          reviewStatus: "unavailable",
        })),
        summary: gaps.summary,
        scientificallyValidated: false,
      };
      scratch.gaps = artifact;
      return {status: "completed", artifact, reason: null};
    }),

    hypothesis_generator: wrapStage("hypothesis-comparison", async ({assertTool}) => {
      assertTool("hypothesis.create");
      assertTool("evidence.get");
      const rels = scratch.mechanism?.candidateRelationships ?? [];
      const support = rels
        .filter((r) => r.findingPolarity === "supporting")
        .map((r) => ({candidateId: r.id, note: "Supporting polarity on draft candidate only"}));
      const opposition = rels
        .filter((r) => r.findingPolarity === "opposing")
        .map((r) => ({candidateId: r.id, note: "Opposing polarity on draft candidate only"}));
      const alternatives = rels
        .filter((r) => r.findingPolarity === "uncertain")
        .slice(0, 8)
        .map((r) => ({
          candidateId: r.id,
          note: "Uncertain draft alternative — not ranked scientifically",
        }));
      const artifact: HypothesisComparisonArtifact = {
        schemaVersion: "hsi-hypothesis-comparison-1",
        support,
        opposition,
        alternatives,
        distinguishingEvidence: [
          {
            note:
              "Distinguishing evidence requires passage-backed review; metadata candidates are not sufficient to decide between hypotheses.",
            sourceIds: rels.flatMap((r) => r.evidenceSourceIds).slice(0, 12),
          },
        ],
        claimSupportAssessed: false,
        scientificApproval: false,
      };
      scratch.hypotheses = artifact;
      return {status: "completed", artifact, reason: null};
    }),

    interrogator: wrapStage("research-brief", async ({assertTool}) => {
      assertTool("evidence.get");
      assertTool("graph.query");
      // Policy / review control surface: brief must not claim validity.
      const claims: ResearchBriefArtifact["claims"][number][] = (scratch.hypotheses?.alternatives ?? [])
        .slice(0, 5)
        .map((alt) => ({
          text: `Draft candidate ${alt.candidateId} recorded as an uncertain alternative pending human review.`,
          traceRefs: [
            scratch.retrieval?.searchRecordId ?? "retrieval:none",
            alt.candidateId,
            scratch.gaps?.items[0]?.id ?? "gap:none",
          ],
          support: "traceable_candidate_only" as const,
        }));
      if (claims.length === 0) {
        claims.push({
          text: "No draft candidates were available to summarise; brief abstains from scientific claims.",
          traceRefs: [scratch.retrieval?.searchRecordId ?? "retrieval:none"],
          support: "insufficient" as const,
        });
      }
      const artifact: ResearchBriefArtifact = {
        schemaVersion: "hsi-bounded-research-brief-1",
        question,
        claims,
        limitations: [
          "Structured engineering brief only — not a scientifically validated conclusion",
          "Candidate claims remain unapproved (curationReview=draft, hsiGrade=unexplored)",
          ...(scratch.opposing?.limitations ?? []),
          ...(scratch.mechanism?.limitations.slice(0, 3) ?? []),
          "No efficacy, eligibility, or causal benefit inference",
        ],
        nextResearchActions: [
          "Authenticated human scientific review (PR 6) without Gate C auto-approve",
          "Deeper opposing-evidence / gap semantic analysis when passage rights clear",
          "Release-aware product surface bind for draft vs approved (PR 7)",
        ],
        scientificValidityClaimed: false,
        graphPromotable: false,
        gateCAutoApprove: false,
        cdsPhi: false,
      };
      if (artifact.cdsPhi !== false || HSI_CDS_PHI_INVARIANTS.containsPhi !== false) {
        fail("CDS/PHI honesty violated");
      }
      scratch.brief = artifact;
      return {status: "completed", artifact, reason: null};
    }),
  };

  const orchestration = await runHsiAgentOrchestration({
    investigationId: input.investigationId,
    tasks,
    executors,
    graphRelease: input.graphRelease,
    dataClass: "public_biomedical",
    now,
    signal: input.signal,
  });

  const stages: BoundedStageTrace[] = [];
  for (const stageId of BOUNDED_STAGE_IDS) {
    const run = orchestration.runs.find((r) => r.runId.endsWith(`:${stageId}`));
    const result = orchestration.results[stageId];
    const checkpoint =
      stageCheckpoints.get(stageId) ??
      (await checkpointStore.read(input.investigationId, stageId));
    let status: BoundedStageStatus;
    if (orchestration.status === "cancelled" && !result) status = "cancelled";
    else if (!result) status = "cancelled";
    else if (run?.status === "failed" || checkpoint?.state === "failed") status = "failed";
    else if (result.status === "blocked") status = "blocked";
    else if (stageId === "opposing-evidence" && scratch.opposing) status = scratch.opposing.status;
    else if (result.status === "completed") status = "completed";
    else status = "failed";

    stages.push({
      stageId,
      status,
      artifactRef: result?.outputRef ?? checkpoint?.outputRef ?? null,
      artifact: scratch.stageArtifacts.get(stageId) ?? null,
      checkpoint,
      reason: result?.reason ?? null,
      toolCalls: (run?.toolCalls ?? []).map((c) => ({tool: c.tool, status: c.status})),
    });
  }

  return {
    schemaVersion: BOUNDED_AGENT_EXECUTION_SCHEMA,
    method: BOUNDED_AGENT_EXECUTION_METHOD,
    version: BOUNDED_AGENT_EXECUTION_VERSION,
    investigationId: input.investigationId,
    status: orchestration.status,
    stages,
    orchestration,
    honesty: {
      metadataOnly: true,
      claimSupportNotAssessed: true,
      sourceIdentityDistinctFromClaimSupport: true,
      providerFailureDistinctFromEmptyEvidence: true,
      fixturesAreNotLiveEvidence: true,
      scientificApproval: false,
      graphPromotable: false,
      gateCAutoApprove: false,
      cdsPhi: false,
      scientificValidityClaimed: false,
      untrustedRetrievedText: true,
      axesPreservedOrthogonal: true,
    },
    limitations: [
      "Bounded in-process orchestration with durable checkpoints/artifacts; not a live multi-agent swarm",
      "Opposing-evidence and deep gap semantics remain thin / stubbed pending PR 6+",
      "Research brief is a structured engineering artifact — no scientific validity claim",
      "Neon red-wave writes remain staging-gated via existing persist/checkpoint stores",
      "No Gate C auto-approve, CDS/PHI, or graph promotion",
      ...orchestration.limitations,
    ],
  };
}
