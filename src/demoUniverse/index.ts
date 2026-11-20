export {
  DEMO_HONESTY,
  DEMO_UNIVERSE_SCHEMA,
  type DemoHonestyFlags,
  type DemoInvestigation,
  type DemoProvenanceClass,
  type DemoScientificDomain,
  type DemoUniverseBundle,
} from "./types";
export { validateDemoUniverseBundle, assertValidDemoUniverseBundle } from "./schema";
export {
  getDemoUniverseBundle,
  getDemoInvestigationJourney,
  listDemoScenarioIds,
  demoUniverseAllowsProductionWrite,
  type DemoInvestigationJourney,
} from "./adapter";
export { DEMO_UNIVERSE_MANIFEST } from "./manifest";
export { GUT_IMMUNE_METABOLIC_BUNDLE } from "./fixtures/gutImmuneMetabolic";
export {
  PHASE2_BUNDLES,
  IMMUNE_INFLAMMATION_BUNDLE,
  NEUROIMMUNE_SIGNALLING_BUNDLE,
  SINGLE_CELL_OMICS_BUNDLE,
  TISSUE_REMODELLING_BUNDLE,
  COMPARATIVE_DISEASE_MECHANISMS_BUNDLE,
} from "./fixtures/phase2Scenarios";
export { SHARED_NODES, SHARED_PUBLICATIONS } from "./fixtures/sharedCatalog";
