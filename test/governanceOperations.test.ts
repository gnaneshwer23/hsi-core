import {test,expect} from "bun:test";
import {runHsiAgentOrchestration,type HsiAgentExecutor} from "../src/hsiAgentOrchestrator";
import {validateHsiAgentRunEnvelope,type HsiAgentManifest,type HsiAgentRunEnvelope} from "../src/hsiAgentIntelligenceContracts";
import {withResearchRequestControls,createResearchProcessAdmission} from "../src/server/researchRequestControls";
import {verifyHsiReviewerAuthority,reviewerScopeForDisease} from "../src/db/reviewerAuthority";
import {persistIsiScientificReview} from "../src/db/isiScientificReviewStore";
import {checkpointHsiExecutor} from "../src/hsiCheckpointedExecutor";
import type {HsiCheckpointStore,HsiDurableCheckpoint} from "../src/hsiAgentDurableCheckpoint";
import {readFileSync} from "node:fs";

function manifest():HsiAgentManifest{return {schemaVersion:"hsi-agent-manifest-1",role:"graph_reasoner",version:"1.0.0",inputSchemaId:"input",outputSchemaId:"output",promptVersion:"none",modelVersion:"deterministic",allowedTools:["graph.query"],maxToolCalls:1,maxQuestions:1,maxDepth:1,timeoutMs:1000,dataClasses:["public_biomedical"]};}
const release={id:"ssc-release",version:"1.0.0",manifestHash:"a".repeat(64)};
function run(executor:HsiAgentExecutor,m=manifest(),signal?:AbortSignal){return runHsiAgentOrchestration({investigationId:"ops-test",tasks:[{id:"graph",manifest:m,dependsOn:[]}],graphRelease:release,dataClass:"public_biomedical",executors:{graph_reasoner:executor},signal});}

test("caught permission denial cannot produce a completed stage",async()=>{
 const r=await run(async c=>{try{c.assertTool("patient.context.get")}catch{}return {status:"completed",outputRef:"unsafe",reason:null}});
 expect(r.status).toBe("failed");expect(r.results.graph?.outputRef).toBeNull();
});
test("caught tool-budget violation cannot produce a completed stage",async()=>{
 const r=await run(async c=>{c.assertTool("graph.query");try{c.assertTool("graph.query")}catch{}return {status:"completed",outputRef:"unsafe",reason:null}});
 expect(r.status).toBe("failed");expect(r.results.graph?.outputRef).toBeNull();
});
test("caught denial cannot commit a completed durable checkpoint",async()=>{
 let checkpoint:HsiDurableCheckpoint|null=null,finished:(c:HsiDurableCheckpoint)=>void=()=>{};
 const terminal=new Promise<HsiDurableCheckpoint>(resolve=>{finished=resolve});
 const store:HsiCheckpointStore={read:async()=>checkpoint,compareAndSwap:async(expected,next)=>{
  if((checkpoint?.version??null)!==expected)return false;
  checkpoint=structuredClone(next);if(next.state!=="running")finished(checkpoint);return true;
 }};
 const executor=checkpointHsiExecutor({store,inputHash:"b".repeat(64),executor:async c=>{
  try{c.assertTool("patient.context.get")}catch{}return {status:"completed",outputRef:"unsafe",reason:null};
 }});
 expect((await run(executor)).status).toBe("failed");expect((await terminal).state).toBe("failed");
});
test("dependent executor cannot mutate a prior stage's recorded output",async()=>{
 const m=manifest();
 const r=await runHsiAgentOrchestration({investigationId:"ops-deps",tasks:[{id:"first",manifest:m,dependsOn:[]},{id:"second",manifest:m,dependsOn:["first"]}],graphRelease:release,dataClass:"public_biomedical",executors:{graph_reasoner:async c=>{
  if(c.taskId==="second")(c.dependencies.first as {outputRef:string}).outputRef="tampered";
  return {status:"completed",outputRef:c.taskId,reason:null};
 }}});
 expect(r.results.first?.outputRef).toBe("first");
});
test("executor cannot expand its validated manifest through caller mutation",async()=>{
 const m=manifest();
 const r=await run(async c=>{(m.allowedTools as string[]).push("evidence.get");c.assertTool("evidence.get");return {status:"completed",outputRef:"unsafe",reason:null}},m);
 expect(r.status).toBe("failed");expect(r.runs[0]?.manifest.allowedTools).toEqual(["graph.query"]);
});
test("permission receipts explicitly describe authorization, not external tool completion",async()=>{
 const r=await run(async c=>{c.assertTool("graph.query");return {status:"completed",outputRef:"fixture",reason:null}});
 expect(r.runs[0]?.toolCalls[0]?.status as string).toBe("authorized");
 expect((r.runs[0] as unknown as {toolCallEvidence:string}).toolCallEvidence).toBe("authorization_checks_only");
});
test("late callbacks cannot alter a completed trace",async()=>{
 let late:()=>void=()=>{};
 const r=await run(async c=>{late=()=>c.assertTool("graph.query");return {status:"completed",outputRef:"fixture",reason:null}});
 const before=JSON.stringify(r);
 expect(late).toThrow();expect(JSON.stringify(r)).toBe(before);
});
test("upstream cancellation settles promptly even if executor ignores its signal",async()=>{
 const abort=new AbortController();let started:()=>void=()=>{};
 const ready=new Promise<void>(resolve=>{started=resolve});
 const pending=run(async()=>{started();return new Promise(()=>{})},manifest(),abort.signal);
 await ready;abort.abort();
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  const result=await Promise.race([pending,new Promise<null>(resolve=>{timer=setTimeout(()=>resolve(null),150)})]);
  expect(result?.status).toBe("cancelled");
 }finally{clearTimeout(timer)}
});
function envelope():HsiAgentRunEnvelope{return {schemaVersion:"hsi-agent-run-1",investigationId:"ops-test",runId:"run",manifest:manifest(),graphRelease:release,dataClass:"public_biomedical",status:"completed",toolCalls:[{tool:"graph.query",invocationId:"call-1",status:"success"}],startedAt:"2026-11-11T12:00:00Z",completedAt:"2026-11-11T12:00:01Z"};}
test("trace validator rejects fabricated schema/status, duplicate calls and reversed time",()=>{
 const e=envelope();
 for(const bad of [{...e,schemaVersion:"fabricated"},{...e,toolCalls:[{...e.toolCalls[0],status:"fabricated"}]},{...e,manifest:{...e.manifest,maxToolCalls:2},toolCalls:[e.toolCalls[0],e.toolCalls[0]]},{...e,completedAt:"2026-11-11T11:59:59Z"},{...e,completedAt:null}])expect(()=>validateHsiAgentRunEnvelope(bad as HsiAgentRunEnvelope)).toThrow();
});
test("reviewer scope is mandatory and unsupported scopes fail before database access",async()=>{
 for(const scope of [undefined,"immunology","*"]){
  const r=await verifyHsiReviewerAuthority({principal:"test-reviewer",reviewedAt:"2026-11-11T12:00:00Z",databaseUrl:"not-a-database",scope} as Parameters<typeof verifyHsiReviewerAuthority>[0]);
  expect(r).toBe(false);
 }
});
test("disease scope has no fallback to another disease grant",()=>{
 expect(reviewerScopeForDisease("systemic_sclerosis")).toBe("ssc");
 expect(reviewerScopeForDisease("rheumatoid_arthritis")).toBe("ra");
 for(const disease of ["sle","immunology","*",null,undefined])expect(reviewerScopeForDisease(disease)).toBeNull();
});
test("generic ISI review cannot infer subject membership or scope from an SSc role",async()=>{
 const input={event:{releaseHash:"a".repeat(64),subjectId:"claim1",decision:"approved" as const,reviewerPrincipal:"reviewer",submittedBy:"author",sourceLocator:"synthetic",rationale:"test only"},subjectKind:"claim" as const,sessionToken:null,databaseUrl:"must-not-connect"};
 await expect(persistIsiScientificReview(input)).rejects.toThrow("scope binding");
 await expect(persistIsiScientificReview(input,{resolveReviewScope:async()=>null})).rejects.toThrow("scope binding");
 await expect(persistIsiScientificReview(input,{resolveReviewScope:async()=>{throw Error("private details")}})).rejects.toThrow("Trusted review scope unavailable");
});
test("oversized requests never consume shared admission/provider work",async()=>{
 let admission=0,handler=0;
 const r=await withResearchRequestControls(new Request("https://hsi.example/api/research/account?x="+"x".repeat(8300)),async()=>{handler++;return Response.json({})},{processAdmission:createResearchProcessAdmission(),sharedAdmission:async()=>{admission++;return {allowed:true,retryAfterSeconds:0}}});
 expect(r.status).toBe(414);expect(admission).toBe(0);expect(handler).toBe(0);
});
test("shared admission signal is closed after a successful check",async()=>{
 let signal:AbortSignal|undefined;
 await withResearchRequestControls(new Request("https://hsi.example/api/research/account"),async()=>Response.json({}),{processAdmission:createResearchProcessAdmission(),sharedAdmission:async(_group,s)=>{signal=s;return {allowed:true,retryAfterSeconds:0}}});
 expect(signal?.aborted).toBe(true);
});
test("shared admission validates the same result snapshot that controls dispatch",async()=>{
 let reads=0,calls=0;
 const r=await withResearchRequestControls(new Request("https://hsi.example/api/research/account"),async()=>{calls++;return Response.json({})},{processAdmission:createResearchProcessAdmission(),sharedAdmission:async()=>({get allowed(){return ++reads!==1},retryAfterSeconds:23})});
 expect(r.status).toBe(429);expect(calls).toBe(0);expect(reads).toBe(1);
});
test("secret scan workflow covers ordinary source changes, not only register edits",()=>{
 const workflow=readFileSync(".github/workflows/p0-repository-hygiene.yml","utf8");
 const trigger=workflow.slice(workflow.indexOf("on:"),workflow.indexOf("permissions:"));
 expect(trigger).not.toContain("paths:");expect(trigger).toContain("pull_request:");expect(trigger).toContain("branches: [main]");
 expect(workflow).toContain("--log-opts=--all");
});
test("CI retains pilot engineering receipts and does not relabel browser fixtures as live acceptance",()=>{
 const workflow=readFileSync(".github/workflows/research-foundation.yml","utf8");
 expect(workflow).toContain("name: pilot-engineering-evidence");
 expect(workflow).toContain("path: /tmp/hsi-pilot-engineering-report.json");
 expect(workflow).toContain("Build local site and API (does not deploy)");
 expect(workflow).toContain("Test local browser contracts (no live DB/provider acceptance)");
});
