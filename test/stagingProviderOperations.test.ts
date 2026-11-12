import {describe,it,expect} from "bun:test";
import {mkdtemp,readFile,writeFile,rm,stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";
import {createOperationalSourceClearance,type SourceDecisionState} from "../src/researchV2/operationalSourceClearance";
import {createSourceClearanceVerifier,sourceClearanceSigningText,type SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";
import {createStagingProviderOperations,type StagingDeployment} from "../src/researchV2/stagingProviderOperations";
import {replayStagingReceipts} from "../src/researchV2/stagingReceiptReplay";
import type {ProviderTransport} from "../src/researchV2/providerReliability";
const passage="Synthetic passage for isolated tests only.";
const payload={instruction:"Return the requested JSON schema only.",claim:"A is associated with B",passage};
const secret="TEST_ONLY_SECRET_NEVER_LOG";
const {publicKey,privateKey}=generateKeyPairSync("ed25519");
function receipt():SourceClearanceReceipt{
 const r:SourceClearanceReceipt={schemaVersion:"hsi-source-clearance-1",id:"fixture-receipt",issuer:"fixture-source-authority",keyId:"fixture-key",sourceId:"fixture-source",sourceVersion:"v1",canonicalId:"PMID:123",passageSha256:createHash("sha256").update(passage).digest("hex"),permittedActions:["model_transmission"],licenceId:"TEST-ONLY",attribution:"Synthetic fixture metadata",identity:"matched",rights:"verified",retraction:"clear",checkedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+60000).toISOString(),signature:""};
 r.signature=sign(null,Buffer.from(sourceClearanceSigningText(r)),privateKey).toString("base64url");return r;
}
const result={verdict:"supports",evidenceSpan:"Synthetic passage",reason:"MODEL_REASON_MUST_NOT_LOG"};
const response=(provider="openai",model="fixture-model-a")=>Response.json(provider==="openai"?{id:"resp_fixture",model,status:"completed",usage:{input_tokens:10,output_tokens:10},output:[{type:"message",status:"completed",content:[{type:"output_text",text:JSON.stringify(result)}]}]}:{id:"msg_fixture",model,stop_reason:"end_turn",usage:{input_tokens:10,output_tokens:10},content:[{type:"text",text:JSON.stringify(result)}]},{headers:{"x-request-id":"request_fixture"}});
async function fixture(){
 const directory=await mkdtemp(join(tmpdir(),"hsi-p0b-")),file=join(directory,"protected.jsonl"),store=await openStagingOperationStore(file);
 let state:SourceDecisionState="cleared",revoked=false,authorityCalls=0;
 const signed=receipt(),source={sourceId:signed.sourceId,sourceVersion:signed.sourceVersion,passage,receipt:null};
 const sources=createOperationalSourceClearance({store,verifier:createSourceClearanceVerifier({authorities:[{issuer:signed.issuer,keyId:signed.keyId,publicKey}],isRevoked:async()=>revoked}),authority:{lookup:async()=>{authorityCalls++;return {state,policyRef:"fixture-public-policy",receipt:signed}}}});
 const deployment:StagingDeployment={id:"fixture-openai",config:{providerId:"openai",modelId:"fixture-model-a",endpoint:"https://api.openai.com/v1/responses",timeoutMs:1000,maxResponseBytes:4096},termsRef:"fixture-terms",sourcePolicyRef:"fixture-public-policy",maxOutputTokens:64,inputUnitPrice:1,outputUnitPrice:1,budgetUnits:1000000};
 let calls=0,approved=true;
 const service=(transport:ProviderTransport=async()=>response(),enabled=true,deployments=[deployment])=>createStagingProviderOperations({enabled,deployments,store,sources,approve:async()=>approved,credential:()=>secret,transportFactory:encode=>async(c,p,o)=>{calls++;const wire=encode(c,p);expect(JSON.stringify(wire.headers)).toContain(secret);return transport(c,p,o)}});
 return {directory,file,store,sources,source,signed,deployment,service,setState:(v:SourceDecisionState)=>{state=v},revoke:()=>{revoked=true},denyApproval:()=>{approved=false},get calls(){return calls},get authorityCalls(){return authorityCalls},async close(){await store.close();await rm(directory,{recursive:true,force:true})}};
}
describe("P0-B isolated staging operations",()=>{
 it("is disabled by default and requires independent deployment approval before egress",async()=>{
  const f=await fixture();try{
   const disabled=createStagingProviderOperations({deployments:[f.deployment],store:f.store,sources:f.sources,approve:async()=>true,credential:()=>secret});
   await expect(disabled.run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("disabled");
   f.denyApproval();await expect(f.service().run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("not approved");expect(f.calls).toBe(0);
  }finally{await f.close()}
 });
 it("rejects existing PHI markers before source lookup or dispatch",async()=>{
  const f=await fixture();try{
   await expect(f.service().run({deploymentId:f.deployment.id,source:f.source,payload:{...payload,claim:"NHS number: 1234567890"}})).rejects.toThrow("data boundary");expect(f.calls).toBe(0);expect(f.authorityCalls).toBe(0);
  }finally{await f.close()}
 });
 it("records all required independent source states without turning unknown into clearance",async()=>{
  const f=await fixture();try{
   for(const state of ["cleared","unknown","expired","corrected","retracted","withdrawn","identifier_conflict","revoked"] as const){f.setState(state);expect((await f.sources.decide(f.source)).state).toBe(state);}
   expect(f.store.read().filter(e=>e.type==="source_decision")).toHaveLength(8);
   expect(f.calls).toBe(0);
  }finally{await f.close()}
 });
 it("rejects actually expired signed receipts and canonical identifier conflicts",async()=>{
  const f=await fixture();try{
   expect((await f.sources.decide({...f.source,receipt:{...f.signed,canonicalId:"PMID:456"}})).state).toBe("identifier_conflict");
   f.signed.expiresAt=new Date(Date.now()-1).toISOString();f.signed.signature=sign(null,Buffer.from(sourceClearanceSigningText(f.signed)),privateKey).toString("base64url");
   expect((await f.sources.decide(f.source)).state).toBe("expired");
  }finally{await f.close()}
 });
 it("revocation blocks new egress and flags dependent artifacts, including a late registration",async()=>{
  const f=await fixture();try{
   await f.sources.decide(f.source);await f.sources.registerDependency(f.source.sourceId,"artifact-one");f.setState("revoked");
   await expect(f.service().run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("not cleared");
   await f.sources.registerDependency(f.source.sourceId,"artifact-two");
   expect(f.store.read().filter(e=>e.type==="artifact_clearance_flag").map(e=>e.artifactId).sort()).toEqual(["artifact-one","artifact-two"]);expect(f.calls).toBe(0);
  }finally{await f.close()}
 });
 it("denies egress when cryptographic revocation lookup rejects an otherwise clear authority decision",async()=>{
  const f=await fixture();try{await f.sources.decide(f.source);await f.sources.registerDependency(f.source.sourceId,"artifact-one");f.revoke();await expect(f.service().run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow();expect(f.calls).toBe(0);expect(f.store.read().some(e=>e.type==="artifact_clearance_flag")).toBe(true);}finally{await f.close()}
 });
 it("refreshes withdrawal flags without needing stored passages or a new model run",async()=>{
  const f=await fixture();try{
   await f.sources.decide(f.source);await f.sources.registerDependency(f.source.sourceId,"artifact-existing");f.setState("withdrawn");
   expect((await f.sources.refresh(f.source.sourceId)).state).toBe("withdrawn");
   expect(f.store.read().some(e=>e.type==="artifact_clearance_flag"&&e.artifactId==="artifact-existing"&&e.state==="withdrawn")).toBe(true);expect(f.calls).toBe(0);
  }finally{await f.close()}
 });
 it("does not dispatch when durable start storage fails or clearance changes during staging",async()=>{
  const f=await fixture();try{
   let calls=0;
   const store={...f.store,append:async(event:Readonly<Record<string,unknown>>)=>{if(event.type==="provider_run_start")throw Error(secret);await f.store.append(event)}};
   const service=createStagingProviderOperations({enabled:true,deployments:[f.deployment],store,sources:f.sources,approve:async()=>true,credential:()=>secret,transportFactory:()=>async()=>{calls++;return response()}});
   await expect(service.run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("start receipt unavailable");expect(calls).toBe(0);
   const revokingStore={...f.store,append:async(event:Readonly<Record<string,unknown>>)=>{await f.store.append(event);if(event.type==="provider_run_start")f.setState("revoked")}};
   const revoking=createStagingProviderOperations({enabled:true,deployments:[f.deployment],store:revokingStore,sources:f.sources,approve:async()=>true,credential:()=>secret,transportFactory:()=>async()=>{calls++;return response()}});
   await expect(revoking.run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow();expect(calls).toBe(0);
  }finally{await f.close()}
 });
 it("does not return completed results unless terminal storage is acknowledged",async()=>{
  const f=await fixture();try{
   const store={...f.store,append:async(event:Readonly<Record<string,unknown>>)=>{if(event.type==="provider_run_finish")throw Error(secret);await f.store.append(event)}};
   const service=createStagingProviderOperations({enabled:true,deployments:[f.deployment],store,sources:f.sources,approve:async()=>true,credential:()=>secret,transportFactory:()=>async()=>response()});
   await expect(service.run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("terminal receipt unavailable");
   expect(f.store.read().some(e=>e.type==="provider_run_start")).toBe(true);expect(f.store.read().some(e=>e.type==="provider_run_finish")).toBe(false);
   expect(replayStagingReceipts(f.store).runs[0]?.status).toBe("completion_unknown");expect(replayStagingReceipts(f.store).automaticRetryPermitted).toBe(false);
  }finally{await f.close()}
 });
 it("runs both provider codecs with durable redacted receipts, never claiming scientific accuracy",async()=>{
  const f=await fixture();try{
   for(const provider of ["openai","anthropic"]){
    const deployment:StagingDeployment={...f.deployment,id:"fixture-"+provider,anthropicVersion:"2023-06-01",config:{...f.deployment.config,providerId:provider,modelId:"fixture-model-"+provider,endpoint:provider==="openai"?"https://api.openai.com/v1/responses":"https://api.anthropic.com/v1/messages"}};
    const completed=await f.service(async()=>response(provider,deployment.config.modelId),true,[deployment]).run({deploymentId:deployment.id,source:f.source,payload});
    expect(completed.providerRequestId).toBe("request_fixture");expect(completed.scientificApproval).toBe(false);expect(completed.graphPromotable).toBe(false);
   }
   const events=f.store.read().filter(e=>e.type==="provider_run_finish");expect(events).toHaveLength(2);expect(events.every(e=>e.status==="completed"&&e.outputHash)).toBe(true);
   const replay=replayStagingReceipts(f.store);expect(replay.runs.every(r=>r.status==="completed")).toBe(true);expect(replay.liveSmokeAccepted).toBe(false);expect(replay.scientificAccuracyEstablished).toBe(false);
   const disk=await readFile(f.file,"utf8");expect(disk).not.toContain(secret);expect(disk).not.toContain(passage);expect(disk).not.toContain(payload.claim);expect(disk).not.toContain(result.reason);
   expect((await stat(f.file)).mode&0o077).toBe(0);
  }finally{await f.close()}
 });
 it("records bounded faults without raw error or response text",async()=>{
  const f=await fixture();try{
   const faults:[ProviderTransport,string][]=[
    [async()=>new Response("secret-error "+secret,{status:429}),"rate_limited"],
    [async()=>new Response(secret,{status:503}),"provider_unavailable"],
    [async()=>new Response("malformed "+secret,{headers:{"content-type":"application/json"}}),"invalid_response"],
    [async()=>Response.json({arbitrary:secret}),"invalid_response"],
    [async()=>new Response("x".repeat(4097),{headers:{"content-type":"application/json"}}),"response_overflow"],
    [async()=>new Promise<Response>(()=>{}),"timeout"],
   ];
   for(const [transport,status] of faults){await expect(f.service(transport).run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow(status);expect(f.store.read().filter(e=>e.type==="provider_run_finish").at(-1)?.status).toBe(status);}
   expect(await readFile(f.file,"utf8")).not.toContain(secret);
  }finally{await f.close()}
 });
 it("settles cancellation even when transport ignores it and retains the charged reservation",async()=>{
  const f=await fixture();try{
   const controller=new AbortController(),operation=f.service(async()=>{controller.abort();return new Promise<Response>(()=>{})}).run({deploymentId:f.deployment.id,source:f.source,payload,signal:controller.signal});
   await expect(operation).rejects.toThrow("cancelled");expect(f.store.read().some(e=>e.type==="budget_reservation")).toBe(true);expect(f.store.read().filter(e=>e.type==="provider_run_finish").at(-1)?.status).toBe("cancelled");
  }finally{await f.close()}
 });
 it("exhausted budgets prevent provider dispatch",async()=>{
  const f=await fixture();try{f.deployment.budgetUnits=1;await expect(f.service().run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("budget exhausted");expect(f.calls).toBe(0);}finally{await f.close()}
 });
 it("rechecks deployment approval after the start record and rejects excessive provider usage",async()=>{
  const f=await fixture();try{
   let checks=0,calls=0;
   const service=createStagingProviderOperations({enabled:true,deployments:[f.deployment],store:f.store,sources:f.sources,approve:async()=>++checks===1,credential:()=>secret,transportFactory:()=>async()=>{calls++;return response()}});
   await expect(service.run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow();expect(calls).toBe(0);
   await expect(f.service(async()=>{const raw=await response().json() as any;raw.usage.output_tokens=1000;return Response.json(raw,{headers:{"x-request-id":"request_fixture"}})}).run({deploymentId:f.deployment.id,source:f.source,payload})).rejects.toThrow("budget_usage_exceeded");
   expect(f.store.read().filter(e=>e.type==="provider_run_finish").at(-1)?.status).toBe("budget_usage_exceeded");
  }finally{await f.close()}
 });
 it("serializes reservations across service instances and persists them across reopen",async()=>{
  const f=await fixture();try{
   const accepted=await Promise.all(Array.from({length:10},(_,n)=>f.store.reserve("shared",String(n),6,10)));expect(accepted.filter(Boolean)).toHaveLength(1);
   await expect(openStagingOperationStore(f.file)).rejects.toThrow();
   await f.store.close();const reopened=await openStagingOperationStore(f.file);try{expect(await reopened.reserve("shared","later",6,10)).toBe(false);expect(reopened.read().some(e=>e.type==="budget_reservation")).toBe(true);}finally{await reopened.close()}
  }finally{await f.close()}
 });
 it("fails closed on journal truncation/tampering and refuses payload fields",async()=>{
  const f=await fixture();try{
   expect(()=>f.store.append({passage})).toThrow("refused");await f.store.append({type:"metadata",id:"one"});await f.store.close();
   const disk=await readFile(f.file,"utf8");await writeFile(f.file,disk.replace('"one"','"two"'));
   await expect(openStagingOperationStore(f.file)).rejects.toThrow("integrity");
   await writeFile(f.file,disk.trimEnd());await expect(openStagingOperationStore(f.file)).rejects.toThrow("Incomplete");
  }finally{await f.close()}
 });
});
