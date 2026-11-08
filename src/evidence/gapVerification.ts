/**
 * Execution step 04 — deterministic gap verification against permitted local + living evidence.
 * Distinguishes missing local data from unresolved scientific questions; never invents SME gold.
 * Passage import remains fail-closed; scientificallyValidated stays false until human #4.
 */
import type {LivingEvidenceOutcomeSection} from "./livingEvidenceExpansion";

export const GAP_VERIFICATION_SCHEMA = "hsi-gap-verification-1" as const;
export const GAP_VERIFICATION_METHOD = "hsi-deterministic-gap-classification-1" as const;

export type GapKind =
  | "missing_local_data"
  | "genuine_unresolved_question"
  | "passage_rights_blocked"
  | "oppose_search_incomplete"
  | "abstain_insufficient_evidence";

export type GapVerificationItem = {
  id: string;
  branchId: string | null;
  sourceField: "missingEvidence" | "uncertainty";
  recordedText: string;
  kind: GapKind;
  rationale: string;
  trace: {
    supportingClaimIds: string[];
    opposingClaimIds: string[];
    matchedLivingPmids: string[];
    openTargetsDiseaseIds: string[];
    localSourcePmids: string[];
  };
  expertLabelStatus: "unavailable";
  scientificallyValidated: false;
};

export type GapVerificationReport = {
  schemaVersion: typeof GAP_VERIFICATION_SCHEMA;
  method: typeof GAP_VERIFICATION_METHOD;
  asOf: string;
  items: GapVerificationItem[];
  summary: {
    missingLocalData: number;
    genuineUnresolved: number;
    passageRightsBlocked: number;
    opposeSearchIncomplete: number;
    abstain: number;
  };
  honesty: {
    smeGoldFilled: false;
    expertLabelsAvailable: false;
    scientificallyValidated: false;
    humanQueueBlocked: readonly ["#4"];
    passageImportAuthorized: false;
  };
  unavailableCapabilities: string[];
  note: string;
};

export type GapVerificationOutcomeSection = GapVerificationReport & {
  status: "classified_against_bound_evidence" | "classified_local_only" | "empty";
};

type BranchInput = {
  id: string;
  assessment: string;
  supportingClaimIds: readonly string[];
  opposingClaimIds: readonly string[];
  missingEvidence: readonly string[];
  uncertainty: readonly string[];
};

type ClaimContextInput = {
  claimId: string;
  context: {
    tissueId?: string | null;
    assay?: string | null;
    diseaseStage?: string | null;
    experimentalSystem?: string | null;
    species?: string | null;
  };
};

export type GapVerificationInput = {
  asOf?: string;
  branches: readonly BranchInput[];
  claimContexts: readonly ClaimContextInput[];
  localSourcePmids: readonly (string | null | undefined)[];
  contradictions: {recordedOpposingClaimIds: readonly string[]; searchStatus: string};
  livingEvidence: LivingEvidenceOutcomeSection;
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter((v) => typeof v === "string" && v.trim()))];
}

function contextPresent(claimContexts: readonly ClaimContextInput[], claimIds: readonly string[]): boolean {
  return claimIds.some((id) => {
    const c = claimContexts.find((row) => row.claimId === id);
    if (!c) return false;
    return Boolean(
      c.context.tissueId ||
        c.context.assay ||
        c.context.diseaseStage ||
        c.context.experimentalSystem ||
        c.context.species,
    );
  });
}

function classifyGap(input: {
  text: string;
  branch: BranchInput | null;
  claimContexts: readonly ClaimContextInput[];
  contradictions: GapVerificationInput["contradictions"];
  livingEvidence: LivingEvidenceOutcomeSection;
  localSourcePmids: readonly string[];
}): {kind: GapKind; rationale: string} {
  const text = input.text;
  const supporting = input.branch?.supportingClaimIds ?? [];
  const opposing = input.branch?.opposingClaimIds ?? [];
  const livingBound = input.livingEvidence.status === "bound_metadata_refresh";
  const livingPmids = input.livingEvidence.matchedPmids;
  const passageBlocked =
    livingBound &&
    (input.livingEvidence.licensing?.humanCleared === false ||
      input.livingEvidence.licensing?.passageImportAuthorized === false ||
      input.livingEvidence.unavailableCapabilities.some((s) => /passage import/i.test(s)));

  if (/contradictor|opposing|null findings/i.test(text)) {
    if (opposing.length > 0 || input.contradictions.recordedOpposingClaimIds.length > 0) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Opposing claim bindings are recorded, but contradiction search is not exhaustive and expert adjudication is unavailable (#4 PARKED).",
      };
    }
    if (input.contradictions.searchStatus === "not_recorded") {
      return {
        kind: "oppose_search_incomplete",
        rationale:
          "No opposing traces and no recorded contradiction-search audit. Absence of oppose rows is not consensus.",
      };
    }
    return {
      kind: "abstain_insufficient_evidence",
      rationale: "Contradiction status cannot be classified from the available audit fields.",
    };
  }

  if (/approved source-linked claims/i.test(text)) {
    if (supporting.length > 0) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Local source-linked claims are bound to this branch, yet the recorded assessment remains unresolved pending independent scientific review.",
      };
    }
    if (livingBound && livingPmids.length > 0) {
      return {
        kind: passageBlocked ? "passage_rights_blocked" : "missing_local_data",
        rationale: passageBlocked
          ? "Living-evidence bibliographic identities overlap pins, but passage import remains fail-closed (humanCleared=false)."
          : "Living-evidence metadata is bound without local approved claim bindings for this mechanism gap.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "No local supporting claims and no overlapping living-evidence PMIDs for this mechanism gap.",
    };
  }

  if (/disease stage|tissue|assay context/i.test(text)) {
    if (contextPresent(input.claimContexts, supporting)) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Some biological context fields exist on bound claims, but disease-stage / tissue / assay completeness is still recorded as unresolved.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "Bound claims do not carry the disease-stage / tissue / assay context this gap requests.",
    };
  }

  if (/no evidence retrieval|not established by its inclusion/i.test(text)) {
    if (livingBound) {
      return {
        kind: passageBlocked ? "passage_rights_blocked" : "genuine_unresolved_question",
        rationale: passageBlocked
          ? "Planner uncertainty remains; living-evidence metadata refresh is bound but passages are not cleared for entailment."
          : "Planner did not retrieve evidence; living-evidence metadata is bound and still requires independent assessment.",
      };
    }
    if (input.localSourcePmids.length > 0) {
      return {
        kind: "genuine_unresolved_question",
        rationale:
          "Local package sources exist, but the question planner recorded that retrieval was not performed for this branch.",
      };
    }
    return {
      kind: "missing_local_data",
      rationale: "No local source PMIDs and no living-evidence bind; planner retrieval was not performed.",
    };
  }

  if (supporting.length > 0 || opposing.length > 0 || livingBound) {
    return {
      kind: "abstain_insufficient_evidence",
      rationale:
        "Evidence is partially present, but this recorded gap text does not match a classified template — abstaining rather than inventing a scientific rank.",
    };
  }
  return {
    kind: "missing_local_data",
    rationale: "No local claim bindings and no living-evidence overlap address this recorded gap.",
  };
}

export function verifyRecordedGaps(input: GapVerificationInput): GapVerificationReport {
  const asOf = input.asOf ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(asOf))) throw Error("Invalid gap verification asOf");
  const localSourcePmids = unique(
    input.localSourcePmids.filter((p): p is string => typeof p === "string" && /^[1-9]\d{0,8}$/.test(p)),
  );
  const openTargetsDiseaseIds = unique(
    input.livingEvidence.openTargetsAssociations.map((a) => a.diseaseId),
  );
  const items: GapVerificationItem[] = [];
  let seq = 0;
  for (const branch of input.branches) {
    const push = (sourceField: "missingEvidence" | "uncertainty", recordedText: string) => {
      if (typeof recordedText !== "string" || !recordedText.trim() || recordedText.length > 2000) {
        throw Error("Invalid gap text");
      }
      const {kind, rationale} = classifyGap({
        text: recordedText,
        branch,
        claimContexts: input.claimContexts,
        contradictions: input.contradictions,
        livingEvidence: input.livingEvidence,
        localSourcePmids,
      });
      seq += 1;
      items.push({
        id: `gap-${seq.toString().padStart(3, "0")}`,
        branchId: branch.id,
        sourceField,
        recordedText,
        kind,
        rationale,
        trace: {
          supportingClaimIds: [...branch.supportingClaimIds],
          opposingClaimIds: [...branch.opposingClaimIds],
          matchedLivingPmids: [...input.livingEvidence.matchedPmids],
          openTargetsDiseaseIds,
          localSourcePmids,
        },
        expertLabelStatus: "unavailable",
        scientificallyValidated: false,
      });
    };
    for (const text of branch.missingEvidence) push("missingEvidence", text);
    for (const text of branch.uncertainty) push("uncertainty", text);
  }

  const summary = {
    missingLocalData: items.filter((i) => i.kind === "missing_local_data").length,
    genuineUnresolved: items.filter((i) => i.kind === "genuine_unresolved_question").length,
    passageRightsBlocked: items.filter((i) => i.kind === "passage_rights_blocked").length,
    opposeSearchIncomplete: items.filter((i) => i.kind === "oppose_search_incomplete").length,
    abstain: items.filter((i) => i.kind === "abstain_insufficient_evidence").length,
  };

  return {
    schemaVersion: GAP_VERIFICATION_SCHEMA,
    method: GAP_VERIFICATION_METHOD,
    asOf,
    items,
    summary,
    honesty: {
      smeGoldFilled: false,
      expertLabelsAvailable: false,
      scientificallyValidated: false,
      humanQueueBlocked: ["#4"],
      passageImportAuthorized: false,
    },
    unavailableCapabilities: [
      "Expert-labelled scientific gap ranking (human queue #4 PARKED; smeGoldFilled=false)",
      "Passage-backed entailment against uncleared passages (human queue #2 PARKED)",
      "Gate C auto-approve / MoU legalBinding (forbidden)",
      "Live literature / LLM tool activation beyond deterministic classification",
    ],
    note:
      "Engineering classification only: separates missing local corpus coverage from unresolved questions and rights-blocked passages. Not scientist-ranked and not scientifically validated.",
  };
}

export function projectGapVerificationForOutcome(input: GapVerificationInput): GapVerificationOutcomeSection {
  const report = verifyRecordedGaps(input);
  const status: GapVerificationOutcomeSection["status"] = !report.items.length
    ? "empty"
    : input.livingEvidence.status === "bound_metadata_refresh"
      ? "classified_against_bound_evidence"
      : "classified_local_only";
  return {...report, status};
}
