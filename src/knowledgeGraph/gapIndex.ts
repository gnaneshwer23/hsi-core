/**
 * Evidence-linked cross-domain gap index for HSI's existing candidate graph.
 * Read-only: no graph promotion, no patient records, no clinical decisions.
 */
import type { DomainBundle, DomainEdge, DomainGap } from './domainGraph';

export type GapSignal = {
  id: string;
  question: string;
  missingEvidence: string;
  nextStudy: string;
  entityIds: [string, string];
  domains: string[];
  conditions: string[];
  supportingCandidateEdgeIds: string[];
  sourceIds: string[];
  unresolvedContextFields: string[];
  reasons: string[];
  priorityScore: number;
  status: 'research_gap_unreviewed';
  scientificClaimAllowed: false;
  clinicalDecisionAllowed: false;
};

const CONTEXT_FIELDS = ['tissue', 'population', 'assay', 'timepoint', 'intervention', 'outcome'] as const;
const ordered = (values: Iterable<string>) => [...new Set(values)].sort();

function relevant(edge: DomainEdge, gap: DomainGap) {
  return (edge.subjectId === gap.subjectId && edge.objectId === gap.objectId) ||
    (edge.subjectId === gap.objectId && edge.objectId === gap.subjectId);
}

/**
 * Scores gaps for researcher triage, NOT biological truth or clinical relevance.
 * All links and source references are inherited from the supplied verified bundle.
 */
export function buildGapIndex(graph: Pick<DomainBundle, 'nodes' | 'edges' | 'sources' | 'gaps'>): GapSignal[] {
  const nodeIds = new Set(graph.nodes.map(n => n.id));
  const sourceIds = new Set(graph.sources.map(s => s.id));
  const edgeIds = new Set(graph.edges.map(e => e.id));
  if (nodeIds.size !== graph.nodes.length || sourceIds.size !== graph.sources.length ||
      edgeIds.size !== graph.edges.length || new Set(graph.gaps.map(g => g.id)).size !== graph.gaps.length) {
    throw new Error('Duplicate graph identifiers');
  }
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.subjectId) || !nodeIds.has(edge.objectId) ||
        (edge.sourceId !== null && !sourceIds.has(edge.sourceId))) {
      throw new Error('Dangling graph edge reference');
    }
  }
  const results = graph.gaps.map(gap => {
    if (!nodeIds.has(gap.subjectId) || !nodeIds.has(gap.objectId)) {
      throw new Error('Dangling gap entity reference');
    }
    const edges = graph.edges.filter(e => e.kind === 'source_candidate' && relevant(e, gap));
    const sources = ordered(edges.flatMap(e => e.sourceId === null ? [] : [e.sourceId]));
    const unresolvedContextFields = CONTEXT_FIELDS.filter(field => edges.length === 0 ||
      edges.some(edge => edge[field] === null));
    const distinctModels = new Set(edges.map(e => e.model));
    const hasNegative = edges.some(e => e.negated);
    const unverifiedSource = sources.some(id => graph.sources.find(s => s.id === id)?.identityStatus !== 'repository_locator_not_reverified');
    const reasons = [
      ...(edges.length === 0 ? ['No directly connected source-candidate relationship in the supplied graph'] : []),
      ...(unresolvedContextFields.length ? ['Experimental or population context is incomplete'] : []),
      ...(distinctModels.size > 1 ? ['Evidence spans different biological models'] : []),
      ...(hasNegative ? ['Includes negative source-candidate findings'] : []),
      ...(unverifiedSource ? ['Source retrieval or identity verification remains incomplete'] : []),
      ...(sources.length < 2 ? ['Fewer than two distinct source records on the entity pair'] : []),
    ];
    // Deterministic triage score; not a model-derived probability or validated importance measure.
    const priorityScore = Math.min(100,
      15 + (edges.length === 0 ? 25 : 0) + unresolvedContextFields.length * 5 +
      (distinctModels.size > 1 ? 10 : 0) + (hasNegative ? 10 : 0) +
      (unverifiedSource ? 10 : 0) + (sources.length < 2 ? 10 : 0));
    return {
      id: gap.id,
      question: gap.question,
      missingEvidence: gap.missing,
      nextStudy: gap.nextStudy,
      entityIds: [gap.subjectId, gap.objectId] as [string, string],
      domains: ordered(gap.domains),
      conditions: ordered(gap.conditions),
      supportingCandidateEdgeIds: ordered(edges.map(e => e.id)),
      sourceIds: sources,
      unresolvedContextFields: [...unresolvedContextFields],
      reasons,
      priorityScore,
      status: 'research_gap_unreviewed' as const,
      scientificClaimAllowed: false as const,
      clinicalDecisionAllowed: false as const,
    };
  });
  return results.sort((a, b) => b.priorityScore - a.priorityScore || a.id.localeCompare(b.id));
}
