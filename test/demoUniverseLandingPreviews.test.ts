import { describe, expect, it } from "bun:test";
import {
  DEMO_HONESTY,
  DEMO_LANDING_PREVIEW_SCHEMA,
  demoLandingAllowsProductionWrite,
  demoScenarioIdForHomeSketch,
  demoUniverseAllowsProductionWrite,
  getDemoLandingPreview,
  getDemoLandingPreviewPack,
  HOME_SKETCH_TO_DEMO_SCENARIO,
  listDemoLandingPreviews,
  listDemoScenarioIds,
} from "../src/demoUniverse";

describe("Demo Research Universe landing previews (PR6)", () => {
  it("packs one card per seeded scenario without production writes", () => {
    const pack = getDemoLandingPreviewPack();
    expect(pack.schemaVersion).toBe(DEMO_LANDING_PREVIEW_SCHEMA);
    expect(pack.canWriteToProductionGraph).toBe(false);
    expect(pack.stagingVerified).toBe(false);
    expect(pack.surface).toBe("public_landing");
    expect(pack.honesty).toEqual(DEMO_HONESTY);
    expect(pack.cards).toHaveLength(listDemoScenarioIds().length);
    expect(demoLandingAllowsProductionWrite()).toBe(false);
    expect(demoUniverseAllowsProductionWrite()).toBe(false);
  });

  it("exposes conflict sides, abstention and deep-links", () => {
    const card = getDemoLandingPreview("gut-immune-metabolic");
    expect(card.coverage).toBe("pack_backed");
    expect(card.liveBackend).toBe(false);
    expect(card.reviewStatus).toBe("not_reviewed");
    expect(card.conflictLeft.length).toBeGreaterThan(20);
    expect(card.conflictRight.length).toBeGreaterThan(20);
    expect(card.abstention.length).toBeGreaterThan(10);
    expect(card.briefLimitationCount).toBeGreaterThan(0);
    expect(card.href).toBe("/demo/universe?scenario=gut-immune-metabolic");
  });

  it("maps homepage sketches onto Demo Universe without inventing ids", () => {
    expect(HOME_SKETCH_TO_DEMO_SCENARIO.ssc_fibrosis).toBe("tissue-remodelling");
    expect(demoScenarioIdForHomeSketch("ssc_fibrosis")).toBe("tissue-remodelling");
    expect(demoScenarioIdForHomeSketch("tumour_immune")).toBeNull();
    const ids = new Set(listDemoLandingPreviews().map((c) => c.scenarioId));
    for (const scenarioId of Object.values(HOME_SKETCH_TO_DEMO_SCENARIO)) {
      expect(ids.has(scenarioId)).toBe(true);
    }
  });
});
