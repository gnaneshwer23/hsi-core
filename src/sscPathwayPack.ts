/**
 * SSc Tfh–B–IL-21 pathway pack — dual-track PRD MVP artifact.
 *
 * Separate from the RA pilot evidence pack. Does not replace ASK / partnerLock.
 * Research intelligence only — notCds; no partnerSigned flip.
 */
import { getVerticalDecision, verticalDecisionExportPointer } from "./verticalDecision";
import {
  HSI_SSC_SEED_CLAIMS,
  HSI_SSC_SEED_EDGES,
  SSC_PATHWAY_META,
  sscDeepSeedsLanded,
} from "./seed/sscTfhBIl21";
import {
  SSC_CELL_CARD_SCHEMA,
  SSC_NEIGHBOURHOOD_CARDS,
  type SscNeighbourhoodCard,
} from "./sscCellCards";
import { getPartnerLock } from "./partnerLock";

export const SSC_PATHWAY_PACK_SCHEMA = "hsi-ssc-pathway-pack-1" as const;

export type SscPathwayExplanation = {
  id: string;
  label: string;
  status: "from_literature_slice" | "hypothesized_branch";
  relatedClaimIds: string[];
  note: string;
};

export type SscPathwayPack = {
  schemaVersion: typeof SSC_PATHWAY_PACK_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  pathway: typeof SSC_PATHWAY_META;
  verticalDecision: ReturnType<typeof verticalDecisionExportPointer>;
  /** Reminder: Stage 1 ASK / lock stays RA. */
  stage1ActiveScope: {
    diseaseId: string | null;
    researchQuestion: string | null;
    scopeLocked: boolean;
    partnerSigned: boolean;
  };
  deepSeedsPresent: boolean;
  /** P1.1 — cell / disease cards with CL·MONDO (and related) hints. */
  cellCardSchema: typeof SSC_CELL_CARD_SCHEMA;
  cellCards: readonly SscNeighbourhoodCard[];
  evidenceMap: Array<{
    edgeId: string;
    claimId: string;
    subject: string;
    predicate: string;
    object: string;
    evidenceGrade: string;
    teachingStatus: string;
    pmid: string | null;
    citationLabel: string | null;
    sourceUrl: string | null;
  }>;
  competingExplanations: SscPathwayExplanation[];
  claims: typeof HSI_SSC_SEED_CLAIMS;
  edges: typeof HSI_SSC_SEED_EDGES;
  honesty: string[];
};

export function buildSscPathwayPack(opts?: {
  generatedAt?: string;
}): SscPathwayPack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
  const decision = getVerticalDecision();
  const deepSeedsPresent = sscDeepSeedsLanded();

  const evidenceMap = HSI_SSC_SEED_EDGES.map((e) => ({
    edgeId: e.id,
    claimId: e.claimId,
    subject: e.subjectLabel,
    predicate: e.edgeType,
    object: e.objectLabel,
    evidenceGrade: e.hsiGrade,
    teachingStatus: e.teachingStatus,
    pmid: e.provenance?.pmid ?? null,
    citationLabel: e.provenance?.citationLabel ?? null,
    sourceUrl: e.provenance?.sourceUrl ?? null,
  }));

  const competingExplanations: SscPathwayExplanation[] = [
    {
      id: "expl-ssc-tfh-il21-plasmablast",
      label: "Circulating Tfh ↑ → IL-21 → plasmablast differentiation in SSc",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-SSC-001", "HSI-C-SSC-002", "HSI-C-SSC-003", "HSI-C-SSC-004"],
      note:
        "Primary PRD MVP frame (Ricard 2019 + foundational Tfh/IL-21/B papers). Keep grades honest; Gate C pending.",
    },
    {
      id: "expl-ssc-tfh-fibrosis",
      label: "Tfh-like cells contribute to skin fibrosis",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-SSC-005", "HSI-C-SSC-008"],
      note:
        "Fibrosis-facing complementary frame (Taylor 2018 + Clark 2018 commentary). Do not collapse with autoantibody-only narrative.",
    },
    {
      id: "expl-ssc-tfh1-subset",
      label: "Tfh1-skewed imbalance and aberrant B differentiation",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-SSC-006"],
      note:
        "Competing Tfh-subset explanation (Ly 2021). teaching=hypothesized for subset generalisation.",
    },
    {
      id: "expl-ssc-il21-b-joint",
      label: "Serum IL-21 / CD21low B cells and joint involvement in SSc",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-SSC-009"],
      note:
        "P1.1 neighbourhood deepen (Pellicano 2023). teaching=hypothesized; not Stage 1 RA lock.",
    },
    {
      id: "expl-ssc-ebv-uncertain",
      label: "EBV as separate hypothesized pathogen / fibroblast axis",
      status: "hypothesized_branch",
      relatedClaimIds: ["HSI-C-SSC-007"],
      note:
        "Uncertainty branch only — never hard-merge EBV with Tfh→B→IL-21 as established causation.",
    },
  ];

  return {
    schemaVersion: SSC_PATHWAY_PACK_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt,
    pathway: SSC_PATHWAY_META,
    verticalDecision: verticalDecisionExportPointer(decision),
    stage1ActiveScope: {
      diseaseId: lock.disease?.id ?? null,
      researchQuestion: lock.researchQuestion,
      scopeLocked: lock.scopeLocked,
      partnerSigned: lock.partnerSigned,
    },
    deepSeedsPresent,
    cellCardSchema: SSC_CELL_CARD_SCHEMA,
    cellCards: SSC_NEIGHBOURHOOD_CARDS,
    evidenceMap,
    competingExplanations,
    claims: HSI_SSC_SEED_CLAIMS,
    edges: HSI_SSC_SEED_EDGES,
    honesty: [
      "Dual-track option A: RA Stage 1 scopeLocked packs untouched; this pack is parallel PRD MVP depth.",
      "Discovery ASK question remains the RA / anti-TNF research question.",
      "partnerSigned=false; lockedPilot=false — no MoU invented.",
      "EBV edge is hypothesized/uncertain only — do not overclaim.",
      "Cell cards carry CL·MONDO (and related) hints with bindStatus=hint_only — not full ontology bind.",
      "Not clinical decision support. autoApproveIntoKg=false.",
      `deepSeedsPresent=${deepSeedsPresent} because verified PMID edges landed.`,
      `P1.1 deepen: ${SSC_NEIGHBOURHOOD_CARDS.length} neighbourhood cards · ${HSI_SSC_SEED_EDGES.length} edges.`,
    ],
  };
}

export function serializeSscPathwayPack(
  pack: SscPathwayPack = buildSscPathwayPack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function serializeSscPathwayPackMarkdown(
  pack: SscPathwayPack = buildSscPathwayPack(),
): string {
  const lines: string[] = [
    `# SSc pathway pack — ${pack.pathway.label}`,
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    "**notCds** · **autoApproveIntoKg=false** · dual-track PRD MVP (does not replace RA ASK).",
    "",
    "## Vertical decision",
    "",
    `- Strategy: **${pack.verticalDecision.verticalStrategy}** (option ${getVerticalDecision().option})`,
    `- Active Stage 1 scope: \`${pack.verticalDecision.activeScope}\``,
    `- PRD MVP target: \`${pack.verticalDecision.prdMvpTarget}\``,
    `- deepSeedsPresent: **${pack.deepSeedsPresent}**`,
    "",
    "## Stage 1 lock (unchanged)",
    "",
    `- Disease: ${pack.stage1ActiveScope.diseaseId ?? "TBD"}`,
    `- scopeLocked: ${pack.stage1ActiveScope.scopeLocked}`,
    `- partnerSigned: ${pack.stage1ActiveScope.partnerSigned}`,
    "",
    "## Neighbourhood cell cards (CL·MONDO hints)",
    "",
    `Schema: \`${pack.cellCardSchema}\` · cards: ${pack.cellCards.length}`,
    "",
  ];
  for (const card of pack.cellCards) {
    const ont =
      card.ontologyHints.length > 0
        ? card.ontologyHints.map((h) => `${h.id} (${h.bindStatus})`).join(", ")
        : "none";
    lines.push(
      `- **${card.id}** ${card.label} (\`${card.nodeId}\`) · ontology: ${ont}`,
    );
  }
  lines.push("", "## Evidence map", "");
  for (const row of pack.evidenceMap) {
    lines.push(
      `- **${row.edgeId}** ${row.subject} —[${row.predicate}]→ ${row.object} · grade=${row.evidenceGrade} · teaching=${row.teachingStatus} · PMID ${row.pmid ?? "none"}`,
    );
  }
  lines.push("", "## Competing explanations", "");
  for (const e of pack.competingExplanations) {
    lines.push(`- **${e.id}** (${e.status}): ${e.label}`);
    lines.push(`  - ${e.note}`);
  }
  lines.push("", "## Honesty", "");
  for (const h of pack.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return lines.join("\n");
}
