/**
 * SSc CD4/Tfh–B-cell–IL-21 pathway — deepened literature slice (dual-track A / P1.1).
 *
 * Parallel to RA/TNF Stage 1 lock. Does **not** replace partnerLock disease/question.
 * EBV is a separate hypothesized/uncertain branch — never merged as proven causation.
 * Cell-card / CL·MONDO hints live in `src/sscCellCards.ts` (pack-exported).
 *
 * Verified public PMIDs (PubMed E-utilities, 2026-11-01):
 * - 30760472 Ricard 2019 Ann Rheum Dis — circulating Tfh↑ in SSc; IL-21 → plasmablast
 * - 29514998 Taylor 2018 Sci Transl Med — Tfh-like cells contribute to skin fibrosis
 * - 29626172 Clark 2018 Sci Immunol — commentary: Tfh drive skin fibrosis (neighbourhood)
 * - 33175976 Ly 2021 Rheumatology — Tfh1 imbalance / aberrant B differentiation in SSc
 * - 37763102 Pellicano 2023 J Pers Med — SSc CD21low B + serum IL-21 / joint involvement
 * - 21314428 Crotty 2011 Annu Rev Immunol — Tfh biology (IL-21 axis; not SSc-specific)
 * - 16339522 Ettinger 2005 J Immunol — IL-21 → human B → plasma cells
 * - 24129067 Farina 2014 J Invest Dermatol — EBV / scleroderma fibroblast axis (hypothesized only)
 * - 24350901 van Bon 2014 NEJM — CXCL4 / pDC biomarker in SSc
 * - 29853453 Denton 2018 Ann Rheum Dis — IL-6 blockade reverses TGF-β pathway (faSScinate insight)
 * - 19180481 Lafyatis 2009 Arthritis Rheum — rituximab B depletion in dcSSc (pilot; hypothesized)
 *
 * Not Gate C approved. Not CDS. Dual-track only — does not replace RA ASK.
 */
import { gradeForSeed } from "../validate";
import type { HsiClaim, HsiEdge } from "../schema";
import type { HsiCurationReview, HsiTeachingStatus } from "../grades";

const RECORDED = "2026-11-01T17:00:00.000Z";

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
      "SSc dual-track seed — awaiting Gate C human review. Not CDS.",
    recordedAt: RECORDED,
  };
}

type SeedSpec = {
  id: string;
  edgeType: HsiEdge["edgeType"];
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
 * Thin SSc Tfh–B–IL-21 slice + competing Tfh-subset frame + EBV hypothesized branch.
 * Primary claim/edge ids: HSI-C-SSC-* / HSI-E-SSC-*.
 */
const SPECS: SeedSpec[] = [
  {
    id: "HSI-E-SSC-001",
    edgeType: "associated_with",
    subjectId: "HSI-N-tfh",
    subjectLabel: "T follicular helper (Tfh) cells",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-001",
    assertion:
      "Circulating follicular helper T cells are increased in systemic sclerosis (dual-track PRD MVP seed — not Stage 1 partner lock; not CDS).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "30760472",
    doi: "10.1136/annrheumdis-2018-214382",
    citationLabel:
      "Ricard L et al. Ann Rheum Dis 2019 — Circulating follicular helper T cells are increased in systemic sclerosis and promote plasmablast differentiation through the IL-21 pathway.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30760472/",
    notes:
      "Dual-track SSc pathway seed (prd_mvp_target). PMID 30760472 verified via PubMed. Does not replace RA scopeLocked question. Gate C = human Neon approve only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-002",
    edgeType: "produces",
    subjectId: "HSI-N-tfh",
    subjectLabel: "T follicular helper (Tfh) cells",
    objectId: "HSI-N-il21",
    objectLabel: "IL-21",
    claimId: "HSI-C-SSC-002",
    assertion:
      "Tfh cells produce / drive IL-21 as a defining helper cytokine for B-cell help (foundational Tfh biology; used as SSc pathway axis context).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "21314428",
    doi: "10.1146/annurev-immunol-031210-101400",
    citationLabel:
      "Crotty S. Annu Rev Immunol 2011 — Follicular helper CD4 T cells (TFH).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/21314428/",
    notes:
      "Foundational Tfh→IL-21 axis (not SSc-specific). PMID 21314428 verified. P1.4 first-class edgeType produces (was alias ISI produces→upregulates). Pairs with Ricard 2019 SSc IL-21 pathway. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-003",
    edgeType: "upregulates",
    subjectId: "HSI-N-il21",
    subjectLabel: "IL-21",
    objectId: "HSI-N-b-cell",
    objectLabel: "B cell",
    claimId: "HSI-C-SSC-003",
    assertion:
      "IL-21 induces differentiation of human naive and memory B cells into antibody-secreting plasma cells (B-help axis underpinning SSc Tfh–IL-21 framing).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "16339522",
    doi: "10.4049/jimmunol.175.12.7867",
    citationLabel:
      "Ettinger R et al. J Immunol 2005 — IL-21 induces differentiation of human naive and memory B cells into antibody-secreting plasma cells.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16339522/",
    notes:
      "Foundational IL-21→B/plasma differentiation. PMID 16339522 verified. Not SSc-specific; underpins Ricard 2019 SSc plasmablast frame. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-004",
    edgeType: "associated_with",
    subjectId: "HSI-N-il21",
    subjectLabel: "IL-21",
    objectId: "HSI-N-plasmablast",
    objectLabel: "Plasmablast",
    claimId: "HSI-C-SSC-004",
    assertion:
      "In systemic sclerosis, circulating Tfh promote plasmablast differentiation through the IL-21 pathway (SSc-specific pathway seed).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "30760472",
    doi: "10.1136/annrheumdis-2018-214382",
    citationLabel:
      "Ricard L et al. Ann Rheum Dis 2019 — Circulating Tfh promote plasmablast differentiation through the IL-21 pathway in SSc.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30760472/",
    notes:
      "Core dual-track SSc edge (Tfh–IL-21–plasmablast). PMID 30760472 verified. Paper also reports ruxolitinib inhibition — do not invent treatment CDS claims. Gate C = human only.",
  },
  {
    id: "HSI-E-SSC-005",
    edgeType: "contributes_to",
    subjectId: "HSI-N-tfh",
    subjectLabel: "T follicular helper (Tfh) cells",
    objectId: "HSI-N-skin-fibrosis",
    objectLabel: "Skin fibrosis",
    claimId: "HSI-C-SSC-005",
    assertion:
      "T follicular helper-like cells contribute to skin fibrosis (fibrosis-facing competing / complementary frame for SSc pathway exploration).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "29514998",
    doi: "10.1126/scitranslmed.aaf5307",
    citationLabel:
      "Taylor DK et al. Sci Transl Med 2018 — T follicular helper-like cells contribute to skin fibrosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29514998/",
    notes:
      "Fibrosis-facing SSc-relevant frame (PMID 29514998 verified). Competing/complementary vs pure autoantibody–plasmablast narrative — keep both explanations. Not CDS.",
  },
  {
    id: "HSI-E-SSC-006",
    edgeType: "associated_with",
    subjectId: "HSI-N-tfh1",
    subjectLabel: "Tfh1-skewed follicular helper cells",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-006",
    assertion:
      "Imbalance toward Tfh1 cells is associated with aberrant B-cell differentiation in systemic sclerosis (competing Tfh-subset explanation).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "33175976",
    doi: "10.1093/rheumatology/keaa669",
    citationLabel:
      "Ly NTM et al. Rheumatology (Oxford) 2021 — Imbalance toward TFH1 cells playing a role in aberrant B cell differentiation in systemic sclerosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/33175976/",
    notes:
      "Competing Tfh-subset frame vs bulk circulating-Tfh↑ narrative. PMID 33175976 verified. teaching=hypothesized for subset generalisation. Keep disagreement visible. Not CDS.",
  },
  {
    id: "HSI-E-SSC-007",
    edgeType: "associated_with",
    subjectId: "HSI-N-ebv",
    subjectLabel: "Epstein-Barr virus (EBV)",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-007",
    assertion:
      "EBV infection has been hypothesized to contribute to scleroderma fibroblast / TLR pathway dysregulation — separate uncertainty branch; not a proven Tfh→B→IL-21 causal merge.",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "24129067",
    doi: "10.1038/jid.2013.423",
    citationLabel:
      "Farina A et al. J Invest Dermatol 2014 — Epstein-Barr virus infection induces aberrant TLR activation pathway and fibroblast-myofibroblast conversion in scleroderma.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24129067/",
    notes:
      "EBV = hypothesized/uncertain branch only (PRD rule). PMID 24129067 verified. Do NOT hard-merge with Tfh–B–IL-21 as established causation. teaching=hypothesized. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-008",
    edgeType: "contributes_to",
    subjectId: "HSI-N-tfh",
    subjectLabel: "T follicular helper (Tfh) cells",
    objectId: "HSI-N-skin-fibrosis",
    objectLabel: "Skin fibrosis",
    claimId: "HSI-C-SSC-008",
    assertion:
      "Commentary frame: T follicular helper cells are discussed as drivers of skin fibrosis (neighbourhood support for the Taylor 2018 fibrosis-facing explanation).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "29626172",
    doi: "10.1126/sciimmunol.aat6417",
    citationLabel:
      "Clark RA. Sci Immunol 2018 — \"That's not helping—T follicular helper cells drive skin fibrosis\" (commentary on Taylor et al.).",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29626172/",
    notes:
      "P1.1 deepen: commentary PMID 29626172 verified. Complements HSI-E-SSC-005; not a treatment claim. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-009",
    edgeType: "associated_with",
    subjectId: "HSI-N-il21",
    subjectLabel: "IL-21",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-009",
    assertion:
      "In systemic sclerosis, peripheral CD21low B cells and serum IL-4 / IL-21 are reported to influence joint involvement (B-cell–IL-21 neighbourhood deepen; not Stage 1 RA lock).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "37763102",
    doi: "10.3390/jpm13091334",
    citationLabel:
      "Pellicano C et al. J Pers Med 2023 — In Systemic Sclerosis Patients, Peripheral Blood CD21(low) B Cells and Serum IL-4 and IL-21 Influence Joint Involvement.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37763102/",
    notes:
      "P1.1 deepen: PMID 37763102 verified. teaching=hypothesized for joint-involvement generalisation. Keep EBV branch separate. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-010",
    edgeType: "associated_with",
    subjectId: "HSI-N-cxcl13-tfh-like",
    subjectLabel: "CXCL13+ Tfh-like T cells (SSc skin)",
    objectId: "HSI-N-b-cell",
    objectLabel: "B cell",
    claimId: "HSI-C-SSC-010",
    assertion:
      "Single-cell analysis of SSc skin identifies a CXCL13+ Tfh-like T-cell cluster adjacent to B cells and poised to promote local B-cell responses (neighbourhood deepen; not Stage 1 RA lock).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "34031030",
    doi: "10.1136/annrheumdis-2021-220209",
    citationLabel:
      "Gaydosik AM et al. Ann Rheum Dis 2021 — Single-cell transcriptome analysis identifies skin-specific T-cell responses in systemic sclerosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/34031030/",
    notes:
      "Depth deepen: PMID 34031030 verified. CXCL13+ skin Tfh-like frame complements circulating Tfh–IL-21; teaching=associative. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-011",
    edgeType: "associated_with",
    subjectId: "HSI-N-baff",
    subjectLabel: "BAFF (B-cell activating factor)",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-011",
    assertion:
      "Serum BAFF is elevated in systemic sclerosis with enhanced BAFF signalling reported in SSc B lymphocytes (B-survival neighbourhood deepen; not a therapeutic claim).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "16385515",
    doi: "10.1002/art.21526",
    citationLabel:
      "Matsushita T et al. Arthritis Rheum 2006 — Elevated serum BAFF levels in patients with systemic sclerosis: enhanced BAFF signaling in systemic sclerosis B lymphocytes.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/16385515/",
    notes:
      "Depth deepen: PMID 16385515 verified. BAFF↔SSc association only; keep separate from EBV. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-012",
    edgeType: "inhibits",
    subjectId: "HSI-N-baff-antagonist",
    subjectLabel: "BAFF antagonist (experimental)",
    objectId: "HSI-N-skin-fibrosis",
    objectLabel: "Skin fibrosis",
    claimId: "HSI-C-SSC-012",
    assertion:
      "BAFF antagonism attenuates skin fibrosis in the tight-skin mouse model (hypothesized translational frame — not human dosing, not CDS, not partnerSigned).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "17581616",
    doi: "10.1038/sj.jid.5700919",
    citationLabel:
      "Matsushita T et al. J Invest Dermatol 2007 — BAFF antagonist attenuates the development of skin fibrosis in tight-skin mice.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/17581616/",
    notes:
      "Depth deepen: PMID 17581616 verified. Mouse model only — teaching=hypothesized; never invent human BAFF-drug CDS. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-013",
    edgeType: "associated_with",
    subjectId: "HSI-N-cxcl4",
    subjectLabel: "CXCL4 (PF4)",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-013",
    assertion:
      "CXCL4 is a predominant protein secreted by plasmacytoid dendritic cells in systemic sclerosis and circulating levels associate with fibrosis phenotypes (biomarker neighbourhood — not a therapeutic claim).",
    review: "source-verified",
    teaching: "associative",
    domain: "autoimmunity",
    pmid: "24350901",
    doi: "10.1056/NEJMoa1114576",
    citationLabel:
      "van Bon L et al. N Engl J Med 2014 — Proteome-wide analysis and CXCL4 as a biomarker in systemic sclerosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/24350901/",
    notes:
      "Depth deepen: PMID 24350901 verified via PubMed. Association/biomarker frame only; teaching=associative. Does not replace RA ASK. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-014",
    edgeType: "inhibits",
    subjectId: "HSI-N-il6-blockade",
    subjectLabel: "IL-6 pathway blockade (tocilizumab class)",
    objectId: "HSI-N-tgfb-dermal-fibroblast",
    objectLabel: "TGF-β pathway activation in dermal fibroblasts",
    claimId: "HSI-C-SSC-014",
    assertion:
      "Therapeutic IL-6 blockade can reverse TGF-β pathway activation signatures in dermal fibroblasts in SSc clinical-trial biospecimens (faSScinate insight — hypothesized translational frame; not dosing CDS).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "29853453",
    doi: "10.1136/annrheumdis-2018-213031",
    citationLabel:
      "Denton CP et al. Ann Rheum Dis 2018 — Therapeutic interleukin-6 blockade reverses transforming growth factor-beta pathway activation in dermal fibroblasts: insights from the faSScinate clinical trial in systemic sclerosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29853453/",
    notes:
      "Depth deepen: PMID 29853453 verified. Trial-biospecimen mechanistic insight — teaching=hypothesized; never invent patient dosing/CDS. Gate C = human only. Not CDS.",
  },
  {
    id: "HSI-E-SSC-015",
    edgeType: "associated_with",
    subjectId: "HSI-N-rituximab-b-depletion",
    subjectLabel: "Rituximab B-cell depletion (experimental in SSc)",
    objectId: "HSI-N-ssc",
    objectLabel: "Systemic sclerosis",
    claimId: "HSI-C-SSC-015",
    assertion:
      "B-cell depletion with rituximab has been studied in diffuse cutaneous systemic sclerosis with exploratory clinical and skin signals (small open-label / pilot neighbourhood — hypothesized only; not approved SSc CDS).",
    review: "source-verified",
    teaching: "hypothesized",
    domain: "autoimmunity",
    pmid: "19180481",
    doi: "10.1002/art.24249",
    citationLabel:
      "Lafyatis R et al. Arthritis Rheum 2009 — B cell depletion with rituximab in patients with diffuse cutaneous systemic sclerosis.",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/19180481/",
    notes:
      "Depth deepen: PMID 19180481 verified. Small pilot — teaching=hypothesized; never invent on-label SSc rituximab CDS. Complements B/Tfh axis; keep separate from EBV. Gate C = human only. Not CDS.",
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

export const HSI_SSC_SEED_EDGES: HsiEdge[] = SPECS.map(toEdge);
export const HSI_SSC_SEED_CLAIMS: HsiClaim[] = SPECS.map(toClaim);

export const SSC_PATHWAY_ID = "ssc-tfh-b-il21" as const;

export const SSC_PATHWAY_META = {
  id: SSC_PATHWAY_ID,
  label: "SSc · CD4/Tfh–B-cell–IL-21",
  role: "prd_mvp_target" as const,
  verticalStrategy: "dual_track" as const,
  deepSeedsPresent: true as const,
  rationale:
    "First honest literature slice for Whole-Immune-Cell PRD MVP vertical under dual-track A. Parallel to RA Stage 1 lock; does not replace ASK question. EBV hypothesized only.",
  primaryClaimIds: SPECS.map((s) => s.claimId),
  primaryEdgeIds: SPECS.map((s) => s.id),
  primaryPmids: [
    "30760472",
    "29514998",
    "29626172",
    "33175976",
    "37763102",
    "34031030",
    "16385515",
    "17581616",
    "21314428",
    "16339522",
    "24129067",
    "24350901",
    "29853453",
    "19180481",
  ],
  deepenPhase: "p1_ssc_depth_cxcl4_il6_ritux" as const,
  entities: [
    { id: "HSI-N-ssc", label: "Systemic sclerosis", kind: "disease" },
    { id: "HSI-N-tfh", label: "Tfh", kind: "cell_subset" },
    { id: "HSI-N-tfh1", label: "Tfh1-skewed Tfh", kind: "cell_subset" },
    { id: "HSI-N-cxcl13-tfh-like", label: "CXCL13+ Tfh-like (skin)", kind: "cell_subset" },
    { id: "HSI-N-b-cell", label: "B cell", kind: "cell" },
    { id: "HSI-N-plasmablast", label: "Plasmablast", kind: "cell_subset" },
    { id: "HSI-N-il21", label: "IL-21", kind: "cytokine" },
    { id: "HSI-N-baff", label: "BAFF", kind: "cytokine" },
    { id: "HSI-N-baff-antagonist", label: "BAFF antagonist (experimental)", kind: "intervention_hypothesis" },
    { id: "HSI-N-cxcl4", label: "CXCL4 (PF4)", kind: "chemokine" },
    { id: "HSI-N-il6-blockade", label: "IL-6 pathway blockade", kind: "intervention_hypothesis" },
    { id: "HSI-N-tgfb-dermal-fibroblast", label: "TGF-β pathway (dermal fibroblast)", kind: "pathway" },
    { id: "HSI-N-rituximab-b-depletion", label: "Rituximab B depletion (experimental)", kind: "intervention_hypothesis" },
    { id: "HSI-N-skin-fibrosis", label: "Skin fibrosis", kind: "phenotype" },
    { id: "HSI-N-ebv", label: "EBV", kind: "pathogen_hypothesis" },
  ],
} as const;

/** True when at least one SSc edge carries a verified PMID locator. */
export function sscDeepSeedsLanded(
  edges: readonly HsiEdge[] = HSI_SSC_SEED_EDGES,
): boolean {
  return edges.some(
    (e) =>
      e.id.startsWith("HSI-E-SSC-") &&
      Boolean(e.provenance?.pmid?.trim()),
  );
}
