/** Owner authorization for HSI live scientific platform L1 engineering (U37).
 *
 * Owner directed "Build live scientific platform" on 21 November 2026 (Europe/London).
 * This envelope unlocks the engineering composition host that wires live
 * investigation + research-agent runtime for restricted-preview (L1).
 *
 * It does not authorize restricted-preview GO, staging grants, production
 * research writes, held Neon migrations, Gate C auto-approve, PHI/clinical
 * plane, scientific approval, or general availability.
 */

export const HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL_SCHEMA =
  "hsi-live-scientific-platform-owner-approval-1" as const;

export const HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL = {
  schemaVersion: HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL_SCHEMA,
  /** Calendar date of the owner's explicit build directive. */
  approvedAt: "2026-11-21",
  scope: "engineering_live_scientific_platform_l1" as const,
  liveScientificPlatformEngineeringAuthorized: true as const,
  scientificApproval: false as const,
  restrictedPreviewClaimed: false as const,
  stagingGrantVerified: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
};

export type HsiLiveScientificPlatformOwnerApproval =
  typeof HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL;

export function validateHsiLiveScientificPlatformOwnerApproval(
  approval: HsiLiveScientificPlatformOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid live scientific platform owner approval schema");
  }
  if (approval.scope !== "engineering_live_scientific_platform_l1") {
    throw Error("Live scientific platform approval scope must be L1 engineering only");
  }
  if (approval.approvedAt !== HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL.approvedAt) {
    throw Error("Live scientific platform approval date mismatch");
  }
  if (approval.liveScientificPlatformEngineeringAuthorized !== true) {
    throw Error("Live scientific platform engineering must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.restrictedPreviewClaimed !== false ||
    approval.stagingGrantVerified !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false
  ) {
    throw Error(
      "Live scientific platform approval must not claim scientific approval, restricted preview, staging grant, research writes, held migrations, Gate C, PHI, clinical plane, or GA",
    );
  }
}

/** Fail closed unless the canonical owner approval envelope is presented. */
export function assertHsiLiveScientificPlatformOwnerAuthorized(
  approval: HsiLiveScientificPlatformOwnerApproval,
): void {
  validateHsiLiveScientificPlatformOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_LIVE_SCIENTIFIC_PLATFORM_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error("Live scientific platform runtime requires the canonical owner approval envelope");
  }
}
