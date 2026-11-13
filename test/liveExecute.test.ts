import {afterAll,expect,test} from "bun:test";
import {chmodSync,existsSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {generateKeyPairSync} from "node:crypto";
import {FIRST_RUN_LIMITS,runLiveExecute,type ExecuteIo,type ExecuteOptions} from "../src/liveExecute";
import {buildDemoPolicy} from "../src/sourceIntegrityDemo";
import type {LiveRunDeps} from "../src/liveRun";

const dirs:string[]=[];const dir=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-exec-"));chmodSync(d,0o700);dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const NOW=Date.parse("2026-11-13T12:00:00Z");
const dep=(id:string,model:string)=>({deploymentId:id,providerId:"anthropic",modelId:model,endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:20000,maxResponseBytes:60000,termsRef:"terms:m",sourcePolicyRef:"demo-policy:v1",maxOutputTokens:1024,budgetUnits:100000,credentialEnv:"HSI_KEY_PROVIDER",anthropicVersion:"2023-06-01"});

function world(over:{config?:(c:any)=>void}={}){
 const d=dir(),approver=generateKeyPairSync("ed25519"),approvalKey=generateKeyPairSync("ed25519");
 const pem=(k:ReturnType<typeof generateKeyPairSync>)=>(k.publicKey as import("node:crypto").KeyObject).export({type:"spki",format:"pem"}).toString();
 writeFileSync(join(d,"policy.json"),JSON.stringify(buildDemoPolicy({now:NOW,privateKey:approver.privateKey})));
 const config:any={environment:"isolated_staging",sourcePolicy:{ownerRef:"owner:sp",termsRef:"terms:epmc",policyRef:"demo-policy:v1",allowedHosts:["www.ebi.ac.uk"]},sourceAuthority:{issuer:"authority:independent",keyIds:["key-1"]},
  deploymentApproval:{issuer:"approver:sec",keyId:"k",publicKeyEnv:"HSI_APPROVAL_KEY"},extractor:dep("ext","m-ext"),verifiers:[dep("va","m-a"),dep("vb","m-b")],
  limits:{maxArticlesPerIntent:2,maxHitsPerIntent:4,maxModelCallsPerRun:30,maxRunsPerDay:5,killSwitchEnv:"HSI_KILL"},
  review:{normalizerReviewRef:"review:n",questionReviewRef:"review:q",extractionTaskReviewRef:"review:e"},operationStore:{path:join(d,"ops.jsonl")}};
 over.config?.(config);
 const integrity={policyFile:join(d,"policy.json"),policyApprovalRef:"approval:x",policyApprover:{issuer:"demo:policy-approver",keyId:"demo-key",publicKeyEnv:"HSI_POLICY_KEY"},signer:{serviceRef:"gcpkms:r/c",issuer:"demo:integrity-service",keyId:"demo-signer",keyVersionName:"v",publicKeyEnv:"HSI_SIGNER_KEY"},requestedUses:["storage","display","comparison","export","model_transmission"]};
 const files:Record<string,unknown>={"config.json":config,"integrity.json":integrity};
 const env={HSI_POLICY_KEY:pem(approver),HSI_APPROVAL_KEY:pem(approvalKey),HSI_SIGNER_KEY:pem(generateKeyPairSync("ed25519")),HSI_KEY_PROVIDER:"SECRET-PROVIDER-KEY"};
 const opts:ExecuteOptions={configPath:"config.json",integrityConfigPath:"integrity.json",question:"How might gut microbial metabolites influence immune signalling?",scope:"gut-immune-metabolic",reviewer:"user:scientist-1",outDir:join(d,"out")};
 return {d,opts,files,env};
}
const fakeAudit=(over:Record<string,unknown>={})=>({schemaVersion:"hsi-context-conflict-audit-1",id:"context-audit-x",auditHash:"a".repeat(64),investigationId:"j",diseaseScope:"gut-immune-metabolic",question:"q",release:{id:"r",version:"1",manifestHash:"0".repeat(64)},version:1,parentAuditHash:null,searches:[],units:[],comparisons:[],report:[],gaps:[],blockedReason:null,verifier:{status:"not_executed",receiptId:null},humanReview:{status:"required"},consensusEstablished:false,scientificApproval:false,graphPromotable:false,...over});
function io(w:ReturnType<typeof world>,over:Partial<ExecuteIo>&{typed?:string|null}={}):ExecuteIo&{loads:{n:number}}{
 const loads={n:0},{typed,...rest}=over;
 const base:ExecuteIo={env:w.env,now:()=>NOW,
  readJson:(p:string)=>{if(!(p in w.files))throw Error("missing");return w.files[p]},
  confirm:async(prompt:string)=>{const id=/EXECUTE (live-[a-f0-9]{16})/.exec(prompt)?.[1];return typed===undefined?`EXECUTE ${id}`:typed},
  loadDeps:async(ctx:Parameters<ExecuteIo["loadDeps"]>[0])=>{loads.n++;const deps:LiveRunDeps={config:ctx.config,integrityConfig:ctx.integrityConfig,env:ctx.env,target:ctx.target,auditDirectory:ctx.auditDirectory,fetcher:(async()=>new Response("",{status:500})) as never,clearance:{decide:async()=>{throw Error("none")}},ops:{run:async()=>{throw Error("none")}} as never,runsToday:ctx.runsToday};return {deps,close:async()=>{}}}};
 return {loads,...base,...rest};
}

test("refuses without a named human reviewer, a valid scope or a sensible question, before reading anything",async()=>{
 const w=world();
 for(const bad of [{reviewer:"scientist"},{reviewer:"system:bot"},{scope:"nonsense"},{question:"hi"}]){
  const r=await runLiveExecute({...w.opts,...bad},io(w));expect(r.ok).toBe(false);
 }
});
test("an unready environment is refused with the open preflight items, and nothing is loaded or run",async()=>{
 const w=world();const i=io(w,{env:{} as never});
 const r=await runLiveExecute(w.opts,i);expect(r.ok).toBe(false);expect(!r.ok&&r.refusals[0]).toContain("preflight is not ready");expect(i.loads.n).toBe(0);
});
test("first-run caps: more than 40 model calls or 3 articles per intent is refused",async()=>{
 const big=world({config:c=>{c.limits.maxModelCallsPerRun=FIRST_RUN_LIMITS.maxModelCallsPerRun+1}});
 const r=await runLiveExecute(big.opts,io(big));expect(r.ok).toBe(false);expect(!r.ok&&r.refusals.join()).toContain("first-run caps");
 const wide=world({config:c=>{c.limits.maxArticlesPerIntent=4}});
 expect((await runLiveExecute(wide.opts,io(wide))).ok).toBe(false);
});
test("no interactive terminal, or a wrong confirmation, runs nothing",async()=>{
 const w=world();
 const a=io(w,{typed:null});expect((await runLiveExecute(w.opts,a)).ok).toBe(false);expect(a.loads.n).toBe(0);
 const b=io(w,{typed:"EXECUTE live-0000000000000000"});const r=await runLiveExecute(w.opts,b);expect(r.ok).toBe(false);expect(!r.ok&&r.refusals[0]).toContain("confirmation did not match");expect(b.loads.n).toBe(0);
 const c=io(w,{typed:"yes"});expect((await runLiveExecute(w.opts,c)).ok).toBe(false);expect(c.loads.n).toBe(0);
});
test("with everything passing, a refusal from the run gates (kill switch) is reported and no output is written",async()=>{
 const w=world();const i=io(w,{env:{...w.env,HSI_KILL:"1"}});
 const r=await runLiveExecute(w.opts,i);expect(r.ok).toBe(false);expect(i.loads.n).toBe(0); // preflight already refuses an engaged kill switch
 expect(existsSync(join(w.opts.outDir,"live-x"))).toBe(false);
});
test("a confirmed run loads deps once, is a durable job, writes a brief and an unapproved packet naming the reviewer, and is not re-run",async()=>{
 const w=world(),i=io(w);
 // The injected deps cannot reach any source (HTTP 500, no clearance), so the real composition yields an audit with no units.
 // That is the point: no source means no passage, no model call and no claim, and the job still completes and is recorded.
 const r=await runLiveExecute(w.opts,i);
 expect(r.ok).toBe(true);if(!r.ok)return;
 expect(i.loads.n).toBe(1);expect(r.job).toBe("completed");expect(r.outputDir).not.toBeNull();
 const packet=JSON.parse(readFileSync(join(r.outputDir!,"review-packet.json"),"utf8"));
 expect(packet.scientificApproval).toBe(false);expect(packet.graphPromotable).toBe(false);expect(packet.units).toEqual([]);
 const brief=readFileSync(join(r.outputDir!,"brief.md"),"utf8");expect(brief).toContain("user:scientist-1");expect(brief).toContain("Not approved, not promotable");
 expect(brief).not.toContain("SECRET-PROVIDER-KEY");
 const again=await runLiveExecute(w.opts,io(w));expect(again.ok&&again.job).toBe("already_completed");
});
