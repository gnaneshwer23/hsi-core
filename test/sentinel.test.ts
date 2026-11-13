import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createSentinel,StaleClearanceError} from "../src/sentinel";

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
