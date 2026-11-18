/**
 * Live investigation Brief v2 envelope (C6 soft-land on the live path).
 * Adds graph-release / review-state / run-id / conflict honesty fields around
 * an existing live brief without inventing reviewed edges or graph promotion.
 */
import type {LiveInvestigation} from "./liveRun";
import {renderLiveBriefMarkdown} from "./liveBrief";

export const LIVE_BRIEF_V2_SCHEMA = "hsi-live-research-brief-2" as const;

export type LiveBriefV2ConflictClass =
  | "supporting_vs_opposing_candidates"
  | "no_pairwise_conflict_emitted";

export type LiveBriefV2 = {
  schemaVersion: typeof LIVE_BRIEF_V2_SCHEMA;
  briefVersion: 2;
  /** Live runs are not a published graph release. */
  graphReleaseId: null;
  graphReleaseNote: string;
  runIds: string[];
  runIdsNote: string;
  reviewStates: {
    unreviewed: number;
    reviewed: number;
    reviewedEdgeCount: number;
    byCandidate: ReadonlyArray<{
      candidateId: string;
      reviewStatus: "unreviewed";
      verification: LiveInvestigation["candidates"][number]["verification"];
      polarity: LiveInvestigation["candidates"][number]["polarity"];
    }>;
    note: string;
  };
  conflictClasses: ReadonlyArray<{
    classification: LiveBriefV2ConflictClass;
    supportingCount: number;
    opposingCount: number;
    confirmedContradiction: false;
    pooledEffectAllowed: false;
  }>;
  conflictNote: string;
  limitations: string[];
  question: string;
  scenarioId: string;
  liveVersion: number;
  briefHash: string;
  markdown: string;
  investigation: LiveInvestigation;
  containsPhi: false;
  clinicalAdvice: false;
  scientificApproval: false;
  graphPromotable: false;
  reproducibleFromSavedRecord: false;
  reproducibleNote: string;
};

const BASE_LIMITS = Object.freeze([
  "Candidate-only live brief; nothing here is independently reviewed.",
  "Model agreement is not scientific proof.",
  "Abstracts are not redistributed; licence for redistribution was not assessed.",
  "Current source permissions must be rechecked before sharing or citation.",
  "No published graph release id is attached to a live investigation brief.",
]);

export function exportLiveBriefV2(run: LiveInvestigation): LiveBriefV2 {
  const checked = run.candidates.filter((c) => c.verification !== "not_run");
  const supporting = checked.filter((c) => c.polarity === "supporting").length;
  const opposing = checked.filter((c) => c.polarity === "opposing").length;
  const conflictClasses =
    supporting > 0 && opposing > 0
      ? [
          {
            classification: "supporting_vs_opposing_candidates" as const,
            supportingCount: supporting,
            opposingCount: opposing,
            confirmedContradiction: false as const,
            pooledEffectAllowed: false as const,
          },
        ]
      : [
          {
            classification: "no_pairwise_conflict_emitted" as const,
            supportingCount: supporting,
            opposingCount: opposing,
            confirmedContradiction: false as const,
            pooledEffectAllowed: false as const,
          },
        ];
  const byCandidate = run.candidates.map((c) => ({
    candidateId: c.id,
    reviewStatus: "unreviewed" as const,
    verification: c.verification,
    polarity: c.polarity,
  }));
  return {
    schemaVersion: LIVE_BRIEF_V2_SCHEMA,
    briefVersion: 2,
    graphReleaseId: null,
    graphReleaseNote:
      "Live investigation briefs are not versioned graph releases. Domain-graph Brief v2 carries graphReleaseId separately.",
    runIds: [run.briefHash],
    runIdsNote: "runIds[0] is the live briefHash for this run. It is not a Neon investigation id.",
    reviewStates: {
      unreviewed: run.candidates.length,
      reviewed: 0,
      reviewedEdgeCount: 0,
      byCandidate,
      note: "Live candidates remain unreviewed. Dual-reviewer graph release is Track C3.",
    },
    conflictClasses,
    conflictNote:
      supporting > 0 && opposing > 0
        ? "Supporting and opposing model-checked candidates both appear. Confirmed contradiction stays false."
        : "No supporting-versus-opposing pair is present in the checked set, so no conflict class beyond the empty marker is emitted.",
    limitations: [...BASE_LIMITS, ...run.gaps.slice(0, 12)],
    question: run.question,
    scenarioId: run.scenarioId,
    liveVersion: run.version,
    briefHash: run.briefHash,
    markdown: renderLiveBriefMarkdown(run),
    investigation: run,
    containsPhi: false,
    clinicalAdvice: false,
    scientificApproval: false,
    graphPromotable: false,
    reproducibleFromSavedRecord: false,
    reproducibleNote:
      "Soft-land envelope rebuilds from the in-memory live run. Device-local save is not a durable saved-record receipt.",
  };
}

export function renderLiveBriefV2Markdown(brief: LiveBriefV2): string {
  if (brief.schemaVersion !== LIVE_BRIEF_V2_SCHEMA || brief.briefVersion !== 2) {
    throw new Error("Invalid live Brief v2 document");
  }
  return [
    "# HSI Live Research Brief v2",
    "",
    `Schema: ${brief.schemaVersion}`,
    `Run id (briefHash): ${brief.briefHash}`,
    "Graph release id: none (live run)",
    brief.graphReleaseNote,
    "",
    `Reviewed edges / candidates: ${brief.reviewStates.reviewedEdgeCount}. Unreviewed candidates: ${brief.reviewStates.unreviewed}.`,
    brief.reviewStates.note,
    "",
    "## Conflict classes",
    brief.conflictNote,
    ...brief.conflictClasses.map(
      (c) =>
        `- ${c.classification}; supporting=${c.supportingCount}; opposing=${c.opposingCount}; confirmedContradiction: false`,
    ),
    "",
    "## Limitations",
    ...brief.limitations.map((l) => `- ${l}`),
    "",
    "## Live brief body",
    "",
    brief.markdown,
    "",
    brief.reproducibleNote,
    "",
  ].join("\n");
}
