/**
 * Demo Research Universe registry — what exists, what is planned, what is reused.
 */
import { GUT_IMMUNE_METABOLIC_BUNDLE } from "./fixtures/gutImmuneMetabolic";
import {
  COMPARATIVE_DISEASE_MECHANISMS_BUNDLE,
  IMMUNE_INFLAMMATION_BUNDLE,
  NEUROIMMUNE_SIGNALLING_BUNDLE,
  SINGLE_CELL_OMICS_BUNDLE,
  TISSUE_REMODELLING_BUNDLE,
} from "./fixtures/phase2Scenarios";
import { DEMO_UNIVERSE_SCHEMA, type DemoScientificDomain } from "./types";

export type DemoRegistryEntry = {
  id: string;
  kind: "scenario" | "investigation" | "reuse_pointer";
  status: "seeded" | "planned" | "external_reuse";
  domain?: DemoScientificDomain;
  path: string;
  notes: string;
};

const PHASE2_SCENARIO_ENTRIES = [
  {
    id: IMMUNE_INFLAMMATION_BUNDLE.scenario.id,
    kind: "scenario" as const,
    status: "seeded" as const,
    domain: IMMUNE_INFLAMMATION_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "Phase 2: cytokine / myeloid conflict arc.",
  },
  {
    id: IMMUNE_INFLAMMATION_BUNDLE.investigation.id,
    kind: "investigation" as const,
    status: "seeded" as const,
    domain: IMMUNE_INFLAMMATION_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "DEMO-INV-002.",
  },
  {
    id: NEUROIMMUNE_SIGNALLING_BUNDLE.scenario.id,
    kind: "scenario" as const,
    status: "seeded" as const,
    domain: NEUROIMMUNE_SIGNALLING_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "Phase 2: microglia / barrier + gut–brain bibliographic context.",
  },
  {
    id: NEUROIMMUNE_SIGNALLING_BUNDLE.investigation.id,
    kind: "investigation" as const,
    status: "seeded" as const,
    domain: NEUROIMMUNE_SIGNALLING_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "DEMO-INV-003.",
  },
  {
    id: SINGLE_CELL_OMICS_BUNDLE.scenario.id,
    kind: "scenario" as const,
    status: "seeded" as const,
    domain: SINGLE_CELL_OMICS_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "Phase 2: scRNA-seq annotation conflict.",
  },
  {
    id: SINGLE_CELL_OMICS_BUNDLE.investigation.id,
    kind: "investigation" as const,
    status: "seeded" as const,
    domain: SINGLE_CELL_OMICS_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "DEMO-INV-004.",
  },
  {
    id: TISSUE_REMODELLING_BUNDLE.scenario.id,
    kind: "scenario" as const,
    status: "seeded" as const,
    domain: TISSUE_REMODELLING_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "Phase 2: fibroblast / ECM remodelling conflict.",
  },
  {
    id: TISSUE_REMODELLING_BUNDLE.investigation.id,
    kind: "investigation" as const,
    status: "seeded" as const,
    domain: TISSUE_REMODELLING_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "DEMO-INV-005.",
  },
  {
    id: COMPARATIVE_DISEASE_MECHANISMS_BUNDLE.scenario.id,
    kind: "scenario" as const,
    status: "seeded" as const,
    domain: COMPARATIVE_DISEASE_MECHANISMS_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "Phase 2: RA vs SSc shared-node comparison without causal equivalence.",
  },
  {
    id: COMPARATIVE_DISEASE_MECHANISMS_BUNDLE.investigation.id,
    kind: "investigation" as const,
    status: "seeded" as const,
    domain: COMPARATIVE_DISEASE_MECHANISMS_BUNDLE.scenario.domain,
    path: "src/demoUniverse/fixtures/phase2Scenarios.ts",
    notes: "DEMO-INV-006.",
  },
] as const;

export const DEMO_UNIVERSE_MANIFEST = {
  schemaVersion: DEMO_UNIVERSE_SCHEMA,
  phase: 2 as const,
  title: "HSI Demo Research Universe",
  principle:
    "Synthetic users and organisations + real, traceable public scientific evidence + clearly labelled simulated research findings.",
  seededScenarioIds: [
    GUT_IMMUNE_METABOLIC_BUNDLE.scenario.id,
    IMMUNE_INFLAMMATION_BUNDLE.scenario.id,
    NEUROIMMUNE_SIGNALLING_BUNDLE.scenario.id,
    SINGLE_CELL_OMICS_BUNDLE.scenario.id,
    TISSUE_REMODELLING_BUNDLE.scenario.id,
    COMPARATIVE_DISEASE_MECHANISMS_BUNDLE.scenario.id,
  ] as const,
  plannedScenarioIds: [] as const,
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
      id: "shared-catalog",
      kind: "reuse_pointer",
      status: "external_reuse",
      path: "src/demoUniverse/fixtures/sharedCatalog.ts",
      notes: "Cross-scenario publications, orgs, researchers and mechanism nodes.",
    },
    ...PHASE2_SCENARIO_ENTRIES,
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
    "PR2 six-domain scenarios + shared nodes",
    "PR3 evidence comparison UI + briefs (this PR) — /demo/universe",
    "PR4 role dashboard adapters",
    "PR5 omics / lab / synthetic cohorts",
    "PR6 landing-page integration + e2e",
  ] as const,
} as const;
