import {test, expect} from "bun:test";
import {
  createHsiOrchestrationDeadline,
  validateHsiOrchestrationBudgetMs,
} from "../src/hsiAgentOrchestrationBudget";
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
  investigationId: "inv-budget",
  graphRelease,
  dataClass: "public_biomedical" as const,
  now: () => "2026-11-21T16:00:00Z",
};

test("orchestration budget validation rejects out-of-range values", () => {
  expect(() => validateHsiOrchestrationBudgetMs(50)).toThrow("wall-clock");
  expect(() => validateHsiOrchestrationBudgetMs(700_000)).toThrow("wall-clock");
  expect(() => validateHsiOrchestrationBudgetMs(1_000)).not.toThrow();
});

test("deadline marks budgetExceeded only for timeout abort", async () => {
  const parent = new AbortController();
  const deadline = createHsiOrchestrationDeadline({maxOrchestrationMs: 100, parent: parent.signal});
  expect(deadline.budgetExceeded()).toBe(false);
  await new Promise((r) => setTimeout(r, 130));
  expect(deadline.signal.aborted).toBe(true);
  expect(deadline.budgetExceeded()).toBe(true);
  deadline.dispose();
});

test("wall-clock budget cancels remaining tasks after first slow stage", async () => {
  const tasks: HsiAgentTask[] = [
    {id: "plan", manifest: manifest("question_planner", 5_000), dependsOn: []},
    {id: "graph", manifest: manifest("graph_reasoner", 5_000), dependsOn: ["plan"]},
  ];
  const order: string[] = [];
  const r = await runHsiAgentOrchestration({
    ...base,
    tasks,
    maxOrchestrationMs: 100,
    executors: {
      question_planner: async (c) => {
        order.push(c.taskId);
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (c.signal.aborted) throw Error("Cancelled");
        return {status: "completed", outputRef: "plan-ref", reason: null};
      },
      graph_reasoner: async (c) => {
        order.push(c.taskId);
        return {status: "completed", outputRef: "graph-ref", reason: null};
      },
    },
  });
  expect(order).toEqual(["plan"]);
  expect(r.status).toBe("cancelled");
  expect(r.runs.some((run) => run.runId.endsWith(":graph"))).toBe(false);
  expect(r.limitations.some((l) => /wall-clock budget exceeded/i.test(l))).toBe(true);
});
