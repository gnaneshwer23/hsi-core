/** Owner authorization for U49 — P1 Human #8 pilot readiness fill-apply.
 *
 * Owner directed P1 after the 22 November 2026 audit (Europe/London):
 * SME gold → soak → pilot, without inventing on-call, soak evidence, or invites.
 *
 * This envelope unlocks dry-run (default) and dual-flag write apply of
 * non-placeholder Human #8 refs into `hsi-10-pilot-readiness-u8.pending.json`
 * (and mirrored NEXT-F soak refs). It does not authorize soak accepted,
 * signed pilot, checklist #8 invites, invented on-call/alerts, Gate C, PHI, or GA.
 */

export const HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL_SCHEMA =
  "hsi-pilot-readiness-fill-apply-owner-approval-1" as const;

export const HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL = {
  schemaVersion: HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_pilot_readiness_fill_apply" as const,
  pilotReadinessFillApplyAuthorized: true as const,
  scientificApproval: false as const,
  soakAccepted: false as const,
  pilotReleaseSigned: false as const,
  pilotInviteAllowed: false as const,
  acceptedForScope: false as const,
  signedPacketClaimed: false as const,
  inventedOnCallOwners: false as const,
  inventedAlertDestinations: false as const,
  inventedFourteenDayEvidence: false as const,
  inventedPilotInvite: false as const,
  autoGraphPromotion: false as const,
  productionResearchWritesEnabled: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
};

export type HsiPilotReadinessFillApplyOwnerApproval =
  typeof HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL;

export function validateHsiPilotReadinessFillApplyOwnerApproval(
  approval: HsiPilotReadinessFillApplyOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid pilot readiness fill-apply owner approval schema");
  }
  if (approval.scope !== "engineering_pilot_readiness_fill_apply") {
    throw Error("Pilot readiness fill-apply approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL.approvedAt) {
    throw Error("Pilot readiness fill-apply approval date mismatch");
  }
  if (approval.pilotReadinessFillApplyAuthorized !== true) {
    throw Error("Pilot readiness fill-apply must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.soakAccepted !== false ||
    approval.pilotReleaseSigned !== false ||
    approval.pilotInviteAllowed !== false ||
    approval.acceptedForScope !== false ||
    approval.signedPacketClaimed !== false ||
    approval.inventedOnCallOwners !== false ||
    approval.inventedAlertDestinations !== false ||
    approval.inventedFourteenDayEvidence !== false ||
    approval.inventedPilotInvite !== false ||
    approval.autoGraphPromotion !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false
  ) {
    throw Error(
      "Pilot readiness fill-apply must not claim soak, signed pilot, invites, acceptance, invented on-call/alerts/soak/invites, auto graph promotion, writes, Gate C, PHI, clinical plane, or GA",
    );
  }
}

export function assertHsiPilotReadinessFillApplyOwnerAuthorized(
  approval: HsiPilotReadinessFillApplyOwnerApproval,
): void {
  validateHsiPilotReadinessFillApplyOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error(
      "Pilot readiness fill-apply requires the canonical owner approval envelope",
    );
  }
}
