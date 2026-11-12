import {test,expect} from "bun:test";
import {createVersionedSourceRereview,type SourceDependency,type SourceChange} from "../src/expansion/sourceRereview";
import {opsFixture,TEST_POLICY} from "./fixtures/pilotOperations";
import {openPilotOperationsStore,opsHash} from "../src/operations/pilotOperationsStore";
const dependency:SourceDependency={sourceId:"TEST-source",sourceVersion:"v1",artifactHash:opsHash("TEST-brief-v1"),artifactVersion:"1",investigationId:"TEST-investigation",organizationRef:"TEST-org",domain:"sle",clearanceRef:"TEST-clearance"};
const change:SourceChange={sourceId:"TEST-source",affectedVersions:["v1"],state:"retracted",authorityDecisionRef:"TEST-retraction-record",authorityRevision:"1",evidenceHash:opsHash("TEST-authority-evidence")};
const authority={verifyDependency:async()=>true,verifySourceChange:async()=>true,verifyDecision:async()=>true,verifyArtifactUse:async()=>true};
test("source invalidations create durable versioned re-review tasks, including late registration",async()=>{
 const f=opsFixture();let other:ReturnType<typeof openPilotOperationsStore>|undefined;try{const queue=createVersionedSourceRereview(f.store,authority);await queue.register(dependency);await queue.apply(change);await queue.apply(change);expect(f.store.rereviewTasks()).toHaveLength(1);
 other=openPilotOperationsStore(f.file,TEST_POLICY,f.now);const second=createVersionedSourceRereview(other,authority);await second.register({...dependency,artifactHash:opsHash("TEST-brief-v2"),artifactVersion:"2"});expect(f.store.rereviewTasks()).toHaveLength(2);await second.register({...dependency,sourceVersion:"v2",artifactHash:opsHash("TEST-source-v2-brief")});expect(f.store.rereviewTasks()).toHaveLength(2);
 await queue.apply({...change,state:"corrected",authorityRevision:"2",evidenceHash:opsHash("TEST-correction2")});expect(f.store.rereviewTasks()).toHaveLength(4);expect(queue.taskManifest().pending).toBe(4);expect(queue.taskManifest().sourceUseReauthorized).toBe(false);
 await expect(queue.apply({...change,state:"withdrawn"})).rejects.toThrow("Immutable source");
 }finally{other?.close();f.close()}
});
test("wrong-domain/tenant or unverified changes fail closed; review cannot grant rights or silently replace artifact",async()=>{
 const f=opsFixture();try{const q=createVersionedSourceRereview(f.store,authority);await q.register(dependency);await q.apply(change);const task=f.store.rereviewTasks()[0]!,decision={taskId:task.taskId,reviewerRef:"TEST-reviewer",receiptRef:"TEST-independent-review",decision:"reviewed_with_limitations" as const,replacementArtifactHash:null};
 await expect(createVersionedSourceRereview(f.store,{...authority,verifyDecision:async binding=>binding.task.dependency.domain==="ssc"}).review(decision)).rejects.toThrow("scoped");await expect(createVersionedSourceRereview(f.store,{...authority,verifySourceChange:async()=>false}).apply({...change,authorityRevision:"2"})).rejects.toThrow("Trusted");
 await q.review(decision);await q.review(decision);expect(await q.authorizeCurrentArtifactUse({artifactHash:dependency.artifactHash,organizationRef:dependency.organizationRef,actions:["display","export"]})).toBe(false);expect(await q.authorizeCurrentArtifactUse({artifactHash:opsHash("TEST-new-unflagged-artifact"),organizationRef:dependency.organizationRef,actions:["display"]})).toBe(true);expect(f.store.rereviewTasks()[0]!).toMatchObject({status:"reviewed_with_limitations",sourceUseReauthorized:false,graphPromotable:false});await expect(q.review({...decision,decision:"superseded",replacementArtifactHash:dependency.artifactHash})).rejects.toThrow("distinct");
 await q.apply({...change,authorityRevision:"2",evidenceHash:opsHash("TEST-new-notice")});expect(q.taskManifest().pending).toBe(1);
 }finally{f.close()}
});
