import {test, expect} from "bun:test";
import {
  hashHsiCheckpointInput,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "../src/hsiAgentDurableCheckpoint";
import {
  raceHsiExclusiveCheckpointOwnership,
  refuseHsiStaleWorkerCheckpointFinish,
  validateHsiExclusiveCheckpointOwnershipResult,
} from "../src/hsiAgentExclusiveCheckpointOwnership";

function memoryStore(): HsiCheckpointStore {
  const rows = new Map<string, HsiDurableCheckpoint>();
  return {
    read: async (i, t) => rows.get(`${i}:${t}`) ?? null,
    compareAndSwap: async (expected, next) => {
      const key = `${next.investigationId}:${next.taskId}`;
      const old = rows.get(key);
      if ((old?.version ?? null) !== expected) return false;
      rows.set(key, structuredClone(next));
      return true;
    },
  };
}

const inputHash = hashHsiCheckpointInput({question: "exclusive-owner"});

test("concurrent claimers yield exactly one exclusive checkpoint owner", async () => {
  const store = memoryStore();
  const result = await raceHsiExclusiveCheckpointOwnership({
    store,
    investigationId: "inv-exclusive-1",
    taskId: "planner",
    inputHash,
    startedAt: "2026-11-21T17:00:00Z",
    workerAId: "worker-a",
    workerBId: "worker-b",
  });
  expect(result.exclusiveOwnerCount).toBe(1);
  expect(result.winnerCheckpoint.state).toBe("running");
  expect(result.winnerWorkerId).not.toBe(result.loserWorkerId);
  expect(result.loserError.length).toBeGreaterThan(0);
  expect(result.scientificApproval).toBe(false);
  expect(result.gateCAutoApprove).toBe(false);
  expect(result.implementedAsLiveMultiProcessE2E).toBe(false);
  validateHsiExclusiveCheckpointOwnershipResult(result);

  const stored = await store.read("inv-exclusive-1", "planner");
  expect(stored?.version).toBe(result.winnerCheckpoint.version);
  expect(stored?.state).toBe("running");
});

test("stale worker finish is refused after owner completes", async () => {
  const store = memoryStore();
  const race = await raceHsiExclusiveCheckpointOwnership({
    store,
    investigationId: "inv-exclusive-2",
    taskId: "retriever",
    inputHash,
    startedAt: "2026-11-21T17:01:00Z",
    workerAId: "owner-1",
    workerBId: "stale-1",
  });
  const refusal = await refuseHsiStaleWorkerCheckpointFinish({
    store,
    ownerCheckpoint: race.winnerCheckpoint,
    staleWorkerId: race.loserWorkerId,
    finishedAt: "2026-11-21T17:01:05Z",
  });
  expect(refusal.refused).toBe(true);
  expect(refusal.conflictReason.length).toBeGreaterThan(0);
  expect(refusal.scientificApproval).toBe(false);
  expect(refusal.implementedAsLiveMultiProcessE2E).toBe(false);

  const stored = await store.read("inv-exclusive-2", "retriever");
  expect(stored?.state).toBe("completed");
  expect(stored?.outputRef).toContain("exclusive");
});

test("ownership race rejects identical workers and pre-existing checkpoints", async () => {
  const store = memoryStore();
  await expect(
    raceHsiExclusiveCheckpointOwnership({
      store,
      investigationId: "inv-exclusive-3",
      taskId: "planner",
      inputHash,
      startedAt: "2026-11-21T17:02:00Z",
      workerAId: "same-worker",
      workerBId: "same-worker",
    }),
  ).rejects.toThrow("distinct");

  await raceHsiExclusiveCheckpointOwnership({
    store,
    investigationId: "inv-exclusive-3",
    taskId: "planner",
    inputHash,
    startedAt: "2026-11-21T17:02:00Z",
    workerAId: "worker-a",
    workerBId: "worker-b",
  });
  await expect(
    raceHsiExclusiveCheckpointOwnership({
      store,
      investigationId: "inv-exclusive-3",
      taskId: "planner",
      inputHash,
      startedAt: "2026-11-21T17:02:01Z",
      workerAId: "worker-c",
      workerBId: "worker-d",
    }),
  ).rejects.toThrow("absent checkpoint");
});
