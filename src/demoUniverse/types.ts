/**
 * HSI Demo Research Universe — shared types.
 * Demonstration fixtures only. Never write into the governed production graph.
 */

export const DEMO_UNIVERSE_SCHEMA = "hsi-demo-research-universe-1" as const;

/** How a scientific claim or record was authored for the demo. */
export type DemoProvenanceClass =
  | "verified_public_source"
  | "curated_demonstration_interpretation"
  | "fully_synthetic_fixture";

export type DemoReviewStatus =
  | "not_scientifically_reviewed"
  | "awaiting_human_review"
  | "rejected_for_demo";

export type DemoScientificDomain =
  | "immune-inflammation"
  | "neuroscience"
  | "microbiome-metabolism"
  | "genomics-multi-omics"
  | "organ-tissue-biology"
  | "disease-mechanisms";

export type DemoEntityKind =
  | "gene"
  | "protein"
  | "cell"
  | "tissue"
  | "pathway"
  | "metabolite"
  | "phenotype"
  | "mechanism"
  | "disease"
  | "organism";

export type DemoHonestyFlags = {
  mode: "synthetic_demo";
  scientificApproval: false;
  reviewStatus: DemoReviewStatus;
  notClinicalAdvice: true;
  canWriteToProductionGraph: false;
  canSendSyntheticPhiToExternalAi: false;
};

export const DEMO_HONESTY: DemoHonestyFlags = {
  mode: "synthetic_demo",
  scientificApproval: false,
  reviewStatus: "not_scientifically_reviewed",
  notClinicalAdvice: true,
  canWriteToProductionGraph: false,
  canSendSyntheticPhiToExternalAi: false,
};

export type DemoPublication = {
  id: string;
  provenance: DemoProvenanceClass;
  title: string;
  /** Real identifiers only when provenance is verified_public_source. */
  pmid?: string;
  doi?: string;
  year?: number;
  journal?: string;
  authorsShort?: string;
  verifiedAt?: string;
  rightsNote: string;
  abstractReproduced: false;
};

export type DemoExperimentalContext = {
  id: string;
  model: string;
  tissue: string;
  species: string;
  exposure: string;
  endpoint: string;
  notes?: string;
};

export type DemoEvidenceClaim = {
  id: string;
  provenance: DemoProvenanceClass;
  publicationId?: string;
  contextId: string;
  subjectNodeId: string;
  objectNodeId: string;
  predicate: string;
  polarity: "supports" | "limits" | "conflicts" | "insufficient";
  summary: string;
  /** Simulated numeric readout — only for fully_synthetic_fixture. */
  simulatedResultLabel?: string;
  simulatedResultDirection?: "lower" | "higher" | "null" | "mixed";
  missingFields: readonly string[];
  honesty: DemoHonestyFlags;
};

export type DemoMechanismNode = {
  id: string;
  label: string;
  kind: DemoEntityKind;
  domainIds: readonly DemoScientificDomain[];
};

export type DemoMechanismEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  predicate: string;
  provenance: DemoProvenanceClass;
  evidenceClaimIds: readonly string[];
  uncertainty: string;
  /** Optional reference into sealed domain-graph edge ids — never mutated. */
  sealedGraphEdgeIdRef?: string;
  honesty: DemoHonestyFlags;
};

export type DemoEvidenceComparison = {
  id: string;
  title: string;
  leftClaimId: string;
  rightClaimId: string;
  whyTheyDiffer: readonly string[];
  uncertaintyNotes: readonly string[];
  abstention: string;
  honesty: DemoHonestyFlags;
};

export type DemoHypothesis = {
  id: string;
  text: string;
  epistemicType: "unvalidated_hypothesis";
  supportingClaimIds: readonly string[];
  opposingClaimIds: readonly string[];
  proposedExperiment: string;
  honesty: DemoHonestyFlags;
};

export type DemoGap = {
  id: string;
  text: string;
  relatedNodeIds: readonly string[];
};

export type DemoResearchBrief = {
  id: string;
  investigationId: string;
  title: string;
  question: string;
  evidenceClaimIds: readonly string[];
  mechanismEdgeIds: readonly string[];
  comparisonIds: readonly string[];
  gapIds: readonly string[];
  hypothesisIds: readonly string[];
  limitations: readonly string[];
  nextDecisions: readonly string[];
  honesty: DemoHonestyFlags;
};

export type DemoInvestigation = {
  id: string;
  scenarioId: string;
  question: string;
  domainIds: readonly DemoScientificDomain[];
  ownerId: string;
  projectId: string;
  status: "illustrative";
  evidenceClaimIds: readonly string[];
  mechanismNodeIds: readonly string[];
  mechanismEdgeIds: readonly string[];
  comparisonIds: readonly string[];
  gapIds: readonly string[];
  hypothesisIds: readonly string[];
  briefId: string;
  relatedCuratedDisagreementCaseId?: string;
  honesty: DemoHonestyFlags;
};

export type DemoResearcher = {
  id: string;
  displayName: string;
  role: "professor" | "student" | "postdoc" | "biotech_scientist" | "lab_scientist" | "clinical_researcher" | "admin";
  organisationId: string;
  interests: readonly string[];
  fictional: true;
};

export type DemoOrganisation = {
  id: string;
  name: string;
  kind: "university_group" | "biotech" | "laboratory" | "clinical_research_unit";
  fictional: true;
};

export type DemoProject = {
  id: string;
  title: string;
  organisationId: string;
  leadResearcherId: string;
  investigationIds: readonly string[];
  fictional: true;
};

export type DemoScenario = {
  id: string;
  domain: DemoScientificDomain;
  title: string;
  question: string;
  investigationIds: readonly string[];
  sharedNodeIds: readonly string[];
  status: "seeded" | "planned";
};

export type DemoUniverseBundle = {
  schemaVersion: typeof DEMO_UNIVERSE_SCHEMA;
  scenario: DemoScenario;
  investigation: DemoInvestigation;
  organisations: readonly DemoOrganisation[];
  researchers: readonly DemoResearcher[];
  projects: readonly DemoProject[];
  publications: readonly DemoPublication[];
  contexts: readonly DemoExperimentalContext[];
  claims: readonly DemoEvidenceClaim[];
  nodes: readonly DemoMechanismNode[];
  edges: readonly DemoMechanismEdge[];
  comparisons: readonly DemoEvidenceComparison[];
  gaps: readonly DemoGap[];
  hypotheses: readonly DemoHypothesis[];
  briefs: readonly DemoResearchBrief[];
  honesty: DemoHonestyFlags;
};
