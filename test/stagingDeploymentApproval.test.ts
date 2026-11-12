import {describe,it,expect} from "bun:test";
import {generateKeyPairSync,sign} from "node:crypto";
import {createStagingDeploymentApprovalVerifier,stagingApprovalSigningText,type StagingDeploymentApproval} from "../src/researchV2/stagingDeploymentApproval";
const {publicKey,privateKey}=generateKeyPairSync("ed25519"),current=Date.parse("2026-11-12T12:00:00Z");
const binding={deploymentId:"fixture-deployment",configurationHash:"a".repeat(64),termsRef:"fixture-terms",sourcePolicyRef:"fixture-public-policy"};
function receipt(){const r:StagingDeploymentApproval={...binding,schemaVersion:"hsi-staging-deployment-approval-1",id:"fixture-approval",issuer:"fixture-independent-operator",keyId:"fixture-key",environment:"isolated_staging",checkedAt:new Date(current-1000).toISOString(),expiresAt:new Date(current+60000).toISOString(),signature:""};r.signature=sign(null,Buffer.from(stagingApprovalSigningText(r)),privateKey).toString("base64url");return r;}
describe("independent staging deployment approval",()=>{
 it("requires exact signed configuration/policy binding, current validity and non-revocation",async()=>{
  let r=receipt(),revoked=false;
  const verifier=createStagingDeploymentApprovalVerifier({store:{append:async()=>{}},authorities:[{issuer:r.issuer,keyId:r.keyId,publicKey}],resolveReceipt:async()=>r,isRevoked:async()=>revoked,now:()=>current});
  expect(await verifier.authorize(binding)).toBe(true);
  for(const change of [{configurationHash:"b".repeat(64)},{termsRef:"different"},{sourcePolicyRef:"different"},{deploymentId:"different"}])expect(await verifier.authorize({...binding,...change})).toBe(false);
  revoked=true;expect(await verifier.authorize(binding)).toBe(false);revoked=false;
  r={...receipt(),expiresAt:new Date(current-1).toISOString()};r.signature=sign(null,Buffer.from(stagingApprovalSigningText(r)),privateKey).toString("base64url");expect(await verifier.authorize(binding)).toBe(false);
  r={...receipt(),environment:"production" as never};r.signature=sign(null,Buffer.from(stagingApprovalSigningText(r)),privateKey).toString("base64url");expect(await verifier.authorize(binding)).toBe(false);
 });
 it("bounds an unresponsive approval authority and aborts its lookup",async()=>{
  let signal:AbortSignal|undefined;
  const verifier=createStagingDeploymentApprovalVerifier({store:{append:async()=>{}},authorities:[{issuer:"fixture-independent-operator",keyId:"fixture-key",publicKey}],resolveReceipt:async(_b,s)=>{signal=s;return new Promise(()=>{})},isRevoked:async()=>false,timeoutMs:1000});
  expect(await verifier.authorize(binding)).toBe(false);expect(signal?.aborted).toBe(true);
 });
});
