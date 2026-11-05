import {describe,test,expect} from "bun:test";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import {buildResearchOutcome,verifyResearchOutcome,renderResearchOutcome} from "../src/researchOutcome";
import type {EvidenceBrief} from "../src/investigationDelivery";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {handleInterrogativeApi} from "../src/server/interrogativeApi";
const digest=async(s:string)=>deliveryHash(s);
async function brief(f=deliveryHarness()):Promise<EvidenceBrief>{const v=await f.service.view("alice",f.initial.id);return {schemaVersion:"hsi-investigation-brief-1",package:v.package!,submission:v.submission,decision:v.decision,scope:"research_only",graphPublicationApproved:false}}
async function rehash(b:EvidenceBrief){const p=b.package;p.investigationHash=deliveryHash(canonicalGraphContext(p.investigation));const {packageHash,...body}=p;p.packageHash=deliveryHash(canonicalGraphContext(body));return b}
function binding(b:EvidenceBrief){const c=b.package.context.primary.bundle.claims[0]!;return {claimId:c.id,sourceIds:["pmid:123"],reviewDecisionId:c.review!.decisionId,polarity:"supports" as const,evidenceKind:"association" as const,context:{species:"human"},graphPath:[c.relationshipId]}}
describe("backend-composed research outcomes",()=>{
 test("composes the saved record deterministically without mutating it or inventing outputs",async()=>{
  const f=deliveryHarness(),before=JSON.stringify([...f.states]),o=await f.service.outcome("alice",f.initial.id);
  expect(await f.service.outcome("alice",f.initial.id)).toEqual(o);expect(JSON.stringify([...f.states])).toBe(before);expect(f.counts()).toEqual({decisionWrites:0,revisionWrites:0,submissionWrites:0});
  expect(o.answer.confidence.value).toBeNull();expect(o.hypotheses.every(h=>h.suggestedExperiment===null&&h.requiredControls===null)).toBe(true);
  expect(o.trials.status).toBe("not_queried");expect(o.trials.eligibilityAssessed).toBe(false);expect(o.mechanismMap.causalClaim).toBe(false);expect(o.evidence[0]!.supportingBranchIds).toEqual([]);
  expect(o.evidence[0]!.context.dose).toBeNull();expect(o.contradictions.searchStatus).toBe("not_recorded");expect(o.provenance.projectionInvokesModel).toBe(false);
 });
 test("rechecks ownership, roles and revoked source access on every read",async()=>{
  const f=deliveryHarness();for(const token of [null,"bob","ungranted","reviewer"])await expect(f.service.outcome(token,f.initial.id)).rejects.toThrow();
  await f.service.outcome("alice",f.initial.id);f.revokeSources();await expect(f.service.outcome("alice",f.initial.id)).rejects.toThrow();
 });
 test("does not require write enablement and refuses missing or legacy contexts",async()=>{
  const f=deliveryHarness({writesEnabled:false});expect((await f.service.outcome("alice",f.initial.id)).scope.clinicalAdvice).toBe(false);
  f.contexts.delete(f.initial.id);await expect(f.service.outcome("alice",f.initial.id)).rejects.toThrow();
  f.capture(f.initial.id);f.states.get(f.initial.id)!.legacyDecision=true;await expect(f.service.outcome("alice",f.initial.id)).rejects.toThrow();
 });
 test("independent acceptance changes the bound review without upgrading the science",async()=>{
  const f=deliveryHarness();await f.service.submit("alice",f.initial.id);const before=await f.service.outcome("alice",f.initial.id);
  await f.service.decide("reviewer",f.initial.id,await f.reviewRequest(f.initial.id,"approve_with_limitations"));
  const after=await f.service.outcome("reviewer",f.initial.id);
  expect(after.binding.packageHash).toBe(before.binding.packageHash);expect(after.outcomeHash).not.toBe(before.outcomeHash);
  expect(after.review.status).toBe("approve_with_limitations");expect(after.answer.evidenceStatus).toBe("insufficient_evidence");expect(after.review.scientificApprovalTransferred).toBe(false);
  f.revokeReviewer();await expect(f.service.outcome("reviewer",f.initial.id)).rejects.toThrow();
 });
 test("patient-specific and diabetes questions abstain with the pinned SSc release",async()=>{
  const f=deliveryHarness();f.states.get(f.initial.id)!.record.question="Why does this patient have worsening diabetes?";f.capture(f.initial.id);
  const o=await f.service.outcome("alice",f.initial.id);expect(o.scope.questionFit).toBe("scope_review_required");expect(o.answer.summaryOrigin).toBe("scope_gate");expect(o.answer.summary).toContain("does not establish an answer");
 });
 test("only primary, context-matched claim bindings are projected",async()=>{
  const b=await brief();b.package.investigation.branches[0]!.supporting=[binding(b)];await rehash(b);
  const o=await buildResearchOutcome(b,digest);expect(o.hypotheses[0]!.supportingClaimIds).toEqual(["HSI-C-TEST-001"]);expect(o.evidence[0]!.semanticBranchSupportVerified).toBe(false);
  expect(o.comparison.role).toBe("separate_disease_context_not_branch_evidence");expect(o.evidence[0]!.context.species).toBe("human");
 });
 for(const variant of ["claim","source","review","context","path","kind","duplicate"] as const)test("rejects forged source binding: "+variant,async()=>{
  const b=await brief(),t=binding(b);b.package.investigation.branches[0]!.supporting=[t];
  if(variant==="claim")t.claimId="RA-only-claim";if(variant==="source")t.sourceIds=["unknown"];
  if(variant==="review")t.reviewDecisionId="unknown";if(variant==="context")t.context.species="mouse";
  if(variant==="path")t.graphPath=["unknown"];if(variant==="kind")(t as {evidenceKind:string}).evidenceKind="established_evidence";
  if(variant==="duplicate")b.package.investigation.branches[0]!.supporting.push(structuredClone(t));
  await rehash(b);await expect(buildResearchOutcome(b,digest)).rejects.toThrow();
 });
 test("verifies against the independent package and decision, not a self-declared output hash",async()=>{
  const b=await brief(),o=await buildResearchOutcome(b,digest);await verifyResearchOutcome(o,b,digest);
  const forged=structuredClone(o);forged.answer.summary="Proven causal treatment";const {outcomeHash,...body}=forged;forged.outcomeHash=deliveryHash(canonicalGraphContext(body));
  await expect(verifyResearchOutcome(forged,b,digest)).rejects.toThrow();b.package.context.primary.bundle.passages[0]!.text="tampered";await expect(verifyResearchOutcome(o,b,digest)).rejects.toThrow();
 });
 test("exports all ten outcome areas and excludes technical identity/session payloads",async()=>{
  const o=await deliveryHarness().service.outcome("alice","hsi-interrogative-test-12345678"),json=renderResearchOutcome(o,"json"),md=renderResearchOutcome(o,"markdown");
  expect(JSON.parse(json)).toEqual(o);for(const label of ["Answer and limits","Mechanism map","Source evidence","Conflicting evidence","Missing data","Investigation question tree","Candidate hypotheses","Next research work","Clinical-trial context","Human review"])expect(md).toContain(label);
  for(const key of ["actorPrincipal","reviewerPrincipal","reviewerRef","submittedBy","toolCalls"])expect(json).not.toContain('"'+key+'"');
  expect(md).toContain(o.passages[0]!.sha256);expect(md).toContain("not specified");expect(md).toContain("not calibrated");
 });
});
describe("read-only outcome API",()=>{
 function setup(){const f=deliveryHarness(),services={outcome:({serverSessionToken,investigationId}:{serverSessionToken:string|null;investigationId:string})=>f.service.outcome(serverSessionToken,investigationId),load:async()=>null,submit:async()=>null,review:async()=>null};return {f,services}}
 test("session required; mutation, identity and format overrides refused",async()=>{
  const {f,services}=setup(),url="https://hsi.test/api/research/interrogative/"+f.initial.id+"/outcome";
  const request=(suffix="",method="GET",cookie="better-auth.session_token=alice")=>handleInterrogativeApi(new Request(url+suffix,{method,headers:{cookie}}),services);
  expect((await request("","GET","")).status).toBe(401);expect((await request("","POST")).status).toBe(405);
  for(const q of ["?actor=bob","?format=json&format=json","?format=html"])expect((await request(q)).status).toBe(400);
  expect(f.counts().submissionWrites).toBe(0);
 });
 test("JSON view and bounded downloads bind content, package and outcome hashes",async()=>{
  const {f,services}=setup(),url="https://hsi.test/api/research/interrogative/"+f.initial.id+"/outcome",get=(q="")=>handleInterrogativeApi(new Request(url+q,{headers:{cookie:"better-auth.session_token=alice"}}),services);
  const view=await get(),o=await view.json();expect(view.headers.get("cache-control")).toBe("no-store");
  for(const format of ["json","markdown"]){const r=await get("?format="+format),text=await r.text();expect(r.status).toBe(200);expect(r.headers.get("x-hsi-content-sha256")).toBe(deliveryHash(text));expect(r.headers.get("x-hsi-outcome-sha256")).toBe(o.outcomeHash);expect(r.headers.get("x-hsi-package-sha256")).toBe(o.binding.packageHash)}
  f.revokeSources();expect((await get()).status).toBe(403);
 });
});
