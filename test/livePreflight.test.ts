import {afterAll,expect,test} from "bun:test";
import {chmodSync,mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {generateKeyPairSync} from "node:crypto";
import {runLivePreflight,renderPreflight} from "../src/livePreflight";
import {buildDemoPolicy} from "../src/sourceIntegrityDemo";

const dirs:string[]=[];const dir=()=>{const d=mkdtempSync(join(tmpdir(),"hsi-pre-"));dirs.push(d);chmodSync(d,0o700);return d};
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const dep=(id:string,model:string)=>({deploymentId:id,providerId:"anthropic",modelId:model,endpoint:"https://api.anthropic.com/v1/messages",timeoutMs:20000,maxResponseBytes:100000,termsRef:"terms:m",sourcePolicyRef:"policy:public-oa-v1",maxOutputTokens:1024,budgetUnits:100000,credentialEnv:"HSI_KEY_"+id.toUpperCase(),anthropicVersion:"2023-06-01"});

test("nothing configured: not ready, every check reported, no throw, no secret",async()=>{
 const r=await runLivePreflight({config:undefined,integrityConfig:undefined,env:{}});
 expect(r.ready).toBe(false);expect(r.checks.length).toBe(8);expect(renderPreflight(r)).toContain("NOT READY");
});
test("an engaged kill switch, a missing store and absent credentials are each reported with an owner",async()=>{
 const r=await runLivePreflight({config:{limits:{killSwitchEnv:"HSI_KILL"},operationStore:{path:"/nonexistent/dir/ops.jsonl"},extractor:dep("ext","m-ext"),verifiers:[dep("va","m-a")]},integrityConfig:{},env:{HSI_KILL:"1"}});
 const by=Object.fromEntries(r.checks.map(c=>[c.id,c]));
 expect(by["kill-switch-clear"]!.ok).toBe(false);expect(by["kill-switch-clear"]!.detail).toContain("ENGAGED");
 expect(by["operation-store"]!.ok).toBe(false);expect(by["credentials-present"]!.ok).toBe(false);expect(by["distinct-verifiers"]!.ok).toBe(false);
});
test("a correctly signed policy verifies against the pinned approver; a wrong key or tampering does not",async()=>{
 const k=generateKeyPairSync("ed25519"),other=generateKeyPairSync("ed25519"),d=dir(),now=Date.parse("2026-11-13T12:00:00Z");
 const policy=buildDemoPolicy({now,privateKey:k.privateKey});writeFileSync(join(d,"policy.json"),JSON.stringify(policy));
 const pem=(x:typeof k)=>x.publicKey.export({type:"spki",format:"pem"}).toString();
 const base={policyFile:join(d,"policy.json"),policyApprovalRef:"approval:x",policyApprover:{issuer:"demo:policy-approver",keyId:"demo-key",publicKeyEnv:"HSI_APPROVER_KEY"},signer:{serviceRef:"kms:k",issuer:"s",keyId:"k"},requestedUses:["storage"]};
 const ok=await runLivePreflight({config:{},integrityConfig:base,env:{HSI_APPROVER_KEY:pem(k)},now:()=>now});
 expect(ok.checks.find(c=>c.id==="policy-verifies")!.ok).toBe(true);
 const wrong=await runLivePreflight({config:{},integrityConfig:base,env:{HSI_APPROVER_KEY:pem(other)},now:()=>now});
 expect(wrong.checks.find(c=>c.id==="policy-verifies")!.ok).toBe(false);
 writeFileSync(join(d,"policy.json"),JSON.stringify({...policy,version:99}));
 const tampered=await runLivePreflight({config:{},integrityConfig:base,env:{HSI_APPROVER_KEY:pem(k)},now:()=>now});
 expect(tampered.checks.find(c=>c.id==="policy-verifies")!.ok).toBe(false);
});
test("a private store directory, present credentials and distinct verifiers pass those checks, and values are never echoed",async()=>{
 const d=dir();const env={HSI_KEY_EXT:"SECRET-EXT",HSI_KEY_VA:"SECRET-VA",HSI_KEY_VB:"SECRET-VB"};
 const r=await runLivePreflight({config:{limits:{killSwitchEnv:"HSI_KILL"},operationStore:{path:join(d,"ops.jsonl")},extractor:dep("ext","m-ext"),verifiers:[dep("va","m-a"),dep("vb","m-b")]},integrityConfig:{},env});
 const ids=r.checks.filter(c=>c.ok).map(c=>c.id);
 expect(ids).toEqual(expect.arrayContaining(["kill-switch-clear","operation-store","credentials-present","distinct-verifiers"]));
 expect(JSON.stringify(r)+renderPreflight(r)).not.toContain("SECRET-");
});
