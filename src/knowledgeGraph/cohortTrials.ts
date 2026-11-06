/** Public study topic/age overlap against supplied validation cohorts. Never assesses full eligibility. */
import {rejectPhiPayload} from '../cdsPhiBoundary';
import type {ValidationProfile} from './domainGraph';
export type CohortQuery={condition:string;minAge:number;maxAge:number;minHba1c:number|null;medication:string};
function validateProfiles(profiles:ValidationProfile[]){
 const keys=['caseId','dataClass','condition','age','sex','bmi','lastHba1c','medications'].sort().join('|');if(!Array.isArray(profiles)||profiles.length>500||new Set(profiles.map(p=>p.caseId)).size!==profiles.length||profiles.some(p=>!p||Object.keys(p).sort().join('|')!==keys||p.dataClass!=='synthetic'||!/^SYN-P-\d{6}$/.test(p.caseId)||!Number.isInteger(p.age)||p.age<0||p.age>120||typeof p.condition!=='string'||p.condition.length>100||!Array.isArray(p.medications)||p.medications.some(m=>typeof m!=='string')||!(p.lastHba1c===null||Number.isFinite(p.lastHba1c)&&p.lastHba1c>=0&&p.lastHba1c<=30)))throw Error('Only bounded supplied validation profiles are accepted');
}
export function selectValidationCohort(profiles:ValidationProfile[],query:CohortQuery){
 validateProfiles(profiles);
 if(!Number.isInteger(query.minAge)||!Number.isInteger(query.maxAge)||query.minAge<0||query.maxAge>120||query.minAge>query.maxAge||query.minHba1c!==null&&(!Number.isFinite(query.minHba1c)||query.minHba1c<0||query.minHba1c>30))throw Error('Invalid cohort bounds');
 const candidates=profiles.filter(p=>(!query.condition||p.condition===query.condition)&&p.age>=query.minAge&&p.age<=query.maxAge&&(!query.medication||p.medications.includes(query.medication)));
 const missingHba1c=query.minHba1c!==null?candidates.filter(p=>p.lastHba1c===null).length:0;
 const members=candidates.filter(p=>query.minHba1c===null||p.lastHba1c!==null&&p.lastHba1c>=query.minHba1c);
 return {members,summary:{dataClass:'synthetic' as const,scientificClaimAllowed:false,criteria:query,count:members.length,missingHba1c,conditionCounts:Object.fromEntries([...new Set(members.map(p=>p.condition))].map(c=>[c,members.filter(p=>p.condition===c).length])),ageRange:members.length?[Math.min(...members.map(p=>p.age)),Math.max(...members.map(p=>p.age))]:null,denominator:profiles.length}};
}
export type PublicStudy={nctId:string;title:string;conditions:string[];status:string;lastUpdateDate:string|null;minimumAge:number|null;maximumAge:number|null;eligibilityText:string|null;url:string;sourceStatus:'operator_uploaded_unverified';liveStatusVerified:false};
const str=(v:unknown,max=20000):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
function age(value:unknown){if(value===undefined||value===null||value==='N/A')return null;if(!str(value,40))throw Error('Invalid registry age');const m=/^(\d+(?:\.\d+)?) (Years|Months|Weeks|Days)$/.exec(value);if(!m)throw Error('Unsupported registry age unit');const years=Number(m[1])/(m[2]==='Years'?1:m[2]==='Months'?12:m[2]==='Weeks'?52.1775:365.25);if(years<0||years>150)throw Error('Invalid registry age');return years}
/** Parses downloaded ClinicalTrials.gov API v2 JSON without sending it to a service or retaining raw records. */
export function importPublicStudies(value:unknown):PublicStudy[]{
 const raw=JSON.stringify(value);if(raw.length>1_000_000||!rejectPhiPayload({textBlobs:[raw]}).ok||/"(?:patient_?(?:ids?|name|dob|date_?of_?birth|records?|email|phone|address)|subject_?ids?|medical_?record|nhs_?number|session_?token|api_?key|password|date_?of_?birth|dob)"\s*:/i.test(raw))throw Error('Only bounded public registry metadata is accepted; no private records or credentials');
 const root=value as any;if(root?.containsPhi===true||root?.mayUseLivePhi===true)throw Error('Private records are not accepted');if(!root||typeof root!=='object'||Array.isArray(root))throw Error('Expected ClinicalTrials.gov API v2 JSON');
 const rows=Array.isArray(root.studies)?root.studies:root.protocolSection?[root]:null;if(!rows||rows.length>50)throw Error('Import at most 50 public registry records');
 const seen=new Set<string>();return rows.map((row:any)=>{
  const p=row?.protocolSection,i=p?.identificationModule,e=p?.eligibilityModule,s=p?.statusModule,c=p?.conditionsModule;
  if(!i||!/^NCT\d{8}$/.test(i.nctId)||seen.has(i.nctId)||!str(i.briefTitle,1000)||!Array.isArray(c?.conditions)||!c.conditions.length||c.conditions.length>25||!c.conditions.every((x:unknown)=>str(x,200)))throw Error('Invalid registry identity or condition metadata');seen.add(i.nctId);
  if(s?.overallStatus!==undefined&&(!str(s.overallStatus,80)||!['RECRUITING','NOT_YET_RECRUITING','ACTIVE_NOT_RECRUITING','ENROLLING_BY_INVITATION','COMPLETED','TERMINATED','WITHDRAWN','SUSPENDED','UNKNOWN','AVAILABLE','NO_LONGER_AVAILABLE','TEMPORARILY_NOT_AVAILABLE','APPROVED_FOR_MARKETING','WITHHELD'].includes(s.overallStatus)))throw Error('Unknown registry status');
  const update=s?.lastUpdatePostDateStruct?.date??null;if(update!==null&&(!/^\d{4}-\d\d-\d\d$/.test(update)||!Number.isFinite(Date.parse(update))||new Date(update).toISOString().slice(0,10)!==update))throw Error('Invalid registry update date');
  if(e?.eligibilityCriteria!==undefined&&!str(e.eligibilityCriteria,30000))throw Error('Invalid registry criteria');const minimumAge=age(e?.minimumAge),maximumAge=age(e?.maximumAge);if(minimumAge!==null&&maximumAge!==null&&minimumAge>maximumAge)throw Error('Inverted registry age range');
  return {nctId:i.nctId,title:i.briefTitle,conditions:[...new Set<string>(c.conditions)],status:s?.overallStatus??'UNKNOWN',lastUpdateDate:update,minimumAge,maximumAge,eligibilityText:e?.eligibilityCriteria??null,url:'https://clinicaltrials.gov/study/'+i.nctId,sourceStatus:'operator_uploaded_unverified',liveStatusVerified:false};
 });
}
const synonyms:Record<string,string>={'diabetes mellitus, type 1':'type 1 diabetes','diabetes mellitus, type 2':'type 2 diabetes','type 1 diabetes mellitus':'type 1 diabetes','type 2 diabetes mellitus':'type 2 diabetes','t1d':'type 1 diabetes','t2d':'type 2 diabetes',"crohn's disease":'crohn’s disease'};
const conditionKey=(s:string)=>{const n=s.normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');return synonyms[n]??n};
export function assessCohortStudyOverlap(profiles:ValidationProfile[],study:PublicStudy){
 validateProfiles(profiles);
 const conditionMatched=profiles.filter(p=>study.conditions.some(c=>conditionKey(c)===conditionKey(p.condition)));
 const ageAssessable=study.minimumAge!==null||study.maximumAge!==null;
 const ageCompatible=conditionMatched.filter(p=>(study.minimumAge===null||p.age>=study.minimumAge)&&(study.maximumAge===null||p.age<=study.maximumAge));
 return {nctId:study.nctId,cohortSize:profiles.length,conditionOverlapCount:conditionMatched.length,ageAssessable,ageCompatibleCount:ageAssessable?ageCompatible.length:null,state:!profiles.length?'empty_cohort':!conditionMatched.length?'no_exact_condition_overlap':!ageAssessable?'age_information_missing':ageCompatible.length?'potential_topic_and_age_overlap':'age_conflict',unassessed:['Full inclusion and exclusion criteria','Sex, healthy-volunteer and disease-stage criteria','Medication, prior therapy and washout','Autoantibody, C-peptide and laboratory thresholds','Geography, recruitment availability and investigator decision'],criteriaTextAvailable:study.eligibilityText!==null,sourceStatus:study.sourceStatus,liveRegistryQueried:false,patientEligibilityAssessed:false,confirmedEligible:false,scientificClaimAllowed:false};
}
