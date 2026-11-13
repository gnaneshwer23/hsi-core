/**
 * ReceiptSigner backed by a managed signing service (for example a cloud KMS Ed25519 sign operation). The private key never
 * enters this process: only message bytes go out and a signature comes back. The adapter is provider-agnostic: the caller
 * supplies `signMessage`, a thin function around the provider SDK (for AWS KMS: Sign with SigningAlgorithm ED25519_SHA_512
 * and MessageType RAW). Defences against a misbehaving or substituted service: the signature must be 64 bytes, must verify
 * against the PINNED public key before it is returned, calls have a deadline, and failures throw a generic error that never
 * carries provider text, key identifiers or the message.
 */
import {createPublicKey,verify,type KeyObject} from "node:crypto";
import type {ReceiptSigner} from "./sourceIntegrityService";

export type SignMessage=(request:{serviceRef:string;message:Uint8Array;signal:AbortSignal})=>Promise<Uint8Array>;
const ID=/^[A-Za-z0-9][A-Za-z0-9:_./-]{0,255}$/;

export function createManagedSigner(cfg:{serviceRef:string;issuer:string;keyId:string;publicKey:KeyObject|string;signMessage:SignMessage;timeoutMs?:number}):ReceiptSigner{
 if(![cfg.serviceRef,cfg.issuer,cfg.keyId].every(v=>typeof v==="string"&&ID.test(v))||typeof cfg.signMessage!=="function")throw Error("Invalid managed signer configuration");
 const timeoutMs=cfg.timeoutMs??5000;
 if(!Number.isInteger(timeoutMs)||timeoutMs<500||timeoutMs>30_000)throw Error("Invalid managed signer configuration");
 let publicKey:KeyObject;
 try{publicKey=typeof cfg.publicKey==="string"?createPublicKey(cfg.publicKey):cfg.publicKey}catch{throw Error("Invalid managed signer public key")}
 if(publicKey.type!=="public"||publicKey.asymmetricKeyType!=="ed25519")throw Error("Managed signer public key must be Ed25519");
 return {issuer:cfg.issuer,keyId:cfg.keyId,async sign(text:string){
  const message=Buffer.from(text),c=new AbortController(),timer=setTimeout(()=>c.abort(),timeoutMs);
  let sig:Uint8Array;
  try{
   sig=await Promise.race([cfg.signMessage({serviceRef:cfg.serviceRef,message,signal:c.signal}),new Promise<never>((_,rej)=>c.signal.addEventListener("abort",()=>rej(Error("deadline"))))]);
  }catch{throw Error("Managed signing failed")}
  finally{clearTimeout(timer)}
  if(!(sig instanceof Uint8Array)||sig.length!==64)throw Error("Managed signing returned an invalid signature");
  if(!verify(null,message,publicKey,sig))throw Error("Managed signing returned a signature that does not verify against the pinned key");
  return Buffer.from(sig).toString("base64url");
 }};
}
