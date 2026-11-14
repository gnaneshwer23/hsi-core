import { domainPaths, type DomainBundle, type DomainEdge, type DomainPath } from './domainGraph';

/** A view of an existing verified snapshot; no inference, identity merge or new assertions. */
export function investigationPathKey(path: DomainPath): string {
  return path.edgeIds.join('|');
}

export function investigationPaths(
  bundle: DomainBundle,
  from: string,
  target: string,
  model = '',
  hops = 4,
) {
  if (!bundle.nodes.some((n) => n.id === from) || !bundle.nodes.some((n) => n.id === target))
    throw Error('Selection is not in this snapshot');
  const edges = bundle.edges.filter((e) => !model || e.model === model);
  return domainPaths({ ...bundle, edges }, from, target, hops);
}

export function investigationNeighbourhood(
  bundle: DomainBundle,
  selected: string,
  model = '',
  depth = 1,
) {
  if (![1, 2].includes(depth)) throw Error('Invalid neighbourhood depth');
  if (!bundle.nodes.some((n) => n.id === selected))
    throw Error('Selection is not in this snapshot');
  const eligible = bundle.edges.filter((e) => !model || e.model === model);
  const ids = new Set([selected]);
  for (let i = 0; i < depth; i++) {
    const prior = new Set(ids);
    for (const e of eligible)
      if (prior.has(e.subjectId) || prior.has(e.objectId)) {
        ids.add(e.subjectId);
        ids.add(e.objectId);
      }
  }
  return {
    nodes: bundle.nodes.filter((n) => ids.has(n.id)),
    edges: eligible.filter((e) => ids.has(e.subjectId) && ids.has(e.objectId)),
  };
}

/** Shared neighbours are structural connections, including incoming edges; never a mediated mechanism. */
export function sharedInvestigationConnections(
  bundle: DomainBundle,
  from: string,
  target: string,
  model = '',
) {
  if (from === target) return [];
  const adjacent = (id: string) => {
    const map = new Map<string, DomainEdge[]>();
    for (const e of bundle.edges) {
      if (
        e.kind !== 'source_candidate' ||
        e.predicate === 'studied_in' ||
        (model && e.model !== model)
      )
        continue;
      const other = e.subjectId === id ? e.objectId : e.objectId === id ? e.subjectId : null;
      if (other && other !== from && other !== target)
        map.set(other, [...(map.get(other) ?? []), e]);
    }
    return map;
  };
  const left = adjacent(from),
    right = adjacent(target);
  return bundle.nodes
    .filter((n) => left.has(n.id) && right.has(n.id))
    .map((node) => ({ node, left: left.get(node.id)!, right: right.get(node.id)! }));
}

export function investigationHandoff(
  path: '/science/graph' | '/research/knowledge-graph',
  state: URLSearchParams,
  version: string,
) {
  const params = new URLSearchParams();
  params.set('domainVersion', version);
  for (const key of [
    'investigation',
    'from',
    'target',
    'node',
    'edge',
    'path',
    'model',
    'hops',
    'lens',
    'depth',
    'compare',
    'netQuery', 'netKind', 'netDomain', 'netPredicate', 'netPolarity',
    'netGaps', 'netOrphans', 'netScope', 'netDepth',
    'netDepartment','netCondition','netCompareCondition','netTissue','netAssay','netEvidenceKind',
  ]) {
    const value = state.get(key);
    if (value) params.set(key, value);
  }
  return path + '?' + params.toString();
}

/** Export an inspected connection from the current visible working set, never scientific approval. */
export function createConnectionInspection(bundle:DomainBundle,input:{nodeId:string;edgeId:string;visibleEdgeIds:readonly string[];state:URLSearchParams}){
 const node=bundle.nodes.find(n=>n.id===input.nodeId),edge=bundle.edges.find(e=>e.id===input.edgeId);
 if(!node||!edge||!input.visibleEdgeIds.includes(edge.id)||![edge.subjectId,edge.objectId].includes(node.id))throw Error('Selection is outside the inspected graph context');
 const selection=new URLSearchParams(input.state);selection.set('node',node.id);selection.set('edge',edge.id);
 const handoff=investigationHandoff('/research/knowledge-graph',selection,bundle.version);
 const subject=bundle.nodes.find(n=>n.id===edge.subjectId)!,object=bundle.nodes.find(n=>n.id===edge.objectId)!;
 return {schemaVersion:'hsi-inspected-investigation-1' as const,graphVersion:bundle.version,questionTemplateId:null,question:`What evidence connects ${subject.name} and ${object.name}?`,selection:Object.fromEntries(new URL(handoff,'https://hsi.invalid').searchParams),handoff,path:null,assertions:[edge],sources:bundle.sources.filter(s=>s.id===edge.sourceId),gaps:bundle.gaps.filter(g=>g.id===edge.id),sourceClearanceVerified:false as const,scientificApproval:false as const,graphPromotable:false as const,liveProviderExecution:false as const};
}
export function renderConnectionInspection(brief:ReturnType<typeof createConnectionInspection>){const e=brief.assertions[0]!;return ['# Research inspection draft',brief.question,`Graph version: ${brief.graphVersion}`,'## Recorded candidate',e.assertion,`Status: ${e.reviewStatus}; ${e.kind}. Confidence: ${e.confidence}.`,'## Experimental context',`Model: ${e.model}\nTissue: ${e.tissue??'Not recorded'}\nAssay: ${e.assay??'Not recorded'}\nPopulation: ${e.population??'Not recorded'}\nTiming: ${e.timepoint??'Not recorded'}\nIntervention: ${e.intervention??'Not recorded'}\nOutcome: ${e.outcome??'Not recorded'}`,'## Sources',...brief.sources.map(s=>`${s.title}\n${s.url}\nIdentity: ${s.identityStatus}; rights: ${s.rights}.`),'## Limits and uncertainty',e.limitations,...e.scopeWarnings,'## Reopen the same selection',brief.handoff,'## Approval boundary','Snapshot inspection only. No new search, model execution, independent verification, human scientific approval or graph promotion occurred. Account persistence is not established by this download.',''].join('\n\n');}
