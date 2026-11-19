import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e09Mode,
  assessE2e09PublicHonesty,
  assertE2e09PremiumPublicPagesSoftLand,
  e2e09PremiumPublicPagesPacket,
  e2e09SurfaceById,
  type E2e09SuiteMode,
  type E2e09SurfaceId,
} from "../src/operations/e2e09PremiumPublicPagesSoftLand";

describe("PR-E2E-09 premium public pages soft-land", () => {
  test("documents seven surfaces without fake metrics or clinical claims", () => {
    const packet = e2e09PremiumPublicPagesPacket();
    const summary = assertE2e09PremiumPublicPagesSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.fakeMetricsClaimed).toBe(false);
    expect(summary.clinicalValidationClaimed).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-09");
    expect(packet.priority).toBe("P2");
    expect(packet.implementationPr).toBe("#474");
    expect(packet.brandDoctrinePr).toBe("#465");
    expect(packet.honesty.noFakeMetrics).toBe(true);
    expect(packet.goldStandardCountsClaimed).toBe(false);
  });

  test("each surface keeps metric and approval claims false", () => {
    const surfaces: E2e09SurfaceId[] = [
      "eight_page_ia_catalog",
      "researchers_audience_route",
      "biotech_audience_route",
      "validation_methodology_route",
      "premium_public_styling",
      "seo_honesty_copy",
      "no_fake_metrics_gate",
    ];
    for (const surface of surfaces) {
      const row = e2e09SurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.fakeMetricsClaimed).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.clinicalValidationClaimed).toBe(false);
      expect(row.pilotPerformanceClaimed).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows metrics, clinical validation, or brand acceptance", () => {
    const modes: E2e09SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e09Mode(mode);
      expect(assessment.mayClaimFakeMetrics).toBe(false);
      expect(assessment.mayClaimClinicalValidation).toBe(false);
      expect(assessment.mayClaimPilotPerformance).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayClaimBrandDoctrineAccepted).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.fakeMetricsClaimed).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("public honesty stays fail-closed", () => {
    const honesty = assessE2e09PublicHonesty();
    expect(honesty.mustKeepNoFakeMetrics).toBe(true);
    expect(honesty.mustSeparateMethodologyFromSyntheticLab).toBe(true);
    expect(honesty.mustNotClaimGoldCounts).toBe(true);
    expect(honesty.mustNotClaimLiveCds).toBe(true);
    expect(honesty.mustKeepCandidateOnlyLanguage).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/e2e-09-premium-public-pages.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      fakeMetricsClaimed: boolean;
      clinicalValidationClaimed: boolean;
      references: {
        implementation_pr_ref: string;
        brand_acceptance_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.fakeMetricsClaimed).toBe(false);
    expect(pending.clinicalValidationClaimed).toBe(false);
    expect(pending.references.implementation_pr_ref).toBe("#474");
    expect(pending.references.brand_acceptance_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_09_PREMIUM_PUBLIC_PAGES_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-09");
    expect(doc).toContain("fake metrics");
    expect(doc).toContain("/validation");
  });
});
