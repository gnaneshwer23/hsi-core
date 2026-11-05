/** Local artifacts only: no model/provider, outreach, database or SME authority claim. */
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
import {prepareResearchReadiness} from "../src/researchReadiness";
const directory=resolve(import.meta.dir,"../evaluation/research-readiness"),check=process.argv.includes("--check");
const bank=JSON.parse(await readFile(resolve(directory,"questions.draft.json"),"utf8")),result=await prepareResearchReadiness(bank,async s=>createHash("sha256").update(s).digest("hex"));
const artifacts=[["annotator-a.pending.json",result.packets[0]],["annotator-b.pending.json",result.packets[1]],["readiness.json",result.readiness],["method-registry.json",result.registry]] as const;
for(const [file,data] of artifacts){const content=JSON.stringify(data,null,2)+"\n",path=resolve(directory,file);if(check){if(await readFile(path,"utf8")!==content)throw Error("Stale readiness artifact: "+file)}else{
 if(file.startsWith("annotator-")){
  let previous:unknown;try{previous=JSON.parse(await readFile(path,"utf8"))}catch(error){if((error as {code?:string}).code!=="ENOENT")throw error}
  if(previous){const p=previous as {status?:unknown;rows?:unknown};if(p.status!=="awaiting_sme"||!Array.isArray(p.rows)||p.rows.some((r:Record<string,unknown>)=>r.annotator!==null||r.rationale!==null||r.acceptableAnswer!==null||r.expectedOutcome!==null||r.sourcePacketHash!==null||!Array.isArray(r.expectedEvidenceIds)||r.expectedEvidenceIds.length))throw Error("Refusing to overwrite nonempty annotation work; preserve protected copies first")}
 }
 await writeFile(path,content);
}}
console.log(JSON.stringify({mode:check?"checked":"prepared",questions:result.readiness.totalCases,bankHash:result.readiness.bankHash,labelledCases:0,scientificMetrics:null,modelActivationAllowed:false}));
