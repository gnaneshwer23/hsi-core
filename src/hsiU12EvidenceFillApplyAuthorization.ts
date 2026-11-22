/** Owner authorization for U43 — apply U40 fill proposals into U12 worksheets.
 *
 * Owner directed the next two soft-lands after U40 merge (22 November 2026,
 * Europe/London): deepen Companion (U42) and U12 fill-apply (U43).
 *
 * This envelope unlocks deterministic application of non-placeholder
 * U40 fill proposals into restricted-preview / continuous-journey pending
 * worksheets. It does not authorize inventing hosts/grants, restricted-preview
 * GO, checklist #1 verified, production writes, Gate C, PHI, or GA.
 */

export const HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL_SCHEMA =
  "hsi-u12-evidence-fill-apply-owner-approval-1" as const;

export const HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL = {
  schemaVersion: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_u12_evidence_fill_apply" as const,
  fillApplyAuthorized: true as const,
  scientificApproval: false as const,
  restrictedPreviewClaimed: false as const,
  checklist1Verified: false as const,
  acceptedForScope: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  inventedStagingUrl: false as const,
  inventedGrant: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
};

export type HsiU12EvidenceFillApplyOwnerApproval =
  typeof HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL;

export function validateHsiU12EvidenceFillApplyOwnerApproval(
  approval: HsiU12EvidenceFillApplyOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid U12 fill-apply owner approval schema");
  }
  if (approval.scope !== "engineering_u12_evidence_fill_apply") {
    throw Error("U12 fill-apply approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL.approvedAt) {
    throw Error("U12 fill-apply approval date mismatch");
  }
  if (approval.fillApplyAuthorized !== true) {
    throw Error("U12 fill-apply engineering must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.restrictedPreviewClaimed !== false ||
    approval.checklist1Verified !== false ||
    approval.acceptedForScope !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.inventedStagingUrl !== false ||
    approval.inventedGrant !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false
  ) {
    throw Error(
      "U12 fill-apply approval must not claim preview GO, checklist #1, acceptance, writes, invented hosts/grants, Gate C, PHI, clinical plane, GA, or scientific approval",
    );
  }
}

export function assertHsiU12EvidenceFillApplyOwnerAuthorized(
  approval: HsiU12EvidenceFillApplyOwnerApproval,
): void {
  validateHsiU12EvidenceFillApplyOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error("U12 fill-apply requires the canonical owner approval envelope");
  }
}
