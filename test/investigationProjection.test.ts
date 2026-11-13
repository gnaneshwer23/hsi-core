import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import type { DomainBundle } from '../src/knowledgeGraph/domainGraph';
import {
  investigationPaths,
  investigationPathKey,
  investigationNeighbourhood,
  sharedInvestigationConnections,
  investigationHandoff,
} from '../src/knowledgeGraph/investigationProjection';
const graph = JSON.parse(
  readFileSync('research/domain-graph/graph.v1.json', 'utf8'),
) as DomainBundle;
const question = graph.questions.find((q) => q.id === 'gut-immune')!;

test('investigation projection keeps directed parallel assertions and original source IDs separate', () => {
  const base = graph.edges.find((e) => e.kind === 'source_candidate')!;
  const edges = [
    { ...base, id: 'parallel:a' },
    { ...base, id: 'parallel:b', negated: true },
  ];
  const paths = investigationPaths({ ...graph, edges }, base.subjectId, base.objectId);
  expect(paths.map((p) => p.edgeIds)).toEqual([['parallel:a'], ['parallel:b']]);
  expect(new Set(paths.map(investigationPathKey)).size).toBe(2);
  expect(paths[1]!.warnings.join(' ')).toContain('negative finding');
  expect(investigationPaths({ ...graph, edges }, base.objectId, base.subjectId)).toEqual([]);
  expect(edges.every((e) => e.sourceId === base.sourceId)).toBe(true);
});

test('gaps and study membership cannot bridge an evidence path, including on model filtering', () => {
  const base = graph.edges.find((e) => e.kind === 'source_candidate')!;
  expect(
    investigationPaths(
      { ...graph, edges: [{ ...base, kind: 'research_gap', sourceId: null }] },
      base.subjectId,
      base.objectId,
    ),
  ).toEqual([]);
  expect(
    investigationPaths(
      { ...graph, edges: [{ ...base, predicate: 'studied_in' }] },
      base.subjectId,
      base.objectId,
    ),
  ).toEqual([]);
  expect(
    investigationPaths(
      { ...graph, edges: [{ ...base, model: 'mouse' }] },
      base.subjectId,
      base.objectId,
      'human_in_vivo',
    ),
  ).toEqual([]);
  expect(() => investigationPaths(graph, 'unknown', question.toId)).toThrow();
  expect(() => investigationPaths(graph, question.fromId, question.toId, '', 20)).toThrow();
});

test('neighbourhood expansion retains edge endpoint integrity without modifying the snapshot', () => {
  const before = JSON.stringify(graph);
  for (const depth of [1, 2]) {
    const view = investigationNeighbourhood(graph, question.fromId, 'mouse', depth);
    const ids = new Set(view.nodes.map((n) => n.id));
    expect(ids.has(question.fromId)).toBe(true);
    expect(
      view.edges.every((e) => ids.has(e.subjectId) && ids.has(e.objectId) && e.model === 'mouse'),
    ).toBe(true);
  }
  expect(JSON.stringify(graph)).toBe(before);
  expect(() => investigationNeighbourhood(graph, question.fromId, '', 3)).toThrow();
});

test('shared connections retain incoming direction and parallel evidence without claiming mediation', () => {
  const base = graph.edges.find((e) => e.kind === 'source_candidate')!;
  const [a, b, c] = graph.nodes.slice(0, 3);
  const edges = [
    { ...base, id: 'a-to-c', subjectId: a!.id, objectId: c!.id },
    { ...base, id: 'c-to-b', subjectId: c!.id, objectId: b!.id },
    { ...base, id: 'parallel', subjectId: a!.id, objectId: c!.id, negated: true },
  ];
  const rows = sharedInvestigationConnections({ ...graph, edges }, a!.id, b!.id);
  expect(rows).toHaveLength(1);
  expect(rows[0]!.left.map((e) => e.id)).toEqual(['a-to-c', 'parallel']);
  expect(rows[0]!.right[0]!.subjectId).toBe(c!.id);
  expect(
    sharedInvestigationConnections(
      { ...graph, edges: edges.map((e) => ({ ...e, kind: 'research_gap' })) },
      a!.id,
      b!.id,
    ),
  ).toEqual([]);
});

test('public/research handoff pins the release and selection without forwarding unrelated URL data', () => {
  const state = new URLSearchParams({
    investigation: question.id,
    from: question.fromId,
    target: question.toId,
    edge: 'finding:one',
    path: 'one|two',
    compare: 'one|two',
    node: question.fromId,
    q: 'free text',
    token: 'not-forwarded',
    domainVersion: 'wrong',
  });
  const link = investigationHandoff('/research/knowledge-graph', state, graph.version);
  const p = new URL(link, 'https://example.test').searchParams;
  expect(p.get('domainVersion')).toBe(graph.version);
  expect(p.get('edge')).toBe('finding:one');
  expect(p.get('path')).toBe('one|two');
  expect(p.get('compare')).toBe('one|two');
  expect(p.has('token')).toBe(false);
  expect(p.has('q')).toBe(false);
});
