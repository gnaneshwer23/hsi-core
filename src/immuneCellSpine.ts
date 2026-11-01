/**
 * Whole-immune-cell spine stubs + controlled relationship vocabulary.
 *
 * Source: ISI PRD — Whole-Immune-Cell Discovery Platform (v0.1 draft, 1 Nov 2026).
 * HSI-owned vocabulary only. Does **not** pivot Stage 1 seeds or wipe the RA lock.
 *
 * Vertical honesty:
 * - RA / anti-TNF = working Stage 1 scope (`scopeLocked=true` in partnerLock)
 * - SSc CD4/Tfh–B–IL-21 = PRD MVP / blueprint Gate 3 **target** vertical (no deep seeds yet)
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

export type ImmuneCellSpineNode = {
  id: string;
  layer: ImmuneCellLayer;
  label: string;
  /** Parent spine id when known (class ← lineage ← subset). */
  parentId: string | null;
  /** Optional Cell Ontology hint — null until curated. */
  cellOntologyId: string | null;
  notes: string | null;
};

/**
 * Major immune-cell classes / lineages / common subsets as navigation stubs.
 * Not a complete ontology; not disease-curated evidence edges.
 */
export const IMMUNE_CELL_SPINE_NODES: readonly ImmuneCellSpineNode[] = [
  // Classes
  {
    id: "HSI-IC-class-t",
    layer: "class",
    label: "T cell",
    parentId: null,
    cellOntologyId: null,
    notes: "PRD spine stub — class layer",
  },
  {
    id: "HSI-IC-class-b",
    layer: "class",
    label: "B cell",
    parentId: null,
    cellOntologyId: null,
    notes: "PRD spine stub — class layer",
  },
  {
    id: "HSI-IC-class-myeloid",
    layer: "class",
    label: "Myeloid cell",
    parentId: null,
    cellOntologyId: null,
    notes: "PRD spine stub — class layer",
  },
  {
    id: "HSI-IC-class-ilc",
    layer: "class",
    label: "Innate lymphoid cell",
    parentId: null,
    cellOntologyId: null,
    notes: "PRD spine stub — class layer",
  },
  {
    id: "HSI-IC-class-dc",
    layer: "class",
    label: "Dendritic cell",
    parentId: null,
    cellOntologyId: null,
    notes: "PRD spine stub — class layer (also listed as lineage)",
  },
  // Lineages
  {
    id: "HSI-IC-lin-cd4",
    layer: "lineage",
    label: "CD4 T cell",
    parentId: "HSI-IC-class-t",
    cellOntologyId: null,
    notes: "One lineage among many — not the sole product focus",
  },
  {
    id: "HSI-IC-lin-cd8",
    layer: "lineage",
    label: "CD8 T cell",
    parentId: "HSI-IC-class-t",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-b",
    layer: "lineage",
    label: "B cell",
    parentId: "HSI-IC-class-b",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-nk",
    layer: "lineage",
    label: "NK cell",
    parentId: "HSI-IC-class-ilc",
    cellOntologyId: null,
    notes: "Grouped under innate / ILC neighbourhood for navigation",
  },
  {
    id: "HSI-IC-lin-monocyte",
    layer: "lineage",
    label: "Monocyte",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-macrophage",
    layer: "lineage",
    label: "Macrophage",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-neutrophil",
    layer: "lineage",
    label: "Neutrophil",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-mast",
    layer: "lineage",
    label: "Mast cell",
    parentId: "HSI-IC-class-myeloid",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-lin-dc",
    layer: "lineage",
    label: "Dendritic cell",
    parentId: "HSI-IC-class-dc",
    cellOntologyId: null,
    notes: null,
  },
  // Subsets / states (minimal MVP set — Tfh called out by PRD SSc vertical)
  {
    id: "HSI-IC-sub-tfh",
    layer: "subset_state",
    label: "Tfh",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: null,
    notes: "PRD SSc vertical target subset — no SSc claim edges in Stage 1 seeds",
  },
  {
    id: "HSI-IC-sub-th1",
    layer: "subset_state",
    label: "Th1",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-sub-th2",
    layer: "subset_state",
    label: "Th2",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-sub-th17",
    layer: "subset_state",
    label: "Th17",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-sub-treg",
    layer: "subset_state",
    label: "Treg",
    parentId: "HSI-IC-lin-cd4",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-sub-plasma",
    layer: "subset_state",
    label: "Plasma cell",
    parentId: "HSI-IC-lin-b",
    cellOntologyId: null,
    notes: null,
  },
  {
    id: "HSI-IC-sub-plasmablast",
    layer: "subset_state",
    label: "Plasmablast",
    parentId: "HSI-IC-lin-b",
    cellOntologyId: null,
    notes: null,
  },
] as const;

/**
 * PRD §7.3 controlled relationship types.
 * Stored separately from Phase 0 `HSI_EDGE_TYPES` so existing RA/TNF seeds stay valid.
 * Prefer these predicates for new whole-immune-cell / SSc curation when authorised.
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

/** Nearest Phase 0 HSI edgeType when a PRD predicate is not yet on HsiEdge. */
export const ISI_RELATIONSHIP_TO_HSI_EDGE: Record<
  IsiControlledRelationshipType,
  HsiEdgeType
> = {
  differentiates_into: "contributes_to",
  activates: "upregulates",
  suppresses: "inhibits",
  presents_antigen_to: "associated_with",
  kills: "drives",
  produces: "upregulates",
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
    deepSeedsPresent: false,
    notes:
      "Whole-Immune-Cell PRD MVP + Technical Blueprint Gate 3 target. No deep SSc claim edges in hsi-core yet. RA remains Stage 1 lock until dual-track or pivot is authorised.",
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
  invariants: string[];
};

export function buildImmuneCellSpineBundle(): ImmuneCellSpineBundle {
  return {
    schemaVersion: IMMUNE_CELL_SPINE_SCHEMA,
    cells: IMMUNE_CELL_SPINE_NODES,
    relationshipTypes: ISI_CONTROLLED_RELATIONSHIP_TYPES,
    relationshipToHsiEdge: ISI_RELATIONSHIP_TO_HSI_EDGE,
    diseaseVerticals: DISEASE_VERTICAL_STUBS,
    invariants: [
      "Vocabulary stubs only — not Gate C claims and not CDS.",
      "RA Stage 1 scopeLocked remains authoritative in partnerLock.",
      "SSc is prd_mvp_target / blueprint Gate 3 — deepSeedsPresent=false until authorised.",
      "Prefer ISI_CONTROLLED_RELATIONSHIP_TYPES for new immune-cell curation; map via ISI_RELATIONSHIP_TO_HSI_EDGE until HSI_EDGE_TYPES expands.",
      "Context + evidence mandatory on every future claim edge (PRD §6 / §7.4).",
    ],
  };
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
