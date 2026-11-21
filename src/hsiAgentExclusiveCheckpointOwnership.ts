/** ARCH-009 exclusive checkpoint ownership race (U33 soft-land).
 *
 * Soft-lands the multi-worker checklist that exactly one claimer owns a
 * checkpoint fence. Concurrent startHsiCheckpoint races against a CAS store
 * must yield a single winner; stale finish attempts after version advance
 * must conflict. Does not invent live OS multi-process E2E, research_admin
 * credentials, scientific approval, Gate C, or Neon writes.
 */
import {
  finishHsiCheckpoint,
  startHsiCheckpoint,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "./hsiAgentDurableCheckpoint";

export const HSI_EXCLUSIVE_CHECKPOINT_OWNERSHIP_SCHEMA =
  "hsi-agent-exclusive-checkpoint-ownership-1" as const;

export type HsiExclusiveCheckpointOwnershipResult = {
  schemaVersion: typeof HSI_EXCLUSIVE_CHECKPOINT_OWNERSHIP_SCHEMA;
  investigationId: string;
  taskId: string;
  winnerWorkerId: string;
  loserWorkerId: string;
  winnerCheckpoint: HsiDurableCheckpoint;
  loserError: string;
  exclusiveOwnerCount: 1;
  scientificApproval: false;
  gateCAutoApprove: false;
  implementedAsLiveMultiProcessE2E: false;
};

export type HsiStaleWorkerFinishRefusal = {
  schemaVersion: "hsi-agent-stale-worker-finish-refusal-1";
  investigationId: string;
  taskId: string;
  staleWorkerId: string;
  refused: true;
  conflictReason: string;
  scientificApproval: false;
  implementedAsLiveMultiProcessE2E: false;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
const HEX = /^[a-f0-9]{64}$/;

function validateRaceInput(input: {
  investigationId: string;
  taskId: string;
  inputHash: string;
  workerAId: string;
  workerBId: string;
}): void {
  if (!ID.test(input.investigationId) || !ID.test(input.taskId)) {
    throw Error("Invalid investigation or task identity");
  }
  if (!HEX.test(input.inputHash)) throw Error("Invalid checkpoint input hash");
  if (!ID.test(input.workerAId) || !ID.test(input.workerBId)) {
    throw Error("Invalid worker identity");
  }
  if (input.workerAId === input.workerBId) throw Error("Workers must be distinct");
}

export function validateHsiExclusiveCheckpointOwnershipResult(
  result: HsiExclusiveCheckpointOwnershipResult,
): void {
  if (!result || result.schemaVersion !== HSI_EXCLUSIVE_CHECKPOINT_OWNERSHIP_SCHEMA) {
    throw Error("Invalid exclusive checkpoint ownership schema");
  }
  if (result.exclusiveOwnerCount !== 1) {
    throw Error("Exclusive ownership must report exactly one owner");
  }
  if (result.winnerWorkerId === result.loserWorkerId) {
    throw Error("Winner and loser workers must differ");
  }
  if (result.winnerCheckpoint.state !== "running") {
    throw Error("Winner checkpoint must be running");
  }
  if (!result.loserError.trim()) throw Error("Loser error required");
  if (
    result.scientificApproval !== false ||
    result.gateCAutoApprove !== false ||
    result.implementedAsLiveMultiProcessE2E !== false
  ) {
    throw Error("Ownership race must not claim scientific approval, Gate C, or live multi-process E2E");
  }
}

/**
 * Race two concurrent claimers. Exactly one startHsiCheckpoint must succeed.
 * The loser error is preserved for audit; ownership remains exclusive.
 */
export async function raceHsiExclusiveCheckpointOwnership(input: {
  store: HsiCheckpointStore;
  investigationId: string;
  taskId: string;
  inputHash: string;
  startedAt: string;
  workerAId: string;
  workerBId: string;
}): Promise<HsiExclusiveCheckpointOwnershipResult> {
  validateRaceInput(input);
  const prior = await input.store.read(input.investigationId, input.taskId);
  if (prior !== null) throw Error("Ownership race requires an absent checkpoint");

  const claim = () =>
    startHsiCheckpoint({
      store: input.store,
      investigationId: input.investigationId,
      taskId: input.taskId,
      inputHash: input.inputHash,
      startedAt: input.startedAt,
    });

  const settled = await Promise.allSettled([claim(), claim()]);
  const fulfilled = settled
    .map((entry, index) => ({entry, workerId: index === 0 ? input.workerAId : input.workerBId}))
    .filter(
      (row): row is {
        entry: PromiseFulfilledResult<HsiDurableCheckpoint>;
        workerId: string;
      } => row.entry.status === "fulfilled",
    );
  const rejected = settled
    .map((entry, index) => ({entry, workerId: index === 0 ? input.workerAId : input.workerBId}))
    .filter(
      (row): row is {
        entry: PromiseRejectedResult;
        workerId: string;
      } => row.entry.status === "rejected",
    );

  if (fulfilled.length !== 1 || rejected.length !== 1) {
    throw Error("Exclusive ownership race did not yield exactly one winner");
  }

  const winner = fulfilled[0]!;
  const loser = rejected[0]!;
  const loserError =
    loser.entry.reason instanceof Error ? loser.entry.reason.message : String(loser.entry.reason);

  const stored = await input.store.read(input.investigationId, input.taskId);
  if (!stored || stored.version !== winner.entry.value.version || stored.state !== "running") {
    throw Error("Store does not reflect exclusive winner checkpoint");
  }

  const result: HsiExclusiveCheckpointOwnershipResult = {
    schemaVersion: HSI_EXCLUSIVE_CHECKPOINT_OWNERSHIP_SCHEMA,
    investigationId: input.investigationId,
    taskId: input.taskId,
    winnerWorkerId: winner.workerId,
    loserWorkerId: loser.workerId,
    winnerCheckpoint: winner.entry.value,
    loserError,
    exclusiveOwnerCount: 1,
    scientificApproval: false,
    gateCAutoApprove: false,
    implementedAsLiveMultiProcessE2E: false,
  };
  validateHsiExclusiveCheckpointOwnershipResult(result);
  return result;
}

/**
 * After the owner advances the checkpoint version, a stale finish attempt
 * must conflict. Soft-land only — not live multi-process E2E.
 */
export async function refuseHsiStaleWorkerCheckpointFinish(input: {
  store: HsiCheckpointStore;
  ownerCheckpoint: HsiDurableCheckpoint;
  staleWorkerId: string;
  finishedAt: string;
}): Promise<HsiStaleWorkerFinishRefusal> {
  if (!ID.test(input.staleWorkerId)) throw Error("Invalid stale worker identity");
  const advanced = await finishHsiCheckpoint({
    store: input.store,
    checkpoint: input.ownerCheckpoint,
    state: "completed",
    outputRef: `hsi-artifact-exclusive-${input.ownerCheckpoint.taskId}`,
    finishedAt: input.finishedAt,
  });
  if (advanced.state !== "completed") throw Error("Owner finish did not complete");

  let conflictReason = "";
  try {
    await finishHsiCheckpoint({
      store: input.store,
      checkpoint: input.ownerCheckpoint,
      state: "completed",
      outputRef: `hsi-artifact-stale-${input.staleWorkerId}`,
      finishedAt: input.finishedAt,
    });
    throw Error("Stale worker finish unexpectedly succeeded");
  } catch (error) {
    conflictReason = error instanceof Error ? error.message : String(error);
    if (conflictReason === "Stale worker finish unexpectedly succeeded") throw error;
  }

  return {
    schemaVersion: "hsi-agent-stale-worker-finish-refusal-1",
    investigationId: input.ownerCheckpoint.investigationId,
    taskId: input.ownerCheckpoint.taskId,
    staleWorkerId: input.staleWorkerId,
    refused: true,
    conflictReason,
    scientificApproval: false,
    implementedAsLiveMultiProcessE2E: false,
  };
}
