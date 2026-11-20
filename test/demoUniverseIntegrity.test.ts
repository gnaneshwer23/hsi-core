import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEMO_HONESTY,
  DEMO_UNIVERSE_MANIFEST,
  DEMO_UNIVERSE_SCHEMA,
  GUT_IMMUNE_METABOLIC_BUNDLE,
  assertValidDemoUniverseBundle,
  demoUniverseAllowsProductionWrite,
  getDemoInvestigationJourney,
  getDemoUniverseBundle,
  listDemoScenarioIds,
  validateDemoUniverseBundle,
} from "../src/demoUniverse";

describe("Demo Research Universe integrity", () => {
  it("validates the Phase 1 gut-immune-metabolic bundle with zero issues", () => {
    expect(validateDemoUniverseBundle(GUT_IMMUNE_METABOLIC_BUNDLE)).toEqual([]);
    assertValidDemoUniverseBundle(GUT_IMMUNE_METABOLIC_BUNDLE);
    expect(GUT_IMMUNE_METABOLIC_BUNDLE.schemaVersion).toBe(DEMO_UNIVERSE_SCHEMA);
  });

  it("exposes the complete investigation journey without claiming scientific approval", () => {
    const journey = getDemoInvestigationJourney("DEMO-INV-001");
    expect(journey.steps.map((s) => s.id)).toEqual([
      "question",
      "evidence-context",
      "mechanism-graph",
      "conflicting-findings",
      "uncertainty",
      "hypothesis",
      "brief",
    ]);
    expect(journey.question).toMatch(/gut-derived metabolites/i);
    expect(journey.comparison.leftClaimId).toBe("DEMO-CLAIM-001");
    expect(journey.comparison.rightClaimId).toBe("DEMO-CLAIM-002");
    expect(journey.brief.limitations.length).toBeGreaterThanOrEqual(4);
    expect(journey.honesty.scientificApproval).toBe(false);
    expect(journey.honesty.canWriteToProductionGraph).toBe(false);
    expect(demoUniverseAllowsProductionWrite()).toBe(false);
  });

  it("keeps provenance classes honest: real PMIDs only on verified sources; synthetic lacks identifiers", () => {
    const bundle = getDemoUniverseBundle("gut-immune-metabolic");
    const verified = bundle.publications.filter((p) => p.provenance === "verified_public_source");
    expect(verified.length).toBe(2);
    for (const p of verified) {
      expect(Boolean(p.pmid || p.doi)).toBe(true);
      expect(p.abstractReproduced).toBe(false);
    }
    const syntheticClaims = bundle.claims.filter((c) => c.provenance === "fully_synthetic_fixture");
    expect(syntheticClaims.length).toBeGreaterThanOrEqual(2);
    for (const c of syntheticClaims) {
      expect(c.publicationId).toBeUndefined();
    }
    const insufficient = bundle.claims.find((c) => c.id === "DEMO-CLAIM-005");
    expect(insufficient?.polarity).toBe("insufficient");
  });

  it("registers reuse pointers and does not embed sealed graph JSON", () => {
    expect(listDemoScenarioIds()).toEqual(["gut-immune-metabolic"]);
    expect(DEMO_UNIVERSE_MANIFEST.seededScenarioIds).toContain("gut-immune-metabolic");
    expect(DEMO_UNIVERSE_MANIFEST.entries.some((e) => e.id === "do-not-touch-sealed-graph")).toBe(true);
    const fixture = readFileSync(
      resolve(import.meta.dir, "../src/demoUniverse/fixtures/gutImmuneMetabolic.ts"),
      "utf8",
    );
    expect(fixture).not.toMatch(/"nodes"\s*:\s*\[\s*\{[^]{500,}/);
    expect(fixture).toContain("sealedGraphEdgeIdRef");
    expect(fixture).toContain("HSI-C-GUT-005");
    expect(DEMO_HONESTY).toEqual(GUT_IMMUNE_METABOLIC_BUNDLE.honesty);
  });

  it("fails closed when a claim reference is broken", () => {
    const broken = {
      ...GUT_IMMUNE_METABOLIC_BUNDLE,
      investigation: {
        ...GUT_IMMUNE_METABOLIC_BUNDLE.investigation,
        evidenceClaimIds: ["DEMO-CLAIM-MISSING"],
      },
    };
    const issues = validateDemoUniverseBundle(broken);
    expect(issues.some((i) => i.code === "inv_claim" && i.message.includes("DEMO-CLAIM-MISSING"))).toBe(true);
  });
});
