/** Owner authorization for U46 — P0 staging acceptance orchestration.
 *
 * Owner directed P0 after the 22 November 2026 audit (Europe/London):
 * staging grant + live U40 evidence + apply path, without inventing hosts.
 *
 * This envelope unlocks an engineering orchestration that composes U40/U43
 * honesty catalogs into one owner-facing check/fixture/dry-apply suite.
 * It does not authorize restricted-preview GO, checklist #1 verified,
 * invented hosts/grants, production writes, Gate C, PHI, or GA.
 */

export const HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL_SCHEMA =
  "hsi-staging-acceptance-orchestration-owner-approval-1" as const;

export const HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL = {
  schemaVersion: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_staging_acceptance_orchestration" as const,
  stagingAcceptanceOrchestrationAuthorized: true as const,
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

export type HsiStagingAcceptanceOrchestrationOwnerApproval =
  typeof HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL;

export function validateHsiStagingAcceptanceOrchestrationOwnerApproval(
  approval: HsiStagingAcceptanceOrchestrationOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid staging-acceptance orchestration owner approval schema");
  }
  if (approval.scope !== "engineering_staging_acceptance_orchestration") {
    throw Error("Staging-acceptance orchestration approval scope mismatch");
  }
  if (
    approval.approvedAt !== HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL.approvedAt
  ) {
    throw Error("Staging-acceptance orchestration approval date mismatch");
  }
  if (approval.stagingAcceptanceOrchestrationAuthorized !== true) {
    throw Error("Staging-acceptance orchestration must be authorized");
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
      "Staging-acceptance orchestration must not claim preview GO, checklist #1, acceptance, writes, invented hosts/grants, Gate C, PHI, clinical plane, GA, or scientific approval",
    );
  }
}

export function assertHsiStagingAcceptanceOrchestrationOwnerAuthorized(
  approval: HsiStagingAcceptanceOrchestrationOwnerApproval,
): void {
  validateHsiStagingAcceptanceOrchestrationOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error(
      "Staging-acceptance orchestration requires the canonical owner approval envelope",
    );
  }
}
