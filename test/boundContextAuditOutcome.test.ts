/** In-memory HTTP acceptance only; no real login, provider, persistence or scientific approval. */
import {test,expect} from "bun:test";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {createContextConflictAuditRunner,type ContextConflictAudit} from "../src/evidence/contextConflictAudit";
import {buildPassageLinkedContext} from "../src/evidence/passageLinkedContext";
import {contextUnit,fixtureHash} from "./fixtures/contextConflictAudit";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
import type {StoredOutcomeAttachments} from "../src/server/boundOutcomeAttachments";
import type {ReviewPackage} from "../src/investigationDelivery";
async function setup(){
 let stored:StoredOutcomeAttachments|null=null,authorized=true,loads=0;
 const f=deliveryHarness({outcomeAttachments:{load:async()=>{loads++;return stored},authorize:async()=>authorized}});
 const p=(await f.service.view("alice",f.initial.id)).package!,source=p.context.primary.bundle.sources[0]!,passage=p.context.primary.bundle.passages[0]!;
 const runner=createContextConflictAuditRunner({enabled:true,
  search:async(_t,intent)=>({intent,status:intent==="support"?"completed_bounded":"successful_empty",queriedAt:"2026-11-12T12:00:00Z",queryHash:fixtureHash(intent),sourceIds:intent==="support"?[source.id]:[],hits:intent==="support"?[{id:"synthetic-hit",source,passage,clearanceReceiptId:"synthetic-clearance"}]:[]}),
  authorizePassage:async()=>true,
  extract:async()=>({...contextUnit("a").unit,evidenceSourceIds:[source.id],detailedContext:buildPassageLinkedContext({source,passage,clearanceReceiptId:"synthetic-clearance",extractions:{}})}),
  verify:async()=>({status:"needs_evidence",receiptId:null}),append:async()=>{},
 });
 const audit=await runner.run({investigationId:f.initial.id,diseaseScope:"ssc",question:p.investigation.question,release:p.context.primary.release});
 function bind(a:ContextConflictAudit,packageValue:ReviewPackage=p){const options={contextConflictAudit:a};stored={options,investigationId:packageValue.investigation.id,packageHash:packageValue.packageHash,contextHash:packageValue.context.contentHash,releaseId:packageValue.context.primary.release.id,manifestHash:packageValue.context.primary.release.manifestHash,attachmentsHash:deliveryHash(canonicalGraphContext(options))}}
 bind(audit);
 const services={outcome:({serverSessionToken,investigationId}:{serverSessionToken:string|null;investigationId:string})=>f.service.outcome(serverSessionToken,investigationId),load:async()=>null,submit:async()=>null,review:async()=>null};
 const get=(format="",actor="alice")=>handleInterrogativeApi(new Request("https://hsi.test/api/research/interrogative/"+f.initial.id+"/outcome"+format,{headers:{cookie:"better-auth.session_token="+actor}}),services);
 return {f,audit,bind,get,revoke:()=>{authorized=false},loads:()=>loads,tamper:()=>{stored!.attachmentsHash="f".repeat(64)}};
}
test("saved outcome reopens/exports only an independently stored, exact-package audit",async()=>{
 const {get,audit,f}=await setup();const first=await get(),o=await first.json();expect(first.status).toBe(200);expect(o.contextConflictAudit.auditHash).toBe(audit.auditHash);expect(o.contradictions.searchStatus).toBe("bounded_context_audit_recorded");expect((await (await get()).json()).outcomeHash).toBe(o.outcomeHash);
 const markdown=await get("?format=markdown"),text=await markdown.text();expect(markdown.status).toBe(200);expect(text).toContain("Context-Conflict Audit");expect(text).toContain("not_extracted");expect(text).toContain(audit.auditHash);expect(markdown.headers.get("x-hsi-content-sha256")).toBe(deliveryHash(text));expect(f.counts().submissionWrites).toBe(0);
});
test("owner/session and current source rights gate stored attachments on every read",async()=>{
 const f=await setup();expect((await f.get("","bob")).status).toBe(403);expect(f.loads()).toBe(0);expect((await f.get()).status).toBe(200);f.revoke();expect((await f.get()).status).toBe(403);
 const g=await setup();g.f.revokeSources();expect((await g.get()).status).toBe(403);expect(g.loads()).toBe(0);
});
test("attachment digest and investigation/release/disease bindings fail closed",async()=>{
 const f=await setup();f.tamper();expect((await f.get()).status).toBe(403);
 for(const change of [{investigationId:"another"},{diseaseScope:"ra" as const},{release:{id:"another",version:"1",manifestHash:"f".repeat(64)}}]){
  const g=await setup(),{auditHash,id,...body}={...g.audit,...change},h=deliveryHash(canonicalGraphContext(body));g.bind({...body,auditHash:h,id:"context-audit-"+h.slice(0,32)});expect((await g.get()).status).toBe(403);
 }
});
test("legacy evidence-brief acceptance never approves the context audit",async()=>{
 const {f,get,bind,audit}=await setup();await f.service.submit("alice",f.initial.id);bind(audit,(await f.service.view("alice",f.initial.id)).package!);await f.service.decide("reviewer",f.initial.id,await f.reviewRequest(f.initial.id,"approve_with_limitations"));const o=await (await get()).json();expect(o.review.status).toBe("approve_with_limitations");expect(o.review.scientificApprovalTransferred).toBe(false);expect(o.contextConflictAudit.humanReview.status).toBe("required");expect(o.contextConflictAudit.scientificApproval).toBe(false);
});
