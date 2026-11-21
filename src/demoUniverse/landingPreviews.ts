/**
 * Demo Research Universe PR6 — landing-page product previews.
 * Pack-backed sketches for public marketing surfaces. Read-only.
 * Never claims scientific approval or enables production graph writes.
 */
import { buildDemoComparisonView, listDemoScenarioSummaries } from "./presentation";
import { DEMO_HONESTY, type DemoHonestyFlags, type DemoScientificDomain } from "./types";

export const DEMO_LANDING_PREVIEW_SCHEMA = "hsi-demo-landing-preview-1" as const;

export type DemoLandingPreviewCard = {
  scenarioId: string;
  investigationId: string;
  shortLabel: string;
  title: string;
  question: string;
  domain: DemoScientificDomain;
  conflictLeft: string;
  conflictRight: string;
  abstention: string;
  supportingCount: number;
  conflictingCount: number;
  gapCount: number;
  briefLimitationCount: number;
  href: string;
  coverage: "pack_backed";
  liveBackend: false;
  reviewStatus: "not_reviewed";
};

export type DemoLandingPreviewPack = {
  schemaVersion: typeof DEMO_LANDING_PREVIEW_SCHEMA;
  cards: readonly DemoLandingPreviewCard[];
  honesty: DemoHonestyFlags;
  canWriteToProductionGraph: false;
  stagingVerified: false;
  surface: "public_landing";
};

/** Homepage / editorial sketch ids that map onto Demo Universe scenarios. */
export const HOME_SKETCH_TO_DEMO_SCENARIO = {
  gut_neuro: "neuroimmune-signalling",
  metabolic_inflammation: "gut-immune-metabolic",
  cytokine_cross_tissue: "immune-inflammation",
  ssc_fibrosis: "tissue-remodelling",
} as const;

export type HomeSketchIdWithDemo = keyof typeof HOME_SKETCH_TO_DEMO_SCENARIO;

const SHORT_LABELS: Record<string, string> = {
  "gut-immune-metabolic": "Gut–immune",
  "immune-inflammation": "Inflammation",
  "neuroimmune-signalling": "Neuroimmune",
  "single-cell-omics": "Single-cell",
  "tissue-remodelling": "Tissue",
  "comparative-disease-mechanisms": "Comparative",
};

/** Public landing copy says Example. Fixture records keep their technical labels. */
function exampleCopy(text: string): string {
  return text.replace(/Synthetic Study/g, "Example study").replace(/\bsynthetic\b/gi, "example");
}

function cardFromScenario(scenarioId: string): DemoLandingPreviewCard {
  const view = buildDemoComparisonView(scenarioId);
  const supportingCount = view.claims.filter((c) => c.polarity === "supports").length;
  const conflictingCount = view.claims.filter(
    (c) => c.polarity === "conflicts" || c.polarity === "limits",
  ).length;
  return {
    scenarioId: view.scenarioId,
    investigationId: view.investigationId,
    shortLabel: SHORT_LABELS[view.scenarioId] ?? view.title.slice(0, 24),
    title: exampleCopy(view.title),
    question: exampleCopy(view.question),
    domain: view.domain,
    conflictLeft: exampleCopy(view.left.summary),
    conflictRight: exampleCopy(view.right.summary),
    abstention: exampleCopy(view.comparison.abstention),
    supportingCount,
    conflictingCount,
    gapCount: view.gaps.length,
    briefLimitationCount: view.brief.limitations.length,
    href: `/demo/universe?scenario=${encodeURIComponent(view.scenarioId)}`,
    coverage: "pack_backed",
    liveBackend: false,
    reviewStatus: "not_reviewed",
  };
}

/** All seeded Demo Universe scenarios as landing preview cards. */
export function listDemoLandingPreviews(): readonly DemoLandingPreviewCard[] {
  return listDemoScenarioSummaries().map((s) => cardFromScenario(s.scenarioId));
}

export function getDemoLandingPreview(scenarioId: string): DemoLandingPreviewCard {
  return cardFromScenario(scenarioId);
}

export function getDemoLandingPreviewPack(): DemoLandingPreviewPack {
  return {
    schemaVersion: DEMO_LANDING_PREVIEW_SCHEMA,
    cards: listDemoLandingPreviews(),
    honesty: DEMO_HONESTY,
    canWriteToProductionGraph: false,
    stagingVerified: false,
    surface: "public_landing",
  };
}

export function demoLandingAllowsProductionWrite(): false {
  return false;
}

export function demoScenarioIdForHomeSketch(
  sketchId: string,
): (typeof HOME_SKETCH_TO_DEMO_SCENARIO)[HomeSketchIdWithDemo] | null {
  if (sketchId in HOME_SKETCH_TO_DEMO_SCENARIO) {
    return HOME_SKETCH_TO_DEMO_SCENARIO[sketchId as HomeSketchIdWithDemo];
  }
  return null;
}
