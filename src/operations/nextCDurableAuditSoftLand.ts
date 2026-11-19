/**
 * NEXT-C — durable audit storage + audit-hash scoped review soft-land (P1).
 *
 * Catalogues protected delivery, attachments, review, and archive adapters for
 * one saved/exported journey. Never invents live acceptance, primary-domain
 * packs, or graph promotion. Blocked until NEXT-A/B acceptance exists.
 */

export const NEXT_C_DURABLE_AUDIT_SCHEMA =
  "hsi-next-c-durable-audit-soft-land-1" as const;

export type NextCSuiteMode = "check" | "fixture";

export type NextCSurfaceId =
  | "investigation_delivery"
  | "bound_outcome_attachments"
  | "authenticated_scientific_review"
  | "immutable_review_decisions"
  | "context_audit_archive"
  | "rereview_outcome_guard"
  | "ssc_ra_sle_saved_journey";

export type NextCSurfaceDisposition =
  | "reuse_adapter"
  | "reuse_contract"
  | "owner_gated_live"
  | "blocked_until_next_a_b";

export type NextCSurfaceRow = {
  surface: NextCSurfaceId;
  disposition: NextCSurfaceDisposition;
  liveJourneyAccepted: false;
  scientificApproval: false;
  graphPromotion: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextCDurableAuditPacket = {
  schemaVersion: typeof NEXT_C_DURABLE_AUDIT_SCHEMA;
  purpose: "next_c_durable_audit_soft_land";
  backlogId: "NEXT-C";
  priority: "P1";
  scientificApproval: false;
  liveJourneyAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  graphPromotion: false;
  legacyBriefTransfersApproval: false;
  inventedPrimaryDomainPacks: false;
  inventedAuditHashes: false;
  dependsOn: readonly ["NEXT-A", "NEXT-B"];
  ciSafeModes: readonly NextCSuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextCSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-c-durable-audit.pending.json";
  softLandDocPath: "docs/engineering/NEXT_C_DURABLE_AUDIT_SOFT_LAND.md";
  honesty: {
    adaptersExistJourneyBlocked: true;
    noLegacyBriefTransfer: true;
    noInventedAuditHashes: true;
    noGraphPromotion: true;
    nextAAndBRequired: true;
    fixtureIsNotLiveJourney: true;
  };
};

export type NextCAssessment = {
  schemaVersion: "hsi-next-c-assessment-1";
  suiteMode: NextCSuiteMode;
  mayClaimLiveJourney: false;
  mayTransferLegacyBriefApproval: false;
  mayPromoteToGraph: false;
  mayInventAuditHashes: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  liveJourneyAccepted: false;
};

export type NextCAuditHonesty = {
  schemaVersion: "hsi-next-c-audit-honesty-1";
  mustKeepImmutableAuditHashDecisions: true;
  mustRetainFailuresAndEmptySearches: true;
  mustDenyLegacyBriefTransfer: true;
  mustKeepGraphPromotionSeparate: true;
  mustRequireNextAAndBFirst: true;
  reasons: string[];
};

const SURFACES: readonly NextCSurfaceRow[] = [
  {
    surface: "investigation_delivery",
    disposition: "reuse_adapter",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: [
      "src/server/investigationDeliveryService.ts",
      "src/db/investigationDeliveryStore.ts",
    ],
    notes: "Protected delivery/resume hooks; not a full accepted live journey.",
  },
  {
    surface: "bound_outcome_attachments",
    disposition: "reuse_adapter",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: ["src/server/boundOutcomeAttachments.ts"],
    notes: "Bound attachments for saved outcomes; scope-bound, not graph promotion.",
  },
  {
    surface: "authenticated_scientific_review",
    disposition: "reuse_adapter",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: ["src/db/authenticatedScientificReviewStore.ts"],
    notes: "Authenticated review store for immutable submissions; live grants still owner-gated.",
  },
  {
    surface: "immutable_review_decisions",
    disposition: "reuse_contract",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: ["src/interrogativeScientificReview.ts"],
    notes: "Immutable human scientific-review decision contract; self-review denied.",
  },
  {
    surface: "context_audit_archive",
    disposition: "reuse_adapter",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: [
      "src/server/contextAuditArchiveService.ts",
      "src/db/contextAuditArchiveStore.ts",
    ],
    notes: "Context-audit archive service/store; not scientific acceptance.",
  },
  {
    surface: "rereview_outcome_guard",
    disposition: "reuse_contract",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: ["src/expansion/rereviewOutcomeGuard.ts"],
    notes: "Re-review does not restore rights or transfer prior approvals.",
  },
  {
    surface: "ssc_ra_sle_saved_journey",
    disposition: "blocked_until_next_a_b",
    liveJourneyAccepted: false,
    scientificApproval: false,
    graphPromotion: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "One SSc+RA/SLE saved/exported journey waits on NEXT-A/B acceptance + domain packs.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept NEXT-A (clearance/provider/receipt composition) and NEXT-B (isolation) for a named staging scope first.",
  "Bind explicit primary-domain source packs/roles (SSc primary with RA/SLE comparison) without inventing packs.",
  "Run one immutable investigation version from cleared retrieval through independent review to reopen/export.",
  "Retain failures and empty searches; never transfer legacy brief approval to a later audit.",
  "Keep graph publication as a separate human gate after review.",
];

const REUSE_MODULES: readonly string[] = [
  "src/server/investigationDeliveryService.ts",
  "src/server/boundOutcomeAttachments.ts",
  "src/db/authenticatedScientificReviewStore.ts",
  "src/interrogativeScientificReview.ts",
  "src/server/contextAuditArchiveService.ts",
  "src/expansion/rereviewOutcomeGuard.ts",
  "docs/engineering/NEXT_A_COMPOSITION_SOFT_LAND.md",
  "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md",
];

export function nextCDurableAuditPacket(): NextCDurableAuditPacket {
  return {
    schemaVersion: NEXT_C_DURABLE_AUDIT_SCHEMA,
    purpose: "next_c_durable_audit_soft_land",
    backlogId: "NEXT-C",
    priority: "P1",
    scientificApproval: false,
    liveJourneyAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    graphPromotion: false,
    legacyBriefTransfersApproval: false,
    inventedPrimaryDomainPacks: false,
    inventedAuditHashes: false,
    dependsOn: ["NEXT-A", "NEXT-B"],
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-c-durable-audit.pending.json",
    softLandDocPath: "docs/engineering/NEXT_C_DURABLE_AUDIT_SOFT_LAND.md",
    honesty: {
      adaptersExistJourneyBlocked: true,
      noLegacyBriefTransfer: true,
      noInventedAuditHashes: true,
      noGraphPromotion: true,
      nextAAndBRequired: true,
      fixtureIsNotLiveJourney: true,
    },
  };
}

export function nextCSurfaceById(surface: NextCSurfaceId): NextCSurfaceRow {
  switch (surface) {
    case "investigation_delivery":
    case "bound_outcome_attachments":
    case "authenticated_scientific_review":
    case "immutable_review_decisions":
    case "context_audit_archive":
    case "rereview_outcome_guard":
    case "ssc_ra_sle_saved_journey": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-C surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-C surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextCMode(mode: NextCSuiteMode): NextCAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-c-assessment-1",
        suiteMode: mode,
        mayClaimLiveJourney: false,
        mayTransferLegacyBriefApproval: false,
        mayPromoteToGraph: false,
        mayInventAuditHashes: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "live saved/exported journey stays blocked until NEXT-A/B acceptance",
        ],
        scientificApproval: false,
        liveJourneyAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-c-assessment-1",
        suiteMode: mode,
        mayClaimLiveJourney: false,
        mayTransferLegacyBriefApproval: false,
        mayPromoteToGraph: false,
        mayInventAuditHashes: false,
        ciSafe: true,
        reasons: [
          "fixture delivery/review tests use synthetic stores only",
          "fixture green is not an accepted SSc+RA/SLE live journey",
        ],
        scientificApproval: false,
        liveJourneyAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-C suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Durable-audit honesty for NEXT-C soft-land. */
export function assessNextCAuditHonesty(): NextCAuditHonesty {
  return {
    schemaVersion: "hsi-next-c-audit-honesty-1",
    mustKeepImmutableAuditHashDecisions: true,
    mustRetainFailuresAndEmptySearches: true,
    mustDenyLegacyBriefTransfer: true,
    mustKeepGraphPromotionSeparate: true,
    mustRequireNextAAndBFirst: true,
    reasons: [
      "Independent review decisions must bind immutable audit hashes",
      "Failures and empty searches must be retained in the saved version",
      "Legacy evidence-brief acceptance never approves a later audit",
      "Graph publication remains a separate human gate",
      "NEXT-A and NEXT-B acceptance are prerequisites for the live journey",
    ],
  };
}

export function assertNextCDurableAuditSoftLand(
  packet: NextCDurableAuditPacket,
): {
  surfaceCount: number;
  liveJourneyAccepted: false;
  graphPromotion: false;
  acceptedForScope: false;
} {
  if (packet.schemaVersion !== NEXT_C_DURABLE_AUDIT_SCHEMA) {
    throw new Error("unexpected NEXT-C durable-audit schema");
  }
  if (packet.backlogId !== "NEXT-C" || packet.priority !== "P1") {
    throw new Error("soft-land must bind NEXT-C at P1");
  }
  if (packet.liveJourneyAccepted !== false) {
    throw new Error("soft-land must keep liveJourneyAccepted false");
  }
  if (packet.graphPromotion !== false || packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim graph promotion or scientific approval");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.legacyBriefTransfersApproval !== false) {
    throw new Error("soft-land must deny legacy brief transfer of approval");
  }
  if (packet.inventedPrimaryDomainPacks !== false || packet.inventedAuditHashes !== false) {
    throw new Error("soft-land must not invent domain packs or audit hashes");
  }
  if (
    packet.dependsOn.length !== 2 ||
    packet.dependsOn[0] !== "NEXT-A" ||
    packet.dependsOn[1] !== "NEXT-B"
  ) {
    throw new Error("soft-land must depend on NEXT-A and NEXT-B");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-C surfaces");
  for (const surface of packet.surfaces) {
    if (surface.liveJourneyAccepted !== false || surface.graphPromotion !== false) {
      throw new Error(`surface ${surface.surface} must keep journey/promotion false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    liveJourneyAccepted: false,
    graphPromotion: false,
    acceptedForScope: false,
  };
}
