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
  done: boolean;
  detail: string;
};

export type PilotBlockedGate = {
  id: PilotBlockedGateId;
  label: string;
  blocked: true;
  detail: string;
};

export type PilotReadinessInput = {
  activationReached: boolean;
  firstUsefulReached: boolean;
  repeatReopenReached: boolean;
  willingnessStated: boolean;
};

export type PilotReadinessChecklist = {
  schemaVersion: typeof PILOT_READINESS_SCHEMA;
  honesty: PilotReadinessHonesty;
  localSignals: readonly PilotLocalSignal[];
  blockedGates: readonly PilotBlockedGate[];
  localDoneCount: number;
  localTotalCount: number;
  allLocalSignalsDone: boolean;
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

/** Build pilot prep honesty — local signals ≠ pilot ready. */
export function buildPilotReadinessChecklist(
  input: PilotReadinessInput,
): PilotReadinessChecklist {
  const honesty = assertPilotReadinessHonesty(PILOT_READINESS_HONESTY);
  const localSignals: PilotLocalSignal[] = [
    {
      id: "activation",
      label: "Activation",
      done: input.activationReached,
      detail: input.activationReached
        ? "First live investigation recorded on this device"
        : "Run a live investigation once",
    },
    {
      id: "first_useful",
      label: "First useful",
      done: input.firstUsefulReached,
      detail: input.firstUsefulReached
        ? "First Useful rating recorded on this device"
        : "Rate an investigation as Useful after the brief",
    },
    {
      id: "repeat_reopen",
      label: "Repeat reopen",
      done: input.repeatReopenReached,
      detail: input.repeatReopenReached
        ? "First browser reopen recorded on this device"
        : "Save and reopen a browser-library investigation",
    },
    {
      id: "willingness_stated",
      label: "Willingness stated",
      done: input.willingnessStated,
      detail: input.willingnessStated
        ? "First Yes/No/Maybe willingness signal recorded locally"
        : "State Yes / No / Maybe after a brief (optional)",
    },
  ];
  const localDoneCount = localSignals.filter((s) => s.done).length;
  const localTotalCount = localSignals.length;
  const allLocalSignalsDone = localDoneCount === localTotalCount;
  return {
    schemaVersion: PILOT_READINESS_SCHEMA,
    honesty,
    localSignals,
    blockedGates: BLOCKED_GATES,
    localDoneCount,
    localTotalCount,
    allLocalSignalsDone,
    pilotReadyClaimed: false,
    note: allLocalSignalsDone
      ? `All ${localTotalCount} local pilot-prep signals done on this device — pilot ready claimed: false (owner gates still blocked).`
      : `Local pilot-prep signals ${localDoneCount}/${localTotalCount} — not pilot conversion and not pilot ready.`,
  };
}
