import {test,expect} from "bun:test";
import {protectOutcomeAttachmentsWithRereview} from "../src/expansion/rereviewOutcomeGuard";
import {createVersionedSourceRereview} from "../src/expansion/sourceRereview";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {opsFixture} from "./fixtures/pilotOperations";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {assessContradictionInvestigation,compareContextualCandidatePairs} from "../src/evidence/structuredEvidenceComparison";
import {opsHash} from "../src/operations/pilotOperationsStore";
test("actual saved-outcome authority refuses invalidated attachments after independently scoped re-review",async()=>{
 const f=opsFixture();try{const options={contradictionInvestigation:assessContradictionInvestigation({pack:compareContextualCandidatePairs({relationships:[],generatedAt:"2026-11-12T12:00:00Z"})})},attachmentsHash=deliveryHash(canonicalGraphContext(options));
 const queue=createVersionedSourceRereview(f.store,{verifyDependency:async()=>true,verifySourceChange:async()=>true,verifyArtifactUse:async()=>true,verifyDecision:async()=>true});
 await queue.register({sourceId:"TEST-source",sourceVersion:"v1",artifactHash:attachmentsHash,artifactVersion:"1",investigationId:"hsi-interrogative-test-12345678",organizationRef:"TEST-org",domain:"ssc",clearanceRef:"TEST-clearance"});
 const resolver=protectOutcomeAttachmentsWithRereview({load:async(_actor,p)=>({investigationId:p.investigation.id,packageHash:p.packageHash,contextHash:p.context.contentHash,releaseId:p.context.primary.release.id,manifestHash:p.context.primary.release.manifestHash,attachmentsHash,options}),authorize:async()=>true},{organization:async()=>"TEST-org",artifactHashes:async()=>[attachmentsHash],authorizeCurrentArtifactUse:b=>queue.authorizeCurrentArtifactUse(b)});
 const saved=deliveryHarness({outcomeAttachments:resolver});expect((await saved.service.outcome("alice",saved.initial.id)).provenance.attachmentBinding).not.toBeNull();
 await queue.apply({sourceId:"TEST-source",affectedVersions:["v1"],state:"corrected",authorityDecisionRef:"TEST-correction",authorityRevision:"2",evidenceHash:opsHash("TEST-correction-evidence")});await expect(saved.service.outcome("alice",saved.initial.id)).rejects.toThrow("outside");
 const task=f.store.rereviewTasks()[0]!;await queue.review({taskId:task.taskId,reviewerRef:"TEST-scoped-reviewer",receiptRef:"TEST-independent-receipt",decision:"reviewed_with_limitations",replacementArtifactHash:null});await expect(saved.service.outcome("alice",saved.initial.id)).rejects.toThrow("outside");expect(saved.counts().decisionWrites).toBe(0);
 }finally{f.close()}
});
