/**
 * U43 — apply U40 U12 evidence fill proposals into pending worksheets.
 *
 * Pure apply: returns next JSON documents. Never sets restrictedPreviewClaimed,
 * checklist1Verified, acceptedForScope, or productionWritesEnabled to true.
 * Never invents hosts or grants.
 */
import {
  assertHsiU12EvidenceFillApplyOwnerAuthorized,
  HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
  type HsiU12EvidenceFillApplyOwnerApproval,
} from "../hsiU12EvidenceFillApplyAuthorization";
import {
  type HsiU12EvidenceFillProposal,
} from "./hsiRestrictedPreviewEvidenceSuite";

export const HSI_U12_EVIDENCE_FILL_APPLY_SCHEMA =
  "hsi-u12-evidence-fill-apply-1" as const;

export type HsiU12PendingWorksheet = {
  schemaVersion: string;
  restrictedPreviewClaimed?: boolean;
  acceptedForScope?: boolean;
  checklist1Verified?: boolean;
  productionWritesEnabled?: boolean;
  inventedStagingUrl?: boolean;
  inventedGrant?: boolean;
  scientificApproval?: boolean;
  gateCAutoApprove?: boolean;
  journeyCompleteClaimed?: boolean;
  references: Record<string, string>;
  notes?: string;
  [key: string]: unknown;
};

export type HsiU12EvidenceFillApplyResult = {
  schemaVersion: typeof HSI_U12_EVIDENCE_FILL_APPLY_SCHEMA;
  authorization: HsiU12EvidenceFillApplyOwnerApproval;
  dryRun: boolean;
  restrictedPreviewClaimed: false;
  acceptedForScope: false;
  checklist1Verified: false;
  productionWritesEnabled: false;
  inventedStagingUrl: false;
  inventedGrant: false;
  u12Next: HsiU12PendingWorksheet;
  continuousJourneyNext: HsiU12PendingWorksheet;
  appliedReferenceKeys: readonly string[];
  notes: string;
};

function assertProposalHonesty(proposal: HsiU12EvidenceFillProposal): void {
  if (proposal.schemaVersion !== "hsi-u12-evidence-fill-proposal-1") {
    throw Error("U12 fill-apply refused: unexpected proposal schema");
  }
  if (
    proposal.restrictedPreviewClaimed !== false ||
    proposal.acceptedForScope !== false ||
    proposal.checklist1Verified !== false ||
    proposal.productionWritesEnabled !== false ||
    proposal.inventedStagingUrl !== false ||
    proposal.inventedGrant !== false
  ) {
    throw Error(
      "U12 fill-apply refused: proposal must keep preview GO, checklist #1, acceptance, writes, hosts, and grants closed",
    );
  }
}

function assertPendingHonesty(
  label: string,
  pending: HsiU12PendingWorksheet,
): void {
  if (
    pending.restrictedPreviewClaimed === true ||
    pending.acceptedForScope === true ||
    pending.checklist1Verified === true ||
    pending.productionWritesEnabled === true ||
    pending.inventedStagingUrl === true ||
    pending.inventedGrant === true ||
    pending.scientificApproval === true ||
    pending.gateCAutoApprove === true ||
    pending.journeyCompleteClaimed === true
  ) {
    throw Error(
      `U12 fill-apply refused: ${label} pending worksheet claims acceptance, preview GO, writes, invented hosts, Gate C, or journey complete`,
    );
  }
  if (!pending.references || typeof pending.references !== "object") {
    throw Error(`U12 fill-apply refused: ${label} missing references object`);
  }
}

/**
 * Apply a validated U40 fill proposal into U12 + continuous-journey pending
 * worksheets. Always returns restrictedPreviewClaimed/checklist1Verified false.
 */
export function applyHsiU12EvidenceFillProposal(input: {
  authorization: HsiU12EvidenceFillApplyOwnerApproval;
  proposal: HsiU12EvidenceFillProposal;
  u12Pending: HsiU12PendingWorksheet;
  continuousJourneyPending: HsiU12PendingWorksheet;
  dryRun?: boolean;
}): HsiU12EvidenceFillApplyResult {
  assertHsiU12EvidenceFillApplyOwnerAuthorized(input.authorization);
  assertProposalHonesty(input.proposal);
  assertPendingHonesty("u12", input.u12Pending);
  assertPendingHonesty("continuous-journey", input.continuousJourneyPending);

  const refs = input.proposal.references;
  const u12Next: HsiU12PendingWorksheet = {
    ...input.u12Pending,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    scientificApproval: false,
    gateCAutoApprove: false,
    references: {
      ...input.u12Pending.references,
      staging_target_ref: refs.staging_target_ref,
      preview_grant_ref: refs.preview_grant_ref,
      staging_grant_run_ref: refs.staging_grant_run_ref,
    },
    notes: [
      input.u12Pending.notes ?? "",
      `U43 fill-apply (${input.dryRun === false ? "write" : "dry-run"}): auth_probe=${refs.auth_probe_digest}; continuous_journey_digest=${refs.continuous_journey_evidence_digest}. restrictedPreviewClaimed and checklist #1 stay false.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  const continuousJourneyNext: HsiU12PendingWorksheet = {
    ...input.continuousJourneyPending,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    scientificApproval: false,
    gateCAutoApprove: false,
    journeyCompleteClaimed: false,
    references: {
      ...input.continuousJourneyPending.references,
      staging_grant_run_ref: refs.staging_grant_run_ref,
      staging_target_ref: refs.staging_target_ref,
      checklist_1_evidence_ref: refs.continuous_journey_evidence_digest,
    },
    notes: [
      input.continuousJourneyPending.notes ?? "",
      `U43 fill-apply (${input.dryRun === false ? "write" : "dry-run"}): applied continuous journey digest; journeyCompleteClaimed stays false; checklist #1 not verified.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  assertPendingHonesty("u12-next", u12Next);
  assertPendingHonesty("continuous-journey-next", continuousJourneyNext);

  return {
    schemaVersion: HSI_U12_EVIDENCE_FILL_APPLY_SCHEMA,
    authorization: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
    dryRun: input.dryRun !== false,
    restrictedPreviewClaimed: false,
    acceptedForScope: false,
    checklist1Verified: false,
    productionWritesEnabled: false,
    inventedStagingUrl: false,
    inventedGrant: false,
    u12Next,
    continuousJourneyNext,
    appliedReferenceKeys: [
      "staging_target_ref",
      "preview_grant_ref",
      "staging_grant_run_ref",
      "continuous_journey_evidence_digest",
      "auth_probe_digest",
    ],
    notes:
      "Applied proposal refs into pending worksheets. Owner GO / checklist #1 verification remain separate. Dry-run by default.",
  };
}
