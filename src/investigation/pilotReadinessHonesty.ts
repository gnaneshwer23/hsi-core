/**
 * Pilot readiness honesty — audit §I first-researcher pilot prep.
 * Surfaces device-local §H milestones vs owner-gated blockers.
 * Never claims pilot ready, conversion, or journey complete.
 * Browser-safe (no Node-only imports).
 */

export const PILOT_READINESS_SCHEMA = "hsi-pilot-readiness-honesty-1" as const;

export type PilotLocalSignalId =
  | "activation"
  | "first_useful"
  | "repeat_reopen"
  | "willingness_stated";

export type PilotBlockedGateId =
  | "staging_grants"
  | "write_scope_packet"
  | "source_clearance"
  | "sme_gold"
  | "sharing_step_12"
  | "live_rereview_step_13"
  | "production_writes";

/** done = recorded · open = readable and not recorded · unknown = storage unreadable */
export type PilotSignalState = "done" | "open" | "unknown";

export type PilotReadinessHonesty = {
  browserLocalOnly: true;
  productionWritesEnabled: false;
  inventsPilotReady: false;
  inventsPilotConversion: false;
  inventsAggregateConversion: false;
  journeyCompleteClaimed: false;
  scientificApproval: false;
  localSignalsOnly: true;
};

export const PILOT_READINESS_HONESTY: PilotReadinessHonesty = {
  browserLocalOnly: true,
  productionWritesEnabled: false,
  inventsPilotReady: false,
  inventsPilotConversion: false,
  inventsAggregateConversion: false,
  journeyCompleteClaimed: false,
  scientificApproval: false,
  localSignalsOnly: true,
};

export type PilotLocalSignal = {
  id: PilotLocalSignalId;
  label: string;
  state: PilotSignalState;
  detail: string;
};

export type PilotBlockedGate = {
  id: PilotBlockedGateId;
  label: string;
  blocked: true;
  detail: string;
};

export type PilotReadinessInput = {
  /** False when localStorage is unavailable — all signals become unknown. */
  storageAvailable: boolean;
  activation: PilotSignalState;
  firstUseful: PilotSignalState;
  repeatReopen: PilotSignalState;
  willingness: PilotSignalState;
};

export type PilotReadinessChecklist = {
  schemaVersion: typeof PILOT_READINESS_SCHEMA;
  honesty: PilotReadinessHonesty;
  localSignals: readonly PilotLocalSignal[];
  blockedGates: readonly PilotBlockedGate[];
  localDoneCount: number;
  localKnownCount: number;
  localTotalCount: number;
  allLocalSignalsDone: boolean;
  storageAvailable: boolean;
  pilotReadyClaimed: false;
  note: string;
};

export function assertPilotReadinessHonesty(
  honesty: PilotReadinessHonesty,
): PilotReadinessHonesty {
  if (honesty.browserLocalOnly !== true) throw Error("browserLocalOnly must be true");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsPilotReady !== false) throw Error("inventsPilotReady must be false");
  if (honesty.inventsPilotConversion !== false) {
    throw Error("inventsPilotConversion must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.localSignalsOnly !== true) throw Error("localSignalsOnly must be true");
  return honesty;
}

const BLOCKED_GATES: readonly PilotBlockedGate[] = [
  {
    id: "staging_grants",
    label: "Staging researcher grants",
    blocked: true,
    detail: "Owner must issue staging grants before a real pilot cohort.",
  },
  {
    id: "write_scope_packet",
    label: "Write-scope / journey owner packet",
    blocked: true,
    detail: "Human #5 write enablement packet — production writes stay off.",
  },
  {
    id: "source_clearance",
    label: "Source clearance authority",
    blocked: true,
    detail: "Human #2 rights authority for permitted corpora — not invented here.",
  },
  {
    id: "sme_gold",
    label: "SME gold / adjudication",
    blocked: true,
    detail: "Human #4 scientific acceptance track — harness without gold.",
  },
  {
    id: "sharing_step_12",
    label: "Share with collaborator (step 12)",
    blocked: true,
    detail: "Org sharing remains blocked until agreements exist.",
  },
  {
    id: "live_rereview_step_13",
    label: "Versioned re-evaluation (step 13)",
    blocked: true,
    detail: "Live corpus refresh / re-review remains unaccepted.",
  },
  {
    id: "production_writes",
    label: "Production writes",
    blocked: true,
    detail: "writesEnabled stays false — fail-closed by design.",
  },
];

function resolveState(
  storageAvailable: boolean,
  state: PilotSignalState,
): PilotSignalState {
  if (!storageAvailable) return "unknown";
  return state;
}

function signalDetail(
  id: PilotLocalSignalId,
  state: PilotSignalState,
): { label: string; detail: string } {
  switch (id) {
    case "activation":
      return {
        label: "Activation",
        detail:
          state === "done"
            ? "First live investigation recorded on this device"
            : state === "unknown"
              ? "Browser storage unavailable — activation state unknown"
              : "Run a live investigation once",
      };
    case "first_useful":
      return {
        label: "First useful",
        detail:
          state === "done"
            ? "Useful rating present in feedback or milestone store"
            : state === "unknown"
              ? "Browser storage unavailable — usefulness state unknown"
              : "Rate an investigation as Useful after the brief",
      };
    case "repeat_reopen":
      return {
        label: "Repeat reopen",
        detail:
          state === "done"
            ? "First browser reopen recorded on this device"
            : state === "unknown"
              ? "Browser storage unavailable — reopen state unknown"
              : "Save and reopen a browser-library investigation",
      };
    case "willingness_stated":
      return {
        label: "Willingness stated",
        detail:
          state === "done"
            ? "Yes/No/Maybe present in feedback or milestone store"
            : state === "unknown"
              ? "Browser storage unavailable — willingness state unknown"
              : "State Yes / No / Maybe after a brief (optional)",
      };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

/** Build pilot prep honesty — local signals ≠ pilot ready. */
export function buildPilotReadinessChecklist(
  input: PilotReadinessInput,
): PilotReadinessChecklist {
  const honesty = assertPilotReadinessHonesty(PILOT_READINESS_HONESTY);
  const ids: PilotLocalSignalId[] = [
    "activation",
    "first_useful",
    "repeat_reopen",
    "willingness_stated",
  ];
  const states: Record<PilotLocalSignalId, PilotSignalState> = {
    activation: resolveState(input.storageAvailable, input.activation),
    first_useful: resolveState(input.storageAvailable, input.firstUseful),
    repeat_reopen: resolveState(input.storageAvailable, input.repeatReopen),
    willingness_stated: resolveState(input.storageAvailable, input.willingness),
  };
  const localSignals: PilotLocalSignal[] = ids.map((id) => {
    const state = states[id];
    const meta = signalDetail(id, state);
    return { id, label: meta.label, state, detail: meta.detail };
  });
  const localDoneCount = localSignals.filter((s) => s.state === "done").length;
  const localKnownCount = localSignals.filter((s) => s.state !== "unknown").length;
  const localTotalCount = localSignals.length;
  const unknownCount = localTotalCount - localKnownCount;
  const allLocalSignalsDone =
    localKnownCount === localTotalCount && localDoneCount === localTotalCount;
  let note: string;
  if (!input.storageAvailable || unknownCount === localTotalCount) {
    note =
      "Browser storage unavailable — local pilot-prep progress unknown. Pilot ready claimed: false.";
  } else if (unknownCount > 0) {
    note = `Local pilot-prep signals ${localDoneCount} done · ${localKnownCount} readable of ${localTotalCount} — ${unknownCount} unknown; not pilot ready.`;
  } else if (allLocalSignalsDone) {
    note = `All ${localTotalCount} local pilot-prep signals done on this device — pilot ready claimed: false (owner gates still blocked).`;
  } else {
    note = `Local pilot-prep signals ${localDoneCount}/${localTotalCount} — not pilot conversion and not pilot ready.`;
  }
  return {
    schemaVersion: PILOT_READINESS_SCHEMA,
    honesty,
    localSignals,
    blockedGates: BLOCKED_GATES,
    localDoneCount,
    localKnownCount,
    localTotalCount,
    allLocalSignalsDone,
    storageAvailable: input.storageAvailable,
    pilotReadyClaimed: false,
    note,
  };
}

/** Prefer milestone store; fall back to usefulness feedback so a saved rating still counts. */
export function deriveFirstUsefulState(input: {
  milestoneReached: boolean;
  feedbackHasUseful: boolean;
}): PilotSignalState {
  return input.milestoneReached || input.feedbackHasUseful ? "done" : "open";
}

/** Prefer milestone store; fall back to usefulness feedback willingness. */
export function deriveWillingnessState(input: {
  milestoneReached: boolean;
  feedbackHasWillingness: boolean;
}): PilotSignalState {
  return input.milestoneReached || input.feedbackHasWillingness ? "done" : "open";
}
