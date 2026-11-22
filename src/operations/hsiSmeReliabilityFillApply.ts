/**
 * U48 — apply owner-supplied Human #4 SME reliability refs into U7 + E2E-10 pendings.
 *
 * Pure apply: returns next JSON. Never sets smeGoldFilled, scientificApproval,
 * frozenHeldOut, or adjudicatedCases. Never invents labels or adjudications.
 */
import {
  assertHsiSmeReliabilityFillApplyOwnerAuthorized,
  HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
  type HsiSmeReliabilityFillApplyOwnerApproval,
} from "../hsiSmeReliabilityFillApplyAuthorization";
import {
  assertHsi10ScientificReliabilityU7SoftLand,
  hsi10ScientificReliabilityU7Packet,
} from "./hsi10ScientificReliabilityU7SoftLand";
import {
  assertHsiSmeReliabilityFillApplySoftLand,
  hsiSmeReliabilityFillApplySoftLandPacket,
} from "./hsiSmeReliabilityFillApplySoftLand";

export const HSI_SME_RELIABILITY_FILL_APPLY_SCHEMA =
  "hsi-sme-reliability-fill-apply-1" as const;

export const HSI_SME_RELIABILITY_FILL_PROPOSAL_SCHEMA =
  "hsi-sme-reliability-fill-proposal-1" as const;

const PLACEHOLDER_REF =
  /^(NOT_STARTED|NOT_APPROVED|UNASSIGNED|BLOCKED|BLOCKED_UNTIL_STAGING_GRANT|ENGINEERING_AUTHORIZED_AWAITING_STAGING|null|undefined)?$/i;

export type HsiSmeReliabilityPendingWorksheet = {
  schemaVersion: string;
  smeGoldFilled?: boolean;
  frozenHeldOut?: boolean;
  adjudicatedCases?: number;
  scientificApproval?: boolean;
  acceptedForScope?: boolean;
  signedPacketClaimed?: boolean;
  inventedSmeLabels?: boolean;
  inventedAdjudications?: boolean;
  goldCommittedInGit?: boolean;
  references: Record<string, string>;
  notes?: string;
  [key: string]: unknown;
};

export type HsiSmeReliabilityFillProposal = {
  schemaVersion: typeof HSI_SME_RELIABILITY_FILL_PROPOSAL_SCHEMA;
  smeGoldFilled: false;
  frozenHeldOut: false;
  adjudicatedCases: 0;
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSmeLabels: false;
  inventedAdjudications: false;
  goldCommittedInGit: false;
  references: {
    human_4_sme_a_ref: string;
    human_4_sme_b_ref: string;
    human_4_adjudicator_ref: string;
    human_4_private_vault_ref: string;
    human_4_adjudicated_cases_ref: string;
  };
  notes: string;
};

export type HsiSmeReliabilityFillApplyResult = {
  schemaVersion: typeof HSI_SME_RELIABILITY_FILL_APPLY_SCHEMA;
  authorization: HsiSmeReliabilityFillApplyOwnerApproval;
  dryRun: boolean;
  smeGoldFilled: false;
  frozenHeldOut: false;
  adjudicatedCases: 0;
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSmeLabels: false;
  inventedAdjudications: false;
  goldCommittedInGit: false;
  u7Next: HsiSmeReliabilityPendingWorksheet;
  e2e10Next: HsiSmeReliabilityPendingWorksheet;
  appliedReferenceKeys: readonly string[];
  notes: string;
};

function assertNonPlaceholderRef(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_REF.test(trimmed) || trimmed.length < 8) {
    throw Error(
      `SME reliability fill refused: ${name} must be a real non-placeholder ref`,
    );
  }
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(trimmed)) {
    throw Error(`SME reliability fill refused: ${name} must not use localhost`);
  }
  if (
    /invent|example\.com|placeholder|TODO|FIXME|fake.?sme|fake.?label|fake.?adjudic/i.test(
      trimmed,
    )
  ) {
    throw Error(`SME reliability fill refused: ${name} looks invented`);
  }
  return trimmed;
}

export function buildHsiSmeReliabilityFillProposal(input: {
  human4SmeARef: string;
  human4SmeBRef: string;
  human4AdjudicatorRef: string;
  human4PrivateVaultRef: string;
  human4AdjudicatedCasesRef: string;
}): HsiSmeReliabilityFillProposal {
  assertHsiSmeReliabilityFillApplySoftLand(hsiSmeReliabilityFillApplySoftLandPacket());
  assertHsi10ScientificReliabilityU7SoftLand(hsi10ScientificReliabilityU7Packet());
  return {
    schemaVersion: HSI_SME_RELIABILITY_FILL_PROPOSAL_SCHEMA,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    references: {
      human_4_sme_a_ref: assertNonPlaceholderRef(
        "human_4_sme_a_ref",
        input.human4SmeARef,
      ),
      human_4_sme_b_ref: assertNonPlaceholderRef(
        "human_4_sme_b_ref",
        input.human4SmeBRef,
      ),
      human_4_adjudicator_ref: assertNonPlaceholderRef(
        "human_4_adjudicator_ref",
        input.human4AdjudicatorRef,
      ),
      human_4_private_vault_ref: assertNonPlaceholderRef(
        "human_4_private_vault_ref",
        input.human4PrivateVaultRef,
      ),
      human_4_adjudicated_cases_ref: assertNonPlaceholderRef(
        "human_4_adjudicated_cases_ref",
        input.human4AdjudicatedCasesRef,
      ),
    },
    notes:
      "Proposal only. Owner applies Human #4 refs privately. smeGoldFilled and scientificApproval stay false until separate owner GO.",
  };
}

function assertProposalHonesty(proposal: HsiSmeReliabilityFillProposal): void {
  if (proposal.schemaVersion !== HSI_SME_RELIABILITY_FILL_PROPOSAL_SCHEMA) {
    throw Error("SME reliability fill-apply refused: unexpected proposal schema");
  }
  if (
    proposal.smeGoldFilled !== false ||
    proposal.frozenHeldOut !== false ||
    proposal.adjudicatedCases !== 0 ||
    proposal.scientificApproval !== false ||
    proposal.acceptedForScope !== false ||
    proposal.signedPacketClaimed !== false ||
    proposal.inventedSmeLabels !== false ||
    proposal.inventedAdjudications !== false ||
    proposal.goldCommittedInGit !== false
  ) {
    throw Error(
      "SME reliability fill-apply refused: proposal must keep gold, freeze, adjudications, acceptance, invented labels, and git gold closed",
    );
  }
}

function assertPendingHonesty(
  label: string,
  pending: HsiSmeReliabilityPendingWorksheet,
): void {
  if (
    pending.smeGoldFilled === true ||
    pending.frozenHeldOut === true ||
    (typeof pending.adjudicatedCases === "number" && pending.adjudicatedCases > 0) ||
    pending.scientificApproval === true ||
    pending.acceptedForScope === true ||
    pending.signedPacketClaimed === true ||
    pending.inventedSmeLabels === true ||
    pending.inventedAdjudications === true ||
    pending.goldCommittedInGit === true
  ) {
    throw Error(
      `SME reliability fill-apply refused: ${label} pending claims gold, freeze, adjudications, acceptance, invented labels, or git gold`,
    );
  }
  if (!pending.references || typeof pending.references !== "object") {
    throw Error(`SME reliability fill-apply refused: ${label} missing references object`);
  }
}

export function applyHsiSmeReliabilityFillProposal(input: {
  authorization: HsiSmeReliabilityFillApplyOwnerApproval;
  proposal: HsiSmeReliabilityFillProposal;
  u7Pending: HsiSmeReliabilityPendingWorksheet;
  e2e10Pending: HsiSmeReliabilityPendingWorksheet;
  dryRun?: boolean;
}): HsiSmeReliabilityFillApplyResult {
  assertHsiSmeReliabilityFillApplyOwnerAuthorized(input.authorization);
  assertHsiSmeReliabilityFillApplySoftLand(hsiSmeReliabilityFillApplySoftLandPacket());
  assertHsi10ScientificReliabilityU7SoftLand(hsi10ScientificReliabilityU7Packet());
  assertProposalHonesty(input.proposal);
  assertPendingHonesty("u7", input.u7Pending);
  assertPendingHonesty("e2e10", input.e2e10Pending);

  const refs = input.proposal.references;
  const mode = input.dryRun === false ? "write" : "dry-run";

  const u7Next: HsiSmeReliabilityPendingWorksheet = {
    ...input.u7Pending,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    references: {
      ...input.u7Pending.references,
      human_4_sme_a_ref: refs.human_4_sme_a_ref,
      human_4_sme_b_ref: refs.human_4_sme_b_ref,
      human_4_adjudicator_ref: refs.human_4_adjudicator_ref,
      human_4_private_vault_ref: refs.human_4_private_vault_ref,
      human_4_adjudicated_cases_ref: refs.human_4_adjudicated_cases_ref,
    },
    notes: [
      input.u7Pending.notes ?? "",
      `U48 fill-apply (${mode}): filled Human #4 SME refs; smeGoldFilled stays false; scientificApproval stays false.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  const e2e10Next: HsiSmeReliabilityPendingWorksheet = {
    ...input.e2e10Pending,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    references: {
      ...input.e2e10Pending.references,
      sme_a_ref: refs.human_4_sme_a_ref,
      sme_b_ref: refs.human_4_sme_b_ref,
      adjudicator_ref: refs.human_4_adjudicator_ref,
      private_vault_root_ref: refs.human_4_private_vault_ref,
    },
    notes: [
      input.e2e10Pending.notes ?? "",
      `U48 fill-apply (${mode}): mirrored Human #4 SME refs; gold and adjudications stay unclaimed.`,
    ]
      .filter(Boolean)
      .join(" "),
  };

  assertPendingHonesty("u7-next", u7Next);
  assertPendingHonesty("e2e10-next", e2e10Next);

  return {
    schemaVersion: HSI_SME_RELIABILITY_FILL_APPLY_SCHEMA,
    authorization: HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
    dryRun: input.dryRun !== false,
    smeGoldFilled: false,
    frozenHeldOut: false,
    adjudicatedCases: 0,
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSmeLabels: false,
    inventedAdjudications: false,
    goldCommittedInGit: false,
    u7Next,
    e2e10Next,
    appliedReferenceKeys: [
      "human_4_sme_a_ref",
      "human_4_sme_b_ref",
      "human_4_adjudicator_ref",
      "human_4_private_vault_ref",
      "human_4_adjudicated_cases_ref",
    ],
    notes:
      "Applied Human #4 refs into U7 + E2E-10 pendings. SME gold / scientific approval remain separate. Dry-run by default.",
  };
}
