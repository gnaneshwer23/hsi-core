/**
 * Read-only presentation helpers for Demo Research Universe UI (PR3).
 * Never writes to production storage; never claims scientific approval.
 */
import { getDemoInvestigationJourney, getDemoUniverseBundle, listDemoScenarioIds } from "./adapter";
import type {
  DemoEvidenceClaim,
  DemoEvidenceComparison,
  DemoHonestyFlags,
  DemoMechanismEdge,
  DemoMechanismNode,
  DemoProvenanceClass,
  DemoResearchBrief,
  DemoScientificDomain,
} from "./types";
import { DEMO_HONESTY } from "./types";

export type DemoScenarioSummary = {
  scenarioId: string;
  investigationId: string;
  title: string;
  question: string;
  domain: DemoScientificDomain;
  status: "seeded" | "planned";
};

export type DemoComparisonSide = {
  claimId: string;
  polarity: DemoEvidenceClaim["polarity"];
  provenance: DemoProvenanceClass;
  summary: string;
  contextModel: string;
  contextTissue: string;
  contextSpecies: string;
  contextExposure: string;
  contextEndpoint: string;
  simulatedResultLabel?: string;
  publicationTitle?: string;
  publicationPmid?: string;
};

export type DemoComparisonView = {
  scenarioId: string;
  investigationId: string;
  title: string;
  question: string;
  domain: DemoScientificDomain;
  journeySteps: readonly { id: string; title: string; detail: string }[];
  comparison: DemoEvidenceComparison;
  left: DemoComparisonSide;
  right: DemoComparisonSide;
  nodes: readonly DemoMechanismNode[];
  edges: readonly DemoMechanismEdge[];
  claims: readonly DemoEvidenceClaim[];
  brief: DemoResearchBrief;
  hypothesisText: string;
  gaps: readonly string[];
  honesty: DemoHonestyFlags;
  canWriteToProductionGraph: false;
};

function sideFromClaim(
  claim: DemoEvidenceClaim,
  bundle: ReturnType<typeof getDemoUniverseBundle>,
): DemoComparisonSide {
  const ctx = bundle.contexts.find((c) => c.id === claim.contextId);
  const pub = claim.publicationId
    ? bundle.publications.find((p) => p.id === claim.publicationId)
    : undefined;
  return {
    claimId: claim.id,
    polarity: claim.polarity,
    provenance: claim.provenance,
    summary: claim.summary,
    contextModel: ctx?.model ?? "Context missing",
    contextTissue: ctx?.tissue ?? "Not stated",
    contextSpecies: ctx?.species ?? "Not stated",
    contextExposure: ctx?.exposure ?? "Not stated",
    contextEndpoint: ctx?.endpoint ?? "Not stated",
    simulatedResultLabel: claim.simulatedResultLabel,
    publicationTitle: pub?.title,
    publicationPmid: pub?.pmid,
  };
}

/** Scenario picker rows for the demo UI. */
export function listDemoScenarioSummaries(): readonly DemoScenarioSummary[] {
  return listDemoScenarioIds().map((scenarioId) => {
    const bundle = getDemoUniverseBundle(scenarioId);
    return {
      scenarioId: bundle.scenario.id,
      investigationId: bundle.investigation.id,
      title: bundle.scenario.title,
      question: bundle.scenario.question,
      domain: bundle.scenario.domain,
      status: bundle.scenario.status,
    };
  });
}

/**
 * Full comparison + brief view for one investigation.
 * Defaults to Phase 1 gut–immune investigation.
 */
export function buildDemoComparisonView(
  scenarioOrInvestigationId = "DEMO-INV-001",
): DemoComparisonView {
  const bundle = getDemoUniverseBundle(scenarioOrInvestigationId);
  const journey = getDemoInvestigationJourney(bundle.investigation.id);
  const leftClaim = bundle.claims.find((c) => c.id === journey.comparison.leftClaimId);
  const rightClaim = bundle.claims.find((c) => c.id === journey.comparison.rightClaimId);
  if (!leftClaim || !rightClaim) {
    throw new Error("Comparison claims missing from demo bundle");
  }
  const hypothesis = bundle.hypotheses.find((h) => h.id === bundle.investigation.hypothesisIds[0]);
  return {
    scenarioId: bundle.scenario.id,
    investigationId: bundle.investigation.id,
    title: bundle.scenario.title,
    question: journey.question,
    domain: bundle.scenario.domain,
    journeySteps: journey.steps,
    comparison: journey.comparison,
    left: sideFromClaim(leftClaim, bundle),
    right: sideFromClaim(rightClaim, bundle),
    nodes: journey.nodes,
    edges: journey.edges,
    claims: journey.claims,
    brief: journey.brief,
    hypothesisText: hypothesis?.text ?? "No hypothesis in this demo.",
    gaps: bundle.gaps.map((g) => g.text),
    honesty: DEMO_HONESTY,
    canWriteToProductionGraph: false,
  };
}

export function provenanceLabel(provenance: DemoProvenanceClass): string {
  switch (provenance) {
    case "verified_public_source":
      return "Verified public source";
    case "curated_demonstration_interpretation":
      return "Curated demonstration interpretation";
    case "fully_synthetic_fixture":
      return "Fully synthetic fixture";
    default: {
      const _exhaustive: never = provenance;
      return _exhaustive;
    }
  }
}
