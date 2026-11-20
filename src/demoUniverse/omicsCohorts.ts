/**
 * Demo Research Universe PR5 — omics assays + synthetic cohort sketches.
 * Aggregate / metadata fixtures only. No row-level IDs, no PHI, no real-data class.
 * Does not write to the production graph or bypass clinical-plane release gates.
 */
import { DEMO_HONESTY, type DemoHonestyFlags } from "./types";

export const DEMO_OMICS_COHORT_SCHEMA = "hsi-demo-omics-cohort-1" as const;

export type DemoAssaySketch = {
  id: string;
  name: string;
  modality: "scrna-seq" | "bulk-rna-seq" | "proteomics" | "metabolomics";
  linkedScenarioId: string;
  fields: readonly { label: string; value: string | null; missingExplicit: boolean }[];
  fakeQcScore: false;
  honesty: DemoHonestyFlags;
};

export type DemoOmicsCandidate = {
  id: string;
  label: string;
  linkedScenarioId: string;
  domains: readonly string[];
  reviewStatus: "candidate_unreviewed";
  note: string;
  honesty: DemoHonestyFlags;
};

export type DemoSyntheticCohortSketch = {
  id: string;
  title: string;
  linkedScenarioId: string;
  dataClass: "synthetic";
  /** Aggregate counts only — never patient/row identifiers. */
  counts: {
    evaluated: number | null;
    matched: number | null;
    excluded: number | null;
  };
  smallCellThreshold: number;
  smallCellsWithheld: true;
  realDataEnabled: false;
  note: string;
  honesty: DemoHonestyFlags;
};

export type DemoOmicsCohortPack = {
  schemaVersion: typeof DEMO_OMICS_COHORT_SCHEMA;
  assays: readonly DemoAssaySketch[];
  omicsCandidates: readonly DemoOmicsCandidate[];
  cohorts: readonly DemoSyntheticCohortSketch[];
  honesty: DemoHonestyFlags;
  canWriteToProductionGraph: false;
  canEnableRealData: false;
  loadsClinicalPlaneShards: false;
};

const ASSAYS: readonly DemoAssaySketch[] = [
  {
    id: "DEMO-ASSAY-001",
    name: "Droplet scRNA-seq sketch (demo)",
    modality: "scrna-seq",
    linkedScenarioId: "single-cell-omics",
    fields: [
      { label: "Chemistry", value: "droplet_demo", missingExplicit: false },
      { label: "Sequencing depth", value: null, missingExplicit: true },
      { label: "Batch covariates", value: null, missingExplicit: true },
    ],
    fakeQcScore: false,
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-ASSAY-002",
    name: "Fibroblast bulk RNA-seq sketch (demo)",
    modality: "bulk-rna-seq",
    linkedScenarioId: "tissue-remodelling",
    fields: [
      { label: "Library prep", value: "stated_demo", missingExplicit: false },
      { label: "RIN / integrity", value: null, missingExplicit: true },
    ],
    fakeQcScore: false,
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-ASSAY-003",
    name: "SCFA metabolomics panel sketch (demo)",
    modality: "metabolomics",
    linkedScenarioId: "gut-immune-metabolic",
    fields: [
      { label: "Platform", value: "LC-MS_demo", missingExplicit: false },
      { label: "Internal standards", value: null, missingExplicit: true },
    ],
    fakeQcScore: false,
    honesty: DEMO_HONESTY,
  },
];

const OMICS: readonly DemoOmicsCandidate[] = [
  {
    id: "DEMO-OMICS-001",
    label: "T-cell programme cluster (unreviewed)",
    linkedScenarioId: "single-cell-omics",
    domains: ["genomics-multi-omics", "immune-inflammation"],
    reviewStatus: "candidate_unreviewed",
    note: "Cluster label from synthetic Study S-A — not a validated cell state.",
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-OMICS-002",
    label: "Activated fibroblast signature (unreviewed)",
    linkedScenarioId: "tissue-remodelling",
    domains: ["organ-tissue-biology", "disease-mechanisms"],
    reviewStatus: "candidate_unreviewed",
    note: "Signature sketch only; no invented feature counts or QC %.",
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-OMICS-003",
    label: "Microbial metabolite ↔ cytokine edge (unreviewed)",
    linkedScenarioId: "gut-immune-metabolic",
    domains: ["microbiome-metabolism", "immune-inflammation"],
    reviewStatus: "candidate_unreviewed",
    note: "Points at DEMO-INV-001 conflict pair; not scientifically approved.",
    honesty: DEMO_HONESTY,
  },
];

const COHORTS: readonly DemoSyntheticCohortSketch[] = [
  {
    id: "DEMO-COHORT-001",
    title: "Synthetic inflammation context cohort (demo)",
    linkedScenarioId: "immune-inflammation",
    dataClass: "synthetic",
    counts: { evaluated: 48, matched: 22, excluded: 18 },
    smallCellThreshold: 10,
    smallCellsWithheld: true,
    realDataEnabled: false,
    note: "Aggregate sketch only. Cells below threshold stay withheld. Not a disease prevalence claim.",
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-COHORT-002",
    title: "Synthetic neuroimmune barrier cohort (demo)",
    linkedScenarioId: "neuroimmune-signalling",
    dataClass: "synthetic",
    counts: { evaluated: 36, matched: 14, excluded: 12 },
    smallCellThreshold: 10,
    smallCellsWithheld: true,
    realDataEnabled: false,
    note: "Synthetic partitions only. Clinical-plane release() is not invoked here.",
    honesty: DEMO_HONESTY,
  },
  {
    id: "DEMO-COHORT-003",
    title: "Synthetic cross-disease comparison cohort (demo)",
    linkedScenarioId: "comparative-disease-mechanisms",
    dataClass: "synthetic",
    /** Matched count below threshold — must present as withheld in UI helpers. */
    counts: { evaluated: 28, matched: 8, excluded: 14 },
    smallCellThreshold: 10,
    smallCellsWithheld: true,
    realDataEnabled: false,
    note: "Matched n < small-cell threshold → matched count withheld in presentation.",
    honesty: DEMO_HONESTY,
  },
];

export function getDemoOmicsCohortPack(): DemoOmicsCohortPack {
  return {
    schemaVersion: DEMO_OMICS_COHORT_SCHEMA,
    assays: ASSAYS,
    omicsCandidates: OMICS,
    cohorts: COHORTS,
    honesty: DEMO_HONESTY,
    canWriteToProductionGraph: false,
    canEnableRealData: false,
    loadsClinicalPlaneShards: false,
  };
}

/** Presentation counts with small-cell suppression (matched/excluded only). */
export type DemoCohortPresentedCounts = {
  cohortId: string;
  evaluated: number | null;
  matched: number | null;
  excluded: number | null;
  withheldKeys: readonly string[];
};

export function presentDemoCohortCounts(
  cohort: DemoSyntheticCohortSketch,
): DemoCohortPresentedCounts {
  if (cohort.dataClass !== "synthetic") {
    throw new Error("Demo cohort presentation refuses non-synthetic dataClass");
  }
  if (cohort.realDataEnabled !== false) {
    throw new Error("Demo cohort presentation refuses realDataEnabled");
  }
  const k = cohort.smallCellThreshold;
  const withheld: string[] = [];
  const maybe = (key: "evaluated" | "matched" | "excluded", n: number | null): number | null => {
    if (n === null) return null;
    if (n > 0 && n < k) {
      withheld.push(key);
      return null;
    }
    return n;
  };
  return {
    cohortId: cohort.id,
    evaluated: maybe("evaluated", cohort.counts.evaluated),
    matched: maybe("matched", cohort.counts.matched),
    excluded: maybe("excluded", cohort.counts.excluded),
    withheldKeys: withheld,
  };
}

export function listDemoAssaysForScenario(scenarioId: string): readonly DemoAssaySketch[] {
  return ASSAYS.filter((a) => a.linkedScenarioId === scenarioId);
}

export function listDemoOmicsForScenario(scenarioId: string): readonly DemoOmicsCandidate[] {
  return OMICS.filter((o) => o.linkedScenarioId === scenarioId);
}

export function listDemoCohortsForScenario(scenarioId: string): readonly DemoSyntheticCohortSketch[] {
  return COHORTS.filter((c) => c.linkedScenarioId === scenarioId);
}

/** Hard refuse any attempt to mark demo cohort packs as real data. */
export function demoOmicsAllowsRealData(): false {
  return false;
}
