/** In-memory workflow fixture. It does not certify Neon transactions or real scientific approval. */
import {investigation,contextFixture,hash} from "./investigationGraphContext";
import {createInvestigationDeliveryService,type DeliveryState,type DeliveryDependencies} from "../../src/server/investigationDeliveryService";
import {canonicalGraphContext,type InvestigationGraphContext} from "../../src/investigationGraphContext";
import type {ReviewDecisionRequest,ReviewOutcome,RevisionLink} from "../../src/investigationDelivery";
import type {InterrogativeInvestigation} from "../../src/interrogativeValidation";
export function deliveryHarness(options:{writesEnabled?:boolean;lostDecisionAck?:boolean;lostRevisionAck?:boolean;outcomeAttachments?:DeliveryDependencies["outcomeAttachments"]}={}){
 const initial=investigation(),states=new Map<string,DeliveryState>(),contexts=new Map<string,InvestigationGraphContext>();
 let authority=true,sourceAccess=true,decisionWrites=0,revisionWrites=0,submissionWrites=0;
 const empty=(record:InterrogativeInvestigation):DeliveryState=>({record,package:null,submission:null,decision:null,revision:null,successor:null,legacyDecision:false});states.set(initial.id,empty(initial));contexts.set(initial.id,contextFixture());
 const deps:DeliveryDependencies={outcomeAttachments:options.outcomeAttachments,writesEnabled:options.writesEnabled??true,now:()=>"2026-11-05T04:00:00.000Z",
  authenticate:async token=>token&&["alice","reviewer","bob","ungranted"].includes(token)?{authenticated:true,principalId:token,roles:token==="reviewer"?["scientific_reviewer"]:token==="alice"?["researcher","scientific_reviewer"]:token==="ungranted"?[]:["researcher"]}:null,
  reviewer:async principal=>authority&&(principal==="reviewer"||principal==="alice"),
  load:async(_actor,id)=>{const s=states.get(id);if(!s)throw Error("Record unavailable");return structuredClone(s)},
  context:async(_token,id)=>{if(!sourceAccess)throw Error("Source permissions revoked");return contexts.get(id)??null},
  submit:async(_actor,state,p,submission)=>{const current=states.get(state.record.id)!;if(current.submission){if(current.submission.packageHash!==p.packageHash)throw Error("Submission conflict");return}submissionWrites++;current.package=structuredClone(p);current.submission=structuredClone(submission);current.record=structuredClone(p.investigation)},
  decide:async(_actor,state,d)=>{const current=states.get(state.record.id)!;if(current.decision){if(current.decision.requestHash===d.requestHash)return structuredClone(current.decision);throw Error("Already decided")}
   decisionWrites++;current.decision=structuredClone(d);current.record={...current.record,state:d.outcome==="approve_with_limitations"?"reviewed":d.outcome==="reject"?"rejected":"draft",review:d.outcome==="approve_with_limitations"?{reviewerPrincipal:d.reviewerPrincipal,reviewDecisionId:d.id,reviewedAt:d.reviewedAt}:null};if(options.lostDecisionAck)throw Error("Lost acknowledgement");return structuredClone(d)},
  revise:async(_actor,state,child,requestId,inputHash,link)=>{const current=states.get(state.record.id)!;const old=revisionRequests.get(state.record.id);if(old){if(old.requestId===requestId&&old.inputHash===inputHash)return {id:old.id};throw Error("Revision conflict")}
   revisionWrites++;const next=empty(structuredClone(child));next.revision=structuredClone(link);states.set(child.id,next);current.successor={id:child.id,number:link.number};revisionRequests.set(state.record.id,{id:child.id,requestId,inputHash});if(options.lostRevisionAck)throw Error("Lost revision acknowledgement");return {id:child.id}}
 };
 const revisionRequests=new Map<string,{id:string;requestId:string;inputHash:string}>();
 const service=createInvestigationDeliveryService(deps);
 function capture(id:string){const i=states.get(id)!.record;const c=contextFixture();c.investigationId=id;c.question=i.question;c.primary.bundle.context.question=i.question;if(c.comparison)c.comparison.bundle.context.question=i.question;const {contentHash,...body}=c;c.contentHash=hash(canonicalGraphContext(body));contexts.set(id,c)}
 async function reviewRequest(id=initial.id,outcome:ReviewOutcome="request_revision"):Promise<ReviewDecisionRequest>{const view=await service.view("reviewer",id);return {schemaVersion:"hsi-review-request-2",investigationId:id,submissionId:view.submission!.id,packageHash:view.package!.packageHash,requestId:"11111111-1111-4111-8111-111111111111",outcome,rationale:"The evidence limitations and source context require an explicit researcher response.",reviewedClaimIds:[view.package!.context.primary.bundle.claims[0]!.id],limitations:["Evidence brief acceptance does not validate a causal mechanism."],conflictOfInterestDeclared:true}}
 return {service,initial,states,contexts,capture,reviewRequest,revokeReviewer:()=>{authority=false},revokeSources:()=>{sourceAccess=false},counts:()=>({decisionWrites,revisionWrites,submissionWrites})};
}
