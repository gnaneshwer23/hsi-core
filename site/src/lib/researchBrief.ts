import type { EvidenceRow } from "./discoveryData";

export type ResearchBriefContext = {
  question: string;
  disease: string;
  bundleId: string;
  generatedAt: string;
};

/** A locator is not proof that a paper supports a claim. Prefer canonical IDs. */
export function evidenceSourceLink(row: EvidenceRow): string | null {
  if (row.source.pmid && /^\d+$/.test(row.source.pmid)) {
    return `https://pubmed.ncbi.nlm.nih.gov/${row.source.pmid}/`;
  }
  if (row.source.doi && /^10\.\d{4,9}\/\S+$/.test(row.source.doi)) {
    return `https://doi.org/${encodeURIComponent(row.source.doi)}`;
  }
  return null;
}

export function selectedEvidence(rows: EvidenceRow[], ids: string[]): EvidenceRow[] {
  const byId = new Map(rows.map((row) => [row.claimId, row]));
  return [...new Set(ids)].map((id) => {
    const row = byId.get(id);
    if (!row) throw new Error(`Claim ${id} is absent from this evidence snapshot.`);
    return row;
  });
}

// Preserve text as text in portable Markdown (including source-provided labels).
function text(value: string | null | undefined): string {
  return (value?.trim() || "Not recorded in this pack")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\\`*_{}\[\]()#+!|])/g, "\\$1")
    .replace(/[\r\n]+/g, " ");
}

export function buildResearchBrief(
  context: ResearchBriefContext,
  rows: EvidenceRow[],
  ids: string[],
): string {
  if (!context.question.trim()) throw new Error("A research question is required.");
  const selected = selectedEvidence(rows, ids);
  if (selected.length < 2 || selected.length > 4) {
    throw new Error("Select two to four claims for comparison.");
  }
  const lines = [
    "# Research evidence comparison",
    "",
    "Draft for expert review · research only · not clinical decision support.",
    "No diagnosis, treatment recommendation or trial eligibility determination.",
    "",
    `Question: ${text(context.question)}`,
    `Disease scope: ${text(context.disease)}`,
    `Evidence bundle: ${text(context.bundleId)}`,
    `Snapshot generated: ${text(context.generatedAt)}`,
    "",
    "## Coverage and verification",
    "",
    "This brief compares selected claims from a static HSI seed pack. It is not a literature search or a systematic review.",
    "Source links are locators. Exact claim support, study details, current source availability and retraction status have not been independently verified by this workflow.",
    "Pack grades and review states are reproduced without promotion. Missing data is not evidence of absence. No contradiction or causal inference is generated from selection or graph adjacency.",
    "",
    "## Selected evidence",
  ];
  selected.forEach((row, i) => {
    const link = evidenceSourceLink(row);
    lines.push(
      "", `### ${i + 1}. ${text(row.claimId)}`, "",
      `Claim: ${text(row.claimText)}`,
      `Edge: ${text(row.edgeId)}`,
      `Relationship: ${text(row.subject)} → ${text(row.relationship)} → ${text(row.object)}`,
      `Disease context: ${text(row.conditionContext)}`,
      `Pack evidence grade: ${text(row.evidenceGrade)}`,
      `Pack review state: ${text(row.reviewStatus)}`,
      `Source: ${text(row.source.citationLabel)}`,
      `PMID: ${text(row.source.pmid)} · DOI: ${text(row.source.doi)}`,
      `Source locator: ${link ? `<${link}>` : "Unavailable — no valid PMID or DOI in this pack"}`,
      "Claim support verification: Not independently verified by this workflow",
      "Species / population / tissue / study design / publication date: Not structured in this pack; inspect the source",
      `Pack limitations: ${text(row.limitations)}`,
    );
  });
  lines.push(
    "", "## Expert review checklist", "",
    "- Resolve each source and check the exact supporting passage.",
    "- Record study design, species, population, tissue, dates and limitations.",
    "- Check corrections, retractions, reuse rights and conflicting findings.",
    "- Document whether the claims are comparable; do not infer agreement or contradiction automatically.",
    "- Record alternative explanations and falsifiable hypotheses as unvalidated.",
    "- Obtain human review before any downstream use; this export records no approval.",
    "", "Session-only selection; no authenticated workspace or durable review audit is provided.", "",
  );
  return lines.join("\n");
}
