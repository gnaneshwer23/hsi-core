/** Public repository-artifact recovery only. Never exports or restores a database or account/session rows. */
import {createHash} from "node:crypto";
import {lstatSync,readFileSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {resolve,join,dirname} from "node:path";
import {parseRaEvidenceRelease,buildRaEvidenceBundle} from "./raEvidenceRelease";
import {parseResearchBundle} from "./researchContracts";
import {verifyResearchEvidenceCorpus} from "./evidence/researchEvidenceCorpus";
import {verifyResearchCoverageCatalogue} from "./researchCoverage";
export const PUBLIC_RECOVERY_PATHS=["research/ra-anti-tnf/release.json","research/ra-anti-tnf/graph-context.json","research/evidence-corpus/corpus.v1.json","research/coverage/catalogue.v1.json","site/public/research/evidence-corpus/corpus.v1.json","site/public/research/coverage/catalogue.v1.json"] as const;
export type ResearchRecoveryBundle={schemaVersion:"hsi-public-artifact-recovery-1";scope:"public_repository_artifacts_only";producerCommit:string;files:{path:string;bytes:number;sha256:string;content:string}[];bundleHash:string};
const canonical=(value:unknown)=>JSON.stringify(value,(_key,row:unknown)=>row&&typeof row==="object"&&!Array.isArray(row)?Object.fromEntries(Object.entries(row).sort(([a],[b])=>a<b?-1:a>b?1:0)):row);
const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
function exact(x:unknown,keys:string[]){if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).sort().join(",")!==[...keys].sort().join(","))throw Error("Invalid public recovery fields")}
export function createPublicArtifactRecoveryBundle(root:string,producerCommit:string):ResearchRecoveryBundle{
 if(!/^[a-f0-9]{40}$/.test(producerCommit))throw Error("Pinned Git source revision required");
 const files=PUBLIC_RECOVERY_PATHS.map(path=>{
  const file=join(resolve(root),path),stat=lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>1_000_000)throw Error("Bounded public artifact required");
  const content=readFileSync(file,"utf8");return {path,bytes:Buffer.byteLength(content),sha256:digest(content),content};
 });
 const body={schemaVersion:"hsi-public-artifact-recovery-1" as const,scope:"public_repository_artifacts_only" as const,producerCommit,files};return {...body,bundleHash:digest(canonical(body))};
}
export function verifyPublicArtifactRecoveryBundle(value:unknown,expectedHash:string):ResearchRecoveryBundle{
 exact(value,["schemaVersion","scope","producerCommit","files","bundleHash"]);const b=value as ResearchRecoveryBundle;
 if(b.schemaVersion!=="hsi-public-artifact-recovery-1"||b.scope!=="public_repository_artifacts_only"||!/^[a-f0-9]{40}$/.test(b.producerCommit)||!Array.isArray(b.files)||b.files.length!==PUBLIC_RECOVERY_PATHS.length||new Set(b.files.map(f=>f.path)).size!==b.files.length||!(/^[a-f0-9]{64}$/).test(expectedHash)||b.bundleHash!==expectedHash)throw Error("Recovery scope, paths or independent bundle pin mismatch");
 let total=0;for(const f of b.files){exact(f,["path","bytes","sha256","content"]);if(!(PUBLIC_RECOVERY_PATHS as readonly string[]).includes(f.path)||typeof f.content!=="string"||!Number.isSafeInteger(f.bytes)||f.bytes<0||f.bytes>1_000_000||Buffer.byteLength(f.content)!==f.bytes||digest(f.content)!==f.sha256)throw Error("Invalid public recovery file");total+=f.bytes}
 const {bundleHash,...body}=b;if(total>6_000_000||digest(canonical(body))!==bundleHash)throw Error("Recovery bundle integrity failure");return b;
}
/** Creates a NEW directory only, after complete verification. Refuses all existing directories/symlinks. */
export function restorePublicArtifactRecoveryBundle(value:unknown,expectedHash:string,destination:string){
 const b=verifyPublicArtifactRecoveryBundle(value,expectedHash),target=resolve(destination);mkdirSync(target);
 for(const f of b.files){const path=join(target,f.path);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,f.content,{flag:"wx",mode:0o600})}
 return {files:b.files.length,bytes:b.files.reduce((n,f)=>n+f.bytes,0),databaseRestored:false,accountsRestored:false};
}
export async function verifyRecoveredResearchArtifacts(root:string){
 const load=(path:string)=>JSON.parse(readFileSync(join(root,path),"utf8"));
 const release=parseRaEvidenceRelease(load(PUBLIC_RECOVERY_PATHS[0])),bundle=buildRaEvidenceBundle(parseResearchBundle(load(PUBLIC_RECOVERY_PATHS[1])),release);
 const evidence=await verifyResearchEvidenceCorpus(load(PUBLIC_RECOVERY_PATHS[2]),async s=>digest(s));
 const coverage=await verifyResearchCoverageCatalogue(load(PUBLIC_RECOVERY_PATHS[3]),async s=>digest(s));
 if(canonical(load(PUBLIC_RECOVERY_PATHS[4]))!==canonical(evidence)||canonical(load(PUBLIC_RECOVERY_PATHS[5]))!==canonical(coverage))throw Error("Recovered public mirrors diverged");
 return {sources:bundle.sources.length,passages:bundle.passages.length,claims:bundle.claims.length,evidenceVersion:evidence.version,coverageVersion:coverage.version};
}
export async function runPublicArtifactRecoveryDrill(root:string,producerCommit:string){
 const bundle=createPublicArtifactRecoveryBundle(root,producerCommit),temporary=mkdtempSync(join(tmpdir(),"hsi-public-recovery-")),target=join(temporary,"restored");
 try{
  const restored=restorePublicArtifactRecoveryBundle(bundle,bundle.bundleHash,target);
  for(const f of bundle.files)if(readFileSync(join(target,f.path),"utf8")!==f.content)throw Error("Restored bytes diverged");
  const semantics=await verifyRecoveredResearchArtifacts(target);
  return {schemaVersion:"hsi-public-recovery-drill-1",status:"local_artifact_drill_passed",scope:bundle.scope,producerCommit,bundleHash:bundle.bundleHash,filesVerified:restored.files,bytesVerified:restored.bytes,semantics,canonicalFilesChanged:false,temporaryDestinationRemoved:true,databaseRestoreVerified:false,accountIsolationVerified:false};
 }finally{rmSync(temporary,{recursive:true,force:true})}
}
