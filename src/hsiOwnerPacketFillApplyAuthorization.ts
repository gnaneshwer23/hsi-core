/** Owner authorization for U47 — P0 Human #2/#3/#5 owner-packet fill-apply.
 *
 * Owner directed P0 after the 22 November 2026 audit (Europe/London):
 * fill Human #2/#3/#5 packet refs without inventing signers, MoUs, or hosts.
 *
 * This envelope unlocks dry-run (default) and dual-flag write apply of
 * non-placeholder refs into `hsi-10-owner-packets.pending.json`.
 * It does not authorize Human #2/#3/#5 closed, signed packets, MoUs,
 * invented signers/hosts, production writes, Gate C, PHI, or GA.
 */

export const HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL_SCHEMA =
  "hsi-owner-packet-fill-apply-owner-approval-1" as const;

export const HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL = {
  schemaVersion: HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL_SCHEMA,
  approvedAt: "2026-11-22",
  scope: "engineering_owner_packet_fill_apply" as const,
  ownerPacketFillApplyAuthorized: true as const,
  scientificApproval: false as const,
  human2Closed: false as const,
  human3Closed: false as const,
  human5Closed: false as const,
  signedPacketClaimed: false as const,
  acceptedForScope: false as const,
  productionResearchWritesEnabled: false as const,
  heldMigrationsEnabled: false as const,
  inventedSigner: false as const,
  inventedStagingUrl: false as const,
  inventedMoU: false as const,
  gateCAutoApprove: false as const,
  phiAllowed: false as const,
  clinicalPlane: false as const,
  generalAvailability: false as const,
};

export type HsiOwnerPacketFillApplyOwnerApproval =
  typeof HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL;

export function validateHsiOwnerPacketFillApplyOwnerApproval(
  approval: HsiOwnerPacketFillApplyOwnerApproval,
): void {
  if (
    !approval ||
    approval.schemaVersion !== HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL_SCHEMA
  ) {
    throw Error("Invalid owner-packet fill-apply owner approval schema");
  }
  if (approval.scope !== "engineering_owner_packet_fill_apply") {
    throw Error("Owner-packet fill-apply approval scope mismatch");
  }
  if (approval.approvedAt !== HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL.approvedAt) {
    throw Error("Owner-packet fill-apply approval date mismatch");
  }
  if (approval.ownerPacketFillApplyAuthorized !== true) {
    throw Error("Owner-packet fill-apply must be authorized");
  }
  if (
    approval.scientificApproval !== false ||
    approval.human2Closed !== false ||
    approval.human3Closed !== false ||
    approval.human5Closed !== false ||
    approval.signedPacketClaimed !== false ||
    approval.acceptedForScope !== false ||
    approval.productionResearchWritesEnabled !== false ||
    approval.heldMigrationsEnabled !== false ||
    approval.inventedSigner !== false ||
    approval.inventedStagingUrl !== false ||
    approval.inventedMoU !== false ||
    approval.gateCAutoApprove !== false ||
    approval.phiAllowed !== false ||
    approval.clinicalPlane !== false ||
    approval.generalAvailability !== false
  ) {
    throw Error(
      "Owner-packet fill-apply must not claim Human #2/#3/#5 closed, signed packets, acceptance, writes, invented signers/hosts/MoUs, Gate C, PHI, clinical plane, GA, or scientific approval",
    );
  }
}

export function assertHsiOwnerPacketFillApplyOwnerAuthorized(
  approval: HsiOwnerPacketFillApplyOwnerApproval,
): void {
  validateHsiOwnerPacketFillApplyOwnerApproval(approval);
  const canonical = JSON.stringify(HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL);
  const provided = JSON.stringify(approval);
  if (canonical !== provided) {
    throw Error(
      "Owner-packet fill-apply requires the canonical owner approval envelope",
    );
  }
}
