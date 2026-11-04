/** ARCH-002 Gate C: service-layer scientific review. No endpoint, no self-attested identity. */
export type ReviewDecision = "approve" | "reject" | "defer";
export type VerifiedReviewer = {
  /** Must be issued by trusted server-side authentication, never request JSON. */
  principalId: string;
  roles: readonly string[];
  authenticated: true;
};
export type ReviewRequest = {
  claimId: string;
  decision: ReviewDecision;
  rationale: string;
  evidenceReviewed: readonly string[];
  conflictOfInterestDeclared: boolean;
};
export type ReviewRecord = {
  id: string;
  claimId: string;
  decision: ReviewDecision;
  reviewerPrincipal: string;
  reviewerRole: "scientific_reviewer";
  rationale: string;
  evidenceReviewed: readonly string[];
  conflictOfInterestDeclared: boolean;
  reviewedAt: string;
};
export function validateScientificReview(
  principal: VerifiedReviewer | null,
  request: ReviewRequest,
  now = new Date(),
): ReviewRecord {
  if (!principal?.authenticated || !principal.principalId.trim() ||
      !principal.roles.includes("scientific_reviewer")) {
    throw new Error("Scientific reviewer authentication and role required");
  }
  if (!/^HSI-C-[A-Z0-9-]{3,100}$/.test(request.claimId)) throw new Error("Invalid claim identifier");
  if (!["approve","reject","defer"].includes(request.decision)) throw new Error("Invalid decision");
  if (typeof request.rationale !== "string" || request.rationale.trim().length < 30 ||
      request.rationale.length > 8000) throw new Error("Substantive rationale required");
  if (!Array.isArray(request.evidenceReviewed) ||
      request.evidenceReviewed.length < 1 ||
      request.evidenceReviewed.length > 100 ||
      request.evidenceReviewed.some(x => typeof x !== "string" || !/^pmid:\d{1,9}$/.test(x))) {
    throw new Error("Evidence source identifiers required");
  }
  if (request.conflictOfInterestDeclared !== true) throw new Error("Conflict-of-interest declaration required");
  return {
    id: crypto.randomUUID(),
    claimId: request.claimId,
    decision: request.decision,
    reviewerPrincipal: principal.principalId,
    reviewerRole: "scientific_reviewer",
    rationale: request.rationale.trim(),
    evidenceReviewed: [...new Set(request.evidenceReviewed)],
    conflictOfInterestDeclared: true,
    reviewedAt: now.toISOString(),
  };
}
