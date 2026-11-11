/** B-04.4 operational benchmark harness: evaluates injected model executions on adjudicated cases. */
import {randomUUID} from "node:crypto";
import {evaluateScientificReliability,validateBenchmarkCases,type BenchmarkCase,type ReliabilityReport} from "./scientificReliabilityGate";
import {executeDualModelChallenge,type ModelVerifier} from "./dualModelChallenge";
import type {EvidenceClaim,PassageResult} from "./passageVerification";
import {isGroundedPassageResult,PASSAGE_CHECK_KEYS,requiresScientificException} from "./passageVerification";
import type {SourceClearanceVerifier} from "./sourceClearanceReceipt";
export interface EvaluationExample{
 id:string;claim:EvidenceClaim;passage:string;receipt:PassageResult;
 gold:"supports"|"contradicts"|"insufficient";goldReviewerIds:string[];goldAdjudicated:boolean;
 sourceIdentityVerified:boolean;rightsVerified:boolean;retractionCleared:boolean;
 /** Legacy booleans above are descriptive only. Only the trusted verifier authorizes egress. */
 sourceVersion?:string;clearanceReceipt?:unknown;
}
export interface EvaluationExecution {runId:string;caseId:string;verifierId:string;modelId:string;status:"assessed"|"not_assessed";providerRequestId:null;}
export interface EvaluationOutput{report:ReliabilityReport;cases:BenchmarkCase[];modelFailures:number;executions:EvaluationExecution[];blockedReasons:Record<string,string>;releaseEligible:false;}
const checkKeys=PASSAGE_CHECK_KEYS;
function preflight(example:EvaluationExample):BenchmarkCase{
 const c=example?.claim,r=example?.receipt;
 if(!c||!r||r.claimId!==c.id||r.sourceId!==c.sourceId||typeof example.passage!=="string"||!example.passage.trim()||example.passage.length>3000||typeof c.exactQuote!=="string"||!c.exactQuote.trim()||!example.passage.includes(c.exactQuote)||[c.id,c.subjectId,c.predicate,c.objectId].some(s=>typeof s!=="string"||!s.trim()||s.length>128)||!c.context||!Array.isArray(c.context.diseaseIds)||c.context.diseaseIds.some(s=>typeof s!=="string"||!s.trim()||s.length>128)||new Set(c.context.diseaseIds).size!==c.context.diseaseIds.length||[c.context.species,c.context.tissueId,c.context.cellId,c.context.method].some(s=>s!==null&&(typeof s!=="string"||!s.trim()||s.length>128))||!r.checks||Object.keys(r.checks).sort().join(",")!==[...checkKeys].sort().join(",")||Object.values(r.checks).some(v=>typeof v!=="boolean")||!["grounded_candidate","needs_evidence","exception_review"].includes(r.disposition)||r.scientificTruthEstablished!==false||r.graphPromotable!==false||r.humanApproval!==false||example.goldAdjudicated!==true||[example.sourceIdentityVerified,example.rightsVerified,example.retractionCleared].some(v=>typeof v!=="boolean"))throw Error("Invalid benchmark example");
 return {id:example.id,sourceId:c.sourceId,gold:example.gold,goldReviewerIds:[...example.goldReviewerIds],goldAdjudicated:example.goldAdjudicated,prediction:"not_assessed",sourceIdentityVerified:false,rightsVerified:false,retractionCleared:false,modelRunIds:[]};
}
export async function evaluateWithTwoModels(examples:EvaluationExample[],first:ModelVerifier,second:ModelVerifier,options:{clearance?:SourceClearanceVerifier}={}):Promise<EvaluationOutput>{
 if(!Array.isArray(examples)||examples.length>1000)throw Error("Invalid evaluation batch");
 if(!first||!second||[first,second].some(v=>typeof v.verifierId!=="string"||!v.verifierId.trim()||typeof v.modelId!=="string"||!v.modelId.trim()||typeof v.runner!=="function")||first.verifierId===second.verifierId||first.modelId===second.modelId||first.runner===second.runner)throw Error("Distinct verifier configurations required");
 first=Object.freeze({...first});second=Object.freeze({...second});
 // Validate and snapshot the entire batch before any authority or model execution.
 const batch=structuredClone(examples);
 const cases=batch.map(preflight);validateBenchmarkCases(cases);
 const executions:EvaluationExecution[]=[],blockedReasons:Record<string,string>=Object.create(null);let modelFailures=0;
 const authorize=options.clearance?.authorize;
 for(let i=0;i<batch.length;i++){
  const example=batch[i]!,record=cases[i]!;
  if(!isGroundedPassageResult(example.receipt)||requiresScientificException(example.claim.predicate)){
   blockedReasons[record.id]="Passage grounding requires evidence or independent exception review";continue;
  }
  let cleared=false;
  try{cleared=!!authorize&&await authorize({receipt:example.clearanceReceipt,sourceId:example.claim.sourceId,sourceVersion:example.sourceVersion??"",passage:example.passage})===true;}catch{/* deny closed */}
  if(!cleared){blockedReasons[record.id]="Current trusted source clearance required";continue;}
  record.sourceIdentityVerified=record.rightsVerified=record.retractionCleared=true;
 }
 // A mixed-invalid batch cannot send earlier valid passages before a later failure.
 if(Object.keys(blockedReasons).length){
  for(const record of cases)blockedReasons[record.id]??="Batch blocked by another example";
  return {report:evaluateScientificReliability(cases),cases,modelFailures,executions,blockedReasons,releaseEligible:false};
 }
 for(let i=0;i<batch.length;i++){
  const example=batch[i]!,record=cases[i]!;
  // Clearance can expire/revoke during a long evaluation; recheck immediately before egress.
  let cleared=false;
  try{cleared=!!authorize&&await authorize({receipt:example.clearanceReceipt,sourceId:example.claim.sourceId,sourceVersion:example.sourceVersion??"",passage:example.passage})===true;}catch{/* deny closed */}
  if(!cleared){record.sourceIdentityVerified=record.rightsVerified=record.retractionCleared=false;blockedReasons[record.id]="Source clearance expired, revoked or unavailable";continue;}
  const runs=[first,second].map(v=>({runId:randomUUID(),caseId:example.id,verifierId:v.verifierId,modelId:v.modelId,status:"not_assessed" as const,providerRequestId:null}));
  const result=await executeDualModelChallenge(example.claim,example.passage,example.receipt,first,second);
  modelFailures+=result.challenges.filter(c=>c.verdict==="not_assessed").length;
  const a=result.challenges.map(c=>c.verdict);
  record.prediction=a.length===2&&a[0]===a[1]&&a[0]!=="not_assessed"&&(a[0]!=="supports"||result.adjudication.disposition==="candidate_only")?a[0]!:"not_assessed";
  const completed:EvaluationExecution[]=runs.map((r,n)=>({...r,status:result.challenges[n]?.verdict!=="not_assessed"?"assessed":"not_assessed"}));
  executions.push(...completed);record.modelRunIds=completed.filter(r=>r.status==="assessed").map(r=>r.runId);
 }
 return {report:evaluateScientificReliability(cases),cases,modelFailures,executions,blockedReasons,releaseEligible:false};
}
