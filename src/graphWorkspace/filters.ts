/** LEA-04B: filters and facets over assertion views. A filter narrows the view; it never rewrites or hides a status. */
import {RECORDABLE,type GraphAssertionView} from "./assertionView";
import type {HsiDomain} from "./domainMap";

export type Filters={
 query:string;domains:HsiDomain[];kinds:string[];predicates:string[];species:string[];models:string[];
 /** Minimum number of recordable context fields stated (0 to 8). */
 minContext:number;negated:"any"|"only"|"exclude";
};
export const EMPTY_FILTERS:Filters={query:"",domains:[],kinds:[],predicates:[],species:[],models:[],minContext:0,negated:"any"};
export const NOT_STATED_LABEL="Not stated";

const speciesOf=(a:GraphAssertionView)=>a.context.species.state==="stated"?a.context.species.value:NOT_STATED_LABEL;
const modelOf=(a:GraphAssertionView)=>a.context.modelSystem.state==="stated"?a.context.modelSystem.value:NOT_STATED_LABEL;
const norm=(s:string)=>s.normalize("NFKD").toLowerCase();

export function matches(a:GraphAssertionView,f:Filters):boolean{
 if(f.query.trim()){
  const q=norm(f.query.trim()),hay=norm(`${a.subject.name} ${a.object.name} ${a.reportedAs}`);
  if(!hay.includes(q))return false;
 }
 if(f.domains.length&&!f.domains.some(d=>a.domains.includes(d)))return false;
 if(f.kinds.length&&!f.kinds.includes(a.subject.kind)&&!f.kinds.includes(a.object.kind))return false;
 if(f.predicates.length&&!f.predicates.includes(a.predicate))return false;
 if(f.species.length&&!f.species.includes(speciesOf(a)))return false;
 if(f.models.length&&!f.models.includes(modelOf(a)))return false;
 if(a.contextCompleteness.stated<f.minContext)return false;
 if(f.negated==="only"&&!a.negated)return false;
 if(f.negated==="exclude"&&a.negated)return false;
 return true;
}
export const applyFilters=(xs:readonly GraphAssertionView[],f:Filters)=>xs.filter(a=>matches(a,f));
export const isFiltered=(f:Filters)=>JSON.stringify(f)!==JSON.stringify(EMPTY_FILTERS);

export type Facet=readonly {value:string;count:number}[];
const tally=(xs:Iterable<string>):Facet=>{const m=new Map<string,number>();for(const x of xs)m.set(x,(m.get(x)??0)+1);return [...m].map(([value,count])=>({value,count})).sort((a,b)=>b.count-a.count||a.value.localeCompare(b.value))};
export type Facets={domains:Facet;kinds:Facet;predicates:Facet;species:Facet;models:Facet;negated:Facet};
/** Facets are counted over the given assertions, with "Not stated" a value in its own right. */
export function facets(xs:readonly GraphAssertionView[]):Facets{
 return {
  domains:tally(xs.flatMap(a=>a.domains)),
  kinds:tally(xs.flatMap(a=>[...new Set([a.subject.kind,a.object.kind])])),
  predicates:tally(xs.map(a=>a.predicate)),
  species:tally(xs.map(speciesOf)),
  models:tally(xs.map(modelOf)),
  negated:tally(xs.map(a=>a.negated?"Recorded as not holding":"Reported")),
 };
}
export const MAX_CONTEXT=RECORDABLE.length;
