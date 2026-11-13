import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {ATLAS_DEPARTMENTS,atlasDepartmentCoverage,atlasDiseaseContexts,projectAtlasDepartment,searchAtlasRecords} from '../src/knowledgeGraph/atlasDepartments';
import {networkProjection,type NetworkFilters} from '../src/knowledgeGraph/networkExplorer';
import {createConnectionInspection,investigationHandoff} from '../src/knowledgeGraph/investigationProjection';
import type {DomainBundle} from '../src/knowledgeGraph/domainGraph';
const g=JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8')) as DomainBundle;
const filters:NetworkFilters={query:'',kind:'',domain:'',predicate:'',polarity:'',gaps:true,orphans:false,scope:'global',depth:1,model:''};

test('six stable departments use one snapshot and preserve original entity, relationship and evidence identity',()=>{
 expect(ATLAS_DEPARTMENTS.map(d=>d.id)).toEqual(['immunology','neuroscience','microbiome','metabolism','genomics','physiology']);
 const ids=new Set<string>();
 for(const d of ATLAS_DEPARTMENTS){const v=projectAtlasDepartment(g,d.id);for(const n of v.nodes){expect(n).toBe(g.nodes.find(x=>x.id===n.id)!);ids.add(n.id)}for(const e of v.edges){expect(e).toBe(g.edges.find(x=>x.id===e.id)!);expect(v.nodes.some(n=>n.id===e.subjectId)).toBe(true);expect(v.nodes.some(n=>n.id===e.objectId)).toBe(true);expect(e.scientificClaimAllowed).toBe(false)}}
 const immune=projectAtlasDepartment(g,'immunology'),gut=projectAtlasDepartment(g,'microbiome');
 const shared=immune.nodes.find(n=>gut.nodes.some(x=>x.id===n.id))!;expect(shared).toBeDefined();expect(gut.nodes.find(n=>n.id===shared.id)).toBe(shared);
 expect(ids.size).toBeLessThanOrEqual(g.nodes.length);
});
test('missing departmental coverage stays empty; unknown department and excessive traversal fail closed',()=>{
 const rows=atlasDepartmentCoverage(g);expect(rows.find(d=>d.id==='genomics')!.relationships).toBe(0);expect(rows.every(d=>d.independentlyReviewed===0)).toBe(true);
 for(const department of ['invented','genomics'])expect(networkProjection(g,g.nodes[0]!.id,{...filters,department}).edges).toEqual([]);
 for(const depth of [0,4,Infinity,NaN])expect(networkProjection(g,g.nodes[0]!.id,{...filters,depth}).edges).toEqual([]);
});
test('synthetic fixtures exercise all six departments without adding production relationships',()=>{
 for(const department of ATLAS_DEPARTMENTS){const base=g.edges.find(e=>e.kind==='source_candidate')!;const edge={...base,domains:[department.recordedDomains[0]]};const fixture={...g,edges:[edge]};const view=projectAtlasDepartment(fixture,department.id);expect(view.edges).toEqual([edge]);expect(view.edges[0]!.sourceId).toBe(base.sourceId);expect(view.edges[0]!.reviewStatus).toBe('unreviewed')}
});
test('condition and publication lookup are data-derived, bounded and filtered without ontology invention',()=>{
 const edge=g.edges.find(e=>e.sourceId)!;const source=g.sources.find(s=>s.id===edge.sourceId)!;
 expect(searchAtlasRecords(g,source.id).relationshipIds).toContain(edge.id);
 expect(searchAtlasRecords(g,source.title).sourceIds).toContain(source.id);
 const fixture={...g,edges:[{...edge,conditions:['Previously unlisted research condition']} ]};
 expect(atlasDiseaseContexts(fixture)[0]!.label).toBe('Previously unlisted research condition');expect(atlasDiseaseContexts(fixture)[0]!.ontologyStatus).toBe('not_mapped');
 expect(networkProjection(fixture,edge.subjectId,{...filters,query:'unlisted research condition'}).edges).toEqual(fixture.edges);
 expect(searchAtlasRecords(g,'unrepresented disease xyzz').relationshipIds).toEqual([]);expect(()=>searchAtlasRecords(g,'x'.repeat(201))).toThrow();
 const v=networkProjection(g,edge.subjectId,{...filters,department:'metabolism',query:source.id});expect(v.edges.every(e=>e.domains.includes('metabolic')&&e.sourceId===source.id)).toBe(true);
});
test('department survives the exact pinned export and strips identity inputs without granting agent or review authority',()=>{
 const edge=g.edges.find(e=>e.kind==='source_candidate'&&e.domains.includes('gut'))!;
 const state=new URLSearchParams({netDepartment:'microbiome',netDepth:'3',node:edge.subjectId,edge:edge.id,token:'secret',owner:'forged'});
 const b=createConnectionInspection(g,{nodeId:edge.subjectId,edgeId:edge.id,visibleEdgeIds:[edge.id],state});
 expect(b.selection.netDepartment).toBe('microbiome');expect(b.selection.netDepth).toBe('3');expect(b.assertions[0]).toBe(edge);expect(b.selection.owner).toBeUndefined();expect(b.selection.token).toBeUndefined();expect(b.graphPromotable).toBe(false);expect(b.scientificApproval).toBe(false);expect(b.liveProviderExecution).toBe(false);
 const handoff=new URL(investigationHandoff('/science/graph',state,g.version),'https://hsi.invalid');expect(handoff.searchParams.get('node')).toBe(edge.subjectId);expect(handoff.searchParams.get('edge')).toBe(edge.id);expect(handoff.searchParams.get('domainVersion')).toBe(g.version);
});
test('one-, two- and three-hop expansion preserves original endpoints, conditions and source IDs',()=>{
 const focus=g.edges[0]!.subjectId;let prior=new Set<string>();
 for(const depth of [1,2,3]){const v=networkProjection(g,focus,{...filters,scope:'local',depth});for(const id of prior)expect(v.nodes.some(n=>n.id===id)).toBe(true);for(const e of v.edges)expect(e).toBe(g.edges.find(x=>x.id===e.id)!);prior=new Set(v.nodes.map(n=>n.id))}
});
