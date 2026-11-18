/**
 * Research Home logic. Pure and testable. Personal preferences default to THIS DEVICE
 * (localStorage). Server sync is fail-closed (PR-E2E-08) until an additive store is
 * enabled under staging pins — migration 023 stays held. Search uses the published graph only.
 */
import type {DomainBundle,DomainNode} from "../../../src/knowledgeGraph/domainGraph";
import {
  CADENCES,
  EMPTY_PROFILE,
  GOALS,
  parseOrcid,
  parsePaperIds,
  parseProfile,
  PROFILE_KEY,
  ROLES,
  STAGES,
  type Profile,
} from "../../../src/onboarding/researcherProfile";
import {departments} from "./departments";

export {CADENCES,EMPTY_PROFILE,GOALS,parseOrcid,parsePaperIds,parseProfile,PROFILE_KEY,ROLES,STAGES,type Profile};

type Store=Pick<Storage,"getItem"|"setItem"|"removeItem">;
export function loadProfile(s:Store|null=safeStore()):Profile{try{return parseProfile(s?s.getItem(PROFILE_KEY):null)}catch{return {...EMPTY_PROFILE}}}
export function saveProfile(p:Profile,s:Store|null=safeStore()):boolean{try{if(!s)return false;s.setItem(PROFILE_KEY,JSON.stringify(p));return true}catch{return false}}
export function resetProfile(s:Store|null=safeStore()){try{s?.removeItem(PROFILE_KEY)}catch{/* storage unavailable */}return {...EMPTY_PROFILE}}
function safeStore():Store|null{try{return typeof localStorage==="undefined"?null:localStorage}catch{return null}}

const norm=(s:string)=>s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
export type EntityHit={id:string;name:string;kind:string;matchedOn:string;domains:string[];score:number};
export function searchEntities(nodes:readonly DomainNode[],query:string,limit=8):EntityHit[]{
 const q=norm(query);if(q.length<2)return [];
 const hits:EntityHit[]=[];
 for(const n of nodes){
  const names=[n.name,...n.aliases];let best=0,on=n.name;
  for(const raw of names){
   const t=norm(raw);if(!t)continue;
   const s=t===q?100:t.startsWith(q)?80:t.split(" ").some(w=>w.startsWith(q))?60:t.includes(q)?40:0;
   if(s>best){best=s;on=raw}
  }
  if(best)hits.push({id:n.id,name:n.name,kind:n.kind,matchedOn:on,domains:n.domains,score:best});
 }
 return hits.sort((a,b)=>b.score-a.score||a.name.length-b.name.length||a.name.localeCompare(b.name)).slice(0,limit);
}
export type Intent="empty"|"entity"|"exploratory"|"investigation";
export function classifyIntent(query:string,hits:readonly EntityHit[]):Intent{
 const q=query.trim();if(q.length<2)return "empty";
 const words=q.split(/\s+/).length;
 if(words>=7||/^(how|why|what|which|does|do|can|could|is|are)\b/i.test(q)||q.endsWith("?"))return "investigation";
 if(hits.length&&words<=4&&hits[0]!.score>=60)return "entity";
 return words>=2?"exploratory":hits.length?"entity":"exploratory";
}
export const looksLikeTrialId=(q:string)=>/^NCT\d{8}$/i.test(q.trim());

export const INVESTIGATION_STATUS:Record<string,string>={draft:"Draft",awaiting_scientific_review:"Awaiting scientific review",reviewed:"Reviewed (a review state, not verification)",rejected:"Rejected"};

const deptByInterest=(i:string)=>departments.find(d=>d.slug===i||d.name===i);
export type Recommendation={id:string;name:string;kind:string;reason:string;relationships:number};
/** Deterministic and explainable. No model call. Every item is a real graph concept; nothing is invented. */
export function recommend(profile:Profile,bundle:DomainBundle,limit=6):Recommendation[]{
 const deg=new Map<string,number>(),nb=new Map<string,Set<string>>();
 for(const e of bundle.edges){if(e.kind!=="source_candidate")continue;for(const [a,b] of [[e.subjectId,e.objectId],[e.objectId,e.subjectId]] as const){deg.set(a,(deg.get(a)??0)+1);(nb.get(a)??nb.set(a,new Set()).get(a)!).add(b)}}
 const taken=new Set([...profile.followed.map(f=>f.id),...profile.dismissed]);
 const byId=new Map(bundle.nodes.map(n=>[n.id,n]));
 const out:Recommendation[]=[],perReason=new Map<string,number>();
 const push=(n:DomainNode,reason:string)=>{
  if(taken.has(n.id)||out.some(o=>o.id===n.id))return;
  if((perReason.get(reason)??0)>=2)return; // diversity: no single reason fills the list
  perReason.set(reason,(perReason.get(reason)??0)+1);taken.add(n.id);
  out.push({id:n.id,name:n.name,kind:n.kind,reason,relationships:deg.get(n.id)??0});
 };
 for(const f of profile.followed){
  const near=[...(nb.get(f.id)??[])].map(id=>byId.get(id)).filter((n):n is DomainNode=>!!n).sort((a,b)=>(deg.get(b.id)??0)-(deg.get(a.id)??0));
  for(const n of near)push(n,"Connected to "+f.name+", which you follow");
 }
 for(const i of profile.interests){
  const d=deptByInterest(i);
  if(!d){ // a free-text topic: match concepts by name or alias
   for(const h of searchEntities(bundle.nodes,i,6)){const n=byId.get(h.id);if(n&&(deg.get(n.id)??0)>0)push(n,"Matches your topic \u201c"+i+"\u201d")}
   continue;
  }
  const tags=new Set<string>(d.graphTags);
  const inDept=bundle.nodes.filter(n=>n.domains.some(t=>tags.has(t))&&(deg.get(n.id)??0)>0).sort((a,b)=>(deg.get(b.id)??0)-(deg.get(a.id)??0)||a.name.localeCompare(b.name));
  for(const n of inDept)push(n,"Matches your interest in "+d.name);
 }
 return out.slice(0,limit);
}
export function focusNetwork(bundle:DomainBundle,centerId:string,max=9){
 const names=new Map(bundle.nodes.map(n=>[n.id,n.name]));
 if(!names.has(centerId))return null;
 const cands=bundle.edges.filter(e=>e.kind==="source_candidate");
 const touching=cands.filter(e=>e.subjectId===centerId||e.objectId===centerId);
 const keep=new Set<string>([centerId]);
 for(const e of touching){if(keep.size>=max)break;keep.add(e.subjectId===centerId?e.objectId:e.subjectId)}
 const edges=cands.filter(e=>keep.has(e.subjectId)&&keep.has(e.objectId)).slice(0,16).map(e=>({id:e.id,s:e.subjectId,o:e.objectId,predicate:e.predicate.replaceAll("_"," "),negated:e.negated}));
 return {center:centerId,nodes:[...keep].map(id=>({id,name:names.get(id)??id})),edges};
}

export const LIVE_RUN_KEY="hsi-live-investigation-v1";
export type SavedLiveRun={question:string;candidates:number;supporting:number;opposing:number;checked:number};
/** Summarises a browser-saved live run for Continue researching. Returns null for anything malformed. */
export function summariseSavedLiveRun(raw:string|null):SavedLiveRun|null{
 if(!raw||raw.length>2_000_000)return null;
 try{
  const x=JSON.parse(raw);
  if(!x||typeof x.question!=="string"||!Array.isArray(x.candidates))return null;
  const c=x.candidates as {polarity?:string;verification?:string}[];
  return {question:x.question.slice(0,500),candidates:c.length,supporting:c.filter(y=>y.polarity==="supporting"&&y.verification!=="not_run").length,opposing:c.filter(y=>y.polarity==="opposing"&&y.verification!=="not_run").length,checked:c.filter(y=>y.verification&&y.verification!=="not_run").length};
 }catch{return null}
}
