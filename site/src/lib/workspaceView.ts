/** Pure view logic for the investigation workspace. Every number comes from the run result; nothing is estimated. */
import type {LiveInvestigation} from "../../../src/investigation/liveRun";
export type Run=LiveInvestigation;
export type Cand=Run["candidates"][number];

export type StageKey="plan"|"retrieve"|"connect"|"compare"|"verify"|"brief";
export type StageState="pending"|"running"|"done"|"partial"|"failed"|"skipped";
const STAGES:{key:StageKey;label:string;events:string[]}[]=[
 {key:"plan",label:"Plan",events:["scoped"]},
 {key:"retrieve",label:"Retrieve",events:["searched","retrieved"]},
 {key:"connect",label:"Connect",events:["mapped"]},
 {key:"compare",label:"Compare",events:["compared"]},
 {key:"verify",label:"Verify",events:["challenged"]},
 {key:"brief",label:"Brief",events:["brief"]},
];
const rank:Record<string,number>={failed:4,partial:3,skipped:2,ok:1};
/** The rail shows what the run recorded. While a run is in flight it cannot know which step is active, so it says so instead of guessing. */
export function stageRail(run:Run|null,running:boolean):{key:StageKey;label:string;state:StageState;detail:string}[]{
 return STAGES.map(s=>{
  if(!run)return {key:s.key,label:s.label,state:running?"running":"pending",detail:running?"Running on the server":"Not run"};
  const evs=run.events.filter(e=>s.events.includes(e.stage));
  if(!evs.length)return {key:s.key,label:s.label,state:"pending" as const,detail:"No record"};
  const worst=evs.reduce((a,e)=>(rank[e.status]??0)>(rank[a]??0)?e.status:a,"ok");
  const state:StageState=worst==="ok"?"done":worst==="partial"?"partial":worst==="failed"?"failed":"skipped";
  return {key:s.key,label:s.label,state,detail:evs.map(e=>e.detail).join(" ")};
 });
}

export type Bucket="supporting"|"opposing"|"nodirection"|"unchecked";
export const bucketOf=(c:Cand):Bucket=>c.verification==="not_run"?"unchecked":c.polarity==="supporting"?"supporting":c.polarity==="opposing"?"opposing":"nodirection";
export const BUCKET_LABEL:Record<Bucket,string>={supporting:"Supporting",opposing:"Opposing",nodirection:"No direction",unchecked:"Not checked"};
export function counts(run:Run){
 const c:Record<Bucket,number>={supporting:0,opposing:0,nodirection:0,unchecked:0};
 for(const x of run.candidates)c[bucketOf(x)]++;
 return c;
}
export function filterCandidates(cands:readonly Cand[],f:{bucket:Bucket|"all";pair:string|null}):Cand[]{
 return cands.filter(c=>(f.bucket==="all"||bucketOf(c)===f.bucket)&&(!f.pair||pairKey(c)===f.pair));
}
export const pairKey=(c:Pick<Cand,"subject"|"object">)=>c.subject+"→"+c.object;

export type EdgeState="supporting"|"opposing"|"disputed"|"unassessed";
export type Graph={nodes:{id:string;label:string;centre:boolean;linked:boolean}[];edges:{key:string;from:string;to:string;state:EdgeState;candidates:number;checked:number}[]};
export function buildGraph(run:Run):Graph{
 const labels=run.entities,centre=labels[0]??"";
 const pairs=new Map<string,Cand[]>();
 for(const c of run.candidates){(pairs.get(pairKey(c))??pairs.set(pairKey(c),[]).get(pairKey(c))!).push(c)}
 const edges=[...pairs.entries()].map(([key,cs])=>{
  const s=cs.filter(c=>bucketOf(c)==="supporting").length,o=cs.filter(c=>bucketOf(c)==="opposing").length;
  const state:EdgeState=s&&o?"disputed":s?"supporting":o?"opposing":"unassessed";
  return {key,from:cs[0]!.subject,to:cs[0]!.object,state,candidates:cs.length,checked:cs.filter(c=>c.verification!=="not_run").length};
 });
 const linked=new Set(edges.flatMap(e=>[e.from,e.to]));
 return {nodes:labels.map(l=>({id:l,label:l,centre:l===centre,linked:linked.has(l)||l===centre})),edges};
}
export function headline(run:Run){
 const c=counts(run);
 return {sources:run.records.length,candidates:run.candidates.length,findings:c.supporting+c.opposing,checked:run.candidates.length-c.unchecked,contradictions:c.opposing+run.candidates.filter(x=>x.verification==="disputed").length};
}
export const yearOf=(d:string|null|undefined)=>d&&/^\d{4}/.test(d)?d.slice(0,4):"n.d.";
