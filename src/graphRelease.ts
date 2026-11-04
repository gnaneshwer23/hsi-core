/** ARCH-002 Step 4: fail-closed release assessment and provenance-rich retrieval.
 * No public API, no autonomous publication, no PHI. */
import { createHash } from "node:crypto";

export type SourceEvidence = {
  id: string;
  licenceStatus: "unverified" | "metadata_only" | "passage_permitted" | "restricted" | "prohibited";
  retractionStatus: "unknown" | "none_reported" | "corrected" | "retracted";
  polarity: "supports" | "contradicts" | "contextualises";
  sourceVersion: string;
};
export type ReviewDecisionSnapshot = {
  id: string; claimId: string; decision: "approve" | "reject" | "defer" | "revoke";
  reviewerPrincipal: string; reviewerAuthorised: boolean; reviewedAt: string;
};
export type ReleaseClaim = {
  id: string; subjectId: string; predicate: string; objectId: string;
  assertion: string; epistemicType: string; biologicalContext: Record<string, unknown>;
  status: "draft" | "qc_passed" | "under_review" | "approved" | "rejected" | "superseded" | "retracted";
  sources: readonly SourceEvidence[]; reviews: readonly ReviewDecisionSnapshot[];
};
export type ReleaseManifest = {
  schemaVersion: "hsi-graph-release-1"; releaseId: string; releaseVersion: string;
  generatedAt: string; claimIds: string[]; manifestHash: string; status: "candidate";
};
export type ReleaseAssessment = { eligible: boolean; reasons: string[]; claimId: string };

export function assessReleaseClaim(claim: ReleaseClaim): ReleaseAssessment {
  const reasons: string[] = [];
  if (claim.status !== "approved") reasons.push("claim_not_approved");
  if (!claim.subjectId || !claim.predicate || !claim.objectId || !claim.assertion.trim()) reasons.push("invalid_graph_assertion");
  if (!claim.sources.length) reasons.push("missing_source_evidence");
  if (claim.sources.some(s => !s.id || !s.sourceVersion)) reasons.push("missing_source_version");
  if (claim.sources.some(s => s.retractionStatus !== "none_reported")) reasons.push("source_retraction_or_correction_unresolved");
  if (claim.sources.some(s => ["unverified","prohibited"].includes(s.licenceStatus))) reasons.push("source_rights_unresolved");
  if (!claim.sources.some(s => s.polarity === "supports" && ["metadata_only","passage_permitted","restricted"].includes(s.licenceStatus))) reasons.push("no_rights_classified_support");
  if (!["established_evidence","association","observational_association"].includes(claim.epistemicType)) reasons.push("unrecognised_or_unvalidated_epistemic_type");
  const latest = [...claim.reviews].sort((a,b) => b.reviewedAt.localeCompare(a.reviewedAt) || b.id.localeCompare(a.id))[0];
  if (!latest || latest.claimId !== claim.id || latest.decision !== "approve" || !latest.reviewerAuthorised || !latest.reviewerPrincipal) reasons.push("missing_current_authorised_approval");
  if (claim.sources.some(s => s.polarity === "contradicts")) reasons.push("contradiction_requires_adjudication");
  return {eligible: reasons.length === 0, reasons, claimId: claim.id};
}

/** Canonical hash shared by candidate creation and authoritative DB release verification. */
export function computeReleaseManifestHash(input:{schemaVersion:"hsi-graph-release-1";releaseId:string;releaseVersion:string;generatedAt:string;claimIds:readonly string[]}):string{
 const {schemaVersion,releaseId,releaseVersion,generatedAt,claimIds}=input;
 return createHash("sha256").update(JSON.stringify({schemaVersion,releaseId,releaseVersion,claimIds:[...claimIds].sort(),generatedAt})).digest("hex");
}

export function createCandidateManifest(
  releaseId: string, releaseVersion: string, claims: readonly ReleaseClaim[], generatedAt: string,
): ReleaseManifest {
  if (!/^HSI-GR-[A-Za-z0-9._-]{1,80}$/.test(releaseId) || !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(releaseVersion)) throw Error("Invalid release identity");
  if (!claims.length || claims.length > 10000) throw Error("Invalid release size");
  const ids = claims.map(c => c.id);
  if (new Set(ids).size !== ids.length) throw Error("Duplicate claims");
  const failures = claims.map(assessReleaseClaim).filter(x => !x.eligible);
  if (failures.length) throw Error(`Release blocked: ${JSON.stringify(failures)}`);
  const claimIds = [...ids].sort();
  const manifestHash = computeReleaseManifestHash({schemaVersion:"hsi-graph-release-1",releaseId,releaseVersion,claimIds,generatedAt});
  return {schemaVersion:"hsi-graph-release-1",releaseId,releaseVersion,generatedAt,claimIds,manifestHash,status:"candidate"};
}

export type PublishedReleaseSnapshot = {
  manifest: Omit<ReleaseManifest,"status"> & {status:"published"};
  claims: readonly ReleaseClaim[];
};
export type GraphQuery = { subjectId?: string; predicate?: string; objectId?: string; limit?: number };
export function queryPublishedGraph(snapshot: PublishedReleaseSnapshot, query: GraphQuery) {
  if (snapshot.manifest.status !== "published") throw Error("Unpublished graph release");
  const limit = query.limit ?? 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error("Invalid query limit");
  const allowed = new Set(snapshot.manifest.claimIds);
  if (allowed.size !== snapshot.manifest.claimIds.length) throw Error("Invalid release manifest");
  return {
    releaseId: snapshot.manifest.releaseId,
    releaseVersion: snapshot.manifest.releaseVersion,
    manifestHash: snapshot.manifest.manifestHash,
    results: snapshot.claims
      .filter(c => allowed.has(c.id) && assessReleaseClaim(c).eligible)
      .filter(c => (!query.subjectId || c.subjectId === query.subjectId) &&
        (!query.predicate || c.predicate === query.predicate) &&
        (!query.objectId || c.objectId === query.objectId))
      .slice(0,limit)
      .map(c => ({
        claimId:c.id, subjectId:c.subjectId, predicate:c.predicate, objectId:c.objectId,
        assertion:c.assertion, epistemicType:c.epistemicType, biologicalContext:c.biologicalContext,
        sources:c.sources, reviewDecisionId:[...c.reviews].sort((a,b)=>b.reviewedAt.localeCompare(a.reviewedAt) || b.id.localeCompare(a.id))[0]?.id,
      })),
  };
}
