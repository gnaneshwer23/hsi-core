/**
 * CALIBER harness for the context-conflict audit. It scores; it never invents gold. A case counts toward accuracy only when
 * it carries an adjudication by at least two distinct humans, each with a declared conflict statement and a review reference.
 * Engineering regression cases (synthetic fixtures) are checked for reproducibility only, never for accuracy, so the engine
 * cannot be tuned against labels this repository wrote itself. Every rate is reported with its denominator; with no
 * adjudicated cases the harness says so instead of printing a number.
 */
import type {ContextConflictAudit,ContextConflictClass} from "./evidence/contextConflictAudit";

export type Adjudication={status:"unadjudicated"}|{status:"adjudicated";adjudicators:{principal:string;conflictDeclared:true}[];reviewRef:string;expected:{pairKey:string;classification:ContextConflictClass}[]};
export type CaliberCase={id:string;kind:"adjudicated_benchmark"|"engineering_regression"|"awaiting_scientist";scope:string;adjudication:Adjudication};
export type CaliberRun={caseId:string;first:ContextConflictAudit;second?:ContextConflictAudit};
export type CaliberReport={
 adjudicatedCases:number;scoredPairs:number;
 accuracy:{correct:number;of:number;rate:number|null};
 abstention:{abstained:number;of:number;rate:number|null};
 reproducibility:{identical:number;of:number;rate:number|null};
 excluded:{caseId:string;reason:string}[];
 safety:{approvedOrPromotable:number;of:number};
 note:string;
};
export const pairKey=(a:string,b:string)=>[a,b].sort().join("|");
const rate=(n:number,d:number)=>d?n/d:null;

export function validateAdjudication(a:Adjudication):string[]{
 if(a.status==="unadjudicated")return [];
 const errs:string[]=[],ps=a.adjudicators.map(x=>x.principal);
 if(ps.length<2||new Set(ps).size!==ps.length)errs.push("at least two distinct adjudicators required");
 if(a.adjudicators.some(x=>x.conflictDeclared!==true||/^(system|model|bot)/i.test(x.principal)))errs.push("each adjudicator must be a human with a declared conflict statement");
 if(!/^[A-Za-z0-9][A-Za-z0-9:_./-]{2,200}$/.test(a.reviewRef))errs.push("review reference required");
 if(!a.expected.length)errs.push("no expected labels");
 return errs;
}

export function scoreCaliber(cases:readonly CaliberCase[],runs:readonly CaliberRun[]):CaliberReport{
 const excluded:CaliberReport["excluded"]=[];let correct=0,pairs=0,abstained=0,identical=0,repOf=0,adjudicated=0,unsafe=0;
 const byId=new Map(cases.map(c=>[c.id,c]));
 for(const run of runs){
  const c=byId.get(run.caseId);
  if(!c){excluded.push({caseId:run.caseId,reason:"unknown case"});continue}
  const a=run.first;
  if(a.scientificApproval!==false||a.graphPromotable!==false||a.consensusEstablished!==false)unsafe++;
  if(run.second){repOf++;if(run.second.auditHash===a.auditHash)identical++}
  if(c.kind!=="adjudicated_benchmark"){excluded.push({caseId:c.id,reason:c.kind==="engineering_regression"?"engineering regression: reproducibility only":"awaiting scientist adjudication"});continue}
  const bad=c.adjudication.status==="adjudicated"?validateAdjudication(c.adjudication):["not adjudicated"];
  if(bad.length||c.adjudication.status!=="adjudicated"){excluded.push({caseId:c.id,reason:"adjudication invalid: "+bad.join("; ")});continue}
  adjudicated++;
  const got=new Map<string,string>();
  for(const r of a.report){const cmp=a.comparisons.find(x=>x.id===r.comparisonId);if(cmp)got.set(pairKey(cmp.left.id,cmp.right.id),r.classification)}
  for(const e of c.adjudication.expected){
   pairs++;const g=got.get(e.pairKey);
   if(g==="insufficient_evidence")abstained++;
   if(g===e.classification)correct++;
  }
 }
 return {adjudicatedCases:adjudicated,scoredPairs:pairs,accuracy:{correct,of:pairs,rate:rate(correct,pairs)},abstention:{abstained,of:pairs,rate:rate(abstained,pairs)},
  reproducibility:{identical,of:repOf,rate:rate(identical,repOf)},excluded,safety:{approvedOrPromotable:unsafe,of:runs.length},
  note:adjudicated?"Rates are over adjudicated pairs only.":"No adjudicated cases exist: no accuracy is reported. Gold labels must come from appointed experts."};
}
