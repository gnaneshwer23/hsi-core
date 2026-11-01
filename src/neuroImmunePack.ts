/**
 * Neuroimmune vagus / cholinergic anti-inflammatory pathway pack —
 * systems secondary axis (P2.1).
 *
 * Does not replace RA ASK / partnerLock. Does not touch SSc dual-track or
 * gut P1.3 packs. Research intelligence only — notCds; no partnerSigned flip;
 * no clinical brain–immune cure claims.
 */
import { getVerticalDecision, verticalDecisionExportPointer } from "./verticalDecision";
import {
  HSI_NI_SEED_CLAIMS,
  HSI_NI_SEED_EDGES,
  HSI_NI_SEED_SYSTEMS_PREDICATES,
  NI_PATHWAY_META,
  neuroDeepSeedsLanded,
} from "./seed/neuroVagusCholinergic";
import { getPartnerLock } from "./partnerLock";
import { SYSTEMS_PREDICATE_TO_HSI_EDGE } from "./systemsAxes";

export const NEURO_IMMUNE_PACK_SCHEMA = "hsi-neuroimmune-pack-1" as const;

export type NeuroPathwayExplanation = {
  id: string;
  label: string;
  status: "from_literature_slice" | "hypothesized_branch";
  relatedClaimIds: string[];
  note: string;
};

export type NeuroImmunePack = {
  schemaVersion: typeof NEURO_IMMUNE_PACK_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string;
  pathway: typeof NI_PATHWAY_META;
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
  competingExplanations: NeuroPathwayExplanation[];
  claims: typeof HSI_NI_SEED_CLAIMS;
  edges: typeof HSI_NI_SEED_EDGES;
  honesty: string[];
};

export function buildNeuroImmunePack(opts?: {
  generatedAt?: string;
}): NeuroImmunePack {
  const generatedAt = opts?.generatedAt ?? new Date().toISOString();
  const lock = getPartnerLock();
  const decision = getVerticalDecision();
  const deepSeedsPresent = neuroDeepSeedsLanded();

  const predicateByEdge = new Map(
    HSI_NI_SEED_SYSTEMS_PREDICATES.map((p) => [p.edgeId, p.systemsPredicate]),
  );

  const evidenceMap = HSI_NI_SEED_EDGES.map((e) => {
    const systemsPredicate =
      predicateByEdge.get(e.id) ?? "hypothesized_brain_immune";
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

  const competingExplanations: NeuroPathwayExplanation[] = [
    {
      id: "expl-ni-vagus-suppresses-tnf",
      label: "Efferent vagus stimulation → lower systemic / hepatic TNF",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-001"],
      note:
        "Landmark endotoxaemia frame (Borovikova 2000). Rodent — keep grades uncertain; not human cure.",
    },
    {
      id: "expl-ni-inflammatory-reflex-axis",
      label: "Inflammatory reflex as hard-wired autonomic cytokine control",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-002"],
      note:
        "Conceptual axis (Tracey 2002 review). Framing only — not a protocol or CDS claim.",
    },
    {
      id: "expl-ni-alpha7-macrophage-tnf",
      label: "α7 nAChR required for cholinergic macrophage TNF inhibition",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-003"],
      note:
        "Receptor node (Wang 2003). Mouse genetics — do not invent human dosing edges.",
    },
    {
      id: "expl-ni-alpha7-jak2-stat3",
      label: "Vagus / α7 → Jak2–STAT3 attenuates macrophage activation",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-004"],
      note:
        "Mechanism companion (de Jonge 2005). Keep separate from human VNS pilot.",
    },
    {
      id: "expl-ni-chat-tcell-relay",
      label: "ACh-synthesizing T cells relay vagus → macrophage TNF brake",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-005"],
      note:
        "Neural→lymphoid hop (Rosas-Ballina 2011). Mouse circuit — associative only.",
    },
    {
      id: "expl-ni-vns-ra-human-pilot",
      label: "Implantable VNS modulates TNF / RA scores (human pilot)",
      status: "hypothesized_branch",
      relatedClaimIds: ["HSI-C-NI-006"],
      note:
        "Koopman 2016 PNAS pilot — teaching=hypothesized. NEVER overclaim clinical brain–immune cure or CDS.",
    },
    {
      id: "expl-ni-spleen-required",
      label: "Spleen required for cholinergic anti-inflammatory pathway",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-007"],
      note:
        "Depth deepen (Huston 2006). Splenectomy abolishes VNS TNF brake — rodent organ hop.",
    },
    {
      id: "expl-ni-splenic-nerve-tnf",
      label: "Splenic nerve required for cholinergic TNF control",
      status: "from_literature_slice",
      relatedClaimIds: ["HSI-C-NI-008"],
      note:
        "Depth deepen (Rosas-Ballina 2008). Catecholaminergic splenic nerve wiring — not human CDS.",
    },
  ];

  return {
    schemaVersion: NEURO_IMMUNE_PACK_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt,
    pathway: NI_PATHWAY_META,
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
    claims: HSI_NI_SEED_CLAIMS,
    edges: HSI_NI_SEED_EDGES,
    honesty: [
      "Systems secondary axis only — Discovery ASK question remains the RA / anti-TNF research question.",
      "SSc dual-track A + gut P1.3 packs untouched; RA Stage 1 scopeLocked packs untouched.",
      `partnerSigned=${lock.partnerSigned}; lockedPilot=${lock.lockedPilot}; legalBinding=${lock.legalBinding}; isHypothetical=${lock.isHypothetical} — MoU operator-asserted when named; still not CDS.`,
      "Neighbourhood choice: vagus / cholinergic anti-inflammatory reflex — clearest landmark PMID chain vs microglia or BBB atlases.",
      "Human VNS–RA (Koopman) is hypothesized only — never a clinical brain–immune cure claim.",
      "Most mechanism PMIDs are rodent — hsiGrade stays uncertain (source-verified); not human therapeutic claims.",
      "Not clinical decision support. autoApproveIntoKg=false. No PHI.",
      `deepSeedsPresent=${deepSeedsPresent} because verified PMID edges landed.`,
      `P2.1 slice: ${HSI_NI_SEED_EDGES.length} edges · ${NI_PATHWAY_META.primaryPmids.length} PMIDs.`,
    ],
  };
}

export function serializeNeuroImmunePack(
  pack: NeuroImmunePack = buildNeuroImmunePack(),
): string {
  return `${JSON.stringify(pack, null, 2)}\n`;
}

export function serializeNeuroImmunePackMarkdown(
  pack: NeuroImmunePack = buildNeuroImmunePack(),
): string {
  const lines: string[] = [
    `# Neuroimmune pack — ${pack.pathway.label}`,
    "",
    `Schema: \`${pack.schemaVersion}\` · generated ${pack.generatedAt}`,
    "",
    "**notCds** · **autoApproveIntoKg=false** · systems secondary axis (does not replace RA ASK).",
    "",
    "## Why this neighbourhood",
    "",
    pack.pathway.neighbourhoodChoiceRationale,
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
