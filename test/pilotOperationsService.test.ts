import {test,expect} from "bun:test";
import {createPilotJobApi,createPilotWorker,coordinatorSharedAdmission,createSharedAdmissionClient,createSharedAdmissionHandler,recordVerifiedPilotReview,durableResearchHttpEmitter} from "../src/operations/pilotOperationsService";
import {withResearchRequestControls} from "../src/server/researchRequestControls";
import {opsFixture,ALICE,BOB,OTHER,plan,receipt} from "./fixtures/pilotOperations";
import {opsHash} from "../src/operations/pilotOperationsStore";
test("authenticated HTTP only acknowledges a persisted scoped job; never runs benchmark/provider in API",async()=>{
 const f=opsFixture();try{f.enable();let auth=true,executions=0;const api=createPilotJobApi({enabled:true,publicOrigin:"https://hsi.test",store:f.store,authenticate:async r=>r.headers.get("cookie")==="session=alice"?ALICE:r.headers.get("cookie")==="session=bob"?BOB:null,loadPlan:async()=>plan(),authorizeEnqueue:async()=>auth});
 const request=(value:unknown,cookie="session=alice",origin="https://hsi.test")=>new Request("https://hsi.test/api/research/jobs",{method:"POST",headers:{"content-type":"application/json",origin,cookie},body:JSON.stringify(value)}),body={investigationId:"TEST-investigation",planRef:"TEST-plan",idempotencyKey:"one"};
 const first=await api(request(body)),out=await first!.json();expect(first!.status).toBe(202);expect(out.execution).toBe("resumable_worker_only");expect((await api(request(body)))!.status).toBe(202);expect(f.store.trace(out.id).filter(e=>e.payload.type==="job_accepted")).toHaveLength(1);expect(executions).toBe(0);
 expect((await api(request({...body,actor:OTHER})))!.status).toBe(403);expect((await api(request(body,"session=alice","https://attacker.test")))!.status).toBe(403);expect((await api(request(body,"")))!.status).toBe(401);expect((await api(new Request("https://hsi.test/api/research/jobs/"+out.id,{headers:{cookie:"session=bob"}})))!.status).toBe(403);auth=false;expect((await api(request({...body,idempotencyKey:"two"})))!.status).toBe(403);
 }finally{f.close()}
});
test("worker checkpoints each operation and stops at independent human review",async()=>{
 const f=opsFixture();try{f.enable();const {job}=f.store.enqueue(ALICE,"workflow",plan(2));let calls=0;const worker=createPilotWorker({enabled:true,store:f.store,authorizeStep:async()=>true,execute:async task=>{calls++;return receipt(task.operationId)},verifyReceipt:async()=>true});await worker.tick();await worker.tick();await worker.tick();expect(calls).toBe(2);expect(f.store.get(ALICE,job.id).state).toBe("awaiting_review");
 await expect(recordVerifiedPilotReview(f.store,{actor:ALICE,jobId:job.id,artifactHash:JSON.parse(f.store.steps(job.id).at(-1)!.result!).outputHash,decisionId:"decision-1",receiptRef:"review-1"},async()=>false)).rejects.toThrow("Independent");await recordVerifiedPilotReview(f.store,{actor:ALICE,jobId:job.id,artifactHash:JSON.parse(f.store.steps(job.id).at(-1)!.result!).outputHash,decisionId:"decision-1",receiptRef:"review-1"},async()=>true);expect(f.store.get(ALICE,job.id).state).toBe("completed");expect(f.store.trace(job.id).at(-1)!.payload.graphPromotion).toBe(false);
 }finally{f.close()}
});
test("authorization denial causes zero dispatch; unknown completion blocks replay and records no raw error",async()=>{
 const f=opsFixture();try{f.enable();const {job}=f.store.enqueue(ALICE,"denied",plan());let calls=0;const denied=createPilotWorker({enabled:true,store:f.store,authorizeStep:async()=>false,execute:async task=>{calls++;return receipt(task.operationId)},verifyReceipt:async()=>true});expect((await denied.tick()).status).toBe("dead_letter_authorization_denied");expect(calls).toBe(0);expect(f.store.get(ALICE,job.id).state).toBe("dead_letter");
 const {job:other}=f.store.enqueue(ALICE,"unknown",plan()),unknown=createPilotWorker({enabled:true,store:f.store,authorizeStep:async()=>true,execute:async()=>{calls++;throw Error("SECRET_TEST_PASSAGE_MUST_NOT_LOG")},verifyReceipt:async()=>true});await unknown.tick();await unknown.tick();expect(calls).toBe(1);expect(f.store.get(ALICE,other.id).state).toBe("blocked");const trace=JSON.stringify(f.store.trace());expect(trace).not.toContain("SECRET_TEST_PASSAGE");expect(trace).toContain('"costMicros":null');
 }finally{f.close()}
});
test("shared admission propagates outage and bounds malicious responses; denied requests never reach API handler",async()=>{
 const f=opsFixture();try{const shared=coordinatorSharedAdmission(f.store);f.store.close();let calls=0;const response=await withResearchRequestControls(new Request("https://hsi.test/api/research/jobs"),async()=>{calls++;return new Response()},{requireShared:true,sharedAdmission:shared});expect(response.status).toBe(503);expect(calls).toBe(0);
 const client=createSharedAdmissionClient({endpoint:"https://coordinator.test/internal/admission",serviceCredential:()=>"TEST_ONLY_SECRET",transport:async(_url,init)=>{expect(init?.redirect).toBe("error");return new Response("x".repeat(513))}});await expect(client("research_read",new AbortController().signal)).rejects.toThrow("overflow");
 }finally{f.close()}
});
test("private coordinator authenticates service identity and request traces persist redacted correlation metadata",async()=>{
 const f=opsFixture();try{let trusted=false;const handler=createSharedAdmissionHandler(f.store,async()=>trusted),request=()=>new Request("https://coordinator.test/internal/admission",{method:"POST",body:JSON.stringify({group:"research_read"})});expect((await handler(request())).status).toBe(401);trusted=true;expect((await handler(request())).status).toBe(200);
 const response=await withResearchRequestControls(new Request("https://hsi.test/api/research/jobs/abc"),async()=>new Response(),{emit:durableResearchHttpEmitter(f.store)});const event=f.store.trace().at(-1)!.payload;expect(event.requestId).toBe(response.headers.get("x-request-id"));expect(event.type).toBe("http_request");expect(JSON.stringify(event)).not.toContain("/jobs/abc");
 }finally{f.close()}
});
test("active provider kill switch aborts in-flight work without claiming a refund or replay",async()=>{
 const f=opsFixture();try{f.enable();const {job}=f.store.enqueue(ALICE,"kill-active",plan());let calls=0;
 const worker=createPilotWorker({enabled:true,store:f.store,authorizeStep:async()=>true,execute:async(_task,signal)=>{calls++;f.store.setSwitches({jobsEnabled:true,providersEnabled:false,writesEnabled:false},"TEST-kill-receipt");return new Promise((_,reject)=>signal.addEventListener("abort",()=>reject(Error("TEST_ABORT")),{once:true}))},verifyReceipt:async()=>true});
 const result=await worker.tick();expect(result.status).toBe("blocked_completion_unknown");expect(calls).toBe(1);expect(f.store.get(ALICE,job.id)).toMatchObject({state:"blocked",reservedCostMicros:100});expect(JSON.parse(f.store.steps(job.id)[0]!.result!).costMicros).toBeNull();
 }finally{f.close()}
});
test("source-authority outage before dispatch retries a known zero-call checkpoint after recovery",async()=>{
 const f=opsFixture();try{f.enable();const {job}=f.store.enqueue(ALICE,"source-outage",plan());let checks=0,calls=0;
 const worker=createPilotWorker({enabled:true,store:f.store,authorizeStep:async()=>{if(++checks===1)throw Error("TEST_SOURCE_SERVICE_OUTAGE");return true},execute:async t=>{calls++;return receipt(t.operationId)},verifyReceipt:async()=>true});
 expect((await worker.tick()).status).toBe("queued");expect(calls).toBe(0);expect(f.store.alerts().some(a=>a.kind==="clearance_failed")).toBe(true);f.advance(1001);await worker.tick();expect(calls).toBe(1);expect(f.store.get(ALICE,job.id).reservedCostMicros).toBe(100);expect(f.store.steps(job.id)[0]!.attempt).toBe(2);
 }finally{f.close()}
});
