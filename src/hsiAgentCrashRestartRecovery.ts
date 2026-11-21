/** ARCH-009 crash/restart recovery soft-land (U34).
 *
 * In-process simulation of a worker crash that leaves a RUNNING checkpoint,
 * then human-authorised recovery via:
 * 1. Resume the same orphan attempt (no new attempt)
 * 2. Reconcile a single committed artifact without executor replay
 * 3. Abandon the orphan as failed, then recover as attempt+1
 *
 * Does not invent live OS multi-process E2E, research_admin credentials,
 * Gate C auto-approve, MoU, scientific approval, or Neon writes.
 */
import {
  finishHsiCheckpoint,
  recoverHsiCheckpoint,
  startHsiCheckpoint,
  validateHsiCheckpoint,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "./hsiAgentDurableCheckpoint";
import {
  applyHsiCommittedArtifactReconciliation,
  inspectHsiInterruptedExecution,
  type HsiReconciliationArtifactReader,
} from "./hsiAgentRecoveryReconciliation";
import {
  buildHsiRecoveryDecision,
  type HsiRecoveryDecision,
} from "./hsiAgentRecoveryDecision";

export const HSI_CRASH_RESTART_RECOVERY_SCHEMA =
  "hsi-agent-crash-restart-recovery-1" as const;

export type HsiCrashRestartPath =
  | "resume_orphan_same_attempt"
  | "reconcile_committed_artifact"
  | "abandon_then_retry";

export type HsiCrashRestartRecoveryResult = {
  schemaVersion: typeof HSI_CRASH_RESTART_RECOVERY_SCHEMA;
  path: HsiCrashRestartPath;
  investigationId: string;
  taskId: string;
  crashedCheckpoint: HsiDurableCheckpoint;
  recoveredCheckpoint: HsiDurableCheckpoint;
  recoveryDecision: HsiRecoveryDecision;
  scientificApproval: false;
  gateCAutoApprove: false;
  implementedAsLiveMultiProcessE2E: false;
};

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

/** Leave a RUNNING fence as if the worker crashed mid-attempt (no finish). */
export async function simulateHsiWorkerCrashLeavingRunning(input: {
  store: HsiCheckpointStore;
  investigationId: string;
  taskId: string;
  inputHash: string;
  startedAt: string;
}): Promise<HsiDurableCheckpoint> {
  if (!ID.test(input.investigationId) || !ID.test(input.taskId)) {
    throw Error("Invalid investigation or task identity");
  }
  return startHsiCheckpoint({
    store: input.store,
    investigationId: input.investigationId,
    taskId: input.taskId,
    inputHash: input.inputHash,
    startedAt: input.startedAt,
  });
}

/**
 * Resume an orphan RUNNING fence on the same attempt after human recovery
 * decision `resume_orphan_running`. Does not increment attempt.
 */
export async function resumeHsiOrphanRunningCheckpoint(input: {
  store: HsiCheckpointStore;
  investigationId: string;
  taskId: string;
  inputHash: string;
  approvedBy: string;
  recoveryReason: string;
}): Promise<{checkpoint: HsiDurableCheckpoint; recoveryDecision: HsiRecoveryDecision}> {
  const current = await input.store.read(input.investigationId, input.taskId);
  if (!current) throw Error("No checkpoint to resume");
  validateHsiCheckpoint(current);
  if (current.state !== "running") throw Error("Orphan resume requires a running checkpoint");
  if (current.inputHash !== input.inputHash) throw Error("Checkpoint input mismatch");

  const recoveryDecision = buildHsiRecoveryDecision({
    investigationId: input.investigationId,
    stageId: input.taskId,
    approvedBy: input.approvedBy,
    reasonCode: "resume_orphan_running",
    recoveryReason: input.recoveryReason,
    priorTerminationReason: null,
  });

  return {checkpoint: current, recoveryDecision};
}

/**
 * Abandon an orphan RUNNING fence as failed under human authorisation, then
 * open attempt+1 via recoverHsiCheckpoint.
 */
export async function abandonAndRetryHsiOrphanRunningCheckpoint(input: {
  store: HsiCheckpointStore;
  investigationId: string;
  taskId: string;
  inputHash: string;
  approvedBy: string;
  recoveryReason: string;
  abandonedAt: string;
  restartedAt: string;
}): Promise<{checkpoint: HsiDurableCheckpoint; recoveryDecision: HsiRecoveryDecision}> {
  const current = await input.store.read(input.investigationId, input.taskId);
  if (!current) throw Error("No checkpoint to abandon");
  validateHsiCheckpoint(current);
  if (current.state !== "running") throw Error("Abandon requires a running orphan checkpoint");
  if (current.inputHash !== input.inputHash) throw Error("Checkpoint input mismatch");

  const recoveryDecision = buildHsiRecoveryDecision({
    investigationId: input.investigationId,
    stageId: input.taskId,
    approvedBy: input.approvedBy,
    reasonCode: "resume_after_failed_attempt",
    recoveryReason: input.recoveryReason,
    priorTerminationReason: null,
  });

  await finishHsiCheckpoint({
    store: input.store,
    checkpoint: current,
    state: "failed",
    errorCode: "orphan_running_abandoned",
    finishedAt: input.abandonedAt,
  });

  const checkpoint = await recoverHsiCheckpoint({
    store: input.store,
    investigationId: input.investigationId,
    taskId: input.taskId,
    inputHash: input.inputHash,
    approvedBy: input.approvedBy,
    recoveryReason: input.recoveryReason,
    startedAt: input.restartedAt,
  });

  return {checkpoint, recoveryDecision};
}

/** Crash → inspect → apply committed-artifact reconciliation (no executor replay). */
export async function reconcileHsiCrashWithCommittedArtifact(input: {
  store: HsiCheckpointStore;
  artifacts: HsiReconciliationArtifactReader;
  investigationId: string;
  taskId: string;
  inputHash: string;
  approvedBy: string;
  recoveryReason: string;
  finishedAt: string;
}): Promise<{checkpoint: HsiDurableCheckpoint; recoveryDecision: HsiRecoveryDecision}> {
  const recoveryDecision = buildHsiRecoveryDecision({
    investigationId: input.investigationId,
    stageId: input.taskId,
    approvedBy: input.approvedBy,
    reasonCode: "resume_orphan_running",
    recoveryReason: input.recoveryReason,
    priorTerminationReason: null,
  });

  const decision = await inspectHsiInterruptedExecution({
    store: input.store,
    artifacts: input.artifacts,
    investigationId: input.investigationId,
    taskId: input.taskId,
    expectedInputHash: input.inputHash,
  });

  if (decision.action !== "reconcile_committed_artifact") {
    throw Error(`Expected reconcile_committed_artifact, got ${decision.action}`);
  }

  const checkpoint = await applyHsiCommittedArtifactReconciliation({
    store: input.store,
    decision,
    finishedAt: input.finishedAt,
  });

  return {checkpoint, recoveryDecision};
}

function honestyEnvelope(base: {
  path: HsiCrashRestartPath;
  investigationId: string;
  taskId: string;
  crashedCheckpoint: HsiDurableCheckpoint;
  recoveredCheckpoint: HsiDurableCheckpoint;
  recoveryDecision: HsiRecoveryDecision;
}): HsiCrashRestartRecoveryResult {
  const result: HsiCrashRestartRecoveryResult = {
    schemaVersion: HSI_CRASH_RESTART_RECOVERY_SCHEMA,
    ...base,
    scientificApproval: false,
    gateCAutoApprove: false,
    implementedAsLiveMultiProcessE2E: false,
  };
  if (
    result.scientificApproval !== false ||
    result.gateCAutoApprove !== false ||
    result.implementedAsLiveMultiProcessE2E !== false
  ) {
    throw Error("Crash/restart recovery must not claim approval or live multi-process E2E");
  }
  return result;
}

/** Full in-process crash/restart scenario for the chosen recovery path. */
export async function runHsiCrashRestartRecoveryScenario(input: {
  store: HsiCheckpointStore;
  path: HsiCrashRestartPath;
  investigationId: string;
  taskId: string;
  inputHash: string;
  crashAt: string;
  approvedBy: string;
  recoveryReason: string;
  artifacts?: HsiReconciliationArtifactReader;
  finishedAt?: string;
  abandonedAt?: string;
  restartedAt?: string;
}): Promise<HsiCrashRestartRecoveryResult> {
  const crashedCheckpoint = await simulateHsiWorkerCrashLeavingRunning({
    store: input.store,
    investigationId: input.investigationId,
    taskId: input.taskId,
    inputHash: input.inputHash,
    startedAt: input.crashAt,
  });

  switch (input.path) {
    case "resume_orphan_same_attempt": {
      const {checkpoint, recoveryDecision} = await resumeHsiOrphanRunningCheckpoint({
        store: input.store,
        investigationId: input.investigationId,
        taskId: input.taskId,
        inputHash: input.inputHash,
        approvedBy: input.approvedBy,
        recoveryReason: input.recoveryReason,
      });
      return honestyEnvelope({
        path: input.path,
        investigationId: input.investigationId,
        taskId: input.taskId,
        crashedCheckpoint,
        recoveredCheckpoint: checkpoint,
        recoveryDecision,
      });
    }
    case "reconcile_committed_artifact": {
      if (!input.artifacts || !input.finishedAt) {
        throw Error("Artifact reader and finishedAt required for reconcile path");
      }
      const {checkpoint, recoveryDecision} = await reconcileHsiCrashWithCommittedArtifact({
        store: input.store,
        artifacts: input.artifacts,
        investigationId: input.investigationId,
        taskId: input.taskId,
        inputHash: input.inputHash,
        approvedBy: input.approvedBy,
        recoveryReason: input.recoveryReason,
        finishedAt: input.finishedAt,
      });
      return honestyEnvelope({
        path: input.path,
        investigationId: input.investigationId,
        taskId: input.taskId,
        crashedCheckpoint,
        recoveredCheckpoint: checkpoint,
        recoveryDecision,
      });
    }
    case "abandon_then_retry": {
      if (!input.abandonedAt || !input.restartedAt) {
        throw Error("abandonedAt and restartedAt required for abandon_then_retry path");
      }
      const {checkpoint, recoveryDecision} = await abandonAndRetryHsiOrphanRunningCheckpoint({
        store: input.store,
        investigationId: input.investigationId,
        taskId: input.taskId,
        inputHash: input.inputHash,
        approvedBy: input.approvedBy,
        recoveryReason: input.recoveryReason,
        abandonedAt: input.abandonedAt,
        restartedAt: input.restartedAt,
      });
      return honestyEnvelope({
        path: input.path,
        investigationId: input.investigationId,
        taskId: input.taskId,
        crashedCheckpoint,
        recoveredCheckpoint: checkpoint,
        recoveryDecision,
      });
    }
    default: {
      const _exhaustive: never = input.path;
      throw Error(`Unknown crash/restart path: ${String(_exhaustive)}`);
    }
  }
}
