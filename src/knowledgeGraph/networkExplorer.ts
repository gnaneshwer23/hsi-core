import {projectAtlasDepartment,validAtlasDepartment,searchAtlasRecords} from './atlasDepartments';
import {matchesRecordedContext,validRecordedContext,type RecordedResearchFilters} from './recordedResearchContext';
import type { DomainBundle, DomainEdge } from './domainGraph';
export type NetworkFilters = RecordedResearchFilters & {
  department?: string;
  query: string;
  kind: string;
  domain: string;
  predicate: string;
  polarity: string;
  gaps: boolean;
  orphans: boolean;
  scope: string;
  depth: number;
  model: string;
};
/** Apply facets before undirected local expansion. Connectivity is navigation, never causal inference. */
export function networkProjection(bundle: DomainBundle, focus: string, f: NetworkFilters) {
  if(!validRecordedContext(bundle,f)||!validAtlasDepartment(f.department)||![1,2,3].includes(f.depth)||!['local','global'].includes(f.scope)||f.query.length>200)return {nodes:[],edges:[]};
  const department=projectAtlasDepartment(bundle,f.department??'');
  const q = f.query.normalize('NFKC').trim().toLowerCase();
  const search=searchAtlasRecords(bundle,f.query);
  const matches=new Set(search.entityIds),matchedEdges=new Set(search.relationshipIds);
  let nodes = department.nodes.filter(
    (n) => (!f.kind || n.kind === f.kind) && (!f.domain || n.domains.includes(f.domain)),
  );
  const allowed = new Set(nodes.map((n) => n.id));
  let edges = department.edges.filter(
    (e) =>
      matchesRecordedContext(e,f) &&
      allowed.has(e.subjectId) &&
      allowed.has(e.objectId) &&
      (!f.model || e.model === f.model) &&
      (!f.predicate || e.predicate === f.predicate) &&
      (f.gaps || e.kind !== 'research_gap') &&
      (f.polarity !== 'negative' || (e.kind === 'source_candidate' && e.negated)) &&
      (f.polarity !== 'nonnegative' || (e.kind === 'source_candidate' && !e.negated)),
  );
  if (q) {
    edges = edges.filter((e) => matchedEdges.has(e.id));
    const ids = new Set(edges.flatMap((e) => [e.subjectId, e.objectId]));
    nodes = nodes.filter((n) => matches.has(n.id) || ids.has(n.id));
  }
  if (f.scope === 'local') {
    const ids = new Set(nodes.some((n) => n.id === focus) ? [focus] : []);
    for (let hop = 0; hop < f.depth; hop++) {
      const previous = new Set(ids);
      for (const e of edges)
        if (previous.has(e.subjectId) || previous.has(e.objectId)) {
          ids.add(e.subjectId);
          ids.add(e.objectId);
        }
    }
    nodes = nodes.filter((n) => ids.has(n.id));
    edges = edges.filter((e) => ids.has(e.subjectId) && ids.has(e.objectId));
  }
  const linked = new Set(edges.flatMap((e) => [e.subjectId, e.objectId]));
  if (!f.orphans||f.conditions?.length||f.tissue||f.assay||f.evidenceKind) nodes = nodes.filter((n) => linked.has(n.id));
  return { nodes, edges };
}
export function connectionGroups(edges: DomainEdge[], focus: string) {
  return {
    incoming: edges.filter((e) => e.objectId === focus),
    outgoing: edges.filter((e) => e.subjectId === focus),
  };
}
