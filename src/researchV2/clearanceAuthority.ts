/**
 * The independent authority's workflow (attest, revoke) and the read-only, file-backed SourceAuthorityAdapter the
 * runtime consults. Two directories on purpose:
 *  - private directory (authority only): private-key.pem and attestations.jsonl (who attested what, with what evidence)
 *  - publish directory (readable by the runtime): authority.json (public key), receipts/, revocations.jsonl
 * The runtime reads only the publish directory and never sees a private key. The adapter performs NO trust decision of its
 * own: it serves candidate receipts; the existing verifier checks signature, expiry, digest and actions, and revocations
 * count only if signed by the authority. Missing files mean "unknown", unreadable ones fail closed.
 */
import {appendFile,mkdir,readFile,rename,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {createHash,randomBytes,type KeyObject} from "node:crypto";
import type {SourceAuthorityAdapter} from "./operationalSourceClearance";
import type {SourceClearanceReceipt,SourceUseAction} from "./sourceClearanceReceipt";
import {buildUnsignedReceipt,loadPublicKey,sha256Hex,signReceipt,signRevocation,verifyRevocation,type Revocation} from "./clearanceSigning";

export type AttestRequest={sourceId:string;sourceVersion:string;canonicalId:string;licenceId:string;attribution:string;passages:string[]};
export type AttestSummary={sourceId:string;canonicalId:string;licenceId:string;actions:SourceUseAction[];validUntil:string;passages:{sha256:string;preview:string}[];evidence:string;operator:string};
export type AuthorityInfo={schemaVersion:"hsi-clearance-authority-1";issuer:string;keyId:string;publicKeyPem:string};
const MAX_PASSAGES=50;
export const receiptFileName=(sourceId:string,sourceVersion:string,passageSha256:string)=>`${createHash("sha256").update([sourceId,sourceVersion,passageSha256].join("|")).digest("hex")}.json`;

async function writeAtomic(path:string,text:string,mode:number){
 const temp=`${path}.${randomBytes(6).toString("hex")}.tmp`;
 await writeFile(temp,text,{mode,flag:"wx"});await rename(temp,path);
}

export async function attestSource(opts:{
 request:AttestRequest;authority:AuthorityInfo;privateKey:KeyObject;publishDir:string;privateDir:string;
 actions:readonly SourceUseAction[];validForMs:number;evidence:string;operator:string;
 /** A human decision. The CLI refuses to run without an interactive terminal; tests inject their own. */
 confirm:(summary:AttestSummary)=>Promise<boolean>;now?:()=>Date;
}):Promise<{declined:boolean;receipts:SourceClearanceReceipt[]}>{
 const {request}=opts,now=opts.now?.()??new Date();
 if(!Array.isArray(request.passages)||request.passages.length<1||request.passages.length>MAX_PASSAGES||new Set(request.passages).size!==request.passages.length)throw Error(`1 to ${MAX_PASSAGES} distinct passages required`);
 if(typeof opts.evidence!=="string"||opts.evidence.trim().length<10||opts.evidence.length>1000)throw Error("Evidence of what was checked is required (10 to 1000 characters)");
 if(typeof opts.operator!=="string"||!opts.operator.trim()||opts.operator.length>200)throw Error("Operator name is required");
 const unsigned=request.passages.map(passage=>buildUnsignedReceipt({issuer:opts.authority.issuer,keyId:opts.authority.keyId,sourceId:request.sourceId,sourceVersion:request.sourceVersion,
  canonicalId:request.canonicalId,passage,permittedActions:opts.actions,licenceId:request.licenceId,attribution:request.attribution,checkedAt:now,validForMs:opts.validForMs}));
 const summary:AttestSummary={sourceId:request.sourceId,canonicalId:request.canonicalId,licenceId:request.licenceId,actions:[...new Set(opts.actions)],validUntil:unsigned[0]!.expiresAt,evidence:opts.evidence.trim(),operator:opts.operator.trim(),
  passages:request.passages.map(p=>({sha256:sha256Hex(p),preview:p.slice(0,160)}))};
 if(await opts.confirm(structuredClone(summary))!==true)return {declined:true,receipts:[]};
 const receipts=unsigned.map(u=>signReceipt(u,opts.privateKey));
 await mkdir(join(opts.publishDir,"receipts"),{recursive:true});await mkdir(opts.privateDir,{recursive:true,mode:0o700});
 for(const r of receipts)await writeAtomic(join(opts.publishDir,"receipts",receiptFileName(r.sourceId,r.sourceVersion,r.passageSha256)),JSON.stringify(r),0o644);
 await appendFile(join(opts.privateDir,"attestations.jsonl"),`${JSON.stringify({at:now.toISOString(),operator:summary.operator,evidence:summary.evidence,sourceId:summary.sourceId,canonicalId:summary.canonicalId,licenceId:summary.licenceId,actions:summary.actions,receiptIds:receipts.map(r=>r.id),passageSha256:receipts.map(r=>r.passageSha256)})}\n`,{mode:0o600});
 return {declined:false,receipts};
}

export async function revokeReceipt(opts:{receiptId:string;reason:string;authority:AuthorityInfo;privateKey:KeyObject;publishDir:string;confirm:(summary:{receiptId:string;reason:string})=>Promise<boolean>;now?:()=>Date}):Promise<{declined:boolean;revocation:Revocation|null}>{
 if(await opts.confirm({receiptId:opts.receiptId,reason:opts.reason})!==true)return {declined:true,revocation:null};
 const revocation=signRevocation({receiptId:opts.receiptId,issuer:opts.authority.issuer,keyId:opts.authority.keyId,reason:opts.reason,revokedAt:opts.now?.()??new Date()},opts.privateKey);
 await mkdir(opts.publishDir,{recursive:true});await appendFile(join(opts.publishDir,"revocations.jsonl"),`${JSON.stringify(revocation)}\n`,{mode:0o644});
 return {declined:false,revocation};
}

export async function readAuthorityInfo(publishDir:string):Promise<AuthorityInfo>{
 const info=JSON.parse(await readFile(join(publishDir,"authority.json"),"utf8")) as AuthorityInfo;
 if(!info||info.schemaVersion!=="hsi-clearance-authority-1"||typeof info.issuer!=="string"||typeof info.keyId!=="string"||typeof info.publicKeyPem!=="string")throw Error("Invalid authority record");
 loadPublicKey(info.publicKeyPem);return info;
}

/** Read-only adapter over the publish directory. Serves candidates; the verifier decides. */
export async function createFileSourceAuthority(config:{publishDir:string;policyRef:string}){
 const info=await readAuthorityInfo(config.publishDir),publicKey=loadPublicKey(info.publicKeyPem),policyRef=config.policyRef;
 if(typeof policyRef!=="string"||!/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/.test(policyRef))throw Error("Invalid policy reference");
 async function revokedIds():Promise<Set<string>>{
  let text:string;
  try{text=await readFile(join(config.publishDir,"revocations.jsonl"),"utf8")}catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT")return new Set();throw e}
  const ids=new Set<string>();
  for(const line of text.split("\n").filter(Boolean)){
   const entry=JSON.parse(line); // a corrupt line throws: fail closed rather than ignoring a possible revocation
   if(verifyRevocation(entry,publicKey)&&entry.issuer===info.issuer&&entry.keyId===info.keyId)ids.add(entry.receiptId);
  }
  return ids;
 }
 const authority:SourceAuthorityAdapter={async lookup(binding){
  let receipt:SourceClearanceReceipt;
  try{receipt=JSON.parse(await readFile(join(config.publishDir,"receipts",receiptFileName(binding.sourceId,binding.sourceVersion,binding.passageSha256)),"utf8"))}
  catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT")return {state:"unknown" as const,policyRef};throw e}
  if(typeof receipt?.id==="string"&&(await revokedIds()).has(receipt.id))return {state:"revoked" as const,policyRef};
  return {state:"cleared" as const,policyRef,receipt};
 }};
 return {authority,info,publicKey,isRevoked:async(receiptId:string,issuer:string)=>issuer===info.issuer&&(await revokedIds()).has(receiptId)};
}
