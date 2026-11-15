/**
 * Hypothesis Ledger: one record per hypothesis a researcher decides to carry, whether proposed by a model in a run or written by
 * the researcher. It never validates anything. A hypothesis cannot enter testing without a stated falsifier; an outcome is the
 * researcher's own recorded observation against their own test, with a required note. Statuses and outcomes are user-owned and
 * live in the browser only today. Pure: no clock, no randomness, no storage.
 */
export type LedgerStatus="proposed"|"planning"|"testing"|"parked"|"retired";
export const LEDGER_STATUSES:readonly LedgerStatus[]=["proposed","planning","testing","parked","retired"];
export type LedgerOutcome="none"|"consistent"|"inconsistent"|"inconclusive";
export const LEDGER_OUTCOMES:readonly LedgerOutcome[]=["none","consistent","inconsistent","inconclusive"];
export type LedgerOrigin={kind:"researcher"}|{kind:"model_proposal";scenarioId:string;runHash:string;proposalId:string;proposedBy:string};
export type LedgerEvent={at:string;type:"created"|"status"|"outcome"|"edited"|"linked"|"observation"|"target";detail:string};
/** A candidate target the researcher chose to investigate for this hypothesis. Public association metadata at the time; not a recommendation, not validation. */
export type TargetPick={at:string;ensemblId:string;symbol:string;diseaseId:string;diseaseName:string;score:number;retrievedAt:string;reason:string};
/** A released aggregate from the synthetic clinical plane, attached to a hypothesis as an illustration. Never evidence, never an outcome. */
export type CohortObservation={at:string;definitionId:string;definitionTitle:string;graphVersion:string;aggregateDigest:string;evaluated:number|null;matched:number|null;suppressedCells:number;dataClass:"synthetic"};
export type LedgerEntry={
 id:string;statement:string;origin:LedgerOrigin;createdAt:string;
 rationale:string;prediction:string;experiment:string;falsifier:string;limits:string;
 citedClaimIds:string[];citedSourceIds:string[];linkedGapIds:string[];cohortDefinitionId:string|null;cohortObservations:CohortObservation[];targetShortlist:TargetPick[];
 status:LedgerStatus;outcome:LedgerOutcome;outcomeNote:string;history:LedgerEvent[];
 /** Always true. Nothing in this ledger validates a hypothesis. */
 unvalidated:true;
};
export const LIMITS={statement:400,field:600,note:400,entries:200,history:100,gaps:10,cited:20,observations:20,targets:10};
const clip=(s:unknown,n:number)=>typeof s==="string"?s.trim().slice(0,n):"";
export const entryId=(origin:LedgerOrigin,statement:string)=>"hyp:"+fnv(origin.kind==="model_proposal"?`${origin.scenarioId}|${origin.runHash}|${origin.proposalId}`:`r|${statement.trim().toLowerCase()}`);
function fnv(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")}

export type NewEntry={statement:string;origin:LedgerOrigin;rationale?:string;prediction?:string;experiment?:string;falsifier?:string;limits?:string;citedClaimIds?:string[];citedSourceIds?:string[];linkedGapIds?:string[];cohortDefinitionId?:string|null};
export function createEntry(input:NewEntry,at:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 const statement=clip(input.statement,LIMITS.statement);
 if(statement.length<10)return {ok:false,error:"State the hypothesis in at least 10 characters."};
 const f=(v:unknown)=>clip(v,LIMITS.field),ids=(v:unknown,n:number)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==="string"&&x.length>0&&x.length<=220))].slice(0,n):[];
 const entry:LedgerEntry={id:entryId(input.origin,statement),statement,origin:input.origin,createdAt:at,rationale:f(input.rationale),prediction:f(input.prediction),experiment:f(input.experiment),falsifier:f(input.falsifier),limits:f(input.limits),
  citedClaimIds:ids(input.citedClaimIds,LIMITS.cited),citedSourceIds:ids(input.citedSourceIds,LIMITS.cited),linkedGapIds:ids(input.linkedGapIds,LIMITS.gaps),cohortDefinitionId:typeof input.cohortDefinitionId==="string"&&input.cohortDefinitionId.length<=120?input.cohortDefinitionId:null,cohortObservations:[],targetShortlist:[],
  status:"proposed",outcome:"none",outcomeNote:"",history:[{at,type:"created",detail:input.origin.kind==="model_proposal"?"Added from a model proposal in a run":"Written by the researcher"}],unvalidated:true};
 return {ok:true,entry};
}
/** What a hypothesis still lacks before it can be tested. Empty means it states a prediction, an experiment and a falsifier. */
export const missingForTest=(e:Pick<LedgerEntry,"prediction"|"experiment"|"falsifier">):string[]=>[...(e.prediction?[]:["a prediction"]),...(e.experiment?[]:["an experiment"]),...(e.falsifier?[]:["a falsifier"])];

export type Ledger=Record<string,LedgerEntry>;
export function addEntry(l:Ledger,e:LedgerEntry):{ledger:Ledger;added:boolean;error?:string}{
 if(l[e.id])return {ledger:l,added:false};
 if(Object.keys(l).length>=LIMITS.entries)return {ledger:l,added:false,error:`The ledger holds at most ${LIMITS.entries} hypotheses.`};
 return {ledger:{...l,[e.id]:e},added:true};
}
const push=(e:LedgerEntry,ev:LedgerEvent):LedgerEntry=>({...e,history:[...e.history,ev].slice(-LIMITS.history)});
export function setStatus(e:LedgerEntry,status:LedgerStatus,at:string,note?:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 if(!LEDGER_STATUSES.includes(status))return {ok:false,error:"Unknown status."};
 if((status==="testing")&&missingForTest(e).length>0)return {ok:false,error:`Add ${missingForTest(e).join(", ")} before testing. A hypothesis needs a stated falsifier.`};
 const n=clip(note,LIMITS.note);
 return {ok:true,entry:push({...e,status},{at,type:"status",detail:`${e.status} to ${status}${n?`: ${n}`:""}`})};
}
export function recordOutcome(e:LedgerEntry,outcome:LedgerOutcome,note:string,at:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 if(!LEDGER_OUTCOMES.includes(outcome)||outcome==="none")return {ok:false,error:"Choose an outcome."};
 if(e.status!=="testing")return {ok:false,error:"Record an outcome only while the hypothesis is being tested."};
 const n=clip(note,LIMITS.note);if(n.length<10)return {ok:false,error:"Describe what you observed in at least 10 characters. This is your observation, not a validation."};
 return {ok:true,entry:push({...e,outcome,outcomeNote:n},{at,type:"outcome",detail:`${outcome}: ${n}`})};
}
export function edit(e:LedgerEntry,patch:Partial<Pick<LedgerEntry,"rationale"|"prediction"|"experiment"|"falsifier"|"limits"|"linkedGapIds"|"cohortDefinitionId">>,at:string):LedgerEntry{
 const f=(v:string|undefined,old:string)=>v===undefined?old:clip(v,LIMITS.field);
 const next={...e,rationale:f(patch.rationale,e.rationale),prediction:f(patch.prediction,e.prediction),experiment:f(patch.experiment,e.experiment),falsifier:f(patch.falsifier,e.falsifier),limits:f(patch.limits,e.limits),
  linkedGapIds:patch.linkedGapIds?[...new Set(patch.linkedGapIds.filter(x=>typeof x==="string"&&x.length<=220))].slice(0,LIMITS.gaps):e.linkedGapIds,
  cohortDefinitionId:patch.cohortDefinitionId===undefined?e.cohortDefinitionId:(typeof patch.cohortDefinitionId==="string"&&patch.cohortDefinitionId.length<=120?patch.cohortDefinitionId:null)};
 const linked=patch.linkedGapIds!==undefined||patch.cohortDefinitionId!==undefined;
 return push(next,{at,type:linked?"linked":"edited",detail:linked?"Links changed":"Details edited"});
}
export type NewObservation=Omit<CohortObservation,"at"|"dataClass"|"suppressedCells">&{suppressedCells?:number;dataClass:string};
const num=(v:unknown)=>v===null||(typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<1e7);
/**
 * Attach a released synthetic cohort aggregate to a hypothesis. Allowed only for synthetic data and only for the definition the
 * hypothesis is linked to. It adds an observation to the record; it never changes status, never sets an outcome, and is not evidence.
 */
export function addCohortObservation(e:LedgerEntry,o:NewObservation,at:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 if(o.dataClass!=="synthetic")return {ok:false,error:"Only synthetic cohort results can be attached while real data is not enabled."};
 if(!e.cohortDefinitionId||e.cohortDefinitionId!==o.definitionId)return {ok:false,error:"Link this hypothesis to the same cohort definition first."};
 if(!/^[a-f0-9]{64}$/.test(o.aggregateDigest)||!num(o.evaluated)||!num(o.matched)||!/^[a-f0-9]{8,64}$/.test(o.graphVersion))return {ok:false,error:"The released result is malformed."};
 if(e.cohortObservations.some(x=>x.aggregateDigest===o.aggregateDigest))return {ok:false,error:"This released result is already attached."};
 if(e.cohortObservations.length>=LIMITS.observations)return {ok:false,error:`At most ${LIMITS.observations} cohort observations per hypothesis.`};
 const obs:CohortObservation={at,definitionId:o.definitionId,definitionTitle:clip(o.definitionTitle,160),graphVersion:o.graphVersion,aggregateDigest:o.aggregateDigest,evaluated:o.evaluated,matched:o.matched,suppressedCells:Number.isInteger(o.suppressedCells)?Math.max(0,o.suppressedCells!):0,dataClass:"synthetic"};
 return {ok:true,entry:push({...e,cohortObservations:[...e.cohortObservations,obs]},{at,type:"observation",detail:`Synthetic cohort result attached (${o.matched===null?"matched count suppressed":o.matched+" matched"} of ${o.evaluated===null?"a suppressed total":o.evaluated}); digest ${o.aggregateDigest.slice(0,12)}. Illustrative, not evidence.`})};
}
export type NewTargetPick=Omit<TargetPick,"at">;
/** Shortlist a candidate target for a hypothesis. Requires the researcher's reason. Adds to the record only: no status or outcome change. */
export function addTargetPick(e:LedgerEntry,t:NewTargetPick,at:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 const reason=clip(t.reason,300);
 if(!/^ENSG\d{11}$/.test(t.ensemblId)||!/^(MONDO|EFO)_\d{7}$/.test(t.diseaseId)||typeof t.score!=="number"||!(t.score>=0&&t.score<=1)||typeof t.symbol!=="string"||t.symbol.length<1||t.symbol.length>64||typeof t.retrievedAt!=="string")return {ok:false,error:"The target record is malformed."};
 if(reason.length<10)return {ok:false,error:"Say why this target is worth investigating for this hypothesis (at least 10 characters)."};
 if(e.targetShortlist.some(x=>x.ensemblId===t.ensemblId&&x.diseaseId===t.diseaseId))return {ok:false,error:"This target is already shortlisted for the hypothesis."};
 if(e.targetShortlist.length>=LIMITS.targets)return {ok:false,error:`At most ${LIMITS.targets} candidate targets per hypothesis.`};
 const pick:TargetPick={at,ensemblId:t.ensemblId,symbol:clip(t.symbol,64),diseaseId:t.diseaseId,diseaseName:clip(t.diseaseName,120),score:t.score,retrievedAt:t.retrievedAt.slice(0,40),reason};
 return {ok:true,entry:push({...e,targetShortlist:[...e.targetShortlist,pick]},{at,type:"target",detail:`Shortlisted candidate target ${pick.symbol} for ${pick.diseaseName} (association score ${pick.score.toFixed(2)}, not a recommendation): ${reason}`})};
}
export function removeTargetPick(e:LedgerEntry,ensemblId:string,diseaseId:string,at:string):LedgerEntry{
 const had=e.targetShortlist.find(x=>x.ensemblId===ensemblId&&x.diseaseId===diseaseId);if(!had)return e;
 return push({...e,targetShortlist:e.targetShortlist.filter(x=>x!==had)},{at,type:"target",detail:`Removed candidate target ${had.symbol} from the shortlist`});
}
/** Maps one model proposal from a live run. The proposal's own text is kept; nothing is added. */
export function fromRunHypothesis(run:{scenarioId:string;briefHash:string;candidates:{id:string;sourceId:string}[]},h:{id:string;statement:string;rationale:string;prediction:string;experiment:string;falsifier:string;limits:string;citedClaimIds:string[];generatedBy:{verifier:string;model:string}},at:string,linkedGapIds:string[]=[]){
 const src=run.candidates.filter(c=>h.citedClaimIds.includes(c.id)).map(c=>c.sourceId);
 return createEntry({statement:h.statement,origin:{kind:"model_proposal",scenarioId:run.scenarioId,runHash:run.briefHash,proposalId:h.id,proposedBy:`${h.generatedBy.verifier} (${h.generatedBy.model})`.slice(0,120)},rationale:h.rationale,prediction:h.prediction,experiment:h.experiment,falsifier:h.falsifier,limits:h.limits,citedClaimIds:h.citedClaimIds,citedSourceIds:src,linkedGapIds},at);
}
export function parseLedger(raw:string|null):Ledger{
 if(!raw||raw.length>1_500_000)return {};
 try{
  const x=JSON.parse(raw);if(!x||typeof x!=="object"||Array.isArray(x))return {};
  const out:Ledger={};
  for(const v of Object.values(x as Record<string,any>).slice(0,LIMITS.entries)){
   if(!v||typeof v!=="object"||typeof v.createdAt!=="string"||!v.origin||!["researcher","model_proposal"].includes(v.origin.kind))continue;
   const origin:LedgerOrigin=v.origin.kind==="researcher"?{kind:"researcher"}:{kind:"model_proposal",scenarioId:clip(v.origin.scenarioId,80),runHash:clip(v.origin.runHash,80),proposalId:clip(v.origin.proposalId,80),proposedBy:clip(v.origin.proposedBy,120)};
   const c=createEntry({statement:v.statement,origin,rationale:v.rationale,prediction:v.prediction,experiment:v.experiment,falsifier:v.falsifier,limits:v.limits,citedClaimIds:v.citedClaimIds,citedSourceIds:v.citedSourceIds,linkedGapIds:v.linkedGapIds,cohortDefinitionId:v.cohortDefinitionId},v.createdAt.slice(0,40));
   if(!c.ok)continue;
   const e=c.entry,status=LEDGER_STATUSES.includes(v.status)?v.status as LedgerStatus:"proposed";
   const outcome=LEDGER_OUTCOMES.includes(v.outcome)?v.outcome as LedgerOutcome:"none";
   // A stored "testing" entry must still satisfy the falsifier rule; anything that does not is returned to "proposed".
   const safeStatus=status==="testing"&&missingForTest(e).length>0?"proposed":status;
   const history=Array.isArray(v.history)?v.history.filter((h:any)=>h&&typeof h.at==="string"&&["created","status","outcome","edited","linked","observation","target"].includes(h.type)&&typeof h.detail==="string").slice(-LIMITS.history).map((h:any)=>({at:h.at.slice(0,40),type:h.type,detail:h.detail.slice(0,500)})):e.history;
   const obs:CohortObservation[]=Array.isArray(v.cohortObservations)?v.cohortObservations.slice(0,LIMITS.observations).filter((o:any)=>o&&o.dataClass==="synthetic"&&typeof o.at==="string"&&typeof o.definitionId==="string"&&typeof o.aggregateDigest==="string"&&/^[a-f0-9]{64}$/.test(o.aggregateDigest)&&typeof o.graphVersion==="string"&&/^[a-f0-9]{8,64}$/.test(o.graphVersion)&&num(o.evaluated)&&num(o.matched)).map((o:any)=>({at:o.at.slice(0,40),definitionId:o.definitionId.slice(0,120),definitionTitle:clip(o.definitionTitle,160),graphVersion:o.graphVersion,aggregateDigest:o.aggregateDigest,evaluated:o.evaluated,matched:o.matched,suppressedCells:Number.isInteger(o.suppressedCells)&&o.suppressedCells>=0?o.suppressedCells:0,dataClass:"synthetic" as const})):[];
   const tp:TargetPick[]=Array.isArray(v.targetShortlist)?v.targetShortlist.slice(0,LIMITS.targets).filter((t:any)=>t&&typeof t.ensemblId==="string"&&/^ENSG\d{11}$/.test(t.ensemblId)&&typeof t.diseaseId==="string"&&/^(MONDO|EFO)_\d{7}$/.test(t.diseaseId)&&typeof t.score==="number"&&t.score>=0&&t.score<=1&&typeof t.symbol==="string"&&t.symbol.length>0&&typeof t.reason==="string"&&t.reason.trim().length>=10&&typeof t.at==="string"&&typeof t.retrievedAt==="string").map((t:any)=>({at:t.at.slice(0,40),ensemblId:t.ensemblId,symbol:t.symbol.slice(0,64),diseaseId:t.diseaseId,diseaseName:clip(t.diseaseName,120),score:t.score,retrievedAt:t.retrievedAt.slice(0,40),reason:clip(t.reason,300)})):[];
   out[e.id]={...e,targetShortlist:tp,cohortObservations:obs,status:safeStatus,outcome:safeStatus==="testing"||safeStatus==="parked"||safeStatus==="retired"?outcome:"none",outcomeNote:clip(v.outcomeNote,LIMITS.note),history:history.length?history:e.history};
  }
  return out;
 }catch{return {}}
}
