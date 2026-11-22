/**
 * U49 — apply owner-supplied Human #8 pilot readiness refs into U8 + NEXT-F pendings.
 *
 * Pure apply: returns next JSON. Never sets soakAccepted, pilotReleaseSigned,
 * or pilotInviteAllowed. Never invents on-call, alerts, soak evidence, or invites.
 */
import {
  assertHsiPilotReadinessFillApplyOwnerAuthorized,
  HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
  type HsiPilotReadinessFillApplyOwnerApproval,
} from "../hsiPilotReadinessFillApplyAuthorization";
import {
  assertHsi10PilotReadinessU8SoftLand,
  hsi10PilotReadinessU8Packet,
} from "./hsi10PilotReadinessU8SoftLand";
import {
  assertHsiPilotReadinessFillApplySoftLand,
  hsiPilotReadinessFillApplySoftLandPacket,
} from "./hsiPilotReadinessFillApplySoftLand";

export const HSI_PILOT_READINESS_FILL_APPLY_SCHEMA =
  "hsi-pilot-readiness-fill-apply-1" as const;

export const HSI_PILOT_READINESS_FILL_PROPOSAL_SCHEMA =
  "hsi-pilot-readiness-fill-proposal-1" as const;

const PLACEHOLDER_REF =
  /^(NOT_STARTED|NOT_APPROVED|UNASSIGNED|BLOCKED|BLOCKED_UNTIL_HUMAN_8|BLOCKED_UNTIL_STAGING_GRANT|ENGINEERING_AUTHORIZED_AWAITING_STAGING|null|undefined)?$/i;

export type HsiPilotReadinessPendingWorksheet = {
  schemaVersion: string;
  soakAccepted?: boolean;
  pilotReleaseSigned?: boolean;
  pilotInviteAllowed?: boolean;
  scientificApproval?: boolean;
  acceptedForScope?: boolean;
  signedPacketClaimed?: boolean;
  inventedOnCallOwners?: boolean;
  inventedAlertDestinations?: boolean;
  inventedFourteenDayEvidence?: boolean;
  inventedPilotInvite?: boolean;
  autoGraphPromotion?: boolean;
  references: Record<string, string>;
  notes?: string;
  [key: string]: unknown;
};

export type HsiPilotReadinessFillProposal = {
  schemaVersion: typeof HSI_PILOT_READINESS_FILL_PROPOSAL_SCHEMA;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedOnCallOwners: false;
  inventedAlertDestinations: false;
  inventedFourteenDayEvidence: false;
  inventedPilotInvite: false;
  autoGraphPromotion: false;
  references: {
    human_8_next_f_ops_acceptance_ref: string;
    on_call_owner_ref: string;
    alert_destination_ref: string;
    fourteen_day_soak_ref: string;
    signed_pilot_packet_ref: string;
  };
  notes: string;
};

export type HsiPilotReadinessFillApplyResult = {
  schemaVersion: typeof HSI_PILOT_READINESS_FILL_APPLY_SCHEMA;
  authorization: HsiPilotReadinessFillApplyOwnerApproval;
  dryRun: boolean;
  soakAccepted: false;
  pilotReleaseSigned: false;
  pilotInviteAllowed: false;
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedOnCallOwners: false;
  inventedAlertDestinations: false;
  inventedFourteenDayEvidence: false;
  inventedPilotInvite: false;
  autoGraphPromotion: false;
  u8Next: HsiPilotReadinessPendingWorksheet;
  nextFNext: HsiPilotReadinessPendingWorksheet;
  appliedReferenceKeys: readonly string[];
  notes: string;
};

function assertNonPlaceholderRef(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_REF.test(trimmed) || trimmed.length < 8) {
    throw Error(
      `Pilot readiness fill refused: ${name} must be a real non-placeholder ref`,
    );
  }
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(trimmed)) {
    throw Error(`Pilot readiness fill refused: ${name} must not use localhost`);
  }
  if (
    /invent|example\.com|placeholder|TODO|FIXME|fake.?on.?call|fake.?soak|fake.?invite/i.test(
      trimmed,
    )
  ) {
    throw Error(`Pilot readiness fill refused: ${name} looks invented`);
  }
  return trimmed;
}

export function buildHsiPilotReadinessFillProposal(input: {
  human8NextFOpsAcceptanceRef: string;
  onCallOwnerRef: string;
  alertDestinationRef: string;
  fourteenDaySoakRef: string;
  signedPilotPacketRef: string;
}): HsiPilotReadinessFillProposal {
  assertHsiPilotReadinessFillApplySoftLand(hsiPilotReadinessFillApplySoftLandPacket());
  assertHsi10PilotReadinessU8SoftLand(hsi10PilotReadinessU8Packet());
  return {
    schemaVersion: HSI_PILOT_READINESS_FILL_PROPOSAL_SCHEMA,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    inventedPilotInvite: false,
    autoGraphPromotion: false,
    references: {
      human_8_next_f_ops_acceptance_ref: assertNonPlaceholderRef(
        "human_8_next_f_ops_acceptance_ref",
        input.human8NextFOpsAcceptanceRef,
      ),
      on_call_owner_ref: assertNonPlaceholderRef(
        "on_call_owner_ref",
        input.onCallOwnerRef,
      ),
      alert_destination_ref: assertNonPlaceholderRef(
        "alert_destination_ref",
        input.alertDestinationRef,
      ),
      fourteen_day_soak_ref: assertNonPlaceholderRef(
        "fourteen_day_soak_ref",
        input.fourteenDaySoakRef,
      ),
      signed_pilot_packet_ref: assertNonPlaceholderRef(
        "signed_pilot_packet_ref",
        input.signedPilotPacketRef,
      ),
    },
    notes:
      "Proposal only. Owner applies Human #8 refs privately. soakAccepted, pilotReleaseSigned, and checklist #8 invites stay false until separate owner GO.",
  };
}

function assertProposalHonesty(proposal: HsiPilotReadinessFillProposal): void {
  if (proposal.schemaVersion !== HSI_PILOT_READINESS_FILL_PROPOSAL_SCHEMA) {
    throw Error("Pilot readiness fill-apply refused: unexpected proposal schema");
  }
  if (
    proposal.soakAccepted !== false ||
    proposal.pilotReleaseSigned !== false ||
    proposal.pilotInviteAllowed !== false ||
    proposal.scientificApproval !== false ||
    proposal.acceptedForScope !== false ||
    proposal.signedPacketClaimed !== false ||
    proposal.inventedOnCallOwners !== false ||
    proposal.inventedAlertDestinations !== false ||
    proposal.inventedFourteenDayEvidence !== false ||
    proposal.inventedPilotInvite !== false ||
    proposal.autoGraphPromotion !== false
  ) {
    throw Error(
      "Pilot readiness fill-apply refused: proposal must keep soak, pilot release, invites, acceptance, invented ops evidence, and auto graph promotion closed",
    );
  }
}

function assertPendingHonesty(
  label: string,
  pending: HsiPilotReadinessPendingWorksheet,
): void {
  if (
    pending.soakAccepted === true ||
    pending.pilotReleaseSigned === true ||
    pending.pilotInviteAllowed === true ||
    pending.scientificApproval === true ||
    pending.acceptedForScope === true ||
    pending.signedPacketClaimed === true ||
    pending.inventedOnCallOwners === true ||
    pending.inventedAlertDestinations === true ||
    pending.inventedFourteenDayEvidence === true ||
    pending.inventedPilotInvite === true ||
    pending.autoGraphPromotion === true
  ) {
    throw Error(
      `Pilot readiness fill-apply refused: ${label} pending claims soak, pilot, invites, acceptance, invented ops evidence, or auto graph promotion`,
    );
  }
  if (!pending.references || typeof pending.references !== "object") {
    throw Error(`Pilot readiness fill-apply refused: ${label} missing references object`);
  }
}

export function applyHsiPilotReadinessFillProposal(input: {
  authorization: HsiPilotReadinessFillApplyOwnerApproval;
  proposal: HsiPilotReadinessFillProposal;
  u8Pending: HsiPilotReadinessPendingWorksheet;
  nextFPending: HsiPilotReadinessPendingWorksheet;
  dryRun?: boolean;
}): HsiPilotReadinessFillApplyResult {
  assertHsiPilotReadinessFillApplyOwnerAuthorized(input.authorization);
  assertHsiPilotReadinessFillApplySoftLand(hsiPilotReadinessFillApplySoftLandPacket());
  assertHsi10PilotReadinessU8SoftLand(hsi10PilotReadinessU8Packet());
  assertProposalHonesty(input.proposal);
  assertPendingHonesty("u8", input.u8Pending);
  assertPendingHonesty("next-f", input.nextFPending);

  const refs = input.proposal.references;
  const mode = input.dryRun === false ? "write" : "dry-run";

  const u8Next: HsiPilotReadinessPendingWorksheet = {
    ...input.u8Pending,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    inventedPilotInvite: false,
    autoGraphPromotion: false,
    references: {
      ...input.u8Pending.references,
      human_8_next_f_ops_acceptance_ref: refs.human_8_next_f_ops_acceptance_ref,
      on_call_owner_ref: refs.on_call_owner_ref,
      alert_destination_ref: refs.alert_destination_ref,
      fourteen_day_soak_ref: refs.fourteen_day_soak_ref,
      signed_pilot_packet_ref: refs.signed_pilot_packet_ref,
      checklist_8_pilot_invite_ref: "BLOCKED_UNTIL_HUMAN_8",
    },
    notes: [
      input.u8Pending.notes ?? "",
      `U49 fill-apply (${mode}): filled Human #8 ops refs; soak/pilot/invites stay closed; checklist #8 remains BLOCKED_UNTIL_HUMAN_8.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  const nextFNext: HsiPilotReadinessPendingWorksheet = {
    ...input.nextFPending,
    soakAccepted: false,
    pilotReleaseSigned: false,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    autoGraphPromotion: false,
    references: {
      ...input.nextFPending.references,
      on_call_owner_ref: refs.on_call_owner_ref,
      alert_destination_ref: refs.alert_destination_ref,
      fourteen_day_soak_ref: refs.fourteen_day_soak_ref,
      signed_pilot_packet_ref: refs.signed_pilot_packet_ref,
    },
    notes: [
      input.nextFPending.notes ?? "",
      `U49 fill-apply (${mode}): mirrored Human #8 soak/pilot refs; soakAccepted and pilotReleaseSigned stay false.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  assertPendingHonesty("u8-next", u8Next);
  assertPendingHonesty("next-f-next", nextFNext);

  return {
    schemaVersion: HSI_PILOT_READINESS_FILL_APPLY_SCHEMA,
    authorization: HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
    dryRun: input.dryRun !== false,
    soakAccepted: false,
    pilotReleaseSigned: false,
    pilotInviteAllowed: false,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedOnCallOwners: false,
    inventedAlertDestinations: false,
    inventedFourteenDayEvidence: false,
    inventedPilotInvite: false,
    autoGraphPromotion: false,
    u8Next,
    nextFNext,
    appliedReferenceKeys: [
      "human_8_next_f_ops_acceptance_ref",
      "on_call_owner_ref",
      "alert_destination_ref",
      "fourteen_day_soak_ref",
      "signed_pilot_packet_ref",
    ],
    notes:
      "Applied Human #8 refs into U8 + NEXT-F pendings. Soak acceptance, signed pilot, and checklist #8 invites remain separate. Dry-run by default.",
  };
}
