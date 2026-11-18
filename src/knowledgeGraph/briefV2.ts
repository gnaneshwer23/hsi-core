/**
 * Track C6 soft-land — Brief v2 export (Markdown / JSON / print).
 * Carries graph release id, review-state counts, conflict classes, run ids and
 * limitations. Never invents reviewed edges, adjudicated conflicts or approval.
 */
import {
  compareDomainEvidence,
  exportDomainBrief,
  type DomainBundle,
  type DomainFilters,
} from "./domainGraph";
import {
  buildPassportEvidenceTable,
  renderPassportEvidenceTableMarkdown,
} from "./passportEvidenceTable";

export const BRIEF_V2_SCHEMA = "hsi-domain-research-brief-2" as const;

export type BriefV2ConflictEntry = {
  leftEdgeId: string;
  rightEdgeId: string;
  classification: "context_comparison_required";
  sameEntityPair: boolean;
  confirmedContradiction: false;
  pooledEffectAllowed: false;
  differences: ReadonlyArray<{ dimension: string; left: string; right: string }>;
  missingContext: readonly string[];
};

export type BriefV2 = {
  schemaVersion: typeof BRIEF_V2_SCHEMA;
  briefVersion: 2;
  graphReleaseId: string;
  graphVersion: string;
  runIds: string[];
  runIdsNote: string;
  reviewStates: {
    unreviewed: number;
    reviewed: number;
    reviewedEdgeCount: number;
    byEdge: ReadonlyArray<{ edgeId: string; reviewStatus: "unreviewed"; confidence: "not_calibrated" }>;
    note: string;
  };
  conflictClasses: BriefV2ConflictEntry[];
  conflictNote: string;
  limitations: string[];
  question: ReturnType<typeof exportDomainBrief>["question"];
  filters: ReturnType<typeof exportDomainBrief>["filters"];
  selection: ReturnType<typeof exportDomainBrief>["selection"];
  freeTextQueryRetained: false;
  summary: string;
  summaryMethod: "editorial_template_not_live_llm";
  paths: ReturnType<typeof exportDomainBrief>["paths"];
  evidence: ReturnType<typeof exportDomainBrief>["evidence"];
  evidenceTable: ReturnType<typeof exportDomainBrief>["evidenceTable"];
  sources: ReturnType<typeof exportDomainBrief>["sources"];
  gaps: ReturnType<typeof exportDomainBrief>["gaps"];
  hypothesis: ReturnType<typeof exportDomainBrief>["hypothesis"];
  containsPhi: false;
  clinicalAdvice: false;
  scientificApproval: false;
  graphPromotable: false;
  trialEligibilityConfirmed: false;
  reproducibleFromSavedRecord: false;
  reproducibleNote: string;
};

export type BriefV2Options = {
  /** Optional pair for the conflict-class section; must be distinct source_candidate ids. */
  comparedEdgeIds?: readonly [string, string];
  /** Live investigation / job run ids when a saved record supplies them. Soft-land defaults to []. */
  runIds?: readonly string[];
};

const BASE_LIMITATIONS = Object.freeze([
  "Source candidates are not curated scientific findings.",
  "Cross-study paths do not establish causality.",
  "Animal or cell-model evidence cannot establish human clinical efficacy.",
  "Registry and cohort overlap does not confirm eligibility.",
  "Pack review states are reproduced without promotion; 0 independently reviewed edges in the published graph.",
  "Conflict classes here are engineering context comparisons, not adjudicated disagreements.",
]);

function pickComparisonPair(
  evidenceIds: readonly string[],
  comparedEdgeIds?: readonly [string, string],
): [string, string] | null {
  if (comparedEdgeIds) {
    const [a, b] = comparedEdgeIds;
    // Explicit pairs are compared against the sealed bundle even when filters hide them from the evidence table.
    if (a && b && a !== b) return [a, b];
    return null;
  }
  if (evidenceIds.length < 2) return null;
  return [evidenceIds[0]!, evidenceIds[1]!];
}

export function exportBriefV2(
  g: DomainBundle,
  questionId: string,
  filters: DomainFilters,
  options: BriefV2Options = {},
): BriefV2 {
  const v1 = exportDomainBrief(g, questionId, filters);
  const evidenceIds = v1.evidence.map((e) => e.id);
  const byEdge = v1.evidence.map((e) => ({
    edgeId: e.id,
    reviewStatus: "unreviewed" as const,
    confidence: "not_calibrated" as const,
  }));
  const pair = pickComparisonPair(evidenceIds, options.comparedEdgeIds);
  const conflictClasses: BriefV2ConflictEntry[] = [];
  if (pair) {
    const comparison = compareDomainEvidence(g, pair[0], pair[1]);
    if (comparison) {
      conflictClasses.push({
        leftEdgeId: pair[0],
        rightEdgeId: pair[1],
        classification: "context_comparison_required",
        sameEntityPair: comparison.sameEntityPair,
        confirmedContradiction: false,
        pooledEffectAllowed: false,
        differences: comparison.differences.map((d) => ({
          dimension: d.dimension,
          left: String(d.left),
          right: String(d.right),
        })),
        missingContext: comparison.missingContext,
      });
    }
  }
  const edgeLimits = [
    ...new Set(
      v1.evidence
        .map((e) => e.limitations.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  ];
  const runIds = [...(options.runIds ?? [])].filter((id) => /^[A-Za-z0-9][A-Za-z0-9:_-]{1,127}$/.test(id));
  return {
    schemaVersion: BRIEF_V2_SCHEMA,
    briefVersion: 2,
    graphReleaseId: g.version,
    graphVersion: g.version,
    runIds,
    runIdsNote:
      runIds.length === 0
        ? "No live investigation run ids are attached. This soft-land brief is reproducible from the versioned graph snapshot and filters, not from a saved investigation record."
        : "Run ids are caller-supplied investigation or job identifiers. They do not imply scientific approval.",
    reviewStates: {
      unreviewed: byEdge.length,
      reviewed: 0,
      reviewedEdgeCount: 0,
      byEdge,
      note: "Published domain-graph edges remain unreviewed until dual-reviewer release (Track C3). Counts never invent reviewed edges.",
    },
    conflictClasses,
    conflictNote:
      conflictClasses.length === 0
        ? "Fewer than two source-candidate edges in this slice, so no pairwise conflict class is emitted."
        : "Conflict class is context_comparison_required only. Confirmed contradiction and pooled effects stay false.",
    limitations: [...BASE_LIMITATIONS, ...edgeLimits],
    question: v1.question,
    filters: v1.filters,
    selection: v1.selection,
    freeTextQueryRetained: false,
    summary: v1.summary,
    summaryMethod: "editorial_template_not_live_llm",
    paths: v1.paths,
    evidence: v1.evidence,
    evidenceTable: v1.evidenceTable ?? buildPassportEvidenceTable(v1.evidence, v1.sources),
    sources: v1.sources,
    gaps: v1.gaps,
    hypothesis: v1.hypothesis,
    containsPhi: false,
    clinicalAdvice: false,
    scientificApproval: false,
    graphPromotable: false,
    trialEligibilityConfirmed: false,
    reproducibleFromSavedRecord: false,
    reproducibleNote:
      "Soft-land Brief v2 rebuilds from the sealed domain-graph snapshot + filters. Saved-record reproducibility lands when investigation persistence is accepted.",
  };
}

function escapeMd(value: string): string {
  return value.replace(/[<>&`*_\[\]#|]/g, (c) => "&#" + c.charCodeAt(0) + ";").replace(/[\r\n]+/g, " ");
}

export function renderBriefV2Markdown(brief: BriefV2): string {
  if (brief.schemaVersion !== BRIEF_V2_SCHEMA || brief.briefVersion !== 2) {
    throw new Error("Invalid Brief v2 document");
  }
  const evidenceTable = renderPassportEvidenceTableMarkdown(
    brief.evidenceTable ?? buildPassportEvidenceTable(brief.evidence, brief.sources),
  );
  const conflictLines =
    brief.conflictClasses.length === 0
      ? [`- ${brief.conflictNote}`]
      : brief.conflictClasses.map(
          (c) =>
            `- ${c.leftEdgeId} vs ${c.rightEdgeId}: ${c.classification}; same entity pair: ${c.sameEntityPair ? "yes" : "no"}; confirmedContradiction: false; missing: ${c.missingContext.join(", ") || "none listed"}`,
        );
  return [
    "# HSI Research Brief v2",
    "",
    `Graph release id: ${brief.graphReleaseId}`,
    `Brief schema: ${brief.schemaVersion}`,
    `Run ids: ${brief.runIds.length ? brief.runIds.join(", ") : "none attached"}`,
    brief.runIdsNote,
    "",
    "Research draft. No scientific approval, diagnosis, treatment recommendation or eligibility decision.",
    `Reviewed edges in this brief: ${brief.reviewStates.reviewedEdgeCount}. Unreviewed candidates: ${brief.reviewStates.unreviewed}.`,
    brief.reviewStates.note,
    "",
    "## Question",
    escapeMd(brief.question.title),
    "",
    "## Research synthesis",
    escapeMd(brief.summary),
    "Synthesis method: editorial template; not a live LLM answer.",
    "",
    evidenceTable,
    "",
    "## Review states",
    `- unreviewed: ${brief.reviewStates.unreviewed}`,
    `- reviewed: ${brief.reviewStates.reviewed}`,
    "",
    "## Conflict classes",
    brief.conflictNote,
    ...conflictLines,
    "",
    "## Source-candidate relationships",
    ...brief.evidence.map(
      (e) =>
        `- **${escapeMd(e.id)}** — ${escapeMd(e.assertion)}\n  - Model: ${escapeMd(e.model)}; ${escapeMd(e.design)}\n  - Source: ${escapeMd(e.sourceId ?? "none")}; review: ${e.reviewStatus}; confidence: ${e.confidence}\n  - Limits: ${escapeMd(e.limitations)}`,
    ),
    "",
    "## Source records",
    ...brief.sources.map(
      (s) =>
        `- ${escapeMd(s.title)} — ${s.url}\n  - ${escapeMd(s.identityStatus)}; rights: ${escapeMd(s.rights)}; exact text ${s.passages.some((p) => p.text) ? "available in the source corpus" : "not imported"}`,
    ),
    "",
    "## Missing evidence",
    ...brief.gaps.map(
      (g) =>
        `- **${escapeMd(g.question)}**\n  - Missing: ${escapeMd(g.missing)}\n  - Next research: ${escapeMd(g.nextStudy)}`,
    ),
    "",
    "## Testable research proposal",
    `Prediction: ${escapeMd(brief.hypothesis.prediction)}`,
    `Falsification: ${escapeMd(brief.hypothesis.falsification)}`,
    `Experiment: ${escapeMd(brief.hypothesis.experiment)}`,
    `Controls: ${brief.hypothesis.controls.map(escapeMd).join("; ")}`,
    "",
    "## Limitations",
    ...brief.limitations.map((l) => `- ${escapeMd(l)}`),
    "",
    "## Interpretation boundary",
    "Source candidates are not curated scientific findings. Cross-study paths do not establish causality. Animal or cell-model evidence cannot establish human clinical efficacy. Registry and cohort overlap does not confirm eligibility.",
    brief.reproducibleNote,
    "",
  ].join("\n");
}

/** Browser print surface — caller opens a window and calls print(). Grants no rights. */
export function renderBriefV2PrintHtml(brief: BriefV2): string {
  const md = renderBriefV2Markdown(brief);
  const body = md
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("- ")) return `<li>${escapeHtml(line.slice(2))}</li>`;
      if (!line.trim()) return "";
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>HSI Research Brief v2</title>
<style>
  body{font:14px/1.45 Georgia,serif;color:#1a1a1a;max-width:720px;margin:2rem auto;padding:0 1rem}
  h1{font-size:1.6rem} h2{font-size:1.15rem;margin-top:1.4rem}
  li{margin:.25rem 0} p{margin:.4rem 0}
  @media print{body{margin:0;max-width:none}}
</style></head><body>
<p><strong>Print draft · not scientific approval · graph release ${escapeHtml(brief.graphReleaseId.slice(0, 12))}…</strong></p>
${body}
<script>window.addEventListener("load",()=>{try{window.focus();window.print()}catch(_){}})</script>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
