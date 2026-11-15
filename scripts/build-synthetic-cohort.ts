/**
 * Writes the compact synthetic cohort used by the cohort page: only the fields phenotype evaluation reads (condition, age, sex,
 * BMI, HbA1c and hs-CRP values, medication names). Synthetic profiles only; the loader refuses any shard not marked synthetic.
 *   bun scripts/build-synthetic-cohort.ts          (write)
 *   bun scripts/build-synthetic-cohort.ts --check  (fail if the committed file is stale)
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {loadSyntheticPatients} from "../src/clinicalPlane/syntheticSource";
import {canonical,sha256} from "../src/clinicalPlane/auditChain";
const OUT="site/public/research/clinical-plane/synthetic-cohort.v1.json",KEEP=new Set(["HbA1c","hs-CRP"]);
export function buildCohortFile(){
 const patients=loadSyntheticPatients("site/public/research/validation/v0.1").map(p=>({...p,labs:p.labs.filter(l=>KEEP.has(l.test))}));
 const body={schema:"hsi-synthetic-cohort-1" as const,dataClass:"synthetic" as const,scientificClaimAllowed:false as const,source:"hsi-synthetic-validation-0.1",patients};
 return JSON.stringify({...body,digest:sha256(canonical(body))},null,0)+"\n";
}
if(import.meta.main){
 const text=buildCohortFile();
 if(process.argv.includes("--check")){if(!existsSync(OUT)||readFileSync(OUT,"utf8")!==text){console.error("Stale: run bun scripts/build-synthetic-cohort.ts");process.exit(1)}console.log("synthetic cohort file is current")}
 else{mkdirSync("site/public/research/clinical-plane",{recursive:true});writeFileSync(OUT,text);console.log("wrote",OUT,text.length,"bytes")}
}
