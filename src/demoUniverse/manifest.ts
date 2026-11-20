/**
 * Demo Research Universe registry — what exists, what is planned, what is reused.
 */
import { GUT_IMMUNE_METABOLIC_BUNDLE } from "./fixtures/gutImmuneMetabolic";
import { DEMO_UNIVERSE_SCHEMA, type DemoScientificDomain } from "./types";

export type DemoRegistryEntry = {
  id: string;
  kind: "scenario" | "investigation" | "reuse_pointer";
  status: "seeded" | "planned" | "external_reuse";
  domain?: DemoScientificDomain;
  path: string;
  notes: string;
};

export const DEMO_UNIVERSE_MANIFEST = {
  schemaVersion: DEMO_UNIVERSE_SCHEMA,
  phase: 1 as const,
  title: "HSI Demo Research Universe",
  principle:
    "Synthetic users and organisations + real, traceable public scientific evidence + clearly labelled simulated research findings.",
  seededScenarioIds: [GUT_IMMUNE_METABOLIC_BUNDLE.scenario.id] as const,
  plannedScenarioIds: [
    "immune-inflammation",
    "neuroimmune-signalling",
    "single-cell-omics",
    "tissue-remodelling",
    "comparative-disease-mechanisms",
  ] as const,
  entries: [
    {
      id: "gut-immune-metabolic",
      kind: "scenario",
      status: "seeded",
      domain: "microbiome-metabolism",
      path: "src/demoUniverse/fixtures/gutImmuneMetabolic.ts",
      notes: "Phase 1 complete arc: question → context → mechanism → conflict → uncertainty → hypothesis → brief.",
    },
    {
      id: "DEMO-INV-001",
      kind: "investigation",
      status: "seeded",
      domain: "microbiome-metabolism",
      path: "src/demoUniverse/fixtures/gutImmuneMetabolic.ts",
      notes: "Owned by fictional DEMO-RESEARCHER-001; project DEMO-PROJECT-001.",
    },
    {
      id: "reuse-evidenceFixtures",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "src/demo/evidenceFixtures.ts",
      notes: "PMID 27912057 and 11298065 bibliographic metadata (verified 2026-11-09).",
    },
    {
      id: "reuse-curatedDisagreement",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "src/investigation/curatedDisagreementPack.ts",
      notes: "Related case id gut-treg-vs-scfa-th17 referenced; sealed graph not copied.",
    },
    {
      id: "reuse-demonstration-scenarios",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "src/demonstration/scenarios.ts",
      notes: "IL-21 investor catalogue remains separate; do not overwrite.",
    },
    {
      id: "reuse-enterprise-demos",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "src/enterprise/*Demo.ts",
      notes: "Role dashboards adapt onto this universe in later PRs — do not duplicate catalogs yet.",
    },
    {
      id: "do-not-touch-sealed-graph",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "research/domain-graph/graph.v1.json",
      notes: "Read-only via sealedGraphEdgeIdRef pointers only.",
    },
  ] satisfies readonly DemoRegistryEntry[],
  delivery: [
    "PR1 registry + schemas + provenance + Phase 1 core investigation",
    "PR2 six-domain scenarios + mechanism visualisation",
    "PR3 evidence comparison UI + briefs",
    "PR4 role dashboard adapters",
    "PR5 omics / lab / synthetic cohorts",
    "PR6 landing-page integration + e2e",
  ] as const,
} as const;
