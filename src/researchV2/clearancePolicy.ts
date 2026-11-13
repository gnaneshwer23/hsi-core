/**
 * Source clearance policy: a deterministic, versioned artifact that a NAMED HUMAN approves by signing it with their own key.
 * The integrity service may automate checks and issue receipts only inside a policy whose approval verifies against a pinned
 * authority key, is within its effective window and has not been revoked. No policy is shipped here: the only policies in this
 * repository are clearly labelled synthetic demonstrations signed with throwaway keys. Hard rules below cannot be weakened by
 * any policy: unknown or all-rights-reserved licences can never authorise more than retrieval, and retraction, prohibited uses
 * and policy failures always block.
 */
import {createHash,sign,verify,type KeyObject} from "node:crypto";
import type {SourceUseAction} from "./sourceClearanceReceipt";

export const SOURCE_USES=Object.freeze(["retrieval","full_text_processing","model_transmission","storage","display","comparison","export"] as const);
export type SourceUse=(typeof SOURCE_USES)[number];
export const RECEIPT_ACTION_USES:readonly SourceUseAction[]=Object.freeze(["model_transmission","storage","display","comparison","export"]);
export const LICENCE_FAMILIES=Object.freeze(["cc0","public-domain","cc-by","cc-by-sa","cc-by-nc","cc-by-nd","cc-by-nc-sa","cc-by-nc-nd","publisher-specific","all-rights-reserved","unknown"] as const);
export type LicenceFamily=(typeof LICENCE_FAMILIES)[number];
/** Families whose rights are unknown or reserved: a policy may authorise retrieval only. */
export const RESTRICTED_FAMILIES:readonly LicenceFamily[]=Object.freeze(["unknown","all-rights-reserved","publisher-specific"]);
export const MAX_POLICY_WINDOW_MS=90*86_400_000;
export const MAX_RECEIPT_VALIDITY_MS=86_400_000;
export type ProviderName="europe_pmc"|"crossref";

export type PolicyLicenceRule={family:LicenceFamily;authorisedUses:SourceUse[];prohibitedUses:SourceUse[];/** Accept a family-only provider label with no versioned licence URL. Default false. */acceptUnversionedLabel:boolean};
export type PolicyApproval={approvedBy:string;role:string;approvalRef:string;approvedAt:string;issuer:string;keyId:string;signature:string};
export type ClearancePolicy={
 schemaVersion:"hsi-source-clearance-policy-1";policyId:string;version:number;effectiveFrom:string;expiresAt:string;
 rules:{licences:PolicyLicenceRule[];tdmOnly:"review"|"block";correction:"review"|"block";expressionOfConcern:"review"|"block";maxEvidenceAgeMs:number;receiptValidityMs:number;requiredProviders:ProviderName[]};
 approval:PolicyApproval;
};
export type PolicyFailure="POLICY_NOT_AUTHORISED"|"POLICY_EXPIRED"|"POLICY_NOT_EFFECTIVE"|"POLICY_REVOKED"|"POLICY_INVALID";
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,127}$/;
const isoMs=(v:unknown)=>typeof v==="string"&&Number.isFinite(Date.parse(v))?Date.parse(v):NaN;

/** Canonical JSON (sorted keys, recursively) of the policy without the signature. */
export function policySigningText(policy:Omit<ClearancePolicy,"approval">&{approval:Omit<PolicyApproval,"signature">&{signature?:string}}):string{
 const canon=(v:unknown):unknown=>Array.isArray(v)?v.map(canon):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon((v as Record<string,unknown>)[k])])):v;
 const {signature:_omit,...approval}=policy.approval;
 return JSON.stringify(canon({...policy,approval}));
}
export const policyDigest=(policy:ClearancePolicy)=>createHash("sha256").update(policySigningText(policy)).digest("hex");

/** Structure and hard-rule validation. Throws on anything malformed or unsafe; never reads or trusts the signature. */
export function validatePolicyStructure(policy:unknown):asserts policy is ClearancePolicy{
 const p=policy as ClearancePolicy;
 const fail=(m:string):never=>{throw Error(`Invalid clearance policy: ${m}`)};
 if(!p||typeof p!=="object"||p.schemaVersion!=="hsi-source-clearance-policy-1")fail("schema");
 if(!ID.test(p.policyId)||!Number.isSafeInteger(p.version)||p.version<1)fail("identity");
 const from=isoMs(p.effectiveFrom),to=isoMs(p.expiresAt);
 if(!Number.isFinite(from)||!Number.isFinite(to)||to<=from||to-from>MAX_POLICY_WINDOW_MS)fail("window must be positive and at most 90 days");
 const r=p.rules;
 if(!r||!Array.isArray(r.licences)||r.licences.length>LICENCE_FAMILIES.length)fail("licence rules");
 const seen=new Set<string>();
 for(const rule of r.licences){
  if(!LICENCE_FAMILIES.includes(rule.family)||seen.has(rule.family))fail("duplicate or unknown licence family");seen.add(rule.family);
  for(const list of [rule.authorisedUses,rule.prohibitedUses])if(!Array.isArray(list)||list.some(u=>!SOURCE_USES.includes(u))||new Set(list).size!==list.length)fail("uses");
  if(rule.authorisedUses.some(u=>rule.prohibitedUses.includes(u)))fail("a use cannot be both authorised and prohibited");
  if(typeof rule.acceptUnversionedLabel!=="boolean")fail("acceptUnversionedLabel");
  if(RESTRICTED_FAMILIES.includes(rule.family)&&rule.authorisedUses.some(u=>u!=="retrieval"))fail(`${rule.family} may authorise retrieval only`);
  if(rule.authorisedUses.length&&!rule.authorisedUses.includes("retrieval"))fail("a licence that authorises any use must authorise retrieval");
 }
 for(const k of ["tdmOnly","correction","expressionOfConcern"] as const)if(r[k]!=="review"&&r[k]!=="block")fail(`${k} must be review or block`);
 if(!Number.isSafeInteger(r.maxEvidenceAgeMs)||r.maxEvidenceAgeMs<60_000||r.maxEvidenceAgeMs>86_400_000)fail("maxEvidenceAgeMs");
 if(!Number.isSafeInteger(r.receiptValidityMs)||r.receiptValidityMs<60_000||r.receiptValidityMs>MAX_RECEIPT_VALIDITY_MS)fail("receiptValidityMs must be at most 24 hours");
 if(!Array.isArray(r.requiredProviders)||r.requiredProviders.length<1||r.requiredProviders.some(x=>x!=="europe_pmc"&&x!=="crossref")||new Set(r.requiredProviders).size!==r.requiredProviders.length)fail("requiredProviders");
 const a=p.approval;
 if(!a||![a.approvedBy,a.role,a.approvalRef,a.issuer,a.keyId].every(v=>typeof v==="string"&&v.trim().length>0&&v.length<=200)||!ID.test(a.approvalRef)||!ID.test(a.issuer)||!ID.test(a.keyId)||!Number.isFinite(isoMs(a.approvedAt)))fail("approval record");
}

/** Signs a policy as the named approving human. Called on the approver's own machine (or by tests with a throwaway key). */
export function signPolicy(unsigned:Omit<ClearancePolicy,"approval">&{approval:Omit<PolicyApproval,"signature">},privateKey:KeyObject):ClearancePolicy{
 if(privateKey.type!=="private"||privateKey.asymmetricKeyType!=="ed25519")throw Error("Ed25519 private key required");
 const signature=sign(null,Buffer.from(policySigningText(unsigned)),privateKey).toString("base64url");
 const policy={...unsigned,approval:{...unsigned.approval,signature}} as ClearancePolicy;
 validatePolicyStructure(policy);return policy;
}

export type PolicyAuthority={issuer:string;keyId:string;publicKey:KeyObject};
/** A policy is usable only if structurally valid, signed by a pinned named approver, inside its window and not revoked. */
export async function verifyPolicyApproval(policy:unknown,options:{authorities:readonly PolicyAuthority[];now:number;isRevoked?:(policyId:string,version:number)=>Promise<boolean>}):Promise<{ok:true;policy:ClearancePolicy}|{ok:false;code:PolicyFailure;detail:string}>{
 try{validatePolicyStructure(policy)}catch(e){return {ok:false,code:"POLICY_INVALID",detail:e instanceof Error?e.message:"invalid"}}
 const p=policy as ClearancePolicy,a=p.approval;
 const authority=options.authorities.find(x=>x.issuer===a.issuer&&x.keyId===a.keyId);
 let signed=false;
 if(authority&&authority.publicKey.asymmetricKeyType==="ed25519"&&/^[A-Za-z0-9_-]{86}$/.test(a.signature)){try{signed=verify(null,Buffer.from(policySigningText(p)),authority.publicKey,Buffer.from(a.signature,"base64url"))}catch{signed=false}}
 if(!signed)return {ok:false,code:"POLICY_NOT_AUTHORISED",detail:"Approval signature does not verify against a pinned approver key"};
 if(isoMs(a.approvedAt)>options.now)return {ok:false,code:"POLICY_NOT_EFFECTIVE",detail:"Approval is dated in the future"};
 if(options.now<isoMs(p.effectiveFrom))return {ok:false,code:"POLICY_NOT_EFFECTIVE",detail:"Policy is not yet effective"};
 if(options.now>=isoMs(p.expiresAt))return {ok:false,code:"POLICY_EXPIRED",detail:"Policy has expired"};
 try{if(options.isRevoked&&await options.isRevoked(p.policyId,p.version)!==false)return {ok:false,code:"POLICY_REVOKED",detail:"Policy approval was revoked"}}catch{return {ok:false,code:"POLICY_REVOKED",detail:"Revocation status unavailable; failing closed"}}
 return {ok:true,policy:p};
}
