/** Owner authorization for U40 restricted-preview evidence runners.
 *
 * Owner directed "Build Restricted-preview auth + continuous-journey evidence
 * runners (fill U12 once you approve staging)" on 21 November 2026 (Europe/London).
 *
 * This envelope unlocks the engineering runners that collect CI-safe and
 * owner-gated staging evidence packets for U12 worksheet fill.
 *
 * It does not authorize restricted-preview GO, invent staging hosts/grants,
 * enable production research writes, lift held Neon migrations, Gate C
 * auto-approve, PHI/clinical plane, scientific approval, or general availability.
 * Checklist #1 remains unverified until the owner records real staging refs.
 */

export const HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL_SCHEMA =
  "hsi-restricted-preview-evidence-owner-approval-1" as const;

export const HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL = {
  schemaVersion: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL_SCHEMA,
  /** Calendar date of the owner's explicit build directive. */
  approvedAt: "2026-11-21",
  scope: "engineering_restricted_preview_evidence_runners" as const,
  restrictedPreviewEvidenceRunnersAuthorized: true as const,
  scientificApproval: false as const,
  restrictedPreviewClaimed: false as const,
  checklist1Verified: false as const,
  stagingGrantVerified: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
  inventedStagingUrl: false as const,
  inventedGrant: false as const,
};

export type HsiRestrictedPreviewEvidenceOwnerApproval =
  typeof HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL;

export function validateHsiRestrictedPreviewEvidenceOwnerApproval(
  approval: HsiRestrictedPreviewEvidenceOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid restricted-preview evidence owner approval schema");
  }
  if (approval.scope !== "engineering_restricted_preview_evidence_runners") {
    throw Error("Restricted-preview evidence approval scope must be engineering runners only");
  }
  if (approval.approvedAt !== HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL.approvedAt) {
    throw Error("Restricted-preview evidence approval date mismatch");
  }
  if (approval.restrictedPreviewEvidenceRunnersAuthorized !== true) {
    throw Error("Restricted-preview evidence runners must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.restrictedPreviewClaimed !== false ||
    approval.checklist1Verified !== false ||
    approval.stagingGrantVerified !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false ||
    approval.inventedStagingUrl !== false ||
    approval.inventedGrant !== false
  ) {
    throw Error(
      "Restricted-preview evidence approval must not claim preview GO, checklist #1, staging grant, writes, hosts, grants, Gate C, PHI, clinical plane, or GA",
    );
  }
}

/** Fail closed unless the canonical owner approval envelope is presented. */
export function assertHsiRestrictedPreviewEvidenceOwnerAuthorized(
  approval: HsiRestrictedPreviewEvidenceOwnerApproval,
): void {
  validateHsiRestrictedPreviewEvidenceOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error(
      "Restricted-preview evidence runners require the canonical owner approval envelope",
    );
  }
}
