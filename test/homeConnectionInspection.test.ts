import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createConnectionInspection,renderConnectionInspection} from '../src/knowledgeGraph/investigationProjection';
import type {DomainBundle} from '../src/knowledgeGraph/domainGraph';
const g=JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8')) as DomainBundle;
const edge=g.edges.find(e=>e.kind==='source_candidate')!;
test('homepage brief preserves exact selected assertion, source and context, without authority escalation',()=>{
 const state=new URLSearchParams({netCondition:edge.conditions[0]??'',netQuery:'selected topic',owner:'forged',token:'secret',domainVersion:'wrong'});
 const b=createConnectionInspection(g,{nodeId:edge.subjectId,edgeId:edge.id,visibleEdgeIds:[edge.id],state});
 expect(b.assertions[0]).toBe(edge);expect(b.sources).toEqual(g.sources.filter(s=>s.id===edge.sourceId));expect(b.graphVersion).toBe(g.version);
 expect(b.selection.domainVersion).toBe(g.version);expect(b.selection.owner).toBeUndefined();expect(b.selection.token).toBeUndefined();expect(b.selection.netCondition).toBe(state.get('netCondition')!);
 expect(b.scientificApproval).toBe(false);expect(b.graphPromotable).toBe(false);expect(b.liveProviderExecution).toBe(false);expect(b.sourceClearanceVerified).toBe(false);
 const markdown=renderConnectionInspection(b);expect(markdown).toContain(edge.assertion);if(edge.limitations)expect(markdown).toContain(edge.limitations);expect(markdown).toContain(g.version);expect(markdown).toContain('No new search, model execution');expect(markdown).not.toContain('forged');
});
test('an edge outside the active view or unrelated selected node cannot produce a brief',()=>{
 expect(()=>createConnectionInspection(g,{nodeId:edge.subjectId,edgeId:edge.id,visibleEdgeIds:[],state:new URLSearchParams()})).toThrow();
 const other=g.nodes.find(n=>n.id!==edge.subjectId&&n.id!==edge.objectId)!;
 expect(()=>createConnectionInspection(g,{nodeId:other.id,edgeId:edge.id,visibleEdgeIds:[edge.id],state:new URLSearchParams()})).toThrow();
});
test('gap exports retain gap status and never fabricate a supporting source',()=>{
 const gap=g.edges.find(e=>e.kind==='research_gap'&&e.sourceId===null)!;
 const b=createConnectionInspection(g,{nodeId:gap.subjectId,edgeId:gap.id,visibleEdgeIds:[gap.id],state:new URLSearchParams()});
 expect(b.sources).toEqual([]);expect(b.assertions[0].kind).toBe('research_gap');expect(b.scientificApproval).toBe(false);
});
