import { describe, expect, it } from "bun:test";
import {
  DEMO_HONESTY,
  DEMO_ROLE_ADAPTER_SCHEMA,
  demoUniverseAllowsProductionWrite,
  demoUniverseSliceForRole,
  listDemoDashboardRoleIds,
  listDemoScenarioIds,
} from "../src/demoUniverse";

describe("Demo Research Universe role adapters (PR4)", () => {
  it("exposes six dashboard roles without duplicating catalogs", () => {
    expect(listDemoDashboardRoleIds()).toEqual([
      "professor",
      "student",
      "biotech",
      "clinical",
      "lab",
      "community",
    ]);
    const seeded = new Set(listDemoScenarioIds());
    for (const roleId of listDemoDashboardRoleIds()) {
      const slice = demoUniverseSliceForRole(roleId);
      expect(slice.schemaVersion).toBe(DEMO_ROLE_ADAPTER_SCHEMA);
      expect(slice.duplicatesCatalog).toBe(false);
      expect(slice.canWriteToProductionGraph).toBe(false);
      expect(slice.honesty).toEqual(DEMO_HONESTY);
      expect(slice.comparisonSurface).toBe("/demo/universe");
      expect(slice.cards.length).toBeGreaterThanOrEqual(3);
      for (const card of slice.cards) {
        expect(seeded.has(card.scenarioId)).toBe(true);
        expect(card.href).toContain(`/demo/universe?scenario=${card.scenarioId}`);
        expect(card.question.length).toBeGreaterThan(20);
      }
      expect(slice.sharedNodeIds.length).toBeGreaterThan(0);
    }
    expect(demoUniverseAllowsProductionWrite()).toBe(false);
  });

  it("maps lab role onto omics and tissue scenarios", () => {
    const lab = demoUniverseSliceForRole("lab");
    expect(lab.cards.map((c) => c.scenarioId)).toEqual([
      "single-cell-omics",
      "tissue-remodelling",
      "gut-immune-metabolic",
    ]);
  });

  it("maps clinical role without claiming CDS", () => {
    const clinical = demoUniverseSliceForRole("clinical");
    expect(clinical.summary).toMatch(/Not CDS/i);
    expect(clinical.honesty.notClinicalAdvice).toBe(true);
  });
});
