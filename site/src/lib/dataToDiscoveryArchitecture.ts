/**
 * Honest Data-to-Discovery architecture status for the Technology page.
 * Status labels describe eng wiring — not scientific validity or production readiness.
 */
import {INVESTIGATION_SECTIONS} from "./investigationSections";

export const DATA_TO_DISCOVERY_STATUS = [
  "integrated",
  "partially_implemented",
  "fixture_only",
  "blocked",
  "missing",
] as const;

export type DataToDiscoveryStatus = (typeof DATA_TO_DISCOVERY_STATUS)[number];

export const DATA_TO_DISCOVERY_STATUS_LABEL: Record<DataToDiscoveryStatus, string> = {
  integrated: "Integrated",
  partially_implemented: "Partially implemented",
  fixture_only: "Fixture-only",
  blocked: "Blocked",
  missing: "Not connected",
};

export type DataToDiscoveryLayerId =
  | "sources"
  | "ingestion"
  | "storage"
  | "graph"
  | "agents"
  | "governance"
  | "outcomes"
  | "frontend"
  | "continuous";

export type DataToDiscoveryNode = {
  id: string;
  layer: DataToDiscoveryLayerId;
  label: string;
  detail: string;
  status: DataToDiscoveryStatus;
  /** Code or docs path for honesty — not a live health check. */
  evidence: string;
  workbenchSectionId?: (typeof INVESTIGATION_SECTIONS)[number]["id"];
  route?: string;
};

export type DataToDiscoveryLayer = {
  id: DataToDiscoveryLayerId;
  title: string;
  subtitle: string;
  status: DataToDiscoveryStatus;
  summary: string;
};

/** Contained diagram palette — scoped to the visualisation only. */
export const DATA_TO_DISCOVERY_DIAGRAM_PALETTE = {
  navy: "#0b1c3d",
  navyMid: "#122a56",
  cyan: "#3dd6f5",
  violet: "#8b7cff",
  ink: "#e8f1ff",
  muted: "#9bb0d4",
} as const;

export const DATA_TO_DISCOVERY_LAYERS: readonly DataToDiscoveryLayer[] = [
  {
    id: "sources",
    title: "Data sources",
    subtitle: "Governed providers",
    status: "partially_implemented",
    summary:
      "Europe PMC, Open Targets and ClinicalTrials.gov libraries exist. UniProt, Reactome, GO, ChEMBL, HGNC live fetch, HCA/CELLxGENE and omics planes are not connected.",
  },
  {
    id: "ingestion",
    title: "Ingestion",
    subtitle: "Retrieve · normalise",
    status: "partially_implemented",
    summary:
      "Dynamic retrieval and SSC discovery paths exist. Passage import stays blocked on human rights clearance (#2).",
  },
  {
    id: "storage",
    title: "Evidence storage",
    subtitle: "red-wave Neon",
    status: "partially_implemented",
    summary:
      "Identity-aware persistence and ledger review-candidates exist. Staging write acceptance remains human-gated (#5).",
  },
  {
    id: "graph",
    title: "Knowledge graph",
    subtitle: "Draft ≠ approved",
    status: "partially_implemented",
    summary:
      "Domain graph, contextual candidates and science explorers exist. Live ontology-backed edges from missing adapters are absent.",
  },
  {
    id: "agents",
    title: "Research agents",
    subtitle: "Bounded stages",
    status: "partially_implemented",
    summary:
      "Bounded agent stages with durable traces exist. Live Ask→export journey remains parked (#5).",
  },
  {
    id: "governance",
    title: "Governance",
    subtitle: "Human review",
    status: "integrated",
    summary:
      "Scientific review validators and CDS/PHI refusal are wired. Rights (#2), SME gold (#4) and MoU remain human-blocked.",
  },
  {
    id: "outcomes",
    title: "Research outcomes",
    subtitle: "Workbench 01–06",
    status: "integrated",
    summary:
      "Decision workbench outcome panel composes saved evidence into sections 01–06. Scientific validity is not claimed.",
  },
  {
    id: "frontend",
    title: "Frontend visualisation",
    subtitle: "Technology page",
    status: "partially_implemented",
    summary:
      "Conceptual TechnologyFlow shipped earlier; this diagram adds honest connection status and workbench links.",
  },
  {
    id: "continuous",
    title: "Continuous updates",
    subtitle: "Review-candidate only",
    status: "fixture_only",
    summary:
      "Living-evidence metadata refresh and N5 registry prep exist. Scheduled continuous refresh without auto-approve is not live.",
  },
] as const;

export const DATA_TO_DISCOVERY_NODES: readonly DataToDiscoveryNode[] = [
  {
    id: "epmc",
    layer: "sources",
    label: "Europe PMC",
    detail: "Bibliographic + cursorMark retrieval library; network-dependent.",
    status: "partially_implemented",
    evidence: "src/evidence/europePmcBibliographicLookup.ts",
    workbenchSectionId: "02",
    route: "/science/literature",
  },
  {
    id: "ot",
    layer: "sources",
    label: "Open Targets",
    detail: "GraphQL associations with non-causal score honesty.",
    status: "partially_implemented",
    evidence: "src/evidence/openTargetsLookup.ts",
    workbenchSectionId: "02",
    route: "/science/literature",
  },
  {
    id: "ctgov",
    layer: "sources",
    label: "ClinicalTrials.gov",
    detail: "Registry lookup library; translational attach is separate.",
    status: "partially_implemented",
    evidence: "src/evidence/clinicalTrialsGovLookup.ts",
    workbenchSectionId: "04",
    route: "/science/clinical-trials",
  },
  {
    id: "uniprot",
    layer: "sources",
    label: "UniProt",
    detail: "Ontology prefix + public fragment fixtures only — no live adapter.",
    status: "missing",
    evidence: "src/hsiOntologyRegistry.ts",
  },
  {
    id: "reactome",
    layer: "sources",
    label: "Reactome",
    detail: "Identifier prefix registered; no live pathway adapter.",
    status: "missing",
    evidence: "src/hsiOntologyRegistry.ts",
  },
  {
    id: "go",
    layer: "sources",
    label: "Gene Ontology",
    detail: "Identifier prefix registered; no live GO fetch.",
    status: "missing",
    evidence: "src/hsiOntologyRegistry.ts",
  },
  {
    id: "chembl",
    layer: "sources",
    label: "ChEMBL",
    detail: "May appear inside Open Targets datasource scores only — not a first-class adapter.",
    status: "missing",
    evidence: "src/evidence/openTargetsLookup.ts",
  },
  {
    id: "hgnc",
    layer: "sources",
    label: "HGNC",
    detail: "Identifier prefix registered; no live HGNC adapter.",
    status: "missing",
    evidence: "src/hsiOntologyRegistry.ts",
  },
  {
    id: "cellxgene",
    layer: "sources",
    label: "HCA / CELLxGENE",
    detail: "Not connected. Single-cell atlas ingest is out of current eng wiring.",
    status: "missing",
    evidence: "docs/audits/DATA_TO_DISCOVERY_IMPLEMENTATION_MATRIX.md",
  },
  {
    id: "omics",
    layer: "sources",
    label: "Omics interfaces",
    detail: "P3 model adapters use fixture fragments; no governed omics ingest plane.",
    status: "missing",
    evidence: "src/adapters/",
  },
  {
    id: "dynamic-retrieve",
    layer: "ingestion",
    label: "Dynamic retrieval",
    detail: "Unpinned query → provider search → search record.",
    status: "partially_implemented",
    evidence: "src/evidence/dynamicEvidenceRetrieval.ts",
    workbenchSectionId: "02",
    route: "/research/decision-workbench",
  },
  {
    id: "rights",
    layer: "ingestion",
    label: "Passage rights (#2)",
    detail: "Eng-assist inventory exists; principal attestation still required.",
    status: "blocked",
    evidence: "docs/engineering/HUMAN_QUEUE_RESIDUALS.md",
  },
  {
    id: "persist",
    layer: "storage",
    label: "Persistence + dedup",
    detail: "Identity-aware candidate persistence on red-wave.",
    status: "partially_implemented",
    evidence: "src/evidence/dynamicEvidencePersistence.ts",
  },
  {
    id: "ledger",
    layer: "storage",
    label: "Review candidates",
    detail: "Experiment ledger review_candidate cannot auto-publish graph.",
    status: "integrated",
    evidence: "src/evidence/experimentLedger.ts",
  },
  {
    id: "domain-graph",
    layer: "graph",
    label: "Domain graph",
    detail: "Versioned research domain graph + science explorers.",
    status: "partially_implemented",
    evidence: "research/domain-graph/graph.v1.json",
    workbenchSectionId: "01",
    route: "/science/graph",
  },
  {
    id: "contextual",
    layer: "graph",
    label: "Contextual candidates",
    detail: "Draft relationships with orthogonal honesty axes.",
    status: "partially_implemented",
    evidence: "src/evidence/contextualCandidateRelationships.ts",
    workbenchSectionId: "01",
  },
  {
    id: "bounded-agent",
    layer: "agents",
    label: "Bounded agent",
    detail: "Plan → retrieve → mechanism → oppose → gap → brief stages.",
    status: "partially_implemented",
    evidence: "src/evidence/boundedAgentExecution.ts",
    workbenchSectionId: "03",
    route: "/science/research-agents",
  },
  {
    id: "gap",
    layer: "agents",
    label: "Gap / oppose",
    detail: "Gap taxonomy + opposing search; coverage ≠ novelty.",
    status: "partially_implemented",
    evidence: "src/evidence/gapVerification.ts",
    workbenchSectionId: "03",
    route: "/science/contradictions",
  },
  {
    id: "review",
    layer: "governance",
    label: "Scientific review",
    detail: "Validators + independent reviewer queue; agents never self-approve.",
    status: "integrated",
    evidence: "src/scientificReview.ts",
    route: "/research/scientific-review",
  },
  {
    id: "cds-phi",
    layer: "governance",
    label: "CDS / PHI boundary",
    detail: "Live CDS and PHI are refused in substrate.",
    status: "integrated",
    evidence: "src/cdsPhiBoundary.ts",
  },
  {
    id: "outcome-01-06",
    layer: "outcomes",
    label: "Outcome panel 01–06",
    detail: "Composes saved investigation into continuous research sections.",
    status: "integrated",
    evidence: "site/src/components/ResearchOutcomePanel.tsx",
    workbenchSectionId: "01",
    route: "/research/decision-workbench",
  },
  {
    id: "tech-flow",
    layer: "frontend",
    label: "TechnologyFlow",
    detail: "Conceptual five-stage infographic (illustrative architecture).",
    status: "integrated",
    evidence: "site/src/components/TechnologyFlow.tsx",
    route: "/technology",
  },
  {
    id: "status-map",
    layer: "frontend",
    label: "Connection status map",
    detail: "This interactive diagram — eng status, not live telemetry.",
    status: "partially_implemented",
    evidence: "site/src/lib/dataToDiscoveryArchitecture.ts",
    route: "/technology",
  },
  {
    id: "living-refresh",
    layer: "continuous",
    label: "Living-evidence refresh",
    detail: "Metadata refresh when PMIDs overlap pins — not continuous crawl.",
    status: "fixture_only",
    evidence: "src/evidence/livingEvidenceExpansion.ts",
    workbenchSectionId: "01",
  },
  {
    id: "n5-refresh",
    layer: "continuous",
    label: "Registry refresh prep",
    detail: "N5 live registry refresh remains human-gated prep.",
    status: "blocked",
    evidence: "src/evidence/n5RegistryLiveRefresh.ts",
    workbenchSectionId: "04",
  },
] as const;

export function nodesForLayer(layerId: DataToDiscoveryLayerId): DataToDiscoveryNode[] {
  return DATA_TO_DISCOVERY_NODES.filter((node) => node.layer === layerId);
}

export function workbenchHref(sectionId: (typeof INVESTIGATION_SECTIONS)[number]["id"]): string {
  const section = INVESTIGATION_SECTIONS.find((item) => item.id === sectionId);
  return section
    ? `/research/decision-workbench#${section.anchor}`
    : "/research/decision-workbench";
}

export function countByStatus(
  nodes: readonly DataToDiscoveryNode[] = DATA_TO_DISCOVERY_NODES,
): Record<DataToDiscoveryStatus, number> {
  const counts: Record<DataToDiscoveryStatus, number> = {
    integrated: 0,
    partially_implemented: 0,
    fixture_only: 0,
    blocked: 0,
    missing: 0,
  };
  for (const node of nodes) {
    counts[node.status] += 1;
  }
  return counts;
}
