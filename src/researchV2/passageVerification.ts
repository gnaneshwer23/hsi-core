/**
 * B-04.4.2/3: rights-aware source identity and exact-span claim grounding.
 * This accepts independently retrieved source material; it does NOT fetch, license,
 * authenticate publishers, establish biological truth, or publish graph claims.
 */
export interface VerifiedSourceEnvelope {
 sourceId:string; canonicalId:string; sourceUrl:string; retrievedAt:string;
 sourceKind:"publication"; identifierKind:"PMID"|"DOI";
 identityChecked:boolean; correctionStatus:"clear"|"corrected"|"retracted"|"unknown";
 rights:{passageUsePermitted:boolean;licenceId:string|null;basis:string|null};
 passage:{text:string;sha256:string;start:number;end:number}|null;
}
export interface EvidenceClaim {
 id:string; sourceId:string; exactQuote:string;
 subjectId:string;predicate:string;objectId:string;
 context:{diseaseIds:string[];species:string|null;tissueId:string|null;cellId:string|null;method:string|null};
}
export type PassageResult={
 claimId:string;sourceId:string;
 disposition:"grounded_candidate"|"needs_evidence"|"exception_review";
 checks:{sourceIdentity:boolean;sourceStatus:boolean;rights:boolean;passageHash:boolean;exactSpan:boolean;biologicalContext:boolean};
 findings:string[];scientificTruthEstablished:false;graphPromotable:false;humanApproval:false;
};
const id=/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;
const validId=(s:unknown)=>typeof s==="string"&&id.test(s);
export const PASSAGE_CHECK_KEYS=["sourceIdentity","sourceStatus","rights","passageHash","exactSpan","biologicalContext"] as const;
/** A disposition label alone never establishes successful passage grounding. */
export function isGroundedPassageResult(receipt:PassageResult|null|undefined):boolean{
 return !!receipt&&validId(receipt.claimId)&&validId(receipt.sourceId)&&receipt.disposition==="grounded_candidate"&&!!receipt.checks&&Object.keys(receipt.checks).sort().join(",")===[...PASSAGE_CHECK_KEYS].sort().join(",")&&PASSAGE_CHECK_KEYS.every(key=>receipt.checks[key]===true)&&receipt.scientificTruthEstablished===false&&receipt.graphPromotable===false&&receipt.humanApproval===false;
}
export function requiresScientificException(predicate:string):boolean{
 return ["causes","treats","cures","prevents"].includes(predicate.trim().toLowerCase());
}
const sha=/^[a-f0-9]{64}$/;
const bytes=(s:string)=>new TextEncoder().encode(s);
async function digest(s:string):Promise<string>{
 const result=await crypto.subtle.digest("SHA-256",bytes(s));
 return [...new Uint8Array(result)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function verifyPassageClaim(source:VerifiedSourceEnvelope,claim:EvidenceClaim):Promise<PassageResult>{
 source=structuredClone(source);claim=structuredClone(claim);
 if(!source||!claim||!validId(source.sourceId)||!validId(claim.id)||!validId(claim.sourceId)||!validId(claim.subjectId)||!validId(claim.objectId)||claim.sourceId!==source.sourceId||typeof claim.predicate!=="string"||!claim.predicate.trim()||claim.predicate.length>128)throw Error("Invalid source/claim contract");
 const findings:string[]=[];
 const identity=source.identityChecked===true&&source.sourceKind==="publication"&&((source.identifierKind==="PMID"&&/^PMID:[0-9]+$/.test(source.canonicalId))||(source.identifierKind==="DOI"&&/^DOI:10\.[^\s]{3,180}$/.test(source.canonicalId)))&&/^https:\/\//.test(source.sourceUrl)&&Number.isFinite(Date.parse(source.retrievedAt));
 if(!identity)findings.push("Source identity has not been independently checked");
 const status=source.correctionStatus==="clear";
 if(!status)findings.push("Retraction/correction status is not clear; requires exception review");
 const rights=source.rights?.passageUsePermitted===true&&typeof source.rights.licenceId==="string"&&source.rights.licenceId.trim().length>0&&typeof source.rights.basis==="string"&&source.rights.basis.trim().length>0;
 if(!rights)findings.push("Passage rights have not been documented");
 const passage=source.passage;
 const hash=!!passage&&sha.test(passage.sha256)&&passage.sha256===await digest(passage.text);
 if(!hash)findings.push("Passage digest mismatch or missing");
 const span=!!passage&&Number.isInteger(passage.start)&&Number.isInteger(passage.end)&&passage.start>=0&&passage.end>passage.start&&passage.end<=passage.text.length&&claim.exactQuote.length>0&&claim.exactQuote.length<=3000&&passage.text.slice(passage.start,passage.end)===claim.exactQuote;
 if(!span)findings.push("Claim quotation does not match the declared source span");
 const context=Array.isArray(claim.context?.diseaseIds)&&claim.context.diseaseIds.every(validId)&&new Set(claim.context.diseaseIds).size===claim.context.diseaseIds.length&&[claim.context.species,claim.context.tissueId,claim.context.cellId,claim.context.method].every(v=>v===null||(typeof v==="string"&&v.length>0&&v.length<=128));
 if(!context)findings.push("Biological context invalid or missing");
 const highRisk=requiresScientificException(claim.predicate);
 if(highRisk)findings.push("Causal or therapeutic claim requires independent scientific adjudication");
 const checks={sourceIdentity:identity,sourceStatus:status,rights,passageHash:hash,exactSpan:span,biologicalContext:context};
 const disposition=highRisk||!status?"exception_review":Object.values(checks).every(Boolean)?"grounded_candidate":"needs_evidence";
 return {claimId:claim.id,sourceId:source.sourceId,disposition,checks,findings,scientificTruthEstablished:false,graphPromotable:false,humanApproval:false};
}
