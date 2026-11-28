/**
 * The graph as a tree: the six HSI domains, then concept types, then concepts, then each concept's relationships.
 * A readable alternative to a force-directed network. It reorganises the published graph; it adds, ranks and
 * approves nothing. A concept that belongs to several domains appears under each of them, and the tree says so.
 */
import type {GraphAssertionView,GraphModel} from "./assertionView";
import {HSI_DOMAINS,domainsOf,type HsiDomain} from "./domainMap";

export type TreeFilters={query:string;domains:readonly HsiDomain[];humanOnly:boolean;hideNegated:boolean};
export const EMPTY_TREE_FILTERS:TreeFilters={query:"",domains:[],humanOnly:false,hideNegated:false};

export type TreeRelationship={
 id:string;otherId:string;otherName:string;
 /** Read from the concept's side: "Butyrate → reported effect on → Treg cells" or "← reported effect on ← Butyrate". */
 direction:"out"|"in";reportedAs:string;negated:boolean;
 species:string|null;pmid:string|null;doi:string|null;
 status:"candidate_unreviewed";
};
export type TreeConcept={id:string;name:string;kind:string;relationships:TreeRelationship[];
 /** How many of the six domains the concept sits in. Above one, it also appears elsewhere in the tree. */
 domainCount:number;matched:boolean};
export type TreeType={kind:string;label:string;concepts:TreeConcept[];relationships:number;
 /** True when the group comes from an unreviewed type proposal for concepts recorded only as "biological concept". */
 proposed:boolean};
export type TreeDomain={key:HsiDomain|"unassigned";label:string;types:TreeType[];concepts:number;relationships:number};
export type DomainTree={domains:TreeDomain[];totals:{concepts:number;relationships:number};filtered:boolean};

const isHuman=(a:GraphAssertionView)=>a.context.species.state==="stated"&&/human/i.test(a.context.species.value);
const norm=(s:string)=>s.toLowerCase().normalize("NFKD");
const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
const OTHER="biological concept";
const typeLabel=(kind:string)=>kind===OTHER?"Other concepts":kind.startsWith("proposed:")?cap(kind.slice(9).replaceAll("_"," ").replace(" or "," or ")):cap(kind);

/**
 * @param proposals concept id to proposed type, used only to group concepts recorded as "biological concept".
 *   Pass proposals only when they were made against this graph version.
 */
export function buildDomainTree(model:GraphModel,f:TreeFilters=EMPTY_TREE_FILTERS,proposals?:ReadonlyMap<string,string>):DomainTree{
 const q=norm(f.query.trim());
 const keep=model.assertions.filter(a=>(!f.humanOnly||isHuman(a))&&(!f.hideNegated||!a.negated));
 const names=(id:string)=>{const n=model.nodes.get(id);return n?[n.name,...n.aliases].map(norm):[norm(id)]};
 const hit=(id:string)=>q.length>0&&names(id).some(x=>x.includes(q));

 const byConcept=new Map<string,TreeRelationship[]>();
 for(const a of keep)for(const [me,other,direction] of [[a.subject,a.object,"out"],[a.object,a.subject,"in"]] as const){
  if(q&&!hit(me.id)&&!hit(other.id))continue;
  const list=byConcept.get(me.id)??byConcept.set(me.id,[]).get(me.id)!;
  list.push({id:a.id,otherId:other.id,otherName:other.name,direction,reportedAs:a.reportedAs,negated:a.negated,
   species:a.context.species.state==="stated"?a.context.species.value:null,pmid:a.evidence.pmid,doi:a.evidence.doi,status:"candidate_unreviewed"});
 }

 const buckets=new Map<string,Map<string,TreeConcept[]>>();
 const conceptIds=new Set<string>();
 for(const [id,rels] of byConcept){
  const n=model.nodes.get(id);if(!n)continue;
  const doms=domainsOf(n.domains,n.kind).domains;
  const shown:(HsiDomain|"unassigned")[]=doms.length?doms:["unassigned"];
  const inFilter=f.domains.length?shown.filter(d=>d!=="unassigned"&&f.domains.includes(d)):shown;
  if(!inFilter.length)continue;
  conceptIds.add(id);
  rels.sort((x,y)=>x.otherName.localeCompare(y.otherName));
  for(const d of inFilter){
   const types=buckets.get(d)??buckets.set(d,new Map()).get(d)!;
   const p=n.kind===OTHER?proposals?.get(id):undefined;
   const key=p&&p!=="unclassified"?`proposed:${p}`:n.kind;
   (types.get(key)??types.set(key,[]).get(key)!).push({id,name:n.name,kind:n.kind,relationships:rels,domainCount:doms.length,matched:hit(id)});
  }
 }

 const keys:(HsiDomain|"unassigned")[]=[...HSI_DOMAINS.map(d=>d.key),"unassigned"];
 const domains:TreeDomain[]=keys.flatMap(key=>{
  const types=[...(buckets.get(key)??new Map<string,TreeConcept[]>())].map(([kind,cs])=>({
   kind,label:typeLabel(kind),concepts:cs.sort((a,b)=>b.relationships.length-a.relationships.length||a.name.localeCompare(b.name)),
   relationships:new Set(cs.flatMap(c=>c.relationships.map(r=>r.id))).size,proposed:kind.startsWith("proposed:"),
  })).sort((a,b)=>(a.kind===OTHER?2:a.proposed?1:0)-(b.kind===OTHER?2:b.proposed?1:0)||b.concepts.length-a.concepts.length||a.label.localeCompare(b.label));
  if(key==="unassigned"&&!types.length)return [];
  return [{key,label:key==="unassigned"?"Not assigned to a domain":HSI_DOMAINS.find(d=>d.key===key)!.label,types,
   concepts:types.reduce((s,t)=>s+t.concepts.length,0),relationships:new Set(types.flatMap(t=>t.concepts.flatMap(c=>c.relationships.map(r=>r.id)))).size}];
 });
 const relIds=new Set([...byConcept].filter(([id])=>conceptIds.has(id)).flatMap(([,rs])=>rs.map(r=>r.id)));
 return {domains,totals:{concepts:conceptIds.size,relationships:relIds.size},filtered:!!q||f.domains.length>0||f.humanOnly||f.hideNegated};
}
