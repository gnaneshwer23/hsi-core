/**
 * SSc Tfh–B–IL-21 neighbourhood cell / disease cards with CL·MONDO *hints*.
 *
 * Hints only — not a full ontology bind, not Gate C claims, not CDS.
 * Used by the deepened SSc pathway pack (P1.1).
 */
export const SSC_CELL_CARD_SCHEMA = "hsi-ssc-cell-card-1" as const;

export type SscOntologyHint = {
  /** Ontology prefix (CL / MONDO / …). */
  ontology: "CL" | "MONDO" | "PR" | "NCBIGene";
  /** Compact id e.g. CL:0002038 — curator hint, not a validated crosswalk. */
  id: string;
  label: string;
  /** Honest: hint until a curator confirms the bind. */
  bindStatus: "hint_only";
};

export type SscNeighbourhoodCard = {
  id: string;
  kind: "cell" | "cell_subset" | "cytokine" | "disease" | "phenotype" | "pathogen_hypothesis";
  nodeId: string;
  label: string;
  definition: string;
  ontologyHints: SscOntologyHint[];
  /** Surface / functional markers as free-text curator hints. */
  markers: string[];
  subsetsOrRelated: string[];
  tissues: string[];
  citationPmids: string[];
  spineNodeId: string | null;
  notes: string;
};

/**
 * Neighbourhood cards for the dual-track SSc Tfh–B–IL-21 slice.
 * Ontology ids verified via OLS (EBI) 2026-11-01 — still `hint_only`.
 */
export const SSC_NEIGHBOURHOOD_CARDS: readonly SscNeighbourhoodCard[] = [
  {
    id: "HSI-CARD-SSC-TFH",
    kind: "cell_subset",
    nodeId: "HSI-N-tfh",
    label: "T follicular helper (Tfh) cells",
    definition:
      "CD4 helper T-cell subset specialised for B-cell help in germinal centres; typically CXCR5⁺ PD-1⁺ BCL6⁺ and a major IL-21 source.",
    ontologyHints: [
      {
        ontology: "CL",
        id: "CL:0002038",
        label: "T follicular helper cell",
        bindStatus: "hint_only",
      },
    ],
    markers: ["CXCR5", "PD-1", "ICOS", "BCL6", "IL-21 (produced)"],
    subsetsOrRelated: ["Tfh1-skewed", "Tfh-like (tissue)"],
    tissues: ["secondary lymphoid organs", "circulation (cTfh)", "skin (fibrosis-facing frame)"],
    citationPmids: ["21314428", "30760472", "29514998"],
    spineNodeId: "HSI-IC-sub-tfh",
    notes:
      "PRD SSc vertical subset. CL hint only — not Gate C approved ontology bind.",
  },
  {
    id: "HSI-CARD-SSC-TFH1",
    kind: "cell_subset",
    nodeId: "HSI-N-tfh1",
    label: "Tfh1-skewed follicular helper cells",
    definition:
      "Tfh cells with Th1-like cytokine skew (e.g. IFN-γ-leaning) invoked as a competing subset frame in SSc B-cell dysregulation.",
    ontologyHints: [
      {
        ontology: "CL",
        id: "CL:0002038",
        label: "T follicular helper cell (parent class hint)",
        bindStatus: "hint_only",
      },
    ],
    markers: ["CXCR5", "PD-1", "T-bet / IFN-γ lean (subset frame)"],
    subsetsOrRelated: ["bulk circulating Tfh"],
    tissues: ["circulation"],
    citationPmids: ["33175976"],
    spineNodeId: "HSI-IC-sub-tfh",
    notes:
      "No dedicated CL term for Tfh1 — parent Tfh CL used as hint. teaching=hypothesized on related edge.",
  },
  {
    id: "HSI-CARD-SSC-B",
    kind: "cell",
    nodeId: "HSI-N-b-cell",
    label: "B cell",
    definition:
      "Adaptive lymphocyte producing antigen receptors; differentiation toward antibody-secreting cells is IL-21-responsive in the SSc Tfh–IL-21 frame.",
    ontologyHints: [
      {
        ontology: "CL",
        id: "CL:0000236",
        label: "B cell",
        bindStatus: "hint_only",
      },
    ],
    markers: ["CD19", "CD20", "CD21 (context-dependent)"],
    subsetsOrRelated: ["memory B", "plasmablast", "plasma cell", "CD21^low B (SSc joint frame)"],
    tissues: ["secondary lymphoid organs", "circulation", "inflamed tissue"],
    citationPmids: ["16339522", "30760472", "37763102"],
    spineNodeId: "HSI-IC-lin-b",
    notes: "CL hint only. CD21^low framing cites PMID 37763102 — not CDS.",
  },
  {
    id: "HSI-CARD-SSC-PLASMABLAST",
    kind: "cell_subset",
    nodeId: "HSI-N-plasmablast",
    label: "Plasmablast",
    definition:
      "Short-lived antibody-secreting B-lineage cell; in SSc, circulating Tfh are reported to promote plasmablast differentiation via IL-21.",
    ontologyHints: [
      {
        ontology: "CL",
        id: "CL:0000980",
        label: "plasmablast",
        bindStatus: "hint_only",
      },
    ],
    markers: ["CD19", "CD27", "CD38^hi", "CD20^lo/neg"],
    subsetsOrRelated: ["plasma cell"],
    tissues: ["circulation", "secondary lymphoid organs"],
    citationPmids: ["30760472", "16339522"],
    spineNodeId: "HSI-IC-sub-plasmablast",
    notes: "Core SSc pathway object (Ricard 2019). CL hint only.",
  },
  {
    id: "HSI-CARD-SSC-IL21",
    kind: "cytokine",
    nodeId: "HSI-N-il21",
    label: "IL-21",
    definition:
      "Type I cytokine produced by Tfh (and related helpers) that drives B-cell differentiation toward antibody-secreting cells.",
    ontologyHints: [
      {
        ontology: "NCBIGene",
        id: "NCBIGene:59067",
        label: "IL21",
        bindStatus: "hint_only",
      },
      {
        ontology: "PR",
        id: "PR:000001188",
        label: "interleukin-21",
        bindStatus: "hint_only",
      },
    ],
    markers: ["IL-21 (ligand)", "IL-21R (receptor context)"],
    subsetsOrRelated: ["Tfh-produced cytokine axis"],
    tissues: ["germinal centre / lymphoid", "circulation (serum context)"],
    citationPmids: ["21314428", "16339522", "30760472", "37763102"],
    spineNodeId: null,
    notes:
      "Cytokine — CL not applicable; NCBIGene/PR hints only. Not a dosing or CDS claim.",
  },
  {
    id: "HSI-CARD-SSC-DISEASE",
    kind: "disease",
    nodeId: "HSI-N-ssc",
    label: "Systemic sclerosis",
    definition:
      "Systemic autoimmune disease with vasculopathy and fibrosis; PRD MVP vertical for CD4/Tfh–B–IL-21 under dual-track A (RA remains Stage 1 lock).",
    ontologyHints: [
      {
        ontology: "MONDO",
        id: "MONDO:0005100",
        label: "systemic sclerosis",
        bindStatus: "hint_only",
      },
    ],
    markers: [],
    subsetsOrRelated: ["limited SSc (MONDO:0016359 hint only — not seeded)"],
    tissues: ["skin", "lung", "vasculature", "joints (context)"],
    citationPmids: ["30760472", "33175976", "37763102"],
    spineNodeId: null,
    notes:
      "MONDO hint only. Does not replace RA Stage 1 activeScope. partnerSigned stays false.",
  },
  {
    id: "HSI-CARD-SSC-FIBROSIS",
    kind: "phenotype",
    nodeId: "HSI-N-skin-fibrosis",
    label: "Skin fibrosis",
    definition:
      "Fibrotic dermal phenotype in SSc; Tfh-like cells are reported to contribute (fibrosis-facing competing/complementary frame).",
    ontologyHints: [],
    markers: [],
    subsetsOrRelated: ["Tfh-like tissue helpers"],
    tissues: ["skin / dermis"],
    citationPmids: ["29514998", "29626172"],
    spineNodeId: null,
    notes: "No MONDO/CL bind for this phenotype stub — literature PMIDs only.",
  },
  {
    id: "HSI-CARD-SSC-EBV",
    kind: "pathogen_hypothesis",
    nodeId: "HSI-N-ebv",
    label: "Epstein-Barr virus (EBV)",
    definition:
      "Hypothesized pathogen / fibroblast–TLR axis in scleroderma — separate uncertainty branch; never merged as proven Tfh→B→IL-21 causation.",
    ontologyHints: [],
    markers: [],
    subsetsOrRelated: [],
    tissues: ["fibroblast / skin context"],
    citationPmids: ["24129067"],
    spineNodeId: null,
    notes:
      "teaching=hypothesized only. No CL/MONDO cell bind. Optional future taxon locator: NCBITaxon:10376 (not wired as ontologyHint type).",
  },
  {
    id: "HSI-CARD-SSC-CXCL13-TFH",
    kind: "cell_subset",
    nodeId: "HSI-N-cxcl13-tfh-like",
    label: "CXCL13+ Tfh-like T cells (SSc skin)",
    definition:
      "Recirculating CXCL13+ T-cell cluster in SSc skin with Tfh-like gene programme, often adjacent to B cells — tissue complement to circulating Tfh.",
    ontologyHints: [
      {
        ontology: "CL",
        id: "CL:0002038",
        label: "T follicular helper cell (parent class hint)",
        bindStatus: "hint_only",
      },
    ],
    markers: ["CXCL13", "ICOS", "TIGIT", "IL-21 (context)", "IFNγ (context)"],
    subsetsOrRelated: ["circulating Tfh", "skin-resident helpers"],
    tissues: ["SSc lesional skin"],
    citationPmids: ["34031030"],
    spineNodeId: "HSI-IC-sub-tfh",
    notes: "Depth deepen card. CL parent hint only — not full ontology bind.",
  },
  {
    id: "HSI-CARD-SSC-BAFF",
    kind: "cytokine",
    nodeId: "HSI-N-baff",
    label: "BAFF (B-cell activating factor)",
    definition:
      "TNF-family cytokine supporting B-cell survival/proliferation; elevated serum BAFF and enhanced BAFF signalling reported in SSc B lymphocytes.",
    ontologyHints: [
      {
        ontology: "NCBIGene",
        id: "NCBIGene:10673",
        label: "TNFSF13B (BAFF)",
        bindStatus: "hint_only",
      },
    ],
    markers: ["BAFF / BLyS", "BAFF-R / BR3 (receptor context)"],
    subsetsOrRelated: ["APRIL (related TNF family)"],
    tissues: ["circulation (serum)", "lymphoid"],
    citationPmids: ["16385515", "17581616"],
    spineNodeId: null,
    notes: "Depth deepen. Not a BAFF-drug dosing or CDS claim.",
  },
];

export function listSscNeighbourhoodCards(): SscNeighbourhoodCard[] {
  return [...SSC_NEIGHBOURHOOD_CARDS];
}

export function sscCellCardByNodeId(
  nodeId: string,
): SscNeighbourhoodCard | undefined {
  return SSC_NEIGHBOURHOOD_CARDS.find((c) => c.nodeId === nodeId);
}
