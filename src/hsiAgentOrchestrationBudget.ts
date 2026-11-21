/** ARCH-009 orchestration wall-clock budget (U29 soft-land).
 *
 * Per-task `timeoutMs` does not bound total multi-stage wall time. This helper
 * validates an orchestration-level budget and builds a combined AbortSignal.
 * Does not undo external side effects, invent live agent approval, or claim
 * multi-process E2E.
 */

export const HSI_ORCHESTRATION_BUDGET_SCHEMA = "hsi-agent-orchestration-budget-1" as const;

export const HSI_ORCHESTRATION_BUDGET_MIN_MS = 100;
export const HSI_ORCHESTRATION_BUDGET_MAX_MS = 600_000;

export function validateHsiOrchestrationBudgetMs(maxOrchestrationMs: number): void {
  if (
    !Number.isInteger(maxOrchestrationMs) ||
    maxOrchestrationMs < HSI_ORCHESTRATION_BUDGET_MIN_MS ||
    maxOrchestrationMs > HSI_ORCHESTRATION_BUDGET_MAX_MS
  ) {
    throw Error("Invalid orchestration wall-clock budget");
  }
}

export type HsiOrchestrationDeadline = {
  schemaVersion: typeof HSI_ORCHESTRATION_BUDGET_SCHEMA;
  signal: AbortSignal;
  /** True once the wall-clock budget (not the parent signal) has fired. */
  budgetExceeded: () => boolean;
  dispose: () => void;
};

/** Combine an optional parent AbortSignal with a wall-clock orchestration budget. */
export function createHsiOrchestrationDeadline(input: {
  maxOrchestrationMs: number;
  parent?: AbortSignal;
}): HsiOrchestrationDeadline {
  validateHsiOrchestrationBudgetMs(input.maxOrchestrationMs);
  let budgetExceeded = false;
  const timeoutSignal = AbortSignal.timeout(input.maxOrchestrationMs);
  const onBudget = () => {
    budgetExceeded = true;
  };
  timeoutSignal.addEventListener("abort", onBudget, {once: true});
  const parts: AbortSignal[] = [];
  if (input.parent) parts.push(input.parent);
  parts.push(timeoutSignal);
  const signal = parts.length === 1 ? parts[0]! : AbortSignal.any(parts);
  return {
    schemaVersion: HSI_ORCHESTRATION_BUDGET_SCHEMA,
    signal,
    budgetExceeded: () => budgetExceeded,
    dispose: () => {
      timeoutSignal.removeEventListener("abort", onBudget);
    },
  };
}
