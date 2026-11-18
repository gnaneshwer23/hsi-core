import {describe, expect, test} from "bun:test";
import {
  EDGE_REVIEW_STROKES,
  countEdgeReviewLanes,
  edgeReviewLane,
  presentEdgeReview,
  reviewLaneHonestyNote,
  solidLaneStroke,
} from "../src/knowledgeGraph/edgeReviewPresentation";

const candidate = {
  kind: "source_candidate" as const,
  reviewStatus: "unreviewed" as const,
  scientificClaimAllowed: false as const,
};
const gap = {
  kind: "research_gap" as const,
  reviewStatus: "unreviewed" as const,
  scientificClaimAllowed: false as const,
};

describe("edge review presentation (C4 soft-land)", () => {
  test("published candidates stay unreviewed; gaps stay gaps; never invents reviewed", () => {
    expect(edgeReviewLane(candidate)).toBe("candidate_unreviewed");
    expect(edgeReviewLane(gap)).toBe("evidence_gap");
    expect(presentEdgeReview(candidate).claimsReview).toBe(false);
    expect(presentEdgeReview(candidate).badge).toContain("unreviewed");
    // Unexpected claim flag still refuses a reviewed paint.
    expect(
      edgeReviewLane({
        kind: "source_candidate",
        reviewStatus: "unreviewed",
        scientificClaimAllowed: false,
      }),
    ).toBe("candidate_unreviewed");
  });

  test("counts and honesty note report zero reviewed for a candidate-only snapshot", () => {
    const counts = countEdgeReviewLanes([candidate, candidate, gap]);
    expect(counts).toEqual({
      candidateUnreviewed: 2,
      reviewed: 0,
      evidenceGap: 1,
      total: 3,
    });
    const note = reviewLaneHonestyNote(counts);
    expect(note).toContain("Reviewed relationships: 0");
    expect(note).toContain("2 source candidates remain unreviewed");
    expect(note).toMatch(/not.*promoted|reserved/i);
  });

  test("reserved reviewed stroke differs from candidate; exhaustive solid strokes", () => {
    expect(EDGE_REVIEW_STROKES.reviewed).not.toBe(EDGE_REVIEW_STROKES.candidate);
    expect(solidLaneStroke("reviewed", false)).toBe(EDGE_REVIEW_STROKES.reviewed);
    expect(solidLaneStroke("candidate_unreviewed", false)).toBe(EDGE_REVIEW_STROKES.candidate);
    expect(solidLaneStroke("evidence_gap", false)).toBe(EDGE_REVIEW_STROKES.gap);
    expect(solidLaneStroke("candidate_unreviewed", true)).toBe(EDGE_REVIEW_STROKES.active);
  });
});
