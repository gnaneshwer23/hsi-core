import { describe, expect, it } from "bun:test";
import { screenStageBSource, validateStageBInvestigationScope, SSc_SOURCE_INTAKE, type StageBSourceCandidate } from "../src/stageBSourceIntake";

const source: StageBSourceCandidate = {
  trackId: "ssc", sourceId: "SSC-SRC-001", title: "Fixture for contract tests only",
  doi: "10.0000/fixture", pmid: null, licenceStatus: "permitted",
  passageUsePermitted: true, retrievalReceipt: {
    uri: "https://example.org/test-fixture", sha256: "a".repeat(64),
    retrievedAt: "2026-11-03T12:00:00Z",
  }, scientificReview: "unreviewed",
};
const scope = {
  trackId: "ssc" as const, evidenceNamespace: "ssc-mechanisms",
  datasetVersion: "v1", sourceIds: ["SSC-SRC-001"], purpose: "research_only" as const,
  containsPhi: false as const,
};

describe("Stage B source intake and track-scoped investigation", () => {
  it("does not invent any SSc publications or approvals", () => {
    expect(SSc_SOURCE_INTAKE).toEqual([]);
    expect(screenStageBSource("ssc", source).scientificClaimApproved).toBe(false);
  });
  it("blocks missing rights and retrieval receipts", () => {
    const result = screenStageBSource("ssc", { ...source, licenceStatus: "unknown", retrievalReceipt: null });
    expect(result.canImportPassages).toBe(false);
    expect(result.reasons).toContain("source_rights_unverified");
    expect(result.reasons).toContain("retrieval_receipt_missing");
  });
  it("rejects cross-track sources and cross-track scopes", () => {
    expect(screenStageBSource("ra", source).reasons).toContain("cross_track_source");
    expect(validateStageBInvestigationScope("ra", scope, [source]).allowed).toBe(false);
  });
  it("rejects empty, duplicate or unverified source selections", () => {
    expect(validateStageBInvestigationScope("ssc", { ...scope, sourceIds: [] }, [source]).allowed).toBe(false);
    expect(validateStageBInvestigationScope("ssc", { ...scope, sourceIds: [source.sourceId, source.sourceId] }, [source]).allowed).toBe(false);
    expect(validateStageBInvestigationScope("ssc", scope, [{ ...source, passageUsePermitted: false }]).allowed).toBe(false);
  });
  it("accepts only a scoped rights-screened fixture, without scientific approval", () => {
    expect(validateStageBInvestigationScope("ssc", scope, [source])).toEqual({ allowed: true, reasons: [] });
  });
});
