import { describe, expect, it } from "bun:test";
import {
  DEFAULT_HOME_SCENARIO_ID,
  getHomeScenario,
  HOME_RESEARCH_SCENARIOS,
} from "../site/src/components/editorial/homeResearchScenarios";

describe("homepage cross-domain research scenarios", () => {
  it("keeps SSc as default validation case without making it the only scenario", () => {
    expect(DEFAULT_HOME_SCENARIO_ID).toBe("ssc_fibrosis");
    expect(HOME_RESEARCH_SCENARIOS.length).toBeGreaterThanOrEqual(5);
    expect(HOME_RESEARCH_SCENARIOS.some((s) => s.id === "ssc_fibrosis")).toBe(true);
    expect(HOME_RESEARCH_SCENARIOS.some((s) => s.disease === null)).toBe(true);
  });

  it("marks every homepage scenario as illustrative with live_backend false", () => {
    for (const s of HOME_RESEARCH_SCENARIOS) {
      expect(s.live_backend).toBe(false);
      expect(s.coverage).toBe("illustrative");
      expect(s.review_status).toBe("not_reviewed");
      expect(s.question.length).toBeGreaterThan(10);
      expect(s.mechanism_path.length).toBeGreaterThanOrEqual(4);
      expect(s.domains.length).toBeGreaterThan(0);
    }
  });

  it("includes a disease-independent cytokine scenario", () => {
    const cytokine = getHomeScenario("cytokine_cross_tissue");
    expect(cytokine.disease).toBeNull();
    expect(cytokine.demonstration_id).toBe("demo_cytokine_cross_tissue_001");
  });
});
