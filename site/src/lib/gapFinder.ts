/** Gap finder logic. Two separate sources are never blended: gaps RECORDED in the published graph, and a co-mention heuristic from literature counts. */
import type {DomainBundle,DomainNode} from "../../../src/knowledgeGraph/domainGraph";
import type {CooccurrenceResult} from "../../../src/investigation/cooccurrence";
import {searchEntities} from "./researchHome";

export const MIN_VOLUME=150,UNDER_RATIO=0.03;
export type RecordedGap={id:string;question:string;missing:string;nextStudy:string;subject:string;object:string;touches:string};
/** Gaps recorded in the published graph that touch a concept matching one of the researcher's topics. */
export function recordedGapsFor(bundle:DomainBundle,topics:readonly string[],limit=6):RecordedGap[]{
 const name=new Map(bundle.nodes.map(n=>[n.id,n.name])),matched=new Map<string,string>();
 for(const t of topics)for(const h of searchEntities(bundle.nodes,t,3))if(h.score>=60)matched.set(h.id,t);
 const out:RecordedGap[]=[];
 for(const g of bundle.gaps){
  const hit=matched.has(g.subjectId)?g.subjectId:matched.has(g.objectId)?g.objectId:null;
  if(hit)out.push({id:g.id,question:g.question,missing:g.missing,nextStudy:g.nextStudy,subject:name.get(g.subjectId)??g.subjectId,object:name.get(g.objectId)??g.objectId,touches:matched.get(hit)!});
 }
 return out.slice(0,limit);
}
/** Short, query-safe names (no brackets or quotes) of concepts recorded as connected to the topic, most connected first. */
export function neighbourTerms(bundle:DomainBundle,topic:string,max=4):string[]{
 const hit=searchEntities(bundle.nodes,topic,1)[0];if(!hit||hit.score<60)return [];
 const byId=new Map(bundle.nodes.map(n=>[n.id,n]));const deg=new Map<string,number>(),nb=new Set<string>();
 for(const e of bundle.edges){if(e.kind!=="source_candidate")continue;deg.set(e.subjectId,(deg.get(e.subjectId)??0)+1);deg.set(e.objectId,(deg.get(e.objectId)??0)+1);if(e.subjectId===hit.id)nb.add(e.objectId);if(e.objectId===hit.id)nb.add(e.subjectId)}
 const out:string[]=[],lc=new Set([topic.toLowerCase(),hit.name.toLowerCase()]);
 for(const n of [...nb].map(i=>byId.get(i)).filter((x):x is DomainNode=>!!x).sort((a,b)=>(deg.get(b.id)??0)-(deg.get(a.id)??0))){
  if(n.name.includes("/"))continue; // compound concept names are not usable as one search phrase
  const t=n.name.replace(/\s*\([^)]*\)/g,"").replace(/[^\p{L}\p{N}\s\-+/.]/gu," ").replace(/\s+/g," ").trim();
  if(t.length<3||t.length>50||lc.has(t.toLowerCase()))continue;lc.add(t.toLowerCase());out.push(t);if(out.length>=max)break;
 }
 return out;
}
/** Terms and index pairs to count: each topic against its graph neighbours, and the topics against each other. At most 8 terms and 12 pairs. */
export function planCounts(bundle:DomainBundle|null,topics:readonly string[]):{terms:string[];pairs:[number,number][]}{
 const terms:string[]=[],idx=(t:string)=>{const k=terms.findIndex(x=>x.toLowerCase()===t.toLowerCase());if(k>=0)return k;if(terms.length>=8)return -1;terms.push(t);return terms.length-1};
 const pairs:[number,number][]=[],add=(a:number,b:number)=>{if(a<0||b<0||a===b||pairs.length>=12)return;if(!pairs.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a)))pairs.push([a,b])};
 const ts=topics.filter(t=>t.length>=2&&t.length<=60&&!/["\\()\[\]{}:]/.test(t)).slice(0,3);
 const ti=ts.map(idx);
 for(let i=0;i<ti.length;i++)for(let j=i+1;j<ti.length;j++)add(ti[i]!,ti[j]!);
 if(bundle)for(const [k,t] of ts.entries())for(const n of neighbourTerms(bundle,t,k===0?4:2))add(ti[k]!,idx(n));
 return {terms,pairs};
}
export type Signal="under_explored"|"well_covered"|"low_volume"|"unavailable";
export type GapRow={a:string;b:string;countA:number|null;countB:number|null;joint:number|null;share:number|null;signal:Signal;queryUrl:string;error:string|null};
/** share = joint / the smaller single count. Under-explored needs real volume on both sides and a small share. A heuristic, not a finding. */
export function classify(r:CooccurrenceResult):GapRow[]{
 const c=new Map(r.terms.map(t=>[t.term,t]));
 return r.pairs.map(p=>{
  const A=c.get(p.a),B=c.get(p.b),ca=A?.count??null,cb=B?.count??null;
  if(p.joint===null||ca===null||cb===null)return {a:p.a,b:p.b,countA:ca,countB:cb,joint:p.joint,share:null,signal:"unavailable" as const,queryUrl:p.queryUrl,error:p.error??A?.error??B?.error??"Count unavailable"};
  const min=Math.min(ca,cb),share=min>0?p.joint/min:null;
  const signal:Signal=min<MIN_VOLUME?"low_volume":share!==null&&share<UNDER_RATIO?"under_explored":"well_covered";
  return {a:p.a,b:p.b,countA:ca,countB:cb,joint:p.joint,share,signal,queryUrl:p.queryUrl,error:null};
 }).sort((x,y)=>(x.signal==="under_explored"?0:x.signal==="well_covered"?1:x.signal==="low_volume"?2:3)-(y.signal==="under_explored"?0:y.signal==="well_covered"?1:y.signal==="low_volume"?2:3)||(x.share??9)-(y.share??9));
}
