/**
 * My methods notebook: a private record of what you actually did against a published method, what you changed and why, and what
 * happened. Worked, partly and failed are kept together and always with context; there is no rating or "best" ranking. Time and
 * cost are self-reported. Records are private to this browser: nothing here shares, uploads or publishes anything.
 */
export type Outcome="worked"|"partly"|"failed"|"unknown";
export const OUTCOMES:readonly Outcome[]=["worked","partly","failed","unknown"];
export type Deviation={parameter:string;published:string;mine:string;reason:string};
export type MethodRecord={
 id:string;createdAt:string;technique:string;
 reference:{title:string;doi:string;pmcid:string};
 deviations:Deviation[];
 context:{species:string;tissue:string;cellType:string;reagents:string;instrument:string};
 outcome:Outcome;outcomeNote:string;
 effort:{hours:number|null;costGbp:number|null};
 sharing:"private";
};
export const LIM={technique:160,short:120,reason:300,note:400,deviations:12,records:200,ref:300};
const clip=(s:unknown,n:number)=>typeof s==="string"?s.trim().replace(/\s+/g," ").slice(0,n):"";
const fnv=(s:string)=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,"0")};
const money=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=10_000_000?Math.round(v*100)/100:null;
const hours=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=100_000?Math.round(v*10)/10:null;
const doi=(v:unknown)=>{const s=clip(v,120).replace(/^https?:\/\/(dx\.)?doi\.org\//i,"");return /^10\.\d{4,9}\/\S+$/.test(s)?s:""};

export type NewRecord={technique:string;reference?:Partial<MethodRecord["reference"]>;deviations?:Partial<Deviation>[];context?:Partial<MethodRecord["context"]>;outcome?:Outcome;outcomeNote?:string;effort?:{hours?:number|null;costGbp?:number|null}};
export function createRecord(i:NewRecord,at:string):{ok:true;record:MethodRecord}|{ok:false;error:string}{
 const technique=clip(i.technique,LIM.technique);if(technique.length<3)return {ok:false,error:"Name the technique in at least 3 characters."};
 const devs:Deviation[]=[];
 for(const d of (i.deviations??[]).slice(0,LIM.deviations)){
  const dev={parameter:clip(d.parameter,80),published:clip(d.published,LIM.short),mine:clip(d.mine,LIM.short),reason:clip(d.reason,LIM.reason)};
  if(!dev.parameter&&!dev.published&&!dev.mine&&!dev.reason)continue;
  if(!dev.parameter||!dev.mine)return {ok:false,error:"Each change needs the parameter and what you did instead."};
  devs.push(dev);
 }
 const outcome=OUTCOMES.includes(i.outcome as Outcome)?i.outcome as Outcome:"unknown",note=clip(i.outcomeNote,LIM.note);
 if((outcome==="partly"||outcome==="failed")&&note.length<10)return {ok:false,error:"Say what happened when it partly worked or failed (at least 10 characters). Failures are as useful as successes."};
 const c=i.context??{};
 const ref=i.reference??{},pm=typeof ref.pmcid==="string"&&/^PMC\d{4,9}$/.test(ref.pmcid.trim())?ref.pmcid.trim():"";
 return {ok:true,record:{id:"mth:"+fnv(technique.toLowerCase()+"|"+at),createdAt:at,technique,reference:{title:clip(ref.title,LIM.ref),doi:doi(ref.doi),pmcid:pm},deviations:devs,
  context:{species:clip(c.species,LIM.short),tissue:clip(c.tissue,LIM.short),cellType:clip(c.cellType,LIM.short),reagents:clip(c.reagents,200),instrument:clip(c.instrument,LIM.short)},
  outcome,outcomeNote:note,effort:{hours:hours(i.effort?.hours),costGbp:money(i.effort?.costGbp)},sharing:"private"}};
}
export type Notebook=Record<string,MethodRecord>;
export function addRecord(n:Notebook,r:MethodRecord):{notebook:Notebook;added:boolean;error?:string}{
 if(n[r.id])return {notebook:n,added:false};
 if(Object.keys(n).length>=LIM.records)return {notebook:n,added:false,error:`The notebook holds at most ${LIM.records} records.`};
 return {notebook:{...n,[r.id]:r},added:true};
}
export function removeRecord(n:Notebook,id:string):Notebook{const {[id]:_,...rest}=n;void _;return rest}
/** Counts only. Worked, partly and failed are shown together; nothing is scored. */
export function summary(n:Notebook){
 const rs=Object.values(n),by:Record<Outcome,number>={worked:0,partly:0,failed:0,unknown:0};for(const r of rs)by[r.outcome]++;
 const h=rs.map(r=>r.effort.hours).filter((x):x is number=>x!==null),c=rs.map(r=>r.effort.costGbp).filter((x):x is number=>x!==null);
 return {records:rs.length,byOutcome:by,withDeviations:rs.filter(r=>r.deviations.length>0).length,selfReportedHours:h.length?h.reduce((a,b)=>a+b,0):null,selfReportedCostGbp:c.length?c.reduce((a,b)=>a+b,0):null,effortNote:"Self-reported by you for your own records. Not a saving, and not a platform total."};
}
export const EXPORT_SCHEMA="hsi-methods-notebook-1";
export const EXPORT_NOTICE="Contains your own notes. Check for confidential, unpublished or institution-owned material and for hazardous procedures before sharing this file with anyone.";
export const exportNotebook=(n:Notebook)=>JSON.stringify({schema:EXPORT_SCHEMA,notice:EXPORT_NOTICE,records:Object.values(n)},null,2);
export function parseNotebook(raw:string|null):Notebook{
 if(!raw||raw.length>1_500_000)return {};
 try{
  const x=JSON.parse(raw),arr:unknown[]=Array.isArray(x?.records)?x.records:x&&typeof x==="object"&&!Array.isArray(x)&&!x.schema?Object.values(x):[];
  const out:Notebook={};
  for(const v of arr.slice(0,LIM.records)){
   const r=v as any;if(!r||typeof r!=="object"||typeof r.createdAt!=="string"||typeof r.id!=="string"||!/^mth:[a-f0-9]{8}$/.test(r.id))continue;
   const c=createRecord({technique:r.technique,reference:r.reference,deviations:r.deviations,context:r.context,outcome:r.outcome,outcomeNote:r.outcomeNote,effort:r.effort},r.createdAt.slice(0,40));
   if(c.ok)out[r.id]={...c.record,id:r.id};
  }
  return out;
 }catch{return {}}
}
/** Merge imported records without overwriting existing ones. */
export function mergeImport(n:Notebook,imported:Notebook){let added=0,skipped=0,cur=n;for(const r of Object.values(imported)){const a=addRecord(cur,r);if(a.added){added++;cur=a.notebook}else skipped++}return {notebook:cur,added,skipped}}
