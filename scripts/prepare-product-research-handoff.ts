/** Prepare a clean, pinned local handoff. Does not write product repos, databases, roles or signing keys. */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {execFileSync} from "node:child_process";
import {buildResearchCorpusArtifact,artifactDigest,type ResearchArtifactTrustPolicy} from "../src/researchArtifactAcceptance";
const root=resolve(import.meta.dir,".."),args=process.argv.slice(2);
if(args.length!==4||args[0]!=="--out-dir"||args[2]!=="--sequence"||!/^\d+$/.test(args[3]!))throw Error("Usage: bun --no-env-file scripts/prepare-product-research-handoff.ts --out-dir NEW_DIRECTORY --sequence POSITIVE_INTEGER");
const out=resolve(args[1]!),sequence=Number(args[3]);
const modules=[{name:"researchContracts",version:"hsi-research-contract-1"},{name:"raEvidenceRelease",version:"hsi-ra-evidence-release-1"},{name:"researchArtifactAcceptance",version:"hsi-research-artifact-acceptance-1"},{name:"researchArtifactStore",version:"hsi-research-artifact-acceptance-1"}];
const inputs=[...modules.map(m=>`src/${m.name}.ts`),"research/ra-anti-tnf/release.json","research/ra-anti-tnf/graph-context.json"];
if(execFileSync("git",["status","--porcelain"],{cwd:root,encoding:"utf8"}).trim())throw Error("Commit the clean canonical handoff tree before preparing consumer snapshots");
const producerCommit=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();
const artifact=buildResearchCorpusArtifact({release:JSON.parse(readFileSync(join(root,inputs[4]!),"utf8")),graphContext:JSON.parse(readFileSync(join(root,inputs[5]!),"utf8")),producerCommit,sequence});
// Every incoming source and payload has passed validation before creating the new handoff directory.
const files:Record<string,string>={"transfer.json":JSON.stringify(artifact,null,2)+"\n"};
for(const m of modules){const source=readFileSync(join(root,`src/${m.name}.ts`),"utf8");files[m.name+".ts"]=source;files[m.name+".provenance.json"]=JSON.stringify({repository:"gnaneshwer23/hsi-core",commit:producerCommit,path:`src/${m.name}.ts`,version:m.version,sha256:artifactDigest(source),distribution:"exact_source_snapshot",executable:true,includesProductData:false},null,2)+"\n"}
for(const product of ["isi","aksh"] as const){const policy:ResearchArtifactTrustPolicy={schemaVersion:"hsi-research-artifact-trust-1",product,artifactHash:artifact.artifactHash,producerCommit,minimumSequence:sequence,signaturePolicy:"pinned_digest",signingKey:null};files[product+".trust.json"]=JSON.stringify(policy,null,2)+"\n"}
mkdirSync(out);for(const [name,body] of Object.entries(files))writeFileSync(join(out,name),body,{flag:"wx"});
writeFileSync(join(out,"handoff.manifest.json"),JSON.stringify({schemaVersion:"hsi-consumer-handoff-1",producerCommit,artifactHash:artifact.artifactHash,sequence,scientificReview:"unreviewed",scientificApprovalTransferred:false,files:Object.fromEntries(Object.entries(files).map(([name,body])=>[name,artifactDigest(body)]))},null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({directory:out,producerCommit,artifactHash:artifact.artifactHash,sequence,files:Object.keys(files).length,scientificReview:"unreviewed",signaturePolicy:"pinned_digest",signatureCreated:false,productReposModified:false}));
