/**
 * Synthetic trial pre-screening. Computable criteria are evaluated inside the clinical plane over synthetic profiles; criteria
 * that need judgement (consent, clinician assessment) are listed as human-review items and apply to everyone. The output is
 * pre-screening SUPPORT for a clinical research team: it never says a person is eligible, it only counts who is possibly eligible
 * on recorded data and needs a person's review. Only a released (suppressed, approved) aggregate is ever summarised for display.
 * Trials here are illustrative synthetic fixtures, not real studies.
 */
import {labelOf,type Criterion,type PhenotypeDefinition} from "./phenotype";
import type {ReleasedAggregate} from "./releaseGate";

export type Trial={id:string;title:string;area:string;phase:string;targetEnrollment:number;include:Criterion[];exclude:Criterion[];humanReview:string[];note:string;origin:"synthetic_illustrative"};
export const LABELS={possible:"Possibly eligible, needs clinical-team review",not:"Not eligible on recorded data",insufficient:"Not enough information on recorded data"} as const;

export const TRIALS:Trial[]=[
 {id:"trial:synthetic-metabolic-addon-illustrative",title:"Illustrative phase 2: add-on therapy in adults with raised HbA1c and overweight",area:"Metabolic",phase:"Phase 2 (illustrative)",targetEnrollment:40,
  include:[{kind:"age",min:18,max:75},{kind:"lab",test:"HbA1c",op:">=",value:7,at:"latest"},{kind:"bmi",min:27}],exclude:[{kind:"medication",includes:"GLP-1 receptor agonist"}],
  humanReview:["Able to give informed consent","No surgery planned in the next three months (clinician judgement)"],note:"Illustrative synthetic trial, not a real study.",origin:"synthetic_illustrative"},
 {id:"trial:synthetic-ra-biologic-naive-illustrative",title:"Illustrative phase 3: rheumatoid arthritis with raised inflammation, biologic-naive",area:"Immune",phase:"Phase 3 (illustrative)",targetEnrollment:12,
  include:[{kind:"condition",equals:"Rheumatoid arthritis"},{kind:"age",min:18,max:70},{kind:"lab",test:"hs-CRP",op:">=",value:3,at:"latest"}],exclude:[{kind:"medication",includes:"Biologic"}],
  humanReview:["Able to give informed consent","Disease activity confirmed by a rheumatologist"],note:"Illustrative synthetic trial, not a real study. A small condition group, so small-group protection will hide counts.",origin:"synthetic_illustrative"},
];
export const trialById=(id:string)=>TRIALS.find(t=>t.id===id)??null;
export const criterionLabel=labelOf;
/** The computable part of a trial as a definition the plane can evaluate. Human-review items are deliberately not part of it. */
export const trialDefinition=(t:Trial,graphVersion:string):PhenotypeDefinition=>({schema:"hsi-phenotype-definition-1",id:t.id,title:t.title.slice(0,160),origin:{kind:"authored",ref:t.id,graphVersion},include:t.include,exclude:t.exclude,summariseLabs:[],note:t.note.slice(0,400)});

export type PrescreenSummary={
 trialId:string;evaluated:number|null;
 categories:{key:"possible"|"not"|"insufficient";label:string;count:number|null}[];
 blockers:{label:string;kind:"include"|"exclude";count:number}[];blockersWithheld:number;
 feasibility:{possible:number|null;target:number;text:string};
 humanReview:string[];
 notes:string[];
};
/** Summarises a RELEASED aggregate. Suppressed (null) values stay null and are never filled in. */
export function summarisePrescreen(r:ReleasedAggregate,t:Trial):PrescreenSummary{
 const cat=(key:"possible"|"not"|"insufficient",count:number|null)=>({key,label:LABELS[key],count});
 const blockers:PrescreenSummary["blockers"]=[];let withheld=0;
 for(const row of r.attrition){const n=row.kind==="include"?row.counts.notMet:row.counts.met;if(n===null){withheld++;continue}if(n>0)blockers.push({label:row.label,kind:row.kind,count:n})}
 blockers.sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
 const possible=r.counts.matched;
 return {trialId:t.id,evaluated:r.counts.evaluated,categories:[cat("possible",possible),cat("not",r.counts.excluded),cat("insufficient",r.counts.indeterminate)],blockers,blockersWithheld:withheld,
  feasibility:{possible,target:t.targetEnrollment,text:possible===null?"The possibly-eligible count is hidden to protect small groups, so no feasibility figure is given.":`${possible} synthetic profiles are possibly eligible against a target of ${t.targetEnrollment}. This is a pre-screening count on synthetic data, not an enrolment forecast.`},
  humanReview:t.humanReview,
  notes:["Everyone counted as possibly eligible still needs a person to review the items below and the full record.",...(r.suppression.cellsSuppressed>0?[`${r.suppression.cellsSuppressed} counts are hidden because the group is smaller than ${r.smallCellThreshold}.`]:[])]};
}
