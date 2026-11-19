/**
 * Role dashboard adapters over Demo Research Universe (PR4).
 * Maps enterprise/workspace roles onto seeded scenarios without duplicating catalogs.
 * Read-only. Never writes to the production graph.
 */
import { getDemoUniverseBundle, listDemoScenarioIds } from "./adapter";
import { DEMO_HONESTY, type DemoHonestyFlags, type DemoScientificDomain } from "./types";

export const DEMO_ROLE_ADAPTER_SCHEMA = "hsi-demo-universe-role-adapter-1" as const;

export type DemoDashboardRoleId =
  | "professor"
  | "student"
  | "biotech"
  | "clinical"
  | "lab"
  | "community";

export type DemoRoleScenarioCard = {
  scenarioId: string;
  investigationId: string;
  title: string;
  question: string;
  domain: DemoScientificDomain;
  /** Deep-link into the PR3 comparison UI. */
  href: string;
};

export type DemoRoleUniverseSlice = {
  schemaVersion: typeof DEMO_ROLE_ADAPTER_SCHEMA;
  roleId: DemoDashboardRoleId;
  label: string;
  summary: string;
  cards: readonly DemoRoleScenarioCard[];
  sharedNodeIds: readonly string[];
  comparisonSurface: "/demo/universe";
  honesty: DemoHonestyFlags;
  canWriteToProductionGraph: false;
  duplicatesCatalog: false;
};

const ROLE_SCENARIO_IDS: Record<DemoDashboardRoleId, readonly string[]> = {
  professor: [
    "gut-immune-metabolic",
    "immune-inflammation",
    "comparative-disease-mechanisms",
  ],
  student: ["gut-immune-metabolic", "neuroimmune-signalling", "single-cell-omics"],
  biotech: ["immune-inflammation", "tissue-remodelling", "single-cell-omics"],
  clinical: [
    "comparative-disease-mechanisms",
    "neuroimmune-signalling",
    "immune-inflammation",
  ],
  lab: ["single-cell-omics", "tissue-remodelling", "gut-immune-metabolic"],
  community: [
    "gut-immune-metabolic",
    "immune-inflammation",
    "comparative-disease-mechanisms",
  ],
};

const ROLE_LABELS: Record<DemoDashboardRoleId, { label: string; summary: string }> = {
  professor: {
    label: "Professor / PI group intelligence",
    summary:
      "Linked Demo Universe investigations for group discussion — not private student notes, not org production data.",
  },
  student: {
    label: "Student research shell",
    summary:
      "Personal investigation entry points from the Demo Universe. Profile persistence stays fail-closed.",
  },
  biotech: {
    label: "Biotech / translational R&D",
    summary:
      "Candidate mechanism scenarios for target triage rehearsal. Not pipeline truth or scientific gold.",
  },
  clinical: {
    label: "Clinical research shell",
    summary:
      "Disease-mechanism and inflammation scenarios for translational discussion. Not CDS; no PHI.",
  },
  lab: {
    label: "Laboratory & omics",
    summary:
      "Single-cell and tissue-remodelling scenarios with assay context conflicts. No fake QC scores.",
  },
  community: {
    label: "Research community",
    summary:
      "Shared vocabulary scenarios for discussion demos. Circles store held; no automatic IP bleed.",
  },
};

function cardForScenario(scenarioId: string): DemoRoleScenarioCard {
  const bundle = getDemoUniverseBundle(scenarioId);
  return {
    scenarioId: bundle.scenario.id,
    investigationId: bundle.investigation.id,
    title: bundle.scenario.title,
    question: bundle.scenario.question,
    domain: bundle.scenario.domain,
    href: `/demo/universe?scenario=${encodeURIComponent(bundle.scenario.id)}`,
  };
}

/** Role → Demo Universe slice. Fail-closed if a mapped scenario id is unknown. */
export function demoUniverseSliceForRole(roleId: DemoDashboardRoleId): DemoRoleUniverseSlice {
  const seeded = new Set(listDemoScenarioIds());
  const ids = ROLE_SCENARIO_IDS[roleId];
  for (const id of ids) {
    if (!seeded.has(id)) {
      throw new Error(`Demo role adapter references unknown scenario: ${id}`);
    }
  }
  const cards = ids.map(cardForScenario);
  const sharedNodeIds = [
    ...new Set(cards.flatMap((c) => [...getDemoUniverseBundle(c.scenarioId).scenario.sharedNodeIds])),
  ];
  const copy = ROLE_LABELS[roleId];
  return {
    schemaVersion: DEMO_ROLE_ADAPTER_SCHEMA,
    roleId,
    label: copy.label,
    summary: copy.summary,
    cards,
    sharedNodeIds,
    comparisonSurface: "/demo/universe",
    honesty: DEMO_HONESTY,
    canWriteToProductionGraph: false,
    duplicatesCatalog: false,
  };
}

export function listDemoDashboardRoleIds(): readonly DemoDashboardRoleId[] {
  return ["professor", "student", "biotech", "clinical", "lab", "community"];
}
