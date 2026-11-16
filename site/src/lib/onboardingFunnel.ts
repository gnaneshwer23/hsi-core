/**
 * Where setup runs stop, kept only in this browser. No identifiers, no answers, no server: each run stores the day
 * (not the time) and the furthest step reached. Read it with /welcome?funnel=1 during test sessions.
 */
export const FUNNEL_KEY="hsi-onboarding-funnel-v1";
export const FUNNEL_STEPS=4,MAX_RUNS=30;
export type Run={day:string;reached:number;done:boolean};
export type Funnel={v:1;runs:Run[]};
export const EMPTY_FUNNEL:Funnel={v:1,runs:[]};
type Store=Pick<Storage,"getItem"|"setItem">;

export function parseFunnel(raw:string|null):Funnel{
 try{
  const x=raw?JSON.parse(raw):null;
  if(!x||x.v!==1||!Array.isArray(x.runs))return {v:1,runs:[]};
  const runs=x.runs.filter((r:unknown):r is Run=>{const o=r as Run;return !!o&&typeof o.day==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(o.day)&&Number.isInteger(o.reached)&&o.reached>=1&&o.reached<=FUNNEL_STEPS&&typeof o.done==="boolean"}).slice(-MAX_RUNS).map((r:Run)=>({day:r.day,reached:r.reached,done:r.done}));
  return {v:1,runs};
 }catch{return {v:1,runs:[]}}
}
export const beginRun=(f:Funnel,day:string):{funnel:Funnel;index:number}=>{const runs=[...f.runs,{day,reached:1,done:false}].slice(-MAX_RUNS);return {funnel:{v:1,runs},index:runs.length-1}};
/** Step is 1-based. Never moves a run backwards, so Back does not lower the furthest step. */
export const reach=(f:Funnel,index:number,step:number):Funnel=>{
 const r=f.runs[index];if(!r||step<1||step>FUNNEL_STEPS||step<=r.reached)return f;
 return {v:1,runs:f.runs.map((x,i)=>i===index?{...x,reached:step}:x)};
};
export const finishRun=(f:Funnel,index:number):Funnel=>{const r=f.runs[index];return r?{v:1,runs:f.runs.map((x,i)=>i===index?{...x,reached:FUNNEL_STEPS,done:true}:x)}:f};
/** Runs that got at least as far as each step, and how many finished. */
export function summarize(f:Funnel){
 const n=f.runs.length;
 return {runs:n,done:f.runs.filter(r=>r.done).length,byStep:Array.from({length:FUNNEL_STEPS},(_,i)=>f.runs.filter(r=>r.reached>=i+1).length)};
}
const safe=():Store|null=>{try{return typeof localStorage==="undefined"?null:localStorage}catch{return null}};
export const loadFunnel=(s:Store|null=safe()):Funnel=>{try{return parseFunnel(s?s.getItem(FUNNEL_KEY):null)}catch{return {v:1,runs:[]}}};
export const saveFunnel=(f:Funnel,s:Store|null=safe()):void=>{try{s?.setItem(FUNNEL_KEY,JSON.stringify(f))}catch{/* storage unavailable: nothing is recorded */}};
