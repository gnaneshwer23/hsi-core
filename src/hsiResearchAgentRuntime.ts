/** Owner-authorized HSI research agent runtime (U35 + U39 + U44).
 *
 * Checkpointed orchestration under the owner approval envelope.
 * U35: question_planner → contradiction_analyst
 * U39: expanded SSc path also runs claim_verifier, hypothesis_generator,
 *      safety_policy_gate (and optional evidence_retriever when a curated
 *      release snapshot is supplied).
 * U44: full SSc path also checkpoints entity_resolver, graph_reasoner,
 *      interrogator (closing the U39 remaining-role gap).
 *
 * Does not call LLMs, publish graph releases, auto-approve Gate C, ingest PHI,
 * enable held Neon migrations, or claim live multi-process staging E2E.
 */
import {createMemoryCheckpointStore} from "./evidence/boundedAgentExecution";
import {projectLivingEvidenceForOutcome} from "./evidence/livingEvidenceExpansion";
import type {GapVerificationInput} from "./evidence/gapVerification";
import type {PublishedReleaseSnapshot} from "./graphRelease";
import type {BranchGraphBinding} from "./interrogativeEvidenceEngine";
import {
  createGapVerificationExecutor,
  createSafetyPolicyGateExecutor,
  createSscContradictionExecutor,
  createSscEntityResolverExecutor,
  createSscEvidenceRetrieverExecutor,
  createSscGraphReasonerExecutor,
  createSscHypothesisGeneratorExecutor,
  createSscInterrogatorExecutor,
  createSscPlannerExecutor,
  type HsiInvestigationArtifactSink,
} from "./hsiArch003AgentAdapters";
import {
  hashHsiCheckpointInput,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "./hsiAgentDurableCheckpoint";
import {
  HSI_ROLE_TOOL_ALLOWLIST,
  type HsiAgentManifest,
  type HsiAgentRole,
} from "./hsiAgentIntelligenceContracts";
import {
  runHsiAgentOrchestration,
  type HsiAgentExecutor,
  type HsiAgentTask,
  type HsiOrchestrationResult,
} from "./hsiAgentOrchestrator";
import {checkpointHsiExecutor} from "./hsiCheckpointedExecutor";
import {
  assertHsiResearchAgentOwnerAuthorized,
  HSI_RESEARCH_AGENT_OWNER_APPROVAL,
  type HsiResearchAgentOwnerApproval,
} from "./hsiResearchAgentAuthorization";
import type {QuestionPlanInput} from "./interrogativeQuestionEngine";

export const HSI_RESEARCH_AGENT_RUNTIME_SCHEMA = "hsi-research-agent-runtime-1" as const;

export type HsiResearchAgentPipeline =
  | "planner_contradiction"
  | "expanded_ssc"
  | "full_ssc";

export const HSI_EXPANDED_SSC_ROLES = [
  "question_planner",
  "evidence_retriever",
  "contradiction_analyst",
  "claim_verifier",
  "hypothesis_generator",
  "safety_policy_gate",
] as const satisfies readonly HsiAgentRole[];

export const HSI_FULL_SSC_ROLES = [
  "question_planner",
  "entity_resolver",
  "evidence_retriever",
  "graph_reasoner",
  "interrogator",
  "contradiction_analyst",
  "claim_verifier",
  "hypothesis_generator",
  "safety_policy_gate",
] as const satisfies readonly HsiAgentRole[];

export type HsiResearchAgentRuntimeResult = {
  schemaVersion: typeof HSI_RESEARCH_AGENT_RUNTIME_SCHEMA;
  authorization: HsiResearchAgentOwnerApproval;
  pipeline: HsiResearchAgentPipeline;
  rolesExecuted: readonly HsiAgentRole[];
  orchestration: HsiOrchestrationResult;
  checkpoints: Readonly<Record<string, HsiDurableCheckpoint | null>>;
  scientificApproval: false;
  gateCAutoApprove: false;
  phiAllowed: false;
  implementedAsLiveMultiProcessE2E: false;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

function roleManifest(
  role: HsiAgentRole,
  timeoutMs: number,
  dataClass: QuestionPlanInput["dataClass"],
): HsiAgentManifest {
  return {
    schemaVersion: "hsi-agent-manifest-1",
    role,
    version: "1.0.0",
    inputSchemaId: "hsi-research-agent-input-v1",
    outputSchemaId: "hsi-research-agent-output-v1",
    promptVersion: "none",
    modelVersion: "deterministic-arch003-1",
    allowedTools: [...HSI_ROLE_TOOL_ALLOWLIST[role]],
    maxToolCalls: 3,
    maxQuestions: 12,
    maxDepth: 4,
    timeoutMs,
    dataClasses: dataClass === "licensed_partner" ? ["licensed_partner"] : ["public_biomedical"],
  };
}

function gapInputFromDraft(
  draft: Awaited<ReturnType<HsiInvestigationArtifactSink["loadDraft"]>>,
  asOf: string,
): GapVerificationInput {
  return {
    asOf,
    branches: draft.branches.map((b) => ({
      id: b.id,
      assessment: b.assessment,
      supportingClaimIds: b.supporting.map((s) => s.claimId),
      opposingClaimIds: b.opposing.map((s) => s.claimId),
      missingEvidence: b.missingEvidence,
      uncertainty: b.uncertainty,
    })),
    claimContexts: [],
    localSourcePmids: [],
    contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
    livingEvidence: projectLivingEvidenceForOutcome({sourcePmids: [], snapshot: null}),
  };
}

/**
 * Run the owner-authorized SSc research-agent path behind durable checkpoints.
 * Default pipeline remains planner → contradiction (U35). Pass
 * `pipeline: "expanded_ssc"` for U39 roles, or `pipeline: "full_ssc"` for U44
 * remaining roles (entity_resolver / graph_reasoner / interrogator).
 */
export async function runHsiAuthorizedResearchAgentRuntime(input: {
  authorization: HsiResearchAgentOwnerApproval;
  investigationId: string;
  plan: QuestionPlanInput;
  sink: HsiInvestigationArtifactSink;
  pipeline?: HsiResearchAgentPipeline;
  evidence?: {
    snapshot: PublishedReleaseSnapshot;
    bindings: readonly BranchGraphBinding[];
  };
  checkpointStore?: HsiCheckpointStore;
  maxOrchestrationMs?: number;
  signal?: AbortSignal;
  now?: () => string;
  timeoutMsPerTask?: number;
}): Promise<HsiResearchAgentRuntimeResult> {
  assertHsiResearchAgentOwnerAuthorized(input.authorization);
  if (!ID.test(input.investigationId)) throw Error("Invalid investigation identity");
  if (input.plan.dataClass !== "public_biomedical" && input.plan.dataClass !== "licensed_partner") {
    throw Error("Research agents require a permitted non-clinical data class");
  }

  const pipeline = input.pipeline ?? "planner_contradiction";
  const checkpointStore = input.checkpointStore ?? createMemoryCheckpointStore();
  const timeoutMs = input.timeoutMsPerTask ?? 5_000;
  const now = input.now ?? (() => new Date().toISOString());
  const includeExpanded = pipeline === "expanded_ssc" || pipeline === "full_ssc";
  const includeFull = pipeline === "full_ssc";
  const includeEvidence = includeExpanded && !!input.evidence;

  let draftRef = "";

  const planner = checkpointHsiExecutor({
    store: checkpointStore,
    inputHash: hashHsiCheckpointInput({
      investigationId: input.investigationId,
      role: "question_planner",
      question: input.plan.question,
      release: input.plan.release,
    }),
    now,
    executor: async (context) => {
      const result = await createSscPlannerExecutor({plan: input.plan, sink: input.sink})(context);
      if (result.status === "completed" && result.outputRef?.trim()) {
        draftRef = result.outputRef;
      }
      return result;
    },
  });

  const evidenceRetriever = includeEvidence
    ? checkpointHsiExecutor({
        store: checkpointStore,
        inputHash: hashHsiCheckpointInput({
          investigationId: input.investigationId,
          role: "evidence_retriever",
          dependsOn: "plan",
        }),
        now,
        executor: async (context) => {
          const fromDeps = context.dependencies.plan?.outputRef?.trim() || draftRef;
          if (!fromDeps) throw Error("Planner draft reference missing");
          const result = await createSscEvidenceRetrieverExecutor({
            sink: input.sink,
            draftRef: fromDeps,
            snapshot: input.evidence!.snapshot,
            bindings: input.evidence!.bindings,
          })(context);
          if (result.status === "completed" && result.outputRef?.trim()) {
            draftRef = result.outputRef;
          }
          return result;
        },
      })
    : null;

  /** Task id that owns the current interrogative draft (plan, or retrieve when present). */
  const draftTaskId = includeEvidence ? "retrieve" : "plan";
  const resolveDraftRef = (context: {
    dependencies: Readonly<Record<string, {outputRef: string | null}>>;
  }): string => {
    const fromDeps =
      context.dependencies[draftTaskId]?.outputRef?.trim() ||
      context.dependencies.plan?.outputRef?.trim() ||
      draftRef;
    if (!fromDeps) throw Error("Planner draft reference missing");
    return fromDeps;
  };

  const executors: Partial<Record<HsiAgentRole, HsiAgentExecutor>> = {
    question_planner: planner,
  };
  if (evidenceRetriever) executors.evidence_retriever = evidenceRetriever;

  const tasks: HsiAgentTask[] = [
    {
      id: "plan",
      manifest: roleManifest("question_planner", timeoutMs, input.plan.dataClass),
      dependsOn: [],
    },
  ];
  if (includeEvidence) {
    tasks.push({
      id: "retrieve",
      manifest: roleManifest("evidence_retriever", timeoutMs, input.plan.dataClass),
      dependsOn: ["plan"],
    });
  }

  /** Last task before contradiction; full_ssc inserts resolve → reason → interrogate. */
  let preContradictDependsOn: string | string[] = draftTaskId;
  const rolesExecuted: HsiAgentRole[] = includeEvidence
    ? ["question_planner", "evidence_retriever"]
    : ["question_planner"];

  if (includeFull) {
    const resolve = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "entity_resolver",
        dependsOn: draftTaskId,
      }),
      now,
      executor: async (context) => {
        return createSscEntityResolverExecutor({
          sink: input.sink,
          draftRef: resolveDraftRef(context),
          investigationId: input.investigationId,
        })(context);
      },
    });
    const reason = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "graph_reasoner",
        dependsOn: ["resolve", draftTaskId],
      }),
      now,
      executor: async (context) => {
        return createSscGraphReasonerExecutor({
          sink: input.sink,
          draftRef: resolveDraftRef(context),
          investigationId: input.investigationId,
        })(context);
      },
    });
    const interrogate = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "interrogator",
        dependsOn: ["reason", draftTaskId],
      }),
      now,
      executor: async (context) => {
        return createSscInterrogatorExecutor({
          sink: input.sink,
          draftRef: resolveDraftRef(context),
          investigationId: input.investigationId,
        })(context);
      },
    });
    executors.entity_resolver = resolve;
    executors.graph_reasoner = reason;
    executors.interrogator = interrogate;
    tasks.push(
      {
        id: "resolve",
        manifest: roleManifest("entity_resolver", timeoutMs, input.plan.dataClass),
        dependsOn: [draftTaskId],
      },
      {
        id: "reason",
        manifest: roleManifest("graph_reasoner", timeoutMs, input.plan.dataClass),
        dependsOn: ["resolve", draftTaskId],
      },
      {
        id: "interrogate",
        manifest: roleManifest("interrogator", timeoutMs, input.plan.dataClass),
        dependsOn: ["reason", draftTaskId],
      },
    );
    rolesExecuted.push("entity_resolver", "graph_reasoner", "interrogator");
    preContradictDependsOn = ["interrogate", draftTaskId];
  }

  const contradiction = checkpointHsiExecutor({
    store: checkpointStore,
    inputHash: hashHsiCheckpointInput({
      investigationId: input.investigationId,
      role: "contradiction_analyst",
      dependsOn: preContradictDependsOn,
    }),
    now,
    executor: async (context) => {
      return createSscContradictionExecutor({
        sink: input.sink,
        draftRef: resolveDraftRef(context),
      })(context);
    },
  });
  executors.contradiction_analyst = contradiction;

  tasks.push({
    id: "contradict",
    manifest: roleManifest("contradiction_analyst", timeoutMs, input.plan.dataClass),
    dependsOn: Array.isArray(preContradictDependsOn)
      ? preContradictDependsOn
      : [preContradictDependsOn],
  });
  rolesExecuted.push("contradiction_analyst");

  if (includeExpanded) {
    const verifier = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "claim_verifier",
        dependsOn: ["contradict", draftTaskId],
      }),
      now,
      executor: async (context) => {
        const draft = await input.sink.loadDraft(resolveDraftRef(context));
        return createGapVerificationExecutor({
          sink: input.sink,
          gapInput: gapInputFromDraft(draft, now()),
        })(context);
      },
    });

    const hypothesize = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "hypothesis_generator",
        dependsOn: ["verify", draftTaskId],
      }),
      now,
      executor: async (context) => {
        return createSscHypothesisGeneratorExecutor({
          sink: input.sink,
          draftRef: resolveDraftRef(context),
          investigationId: input.investigationId,
          now,
        })(context);
      },
    });

    const policy = checkpointHsiExecutor({
      store: checkpointStore,
      inputHash: hashHsiCheckpointInput({
        investigationId: input.investigationId,
        role: "safety_policy_gate",
        dependsOn: "hypothesize",
      }),
      now,
      executor: createSafetyPolicyGateExecutor({dataClass: input.plan.dataClass}),
    });

    executors.claim_verifier = verifier;
    executors.hypothesis_generator = hypothesize;
    executors.safety_policy_gate = policy;

    tasks.push(
      {
        id: "verify",
        manifest: roleManifest("claim_verifier", timeoutMs, input.plan.dataClass),
        // Draft edge is required: contradict emits a falsification ref, not the draft.
        dependsOn: ["contradict", draftTaskId],
      },
      {
        id: "hypothesize",
        manifest: roleManifest("hypothesis_generator", timeoutMs, input.plan.dataClass),
        dependsOn: ["verify", draftTaskId],
      },
      {
        id: "policy",
        manifest: roleManifest("safety_policy_gate", timeoutMs, input.plan.dataClass),
        dependsOn: ["hypothesize"],
      },
    );
    rolesExecuted.push("claim_verifier", "hypothesis_generator", "safety_policy_gate");
  }

  const orchestration = await runHsiAgentOrchestration({
    investigationId: input.investigationId,
    tasks,
    executors,
    graphRelease: input.plan.release,
    dataClass: input.plan.dataClass,
    now,
    signal: input.signal,
    maxOrchestrationMs: input.maxOrchestrationMs,
  });

  const checkpoints: Record<string, HsiDurableCheckpoint | null> = {};
  for (const task of tasks) {
    checkpoints[task.id] = await checkpointStore.read(input.investigationId, task.id);
  }

  return {
    schemaVersion: HSI_RESEARCH_AGENT_RUNTIME_SCHEMA,
    authorization: HSI_RESEARCH_AGENT_OWNER_APPROVAL,
    pipeline,
    rolesExecuted,
    orchestration,
    checkpoints,
    scientificApproval: false,
    gateCAutoApprove: false,
    phiAllowed: false,
    implementedAsLiveMultiProcessE2E: false,
  };
}
