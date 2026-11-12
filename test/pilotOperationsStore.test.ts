import {test,expect} from "bun:test";
import {openPilotOperationsStore,opsHash} from "../src/operations/pilotOperationsStore";
import {opsFixture,TEST_POLICY,ALICE,BOB,OTHER,plan,receipt} from "./fixtures/pilotOperations";
import {join} from "node:path";
test("durable defaults stay off; idempotent accepted jobs and scoped reads persist across connections",()=>{
 const f=opsFixture();let second:ReturnType<typeof openPilotOperationsStore>|undefined;try{
 expect(()=>f.store.enqueue(ALICE,"request-1",plan())).toThrow("disabled");f.enable();expect(()=>f.store.enqueue({...ALICE,secret:"TEST_SECRET"} as typeof ALICE,"bad-actor",plan())).toThrow("Trusted");expect(()=>f.store.enqueue(ALICE,"bad-plan",{...plan(),prompt:"TEST_SECRET"} as ReturnType<typeof plan>)).toThrow("Invalid");const a=f.store.enqueue(ALICE,"request-1",plan());second=openPilotOperationsStore(f.file,TEST_POLICY,f.now);expect(second.enqueue(ALICE,"request-1",plan()).created).toBe(false);expect(second.get(ALICE,a.job.id).id).toBe(a.job.id);
 for(const actor of [BOB,OTHER])expect(()=>second!.get(actor,a.job.id)).toThrow("unavailable");const changed=plan();changed.configurationHash=opsHash("other");expect(()=>second!.enqueue(ALICE,"request-1",changed)).toThrow("conflict");expect(()=>openPilotOperationsStore(f.file,{...TEST_POLICY,userJobs:10},f.now)).toThrow("policy");
 }finally{second?.close();f.close()}
});
test("shared per-user/organization quotas and route admission cannot be reset by a second connection",()=>{
 const f=opsFixture();let s:ReturnType<typeof openPilotOperationsStore>|undefined;try{f.enable();s=openPilotOperationsStore(f.file,TEST_POLICY,f.now);
 for(let n=0;n<3;n++)(n%2?s:f.store).enqueue(ALICE,"request-"+n,plan());expect(()=>s!.enqueue(ALICE,"extra",plan())).toThrow("quota");s.enqueue(BOB,"bob",plan());expect(()=>f.store.enqueue(BOB,"bob-extra",plan())).toThrow("quota");
 expect(f.store.admitRoute("research_read").allowed).toBe(true);expect(s.admitRoute("research_read").allowed).toBe(true);expect(f.store.admitRoute("research_read").allowed).toBe(true);expect(s.admitRoute("research_read").allowed).toBe(false);
 }finally{s?.close();f.close()}
});
test("expired in-flight work blocks replay, rejects stale fences and reconciles without a second charge",()=>{
 const f=opsFixture();let second:ReturnType<typeof openPilotOperationsStore>|undefined;try{f.enable();const {job}=f.store.enqueue(ALICE,"idempotent",plan()),lease=f.store.claim("worker-a",1000)!,action=f.store.begin(lease)!;f.advance(1001);second=openPilotOperationsStore(f.file,TEST_POLICY,f.now);expect(second.claim("worker-b",1000)).toBeNull();expect(second.get(ALICE,job.id).state).toBe("blocked");expect(()=>f.store.settle(lease,0,receipt(action.operationId))).toThrow("lease");
 second.reconcile(job.id,0,receipt(action.operationId),"TEST-independent-reconciliation");const next=second.claim("worker-b",1000)!;expect(second.begin(next)).toBeNull();expect(second.get(ALICE,job.id)).toMatchObject({state:"awaiting_review",reservedTokens:20,reservedCostMicros:100});expect(second.trace(job.id).some(t=>t.payload.type==="completion_reconciled_without_dispatch")).toBe(true);
 }finally{second?.close();f.close()}
});
test("only independently verified zero-usage retries reuse a reservation; exceeded bounds dead-letter",()=>{
 const f=opsFixture();try{f.enable();const {job}=f.store.enqueue(ALICE,"retry",plan());const a=f.store.claim("w")!,step=f.store.begin(a)!;f.store.settle(a,0,receipt(step.operationId,{outcome:"retry_safe",inputTokens:0,outputTokens:0,costMicros:0,outputRef:null,outputHash:null,errorCode:"provider_unavailable"}));const b=f.store.claim("w")!,next=f.store.begin(b)!;expect(next.attempt).toBe(2);expect(next.operationId).toBe(step.operationId);expect(f.store.get(ALICE,job.id).reservedCostMicros).toBe(100);
 f.store.settle(b,0,receipt(next.operationId,{outputTokens:11}));expect(f.store.get(ALICE,job.id).state).toBe("dead_letter");expect(f.store.alerts()[0]!.kind).toBe("budget_breach");
 }finally{f.close()}
});
test("organization token cap and live provider kill switch prevent new dispatch reservations",()=>{
 const f=opsFixture({...TEST_POLICY,organizationTokens:30});try{f.enable();f.store.enqueue(ALICE,"one",plan(1));f.store.enqueue(BOB,"two",plan(1));const a=f.store.claim("w")!,action=f.store.begin(a)!;f.store.settle(a,0,receipt(action.operationId));const finalize=f.store.claim("w")!;f.store.begin(finalize);const second=f.store.claim("w")!;expect(f.store.begin(second)).toBeNull();expect(f.store.alerts().some(a=>a.kind==="budget_breach")).toBe(true);
 const g=opsFixture();try{g.enable();g.store.enqueue(ALICE,"killed",plan());const lease=g.store.claim("w")!;g.store.setSwitches({jobsEnabled:true,providersEnabled:false,writesEnabled:false},"TEST-kill");expect(()=>g.store.begin(lease)).toThrow("disabled")}finally{g.close()}
 }finally{f.close()}
});
test("backup restore retains checkpoints, quotas and immutable decisions; restored work never silently replays",()=>{
 const f=opsFixture();let restored:ReturnType<typeof openPilotOperationsStore>|undefined;try{f.enable();const {job}=f.store.enqueue(ALICE,"backup",plan()),lease=f.store.claim("w")!,action=f.store.begin(lease)!;f.store.settle(lease,0,receipt(action.operationId));f.store.begin(f.store.claim("w")!);f.store.recordDecision(ALICE,job.id,receipt(action.operationId).outputHash!,"TEST-decision","TEST-review-receipt");f.store.recordDecision(ALICE,job.id,receipt(action.operationId).outputHash!,"TEST-decision","TEST-review-receipt");expect(()=>f.store.recordDecision(ALICE,job.id,opsHash("different"),"TEST-other","TEST-review-receipt")).toThrow("Immutable");const path=join(f.directory,"restored.sqlite"),backup=f.store.backup(path);expect(backup.sha256).toHaveLength(64);restored=openPilotOperationsStore(path,TEST_POLICY,f.now);expect(restored.get(ALICE,job.id).state).toBe("completed");expect(restored.switches()).toMatchObject({jobsEnabled:false,providersEnabled:false,writesEnabled:false});expect(()=>restored!.setSwitches({jobsEnabled:true,providersEnabled:true,writesEnabled:false},"TEST-unreconciled")).toThrow("recovery reconciliation");expect(restored.enqueue(ALICE,"backup",plan()).created).toBe(false);expect(restored.claim("w")).toBeNull();expect(backup.scope).toBe("operations_coordinator_only_not_neon_or_vault");
 }finally{restored?.close();f.close()}
});
test("actual worker process termination preserves a started checkpoint and fences restart replay",async()=>{
 const f=opsFixture();let child:ReturnType<typeof Bun.spawn>|undefined;try{f.enable();const {job}=f.store.enqueue(ALICE,"crash",plan());
 const code=`import {openPilotOperationsStore} from './src/operations/pilotOperationsStore';const s=openPilotOperationsStore(process.argv[1],JSON.parse(process.argv[2]),()=>Number(process.argv[3]));s.begin(s.claim('crashed-worker',1000));console.log('READY');setInterval(()=>{},1000);`;
 child=Bun.spawn([process.execPath,"--eval",code,f.file,JSON.stringify(TEST_POLICY),String(f.now())],{cwd:import.meta.dir+"/..",stdout:"pipe",stderr:"pipe"});const stream=child.stdout;if(!stream||typeof stream==="number")throw Error("Piped child output required");const reader=stream.getReader(),ready=await reader.read();expect(new TextDecoder().decode(ready.value)).toContain("READY");reader.releaseLock();child.kill("SIGKILL");await child.exited;f.advance(1001);expect(f.store.claim("restarted-worker",1000)).toBeNull();expect(f.store.get(ALICE,job.id)).toMatchObject({state:"blocked",reservedTokens:20,reservedCostMicros:100});expect(f.store.steps(job.id)[0]!.state).toBe("unknown");
 }finally{child?.kill();f.close()}
});
