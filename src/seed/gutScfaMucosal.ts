/**
 * Gut–immune neighbourhood — SCFA / butyrate ↔ mucosal Treg / Th17 (+ barrier).
 *
 * P1.3 thin literature slice for systems vision gut axis. Does **not** replace
 * RA Stage 1 ASK / partnerLock, does **not** touch SSc dual-track A, does **not**
 * flip partnerSigned. EBV-style overclaim forbidden: Th17 edges stay hypothesized
 * competing frames (promote vs inhibit), never merged as settled causation.
 *
 * Verified public PMIDs (PubMed, 2026-11-01):
 * - 21205640 Atarashi 2011 Science — Clostridia → colonic Treg
 * - 23842501 Atarashi 2013 Nature — human Clostridia mix → Treg
 * - 24226770 Furusawa 2013 Nature — butyrate → colonic Treg differentiation
 * - 23828891 Smith 2013 Science — SCFA → colonic Treg (Ffar2/GPR43)
 * - 24917457 Park 2015 Mucosal Immunol — SCFA can promote Th17 (milieu-dependent)
 * - 30918945 Chen 2019 Inflamm Bowel Dis — butyrate can inhibit Th17 (competing)
 * - 19625695 Peng 2009 J Nutr — butyrate → epithelial tight-junction / barrier
 *
 * Not Gate C approved. Not CDS. Most evidence is mouse / in vitro — grades stay
 * honest (`source-verified` → hsiGrade `uncertain`; teaching associative/hypothesized).
 */
import { gradeForSeed } from "../validate";
import type { HsiClaim, HsiEdge } from "../schema";
import type { HsiCurationReview, HsiTeachingStatus } from "../grades";
import type { SystemsCrossAxisPredicate } from "../systemsAxes";

const RECORDED = "2026-11-01T18:30:00.000Z";

function prov(
  partial: Partial<{
    pmid: string | null;
    doi: string | null;
    citationLabel: string | null;
    sourceUrl: string | null;
    notes: string | null;
  }> = {},
) {
  return {
    pmid: partial.pmid ?? null,
    doi: partial.doi ?? null,
    citationLabel: partial.citationLabel ?? null,
    sourceUrl: partial.sourceUrl ?? null,
    notes:
      partial.notes ??
      "Gut–immune P1.3 seed — awaiting Gate C human review. Not CDS.",
    recordedAt: RECORDED,
  };
}

type SeedSpec = {
  id: string;
  edgeType: HsiEdge["edgeType"];
  /** Systems-vision cross-axis predicate (mapped onto Phase 0 HSI_EDGE_TYPES). */
  systemsPredicate: SystemsCrossAxisPredicate;
  subjectId: string;
  subjectLabel: string;
  objectId: string;
  objectLabel: string;
  claimId: string;
  assertion: string;
  review: HsiCurationReview;
  teaching: HsiTeachingStatus;
  domain: HsiEdge["domain"];
  bridgeCandidate?: boolean;
  pmid?: string | null;
  doi?: string | null;
  citationLabel?: string | null;
  sourceUrl?: string | null;
  notes?: string | null;
};

/**
 * Thin SCFA ↔ mucosal Treg/Th17 + barrier slice.
 * Primary claim/edge ids: HSI-C-GUT-* / HSI-E-GUT-*.
 */
const SPECS: SeedSpec[] = [
  {
    id: "HSI-E-GUT-001",
    edgeType: "associated_with",
    systemsPredicate: "modulates_immune",
    subjectId: "HSI-N-clostridia-iv-xiva",
    subjectLabel: "Clostridium clusters IV / XIVa (gut)",
    objectId: "HSI-N-mucosal-treg",
    objectLabel: "Colonic / mucosal Foxp3+ Treg",
    claimId: "HSI-C-GUT-001",
    assertion:
      "Indigenous Clostridium clusters IV and XIVa promote accumulation of colonic Foxp3+ regulatory T cells (mouse gut–immune neighbourhood seed — not CDS; not Stage 1 RA lock).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "21205640",
    doi: "10.1126/science.1198469",
    citationLabel:
      "Atarashi K et al. Science 2011 — Induction of colonic regulatory T cells by indigenous Clostridium species.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/21205640/",
    notes:
      "P1.3 gut–immune context edge. PMID 21205640 verified. Mouse colonization evidence; teaching=associative. Do not overclaim human therapeutic causation. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-GUT-002",
    edgeType: "associated_with",
    systemsPredicate: "modulates_immune",
    subjectId: "HSI-N-clostridia-human-mix",
    subjectLabel: "Human microbiota Clostridia mix (17-strain class)",
    objectId: "HSI-N-mucosal-treg",
    objectLabel: "Colonic / mucosal Foxp3+ Treg",
    claimId: "HSI-C-GUT-002",
    assertion:
      "A rationally selected mixture of human microbiota Clostridia strains induces Treg abundance and anti-inflammatory programs in germ-free mouse models (gut–immune neighbourhood; not human CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "23842501",
    doi: "10.1038/nature12331",
    citationLabel:
      "Atarashi K et al. Nature 2013 — Treg induction by a rationally selected mixture of Clostridia strains from the human microbiota.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/23842501/",
    notes:
      "P1.3. PMID 23842501 verified. Human-derived strains tested in mice — keep uncertain grades; no partnerSigned / no CDS. Gate C = human only.",
  },
  {
    id: "HSI-E-GUT-003",
    edgeType: "upregulates",
    systemsPredicate: "produces_metabolite_sensed_by",
    subjectId: "HSI-N-butyrate",
    subjectLabel: "Butyrate (SCFA)",
    objectId: "HSI-N-mucosal-treg",
    objectLabel: "Colonic / mucosal Foxp3+ Treg",
    claimId: "HSI-C-GUT-003",
    assertion:
      "Commensal microbe-derived butyrate induces differentiation of colonic regulatory T cells (core SCFA ↔ mucosal Treg axis; mouse Nature 2013 evidence).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "24226770",
    doi: "10.1038/nature12721",
    citationLabel:
      "Furusawa Y et al. Nature 2013 — Commensal microbe-derived butyrate induces the differentiation of colonic regulatory T cells.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24226770/",
    notes:
      "P1.3 primary SCFA→Treg edge. PMID 24226770 verified. Maps systemsPredicate produces_metabolite_sensed_by → HSI upregulates. Mouse / HDAC–Foxp3 mechanism — not human disease claim. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-GUT-004",
    edgeType: "associated_with",
    systemsPredicate: "modulates_immune",
    subjectId: "HSI-N-scfa",
    subjectLabel: "Short-chain fatty acids (class)",
    objectId: "HSI-N-mucosal-treg",
    objectLabel: "Colonic / mucosal Foxp3+ Treg",
    claimId: "HSI-C-GUT-004",
    assertion:
      "Microbiota-derived short-chain fatty acids regulate size and function of the colonic Treg pool in an Ffar2 (GPR43)-dependent manner in mice (SCFA class ↔ mucosal Treg).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    bridgeCandidate: true,
    pmid: "23828891",
    doi: "10.1126/science.1241165",
    citationLabel:
      "Smith PM et al. Science 2013 — The microbial metabolites, short-chain fatty acids, regulate colonic Treg cell homeostasis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/23828891/",
    notes:
      "P1.3 SCFA-class companion to butyrate edge. PMID 23828891 verified. Mouse Ffar2 dependency — teaching=associative; hsiGrade uncertain. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-GUT-005",
    edgeType: "upregulates",
    systemsPredicate: "hypothesized_gut_immune",
    subjectId: "HSI-N-scfa",
    subjectLabel: "Short-chain fatty acids (class)",
    objectId: "HSI-N-mucosal-th17",
    objectLabel: "Mucosal Th17 cells",
    claimId: "HSI-C-GUT-005",
    assertion:
      "SCFAs can promote T-cell differentiation into IL-17-producing (Th17) cells depending on cytokine milieu via HDAC inhibition / mTOR–S6K (competing frame vs Th17 inhibition — hypothesized only).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    pmid: "24917457",
    doi: "10.1038/mi.2014.44",
    citationLabel:
      "Park J et al. Mucosal Immunol 2015 — Short-chain fatty acids induce both effector and regulatory T cells by suppression of histone deacetylases and regulation of the mTOR-S6K pathway.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24917457/",
    notes:
      "P1.3 competing Th17-promote frame. PMID 24917457 verified. teaching=hypothesized — milieu-dependent; NEVER hard-merge with butyrate→Th17 inhibition or Treg edges as settled causation (EBV-style overclaim ban). Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-GUT-006",
    edgeType: "inhibits",
    systemsPredicate: "hypothesized_gut_immune",
    subjectId: "HSI-N-butyrate",
    subjectLabel: "Butyrate (SCFA)",
    objectId: "HSI-N-mucosal-th17",
    objectLabel: "Mucosal Th17 cells",
    claimId: "HSI-C-GUT-006",
    assertion:
      "Butyrate can inhibit Th17 differentiation (IL-17 / RORγt axis) while upregulating IL-10 in T-cell models of colitis induction (competing frame vs SCFA→Th17 promotion — hypothesized only).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "immuno_metabolic",
    pmid: "30918945",
    doi: "10.1093/ibd/izz046",
    citationLabel:
      "Chen L et al. Inflamm Bowel Dis 2019 — Microbiota metabolite butyrate differentially regulates Th1 and Th17 cells’ differentiation and function in induction of colitis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30918945/",
    notes:
      "P1.3 competing Th17-inhibit frame. PMID 30918945 verified. Keep separate from HSI-E-GUT-005 — do not collapse promote vs inhibit. teaching=hypothesized. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-GUT-007",
    edgeType: "upregulates",
    systemsPredicate: "modulates_immune",
    subjectId: "HSI-N-butyrate",
    subjectLabel: "Butyrate (SCFA)",
    objectId: "HSI-N-gut-barrier",
    objectLabel: "Intestinal epithelial barrier / tight junctions",
    claimId: "HSI-C-GUT-007",
    assertion:
      "Butyrate enhances intestinal barrier function by facilitating tight-junction assembly via AMPK activation in Caco-2 monolayers (barrier context for mucosal immune neighbourhood).",
    review: "source-verified",
    teaching: "associative",
    domain: "immuno_metabolic",
    pmid: "19625695",
    doi: "10.3945/jn.109.104638",
    citationLabel:
      "Peng L et al. J Nutr 2009 — Butyrate enhances the intestinal barrier by facilitating tight junction assembly via activation of AMP-activated protein kinase in Caco-2 cell monolayers.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19625695/",
    notes:
      "P1.3 barrier context. PMID 19625695 verified. In vitro Caco-2 — not in-vivo human barrier claim; teaching=associative. Dose-paradox papers exist elsewhere — do not overclaim. Gate C = human only. Not CDS.",
  },
];

function toEdge(spec: SeedSpec): HsiEdge {
  const curationReview = spec.review;
  return {
    id: spec.id,
    edgeType: spec.edgeType,
    subjectId: spec.subjectId,
    subjectLabel: spec.subjectLabel,
    objectId: spec.objectId,
    objectLabel: spec.objectLabel,
    claimId: spec.claimId,
    curationReview,
    hsiGrade: gradeForSeed(curationReview),
    teachingStatus: spec.teaching,
    domain: spec.domain,
    provenance: prov({
      pmid: spec.pmid ?? null,
      doi: spec.doi ?? null,
      citationLabel: spec.citationLabel ?? null,
      sourceUrl: spec.sourceUrl ?? null,
      notes: spec.notes ?? null,
    }),
    bridgeCandidate: Boolean(spec.bridgeCandidate),
    seedKind: "placeholder",
  };
}

function toClaim(spec: SeedSpec): HsiClaim {
  return {
    id: spec.claimId,
    assertion: spec.assertion,
    domain: spec.domain,
    isiRelationshipId: null,
    akshNodeId: null,
  };
}

export const HSI_GUT_SEED_EDGES: HsiEdge[] = SPECS.map(toEdge);
export const HSI_GUT_SEED_CLAIMS: HsiClaim[] = SPECS.map(toClaim);

/** Systems-predicate annotations parallel to edges (not on HsiEdge schema yet — P1.4). */
export const HSI_GUT_SEED_SYSTEMS_PREDICATES: ReadonlyArray<{
  edgeId: string;
  systemsPredicate: SystemsCrossAxisPredicate;
}> = SPECS.map((s) => ({
  edgeId: s.id,
  systemsPredicate: s.systemsPredicate,
}));

export const GUT_PATHWAY_ID = "gut-scfa-mucosal-treg-th17" as const;

export const GUT_PATHWAY_META = {
  id: GUT_PATHWAY_ID,
  label: "Gut–immune · SCFA / butyrate ↔ mucosal Treg / Th17",
  role: "systems_secondary_axis" as const,
  verticalStrategy: "dual_track" as const,
  deepSeedsPresent: true as const,
  rationale:
    "P1.3 first honest gut–immune literature slice for systems vision. Secondary Discovery axis only — does not replace RA ASK. Th17 promote vs inhibit kept as competing hypothesized frames. Mouse/in-vitro predominant.",
  primaryClaimIds: SPECS.map((s) => s.claimId),
  primaryEdgeIds: SPECS.map((s) => s.id),
  primaryPmids: [
    "21205640",
    "23842501",
    "24226770",
    "23828891",
    "24917457",
    "30918945",
    "19625695",
  ],
  deepenPhase: "p1_3_gut_scfa_mucosal" as const,
  entities: [
    { id: "HSI-N-scfa", label: "SCFA (class)", kind: "metabolite" },
    { id: "HSI-N-butyrate", label: "Butyrate", kind: "metabolite" },
    { id: "HSI-N-mucosal-treg", label: "Mucosal / colonic Treg", kind: "cell_subset" },
    { id: "HSI-N-mucosal-th17", label: "Mucosal Th17", kind: "cell_subset" },
    { id: "HSI-N-gut-barrier", label: "Intestinal epithelial barrier", kind: "barrier_compartment" },
    {
      id: "HSI-N-clostridia-iv-xiva",
      label: "Clostridia IV / XIVa",
      kind: "taxon_class",
    },
    {
      id: "HSI-N-clostridia-human-mix",
      label: "Human Clostridia mix",
      kind: "community",
    },
  ],
} as const;

/** True when at least one gut edge carries a verified PMID locator. */
export function gutDeepSeedsLanded(
  edges: readonly HsiEdge[] = HSI_GUT_SEED_EDGES,
): boolean {
  return edges.some(
    (e) =>
      e.id.startsWith("HSI-E-GUT-") && Boolean(e.provenance?.pmid?.trim()),
  );
}
