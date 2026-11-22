import {test, expect} from "bun:test";
import {
  hashHsiCheckpointInput,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "../src/hsiAgentDurableCheckpoint";
import {
  runHsiCrashRestartRecoveryScenario,
} from "../src/hsiAgentCrashRestartRecovery";
import {continueHsiCheckpointedExecution} from "../src/hsiCheckpointedExecutor";

function memoryStore(): HsiCheckpointStore {
  const rows = new Map<string, HsiDurableCheckpoint>();
  return {
    read: async (i, t) => rows.get(`${i}:${t}`) ?? null,
    compareAndSwap: async (expected, next) => {
      const key = `${next.investigationId}:${next.taskId}`;
      if ((rows.get(key)?.version ?? null) !== expected) return false;
      rows.set(key, structuredClone(next));
      return true;
    },
  };
}

const inputHash = hashHsiCheckpointInput({scenario: "crash-restart"});

test("resume orphan same attempt keeps attempt and allows continue", async () => {
  const store = memoryStore();
  const result = await runHsiCrashRestartRecoveryScenario({
    store,
    path: "resume_orphan_same_attempt",
    investigationId: "inv-crash-1",
    taskId: "planner",
    inputHash,
    crashAt: "2026-11-21T18:00:00Z",
    approvedBy: "operator-fixture",
    recoveryReason: "Resume orphan after simulated worker crash",
  });
  expect(result.path).toBe("resume_orphan_same_attempt");
  expect(result.crashedCheckpoint.state).toBe("running");
  expect(result.recoveredCheckpoint.attempt).toBe(1);
  expect(result.recoveredCheckpoint.version).toBe(result.crashedCheckpoint.version);
  expect(result.recoveryDecision.reasonCode).toBe("resume_orphan_running");
  expect(result.scientificApproval).toBe(false);
  expect(result.implementedAsLiveMultiProcessE2E).toBe(false);

  const resumed = continueHsiCheckpointedExecution({
    store,
    checkpoint: result.recoveredCheckpoint,
    inputHash,
    now: () => "2026-11-21T18:00:30Z",
    executor: async () => ({status: "completed", outputRef: "artifact-resume", reason: null}),
  });
  const out = await resumed({
    investigationId: "inv-crash-1",
    taskId: "planner",
    role: "question_planner",
    signal: new AbortController().signal,
    assertTool: () => {},
    dependencies: {},
  });
  expect(out.outputRef).toBe("artifact-resume");
  expect((await store.read("inv-crash-1", "planner"))?.state).toBe("completed");
});

test("abandon then retry increments attempt after human abandon", async () => {
  const store = memoryStore();
  const result = await runHsiCrashRestartRecoveryScenario({
    store,
    path: "abandon_then_retry",
    investigationId: "inv-crash-2",
    taskId: "retriever",
    inputHash,
    crashAt: "2026-11-21T18:01:00Z",
    approvedBy: "operator-fixture",
    recoveryReason: "Abandon orphan and retry after crash",
    abandonedAt: "2026-11-21T18:01:10Z",
    restartedAt: "2026-11-21T18:01:20Z",
  });
  expect(result.path).toBe("abandon_then_retry");
  expect(result.crashedCheckpoint.attempt).toBe(1);
  expect(result.recoveredCheckpoint.attempt).toBe(2);
  expect(result.recoveredCheckpoint.state).toBe("running");
  expect(result.recoveryDecision.reasonCode).toBe("resume_after_failed_attempt");
  expect(result.gateCAutoApprove).toBe(false);
});

test("reconcile committed artifact completes without executor replay", async () => {
  const store = memoryStore();
  const artifacts = {
    findCurrent: async (
      _investigationId: string,
      _taskId: string,
      attempt: number,
      version: number,
      hash: string,
    ) => [
      {
        artifactId: "art-seed",
        outputRef: "artifact-reconciled",
        attempt,
        checkpointVersion: version,
        inputHash: hash,
      },
    ],
  };

  const result = await runHsiCrashRestartRecoveryScenario({
    store,
    path: "reconcile_committed_artifact",
    investigationId: "inv-crash-3",
    taskId: "reasoner",
    inputHash,
    crashAt: "2026-11-21T18:02:00Z",
    approvedBy: "operator-fixture",
    recoveryReason: "Reconcile committed artifact after crash",
    artifacts,
    finishedAt: "2026-11-21T18:02:15Z",
  });
  expect(result.path).toBe("reconcile_committed_artifact");
  expect(result.recoveredCheckpoint.state).toBe("completed");
  expect(result.recoveredCheckpoint.outputRef).toBe("artifact-reconciled");
  expect(result.recoveryDecision.reasonCode).toBe("resume_orphan_running");
  expect(result.implementedAsLiveMultiProcessE2E).toBe(false);
});

test("scenario refuses to claim live multi-process E2E", async () => {
  const store = memoryStore();
  const result = await runHsiCrashRestartRecoveryScenario({
    store,
    path: "resume_orphan_same_attempt",
    investigationId: "inv-crash-4",
    taskId: "planner",
    inputHash,
    crashAt: "2026-11-21T18:03:00Z",
    approvedBy: "operator-fixture",
    recoveryReason: "Honesty check",
  });
  expect(result.schemaVersion).toBe("hsi-agent-crash-restart-recovery-1");
  expect(result.scientificApproval).toBe(false);
  expect(result.gateCAutoApprove).toBe(false);
  expect(result.implementedAsLiveMultiProcessE2E).toBe(false);
});
