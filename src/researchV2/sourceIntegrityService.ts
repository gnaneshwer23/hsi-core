/**
 * Source Integrity & Clearance service. It automates checks and issues receipts only inside a policy that a named human approved
 * (verified on every call). It composes existing modules instead of replacing them: evidence from sourceEvidence, the decision from
 * the pure assessor, the receipt schema and verifier from sourceClearanceReceipt, publication/revocation files from clearanceAuthority,
 * the journal from stagingOperationStore, and it plugs into operationalSourceClearance as a SourceAuthorityAdapter, so content
 * that is not cleared never becomes an audit hit and therefore never reaches model processing.
 *
 * Signing: this service never holds a private key. It hands canonical bytes to a ReceiptSigner (a managed signing service in
 * production, an in-process signer only in tests and demonstrations) and attaches the returned signature. Receipts and decisions
 * contain no secrets and no passage text, only digests.
 */
import {createHash,sign,type KeyObject} from "node:crypto";
import type {SourceAuthorityAdapter} from "./operationalSourceClearance";
import type {ReceiptPublisher} from "./clearanceAuthority";
import {RECEIPT_ACTION_USES,policyDigest,verifyPolicyApproval,type PolicyAuthority,type SourceUse} from "./clearancePolicy";
import {assessSource,type IntegrityDecision} from "./sourceIntegrityAssessor";
import {attachSignature,buildUnsignedReceiptFromDigest,revocationSigningText,type Revocation} from "./clearanceSigning";
import {sourceClearanceSigningText,type SourceClearanceReceipt,type SourceUseAction} from "./sourceClearanceReceipt";
import type {SourceEvidence,SourceRef} from "./sourceEvidence";
import type {StagingOperationStore} from "./stagingOperationStore";

/** Production: a managed signing service (key never exposed). Tests and demonstrations: createInProcessSigner. */
export interface ReceiptSigner{issuer:string;keyId:string;sign(text:string):Promise<string>}
/** In-process signer for synthetic tests and demonstrations ONLY. Do not use with a real key. */
export function createInProcessSigner(opts:{issuer:string;keyId:string;privateKey:KeyObject}):ReceiptSigner{
 return {issuer:opts.issuer,keyId:opts.keyId,async sign(text){return sign(null,Buffer.from(text),opts.privateKey).toString("base64url")}};
}
export function parseSourceRef(sourceId:string):SourceRef|null{
 let m=/^europepmc:(PMC[1-9]\d{0,11})$/.exec(sourceId);if(m)return {pmcid:m[1]};
 m=/^pmid:([1-9]\d{0,11})$/.exec(sourceId);if(m)return {pmid:m[1]};
 m=/^doi:(10\.\S+)$/i.exec(sourceId);if(m)return {doi:m[1]};
 return null;
}
const licenceId=(e:SourceEvidence)=>`${e.licence.family.toUpperCase()}${e.licence.version?`-${e.licence.version}`:e.licence.status==="label_only"?"-UNVERSIONED":""}`;

export function createSourceIntegrityService(cfg:{
 policy:unknown;policyAuthorities:readonly PolicyAuthority[];isPolicyRevoked?:(policyId:string,version:number)=>Promise<boolean>;
 evidence:(ref:SourceRef,signal?:AbortSignal)=>Promise<SourceEvidence>;signer:ReceiptSigner;publisher:ReceiptPublisher;store:StagingOperationStore;
 uses:readonly SourceUse[];now?:()=>number;cacheMs?:number;
}){
 const now=cfg.now??Date.now,cacheMs=cfg.cacheMs??60_000;
 if(!cfg.signer||!cfg.signer.issuer||!cfg.signer.keyId||typeof cfg.signer.sign!=="function")throw Error("A receipt signer is required");
 const cache=new Map<string,{at:number;value:{decision:IntegrityDecision;evidence:SourceEvidence|null}}>();
 const refKey=(r:SourceRef)=>JSON.stringify([r.doi??null,r.pmid??null,r.pmcid??null]);
 const sourceKey=(r:SourceRef)=>createHash("sha256").update(refKey(r)).digest("hex").slice(0,24);

 async function policyState(){
  const v=await verifyPolicyApproval(cfg.policy,{authorities:cfg.policyAuthorities,now:now(),isRevoked:cfg.isPolicyRevoked});
  return v.ok?{policy:v.policy,failure:null}:{policy:null,failure:{code:v.code,detail:v.detail}};
 }
 async function assess(ref:SourceRef,options:{force?:boolean;signal?:AbortSignal}={}):Promise<{decision:IntegrityDecision;evidence:SourceEvidence|null}>{
  const ps=await policyState(),key=`${refKey(ref)}|${ps.policy?policyDigest(ps.policy):"none"}`;
  const hit=cache.get(key);
  if(!options.force&&hit&&now()-hit.at<cacheMs)return hit.value;
  let evidence:SourceEvidence|null=null;
  if(ps.policy){try{evidence=await cfg.evidence(ref,options.signal)}catch{evidence=null}}
  const decision=assessSource({evidence,uses:cfg.uses,policy:ps.policy,policyFailure:ps.failure,now:now()});
  await cfg.store.append({type:"source_integrity_decision",sourceKey:sourceKey(ref),ref:{doi:ref.doi??null,pmid:ref.pmid??null,pmcid:ref.pmcid??null},decision:decision.decision,reasonCodes:decision.reasonCodes,policyId:decision.policy?.policyId??null,policyVersion:decision.policy?.version??null,policyDigest:decision.policy?.digest??null,evidenceHash:decision.evidenceHash,uses:decision.requestedUses,expiresAt:decision.expiresAt,at:decision.evaluatedAt,scientificApproval:false,graphPromotable:false});
  const value={decision,evidence};cache.set(key,{at:now(),value});return value;
 }
 const events=()=>cfg.store.read();
 const revokedIds=()=>new Set(events().filter(e=>e.type==="source_integrity_revocation").map(e=>e.receiptId as string));

 /** A manual revocation places a HOLD on the source: no new receipt is issued for it until a human releases the hold. */
 async function revoke(receiptId:string,reason:string,options:{hold?:boolean}={}):Promise<Revocation>{
  const body={schemaVersion:"hsi-source-revocation-1" as const,receiptId,issuer:cfg.signer.issuer,keyId:cfg.signer.keyId,reason:reason.slice(0,500),revokedAt:new Date(now()).toISOString()};
  const signature=await cfg.signer.sign(revocationSigningText(body));
  if(!/^[A-Za-z0-9_-]{86}$/.test(signature))throw Error("Unexpected signature encoding");
  const revocation:Revocation={...body,signature};
  await cfg.publisher.putRevocation(revocation);
  const key=(events().find(e=>e.type==="source_integrity_receipt"&&e.receiptId===receiptId)?.sourceKey as string|undefined)??null;
  const hold=(options.hold??true)&&key!==null;
  await cfg.store.append({type:"source_integrity_revocation",receiptId,sourceKey:key,hold,reasonSummary:body.reason,at:body.revokedAt});
  return revocation;
 }
 const holdActive=(key:string)=>{
  const relevant=events().filter(e=>(e.type==="source_integrity_revocation"&&e.sourceKey===key&&e.hold===true)||(e.type==="source_integrity_hold_released"&&e.sourceKey===key));
  return relevant.length>0&&relevant[relevant.length-1]!.type==="source_integrity_revocation";
 };
 /** Human action: lets the service issue receipts for a held source again. The decision itself is still re-assessed from scratch. */
 async function releaseHold(ref:SourceRef,note:string):Promise<void>{
  if(typeof note!=="string"||note.trim().length<10)throw Error("A recorded reason of at least 10 characters is required");
  await cfg.store.append({type:"source_integrity_hold_released",sourceKey:sourceKey(ref),noteSummary:note.trim().slice(0,300),at:new Date(now()).toISOString()});
 }

 async function issueReceipt(input:{sourceId:string;sourceVersion:string;ref:SourceRef;passageSha256:string;signal?:AbortSignal}):Promise<{decision:IntegrityDecision;receipt:SourceClearanceReceipt|null}>{
  const {decision,evidence}=await assess(input.ref,{signal:input.signal});
  if(decision.decision==="CLEAR"&&holdActive(sourceKey(input.ref)))return {decision:{...decision,decision:"BLOCK",reasonCodes:["REVOKED"],reasons:["Permission was revoked and has not been re-approved by a human"],grantedUses:[],expiresAt:null},receipt:null};
  if(decision.decision!=="CLEAR"||!evidence)return {decision,receipt:null};
  const t=now(),policyHash=decision.policy!.digest;
  const existing=await cfg.publisher.getReceipt(input.sourceId,input.sourceVersion,input.passageSha256);
  if(existing&&!revokedIds().has(existing.id)&&Date.parse(existing.expiresAt)-t>300_000&&existing.attribution.includes(`policy-digest:${policyHash.slice(0,16)}`)&&existing.attribution.includes(`evidence:${decision.evidenceHash!.slice(0,16)}`))return {decision,receipt:existing};
  const canonicalId=evidence.identity.pmid?`PMID:${evidence.identity.pmid}`:evidence.identity.doi?`DOI:${evidence.identity.doi}`:null;
  const validForMs=Date.parse(decision.expiresAt!)-t;
  if(!canonicalId||validForMs<60_000){
   const downgraded:IntegrityDecision={...decision,decision:"REVIEW",reasonCodes:[canonicalId?"POLICY_EXPIRED":"IDENTITY_UNRESOLVED"],reasons:[canonicalId?"Too little policy or evidence validity remains to issue a receipt":"No PMID or DOI to bind a receipt to"],grantedUses:[],expiresAt:null};
   return {decision:downgraded,receipt:null};
  }
  const granted=decision.grantedUses.filter((u):u is SourceUseAction=>(RECEIPT_ACTION_USES as readonly string[]).includes(u));
  const unsigned=buildUnsignedReceiptFromDigest({issuer:cfg.signer.issuer,keyId:cfg.signer.keyId,sourceId:input.sourceId,sourceVersion:input.sourceVersion,canonicalId,passageSha256:input.passageSha256,permittedActions:granted,
   licenceId:licenceId(evidence),attribution:`${(evidence.identity.title??"source").slice(0,300)} | policy ${decision.policy!.policyId}:v${decision.policy!.version} approved by ${decision.policy!.approvedBy} (${decision.policy!.approvalRef}) | policy-digest:${policyHash.slice(0,16)} | evidence:${decision.evidenceHash!.slice(0,16)}`,
   checkedAt:new Date(t),validForMs});
  const receipt=attachSignature(unsigned,await cfg.signer.sign(sourceClearanceSigningText(unsigned)));
  await cfg.publisher.putReceipt(receipt);
  await cfg.store.append({type:"source_integrity_receipt",receiptId:receipt.id,sourceId:input.sourceId,sourceVersion:input.sourceVersion,sourceKey:sourceKey(input.ref),ref:{doi:input.ref.doi??null,pmid:input.ref.pmid??null,pmcid:input.ref.pmcid??null},passageSha256:input.passageSha256,policyDigest:policyHash,expiresAt:receipt.expiresAt,at:receipt.checkedAt});
  return {decision,receipt};
 }

 /** Re-checks every live receipt against current evidence and the current policy; revokes whatever no longer holds. */
 async function reevaluate(options:{signal?:AbortSignal}={}):Promise<{checked:number;revoked:{receiptId:string;sourceId:string;reasonCodes:string[]}[]}>{
  const t=now(),gone=revokedIds(),live=events().filter(e=>e.type==="source_integrity_receipt"&&!gone.has(e.receiptId as string)&&Date.parse(e.expiresAt as string)>t);
  const bySource=new Map<string,typeof live>();for(const e of live)bySource.set(e.sourceKey as string,[...(bySource.get(e.sourceKey as string)??[]),e]);
  const revoked:{receiptId:string;sourceId:string;reasonCodes:string[]}[]=[];
  for(const [,receipts] of bySource){
   const ref=receipts[0]!.ref as SourceRef,{decision}=await assess(ref,{force:true,signal:options.signal});
   for(const r of receipts){
    const superseded=decision.policy?.digest!==undefined&&r.policyDigest!==decision.policy.digest;
    if(decision.decision!=="CLEAR"||superseded){
     const codes=decision.decision!=="CLEAR"?decision.reasonCodes:["POLICY_SUPERSEDED"];
     await revoke(r.receiptId as string,`Re-evaluation: ${codes.join(", ")}`,{hold:false});revoked.push({receiptId:r.receiptId as string,sourceId:r.sourceId as string,reasonCodes:[...codes]});
    }
   }
  }
  return {checked:live.length,revoked};
 }

 const authority:SourceAuthorityAdapter={async lookup(binding){
  const ps=await policyState(),policyRef=ps.policy?`${ps.policy.policyId}:v${ps.policy.version}`:"policy:not-authorised";
  const ref=parseSourceRef(binding.sourceId);
  if(!ref)return {state:"unknown" as const,policyRef};
  const {decision,receipt}=await issueReceipt({sourceId:binding.sourceId,sourceVersion:binding.sourceVersion,ref,passageSha256:binding.passageSha256});
  if(receipt)return {state:"cleared" as const,policyRef,receipt};
  const codes=decision.reasonCodes;
  const state=codes.includes("REVOKED")?"revoked" as const:codes.includes("RETRACTED")?"retracted" as const:codes.includes("CORRECTION_NOTICE")&&decision.decision==="BLOCK"?"corrected" as const:codes.includes("IDENTITY_CONFLICT")?"identifier_conflict" as const:"unknown" as const;
  return {state,policyRef};
 }};
 return {assess,issueReceipt,revoke,releaseHold,reevaluate,authority,policyState};
}
