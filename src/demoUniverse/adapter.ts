/**
 * Read-only Demo Data Adapter.
 * Supplies connected fixtures to UI/tests. Never writes to production research storage.
 */
import { GUT_IMMUNE_METABOLIC_BUNDLE } from "./fixtures/gutImmuneMetabolic";
import { assertValidDemoUniverseBundle } from "./schema";
import type {
  DemoEvidenceClaim,
  DemoEvidenceComparison,
  DemoMechanismEdge,
  DemoMechanismNode,
  DemoResearchBrief,
  DemoUniverseBundle,
} from "./types";
import { DEMO_HONESTY } from "./types";

const BUNDLES: Record<string, DemoUniverseBundle> = {
  [GUT_IMMUNE_METABOLIC_BUNDLE.scenario.id]: GUT_IMMUNE_METABOLIC_BUNDLE,
  [GUT_IMMUNE_METABOLIC_BUNDLE.investigation.id]: GUT_IMMUNE_METABOLIC_BUNDLE,
};

export type DemoInvestigationJourneyStep = {
  id: string;
  title: string;
  detail: string;
};

export type DemoInvestigationJourney = {
  investigationId: string;
  question: string;
  steps: readonly DemoInvestigationJourneyStep[];
  comparison: DemoEvidenceComparison;
  nodes: readonly DemoMechanismNode[];
  edges: readonly DemoMechanismEdge[];
  claims: readonly DemoEvidenceClaim[];
  brief: DemoResearchBrief;
  honesty: typeof DEMO_HONESTY;
};

function bundleFor(id: string): DemoUniverseBundle {
  const bundle = BUNDLES[id];
  if (!bundle) throw new Error(`Unknown demo universe id: ${id}`);
  assertValidDemoUniverseBundle(bundle);
  return bundle;
}

/** List seeded scenario ids (Phase 1: one complete scenario). */
export function listDemoScenarioIds(): readonly string[] {
  return [GUT_IMMUNE_METABOLIC_BUNDLE.scenario.id];
}

export function getDemoUniverseBundle(scenarioOrInvestigationId: string): DemoUniverseBundle {
  return bundleFor(scenarioOrInvestigationId);
}

/**
 * Smallest complete demonstration arc:
 * question → evidence context → mechanism → conflict → uncertainty → hypothesis → brief
 */
export function getDemoInvestigationJourney(
  investigationId = "DEMO-INV-001",
): DemoInvestigationJourney {
  const bundle = bundleFor(investigationId);
  const inv = bundle.investigation;
  const comparison = bundle.comparisons.find((c) => c.id === inv.comparisonIds[0]);
  const brief = bundle.briefs.find((b) => b.id === inv.briefId);
  if (!comparison || !brief) throw new Error("Core demo missing comparison or brief");

  const claims = bundle.claims.filter((c) => inv.evidenceClaimIds.includes(c.id));
  const nodes = bundle.nodes.filter((n) => inv.mechanismNodeIds.includes(n.id));
  const edges = bundle.edges.filter((e) => inv.mechanismEdgeIds.includes(e.id));
  const hypothesis = bundle.hypotheses.find((h) => h.id === inv.hypothesisIds[0]);

  return {
    investigationId: inv.id,
    question: inv.question,
    steps: [
      {
        id: "question",
        title: "Research question",
        detail: inv.question,
      },
      {
        id: "evidence-context",
        title: "Permitted evidence & experimental context",
        detail: `${claims.length} claims across ${bundle.contexts.length} contexts (${claims.filter((c) => c.provenance === "verified_public_source" || c.publicationId).length} publication-linked).`,
      },
      {
        id: "mechanism-graph",
        title: "Mechanism graph (candidate)",
        detail: `${nodes.length} nodes, ${edges.length} candidate edges — not scientifically approved.`,
      },
      {
        id: "conflicting-findings",
        title: "Conflicting findings",
        detail: comparison.title,
      },
      {
        id: "uncertainty",
        title: "Uncertainty & abstention",
        detail: comparison.abstention,
      },
      {
        id: "hypothesis",
        title: "Candidate hypothesis",
        detail: hypothesis?.text ?? "No hypothesis",
      },
      {
        id: "brief",
        title: "Reviewable research brief",
        detail: `${brief.title} — ${brief.limitations.length} explicit limitations.`,
      },
    ],
    comparison,
    nodes,
    edges,
    claims,
    brief,
    honesty: DEMO_HONESTY,
  };
}

/** Guard used by callers before any hypothetical write path. */
export function demoUniverseAllowsProductionWrite(): false {
  return DEMO_HONESTY.canWriteToProductionGraph;
}
