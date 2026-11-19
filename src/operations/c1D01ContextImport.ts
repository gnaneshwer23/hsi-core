/**
 * Track C1 — D-01 context completion import/apply soft-land.
 *
 * Catalogues sealed-sheet export, CSV merge, apply overlay, and honesty gates.
 * Never invents curator proposed values, never promotes edges, never raises
 * reviewStatus or scientificClaimAllowed. Empty proposals leave the graph unchanged.
 */

export const C1_CONTEXT_IMPORT_SCHEMA =
  "hsi-c1-d01-context-import-1" as const;

export type C1SuiteMode = "check" | "fixture";

export type C1ImportSurfaceId =
  | "sealed_completion_sheet"
  | "csv_merge_proposals"
  | "apply_overlay_cli"
  | "fill_progress_ui"
  | "edge_review_candidate_list"
  | "empty_proposal_refuse"
  | "post_apply_unreviewed_honesty";

export type C1SurfaceDisposition =
  | "reuse_sheet"
  | "reuse_cli"
  | "reuse_ui"
  | "blocked_until_curator_fill"
  | "honesty_required";

export type C1ImportSurfaceRow = {
  surface: C1ImportSurfaceId;
  disposition: C1SurfaceDisposition;
  graphPromotion: false;
  scientificApproval: false;
  autoPromotion: false;
  pathHints: readonly string[];
  notes: string;
};

export type C1D01ContextImportPacket = {
  schemaVersion: typeof C1_CONTEXT_IMPORT_SCHEMA;
  purpose: "track_c1_d01_context_import_soft_land";
  backlogId: "C1";
  slice: "D-01";
  scientificApproval: false;
  autoPromotion: false;
  graphPromotion: false;
  inventedCuratorProposals: false;
  acceptedForScope: false;
  signedPacketClaimed: false;
  /** Sealed sheet currently has zero proposed fills; soft-land does not invent them. */
  sealedProposedFillCountClaimed: 0;
  ciSafeModes: readonly C1SuiteMode[];
  reuseModules: readonly string[];
  surfaces: readonly C1ImportSurfaceRow[];
  ownerPreconditions: readonly string[];
  pendingWorksheetPath: "operations/staging/c1-d01-context-import.pending.json";
  softLandDocPath: "docs/engineering/C1_D01_CONTEXT_IMPORT_SOFT_LAND.md";
  honesty: {
    emptyProposalsLeaveGraphUnchanged: true;
    applyKeepsUnreviewed: true;
    applyKeepsScientificClaimFalse: true;
    applyKeepsConfidenceNotCalibrated: true;
    noInventedCuratorFills: true;
    fixtureIsNotGraphRelease: true;
  };
};

export type C1ImportAssessment = {
  schemaVersion: "hsi-c1-assessment-1";
  suiteMode: C1SuiteMode;
  mayInventCuratorProposals: false;
  mayPromoteEdges: false;
  mayClaimScientificApproval: false;
  mayClaimGraphRelease: false;
  ciSafe: true;
  reasons: string[];
  scientificApproval: false;
  graphPromotion: false;
};

export type C1ApplyHonesty = {
  schemaVersion: "hsi-c1-apply-honesty-1";
  mustRefusePromotionFlags: true;
  mustKeepReviewStatusUnreviewed: true;
  mustKeepScientificClaimAllowedFalse: true;
  mustKeepConfidenceNotCalibrated: true;
  mustLeaveGraphUnchangedWhenNoProposals: true;
  reasons: string[];
};

const SURFACES: readonly C1ImportSurfaceRow[] = [
  {
    surface: "sealed_completion_sheet",
    disposition: "reuse_sheet",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: [
      "src/knowledgeGraph/contextCompletionSheet.ts",
      "research/domain-graph/context-completions.v1.json",
    ],
    notes: "Sealed digest sheet mappedAgainst published graph; proposed fields start null.",
  },
  {
    surface: "csv_merge_proposals",
    disposition: "reuse_cli",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["scripts/context-completion-sheet.ts", "docs/plans/D01_CONTEXT_COMPLETION_SHEET.md"],
    notes: "context-sheet:merge-csv reseals proposals; never auto-promotes.",
  },
  {
    surface: "apply_overlay_cli",
    disposition: "reuse_cli",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["scripts/context-completion-sheet.ts", "src/knowledgeGraph/contextCompletionSheet.ts"],
    notes: "context-sheet:apply overlays tissue/population/design only; refuses promotion flags.",
  },
  {
    surface: "fill_progress_ui",
    disposition: "reuse_ui",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["site/src/pages/ContextCompletionStatus.tsx", "src/knowledgeGraph/contextCompletionProgress.ts"],
    notes: "Read-only fill progress; does not apply or promote.",
  },
  {
    surface: "edge_review_candidate_list",
    disposition: "reuse_sheet",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["src/knowledgeGraph/d01EdgeReview.ts", "docs/plans/D01_EDGE_REVIEW_QUEUE.md"],
    notes: "C2 queue reads the same sealed sheet; recommendations ≠ approvals.",
  },
  {
    surface: "empty_proposal_refuse",
    disposition: "blocked_until_curator_fill",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["scripts/context-completion-sheet.ts"],
    notes: "With zero proposed fills, apply reports applied:0 and leaves graph unchanged.",
  },
  {
    surface: "post_apply_unreviewed_honesty",
    disposition: "honesty_required",
    graphPromotion: false,
    scientificApproval: false,
    autoPromotion: false,
    pathHints: ["src/knowledgeGraph/contextCompletionSheet.ts"],
    notes: "After any apply, reviewStatus=unreviewed, confidence=not_calibrated, scientificClaimAllowed=false.",
  },
];

const OWNER_PRECONDITIONS: readonly string[] = [
  "Curators fill proposed tissue/population/design (or not_reported) on the sealed D-01 sheet.",
  "Merge filled CSV via context-sheet:merge-csv; re-validate digest against published graph version.",
  "Run context-sheet:apply only as an opt-in overlay; confirm edges stay unreviewed.",
  "Do not treat soft-land green or empty-sheet validate as graph release or scientific approval.",
  "Dual-reviewer release remains Track C3; local C2 recommendations are not promotions.",
];

const REUSE_MODULES: readonly string[] = [
  "src/knowledgeGraph/contextCompletionSheet.ts",
  "src/knowledgeGraph/contextCompletionProgress.ts",
  "src/knowledgeGraph/d01EdgeReview.ts",
  "scripts/context-completion-sheet.ts",
  "docs/plans/D01_CONTEXT_COMPLETION_SHEET.md",
];

export function c1D01ContextImportPacket(): C1D01ContextImportPacket {
  return {
    schemaVersion: C1_CONTEXT_IMPORT_SCHEMA,
    purpose: "track_c1_d01_context_import_soft_land",
    backlogId: "C1",
    slice: "D-01",
    scientificApproval: false,
    autoPromotion: false,
    graphPromotion: false,
    inventedCuratorProposals: false,
    acceptedForScope: false,
    signedPacketClaimed: false,
    sealedProposedFillCountClaimed: 0,
    ciSafeModes: ["check", "fixture"],
    reuseModules: REUSE_MODULES,
    surfaces: SURFACES,
    ownerPreconditions: OWNER_PRECONDITIONS,
    pendingWorksheetPath: "operations/staging/c1-d01-context-import.pending.json",
    softLandDocPath: "docs/engineering/C1_D01_CONTEXT_IMPORT_SOFT_LAND.md",
    honesty: {
      emptyProposalsLeaveGraphUnchanged: true,
      applyKeepsUnreviewed: true,
      applyKeepsScientificClaimFalse: true,
      applyKeepsConfidenceNotCalibrated: true,
      noInventedCuratorFills: true,
      fixtureIsNotGraphRelease: true,
    },
  };
}

export function c1ImportSurfaceById(surface: C1ImportSurfaceId): C1ImportSurfaceRow {
  switch (surface) {
    case "sealed_completion_sheet":
    case "csv_merge_proposals":
    case "apply_overlay_cli":
    case "fill_progress_ui":
    case "edge_review_candidate_list":
    case "empty_proposal_refuse":
    case "post_apply_unreviewed_honesty": {
      const row = SURFACES.find((s) => s.surface === surface);
      if (!row) throw new Error(`Missing C1 import surface: ${surface}`);
      return row;
    }
    default: {
      const _exhaustive: never = surface;
      throw new Error(`Unknown C1 import surface: ${String(_exhaustive)}`);
    }
  }
}

export function assessC1ImportMode(mode: C1SuiteMode): C1ImportAssessment {
  switch (mode) {
    case "check":
      return {
        schemaVersion: "hsi-c1-assessment-1",
        suiteMode: mode,
        mayInventCuratorProposals: false,
        mayPromoteEdges: false,
        mayClaimScientificApproval: false,
        mayClaimGraphRelease: false,
        ciSafe: true,
        reasons: [
          "check mode validates catalog honesty only",
          "sealed sheet proposed fills remain curator-owned; soft-land invents none",
        ],
        scientificApproval: false,
        graphPromotion: false,
      };
    case "fixture":
      return {
        schemaVersion: "hsi-c1-assessment-1",
        suiteMode: mode,
        mayInventCuratorProposals: false,
        mayPromoteEdges: false,
        mayClaimScientificApproval: false,
        mayClaimGraphRelease: false,
        ciSafe: true,
        reasons: [
          "fixture apply/merge tests must keep unreviewed and scientificClaimAllowed false",
          "fixture green is not dual-reviewer graph release (Track C3)",
        ],
        scientificApproval: false,
        graphPromotion: false,
      };
    default: {
      const _exhaustive: never = mode;
      throw new Error(`Unknown C1 suite mode: ${String(_exhaustive)}`);
    }
  }
}

/** Apply-path honesty for Track C1 soft-land. */
export function assessC1ApplyHonesty(): C1ApplyHonesty {
  return {
    schemaVersion: "hsi-c1-apply-honesty-1",
    mustRefusePromotionFlags: true,
    mustKeepReviewStatusUnreviewed: true,
    mustKeepScientificClaimAllowedFalse: true,
    mustKeepConfidenceNotCalibrated: true,
    mustLeaveGraphUnchangedWhenNoProposals: true,
    reasons: [
      "context-sheet:apply exits with applied:0 when every proposed field is null",
      "applyContextCompletions forces reviewStatus=unreviewed after overlay",
      "scientificClaimAllowed stays false and confidence stays not_calibrated",
      "CLI refuses if promotion or review flags would change",
      "Filling proposals is curator work; soft-land never invents them",
    ],
  };
}

export function assertC1D01ContextImportSoftLand(
  packet: C1D01ContextImportPacket,
): {
  surfaceCount: number;
  graphPromotion: false;
  sealedProposedFillCountClaimed: 0;
  scientificApproval: false;
} {
  if (packet.schemaVersion !== C1_CONTEXT_IMPORT_SCHEMA) {
    throw new Error("unexpected C1 context-import schema");
  }
  if (packet.backlogId !== "C1" || packet.slice !== "D-01") {
    throw new Error("soft-land must bind Track C1 / D-01");
  }
  if (packet.graphPromotion !== false || packet.autoPromotion !== false) {
    throw new Error("soft-land must keep graphPromotion and autoPromotion false");
  }
  if (packet.scientificApproval !== false) {
    throw new Error("soft-land must not claim scientific approval");
  }
  if (packet.inventedCuratorProposals !== false) {
    throw new Error("soft-land must not invent curator proposals");
  }
  if (packet.sealedProposedFillCountClaimed !== 0) {
    throw new Error("soft-land must not claim sealed proposed fills exist");
  }
  if (packet.acceptedForScope !== false || packet.signedPacketClaimed !== false) {
    throw new Error("soft-land must not claim acceptance or signed packet");
  }
  if (packet.surfaces.length !== 7) throw new Error("expected seven C1 import surfaces");
  for (const surface of packet.surfaces) {
    if (surface.graphPromotion !== false || surface.autoPromotion !== false) {
      throw new Error(`surface ${surface.surface} must keep promotion false`);
    }
    if (surface.scientificApproval !== false) {
      throw new Error(`surface ${surface.surface} must not claim scientific approval`);
    }
  }
  return {
    surfaceCount: packet.surfaces.length,
    graphPromotion: false,
    sealedProposedFillCountClaimed: 0,
    scientificApproval: false,
  };
}
