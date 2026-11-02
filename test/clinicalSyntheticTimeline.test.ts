import { describe, expect, it } from "bun:test";
import {
  buildClinicalTimelineView,
  CLINICAL_PROVIDERS,
  listSyntheticTimelineFixtures,
} from "../src/clinicalSyntheticTimeline";

describe("HSI Clinical synthetic timeline", () => {
  it("lists multi-provider syntheticOnly fixtures without PHI", () => {
    const fixtures = listSyntheticTimelineFixtures();
    expect(fixtures.length).toBeGreaterThanOrEqual(2);
    for (const f of fixtures) {
      expect(f.syntheticOnly).toBe(true);
      expect(f.containsPhi).toBe(false);
      expect(f.liveEmis).toBe(false);
      expect(f.providers.length).toBeGreaterThan(1);
      expect(f.omittedAttributes.length).toBeGreaterThan(0);
    }
  });

  it("builds timeline with missing-info and provider coverage", () => {
    const view = buildClinicalTimelineView("syn-t2d-multi-provider-01");
    expect(view).not.toBeNull();
    if (!view) return;
    expect(view.syntheticOnly).toBe(true);
    expect(view.liveEmis).toBe(false);
    expect(view.events.length).toBeGreaterThan(0);
    expect(view.missingInformation.length).toBeGreaterThan(0);
    const kinds = new Set(view.missingInformation.map((m) => m.kind));
    expect(kinds.has("not_recorded")).toBe(true);
    expect(kinds.has("unavailable")).toBe(true);
    for (const m of view.missingInformation) {
      expect(m.verificationStep.length).toBeGreaterThan(0);
      expect(m.whyItMatters.length).toBeGreaterThan(0);
    }
    for (const e of view.events) {
      expect(e.sourceSystem.startsWith("fixture://")).toBe(true);
    }
    const covered = CLINICAL_PROVIDERS.filter((p) => view.providerCoverage[p] > 0);
    expect(covered.length).toBeGreaterThanOrEqual(2);
    expect(view.invariants.liveEmis).toBe(false);
    expect(view.honesty.some((h) => /syntheticOnly/i.test(h))).toBe(true);
  });

  it("builds second walkthrough fixture with Cap 9 kinds including not_applicable", () => {
    const fixtures = listSyntheticTimelineFixtures();
    const ids = fixtures.map((f) => f.fixtureId);
    expect(ids).toContain("syn-t2d-multi-provider-01");
    expect(ids).toContain("syn-asthma-multi-provider-03");

    const view = buildClinicalTimelineView("syn-asthma-multi-provider-03");
    expect(view).not.toBeNull();
    if (!view) return;
    expect(view.syntheticOnly).toBe(true);
    expect(view.containsPhi).toBe(false);
    expect(view.liveEmis).toBe(false);
    expect(view.events.length).toBeGreaterThanOrEqual(4);
    expect(view.missingInformation.length).toBeGreaterThanOrEqual(3);
    const kinds = new Set(view.missingInformation.map((m) => m.kind));
    expect(kinds.has("not_recorded")).toBe(true);
    expect(kinds.has("unavailable")).toBe(true);
    expect(kinds.has("not_applicable")).toBe(true);
    expect(view.providerCoverage.synthetic_gp).toBeGreaterThan(0);
    expect(view.providerCoverage.synthetic_hospital).toBeGreaterThan(0);
    expect(view.providerCoverage.synthetic_pharmacy).toBeGreaterThan(0);
    for (const e of view.events) {
      expect(e.sourceSystem.startsWith("fixture://")).toBe(true);
    }
  });

  it("fail-closes unknown fixture ids", () => {
    expect(buildClinicalTimelineView("not-a-fixture")).toBeNull();
  });
});
