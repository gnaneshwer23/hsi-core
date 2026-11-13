import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import type { DomainBundle } from '../src/knowledgeGraph/domainGraph';
import { networkProjection, type NetworkFilters } from '../src/knowledgeGraph/networkExplorer';
import { investigationHandoff } from '../src/knowledgeGraph/investigationProjection';
const g = JSON.parse(readFileSync('research/domain-graph/graph.v1.json', 'utf8')) as DomainBundle;
const f: NetworkFilters = {
  query: '',
  kind: '',
  domain: '',
  predicate: '',
  polarity: '',
  gaps: true,
  orphans: true,
  scope: 'global',
  depth: 1,
  model: '',
};
test('global and local slices retain original edge objects, direction and governance flags', () => {
  const all = networkProjection(g, g.nodes[0]!.id, f);
  expect(all.nodes).toEqual(g.nodes);
  expect(all.edges).toEqual(g.edges);
  const e = g.edges[0]!,
    local = networkProjection(g, e.subjectId, { ...f, scope: 'local' });
  expect(local.edges).toContain(e);
  expect(
    local.edges.every(
      (x) =>
        x.subjectId === e.subjectId ||
        x.objectId === e.subjectId ||
        local.nodes.some((n) => n.id === x.subjectId),
    ),
  ).toBe(true);
  expect(
    local.edges.every((x) => x.scientificClaimAllowed === false && x.reviewStatus === 'unreviewed'),
  ).toBe(true);
});
test('negative candidates, research gaps, model and type facets do not turn gaps into support', () => {
  const neg = networkProjection(g, g.nodes[0]!.id, { ...f, polarity: 'negative' });
  expect(neg.edges.length).toBeGreaterThan(0);
  expect(neg.edges.every((e) => e.negated && e.kind === 'source_candidate')).toBe(true);
  const noGaps = networkProjection(g, g.nodes[0]!.id, { ...f, gaps: false });
  expect(noGaps.edges.every((e) => e.kind !== 'research_gap')).toBe(true);
  const typed = networkProjection(g, g.nodes[0]!.id, {
    ...f,
    kind: g.nodes[0]!.kind,
    model: 'mouse',
  });
  expect(typed.nodes.every((n) => n.kind === g.nodes[0]!.kind)).toBe(true);
  expect(
    typed.edges.every(
      (e) =>
        e.model === 'mouse' &&
        typed.nodes.some((n) => n.id === e.subjectId) &&
        typed.nodes.some((n) => n.id === e.objectId),
    ),
  ).toBe(true);
});
test('search retains neighbouring endpoints and parallel assertions; local expansion happens after filters', () => {
  const a = g.nodes.find((n) => g.edges.some((e) => e.subjectId === n.id))!,
    edge = g.edges.find((e) => e.subjectId === a.id)!;
  const fixture = { ...g, edges: [edge, { ...edge, id: 'parallel:test' }] };
  const result = networkProjection(fixture, a.id, { ...f, query: a.name });
  expect(result.edges).toHaveLength(2);
  expect(result.nodes.some((n) => n.id === edge.objectId)).toBe(true);
  const empty = networkProjection(g, a.id, { ...f, query: 'no-match-in-snapshot' });
  expect(empty).toEqual({ nodes: [], edges: [] });
  const other = g.nodes.find((n) => n.id !== a.id)!;
  expect(
    networkProjection(g, a.id, { ...f, kind: other.kind, scope: 'local' }).nodes.every(
      (n) => n.kind === other.kind,
    ),
  ).toBe(true);
});
test('handoff preserves network state and pinned identity while stripping unrelated fields', () => {
  const p = new URLSearchParams({
    lens: 'network',
    netScope: 'local',
    netDepth: '2',
    netQuery: 'T cell',
    netGaps: 'hide',
    netKind: 'cell',
    token: 'secret',
  });
  const out = new URL(investigationHandoff('/science/graph', p, g.version), 'https://example.test')
    .searchParams;
  for (const k of ['lens', 'netScope', 'netDepth', 'netQuery', 'netGaps', 'netKind'])
    expect(out.get(k)).toBe(p.get(k));
  expect(out.get('token')).toBeNull();
  expect(out.get('domainVersion')).toBe(g.version);
});
