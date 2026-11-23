import {afterAll,expect,test} from "bun:test";
import {mkdirSync,mkdtempSync,readdirSync,rmSync,writeFileSync,utimesSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createFileLimitStore,createMemoryLimitStore,type GatewayLimitStore} from "../src/gatewayLimitStore";
import {createFileIdempotencyStore,createToolAuditLog,createToolGateway,defaultToolCatalogue,type ToolRequest} from "../src/governedToolGateway";
import {runHsiAgentOrchestration} from "../src/hsiAgentOrchestrator";
import type {HsiAgentManifest} from "../src/hsiAgentIntelligenceContracts";

const dirs:string[]=[];const mkd=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-lim-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});

for(const [name,mk] of [["memory",()=>createMemoryLimitStore()],["file",()=>createFileLimitStore(mkd())]] as const){
 test(`${name} store: a budget is spent atomically and a refused call counts nothing`,async()=>{
  const s=mk();
  expect([await s.consumeBudget("a",2),await s.consumeBudget("a",2),await s.consumeBudget("a",2),await s.consumeBudget("a",2)]).toEqual([true,true,false,false]);
  expect(await s.consumeBudget("b",2)).toBe(true); // keys are independent
  expect(await s.consumeBudget("zero",0)).toBe(false);
 });
 test(`${name} store: a sliding rate window refuses at the limit and frees as time passes`,async()=>{
  const s=mk();
  expect([await s.consumeRate("p",2,1_000,60_000),await s.consumeRate("p",2,2_000,60_000),await s.consumeRate("p",2,3_000,60_000)]).toEqual([true,true,false]);
  expect(await s.consumeRate("p",2,61_500,60_000)).toBe(true); // the first stamp has left the window
  expect(await s.consumeRate("other",2,3_000,60_000)).toBe(true);
 });
}

test("file store: a budget and a rate window survive a restart",async()=>{
 const d=mkd();const a=createFileLimitStore(d);
 await a.consumeBudget("task",2);await a.consumeBudget("task",2);await a.consumeRate("p",2,1_000,60_000);await a.consumeRate("p",2,1_100,60_000);
 const b=createFileLimitStore(d); // restarted process
 expect(await b.consumeBudget("task",2)).toBe(false);
 expect(await b.consumeRate("p",2,1_200,60_000)).toBe(false);
});
test("file store: separate processes racing one budget and one rate window never exceed the limit",async()=>{
 const d=mkd();
 const script=`import {createFileLimitStore} from ${JSON.stringify(join(import.meta.dir,"../src/gatewayLimitStore"))};
  const s=createFileLimitStore(process.argv[2]!);const out:boolean[][]=[[],[]];
  for(let i=0;i<3;i++){out[0]!.push(await s.consumeBudget("race",4));out[1]!.push(await s.consumeRate("race",5,1000,60000))}
  console.log(JSON.stringify(out));`;
 const f=join(d,"race.ts");writeFileSync(f,script);
 const procs=Array.from({length:6},()=>Bun.spawn(["bun",f,d],{stdout:"pipe",stderr:"pipe"}));
 const outs=await Promise.all(procs.map(async p=>{const o=await new Response(p.stdout).text();await p.exited;return JSON.parse(o) as boolean[][]}));
 expect(outs.flatMap(o=>o[0]!).filter(Boolean)).toHaveLength(4);
 expect(outs.flatMap(o=>o[1]!).filter(Boolean)).toHaveLength(5);
},30_000);
test("file store fails closed: corrupt counters throw, a live lock times out, a stale lock is reclaimed",async()=>{
 const d=mkd();const s=createFileLimitStore(d,{timeoutMs:60,staleMs:1_000});
 await s.consumeBudget("k",5);
 const bf=join(d,"budgets",readdirSync(join(d,"budgets")).find(f=>f.endsWith(".json"))!);
 writeFileSync(bf,"{ not json");await expect(s.consumeBudget("k",5)).rejects.toThrow();
 writeFileSync(bf,JSON.stringify({count:-3}));await expect(s.consumeBudget("k",5)).rejects.toThrow("corrupt");
 writeFileSync(bf,JSON.stringify({count:1}));
 const lock=bf+".lock";mkdirSync(lock);
 await expect(s.consumeBudget("k",5)).rejects.toThrow("lock timeout");
 const old=new Date(Date.now()-5_000);utimesSync(lock,old,old);
 expect(await s.consumeBudget("k",5)).toBe(true);
 const rf=join(d,"rates",readdirSync(join(d,"rates"))[0]??"x");void rf;
 await s.consumeRate("r",3,1_000,60_000);
 const f2=join(d,"rates",readdirSync(join(d,"rates")).find(f=>f.endsWith(".json"))!);
 writeFileSync(f2,JSON.stringify({t:["x"]}));await expect(s.consumeRate("r",3,2_000,60_000)).rejects.toThrow("corrupt");
});
test("file store keeps hostile keys inside its directory",async()=>{
 const root=mkd(),d=join(root,"limits");const s=createFileLimitStore(d);
 await s.consumeBudget("../../etc/passwd\u0000x",3);await s.consumeRate("../../../x",3,1,1000);
 expect(readdirSync(root)).toEqual(["limits"]);
 expect(readdirSync(join(d,"budgets")).every(f=>/^[a-f0-9]{40}\.json$/.test(f))).toBe(true);
});

// ---- through the gateway ----
const manifest=(over:Partial<HsiAgentManifest>={}):HsiAgentManifest=>({schemaVersion:"hsi-agent-manifest-1",role:"evidence_retriever",version:"1.0.0",inputSchemaId:"in-1",outputSchemaId:"out-1",promptVersion:"p-1",modelVersion:"m-1",allowedTools:["literature.search"],maxToolCalls:2,maxQuestions:4,maxDepth:2,timeoutMs:20_000,dataClasses:["public_biomedical"],...over});
const epmc=()=>new Response(JSON.stringify({resultList:{result:[{id:"1",source:"MED",pmid:"1",title:"t",doi:"10.1/x",pubYear:"2020"}]}}),{status:200});
let n=0;const req=(terms:string[],over:Partial<ToolRequest>={}):ToolRequest=>({manifest:manifest(),investigationId:"inv-l",taskId:"task-l",invocationId:"call-l-"+(++n).toString().padStart(4,"0"),tool:"literature.search",input:{terms},...over});

test("gateway: a restarted gateway continues the same task budget; replays stay free",async()=>{
 const root=mkd();let fetches=0;const fetcher=(async()=>{fetches++;return epmc()}) as never;
 const boot=()=>createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),fetcher,idempotency:createFileIdempotencyStore(join(root,"idem")),limits:createFileLimitStore(join(root,"limits"))});
 const a=boot();
 expect((await a.call(req(["one"],{invocationId:"call-fixed-1"}))).ok).toBe(true);
 expect((await a.call(req(["two"]))).ok).toBe(true);
 const b=boot(); // restart: the budget of 2 is already spent
 const third=await b.call(req(["three"]));expect(third.ok?"":third.code).toBe("budget_exhausted");
 const replay=await b.call(req(["one"],{invocationId:"call-fixed-1"}));
 expect(replay.ok&&replay.replayed).toBe(true);expect(fetches).toBe(2);
 expect((await b.call(req(["x"],{investigationId:"inv-other"}))).ok).toBe(true); // other investigations are unaffected
});
test("gateway: a rate-limited call does not spend the task budget",async()=>{
 const limits=createMemoryLimitStore();let t=1_000_000;
 const tool={...defaultToolCatalogue()[0]!,ratePerMinute:1};
 const gw=createToolGateway({tools:[tool],audit:createToolAuditLog(),fetcher:(async()=>epmc()) as never,limits,now:()=>t});
 expect((await gw.call(req(["a"]))).ok).toBe(true);
 const limited=await gw.call(req(["b"]));expect(limited.ok?"":limited.code).toBe("rate_limited");
 t+=61_000; // window clears; the budget (2) was spent once, not twice
 expect((await gw.call(req(["c"]))).ok).toBe(true);
 const over=await gw.call(req(["d"]));expect(over.ok?"":over.code).toBe("rate_limited"); // rate again, not budget
 t+=61_000;const last=await gw.call(req(["e"]));expect(last.ok?"":last.code).toBe("budget_exhausted");
});
test("gateway fails closed when the limit store fails: the call is refused and nothing is fetched",async()=>{
 let fetches=0;
 const broken:GatewayLimitStore={consumeBudget:async()=>{throw Error("disk full")},consumeRate:async()=>true};
 const gw=createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog(),fetcher:(async()=>{fetches++;return epmc()}) as never,limits:broken});
 const r=await gw.call(req(["x"]));expect(r.ok).toBe(false);if(!r.ok){expect(r.code).toBe("internal_error");expect(r.message).not.toContain("disk")}
 expect(fetches).toBe(0);
});
test("DEMONSTRATION: a recovered attempt that makes different calls draws on the same persisted budget",async()=>{
 const root=mkd();let fetches=0;const fetcher=(async()=>{fetches++;return epmc()}) as never;
 const boot=()=>createToolGateway({tools:defaultToolCatalogue(),audit:createToolAuditLog({directory:join(root,"audit")}),fetcher,idempotency:createFileIdempotencyStore(join(root,"idem")),limits:createFileLimitStore(join(root,"limits"))});
 const run=(gw:ReturnType<typeof boot>,calls:string[][],seen:string[])=>runHsiAgentOrchestration({investigationId:"inv-d",tasks:[{id:"t1",manifest:manifest({maxToolCalls:3}),dependsOn:[]}],graphRelease:{id:"r",version:"1.0.0",manifestHash:"a".repeat(64)},dataClass:"public_biomedical",toolGateway:gw,
  executors:{evidence_retriever:async ctx=>{for(const c of calls){const r=await ctx.callTool!("literature.search",{terms:c});seen.push(r.ok?(r.replayed?"replayed":"ok"):r.code)}return {status:"completed",outputRef:"out://x",reason:null}}}});
 const first:string[]=[];await run(boot(),[["a"],["b"]],first); // two of three units spent
 expect(first).toEqual(["ok","ok"]);
 // Restart. The same calls replay for free. Different calls (a non-deterministic executor) draw on what is left: one unit.
 const same:string[]=[];await run(boot(),[["a"],["b"]],same);expect(same).toEqual(["replayed","replayed"]);
 const different:string[]=[];await run(boot(),[["x"],["y"]],different);
 expect(different).toEqual(["ok","budget_exhausted"]);
 expect(fetches).toBe(3); // a, b, x. Never a fresh allowance, never a repeated call.
});
