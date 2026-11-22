/** ARCH-009 host helper: authorize + fence one tool attempt (U27).
 *
 * Combines orchestrator `assertTool` permission checks with
 * `runHsiFencedToolInvocation` so adapters get stable idempotency keys and
 * late-commit refusal. Does not dispatch network calls by itself, invent
 * credentials, or claim live agent workloads are approved.
 */
import type {HsiToolId} from "./hsiAgentIntelligenceContracts";
import {
  runHsiFencedToolInvocation,
  type HsiFencedToolAdapter,
  type HsiToolFenceOutcome,
} from "./hsiAgentToolFence";

export const HSI_FENCED_TOOL_CALLER_SCHEMA = "hsi-agent-fenced-tool-caller-1" as const;

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

export type HsiFencedToolCaller = {
  schemaVersion: typeof HSI_FENCED_TOOL_CALLER_SCHEMA;
  investigationId: string;
  taskId: string;
  /** Next attempt index that would be used for a tool (1-based). */
  nextAttempt: (tool: HsiToolId) => number;
  invoke: <T>(
    tool: HsiToolId,
    adapter: HsiFencedToolAdapter<T>,
  ) => Promise<HsiToolFenceOutcome & {value?: T; attempt: number}>;
};

export function buildHsiToolIdempotencyKey(input: {
  investigationId: string;
  taskId: string;
  tool: HsiToolId;
  attempt: number;
}): string {
  if (!ID.test(input.investigationId) || !ID.test(input.taskId)) {
    throw Error("Invalid investigation or task identity for tool fence");
  }
  if (!Number.isInteger(input.attempt) || input.attempt < 1 || input.attempt > 100) {
    throw Error("Invalid tool attempt");
  }
  // Tool ids contain '.' — allowed by fence key regex.
  return `${input.investigationId}:${input.taskId}:${input.tool}:attempt-${input.attempt}`;
}

/** Unwrap a successful fenced outcome or throw a stable host error. */
export function unwrapHsiFencedToolSuccess<T>(
  outcome: HsiToolFenceOutcome & {value?: T},
  toolLabel: string,
): {value: T; resultRef: string} {
  if (outcome.status === "success") {
    if (outcome.value === undefined) throw Error(`${toolLabel} succeeded without value`);
    return {value: outcome.value, resultRef: outcome.resultRef};
  }
  switch (outcome.status) {
    case "late_commit_refused":
      throw Error(`${toolLabel} late commit refused after abort`);
    case "cancelled":
      throw Error(`${toolLabel} cancelled`);
    case "failed":
      throw Error(`${toolLabel} failed: ${outcome.reason}`);
    default: {
      const _exhaustive: never = outcome;
      throw Error(`Unknown fence outcome: ${String(_exhaustive)}`);
    }
  }
}

export function createHsiFencedToolCaller(input: {
  investigationId: string;
  taskId: string;
  assertTool: (tool: HsiToolId) => void;
  signal: AbortSignal;
}): HsiFencedToolCaller {
  if (!ID.test(input.investigationId) || !ID.test(input.taskId)) {
    throw Error("Invalid investigation or task identity for tool fence");
  }
  const attempts = new Map<HsiToolId, number>();
  return {
    schemaVersion: HSI_FENCED_TOOL_CALLER_SCHEMA,
    investigationId: input.investigationId,
    taskId: input.taskId,
    nextAttempt(tool) {
      return (attempts.get(tool) ?? 0) + 1;
    },
    async invoke(tool, adapter) {
      input.assertTool(tool);
      const attempt = (attempts.get(tool) ?? 0) + 1;
      attempts.set(tool, attempt);
      const idempotencyKey = buildHsiToolIdempotencyKey({
        investigationId: input.investigationId,
        taskId: input.taskId,
        tool,
        attempt,
      });
      const outcome = await runHsiFencedToolInvocation({
        tool,
        idempotencyKey,
        signal: input.signal,
        adapter,
      });
      return {...outcome, attempt};
    },
  };
}
