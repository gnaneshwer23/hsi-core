/** Offline only. Never calls providers, databases, grant services or publication endpoints. */
import {createHash} from "node:crypto";
import {readFile,stat,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {baselineRun,evaluateRun,assessThresholdProposal,EMPTY_THRESHOLDS,emptyLabelPacket,compareEvaluationReports,assertEvaluationSeparation,buildSourceSelectionRequest,type EvaluationDataset,type LabelPacket,type CandidateRun} from "../src/scientificEvaluation";
const digest=async(s:string)=>createHash("sha256").update(s).digest("hex");
const args=process.argv.slice(2),options=new Map<string,string>();
for(let i=0;i<args.length;i+=2){const k=args[i],v=args[i+1];if(!k||!["--dataset","--labels","--candidate","--out","--label-template","--development-dataset","--requests","--thresholds"].includes(k)||!v||v.startsWith("--")||options.has(k))throw Error("Use --dataset FILE [--labels FILE] [--candidate FILE] [--out FILE] [--label-template FILE] [--requests FILE] [--thresholds FILE] [--development-dataset FILE]");options.set(k,v)}
async function json(path:string){if((await stat(path)).size>8_000_000)throw Error("Evaluation file exceeds 8 MB limit");return JSON.parse(await readFile(path,"utf8"))}
async function save(path:string,value:unknown){await writeFile(resolve(path),JSON.stringify(value,null,2)+"\n",{flag:"wx"})}
try{
 const dataset=await json(options.get("--dataset")??"evaluation/phase-e/engineering-cases.json") as EvaluationDataset;
 if(dataset.partition==="held_out"){if(!options.has("--development-dataset"))throw Error("Held-out evaluation requires a development dataset leakage check");await assertEvaluationSeparation(await json(options.get("--development-dataset")!) as EvaluationDataset,dataset,digest)}
 const labels=options.has("--labels")?await json(options.get("--labels")!) as LabelPacket:await emptyLabelPacket(dataset,digest);
 if(options.has("--label-template"))await save(options.get("--label-template")!,await emptyLabelPacket(dataset,digest));
 const baseline=await baselineRun(dataset,digest),baselineReport=await evaluateRun(dataset,baseline,labels,digest);
 const candidate=options.has("--candidate")?await json(options.get("--candidate")!) as CandidateRun:null;
 const candidateReport=candidate?await evaluateRun(dataset,candidate,labels,digest):null;
 const thresholds=options.has("--thresholds")?await json(options.get("--thresholds")!):EMPTY_THRESHOLDS;
 const report={thresholdProposals:{baseline:assessThresholdProposal(baselineReport,thresholds),candidate:candidateReport?assessThresholdProposal(candidateReport,thresholds):null},baseline:baselineReport,candidate:candidateReport,comparison:compareEvaluationReports(baselineReport,candidateReport)};
 if(options.has("--requests"))await save(options.get("--requests")!,{schemaVersion:"hsi-scientific-request-packet-1",datasetHash:baseline.datasetHash,requests:dataset.cases.map(c=>({caseId:c.id,request:buildSourceSelectionRequest(c.input)}))});
 if(options.has("--out"))await save(options.get("--out")!,report);else process.stdout.write(JSON.stringify(report,null,2)+"\n");
}catch{console.error("Evaluation refused: check schema, complete case coverage, source hashes, dataset/label bindings, telemetry and output path. No model or scientific approval was granted.");process.exitCode=1}
