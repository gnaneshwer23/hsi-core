import {describe, expect, test} from "bun:test";
import {resolve} from "node:path";
import {runSyntheticE2eHonestyCheck} from "../scripts/check-synthetic-e2e-honesty";
import {
  evaluateOracleCaseExpectation,
  loadVendoredHonestyFixtures,
  parseHonestyRegressionReceipt,
  refuseDishonestDemoOutputFlips,
  refuseQuarantineIngest,
  runHonestyRegressionPack,
  SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE,
} from "../src/evidence/syntheticE2eHonestyRegression";

const root = resolve(import.meta.dir, "..");

describe("synthetic e2e honesty regression pack", () => {
  test("quarantine expectations refuse Neon/clinical ingest", () => {
    const {quarantine} = loadVendoredHonestyFixtures(root);
    expect(quarantine.length).toBe(8);
    for (const row of quarantine) {
      expect(row.split).toBe("quarantine");
      expect(row.notice).toContain("Never ingest");
      const refusal = refuseQuarantineIngest({row, target: "neon_clinical"});
      expect(refusal.allowed).toBe(false);
      expect(refusal.neonClinicalWrites).toBe(false);
      expect(refusal.gateCAutoApprove).toBe(false);
      expect(refusal.legalBinding).toBe(false);
    }
  });

  test("oracle cases keep software expectations without clinical eligibility", () => {
    const {oracle} = loadVendoredHonestyFixtures(root);
    expect(oracle.cases.length).toBeGreaterThanOrEqual(10);
    const positive = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/positive");
    expect(positive.expected_status).toBe("candidate");
    expect(positive.clinicalEligible).toBe(false);
    expect(positive.confirmedEligible).toBe(false);
    const excluded = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/low-renal");
    expect(excluded.expected_status).toBe("excluded");
    expect(excluded.expected_reason).toBe("outside_bounds");
    const review = evaluateOracleCaseExpectation(oracle, "SYNTHETIC/CASE/missing-crp");
    expect(review.expected_status).toBe("needs_review");
  });

  test("refuses Gate C auto-approve and legalBinding flips from demo outputs", () => {
    const bad = refuseDishonestDemoOutputFlips({
      gateCAutoApprove: true,
      legalBinding: true,
      groundedClaimAccepted: true,
      scientificAcceptance: "CLEARED",
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.refusals.some((r) => r.includes("Gate C"))).toBe(true);
      expect(bad.refusals.some((r) => r.includes("legalBinding"))).toBe(true);
    }
    const good = refuseDishonestDemoOutputFlips({
      gateCAutoApprove: false,
      legalBinding: false,
      groundedClaimAccepted: false,
      dataClass: "synthetic",
      scientificAcceptance: "BLOCKED",
    });
    expect(good.ok).toBe(true);
  });

  test("regression receipt keeps synthetic≠clinical≠eligible banner", () => {
    const receipt = parseHonestyRegressionReceipt(
      runHonestyRegressionPack({repoRoot: root, generatedAt: "2026-11-08T05:40:00.000Z"}),
    );
    expect(receipt.banner).toBe(SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE);
    expect(receipt.honesty).toContain(SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE);
    expect(receipt.gateCAutoApprove).toBe(false);
    expect(receipt.legalBinding).toBe(false);
    expect(receipt.neonClinicalWrites).toBe(false);
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.engineeringHarness).toBe("CLEARED");
  });

  test("check script clears engineering harness", () => {
    const result = runSyntheticE2eHonestyCheck();
    expect(result.ok).toBe(true);
    expect(result.quarantineRows).toBe(8);
    expect(result.oracleCases).toBeGreaterThanOrEqual(10);
    expect(result.banner).toBe(SYNTHETIC_NE_CLINICAL_NE_ELIGIBLE);
    expect(result.engineeringHarness).toBe("CLEARED");
    expect(result.scientificAcceptance).toBe("BLOCKED");
  });
});
