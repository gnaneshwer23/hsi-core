/**
 * Journey steps 12–13 honesty — share + versioned re-evaluation remain blocked.
 * Surfaces what is unavailable without inventing org sharing, collaborator links,
 * or live source-refresh re-review. Browser reopen of the same briefHash is the
 * available continuity path. Browser-safe (no Node-only imports).
 */

export const BLOCKED_JOURNEY_STEPS_SCHEMA = "hsi-blocked-journey-steps-1" as const;

export type BlockedJourneyStepId = "share_collaborator" | "versioned_reevaluation";

export type BlockedJourneyStepsHonesty = {
  orgSharingEnabled: false;
  collaboratorLinksEnabled: false;
  liveSourceRefreshAccepted: false;
  priorApprovalsTransfer: false;
  inventsSharingAuthority: false;
  productionWritesEnabled: false;
  scientificApproval: false;
  journeyCompleteClaimed: false;
};

export const BLOCKED_JOURNEY_STEPS_HONESTY: BlockedJourneyStepsHonesty = {
  orgSharingEnabled: false,
  collaboratorLinksEnabled: false,
  liveSourceRefreshAccepted: false,
  priorApprovalsTransfer: false,
  inventsSharingAuthority: false,
  productionWritesEnabled: false,
  scientificApproval: false,
  journeyCompleteClaimed: false,
};

export type BlockedJourneyStepView = {
  id: BlockedJourneyStepId;
  stepNumber: 12 | 13;
  title: string;
  status: "blocked";
  whyBlocked: string;
  availableInstead: string;
  authorityNeeded: string;
};

export type BlockedJourneyStepsPack = {
  schemaVersion: typeof BLOCKED_JOURNEY_STEPS_SCHEMA;
  honesty: BlockedJourneyStepsHonesty;
  steps: readonly BlockedJourneyStepView[];
  browserReopenAvailable: boolean;
  libraryCount: number;
  briefHash: string | null;
  note: string;
};

export function assertBlockedJourneyStepsHonesty(
  honesty: BlockedJourneyStepsHonesty,
): BlockedJourneyStepsHonesty {
  if (honesty.orgSharingEnabled !== false) throw Error("orgSharingEnabled must be false");
  if (honesty.collaboratorLinksEnabled !== false) {
    throw Error("collaboratorLinksEnabled must be false");
  }
  if (honesty.liveSourceRefreshAccepted !== false) {
    throw Error("liveSourceRefreshAccepted must be false");
  }
  if (honesty.priorApprovalsTransfer !== false) {
    throw Error("priorApprovalsTransfer must be false");
  }
  if (honesty.inventsSharingAuthority !== false) {
    throw Error("inventsSharingAuthority must be false");
  }
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  return honesty;
}

/** Build fail-closed views for journey steps 12–13. */
export function buildBlockedJourneySteps(input: {
  briefHash: string | null;
  libraryCount: number;
  reopenedThisSession: boolean;
}): BlockedJourneyStepsPack {
  const honesty = assertBlockedJourneyStepsHonesty(BLOCKED_JOURNEY_STEPS_HONESTY);
  const briefHash = input.briefHash?.trim() || null;
  const browserReopenAvailable = input.libraryCount > 0 || input.reopenedThisSession;

  const steps: BlockedJourneyStepView[] = [
    {
      id: "share_collaborator",
      stepNumber: 12,
      title: "Share with a collaborator",
      status: "blocked",
      whyBlocked:
        "Org membership, collaborator share links, and research-group RBAC are not approved. Held community/org stores stay closed.",
      availableInstead:
        "Keep the investigation in this browser library. Hand a briefHash/export offline only under your own data rights — HSI does not create a share link.",
      authorityNeeded:
        "Approved sharing authority + tenant agreements (audit Stage 4) before any collaborator surface.",
    },
    {
      id: "versioned_reevaluation",
      stepNumber: 13,
      title: "Versioned re-evaluation",
      status: "blocked",
      whyBlocked:
        "Live source-refresh re-review is not journey-accepted. Prior approvals must not transfer across refreshed artifacts.",
      availableInstead: browserReopenAvailable
        ? "Reopen the same briefHash version from this browser library. That restores the saved run — it is not a live corpus refresh."
        : "Save to the browser library first, then reopen the same briefHash version. Live corpus re-review remains blocked.",
      authorityNeeded:
        "Source re-review authority + accepted refresh packet before live versioned re-evaluation.",
    },
  ];

  return {
    schemaVersion: BLOCKED_JOURNEY_STEPS_SCHEMA,
    honesty,
    steps,
    browserReopenAvailable,
    libraryCount: input.libraryCount,
    briefHash,
    note: "Steps 12–13 stay optional/blocked until sharing and re-review authorities exist. Stage 2 exit covers steps 1–11 only.",
  };
}
