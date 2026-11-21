import {test, expect} from "bun:test";
import {
  classifyHsiOrchestrationCancel,
  validateHsiOrchestrationCancelRecord,
} from "../src/hsiAgentOrchestrationCancel";
import {runHsiAgentOrchestration, type HsiAgentTask} from "../src/hsiAgentOrchestrator";
import {HSI_ROLE_TOOL_ALLOWLIST, type HsiAgentManifest, type HsiAgentRole} from "../src/hsiAgentIntelligenceContracts";

const manifest = (role: HsiAgentRole, timeoutMs = 5_000): HsiAgentManifest => ({
  schemaVersion: "hsi-agent-manifest-1",
  role,
  version: "1.0.0",
  inputSchemaId: "input-v1",
  outputSchemaId: "output-v1",
  promptVersion: "none",
  modelVersion: "deterministic-1",
  allowedTools: [...HSI_ROLE_TOOL_ALLOWLIST[role]],
  maxToolCalls: 3,
  maxQuestions: 12,
  maxDepth: 4,
  timeoutMs,
  dataClasses: ["public_biomedical"],
});

const graphRelease = {id: "HSI-GR-SSC", version: "1.0.0", manifestHash: "a".repeat(64)};
const base = {
  investigationId: "inv-cancel",
  graphRelease,
  dataClass: "public_biomedical" as const,
  now: () => "2026-11-21T17:00:00Z",
};

test("classify prefers wall-clock budget over parent abort", () => {
  const record = classifyHsiOrchestrationCancel({
    budgetExceeded: true,
    parentAborted: true,
    taskTimedOut: false,
    policyDenied: false,
    taskId: "plan",
  });
  expect(record.reason).toBe("wall_clock_budget");
  expect(record.scientificApproval).toBe(false);
  expect(() => validateHsiOrchestrationCancelRecord(record)).not.toThrow();
});

test("parent abort before dispatch records parent_signal with null taskId", async () => {
  const controller = new AbortController();
  controller.abort();
  const r = await runHsiAgentOrchestration({
    ...base,
    tasks: [{id: "plan", manifest: manifest("question_planner"), dependsOn: []}],
    signal: controller.signal,
    executors: {},
  });
  expect(r.status).toBe("cancelled");
  expect(r.termination?.reason).toBe("parent_signal");
  expect(r.termination?.taskId).toBeNull();
});

test("wall-clock budget termination is classified", async () => {
  const tasks: HsiAgentTask[] = [
    {id: "plan", manifest: manifest("question_planner", 5_000), dependsOn: []},
    {id: "graph", manifest: manifest("graph_reasoner", 5_000), dependsOn: ["plan"]},
  ];
  const r = await runHsiAgentOrchestration({
    ...base,
    tasks,
    maxOrchestrationMs: 100,
    executors: {
      question_planner: async (c) => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (c.signal.aborted) throw Error("Cancelled");
        return {status: "completed", outputRef: "plan-ref", reason: null};
      },
      graph_reasoner: async () => ({status: "completed", outputRef: "graph-ref", reason: null}),
    },
  });
  expect(r.status).toBe("cancelled");
  expect(r.termination?.reason).toBe("wall_clock_budget");
  expect(r.termination?.taskId).toBe("plan");
});

test("task timeout termination is classified on failed status", async () => {
  const r = await runHsiAgentOrchestration({
    ...base,
    tasks: [{id: "plan", manifest: manifest("question_planner", 100), dependsOn: []}],
    executors: {
      question_planner: async (c) => {
        await new Promise<void>((resolve) => {
          if (c.signal.aborted) return resolve();
          c.signal.addEventListener("abort", () => resolve(), {once: true});
        });
        throw Error("Cancelled");
      },
    },
  });
  expect(r.status).toBe("failed");
  expect(r.termination?.reason).toBe("task_timeout");
  expect(r.termination?.taskId).toBe("plan");
});

test("policy denial termination is classified", async () => {
  const r = await runHsiAgentOrchestration({
    ...base,
    tasks: [{id: "plan", manifest: manifest("question_planner"), dependsOn: []}],
    executors: {
      question_planner: async (c) => {
        c.assertTool("patient.context.get");
        return {status: "completed", outputRef: "unsafe", reason: null};
      },
    },
  });
  expect(r.status).toBe("failed");
  expect(r.termination?.reason).toBe("policy_denied");
});
