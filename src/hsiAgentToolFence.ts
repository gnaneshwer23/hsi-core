/** ARCH-009 external tool side-effect fence (U25 soft-land).
 *
 * AbortSignal alone cannot stop remote work. Adapters must:
 * 1. Use a stable idempotency key per logical tool attempt
 * 2. Check cooperative cancellation before and after the side effect
 * 3. Refuse to commit a late success after abort
 *
 * This module does not dispatch network calls, invent provider credentials,
 * grant scientific approval, or claim live agent workloads are approved.
 */
import type {HsiToolId} from "./hsiAgentIntelligenceContracts";

export const HSI_TOOL_FENCE_SCHEMA = "hsi-agent-tool-fence-1" as const;

export type HsiToolFenceOutcome =
  | {status: "success"; idempotencyKey: string; resultRef: string}
  | {status: "cancelled"; idempotencyKey: string; reason: string}
  | {status: "failed"; idempotencyKey: string; reason: string}
  | {status: "late_commit_refused"; idempotencyKey: string; reason: string};

export type HsiFencedToolAdapter<T> = (input: {
  tool: HsiToolId;
  idempotencyKey: string;
  signal: AbortSignal;
}) => Promise<{resultRef: string; value: T}>;

const KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,199}$/;

export function validateHsiToolIdempotencyKey(key: string): void {
  if (!KEY.test(key)) throw Error("Invalid tool idempotency key");
}

/** Run one fenced tool attempt. Late commits after abort are refused. */
export async function runHsiFencedToolInvocation<T>(input: {
  tool: HsiToolId;
  idempotencyKey: string;
  signal: AbortSignal;
  adapter: HsiFencedToolAdapter<T>;
}): Promise<HsiToolFenceOutcome & {value?: T}> {
  validateHsiToolIdempotencyKey(input.idempotencyKey);
  if (input.signal.aborted) {
    return {
      status: "cancelled",
      idempotencyKey: input.idempotencyKey,
      reason: "Cancelled before tool dispatch",
    };
  }
  try {
    const result = await input.adapter({
      tool: input.tool,
      idempotencyKey: input.idempotencyKey,
      signal: input.signal,
    });
    if (input.signal.aborted) {
      return {
        status: "late_commit_refused",
        idempotencyKey: input.idempotencyKey,
        reason: "Abort observed after tool returned; late success must not be committed",
      };
    }
    if (!result?.resultRef?.trim()) throw Error("Tool adapter returned empty result reference");
    return {
      status: "success",
      idempotencyKey: input.idempotencyKey,
      resultRef: result.resultRef,
      value: result.value,
    };
  } catch (error) {
    if (input.signal.aborted) {
      return {
        status: "cancelled",
        idempotencyKey: input.idempotencyKey,
        reason: "Cancelled during tool execution",
      };
    }
    return {
      status: "failed",
      idempotencyKey: input.idempotencyKey,
      reason: error instanceof Error ? error.message : "Tool adapter failed",
    };
  }
}

/** In-memory idempotent sink for adapter tests — rejects conflicting content under the same key. */
export function createMemoryToolIdempotencyLedger() {
  const rows = new Map<string, string>();
  return {
    async commit(idempotencyKey: string, contentHash: string): Promise<"inserted" | "duplicate"> {
      validateHsiToolIdempotencyKey(idempotencyKey);
      if (!/^[a-f0-9]{64}$/.test(contentHash)) throw Error("Invalid content hash");
      const prior = rows.get(idempotencyKey);
      if (prior === undefined) {
        rows.set(idempotencyKey, contentHash);
        return "inserted";
      }
      if (prior !== contentHash) throw Error("Idempotency key conflict: different content");
      return "duplicate";
    },
    get(idempotencyKey: string): string | undefined {
      return rows.get(idempotencyKey);
    },
  };
}
