/**
 * NEXT-G — controlled domain/source increment soft-land (P2).
 *
 * Catalogues expansion, source-pack, failure-ledger, planner, and community
 * surfaces for one controlled domain increment. Never invents source packs,
 * scoped reviewers, planner enablement, community launch, or clinical/PHI.
 */

export const NEXT_G_DOMAIN_INCREMENT_SCHEMA =
  "hsi-next-g-domain-increment-soft-land-1" as const;

export type NextGSuiteMode = "check" | "fixture";

export type NextGSurfaceId =
  | "controlled_expansion_candidate"
  | "source_pack_and_scoped_reviewers"
  | "source_refresh_rereview"
  | "observed_failure_ledger"
  | "optional_planner_comparison"
  | "community_moderation_gate"
  | "clinical_phi_boundary";

export type NextGSurfaceDisposition =
  | "reuse_adapter"
  | "reuse_soft_land"
  | "owner_gated_increment"
  | "blocked_until_p1_c_and_failure_ledger"
  | "always_deferred";

export type NextGSurfaceRow = {
  surface: NextGSurfaceId;
  disposition: NextGSurfaceDisposition;
  domainIncrementAccepted: false;
  plannerEnabled: false;
  communityLaunched: false;
  clinicalPhiEnabled: false;
  scientificApproval: false;
  pathHints: readonly string[];
  notes: string;
};

export type NextGDomainIncrementPacket = {
  schemaVersion: typeof NEXT_G_DOMAIN_INCREMENT_SCHEMA;
  purpose: "next_g_domain_increment_soft_land";
  backlogId: "NEXT-G";
  priority: "P2";
  scientificApproval: false;
  domainIncrementAccepted: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  plannerEnabled: false;
  communityLaunched: false;
  clinicalPhiEnabled: false;
  inventedSourcePacks: false;
  inventedScopedReviewers: false;
  inventedFailureLedgerClose: false;
  dependsOn: readonly ["NEXT-C"];
  alsoRequires: "independently_closed_observed_failure_ledger";
  ciSafeModes: readonly NextGSuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly NextGSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/next-g-domain-increment.pending.json";
  softLandDocPath: "docs/engineering/NEXT_G_DOMAIN_INCREMENT_SOFT_LAND.md";
  honesty: {
    adaptersExistIncrementBlocked: true;
    noInventedSourcePacks: true;
    noInventedScopedReviewers: true;
    plannerStaysDeterministicByDefault: true;
    communityDeferredUntilModerationOwnership: true;
    clinicalPhiRemainsSeparate: true;
    fixtureIsNotDomainIncrement: true;
  };
};

export type NextGAssessment = {
  schemaVersion: "hsi-next-g-assessment-1";
  suiteMode: NextGSuiteMode;
  mayClaimDomainIncrement: false;
  mayEnablePlanner: false;
  mayLaunchCommunity: false;
  mayEnableClinicalPhi: false;
  mayInventSourcePacks: false;
  mayClaimScientificApproval: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  domainIncrementAccepted: false;
};

export type NextGIncrementHonesty = {
  schemaVersion: "hsi-next-g-increment-honesty-1";
  mustRequireP1CAcceptance: true;
  mustCloseObservedFailureLedgerIndependently: true;
  mustBindCurrentSourcePacksAndScopedReviewers: true;
  mustPropagateSourceRefreshRereview: true;
  mustKeepPlannerDeterministicUnlessPreregistered: true;
  mustKeepClinicalPhiSeparate: true;
  reasons: string[];
};

const SURFACES: readonly NextGSurfaceRow[] = [
  {
    surface: "controlled_expansion_candidate",
    disposition: "reuse_adapter",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["src/expansion/controlledExpansion.ts"],
    notes: "P2 expansion candidate prep only; no provider/community/clinical activation.",
  },
  {
    surface: "source_pack_and_scoped_reviewers",
    disposition: "reuse_adapter",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["src/evidence/r1BiomedicalSourcePackets.ts"],
    notes: "Current source packs and explicit scoped reviewers required; never invent packs/IDs.",
  },
  {
    surface: "source_refresh_rereview",
    disposition: "reuse_adapter",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["src/expansion/rereviewOutcomeGuard.ts"],
    notes: "Source-refresh must propagate re-review; prior approvals do not transfer.",
  },
  {
    surface: "observed_failure_ledger",
    disposition: "blocked_until_p1_c_and_failure_ledger",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["docs/audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md"],
    notes: "Independently closed complete observed-failure ledger required before increment.",
  },
  {
    surface: "optional_planner_comparison",
    disposition: "reuse_soft_land",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: [
      "src/expansion/plannerComparison.ts",
      "src/operations/e2e11HypothesisIntelligence.ts",
    ],
    notes: "Planner stays deterministic unless a preregistered equal-evidence/cap comparison passes.",
  },
  {
    surface: "community_moderation_gate",
    disposition: "always_deferred",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["src/expansion/controlledExpansion.ts"],
    notes: "Optional community only after actual moderation ownership/delivery.",
  },
  {
    surface: "clinical_phi_boundary",
    disposition: "always_deferred",
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    scientificApproval: false,
    pathHints: ["docs/CDS_PHI_BOUNDARY.md", "src/cdsPhiBoundary.ts"],
    notes: "Clinical/PHI remains a separate plane; never enabled from NEXT-G soft-land.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Accept NEXT-C (P1-C) and independently close the complete observed-failure ledger first.",
  "Bind current source packs and explicit disease/tenant-scoped reviewers without inventing them.",
  "Propagate source-refresh re-review; do not transfer prior approvals.",
  "Keep planner deterministic unless a preregistered equal-evidence/equal-cap comparison passes.",
  "Defer community until moderation ownership/delivery exists; keep clinical/PHI separate.",
];

const REUSE_MODULES: readonly string[] = [
  "src/expansion/controlledExpansion.ts",
  "src/expansion/plannerComparison.ts",
  "src/expansion/rereviewOutcomeGuard.ts",
  "src/evidence/r1BiomedicalSourcePackets.ts",
  "src/operations/e2e11HypothesisIntelligence.ts",
  "docs/engineering/E2E_11_HYPOTHESIS_INTELLIGENCE_SOFT_LAND.md",
  "docs/CDS_PHI_BOUNDARY.md",
];

export function nextGDomainIncrementPacket(): NextGDomainIncrementPacket {
  return {
    schemaVersion: NEXT_G_DOMAIN_INCREMENT_SCHEMA,
    purpose: "next_g_domain_increment_soft_land",
    backlogId: "NEXT-G",
    priority: "P2",
    scientificApproval: false,
    domainIncrementAccepted: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
    inventedSourcePacks: false,
    inventedScopedReviewers: false,
    inventedFailureLedgerClose: false,
    dependsOn: ["NEXT-C"],
    alsoRequires: "independently_closed_observed_failure_ledger",
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/next-g-domain-increment.pending.json",
    softLandDocPath: "docs/engineering/NEXT_G_DOMAIN_INCREMENT_SOFT_LAND.md",
    honesty: {
      adaptersExistIncrementBlocked: true,
      noInventedSourcePacks: true,
      noInventedScopedReviewers: true,
      plannerStaysDeterministicByDefault: true,
      communityDeferredUntilModerationOwnership: true,
      clinicalPhiRemainsSeparate: true,
      fixtureIsNotDomainIncrement: true,
    },
  };
}

export function nextGSurfaceById(surface: NextGSurfaceId): NextGSurfaceRow {
  switch (surface) {
    case "controlled_expansion_candidate":
    case "source_pack_and_scoped_reviewers":
    case "source_refresh_rereview":
    case "observed_failure_ledger":
    case "optional_planner_comparison":
    case "community_moderation_gate":
    case "clinical_phi_boundary": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing NEXT-G surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown NEXT-G surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessNextGMode(mode: NextGSuiteMode): NextGAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-next-g-assessment-1",
        suiteMode: mode,
        mayClaimDomainIncrement: false,
        mayEnablePlanner: false,
        mayLaunchCommunity: false,
        mayEnableClinicalPhi: false,
        mayInventSourcePacks: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "domain increment stays blocked until NEXT-C acceptance and closed failure ledger",
        ],
        scientificApproval: false,
        domainIncrementAccepted: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-next-g-assessment-1",
        suiteMode: mode,
        mayClaimDomainIncrement: false,
        mayEnablePlanner: false,
        mayLaunchCommunity: false,
        mayEnableClinicalPhi: false,
        mayInventSourcePacks: false,
        mayClaimScientificApproval: false,
        ciSafe: true,
        reasons: [
          "fixture expansion/planner tests never launch community or enable PHI",
          "fixture green is not a controlled domain/source increment acceptance",
        ],
        scientificApproval: false,
        domainIncrementAccepted: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown NEXT-G suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Domain-increment honesty for NEXT-G soft-land. */
export function assessNextGIncrementHonesty(): NextGIncrementHonesty {
  return {
    schemaVersion: "hsi-next-g-increment-honesty-1",
    mustRequireP1CAcceptance: true,
    mustCloseObservedFailureLedgerIndependently: true,
    mustBindCurrentSourcePacksAndScopedReviewers: true,
    mustPropagateSourceRefreshRereview: true,
    mustKeepPlannerDeterministicUnlessPreregistered: true,
    mustKeepClinicalPhiSeparate: true,
    reasons: [
      "NEXT-C / P1-C acceptance is a prerequisite for a controlled domain increment",
      "The observed-failure ledger must be independently closed and complete",
      "Current source packs and scoped reviewers must be bound without invention",
      "Source-refresh must propagate re-review without transferring prior approvals",
      "Planner remains deterministic unless a preregistered equal-evidence/cap study passes",
      "Clinical/PHI stays on a separate plane and is never enabled here",
    ],
  };
}

export function assertNextGDomainIncrementSoftLand(
  packet: NextGDomainIncrementPacket,
): {
  surfaceCount: number;
  domainIncrementAccepted: false;
  plannerEnabled: false;
  communityLaunched: false;
  clinicalPhiEnabled: false;
} {
  if (packet.schemaVersion !== NEXT_G_DOMAIN_INCREMENT_SCHEMA) {
    throw new Error("unexpected NEXT-G domain-increment schema");
  }
  if (packet.backlogId !== "NEXT-G" || packet.priority !== "P2") {
    throw new Error("soft-land must bind NEXT-G at P2");
  }
  if (packet.domainIncrementAccepted !== false) {
    throw new Error("soft-land must keep domainIncrementAccepted false");
  }
  if (
    packet.plannerEnabled !== false ||
    packet.communityLaunched !== false ||
    packet.clinicalPhiEnabled !== false
  ) {
    throw new Error("soft-land must keep planner/community/PHI disabled");
  }
  if (packet.scientificApproval !== false || packet.acceptedForScope !== false) {
    throw new Error("soft-land must not claim scientific approval or acceptance");
  }
  if (packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim signed packet");
  }
  if (
    packet.inventedSourcePacks !== false ||
    packet.inventedScopedReviewers !== false ||
    packet.inventedFailureLedgerClose !== false
  ) {
    throw new Error("soft-land must not invent packs, reviewers, or ledger close");
  }
  if (packet.dependsOn.length !== 1 || packet.dependsOn[0] !== "NEXT-C") {
    throw new Error("soft-land must depend on NEXT-C");
  }
  if (packet.alsoRequires !== "independently_closed_observed_failure_ledger") {
    throw new Error("soft-land must require independently closed failure ledger");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven NEXT-G surfaces");
  for (const surface of packet.surfaces) {
    if (surface.domainIncrementAccepted !== false || surface.plannerEnabled !== false) {
      throw new Error(`surface ${surface.surface} must keep increment/planner false`);
    }
    if (
      surface.communityLaunched !== false ||
      surface.clinicalPhiEnabled !== false ||
      surface.scientificApproval !== false
    ) {
      throw new Error(`surface ${surface.surface} must keep community/PHI/approval false`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    domainIncrementAccepted: false,
    plannerEnabled: false,
    communityLaunched: false,
    clinicalPhiEnabled: false,
  };
}
