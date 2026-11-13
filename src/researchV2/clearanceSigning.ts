/**
 * Signing primitives for the INDEPENDENT source-clearance authority (a named person, not an engineer or an agent).
 * The runtime only ever verifies receipts (sourceClearanceReceipt.ts); this module is what lets that person issue them.
 * Receipts are built to the exact verifier contract: 17 fields, Ed25519 over the canonical signing text, validity of at
 * most 24 hours. The private key never leaves the authority's machine and is never read by the runtime or any agent.
 * A receipt can only assert the three clean outcomes (identity matched, rights verified, retraction clear); there is
 * no way to sign a negative or partial finding.
 */
import {createHash,createPrivateKey,createPublicKey,generateKeyPairSync,randomBytes,sign,verify,type KeyObject} from "node:crypto";
import {createSourceClearanceVerifier,sourceClearanceSigningText,type SourceClearanceReceipt,type SourceUseAction} from "./sourceClearanceReceipt";

export const MAX_VALIDITY_MS=86_400_000;
export const ALL_ACTIONS:readonly SourceUseAction[]=Object.freeze(["model_transmission","storage","display","comparison","export"]);
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/;
const CANONICAL=/^PMID:[1-9]\d*$|^DOI:10\.[^\s]+$/;
export const sha256Hex=(text:string)=>createHash("sha256").update(text).digest("hex");

export function generateAuthorityKeyPair():{publicKeyPem:string;privateKeyPem:string}{
 const {publicKey,privateKey}=generateKeyPairSync("ed25519");
 return {publicKeyPem:publicKey.export({type:"spki",format:"pem"}).toString(),privateKeyPem:privateKey.export({type:"pkcs8",format:"pem"}).toString()};
}
export function loadPublicKey(pem:string):KeyObject{
 const key=createPublicKey(pem);
 if(key.asymmetricKeyType!=="ed25519")throw Error("Ed25519 public key required");
 return key;
}
export function loadPrivateKey(pem:string):KeyObject{
 const key=createPrivateKey(pem);
 if(key.asymmetricKeyType!=="ed25519")throw Error("Ed25519 private key required");
 return key;
}

export type ReceiptInput={
 issuer:string;keyId:string;sourceId:string;sourceVersion:string;canonicalId:string;passage:string;
 permittedActions:readonly SourceUseAction[];licenceId:string;attribution:string;checkedAt:Date;validForMs:number;
};
export type ReceiptDigestInput=Omit<ReceiptInput,"passage">&{passageSha256:string};
/** Validates every field against the verifier contract before anything is signed. */
export function buildUnsignedReceipt(input:ReceiptInput):Omit<SourceClearanceReceipt,"signature">{
 if(typeof input.passage!=="string"||!input.passage.trim()||input.passage.length>3000)throw Error("Passage must be 1 to 3000 characters");
 const {passage,...rest}=input;
 return buildUnsignedReceiptFromDigest({...rest,passageSha256:sha256Hex(passage)});
}
/** Same validation for callers that hold only the passage digest (the clearance path never needs the passage text). */
export function buildUnsignedReceiptFromDigest(input:ReceiptDigestInput):Omit<SourceClearanceReceipt,"signature">{
 const strings=[input.issuer,input.keyId,input.sourceId,input.sourceVersion,input.licenceId];
 if(strings.some(s=>typeof s!=="string"||!ID.test(s)))throw Error("Invalid receipt identifier");
 if(typeof input.canonicalId!=="string"||!CANONICAL.test(input.canonicalId)||input.canonicalId.length>2048)throw Error("Canonical id must be PMID:<n> or DOI:10.<...>");
 if(typeof input.attribution!=="string"||!input.attribution.trim()||input.attribution.length>2048)throw Error("Attribution is required");
 if(typeof input.passageSha256!=="string"||!/^[a-f0-9]{64}$/.test(input.passageSha256))throw Error("Passage digest must be a SHA-256 hex string");
 const actions=[...new Set(input.permittedActions)];
 if(!actions.length||actions.some(a=>!ALL_ACTIONS.includes(a)))throw Error("Permitted actions must be a non-empty subset of the known actions");
 if(!(input.checkedAt instanceof Date)||!Number.isFinite(input.checkedAt.getTime()))throw Error("Invalid check time");
 if(!Number.isSafeInteger(input.validForMs)||input.validForMs<60_000||input.validForMs>MAX_VALIDITY_MS)throw Error("Validity must be between one minute and 24 hours");
 const passageSha256=input.passageSha256,checkedAt=input.checkedAt.toISOString(),expiresAt=new Date(input.checkedAt.getTime()+input.validForMs).toISOString();
 const id="clearance:"+sha256Hex([input.issuer,input.keyId,input.sourceId,input.sourceVersion,passageSha256,checkedAt,randomBytes(8).toString("hex")].join("|")).slice(0,32);
 return {schemaVersion:"hsi-source-clearance-1",id,issuer:input.issuer,keyId:input.keyId,sourceId:input.sourceId,sourceVersion:input.sourceVersion,canonicalId:input.canonicalId,
  passageSha256,permittedActions:actions,licenceId:input.licenceId,attribution:input.attribution,identity:"matched",rights:"verified",retraction:"clear",checkedAt,expiresAt};
}
/** Attaches a signature produced elsewhere (for example by a managed signing service) after checking its encoding. */
export function attachSignature(unsigned:Omit<SourceClearanceReceipt,"signature">,signature:string):SourceClearanceReceipt{
 if(typeof signature!=="string"||!/^[A-Za-z0-9_-]{86}$/.test(signature))throw Error("Unexpected signature encoding");
 return {...unsigned,signature};
}
export function signReceipt(unsigned:Omit<SourceClearanceReceipt,"signature">,privateKey:KeyObject):SourceClearanceReceipt{
 if(privateKey.type!=="private"||privateKey.asymmetricKeyType!=="ed25519")throw Error("Ed25519 private key required");
 const signature=sign(null,Buffer.from(sourceClearanceSigningText(unsigned)),privateKey).toString("base64url");
 if(!/^[A-Za-z0-9_-]{86}$/.test(signature))throw Error("Unexpected signature encoding");
 return {...unsigned,signature};
}

/** Verifies with the SAME code the runtime uses, so a receipt this tool issues is accepted exactly when the runtime would accept it. */
export async function verifyReceipt(receipt:unknown,options:{publicKey:KeyObject;passage:string;now?:()=>number;isRevoked?:(id:string)=>Promise<boolean>}):Promise<boolean>{
 const r=receipt as Partial<SourceClearanceReceipt>|null;
 if(!r||typeof r.issuer!=="string"||typeof r.keyId!=="string"||typeof r.sourceId!=="string"||typeof r.sourceVersion!=="string"||!Array.isArray(r.permittedActions))return false;
 try{
  const verifier=createSourceClearanceVerifier({authorities:[{issuer:r.issuer,keyId:r.keyId,publicKey:options.publicKey}],isRevoked:async id=>options.isRevoked?options.isRevoked(id):false,now:options.now,requiredActions:["storage"]});
  return await verifier.authorize({receipt,sourceId:r.sourceId,sourceVersion:r.sourceVersion,passage:options.passage,requiredActions:r.permittedActions as SourceUseAction[]});
 }catch{return false}
}

/** Revocations are authority-signed so a forged entry cannot revoke, and a valid one cannot be mistaken for anything else. */
export type Revocation={schemaVersion:"hsi-source-revocation-1";receiptId:string;issuer:string;keyId:string;reason:string;revokedAt:string;signature:string};
export const revocationSigningText=(r:Omit<Revocation,"signature">)=>JSON.stringify({issuer:r.issuer,keyId:r.keyId,reason:r.reason,receiptId:r.receiptId,revokedAt:r.revokedAt,schemaVersion:r.schemaVersion});
export function signRevocation(input:{receiptId:string;issuer:string;keyId:string;reason:string;revokedAt:Date},privateKey:KeyObject):Revocation{
 if(!ID.test(input.receiptId)||!ID.test(input.issuer)||!ID.test(input.keyId)||typeof input.reason!=="string"||!input.reason.trim()||input.reason.length>500||!Number.isFinite(input.revokedAt.getTime()))throw Error("Invalid revocation");
 const body={schemaVersion:"hsi-source-revocation-1" as const,receiptId:input.receiptId,issuer:input.issuer,keyId:input.keyId,reason:input.reason.trim(),revokedAt:input.revokedAt.toISOString()};
 return {...body,signature:sign(null,Buffer.from(revocationSigningText(body)),privateKey).toString("base64url")};
}
export function verifyRevocation(value:unknown,publicKey:KeyObject):value is Revocation{
 const r=value as Revocation;
 if(!r||typeof r!=="object"||Object.keys(r).sort().join(",")!=="issuer,keyId,reason,receiptId,revokedAt,schemaVersion,signature"||r.schemaVersion!=="hsi-source-revocation-1")return false;
 if(typeof r.signature!=="string"||!/^[A-Za-z0-9_-]{86}$/.test(r.signature))return false;
 const {signature,...body}=r;
 try{return verify(null,Buffer.from(revocationSigningText(body)),publicKey,Buffer.from(signature,"base64url"))}catch{return false}
}
