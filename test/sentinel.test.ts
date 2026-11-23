import {afterAll,describe,expect,test} from "bun:test";
import {mkdtempSync,rmSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createSentinel,StaleClearanceError,assessSentinelHealth,type SentinelRecord} from "../src/sentinel";

const dirs:string[]=[];const dir=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-sent-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const MIN=60_000,H=60*MIN;
const svc=(r:{checked:number;revoked:{receiptId:string;sourceId:string;reasonCodes:string[]}[]}|Error)=>({reevaluate:async()=>{if(r instanceof Error)throw r;return r}});

test("a tick runs once per slot; a second tick in the same slot is a no-op",async()=>{
 let t=10*H;const s=createSentinel({service:svc({checked:3,revoked:[]}),directory:dir(),intervalMs:H,now:()=>t});
 const a=await s.tick();expect(a.ran).toBe(true);expect(await s.tick()).toEqual({ran:false,reason:"slot_taken"});
 t+=H;expect((await s.tick()).ran).toBe(true);
});
test("two sentinels on one directory cannot double-run a slot",async()=>{
 const d=dir();let n=0;const service={reevaluate:async()=>{n++;await new Promise(r=>setTimeout(r,15));return {checked:1,revoked:[]}}};
 const mk=()=>createSentinel({service,directory:d,intervalMs:H,now:()=>10*H});
 const [x,y]=await Promise.all([mk().tick(),mk().tick()]);expect([x.ran,y.ran].sort()).toEqual([false,true]);expect(n).toBe(1);
});
test("revocations are recorded with ids and reason codes only",async()=>{
 const d=dir();const s=createSentinel({service:svc({checked:2,revoked:[{receiptId:"r1",sourceId:"europepmc:PMC1",reasonCodes:["RETRACTED"]}]}),directory:d,intervalMs:H,now:()=>10*H});
 const r=await s.tick();expect(r.ran&&r.record.revoked?.[0]?.reasonCodes).toEqual(["RETRACTED"]);
 expect(readFileSync(join(d,"sentinel.jsonl"),"utf8")).toContain("RETRACTED");
});
test("a failed check is recorded and shows as overdue, never hidden",async()=>{
 let t=10*H;const s=createSentinel({service:svc(new Error("upstream secret detail")),directory:dir(),intervalMs:H,now:()=>t});
 const r=await s.tick();expect(r.ran&&r.record.outcome).toBe("failed");expect(r.ran&&JSON.stringify(r.record)).not.toContain("secret");
 const st=s.status();expect(st.overdue).toBe(true);expect(st.consecutiveFailures).toBe(1);expect(()=>s.assertFresh()).toThrow(StaleClearanceError);
});
test("kill switch skips the check visibly; freshness recovers after a successful tick and expires after two intervals",async()=>{
 let t=10*H,kill=true;const s=createSentinel({service:svc({checked:1,revoked:[]}),directory:dir(),intervalMs:H,killed:()=>kill,now:()=>t});
 expect((await s.tick()).ran&&s.status().lastOutcome).toBe("skipped_kill_switch");expect(s.status().overdue).toBe(true);
 t+=H;kill=false;await s.tick();expect(s.status().overdue).toBe(false);expect(()=>s.assertFresh()).not.toThrow();
 t+=2*H+1;expect(s.status().overdue).toBe(true);expect(()=>s.assertFresh()).toThrow(StaleClearanceError);
});
test("an unreadable kill switch fails closed; bad configuration is rejected",async()=>{
 const s=createSentinel({service:svc({checked:0,revoked:[]}),directory:dir(),intervalMs:H,killed:()=>{throw Error("x")},now:()=>10*H});
 expect((await s.tick()).ran&&s.status().lastOutcome).toBe("skipped_kill_switch");
 expect(()=>createSentinel({service:svc({checked:0,revoked:[]}),directory:dir(),intervalMs:1000})).toThrow();
});

describe("assessSentinelHealth",()=>{
 const T=1_000*H;
 const ok=(slot:number,checked=10,extra:Partial<SentinelRecord>={}):SentinelRecord=>({slot,at:new Date(slot*H).toISOString(),outcome:"ok",checked,revoked:[],...extra});
 const bad=(slot:number,errorCode="error"):SentinelRecord=>({slot,at:new Date(slot*H).toISOString(),outcome:"failed",errorCode});
 const codes=(r:SentinelRecord[],now=T)=>assessSentinelHealth(r,now,H).map(a=>a.code);
 test("healthy journal raises nothing",()=>{expect(codes([ok(995),ok(996),ok(997),ok(998),ok(999)])).toEqual([])});
 test("empty journal is critical, not healthy",()=>{expect(assessSentinelHealth([],T,H)[0]).toMatchObject({code:"no_successful_run",severity:"critical"})});
 test("a stale last success is overdue",()=>{expect(codes([ok(990)])).toContain("overdue")});
 test("failures escalate from warning to critical",()=>{
  const two=assessSentinelHealth([ok(997),bad(998),bad(999)],T,H).find(a=>a.code==="consecutive_failures");
  const three=assessSentinelHealth([ok(996),bad(997),bad(998),bad(999)],T,H).find(a=>a.code==="consecutive_failures");
  expect(two?.severity).toBe("warning");expect(three?.severity).toBe("critical");
  expect(codes([ok(998),bad(999)])).not.toContain("consecutive_failures");
 });
 test("repeated timeouts are flagged",()=>{expect(codes([ok(996),bad(997,"timeout"),ok(998),bad(999,"timeout")])).toContain("repeated_timeouts")});
 test("a skipped tick from the kill switch is visible",()=>{expect(codes([ok(998),{slot:999,at:new Date(999*H).toISOString(),outcome:"skipped_kill_switch"}])).toContain("kill_switch_active")});
 test("missing slots mean the scheduler stopped ticking",()=>{expect(codes([ok(990),ok(996),ok(999)])).toContain("missed_slots")});
 test("a sudden fall in sources checked is flagged as coverage drift",()=>{
  expect(codes([ok(994,20),ok(995,20),ok(996,22),ok(997,21),ok(998,20),ok(999,4)])).toContain("coverage_drop");
  expect(codes([ok(994,20),ok(995,20),ok(996,22),ok(997,21),ok(998,20),ok(999,18)])).not.toContain("coverage_drop");
 });
 test("revocations in the latest run are surfaced with a count only",()=>{
  const a=assessSentinelHealth([ok(998),ok(999,10,{revoked:[{receiptId:"r1",sourceId:"europepmc:PMC1",reasonCodes:["RETRACTED"]}]})],T,H).find(x=>x.code==="revocations_in_last_run");
  expect(a?.detail).toBe("1 clearance(s) revoked in the latest run");expect(JSON.stringify(a)).not.toContain("PMC1");
 });
 test("sentinel.health() reads its own journal",async()=>{
  let t=10*H;const s=createSentinel({service:svc(new Error("x")),directory:dir(),intervalMs:H,now:()=>t});
  expect(s.health().map(a=>a.code)).toContain("no_successful_run");
  await s.tick();t+=H;await s.tick();expect(s.health().map(a=>a.code)).toContain("consecutive_failures");
 });
});
