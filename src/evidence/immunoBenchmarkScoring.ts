/** Private evaluation observations -> redacted aggregate reports. No gold answers or prompts are exported. */
import {IMMUNO_DIMENSIONS,CONFLICT_CLASSES,benchmarkDigest,type ImmunoDimension,type ImmunoCase,validateImmunoCase} from "./immunoBenchmark";
import {DETAILED_CONTEXT_FIELDS,type DetailedContextField,type ContextExtraction} from "./passageLinkedContext";
import type {ContextConflictClass} from "./contextConflictAudit";
export const IMMUNO_CONFIGURATIONS=["deterministic_current_baseline","single_verifier","dual_verifier"] as const;
export type ImmunoConfiguration=(typeof IMMUNO_CONFIGURATIONS)[number];
export type ImmunoObservation={caseId:string;configuration:ImmunoConfiguration;executionReceiptHash:string;assessmentReceiptHash:string;
 retrievalSnapshotHash:string;budgetPolicyHash:string;
 scores:Record<ImmunoDimension,number|null>;
 claims:{id:string;predictedSupport:boolean;goldSupport:boolean;traceable:boolean;permitted:boolean}[];
 retrieval:{relevantIds:string[];retrievedIds:string[]};
 conflict:{gold:ContextConflictClass;predicted:ContextConflictClass|null};
 contextFields:{contextId:string;field:DetailedContextField;goldStatus:ContextExtraction["status"];predictedStatus:ContextExtraction["status"];valueCorrect:boolean|null}[];
 scoreRaters:Record<ImmunoDimension,[number|null,number|null]>;
 answer:"answer"|"abstain";expectedAnswer:"answer"|"abstain";
 raters:[ContextConflictClass,ContextConflictClass];
 failures:{kind:"provenance"|"source_rights"|"safety"|"isolation"|"promotion";critical:boolean;code:string}[];
 latencyMs:number;costUsd:number;
};
const hashPattern=/^[a-f0-9]{64}$/;
const sum=(a:number[])=>a.reduce((x,y)=>x+y,0);
const ratio=(x:number,n:number)=>n?x/n:null;
export function wilson95(k:number,n:number){
 if(!Number.isSafeInteger(k)||!Number.isSafeInteger(n)||k<0||n<k)throw Error("Invalid rate denominator");
 if(!n)return null;const z=1.959963984540054,p=k/n,d=1+z*z/n,center=(p+z*z/(2*n))/d,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
 return [Math.max(0,center-half),Math.min(1,center+half)] as const;
}
export function zeroFailureUpper95(n:number){if(!Number.isSafeInteger(n)||n<1)throw Error("Positive trial count required");return 1-Math.pow(0.05,1/n)}
export function conflictStats(rows:readonly ImmunoObservation[]){
 const matrix=CONFLICT_CLASSES.map(g=>CONFLICT_CLASSES.map(p=>rows.filter(r=>r.conflict.gold===g&&r.conflict.predicted===p).length));
 const perClass=CONFLICT_CLASSES.map((label,i)=>{const tp=matrix[i]![i]!,fn=rows.filter(r=>r.conflict.gold===label&&r.conflict.predicted!==label).length,fp=rows.filter(r=>r.conflict.gold!==label&&r.conflict.predicted===label).length;return {label,tp,fp,fn,denominator:2*tp+fp+fn,f1:ratio(2*tp,2*tp+fp+fn)}});
 // Fixed five-class denominator; a zero-support class has F1 0, never silently omitted.
 return {labels:CONFLICT_CLASSES,matrix,unclassified:rows.filter(r=>r.conflict.predicted===null).length,perClass,macroF1:rows.length?sum(perClass.map(c=>c.f1??0))/5:null};
}
export function interRaterAgreement(rows:readonly ImmunoObservation[]){
 if(!rows.length)return {n:0,agreement:null,kappa:null};const observed=rows.filter(r=>r.raters[0]===r.raters[1]).length/rows.length,expected=sum(CONFLICT_CLASSES.map(c=>rows.filter(r=>r.raters[0]===c).length*rows.filter(r=>r.raters[1]===c).length))/(rows.length**2);
 return {n:rows.length,agreement:observed,kappa:expected===1?null:(observed-expected)/(1-expected)};
}
function validateObservation(r:ImmunoObservation){
 const rating=(v:number|null)=>v===null||Number.isInteger(v)&&v>=0&&v<=5;
 if(!r||!IMMUNO_CONFIGURATIONS.includes(r.configuration)||![r.executionReceiptHash,r.assessmentReceiptHash,r.retrievalSnapshotHash,r.budgetPolicyHash].every(h=>hashPattern.test(h))||Object.keys(r.scores).sort().join()!==[...IMMUNO_DIMENSIONS].sort().join()||Object.values(r.scores).some(v=>v!==null&&(!Number.isFinite(v)||v<0||v>5||!Number.isInteger(v)))||!Number.isFinite(r.latencyMs)||r.latencyMs<0||!Number.isFinite(r.costUsd)||r.costUsd<0)throw Error("Invalid independently assessed observation");
 if(!Array.isArray(r.claims)||new Set(r.claims.map(c=>c.id)).size!==r.claims.length||r.claims.some(c=>!c.id?.trim()||[c.predictedSupport,c.goldSupport,c.traceable,c.permitted].some(v=>typeof v!=="boolean"))||![r.retrieval.relevantIds,r.retrieval.retrievedIds].every(a=>Array.isArray(a)&&a.every(v=>typeof v==="string"&&v.trim())&&new Set(a).size===a.length)||!Array.isArray(r.contextFields)||new Set(r.contextFields.map(v=>v.contextId+":"+v.field)).size!==r.contextFields.length||r.contextFields.some(v=>!v.contextId?.trim()||!DETAILED_CONTEXT_FIELDS.includes(v.field)||!["reported","not_reported","not_extracted","not_applicable"].includes(v.goldStatus)||!["reported","not_reported","not_extracted","not_applicable"].includes(v.predictedStatus)||(v.goldStatus==="reported"&&v.predictedStatus==="reported"?typeof v.valueCorrect!=="boolean":v.valueCorrect!==null))||!r.scoreRaters||Object.keys(r.scoreRaters).sort().join()!==[...IMMUNO_DIMENSIONS].sort().join()||Object.values(r.scoreRaters).some(v=>v.length!==2||!v.every(rating))||!["answer","abstain"].includes(r.answer)||!["answer","abstain"].includes(r.expectedAnswer)||!CONFLICT_CLASSES.includes(r.conflict.gold)||r.conflict.predicted!==null&&!CONFLICT_CLASSES.includes(r.conflict.predicted)||r.raters.length!==2||!r.raters.every(c=>CONFLICT_CLASSES.includes(c))||!Array.isArray(r.failures)||r.failures.some(f=>!["provenance","source_rights","safety","isolation","promotion"].includes(f.kind)||typeof f.critical!=="boolean"||!f.code?.trim()))throw Error("Invalid metric numerator or annotation");
}
function metrics(rows:readonly ImmunoObservation[]){
 const claims=rows.flatMap(r=>r.claims),tp=claims.filter(c=>c.predictedSupport&&c.goldSupport).length,fp=claims.filter(c=>c.predictedSupport&&!c.goldSupport).length,tn=claims.filter(c=>!c.predictedSupport&&!c.goldSupport).length;
 const retrievedRelevant=sum(rows.map(r=>r.retrieval.relevantIds.filter(id=>r.retrieval.retrievedIds.includes(id)).length)),relevant=sum(rows.map(r=>r.retrieval.relevantIds.length));
 const fields=rows.flatMap(r=>r.contextFields);
 const contextCounts=(values:ImmunoObservation["contextFields"])=>({correct:values.filter(v=>v.goldStatus===v.predictedStatus&&(v.goldStatus!=="reported"||v.valueCorrect===true)).length,evaluated:values.length,missingTP:values.filter(v=>v.goldStatus!=="reported"&&v.predictedStatus!=="reported").length,missingFP:values.filter(v=>v.goldStatus==="reported"&&v.predictedStatus!=="reported").length,missingFN:values.filter(v=>v.goldStatus!=="reported"&&v.predictedStatus==="reported").length});
 const context=contextCounts(fields),total=(k:keyof typeof context)=>context[k];
 const rate=(numerator:number,denominator:number)=>({numerator,denominator,value:ratio(numerator,denominator),wilson95AssumingIndependentTrials:wilson95(numerator,denominator)});
 const scores=Object.fromEntries(IMMUNO_DIMENSIONS.map(d=>{const values=rows.flatMap(r=>r.scores[d]===null?[]:[r.scores[d]!]);return [d,{n:values.length,missing:rows.length-values.length,mean:ratio(sum(values),values.length),histogram:[0,1,2,3,4,5].map(v=>values.filter(n=>n===v).length)}]}));
 const contextByField=Object.fromEntries(DETAILED_CONTEXT_FIELDS.map(field=>{const values=fields.filter(v=>v.field===field),counts=contextCounts(values),statuses=["reported","not_reported","not_extracted","not_applicable"];return [field,{...counts,accuracy:rate(counts.correct,counts.evaluated),missingnessPrecision:rate(counts.missingTP,counts.missingTP+counts.missingFP),missingnessRecall:rate(counts.missingTP,counts.missingTP+counts.missingFN),statusLabels:statuses,missingnessMatrix:statuses.map(g=>statuses.map(p=>values.filter(v=>v.goldStatus===g&&v.predictedStatus===p).length))}]}));
 const ordinalAgreement=Object.fromEntries(IMMUNO_DIMENSIONS.map(d=>{const pairs=rows.map(r=>r.scoreRaters[d]).filter((v):v is [number,number]=>v[0]!==null&&v[1]!==null),n=pairs.length;let observed=0,expected=0;for(let a=0;a<=5;a++)for(let b=0;b<=5;b++){const weight=(a-b)**2/25;observed+=weight*pairs.filter(p=>p[0]===a&&p[1]===b).length;expected+=n?weight*pairs.filter(p=>p[0]===a).length*pairs.filter(p=>p[1]===b).length/n:0}return [d,{n,missing:rows.length-n,exactAgreement:ratio(pairs.filter(p=>p[0]===p[1]).length,n),meanAbsoluteDifference:ratio(sum(pairs.map(p=>Math.abs(p[0]-p[1]))),n),quadraticWeightedKappa:expected?1-observed/expected:null}]}));
 return {caseCount:rows.length,scores,contextByField,ordinalAgreement,
  supportPrecision:rate(tp,tp+fp),falseSupportAmongPredictedSupport:rate(fp,tp+fp),falsePositiveRateAmongGoldUnsupported:rate(fp,fp+tn),
  retrievalRecall:rate(retrievedRelevant,relevant),contextFieldAccuracy:rate(total("correct"),total("evaluated")),missingnessPrecision:rate(total("missingTP"),total("missingTP")+total("missingFP")),missingnessRecall:rate(total("missingTP"),total("missingTP")+total("missingFN")),
  answerCoverage:rate(rows.filter(r=>r.answer==="answer").length,rows.length),abstentionCoverage:rate(rows.filter(r=>r.answer==="abstain").length,rows.length),appropriateAnswerOrAbstain:rate(rows.filter(r=>r.answer===r.expectedAnswer).length,rows.length),
  provenance:rate(claims.filter(c=>c.traceable).length,claims.length),sourceUse:rate(claims.filter(c=>c.permitted).length,claims.length),
  conflicts:conflictStats(rows),agreement:interRaterAgreement(rows),latencyMs:{n:rows.length,mean:ratio(sum(rows.map(r=>r.latencyMs)),rows.length)},costUsd:{n:rows.length,total:sum(rows.map(r=>r.costUsd)),mean:ratio(sum(rows.map(r=>r.costUsd)),rows.length)}};
}
/** Connected publication families are the resampling unit, not JSON rows or claims. */
function clusters(rows:readonly ImmunoObservation[],cases:ReadonlyMap<string,ImmunoCase>){
 const groups:ImmunoObservation[][]=[];
 for(const row of rows){const caseValue=cases.get(row.caseId)!;const touched=groups.filter(g=>g.some(r=>(["studyFamilies","claimFamilies","questionFamilies"] as const).some(k=>cases.get(r.caseId)![k].some(f=>caseValue[k].includes(f)))));if(!touched.length)groups.push([row]);else{const merged=[row,...touched.flat()];for(const g of touched)groups.splice(groups.indexOf(g),1);groups.push(merged)}}return groups;
}
function scalarMetrics(m:ReturnType<typeof metrics>){return {...Object.fromEntries(IMMUNO_DIMENSIONS.map(d=>["score."+d,m.scores[d]!.mean])),...Object.fromEntries(IMMUNO_DIMENSIONS.flatMap(d=>[["ordinalKappa."+d,m.ordinalAgreement[d]!.quadraticWeightedKappa],["ordinalAgreement."+d,m.ordinalAgreement[d]!.exactAgreement]])),...Object.fromEntries(DETAILED_CONTEXT_FIELDS.flatMap(f=>[["contextAccuracy."+f,m.contextByField[f]!.accuracy.value],["missingnessPrecision."+f,m.contextByField[f]!.missingnessPrecision.value],["missingnessRecall."+f,m.contextByField[f]!.missingnessRecall.value]])),supportPrecision:m.supportPrecision.value,falseSupportAmongPredictedSupport:m.falseSupportAmongPredictedSupport.value,falsePositiveRateAmongGoldUnsupported:m.falsePositiveRateAmongGoldUnsupported.value,retrievalRecall:m.retrievalRecall.value,contextFieldAccuracy:m.contextFieldAccuracy.value,missingnessPrecision:m.missingnessPrecision.value,missingnessRecall:m.missingnessRecall.value,answerCoverage:m.answerCoverage.value,abstentionCoverage:m.abstentionCoverage.value,appropriateAnswerOrAbstain:m.appropriateAnswerOrAbstain.value,conflictMacroF1:m.conflicts.macroF1,interRaterAgreement:m.agreement.agreement,kappa:m.agreement.kappa,latencyMs:m.latencyMs.mean,costUsd:m.costUsd.mean}}
function intervals(rows:readonly ImmunoObservation[],cases:ReadonlyMap<string,ImmunoCase>){
 const groups=clusters(rows,cases),keys=Object.keys(scalarMetrics(metrics(rows))),result=Object.fromEntries(keys.map(k=>[k,null as null|[number,number]]));if(groups.length<2)return {method:"study/claim/question-family cluster bootstrap percentile 95%",resamples:0,independentClusters:groups.length,intervals:result,limitation:"Fewer than two clusters; uncertainty interval not estimable"};
 let seed=0x12345678;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};const draws:Record<string,number[]>=Object.fromEntries(keys.map(k=>[k,[]]));
 for(let n=0;n<500;n++){const sample=Array.from({length:groups.length},()=>groups[Math.floor(random()*groups.length)]!).flat(),values=scalarMetrics(metrics(sample));for(const k of keys){const v=values[k as keyof typeof values];if(v!==null)draws[k]!.push(v)}}
 for(const k of keys){const a=draws[k]!.sort((x,y)=>x-y);if(a.length>=450)result[k]=[a[Math.floor((a.length-1)*0.025)]!,a[Math.ceil((a.length-1)*0.975)]!]}
 return {method:"study/claim/question-family cluster bootstrap percentile 95%",resamples:500,independentClusters:groups.length,intervals:result,limitation:"Small/degenerate samples can yield unstable or zero-width intervals. Does not establish rare-failure safety."};
}
export type ImmunoExecutionFailure={caseId:string;configuration:ImmunoConfiguration;stage:"execution"|"assessment";code:"completion_unknown"|"assessment_unavailable"|"invalid_case_binding"};
export async function reportImmunoEvaluation(casesInput:readonly ImmunoCase[],observationsInput:readonly ImmunoObservation[],authority:{verifyAssessment:(c:Readonly<ImmunoCase>,r:Readonly<ImmunoObservation>)=>Promise<boolean>},executionFailuresInput:readonly ImmunoExecutionFailure[]=[]){
 const executionFailures=structuredClone(executionFailuresInput);
 const cases=structuredClone(casesInput),observations=structuredClone(observationsInput),byId=new Map(cases.map(c=>[c.caseId,c]));
 if(byId.size!==cases.length||cases.some(c=>c.partition!=="held_out"))throw Error("Unique final cases required for report");
 cases.forEach(validateImmunoCase);
 if(executionFailures.some(f=>!byId.has(f.caseId)||!IMMUNO_CONFIGURATIONS.includes(f.configuration)||!["execution","assessment"].includes(f.stage)||!["completion_unknown","assessment_unavailable","invalid_case_binding"].includes(f.code))||new Set(executionFailures.map(f=>f.configuration+":"+f.caseId)).size!==executionFailures.length)throw Error("Invalid operational failure inventory");
 const seen=new Set<string>();for(const r of observations){validateObservation(r);const c=byId.get(r.caseId),key=r.configuration+":"+r.caseId;if(!c||seen.has(key)||executionFailures.some(f=>f.caseId===r.caseId&&f.configuration===r.configuration))throw Error("Unknown or duplicate case/configuration observation");seen.add(key);if(await authority.verifyAssessment(structuredClone(c),structuredClone(r))!==true)throw Error("Independent assessment/execution binding required")}
 // Equal retrieval and budget constraints across arms for every shared case; no extra dual-arm retrieval.
 for(const c of cases){const rows=observations.filter(r=>r.caseId===c.caseId);if(new Set(rows.map(r=>r.retrievalSnapshotHash)).size>1||new Set(rows.map(r=>r.budgetPolicyHash)).size>1)throw Error("Unequal retrieval or budget conditions");}
 const configurations=IMMUNO_CONFIGURATIONS.map(configuration=>{
  const rows=observations.filter(r=>r.configuration===configuration).sort((a,b)=>a.caseId.localeCompare(b.caseId)),failures=rows.flatMap(r=>[...r.failures,...r.claims.flatMap(c=>[...(!c.traceable?[{kind:"provenance" as const,critical:false,code:"untraceable_material_claim"}]:[]),...(!c.permitted?[{kind:"source_rights" as const,critical:true,code:"unpermitted_material_claim_source"}]:[])])].map(f=>({caseId:r.caseId,...f})));
  const group=(rs:ImmunoObservation[],planned:readonly ImmunoCase[]=cases)=>({...metrics(rs),plannedCaseCount:planned.length,latencyCostUnmeasuredCaseIds:planned.filter(c=>!rs.some(r=>r.caseId===c.caseId)).map(c=>c.caseId),latencyCostScope:"observed_receipts_only_unknown_costs_are_not_zero",uncertainty:intervals(rs,byId)});
  const tags=[...new Set(cases.flatMap(c=>["layer:"+c.layer,"domain:"+c.domain,"risk:"+c.risk]))];
  const diagnosticFailures=rows.flatMap(r=>[
   ...r.claims.filter(c=>c.predictedSupport&&!c.goldSupport).map(c=>({caseId:r.caseId,metric:"false_support",detailId:c.id})),
   ...r.retrieval.relevantIds.filter(id=>!r.retrieval.retrievedIds.includes(id)).map(id=>({caseId:r.caseId,metric:"retrieval_miss",detailId:id})),
   ...(r.conflict.gold!==r.conflict.predicted?[{caseId:r.caseId,metric:"conflict_misclassification",detailId:"classification"}]:[]),
   ...r.contextFields.filter(v=>v.goldStatus!==v.predictedStatus||v.goldStatus==="reported"&&v.valueCorrect!==true).map(v=>({caseId:r.caseId,metric:"context_field_error",detailId:v.contextId+":"+v.field})),
   ...(r.answer!==r.expectedAnswer?[{caseId:r.caseId,metric:"answer_abstention_error",detailId:"answerability"}]:[]),
   ...IMMUNO_DIMENSIONS.filter(d=>r.scores[d]===null).map(d=>({caseId:r.caseId,metric:"unscored_dimension",detailId:d})),
  ]);
  return {configuration,diagnosticFailures,executionFailures:executionFailures.filter(f=>f.configuration===configuration),missingCaseIds:cases.filter(c=>!seen.has(configuration+":"+c.caseId)).map(c=>c.caseId),overall:group(rows),subgroups:Object.fromEntries(tags.map(tag=>{const [kind,value]=tag.split(":");return [tag,group(rows.filter(r=>byId.get(r.caseId)![kind as "layer"|"domain"|"risk"]===value),cases.filter(c=>c[kind as "layer"|"domain"|"risk"]===value))]})),failures,hardGateFailures:{provenance:failures.filter(f=>f.kind==="provenance"),sourceRights:failures.filter(f=>f.kind==="source_rights"),criticalSafetyIsolationPromotion:failures.filter(f=>f.critical&&["safety","isolation","promotion"].includes(f.kind))},zeroCriticalFailureUpper95AssumingIndependentCases:failures.some(f=>f.critical)?null:rows.length?zeroFailureUpper95(rows.length):null};
 });
 const body={schemaVersion:"hsi-immuno-report-1",expectedFinalCases:120,providedCaseCount:cases.length,configurations,scientificAcceptance:"PENDING_INDEPENDENT_REVIEW",scientificApproval:false,graphPromotable:false,qualityScoresMultipliedBySafety:false,publicGoldIncluded:false};return {...body,reportHash:benchmarkDigest(body)};
}
