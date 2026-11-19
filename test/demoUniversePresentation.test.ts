import { describe, expect, it } from "bun:test";
import {
  buildDemoComparisonView,
  demoUniverseAllowsProductionWrite,
  listDemoScenarioIds,
  listDemoScenarioSummaries,
  provenanceLabel,
} from "../src/demoUniverse";

describe("Demo Research Universe presentation (PR3)", () => {
  it("lists one summary per seeded scenario", () => {
    const summaries = listDemoScenarioSummaries();
    expect(summaries.map((s) => s.scenarioId)).toEqual([...listDemoScenarioIds()]);
    expect(summaries).toHaveLength(6);
    for (const s of summaries) {
      expect(s.status).toBe("seeded");
      expect(s.question.length).toBeGreaterThan(20);
      expect(s.investigationId.startsWith("DEMO-INV-")).toBe(true);
    }
  });

  it("builds a comparison view with opposing synthetic sides and a brief", () => {
    const view = buildDemoComparisonView("gut-immune-metabolic");
    expect(view.investigationId).toBe("DEMO-INV-001");
    expect(view.left.claimId).toBe(view.comparison.leftClaimId);
    expect(view.right.claimId).toBe(view.comparison.rightClaimId);
    expect(view.left.provenance).toBe("fully_synthetic_fixture");
    expect(view.right.provenance).toBe("fully_synthetic_fixture");
    expect(view.left.polarity).toBe("supports");
    expect(view.right.polarity).toBe("conflicts");
    expect(view.comparison.whyTheyDiffer.length).toBeGreaterThanOrEqual(3);
    expect(view.brief.limitations.length).toBeGreaterThanOrEqual(4);
    expect(view.honesty.scientificApproval).toBe(false);
    expect(view.canWriteToProductionGraph).toBe(false);
    expect(demoUniverseAllowsProductionWrite()).toBe(false);
  });

  it("builds comparison views for every Phase 2 investigation", () => {
    for (const summary of listDemoScenarioSummaries()) {
      const view = buildDemoComparisonView(summary.scenarioId);
      expect(view.scenarioId).toBe(summary.scenarioId);
      expect(view.left.contextModel.length).toBeGreaterThan(0);
      expect(view.right.contextModel.length).toBeGreaterThan(0);
      expect(view.journeySteps).toHaveLength(7);
      expect(view.gaps.length).toBeGreaterThanOrEqual(1);
      expect(view.hypothesisText.length).toBeGreaterThan(20);
    }
  });

  it("labels provenance classes exhaustively", () => {
    expect(provenanceLabel("verified_public_source")).toMatch(/Verified/);
    expect(provenanceLabel("curated_demonstration_interpretation")).toMatch(/Curated/);
    expect(provenanceLabel("fully_synthetic_fixture")).toMatch(/synthetic/i);
  });
});
