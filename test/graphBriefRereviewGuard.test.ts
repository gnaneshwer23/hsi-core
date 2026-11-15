import {test,expect} from 'bun:test';
import {graphBriefFixture} from './fixtures/graphContextBrief';
import {createGraphContextBriefService} from '../src/knowledgeGraph/contextBrief';
import {createProtectedGraphBriefReader,type StoredGraphContextBrief} from '../src/expansion/graphBriefRereviewGuard';
import {createVersionedSourceRereview} from '../src/expansion/sourceRereview';
import {opsFixture} from './fixtures/pilotOperations';
import {opsHash} from '../src/operations/pilotOperationsStore';
const actor={principalId:'fixture-researcher',authenticated:true as const,roles:['researcher']};
async function storedFixture(){
 const input=await graphBriefFixture(),brief=await createGraphContextBriefService({enabled:true,clearance:{authorize:async()=>true}}).create(input);
 return {organizationRef:'TEST-org',brief,dependencies:brief.units.map(u=>({sourceId:u.detailedContext!.sourceId,sourceVersion:u.detailedContext!.sourceVersion,clearanceRef:u.detailedContext!.clearanceReceiptId,artifactHash:brief.briefHash,artifactVersion:String(brief.version),investigationId:brief.investigationId,organizationRef:'TEST-org',domain:'fixture-only'}))} satisfies StoredGraphContextBrief;
}
test('real source-change queue blocks brief reads/exports even after acknowledged re-review',async()=>{
 const f=opsFixture();try{
  const stored=await storedFixture(),queue=createVersionedSourceRereview(f.store,{verifyDependency:async()=>true,verifySourceChange:async()=>true,verifyArtifactUse:async()=>true,verifyDecision:async()=>true});
  for(const d of stored.dependencies)await queue.register(d);
  const reader=createProtectedGraphBriefReader({enabled:true,load:async()=>stored,authorizeScope:async()=>true,authorizeCurrentArtifactUse:b=>queue.authorizeCurrentArtifactUse(b)});
  expect((await reader.view(actor,stored.brief.investigationId)).briefHash).toBe(stored.brief.briefHash);
  expect(JSON.parse(await reader.export(actor,stored.brief.investigationId,'json')).graphPromotable).toBe(false);
  const d=stored.dependencies[0]!;await queue.apply({sourceId:d.sourceId,affectedVersions:[d.sourceVersion],state:'retracted',authorityDecisionRef:'TEST-retraction',authorityRevision:'2',evidenceHash:opsHash('fixture-retraction')});
  await expect(reader.view(actor,stored.brief.investigationId)).rejects.toThrow('unavailable');
  const task=f.store.rereviewTasks()[0]!;await queue.review({taskId:task.taskId,reviewerRef:'TEST-independent-reviewer',receiptRef:'TEST-review',decision:'reviewed_with_limitations',replacementArtifactHash:null});
  await expect(reader.export(actor,stored.brief.investigationId,'markdown')).rejects.toThrow('unavailable');
 }finally{f.close()}
});
test('denies forged identity, wrong investigation, revoked scope and incomplete dependency coverage before current-use authority',async()=>{
 for(const mode of ['disabled','anonymous','wrong-id','revoked','missing-dependency','wrong-version','wrong-tenant']){
  const stored=await storedFixture();let calls=0;
  if(mode==='missing-dependency')stored.dependencies.pop();if(mode==='wrong-version')stored.dependencies[0]!.sourceVersion='wrong';if(mode==='wrong-tenant')stored.dependencies[0]!.organizationRef='another-org';
  const reader=createProtectedGraphBriefReader({enabled:mode!=='disabled',load:async()=>stored,authorizeScope:async()=>mode!=='revoked',authorizeCurrentArtifactUse:async()=>{calls++;return true}});
  await expect(reader.view(mode==='anonymous'?null:actor,mode==='wrong-id'?'another-investigation':stored.brief.investigationId)).rejects.toThrow('unavailable');expect(calls).toBe(0);
 }
});
test('checks the requested action every time and redacts authority/storage errors',async()=>{
 const stored=await storedFixture(),actions:string[]=[];
 const reader=createProtectedGraphBriefReader({enabled:true,load:async()=>stored,authorizeScope:async()=>true,authorizeCurrentArtifactUse:async b=>{actions.push(...b.actions);return b.actions[0]==='display'}});
 await reader.view(actor,stored.brief.investigationId);await expect(reader.export(actor,stored.brief.investigationId,'json')).rejects.toThrow('unavailable');expect(actions).toEqual(['display','export']);
 const broken=createProtectedGraphBriefReader({enabled:true,load:async()=>{throw Error('secret fixture passage')},authorizeScope:async()=>true,authorizeCurrentArtifactUse:async()=>true});
 await expect(broken.view(actor,stored.brief.investigationId)).rejects.toThrow('Graph brief access unavailable');
});
