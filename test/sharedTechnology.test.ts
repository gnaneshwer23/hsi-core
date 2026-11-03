import { expect, test } from "bun:test";
import { prioritiseHumanReviewQueue, retrieveSharedNeighbourhood, type SharedGraphAdapter } from "../src/sharedTechnology";
const nodes = ["A", "B", "C"].map((id) => ({ id }));
const edges = [{ id: "AB", s: "A", o: "B", draft: false }, { id: "BC", s: "B", o: "C", draft: true }, { id: "CA", s: "C", o: "A", draft: false }, { id: "BAD", s: "A", o: "missing", draft: false }];
const graph: SharedGraphAdapter<typeof nodes[number], typeof edges[number]> = {
  getNode: (id) => nodes.find((n) => n.id === id), nodeId: (n) => n.id,
  outgoing: (id) => edges.filter((e) => e.s === id), incoming: (id) => edges.filter((e) => e.o === id),
  edgeId: (e) => e.id, subjectId: (e) => e.s, objectId: (e) => e.o, isDraft: (e) => e.draft,
};
test("shared traversal preserves graph identity, handles cycles and ignores broken references", () => {
  const result = retrieveSharedNeighbourhood(graph, "A", { depth: 3 })!;
  expect(result.nodes.map((n) => n.id).sort()).toEqual(["A", "B", "C"]);
  expect(result.edges).toHaveLength(3);
  expect(result.edges.every((r) => edges.includes(r.edge))).toBe(true);
  expect(retrieveSharedNeighbourhood(graph, "unknown")).toBeNull();
});
test("shared traversal enforces direction, draft filtering and hard bounds", () => {
  expect(retrieveSharedNeighbourhood(graph, "A", { depth: 0 })!.edges).toHaveLength(0);
  expect(retrieveSharedNeighbourhood(graph, "A", { depth: 1, direction: "out" })!.edges.map((r) => r.edge.id)).toEqual(["AB"]);
  expect(retrieveSharedNeighbourhood(graph, "A", { depth: 3, includeDraft: false })!.edges.map((r) => r.edge.id).sort()).toEqual(["AB", "CA"]);
  const capped = retrieveSharedNeighbourhood(graph, "A", { depth: 3, maxEdges: 1 })!;
  expect(capped.edges).toHaveLength(1); expect(capped.truncated).toBe(true);
  expect(retrieveSharedNeighbourhood(graph, "A", { depth: 99, maxEdges: 999 })!.maxEdges).toBe(120);
});
test("shared review ordering preserves items, caller ownership and equal-tier order", () => {
  const items = [
    { id: "normal", priority: "Normal" as const, agentType: "OTHER", createdAt: "2026-11-03T12:00:00Z" },
    { id: "urgent", priority: "Urgent" as const, agentType: "OTHER", createdAt: "2026-11-03T12:00:00Z" },
    { id: "guardian", priority: "Urgent" as const, agentType: "GUARDIAN", createdAt: "2026-11-01T12:00:00Z" },
  ];
  expect(prioritiseHumanReviewQueue(items).map((i) => i.id)).toEqual(["guardian", "urgent", "normal"]);
  expect(items[0]!.id).toBe("normal"); expect(prioritiseHumanReviewQueue(items)[0]).toBe(items[2]);
});
