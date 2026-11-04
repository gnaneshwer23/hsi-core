/** ARCH-003 Step 7: immutable human scientific-review decision contract.
 * AI agents cannot sign or publish review decisions.
 * This pure validator requires independently authenticated server-side authority.
 */
import {createHash} from "node:crypto";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "./interrogativeContracts";
const canonical=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonical).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}":JSON.stringify(x)??"null";
export const fingerprintReviewSnapshot=(x:InterrogativeInvestigation):string=>createHash("sha256").update(canonical(x)).digest("hex");
export type HsiScientificReviewDecision={
 schemaVersion:"hsi-interrogative-scientific-review-1";
 decisionId:string;investigationId:string;investigationHash:string;
 releaseId:string;releaseManifestHash:string;
 reviewerPrincipal:string;reviewedAt:string;
 outcome:"approve_with_limitations"|"request_revision"|"reject";
 rationale:string;reviewedClaimIds:readonly string[];
 limitations:readonly string[];conflictOfInterestDeclared:boolean;
};
export type VerifiedScientificReviewer={
 principalId:string;authenticated:true;scope:"ssc";role:"scientific_reviewer";
 authorityVerifiedAt:string;
};
export function validateHsiScientificReview(input:{
 investigation:InterrogativeInvestigation;
 reviewer:VerifiedScientificReviewer|null;
 decision:HsiScientificReviewDecision;
}):void{
 const {investigation:i,reviewer:r,decision:d}=input;
 validateInterrogativeInvestigation(i);
 if(i.state!=="awaiting_scientific_review"||i.review!==null)throw Error("Investigation not awaiting review");
 if(!r?.authenticated||r.role!=="scientific_reviewer"||r.scope!=="ssc"||!r.principalId.trim())throw Error("Verified SSc scientific reviewer required");
 if(!Number.isFinite(Date.parse(r.authorityVerifiedAt))||!Number.isFinite(Date.parse(d.reviewedAt)))throw Error("Invalid review timestamp");
 if(r.principalId!==d.reviewerPrincipal||r.principalId===i.actorPrincipal)throw Error("Independent reviewer required");
 if(d.schemaVersion!=="hsi-interrogative-scientific-review-1"||!d.decisionId.trim()||d.investigationId!==i.id||d.investigationHash!==fingerprintReviewSnapshot(i))throw Error("Investigation identity or content hash mismatch");
 if(d.releaseId!==i.release.id||d.releaseManifestHash!==i.release.manifestHash)throw Error("Release provenance mismatch");
 if(!d.conflictOfInterestDeclared||!d.rationale.trim()||d.rationale.length>4000)throw Error("Accountable review rationale and COI declaration required");
 if(!["approve_with_limitations","request_revision","reject"].includes(d.outcome))throw Error("Invalid human review outcome");
 const claims=new Set(i.branches.flatMap(b=>[...b.supporting,...b.opposing].map(e=>e.claimId)));
 if(new Set(d.reviewedClaimIds).size!==d.reviewedClaimIds.length||d.reviewedClaimIds.some(id=>!claims.has(id)))throw Error("Unrecognised reviewed claim");
 if(d.outcome==="approve_with_limitations"&&(!d.limitations.length||!d.reviewedClaimIds.length))throw Error("Approval requires reviewed evidence and limitations");
 if(d.outcome==="approve_with_limitations"&&i.branches.every(b=>!b.supporting.length))throw Error("Cannot approve without eligible evidence");
}
export function fingerprintHsiReviewDecision(d:HsiScientificReviewDecision):string{
 return createHash("sha256").update(JSON.stringify(d)).digest("hex");
}
export function prepareHumanReviewedInvestigation(input:{
 investigation:InterrogativeInvestigation;reviewer:VerifiedScientificReviewer|null;decision:HsiScientificReviewDecision;
}):InterrogativeInvestigation{
 validateHsiScientificReview(input);
 const {investigation:i,decision:d}=input;
 const next:InterrogativeInvestigation={...i,state:d.outcome==="reject"?"rejected":d.outcome==="request_revision"?"draft":"reviewed",
 review:d.outcome==="approve_with_limitations"?{reviewerPrincipal:d.reviewerPrincipal,reviewDecisionId:d.decisionId,reviewedAt:d.reviewedAt}:null};
 validateInterrogativeInvestigation(next);
 // This is an in-memory representation, not a database write or publication.
 return next;
}
