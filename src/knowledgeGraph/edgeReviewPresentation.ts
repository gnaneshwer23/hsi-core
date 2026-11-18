/**
 * Presentation lanes for graph edges (Track C4 / WB-04 soft-land).
 * Distinguishes candidate vs reviewed styling without inventing reviews or
 * promoting edges. The published domain graph still only admits unreviewed
 * candidates; the reviewed lane is reserved for dual-review releases.
 */
import type {DomainEdge} from "./domainGraph";

export type EdgeReviewLane = "candidate_unreviewed" | "reviewed" | "evidence_gap";

export type EdgeReviewPresentation = {
  lane: EdgeReviewLane;
  /** Short list/inspector badge. */
  badge: string;
  /** Graph stroke colour when the lane is drawn as a solid candidate/reviewed line. */
  stroke: string;
  /** True only for the reserved reviewed lane (never set from today's published graph). */
  claimsReview: false | true;
};

const STROKE = {
  candidate: "#6f958c",
  reviewed: "#23775f",
  gap: "#8eb0a8",
  negated: "#f3ad9c",
  active: "#b7e4d8",
} as const;

export const EDGE_REVIEW_STROKES = STROKE;

/** Map a domain edge to a presentation lane. Never invents a review. */
export function edgeReviewLane(
  edge: Pick<DomainEdge, "kind" | "reviewStatus" | "scientificClaimAllowed">,
): EdgeReviewLane {
  if (edge.kind === "research_gap") return "evidence_gap";
  // Soft-land: published snapshot only carries unreviewed / non-claimable edges.
  // Unexpected flags stay candidate so the UI never paints a false "reviewed".
  if (edge.reviewStatus !== "unreviewed" || edge.scientificClaimAllowed !== false) {
    return "candidate_unreviewed";
  }
  return "candidate_unreviewed";
}

export function presentEdgeReview(
  edge: Pick<DomainEdge, "kind" | "reviewStatus" | "scientificClaimAllowed">,
): EdgeReviewPresentation {
  const lane = edgeReviewLane(edge);
  switch (lane) {
    case "evidence_gap":
      return {lane, badge: "evidence gap · not a finding", stroke: STROKE.gap, claimsReview: false};
    case "candidate_unreviewed":
      return {lane, badge: "candidate · unreviewed", stroke: STROKE.candidate, claimsReview: false};
    case "reviewed":
      return {lane, badge: "reviewed", stroke: STROKE.reviewed, claimsReview: true};
    default: {
      const _exhaustive: never = lane;
      return _exhaustive;
    }
  }
}

export type EdgeReviewLaneCounts = {
  candidateUnreviewed: number;
  reviewed: number;
  evidenceGap: number;
  total: number;
};

export function countEdgeReviewLanes(
  edges: readonly Pick<DomainEdge, "kind" | "reviewStatus" | "scientificClaimAllowed">[],
): EdgeReviewLaneCounts {
  let candidateUnreviewed = 0;
  let reviewed = 0;
  let evidenceGap = 0;
  for (const e of edges) {
    const lane = edgeReviewLane(e);
    if (lane === "candidate_unreviewed") candidateUnreviewed += 1;
    else if (lane === "reviewed") reviewed += 1;
    else evidenceGap += 1;
  }
  return {
    candidateUnreviewed,
    reviewed,
    evidenceGap,
    total: edges.length,
  };
}

/** Honesty copy for the current snapshot — never claims promotion. */
export function reviewLaneHonestyNote(counts: EdgeReviewLaneCounts): string {
  return (
    `Reviewed relationships: ${counts.reviewed} in this snapshot. ` +
    `${counts.candidateUnreviewed} source candidates remain unreviewed. ` +
    `Reviewed styling is reserved until dual human review lands; nothing here is promoted or scientifically approved.`
  );
}

/** Stroke helpers for GraphVisual — keep dash rules for gaps/negated separate. */
export function solidLaneStroke(lane: EdgeReviewLane, active: boolean): string {
  if (active) return STROKE.active;
  switch (lane) {
    case "reviewed":
      return STROKE.reviewed;
    case "candidate_unreviewed":
      return STROKE.candidate;
    case "evidence_gap":
      return STROKE.gap;
    default: {
      const _exhaustive: never = lane;
      return _exhaustive;
    }
  }
}
