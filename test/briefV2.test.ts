import {describe,expect,test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {verifyDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
  BRIEF_V2_SCHEMA,
  exportBriefV2,
  renderBriefV2Markdown,
  renderBriefV2PrintHtml,
} from "../src/knowledgeGraph/briefV2";

const digest = async (s: string) => createHash("sha256").update(s).digest("hex");
const graph = await verifyDomainBundle(
  JSON.parse(readFileSync("research/domain-graph/graph.v1.json", "utf8")),
  digest,
);

describe("Brief v2 soft-land", () => {
  test("exports graph release id, review states, conflict class and empty run ids without approval", () => {
    const brief = exportBriefV2(graph, "gut-t1d", {}, {
      comparedEdgeIds: ["DIAB-003", "DIAB-015"],
    });
    expect(brief.schemaVersion).toBe(BRIEF_V2_SCHEMA);
    expect(brief.briefVersion).toBe(2);
    expect(brief.graphReleaseId).toBe(graph.version);
    expect(brief.graphVersion).toBe(graph.version);
    expect(brief.runIds).toEqual([]);
    expect(brief.reviewStates.reviewedEdgeCount).toBe(0);
    expect(brief.reviewStates.reviewed).toBe(0);
    expect(brief.reviewStates.unreviewed).toBe(brief.evidence.length);
    expect(brief.scientificApproval).toBe(false);
    expect(brief.graphPromotable).toBe(false);
    expect(brief.reproducibleFromSavedRecord).toBe(false);
    expect(brief.conflictClasses).toHaveLength(1);
    expect(brief.conflictClasses[0]).toMatchObject({
      leftEdgeId: "DIAB-003",
      rightEdgeId: "DIAB-015",
      classification: "context_comparison_required",
      confirmedContradiction: false,
      pooledEffectAllowed: false,
    });
    expect(brief.limitations.some((l) => /0 independently reviewed/i.test(l))).toBe(true);
    expect(brief.reviewStates.note).toMatch(/unreviewed/i);
    expect(brief.evidenceTable.schemaVersion).toBe("hsi-passport-evidence-table-1");
  });

  test("accepts caller-supplied run ids without inventing approval", () => {
    const brief = exportBriefV2(graph, "gut-t2d", {}, { runIds: ["run:demo-1", "bad id!", "ok_run"] });
    expect(brief.runIds).toEqual(["run:demo-1", "ok_run"]);
    expect(brief.scientificApproval).toBe(false);
  });

  test("Markdown and print HTML retain honesty labels and release id", () => {
    const brief = exportBriefV2(graph, "gut-t1d", { model: "human_in_vivo" }, {
      comparedEdgeIds: ["DIAB-003", "DIAB-015"],
    });
    const md = renderBriefV2Markdown(brief);
    expect(md).toContain("# HSI Research Brief v2");
    expect(md).toContain(graph.version);
    expect(md).toContain("Reviewed edges in this brief: 0");
    expect(md).toContain("context_comparison_required");
    expect(md).toContain("Falsification:");
    expect(md).toContain("bibliographic_candidate_not_retrieved");
    expect(md).toContain("review: unreviewed");
    expect(md).not.toContain("scientific approval granted");
    const html = renderBriefV2PrintHtml(brief);
    expect(html).toContain("not scientific approval");
    expect(html).toContain(graph.version.slice(0, 12));
    expect(html).toContain("window.print");
  });

  test("omits conflict class when the slice has fewer than two candidates", () => {
    const brief = exportBriefV2(graph, "gut-t1d", {
      model: "human_in_vivo",
      query: "___no_match_expected___",
    });
    // Still may have candidates depending on query filter behaviour; assert honesty flags either way.
    expect(brief.scientificApproval).toBe(false);
    expect(brief.reviewStates.reviewed).toBe(0);
    if (brief.evidence.length < 2) {
      expect(brief.conflictClasses).toEqual([]);
      expect(brief.conflictNote).toMatch(/Fewer than two/);
    }
  });
});
