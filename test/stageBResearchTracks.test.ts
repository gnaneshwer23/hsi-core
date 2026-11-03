import { describe, expect, it } from "bun:test";
import { evaluateStageBReviewGate, STAGE_B_TRACKS, type StageBReview } from "../src/stageBResearchTracks";

const approval: StageBReview = {
  trackId: "ra", evidenceNamespace: "ra-anti-tnf", reviewerId: "scientist-1",
  decision: "approved", evidenceVersion: "v1", reviewedAt: "2026-11-03T12:00:00Z",
};

describe("Stage B parallel research track isolation", () => {
  it("keeps SSc and RA evidence and review namespaces distinct", () => {
    expect(STAGE_B_TRACKS.ssc.evidenceNamespace).not.toBe(STAGE_B_TRACKS.ra.evidenceNamespace);
    expect(STAGE_B_TRACKS.ssc.reviewNamespace).not.toBe(STAGE_B_TRACKS.ra.reviewNamespace);
    expect(STAGE_B_TRACKS.ssc.status).toBe("curation_pending");
    expect(STAGE_B_TRACKS.ra.status).toBe("research_working_set");
  });
  it("fails closed without source rights, evidence version and human review", () => {
    const gate = evaluateStageBReviewGate("ssc", {
      sourceRightsVerified: false, evidenceVersion: null, review: null,
    });
    expect(gate.canPublishReviewedFinding).toBe(false);
    expect(gate.reasons).toContain("source_rights_unverified");
    expect(gate.reasons).toContain("human_review_missing");
  });
  it("never accepts RA review to approve SSc findings", () => {
    const gate = evaluateStageBReviewGate("ssc", {
      sourceRightsVerified: true, evidenceVersion: "v1", review: approval,
    });
    expect(gate.canPublishReviewedFinding).toBe(false);
    expect(gate.reasons).toContain("cross_track_review_rejected");
  });
  it("rejects stale, rejected and unattributed reviews", () => {
    for (const review of [
      { ...approval, evidenceVersion: "v0" },
      { ...approval, decision: "rejected" as const },
      { ...approval, reviewerId: "" },
    ]) {
      expect(evaluateStageBReviewGate("ra", {
        sourceRightsVerified: true, evidenceVersion: "v1", review,
      }).canPublishReviewedFinding).toBe(false);
    }
  });
  it("approves only a rights-verified, version-matched, explicitly reviewed finding", () => {
    const gate = evaluateStageBReviewGate("ra", {
      sourceRightsVerified: true, evidenceVersion: "v1", review: approval,
    });
    expect(gate.canPublishReviewedFinding).toBe(true);
    expect(gate.reasons).toEqual([]);
  });
});
