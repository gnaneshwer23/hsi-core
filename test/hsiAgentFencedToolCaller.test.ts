import {test, expect} from "bun:test";
import {
  buildHsiToolIdempotencyKey,
  createHsiFencedToolCaller,
  unwrapHsiFencedToolSuccess,
} from "../src/hsiAgentFencedToolCaller";

test("idempotency keys are stable and attempt-scoped", () => {
  expect(
    buildHsiToolIdempotencyKey({
      investigationId: "inv-1",
      taskId: "evidence-retrieval",
      tool: "literature.search",
      attempt: 1,
    }),
  ).toBe("inv-1:evidence-retrieval:literature.search:attempt-1");
  expect(() =>
    buildHsiToolIdempotencyKey({
      investigationId: "inv-1",
      taskId: "evidence-retrieval",
      tool: "literature.search",
      attempt: 0,
    }),
  ).toThrow("attempt");
});

test("caller authorizes then fences; late abort refuses commit", async () => {
  const authorized: string[] = [];
  const controller = new AbortController();
  const caller = createHsiFencedToolCaller({
    investigationId: "inv-demo",
    taskId: "mechanism-analysis",
    assertTool: (tool) => {
      authorized.push(tool);
    },
    signal: controller.signal,
  });
  expect(caller.nextAttempt("graph.query")).toBe(1);
  const late = await caller.invoke("graph.query", async () => {
    controller.abort();
    return {resultRef: "hsi-tool:graph.query:late", value: {n: 1}};
  });
  expect(authorized).toEqual(["graph.query"]);
  expect(late.status).toBe("late_commit_refused");
  expect(late.attempt).toBe(1);
  expect(caller.nextAttempt("graph.query")).toBe(2);
});

test("successful invoke returns value and increments attempt", async () => {
  const caller = createHsiFencedToolCaller({
    investigationId: "inv-demo",
    taskId: "evidence-retrieval",
    assertTool: () => undefined,
    signal: new AbortController().signal,
  });
  const first = await caller.invoke("literature.search", async () => ({
    resultRef: "hsi-tool:literature.search:a",
    value: {hits: 3},
  }));
  expect(first.status).toBe("success");
  if (first.status === "success") {
    expect(first.resultRef).toBe("hsi-tool:literature.search:a");
    expect(first.value).toEqual({hits: 3});
  }
  expect(first.attempt).toBe(1);
  const second = await caller.invoke("literature.search", async () => ({
    resultRef: "hsi-tool:literature.search:b",
    value: {hits: 4},
  }));
  expect(second.attempt).toBe(2);
  expect(second.status).toBe("success");
});

test("unwrapHsiFencedToolSuccess returns value or throws stable labels", () => {
  expect(
    unwrapHsiFencedToolSuccess(
      {status: "success", idempotencyKey: "k", resultRef: "r", value: {ok: true}},
      "Graph query",
    ),
  ).toEqual({value: {ok: true}, resultRef: "r"});
  expect(() =>
    unwrapHsiFencedToolSuccess(
      {status: "late_commit_refused", idempotencyKey: "k", reason: "late"},
      "Graph query",
    ),
  ).toThrow("late commit refused");
  expect(() =>
    unwrapHsiFencedToolSuccess(
      {status: "failed", idempotencyKey: "k", reason: "boom"},
      "Graph query",
    ),
  ).toThrow("Graph query failed: boom");
});

test("permission denial from assertTool never reaches the adapter", async () => {
  let adapterCalls = 0;
  const caller = createHsiFencedToolCaller({
    investigationId: "inv-demo",
    taskId: "evidence-retrieval",
    assertTool: () => {
      throw Error("Agent tool budget exceeded or unknown tool");
    },
    signal: new AbortController().signal,
  });
  await expect(
    caller.invoke("literature.search", async () => {
      adapterCalls++;
      return {resultRef: "should-not-run", value: true};
    }),
  ).rejects.toThrow("budget");
  expect(adapterCalls).toBe(0);
});
