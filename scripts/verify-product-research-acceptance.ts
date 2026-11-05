/** Execute actual product-local loaders and verify canonical snapshots. No migrations, DB or source sync. */
import {readFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {execFileSync} from "node:child_process";
import {artifactDigest} from "../src/researchArtifactAcceptance";
const root=resolve(import.meta.dir,".."),args=process.argv.slice(2);
if(args.length&&!(args.length===4&&args[0]==="--isi-root"&&args[2]==="--aksh-root"))throw Error("Use [--isi-root DIRECTORY --aksh-root DIRECTORY]");
const products=[{product:"isi",repo:resolve(args[1]??join(root,"../immunecity")),app:"",vendor:"src/lib/hsi/vendor"},{product:"aksh",repo:resolve(args[3]??join(root,"../aksh-health-redesign")),app:"packages/platform-uk",vendor:"packages/platform-uk/lib/hsi"}] as const;
const git=(repo:string,...args:string[])=>execFileSync("git",args,{cwd:repo,encoding:"utf8"}).trim();
const env={...process.env};for(const key of ["DATABASE","DATABASE_URL","HSI_DATABASE_URL","HSI_TEST_DB_URL"])delete env[key];
const results=products.map(p=>{
 const modules=["researchContracts","raEvidenceRelease","researchArtifactAcceptance","researchArtifactStore"];
 const modulePins=modules.map(name=>{const provenance=JSON.parse(readFileSync(join(p.repo,p.vendor,name+".provenance.json"),"utf8")),source=readFileSync(join(p.repo,p.vendor,name+".ts"),"utf8"),canonical=readFileSync(join(root,"src",name+".ts"),"utf8");
  if(provenance.repository!=="gnaneshwer23/hsi-core"||provenance.path!==`src/${name}.ts`||provenance.distribution!=="exact_source_snapshot"||provenance.executable!==true||provenance.includesProductData!==false||!/^[a-f0-9]{40}$/.test(provenance.commit)||artifactDigest(source)!==provenance.sha256||source!==canonical||execFileSync("git",["show",`${provenance.commit}:src/${name}.ts`],{cwd:root,encoding:"utf8"})!==source)throw Error(`Product source provenance failed: ${p.product}/${name}`);
  return {name,commit:provenance.commit,sha256:provenance.sha256};
 });
 const output=execFileSync(process.execPath,["--no-env-file","scripts/verify-hsi-artifact-acceptance.ts"],{cwd:join(p.repo,p.app),env,encoding:"utf8",maxBuffer:100000});
 const acceptance=JSON.parse(output);
 if(acceptance.product!==p.product||acceptance.scientificReview!=="unreviewed"||acceptance.claims!==0||acceptance.rolesTransferred!==false||acceptance.scientificApprovalTransferred!==false||acceptance.graphPublicationApproved!==false)throw Error("Product loader incorrectly transferred authority");
 return {product:p.product,revision:git(p.repo,"rev-parse","HEAD"),workingTree:git(p.repo,"status","--porcelain")?"includes_local_changes":"clean",modulePins,acceptance};
});
if(results[0]!.acceptance.bundleHash!==results[1]!.acceptance.bundleHash||results[0]!.acceptance.artifactHash!==results[1]!.acceptance.artifactHash)throw Error("Products interpreted different artifacts or source bundles");
console.log(JSON.stringify({schemaVersion:"hsi-product-acceptance-report-1",status:"engineering_source_parity_passed",hsiRevision:git(root,"rev-parse","HEAD"),products:results,approvedArtifactGate:"pending_independent_scientific_approval",databaseActivationChecked:false,roleProvisioningChecked:false,productionDeploymentChecked:false},null,2));
