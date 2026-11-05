/** Browser-safe Phase D contracts and deterministic briefs. These functions grant no authority. */
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeValidation";
import {canonicalGraphContext,verifyInvestigationGraphContext,type InvestigationGraphContext} from "./investigationGraphContext";
import {rejectPhiPayload} from "./cdsPhiBoundary";
export const DELIVERY_METHOD="hsi-evidence-brief-method-1" as const;
export type RevisionLink={parentId:string;rootId:string;number:number;decisionId:string;reason:string};
export type ReviewPackage={schemaVersion:"hsi-review-package-1";investigation:InterrogativeInvestigation;investigationHash:string;context:InvestigationGraphContext;revision:RevisionLink|null;method:typeof DELIVERY_METHOD;limitations:string[];packageHash:string};
export type ReviewOutcome="approve_with_limitations"|"request_revision"|"reject";
export type ReviewDecisionRequest={schemaVersion:"hsi-review-request-2";investigationId:string;submissionId:string;packageHash:string;requestId:string;outcome:ReviewOutcome;rationale:string;reviewedClaimIds:string[];limitations:string[];conflictOfInterestDeclared:true};
export type DeliveryDecision={schemaVersion:"hsi-review-decision-2";id:string;investigationId:string;submissionId:string;packageHash:string;contextHash:string;reviewerPrincipal:string;reviewedAt:string;scope:"evidence_brief_only";requestHash:string;outcome:ReviewOutcome;rationale:string;reviewedClaimIds:string[];limitations:string[];conflictOfInterestDeclared:true;decisionHash:string};
export type DeliverySubmission={id:string;packageHash:string;submittedAt:string;submittedBy:string};
export type DeliveryView={status:"draft"|"awaiting_review"|"reviewed"|"revision_requested"|"rejected"|"legacy_unbound";package:ReviewPackage|null;submission:DeliverySubmission|null;decision:DeliveryDecision|null;revision:RevisionLink|null;successor:{id:string;number:number}|null;capabilities:{canSubmit:boolean;canDecide:boolean;canRevise:boolean;writesEnabled:boolean}};
export const canonicalInvestigationRecord=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonicalInvestigationRecord).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonicalInvestigationRecord(v)).join(",")+"}":JSON.stringify(x)??"null";
const sha=/^[a-f0-9]{64}$/;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const id=/^hsi-interrogative-[a-zA-Z0-9-]{8,100}$/;
function exact(x:unknown,keys:string[]){if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!==[...keys].sort().join(","))throw Error("Invalid delivery request")}
export function parseReviewDecisionRequest(value:unknown):ReviewDecisionRequest{
 exact(value,["schemaVersion","investigationId","submissionId","packageHash","requestId","outcome","rationale","reviewedClaimIds","limitations","conflictOfInterestDeclared"]);
 const d=value as ReviewDecisionRequest;
 if(d.schemaVersion!=="hsi-review-request-2"||!id.test(d.investigationId)||typeof d.submissionId!=="string"||!/^submission-[a-f0-9]{32}$/.test(d.submissionId)||!sha.test(d.packageHash)||!uuid.test(d.requestId)||!["approve_with_limitations","request_revision","reject"].includes(d.outcome)||typeof d.rationale!=="string"||d.rationale.trim().length<30||d.rationale.length>4000||!Array.isArray(d.reviewedClaimIds)||d.reviewedClaimIds.length>100||new Set(d.reviewedClaimIds).size!==d.reviewedClaimIds.length||d.reviewedClaimIds.some(c=>typeof c!=="string"||!/^HSI-C-[A-Za-z0-9-]{1,110}$/.test(c))||!Array.isArray(d.limitations)||d.limitations.length>8||d.limitations.some(s=>typeof s!=="string"||!s.trim()||s.length>250)||d.conflictOfInterestDeclared!==true)throw Error("Invalid accountable review request");
 if(!rejectPhiPayload({textBlobs:[d.rationale,...d.limitations]}).ok)throw Error("Identifying information is not permitted");
 return {...d,rationale:d.rationale.trim(),limitations:d.limitations.map(s=>s.trim())};
}
export type RevisionRequest={requestId:string;question:string;reason:string};
export function parseRevisionRequest(value:unknown):RevisionRequest{
 exact(value,["requestId","question","reason"]);const x=value as RevisionRequest;
 if(!uuid.test(x.requestId)||typeof x.question!=="string"||!x.question.trim()||x.question.trim().length>500||typeof x.reason!=="string"||x.reason.trim().length<30||x.reason.length>3000||!rejectPhiPayload({textBlobs:[x.question,x.reason]}).ok)throw Error("A non-identifying research question and substantive revision response are required");
 return {requestId:x.requestId,question:x.question.trim(),reason:x.reason.trim()};
}
export function packageClaimIds(p:ReviewPackage):string[]{return p.context.primary.bundle.claims.map(c=>c.id)}
export function assertReviewRequestForPackage(d:ReviewDecisionRequest,p:ReviewPackage,reviewerPrincipal:string,submission:DeliverySubmission){
 if(reviewerPrincipal===p.investigation.actorPrincipal||submission.submittedBy===reviewerPrincipal)throw Error("Independent reviewer required");
 if(d.investigationId!==p.investigation.id||d.packageHash!==p.packageHash||d.submissionId!==submission.id||submission.packageHash!==p.packageHash||p.investigation.state!=="awaiting_scientific_review")throw Error("Review package or submission mismatch");
 const ids=new Set(packageClaimIds(p));if(d.reviewedClaimIds.some(id=>!ids.has(id)))throw Error("Claim outside submitted primary release");
 if(d.outcome==="approve_with_limitations"&&(!d.reviewedClaimIds.length||!d.limitations.length))throw Error("Acceptance requires examined evidence and explicit limitations");
}
export async function verifyReviewPackage(value:unknown,digest:(text:string)=>Promise<string>):Promise<ReviewPackage>{
 exact(value,["schemaVersion","investigation","investigationHash","context","revision","method","limitations","packageHash"]);
 const p=value as ReviewPackage;
 if(!p||p.schemaVersion!=="hsi-review-package-1"||p.method!==DELIVERY_METHOD||!sha.test(p.packageHash)||!sha.test(p.investigationHash)||!Array.isArray(p.limitations)||p.limitations.some(s=>typeof s!=="string"||!s.trim()))throw Error("Invalid review package");
 validateInterrogativeInvestigation(p.investigation);await verifyInvestigationGraphContext(p.context,p.investigation,digest);
 const {packageHash,...body}=p;if(await digest(canonicalGraphContext(body))!==packageHash||await digest(canonicalInvestigationRecord(p.investigation))!==p.investigationHash)throw Error("Review package integrity failure");
 if(p.revision!==null&&(!id.test(p.revision.parentId)||!id.test(p.revision.rootId)||!Number.isInteger(p.revision.number)||p.revision.number<2||typeof p.revision.reason!=="string"||p.revision.reason.length>3000))throw Error("Invalid revision lineage");
 return p;
}
export async function verifyDeliveryDecision(value:unknown,p:ReviewPackage,submission:DeliverySubmission,digest:(text:string)=>Promise<string>):Promise<DeliveryDecision>{
 exact(value,["schemaVersion","id","investigationId","submissionId","packageHash","contextHash","reviewerPrincipal","reviewedAt","scope","requestHash","outcome","rationale","reviewedClaimIds","limitations","conflictOfInterestDeclared","decisionHash"]);
 const d=value as DeliveryDecision;
 if(d.schemaVersion!=="hsi-review-decision-2"||!/^review-[a-f0-9]{32}$/.test(d.id)||d.investigationId!==p.investigation.id||d.submissionId!==submission.id||d.packageHash!==p.packageHash||d.contextHash!==p.context.contentHash||d.scope!=="evidence_brief_only"||!sha.test(d.decisionHash)||!sha.test(d.requestHash)||typeof d.reviewerPrincipal!=="string"||!d.reviewerPrincipal.trim()||d.reviewerPrincipal===p.investigation.actorPrincipal||!Number.isFinite(Date.parse(d.reviewedAt)))throw Error("Invalid independent decision binding");
 const request=parseReviewDecisionRequest({schemaVersion:"hsi-review-request-2",investigationId:d.investigationId,submissionId:d.submissionId,packageHash:d.packageHash,requestId:"00000000-0000-4000-8000-000000000000",outcome:d.outcome,rationale:d.rationale,reviewedClaimIds:d.reviewedClaimIds,limitations:d.limitations,conflictOfInterestDeclared:d.conflictOfInterestDeclared});
 assertReviewRequestForPackage(request,p,d.reviewerPrincipal,submission);
 const {decisionHash,...body}=d;if(await digest(canonicalGraphContext(body))!==decisionHash)throw Error("Decision hash mismatch");return d;
}
export async function verifyDeliveryView(value:unknown,id:string,digest:(text:string)=>Promise<string>):Promise<DeliveryView>{
 exact(value,["status","package","submission","decision","revision","successor","capabilities"]);
 const v=value as DeliveryView;
 if(!v||!["draft","awaiting_review","reviewed","revision_requested","rejected","legacy_unbound"].includes(v.status)||!v.capabilities||Object.values(v.capabilities).some(x=>typeof x!=="boolean")||Object.keys(v.capabilities).sort().join(",")!=="canDecide,canRevise,canSubmit,writesEnabled")throw Error("Invalid delivery response");
 if(v.package){await verifyReviewPackage(v.package,digest);if(v.package.investigation.id!==id)throw Error("Wrong investigation package")}
 if(v.submission&&(!v.package||v.submission.packageHash!==v.package.packageHash||v.submission.submittedBy!==v.package.investigation.actorPrincipal||!/^submission-[a-f0-9]{32}$/.test(v.submission.id)||!Number.isFinite(Date.parse(v.submission.submittedAt))))throw Error("Invalid submission binding");
 if(v.decision){if(!v.package||!v.submission)throw Error("Unbound decision");await verifyDeliveryDecision(v.decision,v.package,v.submission,digest)}
 if(v.decision&&v.status!==(v.decision.outcome==="approve_with_limitations"?"reviewed":v.decision.outcome==="reject"?"rejected":"revision_requested"))throw Error("Decision status mismatch");
 if((v.capabilities.canSubmit||v.capabilities.canDecide||v.capabilities.canRevise)&&!v.capabilities.writesEnabled)throw Error("Invalid write capability");
 if(v.capabilities.canSubmit&&(!v.package||v.submission||v.decision||v.status!=="draft"))throw Error("Invalid submission capability");
 if(v.capabilities.canDecide&&(!v.package||!v.submission||v.decision||v.status!=="awaiting_review"))throw Error("Invalid reviewer capability");
 if(v.capabilities.canRevise&&(!v.decision||v.decision.outcome!=="request_revision"||v.successor))throw Error("Invalid revision capability");
 if(v.successor&&(!idPattern(v.successor.id)||!Number.isInteger(v.successor.number)||v.successor.number<2))throw Error("Invalid revision successor");
 return v;
}
function idPattern(value:unknown):boolean{return typeof value==="string"&&id.test(value)}
export type EvidenceBrief={schemaVersion:"hsi-investigation-brief-1";package:ReviewPackage;submission:DeliverySubmission|null;decision:DeliveryDecision|null;scope:"research_only";graphPublicationApproved:false};
/** Markdown is inert downloadable text; imported scientific strings cannot create active markup. */
const md=(s:string)=>s.replace(/\\/g,"\\\\").replace(/[<>\[\]*_`#|]/g,c=>"\\"+c).replace(/\r/g,"").replace(/\n/g," ");
export function renderEvidenceBrief(brief:EvidenceBrief,format:"json"|"markdown"):string{
 if(format==="json")return JSON.stringify(JSON.parse(canonicalGraphContext(brief)),null,2)+"\n";
 const p=brief.package,d=brief.decision;
 const lines=["# Human Super Intelligence — research evidence brief","",md(p.investigation.question),"",`Investigation: ${p.investigation.id}`,`Package SHA-256: ${p.packageHash}`,`Investigation SHA-256: ${p.investigationHash}`,`Evidence context SHA-256: ${p.context.contentHash}`,`Primary release: ${p.context.primary.release.id} v${p.context.primary.release.version}`,`Release manifest: ${p.context.primary.release.manifestHash}`,`Method: ${p.method}`,`Review: ${d?d.outcome:"Not independently reviewed"}`,"","## Scope and limitations","","Research only. Review concerns this evidence brief; candidate mechanisms, patient decisions and graph publication are not approved.",...p.limitations.map(x=>"- "+md(x)),"","## Investigation assessment","",md(p.investigation.conclusion.text),...p.investigation.conclusion.limitations.map(x=>"- "+md(x))];
 for(const [label,e] of [["Primary SSc evidence",p.context.primary],["Separate RA comparison",p.context.comparison]] as const){if(!e)continue;lines.push("",`## ${label}`,"",`Release: ${e.release.id} v${e.release.version}`,`Manifest: ${e.release.manifestHash}`);
  for(const c of e.bundle.claims){const r=e.bundle.relationships.find(r=>r.id===c.relationshipId)!;lines.push("",`### ${md(c.id)}`,"",md(c.statement),`Relationship: ${md(r.subjectId)} → ${md(r.predicate)} → ${md(r.objectId)}`,`Study context: ${md(e.studyContexts[r.id]!)}`,`Species: ${r.context.species??"not supplied"}; system: ${r.context.experimentalSystem??"not supplied"}; assay: ${md(r.context.assay??"not supplied")}; timepoint: ${md(r.context.timepoint??"not supplied")}`);
   for(const id of c.passageIds){const passage=e.bundle.passages.find(x=>x.id===id)!,s=e.bundle.sources.find(x=>x.id===passage.sourceId)!;lines.push("",md(s.title),`PMID: ${s.pmid??"not supplied"}; DOI: ${md(s.doi??"not supplied")}`,`Source URL: ${md(s.url??"not supplied")}`,`Locator: ${md(passage.locator)}`,`Source version: ${md(passage.sourceVersion)}`,`Passage SHA-256: ${passage.sha256}`,"","> "+md(passage.text));}
  }
 }
 if(p.revision)lines.push("","## Revision lineage","",`Parent: ${p.revision.parentId}`,`Root: ${p.revision.rootId}; revision: ${p.revision.number}`,`Responds to decision: ${p.revision.decisionId}`,md(p.revision.reason));
 if(d)lines.push("","## Independent decision","",`Decision: ${d.id}`,`Decision SHA-256: ${d.decisionHash}`,`Reviewer: ${md(d.reviewerPrincipal)}`,`Recorded at: ${d.reviewedAt}`,`Bound package: ${d.packageHash}`,`Bound context: ${d.contextHash}`,md(d.rationale),...d.limitations.map(s=>"- "+md(s)));
 lines.push("","## Unreviewed bibliographic context","",`Catalogue version: ${p.context.workingEvidence.version}`,"Exact publication/disease matches are context only; no candidate is promoted by this brief.",...p.context.workingEvidence.claimIds.map(id=>"- "+id),"");return lines.join("\n");
}
