import {test,expect} from "bun:test";
import {generateKeyPairSync,sign} from "node:crypto";
import {mkdtempSync,readFileSync,writeFileSync,existsSync,rmSync,symlinkSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import release from "../research/ra-anti-tnf/release.json";
import graphContext from "../research/ra-anti-tnf/graph-context.json";
import {acceptResearchCorpusArtifact,buildResearchCorpusArtifact,artifactCanonical,artifactDigest,type ResearchArtifactTrustPolicy,type ProductConsumer,type ResearchCorpusArtifact} from "../src/researchArtifactAcceptance";
import {importResearchCorpusArtifact} from "../src/researchArtifactStore";
const clone=<T>(x:T):T=>structuredClone(x);
function fixture(sequence=1){return buildResearchCorpusArtifact({release,graphContext,producerCommit:"a".repeat(40),sequence})}
function policy(a:ResearchCorpusArtifact,product:ProductConsumer="isi"):ResearchArtifactTrustPolicy{return {schemaVersion:"hsi-research-artifact-trust-1",product,artifactHash:a.artifactHash,producerCommit:a.producer.commit,minimumSequence:a.sequence,signaturePolicy:"pinned_digest",signingKey:null}}
function repin(a:ResearchCorpusArtifact){const {artifactHash,signature,...body}=a;a.artifactHash=artifactDigest(artifactCanonical(body));return policy(a)}
test("both products consume identical pinned RA source content without scientific or role transfer",()=>{
 const a=fixture(),isi=acceptResearchCorpusArtifact(a,policy(a),"isi"),aksh=acceptResearchCorpusArtifact(a,policy(a,"aksh"),"aksh");
 expect(isi.bundle).toEqual(aksh.bundle);expect(isi.bundle.sources).toHaveLength(2);expect(isi.bundle.passages).toHaveLength(8);expect(isi.bundle.claims).toHaveLength(0);expect(isi.bundle.runs).toHaveLength(0);expect(isi.scientificApprovalTransferred).toBe(false);expect(isi.rolesTransferred).toBe(false);expect(isi.signatureVerified).toBe(false);expect(aksh.trustMode).toBe("pinned_digest");
});
test("changed bytes or recomputed self-hash cannot replace independent product pin",()=>{
 const a=fixture(),p=policy(a);a.payload.release.passages[0]!.text="Tampered quote";expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow("integrity");repin(a);expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow("pin");
});
test("strict artifact schemas refuse role, clinical and scientific authority assertions",()=>{
 for(const modify of [(a:any)=>a.roles=["reviewer"],(a:any)=>a.scientificReview="approved",(a:any)=>a.kgWrite=true,(a:any)=>a.containsPhi=true,(a:any)=>a.payload.extraApproval=true,(a:any)=>a.contracts.research="hsi-research-contract-99",(a:any)=>a.producer.workingTree="dirty"]){const a=fixture();modify(a);const p=repin(a);expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow()}
});
test("schema mismatch, producer substitution, wrong product or unconfigured trust fail closed",()=>{
 const a=fixture();for(const p of [undefined,{...policy(a),product:"aksh"},{...policy(a),producerCommit:"b".repeat(40)},{...policy(a),minimumSequence:2}])expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow();
 const b=clone(a);(b as any).schemaVersion="future-version";expect(()=>acceptResearchCorpusArtifact(b,repin(b),"isi")).toThrow("schema");
});
test("installed sequence prevents rollback and same-sequence conflicts even after repinning",()=>{
 const newer=fixture(2),old=fixture(1);expect(()=>acceptResearchCorpusArtifact(old,policy(old),"isi",{installed:{artifactHash:newer.artifactHash,sequence:2}})).toThrow("Stale");
 const conflict=fixture(2);conflict.producer.commit="b".repeat(40);const p=repin(conflict);expect(()=>acceptResearchCorpusArtifact(conflict,p,"isi",{installed:{artifactHash:newer.artifactHash,sequence:2}})).toThrow("conflicting");
 expect(acceptResearchCorpusArtifact(newer,policy(newer),"isi",{installed:{artifactHash:newer.artifactHash,sequence:2}}).changed).toBe(false);
});
test("revoked pins are denied without trusting payload revocation flags",()=>{
 const a=fixture();expect(()=>acceptResearchCorpusArtifact(a,policy(a),"isi",{revokedHashes:[a.artifactHash]})).toThrow("pin");
});
test("signature-required mode refuses unsigned inputs and accepts only the independent trusted Ed25519 key",()=>{
 const a=fixture(),keys=generateKeyPairSync("ed25519"),p={...policy(a),signaturePolicy:"ed25519_required" as const,signingKey:{keyId:"hsi-test-only",publicKeyPem:keys.publicKey.export({type:"spki",format:"pem"}).toString()}};
 expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow("Unsigned");
 a.signature={algorithm:"Ed25519",keyId:"hsi-test-only",value:sign(null,Buffer.from(a.artifactHash),keys.privateKey).toString("base64")};expect(acceptResearchCorpusArtifact(a,p,"isi").signatureVerified).toBe(true);
 const other=generateKeyPairSync("ed25519");a.signature.value=sign(null,Buffer.from(a.artifactHash),other.privateKey).toString("base64");expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow("signature");
});
test("payload-supplied signing key and fabricated signature cannot introduce trust",()=>{
 const a=fixture();a.signature={algorithm:"Ed25519",keyId:"hsi-attacker",value:"a".repeat(86)+"=="};expect(()=>acceptResearchCorpusArtifact(a,policy(a),"isi")).toThrow("signature");
 expect(()=>acceptResearchCorpusArtifact(a,{...policy(a),signaturePolicy:"ed25519_required"},"isi")).toThrow("key required");
});
test("nested release rights/version checks cannot be bypassed by a structurally valid outer pin",()=>{
 const a=fixture();a.payload.release.sources[0]!.licence.status="restricted";const p=repin(a);expect(()=>acceptResearchCorpusArtifact(a,p,"isi")).toThrow("RA evidence release");
});
test("claim-bearing graphs cannot masquerade as source-only transfer",()=>{
 const g=clone(graphContext);(g.claims as any[]).push({id:"invented-claim"});expect(()=>buildResearchCorpusArtifact({release,graphContext:g,producerCommit:"a".repeat(40),sequence:1})).toThrow();
});
function temporary<T>(fn:(dir:string)=>T){const dir=mkdtempSync(join(tmpdir(),"hsi-f-artifact-"));try{return fn(dir)}finally{rmSync(dir,{recursive:true,force:true})}}
test("atomic product-local import, repeat import and upgrade preserve one coherent artifact",()=>temporary(dir=>{
 const input=join(dir,"incoming.json"),destination=join(dir,"installed.json"),a=fixture();writeFileSync(input,JSON.stringify(a));expect(importResearchCorpusArtifact(input,destination,policy(a),"isi").changed).toBe(true);const first=readFileSync(destination,"utf8");expect(importResearchCorpusArtifact(input,destination,policy(a),"isi").changed).toBe(false);expect(readFileSync(destination,"utf8")).toBe(first);
 const b=fixture(2);writeFileSync(input,JSON.stringify(b));expect(importResearchCorpusArtifact(input,destination,policy(b),"isi").changed).toBe(true);expect(JSON.parse(readFileSync(destination,"utf8")).sequence).toBe(2);expect(existsSync(destination+".lock")).toBe(false);
}));
test("stale, malformed, unsafe and locked imports preserve installed snapshot and lock owner",()=>temporary(dir=>{
 const input=join(dir,"incoming.json"),destination=join(dir,"installed.json"),a=fixture(2);writeFileSync(input,JSON.stringify(a));importResearchCorpusArtifact(input,destination,policy(a),"isi");const before=readFileSync(destination,"utf8");
 const old=fixture(1);writeFileSync(input,JSON.stringify(old));expect(()=>importResearchCorpusArtifact(input,destination,policy(old),"isi")).toThrow("Stale");writeFileSync(input,"bad json");expect(()=>importResearchCorpusArtifact(input,destination,policy(a),"isi")).toThrow();expect(readFileSync(destination,"utf8")).toBe(before);
 writeFileSync(destination+".lock","another operator");expect(()=>importResearchCorpusArtifact(input,destination,policy(a),"isi")).toThrow();expect(readFileSync(destination+".lock","utf8")).toBe("another operator");
}));
test("symlink, oversized inputs and corrupt installed metadata fail without replacement",()=>temporary(dir=>{
 const input=join(dir,"incoming.json"),destination=join(dir,"installed.json"),a=fixture();writeFileSync(input,JSON.stringify(a));const link=join(dir,"link.json");symlinkSync(input,link);expect(()=>importResearchCorpusArtifact(link,destination,policy(a),"isi")).toThrow("regular");writeFileSync(input," ".repeat(1_000_001));expect(()=>importResearchCorpusArtifact(input,destination,policy(a),"isi")).toThrow("regular");writeFileSync(input,JSON.stringify(a));writeFileSync(destination,"bad installed data");expect(()=>importResearchCorpusArtifact(input,destination,policy(a),"isi")).toThrow("preserve");expect(readFileSync(destination,"utf8")).toBe("bad installed data");
}));

test("valid JSON with altered installed sequence cannot weaken rollback protection",()=>temporary(dir=>{
 const input=join(dir,"incoming.json"),destination=join(dir,"installed.json"),a=fixture(2);writeFileSync(input,JSON.stringify(a));importResearchCorpusArtifact(input,destination,policy(a),"isi");
 const corrupted=JSON.parse(readFileSync(destination,"utf8"));corrupted.sequence=1;writeFileSync(destination,JSON.stringify(corrupted));const bytes=readFileSync(destination,"utf8"),old=fixture(1);writeFileSync(input,JSON.stringify(old));expect(()=>importResearchCorpusArtifact(input,destination,policy(old),"isi")).toThrow("preserve");expect(readFileSync(destination,"utf8")).toBe(bytes);
}));
