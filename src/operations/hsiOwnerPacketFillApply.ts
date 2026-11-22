/**
 * U47 — apply owner-supplied Human #2/#3/#5 packet refs into the U6 pending worksheet.
 *
 * Pure apply: returns next JSON. Never sets human gates closed, signedPacketClaimed,
 * acceptedForScope, or productionWritesEnabled to true. Never invents signers, MoUs,
 * or staging hosts.
 */
import {
  assertHsiOwnerPacketFillApplyOwnerAuthorized,
  HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
  type HsiOwnerPacketFillApplyOwnerApproval,
} from "../hsiOwnerPacketFillApplyAuthorization";
import {
  assertHsi10OwnerPacketsScaffold,
  hsi10OwnerPacketsPacket,
} from "./hsi10OwnerPacketsScaffold";
import {
  assertHsiOwnerPacketFillApplySoftLand,
  hsiOwnerPacketFillApplySoftLandPacket,
} from "./hsiOwnerPacketFillApplySoftLand";

export const HSI_OWNER_PACKET_FILL_APPLY_SCHEMA =
  "hsi-owner-packet-fill-apply-1" as const;

export const HSI_OWNER_PACKET_FILL_PROPOSAL_SCHEMA =
  "hsi-owner-packet-fill-proposal-1" as const;

const PLACEHOLDER_REF =
  /^(NOT_STARTED|NOT_APPROVED|UNASSIGNED|BLOCKED|BLOCKED_UNTIL_STAGING_GRANT|ENGINEERING_AUTHORIZED_AWAITING_STAGING|null|undefined)?$/i;

export type HsiOwnerPacketPendingWorksheet = {
  schemaVersion: string;
  acceptedForScope?: boolean;
  signedPacketClaimed?: boolean;
  scientificApproval?: boolean;
  productionWritesEnabled?: boolean;
  gateCAutoApprove?: boolean;
  inventedSigner?: boolean;
  inventedStagingUrl?: boolean;
  inventedMoU?: boolean;
  migrationHoldsChanged?: boolean;
  references: Record<string, string>;
  packets?: Record<
    string,
    {
      accepted?: boolean;
      status?: string;
      [key: string]: unknown;
    }
  >;
  notes?: string;
  [key: string]: unknown;
};

export type HsiOwnerPacketFillProposal = {
  schemaVersion: typeof HSI_OWNER_PACKET_FILL_PROPOSAL_SCHEMA;
  human2Closed: false;
  human3Closed: false;
  human5Closed: false;
  signedPacketClaimed: false;
  acceptedForScope: false;
  productionWritesEnabled: false;
  inventedSigner: false;
  inventedStagingUrl: false;
  inventedMoU: false;
  references: {
    human_2_clearance_policy_ref: string;
    human_2_clearance_authority_ref: string;
    human_2_managed_signer_ref: string;
    human_3_isolation_signer_ref: string;
    human_3_two_user_http_evidence_ref: string;
    human_5_staging_write_packet_ref: string;
    human_5_staging_target_ref: string;
  };
  notes: string;
};

export type HsiOwnerPacketFillApplyResult = {
  schemaVersion: typeof HSI_OWNER_PACKET_FILL_APPLY_SCHEMA;
  authorization: HsiOwnerPacketFillApplyOwnerApproval;
  dryRun: boolean;
  human2Closed: false;
  human3Closed: false;
  human5Closed: false;
  signedPacketClaimed: false;
  acceptedForScope: false;
  productionWritesEnabled: false;
  inventedSigner: false;
  inventedStagingUrl: false;
  inventedMoU: false;
  ownerPacketsNext: HsiOwnerPacketPendingWorksheet;
  appliedReferenceKeys: readonly string[];
  notes: string;
};

function assertNonPlaceholderRef(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_REF.test(trimmed) || trimmed.length < 8) {
    throw Error(
      `Owner-packet fill refused: ${name} must be a real non-placeholder ref`,
    );
  }
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(trimmed)) {
    throw Error(`Owner-packet fill refused: ${name} must not use localhost`);
  }
  if (/invent|example\.com|placeholder|TODO|FIXME|fake.?signer|fake.?mou/i.test(trimmed)) {
    throw Error(`Owner-packet fill refused: ${name} looks invented`);
  }
  return trimmed;
}

/**
 * Build a Human #2/#3/#5 fill proposal from owner-supplied refs.
 * Never claims gates closed or invents signers/MoUs/hosts.
 */
export function buildHsiOwnerPacketFillProposal(input: {
  human2ClearancePolicyRef: string;
  human2ClearanceAuthorityRef: string;
  human2ManagedSignerRef: string;
  human3IsolationSignerRef: string;
  human3TwoUserHttpEvidenceRef: string;
  human5StagingWritePacketRef: string;
  human5StagingTargetRef: string;
}): HsiOwnerPacketFillProposal {
  assertHsiOwnerPacketFillApplySoftLand(hsiOwnerPacketFillApplySoftLandPacket());
  assertHsi10OwnerPacketsScaffold(hsi10OwnerPacketsPacket());
  return {
    schemaVersion: HSI_OWNER_PACKET_FILL_PROPOSAL_SCHEMA,
    human2Closed: false,
    human3Closed: false,
    human5Closed: false,
    signedPacketClaimed: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedMoU: false,
    references: {
      human_2_clearance_policy_ref: assertNonPlaceholderRef(
        "human_2_clearance_policy_ref",
        input.human2ClearancePolicyRef,
      ),
      human_2_clearance_authority_ref: assertNonPlaceholderRef(
        "human_2_clearance_authority_ref",
        input.human2ClearanceAuthorityRef,
      ),
      human_2_managed_signer_ref: assertNonPlaceholderRef(
        "human_2_managed_signer_ref",
        input.human2ManagedSignerRef,
      ),
      human_3_isolation_signer_ref: assertNonPlaceholderRef(
        "human_3_isolation_signer_ref",
        input.human3IsolationSignerRef,
      ),
      human_3_two_user_http_evidence_ref: assertNonPlaceholderRef(
        "human_3_two_user_http_evidence_ref",
        input.human3TwoUserHttpEvidenceRef,
      ),
      human_5_staging_write_packet_ref: assertNonPlaceholderRef(
        "human_5_staging_write_packet_ref",
        input.human5StagingWritePacketRef,
      ),
      human_5_staging_target_ref: assertNonPlaceholderRef(
        "human_5_staging_target_ref",
        input.human5StagingTargetRef,
      ),
    },
    notes:
      "Proposal only. Owner applies refs to U6 pending worksheet privately. Human #2/#3/#5 stay open until separate owner sign-off.",
  };
}

function assertProposalHonesty(proposal: HsiOwnerPacketFillProposal): void {
  if (proposal.schemaVersion !== HSI_OWNER_PACKET_FILL_PROPOSAL_SCHEMA) {
    throw Error("Owner-packet fill-apply refused: unexpected proposal schema");
  }
  if (
    proposal.human2Closed !== false ||
    proposal.human3Closed !== false ||
    proposal.human5Closed !== false ||
    proposal.signedPacketClaimed !== false ||
    proposal.acceptedForScope !== false ||
    proposal.productionWritesEnabled !== false ||
    proposal.inventedSigner !== false ||
    proposal.inventedStagingUrl !== false ||
    proposal.inventedMoU !== false
  ) {
    throw Error(
      "Owner-packet fill-apply refused: proposal must keep Human gates, signed packets, acceptance, writes, signers, hosts, and MoUs closed",
    );
  }
}

function assertPendingHonesty(pending: HsiOwnerPacketPendingWorksheet): void {
  if (
    pending.acceptedForScope === true ||
    pending.signedPacketClaimed === true ||
    pending.scientificApproval === true ||
    pending.productionWritesEnabled === true ||
    pending.gateCAutoApprove === true ||
    pending.inventedSigner === true ||
    pending.inventedStagingUrl === true ||
    pending.inventedMoU === true ||
    pending.migrationHoldsChanged === true
  ) {
    throw Error(
      "Owner-packet fill-apply refused: pending worksheet claims acceptance, signed packet, writes, invented signer/host/MoU, Gate C, or hold removal",
    );
  }
  if (!pending.references || typeof pending.references !== "object") {
    throw Error("Owner-packet fill-apply refused: pending missing references object");
  }
  if (pending.packets) {
    for (const [id, packet] of Object.entries(pending.packets)) {
      if (packet.accepted === true) {
        throw Error(
          `Owner-packet fill-apply refused: packet ${id} already claims accepted=true`,
        );
      }
    }
  }
}

/**
 * Apply a validated fill proposal into the U6 owner-packets pending worksheet.
 * Always returns Human #2/#3/#5 closed flags false.
 */
export function applyHsiOwnerPacketFillProposal(input: {
  authorization: HsiOwnerPacketFillApplyOwnerApproval;
  proposal: HsiOwnerPacketFillProposal;
  ownerPacketsPending: HsiOwnerPacketPendingWorksheet;
  dryRun?: boolean;
}): HsiOwnerPacketFillApplyResult {
  assertHsiOwnerPacketFillApplyOwnerAuthorized(input.authorization);
  assertHsiOwnerPacketFillApplySoftLand(hsiOwnerPacketFillApplySoftLandPacket());
  assertHsi10OwnerPacketsScaffold(hsi10OwnerPacketsPacket());
  assertProposalHonesty(input.proposal);
  assertPendingHonesty(input.ownerPacketsPending);

  const refs = input.proposal.references;
  const ownerPacketsNext: HsiOwnerPacketPendingWorksheet = {
    ...input.ownerPacketsPending,
    acceptedForScope: false,
    signedPacketClaimed: false,
    scientificApproval: false,
    productionWritesEnabled: false,
    gateCAutoApprove: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedMoU: false,
    migrationHoldsChanged: false,
    references: {
      ...input.ownerPacketsPending.references,
      human_2_clearance_policy_ref: refs.human_2_clearance_policy_ref,
      human_2_clearance_authority_ref: refs.human_2_clearance_authority_ref,
      human_2_managed_signer_ref: refs.human_2_managed_signer_ref,
      human_3_isolation_signer_ref: refs.human_3_isolation_signer_ref,
      human_3_two_user_http_evidence_ref: refs.human_3_two_user_http_evidence_ref,
      human_5_staging_write_packet_ref: refs.human_5_staging_write_packet_ref,
      human_5_staging_target_ref: refs.human_5_staging_target_ref,
    },
    packets: input.ownerPacketsPending.packets
      ? Object.fromEntries(
          Object.entries(input.ownerPacketsPending.packets).map(([id, packet]) => [
            id,
            {
              ...packet,
              accepted: false,
              status: packet.status ?? "OWNER_GATED",
            },
          ]),
        )
      : input.ownerPacketsPending.packets,
    notes: [
      input.ownerPacketsPending.notes ?? "",
      `U47 fill-apply (${input.dryRun === false ? "write" : "dry-run"}): filled Human #2/#3/#5 refs; gates stay open; signedPacketClaimed stays false.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  assertPendingHonesty(ownerPacketsNext);

  return {
    schemaVersion: HSI_OWNER_PACKET_FILL_APPLY_SCHEMA,
    authorization: HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
    dryRun: input.dryRun !== false,
    human2Closed: false,
    human3Closed: false,
    human5Closed: false,
    signedPacketClaimed: false,
    acceptedForScope: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedMoU: false,
    ownerPacketsNext,
    appliedReferenceKeys: [
      "human_2_clearance_policy_ref",
      "human_2_clearance_authority_ref",
      "human_2_managed_signer_ref",
      "human_3_isolation_signer_ref",
      "human_3_two_user_http_evidence_ref",
      "human_5_staging_write_packet_ref",
      "human_5_staging_target_ref",
    ],
    notes:
      "Applied proposal refs into owner-packets pending worksheet. Human #2/#3/#5 sign-off remains separate. Dry-run by default.",
  };
}
