/**
 * Browser-safe live structured-comparison view + brief section.
 * Outcomes are attached by the Node run path; this module never invents
 * expert rules, proven contradictions, or scientific approval.
 * Keep free of Node-only imports so the brief renderer stays browser-safe.
 */

export const LIVE_STRUCTURED_COMPARISON_SCHEMA = "hsi-live-structured-comparison-1" as const;

/** Closed set mirrored from structuredEvidenceComparison (do not widen here). */
export type LiveComparisonOutcome =
  | "consistent"
  | "potential_contradiction"
  | "context_dependent"
  | "methodological_difference"
  | "insufficient_comparability"
  | "insufficient_evidence";

export type LiveComparisonItem = {
  leftId: string;
  rightId: string;
  leftLabel: string;
  rightLabel: string;
  leftContexts: readonly string[];
  rightContexts: readonly string[];
  engineOutcome: LiveComparisonOutcome;
  /** Outcome after verification binding — may abstain from potential_contradiction. */
  outcome: LiveComparisonOutcome;
  rationale: string;
  verificationBindNote: string | null;
  verificationLeft: string;
  verificationRight: string;
  sharedSubjectObject: boolean;
  contextDepth: "coarse_metadata_only";
  needsHumanReview: true;
  potentialContradictionIsNotProven: true;
};

export type LiveStructuredComparison = {
  schemaVersion: typeof LIVE_STRUCTURED_COMPARISON_SCHEMA;
  method: "hsi.structured_evidence_comparison.v1";
  version: string;
  pairCount: number;
  summary: {
    consistent: number;
    potentialContradiction: number;
    contextDependent: number;
    methodologicalDifference: number;
    insufficientComparability: number;
    insufficientEvidence: number;
  };
  items: readonly LiveComparisonItem[];
  honesty: {
    metadataOrDeclaredContextOnly: true;
    associationScoreIsNotCausation: true;
    potentialContradictionIsNotProvenContradiction: true;
    verificationBoundBeforeContradictionLanguage: true;
    scientificApproval: false;
    graphPromotable: false;
    claimSupport: "not_assessed";
    gateCAutoApprove: false;
    cdsPhi: false;
    neonContradictionLedger: false;
  };
};

export const COMPARISON_OUTCOME_LABEL: Record<LiveComparisonOutcome, string> = {
  consistent: "Consistent",
  potential_contradiction: "Potential contradiction (candidate)",
  context_dependent: "Context-dependent difference",
  methodological_difference: "Methodological difference",
  insufficient_comparability: "Insufficient comparability",
  insufficient_evidence: "Insufficient evidence",
};

/** Fail-closed class distinction for USP A / brief — not scientific approval. */
export const COMPARABILITY_HONESTY_LINE =
  "Insufficient comparability is not Potential contradiction and is not proven conflict. Potential contradiction (candidate) is not proven contradiction.";

const safe = (s: string) =>
  s.replace(/[<>&`*_\[\]#|]/g, (c) => "&#" + c.charCodeAt(0) + ";").replace(/[\r\n]+/g, " ");

export function emptyLiveStructuredComparison(
  version = "0.3.0",
): LiveStructuredComparison {
  return {
    schemaVersion: LIVE_STRUCTURED_COMPARISON_SCHEMA,
    method: "hsi.structured_evidence_comparison.v1",
    version,
    pairCount: 0,
    summary: {
      consistent: 0,
      potentialContradiction: 0,
      contextDependent: 0,
      methodologicalDifference: 0,
      insufficientComparability: 0,
      insufficientEvidence: 0,
    },
    items: [],
    honesty: {
      metadataOrDeclaredContextOnly: true,
      associationScoreIsNotCausation: true,
      potentialContradictionIsNotProvenContradiction: true,
      verificationBoundBeforeContradictionLanguage: true,
      scientificApproval: false,
      graphPromotable: false,
      claimSupport: "not_assessed",
      gateCAutoApprove: false,
      cdsPhi: false,
      neonContradictionLedger: false,
    },
  };
}

/** Brief markdown for the attached comparison pack (browser-safe). */
export function renderLiveBriefComparisonSections(
  comparison: LiveStructuredComparison | null | undefined,
): string {
  const pack = comparison ?? emptyLiveStructuredComparison();
  const s = pack.summary;
  const lines = [
    "## Structured evidence comparison (candidate)",
    "Pairwise comparison of live claims that share a subject–object relation. Coarse declared context only (disease / species). Not proven contradiction, not scientific approval, not graph-promotable.",
    `- Pairs compared: ${pack.pairCount}`,
    `- Consistent: ${s.consistent} · Context-dependent: ${s.contextDependent} · Method difference: ${s.methodologicalDifference} · Insufficient comparability: ${s.insufficientComparability} · Insufficient evidence: ${s.insufficientEvidence} · Potential contradiction (candidate): ${s.potentialContradiction}`,
    "- Verification is bound before contradiction language: incomplete or disputed checks abstain from potential_contradiction.",
    "- potential_contradiction is not a proven contradiction. Human review required.",
    `- ${COMPARABILITY_HONESTY_LINE}`,
  ];
  if (!pack.items.length) {
    lines.push("- No comparable claim pairs in this run (need at least two candidates on the same relation).");
    return lines.join("\n");
  }
  for (const item of pack.items) {
    lines.push(
      `- **${COMPARISON_OUTCOME_LABEL[item.outcome]}** — ${safe(item.leftLabel)} vs ${safe(item.rightLabel)}`,
      `  - Contexts: ${item.leftContexts.map(safe).join(", ") || "not stated"} · ${item.rightContexts.map(safe).join(", ") || "not stated"}`,
      `  - Verification: ${safe(item.verificationLeft)} · ${safe(item.verificationRight)}`,
      `  - Engine class: ${item.engineOutcome.replaceAll("_", " ")}${item.verificationBindNote ? ` · Bind: ${safe(item.verificationBindNote)}` : ""}`,
      `  - ${safe(item.rationale)}`,
    );
  }
  return lines.join("\n");
}
