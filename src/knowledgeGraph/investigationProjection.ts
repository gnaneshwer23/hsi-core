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
  ]) {
    const value = state.get(key);
    if (value) params.set(key, value);
  }
  return path + '?' + params.toString();
}
