/**
 * NEXT-A — source/provider/receipt composition soft-land (P0).
 *
 * Catalogues hardened adapters that must be composed under owner authorization.
 * Never invents signed clearance, provider credentials, approved deployments,
 * or redacted live receipts. Composition acceptance stays blocked.
 */

export const NEXT_A_COMPOSITION_SCHEMA =
  "hsi-next-a-composition-soft-land-1" as const;

export type NextASuiteMode = "check" | "fixture";

export type NextASurfaceId =
  | "source_clearance_receipts"
  | "operational_source_clearance"
  | "e2e03_clearance_composition"
  | "pinned_provider_transport"
  | "staging_provider_operations"
  | "dual_provider_harness"
  | "redacted_live_receipts";

export type NextASurfaceDisposition =
  | "reuse_adapter"
  | "reuse_soft_land"
  | "owner_gated_composition"
  | "blocked_until_b1_b5";

export type NextASurfaceRow = {
  surface: NextASurfaceId;
  disposition: NextASurfaceDisposition;
  liveCompositionAuthorized: false;
  scientificApproval: false;
  inventedReceipts: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextACompositionPacket = {
  schemaVersion: typeof NEXT_A_COMPOSITION_SCHEMA;
  purpose: "next_a_source_provider_receipt_composition_soft_land";
  backlogId: "NEXT-A";
  priority: "P0";
  scientificApproval: false;
  liveCompositionAuthorized: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  inventedSignedClearance: false;
  inventedProviderCredentials: false;
  inventedApprovedDeployments: false;
  inventedRedactedReceipts: false;
  dependsOnTrackB: readonly ["B1", "B5"];
  ciSafeModes: readonly NextASuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextASurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-a-composition.pending.json";
  softLandDocPath: "docs/engineering/NEXT_A_COMPOSITION_SOFT_LAND.md";
  honesty: {
    adaptersExistCompositionBlocked: true;
    noInventedReceipts: true;
    noInventedCredentials: true;
    noInventedDeployments: true;
    b1AndB5Required: true;
    fixtureIsNotLiveComposition: true;
  };
};

export type NextAAssessment = {
  schemaVersion: "hsi-next-a-assessment-1";
  suiteMode: NextASuiteMode;
  mayClaimLiveComposition: false;
  mayInventReceipts: false;
  mayInventCredentials: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  liveCompositionAuthorized: false;
};

export type NextACompositionHonesty = {
  schemaVersion: "hsi-next-a-composition-honesty-1";
  mustKeepClearanceDraftUntilB1: true;
  mustKeepProvidersUnboundUntilB5: true;
  mustNotTreatHarnessGreenAsComposition: true;
  mustRequireRedactedRealReceipts: true;
  mustKeepFaultTestsOnChosenRuntime: true;
  reasons: string[];
};

const SURFACES: readonly NextASurfaceRow[] = [
  {
    surface: "source_clearance_receipts",
    disposition: "reuse_adapter",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: ["src/researchV2/sourceClearanceReceipt.ts"],
    notes: "Signed passage/version/action/freshness/revocation boundaries; no invented receipts.",
  },
  {
    surface: "operational_source_clearance",
    disposition: "reuse_adapter",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: ["src/researchV2/operationalSourceClearance.ts"],
    notes: "Operational clearance helper over receipts; not owner-signed policy.",
  },
  {
    surface: "e2e03_clearance_composition",
    disposition: "reuse_soft_land",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: [
      "src/operations/e2e03SourceClearanceComposition.ts",
      "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md",
    ],
    notes: "Catalog of gate vs metadata surfaces; DRAFT policy stays DRAFT (B1).",
  },
  {
    surface: "pinned_provider_transport",
    disposition: "reuse_adapter",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: ["src/researchV2/pinnedProviderTransport.ts"],
    notes: "Allowlisted native transport; no arbitrary client endpoints or keys.",
  },
  {
    surface: "staging_provider_operations",
    disposition: "reuse_adapter",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: ["src/researchV2/stagingProviderOperations.ts"],
    notes: "Staging provider ops codecs/bounds; defaults disabled until B5.",
  },
  {
    surface: "dual_provider_harness",
    disposition: "reuse_soft_land",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: [
      "src/operations/e2e06DualProviderVerification.ts",
      "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md",
    ],
    notes: "Dual-model harness reuse; independence and gate pass stay false.",
  },
  {
    surface: "redacted_live_receipts",
    disposition: "blocked_until_b1_b5",
    liveCompositionAuthorized: false,
    scientificApproval: false,
    inventedReceipts: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "Redacted real receipts on the chosen runtime remain owner-gated; soft-land invents none.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Complete Track B1 (signed or explicitly deferred clearance policy) before live passage reuse.",
  "Complete Track B5 (private spend caps + two approved staging deployments) before live provider bind.",
  "Compose existing adapters only — do not rebuild clearance or transport stacks.",
  "Capture redacted real receipts and fault-test results on the actual chosen runtime.",
  "Do not treat harness green, soft-land green, or fixture receipts as NEXT-A acceptance.",
];

const REUSE_MODULES: readonly string[] = [
  "src/researchV2/sourceClearanceReceipt.ts",
  "src/researchV2/operationalSourceClearance.ts",
  "src/researchV2/pinnedProviderTransport.ts",
  "src/researchV2/stagingProviderOperations.ts",
  "src/operations/e2e03SourceClearanceComposition.ts",
  "src/operations/e2e06DualProviderVerification.ts",
  "docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md",
];

export function nextACompositionPacket(): NextACompositionPacket {
  return {
    schemaVersion: NEXT_A_COMPOSITION_SCHEMA,
    purpose: "next_a_source_provider_receipt_composition_soft_land",
    backlogId: "NEXT-A",
    priority: "P0",
    scientificApproval: false,
    liveCompositionAuthorized: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    inventedSignedClearance: false,
    inventedProviderCredentials: false,
    inventedApprovedDeployments: false,
    inventedRedactedReceipts: false,
    dependsOnTrackB: ["B1", "B5"],
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-a-composition.pending.json",
    softLandDocPath: "docs/engineering/NEXT_A_COMPOSITION_SOFT_LAND.md",
    honesty: {
      adaptersExistCompositionBlocked: true,
      noInventedReceipts: true,
      noInventedCredentials: true,
      noInventedDeployments: true,
      b1AndB5Required: true,
      fixtureIsNotLiveComposition: true,
    },
  };
}

export function nextASurfaceById(surface: NextASurfaceId): NextASurfaceRow {
  switch (surface) {
    case "source_clearance_receipts":
    case "operational_source_clearance":
    case "e2e03_clearance_composition":
    case "pinned_provider_transport":
    case "staging_provider_operations":
    case "dual_provider_harness":
    case "redacted_live_receipts": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-A surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-A surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextAMode(mode: NextASuiteMode): NextAAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-a-assessment-1",
        suiteMode: mode,
        mayClaimLiveComposition: false,
        mayInventReceipts: false,
        mayInventCredentials: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "live composition stays blocked until B1 + B5 and redacted receipts exist",
        ],
        scientificApproval: false,
        liveCompositionAuthorized: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-a-assessment-1",
        suiteMode: mode,
        mayClaimLiveComposition: false,
        mayInventReceipts: false,
        mayInventCredentials: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture clearance/provider tests use injected stubs only",
          "fixture green is not live composition acceptance on the chosen runtime",
        ],
        scientificApproval: false,
        liveCompositionAuthorized: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-A suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Composition honesty for NEXT-A soft-land. */
export function assessNextACompositionHonesty(): NextACompositionHonesty {
  return {
    schemaVersion: "hsi-next-a-composition-honesty-1",
    mustKeepClearanceDraftUntilB1: true,
    mustKeepProvidersUnboundUntilB5: true,
    mustNotTreatHarnessGreenAsComposition: true,
    mustRequireRedactedRealReceipts: true,
    mustKeepFaultTestsOnChosenRuntime: true,
    reasons: [
      "Hardened adapters exist; live composition is a separate owner-gated acceptance",
      "B1 clearance signature/deferral is required before passage reuse",
      "B5 private caps and two approved deployments are required before provider bind",
      "Unit/fixture success is not redacted live receipt evidence",
      "Fault tests must pass on the actual chosen runtime, not only CI fixtures",
    ],
  };
}

export function assertNextACompositionSoftLand(
  packet: NextACompositionPacket,
): {
  surfaceCount: number;
  liveCompositionAuthorized: false;
  acceptedForScope: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== NEXT_A_COMPOSITION_SCHEMA) {
    throw new Error("unexpected NEXT-A composition schema");
  }
  if (packet.backlogId !== "NEXT-A" || packet.priority !== "P0") {
    throw new Error("soft-land must bind NEXT-A at P0");
  }
  if (packet.liveCompositionAuthorized !== false) {
    throw new Error("soft-land must keep liveCompositionAuthorized false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (
    packet.inventedSignedClearance !== false ||
    packet.inventedProviderCredentials !== false ||
    packet.inventedApprovedDeployments !== false ||
    packet.inventedRedactedReceipts !== false
  ) {
    throw new Error("soft-land must not invent clearance, credentials, deployments, or receipts");
  }
  if (packet.dependsOnTrackB.length !== 2 || packet.dependsOnTrackB[0] !== "B1" || packet.dependsOnTrackB[1] !== "B5") {
    throw new Error("soft-land must depend on Track B1 and B5");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-A surfaces");
  for (const surface of packet.surfaces) {
    if (surface.liveCompositionAuthorized !== false) {
      throw new Error(`surface ${surface.surface} must keep live composition unauthorized`);
    }
    if (surface.inventedReceipts !== false || surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must keep invented receipts and approval false`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    liveCompositionAuthorized: false,
    acceptedForScope: false,
    scientificApproval: false,
  };
}
