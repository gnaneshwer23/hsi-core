/**
 * Research program: what the profile resolves to in the published graph. Pure and testable.
 * Everything here is derived from the bundle (candidates, unreviewed). The demo layers in demoProgram.ts are labelled separately.
 */
import type {DomainBundle,DomainEdge} from "../../../src/knowledgeGraph/domainGraph";
import {buildGapRegister,type GapRegisterEntry} from "../../../src/knowledgeGraph/gapRegister";
import {recommend,searchEntities,EMPTY_PROFILE,type Profile} from "./researchHome";
import {departments} from "./departments";

export type Anchor={id:string;name:string;why:string};
export const DEMO_PROFILE:Profile={...EMPTY_PROFILE,role:"Research scientist",stage:"Established researcher",question:"Which cytokine signals recur across autoimmune conditions, and in which tissues?",goals:["Investigate disease biology","Monitor emerging research"],interests:["immunology","IL-21","Systemic sclerosis"],cadence:"weekly",onboarded:true};

/** Anchors are concepts you follow plus the best graph match for each free-text topic. A broad area alone falls back to its best-connected concept. */
export function anchorsFor(p:Profile,b:DomainBundle|null):Anchor[]{
 if(!b)return [];
 const out:Anchor[]=[],seen=new Set<string>();
 const add=(id:string,name:string,why:string)=>{if(!seen.has(id)&&out.length<5){seen.add(id);out.push({id,name,why})}};
 for(const f of p.followed)if(b.nodes.some(n=>n.id===f.id))add(f.id,f.name,"You follow it");
 for(const i of p.interests){
  if(departments.some(d=>d.slug===i))continue;
  const h=searchEntities(b.nodes,i,1)[0];
  if(h)add(h.id,h.name,`Matches your topic “${i}”`);
 }
 if(!out.length){const r=recommend(p,b,1)[0];if(r)add(r.id,r.name,r.reason)}
 return out;
}
/** Concepts the researcher named in free text (background, question). Exact name or alias matches only, longest phrase first. */
export function detectTopics(nodes:DomainBundle["nodes"],text:string,limit=6):{id:string;name:string}[]{
 const words=text.split(/[^A-Za-z0-9\-\/]+/).filter(Boolean),out:{id:string;name:string}[]=[],seen=new Set<string>(),done=new Set<string>();
 for(let i=0;i<words.length;i++)for(const n of [4,3,2,1]){
  const t=words.slice(i,i+n).join(" ");if(t.length<3||done.has(t.toLowerCase()))continue;done.add(t.toLowerCase());
  const h=searchEntities(nodes,t,1)[0];
  if(h&&h.score===100&&!seen.has(h.id)){seen.add(h.id);out.push({id:h.id,name:h.name})}
 }
 return out.slice(0,limit);
}
const cands=(b:DomainBundle)=>b.edges.filter(e=>e.kind==="source_candidate");
/** Concepts and edges within `depth` hops of the anchors. hop 0 = anchors. */
export function expand(b:DomainBundle,ids:readonly string[],depth:1|2|3){
 const hop=new Map<string,number>(ids.map(i=>[i,0])),all=cands(b);
 for(let d=1;d<=depth;d++){
  const frontier=[...hop].filter(([,h])=>h===d-1).map(([i])=>i);
  for(const e of all)for(const f of frontier){
   const other=e.subjectId===f?e.objectId:e.objectId===f?e.subjectId:null;
   if(other&&!hop.has(other))hop.set(other,d);
  }
 }
 const edges=all.filter(e=>hop.has(e.subjectId)&&hop.has(e.objectId));
 return {hop,edges};
}
export type ProgramView={anchors:Anchor[];hop:Map<string,number>;edges:DomainEdge[];counts:number[];gaps:GapRegisterEntry[];methods:{model:string;design:string;count:number}[];human:number;opposing:DomainEdge[]};
export function programView(p:Profile,b:DomainBundle,depth:1|2|3):ProgramView{
 const anchors=anchorsFor(p,b),{hop,edges}=expand(b,anchors.map(a=>a.id),depth);
 const counts=[0,0,0,0];for(const h of hop.values())counts[h]!++;
 const gaps=buildGapRegister(b).filter(g=>hop.has(g.subject.id)||hop.has(g.object.id));
 const m=new Map<string,{model:string;design:string;count:number}>();
 for(const e of edges){const k=e.model+"|"+e.design;const r=m.get(k)??{model:e.model.replaceAll("_"," "),design:e.design,count:0};r.count++;m.set(k,r)}
 const human=edges.filter(e=>/^human/.test(e.model)).length;
 return {anchors,hop,edges,counts,gaps,methods:[...m.values()].sort((a,c)=>c.count-a.count).slice(0,6),human,opposing:edges.filter(e=>e.negated)};
}
/** A small network for the existing NetworkView: anchors in the centre, the best-connected neighbours around them. */
export function programNetwork(b:DomainBundle,v:ProgramView,max=12){
 const name=new Map(b.nodes.map(n=>[n.id,n.name])),deg=new Map<string,number>();
 for(const e of v.edges){deg.set(e.subjectId,(deg.get(e.subjectId)??0)+1);deg.set(e.objectId,(deg.get(e.objectId)??0)+1)}
 const centre=v.anchors[0]?.id;if(!centre)return null;
 const keep=new Set<string>(v.anchors.map(a=>a.id));
 [...v.hop.keys()].filter(i=>!keep.has(i)).sort((a,c)=>(v.hop.get(a)!-v.hop.get(c)!)||((deg.get(c)??0)-(deg.get(a)??0))).forEach(i=>{if(keep.size<max)keep.add(i)});
 const edges=v.edges.filter(e=>keep.has(e.subjectId)&&keep.has(e.objectId)).slice(0,24).map(e=>({id:e.id,s:e.subjectId,o:e.objectId,predicate:e.predicate.replaceAll("_"," "),negated:e.negated}));
 return {center:centre,nodes:[...keep].map(id=>({id,name:name.get(id)??id})),edges};
}
/** Shortest path (up to 3 hops) between two concepts through candidate relationships. */
export function pathBetween(b:DomainBundle,a:string,z:string):DomainEdge[]|null{
 if(a===z)return [];
 const all=cands(b),prev=new Map<string,{from:string;e:DomainEdge}>();let frontier=[a];
 for(let d=0;d<3;d++){
  const next:string[]=[];
  for(const f of frontier)for(const e of all){
   const o=e.subjectId===f?e.objectId:e.objectId===f?e.subjectId:null;
   if(o&&o!==a&&!prev.has(o)){prev.set(o,{from:f,e});next.push(o)}
  }
  if(prev.has(z))break;frontier=next;
 }
 if(!prev.has(z))return null;
 const path:DomainEdge[]=[];for(let c=z;c!==a;){const s=prev.get(c)!;path.unshift(s.e);c=s.from}
 return path;
}
export type Reply={text:string;lines:string[];links:{to:string;label:string}[]};
/** Deterministic, citation-bearing answer assembled from the published graph. No language model. */
export function answerFromGraph(b:DomainBundle,q:string):Reply{
 const name=new Map(b.nodes.map(n=>[n.id,n.name]));
 const words=q.split(/[^A-Za-z0-9\-]+/).filter(w=>w.length>1),phr=new Set<string>();
 const hits=new Map<string,string>();
 const tryTerm=(t:string)=>{const h=searchEntities(b.nodes,t,1)[0];if(h&&h.score>=80&&!hits.has(h.id))hits.set(h.id,h.name)};
 for(let i=0;i<words.length;i++){for(const n of [3,2,1]){const t=words.slice(i,i+n).join(" ");if(t.length>2&&!phr.has(t)){phr.add(t);tryTerm(t)}}}
 const ids=[...hits.keys()].slice(0,3);
 if(!ids.length)return {text:"No concept in the published graph matches that. Nothing is invented: try a gene, cell type or disease name, or widen the program depth.",lines:[],links:[{to:"/research/knowledge-graph",label:"Browse the graph"}]};
 const src=(e:DomainEdge)=>`${name.get(e.subjectId)} ${e.predicate.replaceAll("_"," ")}${e.negated?" (reported not to)":""} ${name.get(e.objectId)} · ${e.model.replaceAll("_"," ")} · ${e.sourceId??"no source"} · unreviewed`;
 if(ids.length>=2){
  const p=pathBetween(b,ids[0]!,ids[1]!);
  if(p&&p.length)return {text:`${hits.get(ids[0]!)} and ${hits.get(ids[1]!)} are connected through ${p.length} recorded relationship${p.length===1?"":"s"}. Each is a candidate, not an established finding.`,lines:p.map(src),links:[{to:"/research/knowledge-graph?netQuery="+encodeURIComponent(hits.get(ids[0]!)!),label:"Open in the graph"}]};
  return {text:`No chain of up to three recorded relationships connects ${hits.get(ids[0]!)} and ${hits.get(ids[1]!)} in the published graph. That is a coverage limit, not evidence they are unrelated.`,lines:[],links:[{to:"/research/dashboard?q="+encodeURIComponent(`What does the evidence say about the relationship between ${hits.get(ids[0]!)} and ${hits.get(ids[1]!)}?`)+"#dashboard-workspace",label:"Investigate with live sources"}]};
 }
 const id=ids[0]!,near=cands(b).filter(e=>e.subjectId===id||e.objectId===id);
 return {text:near.length?`${hits.get(id)} has ${near.length} recorded relationship${near.length===1?"":"s"} in the published graph. Showing the first ${Math.min(5,near.length)}.`:`${hits.get(id)} is in the graph but has no recorded relationships yet.`,lines:near.slice(0,5).map(src),links:[{to:"/research/knowledge-graph?netQuery="+encodeURIComponent(hits.get(id)!),label:"Open in the graph"}]};
}
