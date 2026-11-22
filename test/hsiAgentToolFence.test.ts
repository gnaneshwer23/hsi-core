import {test, expect} from "bun:test";
import {
  createMemoryToolIdempotencyLedger,
  runHsiFencedToolInvocation,
  validateHsiToolIdempotencyKey,
} from "../src/hsiAgentToolFence";
import {createHash} from "node:crypto";

test("idempotency key validation rejects short or empty keys", () => {
  expect(() => validateHsiToolIdempotencyKey("")).toThrow("idempotency");
  expect(() => validateHsiToolIdempotencyKey("short")).toThrow("idempotency");
  expect(() => validateHsiToolIdempotencyKey("literature.search:attempt-1")).not.toThrow();
});

test("pre-aborted signal cancels before dispatch", async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  const outcome = await runHsiFencedToolInvocation({
    tool: "literature.search",
    idempotencyKey: "literature.search:attempt-1",
    signal: controller.signal,
    adapter: async () => {
      calls++;
      return {resultRef: "ref-1", value: {ok: true}};
    },
  });
  expect(calls).toBe(0);
  expect(outcome.status).toBe("cancelled");
});

test("late success after abort is refused", async () => {
  const controller = new AbortController();
  const outcome = await runHsiFencedToolInvocation({
    tool: "evidence.get",
    idempotencyKey: "evidence.get:attempt-1",
    signal: controller.signal,
    adapter: async () => {
      controller.abort();
      return {resultRef: "ref-late", value: {ok: true}};
    },
  });
  expect(outcome.status).toBe("late_commit_refused");
  expect(outcome).not.toHaveProperty("value");
});

test("successful fenced tool returns resultRef", async () => {
  const outcome = await runHsiFencedToolInvocation({
    tool: "graph.query",
    idempotencyKey: "graph.query:attempt-1",
    signal: new AbortController().signal,
    adapter: async () => ({resultRef: "hsi-tool:graph-1", value: {nodes: 2}}),
  });
  expect(outcome.status).toBe("success");
  if (outcome.status === "success") expect(outcome.resultRef).toBe("hsi-tool:graph-1");
  expect(outcome.value).toEqual({nodes: 2});
});

test("memory idempotency ledger rejects conflicting content", async () => {
  const ledger = createMemoryToolIdempotencyLedger();
  const hashA = createHash("sha256").update("a").digest("hex");
  const hashB = createHash("sha256").update("b").digest("hex");
  expect(await ledger.commit("literature.search:attempt-1", hashA)).toBe("inserted");
  expect(await ledger.commit("literature.search:attempt-1", hashA)).toBe("duplicate");
  await expect(ledger.commit("literature.search:attempt-1", hashB)).rejects.toThrow("conflict");
});
