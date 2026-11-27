/**
 * LEA-04F: contradiction and context comparison over the published graph.
 *
 * Built on the existing contracts: `breakdownForPair`, `breakdownForConcept` and `assessConflict` do the classifying
 * (same context, across contexts, context not stated). This module adds which experimental variables differ between
 * findings, and candidate checks that could narrow the uncertainty. It never says which finding is right, never calls
 * a disagreement resolved, and never proposes a validated protocol.
 */
import {breakdownForConcept,breakdownForPair} from "../knowledgeGraph/contextBreakdown";
import {assessConflict,CONFLICT_LABEL,type ConflictClass} from "../knowledgeGraph/contextConflict";
import type {GraphAssertionView,GraphModel} from "./assertionView";
import {CONTEXT_LABEL,type ContextKey} from "./assertionView";

/** The distinctions the brief asks to preserve. */
export type Reading="potential_contradiction"|"context_dependence"|"insufficient_context"|"no_disagreement";
export const READING_LABEL:Record<Reading,string>={
 potential_contradiction:"Potential contradiction",context_dependence:"Possible context dependence",insufficient_context:"Insufficient context to tell",no_disagreement:"No disagreement recorded",
};
const READING_OF:Record<ConflictClass,Reading>={
 same_context_disagreement:"potential_contradiction",context_separated_disagreement:"context_dependence",disagreement_context_unknown:"insufficient_context",no_disagreement:"no_disagreement",
};
export const READING_RANK:Record<Reading,number>={potential_contradiction:0,context_dependence:1,insufficient_context:2,no_disagreement:3};

export type ComparisonUnit={
 id:string;kind:"pair"|"concept";subjectId:string;objectId:string|null;label:string;
 assertionIds:readonly string[];
 conflict:ConflictClass;conflictLabel:string;reading:Reading;
 statement:string;limits:readonly string[];strata:number;studies:number;
 adjudication:"not_performed";
};

const nameOf=(m:GraphModel,id:string)=>m.nodes.get(id)?.name??id;

/**
 * Units of comparison that touch the given assertions: every pair of concepts with more than one record, and every
 * concept whose records disagree. The breakdown uses all records for the pair or concept, so a unit is never
 * understated because the view is narrower than the graph.
 */
export function comparisonUnits(m:GraphModel,within:readonly GraphAssertionView[]):ComparisonUnit[]{
 const units:ComparisonUnit[]=[];
 const pairKeys=new Set<string>();
 for(const a of within)pairKeys.add([a.subject.id,a.object.id].sort().join("|"));
 for(const key of [...pairKeys].sort()){
  const [s,o]=key.split("|") as [string,string];
  const b=breakdownForPair(m.bundle,s,o);
  if(b.totals.records<2)continue;
  const c=assessConflict(b);
  units.push({id:`pair:${key}`,kind:"pair",subjectId:s,objectId:o,label:`${nameOf(m,s)} and ${nameOf(m,o)}`,assertionIds:b.strata.flatMap(x=>x.recordIds),conflict:c.classification,conflictLabel:CONFLICT_LABEL[c.classification],reading:READING_OF[c.classification],statement:c.statement,limits:c.limits,strata:b.totals.strata,studies:b.totals.studies,adjudication:c.adjudication});
 }
 const concepts=new Set(within.flatMap(a=>[a.subject.id,a.object.id]));
 for(const id of [...concepts].sort()){
  const b=breakdownForConcept(m.bundle,id);
  if(b.totals.records<2)continue;
  const c=assessConflict(b);
  if(c.classification==="no_disagreement")continue;
  units.push({id:`concept:${id}`,kind:"concept",subjectId:id,objectId:null,label:`Everything recorded about ${nameOf(m,id)}`,assertionIds:b.strata.flatMap(x=>x.recordIds),conflict:c.classification,conflictLabel:CONFLICT_LABEL[c.classification],reading:READING_OF[c.classification],statement:c.statement,limits:c.limits,strata:b.totals.strata,studies:b.totals.studies,adjudication:c.adjudication});
 }
 return units
  .sort((x,y)=>READING_RANK[x.reading]-READING_RANK[y.reading]||x.label.localeCompare(y.label));
}
/** Units that actually record a disagreement. */
export const disagreements=(us:readonly ComparisonUnit[])=>us.filter(u=>u.reading!=="no_disagreement");

/* -------------------------------------------------------- side-by-side comparison */

export const COMPARE_KEYS:readonly ContextKey[]=["species","modelSystem","tissue","population","assay","timepoint","intervention","endpoint"];
export type CellState={state:"stated";value:string}|{state:"not_stated"};
export type RowStatus="same"|"differs"|"cannot_tell"|"not_stated_by_any";
export type CompareRow={key:ContextKey|"direction";label:string;cells:readonly CellState[];status:RowStatus};
export type Comparison={
 assertionIds:readonly string[];rows:readonly CompareRow[];
 differs:readonly string[];cannotTell:readonly string[];
 /** Always true: the comparison sorts and highlights, it does not decide. */
 adjudication:"not_performed";
};
const cell=(a:GraphAssertionView,k:ContextKey):CellState=>{const v=a.context[k];return v.state==="stated"?{state:"stated",value:v.value}:{state:"not_stated"}};
const norm=(s:string)=>s.trim().toLowerCase().replace(/\s+/g," ");

function statusOf(cells:readonly CellState[]):RowStatus{
 const stated=cells.filter((c):c is {state:"stated";value:string}=>c.state==="stated").map(c=>norm(c.value));
 if(!stated.length)return "not_stated_by_any";
 const distinct=new Set(stated);
 if(distinct.size>1)return "differs";
 return stated.length<cells.length?"cannot_tell":"same";
}

/** Which recorded variables differ between 2 to 6 findings. A variable not stated by one side is "cannot tell", never "differs". */
export function compareAssertions(xs:readonly GraphAssertionView[]):Comparison{
 const list=xs.slice(0,6);
 const rows:CompareRow[]=[{
  key:"direction",label:"Direction of the finding",
  cells:list.map(a=>({state:"stated" as const,value:a.negated?"Recorded as not holding":"Reported"})),
  status:new Set(list.map(a=>a.negated)).size>1?"differs":"same",
 }];
 for(const k of COMPARE_KEYS){const cells=list.map(a=>cell(a,k));rows.push({key:k,label:CONTEXT_LABEL[k],cells,status:statusOf(cells)})}
 return {assertionIds:list.map(a=>a.id),rows,differs:rows.filter(r=>r.status==="differs").map(r=>r.label),cannotTell:rows.filter(r=>r.status==="cannot_tell"||r.status==="not_stated_by_any").map(r=>r.label),adjudication:"not_performed"};
}

/* --------------------------------------------------------------- candidate checks */

export type CandidateCheck={text:string;basis:"differs"|"cannot_tell"|"recorded_gap"};
/**
 * Candidate checks that could narrow the uncertainty. They are prompts for a person, never validated protocols,
 * and they never name a likely winner.
 */
export function candidateChecks(c:Comparison,m:GraphModel,subjectIds:readonly string[]):CandidateCheck[]{
 const out:CandidateCheck[]=[];
 for(const r of c.rows){
  if(r.key==="direction")continue;
  if(r.status==="differs")out.push({basis:"differs",text:`${r.label} differs between these findings. Compare them with ${r.label.toLowerCase()} held the same, to see whether the disagreement persists.`});
  if(r.status==="cannot_tell")out.push({basis:"cannot_tell",text:`${r.label} is not stated for every finding. Check the source for it before concluding the findings differ or agree.`});
 }
 const ids=new Set(subjectIds);
 for(const g of m.gaps)if(ids.has(g.subjectId)||ids.has(g.objectId))out.push({basis:"recorded_gap",text:`Recorded candidate study (not a protocol): ${g.nextStudy}`});
 return out.slice(0,8);
}
