/**
 * Evaluation set for HSI's gap output: items, blinded rating, and analysis that refuses to overclaim.
 * Rules built in: ratings by the people who built the system never count towards a result; at least two independent raters and ten
 * doubly-rated units are needed before any mean is shown; each dimension is reported alone; a difference between HSI and a
 * comparison output is only called a difference when its interval excludes zero; and every result is about these items and
 * these raters only. Nothing here runs a model, and there is no network or storage.
 */
import {canonical,sha256} from "../clinicalPlane/auditChain";
import {DIMENSION_IDS,RUBRIC_VERSION,isScore,type DimensionId,type Score} from "./rubric";
import {bootstrapMeanCI,kappaLabel,mean,pairedDiffCI,percentAgreement,weightedKappa,type CI} from "./stats";

export type Condition="hsi"|"baseline";
export type EvalOutput={id:string;condition:Condition;text:string;sourceNote:string};
export type EvalItem={id:string;domain:string;prompt:string;outputs:EvalOutput[]};
export type ItemSet={schema:"hsi-eval-items-1";rubric:typeof RUBRIC_VERSION;items:EvalItem[];digest:string};
export type Expertise="early_career"|"experienced"|"domain_expert"|"other";
export const EXPERTISE:readonly Expertise[]=["early_career","experienced","domain_expert","other"];
export type Rater={raterId:string;independent:boolean;expertise:Expertise};
export type Rating={itemId:string;outputId:string;scores:Record<DimensionId,Score>;note:string;at:string};
export type RatingFile={schema:"hsi-eval-ratings-1";rubric:typeof RUBRIC_VERSION;itemsDigest:string;rater:Rater;ratings:Rating[]};
export const LIM={items:200,outputs:4,text:1200,prompt:400,note:300,ratings:1000,files:20};
export const MIN_INDEPENDENT_RATERS=2,MIN_UNITS=10;
const RATER_ID=/^[A-Za-z0-9][A-Za-z0-9 _.-]{1,39}$/;
const clip=(s:unknown,n:number)=>typeof s==="string"?s.trim().replace(/[ \t]+/g," ").slice(0,n):"";
const rec=(v:unknown):v is Record<string,unknown>=>typeof v==="object"&&v!==null&&!Array.isArray(v);

// ---- items
export function makeItemSet(items:EvalItem[]):{ok:true;set:ItemSet}|{ok:false;error:string}{
 if(items.length<1||items.length>LIM.items)return {ok:false,error:`An item set holds 1 to ${LIM.items} items.`};
 const ids=new Set<string>(),out:EvalItem[]=[];
 for(const it of items){
  if(!rec(it)||typeof it.id!=="string"||!/^[\w:.\-]{1,200}$/.test(it.id)||ids.has(it.id))return {ok:false,error:"Items need unique ids."};ids.add(it.id);
  const outs=Array.isArray(it.outputs)?it.outputs:[];if(outs.length<1||outs.length>LIM.outputs)return {ok:false,error:`Each item needs 1 to ${LIM.outputs} outputs.`};
  const oids=new Set<string>(),oo:EvalOutput[]=[];
  for(const o of outs){
   const text=clip(o.text,LIM.text);if(text.length<10||!/^[\w:.\-]{1,220}$/.test(String(o.id))||oids.has(o.id)||(o.condition!=="hsi"&&o.condition!=="baseline"))return {ok:false,error:"Each output needs a unique id, a condition and at least 10 characters of text."};
   oids.add(o.id);oo.push({id:o.id,condition:o.condition,text,sourceNote:clip(o.sourceNote,200)});
  }
  out.push({id:it.id,domain:clip(it.domain,80),prompt:clip(it.prompt,LIM.prompt),outputs:oo});
 }
 const body={schema:"hsi-eval-items-1" as const,rubric:RUBRIC_VERSION,items:out};
 return {ok:true,set:{...body,digest:sha256(canonical(body))}};
}
export function parseItemSet(raw:string|null):ItemSet|null{
 if(!raw||raw.length>2_000_000)return null;
 try{const x=JSON.parse(raw);if(!rec(x)||x.schema!=="hsi-eval-items-1"||x.rubric!==RUBRIC_VERSION||!Array.isArray(x.items))return null;
  const r=makeItemSet(x.items as EvalItem[]);return r.ok&&r.set.digest===x.digest?r.set:null}catch{return null}
}
/** Built from the published graph's gaps: HSI outputs only. No comparison output is invented; add one from another tool or a person. */
export function itemsFromGaps(g:{gaps:{id:string;question:string;missing:string;domains:string[];conditions:string[]}[]}):EvalItem[]{
 return g.gaps.map(x=>({id:"gap:"+x.id.replace(/^gap:/,""),domain:(x.conditions[0]??x.domains[0]??"").slice(0,80),
  prompt:`Area: ${[...x.conditions,...x.domains].slice(0,4).join(", ")||"not stated"}. Someone proposed the item below as a gap in current knowledge. Rate it as a researcher who knows this area.`,
  outputs:[{id:"o:hsi:"+x.id.replace(/^gap:/,""),condition:"hsi",text:`${x.question}\nWhat is missing: ${x.missing}`,sourceNote:"HSI published graph gap"}]}));
}
const fnv=(s:string)=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h};
/** Output order for one rater: deterministic, differs between raters, and hides the condition (labels are "Output 1", "Output 2"). */
export function blindedOutputs(raterId:string,item:EvalItem):{label:string;output:EvalOutput}[]{
 const key=(o:EvalOutput)=>fnv(raterId+"|"+item.id+"|"+o.id);
 return [...item.outputs].sort((a,b)=>key(a)-key(b)||a.id.localeCompare(b.id)).map((o,i)=>({label:`Output ${i+1}`,output:o}));
}

// ---- ratings
export function validateRatingFile(x:unknown,set:ItemSet):{ok:true;file:RatingFile}|{ok:false;error:string}{
 if(!rec(x)||x.schema!=="hsi-eval-ratings-1"||x.rubric!==RUBRIC_VERSION)return {ok:false,error:"Not a ratings file for this rubric."};
 if(x.itemsDigest!==set.digest)return {ok:false,error:"These ratings were made on a different item set."};
 const r=x.rater;if(!rec(r)||typeof r.raterId!=="string"||!RATER_ID.test(r.raterId)||r.raterId.includes("@")||typeof r.independent!=="boolean"||!EXPERTISE.includes(r.expertise as Expertise))return {ok:false,error:"The rater needs a pseudonymous id (letters, numbers, spaces; no email), an independence statement and an expertise level."};
 if(!Array.isArray(x.ratings)||x.ratings.length>LIM.ratings)return {ok:false,error:"Too many ratings."};
 const outs=new Map<string,string>();for(const it of set.items)for(const o of it.outputs)outs.set(o.id,it.id);
 const seen=new Set<string>(),ratings:Rating[]=[];
 for(const v of x.ratings){
  if(!rec(v)||typeof v.outputId!=="string"||outs.get(v.outputId)!==v.itemId||!rec(v.scores))return {ok:false,error:"A rating refers to an unknown item or output."};
  if(seen.has(v.outputId))return {ok:false,error:"An output is rated twice by the same rater."};seen.add(v.outputId);
  const sc={} as Record<DimensionId,Score>;for(const d of DIMENSION_IDS){const s=(v.scores as Record<string,unknown>)[d];if(!isScore(s))return {ok:false,error:"Every dimension needs a score from 1 to 5."};sc[d]=s}
  ratings.push({itemId:String(v.itemId),outputId:v.outputId,scores:sc,note:clip(v.note,LIM.note),at:clip(v.at,40)});
 }
 return {ok:true,file:{schema:"hsi-eval-ratings-1",rubric:RUBRIC_VERSION,itemsDigest:set.digest,rater:{raterId:r.raterId,independent:r.independent,expertise:r.expertise as Expertise},ratings}};
}
export function parseRatingFile(raw:string,set:ItemSet){
 if(raw.length>1_500_000)return {ok:false as const,error:"File too large."};
 try{return validateRatingFile(JSON.parse(raw),set)}catch{return {ok:false as const,error:"Not valid JSON."}}
}
export const exportRatings=(rater:Rater,set:ItemSet,ratings:Rating[]):string=>JSON.stringify({schema:"hsi-eval-ratings-1",rubric:RUBRIC_VERSION,itemsDigest:set.digest,rater,ratings},null,2);

// ---- analysis
export type DimStats={unitsRated:number;ci:CI|null};
export type Analysis={
 raters:{raterId:string;independent:boolean;expertise:Expertise;ratings:number}[];independentRaters:number;
 status:"insufficient"|"ok";reasons:string[];
 byCondition:Record<Condition,Record<DimensionId,DimStats>>;
 agreement:Record<DimensionId,{pairs:number;kappa:number|null;label:string;withinOne:number|null}>;
 comparison:Record<DimensionId,{pairedItems:number;diff:CI|null;reading:"hsi_higher"|"baseline_higher"|"not_established"}>;
 notes:string[];
};
const dimMap=<T,>(f:(d:DimensionId)=>T)=>Object.fromEntries(DIMENSION_IDS.map(d=>[d,f(d)])) as Record<DimensionId,T>;
export function analyse(set:ItemSet,files:readonly RatingFile[]):Analysis{
 const cond=new Map<string,Condition>(),itemOf=new Map<string,string>();for(const it of set.items)for(const o of it.outputs){cond.set(o.id,o.condition);itemOf.set(o.id,it.id)}
 const raters=files.map(f=>({raterId:f.rater.raterId,independent:f.rater.independent,expertise:f.rater.expertise,ratings:f.ratings.length}));
 const indep=files.filter(f=>f.rater.independent);
 const reasons:string[]=[];
 if(indep.length<MIN_INDEPENDENT_RATERS)reasons.push(`At least ${MIN_INDEPENDENT_RATERS} independent raters are needed; there ${indep.length===1?"is":"are"} ${indep.length}.`);
 // unit = one output; its score is the mean over independent raters; only doubly-rated outputs are units
 const byOut=new Map<string,Map<string,Record<DimensionId,Score>>>();
 for(const f of indep)for(const r of f.ratings){const m=byOut.get(r.outputId)??new Map();m.set(f.rater.raterId,r.scores);byOut.set(r.outputId,m)}
 const units=new Map<string,Record<DimensionId,number>>();
 for(const [o,m] of byOut)if(m.size>=2)units.set(o,dimMap(d=>mean([...m.values()].map(s=>s[d]))!));
 const byCondition={hsi:dimMap(()=>({unitsRated:0,ci:null as CI|null})),baseline:dimMap(()=>({unitsRated:0,ci:null as CI|null}))} as Analysis["byCondition"];
 for(const c of ["hsi","baseline"] as Condition[]){
  const us=[...units].filter(([o])=>cond.get(o)===c).map(([,v])=>v);
  for(const d of DIMENSION_IDS){byCondition[c][d].unitsRated=us.length;if(indep.length>=MIN_INDEPENDENT_RATERS&&us.length>=MIN_UNITS)byCondition[c][d].ci=bootstrapMeanCI(us.map(u=>u[d]))}
  if(us.length>0&&us.length<MIN_UNITS)reasons.push(`${c==="hsi"?"HSI":"Comparison"} outputs: ${us.length} rated by two or more independent raters; ${MIN_UNITS} are needed before a mean is shown.`);
  if(us.length===0&&c==="hsi"&&indep.length>=MIN_INDEPENDENT_RATERS)reasons.push("No HSI output has been rated by two independent raters yet.");
 }
 // agreement: pairwise over independent raters, per dimension
 const agreement=dimMap(d=>{
  const ks:number[]=[],ws:number[]=[];let pairs=0;
  for(let i=0;i<indep.length;i++)for(let j=i+1;j<indep.length;j++){
   const A=new Map(indep[i]!.ratings.map(r=>[r.outputId,r.scores[d]])),a:number[]=[],b:number[]=[];
   for(const r of indep[j]!.ratings){const x=A.get(r.outputId);if(x!==undefined){a.push(x);b.push(r.scores[d])}}
   if(a.length>=MIN_UNITS){pairs++;const k=weightedKappa(a,b),w=percentAgreement(a,b,1);if(k!==null)ks.push(k);if(w!==null)ws.push(w)}
  }
  const k=ks.length?Math.round(mean(ks)!*1000)/1000:null;
  return {pairs,kappa:k,label:kappaLabel(k),withinOne:ws.length?Math.round(mean(ws)!*1000)/1000:null};
 });
 // paired comparison on items that have both conditions rated by two or more independent raters
 const comparison=dimMap(d=>{
  const a:number[]=[],b:number[]=[];
  for(const it of set.items){
   const h=it.outputs.filter(o=>o.condition==="hsi"&&units.has(o.id)).map(o=>units.get(o.id)![d]),s=it.outputs.filter(o=>o.condition==="baseline"&&units.has(o.id)).map(o=>units.get(o.id)![d]);
   if(h.length&&s.length){a.push(mean(h)!);b.push(mean(s)!)}
  }
  const diff=indep.length>=MIN_INDEPENDENT_RATERS&&a.length>=MIN_UNITS?pairedDiffCI(a,b):null;
  return {pairedItems:a.length,diff,reading:(!diff?"not_established":diff.low>0?"hsi_higher":diff.high<0?"baseline_higher":"not_established") as "hsi_higher"|"baseline_higher"|"not_established"};
 });
 const status:Analysis["status"]=reasons.length===0&&DIMENSION_IDS.every(d=>byCondition.hsi[d].ci!==null)?"ok":"insufficient";
 const builders=files.filter(f=>!f.rater.independent).length;
 return {raters,independentRaters:indep.length,status,reasons,byCondition,agreement,comparison,notes:[
  ...(builders>0?[`${builders} rater${builders===1?"":"s"} said they were not independent (took part in building or commissioning HSI). Their ratings are shown in the rater list and excluded from every result.`]:[]),
  "Each dimension is reported on its own. There is no overall score.",
  "A result describes these items and these raters only. It is not a general claim about HSI, and an interval that includes zero means no difference was established, not that there is none.",
 ]};
}
