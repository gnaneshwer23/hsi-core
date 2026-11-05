/** Reproducible draft coverage export; no network, database or clinical data. */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {HSI_T2D_IMMUNO_SEED_EDGES} from "../src/seed/t2dImmunoMetabolic";
import {buildResearchCoverage,coverageReviewPacket} from "../src/evidence/buildResearchCoverage";
import {coverageReadiness} from "../src/researchCoverage";
const root=resolve(import.meta.dir,".."),args=process.argv.slice(2);if(args.some(x=>x!=="--check")||args.length>1)throw Error("Use [--check]");const check=args.includes("--check");
const paths=["research/coverage/protocols.v1.json","research/coverage/registry.snapshot.v1.json","src/seed/gutScfaMucosal.ts","src/seed/neuroVagusCholinergic.ts","src/seed/t2dImmunoMetabolic.ts"],raw=paths.map(p=>readFileSync(resolve(root,p),"utf8"));
const registry=JSON.parse(raw[1]!);if(registry.schemaVersion!=="hsi-registry-import-status-1"||!["not_imported","operator_snapshot_supplied"].includes(registry.status)||Object.keys(registry).sort().join(",")!=="schemaVersion,snapshot,status"||(registry.status==="not_imported")!==(registry.snapshot===null))throw Error("Invalid registry import status");
const catalogue=buildResearchCoverage({protocols:JSON.parse(raw[0]!),edges:HSI_T2D_IMMUNO_SEED_EDGES,inputs:paths.map((path,i)=>({path,sha256:createHash("sha256").update(raw[i]!).digest("hex")})),registry:registry.snapshot});
const artifacts={"catalogue.v1.json":catalogue,"readiness.v1.json":{schemaVersion:"hsi-coverage-readiness-1",catalogueVersion:catalogue.version,packs:catalogue.packs.map(coverageReadiness)},"review-preparation.v1.json":coverageReviewPacket(catalogue)};
for(const directory of ["research/coverage","site/public/research/coverage"]){
 if(!check)mkdirSync(resolve(root,directory),{recursive:true});
 for(const [file,value] of Object.entries(artifacts)){const path=resolve(root,directory,file),text=JSON.stringify(value,null,2)+"\n";if(check){if(readFileSync(path,"utf8")!==text)throw Error("Stale coverage artifact: "+path)}else writeFileSync(path,text)}
 const archive=resolve(root,directory,"versions",catalogue.version+".json"),text=JSON.stringify(catalogue,null,2)+"\n";
 if(check){if(readFileSync(archive,"utf8")!==text)throw Error("Missing pinned coverage version")}else{mkdirSync(resolve(root,directory,"versions"),{recursive:true});writeFileSync(archive,text)}
}
console.log(JSON.stringify({mode:check?"checked":"built",version:catalogue.version,draftProtocols:catalogue.packs.length,directSupportingPassages:0,approvedClaims:0,registry:catalogue.registry?"operator_supplied_unverified":"not_imported",releaseEligible:false}));
