import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {verifyDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
  HOMEPAGE_WORKED_CONFLICT_SCHEMA,
  buildHomepageWorkedConflict,
} from "../src/knowledgeGraph/homepageWorkedConflict";

const raw = JSON.parse(readFileSync("research/domain-graph/graph.v1.json", "utf8"));
const digest = async (s: string) => createHash("sha256").update(s).digest("hex");
const graph = await verifyDomainBundle(raw, digest);

describe("homepage worked conflict soft-land", () => {
  test("builds DIAB-003 vs DIAB-015 with citations and no confirmed contradiction", () => {
    const conflict = buildHomepageWorkedConflict(graph);
    expect(conflict).not.toBeNull();
    expect(conflict!.schemaVersion).toBe(HOMEPAGE_WORKED_CONFLICT_SCHEMA);
    expect(conflict!.leftEdgeId).toBe("DIAB-003");
    expect(conflict!.rightEdgeId).toBe("DIAB-015");
    expect(conflict!.confirmedContradiction).toBe(false);
    expect(conflict!.pooledEffectAllowed).toBe(false);
    expect(conflict!.scientificApproval).toBe(false);
    expect(conflict!.reviewedEdgeCount).toBe(0);
    expect(conflict!.reviewStates).toEqual({left: "unreviewed", right: "unreviewed"});
    expect(conflict!.classification).toBe("context_comparison_required");
    expect(conflict!.leftSource?.url).toMatch(/^https?:\/\//);
    expect(conflict!.rightSource?.url).toMatch(/^https?:\/\//);
    expect(conflict!.differences.length).toBeGreaterThan(0);
    expect(conflict!.honestyNote).toMatch(/unreviewed/i);
  });

  test("returns null for unknown edge ids", () => {
    expect(buildHomepageWorkedConflict(graph, ["NOPE-1", "NOPE-2"])).toBeNull();
  });
});
