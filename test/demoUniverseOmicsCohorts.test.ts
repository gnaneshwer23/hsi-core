import { describe, expect, it } from "bun:test";
import {
  DEMO_HONESTY,
  DEMO_OMICS_COHORT_SCHEMA,
  demoOmicsAllowsRealData,
  demoUniverseAllowsProductionWrite,
  getDemoOmicsCohortPack,
  listDemoAssaysForScenario,
  listDemoCohortsForScenario,
  presentDemoCohortCounts,
} from "../src/demoUniverse";

describe("Demo Research Universe omics & synthetic cohorts (PR5)", () => {
  it("packs synthetic-only assays, omics and cohorts without clinical-plane shards", () => {
    const pack = getDemoOmicsCohortPack();
    expect(pack.schemaVersion).toBe(DEMO_OMICS_COHORT_SCHEMA);
    expect(pack.canWriteToProductionGraph).toBe(false);
    expect(pack.canEnableRealData).toBe(false);
    expect(pack.loadsClinicalPlaneShards).toBe(false);
    expect(pack.honesty).toEqual(DEMO_HONESTY);
    expect(pack.assays.length).toBeGreaterThanOrEqual(3);
    expect(pack.omicsCandidates.length).toBeGreaterThanOrEqual(3);
    expect(pack.cohorts.length).toBeGreaterThanOrEqual(3);
    for (const a of pack.assays) {
      expect(a.fakeQcScore).toBe(false);
      expect(a.honesty.scientificApproval).toBe(false);
    }
    for (const c of pack.cohorts) {
      expect(c.dataClass).toBe("synthetic");
      expect(c.realDataEnabled).toBe(false);
      expect(c.smallCellsWithheld).toBe(true);
    }
    expect(demoOmicsAllowsRealData()).toBe(false);
    expect(demoUniverseAllowsProductionWrite()).toBe(false);
  });

  it("withholds matched counts below the small-cell threshold", () => {
    const small = listDemoCohortsForScenario("comparative-disease-mechanisms")[0];
    expect(small).toBeDefined();
    const presented = presentDemoCohortCounts(small!);
    expect(presented.matched).toBeNull();
    expect(presented.withheldKeys).toContain("matched");
    expect(presented.evaluated).toBe(28);
  });

  it("links scRNA assay sketches to the single-cell scenario", () => {
    const assays = listDemoAssaysForScenario("single-cell-omics");
    expect(assays.some((a) => a.modality === "scrna-seq")).toBe(true);
    expect(assays.every((a) => a.linkedScenarioId === "single-cell-omics")).toBe(true);
  });

  it("refuses presenting a non-synthetic dataClass", () => {
    const pack = getDemoOmicsCohortPack();
    const bad = {
      ...pack.cohorts[0]!,
      dataClass: "real" as "synthetic",
    };
    expect(() => presentDemoCohortCounts(bad)).toThrow(/non-synthetic/);
  });
});
