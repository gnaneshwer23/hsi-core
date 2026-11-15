/**
 * The governed bridge UP. Nothing leaves the clinical plane except through release(). The gate refuses row-level or identifying
 * payloads, refuses anything that is not synthetic until the ADR enables real data, applies small-cell suppression with
 * withheld partition totals (so a suppressed cell cannot be recovered by subtraction), requires a different, authorised human to
 * approve, and writes every outcome, including refusals, to the append-only audit chain.
 */
import {rejectPhiPayload} from "../cdsPhiBoundary";
import {appendAudit,sha256,type AuditLog} from "./auditChain";
import type {CohortAggregate} from "./phenotype";

export const SMALL_CELL_THRESHOLD=10;
export type ReleaseRequest={definitionId:string;requestedBy:string;purpose:string;dataClass:"synthetic"|"real"};
export type Approval={approverId:string;role:string;decision:"approve"|"reject";at:string};
export type RefusalReason="invalid_request"|"real_data_not_enabled"|"row_level_payload"|"phi_marker"|"approval_required"|"approval_rejected"|"same_person"|"role_not_authorised";
export const RELEASE_ROLES=["release_reviewer"] as const;

const KEYS=/^(patient_?ids?|ids?|matched_?ids?|rows?|records?|nhs_?number|mrn|name|dob|date_?of_?birth|address|postcode|email|phone)$/i;
const IDLIKE=/SYN-[A-Z]-\d+|\b\d{10}\b|[\w.+-]+@[\w-]+\.[\w.]+/;
/** Deep scan for keys or values that identify a person or carry a record. */
export function findRowLevel(v:unknown,path="$"):string|null{
 if(typeof v==="string")return IDLIKE.test(v)?path:null;
 if(Array.isArray(v)){for(const [i,x] of v.entries()){const r=findRowLevel(x,`${path}[${i}]`);if(r)return r}return null}
 if(v&&typeof v==="object"){for(const [k,x] of Object.entries(v)){if(KEYS.test(k)||IDLIKE.test(k))return `${path}.${k}`;const r=findRowLevel(x,`${path}.${k}`);if(r)return r}}
 return null;
}
const small=(n:number,k:number)=>n>0&&n<k;
/**
 * Suppress a partition whose total is disclosed elsewhere. Cells with 0 < n < k are suppressed. Because the total is known, a
 * single suppressed cell would be recovered by subtraction, so the largest remaining non-zero cells are also suppressed until
 * the hidden values together sum to at least k (complementary suppression), choosing the largest remaining cells first. Zero cells are released.
 */
export function suppressPartition(cells:Record<string,number>,k=SMALL_CELL_THRESHOLD):{cells:Record<string,number|null>;suppressed:number;complementary:number}{
 const hidden=new Set(Object.entries(cells).filter(([,n])=>small(n,k)).map(([key])=>key)),primary=hidden.size;
 if(primary>0){
  const sum=()=>[...hidden].reduce((t,key)=>t+cells[key]!,0);
  // The largest remaining cell is hidden, not the smallest: it protects the small cell just as well (the attacker still cannot split the hidden sum) and keeps the small, informative counts visible.
  const rest=Object.entries(cells).filter(([key,n])=>!hidden.has(key)&&n>0).sort((x,y)=>y[1]-x[1]);
  while(sum()<k&&rest.length>0)hidden.add(rest.shift()![0]);
 }
 const out:Record<string,number|null>={};for(const [key,n] of Object.entries(cells))out[key]=hidden.has(key)?null:n;
 return {cells:out,suppressed:hidden.size,complementary:hidden.size-primary};
}
export type ReleasedAggregate={
 schema:"hsi-released-cohort-aggregate-1";definitionId:string;dataClass:"synthetic";smallCellThreshold:number;
 counts:{evaluated:number|null;matched:number|null;excluded:number|null;indeterminate:number|null};
 attrition:{kind:"include"|"exclude";label:string;counts:{met:number|null;notMet:number|null;unknown:number|null}}[];
 matchedBySex:Record<string,number|null>;matchedByCondition:Record<string,number|null>;
 labSummary:{test:string;n:number|null;median:number|null;p25:number|null;p75:number|null}[];
 suppression:{cellsSuppressed:number;complementary:number;totalsWithheld:string[]};
};
const nullAll=(r:Record<string,number>)=>Object.fromEntries(Object.keys(r).map(x=>[x,null]));
export function applySuppression(a:CohortAggregate,k=SMALL_CELL_THRESHOLD):ReleasedAggregate{
 // The evaluated denominator is derivable from any complete count triplet, so it is treated as disclosed. If it is itself below k, nothing else is released.
 if(a.counts.evaluated<k)return {schema:"hsi-released-cohort-aggregate-1",definitionId:a.definitionId,dataClass:"synthetic",smallCellThreshold:k,
  counts:{evaluated:null,matched:null,excluded:null,indeterminate:null},attrition:a.attrition.map(r=>({kind:r.kind,label:r.label,counts:{met:null,notMet:null,unknown:null}})),
  matchedBySex:nullAll(a.matchedBySex),matchedByCondition:nullAll(a.matchedByCondition),labSummary:a.labSummary.map(l=>({test:l.test,n:null,median:null,p25:null,p75:null})),
  suppression:{cellsSuppressed:0,complementary:0,totalsWithheld:["everything: fewer than "+k+" evaluated"]}};
 let cells=0,comp=0;const withheld:string[]=[];
 const top=suppressPartition({matched:a.counts.matched,excluded:a.counts.excluded,indeterminate:a.counts.indeterminate},k);cells+=top.suppressed;comp+=top.complementary;
 const attrition=a.attrition.map(r=>{
  const p=suppressPartition({met:r.counts.met,notMet:r.counts.notMet,unknown:r.counts.unknown},k);cells+=p.suppressed;comp+=p.complementary;
  return {kind:r.kind,label:r.label,counts:{met:p.cells.met!,notMet:p.cells.notMet!,unknown:p.cells.unknown!}};
 });
 // Strata sum to `matched`. If matched is itself hidden or below k, every stratum is withheld; otherwise each partition is suppressed against the disclosed total.
 const matchedHidden=top.cells.matched===null||a.counts.matched<k;
 const sex=matchedHidden?{cells:nullAll(a.matchedBySex)}:suppressPartition(a.matchedBySex,k),cond=matchedHidden?{cells:nullAll(a.matchedByCondition)}:suppressPartition(a.matchedByCondition,k);
 if(!matchedHidden){cells+=(sex as ReturnType<typeof suppressPartition>).suppressed+(cond as ReturnType<typeof suppressPartition>).suppressed;comp+=(sex as ReturnType<typeof suppressPartition>).complementary+(cond as ReturnType<typeof suppressPartition>).complementary}
 else withheld.push("strata");
 const labSummary=a.labSummary.map(l=>l.n<k||matchedHidden?{test:l.test,n:null,median:null,p25:null,p75:null}:l);
 return {schema:"hsi-released-cohort-aggregate-1",definitionId:a.definitionId,dataClass:"synthetic",smallCellThreshold:k,
  counts:{evaluated:a.counts.evaluated,matched:top.cells.matched!,excluded:top.cells.excluded!,indeterminate:top.cells.indeterminate!},
  attrition,matchedBySex:sex.cells,matchedByCondition:cond.cells,labSummary,suppression:{cellsSuppressed:cells,complementary:comp,totalsWithheld:withheld}};
}
export type ReleasedFinding={
 schema:"hsi-released-finding-1";definitionId:string;graphVersion:string;dataClass:"synthetic";aggregate:ReleasedAggregate;
 releasedAt:string;approverRole:string;auditSeq:number;aggregateDigest:string;
 flags:{containsPhi:false;rowLevel:false;clinicalAdvice:false;scientificApproval:false;syntheticData:true};
};
export type ReleaseResult={ok:true;finding:ReleasedFinding;audit:AuditLog}|{ok:false;reason:RefusalReason;audit:AuditLog};

export function release(input:{request:ReleaseRequest;graphVersion:string;aggregate:CohortAggregate;approval:Approval|null;audit:AuditLog;now:string;k?:number}):ReleaseResult{
 const {request:r,aggregate,approval,now}=input,k=input.k??SMALL_CELL_THRESHOLD;let audit=input.audit;
 const refuse=(reason:RefusalReason,detail:string):ReleaseResult=>({ok:false,reason,audit:appendAudit(audit,{at:now,actor:String(r?.requestedBy??"unknown"),action:"release_refused",subject:String(r?.definitionId??"unknown"),detail:reason+": "+detail})});
 if(!r||typeof r.definitionId!=="string"||typeof r.requestedBy!=="string"||!r.requestedBy.trim()||typeof r.purpose!=="string"||r.purpose.trim().length<5||r.purpose.length>300||r.definitionId!==aggregate.definitionId)return refuse("invalid_request","missing or mismatched request fields");
 if(r.dataClass!=="synthetic"||aggregate.dataClass!=="synthetic")return refuse("real_data_not_enabled","only synthetic data can be released until the clinical-plane ADR enables real data");
 const rowPath=findRowLevel(aggregate);if(rowPath)return refuse("row_level_payload","identifying key or value at "+rowPath);
 const phi=rejectPhiPayload({textBlobs:[JSON.stringify(aggregate),r.purpose]});if(!phi.ok)return refuse("phi_marker",phi.detail);
 if(!approval)return refuse("approval_required","a release reviewer must approve");
 if(approval.decision!=="approve")return refuse("approval_rejected","reviewer declined");
 if(approval.approverId===r.requestedBy)return refuse("same_person","requester cannot approve their own release");
 if(!(RELEASE_ROLES as readonly string[]).includes(approval.role))return refuse("role_not_authorised","role "+approval.role);
 const released=applySuppression(aggregate,k),digest=sha256(released);
 audit=appendAudit(audit,{at:now,actor:approval.approverId,action:"release_approved",subject:r.definitionId,detail:`requested by ${r.requestedBy}; digest ${digest.slice(0,16)}; ${released.suppression.cellsSuppressed} cells suppressed (${released.suppression.complementary} complementary)`});
 return {ok:true,audit,finding:{schema:"hsi-released-finding-1",definitionId:r.definitionId,graphVersion:input.graphVersion,dataClass:"synthetic",aggregate:released,releasedAt:now,approverRole:approval.role,auditSeq:audit.entries.at(-1)!.seq,aggregateDigest:digest,
  flags:{containsPhi:false,rowLevel:false,clinicalAdvice:false,scientificApproval:false,syntheticData:true}}};
}
