/** B-04.4.5: bounded claim challenge protocol; no model is a source of truth. */
import type {PassageResult} from "./passageVerification";
export type EntailmentVerdict="supports"|"contradicts"|"insufficient"|"not_assessed";
export interface IndependentChallenge{claimId:string;verifierId:string;modelOrMethod:string;verdict:EntailmentVerdict;evidenceSpan:string|null;reason:string;independentEvidenceSourceIds:string[];}
export interface Adjudication{claimId:string;disposition:"candidate_only"|"exception_review"|"insufficient_evidence";agreement:"concordant"|"disputed"|"unassessed";humanEscalation:boolean;scientificApproval:false;graphPromotable:false;reasons:string[];}
export function adjudicateClaim(receipt:PassageResult,challenges:IndependentChallenge[],minIndependent=2):Adjudication{
 if(!receipt||!Array.isArray(challenges)||!Number.isInteger(minIndependent)||minIndependent<2||minIndependent>5)throw Error("Invalid adjudication input");
 if(challenges.length>20||challenges.some(c=>!c||c.claimId!==receipt.claimId||!c.verifierId||!c.modelOrMethod||!["supports","contradicts","insufficient","not_assessed"].includes(c.verdict)||typeof c.reason!=="string"||!Array.isArray(c.independentEvidenceSourceIds)))throw Error("Invalid challenge");
 const distinct=new Set(challenges.map(c=>c.verifierId));
 if(distinct.size!==challenges.length)throw Error("Duplicate verifier identities");
 const reasons:string[]=[];
 if(receipt.disposition!=="grounded_candidate")reasons.push("Passage verification did not pass");
 if(challenges.length<minIndependent)reasons.push("Insufficient independent challenges");
 if(challenges.some(c=>c.verdict==="contradicts"))reasons.push("Contradictory scientific assessment");
 if(challenges.some(c=>c.verdict==="insufficient"||c.verdict==="not_assessed"))reasons.push("Scientific evidence is insufficient or not assessed");
 if(challenges.some(c=>c.verdict==="supports"&&(!c.evidenceSpan||!c.evidenceSpan.trim()||c.independentEvidenceSourceIds.length===0)))reasons.push("Supporting challenge lacks evidence");
 const support=challenges.length>=minIndependent&&challenges.every(c=>c.verdict==="supports")&&reasons.length===0;
 const disputed=challenges.some(c=>c.verdict==="contradicts")&&challenges.some(c=>c.verdict==="supports");
 return {claimId:receipt.claimId,disposition:support?"candidate_only":disputed||receipt.disposition==="exception_review"?"exception_review":"insufficient_evidence",agreement:disputed?"disputed":support?"concordant":"unassessed",humanEscalation:!support,scientificApproval:false,graphPromotable:false,reasons:support?["Concordant challenges; scientific validity and independence remain unproven"]:reasons};
}
