/** HSI-only Gate C persistence. Call from a trusted, authenticated server, not a public CLI. */
import { SQL } from "bun";
import { assertHsiNeonDatabaseUrl } from "./neonGuard";
import { validateScientificReview, type ReviewRequest, type VerifiedReviewer } from "../scientificReview";

export async function recordScientificReview(input: {
  verifiedReviewer: VerifiedReviewer | null;
  request: ReviewRequest;
  databaseUrl: string;
  neonProjectId?: string | null;
}): Promise<{ reviewId: string; recorded: true; published: false }> {
  // Reject malformed and self-declared review data before touching the DB.
  const record = validateScientificReview(input.verifiedReviewer, input.request);
  const check = assertHsiNeonDatabaseUrl(input.databaseUrl, { neonProjectId: input.neonProjectId });
  if (!check.ok) throw new Error(`HSI database guard: ${check.reason}`);
  const sql = new SQL(input.databaseUrl, { tls: { rejectUnauthorized: true }, connectionTimeout: 10 });
  try {
    await sql.begin(async tx => {
      const claims = await tx`SELECT id, status FROM hsi_evidence_claim_drafts
        WHERE id = ${record.claimId} FOR UPDATE`;
      if (claims.length !== 1 || !["qc_passed", "under_review"].includes(String(claims[0]?.status))) {
        throw new Error("Claim must be quality-checked and available for review");
      }
      const sources = await tx`SELECT DISTINCT cs.source_id, s.pmid
        FROM hsi_evidence_claim_support cs
        JOIN hsi_evidence_sources s ON s.id = cs.source_id
        WHERE cs.claim_id = ${record.claimId}`;
      // Review input uses pmid:<number>; source primary keys may use an ingestion namespace.
      // Resolve against the canonical PMID, never assume a source's internal ID is a PMID.
      const linkedPmids = new Set(sources
        .filter((row: {pmid: unknown}) => row.pmid != null)
        .map((row: {pmid: unknown}) => "pmid:" + String(row.pmid)));
      if (record.evidenceReviewed.some(id => !linkedPmids.has(id))) {
        throw new Error("Reviewed PMIDs must resolve to sources linked to the claim");
      }
      if (record.decision === "approve") {
        const eligible = await tx`SELECT s.id FROM hsi_evidence_sources s
          JOIN hsi_evidence_claim_support cs ON cs.source_id = s.id
          WHERE cs.claim_id = ${record.claimId}
            AND cs.polarity = 'supports'
            AND s.licence_status NOT IN ('unverified', 'prohibited')
            AND s.retraction_status <> 'retracted'
          LIMIT 1`;
        if (eligible.length === 0) throw new Error("Approval requires non-retracted, rights-classified supporting evidence");
      }
      const evidenceJson = JSON.stringify(record.evidenceReviewed);
      await tx`INSERT INTO hsi_evidence_review_decisions
        (id, claim_id, decision, reviewer_principal, reviewer_role, rationale,
         reviewed_at, evidence_reviewed, conflict_of_interest_declared)
        VALUES (${record.id}, ${record.claimId}, ${record.decision},
          ${record.reviewerPrincipal}, ${record.reviewerRole}, ${record.rationale},
          ${record.reviewedAt}, ${evidenceJson}::jsonb, ${record.conflictOfInterestDeclared})`;
      // Keep claim under review: no auto-promotion to approved graph or release.
      await tx`UPDATE hsi_evidence_claim_drafts SET status = 'under_review', updated_at = now()
        WHERE id = ${record.claimId}`;
    });
    return { reviewId: record.id, recorded: true, published: false };
  } finally {
    await sql.close();
  }
}
