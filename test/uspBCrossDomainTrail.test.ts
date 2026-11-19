import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseDomainBundle } from "../src/knowledgeGraph/domainGraph";
import {
  assertUspBTrailHonesty,
  buildUspBCrossDomainTrail,
  buildUspBPathViews,
  defaultTargetDepartment,
  edgeEvidenceStatus,
  matchRunLabelsToGraphNodes,
  suggestCrossDomainStarts,
  USP_B_TRAIL_HONESTY,
} from "../src/investigation/uspBCrossDomainTrail";

const bundle = parseDomainBundle(
  JSON.parse(
    readFileSync(resolve("research/domain-graph/graph.v1.json"), "utf8"),
  ),
);

describe("USP B cross-domain trail", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertUspBTrailHonesty(USP_B_TRAIL_HONESTY);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.causalConclusionAllowed).toBe(false);
    expect(honesty.inventsEdges).toBe(false);
    expect(honesty.candidatePathsAreNotValidatedMechanisms).toBe(true);
    expect(honesty.aiHypothesesRemainUnvalidated).toBe(true);
    expect(honesty.usp).toBe("B");
  });

  test("starts at ask before graph load", () => {
    const trail = buildUspBCrossDomainTrail({
      hasRun: false,
      graphLoaded: false,
      matchedNodeCount: 0,
      selectedStartId: null,
      selectedTargetDepartment: null,
      pathCount: 0,
      selectedPathIndex: null,
      gapCount: 0,
      hypothesisCount: 0,
      briefOpen: false,
    });
    expect(trail.activeStep).toBe("ask");
    expect(trail.steps.map((s) => s.id)).toEqual([
      "ask",
      "domains",
      "pathways",
      "gaps",
      "brief",
    ]);
  });

  test("advances through domains, pathways, gaps, brief", () => {
    expect(
      buildUspBCrossDomainTrail({
        hasRun: true,
        graphLoaded: true,
        matchedNodeCount: 1,
        selectedStartId: null,
        selectedTargetDepartment: null,
        pathCount: 0,
        selectedPathIndex: null,
        gapCount: 0,
        hypothesisCount: 0,
        briefOpen: false,
      }).activeStep,
    ).toBe("domains");

    expect(
      buildUspBCrossDomainTrail({
        hasRun: true,
        graphLoaded: true,
        matchedNodeCount: 1,
        selectedStartId: "concept:il-21-9b74211",
        selectedTargetDepartment: "neuroscience",
        pathCount: 2,
        selectedPathIndex: null,
        gapCount: 1,
        hypothesisCount: 1,
        briefOpen: false,
      }).activeStep,
    ).toBe("pathways");

    expect(
      buildUspBCrossDomainTrail({
        hasRun: true,
        graphLoaded: true,
        matchedNodeCount: 1,
        selectedStartId: "concept:il-21-9b74211",
        selectedTargetDepartment: "neuroscience",
        pathCount: 2,
        selectedPathIndex: 0,
        gapCount: 1,
        hypothesisCount: 1,
        briefOpen: false,
      }).activeStep,
    ).toBe("gaps");

    expect(
      buildUspBCrossDomainTrail({
        hasRun: true,
        graphLoaded: true,
        matchedNodeCount: 1,
        selectedStartId: "concept:il-21-9b74211",
        selectedTargetDepartment: "neuroscience",
        pathCount: 2,
        selectedPathIndex: 0,
        gapCount: 1,
        hypothesisCount: 1,
        briefOpen: true,
      }).activeStep,
    ).toBe("brief");
  });

  test("matches IL-21 run labels without inventing nodes", () => {
    const matches = matchRunLabelsToGraphNodes(bundle, [
      "IL-21",
      "T follicular helper cells",
      "Invented Entity XYZ",
    ]);
    expect(matches.some((m) => m.nodeName === "IL-21")).toBe(true);
    expect(matches.every((m) => m.nodeName !== "Invented Entity XYZ")).toBe(true);
    const suggested = suggestCrossDomainStarts(matches);
    expect(suggested[0]?.nodeId).toBeTruthy();
    expect(defaultTargetDepartment(suggested[0]!)).not.toBe("immunology");
  });

  test("path views keep candidate labels and deny causal conclusion", () => {
    const start = bundle.nodes.find((n) => n.name === "Acetate");
    expect(start).toBeTruthy();
    const { result, paths } = buildUspBPathViews(bundle, start!.id, "immunology", {
      maxHops: 4,
      maxPaths: 3,
    });
    expect(["paths_found", "no_path_within_bound", "target_has_no_graph_coverage"]).toContain(
      result.status,
    );
    for (const path of paths) {
      expect(path.causalConclusionAllowed).toBe(false);
      for (const hop of path.hops) {
        expect(["candidate", "research_gap", "ai_hypothesis", "unknown"]).toContain(
          hop.evidenceStatus,
        );
        expect(hop.evidenceStatus).not.toBe("ai_hypothesis");
      }
    }
  });

  test("edge evidence status never invents reviewed evidence", () => {
    expect(
      edgeEvidenceStatus({ kind: "source_candidate", reviewStatus: "unreviewed" }),
    ).toBe("candidate");
    expect(
      edgeEvidenceStatus({ kind: "research_gap", reviewStatus: "unreviewed" }),
    ).toBe("research_gap");
  });
});
