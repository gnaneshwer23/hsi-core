import {test,expect} from "bun:test";
import {deliveryHarness} from "./fixtures/deliveryHarness";
import {canonicalGraphContext} from "../src/investigationGraphContext";
import {parseReviewDecisionRequest,parseRevisionRequest,verifyDeliveryView,verifyReviewPackage} from "../src/investigationDelivery";
import {deliveryHash} from "../src/server/investigationDeliveryService";
import {withInvestigationDelivery} from "../src/db/investigationDeliveryStore";
import {parseReviewQueueCursor} from "../src/db/independentReviewQueue";
const revision={requestId:"22222222-2222-4222-8222-222222222222",question:"Which SSc mechanism remains plausible after source review?",reason:"I have clarified the candidate question and retained the stated model and source limitations."};
test("draft and submitted briefs are reproducible and bind source/context versions",async()=>{
 const f=deliveryHarness(),id=f.initial.id;const draft=await f.service.view("alice",id);await verifyDeliveryView(draft,id,async s=>deliveryHash(s));
 const a=await f.service.brief("alice",id,"markdown"),b=await f.service.brief("alice",id,"markdown");expect(a.content).toBe(b.content);expect(a.hash).toBe(deliveryHash(a.content));expect(a.content).toContain(draft.package!.context.contentHash);expect(a.content).toContain("Passage SHA-256:");
 await f.service.submit("alice",id);const submitted=await f.service.view("reviewer",id);expect(submitted.capabilities.canDecide).toBe(true);expect(submitted.package!.packageHash).not.toBe(draft.package!.packageHash);await verifyDeliveryView(submitted,id,async s=>deliveryHash(s));
 const json=JSON.parse((await f.service.brief("reviewer",id,"json")).content);expect(json.scope).toBe("research_only");expect(json.graphPublicationApproved).toBe(false);expect(json.package.packageHash).toBe(submitted.package!.packageHash);
});
test("submit, request revision, create linked draft, capture and resubmit without losing the parent",async()=>{
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);const submitted=structuredClone(f.states.get(id)!.package);
 const decision=await f.service.decide("reviewer",id,await f.reviewRequest());expect(decision.reviewerPrincipal).toBe("reviewer");
 const parent=await f.service.view("alice",id);expect(parent.status).toBe("revision_requested");expect(parent.capabilities.canSubmit).toBe(false);expect(parent.capabilities.canRevise).toBe(true);
 const child=await f.service.revise("alice",id,revision);expect(child.id).not.toBe(id);expect((await f.service.view("alice",child.id)).package).toBeNull();
 await expect(f.service.view("reviewer",child.id)).rejects.toThrow("denied");
 await expect(f.service.submit("alice",child.id)).rejects.toThrow("captured evidence");f.capture(child.id);await f.service.submit("alice",child.id);
 expect(f.states.get(id)!.package).toEqual(submitted);expect(f.states.get(id)!.decision!.decisionHash).toBe(decision.decisionHash);expect(f.states.get(child.id)!.revision).toMatchObject({parentId:id,rootId:id,number:2,decisionId:decision.id});
 const next=await f.service.view("reviewer",child.id);expect(next.package!.packageHash).not.toBe(submitted!.packageHash);expect(next.capabilities.canDecide).toBe(true);
 const nextDecision=await f.service.decide("reviewer",child.id,await f.reviewRequest(child.id,"approve_with_limitations"));expect(nextDecision.id).not.toBe(decision.id);expect((await f.service.view("alice",child.id)).status).toBe("reviewed");
});
test("acceptance reviews the brief and never promotes candidate hypotheses or the graph",async()=>{
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);const d=await f.service.decide("reviewer",id,await f.reviewRequest(id,"approve_with_limitations"));
 const view=await f.service.view("alice",id);expect(view.status).toBe("reviewed");expect(d.scope).toBe("evidence_brief_only");expect(f.states.get(id)!.record.conclusion.assessment).toBe("insufficient_evidence");expect(f.states.get(id)!.record.branches.every(b=>b.classification==="unvalidated_hypothesis")).toBe(true);expect(JSON.parse((await f.service.brief("alice",id,"json")).content).graphPublicationApproved).toBe(false);
 await expect(f.service.revise("alice",id,revision)).rejects.toThrow();
});
test("a researcher with reviewer authority still cannot review their own package",async()=>{
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);expect((await f.service.view("alice",id)).capabilities.canDecide).toBe(false);await expect(f.service.decide("alice",id,await f.reviewRequest())).rejects.toThrow("Independent");await expect(f.service.view("bob",id)).rejects.toThrow("denied");
});
test("lost decision acknowledgements and submission retries do not duplicate records",async()=>{
 const f=deliveryHarness({lostDecisionAck:true}),id=f.initial.id;await f.service.submit("alice",id);await f.service.submit("alice",id);const request=await f.reviewRequest();await expect(f.service.decide("reviewer",id,request)).rejects.toThrow("Lost acknowledgement");
 const stored=await f.service.decide("reviewer",id,request);expect(stored.decisionHash).toBe(f.states.get(id)!.decision!.decisionHash);expect(f.counts()).toMatchObject({decisionWrites:1,submissionWrites:1});await expect(f.service.decide("reviewer",id,{...request,rationale:request.rationale+" Changed."})).rejects.toThrow("already recorded");
});
test("lost revision acknowledgements return the same child, with no parent overwrite",async()=>{
 const f=deliveryHarness({lostRevisionAck:true}),id=f.initial.id;await f.service.submit("alice",id);await f.service.decide("reviewer",id,await f.reviewRequest());await expect(f.service.revise("alice",id,revision)).rejects.toThrow("Lost revision acknowledgement");
 const child=await f.service.revise("alice",id,revision);expect(child.id).toBe(f.states.get(id)!.successor!.id);expect(f.counts().revisionWrites).toBe(1);await expect(f.service.revise("alice",id,{...revision,question:"Changed question"})).rejects.toThrow("conflict");
});
test("read-only deployments and revoked roles/source permissions fail closed",async()=>{
 const readonly=deliveryHarness({writesEnabled:false});await expect(readonly.service.submit("alice",readonly.initial.id)).rejects.toThrow();
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);const request=await f.reviewRequest();f.revokeReviewer();await expect(f.service.decide("reviewer",id,request)).rejects.toThrow();f.revokeSources();await expect(f.service.brief("alice",id,"json")).rejects.toThrow("revoked");
});
test("forged roles, timestamps, wrong packages, unsupported claims and missing COI are denied",async()=>{
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);const request=await f.reviewRequest();
 for(const fields of [{reviewerPrincipal:"alice"},{reviewedAt:"2099-01-01T00:00:00Z"},{conflictOfInterestDeclared:false}])expect(()=>parseReviewDecisionRequest({...request,...fields})).toThrow();
 await expect(f.service.decide("reviewer",id,{...request,packageHash:"e".repeat(64)})).rejects.toThrow("mismatch");await expect(f.service.decide("reviewer",id,{...request,reviewedClaimIds:["HSI-C-SSC-UNREVIEWED"]})).rejects.toThrow("outside");
 expect(()=>parseRevisionRequest({...revision,actorPrincipal:"alice"})).toThrow();
});
test("tampered package content or passage hashes cannot become reproducible exports",async()=>{
 const f=deliveryHarness(),id=f.initial.id;await f.service.submit("alice",id);const p=structuredClone(f.states.get(id)!.package!);p.context.primary.bundle.passages[0]!.text="Forged quote";const {packageHash,...body}=p;p.packageHash=deliveryHash(canonicalGraphContext(body));await expect(verifyReviewPackage(p,async s=>deliveryHash(s))).rejects.toThrow();
});
test("older submissions and decisions remain unbound instead of acquiring new acceptance",async()=>{
 const f=deliveryHarness(),id=f.initial.id;f.states.get(id)!.record.state="awaiting_scientific_review";
 expect((await f.service.view("alice",id)).status).toBe("legacy_unbound");await expect(f.service.brief("alice",id,"json")).rejects.toThrow();
 f.states.get(id)!.record.state="draft";f.states.get(id)!.legacyDecision=true;expect((await f.service.view("alice",id)).capabilities.canSubmit).toBe(false);
});
test("production writes and identity-bearing queue cursors are refused before database work",async()=>{
 await expect(withInvestigationDelivery({databaseUrl:"postgresql://test:never-used@ep-restless-dew-zas989pv.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",neonProjectId:"red-wave-06625195",writesEnabled:true},true,async()=>"must not run")).rejects.toThrow("staging writes");
 const cursor={at:"2026-11-05T04:00:00.123456Z",id:"submission-"+"a".repeat(32)};expect(parseReviewQueueCursor(cursor)).toEqual(cursor);expect(()=>parseReviewQueueCursor({...cursor,principal:"someone-else"})).toThrow();
});
