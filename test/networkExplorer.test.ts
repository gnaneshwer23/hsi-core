import {recordedContextCoverage} from '../src/knowledgeGraph/recordedResearchContext';
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


test('dense candidate layout does not stack concepts against artificial rectangular walls', async()=>{
 const {forceGraphPositions}=await import('../site/src/features/science/graphExplorer');
 const points=forceGraphPositions({nodes:g.nodes.map(n=>({id:n.id,kind:n.kind,system:n.domains[0]})),edges:g.edges});
 const rows=new Map<number,number>(),columns=new Map<number,number>();
 for(const p of points.values()){expect(Number.isFinite(p.x)&&Number.isFinite(p.y)).toBe(true);rows.set(Math.round(p.y),(rows.get(Math.round(p.y))??0)+1);columns.set(Math.round(p.x),(columns.get(Math.round(p.x))??0)+1)}
 expect(Math.max(...rows.values())).toBeLessThan(g.nodes.length/5);expect(Math.max(...columns.values())).toBeLessThan(g.nodes.length/5);
});

test('recorded condition filters retain exact study attribution and prune unrelated orphan nodes',()=>{
 const ra=networkProjection(g,g.nodes[0].id,{...f,conditions:['Rheumatoid arthritis']});
 expect(ra.edges.length).toBeGreaterThan(0);expect(ra.edges.every(e=>e.conditions.includes('Rheumatoid arthritis'))).toBe(true);
 const endpoints=new Set(ra.edges.flatMap(e=>[e.subjectId,e.objectId]));expect(ra.nodes.every(n=>endpoints.has(n.id))).toBe(true);
 expect(ra.edges.every(e=>g.edges.find(x=>x.id===e.id)===e)).toBe(true);
 const both=networkProjection(g,g.nodes[0].id,{...f,conditions:['Rheumatoid arthritis','Systemic sclerosis']});
 expect(both.edges.length).toBeGreaterThan(ra.edges.length);expect(both.edges.every(e=>e.conditions.some(c=>['Rheumatoid arthritis','Systemic sclerosis'].includes(c)))).toBe(true);
 expect(both.edges.every(e=>e.reviewStatus==='unreviewed'&&!e.scientificClaimAllowed)).toBe(true);
});
test('unavailable or duplicate disease/context facets fail closed rather than imply ontology expansion',()=>{
 for(const extra of [{conditions:['unrecorded disease']},{conditions:['Rheumatoid arthritis','Rheumatoid arthritis']},{conditions:['Rheumatoid arthritis','Systemic sclerosis','unrecorded disease']},{tissue:'unrecorded tissue'},{assay:'unrecorded assay'},{evidenceKind:'approved'}]){
 expect(networkProjection(g,g.nodes[0].id,{...f,...extra})).toEqual({nodes:[],edges:[]});
 }
});
test('explicit missing tissue and assay reflect original nulls; candidates and gaps remain distinct',()=>{
 const missing=networkProjection(g,g.nodes[0].id,{...f,tissue:'__not_recorded__',assay:'__not_recorded__'});
 expect(missing.edges.length).toBeGreaterThan(0);expect(missing.edges.every(e=>e.tissue===null&&e.assay===null)).toBe(true);
 const tissue=g.edges.find(e=>e.tissue!==null)!.tissue!;
 expect(networkProjection(g,g.nodes[0].id,{...f,tissue}).edges.every(e=>e.tissue===tissue)).toBe(true);
 expect(networkProjection(g,g.nodes[0].id,{...f,evidenceKind:'research_gap'}).edges.every(e=>e.kind==='research_gap')).toBe(true);
});
test('recorded context survives pinned handoff without retaining user identity parameters',()=>{
 const p=new URLSearchParams({netCondition:'Rheumatoid arthritis',netCompareCondition:'Systemic sclerosis',netTissue:'__not_recorded__',netAssay:'__not_recorded__',netEvidenceKind:'source_candidate',owner:'forged',session:'secret'});
 const out=new URL(investigationHandoff('/research/knowledge-graph',p,g.version),'https://example.test').searchParams;
 for(const key of ['netCondition','netCompareCondition','netTissue','netAssay','netEvidenceKind'])expect(out.get(key)).toBe(p.get(key));
 expect(out.get('owner')).toBeNull();expect(out.get('session')).toBeNull();expect(out.get('domainVersion')).toBe(g.version);
});

test('coverage reports missing annotations without upgrading candidates to reviewed knowledge',()=>{
 const edges=g.edges.filter(e=>e.conditions.includes('Rheumatoid arthritis'));const c=recordedContextCoverage(edges);
 expect(c.records).toBe(edges.length);expect(c.missingTissue).toBe(edges.filter(e=>e.tissue===null).length);expect(c.missingAssay).toBe(edges.filter(e=>e.assay===null).length);expect(c.independentlyReviewed).toBe(0);expect(c.pooledEffectAllowed).toBe(false);
});
