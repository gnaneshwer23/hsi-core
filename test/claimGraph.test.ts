import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildClaimGraph} from '../src/knowledgeGraph/buildClaimGraph';
import {parseClaimGraph,verifyClaimGraph,resolveClaimEntity,filterClaimGraph,findClaimPaths,claimGraphQuality,claimSpecies} from '../src/knowledgeGraph/claimGraph';
const corpus=JSON.parse(readFileSync('research/evidence-corpus/corpus.v1.json','utf8')),ssc=JSON.parse(readFileSync('site/public/research/ssc-tfh-il21-graph-draft.v1.json','utf8'));
const graph=buildClaimGraph(corpus,ssc),copy=()=>structuredClone(graph),digest=async(s:string)=>createHash('sha256').update(s).digest('hex');
test('source adapter builds a reproducible, non-promotable claim graph with separate mentions and claims',async()=>{
 expect(await verifyClaimGraph(graph,digest,graph.version)).toEqual(graph);expect(buildClaimGraph(corpus,ssc)).toEqual(graph);
 expect(claimGraphQuality(graph)).toMatchObject({entities:15,claims:7,sources:5,edges:16,passages:8,locatorOnly:5,humanReviewedEdges:0,calibratedConfidence:false});
 expect(graph.mentions.length).toBeGreaterThan(0);expect(graph.edges.every(e=>e.confidence==='not_calibrated'&&e.evidenceStatus==='not_curated')).toBe(true);
 expect(graph.comparisons.every(c=>!c.confirmedContradiction)).toBe(true);
});
test('mentions preserve exact local offsets and never invent text for locator-only evidence',()=>{
 for(const m of graph.mentions){const p=graph.corpus.passages.find(p=>p.id===m.passageId)!;expect(p.text!.slice(m.start,m.end)).toBe(m.text);expect(p.sha256).not.toBeNull()}
 const bad=copy();bad.mentions[0]!.start++;expect(()=>parseClaimGraph(bad)).toThrow();
 const unavailable=graph.corpus.passages.find(p=>p.text===null)!;const fake=copy();fake.mentions[0]!.passageId=unavailable.id;expect(()=>parseClaimGraph(fake)).toThrow();
});
test('draft promotion, fabricated certainty, clinical causality and broken provenance fail closed',()=>{
 for(const edit of [
  (g:any)=>g.graphPromotable=true,(g:any)=>g.edges[0].reviewStatus='approved',(g:any)=>g.edges[0].confidence=.82,
  (g:any)=>g.edges[0].evidenceStatus='supported',(g:any)=>g.edges[0].claimId='unknown',(g:any)=>g.edges[0].predicate='causes',
  (g:any)=>g.entities.push({...g.entities[0]}),(g:any)=>g.edges[0].objectId='missing',
  (g:any)=>g.containsPhi=true,(g:any)=>g.edges[0].patientId='unexpected-private-field'
 ]){const g=copy();edit(g);expect(()=>parseClaimGraph(g)).toThrow()}
});
test('snapshot and passage tampering are rejected including a substituted pinned version',async()=>{
 const bad=copy();bad.entities[0]!.name='Modified';await expect(verifyClaimGraph(bad,digest)).rejects.toThrow();
 await expect(verifyClaimGraph(graph,digest,'a'.repeat(64))).rejects.toThrow();
 const passage=copy();passage.corpus.passages.find(p=>p.text)!.text+=' altered';await expect(verifyClaimGraph(passage,digest)).rejects.toThrow();
});
test('resolution is conservative and never merges ambiguous cell states or unreviewed external mappings',()=>{
 expect(resolveClaimEntity(graph,'RF')).toMatchObject({decision:'same',candidates:['ra:rheumatoid-factor']});
 expect(resolveClaimEntity(graph,'Tfh').decision).toBe('unresolved');
 expect(resolveClaimEntity(graph,'not-in-this-snapshot').decision).toBe('unresolved');
 const g=copy();g.entities[0]!.externalIds=[{system:'CL',value:'test-only',mapping:'unreviewed'}];
 expect(resolveClaimEntity(g,'test',{system:'CL',value:'test-only'}).decision).toBe('unresolved');
 expect(g.entities).toHaveLength(graph.entities.length);
});
test('filters preserve endpoints, species boundaries and do not invent supported evidence',()=>{
 expect(filterClaimGraph(graph,{evidence:'supported'}).edges).toEqual([]);
 const human=filterClaimGraph(graph,{species:'human'});expect(human.edges.length).toBeGreaterThan(0);
 expect(human.edges.every(e=>!graph.corpus.claims.find(c=>c.id===e.claimId)!.context.model.toLowerCase().includes('mouse'))).toBe(true);
 const mouse=filterClaimGraph(graph,{species:'mouse'});expect(mouse.edges.length).toBe(2);
 for(const f of [{disease:'rheumatoid_arthritis'},{tissue:'not-curated'},{query:'RF'}]){const slice=filterClaimGraph(graph,f);expect(slice.edges.every(e=>slice.entities.some(n=>n.id===e.subjectId)&&slice.entities.some(n=>n.id===e.objectId))).toBe(true)}
});
test('directed and exploratory paths keep negative findings, sources and context changes visible',()=>{
 const options={maxHops:3,limit:8,direction:'both' as const};
 const result=findClaimPaths(graph,'ra:rheumatoid-factor','ra:anti-ccp',options);expect(result.paths.length).toBeGreaterThan(0);
 expect(result.paths.every(p=>p.causalConclusionAllowed===false&&p.sourceIds.length>0&&p.warnings.some(w=>w.includes('incoming')))).toBe(true);
 expect(result.paths.some(p=>p.warnings.some(w=>w.includes('negative finding')))).toBe(true);
 expect(result.paths.some(p=>p.warnings.some(w=>w.includes('Context changes')))).toBe(true);
 expect(findClaimPaths(graph,'ra:rheumatoid-factor','ra:anti-ccp',{...options,direction:'outgoing'}).paths).toEqual([]);
 expect(findClaimPaths(graph,'ra:rheumatoid-factor','disease:ra',{...options,direction:'outgoing'}).paths.some(p=>p.warnings.some(w=>w.includes('metadata')))).toBe(true);
 for(const maxHops of [0,6,NaN])expect(()=>findClaimPaths(graph,'ra:rheumatoid-factor','ra:anti-ccp',{...options,maxHops})).toThrow();
 expect(()=>findClaimPaths(graph,'unknown','ra:anti-ccp',options)).toThrow();
});
test('source binding changes require an explicit adapter update and graph versions retain a parent',()=>{
 const modified=structuredClone(ssc);modified.relationships[0].objectId=modified.relationships[1].objectId;expect(()=>buildClaimGraph(corpus,modified)).toThrow();
 const next=buildClaimGraph(corpus,ssc,graph.version);expect(next.parentVersion).toBe(graph.version);expect(next.version).not.toBe(graph.version);expect(graph.parentVersion).toBeNull();
});
test('binding and mention identities survive source-array reordering',()=>{
 const reordered=structuredClone(corpus);reordered.claims.reverse();reordered.passages.reverse();
 const next=buildClaimGraph(reordered,ssc);
 expect(next.edges.map(e=>e.id).sort()).toEqual(graph.edges.map(e=>e.id).sort());expect(next.mentions.map(e=>e.id).sort()).toEqual(graph.mentions.map(e=>e.id).sort());
});

test('species parsing preserves mixed-model uncertainty and does not treat non-human evidence as human',()=>{expect(claimSpecies('human and mouse coculture')).toBe('mixed');expect(claimSpecies('non-human primate study')).toBe('unspecified')});
