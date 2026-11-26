/**
 * LEA-04B: bounded views of the graph. The client never needs the whole graph: a view is a slice, optionally expanded
 * by a bounded number of hops. Expansion is a client-side stand-in for the bounded-neighbourhood endpoint that does not
 * exist yet (LEA-04K).
 */
import type {GraphAssertionView,GraphModel} from "./assertionView";
import {coverageLevel,type CoverageLevel,type HsiDomain} from "./domainMap";

export type Slice={
 assertions:readonly GraphAssertionView[];
 nodeIds:ReadonlySet<string>;sourceIds:ReadonlySet<string>;
 gapIds:readonly string[];questionIds:readonly string[];
};

const nodeHas=(m:GraphModel,id:string,d:HsiDomain)=>m.nodeDomains.get(id)?.domains.includes(d)??false;

/** Relationships that connect the two domains: one end in each, or the relationship itself tagged with both. */
export function crossDomainSlice(m:GraphModel,a:HsiDomain,b:HsiDomain):Slice{
 const picked=m.assertions.filter(x=>{
  const s=x.subject.id,o=x.object.id;
  return (nodeHas(m,s,a)&&nodeHas(m,o,b))||(nodeHas(m,s,b)&&nodeHas(m,o,a))||(x.domains.includes(a)&&x.domains.includes(b));
 });
 return finishSlice(m,picked);
}

export function finishSlice(m:GraphModel,assertions:readonly GraphAssertionView[]):Slice{
 const nodeIds=new Set(assertions.flatMap(x=>[x.subject.id,x.object.id]));
 const sourceIds=new Set(assertions.map(x=>x.evidence.sourceId).filter((x):x is string=>!!x));
 const gapIds=m.gaps.filter(g=>nodeIds.has(g.subjectId)||nodeIds.has(g.objectId)).map(g=>g.id);
 const questionIds=m.questions.filter(q=>nodeIds.has(q.fromId)||nodeIds.has(q.toId)).map(q=>q.id);
 return {assertions,nodeIds,sourceIds,gapIds,questionIds};
}

export type Expansion={assertions:readonly GraphAssertionView[];added:number;truncated:boolean};
/** Add the relationships within `depth` hops of the given concepts, never exceeding `maxAssertions`. */
export function expand(m:GraphModel,seed:ReadonlySet<string>,depth:number,maxAssertions:number,base:readonly GraphAssertionView[]=[]):Expansion{
 const have=new Map(base.map(a=>[a.id,a]));
 let frontier=new Set(seed),truncated=false;
 for(let d=0;d<Math.max(0,Math.min(depth,4));d++){
  const next=new Set<string>();
  for(const a of m.assertions){
   if(have.has(a.id))continue;
   const s=frontier.has(a.subject.id),o=frontier.has(a.object.id);
   if(!s&&!o)continue;
   if(have.size>=maxAssertions){truncated=true;continue}
   have.set(a.id,a);next.add(s?a.object.id:a.subject.id);
  }
  frontier=next;if(!frontier.size)break;
 }
 return {assertions:[...have.values()],added:have.size-base.length,truncated};
}

export type DomainCoverageRow={domain:HsiDomain;concepts:number;relationships:number;level:CoverageLevel};
/** Counts from the data. A domain with none is reported as none. */
export function domainCoverage(m:GraphModel,domains:readonly HsiDomain[]):DomainCoverageRow[]{
 return domains.map(d=>{
  const concepts=[...m.nodeDomains.values()].filter(v=>v.domains.includes(d)).length;
  const relationships=m.assertions.filter(a=>a.domains.includes(d)||nodeHas(m,a.subject.id,d)||nodeHas(m,a.object.id,d)).length;
  return {domain:d,concepts,relationships,level:coverageLevel(relationships)};
 });
}
export function unmappedTags(m:GraphModel):{tag:string;concepts:number}[]{
 const c=new Map<string,number>();
 for(const v of m.nodeDomains.values())for(const t of v.unmappedTags)c.set(t,(c.get(t)??0)+1);
 return [...c].map(([tag,concepts])=>({tag,concepts})).sort((a,b)=>b.concepts-a.concepts);
}
