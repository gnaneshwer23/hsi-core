/**
 * Stage 2 investigation-completion checklist (audit §H product metric).
 * Tracks local progress through the scientific journey for one briefHash.
 * Never claims journeyCompleteClaimed=true — even when every item is done.
 * Browser-safe (no Node-only imports).
 */

export const STAGE2_COMPLETION_SCHEMA = "hsi-stage2-completion-checklist-1" as const;

export type Stage2ChecklistItemId =
  | "ask_run"
  | "evidence"
  | "passport_or_disagreement"
  | "gaps_or_testable"
  | "brief"
  | "save_or_reopen"
  | "usefulness";

export type Stage2ChecklistItem = {
  id: Stage2ChecklistItemId;
  label: string;
  done: boolean;
  detail: string;
};

export type Stage2CompletionHonesty = {
  journeyCompleteClaimed: false;
  scientificApproval: false;
  productionWritesEnabled: false;
  inventsAggregateConversion: false;
  pilotAccepted: false;
  localProgressOnly: true;
};

export const STAGE2_COMPLETION_HONESTY: Stage2CompletionHonesty = {
  journeyCompleteClaimed: false,
  scientificApproval: false,
  productionWritesEnabled: false,
  inventsAggregateConversion: false,
  pilotAccepted: false,
  localProgressOnly: true,
};

export type Stage2CompletionInput = {
  briefHash: string | null;
  hasRun: boolean;
  candidateCount: number;
  hasPassportOrDisagreement: boolean;
  hasGapsOrTestable: boolean;
  briefAvailable: boolean;
  savedOrReopened: boolean;
  usefulnessRated: boolean;
};

export type Stage2CompletionChecklist = {
  schemaVersion: typeof STAGE2_COMPLETION_SCHEMA;
  honesty: Stage2CompletionHonesty;
  briefHash: string | null;
  items: readonly Stage2ChecklistItem[];
  doneCount: number;
  totalCount: number;
  allLocalItemsDone: boolean;
  note: string;
};

export function assertStage2CompletionHonesty(
  honesty: Stage2CompletionHonesty,
): Stage2CompletionHonesty {
  if (honesty.journeyCompleteClaimed !== false) {
    throw Error("journeyCompleteClaimed must be false");
  }
  if (honesty.scientificApproval !== false) throw Error("scientificApproval must be false");
  if (honesty.productionWritesEnabled !== false) {
    throw Error("productionWritesEnabled must be false");
  }
  if (honesty.inventsAggregateConversion !== false) {
    throw Error("inventsAggregateConversion must be false");
  }
  if (honesty.pilotAccepted !== false) throw Error("pilotAccepted must be false");
  if (honesty.localProgressOnly !== true) throw Error("localProgressOnly must be true");
  return honesty;
}

/** Build the Stage 2 exit progress checklist — progress ≠ journey complete. */
export function buildStage2CompletionChecklist(
  input: Stage2CompletionInput,
): Stage2CompletionChecklist {
  const honesty = assertStage2CompletionHonesty(STAGE2_COMPLETION_HONESTY);
  const items: Stage2ChecklistItem[] = [
    {
      id: "ask_run",
      label: "Ask / run",
      done: input.hasRun,
      detail: input.hasRun
        ? "Live investigation run recorded"
        : "Press Run on the workspace",
    },
    {
      id: "evidence",
      label: "Evidence",
      done: input.hasRun && input.candidateCount > 0,
      detail:
        input.hasRun && input.candidateCount > 0
          ? `${input.candidateCount} candidate claim(s) — unreviewed`
          : "Retrieve source-linked candidates",
    },
    {
      id: "passport_or_disagreement",
      label: "Passport / why differ",
      done: input.hasPassportOrDisagreement,
      detail: input.hasPassportOrDisagreement
        ? "Context passport or disagreement opened"
        : "Select a claim or comparison pair",
    },
    {
      id: "gaps_or_testable",
      label: "Gaps / testable questions",
      done: input.hasGapsOrTestable,
      detail: input.hasGapsOrTestable
        ? "Gaps or demoted testable questions available"
        : "Available after a run derives gaps",
    },
    {
      id: "brief",
      label: "Decision brief",
      done: input.briefAvailable,
      detail: input.briefAvailable
        ? "Brief with limitations visible — briefAccepted false"
        : "Open the research decision brief",
    },
    {
      id: "save_or_reopen",
      label: "Save / reopen",
      done: input.savedOrReopened,
      detail: input.savedOrReopened
        ? "Browser library save or reopen — not a server store"
        : "Save to browser library or reopen the same briefHash",
    },
    {
      id: "usefulness",
      label: "Usefulness rating",
      done: input.usefulnessRated,
      detail: input.usefulnessRated
        ? "Local usefulness rating saved for this briefHash"
        : "Rate usefulness after the brief (device-local)",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const allLocalItemsDone = doneCount === totalCount && Boolean(input.briefHash);
  const note = !input.briefHash
    ? "Stage 2 progress unlocks after a live run produces a briefHash."
    : allLocalItemsDone
      ? "All local Stage 2 checklist items done for this briefHash — journey complete claimed: false (not a pilot acceptance)."
      : `Local Stage 2 progress ${doneCount}/${totalCount} for this briefHash — not scientific approval and not journey complete.`;

  return {
    schemaVersion: STAGE2_COMPLETION_SCHEMA,
    honesty,
    briefHash: input.briefHash?.trim() || null,
    items,
    doneCount,
    totalCount,
    allLocalItemsDone,
    note,
  };
}
