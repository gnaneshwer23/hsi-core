import {describe,expect,test} from "bun:test";
import {mkdtemp,readFile,rm,stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {DETAILED_CONTEXT_FIELDS} from "../src/evidence/passageLinkedContext";
import {createStagingProviderOperations,decodeExtractionResult,decodeProviderResult,extractionSchema,providerWireBody,type StagingDeployment} from "../src/researchV2/stagingProviderOperations";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";
import {createOperationalSourceClearance} from "../src/researchV2/operationalSourceClearance";
import {createSourceClearanceVerifier,type SourceUseAction} from "../src/researchV2/sourceClearanceReceipt";
import {buildUnsignedReceipt,generateAuthorityKeyPair,loadPrivateKey,loadPublicKey,sha256Hex,signReceipt} from "../src/researchV2/clearanceSigning";
import {replayStagingReceipts} from "../src/researchV2/stagingReceiptReplay";
import {createProviderBackedRunners} from "../src/liveModels";
import {createModelEvidenceExtractor,EXTRACTION_INSTRUCTION} from "../src/evidence/modelEvidenceExtraction";
import {createEntailmentVerifier} from "../src/evidence/entailmentVerifier";
import {createContextConflictAuditRunner,type ContextAuditHit,type ContextAuditTarget,type ContextConflictAudit} from "../src/evidence/contextConflictAudit";
import type {ProviderTransport} from "../src/researchV2/providerReliability";

const SECRET="TEST_ONLY_SECRET_NEVER_LOG";
const P1="In a synthetic mouse cohort, Metabolite M1 levels were associated with Cytokine B production in colonic regulatory T cells after 7 days (flow cytometry, n=10).";
const P2="In a synthetic human cohort, serum Metabolite M1 was not associated with Cytokine B production in circulating monocytes (ELISA, n=40).";
const field=(quote:string|null,status:string|null=null,reason:string|null=null)=>({quote,status,reason});
const strictOutput=(passage:string,over:Record<string,unknown>={})=>{
 const q=passage.slice(0,45);
 const context:Record<string,unknown>={};for(const f of DETAILED_CONTEXT_FIELDS)context[f]=field(null,"not_extracted","Not stated in the passage");
 context.species=field(passage.includes("mouse")?"mouse":"human");context.assay=field(passage.includes("flow cytometry")?"flow cytometry":"ELISA");
 return {claim:{subject:{system:"FIXTURE",value:"metabolite-m1",label:"Metabolite M1"},predicate:"associated_with",object:{system:"FIXTURE",value:"cytokine-b",label:null},polarity:passage===P1?"supporting":"opposing",quote:q},context,note:null,...over};
};
const response=(provider:string,model:string,text:string)=>Response.json(provider==="openai"
 ?{id:"resp_fixture",model,status:"completed",usage:{input_tokens:200,output_tokens:300},output:[{type:"message",status:"completed",content:[{type:"output_text",text}]}]}
 :{id:"msg_fixture",model,stop_reason:"end_turn",usage:{input_tokens:200,output_tokens:300},content:[{type:"text",text}]},{headers:{"x-request-id":"request_fixture"}});
const deployment=(id:string,over:Partial<StagingDeployment>={}):StagingDeployment=>({id,config:{providerId:"openai",modelId:"model-"+id,endpoint:"https://api.openai.com/v1/responses",timeoutMs:5000,maxResponseBytes:65536},termsRef:"terms:"+id,sourcePolicyRef:"policy:public-oa-v1",maxOutputTokens:1500,inputUnitPrice:1,outputUnitPrice:1,budgetUnits:10_000_000,...over});

async function harness(actions:SourceUseAction[]=["model_transmission","storage","display","comparison","export"]){
 const directory=await mkdtemp(join(tmpdir(),"hsi-extract-")),file=join(directory,"protected.jsonl"),store=await openStagingOperationStore(file);
 const kp=generateAuthorityKeyPair(),priv=loadPrivateKey(kp.privateKeyPem),pub=loadPublicKey(kp.publicKeyPem);
 const issue=(sourceId:string,passage:string)=>signReceipt(buildUnsignedReceipt({issuer:"authority:independent",keyId:"key-1",sourceId,sourceVersion:"v1",canonicalId:"PMID:12345",passage,permittedActions:actions,licenceId:"CC-BY-4.0",attribution:"Synthetic attribution",checkedAt:new Date(Date.now()-1000),validForMs:3600_000}),priv);
 const receipts=new Map<string,ReturnType<typeof issue>>();
 const add=(sourceId:string,passage:string)=>{receipts.set(sourceId+"|"+sha256Hex(passage),issue(sourceId,passage))};
 const sources=createOperationalSourceClearance({store,
  verifier:createSourceClearanceVerifier({authorities:[{issuer:"authority:independent",keyId:"key-1",publicKey:pub}],isRevoked:async()=>false,requiredActions:["storage"]}),
  authority:{lookup:async b=>{const r=receipts.get(b.sourceId+"|"+b.passageSha256);return r?{state:"cleared" as const,policyRef:"policy:public-oa-v1",receipt:r}:{state:"unknown" as const,policyRef:"policy:public-oa-v1"}}}});
 let calls=0,lastBody="";
 const ops=(transport:ProviderTransport,deployments:StagingDeployment[],approved=true)=>createStagingProviderOperations({enabled:true,deployments,store,sources,approve:async()=>approved,credential:()=>SECRET,
  transportFactory:encode=>async(c,p,o)=>{calls++;lastBody=encode(c,p).body;return transport(c,p,o)}});
 return {directory,file,store,sources,add,ops,get calls(){return calls},get lastBody(){return lastBody},async close(){await store.close();await rm(directory,{recursive:true,force:true})}};
}

describe("strict extraction schema",()=>{
 test("every object forbids extras and lists all of its properties as required (provider strict mode), recursively",()=>{
  const walk=(node:any,path:string)=>{
   if(node&&typeof node==="object"&&node.type==="object"){
    expect(node.additionalProperties,path).toBe(false);
    expect([...node.required].sort(),path).toEqual(Object.keys(node.properties).sort());
    for(const [k,v] of Object.entries(node.properties))walk(v,path+"."+k);
   }
  };
  walk(extractionSchema,"root");
  expect(Object.keys((extractionSchema.properties.context as any).properties).sort()).toEqual([...DETAILED_CONTEXT_FIELDS].sort());
 });
 test("wire bodies: OpenAI uses a strict json_schema and does not store; Anthropic carries the same evidence; the question and passage are the only inputs",()=>{
  const payload={instruction:EXTRACTION_INSTRUCTION,claim:"How might a metabolite matter?",passage:P1};
  const o=JSON.parse(providerWireBody(deployment("a"),payload,"extraction"));
  expect(o.store).toBe(false);expect(o.text.format).toMatchObject({type:"json_schema",name:"hsi_extraction",strict:true});
  expect(JSON.parse(o.input)).toEqual({question:payload.claim,passage:P1});expect(o.max_output_tokens).toBe(1500);
  const a=JSON.parse(providerWireBody(deployment("b",{config:{providerId:"anthropic",modelId:"m",endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:5000,maxResponseBytes:65536},anthropicVersion:"2023-06-01"}),payload,"extraction"));
  expect(JSON.parse(a.messages[0].content)).toEqual({question:payload.claim,passage:P1});expect(a.system).toBe(EXTRACTION_INSTRUCTION);
  const e=JSON.parse(providerWireBody(deployment("c"),{instruction:"i",claim:"claim text",passage:P1}));
  expect(e.text.format.name).toBe("hsi_entailment");expect(JSON.parse(e.input)).toEqual({claim:"claim text",passage:P1});
  expect(()=>providerWireBody(deployment("d"),payload,"other" as never)).toThrow();
 });
});

describe("extraction decoder",()=>{
 test("accepts a valid result and returns the extractor's input shape (quote or gap per field)",()=>{
  const out=decodeExtractionResult(strictOutput(P1));
  expect(out.context.species).toEqual({quote:"mouse"});expect(out.context.estimand).toEqual({status:"not_extracted",reason:"Not stated in the passage"});
  expect(out.claim.polarity).toBe("supporting");expect(Object.keys(out.context)).toHaveLength(DETAILED_CONTEXT_FIELDS.length);
 });
 test("rejects extras, missing fields, ambiguous or empty field entries and bad values",()=>{
  const bad=(mutate:(o:any)=>void)=>{const o=structuredClone(strictOutput(P1)) as any;mutate(o);expect(()=>decodeExtractionResult(o)).toThrow("provider_schema")};
  bad(o=>{o.extra=1});bad(o=>{delete o.note});bad(o=>{delete o.context.species});bad(o=>{o.context.unknownField=field("x")});
  bad(o=>{o.context.species=field("mouse","not_reported","both")});bad(o=>{o.context.species=field(null)});bad(o=>{o.context.species=field(null,"reported","x")});
  bad(o=>{o.context.species={quote:"mouse"}});bad(o=>{o.context.species=field("")});bad(o=>{o.context.species=field("x".repeat(301))});bad(o=>{o.context.species=field(null,"not_reported","r".repeat(301))});
  bad(o=>{o.claim.polarity="proves"});bad(o=>{o.claim.predicate="Bad Predicate!"});bad(o=>{o.claim.predicate="ab"});bad(o=>{o.claim.quote=""});bad(o=>{o.claim.extra=1});
  bad(o=>{o.claim.subject={system:"1bad",value:"v",label:null}});bad(o=>{o.claim.object={system:"S",value:"has space",label:null}});bad(o=>{o.claim.subject.label="x".repeat(201)});bad(o=>{o.claim.subject.extra=1});
  bad(o=>{o.note=5});bad(o=>{o.note="n".repeat(501)});
  expect(()=>decodeExtractionResult(null)).toThrow();expect(()=>decodeExtractionResult("x")).toThrow();
 });
 test("provider envelopes: text must be JSON and within the size limit; entailment is unchanged",()=>{
  const env=(text:string)=>({id:"resp_1",model:"m",status:"completed",usage:{input_tokens:1,output_tokens:1},output:[{type:"message",status:"completed",content:[{type:"output_text",text}]}]});
  expect(decodeProviderResult("openai",env(JSON.stringify(strictOutput(P1))),"extraction").result.claim.predicate).toBe("associated_with");
  expect(()=>decodeProviderResult("openai",env("not json"),"extraction")).toThrow();
  expect(()=>decodeProviderResult("openai",env(" ".repeat(12001)+JSON.stringify(strictOutput(P1))),"extraction")).toThrow("provider_schema");
  expect(()=>decodeProviderResult("openai",env(JSON.stringify(strictOutput(P1))))).toThrow();
  expect(decodeProviderResult("openai",env(JSON.stringify({verdict:"supports",evidenceSpan:null,reason:"r"}))).result.verdict).toBe("supports");
 });
});

describe("ops.run extraction task (mock transport, signed receipts)",()=>{
 const run=(h:Awaited<ReturnType<typeof harness>>,d:StagingDeployment,body:unknown,extra:Record<string,unknown>={})=>h.ops(async()=>response(d.config.providerId,d.config.modelId,JSON.stringify(body)),[d]).run({deploymentId:d.id,task:"extraction",source:{receipt:null,sourceId:"src-1",sourceVersion:"v1",passage:P1},payload:{instruction:EXTRACTION_INSTRUCTION,claim:"How might a metabolite matter?",passage:P1},...extra} as never);
 test("completes for both provider codecs, records the task, replays cleanly and logs no secret, passage or model text",async()=>{
  const h=await harness();h.add("src-1",P1);
  try{
   for(const provider of ["openai","anthropic"]){
    const d=deployment("x-"+provider,provider==="openai"?{}:{config:{providerId:"anthropic",modelId:"model-anthropic",endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:5000,maxResponseBytes:65536},anthropicVersion:"2023-06-01"});
    const out=await run(h,d,strictOutput(P1));
    expect(out.result.context.species).toEqual({quote:"mouse"});expect(out.scientificApproval).toBe(false);expect(out.graphPromotable).toBe(false);
   }
   const finishes=h.store.read().filter(e=>e.type==="provider_run_finish");expect(finishes).toHaveLength(2);expect(finishes.every(e=>e.task==="extraction"&&e.status==="completed")).toBe(true);
   const replay=replayStagingReceipts(h.store);expect(replay.runs.every(r=>r.status==="completed")).toBe(true);expect(replay.liveSmokeAccepted).toBe(false);
   const disk=await readFile(h.file,"utf8");for(const secret of [SECRET,P1,"Cytokine B","How might a metabolite matter?"])expect(disk).not.toContain(secret);
   expect((await stat(h.file)).mode&0o077).toBe(0);
  }finally{await h.close()}
 });
 test("model transmission clearance is still required; no call is made without it, without approval, or on a malformed answer",async()=>{
  const h=await harness(["storage","display","comparison","export"]);h.add("src-1",P1);
  try{
   await expect(run(h,deployment("x"),strictOutput(P1))).rejects.toThrow("not cleared");expect(h.calls).toBe(0);
  }finally{await h.close()}
  const h2=await harness();h2.add("src-1",P1);
  try{
   await expect(h2.ops(async()=>response("openai","model-x",JSON.stringify(strictOutput(P1))),[deployment("x")],false).run({deploymentId:"x",task:"extraction",source:{receipt:null,sourceId:"src-1",sourceVersion:"v1",passage:P1},payload:{instruction:EXTRACTION_INSTRUCTION,claim:"q question",passage:P1}})).rejects.toThrow("not approved");expect(h2.calls).toBe(0);
   await expect(run(h2,deployment("x"),{...strictOutput(P1),extra:1})).rejects.toThrow("invalid_response");
   await expect(run(h2,deployment("x"),strictOutput(P1),{task:"summarise"})).rejects.toThrow("Unsupported");
   expect(await readFile(h2.file,"utf8")).not.toContain(SECRET);
  }finally{await h2.close()}
 });
 test("a deployment with too small an output budget is refused before any call; the default task is still entailment",async()=>{
  const h=await harness();h.add("src-1",P1);
  try{
   await expect(run(h,deployment("small",{maxOutputTokens:256}),strictOutput(P1))).rejects.toThrow("too small");expect(h.calls).toBe(0);
   const d=deployment("e");const out=await h.ops(async()=>response("openai",d.config.modelId,JSON.stringify({verdict:"supports",evidenceSpan:"Metabolite M1 levels",reason:"stated"})),[d]).run({deploymentId:"e",source:{receipt:null,sourceId:"src-1",sourceVersion:"v1",passage:P1},payload:{instruction:"i",claim:"a b",passage:P1}});
   expect(out.result.verdict).toBe("supports");expect(h.store.read().filter(e=>e.type==="provider_run_finish").at(-1)?.task).toBe("entailment");
  }finally{await h.close()}
 });
});

describe("provider-backed runners",()=>{
 test("the call budget is enforced before any call; missing source identity throws; configuration is validated",async()=>{
  let called=0;const ops={run:async()=>{called++;return {result:strictOutput(P1)} as never}};
  const r=createProviderBackedRunners({ops:ops as never,extractorDeploymentId:"ext",verifierDeployments:[{verifierId:"va",deploymentId:"da"}],maxModelCalls:2});
  const req={instruction:"i",question:"What matters here?",passage:P1,fields:DETAILED_CONTEXT_FIELDS,source:{sourceId:"s",sourceVersion:"v1"}};
  await r.extraction(req);await r.extraction(req);expect(r.calls()).toBe(2);
  await expect(r.extraction(req)).rejects.toThrow("budget");expect(called).toBe(2);expect(r.remaining()).toBe(0);
  const r2=createProviderBackedRunners({ops:ops as never,extractorDeploymentId:"ext",verifierDeployments:[{verifierId:"va",deploymentId:"da"}],maxModelCalls:5});
  await expect(r2.extraction({...req,source:undefined})).rejects.toThrow("Source identity");await expect(r2.entailment("va")({instruction:"i",claim:"c d",passage:P1})).rejects.toThrow("Source identity");
  expect(()=>r2.entailment("nobody")).toThrow();expect(called).toBe(2);
  for(const bad of [{maxModelCalls:0},{extractorDeploymentId:"bad id"},{verifierDeployments:[]},{verifierDeployments:[{verifierId:"a",deploymentId:"x"},{verifierId:"a",deploymentId:"y"}]}])
   expect(()=>createProviderBackedRunners({ops:ops as never,extractorDeploymentId:"ext",verifierDeployments:[{verifierId:"va",deploymentId:"da"}],maxModelCalls:2,...bad} as never)).toThrow();
 });
 test("each model call carries the right task, deployment and cleared-source binding",async()=>{
  const seen:any[]=[];const ops={run:async(i:any)=>{seen.push(i);return {result:i.task==="extraction"?strictOutput(P1):{verdict:"supports",evidenceSpan:null,reason:"r"}} as never}};
  const r=createProviderBackedRunners({ops:ops as never,extractorDeploymentId:"ext",verifierDeployments:[{verifierId:"va",deploymentId:"da"},{verifierId:"vb",deploymentId:"db"}],maxModelCalls:10});
  await r.extraction({instruction:"inst",question:"Question text?",passage:P1,fields:DETAILED_CONTEXT_FIELDS,source:{sourceId:"s1",sourceVersion:"v9"}});
  await r.entailment("vb")({instruction:"inst",claim:"a b",passage:P1,sourceId:"s1",sourceVersion:"v9"});
  expect(seen[0]).toMatchObject({deploymentId:"ext",task:"extraction",source:{receipt:null,sourceId:"s1",sourceVersion:"v9",passage:P1},payload:{claim:"Question text?",passage:P1}});
  expect(seen[1]).toMatchObject({deploymentId:"db",source:{sourceId:"s1",sourceVersion:"v9"},payload:{claim:"a b"}});expect(seen[1].task).toBeUndefined();
 });
});

describe("the audit pipeline backed by provider runners (mock transport, no network)",()=>{
 const target:ContextAuditTarget={investigationId:"provider-backed",diseaseScope:"gut-immune-metabolic",question:"How might Metabolite M1 influence immune signalling?",release:{id:"r",version:"1",manifestHash:sha256Hex("r")}};
 const hitFor=(id:string,passage:string):ContextAuditHit=>({id,clearanceReceiptId:"pending",source:{id:"src-"+id,title:"Synthetic",kind:"publication",dataClass:"public_real",pmid:null,doi:null,url:"https://example.org/"+id,licence:{status:"permitted",identifier:"CC-BY-4.0",passageUsePermitted:true},provenance:{product:"hsi",datasetId:"d",version:"v1",retrievedAt:"2026-11-13T00:00:00Z"}},
  passage:{id:"src-"+id+":p1",sourceId:"src-"+id,sourceVersion:"v1",text:passage,locator:"Results",dataClass:"public_real",sha256:sha256Hex(passage)}});
 test("runs end to end through approval, clearance and receipts, and stops cleanly when the call budget is too small",async()=>{
  const h=await harness();
  try{
   const hits=[hitFor("a",P1),hitFor("b",P2)];for(const x of hits)h.add(x.source.id,x.passage.text);
   const decide=async(hit:ContextAuditHit)=>(await h.sources.decide({receipt:null,sourceId:hit.source.id,sourceVersion:hit.passage.sourceVersion,passage:hit.passage.text,requiredActions:["storage","display","comparison","export"]}));
   for(const x of hits)x.clearanceReceiptId=(await decide(x)).receipt!.id;
   const transport=(provider:string,model:string):ProviderTransport=>async(_c,payload)=>{
    const isExtraction=payload.instruction===EXTRACTION_INSTRUCTION;
    if(isExtraction)return response(provider,model,JSON.stringify(strictOutput(payload.passage)));
    return response(provider,model,JSON.stringify({verdict:"supports",evidenceSpan:payload.passage.slice(0,30),reason:"stated"}));
   };
   const dExt=deployment("ext"),dA=deployment("da"),dB=deployment("db");
   const ops=h.ops(async(c,p,o)=>transport("openai",c.modelId)(c,p,o),[dExt,dA,dB]);
   const build=(maxModelCalls:number,stored:ContextConflictAudit[])=>{
    const r=createProviderBackedRunners({ops,extractorDeploymentId:"ext",verifierDeployments:[{verifierId:"va",deploymentId:"da"},{verifierId:"vb",deploymentId:"db"}],maxModelCalls});
    const rejections:string[]=[];
    const runner=createContextConflictAuditRunner({enabled:true,
     search:async(_t,intent)=>({intent,status:"completed_bounded",queriedAt:"2026-11-13T00:00:00Z",queryHash:sha256Hex(intent),sourceIds:[hits[intent==="support"?0:1]!.source.id],hits:[structuredClone(hits[intent==="support"?0:1]!)]}),
     authorizePassage:async hit=>(await decide(hit)).state==="cleared",
     extract:createModelEvidenceExtractor({runner:r.extraction,onRejection:x=>rejections.push(x.reason)}),
     verify:createEntailmentVerifier({verifiers:[{verifierId:"va",modelId:"model-da",runner:r.entailment("va")},{verifierId:"vb",modelId:"model-db",runner:r.entailment("vb")}]}),
     append:async a=>{stored.push(structuredClone(a))}});
    return {r,runner,rejections};
   };
   const stored:ContextConflictAudit[]=[],ok=build(10,stored),audit=await ok.runner.run(target);
   expect(ok.r.calls()).toBe(6);expect(audit.units).toHaveLength(2);expect(audit.verifier.status).toBe("checked_with_limitations");expect(ok.rejections).toEqual([]);
   expect(audit.scientificApproval).toBe(false);expect(audit.graphPromotable).toBe(false);expect(audit.humanReview.status).toBe("required");
   for(const u of audit.units){const f=u.detailedContext!.fields.species;expect(f.status).toBe("reported");expect(u.detailedContext!.passageText.slice(f.span!.start,f.span!.end)).toBe(f.originalText!)}
   const finishes=h.store.read().filter(e=>e.type==="provider_run_finish");expect(finishes).toHaveLength(6);expect(finishes.filter(e=>e.task==="extraction")).toHaveLength(2);expect(finishes.filter(e=>e.task==="entailment")).toHaveLength(4);
   const disk=await readFile(h.file,"utf8");expect(disk).not.toContain(SECRET);expect(disk).not.toContain(P1);
   const stored2:ContextConflictAudit[]=[],tight=build(1,stored2);
   const degraded=await tight.runner.run({...target,investigationId:"provider-backed-2"});
   // One model call only: the second extraction degrades safely and the verifier cannot run, so nothing is called "checked".
   expect(degraded.verifier.status).toBe("failed");expect(tight.rejections).toContain("Model runner failed");
   expect(degraded.units.some(u=>u.findingPolarity==="uncertain"&&u.subject.system==="HSI-UNRESOLVED")).toBe(true);
   expect(degraded.humanReview.status).toBe("required");expect(degraded.graphPromotable).toBe(false);
   expect(tight.r.calls()).toBe(1);expect(h.store.read().filter(e=>e.type==="provider_run_finish")).toHaveLength(7);
  }finally{await h.close()}
 });
});
