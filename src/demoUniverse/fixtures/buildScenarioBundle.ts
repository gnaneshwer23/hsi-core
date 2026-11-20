/**
 * Compact factory for Demo Research Universe scenario bundles.
 * Each scenario gets a complete investigation arc with shared catalog reuse.
 */
import {
  DEMO_HONESTY,
  DEMO_UNIVERSE_SCHEMA,
  type DemoEvidenceClaim,
  type DemoEvidenceComparison,
  type DemoExperimentalContext,
  type DemoGap,
  type DemoHypothesis,
  type DemoMechanismEdge,
  type DemoResearchBrief,
  type DemoScientificDomain,
  type DemoUniverseBundle,
} from "../types";
import {
  SHARED_ORGANISATIONS,
  SHARED_PUBLICATIONS,
  SHARED_RESEARCHERS,
  nodesByIds,
} from "./sharedCatalog";

export type ScenarioSeed = {
  scenarioId: string;
  investigationId: string;
  projectId: string;
  domain: DemoScientificDomain;
  domainIds: readonly DemoScientificDomain[];
  title: string;
  question: string;
  sharedNodeIds: readonly string[];
  mechanismNodeIds: readonly string[];
  ownerId: string;
  organisationId: string;
  leadResearcherId: string;
  projectTitle: string;
  /** Id prefix for local records (e.g. "I" → DEMO-CTX-I01). */
  idPrefix: string;
  contexts: readonly {
    model: string;
    tissue: string;
    species: string;
    exposure: string;
    endpoint: string;
    notes?: string;
  }[];
  /** Two synthetic opposing claims + optional curated / insufficient extras. */
  syntheticPair: {
    subjectNodeId: string;
    objectNodeId: string;
    supportsSummary: string;
    conflictsSummary: string;
    supportsLabel: string;
    conflictsLabel: string;
    supportsDirection: "lower" | "higher" | "null" | "mixed";
    conflictsDirection: "lower" | "higher" | "null" | "mixed";
    comparisonTitle: string;
    whyTheyDiffer: readonly string[];
    abstention: string;
  };
  curatedClaim: {
    publicationId: "DEMO-PUB-001" | "DEMO-PUB-002";
    subjectNodeId: string;
    objectNodeId: string;
    predicate: string;
    summary: string;
    polarity: "supports" | "limits";
    missingFields: readonly string[];
  };
  insufficientClaim: {
    subjectNodeId: string;
    objectNodeId: string;
    predicate: string;
    summary: string;
    missingFields: readonly string[];
  };
  edges: readonly {
    fromNodeId: string;
    toNodeId: string;
    predicate: string;
    provenance: "fully_synthetic_fixture" | "curated_demonstration_interpretation";
    claimIndexes: readonly number[];
    uncertainty: string;
    sealedGraphEdgeIdRef?: string;
  }[];
  gaps: readonly { text: string; relatedNodeIds: readonly string[] }[];
  hypothesis: {
    text: string;
    supportingIndexes: readonly number[];
    opposingIndexes: readonly number[];
    proposedExperiment: string;
  };
  briefTitle: string;
  limitations: readonly string[];
  nextDecisions: readonly string[];
  relatedCuratedDisagreementCaseId?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function buildScenarioBundle(seed: ScenarioSeed): DemoUniverseBundle {
  const p = seed.idPrefix;
  const contexts: DemoExperimentalContext[] = seed.contexts.map((c, i) => ({
    id: `DEMO-CTX-${p}${pad(i + 1)}`,
    ...c,
  }));
  const biblioCtxId = contexts[contexts.length - 1]?.id ?? `DEMO-CTX-${p}03`;

  const claims: DemoEvidenceClaim[] = [
    {
      id: `DEMO-CLAIM-${p}01`,
      provenance: "fully_synthetic_fixture",
      contextId: contexts[0]!.id,
      subjectNodeId: seed.syntheticPair.subjectNodeId,
      objectNodeId: seed.syntheticPair.objectNodeId,
      predicate: "simulated association (supports direction)",
      polarity: "supports",
      summary: seed.syntheticPair.supportsSummary,
      simulatedResultLabel: seed.syntheticPair.supportsLabel,
      simulatedResultDirection: seed.syntheticPair.supportsDirection,
      missingFields: ["Real sample size", "Assay lot", "Independent replication"],
      honesty: DEMO_HONESTY,
    },
    {
      id: `DEMO-CLAIM-${p}02`,
      provenance: "fully_synthetic_fixture",
      contextId: contexts[1]!.id,
      subjectNodeId: seed.syntheticPair.subjectNodeId,
      objectNodeId: seed.syntheticPair.objectNodeId,
      predicate: "simulated association (conflicts direction)",
      polarity: "conflicts",
      summary: seed.syntheticPair.conflictsSummary,
      simulatedResultLabel: seed.syntheticPair.conflictsLabel,
      simulatedResultDirection: seed.syntheticPair.conflictsDirection,
      missingFields: ["Human translation", "Matched controls", "Independent replication"],
      honesty: DEMO_HONESTY,
    },
    {
      id: `DEMO-CLAIM-${p}03`,
      provenance: "curated_demonstration_interpretation",
      publicationId: seed.curatedClaim.publicationId,
      contextId: biblioCtxId,
      subjectNodeId: seed.curatedClaim.subjectNodeId,
      objectNodeId: seed.curatedClaim.objectNodeId,
      predicate: seed.curatedClaim.predicate,
      polarity: seed.curatedClaim.polarity,
      summary: seed.curatedClaim.summary,
      missingFields: seed.curatedClaim.missingFields,
      honesty: DEMO_HONESTY,
    },
    {
      id: `DEMO-CLAIM-${p}04`,
      provenance: "fully_synthetic_fixture",
      contextId: contexts[0]!.id,
      subjectNodeId: seed.insufficientClaim.subjectNodeId,
      objectNodeId: seed.insufficientClaim.objectNodeId,
      predicate: seed.insufficientClaim.predicate,
      polarity: "insufficient",
      summary: seed.insufficientClaim.summary,
      missingFields: seed.insufficientClaim.missingFields,
      honesty: DEMO_HONESTY,
    },
  ];

  const claimIds = claims.map((c) => c.id);

  const edges: DemoMechanismEdge[] = seed.edges.map((e, i) => ({
    id: `DEMO-EDGE-${p}${pad(i + 1)}`,
    fromNodeId: e.fromNodeId,
    toNodeId: e.toNodeId,
    predicate: e.predicate,
    provenance: e.provenance,
    evidenceClaimIds: e.claimIndexes.map((idx) => claimIds[idx]!),
    uncertainty: e.uncertainty,
    sealedGraphEdgeIdRef: e.sealedGraphEdgeIdRef,
    honesty: DEMO_HONESTY,
  }));

  const comparison: DemoEvidenceComparison = {
    id: `DEMO-COMP-${p}01`,
    title: seed.syntheticPair.comparisonTitle,
    leftClaimId: claimIds[0]!,
    rightClaimId: claimIds[1]!,
    whyTheyDiffer: seed.syntheticPair.whyTheyDiffer,
    uncertaintyNotes: [
      "Simulated numeric results are not measurements from real assays.",
      "Studies are not comparable without matched models and endpoints.",
      "No causal claim is justified from this synthetic pair.",
    ],
    abstention: seed.syntheticPair.abstention,
    honesty: DEMO_HONESTY,
  };

  const gaps: DemoGap[] = seed.gaps.map((g, i) => ({
    id: `DEMO-GAP-${p}${pad(i + 1)}`,
    text: g.text,
    relatedNodeIds: g.relatedNodeIds,
  }));

  const hypothesis: DemoHypothesis = {
    id: `DEMO-HYP-${p}01`,
    text: seed.hypothesis.text,
    epistemicType: "unvalidated_hypothesis",
    supportingClaimIds: seed.hypothesis.supportingIndexes.map((i) => claimIds[i]!),
    opposingClaimIds: seed.hypothesis.opposingIndexes.map((i) => claimIds[i]!),
    proposedExperiment: seed.hypothesis.proposedExperiment,
    honesty: DEMO_HONESTY,
  };

  const edgeIds = edges.map((e) => e.id);
  const gapIds = gaps.map((g) => g.id);

  const brief: DemoResearchBrief = {
    id: `DEMO-BRIEF-${p}01`,
    investigationId: seed.investigationId,
    title: seed.briefTitle,
    question: seed.question,
    evidenceClaimIds: claimIds,
    mechanismEdgeIds: edgeIds,
    comparisonIds: [comparison.id],
    gapIds,
    hypothesisIds: [hypothesis.id],
    limitations: seed.limitations,
    nextDecisions: seed.nextDecisions,
    honesty: DEMO_HONESTY,
  };

  const org = SHARED_ORGANISATIONS.find((o) => o.id === seed.organisationId);
  const researchers = SHARED_RESEARCHERS.filter(
    (r) => r.organisationId === seed.organisationId || r.id === seed.ownerId || r.id === seed.leadResearcherId,
  );
  const pubs = SHARED_PUBLICATIONS.filter((pub) => pub.id === seed.curatedClaim.publicationId);

  return {
    schemaVersion: DEMO_UNIVERSE_SCHEMA,
    honesty: DEMO_HONESTY,
    scenario: {
      id: seed.scenarioId,
      domain: seed.domain,
      title: seed.title,
      question: seed.question,
      investigationIds: [seed.investigationId],
      sharedNodeIds: seed.sharedNodeIds,
      status: "seeded",
    },
    organisations: org ? [org] : [SHARED_ORGANISATIONS[0]!],
    researchers: researchers.length > 0 ? researchers : [SHARED_RESEARCHERS[0]!],
    projects: [
      {
        id: seed.projectId,
        title: seed.projectTitle,
        organisationId: seed.organisationId,
        leadResearcherId: seed.leadResearcherId,
        investigationIds: [seed.investigationId],
        fictional: true,
      },
    ],
    publications: pubs.length > 0 ? pubs : [SHARED_PUBLICATIONS[0]!],
    contexts,
    nodes: nodesByIds(seed.mechanismNodeIds),
    claims,
    edges,
    comparisons: [comparison],
    gaps,
    hypotheses: [hypothesis],
    briefs: [brief],
    investigation: {
      id: seed.investigationId,
      scenarioId: seed.scenarioId,
      question: seed.question,
      domainIds: seed.domainIds,
      ownerId: seed.ownerId,
      projectId: seed.projectId,
      status: "illustrative",
      evidenceClaimIds: claimIds,
      mechanismNodeIds: seed.mechanismNodeIds,
      mechanismEdgeIds: edgeIds,
      comparisonIds: [comparison.id],
      gapIds,
      hypothesisIds: [hypothesis.id],
      briefId: brief.id,
      relatedCuratedDisagreementCaseId: seed.relatedCuratedDisagreementCaseId,
      honesty: DEMO_HONESTY,
    },
  };
}
