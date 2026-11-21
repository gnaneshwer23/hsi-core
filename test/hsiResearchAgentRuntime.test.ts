import {test, expect} from "bun:test";
import type {InterrogativeInvestigation} from "../src/interrogativeContracts";
import type {FalsificationReport} from "../src/interrogativeFalsificationEngine";
import {
  HSI_RESEARCH_AGENT_OWNER_APPROVAL,
  validateHsiResearchAgentOwnerApproval,
} from "../src/hsiResearchAgentAuthorization";
import {runHsiAuthorizedResearchAgentRuntime} from "../src/hsiResearchAgentRuntime";
import type {HsiInvestigationArtifactSink} from "../src/hsiArch003AgentAdapters";
import {createMemoryCheckpointStore} from "../src/evidence/boundedAgentExecution";

const release = {
  id: "HSI-GR-SSC",
  version: "1.0.0",
  manifestHash: "a".repeat(64),
};

function memorySink(): HsiInvestigationArtifactSink & {
  draft: InterrogativeInvestigation | null;
  report: FalsificationReport | null;
} {
  const state: {
    draft: InterrogativeInvestigation | null;
    report: FalsificationReport | null;
  } = {draft: null, report: null};
  return {
    get draft() {
      return state.draft;
    },
    get report() {
      return state.report;
    },
    saveDraft: async (d) => {
      state.draft = d;
      return "draft-ref";
    },
    loadDraft: async (ref) => {
      if (ref !== "draft-ref" || !state.draft) throw Error("No draft");
      return state.draft;
    },
    saveFalsification: async (r) => {
      state.report = r;
      return "falsification-ref";
    },
  };
}

test("owner approval envelope refuses Gate C / PHI / production claims", () => {
  expect(() => validateHsiResearchAgentOwnerApproval(HSI_RESEARCH_AGENT_OWNER_APPROVAL)).not.toThrow();
  expect(HSI_RESEARCH_AGENT_OWNER_APPROVAL.scientificApproval).toBe(false);
  expect(HSI_RESEARCH_AGENT_OWNER_APPROVAL.gateCAutoApprove).toBe(false);
  expect(HSI_RESEARCH_AGENT_OWNER_APPROVAL.phiAllowed).toBe(false);
  expect(HSI_RESEARCH_AGENT_OWNER_APPROVAL.generalProductionDeploy).toBe(false);
  expect(() =>
    validateHsiResearchAgentOwnerApproval({
      ...HSI_RESEARCH_AGENT_OWNER_APPROVAL,
      gateCAutoApprove: true as false,
    }),
  ).toThrow("Gate C");
});

test("authorized runtime runs planner then contradiction behind checkpoints", async () => {
  const sink = memorySink();
  const store = createMemoryCheckpointStore();
  const result = await runHsiAuthorizedResearchAgentRuntime({
    authorization: HSI_RESEARCH_AGENT_OWNER_APPROVAL,
    investigationId: "inv-research-1",
    plan: {
      question: "Which SSc mechanisms require investigation?",
      actorPrincipal: "researcher-1",
      createdAt: "2026-11-21T20:00:00Z",
      dataClass: "public_biomedical",
      focus: "systemic_sclerosis",
      release,
    },
    sink,
    checkpointStore: store,
    now: () => "2026-11-21T20:00:00Z",
  });

  expect(result.schemaVersion).toBe("hsi-research-agent-runtime-1");
  expect(result.orchestration.status).toBe("completed");
  expect(result.orchestration.results.plan?.outputRef).toBe("draft-ref");
  expect(result.orchestration.results.contradict?.outputRef).toBe("falsification-ref");
  expect(result.checkpoints.plan?.state).toBe("completed");
  expect(result.checkpoints.contradict?.state).toBe("completed");
  expect(sink.draft?.state).toBe("draft");
  expect(sink.draft?.review).toBeNull();
  expect(result.scientificApproval).toBe(false);
  expect(result.gateCAutoApprove).toBe(false);
  expect(result.phiAllowed).toBe(false);
  expect(result.implementedAsLiveMultiProcessE2E).toBe(false);
});

test("runtime refuses without canonical owner approval", async () => {
  const sink = memorySink();
  await expect(
    runHsiAuthorizedResearchAgentRuntime({
      authorization: {
        ...HSI_RESEARCH_AGENT_OWNER_APPROVAL,
        approvedAt: "2099-01-01",
      },
      investigationId: "inv-research-2",
      plan: {
        question: "Which SSc mechanisms require investigation?",
        actorPrincipal: "researcher-1",
        createdAt: "2026-11-21T20:00:00Z",
        dataClass: "public_biomedical",
        focus: "systemic_sclerosis",
        release,
      },
      sink,
    }),
  ).rejects.toThrow("approval");
});
