import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readFileSync} from "node:fs";
import {runCollectivePipeline} from "../src/collectivePipeline";
import {createSentinel} from "../src/sentinel";

const fixture=JSON.parse(readFileSync(new URL("../research/runner-fixtures/gut-immune-metabolic-crossdomain.v1.json",import.meta.url),"utf8"));
const dirs:string[]=[];const dir=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-pipe-"));dirs.push(d);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const opts=()=>({fixture,storeDirectory:dir(),jobDirectory:dir()});

test("one run chains audit, packet, proposals and gaps, all unapproved and non-promotable",async()=>{
 const r=await runCollectivePipeline(opts());
 expect(r.job.status).toBe("completed");expect(r.mode).toBe("fixture");
 expect(r.run!.audit.units.length).toBe(2);expect(r.packet!.auditHash).toBe(r.run!.audit.auditHash);
 expect(r.proposals!.proposals.length+r.proposals!.refused.length).toBe(2);expect(r.proposals!.proposals.every(p=>p.edge.review.state==="draft")).toBe(true);
 expect(r.vantage!.gaps.length).toBeGreaterThan(0);expect(r.helix).toBeNull();
 expect(r.graphPromotable).toBe(false);expect(r.scientificApproval).toBe(false);expect(r.packet!.flags.map(f=>f.code)).toContain("no_reviewer_authority");
});
test("a completed job is reported by hash and not re-run",async()=>{
 const o=opts();const a=await runCollectivePipeline(o),b=await runCollectivePipeline(o);
 expect(b.job).toEqual({status:"already_completed",auditHash:a.run!.audit.auditHash});expect(b.run).toBeNull();
});
test("kill switch and daily cap refuse before any work",async()=>{
 await expect(runCollectivePipeline({...opts(),killed:()=>true})).rejects.toThrow("kill_switch");
 await expect(runCollectivePipeline({...opts(),limits:{maxModelCalls:1,maxRunsPerDay:1,maxRequestsPerWindow:1,windowMs:1000},now:()=>1_000_000_000})).resolves.toBeDefined();
});
test("a daily cap of one refuses a second distinct run",async()=>{
 const o=opts(),limits={maxModelCalls:1,maxRunsPerDay:1,maxRequestsPerWindow:1,windowMs:1000};
 await runCollectivePipeline({...o,limits});
 await expect(runCollectivePipeline({...o,fixture:{...fixture,id:"other-fixture"},limits})).rejects.toThrow("daily_cap");
});
test("a stale SENTINEL refuses the run",async()=>{
 const sentinel=createSentinel({service:{reevaluate:async()=>({checked:0,revoked:[]})},directory:dir(),intervalMs:3_600_000});
 await expect(runCollectivePipeline({...opts(),sentinel})).rejects.toThrow("overdue");
 await sentinel.tick();
 expect((await runCollectivePipeline({...opts(),sentinel})).job.status).toBe("completed");
});
test("HELIX runs only when enabled, and its output is validated",async()=>{
 const o=opts();let called=0;
 const r=await runCollectivePipeline({...o,helix:{enabled:true,runner:async()=>{called++;return {candidates:[{statement:"This pairing may reflect a shared pathway.",citedUnitIds:["bogus"],kind:"hypothesised_mechanism"}]}}}});
 expect(called).toBe(1);expect(r.helix!.candidates).toEqual([]);expect(r.helix!.rejections[0]!.reason).toContain("not given");
});
