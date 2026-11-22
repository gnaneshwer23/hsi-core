import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createToolAuditLog,createToolGateway,verifyAuditChain,type ToolDefinition} from "../src/governedToolGateway";
import {createJobJournal} from "../src/nexusJobs";
import {drainJobs} from "../src/nexusWorker";
import {createLogger,currentCorrelation,newRequestId,runWithCorrelation,scrubField,traceIdFromHeaders} from "../src/observability";
import {createResearchProcessAdmission,researchOperationalLogger,withResearchRequestControls,type ResearchOperationalEvent} from "../src/server/researchRequestControls";
import type {HsiAgentManifest} from "../src/hsiAgentIntelligenceContracts";

const dirs:string[]=[];afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const TRACE="4bf92f3577b34da6a3ce929d0e0e4736",TP=`00-${TRACE}-00f067aa0ba902b7-01`;
const lines=():{sink:(l:string)=>void;out:Record<string,unknown>[];raw:string[]}=>{const raw:string[]=[];return {raw,sink:(l:string)=>{raw.push(l)},get out(){return raw.map((l:string)=>JSON.parse(l))}} as never};

/* ---------- correlation ---------- */
test("traceparent: a valid header yields its trace id; malformed, zero, uppercase and wrong-length ones yield nothing",()=>{
 const h=(v?:string)=>new Headers(v===undefined?{}:{traceparent:v});
 expect(traceIdFromHeaders(h(TP))).toBe(TRACE);
 for(const bad of [undefined,"",TP.toUpperCase(),`00-${"0".repeat(32)}-00f067aa0ba902b7-01`,`00-${TRACE}-${"0".repeat(16)}-01`,`01-${TRACE}-00f067aa0ba902b7-01`,`00-${TRACE.slice(1)}-00f067aa0ba902b7-01`,`00-${TRACE}-00f067aa0ba902b7`,"garbage",`00-${TRACE}-00f067aa0ba902b7-01 X: y`])expect(traceIdFromHeaders(h(bad))).toBeUndefined();
 expect(traceIdFromHeaders(null)).toBeUndefined();
});
test("correlation: visible across awaits and timers, absent outside, isolated between concurrent runs",async()=>{
 expect(currentCorrelation()).toBeNull();
 const seen=await Promise.all(["req-a","req-b","req-c"].map(id=>runWithCorrelation({requestId:id},async()=>{
  await new Promise(r=>setTimeout(r,Math.random()*10));const a=currentCorrelation()?.requestId;
  await Promise.resolve();return [a,currentCorrelation()?.requestId];
 })));
 expect(seen).toEqual([["req-a","req-a"],["req-b","req-b"],["req-c","req-c"]]);
 expect(currentCorrelation()).toBeNull();
});
test("correlation: an unsafe request id is replaced, never echoed; the stored context is immutable",()=>{
 for(const bad of ["a\nb","../x","x".repeat(200),"",undefined as never,"with space",'{"a":1}']){
  const id=runWithCorrelation({requestId:bad},()=>currentCorrelation()!.requestId);
  expect(id).not.toBe(bad);expect(id).toMatch(/^[0-9a-f-]{36}$/);
 }
 expect(runWithCorrelation({requestId:"ok-1",traceId:"nope"},()=>currentCorrelation()!.traceId)).toBeUndefined();
 runWithCorrelation({requestId:"ok-2"},()=>{expect(()=>{(currentCorrelation() as {requestId:string}).requestId="forged"}).toThrow();expect(currentCorrelation()!.requestId).toBe("ok-2")});
});

/* ---------- logger ---------- */
test("logger: fixed envelope, one JSON object per line, correlation attached automatically",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink,now:()=>Date.UTC(2026,10,22,12,0,0)});
 runWithCorrelation({requestId:"req-1",traceId:TRACE},()=>log.log("info","thing.happened",{count:3,ok:true,code:"X",none:null}));
 log.log("warn","outside.context",{a:1});
 expect(l.out[0]).toEqual({ts:"2026-11-22T12:00:00.000Z",level:"info",component:"unit.test",event:"thing.happened",requestId:"req-1",traceId:TRACE,count:3,ok:true,code:"X",none:null});
 expect(l.out[1]!.requestId).toBeUndefined();expect(l.raw.every(x=>!x.includes("\n"))).toBe(true);
});
test("logger: a field cannot overwrite the envelope or the correlation ids (log forging)",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink});
 runWithCorrelation({requestId:"real-id"},()=>log.log("info","x.event",{requestId:"forged",traceId:"forged",level:"debug",component:"evil",event:"evil.event",ts:"1999",note:"kept"}));
 const o=l.out[0]!;expect([o.requestId,o.level,o.component,o.event,o.traceId]).toEqual(["real-id","info","unit.test","x.event",undefined]);expect(o.ts).not.toBe("1999");expect(o.note).toBe("kept");
});
test("logger: newlines and control characters cannot split or forge a line",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink});
 log.log("info","x.event",{msg:'a\n{"level":"error","event":"forged"}\r\n\u0000‮'});
 expect(l.raw).toHaveLength(1);const o=l.out[0]!;expect(o.level).toBe("info");expect(String(o.msg)).not.toMatch(/[\n\r\u0000‮]/);
});
test("logger: secrets are redacted by key and by value, hashes and ordinary ids are kept",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink});
 const sha="a".repeat(64);
 log.log("info","x.event",{
  authorization:"Bearer abcdef0123456789",Cookie:"s=1",apiKey:"k",openalex_api_key:"k",password:"p",sessionId:"s",privateKey:"k",
  note1:"Authorization: Bearer abcdefghijklmnop",note2:"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop",note3:"postgres://user:hunter2@db.example.org/x",
  note4:"contact jane.doe@example.org please",note5:"key sk-abcdefghijklmnop1234 here",note6:"ghp_abcdefghijklmnop1234",
  requestHash:sha,toolId:"literature.search",code:"rate_limited",
 });
 const s=l.raw[0]!;
 for(const secret of ["abcdef0123456789","hunter2","jane.doe","sk-abcdefghijklmnop1234","ghp_abcdefghijklmnop1234","eyJhbGciOiJIUzI1NiJ9"])expect(s).not.toContain(secret);
 const o=l.out[0]!;expect(o.authorization).toBe("[redacted]");expect(o.password).toBe("[redacted]");expect(o.requestHash).toBe(sha);expect(o.toolId).toBe("literature.search");expect(o.code).toBe("rate_limited");
});
test("logger: objects, arrays and functions are dropped (not serialised), numbers are finite, strings and field count are capped",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink});
 const many:Record<string,unknown>={};for(let i=0;i<100;i++)many[`f${i}`]=i;
 log.log("info","x.event",{obj:{a:1},arr:[1],fn:()=>1,sym:Symbol("s"),big:10n,nan:Number.NaN,inf:Infinity,long:"x".repeat(5_000),und:undefined,...many});
 const o=l.out[0]!;
 for(const k of ["obj","arr","fn","sym","big","und"])expect(k in o).toBe(false);
 expect(o.nan).toBeNull();expect(o.inf).toBeNull();expect(String(o.long).length).toBeLessThanOrEqual(300);
 expect(Object.keys(o).length).toBeLessThanOrEqual(6+32);
 expect(scrubField("a",undefined)).toBeUndefined();
});
test("logger: bad event names are neutralised, a bad component throws, the level filter holds, a failing sink never throws",()=>{
 const l=lines();const log=createLogger({component:"unit.test",sink:l.sink,minLevel:"warn"});
 log.log("info","dropped.event");log.log("debug","dropped.event");log.log("warn","Not A Valid Event!\n");log.log("bogus" as never,"x.event");
 expect(l.out).toHaveLength(1);expect(l.out[0]!.event).toBe("invalid_event");
 expect(()=>createLogger({component:"Bad Name"})).toThrow();
 const boom=createLogger({component:"unit.test",sink:()=>{throw Error("sink down")}});
 expect(()=>boom.log("error","x.event",{a:1})).not.toThrow();
 expect(()=>boom.log("error","x.event",{get a():number{throw Error("getter")}})).not.toThrow();
});

/* ---------- HTTP request controls ---------- */
test("http: the handler sees the same request id the response header carries; a client-supplied id is never adopted",async()=>{
 const events:ResearchOperationalEvent[]=[];let inHandler:string|undefined;
 const res=await withResearchRequestControls(new Request("https://hsi.test/api/research/x",{headers:{"x-request-id":"client-chosen-forged"}}),async()=>{inHandler=currentCorrelation()?.requestId;return Response.json({ok:true})},{emit:e=>events.push(e)});
 const id=res.headers.get("X-Request-ID")!;
 expect(id).toMatch(/^[0-9a-f-]{36}$/);expect(inHandler).toBe(id);expect(events[0]!.requestId).toBe(id);expect(id).not.toContain("client");
});
test("http: a valid traceparent is carried into the handler and the event; an invalid one is ignored",async()=>{
 const events:ResearchOperationalEvent[]=[];let traceInHandler:string|undefined;
 await withResearchRequestControls(new Request("https://hsi.test/api/research/x",{headers:{traceparent:TP}}),async()=>{traceInHandler=currentCorrelation()?.traceId;return Response.json({})},{emit:e=>events.push(e)});
 await withResearchRequestControls(new Request("https://hsi.test/api/research/x",{headers:{traceparent:"bad"}}),async()=>Response.json({}),{emit:e=>events.push(e)});
 expect(traceInHandler).toBe(TRACE);expect(events[0]!.traceId).toBe(TRACE);expect(events[1]!.traceId).toBeUndefined();
});
const big=createResearchProcessAdmission({maxConcurrent:1000,budgets:{research_read:100000,other:100000}});
test("http: 30 concurrent requests each keep their own id inside the handler",async()=>{
 const pairs=await Promise.all(Array.from({length:30},async()=>{
  let seen="";const res=await withResearchRequestControls(new Request("https://hsi.test/api/research/x"),async()=>{await new Promise(r=>setTimeout(r,Math.random()*15));seen=currentCorrelation()!.requestId;return Response.json({})},{processAdmission:big});
  return [seen,res.headers.get("X-Request-ID")!];
 }));
 for(const [a,b] of pairs)expect(a).toBe(b);expect(new Set(pairs.map(p=>p[0])).size).toBe(30);
});
test("http: the operational logger emits one structured line for failures with the request id in the envelope and no body or identity",()=>{
 const out:string[]=[];const orig=console.error;console.error=(l:string)=>{out.push(l)};
 try{researchOperationalLogger(false)({schemaVersion:"hsi-research-http-event-1",requestId:"req-9",routeGroup:"research_read",method:"GET",status:503,durationMs:12,admission:"over_capacity",limiterScope:"process_only",traceId:TRACE})}finally{console.error=orig}
 const o=JSON.parse(out[0]!);expect(o).toMatchObject({level:"error",component:"research.http",event:"http.request",requestId:"req-9",traceId:TRACE,status:503,routeGroup:"research_read"});
});

/* ---------- gateway ---------- */
const manifest:HsiAgentManifest={schemaVersion:"hsi-agent-manifest-1",role:"evidence_retriever",version:"1.0.0",inputSchemaId:"i",outputSchemaId:"o",promptVersion:"p",modelVersion:"m",allowedTools:["literature.search"],maxToolCalls:5,maxQuestions:4,maxDepth:2,timeoutMs:20_000,dataClasses:["public_biomedical"]};
const tool:ToolDefinition={id:"literature.search",providerId:"obs-test",version:"1.0.0",dataClass:"public_biomedical",hosts:["api.example.org"],passageAccess:"metadata_only",timeoutMs:2_000,maxAttempts:1,maxResponseBytes:2_048,ratePerMinute:600,parseInput:v=>v,parseOutput:v=>v,execute:async()=>({title:"SECRET-OUTPUT-TEXT"})};
let k=0;const call=(gw:ReturnType<typeof createToolGateway>,input:unknown={q:"SECRET-INPUT-TEXT"})=>gw.call({manifest,investigationId:"inv-1",taskId:"t-1",invocationId:`call-obs-${++k}`,tool:"literature.search",input});
test("gateway: audit records carry the request and trace id inside a correlation, none outside, and the chain still verifies",async()=>{
 const audit=createToolAuditLog();const gw=createToolGateway({tools:[tool],audit,sleep:async()=>{}});
 await call(gw);
 await runWithCorrelation({requestId:"req-77",traceId:TRACE},()=>call(gw));
 const r=audit.records();
 expect(r[0]!.requestId).toBeUndefined();expect(r[1]).toMatchObject({requestId:"req-77",traceId:TRACE});
 expect(verifyAuditChain(r).ok).toBe(true);
 const forged=r.map(x=>({...x}));forged[1]!.requestId="req-other";expect(verifyAuditChain(forged).ok).toBe(false);
});
test("gateway: one log event per call (success, replay, refusal) holding codes, ids and hashes only: never input, output or a secret",async()=>{
 const l=lines();const logger=createLogger({component:"gateway",sink:l.sink});
 const audit=createToolAuditLog();const gw=createToolGateway({tools:[tool],audit,logger,sleep:async()=>{}});
 await runWithCorrelation({requestId:"req-5"},async()=>{
  await call(gw);
  await gw.call({manifest:{...manifest,allowedTools:[]},investigationId:"inv-1",taskId:"t-1",invocationId:"call-obs-denied",tool:"literature.search",input:{}});
 });
 expect(l.out).toHaveLength(2);
 expect(l.out[0]).toMatchObject({level:"info",event:"gateway.tool_call",outcome:"success",providerId:"obs-test",requestId:"req-5",auditSeq:1});
 expect(l.out[1]).toMatchObject({level:"warn",outcome:"refused",code:"permission_denied"});
 const all=l.raw.join("\n");expect(all).not.toContain("SECRET-INPUT-TEXT");expect(all).not.toContain("SECRET-OUTPUT-TEXT");
 expect(String(l.out[0]!.requestHash)).toMatch(/^[a-f0-9]{64}$/);
});
test("gateway: a logger that throws cannot change the result",async()=>{
 const logger=createLogger({component:"gateway",sink:()=>{throw Error("down")}});
 const gw=createToolGateway({tools:[tool],audit:createToolAuditLog(),logger,sleep:async()=>{}});
 expect((await call(gw)).ok).toBe(true);
});

/* ---------- worker ---------- */
test("worker: a job runs with a correlation id derived from its job id",async()=>{
 const d=mkdtempSync(join(tmpdir(),"hsi-obs-"));dirs.push(d);const j=createJobJournal(d);j.create("job-xyz");
 let seen:string|undefined;await drainJobs(j,async()=>{seen=currentCorrelation()?.requestId;return {auditHash:"b".repeat(64)}});
 expect(seen).toBe("job:job-xyz");
});
test("ids: generated request ids are unique",()=>{expect(new Set(Array.from({length:1_000},newRequestId)).size).toBe(1_000)});
