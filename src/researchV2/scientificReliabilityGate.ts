/** B-04.4 scientific reliability gate: evidence-backed calibration, fail closed. */
export interface BenchmarkCase {id:string;sourceId:string;gold:"supports"|"contradicts"|"insufficient";goldReviewerIds:string[];goldAdjudicated:boolean;prediction:"supports"|"contradicts"|"insufficient"|"not_assessed";sourceIdentityVerified:boolean;rightsVerified:boolean;retractionCleared:boolean;modelRunIds:string[];}
export interface ReliabilityReport {total:number;adjudicated:number;coverage:number;supportPrecision:number|null;falseSupportRate:number|null;abstentionRate:number;sourceIntegrityRate:number;releaseEligible:false;reasons:string[];}
export function evaluateScientificReliability(cases:BenchmarkCase[],minCases=100):ReliabilityReport {
 if(!Array.isArray(cases)||cases.length>100000||!Number.isInteger(minCases)||minCases<20)throw Error("Invalid benchmark");
 const ids=new Set<string>();
 for(const c of cases){
  if(!c||!c.id||ids.has(c.id)||!c.sourceId||!["supports","contradicts","insufficient"].includes(c.gold)||!["supports","contradicts","insufficient","not_assessed"].includes(c.prediction)||!Array.isArray(c.goldReviewerIds)||!Array.isArray(c.modelRunIds))throw Error("Invalid benchmark case");
  ids.add(c.id);
 }
 const n=cases.length,valid=cases.filter(c=>c.goldAdjudicated&&new Set(c.goldReviewerIds).size>=2&&c.goldReviewerIds.length>=2);
 const predictedSupport=valid.filter(c=>c.prediction==="supports");
 const trueSupport=predictedSupport.filter(c=>c.gold==="supports").length;
 const falseSupport=predictedSupport.length-trueSupport;
 const sourceOk=valid.filter(c=>c.sourceIdentityVerified&&c.rightsVerified&&c.retractionCleared);
 const reasons:string[]=[];
 if(valid.length<minCases)reasons.push("Insufficient independently adjudicated cases");
 if(predictedSupport.length===0)reasons.push("No positive predictions; support precision cannot be measured");
 if(sourceOk.length!==valid.length)reasons.push("Incomplete source identity, rights or retraction clearance");
 if(valid.some(c=>new Set(c.modelRunIds).size<2))reasons.push("Missing distinct model execution records");
 // No fixed acceptance threshold until the scientific governance team preregisters risk-specific metrics.
 reasons.push("Release thresholds, corpus representativeness and independent evaluation sign-off are not established");
 return {total:n,adjudicated:valid.length,coverage:n?valid.length/n:0,supportPrecision:predictedSupport.length?trueSupport/predictedSupport.length:null,falseSupportRate:predictedSupport.length?falseSupport/predictedSupport.length:null,abstentionRate:valid.length?valid.filter(c=>c.prediction==="not_assessed"||c.prediction==="insufficient").length/valid.length:0,sourceIntegrityRate:valid.length?sourceOk.length/valid.length:0,releaseEligible:false,reasons};
}
