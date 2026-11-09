/**
 * Eight-step investigation for one question.
 * Steps 7 and 8 are real in this process: a brief is saved, and an approved
 * review publishes a versioned graph release that the next investigation reads.
 * The cohort behind it is synthetic. Hypotheses stay unvalidated.
 */
import type { ReleaseEdge, GraphRelease } from "./graphRelease";
import { publishApprovedRelease } from "./graphRelease";
import { retrieveFixtureEvidence } from "./evidenceFixtures";

export const DEMO_QUESTION =
  "How might changes in gut microbial metabolites influence neuroinflammation in metabolic disease?";

export type HypothesisCard = {
  id: string;
  text: string;
  label: "unvalidated_hypothesis";
  epistemicType: "unvalidated_hypothesis";
  supporting: readonly string[];
  opposing: readonly string[];
};

export type InvestigationBrief = {
  question: string;
  entities: readonly string[];
  evidenceIds: readonly string[];
  mechanisms: readonly string[];
  gaps: readonly string[];
  contradictions: readonly string[];
  hypotheses: readonly HypothesisCard[];
  releaseRead: string | null;
  unvalidated: true;
  notClinicalAdvice: true;
};

export type InvestigationResult = {
  steps: { id: number; name: string; detail: string }[];
  brief: InvestigationBrief;
  proposedEdges: ReleaseEdge[];
};

const ENTITIES = [
  "gut microbiome",
  "butyrate",
  "intestinal barrier",
  "TNF",
  "systemic inflammation",
  "microglia",
  "neuroinflammation",
  "type 2 diabetes",
  "rheumatoid arthritis",
] as const;

export async function runInvestigation(release: GraphRelease): Promise<InvestigationResult> {
  const evidence = await retrieveFixtureEvidence();
  const prior = release.edges.filter((edge) => edge.reviewState === "approved");
  const mechanisms = [
    "Faecalibacterium-associated butyrate is linked, not proven, to barrier transcripts.",
    "Barrier disruption is associated with circulating inflammatory mediators including TNF.",
    "TNF is an association in rheumatoid arthritis drug response, kept distinct from a universal causal mechanism.",
    "Systemic inflammatory mediators are hypothesised to reach microglia; that step is unvalidated.",
    ...prior.map((edge) => `Prior release ${release.releaseId} includes approved edge ${edge.id}.`),
  ];
  const gaps = [
    "No direct human measurement connects a named microbial metabolite to a microglial state in this release.",
    "Type 1 diabetes and type 2 diabetes are not interchangeable metabolic contexts.",
    evidence.literature.length < 5 ? "Literature retrieval here is a two-record fixture, not a systematic review." : "Literature coverage is still incomplete.",
  ];
  const contradictions = [
    "Some butyrate studies report lower inflammatory markers; others report no separation from diet and medication.",
    "TNF association scores are not causation and do not rank a gut metabolite as a drug target.",
  ];
  const hypotheses: HypothesisCard[] = [
    {
      id: "hyp-butyrate-neuro",
      text: "In type 2 diabetes with systemic inflammation, lower butyrate-associated taxa may coincide with higher neuroinflammatory signalling. This is unvalidated.",
      label: "unvalidated_hypothesis",
      epistemicType: "unvalidated_hypothesis",
      supporting: evidence.literature.map((item) => item.pmid ?? item.title),
      opposing: ["contradiction:butyrate-null-studies"],
    },
  ];
  const proposedEdges: ReleaseEdge[] = [
    ...release.edges,
    {
      id: "edge-butyrate-neuro-hypothesis",
      source: "metabolite:butyrate",
      target: "process:neuroinflammation",
      epistemicType: "unvalidated_hypothesis",
      biologicalContext: "gut microbial metabolite, metabolic disease, neuroimmune hypothesis; rheumatoid arthritis TNF kept as a separate association",
      provenance: evidence.literature.map((item) => `pmid:${item.pmid ?? "unknown"}`),
      uncertainty: "unvalidated; fixture literature only",
      reviewState: "unreviewed",
      reviewDecisionId: null,
    },
  ];
  const brief: InvestigationBrief = {
    question: DEMO_QUESTION,
    entities: ENTITIES,
    evidenceIds: [
      ...evidence.literature.map((item) => `pmid:${item.pmid}`),
      ...evidence.targets.map((item) => `opentargets:${item.symbol}`),
      `uniprot:${evidence.protein.accession}`,
    ],
    mechanisms,
    gaps,
    contradictions,
    hypotheses,
    releaseRead: release.releaseId,
    unvalidated: true,
    notClinicalAdvice: true,
  };
  return {
    steps: [
      { id: 1, name: "Parse the question", detail: ENTITIES.join(", ") },
      { id: 2, name: "Retrieve evidence", detail: `${evidence.literature.length} bibliographic records, ${evidence.targets.length} target rows, fixture mode` },
      { id: 3, name: "Connect mechanisms", detail: mechanisms[0] ?? "No mechanism connected" },
      { id: 4, name: "Evaluate evidence", detail: "Metadata retrieved. Scores are not causation. No SME calibration." },
      { id: 5, name: "Find gaps and contradictions", detail: contradictions[0] ?? "No contradiction recorded" },
      { id: 6, name: "Generate hypotheses", detail: hypotheses.map((item) => item.id).join(", ") },
      { id: 7, name: "Write the brief", detail: "Evidence-linked brief saved for expert review." },
      { id: 8, name: "Await review", detail: prior.length > 0 ? `Reading release ${release.releaseId}` : "No approved release consumed yet." },
    ],
    brief,
    proposedEdges,
  };
}

export function edgesAfterApproval(proposed: readonly ReleaseEdge[], reviewDecisionId: string): ReleaseEdge[] {
  return proposed.map((edge) =>
    edge.id === "edge-butyrate-neuro-hypothesis"
      ? {
          ...edge,
          epistemicType: "association",
          reviewState: "approved",
          reviewDecisionId,
          uncertainty: "approved as an association only; causal mechanism was not demonstrated",
        }
      : edge,
  );
}

export function releaseFromApproval(prior: GraphRelease, edges: ReleaseEdge[], reviewDecisionId: string, createdAt: string): GraphRelease {
  return publishApprovedRelease({ prior, edges, reviewDecisionId, createdAt });
}
