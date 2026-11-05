/** Reproducible local working-evidence export. No network, database, approval or release writes. */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {buildResearchEvidenceCorpus,buildEvidenceReviewPacket,CORPUS_INPUT_PATHS} from "../src/evidence/buildResearchEvidenceCorpus";
import {assessWorkingEvidence} from "../src/evidence/researchEvidenceCorpus";
const root=resolve(import.meta.dir,"..");
const corpus=buildResearchEvidenceCorpus(Object.fromEntries(Object.entries(CORPUS_INPUT_PATHS).map(([key,path])=>[key,JSON.parse(readFileSync(resolve(root,path),"utf8"))])) as {ra:unknown;ssc:unknown;verification:unknown});
const artifacts={"corpus.v1.json":corpus,"readiness.v1.json":assessWorkingEvidence(corpus),"review-packet.v1.json":buildEvidenceReviewPacket(corpus)};
const check=process.argv.includes("--check");
for(const directory of ["research/evidence-corpus","site/public/research/evidence-corpus"]){
 if(!check)mkdirSync(resolve(root,directory),{recursive:true});
 for(const [name,value] of Object.entries(artifacts)){
  const path=resolve(root,directory,name),text=JSON.stringify(value,null,2)+"\n";
  if(check){if(readFileSync(path,"utf8")!==text)throw Error("Stale evidence artifact: "+directory+"/"+name)}else writeFileSync(path,text);
 }
}
console.log(JSON.stringify({mode:check?"checked":"built",version:corpus.version,...assessWorkingEvidence(corpus).counts,graphPromotable:false}));
