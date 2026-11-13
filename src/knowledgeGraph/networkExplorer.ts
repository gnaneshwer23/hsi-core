import type { DomainBundle, DomainEdge } from './domainGraph';
export type NetworkFilters = {
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
  const q = f.query.normalize('NFKC').trim().toLowerCase();
  const matches = new Set(
    bundle.nodes
      .filter((n) =>
        [n.name, n.id, ...n.aliases].some((v) => v.normalize('NFKC').toLowerCase().includes(q)),
      )
      .map((n) => n.id),
  );
  let nodes = bundle.nodes.filter(
    (n) => (!f.kind || n.kind === f.kind) && (!f.domain || n.domains.includes(f.domain)),
  );
  const allowed = new Set(nodes.map((n) => n.id));
  let edges = bundle.edges.filter(
    (e) =>
      allowed.has(e.subjectId) &&
      allowed.has(e.objectId) &&
      (!f.model || e.model === f.model) &&
      (!f.predicate || e.predicate === f.predicate) &&
      (f.gaps || e.kind !== 'research_gap') &&
      (f.polarity !== 'negative' || (e.kind === 'source_candidate' && e.negated)) &&
      (f.polarity !== 'nonnegative' || (e.kind === 'source_candidate' && !e.negated)),
  );
  if (q) {
    edges = edges.filter((e) => matches.has(e.subjectId) || matches.has(e.objectId));
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
  if (!f.orphans) nodes = nodes.filter((n) => linked.has(n.id));
  return { nodes, edges };
}
export function connectionGroups(edges: DomainEdge[], focus: string) {
  return {
    incoming: edges.filter((e) => e.objectId === focus),
    outgoing: edges.filter((e) => e.subjectId === focus),
  };
}
