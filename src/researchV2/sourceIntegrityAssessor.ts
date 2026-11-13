/**
 * Deterministic source integrity decision: CLEAR, REVIEW or BLOCK with machine-readable reason codes.
 * Pure: same evidence, uses, policy and time always give the same decision. CLEAR is possible only when every requested use is
 * explicitly authorised for the source's licence by an approved, current policy AND identity, retraction status and both required
 * providers answered affirmatively. Anything unknown, ambiguous, stale or unavailable is REVIEW (a human decides); retraction,
 * a prohibited use or an unusable policy is BLOCK. Policies can choose review or block for corrections, expressions of concern and
 * TDM-only licences, but can never weaken the hard rules.
 */
import {SOURCE_USES,type ClearancePolicy,type PolicyFailure,type SourceUse} from "./clearancePolicy";
import {policyDigest} from "./clearancePolicy";
import type {SourceEvidence} from "./sourceEvidence";

export type Decision="CLEAR"|"REVIEW"|"BLOCK";
export const REASON_CODES=Object.freeze(["CLEAR_PRE_AUTHORISED","POLICY_NOT_AUTHORISED","POLICY_EXPIRED","POLICY_NOT_EFFECTIVE","POLICY_REVOKED","POLICY_INVALID","PROVIDER_UNAVAILABLE","REQUIRED_PROVIDER_MISSING","EVIDENCE_STALE","IDENTITY_UNRESOLVED","IDENTITY_CONFLICT","RETRACTED","REVOKED","CORRECTION_NOTICE","EXPRESSION_OF_CONCERN","INTEGRITY_UNKNOWN","LICENCE_MISSING","LICENCE_CONFLICT","LICENCE_LABEL_ONLY","LICENCE_TDM_ONLY","LICENCE_NOT_IN_POLICY","USE_NOT_AUTHORISED","USE_PROHIBITED"] as const);
export type ReasonCode=(typeof REASON_CODES)[number];
export type IntegrityDecision={
 schemaVersion:"hsi-source-integrity-decision-1";decision:Decision;reasonCodes:ReasonCode[];reasons:string[];
 requestedUses:SourceUse[];grantedUses:SourceUse[];
 policy:{policyId:string;version:number;approvedBy:string;approvalRef:string;digest:string}|null;
 licence:{family:string;version:string|null;urls:string[]}|null;evidenceHash:string|null;evaluatedAt:string;expiresAt:string|null;
};
/** Any use of the text implies retrieval and full-text processing, so a policy must authorise both. A retrieval-only request (a locator) needs retrieval alone. */
export function expandUses(uses:readonly SourceUse[]):SourceUse[]{
 if(!Array.isArray(uses)||!uses.length||uses.some(u=>!SOURCE_USES.includes(u)))throw Error("A non-empty list of known uses is required");
 const touchesText=uses.some(u=>u!=="retrieval");
 return SOURCE_USES.filter(u=>u==="retrieval"||(u==="full_text_processing"&&touchesText)||uses.includes(u));
}
type Finding={code:ReasonCode;severity:"REVIEW"|"BLOCK";text:string};

export function assessSource(input:{evidence:SourceEvidence|null;uses:readonly SourceUse[];policy:ClearancePolicy|null;policyFailure:{code:PolicyFailure;detail:string}|null;now:number}):IntegrityDecision{
 const requestedUses=expandUses(input.uses),evaluatedAt=new Date(input.now).toISOString(),ev=input.evidence;
 const base={schemaVersion:"hsi-source-integrity-decision-1" as const,requestedUses,evaluatedAt,evidenceHash:ev?.evidenceHash??null,licence:ev?{family:ev.licence.family,version:ev.licence.version,urls:ev.licence.urls}:null};
 const policyInfo=input.policy?{policyId:input.policy.policyId,version:input.policy.version,approvedBy:input.policy.approval.approvedBy,approvalRef:input.policy.approval.approvalRef,digest:policyDigest(input.policy)}:null;
 if(input.policyFailure||!input.policy)return {...base,decision:"BLOCK",reasonCodes:[input.policyFailure?.code??"POLICY_NOT_AUTHORISED"],reasons:[input.policyFailure?.detail??"No approved policy"],grantedUses:[],policy:policyInfo,expiresAt:null};
 const policy=input.policy,rules=policy.rules,findings:Finding[]=[];
 const add=(code:ReasonCode,severity:"REVIEW"|"BLOCK",text:string)=>{if(!findings.some(f=>f.code===code))findings.push({code,severity,text})};
 if(!ev){add("PROVIDER_UNAVAILABLE","REVIEW","No source evidence could be gathered")}
 else{
  const age=input.now-Date.parse(ev.retrievedAt);
  if(!Number.isFinite(age)||age<0||age>rules.maxEvidenceAgeMs)add("EVIDENCE_STALE","REVIEW","Evidence is older than the policy allows or is dated in the future");
  for(const p of rules.requiredProviders){
   const s=ev.providers[p];
   if(s==="unavailable")add("PROVIDER_UNAVAILABLE","REVIEW",`${p} was unavailable`);
   else if(s!=="ok")add("REQUIRED_PROVIDER_MISSING","REVIEW",`${p} returned no usable record`);
  }
  if(ev.identity.status==="conflict")add("IDENTITY_CONFLICT","REVIEW",ev.identity.detail);
  else if(ev.identity.status==="unresolved")add("IDENTITY_UNRESOLVED","REVIEW",ev.identity.detail);
  if(ev.integrity.retraction==="retracted")add("RETRACTED","BLOCK","A retraction was reported for this source");
  else if(ev.integrity.retraction==="unknown")add("INTEGRITY_UNKNOWN","REVIEW","Retraction status could not be confirmed");
  if(ev.integrity.correction==="corrected")add("CORRECTION_NOTICE",rules.correction==="block"?"BLOCK":"REVIEW","A correction or erratum was reported");
  else if(ev.integrity.correction==="unknown")add("INTEGRITY_UNKNOWN","REVIEW","Correction status could not be confirmed");
  if(ev.integrity.expressionOfConcern==="flagged")add("EXPRESSION_OF_CONCERN",rules.expressionOfConcern==="block"?"BLOCK":"REVIEW","An expression of concern was reported");
  else if(ev.integrity.expressionOfConcern==="unknown")add("INTEGRITY_UNKNOWN","REVIEW","Expression-of-concern status could not be confirmed");
  const lic=ev.licence;
  if(lic.status==="missing")add("LICENCE_MISSING","REVIEW","No licence evidence was found");
  else if(lic.status==="conflict")add("LICENCE_CONFLICT","REVIEW","Licence evidence disagrees between providers");
  else if(lic.status==="tdm_only")add("LICENCE_TDM_ONLY",rules.tdmOnly==="block"?"BLOCK":"REVIEW","Only text-and-data-mining terms were reported, which are not passage reuse rights");
  else{
   const rule=rules.licences.find(r=>r.family===lic.family);
   if(lic.status==="label_only"&&!(rule?.acceptUnversionedLabel))add("LICENCE_LABEL_ONLY","REVIEW","Only an unversioned provider label was found");
   else if(!rule)add("LICENCE_NOT_IN_POLICY","REVIEW",`The ${lic.family} licence is not covered by the approved policy`);
   else{
    const prohibited=requestedUses.filter(u=>rule.prohibitedUses.includes(u)),unauthorised=requestedUses.filter(u=>!rule.authorisedUses.includes(u)&&!rule.prohibitedUses.includes(u));
    if(prohibited.length)add("USE_PROHIBITED","BLOCK",`The policy prohibits: ${prohibited.join(", ")}`);
    if(unauthorised.length)add("USE_NOT_AUTHORISED","REVIEW",`The policy does not authorise: ${unauthorised.join(", ")}`);
   }
  }
 }
 const order={BLOCK:0,REVIEW:1};
 findings.sort((a,b)=>order[a.severity]-order[b.severity]||REASON_CODES.indexOf(a.code)-REASON_CODES.indexOf(b.code));
 const decision:Decision=findings.some(f=>f.severity==="BLOCK")?"BLOCK":findings.length?"REVIEW":"CLEAR";
 if(decision==="CLEAR"){
  const expires=Math.min(input.now+rules.receiptValidityMs,Date.parse(policy.expiresAt),Date.parse(ev!.retrievedAt)+rules.maxEvidenceAgeMs);
  return {...base,decision,reasonCodes:["CLEAR_PRE_AUTHORISED"],reasons:["Every requested use is authorised for this licence by the approved policy and identity, retraction and providers are confirmed"],grantedUses:requestedUses,policy:policyInfo,expiresAt:new Date(expires).toISOString()};
 }
 return {...base,decision,reasonCodes:findings.map(f=>f.code),reasons:findings.map(f=>f.text),grantedUses:[],policy:policyInfo,expiresAt:null};
}
