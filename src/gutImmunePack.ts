/**
 * Gut–immune SCFA ↔ mucosal Treg/Th17 pathway pack — systems secondary axis.
 *
 * Does not replace RA ASK / partnerLock. Does not touch SSc dual-track pack.
 * Research intelligence only — notCds; no partnerSigned flip.
 */
import { getVerticalDecision, verticalDecisionExportPointer } from "./verticalDecision";
import {
  GUT_PATHWAY_META,
  HSI_GUT_SEED_CLAIMS,
  HSI_GUT_SEED_EDGES,
  HSI_GUT_SEED_SYSTEMS_PREDICATES,
  gutDeepSeedsLanded,
} from "./seed/gutScfaMucosal";
import { getPartnerLock } from "./partnerLock";
import { SYSTEMS_PREDICATE_TO_HSI_EDGE } from "./systemsAxes";

export const GUT_IMMUNE_PACK_SCHEMA = "hsi-gut-immune-pack-1" as const;

export type GutPathwayExplanation = {
  id: string;
  label: string;
  status: "from_literature_slice" | "hypothesized_branch";
  relatedClaimIds: string[];
  note: string;
};

export type GutImmunePack = {
  schemaVersion: typeof GUT_IMMUNE_PACK_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  pathway: typeof GUT_PATHWAY_META;
  verticalDecision: ReturnType<typeof verticalDecisionExportPointer>;
  /** Reminder: Stage 1 ASK / lock stays RA. */
  stage1ActiveScope: {
    diseaseId: string | null;
    researchQuestion: string | null;
    scopeLocked: boolean;
    partnerSigned: boolean;
  };
  discoveryRole: "systems_secondary_axis";
  deepSeedsPresent: boolean;
  evidenceMap: Array<{
    edgeId: string;
    claimId: string;
    subject: string;
    predicate: string;
    systemsPredicate: string;
    systemsPredicateMapsToHsi: string;
    object: string;
    evidenceGrade: string;
    teachingStatus: string;
    pmid: string | null;
    citationLabel: string | null;
    sourceUrl: string | null;
  }>;
  competingExplanations: GutPathwayExplanation[];
  claims: typeof HSI_GUT_SEED_CLAIMS;
  edges: typeof HSI_GUT_SEED_EDGES;
  honesty: string[];
};

export function buildGutImmunePack(opts?: {
  generatedAt?: string;
}): GutImmunePack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
  const decision = getVerticalDecision();
  const deepSeedsPresent = gutDeepSeedsLanded();

  const predicateByEdge = new Map(
    HSI_GUT_SEED_SYSTEMS_PREDICATES.map((p) => [p.edgeId, p.systemsPredicate]),
  );

  const evidenceMap = HSI_GUT_SEED_EDGES.map((e) => {
    const systemsPredicate = predicateByEdge.get(e.id) ?? "hypothesized_gut_immune";
    return {
      edgeId: e.id,
      claimId: e.claimId,
      subject: e.subjectLabel,
      predicate: e.edgeType,
      systemsPredicate,
      systemsPredicateMapsToHsi: SYSTEMS_PREDICATE_TO_HSI_EDGE[systemsPredicate],
      object: e.objectLabel,
      evidenceGrade: e.hsiGrade,
      teachingStatus: e.teachingStatus,
      pmid: e.provenance?.pmid ?? null,
      citationLabel: e.provenance?.citationLabel ?? null,
      sourceUrl: e.provenance?.sourceUrl ?? null,
    };
  });

  const competingExplanations: GutPathwayExplanation[] = [
    {
      id: "expl-gut-butyrate-colonic-treg",
      label: "Butyrate → colonic Foxp3+ Treg differentiation",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-GUT-003"],
      note:
        "Primary SCFA↔Treg frame (Furusawa 2013). Mouse HDAC–Foxp3 evidence; keep grades uncertain.",
    },
    {
      id: "expl-gut-scfa-ffar2-treg",
      label: "SCFA class → colonic Treg pool via Ffar2/GPR43",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-GUT-004"],
      note:
        "Companion class-level frame (Smith 2013). Do not collapse with butyrate-only narrative.",
    },
    {
      id: "expl-gut-clostridia-treg-niche",
      label: "Clostridia communities induce colonic Treg niche",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-GUT-001", "HSI-C-GUT-002"],
      note:
        "Upstream microbial context for SCFA neighbourhood (Atarashi 2011/2013). Not species-level disease claims.",
    },
    {
      id: "expl-gut-scfa-th17-promote",
      label: "SCFA promote Th17 under inflammatory cytokine milieu",
      status: "hypothesized_branch",
      relatedClaimIds: ["HSI-C-GUT-005"],
      note:
        "Competing Th17 frame (Park 2015). teaching=hypothesized — never hard-merge with Th17 inhibition.",
    },
    {
      id: "expl-gut-butyrate-th17-inhibit",
      label: "Butyrate inhibits Th17 / RORγt while raising IL-10",
      status: "hypothesized_branch",
      relatedClaimIds: ["HSI-C-GUT-006"],
      note:
        "Competing Th17 frame (Chen 2019). Keep separate from promote branch — EBV-style overclaim ban.",
    },
    {
      id: "expl-gut-butyrate-barrier",
      label: "Butyrate supports epithelial tight-junction / barrier",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-GUT-007"],
      note:
        "Barrier context (Peng 2009 Caco-2). In vitro only; dose-paradox literature exists — do not overclaim.",
    },
  ];

  return {
    schemaVersion: GUT_IMMUNE_PACK_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt,
    pathway: GUT_PATHWAY_META,
    verticalDecision: verticalDecisionExportPointer(decision),
    stage1ActiveScope: {
      diseaseId: lock.disease?.id ?? null,
      researchQuestion: lock.researchQuestion,
      scopeLocked: lock.scopeLocked,
      partnerSigned: lock.partnerSigned,
    },
    discoveryRole: "systems_secondary_axis",
    deepSeedsPresent,
    evidenceMap,
    competingExplanations,
    claims: HSI_GUT_SEED_CLAIMS,
    edges: HSI_GUT_SEED_EDGES,
    honesty: [
      "Systems secondary axis only — Discovery ASK question remains the RA / anti-TNF research question.",
      "SSc dual-track A pack untouched; RA Stage 1 scopeLocked packs untouched.",
      "partnerSigned=false; lockedPilot=false — no MoU invented.",
      "Th17 promote (Park) vs inhibit (Chen) are hypothesized competing frames — never collapse.",
      "Most PMIDs are mouse or Caco-2 — hsiGrade stays uncertain (source-verified); not human therapeutic claims.",
      "Not clinical decision support. autoApproveIntoKg=false.",
      `deepSeedsPresent=${deepSeedsPresent} because verified PMID edges landed.`,
      `P1.3 slice: ${HSI_GUT_SEED_EDGES.length} edges · ${GUT_PATHWAY_META.primaryPmids.length} PMIDs.`,
    ],
  };
}

export function serializeGutImmunePack(
  pack: GutImmunePack = buildGutImmunePack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function serializeGutImmunePackMarkdown(
  pack: GutImmunePack = buildGutImmunePack(),
): string {
  const lines: string[] = [
    `# Gut–immune pack — ${pack.pathway.label}`,
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    "**notCds** · **autoApproveIntoKg=false** · systems secondary axis (does not replace RA ASK).",
    "",
    "## Role",
    "",
    `- Discovery role: **${pack.discoveryRole}**`,
    `- deepSeedsPresent: **${pack.deepSeedsPresent}**`,
    `- Stage 1 active scope disease: ${pack.stage1ActiveScope.diseaseId ?? "TBD"}`,
    `- partnerSigned: ${pack.stage1ActiveScope.partnerSigned}`,
    "",
    "## Competing explanations",
    "",
  ];
  for (const expl of pack.competingExplanations) {
    lines.push(
      `- **${expl.label}** (\`${expl.status}\`) — claims: ${expl.relatedClaimIds.join(", ")}`,
      `  - ${expl.note}`,
      "",
    );
  }
  lines.push("## Evidence map", "");
  for (const row of pack.evidenceMap) {
    lines.push(
      `- **${row.edgeId}** ${row.subject} —[${row.predicate} / ${row.systemsPredicate}]→ ${row.object} · grade=${row.evidenceGrade} · teaching=${row.teachingStatus} · PMID ${row.pmid ?? "none"}`,
    );
  }
  lines.push("", "## Honesty", "");
  for (const h of pack.honesty) {
    lines.push(`- ${h}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}
