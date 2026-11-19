/**
 * Live decision-brief preview helpers: passport columns + limitations always
 * visible; briefAccepted stays false. Browser-safe.
 */

import type { LiveInvestigation } from "./liveRun";
import { exportLiveBriefV2, type LiveBriefV2 } from "./liveBriefV2";

export const LIVE_BRIEF_PREVIEW_SCHEMA = "hsi-live-brief-preview-1" as const;

export type LiveBriefPreviewHonesty = {
  briefAccepted: false;
  scientificApproval: false;
  verificationGatePassed: false;
  inventsContext: false;
  locatorIsNotProofOfSupport: true;
  softLandGreenIsNotAcceptance: true;
  limitationsAlwaysVisible: true;
  passportColumnsAlwaysVisible: true;
};

export const LIVE_BRIEF_PREVIEW_HONESTY: LiveBriefPreviewHonesty = {
  briefAccepted: false,
  scientificApproval: false,
  verificationGatePassed: false,
  inventsContext: false,
  locatorIsNotProofOfSupport: true,
  softLandGreenIsNotAcceptance: true,
  limitationsAlwaysVisible: true,
  passportColumnsAlwaysVisible: true,
};

export type LiveBriefPreview = {
  schemaVersion: typeof LIVE_BRIEF_PREVIEW_SCHEMA;
  honesty: LiveBriefPreviewHonesty;
  question: string;
  briefHash: string;
  limitations: readonly string[];
  passportRowCount: number;
  reviewedEdgeCount: 0;
  unreviewedCandidateCount: number;
  conflictNote: string;
  brief: LiveBriefV2;
};

/** Build the always-visible brief preview envelope for the live workspace. */
export function buildLiveBriefPreview(
  run: LiveInvestigation,
  passportRowCount: number,
): LiveBriefPreview {
  const brief = exportLiveBriefV2(run);
  return {
    schemaVersion: LIVE_BRIEF_PREVIEW_SCHEMA,
    honesty: LIVE_BRIEF_PREVIEW_HONESTY,
    question: run.question,
    briefHash: run.briefHash,
    limitations: brief.limitations,
    passportRowCount,
    reviewedEdgeCount: 0,
    unreviewedCandidateCount: run.candidates.length,
    conflictNote: brief.conflictNote,
    brief,
  };
}

export function assertLiveBriefPreviewHonesty(
  honesty: LiveBriefPreviewHonesty,
): LiveBriefPreviewHonesty {
  if (
    honesty.briefAccepted !== false ||
    honesty.scientificApproval !== false ||
    honesty.verificationGatePassed !== false ||
    honesty.inventsContext !== false ||
    honesty.locatorIsNotProofOfSupport !== true ||
    honesty.softLandGreenIsNotAcceptance !== true ||
    honesty.limitationsAlwaysVisible !== true ||
    honesty.passportColumnsAlwaysVisible !== true
  ) {
    throw new Error("Live brief preview must keep fail-closed honesty flags");
  }
  return honesty;
}
