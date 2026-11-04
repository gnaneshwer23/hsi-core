/** HSI Step 5: privacy-safe clinical observation and trial criteria bridge.
 * Deliberately no patient identifiers, network ingestion, eligibility decisions or automated matching.
 */
export type ClinicalObservation={id:string;conceptId:string;display:string;value:number;unit:string;observedAt:string;sourceSystem:"synthetic";subjectType:"synthetic_case";syntheticCaseId:string};
export type TrialCriterion={id:string;trialId:string;conceptId:string;operator:"gte"|"gt"|"lte"|"lt";threshold:number;unit:string;criterionType:"inclusion"|"exclusion";source:"synthetic";reviewStatus:"draft"};
export type TrialRecord={id:string;title:string;conditionConceptId:string;interventionConceptId:string;criteria:TrialCriterion[];source:"synthetic";reviewStatus:"draft"};
export type CriterionResult={criterionId:string;state:"potentially_met"|"not_met"|"unknown";reason:string;observationId?:string};
export type TrialPrescreen={trialId:string;state:"requires_clinician_review"|"insufficient_data";results:CriterionResult[];limitations:string[]};
export const SYNTHETIC_OBSERVATIONS:ClinicalObservation[]=[
 {id:"obs-a1",conceptId:"hba1c",display:"HbA1c",value:67,unit:"mmol/mol",observedAt:"2026-10-01",sourceSystem:"synthetic",subjectType:"synthetic_case",syntheticCaseId:"synthetic-case-001"}
];
export const SYNTHETIC_TRIALS:TrialRecord[]=[
 {id:"synthetic-trial-001",title:"Illustrative glycaemic-control study (not a registered trial)",conditionConceptId:"type-2-diabetes",interventionConceptId:"glp1-ra",source:"synthetic",reviewStatus:"draft",criteria:[
 {id:"criterion-1",trialId:"synthetic-trial-001",conceptId:"hba1c",operator:"gte",threshold:58,unit:"mmol/mol",criterionType:"inclusion",source:"synthetic",reviewStatus:"draft"},
 {id:"criterion-2",trialId:"synthetic-trial-001",conceptId:"age",operator:"gte",threshold:18,unit:"years",criterionType:"inclusion",source:"synthetic",reviewStatus:"draft"}
 ]}
];
function evaluate(value:number,operator:TrialCriterion["operator"],threshold:number){switch(operator){case "gte":return value>=threshold;case "gt":return value>threshold;case "lte":return value<=threshold;case "lt":return value<threshold}}
export function prescreenSyntheticTrial(trial:TrialRecord,observations:ClinicalObservation[],syntheticCaseId:string):TrialPrescreen{
 const results=trial.criteria.map((criterion):CriterionResult=>{
  const matching=observations.filter(o=>o.subjectType==="synthetic_case"&&o.syntheticCaseId===syntheticCaseId&&o.conceptId===criterion.conceptId&&o.unit===criterion.unit).sort((a,b)=>b.observedAt.localeCompare(a.observedAt));
  const observation=matching[0];
  if(!observation)return {criterionId:criterion.id,state:"unknown",reason:"No comparable observation with the required concept and unit."};
  const passes=evaluate(observation.value,criterion.operator,criterion.threshold);
  const interpretation=criterion.criterionType==="exclusion"?(passes?"Exclusion threshold triggered; clinician must verify.":"Exclusion threshold not triggered; other exclusions may apply."):(passes?"Inclusion threshold met numerically; clinician must verify.":"Inclusion threshold not met numerically; clinician must verify.");
  return {criterionId:criterion.id,state:passes?"potentially_met":"not_met",reason:interpretation+" Illustrative numeric comparison only; temporal validity and clinical interpretation not evaluated.",observationId:observation.id};
 });
 return {trialId:trial.id,state:results.some(r=>r.state==="unknown")?"insufficient_data":"requires_clinician_review",results,limitations:["Synthetic case and trial only; no real patient data or live trial registry connection.","Numeric comparisons are not eligibility decisions. All inclusion and exclusion criteria, consent, timing and clinician confirmation are required."]};
}
export function validateSyntheticBridge(observations:ClinicalObservation[],trials:TrialRecord[]):string[]{
 const errors:string[]=[];
 for(const o of observations){if(o.subjectType!=="synthetic_case"||o.sourceSystem!=="synthetic"||!o.syntheticCaseId.startsWith("synthetic-")||!Number.isFinite(o.value))errors.push("Invalid synthetic observation "+o.id)}
 for(const t of trials){if(t.source!=="synthetic"||t.reviewStatus!=="draft")errors.push("Unreviewed trial cannot be represented as live "+t.id);for(const c of t.criteria)if(c.trialId!==t.id||c.source!=="synthetic"||c.reviewStatus!=="draft"||!Number.isFinite(c.threshold))errors.push("Invalid draft criterion "+c.id)}
 return errors;
}
