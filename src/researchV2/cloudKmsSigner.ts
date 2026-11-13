/**
 * Google Cloud KMS signing function for createManagedSigner. Ed25519 keys (EC_SIGN_ED25519) sign the raw message; the
 * private key never leaves Cloud KMS. This file is the ONLY place that knows about the Cloud KMS client, and it adds no
 * repository dependency: the client is injected, or loaded lazily from `@google-cloud/kms` by the operator who runs signing
 * (install it there with an exact version, tested against 6.3.0). Integrity is checked in both directions with CRC32C, as
 * Cloud KMS recommends, and the caller (createManagedSigner) still verifies the signature against the pinned public key.
 * Errors are generic: provider text, key names and message content are never surfaced.
 */
import type {SignMessage} from "./managedSigner";

export type CloudKmsClient={asymmetricSign(request:{name:string;data:Uint8Array;dataCrc32c:{value:number|string}}):Promise<[{signature?:Uint8Array|Buffer|string|null;signatureCrc32c?:{value?:number|string|null}|null;verifiedDataCrc32c?:boolean|null;name?:string|null},...unknown[]]>};
const KEY_VERSION=/^projects\/[a-z][a-z0-9-]{4,60}\/locations\/[a-z0-9-]{2,40}\/keyRings\/[A-Za-z0-9_-]{1,63}\/cryptoKeys\/[A-Za-z0-9_-]{1,63}\/cryptoKeyVersions\/[1-9][0-9]{0,8}$/;

const TABLE=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0x82f63b78:c>>>1;t[i]=c>>>0}return t})();
export function crc32c(data:Uint8Array):number{let c=0xffffffff;for(const b of data)c=TABLE[(c^b)&0xff]!^(c>>>8);return (c^0xffffffff)>>>0}

/** `keyVersionName` must name one exact key VERSION: signing never follows a "primary" pointer. */
export function createCloudKmsSignMessage(cfg:{keyVersionName:string;client:CloudKmsClient}):SignMessage{
 if(!KEY_VERSION.test(cfg.keyVersionName)||!cfg.client||typeof cfg.client.asymmetricSign!=="function")throw Error("Invalid Cloud KMS signer configuration");
 const name=cfg.keyVersionName,client=cfg.client;
 return async({message,signal})=>{
  if(signal.aborted)throw Error("Cloud KMS signing aborted");
  const data=new Uint8Array(message);
  const [res]=await client.asymmetricSign({name,data,dataCrc32c:{value:crc32c(data)}});
  if(signal.aborted)throw Error("Cloud KMS signing aborted");
  if(!res||res.verifiedDataCrc32c!==true)throw Error("Cloud KMS did not confirm the request data");
  if(res.name!=null&&res.name!==name)throw Error("Cloud KMS signed with a different key version");
  const raw=res.signature;
  const sig=typeof raw==="string"?new Uint8Array(Buffer.from(raw,"base64")):raw instanceof Uint8Array?new Uint8Array(raw):null;
  if(!sig||sig.length!==64)throw Error("Cloud KMS returned an invalid signature");
  const claimed=res.signatureCrc32c?.value;
  if(claimed==null||Number(claimed)!==crc32c(sig))throw Error("Cloud KMS signature failed its integrity check");
  return sig;
 };
}

/** Lazy loader for the real client. The specifier is a variable so the repository neither bundles nor type-resolves it. */
export async function loadCloudKmsClient():Promise<CloudKmsClient>{
 const specifier="@google-cloud/kms";
 let mod:{KeyManagementServiceClient?:new()=>CloudKmsClient};
 try{mod=await import(specifier)}catch{throw Error("@google-cloud/kms is not installed where signing runs; install an exact version there")}
 if(typeof mod.KeyManagementServiceClient!=="function")throw Error("Unexpected @google-cloud/kms module shape");
 return new mod.KeyManagementServiceClient();
}
