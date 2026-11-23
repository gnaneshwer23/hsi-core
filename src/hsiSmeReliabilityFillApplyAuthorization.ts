/** Owner authorization for U48 — P1 Human #4 SME reliability fill-apply.
 *
 * Owner directed P1 after the 22 November 2026 audit (Europe/London):
 * SME gold → soak → pilot, without inventing labels or adjudications.
 *
 * This envelope unlocks dry-run (default) and dual-flag write apply of
 * non-placeholder Human #4 refs into `hsi-10-scientific-reliability-u7.pending.json`
 * (and mirrored E2E-10 vault refs). It does not authorize SME gold filled,
 * scientific approval, invented labels/adjudications, Gate C, PHI, or GA.
 */

export const HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL_SCHEMA =
  "hsi-sme-reliability-fill-apply-owner-approval-1" as const;

export const HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL = {
  schemaVersion: HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_sme_reliability_fill_apply" as const,
  smeReliabilityFillApplyAuthorized: true as const,
  scientificApproval: false as const,
  smeGoldFilled: false as const,
  frozenHeldOut: false as const,
  adjudicatedCasesClaimed: false as const,
  acceptedForScope: false as const,
  signedPacketClaimed: false as const,
  inventedSmeLabels: false as const,
  inventedAdjudications: false as const,
  goldCommittedInGit: false as const,
  productionResearchWritesEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
};

export type HsiSmeReliabilityFillApplyOwnerApproval =
  typeof HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL;

export function validateHsiSmeReliabilityFillApplyOwnerApproval(
  approval: HsiSmeReliabilityFillApplyOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid SME reliability fill-apply owner approval schema");
  }
  if (approval.scope !== "engineering_sme_reliability_fill_apply") {
    throw Error("SME reliability fill-apply approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL.approvedAt) {
    throw Error("SME reliability fill-apply approval date mismatch");
  }
  if (approval.smeReliabilityFillApplyAuthorized !== true) {
    throw Error("SME reliability fill-apply must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.smeGoldFilled !== false ||
    approval.frozenHeldOut !== false ||
    approval.adjudicatedCasesClaimed !== false ||
    approval.acceptedForScope !== false ||
    approval.signedPacketClaimed !== false ||
    approval.inventedSmeLabels !== false ||
    approval.inventedAdjudications !== false ||
    approval.goldCommittedInGit !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false
  ) {
    throw Error(
      "SME reliability fill-apply must not claim gold filled, freeze, adjudications, acceptance, invented labels, scientific approval, writes, Gate C, PHI, clinical plane, or GA",
    );
  }
}

export function assertHsiSmeReliabilityFillApplyOwnerAuthorized(
  approval: HsiSmeReliabilityFillApplyOwnerApproval,
): void {
  validateHsiSmeReliabilityFillApplyOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error(
      "SME reliability fill-apply requires the canonical owner approval envelope",
    );
  }
}
