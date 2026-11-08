import {describe, expect, test} from "bun:test";
import {resolve} from "node:path";
import {runSyntheticE2eN5AdapterCheck} from "../scripts/check-synthetic-e2e-n5-adapter";
import {
  adaptVendoredSyntheticE2eDefaultSlice,
  mapPackScreeningToPathBAggregate,
  mapPackTruthToPathB,
  packTruthToScreeningContribution,
  parseSyntheticE2eN5AdapterSlice,
} from "../src/evidence/syntheticE2eN5Adapter";

const root = resolve(import.meta.dir, "..");

describe("synthetic e2e → N5 Path B adapter", () => {
  test("maps pack truth onto Path B states and screening contributions", () => {
    expect(mapPackTruthToPathB("true")).toBe("satisfied");
    expect(mapPackTruthToPathB("false")).toBe("not_satisfied");
    expect(mapPackTruthToPathB("unknown")).toBe("unknown");
    expect(packTruthToScreeningContribution("true")).toBe("candidate");
    expect(packTruthToScreeningContribution("false")).toBe("excluded");
    expect(packTruthToScreeningContribution("unknown")).toBe("needs_review");
    expect(mapPackScreeningToPathBAggregate("candidate").dominantPathBState).toBe("satisfied");
    expect(mapPackScreeningToPathBAggregate("excluded").dominantPathBState).toBe("not_satisfied");
    expect(mapPackScreeningToPathBAggregate("needs_review").dominantPathBState).toBe(
      "requires_investigator_review",
    );
  });

  test("adapts 1 patient × 1 protocol × criteria with forced honesty", () => {
    const slice = parseSyntheticE2eN5AdapterSlice(
      adaptVendoredSyntheticE2eDefaultSlice({
        repoRoot: root,
        sampleRelativePath: "outputs/sample_response.json",
        generatedAt: "2026-11-08T05:30:00.000Z",
      }),
    );
    expect(slice.dataClass).toBe("synthetic");
    expect(slice.containsPhi).toBe(false);
    expect(slice.patientEligible).toBe(false);
    expect(slice.confirmedEligible).toBe(false);
    expect(slice.patientId).toBe("SYNTHETIC/PATIENT/0000");
    expect(slice.protocolVersionId).toBe("SYNTHETIC/TRIAL/RA/v2");
    expect(slice.trialId).toBe("SYNTHETIC/TRIAL/RA");
    expect(slice.packScreeningStatus).toBe("candidate");
    expect(slice.inspections.length).toBe(5);
    expect(slice.inspections.every((i) => i.state === "satisfied")).toBe(true);
    expect(slice.inspections.every((i) => i.confirmedEligible === false)).toBe(true);
    expect(slice.honestyBanners.some((b) => b.includes("Wholly synthetic"))).toBe(true);
    expect(slice.honestyBanners.some((b) => b.includes("not confirmed eligibility"))).toBe(true);
    expect(slice.scientificAcceptance).toBe("BLOCKED");
    expect(slice.httpServer).toBe(false);
    expect(slice.neonClinicalWrites).toBe(false);
    expect(slice.gateCAutoApprove).toBe(false);
  });

  test("maps excluded and needs_review samples without claiming eligibility", () => {
    const excluded = parseSyntheticE2eN5AdapterSlice(
      adaptVendoredSyntheticE2eDefaultSlice({
        repoRoot: root,
        sampleRelativePath: "outputs/sample_response_excluded.json",
        generatedAt: "2026-11-08T05:30:00.000Z",
      }),
    );
    expect(excluded.packScreeningStatus).toBe("excluded");
    expect(excluded.notSatisfiedCount).toBeGreaterThan(0);
    expect(excluded.inspections.some((i) => i.state === "not_satisfied")).toBe(true);
    expect(excluded.patientEligible).toBe(false);
    expect(excluded.confirmedEligible).toBe(false);

    const review = parseSyntheticE2eN5AdapterSlice(
      adaptVendoredSyntheticE2eDefaultSlice({
        repoRoot: root,
        sampleRelativePath: "outputs/sample_response_needs_review.json",
        generatedAt: "2026-11-08T05:30:00.000Z",
      }),
    );
    expect(review.packScreeningStatus).toBe("needs_review");
    expect(review.unknownCount).toBeGreaterThan(0);
    expect(review.inspections.some((i) => i.state === "unknown" && i.packTruth === "unknown")).toBe(
      true,
    );
    expect(review.pathBAggregate.dominantPathBState).toBe("requires_investigator_review");
    expect(review.patientEligible).toBe(false);
    expect(review.confirmedEligible).toBe(false);
  });

  test("check script clears engineering harness and blocks scientific acceptance", () => {
    const result = runSyntheticE2eN5AdapterCheck();
    expect(result.ok).toBe(true);
    expect(result.slices).toBe(3);
    expect(result.packStatuses).toEqual(["candidate", "excluded", "needs_review"]);
    expect(result.engineeringHarness).toBe("CLEARED");
    expect(result.scientificAcceptance).toBe("BLOCKED");
  });
});
