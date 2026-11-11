/** Verify source-authority receipts; never issue rights or scientific approval. */
import {createHash,verify,type KeyObject} from "node:crypto";
export interface SourceClearanceReceipt {
 schemaVersion:"hsi-source-clearance-1";
 id:string;issuer:string;keyId:string;sourceId:string;sourceVersion:string;canonicalId:string;
 passageSha256:string;permittedActions:string[];licenceId:string;attribution:string;
 identity:"matched";rights:"verified";retraction:"clear";
 checkedAt:string;expiresAt:string;signature:string;
}
export type ClearanceBinding={receipt:unknown;sourceId:string;sourceVersion:string;passage:string};
export interface SourceClearanceVerifier {authorize:(binding:ClearanceBinding)=>Promise<boolean>;}
const fields=["schemaVersion","id","issuer","keyId","sourceId","sourceVersion","canonicalId","passageSha256","permittedActions","licenceId","attribution","identity","rights","retraction","checkedAt","expiresAt","signature"];
/** Canonical signed bytes for the independent authority, excluding only signature. */
export function sourceClearanceSigningText(receipt:Omit<SourceClearanceReceipt,"signature">|SourceClearanceReceipt):string{
 return JSON.stringify(Object.fromEntries(fields.filter(k=>k!=="signature").sort().map(k=>[k,receipt[k as keyof typeof receipt]])));
}
export function createSourceClearanceVerifier(config:{
 authorities:readonly {issuer:string;keyId:string;publicKey:KeyObject}[];
 isRevoked:(receiptId:string,issuer:string,signal:AbortSignal)=>Promise<boolean>;
 now?:()=>number;maxAgeMs?:number;revocationTimeoutMs?:number;
}):SourceClearanceVerifier{
 const maxAge=config.maxAgeMs??86400000;
 const timeoutMs=config.revocationTimeoutMs??1000;
 if(!Number.isSafeInteger(maxAge)||maxAge<1||maxAge>86400000||!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>10000||typeof config.isRevoked!=="function")throw Error("Invalid clearance policy");
 const authorities=config.authorities.map(a=>({...a}));
 if(!authorities.length||authorities.some(a=>!a.issuer.trim()||!a.keyId.trim()||a.publicKey.type!=="public"||a.publicKey.asymmetricKeyType!=="ed25519")||new Set(authorities.map(a=>JSON.stringify([a.issuer,a.keyId]))).size!==authorities.length)throw Error("Pinned Ed25519 source authorities required");
 const now=config.now??Date.now;
 const isRevoked=config.isRevoked;
 return {async authorize(binding){
  try{
   // Snapshot untrusted input across awaits to prevent caller mutation.
   const r=structuredClone(binding.receipt) as SourceClearanceReceipt;
   if(!r||typeof r!=="object"||Array.isArray(r)||Object.keys(r).sort().join(",")!==[...fields].sort().join(","))return false;
   if(fields.filter(k=>k!=="permittedActions").some(k=>typeof r[k as keyof SourceClearanceReceipt]!=="string"||!(r[k as keyof SourceClearanceReceipt] as string).trim()||(r[k as keyof SourceClearanceReceipt] as string).length>2048))return false;
   if(r.schemaVersion!=="hsi-source-clearance-1"||r.identity!=="matched"||r.rights!=="verified"||r.retraction!=="clear"||!/^PMID:[1-9]\d*$|^DOI:10\.[^\s]+$/.test(r.canonicalId))return false;
   if(!Array.isArray(r.permittedActions)||r.permittedActions.length>10||r.permittedActions.some(a=>typeof a!=="string"||a.length>100)||!r.permittedActions.includes("model_transmission"))return false;
   if(!binding.sourceVersion||r.sourceId!==binding.sourceId||r.sourceVersion!==binding.sourceVersion||!/^[a-f0-9]{64}$/.test(r.passageSha256)||r.passageSha256!==createHash("sha256").update(binding.passage).digest("hex"))return false;
   const checked=Date.parse(r.checkedAt),expiry=Date.parse(r.expiresAt),current=now();
   if(!Number.isFinite(current)||!Number.isFinite(checked)||!Number.isFinite(expiry)||checked>current||expiry<=current||expiry<=checked||expiry-checked>maxAge||current-checked>maxAge)return false;
   const authority=authorities.find(a=>a.issuer===r.issuer&&a.keyId===r.keyId);
   if(!authority||!/^[A-Za-z0-9_-]{86}$/.test(r.signature)||!verify(null,Buffer.from(sourceClearanceSigningText(r)),authority.publicKey,Buffer.from(r.signature,"base64url")))return false;
   const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
   try{
    const revoked=await Promise.race([isRevoked(r.id,r.issuer,controller.signal),new Promise<never>((_,reject)=>{
     timer=setTimeout(()=>{controller.abort();reject(Error("Clearance lookup deadline"));},timeoutMs);
    })]);
    if(revoked!==false)return false;
   }finally{if(timer)clearTimeout(timer);controller.abort();}
   const after=now();return Number.isFinite(after)&&after>=checked&&after<expiry&&after-checked<=maxAge;
  }catch{return false;}
 }};
}
