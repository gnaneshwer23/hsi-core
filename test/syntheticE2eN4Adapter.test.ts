import {describe, expect, test} from "bun:test";
import {resolve} from "node:path";
import {runSyntheticE2eN4AdapterCheck} from "../scripts/check-synthetic-e2e-n4-adapter";
import {
  adaptVendoredSyntheticE2eN4Demo,
  parseSyntheticE2eN4AdapterDemo,
} from "../src/evidence/syntheticE2eN4Adapter";

const root = resolve(import.meta.dir, "..");

describe("synthetic e2e → N4 context-mismatch adapter", () => {
  test("wires support + oppose + species mismatch as engineering fixture", () => {
    const demo = parseSyntheticE2eN4AdapterDemo(
      adaptVendoredSyntheticE2eN4Demo({
        repoRoot: root,
        generatedAt: "2026-11-08T05:40:00.000Z",
      }),
    );
    expect(demo.fixtureKind).toBe("engineering");
    expect(demo.approvedCorpus).toBe(false);
    expect(demo.retrievalIndex).toBe(false);
    expect(demo.dataClass).toBe("synthetic");
    expect(demo.containsPhi).toBe(false);
    expect(demo.brief.outcome).toBe("conflicting_sources");
    expect(demo.hasSupportsWithPassage).toBe(true);
    expect(demo.hasChallengesWithPassage).toBe(true);
    expect(demo.hasWrongContext).toBe(true);
    expect(demo.groundedClaimAccepted).toBe(false);
    expect(demo.brief.groundedClaimAccepted).toBe(false);
    expect(demo.scientificAcceptance).toBe("BLOCKED");
    expect(demo.gateCAutoApprove).toBe(false);
    expect(demo.legalBinding).toBe(false);
    expect(demo.neonClinicalWrites).toBe(false);
    expect(demo.honestyBanners.some((b) => b.includes("synthetic ≠ clinical ≠ eligible"))).toBe(true);
    expect(demo.corpus.passages.every((p) => p.fixtureKind === "engineering")).toBe(true);
  });

  test("check script clears engineering harness and keeps groundedClaimAccepted false", () => {
    const result = runSyntheticE2eN4AdapterCheck();
    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("conflicting_sources");
    expect(result.groundedClaimAccepted).toBe(false);
    expect(result.engineeringHarness).toBe("CLEARED");
    expect(result.scientificAcceptance).toBe("BLOCKED");
    expect(result.supportAssessments).toContain("supports_with_passage");
    expect(result.supportAssessments).toContain("challenges_with_passage");
    expect(result.supportAssessments).toContain("wrong_context");
  });
});
