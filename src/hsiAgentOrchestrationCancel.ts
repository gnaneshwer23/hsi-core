/** ARCH-009 orchestration cancel-reason taxonomy (U30 soft-land).
 *
 * Distinguishes why an orchestration stopped without scientific approval.
 * Does not undo side effects, invent live agent approval, or claim multi-process E2E.
 */

export const HSI_ORCHESTRATION_CANCEL_SCHEMA = "hsi-agent-orchestration-cancel-1" as const;

export const HSI_ORCHESTRATION_CANCEL_REASONS = [
  "parent_signal",
  "wall_clock_budget",
  "task_timeout",
  "policy_denied",
  "unknown",
] as const;

export type HsiOrchestrationCancelReason = (typeof HSI_ORCHESTRATION_CANCEL_REASONS)[number];

export type HsiOrchestrationCancelRecord = {
  schemaVersion: typeof HSI_ORCHESTRATION_CANCEL_SCHEMA;
  reason: HsiOrchestrationCancelReason;
  /** Task that was active when cancelled, or null if cancelled before any task started. */
  taskId: string | null;
  scientificApproval: false;
  externalSideEffectsUndone: false;
};

export function validateHsiOrchestrationCancelRecord(record: HsiOrchestrationCancelRecord): void {
  if (!record || record.schemaVersion !== HSI_ORCHESTRATION_CANCEL_SCHEMA) {
    throw Error("Invalid orchestration cancel schema");
  }
  if (!(HSI_ORCHESTRATION_CANCEL_REASONS as readonly string[]).includes(record.reason)) {
    throw Error("Unknown orchestration cancel reason");
  }
  if (record.taskId !== null && !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(record.taskId)) {
    throw Error("Invalid cancel task identity");
  }
  if (record.scientificApproval !== false || record.externalSideEffectsUndone !== false) {
    throw Error("Cancel record must not claim approval or undone side effects");
  }
}

/** Prefer wall-clock budget over parent when both may have aborted. */
export function classifyHsiOrchestrationCancel(input: {
  budgetExceeded: boolean;
  parentAborted: boolean;
  taskTimedOut: boolean;
  policyDenied: boolean;
  taskId: string | null;
}): HsiOrchestrationCancelRecord {
  let reason: HsiOrchestrationCancelReason;
  if (input.budgetExceeded) reason = "wall_clock_budget";
  else if (input.parentAborted) reason = "parent_signal";
  else if (input.taskTimedOut) reason = "task_timeout";
  else if (input.policyDenied) reason = "policy_denied";
  else reason = "unknown";
  const record: HsiOrchestrationCancelRecord = {
    schemaVersion: HSI_ORCHESTRATION_CANCEL_SCHEMA,
    reason,
    taskId: input.taskId,
    scientificApproval: false,
    externalSideEffectsUndone: false,
  };
  validateHsiOrchestrationCancelRecord(record);
  return record;
}
