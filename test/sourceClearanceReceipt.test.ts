import {describe,it,expect} from "bun:test";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createSourceClearanceVerifier,sourceClearanceSigningText,type SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";

const {publicKey,privateKey}=generateKeyPairSync("ed25519");
const time=Date.parse("2026-11-11T12:00:00Z");
const passage="Human cells express a marker.";
function receipt(changes:Partial<SourceClearanceReceipt>={}):SourceClearanceReceipt{
 const r:SourceClearanceReceipt={schemaVersion:"hsi-source-clearance-1",id:"receipt1",issuer:"test-authority",keyId:"test-key",sourceId:"s1",sourceVersion:"v1",canonicalId:"PMID:123",passageSha256:createHash("sha256").update(passage).digest("hex"),permittedActions:["model_transmission"],licenceId:"TEST-ONLY",attribution:"Synthetic test evidence",identity:"matched",rights:"verified",retraction:"clear",checkedAt:new Date(time-1000).toISOString(),expiresAt:new Date(time+10000).toISOString(),signature:"",...changes};
 r.signature=sign(null,Buffer.from(sourceClearanceSigningText(r)),privateKey).toString("base64url");return r;
}
function verifier(isRevoked=async()=>false,now=()=>time){return createSourceClearanceVerifier({authorities:[{issuer:"test-authority",keyId:"test-key",publicKey}],isRevoked,now});}
const binding=(r:unknown)=>({receipt:r,sourceId:"s1",sourceVersion:"v1",passage});
describe("trusted source clearance receipts",()=>{
 it("accepts only a current authority-signed receipt bound to the exact passage/version/action",async()=>{
  expect(await verifier().authorize(binding(receipt()))).toBe(true);
  for(const b of [{...binding(receipt()),passage:passage+" changed"},{...binding(receipt()),sourceId:"s2"},{...binding(receipt()),sourceVersion:"v2"},binding(receipt({permittedActions:["display"]}))])expect(await verifier().authorize(b)).toBe(false);
 });
 it("denies altered, unsigned, unknown-authority and extra-field receipts",async()=>{
  for(const r of [{...receipt(),attribution:"tampered"},{...receipt(),signature:""},receipt({issuer:"unknown"}),{...receipt(),allow:true},null,true])expect(await verifier().authorize(binding(r))).toBe(false);
 });
 it("denies stale, future, expired, corrected and retracted receipts",async()=>{
  for(const changes of [{expiresAt:new Date(time).toISOString()},{checkedAt:new Date(time+1).toISOString()},{checkedAt:new Date(time-86400001).toISOString()},{retraction:"corrected"},{retraction:"retracted"},{rights:"unknown"},{identity:"unknown"}])expect(await verifier().authorize(binding(receipt(changes as Partial<SourceClearanceReceipt>)))).toBe(false);
 });
 it("fails closed on revocation and service outage and rechecks expiry after the lookup",async()=>{
  expect(await verifier(async()=>true).authorize(binding(receipt()))).toBe(false);
  expect(await verifier(async()=>{throw Error("offline")}).authorize(binding(receipt()))).toBe(false);
  let clock=time;const v=verifier(async()=>{clock+=20000;return false},()=>clock);
  expect(await v.authorize(binding(receipt()))).toBe(false);
 });
 it("snapshots authority configuration and receipt across asynchronous revocation checks",async()=>{
  const r=receipt();let release:()=>void=()=>{};
  const pending=verifier(async()=>new Promise<boolean>(resolve=>{release=()=>resolve(false)})).authorize(binding(r));
  r.expiresAt=new Date(time-1).toISOString();release();expect(await pending).toBe(true);
 });
 it("bounds a stalled revocation service and aborts its request",async()=>{
  let signal:AbortSignal|undefined;
  const v=createSourceClearanceVerifier({authorities:[{issuer:"test-authority",keyId:"test-key",publicKey}],now:()=>time,isRevoked:async(_id,_issuer,s)=>{signal=s;return new Promise<boolean>(()=>{});}});
  expect(await v.authorize(binding(receipt()))).toBe(false);expect(signal?.aborted).toBe(true);
 });
});
