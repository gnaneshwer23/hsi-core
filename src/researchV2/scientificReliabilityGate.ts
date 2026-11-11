/** B-04.4 scientific reliability gate: evidence-backed calibration, fail closed. */
export interface BenchmarkCase {id:string;sourceId:string;gold:"supports"|"contradicts"|"insufficient";goldReviewerIds:string[];goldAdjudicated:boolean;prediction:"supports"|"contradicts"|"insufficient"|"not_assessed";sourceIdentityVerified:boolean;rightsVerified:boolean;retractionCleared:boolean;modelRunIds:string[];}
export interface ReliabilityReport {
 schemaVersion:"hsi-reliability-report-2";
 total:number;adjudicated:number;
 /** @deprecated Use adjudicationCoverage; this is NOT inference coverage. */
 coverage:number;
 adjudicationCoverage:number;inferenceCoverage:number;
 supportPrecision:number|null;
 /** @deprecated Alias of falseDiscoveryRate, not the false-positive rate. */
 falseSupportRate:number|null;
 falseDiscoveryRate:number|null;falsePositiveRate:number|null;
 /** Legacy combined insufficient + not_assessed rate. */
 abstentionRate:number;
 technicalAbstentionRate:number;insufficientEvidenceRate:number;
 denominators:{total:number;adjudicated:number;predictedSupport:number;goldNonSupport:number};
 sourceIntegrityRate:number;releaseEligible:false;reasons:string[];
}
const nonempty=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0&&x.length<=256;
export function validateBenchmarkCases(cases:BenchmarkCase[]):void{
 if(!Array.isArray(cases)||cases.length>100000)throw Error("Invalid benchmark");
 const ids=new Set<string>();
 for(const c of cases){
  if(!c||!nonempty(c.id)||ids.has(c.id)||!nonempty(c.sourceId)||!["supports","contradicts","insufficient"].includes(c.gold)||!["supports","contradicts","insufficient","not_assessed"].includes(c.prediction)||!Array.isArray(c.goldReviewerIds)||!Array.isArray(c.modelRunIds)||[c.goldAdjudicated,c.sourceIdentityVerified,c.rightsVerified,c.retractionCleared].some(v=>typeof v!=="boolean")||c.goldReviewerIds.some(id=>!nonempty(id)||id!==id.trim())||new Set(c.goldReviewerIds).size!==c.goldReviewerIds.length||c.modelRunIds.some(id=>!nonempty(id))||new Set(c.modelRunIds).size!==c.modelRunIds.length||c.goldAdjudicated&&c.goldReviewerIds.length<2)throw Error("Invalid benchmark case");
  ids.add(c.id);
 }
}
export function evaluateScientificReliability(cases:BenchmarkCase[],minCases=100):ReliabilityReport {
 if(!Number.isInteger(minCases)||minCases<20)throw Error("Invalid benchmark");
 validateBenchmarkCases(cases);
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
 const nonSupport=valid.filter(c=>c.gold!=="supports").length;
 const technical=valid.filter(c=>c.prediction==="not_assessed").length;
 const insufficient=valid.filter(c=>c.prediction==="insufficient").length;
 return {schemaVersion:"hsi-reliability-report-2",total:n,adjudicated:valid.length,coverage:n?valid.length/n:0,adjudicationCoverage:n?valid.length/n:0,inferenceCoverage:valid.length?(valid.length-technical)/valid.length:0,supportPrecision:predictedSupport.length?trueSupport/predictedSupport.length:null,falseSupportRate:predictedSupport.length?falseSupport/predictedSupport.length:null,falseDiscoveryRate:predictedSupport.length?falseSupport/predictedSupport.length:null,falsePositiveRate:nonSupport?falseSupport/nonSupport:null,abstentionRate:valid.length?(technical+insufficient)/valid.length:0,technicalAbstentionRate:valid.length?technical/valid.length:0,insufficientEvidenceRate:valid.length?insufficient/valid.length:0,denominators:{total:n,adjudicated:valid.length,predictedSupport:predictedSupport.length,goldNonSupport:nonSupport},sourceIntegrityRate:valid.length?sourceOk.length/valid.length:0,releaseEligible:false,reasons};
}
