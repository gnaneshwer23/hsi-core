import {afterAll,expect,test} from "bun:test";
import {chmodSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {generateKeyPairSync} from "node:crypto";
import {buildLiveRunDeps} from "../src/liveWiring";
import {composeLiveRun} from "../src/liveRun";
import {buildDemoPolicy,demoAuthority,demoFetcher,DEMO_SCENARIOS} from "../src/sourceIntegrityDemo";
import {createInProcessSigner} from "../src/researchV2/sourceIntegrityService";
import {openStagingOperationStore} from "../src/researchV2/stagingOperationStore";
import {createFileReceiptPublisher} from "../src/researchV2/clearanceAuthority";

const NOW=Date.parse("2026-11-13T12:00:00Z");
const G1="In a synthetic mouse study, gut microbial metabolites were positively associated with immune signalling in colonic regulatory T cells after 7 days (flow cytometry, n=10).";
const G2="In a synthetic human cohort, gut microbial metabolites were not associated with immune signalling in circulating monocytes (ELISA, n=40).";
const claim=(quote:string,polarity:string)=>({subject:{system:"FIXTURE",value:"gut-microbial-metabolites",label:"Gut microbial metabolites"},predicate:"associated_with",object:{system:"FIXTURE",value:"immune-signalling",label:"Immune signalling"},polarity,quote});
const EXTRACTION:Record<string,unknown>={
 [G1]:{claim:claim("gut microbial metabolites were positively associated with immune signalling","supporting"),context:{species:{quote:"mouse"},tissueCompartment:{quote:"colonic"},cellType:{quote:"regulatory T cells"},timing:{quote:"after 7 days"},assay:{quote:"flow cytometry"},sampleSize:{quote:"n=10"},phenotype:{status:"not_reported",reason:"none"}},note:null},
 [G2]:{claim:claim("gut microbial metabolites were not associated with immune signalling","opposing"),context:{species:{quote:"human"},tissueCompartment:{quote:"circulating"},cellType:{quote:"monocytes"},assay:{quote:"ELISA"},sampleSize:{quote:"n=40"},timing:{status:"not_reported",reason:"none"},phenotype:{status:"not_reported",reason:"none"}},note:null},
};
const SPAN:Record<string,string>={[G1]:"gut microbial metabolites were positively associated with immune signalling",[G2]:"gut microbial metabolites were not associated with immune signalling"};
const QUESTION="How might gut microbial metabolites influence immune signalling?";
const xml=(p:string)=>`<article><body><sec><title>Results</title><p>${p}</p></sec></body></article>`;

// Network router: live search and full text are answered here; evidence lookups are replayed from the demo scenarios.
const scenarioFor=(n:number)=>DEMO_SCENARIOS[n-1]!;
function router(opts:{supportScenario?:number;opposeScenario?:number}={}){
 const log:string[]=[];
 const f=(async(input:unknown,init?:unknown)=>{
  const url=String(input);log.push(url);
  if(url.includes("/europepmc/webservices/rest/search")){
   const q=decodeURIComponent(new URL(url).searchParams.get("query")??"");
   const m=/PMCID:PMC900000(\d)/.exec(q);
   if(m)return demoFetcher(scenarioFor(Number(m[1])))(input as never,init as never);
   const oppose=q.includes("no association");
   return new Response(JSON.stringify({resultList:{result:[{pmcid:oppose?"PMC9000002":"PMC9000001",isOpenAccess:"Y",title:"Synthetic",pmid:oppose?"90000002":"90000001",doi:oppose?"10.9999/synthetic.002":"10.9999/synthetic.001"}]}}));
  }
  if(url.includes("/fullTextXML")){const id=/rest\/(PMC\d+)\/fullTextXML/.exec(url)?.[1];return new Response(xml(id==="PMC9000001"?G1:G2),{headers:{"content-type":"application/xml"}})}
  if(url.startsWith("https://api.crossref.org/works/")){const n=Number(/synthetic\.00(\d)/.exec(decodeURIComponent(url))?.[1]);return demoFetcher(scenarioFor(n))(input as never,init as never)}
  return new Response("",{status:404});
 }) as never;
 return {f,log};
}
const dep=(id:string,model:string)=>({deploymentId:id,providerId:"anthropic",modelId:model,endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:20000,maxResponseBytes:60000,termsRef:"terms:m",sourcePolicyRef:"policy:public-oa-v1",maxOutputTokens:1024,budgetUnits:100000,credentialEnv:"HSI_KEY_PROVIDER",anthropicVersion:"2023-06-01"});
const dirs:string[]=[];
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});

async function setup(net:ReturnType<typeof router>,over:Record<string,unknown>={}){
 const d=mkdtempSync(join(tmpdir(),"hsi-wire-"));chmodSync(d,0o700);dirs.push(d);
 const approver=generateKeyPairSync("ed25519"),signerKeys=generateKeyPairSync("ed25519");
 const store=await openStagingOperationStore(join(d,"ops.jsonl")),publisher=createFileReceiptPublisher(join(d,"published"));
 const signer=createInProcessSigner({issuer:"demo:integrity-service",keyId:"demo-signer",privateKey:signerKeys.privateKey});
 const config={environment:"isolated_staging",limits:{maxArticlesPerIntent:2,maxHitsPerIntent:4,maxModelCallsPerRun:40,maxRunsPerDay:5,killSwitchEnv:"HSI_KILL"},extractor:dep("ext","m-ext"),verifiers:[dep("va","m-a"),dep("vb","m-b")]} as never;
 const built=buildLiveRunDeps({config,integrityConfig:{requestedUses:["storage","display","comparison","export","model_transmission"]},env:{HSI_KEY_PROVIDER:"SECRET-PROVIDER-KEY"},
  policy:buildDemoPolicy({now:NOW,privateKey:approver.privateKey}),policyAuthorities:[demoAuthority(approver.publicKey)],signer,signerPublicKey:signerKeys.publicKey,
  approvalAuthorities:[{issuer:"approver:sec",keyId:"k",publicKey:approver.publicKey}],resolveApproval:async()=>{throw Error("no approval")},isApprovalRevoked:async()=>true,
  fetcher:net.f,store,publisher,auditDirectory:join(d,"audit"),runsToday:()=>0,sleep:async()=>{},now:()=>NOW,
  target:{investigationId:"wired-1",diseaseScope:"gut-immune-metabolic",question:QUESTION,release:{id:"r",version:"1",manifestHash:"0".repeat(64)}},...over});
 return {...built,store,d,publisher};
}
const mockOps=(sent:string[])=>({run:async(i:{task?:string;payload:{passage:string}})=>{sent.push(i.payload.passage);const p=i.payload.passage;return {result:i.task==="extraction"?EXTRACTION[p]:{verdict:"supports",evidenceSpan:SPAN[p],reason:"The passage states this directly."}}}}) as never;

test("the full chain interlocks: evidence -> signed receipt -> verified clearance -> live search -> audit, with only cleared passages reaching a model",async()=>{
 const net=router(),sent:string[]=[],w=await setup(net);
 try{
  const out=await composeLiveRun({...w.deps,ops:mockOps(sent)});
  expect(out.audit.units.length).toBe(2);expect(out.modelCalls).toBe(6);expect(new Set(sent)).toEqual(new Set([G1,G2]));
  expect(out.audit.graphPromotable).toBe(false);expect(out.audit.scientificApproval).toBe(false);
  const decisions=w.store.read().filter(e=>e.type==="source_decision");expect(decisions.length).toBeGreaterThan(0);expect(decisions.every(e=>e.state==="cleared")).toBe(true);
  expect(w.store.read().some(e=>e.type==="source_receipt")).toBe(true);
  expect(net.log.every(u=>["www.ebi.ac.uk","api.crossref.org"].includes(new URL(u).hostname))).toBe(true);
 }finally{await w.store.close()}
});
test("a restricted source is never cleared, so no passage from it reaches a model",async()=>{
 const net=router({}),sent:string[]=[];
 // PMC9000003 is the demo's publisher-restricted record
 const restricted=((input:unknown,init?:unknown)=>{const url=String(input);if(url.includes("OPEN_ACCESS")||url.includes("no+association")||url.includes("no%20association"))return Promise.resolve(new Response(JSON.stringify({resultList:{result:[{pmcid:"PMC9000003",isOpenAccess:"Y",title:"t",pmid:"90000003",doi:"10.9999/synthetic.003"}]}})));
  if(url.includes("/fullTextXML"))return Promise.resolve(new Response(xml(G1),{headers:{"content-type":"application/xml"}}));return (net.f as never as (a:unknown,b:unknown)=>Promise<Response>)(input,init)}) as never;
 const w=await setup({f:restricted,log:[]});
 try{
  const out=await composeLiveRun({...w.deps,ops:mockOps(sent)});
  expect(sent).toEqual([]);expect(out.audit.units.length).toBe(0);expect(out.modelCalls).toBe(0);
  const states=w.store.read().filter(e=>e.type==='source_decision').map(e=>e.state);
  expect(states.length).toBeGreaterThan(0);expect(states).not.toContain('cleared'); // it was actually evaluated and refused, not silently skipped
 }finally{await w.store.close()}
});
test("building the dependencies sends nothing, makes no network call and never echoes the credential",async()=>{
 const net=router(),w=await setup(net);
 try{expect(net.log).toEqual([]);expect(JSON.stringify(Object.keys(w.deps))).not.toContain("SECRET");expect(JSON.stringify(w.deps.config)).not.toContain("SECRET-PROVIDER-KEY")}finally{await w.store.close()}
});
test("deployments that disagree on a provider's credential variable are refused at build time",async()=>{
 const net=router();
 const cfg={environment:"isolated_staging",limits:{maxArticlesPerIntent:2,maxHitsPerIntent:4,maxModelCallsPerRun:40,maxRunsPerDay:5,killSwitchEnv:"HSI_KILL"},extractor:dep("ext","m-ext"),verifiers:[{...dep("va","m-a"),credentialEnv:"HSI_OTHER_KEY"},dep("vb","m-b")]} as never;
 await expect(setup(net,{config:cfg})).rejects.toThrow("one credential variable");
});
