import {test,expect} from "bun:test";
import {createContextConflictAuditRunner,validateContextConflictAudit,renderContextConflictAudit,type ContextConflictAudit,type ContextAuditTarget,type ContextAuditSearch} from "../src/evidence/contextConflictAudit";
import {contextUnit,fixtureHash} from "./fixtures/contextConflictAudit";
const target:ContextAuditTarget={investigationId:"synthetic-investigation",diseaseScope:"ssc",question:"What context explains the marker association?",release:{id:"synthetic-release",version:"1",manifestHash:fixtureHash("release")}};
function harness(options:{denied?:boolean;empty?:boolean;failOppose?:boolean;revokeAfterExtraction?:boolean;alterExtraction?:boolean}={}){
 const fixtures=[contextUnit("a"),contextUnit("b")],stored:ContextConflictAudit[]=[];let calls=0,authorizations=0,verifications=0;
 const runner=createContextConflictAuditRunner({enabled:true,
  search:async(_t,intent)=>{if(intent==="oppose"&&options.failOppose)throw Error("fixture outage");const f=fixtures[intent==="support"?0:1]!;return {intent,status:options.empty?"successful_empty":"completed_bounded",queriedAt:"2026-11-12T12:00:00Z",queryHash:fixtureHash(intent),sourceIds:options.empty?[]:[f.source.id],hits:options.empty?[]:[{id:f.unit.id,source:f.source,passage:f.passage,clearanceReceiptId:f.unit.detailedContext!.clearanceReceiptId}]} satisfies ContextAuditSearch},
  authorizePassage:async(_hit,actions)=>{authorizations++;expect(actions).toEqual(["storage","display","comparison","export"]);return !options.denied&&!(options.revokeAfterExtraction&&calls>0)},
  extract:async hit=>{expect(authorizations).toBeGreaterThanOrEqual(options.failOppose?1:2);calls++;const unit=structuredClone(fixtures.find(f=>f.source.id===hit.source.id)!.unit);if(options.alterExtraction)unit.detailedContext!.passageText+="changed";return unit},
  verify:async()=>{verifications++;return {status:"checked_with_limitations",receiptId:"synthetic-verifier-receipt"}},
  append:async(a,previous)=>{expect(previous).toBe(stored.at(-1)?.auditHash??null);stored.push(structuredClone(a))},
 });return {runner,stored,counts:()=>({calls,verifications})};
}
test("bounded support and oppose audit retains immutable versions and reproducible JSON/Markdown",async()=>{
 const f=harness(),first=await f.runner.run(target);validateContextConflictAudit(first);
 expect(first.report[0]!.classification).toBe("potential_conflict");expect(first.humanReview.status).toBe("required");expect(first.scientificApproval).toBe(false);expect(first.graphPromotable).toBe(false);
 const second=await f.runner.run(target,first);expect(second.version).toBe(2);expect(second.parentAuditHash).toBe(first.auditHash);expect(second.auditHash).not.toBe(first.auditHash);expect(f.stored[0]).toEqual(first);
 expect(JSON.parse(renderContextConflictAudit(second,"json")).auditHash).toBe(second.auditHash);const md=renderContextConflictAudit(second,"markdown");expect(md).toContain("normalized:");expect(md).toContain(first.units[0]!.detailedContext!.passageSha256);
 await expect(f.runner.run({...target,investigationId:"another"},first)).rejects.toThrow("target");
});
test("whole batch denial prevents extraction and verifier calls, and keeps passage text out of artifact",async()=>{
 const f=harness({denied:true}),audit=await f.runner.run(target);expect(f.counts()).toEqual({calls:0,verifications:0});expect(audit.units).toEqual([]);expect(audit.blockedReason).toBeTruthy();expect(JSON.stringify(audit)).not.toContain("primary human cell culture");
});
test("empty and failed searches remain explicit gaps, never consensus",async()=>{
 for(const options of [{empty:true},{failOppose:true}]){const f=harness(options),audit=await f.runner.run(target);expect(audit.consensusEstablished).toBe(false);expect(audit.gaps.length).toBeGreaterThan(0);expect(audit.report).toEqual([]);expect(audit.searches[1]!.status).toBe(options.empty?"successful_empty":"provider_unavailable")}
});
test("changed passage and revoked source prevent storage",async()=>{
 for(const options of [{alterExtraction:true},{revokeAfterExtraction:true}]){const f=harness(options);await expect(f.runner.run(target)).rejects.toThrow();expect(f.stored).toEqual([])}
});
test("cancelled and default-disabled execution never dispatch search",async()=>{
 let calls=0;const deps={search:async()=>{calls++;throw Error()},authorizePassage:async()=>true,extract:async()=>{throw Error()},verify:async()=>({status:"not_executed" as const,receiptId:null}),append:async()=>{}};
 await expect(createContextConflictAuditRunner(deps).run(target)).rejects.toThrow("disabled");const c=new AbortController();c.abort();await expect(createContextConflictAuditRunner({...deps,enabled:true}).run(target,undefined,c.signal)).rejects.toThrow("cancelled");expect(calls).toBe(0);
});
test("deadline fences a non-cooperative search before extraction or append",async()=>{
 let writes=0,extractions=0;const runner=createContextConflictAuditRunner({enabled:true,timeoutMs:1000,search:async()=>new Promise<ContextAuditSearch>(()=>{}),authorizePassage:async()=>true,extract:async()=>{extractions++;throw Error()},verify:async()=>({status:"not_executed",receiptId:null}),append:async()=>{writes++}});
 await expect(runner.run(target)).rejects.toThrow();expect(writes).toBe(0);expect(extractions).toBe(0);
});
test("atomic append contract rejects concurrent attempts to overwrite a version",async()=>{
 const f=harness(),first=await f.runner.run(target),results=await Promise.allSettled([f.runner.run(target,first),f.runner.run(target,first)]);expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);expect(results.filter(r=>r.status==="rejected")).toHaveLength(1);expect(f.stored.map(a=>a.version)).toEqual([1,2]);
});
test("malformed later hit is rejected before any clearance/extraction callback",async()=>{
 const f=contextUnit("a");let calls=0;const runner=createContextConflictAuditRunner({enabled:true,
 search:async(_target,intent)=>({intent,status:"completed_bounded",queriedAt:"2026-11-12T12:00:00Z",queryHash:fixtureHash(intent),sourceIds:[f.source.id],hits:[{id:"hit-"+intent,source:f.source,passage:intent==="support"?f.passage:{...f.passage,text:f.passage.text+"tampered"},clearanceReceiptId:"synthetic-clearance"}]}),
 authorizePassage:async()=>{calls++;return true},extract:async()=>{calls++;return f.unit},verify:async()=>{calls++;return {status:"not_executed",receiptId:null}},append:async()=>{calls++}});
 await expect(runner.run(target)).rejects.toThrow();expect(calls).toBe(0);
});
