/** Owner-authorized HSI live scientific platform runtime (U37).
 *
 * Composes the L1 restricted-preview engineering path:
 * 1. Live investigation (Ask → public sources → candidates → brief)
 * 2. Checkpointed research-agent runtime (planner → contradiction)
 *
 * Fail-closed: no production research writes, no held Neon migrations, no
 * Gate C auto-approve, no PHI, no invented staging grant, no scientific
 * approval, and no restricted-preview GO claim from this host alone.
 */
import type {FetchLike} from "./fetchLike";
import type {HsiInvestigationArtifactSink} from "./hsiArch003AgentAdapters";
import type {HsiCheckpointStore} from "./hsiAgentDurableCheckpoint";
import {
  assertHsiLiveScientificPlatformOwnerAuthorized,
  HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
  type HsiLiveScientificPlatformOwnerApproval,
} from "./hsiLiveScientificPlatformAuthorization";
import {
  HSI_RESEARCH_AGENT_OWNER_APPROVAL,
  type HsiResearchAgentOwnerApproval,
} from "./hsiResearchAgentAuthorization";
import {
  runHsiAuthorizedResearchAgentRuntime,
  type HsiResearchAgentRuntimeResult,
} from "./hsiResearchAgentRuntime";
import type {QuestionPlanInput} from "./interrogativeQuestionEngine";
import {
  renderLiveBriefMarkdown,
  runLiveInvestigation,
  type LiveScenario,
} from "./investigation/liveRun";
import {LIVE_SCENARIOS} from "./investigation/scenarios";
import {LIVE_SOURCE_RELIABILITY_HONESTY} from "./investigation/liveSourceReliabilityHonesty";

export const HSI_LIVE_SCIENTIFIC_PLATFORM_RUNTIME_SCHEMA =
  "hsi-live-scientific-platform-runtime-1" as const;

export type HsiLiveScientificPlatformHonesty = {
  scientificApproval: false;
  restrictedPreviewClaimed: false;
  stagingGrantVerified: false;
  productionWritesEnabled: false;
  sourceClearanceVerified: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  phiAllowed: false;
  clinicalAdvice: false;
  containsPhi: false;
  generalAvailability: false;
  inventedStagingUrl: false;
};

export type HsiLiveScientificPlatformRuntimeResult = {
  schemaVersion: typeof HSI_LIVE_SCIENTIFIC_PLATFORM_RUNTIME_SCHEMA;
  authorization: HsiLiveScientificPlatformOwnerApproval;
  stage: "L1_restricted_preview_engineering";
  scenarioId: string;
  investigation: Awaited<ReturnType<typeof runLiveInvestigation>>;
  briefMarkdown: string;
  researchAgent: HsiResearchAgentRuntimeResult;
  honesty: HsiLiveScientificPlatformHonesty;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

function resolveScenario(input: {
  scenarioId?: string;
  scenario?: LiveScenario;
}): LiveScenario {
  if (input.scenario) {
    if (input.scenario.schemaVersion !== "hsi-live-scenario-1") {
      throw Error("Invalid live scenario schema");
    }
    return input.scenario;
  }
  const id = input.scenarioId?.trim();
  if (!id || !LIVE_SCENARIOS[id]) {
    throw Error("Unknown live scientific platform scenario");
  }
  return LIVE_SCENARIOS[id]!;
}

function assertPlatformHonesty(honesty: HsiLiveScientificPlatformHonesty): void {
  if (
    honesty.scientificApproval !== false ||
    honesty.restrictedPreviewClaimed !== false ||
    honesty.stagingGrantVerified !== false ||
    honesty.productionWritesEnabled !== false ||
    honesty.sourceClearanceVerified !== false ||
    honesty.graphPromotable !== false ||
    honesty.gateCAutoApprove !== false ||
    honesty.phiAllowed !== false ||
    honesty.clinicalAdvice !== false ||
    honesty.containsPhi !== false ||
    honesty.generalAvailability !== false ||
    honesty.inventedStagingUrl !== false
  ) {
    throw Error("Live scientific platform honesty flags must remain fail-closed");
  }
  if (LIVE_SOURCE_RELIABILITY_HONESTY.sourceClearanceVerified !== false) {
    throw Error("sourceClearanceVerified must remain false on the live platform path");
  }
}

/**
 * Run the owner-authorized live scientific platform composition:
 * curated live investigation + research-agent planner/contradiction path.
 */
export async function runHsiAuthorizedLiveScientificPlatform(input: {
  authorization: HsiLiveScientificPlatformOwnerApproval;
  researchAgentAuthorization?: HsiResearchAgentOwnerApproval;
  investigationId: string;
  scenarioId?: string;
  scenario?: LiveScenario;
  plan: QuestionPlanInput;
  sink: HsiInvestigationArtifactSink;
  fetcher: FetchLike;
  checkpointStore?: HsiCheckpointStore;
  maxOrchestrationMs?: number;
  signal?: AbortSignal;
  now?: () => string;
  timeoutMsPerTask?: number;
}): Promise<HsiLiveScientificPlatformRuntimeResult> {
  assertHsiLiveScientificPlatformOwnerAuthorized(input.authorization);
  if (!ID.test(input.investigationId)) throw Error("Invalid investigation identity");
  if (!input.fetcher) throw Error("Live scientific platform requires an explicit fetcher");

  const scenario = resolveScenario(input);
  const now = input.now ?? (() => new Date().toISOString());

  const investigation = await runLiveInvestigation({
    scenario,
    fetcher: input.fetcher,
    now,
    signal: input.signal,
  });

  if (
    investigation.flags.scientificApproval !== false ||
    investigation.flags.graphPromotable !== false ||
    investigation.flags.clinicalAdvice !== false ||
    investigation.flags.containsPhi !== false
  ) {
    throw Error("Live investigation returned dishonest approval or PHI flags");
  }

  const researchAgent = await runHsiAuthorizedResearchAgentRuntime({
    authorization: input.researchAgentAuthorization ?? HSI_RESEARCH_AGENT_OWNER_APPROVAL,
    investigationId: input.investigationId,
    plan: input.plan,
    sink: input.sink,
    checkpointStore: input.checkpointStore,
    maxOrchestrationMs: input.maxOrchestrationMs,
    signal: input.signal,
    now,
    timeoutMsPerTask: input.timeoutMsPerTask,
  });

  const honesty: HsiLiveScientificPlatformHonesty = {
    scientificApproval: false,
    restrictedPreviewClaimed: false,
    stagingGrantVerified: false,
    productionWritesEnabled: false,
    sourceClearanceVerified: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    phiAllowed: false,
    clinicalAdvice: false,
    containsPhi: false,
    generalAvailability: false,
    inventedStagingUrl: false,
  };
  assertPlatformHonesty(honesty);

  return {
    schemaVersion: HSI_LIVE_SCIENTIFIC_PLATFORM_RUNTIME_SCHEMA,
    authorization: HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL,
    stage: "L1_restricted_preview_engineering",
    scenarioId: scenario.id,
    investigation,
    briefMarkdown: renderLiveBriefMarkdown(investigation),
    researchAgent,
    honesty,
  };
}
