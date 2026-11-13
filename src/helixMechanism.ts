/**
 * HELIX model-backed step: asks an injected model runner to propose candidate mechanisms from the evidence units it is
 * GIVEN. The model is untrusted. Every candidate is validated before it exists: it must cite at least one given unit and no
 * other, causal wording that association evidence cannot support is rejected, and each survivor is labelled an unvalidated
 * hypothesis. Nothing here approves, promotes or writes a graph. The step is disabled unless explicitly enabled by the
 * caller, and a live runner must itself pass deployment approval and source clearance (see liveModels/stagingProviderOperations);
 * this module only validates what comes back.
 */
import type {ContextConflictAudit} from "./evidence/contextConflictAudit";

export type MechanismRequest={instruction:string;question:string;units:{id:string;label:string;subject:string;predicate:string;object:string;polarity:string}[]};
export type MechanismRunner=(request:MechanismRequest)=>Promise<unknown>;
export type MechanismCandidate={statement:string;citedUnitIds:string[];kind:"association_summary"|"hypothesised_mechanism";status:"unvalidated_hypothesis";approved:false;graphPromotable:false};
export type MechanismRejection={index:number;reason:string};
export type HelixResult={candidates:MechanismCandidate[];rejections:MechanismRejection[];modelCalls:number;notice:string};
export const HELIX_INSTRUCTION="Propose candidate mechanisms that could explain the listed findings. Use ONLY the listed units and cite them by id. These are hypotheses, not conclusions. Do not state causation from association; use hedged wording. Return JSON {candidates:[{statement,citedUnitIds,kind}]}.";
export const HELIX_NOTICE="HELIX candidates are unvalidated hypotheses proposed by a model from the evidence units given. Not evidence, not approved, not promotable. Human scientific review is required.";
const CAUSAL=/\b(causes?|caused|causing|drives?|driven|leads? to|led to|induces?|results? in|is responsible for|triggers?|determines?)\b/i;
const HEDGE=/\b(may|might|could|possibly|potentially|hypothes[ie]s|hypothesi[sz]ed|suggests?|consistent with|candidate)\b/i;

export function createHelix(cfg:{enabled:boolean;runner?:MechanismRunner;maxCalls?:number}){
 let calls=0;const maxCalls=cfg.maxCalls??1;
 return {async propose(audit:ContextConflictAudit):Promise<HelixResult>{
  if(cfg.enabled!==true||!cfg.runner)throw Error("HELIX is disabled: a model deployment must be approved and enabled");
  if(audit.blockedReason||!audit.units.length)return {candidates:[],rejections:[],modelCalls:0,notice:HELIX_NOTICE};
  if(calls>=maxCalls)throw Error("HELIX call budget exhausted");calls++;
  const given=new Set(audit.units.map(u=>u.id));
  const request:MechanismRequest={instruction:HELIX_INSTRUCTION,question:audit.question,units:audit.units.map(u=>({id:u.id,label:u.label,subject:u.subject.label??u.subject.value,predicate:u.predicate,object:u.object.label??u.object.value,polarity:u.findingPolarity}))};
  const raw=await cfg.runner(request) as {candidates?:unknown}|null;
  const list=Array.isArray(raw?.candidates)?raw!.candidates as unknown[]:null;
  if(!list)return {candidates:[],rejections:[{index:-1,reason:"model output is not {candidates:[...]}"}],modelCalls:calls,notice:HELIX_NOTICE};
  const candidates:MechanismCandidate[]=[],rejections:MechanismRejection[]=[];
  list.slice(0,10).forEach((c,index)=>{
   const x=c as {statement?:unknown;citedUnitIds?:unknown;kind?:unknown};
   if(typeof x?.statement!=="string"||x.statement.trim().length<10||x.statement.length>600)return void rejections.push({index,reason:"statement missing or out of bounds"});
   const ids=Array.isArray(x.citedUnitIds)?x.citedUnitIds:[];
   if(!ids.length||ids.some(i=>typeof i!=="string"))return void rejections.push({index,reason:"no cited evidence unit"});
   if(ids.some(i=>!given.has(i as string)))return void rejections.push({index,reason:"cites evidence it was not given"});
   if(CAUSAL.test(x.statement)&&!HEDGE.test(x.statement))return void rejections.push({index,reason:"unhedged causal claim from association evidence"});
   const kind=x.kind==="hypothesised_mechanism"?"hypothesised_mechanism":"association_summary";
   if(kind==="hypothesised_mechanism"&&!HEDGE.test(x.statement))return void rejections.push({index,reason:"a mechanism must be worded as a hypothesis"});
   candidates.push({statement:x.statement.trim(),citedUnitIds:[...new Set(ids as string[])],kind,status:"unvalidated_hypothesis",approved:false,graphPromotable:false});
  });
  return {candidates,rejections,modelCalls:calls,notice:HELIX_NOTICE};
 }};
}
