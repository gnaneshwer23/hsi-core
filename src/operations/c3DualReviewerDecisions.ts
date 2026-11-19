/**
 * Track C3 — dual-reviewer decisions soft-land (40–60 edges).
 *
 * Catalogues the gap between C2 device-local recommendations and immutable
 * dual-reviewer release records. Never invents reviewer identities, never
 * marks edges reviewed, never promotes the graph. Target range is a human
 * authoring goal, not an engineering fill claim.
 */

export const C3_DUAL_REVIEWER_SCHEMA =
  "hsi-c3-dual-reviewer-decisions-1" as const;

export type C3SuiteMode = "check" | "fixture";

export type C3DualSurfaceId =
  | "c2_local_recommendations"
  | "recommendation_digest_chain"
  | "dual_independent_reviewers"
  | "immutable_decision_records"
  | "target_band_40_60"
  | "reviewed_lane_reserved"
  | "graph_version_bump_blocked";

export type C3SurfaceDisposition =
  | "reuse_c2"
  | "owner_human_review"
  | "blocked_until_dual"
  | "honesty_required";

export type C3DualSurfaceRow = {
  surface: C3DualSurfaceId;
  disposition: C3SurfaceDisposition;
  graphPromotion: false;
  scientificApproval: false;
  dualReviewComplete: false;
  pathHints: readonly string[];
  notes: string;
};

export type C3DualReviewerPacket = {
  schemaVersion: typeof C3_DUAL_REVIEWER_SCHEMA;
  purpose: "track_c3_dual_reviewer_decisions_soft_land";
  backlogId: "C3";
  slice: "D-01";
  scientificApproval: false;
  graphPromotion: false;
  autoPromotion: false;
  dualReviewComplete: false;
  inventedReviewerIdentities: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  dualReviewedEdgeCount: 0;
  targetEdgeFloor: 40;
  targetEdgeCeiling: 60;
  ciSafeModes: readonly C3SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly C3DualSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/c3-dual-reviewer-decisions.pending.json";
  softLandDocPath: "docs/engineering/C3_DUAL_REVIEWER_DECISIONS_SOFT_LAND.md";
  honesty: {
    c2IsNotDualRelease: true;
    noInventedReviewers: true;
    noInventedDecisions: true;
    reviewedLaneReserved: true;
    versionBumpBlockedUntilDual: true;
    fixtureIsNotRelease: true;
  };
};

export type C3DualAssessment = {
  schemaVersion: "hsi-c3-assessment-1";
  suiteMode: C3SuiteMode;
  mayInventReviewers: false;
  mayClaimDualReviewComplete: false;
  mayPromoteEdges: false;
  mayBumpGraphVersionForReview: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  dualReviewComplete: false;
};

export type C3DualReleaseHonesty = {
  schemaVersion: "hsi-c3-dual-release-honesty-1";
  mustRequireTwoIndependentReviewers: true;
  mustKeepSelfReviewDenied: true;
  mustKeepC2RecommendationsUnverified: true;
  mustKeepReviewedLaneEmptyUntilDual: true;
  mustNotInventDecisionRecords: true;
  reasons: string[];
};

const SURFACES: readonly C3DualSurfaceRow[] = [
  {
    surface: "c2_local_recommendations",
    disposition: "reuse_c2",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["src/knowledgeGraph/d01EdgeReview.ts", "docs/plans/D01_EDGE_REVIEW_QUEUE.md"],
    notes: "Device-local accept/reject/revise/insufficient; reviewerVerified=false; not dual release.",
  },
  {
    surface: "recommendation_digest_chain",
    disposition: "reuse_c2",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["src/knowledgeGraph/d01EdgeReview.ts"],
    notes: "Local digest-chained revisions exist; still curator_recommendation_unverified.",
  },
  {
    surface: "dual_independent_reviewers",
    disposition: "owner_human_review",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md"],
    notes: "Two independent human reviewers required; soft-land never invents identities.",
  },
  {
    surface: "immutable_decision_records",
    disposition: "blocked_until_dual",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["src/knowledgeGraph/d01EdgeReview.ts"],
    notes: "Immutable dual records are the C3 exit; count stays 0 until real dual decisions exist.",
  },
  {
    surface: "target_band_40_60",
    disposition: "owner_human_review",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md"],
    notes: "40–60 dual-reviewed edges is a human target, not an engineering fill claim.",
  },
  {
    surface: "reviewed_lane_reserved",
    disposition: "honesty_required",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["src/knowledgeGraph/edgeReviewPresentation.ts"],
    notes: "C4 presentation reserves reviewed stroke; published graph stays candidate_unreviewed.",
  },
  {
    surface: "graph_version_bump_blocked",
    disposition: "blocked_until_dual",
    graphPromotion: false,
    scientificApproval: false,
    dualReviewComplete: false,
    pathHints: ["src/knowledgeGraph/edgeReviewPresentation.ts", "docs/plans/HSI_NEXT_GITHUB_BUILD_PLAN_2026-11-17.md"],
    notes: "C4 version bump waits on dual review; soft-land never bumps for invented reviews.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Name two independent reviewers (Track B3); never invent identities in git.",
  "Deny self-review; each edge needs two independent decisions before release.",
  "Treat C2 local recommendations as unverified inputs only — not dual records.",
  "Grow dual-reviewed D-01 edges toward the 40–60 band without inventing decisions.",
  "Keep reviewed presentation lane empty and graph version unbumped until dual records exist.",
];

const REUSE_MODULES: readonly string[] = [
  "src/knowledgeGraph/d01EdgeReview.ts",
  "src/knowledgeGraph/edgeReviewPresentation.ts",
  "docs/plans/D01_EDGE_REVIEW_QUEUE.md",
  "docs/plans/D01_CONTEXT_COMPLETION_SHEET.md",
];

export function c3DualReviewerDecisionsPacket(): C3DualReviewerPacket {
  return {
    schemaVersion: C3_DUAL_REVIEWER_SCHEMA,
    purpose: "track_c3_dual_reviewer_decisions_soft_land",
    backlogId: "C3",
    slice: "D-01",
    scientificApproval: false,
    graphPromotion: false,
    autoPromotion: false,
    dualReviewComplete: false,
    inventedReviewerIdentities: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    dualReviewedEdgeCount: 0,
    targetEdgeFloor: 40,
    targetEdgeCeiling: 60,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/c3-dual-reviewer-decisions.pending.json",
    softLandDocPath: "docs/engineering/C3_DUAL_REVIEWER_DECISIONS_SOFT_LAND.md",
    honesty: {
      c2IsNotDualRelease: true,
      noInventedReviewers: true,
      noInventedDecisions: true,
      reviewedLaneReserved: true,
      versionBumpBlockedUntilDual: true,
      fixtureIsNotRelease: true,
    },
  };
}

export function c3DualSurfaceById(surface: C3DualSurfaceId): C3DualSurfaceRow {
  switch (surface) {
    case "c2_local_recommendations":
    case "recommendation_digest_chain":
    case "dual_independent_reviewers":
    case "immutable_decision_records":
    case "target_band_40_60":
    case "reviewed_lane_reserved":
    case "graph_version_bump_blocked": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing C3 dual surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown C3 dual surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessC3DualMode(mode: C3SuiteMode): C3DualAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-c3-assessment-1",
        suiteMode: mode,
        mayInventReviewers: false,
        mayClaimDualReviewComplete: false,
        mayPromoteEdges: false,
        mayBumpGraphVersionForReview: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "dualReviewedEdgeCount remains 0 until independent humans record decisions",
        ],
        scientificApproval: false,
        dualReviewComplete: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-c3-assessment-1",
        suiteMode: mode,
        mayInventReviewers: false,
        mayClaimDualReviewComplete: false,
        mayPromoteEdges: false,
        mayBumpGraphVersionForReview: false,
        ciSafe: true,
        reasons: [
          "fixture C2 recommendation tests use unverified local labels only",
          "fixture green is not dual-reviewer release or graph version bump",
        ],
        scientificApproval: false,
        dualReviewComplete: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown C3 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Dual-release honesty for Track C3 soft-land. */
export function assessC3DualReleaseHonesty(): C3DualReleaseHonesty {
  return {
    schemaVersion: "hsi-c3-dual-release-honesty-1",
    mustRequireTwoIndependentReviewers: true,
    mustKeepSelfReviewDenied: true,
    mustKeepC2RecommendationsUnverified: true,
    mustKeepReviewedLaneEmptyUntilDual: true,
    mustNotInventDecisionRecords: true,
    reasons: [
      "C2 exports are curator recommendations with reviewerVerified=false",
      "Dual release needs two independent humans; self-review is denied",
      "Published graph presentation keeps every edge candidate_unreviewed",
      "40–60 is a human target; soft-land claims zero dual-reviewed edges",
      "Graph version bump for reviewed release waits on real dual records",
    ],
  };
}

export function assertC3DualReviewerSoftLand(
  packet: C3DualReviewerPacket,
): {
  surfaceCount: number;
  dualReviewedEdgeCount: 0;
  dualReviewComplete: false;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== C3_DUAL_REVIEWER_SCHEMA) {
    throw new Error("unexpected C3 dual-reviewer schema");
  }
  if (packet.backlogId !== "C3" || packet.slice !== "D-01") {
    throw new Error("soft-land must bind Track C3 / D-01");
  }
  if (packet.dualReviewComplete !== false || packet.dualReviewedEdgeCount !== 0) {
    throw new Error("soft-land must keep dual review incomplete with zero edges");
  }
  if (packet.targetEdgeFloor !== 40 || packet.targetEdgeCeiling !== 60) {
    throw new Error("soft-land must preserve the 40–60 human target band");
  }
  if (packet.graphPromotion !== false || packet.autoPromotion !== false) {
    throw new Error("soft-land must keep promotion false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.inventedReviewerIdentities !== false) {
    throw new Error("soft-land must not invent reviewer identities");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven C3 dual surfaces");
  for (const surface of packet.surfaces) {
    if (surface.dualReviewComplete !== false) {
      throw new Error(`surface ${surface.surface} must keep dualReviewComplete false`);
    }
    if (surface.graphPromotion !== false || surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must keep promotion/approval false`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    dualReviewedEdgeCount: 0,
    dualReviewComplete: false,
    scientificApproval: false,
  };
}
