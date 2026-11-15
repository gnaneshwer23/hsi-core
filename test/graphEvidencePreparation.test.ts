import {describe,test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {parseDomainBundle,type DomainBundle} from '../src/knowledgeGraph/domainGraph';
import {graphEvidenceReadiness} from '../src/knowledgeGraph/evidenceReadiness';
import {createGraphCurationPacket,createGraphEvidencePreparationService,type GraphPassageInput} from '../src/knowledgeGraph/evidencePreparation';
import {canonicalEvidenceJson} from '../src/evidence/researchEvidenceCorpus';
import {createSourceClearanceVerifier,sourceClearanceSigningText,type SourceClearanceReceipt} from '../src/researchV2/sourceClearanceReceipt';
import {contextUnit} from './fixtures/contextConflictAudit';
const g=parseDomainBundle(JSON.parse(readFileSync('research/domain-graph/graph.v1.json','utf8')));
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const now=Date.parse('2026-11-15T12:00:00Z');
function fixtures(){
 const bundle=structuredClone(g),inputs:GraphPassageInput[]=[];
 for(const [i,id] of ['a','b'].entries()){
  const f=contextUnit(id),edge=bundle.edges.filter(e=>e.kind==='source_candidate')[i]!;
  bundle.sources.push({id:f.source.id,title:'Synthetic contract fixture',url:'https://pubmed.ncbi.nlm.nih.gov/'+String(123+i)+'/',doi:null,pmid:String(123+i),identityStatus:'bibliographic_candidate_not_retrieved',rights:'unverified',retrievedAt:null,passages:[]});
  edge.sourceId=f.source.id;
  const r:SourceClearanceReceipt={schemaVersion:'hsi-source-clearance-1',id:'fixture-clearance-'+id,issuer:'fixture-authority',keyId:'fixture-key',sourceId:f.source.id,sourceVersion:f.passage.sourceVersion,canonicalId:'PMID:'+String(123+i),passageSha256:digest(f.passage.text),permittedActions:['storage','display','comparison','export'],licenceId:'TEST-ONLY',attribution:'Synthetic fixture; no scientific gold',identity:'matched',rights:'verified',retraction:'clear',checkedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+10000).toISOString(),signature:''};
  r.signature=sign(null,Buffer.from(sourceClearanceSigningText(r)),privateKey).toString('base64url');
  inputs.push({edgeId:edge.id,source:f.source,passage:f.passage,receipt:r,clearanceReceiptId:r.id,extractions:f.extractions});
 }
 const a=bundle.edges.find(e=>e.id===inputs[0]!.edgeId)!,b=bundle.edges.find(e=>e.id===inputs[1]!.edgeId)!;
 Object.assign(b,{subjectId:a.subjectId,objectId:a.objectId,predicate:a.predicate});
 const {version,...body}=bundle;bundle.version=digest(canonicalEvidenceJson(body));
 return {bundle,inputs,ids:inputs.map(i=>i.edgeId)};
}
function service(revoked=false){let calls=0;return {count:()=>calls,service:createGraphEvidencePreparationService({enabled:true,clearance:createSourceClearanceVerifier({authorities:[{issuer:'fixture-authority',keyId:'fixture-key',publicKey}],isRevoked:async()=>{calls++;return revoked},requiredActions:['storage','display','comparison','export'],now:()=>now})})};}
describe('graph evidence preparation, never scientific acceptance',()=>{
 test('reports real missingness without treating source text or annotations as clearance',()=>{
  const r=graphEvidenceReadiness(g);expect(r.totals.selected).toBe(g.edges.length);expect(r.totals.candidates).toBe(g.edges.filter(e=>e.kind==='source_candidate').length);
  expect(r.totals.missingContext.tissue).toBeGreaterThan(0);expect(r.liveExecutionAllowed).toBe(false);expect(r.sourceClearanceVerified).toBe(false);
  expect(r.records.filter(r=>r.kind==='research_gap').every(r=>r.blockers.includes('research_gap_is_not_evidence'))).toBe(true);
  expect(()=>graphEvidenceReadiness(g,['unknown'])).toThrow();expect(()=>graphEvidenceReadiness(g,[g.edges[0]!.id,g.edges[0]!.id])).toThrow();expect(graphEvidenceReadiness(g,[]).totals.selected).toBe(0);
 });
 test('curation packet is deterministic, pinned, blank for real experts, and rejects modified graph data',async()=>{
  const ids=[g.edges[0]!.id],p=await createGraphCurationPacket(g,ids);expect(p).toEqual(await createGraphCurationPacket(g,ids));
  expect(p.records[0]!.independentAssessments).toEqual([]);expect(p.records[0]!.sourceVersion).toBeNull();expect(p.records[0]!.fields.dose!.status).toBe('not_extracted');
  const changed=structuredClone(g);changed.edges[0]!.assertion+=' altered';await expect(createGraphCurationPacket(changed,ids)).rejects.toThrow();
 });
 test('default disabled makes no authority calls',async()=>{
  let calls=0;const f=fixtures(),p=await createGraphCurationPacket(f.bundle,f.ids);
  await expect(createGraphEvidencePreparationService({clearance:{authorize:async()=>{calls++;return true}}}).prepare(f.bundle,p,f.inputs)).rejects.toThrow('disabled');expect(calls).toBe(0);
 });
 test('complete signed inputs use the existing normalization/comparability engine without approval',async()=>{
  const f=fixtures(),p=await createGraphCurationPacket(f.bundle,f.ids),s=service();const prepared=await s.service.prepare(f.bundle,p,f.inputs);
  expect(s.count()).toBe(2);expect(prepared.comparisonInputs[0]!.contextComparison.status).toBe('aligned');expect(prepared.scientificApproval).toBe(false);expect(prepared.graphPromotable).toBe(false);expect(prepared.modelExecution).toBe(false);expect(prepared.clearanceMustBeRechecked).toBe(true);expect(prepared.records[0]!.context.fields.dose.normalized).toEqual({kind:'quantity',value:'1000',unit:'nM'});
 });
 test('invalid last row, duplicate, stale packet or identity mismatch causes zero authority egress',async()=>{
  for(const mutate of [(f:ReturnType<typeof fixtures>)=>{f.inputs[1]!.passage.sha256='0'.repeat(64)},(f:ReturnType<typeof fixtures>)=>{f.inputs[1]!.edgeId=f.inputs[0]!.edgeId},(f:ReturnType<typeof fixtures>)=>{f.inputs[1]!.source.id='wrong'},(f:ReturnType<typeof fixtures>)=>{(f.inputs[1]!.receipt as SourceClearanceReceipt).canonicalId='PMID:999'}]){
   const f=fixtures(),p=await createGraphCurationPacket(f.bundle,f.ids),s=service();mutate(f);await expect(s.service.prepare(f.bundle,p,f.inputs)).rejects.toThrow();expect(s.count()).toBe(0);
  }
  const f=fixtures(),p=await createGraphCurationPacket(f.bundle,f.ids),s=service();p.records[0]!.edgeId='invented';await expect(s.service.prepare(f.bundle,p,f.inputs)).rejects.toThrow('modified');expect(s.count()).toBe(0);
 });
 test('revocation, tampered signature and later reuse cannot reuse prior permission',async()=>{
  const f=fixtures(),p=await createGraphCurationPacket(f.bundle,f.ids);
  await expect(service(true).service.prepare(f.bundle,p,f.inputs)).rejects.toThrow('authorized');
  (f.inputs[0]!.receipt as SourceClearanceReceipt).signature='forged';await expect(service().service.prepare(f.bundle,p,f.inputs)).rejects.toThrow('authorized');
 });
 test('missing context stays insufficient and different entities cannot become aligned',async()=>{
  const f=fixtures();delete f.inputs[1]!.extractions.dose;let p=await createGraphCurationPacket(f.bundle,f.ids);const a=await service().service.prepare(f.bundle,p,f.inputs);expect(a.comparisonInputs[0]!.contextComparison.status).toBe('insufficient_evidence');
  const h=fixtures(),edge=h.bundle.edges.find(e=>e.id===h.ids[1])!;edge.objectId=h.bundle.nodes.find(n=>n.id!==edge.objectId&&n.id!==edge.subjectId)!.id;
  const {version,...body}=h.bundle;h.bundle.version=digest(canonicalEvidenceJson(body));p=await createGraphCurationPacket(h.bundle,h.ids);
  expect((await service().service.prepare(h.bundle,p,h.inputs)).comparisonInputs[0]!.contextComparison.status).toBe('not_comparable');
 });
});
