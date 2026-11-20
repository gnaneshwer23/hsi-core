import { describe, expect, test } from "bun:test";
import {
  LIVE_SOURCE_RELIABILITY_HONESTY,
  assertLiveSourceReliabilityHonesty,
  formatLiveSourceReliabilityMeta,
  liveSourceReliabilityLimitations,
} from "../src/investigation/liveSourceReliabilityHonesty";

describe("liveSourceReliabilityHonesty", () => {
  test("keeps fail-closed honesty", () => {
    const honesty = assertLiveSourceReliabilityHonesty(LIVE_SOURCE_RELIABILITY_HONESTY);
    expect(honesty.sourceClearanceVerified).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(honesty.graphPromotable).toBe(false);
    expect(honesty.rights).toBe("unverified");
    expect(honesty.locatorIsNotProofOfSupport).toBe(true);
  });

  test("formats meta with explicit absent locators and clearance false", () => {
    const line = formatLiveSourceReliabilityMeta({
      sourceUrl: "https://europepmc.org/article/MED/1",
      provider: "europe-pmc",
      doi: null,
      pmid: "1",
      licenceStatus: "not_assessed",
      verificationState: "metadata_retrieved_not_claim_verified",
      reviewState: "unreviewed",
      retraction: "not_flagged_by_provider",
      retrievedAt: "2026-11-20T00:00:00Z",
    });
    expect(line).toContain("europe-pmc");
    expect(line).toContain("DOI not stated");
    expect(line).toContain("PMID 1");
    expect(line).toContain("licenceStatus: not assessed");
    expect(line).toContain("verificationState: metadata retrieved not claim verified");
    expect(line).toContain("rights: unverified");
    expect(line).toContain("sourceClearanceVerified: false");
  });

  test("limitations never claim clearance or approval", () => {
    const limits = liveSourceReliabilityLimitations();
    expect(limits.some((l) => l.includes("sourceClearanceVerified: false"))).toBe(true);
    expect(limits.join("\n")).not.toMatch(/cleared|approved|validated/i);
  });
});
