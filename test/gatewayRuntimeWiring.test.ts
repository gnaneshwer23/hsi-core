import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createFileIdempotencyStore,createToolAuditLog,createToolGateway,defaultToolCatalogue} from "../src/governedToolGateway";
import {runHsiAgentOrchestration,type HsiAgentExecutor,type HsiAgentTask} from "../src/hsiAgentOrchestrator";
import {createFileCheckpointStore} from "../src/fileCheckpointStore";
import {hashHsiCheckpointInput,recoverHsiCheckpoint} from "../src/hsiAgentDurableCheckpoint";
import {checkpointHsiExecutor,continueHsiCheckpointedExecution} from "../src/hsiCheckpointedExecutor";
import type {HsiAgentManifest} from "../src/hsiAgentIntelligenceContracts";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-wire-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const manifest=(over:Partial<HsiAgentManifest>={}):HsiAgentManifest=>({schemaVersion:"hsi-agent-manifest-1",role:"evidence_retriever",version:"1.0.0",inputSchemaId:"in-1",outputSchemaId:"out-1",promptVersion:"p-1",modelVersion:"m-1",allowedTools:["literature.search"],maxToolCalls:3,maxQuestions:4,maxDepth:2,timeoutMs:20_000,dataClasses:["public_biomedical"],...over});
const release={id:"rel-1",version:"1.0.0",manifestHash:"a".repeat(64)};
const task=(id="retrieve",over:Partial<HsiAgentManifest>={}):HsiAgentTask=>({id,manifest:manifest(over),dependsOn:[]});
const epmc=()=>new Response(JSON.stringify({resultList:{result:[{id:"42",source:"MED",pmid:"42",title:"A title",doi:"10.1/x",pubYear:"2020"}]}}),{status:200});
const call={terms:["IL-21"],limit:5};
const done:()=>Awaited<ReturnType<HsiAgentExecutor>>=()=>({status:"completed",outputRef:"out://brief-1",reason:null});
const run=(o:Partial<Parameters<typeof runHsiAgentOrchestration>[0]>&{executors:Parameters<typeof runHsiAgentOrchestration>[0]["executors"]})=>runHsiAgentOrchestration({investigationId:"inv-wire",tasks:[task()],graphRelease:release,dataClass:"public_biomedical",...o});

test("an executor reaches a provider only through callTool, and the run records a receipt",async()=>{
 let fetches=0;const audit=createToolAuditLog();
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit,fetcher:(async()=>{fetches++;return epmc()}) as never});
 const r=await run({toolGateway:gw,executors:{evidence_retriever:async ctx=>{const t=await ctx.callTool!("literature.search",call);expect(t.ok&&t.untrusted).toBe(true);return done()}}});
 expect(r.status).toBe("completed");expect(fetches).toBe(1);
 expect(r.gatewayCalls).toHaveLength(1);expect(r.gatewayCalls![0]).toMatchObject({taskId:"retrieve",tool:"literature.search",ok:true,replayed:false,code:null});
 expect(r.gatewayCalls![0]!.invocationId).toMatch(/^h-[a-f0-9]{40}$/);
 expect(r.limitations.join(" ")).toContain("gateway audit log");
 expect(audit.records()).toHaveLength(1);expect(audit.verify().ok).toBe(true);
});
test("with no gateway configured callTool refuses and the task does not complete; nothing is fetched",async()=>{
 let fetches=0;
 const r=await run({executors:{evidence_retriever:async ctx=>{await ctx.callTool!("literature.search",call);fetches++;return done()}}});
 expect(r.status).not.toBe("completed");expect(fetches).toBe(0);expect(r.gatewayCalls).toBeUndefined();
});
test("a tool the role may not use is denied by the existing policy before the gateway is reached",async()=>{
 let fetches=0;const audit=createToolAuditLog();
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit,fetcher:(async()=>{fetches++;return epmc()}) as never});
 const r=await run({toolGateway:gw,executors:{evidence_retriever:async ctx=>{await ctx.callTool!("brief.export",{});return done()}}});
 expect(r.status).toBe("failed");expect(r.termination?.reason).toBeDefined();
 expect(fetches).toBe(0);expect(audit.records()).toHaveLength(0);expect(r.runs[0]!.toolCalls[0]!.status).toBe("denied");
});
test("each task has its own call budget (one task using its calls does not starve another)",async()=>{
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),fetcher:(async()=>epmc()) as never});
 const r=await run({tasks:[task("t-one",{maxToolCalls:1}),task("t-two",{maxToolCalls:1})],toolGateway:gw,
  executors:{evidence_retriever:async ctx=>{const t=await ctx.callTool!("literature.search",{terms:["x-"+ctx.taskId]});expect(t.ok).toBe(true);return done()}}});
 expect(r.status).toBe("completed");expect(r.gatewayCalls!.map(c=>c.ok)).toEqual([true,true]);
});
test("a task's gateway refusal reaches the executor as data; the run does not crash",async()=>{
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),fetcher:(async()=>new Response("bad",{status:400})) as never,sleep:async()=>{}});
 let seen="";
 const r=await run({toolGateway:gw,executors:{evidence_retriever:async ctx=>{const t=await ctx.callTool!("literature.search",call);seen=t.ok?"ok":t.code;return {status:"blocked",outputRef:null,reason:"provider unavailable"}}}});
 expect(seen).toBe("upstream_error");expect(r.status).toBe("blocked");expect(r.gatewayCalls![0]).toMatchObject({ok:false,code:"upstream_error"});
});

test("DEMONSTRATION: interrupt after a committed tool call, restart, recover, and the call is not repeated",async()=>{
 const root=mkd();let fetches=0;
 const fetcher=(async()=>{fetches++;return epmc()}) as never;
 // Everything a process needs is rebuilt from disk, as after a restart.
 const boot=()=>({
  audit:createToolAuditLog({directory:join(root,"audit")}),
  store:createFileCheckpointStore(join(root,"checkpoints")),
  gw:undefined as unknown as ReturnType<typeof createToolGateway>,
 });
 const mkGateway=(b:ReturnType<typeof boot>)=>createToolGateway({tools:defaultToolCatalogue(),audit:b.audit,idempotency:createFileIdempotencyStore(join(root,"idempotency")),fetcher,sleep:async()=>{}});
 const inputHash=hashHsiCheckpointInput({question:"IL-21 and Tfh"});

 // Attempt 1: the tool call commits, then the run is interrupted before the step finishes.
 const p1=boot();p1.gw=mkGateway(p1);const ctl=new AbortController();
 const first:HsiAgentExecutor=async ctx=>{const t=await ctx.callTool!("literature.search",call);expect(t.ok).toBe(true);ctl.abort();throw Error("interrupted")};
 const r1=await run({toolGateway:p1.gw,signal:ctl.signal,executors:{evidence_retriever:checkpointHsiExecutor({store:p1.store,inputHash,executor:first})}});
 expect(["cancelled","failed"]).toContain(r1.status);expect(fetches).toBe(1);
 const failed=await p1.store.read("inv-wire","retrieve");expect(failed).toMatchObject({state:"failed",attempt:1});
 const firstReceipt=r1.gatewayCalls![0]!;expect(firstReceipt).toMatchObject({ok:true,replayed:false});

 // Restart: new objects over the same directories. A human authorises recovery; completed work is never replayed.
 const p2=boot();p2.gw=mkGateway(p2);
 const recovered=await recoverHsiCheckpoint({store:p2.store,investigationId:"inv-wire",taskId:"retrieve",inputHash,approvedBy:"user:reviewer-1",recoveryReason:"interrupted run",startedAt:new Date().toISOString()});
 expect(recovered).toMatchObject({state:"running",attempt:2});
 const second:HsiAgentExecutor=async ctx=>{const t=await ctx.callTool!("literature.search",call);expect(t.ok&&t.replayed).toBe(true);return done()};
 const r2=await run({toolGateway:p2.gw,executors:{evidence_retriever:continueHsiCheckpointedExecution({store:p2.store,checkpoint:recovered,inputHash,executor:second})}});

 expect(r2.status).toBe("completed");
 expect(fetches).toBe(1); // the provider was contacted once across both attempts
 expect(r2.gatewayCalls![0]).toMatchObject({ok:true,replayed:true,invocationId:firstReceipt.invocationId,responseHash:firstReceipt.responseHash});
 expect(await p2.store.read("inv-wire","retrieve")).toMatchObject({state:"completed",attempt:2,outputRef:"out://brief-1"});
 const records=createToolAuditLog({directory:join(root,"audit")}).records();
 expect(records.map(x=>x.outcome)).toEqual(["success","replayed"]);
 expect(createToolAuditLog({directory:join(root,"audit")}).verify().ok).toBe(true);
});
test("DEMONSTRATION: without the durable idempotency store a restart would repeat the call (the control matters)",async()=>{
 let fetches=0;const fetcher=(async()=>{fetches++;return epmc()}) as never;
 const exec:HsiAgentExecutor=async ctx=>{await ctx.callTool!("literature.search",call);return done()};
 for(let i=0;i<2;i++){ // each loop is a "restart" with the default in-memory store
  const gw=createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),fetcher});
  await run({toolGateway:gw,executors:{evidence_retriever:exec}});
 }
 expect(fetches).toBe(2);
});
