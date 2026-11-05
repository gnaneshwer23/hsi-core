/** Phase D trusted orchestration. Identity/time/decision IDs come from the backend. */
import {createHash} from "node:crypto";
import {planSscInterrogation} from "../interrogativeQuestionEngine";
import {canonicalGraphContext,verifyInvestigationGraphContext,type InvestigationGraphContext} from "../investigationGraphContext";
import {DELIVERY_METHOD,canonicalInvestigationRecord,parseReviewDecisionRequest,parseRevisionRequest,assertReviewRequestForPackage,verifyReviewPackage,verifyDeliveryDecision,renderEvidenceBrief,type RevisionLink,type ReviewPackage,type DeliveryDecision,type DeliverySubmission,type DeliveryView,type EvidenceBrief} from "../investigationDelivery";
import type {TrustedResearchActor} from "../db/researchInvestigationStore";
import type {InterrogativeInvestigation} from "../interrogativeValidation";
export const deliveryHash=(s:string)=>createHash("sha256").update(s).digest("hex");
export type DeliveryState={record:InterrogativeInvestigation;submission:DeliverySubmission|null;package:ReviewPackage|null;decision:DeliveryDecision|null;revision:RevisionLink|null;successor:{id:string;number:number}|null;legacyDecision:boolean};
export type DeliveryDependencies={
 authenticate:(token:string|null)=>Promise<TrustedResearchActor|null>;reviewer:(principal:string)=>Promise<boolean>;
 load:(actor:TrustedResearchActor,id:string)=>Promise<DeliveryState>;
 context:(token:string,id:string)=>Promise<InvestigationGraphContext|null>;
 submit:(actor:TrustedResearchActor,state:DeliveryState,p:ReviewPackage,submission:DeliverySubmission)=>Promise<void>;
 decide:(actor:TrustedResearchActor,state:DeliveryState,decision:DeliveryDecision)=>Promise<DeliveryDecision>;
 revise:(actor:TrustedResearchActor,state:DeliveryState,child:InterrogativeInvestigation,requestId:string,inputHash:string,link:RevisionLink)=>Promise<{id:string}>;
 writesEnabled:boolean;now?:()=>string;
};
export function createInvestigationDeliveryService(deps:DeliveryDependencies){
 async function load(token:string|null,id:string){
  const actor=await deps.authenticate(token);if(!token||!actor?.authenticated||!actor.principalId||!actor.roles.some(r=>["researcher","research_admin","scientific_reviewer"].includes(r)))throw Error("Verified research access required");
  const state=await deps.load(actor,id),isOwner=state.record.actorPrincipal===actor.principalId;
  const reviewer=actor.roles.includes("scientific_reviewer")&&await deps.reviewer(actor.principalId);
  if(!isOwner&&!(reviewer&&(state.record.state==="awaiting_scientific_review"||state.decision?.reviewerPrincipal===actor.principalId)))throw Error("Delivery access denied");
  const context=await deps.context(token,id);let p=state.package;
  if(context)await verifyInvestigationGraphContext(context,state.record,async s=>deliveryHash(s));
  if(p){
   await verifyReviewPackage(p,async s=>deliveryHash(s));
   if(!context||context.contentHash!==p.context.contentHash||state.submission?.packageHash!==p.packageHash)throw Error("Submitted context changed or unavailable");
   if(state.decision)await verifyDeliveryDecision(state.decision,p,state.submission!,async s=>deliveryHash(s));
   const expected={...p.investigation,state:state.decision?(state.decision.outcome==="approve_with_limitations"?"reviewed":state.decision.outcome==="reject"?"rejected":"draft"):"awaiting_scientific_review",review:state.decision?.outcome==="approve_with_limitations"?{reviewerPrincipal:state.decision.reviewerPrincipal,reviewDecisionId:state.decision.id,reviewedAt:state.decision.reviewedAt}:null};
   if(canonicalInvestigationRecord(expected)!==canonicalInvestigationRecord(state.record))throw Error("Investigation changed after submission");
  }else if(context){p=makePackage(state.record,context,state.revision)}
  const researcher=actor.roles.some(r=>["researcher","research_admin"].includes(r));
  const capabilities={writesEnabled:deps.writesEnabled,canSubmit:deps.writesEnabled&&isOwner&&researcher&&state.record.state==="draft"&&!state.submission&&!state.legacyDecision&&!!p,canDecide:deps.writesEnabled&&!isOwner&&reviewer&&!!state.submission&&!state.decision&&state.record.state==="awaiting_scientific_review",canRevise:deps.writesEnabled&&isOwner&&researcher&&state.decision?.outcome==="request_revision"&&!state.successor};
  return {actor,state,p,capabilities};
 }
 function makePackage(record:InterrogativeInvestigation,context:InvestigationGraphContext,revision:RevisionLink|null):ReviewPackage{
  const body={schemaVersion:"hsi-review-package-1" as const,investigation:record,investigationHash:deliveryHash(canonicalInvestigationRecord(record)),context,revision,method:DELIVERY_METHOD,
   limitations:["Evidence brief review only; candidate branches remain unvalidated unless explicitly supported and independently assessed.","Source associations and shared graph patterns do not establish causality or equivalent biology.","No patient eligibility, treatment advice or knowledge-graph publication is authorised.","Unreviewed working-catalogue candidates remain excluded from scientific approval."]};
  if(Buffer.byteLength(canonicalGraphContext(body))>2_000_000)throw Error("Evidence package exceeds export budget");return {...body,packageHash:deliveryHash(canonicalGraphContext(body))};
 }
 return {
  async view(token:string|null,id:string):Promise<DeliveryView>{const {state,p,capabilities}=await load(token,id);return {status:!state.submission&&(state.legacyDecision||state.record.state!=="draft")?"legacy_unbound":state.decision?(state.decision.outcome==="approve_with_limitations"?"reviewed":state.decision.outcome==="reject"?"rejected":"revision_requested"):state.submission?"awaiting_review":"draft",package:p,submission:state.submission,decision:state.decision,revision:state.revision,successor:state.successor,capabilities}},
  async submit(token:string|null,id:string){
   const {actor,state,p,capabilities}=await load(token,id);if(state.submission&&state.record.actorPrincipal===actor.principalId){if(state.decision)throw Error("This version is decided; use a linked revision");return {state:"awaiting_scientific_review",submissionId:state.submission.id,packageHash:state.submission.packageHash}}
   if(!capabilities.canSubmit||!p)throw Error("Submission requires owned draft, captured evidence and enabled writes");
   const bound=makePackage({...state.record,state:"awaiting_scientific_review"},p.context,state.revision);
   const submission={id:"submission-"+deliveryHash(id+bound.packageHash).slice(0,32),packageHash:bound.packageHash,submittedAt:deps.now?.()??new Date().toISOString(),submittedBy:actor.principalId};
   await deps.submit(actor,state,bound,submission);return {state:"awaiting_scientific_review",submissionId:submission.id,packageHash:bound.packageHash};
  },
  async decide(token:string|null,id:string,value:unknown){
   const d=parseReviewDecisionRequest(value);if(d.investigationId!==id)throw Error("Investigation mismatch");
   const {actor,state,p,capabilities}=await load(token,id);const requestHash=deliveryHash(canonicalGraphContext(d));
   if(state.decision){if(state.decision.reviewerPrincipal===actor.principalId&&state.decision.requestHash===requestHash)return state.decision;throw Error("Decision already recorded")}
   if(!capabilities.canDecide||!p||!state.submission)throw Error("Independent scientific reviewer and enabled writes required");
   assertReviewRequestForPackage(d,p,actor.principalId,state.submission);
   const body={schemaVersion:"hsi-review-decision-2" as const,id:"review-"+deliveryHash(JSON.stringify([actor.principalId,state.submission.id,d.requestId])).slice(0,32),investigationId:id,submissionId:state.submission.id,packageHash:p.packageHash,contextHash:p.context.contentHash,reviewerPrincipal:actor.principalId,reviewedAt:deps.now?.()??new Date().toISOString(),scope:"evidence_brief_only" as const,requestHash,outcome:d.outcome,rationale:d.rationale,reviewedClaimIds:d.reviewedClaimIds,limitations:d.limitations,conflictOfInterestDeclared:true as const};
   return deps.decide(actor,state,{...body,decisionHash:deliveryHash(canonicalGraphContext(body))});
  },
  async revise(token:string|null,id:string,value:unknown){
   const request=parseRevisionRequest(value),{actor,state,capabilities}=await load(token,id);
   if(state.record.actorPrincipal!==actor.principalId||!deps.writesEnabled||!actor.roles.some(r=>["researcher","research_admin"].includes(r))||state.decision?.outcome!=="request_revision")throw Error("Only an owner may revise a revision-requested investigation");
   if(!capabilities.canRevise&&!state.successor)throw Error("Revision unavailable");
   const createdAt=deps.now?.()??new Date().toISOString(),childId="hsi-interrogative-"+deliveryHash(actor.principalId+request.requestId+state.decision.id).slice(0,32);
   const child={...planSscInterrogation({question:request.question,actorPrincipal:actor.principalId,createdAt,dataClass:state.record.dataClass,focus:"systemic_sclerosis",release:state.record.release}),id:childId};
   const link={parentId:id,rootId:state.revision?.rootId??id,number:(state.revision?.number??1)+1,decisionId:state.decision.id,reason:request.reason};
   return deps.revise(actor,state,child,request.requestId,deliveryHash(canonicalGraphContext(request)),link);
  },
  async brief(token:string|null,id:string,format:"json"|"markdown"){
   const {state,p}=await load(token,id);if(!p||!state.submission&&(state.legacyDecision||state.record.state!=="draft"))throw Error("A verified, release-bound evidence context is required for this brief");
   const brief:EvidenceBrief={schemaVersion:"hsi-investigation-brief-1",package:p,submission:state.submission,decision:state.decision,scope:"research_only",graphPublicationApproved:false};
   const content=renderEvidenceBrief(brief,format),hash=deliveryHash(content);if(Buffer.byteLength(content)>2_000_000)throw Error("Brief exceeds export budget");
   return {content,hash,packageHash:p.packageHash,mime:format==="json"?"application/json":"text/markdown; charset=utf-8",filename:id+"-"+hash.slice(0,12)+(format==="json"?".json":".md")};
  }
 };
}
