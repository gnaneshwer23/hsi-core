/**
 * Stage B research-track policy. Track metadata is not evidence or scientific approval.
 * RA remains an independent working benchmark; SSc is an independent curation track.
 */
export const STAGE_B_TRACKS = {
  ssc: {
    id: "ssc",
    label: "Systemic sclerosis",
    question: "What evidence supports CD4/Tfh–B-cell–IL-21 mechanisms in systemic sclerosis?",
    evidenceNamespace: "ssc-mechanisms",
    reviewNamespace: "ssc-scientific-review",
    status: "curation_pending",
    focus: ["CD4 T cells", "Tfh", "B cells", "IL-21"],
    uncertaintyBranches: ["EBV association — hypothesis only"],
  },
  ra: {
    id: "ra",
    label: "Rheumatoid arthritis / anti-TNF",
    question: "How should RF/anti-CCP serostatus evidence be interpreted in anti-TNF response research?",
    evidenceNamespace: "ra-anti-tnf",
    reviewNamespace: "ra-scientific-review",
    status: "research_working_set",
    focus: ["RF", "anti-CCP", "anti-TNF response"],
    uncertaintyBranches: ["Study heterogeneity and unreviewed claim support"],
  },
} as const;

export type StageBTrackId = keyof typeof STAGE_B_TRACKS;
export type StageBReviewDecision = "approved" | "rejected" | "needs_changes";
export type StageBReview = {
  trackId: StageBTrackId;
  evidenceNamespace: string;
  reviewerId: string;
  decision: StageBReviewDecision;
  evidenceVersion: string;
  reviewedAt: string;
};

/** Evidence provenance and human review are both mandatory; never infer one from the other. */
export function evaluateStageBReviewGate(
  trackId: StageBTrackId,
  input: {
    sourceRightsVerified: boolean;
    evidenceVersion: string | null;
    review: StageBReview | null;
  },
): { canPublishReviewedFinding: boolean; reasons: string[] } {
  const track = STAGE_B_TRACKS[trackId];
  const reasons: string[] = [];
  if (!input.sourceRightsVerified) reasons.push("source_rights_unverified");
  if (!input.evidenceVersion?.trim()) reasons.push("evidence_version_missing");
  const review = input.review;
  if (!review) reasons.push("human_review_missing");
  else {
    if (review.trackId !== trackId || review.evidenceNamespace !== track.evidenceNamespace)
      reasons.push("cross_track_review_rejected");
    if (review.decision !== "approved") reasons.push("review_not_approved");
    if (!review.reviewerId.trim() || !review.reviewedAt.trim()) reasons.push("review_provenance_missing");
    if (!input.evidenceVersion || review.evidenceVersion !== input.evidenceVersion)
      reasons.push("review_evidence_version_mismatch");
  }
  return { canPublishReviewedFinding: reasons.length === 0, reasons };
}
