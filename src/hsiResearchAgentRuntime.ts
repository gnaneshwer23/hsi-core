/** Owner-authorized HSI research agent runtime (U35).
 *
 * First engineering host that runs ARCH-003 deterministic research agents
 * through checkpointed orchestration under the owner approval envelope.
 * Closes the durable-execution gap that the orchestrator was unwired from
 * checkpoint storage for this SSc planner → contradiction path.
 *
 * Does not call LLMs, publish graph releases, auto-approve Gate C, ingest PHI,
 * enable held Neon migrations, or claim live multi-process staging E2E.
 */
import {createMemoryCheckpointStore} from "./evidence/boundedAgentExecution";
import {
  createSscContradictionExecutor,
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
} from "./hsiAgentIntelligenceContracts";
import {
  runHsiAgentOrchestration,
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

export type HsiResearchAgentRuntimeResult = {
  schemaVersion: typeof HSI_RESEARCH_AGENT_RUNTIME_SCHEMA;
  authorization: HsiResearchAgentOwnerApproval;
  orchestration: HsiOrchestrationResult;
  checkpoints: Readonly<Record<string, HsiDurableCheckpoint | null>>;
  scientificApproval: false;
  gateCAutoApprove: false;
  phiAllowed: false;
  implementedAsLiveMultiProcessE2E: false;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

function roleManifest(
  role: "question_planner" | "contradiction_analyst",
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

/**
 * Run the owner-authorized SSc research-agent path:
 * question_planner → contradiction_analyst, each behind a durable checkpoint fence.
 */
export async function runHsiAuthorizedResearchAgentRuntime(input: {
  authorization: HsiResearchAgentOwnerApproval;
  investigationId: string;
  plan: QuestionPlanInput;
  sink: HsiInvestigationArtifactSink;
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

  const checkpointStore = input.checkpointStore ?? createMemoryCheckpointStore();
  const timeoutMs = input.timeoutMsPerTask ?? 5_000;
  const now = input.now ?? (() => new Date().toISOString());

  const plannerInputHash = hashHsiCheckpointInput({
    investigationId: input.investigationId,
    role: "question_planner",
    question: input.plan.question,
    release: input.plan.release,
  });

  let draftRef = "";
  const planner = checkpointHsiExecutor({
    store: checkpointStore,
    inputHash: plannerInputHash,
    now,
    executor: async (context) => {
      const result = await createSscPlannerExecutor({plan: input.plan, sink: input.sink})(context);
      if (result.status === "completed" && result.outputRef?.trim()) {
        draftRef = result.outputRef;
      }
      return result;
    },
  });

  const contradictionInputHash = hashHsiCheckpointInput({
    investigationId: input.investigationId,
    role: "contradiction_analyst",
    dependsOn: "plan",
  });

  const contradiction = checkpointHsiExecutor({
    store: checkpointStore,
    inputHash: contradictionInputHash,
    now,
    executor: async (context) => {
      const fromDeps = context.dependencies.plan?.outputRef?.trim() || draftRef;
      if (!fromDeps) throw Error("Planner draft reference missing");
      return createSscContradictionExecutor({sink: input.sink, draftRef: fromDeps})(context);
    },
  });

  const orchestration = await runHsiAgentOrchestration({
    investigationId: input.investigationId,
    tasks: [
      {
        id: "plan",
        manifest: roleManifest("question_planner", timeoutMs, input.plan.dataClass),
        dependsOn: [],
      },
      {
        id: "contradict",
        manifest: roleManifest("contradiction_analyst", timeoutMs, input.plan.dataClass),
        dependsOn: ["plan"],
      },
    ],
    executors: {
      question_planner: planner,
      contradiction_analyst: contradiction,
    },
    graphRelease: input.plan.release,
    dataClass: input.plan.dataClass,
    now,
    signal: input.signal,
    maxOrchestrationMs: input.maxOrchestrationMs,
  });

  const checkpoints: Record<string, HsiDurableCheckpoint | null> = {
    plan: await checkpointStore.read(input.investigationId, "plan"),
    contradict: await checkpointStore.read(input.investigationId, "contradict"),
  };

  return {
    schemaVersion: HSI_RESEARCH_AGENT_RUNTIME_SCHEMA,
    authorization: HSI_RESEARCH_AGENT_OWNER_APPROVAL,
    orchestration,
    checkpoints,
    scientificApproval: false,
    gateCAutoApprove: false,
    phiAllowed: false,
    implementedAsLiveMultiProcessE2E: false,
  };
}
