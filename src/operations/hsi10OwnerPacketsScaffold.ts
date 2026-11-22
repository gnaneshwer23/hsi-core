/**
 * HSI 1.0 — U6 owner-packets scaffold (Human #2 / #3 / #5).
 *
 * Bundles existing clearance, isolation, and staging-persistence soft-lands into
 * one owner-facing checklist. Never invents signers, staging hosts, MoUs, or
 * migration hold removals. Never claims acceptance or enables production writes.
 */

export const HSI_10_OWNER_PACKETS_SCHEMA =
  "hsi-1-0-owner-packets-scaffold-1" as const;

export type Hsi10OwnerPacketId =
  | "human_2_source_clearance"
  | "human_3_isolation_review"
  | "human_5_staging_persistence";

export type Hsi10OwnerPacketRow = {
  packet: Hsi10OwnerPacketId;
  humanGate: 2 | 3 | 5;
  checklistItem: 2 | 5 | 6;
  disposition: "owner_gated";
  engineeringReady: boolean;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  inventedSigner: false;
  pathHints: readonly string[];
  ownerChecklist: readonly string[];
  notes: string;
};

export type Hsi10OwnerPacketsSuiteMode = "check" | "fixture";

export type Hsi10OwnerPacketsPacket = {
  schemaVersion: typeof HSI_10_OWNER_PACKETS_SCHEMA;
  purpose: "hsi_1_0_owner_packets_u6_scaffold";
  backlogId: "HSI-1.0-OWNER-PACKETS-U6";
  humanGates: readonly [2, 3, 5];
  scientificApproval: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  gateCAutoApprove: false;
  inventedSigner: false;
  inventedStagingUrl: false;
  inventedMoU: false;
  migrationHoldsChanged: false;
  ciSafeModes: readonly Hsi10OwnerPacketsSuiteMode[];
  packets: readonly Hsi10OwnerPacketRow[];
  reuseModules: readonly string[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/hsi-10-owner-packets.pending.json";
  softLandDocPath: "docs/engineering/HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md";
  acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md";
  honesty: {
    catalogsExistAcceptanceBlocked: true;
    noInventedSigner: true;
    noInventedStagingUrl: true;
    noInventedMoU: true;
    noHoldRemoval: true;
    noProductionWrites: true;
    noGateCAutoApprove: true;
    fixtureIsNotOwnerAcceptance: true;
  };
};

export type Hsi10OwnerPacketsAssessment = {
  schemaVersion: "hsi-1-0-owner-packets-assessment-1";
  suiteMode: Hsi10OwnerPacketsSuiteMode;
  mayClaimHuman2Closed: false;
  mayClaimHuman3Closed: false;
  mayClaimHuman5Closed: false;
  mayEnableProductionWrites: false;
  mayInventSigner: false;
  mayLiftMigrationHolds: false;
  ciSafe: true;
  reasons: string[];
  acceptedForScope: false;
};

const PACKETS: readonly Hsi10OwnerPacketRow[] = [
  {
    packet: "human_2_source_clearance",
    humanGate: 2,
    checklistItem: 2,
    disposition: "owner_gated",
    engineeringReady: true,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    pathHints: [
      "src/operations/e2e03SourceClearanceComposition.ts",
      "operations/staging/e2e-03-source-clearance.pending.json",
      "src/researchV2/clearancePolicy.ts",
      "src/researchV2/clearanceAuthority.ts",
      "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md",
    ],
    ownerChecklist: [
      "Name policy approver and clearance authority privately (do not invent in git).",
      "Sign or explicitly defer SOURCE_CLEARANCE_POLICY_DRAFT; keep draft status honest.",
      "Provision a managed signer outside this repository.",
      "Authorize live passage retrieval for one scoped surface only after signature.",
      "Keep sourceClearanceVerified:false on public UI until live rights exist.",
    ],
    notes:
      "Checklist #2. Engineering composition + honesty labels exist; signed clearance / live passage rights remain owner-gated.",
  },
  {
    packet: "human_3_isolation_review",
    humanGate: 3,
    checklistItem: 6,
    disposition: "owner_gated",
    engineeringReady: true,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    pathHints: [
      "src/operations/nextBIsolationSoftLand.ts",
      "src/operations/e2eIsolationAcceptancePacket.ts",
      "operations/staging/next-b-isolation-soft-land.pending.json",
      "operations/staging/e2e-02-isolation-acceptance.pending.json",
      "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md",
    ],
    ownerChecklist: [
      "Name Human #3 isolation signer privately — never invent accounts in git.",
      "Run two-user staging HTTP isolation against disposable HSI Neon only.",
      "Retain redacted HTTP evidence digests + failure inventory for checklist #6.",
      "Do not treat fixture green or catalog completeness as security acceptance.",
      "Keep community writes deferred until Track B / isolation packet says otherwise.",
    ],
    notes:
      "Checklist #6. Isolation catalogs and probes exist; two-user staging HTTP proof needs Human #3.",
  },
  {
    packet: "human_5_staging_persistence",
    humanGate: 5,
    checklistItem: 5,
    disposition: "owner_gated",
    engineeringReady: true,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    inventedSigner: false,
    pathHints: [
      "src/operations/e2e05StagingSaveResume.ts",
      "operations/staging/e2e-05-staging-save-resume.pending.json",
      "src/db/migrationHolds.ts",
      "docs/engineering/E2E_05_STAGING_SAVE_RESUME_SOFT_LAND.md",
    ],
    ownerChecklist: [
      "Approve a disposable HSI staging target privately — never invent hosts in git.",
      "Fill Human #5 write packet refs only after real grant evidence exists.",
      "Keep held migrations 022–033 closed unless explicitly authorised for that scope.",
      "Prove save/reopen under grant; device-local remains default until then.",
      "Do not set productionWritesEnabled=true from this scaffold.",
    ],
    notes:
      "Checklist #5. Device-local library is default; durable staging save stays Human #5 / E2E-05.",
  },
];

const REUSE_MODULES: readonly string[] = [
  "src/operations/e2e03SourceClearanceComposition.ts",
  "src/operations/nextBIsolationSoftLand.ts",
  "src/operations/e2eIsolationAcceptancePacket.ts",
  "src/operations/e2e05StagingSaveResume.ts",
  "src/operations/hsi10OwnerGatesWorksheet.ts",
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Close Human #2 with a signed (or explicitly deferred) clearance policy and managed signer — never invent MoUs or authorities in git.",
  "Name Human #3 isolation signer and retain two-user staging HTTP evidence for checklist #6.",
  "Close Human #5 staging write packet on disposable HSI Neon without inventing hosts or lifting holds without scope.",
  "Update operations/staging pending refs only with real private evidence identifiers.",
  "Keep productionWritesEnabled false and Gate C auto-approve forbidden until owner packets say otherwise.",
];

export function hsi10OwnerPacketsPacket(): Hsi10OwnerPacketsPacket {
  return {
    schemaVersion: HSI_10_OWNER_PACKETS_SCHEMA,
    purpose: "hsi_1_0_owner_packets_u6_scaffold",
    backlogId: "HSI-1.0-OWNER-PACKETS-U6",
    humanGates: [2, 3, 5],
    scientificApproval: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    gateCAutoApprove: false,
    inventedSigner: false,
    inventedStagingUrl: false,
    inventedMoU: false,
    migrationHoldsChanged: false,
    ciSafeModes: ["check", "fixture"],
    packets: PACKETS,
    reuseModules: REUSE_MODULES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/hsi-10-owner-packets.pending.json",
    softLandDocPath: "docs/engineering/HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md",
    acceptanceStatusDocPath: "docs/engineering/HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md",
    honesty: {
      catalogsExistAcceptanceBlocked: true,
      noInventedSigner: true,
      noInventedStagingUrl: true,
      noInventedMoU: true,
      noHoldRemoval: true,
      noProductionWrites: true,
      noGateCAutoApprove: true,
      fixtureIsNotOwnerAcceptance: true,
    },
  };
}

export function hsi10OwnerPacketById(packet: Hsi10OwnerPacketId): Hsi10OwnerPacketRow {
  switch (packet) {
    case "human_2_source_clearance":
    case "human_3_isolation_review":
    case "human_5_staging_persistence": {
      const row = PACKETS.find((p) => p.packet === packet);
      if (!row) throw new Error(`Missing HSI 1.0 owner packet: ${packet}`);
      return row;
    }
    default: {
      const _exhaustive: never = packet;
      throw new Error(`Unknown HSI 1.0 owner packet: ${String(_exhaustive)}`);
    }
  }
}

export function assessHsi10OwnerPacketsMode(
  mode: Hsi10OwnerPacketsSuiteMode,
): Hsi10OwnerPacketsAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-1-0-owner-packets-assessment-1",
        suiteMode: mode,
        mayClaimHuman2Closed: false,
        mayClaimHuman3Closed: false,
        mayClaimHuman5Closed: false,
        mayEnableProductionWrites: false,
        mayInventSigner: false,
        mayLiftMigrationHolds: false,
        ciSafe: true,
        reasons: [
          "check mode validates U6 scaffold honesty only",
          "Human #2/#3/#5 stay owner-gated",
          "migrations 022–033 remain held",
        ],
        acceptedForScope: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-1-0-owner-packets-assessment-1",
        suiteMode: mode,
        mayClaimHuman2Closed: false,
        mayClaimHuman3Closed: false,
        mayClaimHuman5Closed: false,
        mayEnableProductionWrites: false,
        mayInventSigner: false,
        mayLiftMigrationHolds: false,
        ciSafe: true,
        reasons: [
          "fixture green reuses existing clearance/isolation/staging soft-land tests only",
          "fixture green is not signed clearance, isolation review, or staging persistence",
        ],
        acceptedForScope: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown HSI 1.0 owner-packets suite mode: ${String(_exhaustive)}`);
    }
  }
}

export function assertHsi10OwnerPacketsScaffold(packet: Hsi10OwnerPacketsPacket): {
  packetCount: number;
  acceptedForScope: false;
  signedPacketClaimed: false;
  productionWritesEnabled: false;
  migrationHoldsChanged: false;
} {
  if (packet.schemaVersion !== HSI_10_OWNER_PACKETS_SCHEMA) {
    throw new Error("unexpected HSI 1.0 owner-packets schema");
  }
  if (packet.backlogId !== "HSI-1.0-OWNER-PACKETS-U6") {
    throw new Error("soft-land must bind HSI-1.0-OWNER-PACKETS-U6");
  }
  if (
    packet.acceptedForScope !== false ||
    packet.signedPacketClaimed !== false ||
    packet.scientificApproval !== false
  ) {
    throw new Error("soft-land must keep acceptance claims false");
  }
  if (packet.productionWritesEnabled !== false || packet.gateCAutoApprove !== false) {
    throw new Error("soft-land must keep writes and Gate C auto-approve false");
  }
  if (
    packet.inventedSigner !== false ||
    packet.inventedStagingUrl !== false ||
    packet.inventedMoU !== false ||
    packet.migrationHoldsChanged !== false
  ) {
    throw new Error("soft-land must not invent signer, staging URL, MoU, or hold removals");
  }
  if (packet.packets.length !== 3) {
    throw new Error("expected three U6 owner packets (Human #2/#3/#5)");
  }
  if (
    packet.humanGates[0] !== 2 ||
    packet.humanGates[1] !== 3 ||
    packet.humanGates[2] !== 5
  ) {
    throw new Error("U6 humanGates must be [2, 3, 5]");
  }
  for (const row of packet.packets) {
    if (
      row.acceptedForScope !== false ||
      row.signedPacketClaimed !== false ||
      row.productionWritesEnabled !== false ||
      row.inventedSigner !== false
    ) {
      throw new Error(`packet ${row.packet} must keep acceptance and invent flags false`);
    }
    if (row.ownerChecklist.length < 3) {
      throw new Error(`packet ${row.packet} must ship an owner checklist`);
    }
  }
  return {
    packetCount: packet.packets.length,
    acceptedForScope: false,
    signedPacketClaimed: false,
    productionWritesEnabled: false,
    migrationHoldsChanged: false,
  };
}
