/**
 * ISI pilot evidence pack — disease-agnostic template for M0 walkthroughs.
 *
 * Covers the four pilot workflow outputs (evidence map, entity slice,
 * competing explanations, expert shortlist) plus a research-brief shell.
 * Disease + question stay TBD. No fake partner data. No patient-level CDS.
 *
 * Pack-2 adds Discovery Centre vocabulary (ASK→MAP→REVIEW loop + illustrative
 * disease contexts) and claim→LOINC fields on evidence rows — still no UI.
 */
import {
  buildDiscoveryCentreMeta,
  type HsiDiscoveryCentreMeta,
} from "./discoveryCentreMeta";
import { HSI_GRADE_INFO, type HsiGrade } from "./grades";
import { buildSchemaGapReport } from "./gapReport";
import { buildGateCChecklist } from "./gateCChecklist";
import { linkClaimToMarker } from "./markers";
import {
  HSI_T2D_IMMUNO_SEED_CLAIMS,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "./seed/t2dImmunoMetabolic";
import type { HsiEdge, HsiEdgeType } from "./schema";

export const PILOT_EVIDENCE_PACK_SCHEMA = "hsi-pilot-evidence-pack-2" as const;

/** Explicit unknown — never invent scope for an unlocked partner question. */
export type PilotScopeField = "unknown" | string;

export type PilotQuestionProject = {
  projectId: string;
  question: string;
  disease: string;
  scope: {
    population: PilotScopeField;
    tissue: PilotScopeField;
    cellType: PilotScopeField;
    mechanismOrBiomarkerOrTreatmentFocus: PilotScopeField;
    timeWindow: PilotScopeField;
  };
  owner: string;
  workspace: string;
  status: "template" | "scoping" | "active" | "archived";
  evidenceSnapshotRef: string;
  createdAt: string;
  updatedAt: string;
};

export type PilotEvidenceMapRow = {
  claimId: string;
  edgeId: string;
  claimText: string;
  subject: string;
  relationship: HsiEdgeType;
  object: string;
  conditionContext: string;
  evidenceGrade: HsiGrade;
  reviewStatus: string;
  source: {
    pmid: string | null;
    doi: string | null;
    citationLabel: string | null;
    sourceUrl: string | null;
    missing: string[];
  };
  /** Claim → marker → LOINC when seed wiring exists. */
  marker: {
    markerId: string | null;
    markerName: string | null;
    loinc: string | null;
    linkKind: "subject_node" | "object_node" | "explicit_card" | null;
  };
  studyOrModelContext: string | null;
  limitations: string | null;
  /** Edges are navigational; not proof of causality. */
  graphEdgeMeans: "navigational_link_not_causality";
};

export type PilotEntityRef = {
  id: string;
  label: string;
  kind: "disease" | "cell" | "pathway" | "biomarker" | "treatment" | "study" | "other";
};

export type PilotEntitySlice = {
  diseases: string[];
  cells: string[];
  pathwaysOrMechanisms: string[];
  biomarkers: string[];
  treatments: string[];
  studies: string[];
  /** Typed refs for consumers that want id/kind (strings above stay for brief readability). */
  typed: PilotEntityRef[];
  note: string;
};

export type PilotExplanationSlot = {
  id: string;
  label: string;
  status:
    | "template"
    | "from_uncertain_grade"
    | "from_conflicting_review"
    | "from_illustrative_pathway";
  relatedClaimIds: string[];
  note: string;
};

export type PilotExpertItem = {
  id: string;
  kind: "gap" | "hypothesis" | "pending_gate_c";
  text: string;
  relatedClaimIds: string[];
  autoApproved: false;
};

export type PilotEvidencePack = {
  schemaVersion: typeof PILOT_EVIDENCE_PACK_SCHEMA;
  notCds: true;
  noPatientLevelActions: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  /** Locked only after partner conversations — never pre-assigned here. */
  disease: "TBD";
  researchQuestion: "TBD — lock with partner";
  substrateNote: string;
  /** Discovery Centre framing as export metadata — not an interactive UI. */
  discoveryCentre: HsiDiscoveryCentreMeta;
  gradeDefinitions: typeof HSI_GRADE_INFO;
  clinicalBoundary: string[];
  questionProject: PilotQuestionProject;
  evidenceMap: PilotEvidenceMapRow[];
  entitySlice: PilotEntitySlice;
  competingExplanations: PilotExplanationSlot[];
  uncertainties: PilotExplanationSlot[];
  expertShortlist: PilotExpertItem[];
  researchBriefShell: {
    sections: string[];
    citationRule: string;
    unsupportedSynthesis: "omit_or_flag";
  };
  linkedArtifacts: {
    isiExport: string;
    isiRelMap: string;
    gapReportJson: string;
    gapReportMd: string;
    gateCChecklistJson: string;
    gateCChecklistMd: string;
  };
  summary: {
    evidenceMapRows: number;
    gradeCounts: Record<HsiGrade, number>;
    missingSourceLabels: number;
    claimsWithLoinc: number;
    expertShortlistItems: number;
    gateCPending: number;
    illustrativeDiseaseContexts: number;
  };
  nextActions: string[];
};

function missingSourceLabels(edge: HsiEdge): string[] {
  const missing: string[] = [];
  if (!edge.provenance.pmid?.trim()) missing.push("pmid");
  if (!edge.provenance.doi?.trim()) missing.push("doi");
  if (!edge.provenance.citationLabel?.trim()) missing.push("citationLabel");
  if (!edge.provenance.sourceUrl?.trim()) missing.push("sourceUrl");
  return missing;
}

function claimText(claimId: string): string {
  return HSI_T2D_IMMUNO_SEED_CLAIMS.find((c) => c.id === claimId)?.assertion ?? "(missing claim text)";
}

function toEvidenceRow(edge: HsiEdge): PilotEvidenceMapRow {
  const missing = missingSourceLabels(edge);
  const link = linkClaimToMarker(edge.claimId);
  return {
    claimId: edge.claimId,
    edgeId: edge.id,
    claimText: claimText(edge.claimId),
    subject: edge.subjectLabel,
    relationship: edge.edgeType,
    object: edge.objectLabel,
    conditionContext: edge.domain,
    evidenceGrade: edge.hsiGrade,
    reviewStatus: edge.curationReview,
    source: {
      pmid: edge.provenance.pmid,
      doi: edge.provenance.doi,
      citationLabel: edge.provenance.citationLabel,
      sourceUrl: edge.provenance.sourceUrl,
      missing,
    },
    marker: {
      markerId: link?.marker.id ?? null,
      markerName: link?.marker.name ?? null,
      loinc: link?.marker.loinc ?? null,
      linkKind: link?.linkKind ?? null,
    },
    studyOrModelContext: edge.provenance.notes,
    limitations:
      missing.length > 0
        ? `Missing metadata: ${missing.join(", ")}. Do not treat as strong evidence.`
        : null,
    graphEdgeMeans: "navigational_link_not_causality",
  };
}

function classifyLabel(
  label: string,
  edge: HsiEdge,
): PilotEntityRef["kind"] {
  const lower = label.toLowerCase();
  if (
    lower.includes("cell") ||
    lower.includes("treg") ||
    lower.includes("macrophage") ||
    lower.includes("cd8") ||
    lower.includes("th17")
  ) {
    return "cell";
  }
  if (
    edge.edgeType === "biomarker_of" ||
    lower.includes("biomarker") ||
    lower.includes("hba1c") ||
    lower.includes("crp") ||
    lower.includes("anti-ccp") ||
    lower.includes("antinuclear") ||
    lower.includes("autoantibody")
  ) {
    return "biomarker";
  }
  if (
    edge.edgeType === "treats" ||
    lower.includes("metformin") ||
    lower.includes("therapy") ||
    lower.includes("inhibitor") ||
    lower.includes("antibody") ||
    lower.includes("blockade")
  ) {
    return "treatment";
  }
  if (
    lower.includes("diabetes") ||
    lower.includes("rheumatoid") ||
    lower.includes("lupus") ||
    lower.includes("psoriasis") ||
    lower.includes("bowel") ||
    lower.includes("arthritis") ||
    lower.includes("autoimmune") ||
    edge.domain === "autoimmunity" ||
    edge.domain === "t2d"
  ) {
    // Prefer disease when the label is a disease name; pathways/cytokines fall through.
    if (
      lower.includes("rheumatoid arthritis") ||
      lower.includes("systemic lupus") ||
      lower.includes("psoriasis") ||
      lower.includes("inflammatory bowel") ||
      lower.includes("type 2 diabetes") ||
      lower.includes("type 1 diabetes") ||
      label === "Rheumatoid arthritis" ||
      label === "Systemic lupus erythematosus" ||
      label === "Psoriasis / psoriatic disease" ||
      label === "Inflammatory bowel disease" ||
      label === "Type 2 diabetes mellitus"
    ) {
      return "disease";
    }
  }
  if (
    lower.includes("pathway") ||
    lower.includes("signaling") ||
    lower.includes("signalling") ||
    lower.includes("inflammation") ||
    lower.includes("cytokine") ||
    lower.includes("interferon") ||
    lower.includes("il-") ||
    lower.includes("tnf") ||
    edge.edgeType === "drives" ||
    edge.edgeType === "upregulates" ||
    edge.edgeType === "downregulates"
  ) {
    return "pathway";
  }
  if (
    lower.includes("diabetes") ||
    lower.includes("rheumatoid") ||
    lower.includes("lupus") ||
    lower.includes("psoriasis") ||
    lower.includes("bowel") ||
    lower.includes("arthritis")
  ) {
    return "disease";
  }
  return "other";
}

function bucketEntities(edges: readonly HsiEdge[]): PilotEntitySlice {
  const diseases = new Set<string>();
  const cells = new Set<string>();
  const pathwaysOrMechanisms = new Set<string>();
  const biomarkers = new Set<string>();
  const treatments = new Set<string>();
  const studies = new Set<string>();
  const typedByKey = new Map<string, PilotEntityRef>();

  function addTyped(id: string, label: string, kind: PilotEntityRef["kind"]) {
    const key = `${kind}:${id}`;
    if (!typedByKey.has(key)) {
      typedByKey.set(key, { id, label, kind });
    }
  }

  for (const e of edges) {
    const ends: Array<{ id: string; label: string }> = [
      { id: e.subjectId, label: e.subjectLabel },
      { id: e.objectId, label: e.objectLabel },
    ];
    for (const { id, label } of ends) {
      const kind = classifyLabel(label, e);
      addTyped(id, label, kind === "other" ? "pathway" : kind);
      switch (kind) {
        case "cell":
          cells.add(label);
          break;
        case "biomarker":
          biomarkers.add(label);
          break;
        case "treatment":
          treatments.add(label);
          break;
        case "disease":
          diseases.add(label);
          break;
        case "pathway":
        case "other":
        default:
          pathwaysOrMechanisms.add(label);
          break;
      }
    }
    if (e.provenance.pmid) {
      const studyLabel = `PMID:${e.provenance.pmid}`;
      studies.add(studyLabel);
      addTyped(`pmid:${e.provenance.pmid}`, studyLabel, "study");
    } else if (e.provenance.citationLabel) {
      studies.add(e.provenance.citationLabel);
      addTyped(`cite:${e.id}`, e.provenance.citationLabel, "study");
    }
  }

  return {
    diseases: [...diseases].sort(),
    cells: [...cells].sort(),
    pathwaysOrMechanisms: [...pathwaysOrMechanisms].sort(),
    biomarkers: [...biomarkers].sort(),
    treatments: [...treatments].sort(),
    studies: [...studies].sort(),
    typed: [...typedByKey.values()].sort((a, b) =>
      a.kind === b.kind ? a.label.localeCompare(b.label) : a.kind.localeCompare(b.kind),
    ),
    note: "Buckets are heuristic from illustrative seed labels (T2D + RA/SLE/PsO/IBD pathway stubs). Re-slice after the partner locks disease + question. Empty buckets mean unknown, not 'no biology'. Illustrative disease contexts are not locked pilot indications.",
  };
}

/**
 * Build a pilot evidence pack from current seeds (illustrative substrate only).
 * Disease and research question remain TBD placeholders.
 */
export function buildPilotEvidencePack(opts?: {
  generatedAt?: string;
  evidenceSnapshotRef?: string;
}): PilotEvidencePack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const evidenceSnapshotRef =
    opts?.evidenceSnapshotRef ?? "dist/outputs/latest/hsi-isi-export.json";
  const edges = HSI_T2D_IMMUNO_SEED_EDGES;
  const evidenceMap = edges.map(toEvidenceRow);
  const gradeCounts: Record<HsiGrade, number> = {
    established: 0,
    uncertain: 0,
    unexplored: 0,
  };
  for (const row of evidenceMap) {
    gradeCounts[row.evidenceGrade] += 1;
  }

  const gap = buildSchemaGapReport({ generatedAt });
  const gateC = buildGateCChecklist({ generatedAt });
  const discoveryCentre = buildDiscoveryCentreMeta();

  const competingExplanations: PilotExplanationSlot[] = [
    {
      id: "expl-template-a",
      label: "Competing explanation A (partner question TBD)",
      status: "template",
      relatedClaimIds: [],
      note: "Fill after scoping — keep as a hypothesis, not a fact, until claim IDs are attached.",
    },
    {
      id: "expl-template-b",
      label: "Competing explanation B (partner question TBD)",
      status: "template",
      relatedClaimIds: [],
      note: "Preserve disagreement; do not collapse into a single confident narrative.",
    },
    {
      id: "expl-ra-tnf-axis",
      label: "TNF-centric vs multi-cytokine framing in RA (illustrative)",
      status: "from_illustrative_pathway",
      relatedClaimIds: ["HSI-C-RA-001", "HSI-C-IM-002", "HSI-C-IM-003"],
      note: "Illustrative competing frame from Discovery Centre RA context — not a partner-scoped conclusion. Attach partner claim IDs after lock.",
    },
    {
      id: "expl-sle-ifn-axis",
      label: "Type I IFN–high vs alternate SLE endotypes (illustrative)",
      status: "from_illustrative_pathway",
      relatedClaimIds: ["HSI-C-SLE-001", "HSI-C-SLE-002"],
      note: "Illustrative SLE uncertainty slot — substrate scaffolding only until a named partner locks the question.",
    },
  ];

  const uncertainRows = evidenceMap.filter((r) => r.evidenceGrade === "uncertain").slice(0, 5);
  const uncertainties: PilotExplanationSlot[] = uncertainRows.map((r, i) => ({
    id: `unc-${i + 1}`,
    label: `Uncertainty around ${r.subject} → ${r.object}`,
    status: "from_uncertain_grade",
    relatedClaimIds: [r.claimId],
    note: r.limitations ?? "Grade is uncertain — inspect source and study context before synthesis.",
  }));

  const expertShortlist: PilotExpertItem[] = [
    ...gateC.rows
      .filter((r) => r.gateCStatus === "pending")
      .slice(0, 8)
      .map((r, i) => ({
        id: `gatec-${i + 1}`,
        kind: "pending_gate_c" as const,
        text: `Review Gate C for ${r.isiRelationshipId}: ${r.spoNote}`,
        relatedClaimIds: [r.claimId],
        autoApproved: false as const,
      })),
    ...gap.nextActions.slice(0, 4).map((text, i) => ({
      id: `gap-${i + 1}`,
      kind: "gap" as const,
      text,
      relatedClaimIds: [] as string[],
      autoApproved: false as const,
    })),
    {
      id: "hyp-1",
      kind: "hypothesis",
      text: "Candidate hypothesis slot — attach claim IDs after partner question is locked; never auto-approve into product KG.",
      relatedClaimIds: [],
      autoApproved: false,
    },
    {
      id: "hyp-illustrative-ra",
      kind: "hypothesis",
      text: "Illustrative RA hypothesis slot (TNF / ACPA axis) — replace with partner-scoped gap after disease lock; autoApproved=false.",
      relatedClaimIds: ["HSI-C-RA-001", "HSI-C-RA-002"],
      autoApproved: false,
    },
  ];

  return {
    schemaVersion: PILOT_EVIDENCE_PACK_SCHEMA,
    notCds: true,
    noPatientLevelActions: true,
    autoApproveIntoKg: false,
    generatedAt,
    disease: "TBD",
    researchQuestion: "TBD — lock with partner",
    substrateNote:
      "Evidence rows include illustrative T2D / immuno-metabolic seeds plus Discovery Centre disease-context pathway stubs (RA/SLE/PsO/IBD). None are a locked pilot indication or partner data.",
    discoveryCentre,
    gradeDefinitions: HSI_GRADE_INFO,
    clinicalBoundary: [
      "No individual risk prediction",
      "No diagnosis or treatment recommendation",
      "No automated eligibility or enrollment",
      "No patient outreach or EHR write-back",
      "No Akeno/Aksh patient-level CDS in this pack",
    ],
    questionProject: {
      projectId: "pilot-q-template",
      question: "TBD — lock with partner",
      disease: "TBD",
      scope: {
        population: "unknown",
        tissue: "unknown",
        cellType: "unknown",
        mechanismOrBiomarkerOrTreatmentFocus: "unknown",
        timeWindow: "unknown",
      },
      owner: "TBD",
      workspace: "pilot-template",
      status: "template",
      evidenceSnapshotRef,
      createdAt: generatedAt,
      updatedAt: generatedAt,
    },
    evidenceMap,
    entitySlice: bucketEntities(edges),
    competingExplanations,
    uncertainties,
    expertShortlist,
    researchBriefShell: {
      sections: [
        "question_and_scope",
        "discovery_loop_framing",
        "findings",
        "supporting_evidence",
        "conflicting_evidence",
        "uncertainties",
        "gaps",
        "candidate_hypotheses",
        "citations",
        "reviewer_status",
      ],
      citationRule:
        "Every factual statement must map to claim/source IDs; omit or flag if citations cannot be attached.",
      unsupportedSynthesis: "omit_or_flag",
    },
    linkedArtifacts: {
      isiExport: "hsi-isi-export.json",
      isiRelMap: "hsi-isi-rel-map.json",
      gapReportJson: "hsi-gap-report.json",
      gapReportMd: "hsi-gap-report.md",
      gateCChecklistJson: "gate-c-checklist.json",
      gateCChecklistMd: "gate-c-checklist.md",
    },
    summary: {
      evidenceMapRows: evidenceMap.length,
      gradeCounts,
      missingSourceLabels: evidenceMap.filter((r) => r.source.missing.length > 0).length,
      claimsWithLoinc: evidenceMap.filter((r) => Boolean(r.marker.loinc)).length,
      expertShortlistItems: expertShortlist.length,
      gateCPending: gateC.summary.pendingGateC,
      illustrativeDiseaseContexts: discoveryCentre.illustrativeDiseaseContexts.length,
    },
    nextActions: [
      "Lock disease + research question with a named partner (outreach — not more substrate).",
      "Replace illustrative seed slice with partner-scoped literature once rights are clear.",
      "Agree review rubric and success thresholds before user testing.",
      "Keep Akeno/Aksh patient-level pathways behind M4 / governance gates.",
      "Do not treat RA/SLE/PsO/IBD illustrative contexts as the selected pilot indication.",
    ],
  };
}

export function serializePilotEvidencePack(
  pack: PilotEvidencePack = buildPilotEvidencePack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

/** Human-readable brief shell for partner walkthroughs. */
export function serializePilotEvidencePackMarkdown(
  pack: PilotEvidencePack = buildPilotEvidencePack(),
): string {
  const lines: string[] = [
    "# ISI pilot evidence pack",
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    `**Disease:** ${pack.disease}  `,
    `**Research question:** ${pack.researchQuestion}`,
    "",
    `> ${pack.substrateNote}`,
    "",
    "## Discovery loop (metadata only)",
    "",
    `Framing: **${pack.discoveryCentre.discoveryLoop.framing}** — labels for partner decks; not an interactive Discovery Centre UI.`,
    "",
  ];
  for (const step of pack.discoveryCentre.discoveryLoop.steps) {
    lines.push(`- **${step.label}** — ${step.desc}`);
  }
  lines.push(
    "",
    "### Illustrative disease contexts (not locked)",
    "",
  );
  for (const d of pack.discoveryCentre.illustrativeDiseaseContexts) {
    lines.push(
      `- ${d.label} (\`${d.id}\`) — ${d.status}; lockedPilot=${d.lockedPilot}`,
    );
  }

  lines.push("", "## Clinical boundary", "");
  for (const b of pack.clinicalBoundary) {
    lines.push(`- ${b}`);
  }

  lines.push(
    "",
    "## Question project (template)",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| projectId | ${pack.questionProject.projectId} |`,
    `| disease | ${pack.questionProject.disease} |`,
    `| question | ${pack.questionProject.question} |`,
    `| population | ${pack.questionProject.scope.population} |`,
    `| tissue | ${pack.questionProject.scope.tissue} |`,
    `| cellType | ${pack.questionProject.scope.cellType} |`,
    `| focus | ${pack.questionProject.scope.mechanismOrBiomarkerOrTreatmentFocus} |`,
    `| timeWindow | ${pack.questionProject.scope.timeWindow} |`,
    `| status | ${pack.questionProject.status} |`,
    `| evidence snapshot | ${pack.questionProject.evidenceSnapshotRef} |`,
    "",
    "## Grade definitions",
    "",
  );
  for (const [grade, info] of Object.entries(pack.gradeDefinitions)) {
    lines.push(`- **${info.label}** (\`${grade}\`): ${info.desc}`);
  }

  lines.push(
    "",
    "## 1. Evidence map (sample)",
    "",
    `Rows: ${pack.summary.evidenceMapRows} · established=${pack.summary.gradeCounts.established}, uncertain=${pack.summary.gradeCounts.uncertain}, unexplored=${pack.summary.gradeCounts.unexplored} · rows with missing source fields: ${pack.summary.missingSourceLabels} · claims with LOINC: ${pack.summary.claimsWithLoinc}`,
    "",
    "Graph edges are navigational links, not proof of causality. Conflicting / uncertain grades stay visible.",
    "",
  );

  for (const row of pack.evidenceMap.slice(0, 12)) {
    const src =
      row.source.pmid != null
        ? `PMID:${row.source.pmid}`
        : row.source.citationLabel ?? "(source missing)";
    const miss =
      row.source.missing.length > 0 ? ` · missing: ${row.source.missing.join(", ")}` : "";
    const loinc = row.marker.loinc ? ` · LOINC:${row.marker.loinc}` : "";
    lines.push(
      `- \`${row.claimId}\` [${row.evidenceGrade}/${row.reviewStatus}] ${row.subject} — ${row.relationship} — ${row.object} · ${src}${loinc}${miss}`,
    );
  }
  if (pack.evidenceMap.length > 12) {
    lines.push(`- … ${pack.evidenceMap.length - 12} more rows in JSON`);
  }

  lines.push("", "## 2. Entity slice", "", pack.entitySlice.note, "");
  const sliceEntries: [string, string[]][] = [
    ["Diseases", pack.entitySlice.diseases],
    ["Cells", pack.entitySlice.cells],
    ["Pathways / mechanisms", pack.entitySlice.pathwaysOrMechanisms],
    ["Biomarkers", pack.entitySlice.biomarkers],
    ["Treatments", pack.entitySlice.treatments],
    ["Studies", pack.entitySlice.studies],
  ];
  for (const [title, items] of sliceEntries) {
    lines.push(`### ${title}`, "");
    if (items.length === 0) {
      lines.push("- *(unknown / empty — not 'no evidence')*", "");
    } else {
      for (const item of items.slice(0, 15)) {
        lines.push(`- ${item}`);
      }
      if (items.length > 15) lines.push(`- … ${items.length - 15} more`);
      lines.push("");
    }
  }

  lines.push("## 3. Competing explanations & uncertainties", "");
  for (const slot of [...pack.competingExplanations, ...pack.uncertainties].slice(0, 12)) {
    lines.push(`- **${slot.label}** (${slot.status}): ${slot.note}`);
  }

  lines.push("", "## 4. Expert shortlist (gaps / hypotheses / Gate C)", "");
  for (const item of pack.expertShortlist) {
    lines.push(`- [${item.kind}] ${item.text}`);
  }

  lines.push(
    "",
    "## Research brief shell",
    "",
    `Sections: ${pack.researchBriefShell.sections.join(", ")}`,
    "",
    pack.researchBriefShell.citationRule,
    "",
    "## Linked artifacts",
    "",
  );
  for (const [k, v] of Object.entries(pack.linkedArtifacts)) {
    lines.push(`- ${k}: \`${v}\``);
  }

  lines.push("", "## Next actions", "");
  for (const a of pack.nextActions) {
    lines.push(`- ${a}`);
  }
  lines.push("");
  return lines.join("\n");
}
