/**
 * Whole-immune-cell spine stubs + controlled relationship vocabulary.
 *
 * Source: ISI PRD — Whole-Immune-Cell Discovery Platform (v0.1 draft, 1 Nov 2026).
 * HSI-owned vocabulary only. Does **not** pivot Stage 1 seeds or wipe the RA lock.
 *
 * Vertical honesty (option A dual-track):
 * - RA / anti-TNF = working Stage 1 scope (`scopeLocked=true` in partnerLock)
 * - SSc CD4/Tfh–B–IL-21 = PRD MVP / blueprint Gate 3 target — thin literature slice present
 */
import type { HsiEdgeType } from "./schema";

export const IMMUNE_CELL_SPINE_SCHEMA = "hsi-immune-cell-spine-1";

/** PRD §7.2 entity layers for cells. */
export const IMMUNE_CELL_LAYERS = [
  "class",
  "lineage",
  "subset_state",
] as const;
export type ImmuneCellLayer = (typeof IMMUNE_CELL_LAYERS)[number];

/**
 * P1.8 Stage 2 starters used `hint_only`. P2.0 promotes a high-confidence
 * core to `curator_confirmed` (OLS label match + curator review) — still
 * **not** Gate C claim approval and **not** CDS / grade flips.
 */
export type SpineOntologyBindStatus =
  | "hint_only"
  | "curator_confirmed"
  | "unbound";

/** P2.0 high-confidence CL binds (OLS label match; not Gate C / not CDS). */
export const P20_CURATOR_CONFIRMED_SPINE_IDS = [
  "HSI-IC-class-t",
  "HSI-IC-class-b",
  "HSI-IC-class-dc",
  "HSI-IC-lin-cd4",
  "HSI-IC-lin-cd8",
  "HSI-IC-lin-b",
  "HSI-IC-lin-nk",
  "HSI-IC-lin-monocyte",
  "HSI-IC-lin-macrophage",
  "HSI-IC-lin-neutrophil",
  "HSI-IC-lin-dc",
  "HSI-IC-sub-tfh",
  "HSI-IC-sub-th1",
  "HSI-IC-sub-th2",
  "HSI-IC-sub-th17",
  "HSI-IC-sub-treg",
  "HSI-IC-sub-plasma",
  "HSI-IC-sub-plasmablast",
] as const;

export type P20CuratorConfirmedSpineId =
  (typeof P20_CURATOR_CONFIRMED_SPINE_IDS)[number];

export const P20_ONTOLOGY_BIND_REVIEW = {
  phase: "p2_0_curator_confirmed_cl_mondo" as const,
  confirmedAt: "2026-11-02T05:30:00.000Z",
  confirmedBy: "hsi-curator-p2-0",
  method: "ols_label_match_curator_review" as const,
  doesNotSetHsiGrade: true as const,
  notGateC: true as const,
  notCds: true as const,
  note:
    "Curator-confirmed ontology id ↔ spine label match via OLS; does not approve claim edges, flip hsiGrade, or open CDS.",
} as const;

export type ImmuneCellSpineNode = {
  id: string;
  layer: ImmuneCellLayer;
  label: string;
  /** Parent spine id when known (class ← lineage ← subset). */
  parentId: string | null;
  /** Optional Cell Ontology id — hint or curator-confirmed. */
  cellOntologyId: string | null;
  /** Honest bind status (P1.8 hints → P2.0 curator_confirmed for core set). */
  ontologyBindStatus: SpineOntologyBindStatus;
  notes: string | null;
};

/**
 * Major immune-cell classes / lineages / common subsets as navigation stubs.
 * Not a complete ontology; not disease-curated evidence edges.
 * P1.8: CL ids as hints. P2.0: high-confidence core → curator_confirmed
 * (myeloid class / ILC / mast stay hint_only). Never Gate C / never CDS.
 */

function spineBind(
  id: string,
  fallback: SpineOntologyBindStatus = "hint_only",
): SpineOntologyBindStatus {
  return (P20_CURATOR_CONFIRMED_SPINE_IDS as readonly string[]).includes(id)
    ? "curator_confirmed"
    : fallback;
}

function spineNotes(id: string, base: string): string {
  if ((P20_CURATOR_CONFIRMED_SPINE_IDS as readonly string[]).includes(id)) {
    return `${base} · P2.0 curator_confirmed (OLS label match; not Gate C / not CDS)`;
  }
  return base;
}
export const IMMUNE_CELL_SPINE_NODES: readonly ImmuneCellSpineNode[] = [
  // Classes
  {
    id: "HSI-IC-class-t",
    layer: "class",
    label: "T cell",
    parentId: null,
    cellOntologyId: "CL:0000084",
    ontologyBindStatus: spineBind("HSI-IC-class-t"),
    notes: spineNotes("HSI-IC-class-t", "PRD spine stub — class layer; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-class-b",
    layer: "class",
    label: "B cell",
    parentId: null,
    cellOntologyId: "CL:0000236",
    ontologyBindStatus: spineBind("HSI-IC-class-b"),
    notes: spineNotes("HSI-IC-class-b", "PRD spine stub — class layer; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-class-myeloid",
    layer: "class",
    label: "Myeloid cell",
    parentId: null,
    cellOntologyId: "CL:0000763",
    ontologyBindStatus: spineBind("HSI-IC-class-myeloid"),
    notes: spineNotes("HSI-IC-class-myeloid", "PRD spine stub — class layer; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-class-ilc",
    layer: "class",
    label: "Innate lymphoid cell",
    parentId: null,
    cellOntologyId: "CL:0001065",
    ontologyBindStatus: spineBind("HSI-IC-class-ilc"),
    notes: spineNotes("HSI-IC-class-ilc", "PRD spine stub — class layer; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-class-dc",
    layer: "class",
    label: "Dendritic cell",
    parentId: null,
    cellOntologyId: "CL:0000451",
    ontologyBindStatus: spineBind("HSI-IC-class-dc"),
    notes: spineNotes("HSI-IC-class-dc", "PRD spine stub — class layer (also listed as lineage); CL hint P1.8"),
  },
  // Lineages
  {
    id: "HSI-IC-lin-cd4",
    layer: "lineage",
    label: "CD4 T cell",
    parentId: "HSI-IC-class-t",
    cellOntologyId: "CL:0000624",
    ontologyBindStatus: spineBind("HSI-IC-lin-cd4"),
    notes: spineNotes("HSI-IC-lin-cd4", "One lineage among many — not the sole product focus; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-lin-cd8",
    layer: "lineage",
    label: "CD8 T cell",
    parentId: "HSI-IC-class-t",
    cellOntologyId: "CL:0000625",
    ontologyBindStatus: spineBind("HSI-IC-lin-cd8"),
    notes: spineNotes("HSI-IC-lin-cd8", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-lin-b",
    layer: "lineage",
    label: "B cell",
    parentId: "HSI-IC-class-b",
    cellOntologyId: "CL:0000236",
    ontologyBindStatus: spineBind("HSI-IC-lin-b"),
    notes: spineNotes("HSI-IC-lin-b", "CL hint for SSc Tfh–B–IL-21 neighbourhood (bindStatus=hint_only on pack cards)"),
  },
  {
    id: "HSI-IC-lin-nk",
    layer: "lineage",
    label: "NK cell",
    parentId: "HSI-IC-class-ilc",
    cellOntologyId: "CL:0000623",
    ontologyBindStatus: spineBind("HSI-IC-lin-nk"),
    notes: spineNotes("HSI-IC-lin-nk", "Grouped under innate / ILC neighbourhood for navigation; CL hint P1.8 Stage 2 starter"),
  },
  {
    id: "HSI-IC-lin-monocyte",
    layer: "lineage",
    label: "Monocyte",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: "CL:0000576",
    ontologyBindStatus: spineBind("HSI-IC-lin-monocyte"),
    notes: spineNotes("HSI-IC-lin-monocyte", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-lin-macrophage",
    layer: "lineage",
    label: "Macrophage",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: "CL:0000235",
    ontologyBindStatus: spineBind("HSI-IC-lin-macrophage"),
    notes: spineNotes("HSI-IC-lin-macrophage", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-lin-neutrophil",
    layer: "lineage",
    label: "Neutrophil",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: "CL:0000775",
    ontologyBindStatus: spineBind("HSI-IC-lin-neutrophil"),
    notes: spineNotes("HSI-IC-lin-neutrophil", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-lin-mast",
    layer: "lineage",
    label: "Mast cell",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: "CL:0000097",
    ontologyBindStatus: spineBind("HSI-IC-lin-mast"),
    notes: spineNotes("HSI-IC-lin-mast", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-lin-dc",
    layer: "lineage",
    label: "Dendritic cell",
    parentId: "HSI-IC-class-dc",
    cellOntologyId: "CL:0000451",
    ontologyBindStatus: spineBind("HSI-IC-lin-dc"),
    notes: spineNotes("HSI-IC-lin-dc", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  // Subsets / states (minimal MVP set — Tfh called out by PRD SSc vertical)
  {
    id: "HSI-IC-sub-tfh",
    layer: "subset_state",
    label: "Tfh",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: "CL:0002038",
    ontologyBindStatus: spineBind("HSI-IC-sub-tfh"),
    notes: spineNotes("HSI-IC-sub-tfh", "PRD SSc vertical subset — dual-track seeds in seed/sscTfhBIl21.ts; CL:0002038 hint only"),
  },
  {
    id: "HSI-IC-sub-th1",
    layer: "subset_state",
    label: "Th1",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: "CL:0000545",
    ontologyBindStatus: spineBind("HSI-IC-sub-th1"),
    notes: spineNotes("HSI-IC-sub-th1", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-sub-th2",
    layer: "subset_state",
    label: "Th2",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: "CL:0000546",
    ontologyBindStatus: spineBind("HSI-IC-sub-th2"),
    notes: spineNotes("HSI-IC-sub-th2", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-sub-th17",
    layer: "subset_state",
    label: "Th17",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: "CL:0000899",
    ontologyBindStatus: spineBind("HSI-IC-sub-th17"),
    notes: spineNotes("HSI-IC-sub-th17", "CL hint P1.8 Stage 2 starter — gut/neuro packs may cite Th17 frames; RA Stage 1 untouched"),
  },
  {
    id: "HSI-IC-sub-treg",
    layer: "subset_state",
    label: "Treg",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: "CL:0000815",
    ontologyBindStatus: spineBind("HSI-IC-sub-treg"),
    notes: spineNotes("HSI-IC-sub-treg", "CL hint P1.8 Stage 2 starter — gut SCFA↔Treg neighbourhood uses related seeds; RA untouched"),
  },
  {
    id: "HSI-IC-sub-plasma",
    layer: "subset_state",
    label: "Plasma cell",
    parentId: "HSI-IC-lin-b",
    cellOntologyId: "CL:0000786",
    ontologyBindStatus: spineBind("HSI-IC-sub-plasma"),
    notes: spineNotes("HSI-IC-sub-plasma", "CL hint P1.8 Stage 2 starter — not a confirmed ontology bind"),
  },
  {
    id: "HSI-IC-sub-plasmablast",
    layer: "subset_state",
    label: "Plasmablast",
    parentId: "HSI-IC-lin-b",
    cellOntologyId: "CL:0000980",
    ontologyBindStatus: spineBind("HSI-IC-sub-plasmablast"),
    notes: spineNotes("HSI-IC-sub-plasmablast", "CL hint for SSc IL-21→plasmablast frame (bindStatus=hint_only on pack cards)"),
  },
];


/**
 * PRD §7.3 controlled relationship types.
 * P1.4 promotes selected types onto `HSI_EDGE_TYPES` (produces / activates /
 * suppresses / differentiates_into). Remaining stay vocabulary + alias map so
 * existing RA/TNF seeds stay valid.
 */
export const ISI_CONTROLLED_RELATIONSHIP_TYPES = [
  "differentiates_into",
  "activates",
  "suppresses",
  "presents_antigen_to",
  "kills",
  "produces",
  "responds_to",
  "recruits",
  "associates_with",
  "measured_by",
  "hypothesized_to",
] as const;

export type IsiControlledRelationshipType =
  (typeof ISI_CONTROLLED_RELATIONSHIP_TYPES)[number];

/**
 * Map ISI controlled relations → HsiEdgeType.
 * Promoted (P1.4) predicates identity-map; others keep nearest Phase 0 aliases.
 */
export const ISI_RELATIONSHIP_TO_HSI_EDGE: Record<
  IsiControlledRelationshipType,
  HsiEdgeType
> = {
  // First-class (P1.4)
  differentiates_into: "differentiates_into",
  activates: "activates",
  suppresses: "suppresses",
  produces: "produces",
  // Still alias-only
  presents_antigen_to: "associated_with",
  kills: "drives",
  responds_to: "associated_with",
  recruits: "associated_with",
  associates_with: "associated_with",
  measured_by: "biomarker_of",
  hypothesized_to: "associated_with",
};

export type DiseaseVerticalRole =
  | "stage1_scope_locked"
  | "prd_mvp_target"
  | "release2_comparison"
  | "illustrative_stub";

export type DiseaseVerticalStub = {
  id: string;
  label: string;
  shortLabel: string;
  role: DiseaseVerticalRole;
  pathwayHint: string | null;
  /** Explicit: do not invent deep seeds without product decision. */
  deepSeedsPresent: boolean;
  notes: string;
};

/**
 * Dual-track vertical registry — RA lock intact; SSc marked as PRD/blueprint target.
 */
export const DISEASE_VERTICAL_STUBS: readonly DiseaseVerticalStub[] = [
  {
    id: "ra",
    label: "Rheumatoid arthritis",
    shortLabel: "RA",
    role: "stage1_scope_locked",
    pathwayHint: "anti-TNF response heterogeneity / TNF–ACPA–ADA",
    deepSeedsPresent: true,
    notes:
      "Working Stage 1 scope in partnerLock (scopeLocked=true). Do not wipe for SSc pivot without explicit product decision.",
  },
  {
    id: "ssc",
    label: "Systemic sclerosis",
    shortLabel: "SSc",
    role: "prd_mvp_target",
    pathwayHint: "CD4/Tfh–B-cell–IL-21 (+ EBV as separate hypothesized_to branch)",
    deepSeedsPresent: true,
    notes:
      "Whole-Immune-Cell PRD MVP + Technical Blueprint Gate 3. Dual-track A authorised: thin literature slice in seed/sscTfhBIl21.ts + hsi-ssc-pathway-pack (verified PMIDs). RA remains Stage 1 activeScope — do not wipe.",
  },
  {
    id: "ra-r2",
    label: "Rheumatoid arthritis (cross-disease comparison)",
    shortLabel: "RA R2",
    role: "release2_comparison",
    pathwayHint: "Compare same cells/pathways vs SSc after SSc vertical curation",
    deepSeedsPresent: true,
    notes:
      "PRD Release 2 / Gate 4. Existing RA seeds can serve as the comparison arm without a second seed wipe.",
  },
] as const;

export type ImmuneCellSpineBundle = {
  schemaVersion: typeof IMMUNE_CELL_SPINE_SCHEMA;
  cells: readonly ImmuneCellSpineNode[];
  relationshipTypes: readonly IsiControlledRelationshipType[];
  relationshipToHsiEdge: typeof ISI_RELATIONSHIP_TO_HSI_EDGE;
  diseaseVerticals: readonly DiseaseVerticalStub[];
  ontologyBindReview: typeof P20_ONTOLOGY_BIND_REVIEW;
  curatorConfirmedSpineIds: readonly P20CuratorConfirmedSpineId[];
  invariants: string[];
};

export function buildImmuneCellSpineBundle(): ImmuneCellSpineBundle {
  return {
    schemaVersion: IMMUNE_CELL_SPINE_SCHEMA,
    cells: IMMUNE_CELL_SPINE_NODES,
    relationshipTypes: ISI_CONTROLLED_RELATIONSHIP_TYPES,
    relationshipToHsiEdge: ISI_RELATIONSHIP_TO_HSI_EDGE,
    diseaseVerticals: DISEASE_VERTICAL_STUBS,
    ontologyBindReview: P20_ONTOLOGY_BIND_REVIEW,
    curatorConfirmedSpineIds: P20_CURATOR_CONFIRMED_SPINE_IDS,
    invariants: [
      "Vocabulary stubs only — not Gate C claims and not CDS.",
      "RA Stage 1 scopeLocked remains authoritative in partnerLock (dual-track activeScope=ra-tnf).",
      "SSc is prd_mvp_target / blueprint Gate 3 — dual-track thin seeds present; EBV hypothesized only.",
      "P1.8 Stage 2 starters introduced CL ids as ontologyBindStatus=hint_only.",
      "P2.0 promotes a high-confidence core to ontologyBindStatus=curator_confirmed (OLS label match) — still not Gate C outcomes / not CDS / does not set hsiGrade. Myeloid class, ILC, and mast stay hint_only.",
      "Prefer ISI_CONTROLLED_RELATIONSHIP_TYPES for new immune-cell curation; P1.4 promotes produces/activates/suppresses/differentiates_into onto HSI_EDGE_TYPES (identity map); remaining types still alias via ISI_RELATIONSHIP_TO_HSI_EDGE.",
      "Context + evidence mandatory on every future claim edge (PRD §6 / §7.4).",
    ],
  };
}

/** Count spine ontology bind statuses — P1.8 hints + P2.0 curator_confirmed. */
export function countSpineOntologyHints(
  nodes: readonly ImmuneCellSpineNode[] = IMMUNE_CELL_SPINE_NODES,
): {
  hinted: number;
  confirmed: number;
  unbound: number;
  total: number;
} {
  const hinted = nodes.filter((n) => n.ontologyBindStatus === "hint_only").length;
  const confirmed = nodes.filter(
    (n) => n.ontologyBindStatus === "curator_confirmed",
  ).length;
  const unbound = nodes.filter((n) => n.ontologyBindStatus === "unbound").length;
  return { hinted, confirmed, unbound, total: nodes.length };
}

export function isIsiControlledRelationshipType(
  v: unknown,
): v is IsiControlledRelationshipType {
  return (
    typeof v === "string" &&
    (ISI_CONTROLLED_RELATIONSHIP_TYPES as readonly string[]).includes(v)
  );
}

export function listImmuneCellLineages(): ImmuneCellSpineNode[] {
  return IMMUNE_CELL_SPINE_NODES.filter((n) => n.layer === "lineage");
}

export function getDiseaseVertical(id: string): DiseaseVerticalStub | undefined {
  return DISEASE_VERTICAL_STUBS.find((d) => d.id === id);
}
