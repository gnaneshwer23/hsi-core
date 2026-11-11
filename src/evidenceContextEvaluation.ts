/** B-03.3: deterministic evaluation of context candidates against an adjudicated gold set.
 * Scores annotation detection only, not causal reasoning, scientific truth, or reviewer approval.
 */
import type {CandidateContextAnnotation,ContextField} from "./evidenceContextAnnotations";
export type GoldContextSpan={sourceId:string;passageId:string;sourceVersion:string;field:ContextField;start:number;end:number;exactText:string};
export type ContextEvaluation={
 truePositives:number;falsePositives:number;falseNegatives:number;
 precision:number;recall:number;f1:number;
 perField:Record<string,{tp:number;fp:number;fn:number}>;
};
const fields:readonly ContextField[]=["species","tissue","disease","cohort","method","intervention","comparator","outcome"];
function validSpan(x:GoldContextSpan|CandidateContextAnnotation){
 if(!x.sourceId||!x.passageId||!x.sourceVersion||!fields.includes(x.field)||
    !Number.isSafeInteger(x.start)||!Number.isSafeInteger(x.end)||x.start<0||
    x.end<=x.start||!x.exactText.trim()||x.exactText.length!==x.end-x.start)
  throw Error("Invalid evaluation span");
}
function key(x:GoldContextSpan|CandidateContextAnnotation){
 return JSON.stringify([x.sourceId,x.passageId,x.sourceVersion,x.field,x.start,x.end,x.exactText]);
}
export function evaluateContextCandidates(
 candidates:readonly CandidateContextAnnotation[],gold:readonly GoldContextSpan[]
):ContextEvaluation{
 const c=new Set<string>(),g=new Set<string>();
 for(const x of candidates){validSpan(x);if(x.status!=="candidate"||x.method!=="exact_span")throw Error("Non-candidate annotation");const k=key(x);if(c.has(k))throw Error("Duplicate candidate");c.add(k);}
 for(const x of gold){validSpan(x);const k=key(x);if(g.has(k))throw Error("Duplicate gold annotation");g.add(k);}
 const perField:ContextEvaluation["perField"]={};
 for(const field of fields)perField[field]={tp:0,fp:0,fn:0};
 let tp=0,fp=0,fn=0;
 for(const x of candidates){if(g.has(key(x))){tp++;perField[x.field]!.tp++;}else{fp++;perField[x.field]!.fp++;}}
 for(const x of gold)if(!c.has(key(x))){fn++;perField[x.field]!.fn++;}
 const precision=tp+fp===0?0:tp/(tp+fp),recall=tp+fn===0?0:tp/(tp+fn);
 return {truePositives:tp,falsePositives:fp,falseNegatives:fn,precision,recall,
  f1:precision+recall===0?0:2*precision*recall/(precision+recall),perField};
}
