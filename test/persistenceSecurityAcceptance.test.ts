/** Signature/schema fixtures only. These never certify real accounts or live HTTP execution. */
import {describe,it,expect} from "bun:test";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createPersistenceSecurityVerifier,persistenceSecuritySigningText,PERSISTENCE_SECURITY_CHECKS,type PersistenceSecurityPacket,type SecurityEvidenceKind} from "../src/db/persistenceSecurityAcceptance";
const {publicKey,privateKey}=generateKeyPairSync("ed25519"),hash=(s:string)=>createHash("sha256").update(s).digest("hex"),now=Date.parse("2026-11-12T12:00:00Z");
function fixture(){
 const expected={scope:"contradiction_ledger" as const,targetHash:hash("fixture-private-target"),commitSha:"a".repeat(40)};
 const artifacts=new Map<string,Uint8Array>();
 const packet:PersistenceSecurityPacket={schemaVersion:"hsi-persistence-security-acceptance-1",id:"fixture-security-packet",scope:expected.scope,environment:"isolated_staging",targetHash:expected.targetHash,commitSha:expected.commitSha,participants:{researcherA:{principalHash:hash("fixture-a"),scopeHash:hash("fixture-tenant-a")},researcherB:{principalHash:hash("fixture-b"),scopeHash:hash("fixture-tenant-b")},reviewer:{principalHash:hash("fixture-reviewer")}},checks:[],signerId:"fixture-independent-security-owner",keyId:"fixture-key",signedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+60000).toISOString(),signature:""};
 for(const check of PERSISTENCE_SECURITY_CHECKS){
  const kind:SecurityEvidenceKind=check==="restricted_role_no_bypassrls"||check==="production_readonly_confirmed"?"catalogue":check==="migration_rollback_verified"?"database_rehearsal":check==="backup_restore_verified"?"database_restore":"authenticated_http";
  const text=JSON.stringify({source:"real_staging_execution",fixture:false,check,...expected,kind,outcome:"passed",executedAt:new Date(now-2000).toISOString()}),digest=hash(text);
  artifacts.set(digest,new TextEncoder().encode(text));packet.checks.push({check,passed:true,artifactSha256:digest,kind});
 }
 const resign=()=>{packet.signature=sign(null,Buffer.from(persistenceSecuritySigningText(packet)),privateKey).toString("base64url")};resign();
 const authority={signerId:packet.signerId,keyId:packet.keyId,principalHash:packet.participants.reviewer.principalHash,publicKey,scopes:[expected.scope]};
 const verifier=(revoked=false)=>createPersistenceSecurityVerifier({authorities:[authority],loadEvidence:async h=>artifacts.get(h)!,isRevoked:async()=>revoked,now:()=>now});
 return {expected,packet,artifacts,resign,authority,verifier};
}
describe("scope-bound independent persistence security evidence",()=>{
 it("verifies a cryptographic contract fixture without authorizing production or science",async()=>{
  const f=fixture(),result=await f.verifier().verify(f.packet,f.expected);
  expect(result.acceptedForScope).toBe(true);expect(result.productionActivationApproved).toBe(false);expect(result.scientificApproval).toBe(false);
  expect((await f.verifier().verify(f.packet,{...f.expected,targetHash:hash("different-target")})).acceptedForScope).toBe(false);
  expect((await f.verifier().verify(f.packet,{...f.expected,commitSha:"b".repeat(40)})).acceptedForScope).toBe(false);
  expect((await f.verifier().verify(f.packet,{...f.expected,scope:"scientific_records"})).acceptedForScope).toBe(false);
 });
 it("rejects shared principals/scopes, submitter signers and revoked or expired packets",async()=>{
  for(const change of ["principal","scope","reviewer","signer","revoked","expired"]){
   const f=fixture();
   if(change==="principal")f.packet.participants.researcherB.principalHash=f.packet.participants.researcherA.principalHash;
   if(change==="scope")f.packet.participants.researcherB.scopeHash=f.packet.participants.researcherA.scopeHash;
   if(change==="reviewer")f.packet.participants.reviewer.principalHash=f.packet.participants.researcherA.principalHash;
   if(change==="signer")f.authority.principalHash=f.packet.participants.researcherA.principalHash;
   if(change==="expired")f.packet.expiresAt=new Date(now-1).toISOString();
   f.resign();expect((await f.verifier(change==="revoked").verify(f.packet,f.expected)).acceptedForScope).toBe(false);
  }
 });
 it("cannot replace authenticated HTTP with SQL-only, fixture or cross-target evidence",async()=>{
  for(const change of ["sql","fixture","target","corrupt","missing"]){
   const f=fixture(),item=f.packet.checks.find(c=>c.check==="staging_http_end_to_end")!;
   if(change==="missing")f.packet.checks.pop();
   else if(change==="corrupt")f.artifacts.set(item.artifactSha256,new TextEncoder().encode("tampered"));
   else{
    const evidence=JSON.parse(new TextDecoder().decode(f.artifacts.get(item.artifactSha256)!));
    if(change==="sql"){item.kind="database_rehearsal";evidence.kind=item.kind;}
    if(change==="fixture")evidence.fixture=true;
    if(change==="target")evidence.targetHash=hash("different-target");
    const text=JSON.stringify(evidence);item.artifactSha256=hash(text);f.artifacts.set(item.artifactSha256,new TextEncoder().encode(text));
   }
   f.resign();expect((await f.verifier().verify(f.packet,f.expected)).acceptedForScope).toBe(false);
  }
 });
 it("bounds evidence reads even when storage ignores cancellation",async()=>{
  const f=fixture();let signal:AbortSignal|undefined;
  const verifier=createPersistenceSecurityVerifier({authorities:[f.authority],loadEvidence:async(_h,s)=>{signal=s;return new Promise(()=>{})},isRevoked:async()=>false,now:()=>now,timeoutMs:1000});
  expect((await verifier.verify(f.packet,f.expected)).acceptedForScope).toBe(false);expect(signal?.aborted).toBe(true);
 });
});
