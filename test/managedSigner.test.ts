import {expect,test} from "bun:test";
import {generateKeyPairSync,sign} from "node:crypto";
import {createInProcessSigner} from "../src/researchV2/sourceIntegrityService";
import {createManagedSigner,type SignMessage} from "../src/researchV2/managedSigner";

const good=generateKeyPairSync("ed25519"),other=generateKeyPairSync("ed25519");
const cfg=(signMessage:SignMessage,over:Record<string,unknown>={})=>({serviceRef:"kms:key-1",issuer:"authority:independent",keyId:"key-1",publicKey:good.publicKey,signMessage,...over});
const signWith=(k:typeof good):SignMessage=>async({message})=>new Uint8Array(sign(null,message,k.privateKey));

test("signs through the service and returns an 86-character base64url signature that verifies",async()=>{
 const seen:{value:{serviceRef:string;message:string}|null}={value:null};
 const s=createManagedSigner(cfg(async r=>{seen.value={serviceRef:r.serviceRef,message:Buffer.from(r.message).toString()};return signWith(good)(r)}));
 const out=await s.sign("receipt body");
 expect(out).toMatch(/^[A-Za-z0-9_-]{86}$/);expect(seen.value).toEqual({serviceRef:"kms:key-1",message:"receipt body"});expect(s.issuer).toBe("authority:independent");expect(s.keyId).toBe("key-1");
});
test("a signature from a different key is refused",async()=>{
 const s=createManagedSigner(cfg(signWith(other)));
 await expect(s.sign("x")).rejects.toThrow("does not verify");
});
test("malformed signatures are refused: wrong length, not bytes",async()=>{
 await expect(createManagedSigner(cfg(async()=>new Uint8Array(10))).sign("x")).rejects.toThrow("invalid signature");
 await expect(createManagedSigner(cfg((async()=>"abc") as never)).sign("x")).rejects.toThrow("invalid signature");
});
test("provider errors and deadlines surface as a generic error with no provider text",async()=>{
 const leaky=createManagedSigner(cfg(async()=>{throw new Error("AccessDenied arn:aws:kms:eu-west-2:123456789012:key/secret-id")}));
 const e=await leaky.sign("message").then(()=>new Error("no error"),(x:unknown)=>x as Error);expect(e.message).toBe("Managed signing failed");expect(e.message).not.toContain("arn");
 const slow=createManagedSigner(cfg(()=>new Promise(()=>{}),{timeoutMs:500}));
 expect((await slow.sign("x").then(()=>new Error("no error"),(x:unknown)=>x as Error)).message).toBe("Managed signing failed");
});
test("configuration is validated: ids, Ed25519 public key only, sane timeout",()=>{
 expect(()=>createManagedSigner(cfg(signWith(good),{serviceRef:"bad ref"}))).toThrow();
 expect(()=>createManagedSigner(cfg(signWith(good),{publicKey:good.privateKey}))).toThrow("Ed25519");
 expect(()=>createManagedSigner(cfg(signWith(good),{publicKey:generateKeyPairSync("rsa",{modulusLength:2048}).publicKey}))).toThrow("Ed25519");
 expect(()=>createManagedSigner(cfg(signWith(good),{publicKey:"not a key"}))).toThrow();
 expect(()=>createManagedSigner(cfg(signWith(good),{timeoutMs:10}))).toThrow();
});

test("is interchangeable with the in-process signer: Ed25519 is deterministic, so signatures are identical",async()=>{
 const managed=createManagedSigner(cfg(signWith(good))),local=createInProcessSigner({issuer:"authority:independent",keyId:"key-1",privateKey:good.privateKey});
 expect(await managed.sign("canonical receipt text")).toBe(await local.sign("canonical receipt text"));
});
