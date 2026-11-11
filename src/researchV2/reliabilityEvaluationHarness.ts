/** B-04.4 operational benchmark harness: evaluates injected model executions on adjudicated cases. */
import {evaluateScientificReliability,type BenchmarkCase,type ReliabilityReport} from "./scientificReliabilityGate";
import {executeDualModelChallenge,type ModelVerifier} from "./dualModelChallenge";
import type {EvidenceClaim,PassageResult} from "./passageVerification";
export interface EvaluationExample{
 id:string;claim:EvidenceClaim;passage:string;receipt:PassageResult;
 gold:"supports"|"contradicts"|"insufficient";goldReviewerIds:string[];goldAdjudicated:boolean;
 sourceIdentityVerified:boolean;rightsVerified:boolean;retractionCleared:boolean;
}
export interface EvaluationOutput{report:ReliabilityReport;cases:BenchmarkCase[];modelFailures:number;releaseEligible:false;}
export async function evaluateWithTwoModels(examples:EvaluationExample[],first:ModelVerifier,second:ModelVerifier):Promise<EvaluationOutput>{
 if(!Array.isArray(examples)||examples.length>1000)throw Error("Invalid evaluation batch");
 const cases:BenchmarkCase[]=[];let modelFailures=0;
 for(const example of examples){
  if(!example||example.receipt.claimId!==example.claim.id||example.receipt.sourceId!==example.claim.sourceId||example.passage.length>3000)throw Error("Invalid benchmark example");
  // Even a benchmark may not transmit passages to external models without verified rights.
  if(!example.sourceIdentityVerified||!example.rightsVerified||!example.retractionCleared){
   cases.push({id:example.id,sourceId:example.claim.sourceId,gold:example.gold,goldReviewerIds:example.goldReviewerIds,goldAdjudicated:example.goldAdjudicated,prediction:"not_assessed",sourceIdentityVerified:example.sourceIdentityVerified,rightsVerified:example.rightsVerified,retractionCleared:example.retractionCleared,modelRunIds:[]});
   continue;
  }
  const result=await executeDualModelChallenge(example.claim,example.passage,example.receipt,first,second);
  modelFailures+=result.challenges.filter(c=>c.verdict==="not_assessed").length;
  const a=result.challenges.map(c=>c.verdict);
  const prediction=a.length===2&&a[0]===a[1]&&a[0]!=="not_assessed"?a[0]!:"not_assessed";
  cases.push({id:example.id,sourceId:example.claim.sourceId,gold:example.gold,goldReviewerIds:example.goldReviewerIds,goldAdjudicated:example.goldAdjudicated,prediction,sourceIdentityVerified:true,rightsVerified:true,retractionCleared:true,modelRunIds:result.challenges.filter(c=>c.verdict!=="not_assessed").map(c=>c.verifierId)});
 }
 return {report:evaluateScientificReliability(cases),cases,modelFailures,releaseEligible:false};
}
