import {canonicalEvidenceJson} from '../evidence/researchEvidenceCorpus';
export const SCENARIO_GENERATOR_VERSION='hsi-longitudinal-generator-1' as const;
export const COHORTS=['metabolic_inflammation','gut_brain','autoimmune_flare','treatment_response','healthy_control'] as const;
export type Cohort=typeof COHORTS[number];
const guard={data_class:'synthetic' as const,scientific_claim_allowed:false as const};
export type ScenarioEvent=typeof guard&{id:string;patientId:string;timestamp:string;visit:number;type:'symptom'|'encounter'|'lab_result'|'diagnosis_context'|'medication'|'wearable'|'microbiome'|'immune_profile'|'clinical_note'|'genetic_test_marker'|'lifestyle'|'vital_signs'|'trial_context';values:Record<string,string|number|boolean>;provenance:'generated_without_patient_data'};
export type ScenarioPatient=typeof guard&{id:string;cohort:Cohort;age:number;sex:'female'|'male'|'intersex';bmi:number;ethnicityContext:string;socioeconomicContext:string;primaryCondition:string;seed:number;events:ScenarioEvent[]};
export type ScenarioPack=typeof guard&{retention:'local_rehearsal_only';consentStatus:'not_applicable_synthetic';sharingLevel:'internal_validation';schemaVersion:'hsi-longitudinal-scenarios-1';generatorVersion:typeof SCENARIO_GENERATOR_VERSION;seed:number;perCohort:number;months:24;patients:ScenarioPatient[];containsPhi:false;clinicalAdvice:false;graphPromotable:false;sourcePatientDataUsed:false;modelCalibrated:false};
function config(seed:number,perCohort:number){if(!Number.isSafeInteger(seed)||seed<1||seed>4294967295||!Number.isSafeInteger(perCohort)||perCohort<1||perCohort>250)throw Error('Seed must be 1–4294967295 and size 1–250 per cohort')}
function random(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const round=(v:number,n=2)=>Number(v.toFixed(n));
export function generateScenarioPack(seed=482913,perCohort=2):ScenarioPack{
 config(seed,perCohort);const patients:ScenarioPatient[]=[];const rng=random(seed);
 const between=(a:number,b:number)=>a+(b-a)*rng();
 for(const cohort of COHORTS)for(let i=0;i<perCohort;i++){
  const id='SYN-CAP-'+(COHORTS.indexOf(cohort)+1)+'-'+String(i+1).padStart(4,'0'),baseline=Date.UTC(2024,0,1),responder=rng()>.35,missingWearable=rng()<.2,missingMicrobiome=rng()<.3,missingImmune=rng()<.25;
  const patient:ScenarioPatient={...guard,id,cohort,age:18+Math.floor(rng()*63),sex:rng()<.02?'intersex':rng()<.5?'female':'male',bmi:round(between(cohort==='metabolic_inflammation'?28:19,cohort==='metabolic_inflammation'?39:cohort==='healthy_control'?24.5:32),1),ethnicityContext:['fictional_group_a','fictional_group_b','fictional_group_c','not_reported'][Math.floor(rng()*4)]!,socioeconomicContext:['fictional_low_resource','fictional_mixed_resource','fictional_high_resource','not_reported'][Math.floor(rng()*4)]!,primaryCondition:{metabolic_inflammation:'type_2_diabetes_context',gut_brain:'ibs_like_research_context',autoimmune_flare:'lupus_like_research_context',treatment_response:'ibd_like_research_context',healthy_control:'no_active_condition_in_fixture'}[cohort],seed,events:[]};
  const add=(type:ScenarioEvent['type'],visit:number,time:number,values:ScenarioEvent['values'])=>patient.events.push({...guard,id:id+'-E'+String(patient.events.length+1).padStart(4,'0'),patientId:id,timestamp:new Date(time).toISOString(),visit,type,values,provenance:'generated_without_patient_data'});
  const baseSleep=cohort==='metabolic_inflammation'?between(5,6.3):between(6.7,8),baseHrv=cohort==='healthy_control'?between(45,65):between(28,60),baseSteps=between(3500,10500),baseDiversity=cohort==='gut_brain'||cohort==='metabolic_inflammation'?between(1.9,2.5):between(2.9,3.6),baseButyrate=cohort==='metabolic_inflammation'?between(4,8):between(11,17);
  const baseHb=cohort==='metabolic_inflammation'?between(6.2,7.5):between(4.7,5.4),baseCrp=cohort==='healthy_control'?between(.3,1.3):between(3,8);
  add('symptom',0,baseline-7*86400000,{description:cohort==='healthy_control'?'No active symptoms in this constructed control':{metabolic_inflammation:'Poor sleep and fatigue',gut_brain:'Abdominal discomfort and fatigue',autoimmune_flare:'Fatigue and joint discomfort',treatment_response:'Variable bowel symptom burden'}[cohort]!,scenarioOnly:true});
  for(let visit=0;visit<=8;visit++){
   const time=Date.UTC(2024,visit*3,1,9),t=visit/8,flare=cohort==='autoimmune_flare'?Math.max(0,1-Math.abs(visit-5)/3):0;
   const treatment=cohort==='treatment_response'?(visit<4?-visit*.7:(visit-4)*(responder?.15:1.1)-2):0;
   const noise=between(-.3,.3),hba1c=cohort==='metabolic_inflammation'?baseHb+t*(responder?between(-.5,.8):between(.5,1.6))+noise*.2:baseHb+noise*.15;
   const crp=Math.max(.2,baseCrp+(cohort==='metabolic_inflammation'?t*between(-1,5):0)+flare*between(3,8)+treatment+noise),glucose=Math.max(3.8,(cohort==='metabolic_inflammation'?6.2+t*(responder?between(-.5,.5):between(.5,2)):between(4.1,5.3))),insulin=cohort==='metabolic_inflammation'?between(12,24):cohort==='healthy_control'?between(4,9):between(4,12);
   add('encounter',visit,time,{purpose:'Constructed quarterly research visit',month:visit*3});
   add('lifestyle',visit,time+1800000,{diet_pattern:cohort==='metabolic_inflammation'?'low_fibre_fixture':'mixed_diet_fixture',fibre_g_day:round(cohort==='metabolic_inflammation'?between(10,18):between(20,38)),stress_scale_1_to_10:Math.round(between(1,9)),exercise_minutes_week:Math.round(between(20,180))});
   add('vital_signs',visit,time+1900000,{bmi:patient.bmi,heart_rate_bpm:Math.round(between(55,95)),systolic_mmhg:Math.round(between(105,140)),measurementScope:'uncalibrated_fixture'});
   const lab=(test:string,value:number,unit:string,low:number,high:number)=>{value=round(value);return add('lab_result',visit,time+3600000,{test,value:round(value),unit,reference_low:low,reference_high:high,flag:value<low?'below_fixture_range':value>high?'above_fixture_range':'within_fixture_range',referenceScope:'illustrative_fixture_only',fasting:test==='Fasting glucose'||test==='Insulin'||test==='HOMA-IR',...(test==='HOMA-IR'?{derivation:'Fasting glucose (mmol/L) × fasting insulin (mIU/L) / 22.5'}:{})})};
   lab('HbA1c',hba1c,'%',4,5.6);lab('Fasting glucose',glucose,'mmol/L',3.9,5.5);lab('Insulin',insulin,'mIU/L',2,20);lab('HOMA-IR',glucose*insulin/22.5,'1',0,2.5);lab('hs-CRP',crp,'mg/L',0,3);lab('IL-6',Math.max(.5,crp*.6+between(-.4,1.2)),'pg/mL',0,7);lab('TNF-alpha',between(2,cohort==='healthy_control'?6:9)+flare*3,'pg/mL',0,8);
   if(cohort==='autoimmune_flare'){lab('Anti-dsDNA',between(15,30)+flare*60,'IU/mL',0,30);lab('Complement C3',between(.9,1.3)-flare*.45,'g/L',.9,1.8);}
   if(visit===0&&cohort!=='healthy_control'){
    add('diagnosis_context',visit,time+86400000,{label:patient.primaryCondition,meaning:'Preset scenario condition, not a generated diagnosis'});
    add('medication',visit,time+2*86400000,{exposure:cohort==='metabolic_inflammation'?'metformin':cohort==='treatment_response'?'anti-TNF exposure context':'background therapy fixture',purpose:'Synthetic recorded exposure; not a dosing recommendation',responseParameter:responder?'variable_response_fixture':'nonresponse_fixture'});
   }
   if(!missingWearable&&rng()>.15)add('wearable',visit,time+2*3600000,{sleep_hours:round(baseSleep+between(-.4,.4)),hrv_ms:round(baseHrv+between(-4,4)),steps:Math.round(baseSteps+between(-900,900)),glucose_cv_percent:round(cohort==='metabolic_inflammation'?between(20,38):between(10,20)),summary_window_days:7});
   if(!missingMicrobiome&&rng()>.15)add('microbiome',visit,time+3*3600000,{shannon_index:round(baseDiversity+between(-.18,.18)),acetate:round(between(25,65)),propionate:round(between(8,25)),butyrate:round(baseButyrate+between(-1,1)),concentration_unit:'mmol/kg',measurementScope:'uncalibrated_stool_fixture'});
   if(!missingImmune&&rng()>.15){const cd4=Math.round(between(450,1000));add('immune_profile',visit,time+4*3600000,{cd4_cells_per_uL:cd4,cd8_cells_per_uL:Math.round(between(200,600)),nk_cells_per_uL:Math.round(between(80,350)),monocytes_per_uL:Math.round(between(200,700)),th17_cells_per_uL:Math.round(cd4*between(.01,.05)),treg_cells_per_uL:Math.round(cd4*between(.03,.09))})}
   add('clinical_note',visit,time+5*3600000,{text:'Synthetic visit '+visit+'. Values were sampled from preset distributions. No clinical interpretation or real individual is represented.'});
  }
  add('trial_context',0,baseline+7*3600000,{status:'not_assessed',eligibility:'never_confirmed',registryIntegration:'none_in_this_generator'});
  add('genetic_test_marker',0,baseline+6*3600000,{marker:'TEST_VARIANT_A',allele_count:Math.floor(rng()*3),meaning:'Artificial software marker; not a pathogenic or licensed genomic annotation'});
  patient.events.sort((a,b)=>a.timestamp.localeCompare(b.timestamp)||a.id.localeCompare(b.id));patients.push(patient);
 }
 return {...guard,retention:'local_rehearsal_only',consentStatus:'not_applicable_synthetic',sharingLevel:'internal_validation',schemaVersion:'hsi-longitudinal-scenarios-1',generatorVersion:SCENARIO_GENERATOR_VERSION,seed,perCohort,months:24,patients,containsPhi:false,clinicalAdvice:false,graphPromotable:false,sourcePatientDataUsed:false,modelCalibrated:false};
}
export function verifyScenarioPack(value:unknown):ScenarioPack{
 if(!value||typeof value!=='object')throw Error('Invalid generated scenario pack');const x=value as ScenarioPack;
 config(x.seed,x.perCohort);const expected=generateScenarioPack(x.seed,x.perCohort);
 if(canonicalEvidenceJson(value)!==canonicalEvidenceJson(expected))throw Error('Scenario pack differs from its declared deterministic generator');return x;
}
export function scenarioQuality(pack:ScenarioPack){
 verifyScenarioPack(pack);const events=pack.patients.flatMap(p=>p.events),keys=pack.patients.map(p=>[Math.floor(p.age/10)*10,p.sex,Math.floor(p.bmi/5)*5,p.cohort].join('|')),frequencies=new Map<string,number>();for(const k of keys)frequencies.set(k,(frequencies.get(k)??0)+1);
 return {patients:pack.patients.length,events:events.length,visits:events.filter(e=>e.type==='encounter').length,cohortCounts:Object.fromEntries(COHORTS.map(c=>[c,pack.patients.filter(p=>p.cohort===c).length])),missingWearableProfiles:pack.patients.filter(p=>!p.events.some(e=>e.type==='wearable')).length,missingMicrobiomeProfiles:pack.patients.filter(p=>!p.events.some(e=>e.type==='microbiome')).length,missingImmuneProfiles:pack.patients.filter(p=>!p.events.some(e=>e.type==='immune_profile')).length,uniqueCoarseDemographicTuples:keys.filter(k=>frequencies.get(k)===1).length,privacyAttackTesting:'not_performed_no_real_training_population_used',clinicalCalibration:false,scientificValidityClaimed:false};
}
/** Traceable fixture summary and research prompts, never a scientific inference from generated observations. */
export function buildScenarioResearchBrief(pack:ScenarioPack,patientId:string){
 verifyScenarioPack(pack);const patient=pack.patients.find(p=>p.id===patientId);if(!patient)throw Error('Unknown generated profile');
 const latest=(test:string)=>patient.events.filter(e=>e.type==='lab_result'&&e.values.test===test).at(-1);
 const labEvents=patient.events.filter(e=>e.type==='lab_result'&&e.values.test==='HbA1c'),first=labEvents[0]!,last=latest('HbA1c')!,crp=latest('hs-CRP')!;
 const prompts:Record<Cohort,string[]>={
  metabolic_inflammation:['How would a longitudinal study separate sleep, diet, exposure and inflammatory associations?','Which external studies and controls could challenge a gut–immune–metabolic explanation?'],
  gut_brain:['Which repeated symptom, diet and sleep measurements would distinguish competing gut–brain hypotheses?','What human evidence would be needed before interpreting microbial diversity as mechanistic?'],
  autoimmune_flare:['How should study design separate immune-marker variation from disease activity and alternative explanations?','Which assay, timing and disease-stage differences could explain discordant measurements?'],
  treatment_response:['Could exposure/adherence, anti-drug antibodies, alternative pathways or outcome definitions explain different research trajectories?','What evidence and negative controls would distinguish these alternatives without selecting a treatment?'],
  healthy_control:['What missing data or methodological differences could change a normal-range fixture interpretation?']
 };
 return {...guard,schemaVersion:'hsi-synthetic-research-brief-1',generatorVersion:pack.generatorVersion,seed:pack.seed,patientId,cohort:patient.cohort,method:'deterministic_fixture_summary_no_llm',observations:[
  {...guard,eventId:first.id,measurement:'baseline_HbA1c',value:first.values.value,unit:first.values.unit,timestamp:first.timestamp},
  {...guard,eventId:last.id,measurement:'latest_HbA1c',value:last.values.value,unit:last.values.unit,timestamp:last.timestamp},
  {...guard,eventId:crp.id,measurement:'latest_hsCRP',value:crp.values.value,unit:crp.values.unit,timestamp:crp.timestamp}
 ],candidateResearchQuestions:prompts[patient.cohort],evidence:[],evidenceStatus:'synthetic_only_no_scientific_support',missingData:['No independent publication evidence is mapped to this generated profile',...(['wearable','microbiome','immune_profile'] as const).filter(t=>!patient.events.some(e=>e.type===t)).map(t=>'No '+t+' stream in this fixture')],evaluationRequirements:['Use independently reviewed sources, matched context and explicit negative controls','Specify a predicted observation and falsification criterion before testing a hypothesis','Do not infer causality, diagnosis, treatment response or trial eligibility from this generated trajectory'],reviewStatus:'not_submitted',scientificApprovalGranted:false,clinicalAdvice:false,graphPromotable:false,trialEligibility:'never_confirmed'};
}
