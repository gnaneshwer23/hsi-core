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
export type LedgerEvent={at:string;type:"created"|"status"|"outcome"|"edited"|"linked";detail:string};
export type LedgerEntry={
 id:string;statement:string;origin:LedgerOrigin;createdAt:string;
 rationale:string;prediction:string;experiment:string;falsifier:string;limits:string;
 citedClaimIds:string[];citedSourceIds:string[];linkedGapIds:string[];cohortDefinitionId:string|null;
 status:LedgerStatus;outcome:LedgerOutcome;outcomeNote:string;history:LedgerEvent[];
 /** Always true. Nothing in this ledger validates a hypothesis. */
 unvalidated:true;
};
export const LIMITS={statement:400,field:600,note:400,entries:200,history:100,gaps:10,cited:20};
const clip=(s:unknown,n:number)=>typeof s==="string"?s.trim().slice(0,n):"";
export const entryId=(origin:LedgerOrigin,statement:string)=>"hyp:"+fnv(origin.kind==="model_proposal"?`${origin.scenarioId}|${origin.runHash}|${origin.proposalId}`:`r|${statement.trim().toLowerCase()}`);
function fnv(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")}

export type NewEntry={statement:string;origin:LedgerOrigin;rationale?:string;prediction?:string;experiment?:string;falsifier?:string;limits?:string;citedClaimIds?:string[];citedSourceIds?:string[];linkedGapIds?:string[];cohortDefinitionId?:string|null};
export function createEntry(input:NewEntry,at:string):{ok:true;entry:LedgerEntry}|{ok:false;error:string}{
 const statement=clip(input.statement,LIMITS.statement);
 if(statement.length<10)return {ok:false,error:"State the hypothesis in at least 10 characters."};
 const f=(v:unknown)=>clip(v,LIMITS.field),ids=(v:unknown,n:number)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==="string"&&x.length>0&&x.length<=220))].slice(0,n):[];
 const entry:LedgerEntry={id:entryId(input.origin,statement),statement,origin:input.origin,createdAt:at,rationale:f(input.rationale),prediction:f(input.prediction),experiment:f(input.experiment),falsifier:f(input.falsifier),limits:f(input.limits),
  citedClaimIds:ids(input.citedClaimIds,LIMITS.cited),citedSourceIds:ids(input.citedSourceIds,LIMITS.cited),linkedGapIds:ids(input.linkedGapIds,LIMITS.gaps),cohortDefinitionId:typeof input.cohortDefinitionId==="string"&&input.cohortDefinitionId.length<=120?input.cohortDefinitionId:null,
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
   const history=Array.isArray(v.history)?v.history.filter((h:any)=>h&&typeof h.at==="string"&&["created","status","outcome","edited","linked"].includes(h.type)&&typeof h.detail==="string").slice(-LIMITS.history).map((h:any)=>({at:h.at.slice(0,40),type:h.type,detail:h.detail.slice(0,500)})):e.history;
   out[e.id]={...e,status:safeStatus,outcome:safeStatus==="testing"||safeStatus==="parked"||safeStatus==="retired"?outcome:"none",outcomeNote:clip(v.outcomeNote,LIMITS.note),history:history.length?history:e.history};
  }
  return out;
 }catch{return {}}
}
