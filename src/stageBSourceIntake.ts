/**
 * Stage B: track-scoped source intake and investigation requests.
 * No source is imported, licensed, or scientifically reviewed by this module.
 */
import { STAGE_B_TRACKS, type StageBTrackId } from "./stageBResearchTracks";

export type StageBSourceCandidate = {
  trackId: StageBTrackId;
  sourceId: string;
  title: string;
  doi: string | null;
  pmid: string | null;
  licenceStatus: "unknown" | "restricted" | "permitted";
  passageUsePermitted: boolean;
  retrievalReceipt: { uri: string; sha256: string; retrievedAt: string } | null;
  scientificReview: "unreviewed";
};
export type StageBInvestigationScope = {
  trackId: StageBTrackId;
  evidenceNamespace: string;
  datasetVersion: string;
  sourceIds: string[];
  purpose: "research_only";
  containsPhi: false;
};

const validId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
const sha256 = /^[a-f0-9]{64}$/i;

export function screenStageBSource(trackId: StageBTrackId, candidate: StageBSourceCandidate) {
  const reasons: string[] = [];
  if (candidate.trackId !== trackId) reasons.push("cross_track_source");
  if (!validId(candidate.sourceId) || !candidate.title.trim()) reasons.push("invalid_source_identity");
  if (!candidate.doi?.trim() && !candidate.pmid?.trim()) reasons.push("publication_identifier_missing");
  if (candidate.licenceStatus !== "permitted" || !candidate.passageUsePermitted) reasons.push("source_rights_unverified");
  if (!candidate.retrievalReceipt ||
    !/^https:\/\//.test(candidate.retrievalReceipt.uri) ||
    !sha256.test(candidate.retrievalReceipt.sha256) ||
    !Number.isFinite(Date.parse(candidate.retrievalReceipt.retrievedAt))) reasons.push("retrieval_receipt_missing");
  return {
    trackId, evidenceNamespace: STAGE_B_TRACKS[trackId].evidenceNamespace,
    canImportPassages: reasons.length === 0,
    scientificClaimApproved: false as const, reasons,
  };
}

/** Fail closed before a track-scoped investigation is sent to the existing authorised service. */
export function validateStageBInvestigationScope(
  trackId: StageBTrackId,
  scope: StageBInvestigationScope,
  sources: readonly StageBSourceCandidate[],
): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (scope.trackId !== trackId || scope.evidenceNamespace !== STAGE_B_TRACKS[trackId].evidenceNamespace)
    reasons.push("cross_track_scope");
  if (!validId(scope.datasetVersion)) reasons.push("invalid_dataset_version");
  if (scope.purpose !== "research_only" || scope.containsPhi !== false) reasons.push("unsafe_research_purpose");
  if (!scope.sourceIds.length || new Set(scope.sourceIds).size !== scope.sourceIds.length)
    reasons.push("invalid_source_selection");
  for (const id of scope.sourceIds) {
    const matching = sources.filter(source => source.sourceId === id && source.trackId === trackId);
    if (matching.length !== 1 || !screenStageBSource(trackId, matching[0]).canImportPassages)
      reasons.push("source_not_rights_verified:" + id);
  }
  return { allowed: reasons.length === 0, reasons };
}

/** No default SSc papers or invented rights receipts. Operators must curate real sources. */
export const SSc_SOURCE_INTAKE: readonly StageBSourceCandidate[] = [];
