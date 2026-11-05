/**
 * Fixture-only adapter. This module accepts no real/clinical records and creates no
 * scientific claim, medical interpretation, eligibility decision or governed release.
 */
import {rejectPhiPayload} from "./cdsPhiBoundary";
import {canonicalGraphContext} from "./investigationGraphContext";
export const SYNTHETIC_VALIDATION_VERSION="hsi-synthetic-validation-0.1" as const;
export const VALIDATION_TABLES=["patients","lab_results","medications","lifestyle","wearables","immune_profiles","microbiome","trials","evidence","hypotheses"] as const;
export type ValidationTable=typeof VALIDATION_TABLES[number];
type Guard={data_class:"synthetic";scientific_claim_allowed:false};
export type SyntheticPatient=Guard&{patient_id:string;condition:string;domain:string;age:number;sex:string;bmi:number;disease_stage:string;symptoms:string[];cohort:string};
export type SyntheticLab=Guard&{patient_id:string;visit:number;date:string;test:string;value:number;unit:string;flag:string};
export type SyntheticMedication=Guard&{patient_id:string;visit:number;medication:string};
export type SyntheticLifestyle=Guard&{patient_id:string;visit:number;diet_pattern:string;sleep_hours:number;activity_level:string;stress_level:string};
export type SyntheticWearable=Guard&{patient_id:string;visit:number;sleep_hours:number;hrv_ms:number;steps:number;resting_hr:number};
export type SyntheticImmune=Guard&{patient_id:string;visit:number;cd4_count:number;cd8_count:number;nk_activity:string;monocytes:string;th17_signature:string;treg_fraction:number};
export type SyntheticMicrobiome=Guard&{patient_id:string;visit:number;diversity:number;scfa_production:string;dysbiosis_score:number};
export type SyntheticTrial=Guard&{trial_id:string;condition:string;phase:string;intervention:string;biomarkers:string[];endpoints:string[];status:string};
export type SyntheticEvidence=Guard&{evidence_id:string;condition:string;claim:string;evidence_status:"synthetic_demo";confidence:"none";source_type:"synthetic_generator"};
export type SyntheticHypothesis=Guard&{hypothesis_id:string;condition:string;hypothesis:string;evidence_status:"ai_draft";review_status:"pending"};
export type SyntheticDataset={
 patients:SyntheticPatient[];lab_results:SyntheticLab[];medications:SyntheticMedication[];lifestyle:SyntheticLifestyle[];wearables:SyntheticWearable[];
 immune_profiles:SyntheticImmune[];microbiome:SyntheticMicrobiome[];trials:SyntheticTrial[];evidence:SyntheticEvidence[];hypotheses:SyntheticHypothesis[];
};
const guard:Guard={data_class:"synthetic",scientific_claim_allowed:false};
const patientId=/^SYN-P-\d{6}$/;
const specs={
 patients:{text:["patient_id","condition","domain","sex","disease_stage","cohort"],number:["age","bmi"],list:["symptoms"]},
 lab_results:{text:["patient_id","date","test","unit","flag"],number:["visit","value"],list:[]},
 medications:{text:["patient_id","medication"],number:["visit"],list:[]},
 lifestyle:{text:["patient_id","diet_pattern","activity_level","stress_level"],number:["visit","sleep_hours"],list:[]},
 wearables:{text:["patient_id"],number:["visit","sleep_hours","hrv_ms","steps","resting_hr"],list:[]},
 immune_profiles:{text:["patient_id","nk_activity","monocytes","th17_signature"],number:["visit","cd4_count","cd8_count","treg_fraction"],list:[]},
 microbiome:{text:["patient_id","scfa_production"],number:["visit","diversity","dysbiosis_score"],list:[]},
 trials:{text:["trial_id","condition","phase","intervention","status"],number:[],list:["biomarkers","endpoints"]},
 evidence:{text:["evidence_id","condition","claim","evidence_status","confidence","source_type"],number:[],list:[]},
 hypotheses:{text:["hypothesis_id","condition","hypothesis","evidence_status","review_status"],number:[],list:[]}
} satisfies Record<ValidationTable,{text:string[];number:string[];list:string[]}>;
const caps:Record<ValidationTable,number>={patients:500,lab_results:40000,medications:5000,lifestyle:5000,wearables:5000,immune_profiles:5000,microbiome:5000,trials:1000,evidence:5000,hypotheses:2000};
const text=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0&&x.length<=500&&!/[\u0000-\u001f<>]/.test(x);
function object(x:unknown):x is Record<string,unknown>{return !!x&&typeof x==="object"&&!Array.isArray(x)}
export function normalizeSyntheticTable(table:ValidationTable,value:unknown):Guard[] {
 if(!Array.isArray(value)||!value.length||value.length>caps[table])throw Error("Invalid fixture table budget: "+table);
 const spec=specs[table],keys=new Set<string>([...spec.text,...spec.number,...spec.list,"data_class","scientific_claim_allowed"]);
 return value.map((row,index)=>{
  if(!object(row)||row.data_class!=="synthetic"||("scientific_claim_allowed" in row&&row.scientific_claim_allowed!==false)||Object.keys(row).some(k=>!keys.has(k)))throw Error("Non-synthetic, promoted or unexpected fixture record: "+table+" row "+index);
  if(spec.text.some(k=>!text(row[k]))||spec.number.some(k=>typeof row[k]!=="number"||!Number.isFinite(row[k])||Math.abs(row[k] as number)>1e8)||spec.list.some(k=>!Array.isArray(row[k])||(row[k] as unknown[]).length>30||!(row[k] as unknown[]).every(text)))throw Error("Invalid fixture fields: "+table+" row "+index);
  if("patient_id" in row&&!patientId.test(String(row.patient_id)))throw Error("Only generated SYN patient IDs are accepted");
  if("visit" in row&&(!Number.isInteger(row.visit)||(row.visit as number)<1||(row.visit as number)>5))throw Error("Invalid fixture visit");
  if(table==="patients"&&(!Number.isInteger(row.age)||(row.age as number)<0||(row.age as number)>120||(row.bmi as number)<=0))throw Error("Invalid fixture demographics");
  if(table==="lab_results"&&(!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date))||!Number.isFinite(Date.parse(String(row.date)))||new Date(String(row.date)).toISOString().slice(0,10)!==row.date||!["high","normal","low"].includes(String(row.flag))))throw Error("Invalid fixture lab metadata");
  if(table==="trials"&&(!/^SYN-TRIAL-\d{3}$/.test(String(row.trial_id))||!["recruiting","active","completed"].includes(String(row.status))))throw Error("Invalid fixture trial");
  if(table==="evidence"&&(!/^SYN-EVID-\d{4}$/.test(String(row.evidence_id))||row.evidence_status!=="synthetic_demo"||row.confidence!=="none"||row.source_type!=="synthetic_generator"))throw Error("Synthetic evidence cannot be scientific support");
  if(table==="hypotheses"&&(!/^SYN-HYP-\d{4}$/.test(String(row.hypothesis_id))||row.evidence_status!=="ai_draft"||row.review_status!=="pending"))throw Error("Synthetic hypotheses must remain draft/pending");
  return structuredClone({...row,...guard}) as Guard;
 });
}
export function adaptSyntheticValidationDataset(raw:Record<ValidationTable,unknown>):SyntheticDataset{
 if(!object(raw)||Object.keys(raw).length!==VALIDATION_TABLES.length||Object.keys(raw).some(k=>!VALIDATION_TABLES.includes(k as ValidationTable)))throw Error("Unexpected fixture datasets");
 const d=Object.fromEntries(VALIDATION_TABLES.map(t=>[t,normalizeSyntheticTable(t,raw[t])])) as SyntheticDataset;
 const ids=new Set(d.patients.map(p=>p.patient_id));if(ids.size!==d.patients.length)throw Error("Duplicate synthetic patient");
 const conditions=new Set(d.patients.map(p=>p.condition));
 for(const t of VALIDATION_TABLES){
  const rows=d[t] as Array<Guard&Record<string,unknown>>,seen=new Set<string>();
  for(const row of rows){
   if("patient_id" in row&&!ids.has(String(row.patient_id)))throw Error("Orphan fixture patient");
   if("condition" in row&&!conditions.has(String(row.condition)))throw Error("Unknown fixture condition");
   const key=t==="patients"?row.patient_id:t==="evidence"?row.evidence_id:t==="hypotheses"?row.hypothesis_id:t==="trials"?row.trial_id:[row.patient_id,row.visit,t==="lab_results"?row.test:""].join(":");
   if(seen.has(String(key)))throw Error("Duplicate fixture row: "+t);seen.add(String(key));
  }
 }
 const visits=new Map<string,string>();
 for(const lab of d.lab_results){const key=lab.patient_id+":"+lab.visit,old=visits.get(key);if(old&&old!==lab.date)throw Error("Conflicting fixture visit dates");visits.set(key,lab.date)}
 for(const t of ["medications","lifestyle","wearables","immune_profiles","microbiome"] as const)for(const row of d[t])if(!visits.has(row.patient_id+":"+row.visit))throw Error("Profile has no aligned lab visit");
 return d;
}
export const VALIDATION_LIMITATIONS=[
 "Synthetic records test software behavior; they are not scientific evidence or clinical advice.",
 "The supplied lab flags are preserved, not clinically verified. Reference intervals, assay methods and specimen metadata are missing.",
 "Profile dates are not supplied. Visit alignment uses visit numbers; only lab observations have explicit dates.",
 "Immune count units, Treg denominator, microbiome index method and microbiome assay are not supplied.",
 "Medications include therapies/programmes; dose, route, frequency, start/stop dates and adherence are not supplied.",
 "Evidence and hypotheses are generic condition-level fixtures, with no publications, source passages or patient-specific causal support.",
 "Trial criteria, age bounds, sites, registry identifiers and screening rules are missing. Topic overlap is not eligibility.",
 "The context map shows record associations only; no biological mechanism or causal edge is established.",
 "The supplied values are not a calibrated clinical simulation, training set or labelled scientific accuracy benchmark."
];
export type ValidationPatientBundle=Guard&{
 schemaVersion:typeof SYNTHETIC_VALIDATION_VERSION;patient:SyntheticPatient;
 lab_results:SyntheticLab[];medications:SyntheticMedication[];lifestyle:SyntheticLifestyle[];wearables:SyntheticWearable[];immune_profiles:SyntheticImmune[];microbiome:SyntheticMicrobiome[];
};
export type ValidationConditionBundle=Guard&{schemaVersion:typeof SYNTHETIC_VALIDATION_VERSION;condition:string;trials:SyntheticTrial[];evidence:SyntheticEvidence[];hypotheses:SyntheticHypothesis[]};
export function patientValidationBundle(d:SyntheticDataset,id:string):ValidationPatientBundle{
 const patient=d.patients.find(p=>p.patient_id===id);if(!patient)throw Error("Unknown synthetic profile");
 return {...guard,schemaVersion:SYNTHETIC_VALIDATION_VERSION,patient,...Object.fromEntries((["lab_results","medications","lifestyle","wearables","immune_profiles","microbiome"] as const).map(t=>[t,d[t].filter(r=>r.patient_id===id)]))} as ValidationPatientBundle;
}
export function conditionValidationBundle(d:SyntheticDataset,condition:string):ValidationConditionBundle{
 if(!d.patients.some(p=>p.condition===condition))throw Error("Unknown fixture condition");
 return {...guard,schemaVersion:SYNTHETIC_VALIDATION_VERSION,condition,trials:d.trials.filter(r=>r.condition===condition),evidence:d.evidence.filter(r=>r.condition===condition),hypotheses:d.hypotheses.filter(r=>r.condition===condition)};
}
/** Validate individual network shards, not just the dataset used to generate them. */
export function verifyValidationBundles(p:unknown,c:unknown):{profile:ValidationPatientBundle;condition:ValidationConditionBundle}{
 if(!object(p)||!object(c)||p.schemaVersion!==SYNTHETIC_VALIDATION_VERSION||c.schemaVersion!==SYNTHETIC_VALIDATION_VERSION||p.data_class!=="synthetic"||c.data_class!=="synthetic"||p.scientific_claim_allowed!==false||c.scientific_claim_allowed!==false)throw Error("Invalid fixture shard envelope");
 const pkeys=["schemaVersion","data_class","scientific_claim_allowed","patient","lab_results","medications","lifestyle","wearables","immune_profiles","microbiome"].sort().join(),ckeys=["schemaVersion","data_class","scientific_claim_allowed","condition","trials","evidence","hypotheses"].sort().join();
 if(Object.keys(p).sort().join()!==pkeys||Object.keys(c).sort().join()!==ckeys||!object(p.patient)||p.patient.condition!==c.condition)throw Error("Wrong fixture shard binding");
 for(const rows of [[p.patient],p.lab_results,p.medications,p.lifestyle,p.wearables,p.immune_profiles,p.microbiome,c.trials,c.evidence,c.hypotheses]){
  if(!Array.isArray(rows)||rows.some(r=>!object(r)||r.scientific_claim_allowed!==false))throw Error("Normalised fixture guard missing");
 }
 const d=adaptSyntheticValidationDataset({patients:[p.patient],lab_results:p.lab_results,medications:p.medications,lifestyle:p.lifestyle,wearables:p.wearables,immune_profiles:p.immune_profiles,microbiome:p.microbiome,trials:c.trials,evidence:c.evidence,hypotheses:c.hypotheses});
 return {profile:patientValidationBundle(d,String(p.patient.patient_id)),condition:conditionValidationBundle(d,String(c.condition))};
}
export function validationTrialContext(p:ValidationPatientBundle,c:ValidationConditionBundle){
 if(p.patient.condition!==c.condition)throw Error("Wrong fixture condition");
 const tests=new Set(p.lab_results.map(l=>l.test));
 return c.trials.map(t=>({...t,match_basis:"exact_fixture_condition" as const,sharedBiomarkers:t.biomarkers.filter(b=>tests.has(b)),eligibility:"unknown_missing_criteria" as const,confirmedEligible:false,enrolmentAllowed:false,scientific_claim_allowed:false as const}));
}
export type ValidationReview={schemaVersion:"hsi-validation-review-1";reviewScope:"ui_workflow_only";actor:"demo-reviewer";author:"demo-author";outcome:"checked_for_ui_test"|"request_revision"|"reject";rationale:string;sequence:number;data_class:"synthetic";scientific_claim_allowed:false};
export function recordValidationReview(input:{actor:string;author:string;outcome:string;rationale:string},previous:readonly ValidationReview[]):ValidationReview{
 if(input.actor===input.author||input.actor!=="demo-reviewer"||input.author!=="demo-author"||!["checked_for_ui_test","request_revision","reject"].includes(input.outcome)||!text(input.rationale)||input.rationale.trim().length<12||previous.length>=20||!rejectPhiPayload({textBlobs:[input.rationale]}).ok)throw Error("Independent simulated review and bounded rationale required");
 return {...guard,schemaVersion:"hsi-validation-review-1",reviewScope:"ui_workflow_only",actor:"demo-reviewer",author:"demo-author",outcome:input.outcome as ValidationReview["outcome"],rationale:input.rationale.trim(),sequence:previous.length+1};
}
export function buildValidationBrief(p:ValidationPatientBundle,c:ValidationConditionBundle,reviews:readonly ValidationReview[]=[]){
 const checked=verifyValidationBundles(p,c);p=checked.profile;c=checked.condition;
 // Revalidate the entire rehearsal log; it never upgrades the source hypotheses.
 const verified:ValidationReview[]=[];for(const review of reviews){const next=recordValidationReview(review,verified);if(canonicalGraphContext(next)!==canonicalGraphContext(review))throw Error("Invalid simulated review log");verified.push(next)}
 return {...guard,schemaVersion:"hsi-validation-brief-1" as const,datasetVersion:SYNTHETIC_VALIDATION_VERSION,patient:p.patient,answer:"No scientific conclusion is established by these synthetic records. This brief reproduces a software-validation scenario only.",
  observations:p,evidence:c.evidence,hypotheses:c.hypotheses,trials:validationTrialContext(p,c),
  contextMap:{relationshipMeaning:"recorded_context_only",causalEdges:[],groups:["labs","medications","lifestyle","wearables","immune_profiles","microbiome"],biologicalMechanismEstablished:false},
  confidence:{status:"not_calibrated",value:null},missingData:[...VALIDATION_LIMITATIONS],reviewRehearsal:verified,actualResearchReview:"not_performed",generatedByModel:false,clinicalAdvice:false,graphPublicationAllowed:false,enrolmentAllowed:false,disclaimer:"Synthetic software-validation output only. Not scientific evidence, diagnosis, treatment or trial eligibility."};
}
export type ValidationBrief=ReturnType<typeof buildValidationBrief>;
export function renderValidationBrief(b:ValidationBrief,format:"json"|"markdown"){
 if(b.data_class!=="synthetic"||b.scientific_claim_allowed!==false||b.graphPublicationAllowed!==false)throw Error("Synthetic-only export required");
 const trials=b.trials.map(t=>({trial_id:t.trial_id,condition:t.condition,phase:t.phase,intervention:t.intervention,biomarkers:t.biomarkers,endpoints:t.endpoints,status:t.status,...guard}));
 const expected=buildValidationBrief(b.observations,{schemaVersion:SYNTHETIC_VALIDATION_VERSION,condition:b.patient.condition,...guard,trials,evidence:b.evidence,hypotheses:b.hypotheses},b.reviewRehearsal);
 if(canonicalGraphContext(expected)!==canonicalGraphContext(b))throw Error("Altered validation brief");
 if(format==="json")return JSON.stringify(b,null,2)+"\n";
 const inert=(s:string)=>s.replace(/[\\\x60<>\[\]*_#|]/g,ch=>"\\"+ch).replace(/[\r\n]/g," ");
 return ["# Human Super Intelligence — synthetic validation brief","",b.disclaimer,"",inert(b.patient.patient_id)+" · "+inert(b.patient.condition),"",b.answer,"","## Lab observations (supplied flags, not clinical interpretation)","",...b.observations.lab_results.map(l=>"- Visit "+l.visit+" ("+l.date+"): "+inert(l.test)+" "+l.value+" "+inert(l.unit)+"; supplied flag "+l.flag),"","## Other recorded context","",...(["medications","lifestyle","wearables","immune_profiles","microbiome"] as const).flatMap(t=>["### "+t,...b.observations[t].map(r=>"- "+inert(JSON.stringify(r)))]),"","## Condition-level fixture evidence","",...b.evidence.map(e=>"- "+e.evidence_id+": "+inert(e.claim)+"; synthetic_demo; never scientific support"),"","## Candidate fixtures — AI draft, pending","",...b.hypotheses.map(h=>"- "+h.hypothesis_id+": "+inert(h.hypothesis)),"","## Trial topic overlap — eligibility unknown","",...b.trials.map(t=>"- "+t.trial_id+": "+inert(t.intervention)+"; "+t.status+"; missing eligibility criteria; enrolment disallowed"),"","## UI review rehearsal (not trusted authorization)","",...b.reviewRehearsal.map(r=>"- "+r.sequence+": "+r.outcome+" · "+inert(r.rationale)),"","## Missing data and limits","",...b.missingData.map(s=>"- "+s),"","No source record was promoted, no model was called, and no real patient integration is enabled.",""].join("\n");
}
