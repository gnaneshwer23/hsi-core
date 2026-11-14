/**
 * Six scientific departments as PROJECTIONS of one canonical graph, never separate graphs. A concept belongs to every
 * department whose tags it carries, so one entity keeps all its contextual associations. Everything here is read-only and
 * deterministic, and it states what the graph does NOT cover: a department with no tagged concepts reports no coverage
 * rather than being filled in. Traversal results are candidate paths: every hop keeps its evidence status and context, a
 * hop whose evidence stops is marked, and no path ever permits a causal conclusion.
 */
import type {DomainBundle,DomainEdge,DomainNode} from "./domainGraph";

export const DEPARTMENT_SLUGS=["immunology","neuroscience","microbiome","metabolism","genomics-multi-omics","human-physiology"] as const;
export type DepartmentSlug=(typeof DEPARTMENT_SLUGS)[number];
/** Which graph domain tags place a concept in a department. Empty = no concept in the public graph is tagged there yet. */
export const DEPARTMENT_TAGS:Readonly<Record<DepartmentSlug,readonly string[]>>=Object.freeze({
 immunology:["immune","autoimmune","neuroimmune"],
 neuroscience:["brain","neuro","neuroimmune","gut_brain"],
 microbiome:["gut","gut_brain"],
 metabolism:["metabolic","liver"],
 "genomics-multi-omics":[],
 "human-physiology":[],
});
export const isDepartmentSlug=(v:unknown):v is DepartmentSlug=>typeof v==="string"&&(DEPARTMENT_SLUGS as readonly string[]).includes(v);
const assertSlug=(slug:unknown):DepartmentSlug=>{if(!isDepartmentSlug(slug))throw Error("Unknown department");return slug};

export function departmentsOfNode(node:Pick<DomainNode,"domains">):DepartmentSlug[]{
 return DEPARTMENT_SLUGS.filter(s=>DEPARTMENT_TAGS[s].some(t=>node.domains.includes(t)));
}
const membership=(g:Pick<DomainBundle,"nodes">)=>new Map(g.nodes.map(n=>[n.id,departmentsOfNode(n)]));

export type DepartmentProjection={
 department:DepartmentSlug;status:"candidate_coverage"|"no_graph_coverage";note:string;
 nodes:DomainNode[];edges:DomainEdge[];
 /** Edges with one end in this department and the other end in a different department. */
 crossDepartmentEdges:{edgeId:string;otherDepartments:DepartmentSlug[]}[];
 counts:{concepts:number;candidateEdges:number;gapEdges:number;sharedConcepts:number};
 graphVersion:string;
};
export function projectDepartment(g:DomainBundle,slug:string):DepartmentProjection{
 const d=assertSlug(slug),mem=membership(g);
 const nodes=g.nodes.filter(n=>mem.get(n.id)!.includes(d));
 const ids=new Set(nodes.map(n=>n.id));
 const edges=g.edges.filter(e=>ids.has(e.subjectId)||ids.has(e.objectId));
 const cross:DepartmentProjection["crossDepartmentEdges"]=[];
 for(const e of edges){
  const a=mem.get(e.subjectId)??[],b=mem.get(e.objectId)??[];
  const other=[...new Set([...a,...b])].filter(x=>x!==d);
  // A cross-department edge needs one end inside this department and an end that belongs to another department.
  const inside=a.includes(d)||b.includes(d),touchesOther=(a.includes(d)?b:a).some(x=>x!==d);
  if(inside&&touchesOther&&other.length)cross.push({edgeId:e.id,otherDepartments:other});
 }
 return {department:d,status:nodes.length?"candidate_coverage":"no_graph_coverage",
  note:nodes.length?"Candidate concepts only: unreviewed, not validated knowledge.":"No concept in the public research graph is tagged to this department yet. Nothing is shown rather than inferred.",
  nodes,edges,crossDepartmentEdges:cross,
  counts:{concepts:nodes.length,candidateEdges:edges.filter(e=>e.kind==="source_candidate").length,gapEdges:edges.filter(e=>e.kind==="research_gap").length,sharedConcepts:nodes.filter(n=>mem.get(n.id)!.length>1).length},
  graphVersion:g.version};
}

export type CoverageReport={graphVersion:string;departments:{department:DepartmentSlug;concepts:number;status:DepartmentProjection["status"]}[];conceptsInSeveralDepartments:number;conceptsInNoDepartment:number;unmappedTags:string[]};
export function departmentCoverage(g:DomainBundle):CoverageReport{
 const mem=membership(g),mapped=new Set(DEPARTMENT_SLUGS.flatMap(s=>DEPARTMENT_TAGS[s]));
 return {graphVersion:g.version,
  departments:DEPARTMENT_SLUGS.map(d=>{const c=g.nodes.filter(n=>mem.get(n.id)!.includes(d)).length;return {department:d,concepts:c,status:c?"candidate_coverage":"no_graph_coverage"}}),
  conceptsInSeveralDepartments:g.nodes.filter(n=>mem.get(n.id)!.length>1).length,
  conceptsInNoDepartment:g.nodes.filter(n=>!mem.get(n.id)!.length).length,
  unmappedTags:[...new Set(g.nodes.flatMap(n=>n.domains))].filter(t=>!mapped.has(t)).sort()};
}

export type PathHop={edgeId:string;fromId:string;toId:string;direction:"forward"|"reverse";predicate:string;evidence:"source_candidate"|"research_gap";sourceId:string|null;model:string;tissue:string|null;conditions:string[];negated:boolean;claimAllowed:false;evidenceStops:boolean};
export type CrossDepartmentPath={
 nodeIds:string[];hops:PathHop[];departmentsTraversed:DepartmentSlug[];
 evidenceChain:"candidate_only"|"contains_gap";
 /** Hop numbers (1-based) where evidence stops: an unresolved gap, a missing source, or a negative finding. */
 boundaries:number[];warnings:string[];causalConclusionAllowed:false;
 reconstruct:{graphVersion:string;nodeIds:string[];edgeIds:string[]};
};
export type CrossDepartmentResult={from:string;toDepartment:DepartmentSlug;paths:CrossDepartmentPath[];truncated:boolean;status:"paths_found"|"no_path_within_bound"|"target_has_no_graph_coverage";graphVersion:string};
export const TRAVERSAL_LIMITS=Object.freeze({maxHops:6,maxPaths:20,maxExpansions:5000});

export function crossDepartmentPaths(g:DomainBundle,fromId:string,toDepartment:string,options:{maxHops?:number;maxPaths?:number}={}):CrossDepartmentResult{
 const to=assertSlug(toDepartment),maxHops=options.maxHops??4,maxPaths=options.maxPaths??10;
 if(!Number.isInteger(maxHops)||maxHops<1||maxHops>TRAVERSAL_LIMITS.maxHops||!Number.isInteger(maxPaths)||maxPaths<1||maxPaths>TRAVERSAL_LIMITS.maxPaths)throw Error("Invalid traversal bound");
 if(!g.nodes.some(n=>n.id===fromId))throw Error("Unknown entity");
 const mem=membership(g),targetIds=new Set(g.nodes.filter(n=>mem.get(n.id)!.includes(to)).map(n=>n.id));
 const base={from:fromId,toDepartment:to,graphVersion:g.version};
 if(!targetIds.size)return {...base,paths:[],truncated:false,status:"target_has_no_graph_coverage"};
 // 'studied_in' links a finding to a study condition, not to a biological mechanism, so it is not traversed.
 const edges=g.edges.filter(e=>e.predicate!=="studied_in").sort((a,b)=>a.id.localeCompare(b.id));
 const adj=new Map<string,{e:DomainEdge;other:string;dir:"forward"|"reverse"}[]>();
 for(const e of edges){
  (adj.get(e.subjectId)??adj.set(e.subjectId,[]).get(e.subjectId)!).push({e,other:e.objectId,dir:"forward"});
  (adj.get(e.objectId)??adj.set(e.objectId,[]).get(e.objectId)!).push({e,other:e.subjectId,dir:"reverse"});
 }
 const out:CrossDepartmentPath[]=[];let expansions=0,truncated=false;
 const queue:{nodeIds:string[];hops:PathHop[]}[]=[{nodeIds:[fromId],hops:[]}];
 while(queue.length){
  if(expansions++>=TRAVERSAL_LIMITS.maxExpansions){truncated=true;break}
  const p=queue.shift()!,last=p.nodeIds.at(-1)!;
  for(const {e,other,dir} of adj.get(last)??[]){
   if(p.nodeIds.includes(other)||p.hops.some(h=>h.edgeId===e.id))continue;
   const hop:PathHop={edgeId:e.id,fromId:last,toId:other,direction:dir,predicate:e.predicate,evidence:e.kind,sourceId:e.sourceId,model:e.model,tissue:e.tissue,conditions:e.conditions,negated:e.negated,claimAllowed:false,
    evidenceStops:e.kind==="research_gap"||!e.sourceId||e.negated};
   const next={nodeIds:[...p.nodeIds,other],hops:[...p.hops,hop]};
   if(targetIds.has(other)){
    if(out.length>=maxPaths){truncated=true;continue}
    out.push(finish(g,next,mem));
   }else if(next.hops.length<maxHops&&queue.length<TRAVERSAL_LIMITS.maxExpansions)queue.push(next);
  }
 }
 const ranked=out.sort((a,b)=>a.boundaries.length-b.boundaries.length||a.hops.length-b.hops.length||a.reconstruct.edgeIds.join().localeCompare(b.reconstruct.edgeIds.join()));
 return {...base,paths:ranked,truncated,status:ranked.length?"paths_found":"no_path_within_bound"};
}
function finish(g:DomainBundle,p:{nodeIds:string[];hops:PathHop[]},mem:Map<string,DepartmentSlug[]>):CrossDepartmentPath{
 const boundaries=p.hops.flatMap((h,i)=>h.evidenceStops?[i+1]:[]);
 const warnings=["Candidate path: an association chain, not an established causal mechanism."];
 if(p.hops.some(h=>h.evidence==="research_gap"))warnings.push("Includes an unresolved research gap: the graph records a question here, not evidence.");
 if(p.hops.some(h=>h.negated))warnings.push("Includes a negative finding; it does not support a positive mechanism.");
 if(new Set(p.hops.map(h=>h.model)).size>1)warnings.push("Model or species changes across hops.");
 if(p.hops.some(h=>["mouse","rodent","mixed"].includes(h.model)))warnings.push("Includes animal or mixed-model evidence; no human conclusion follows.");
 return {nodeIds:p.nodeIds,hops:p.hops,departmentsTraversed:[...new Set(p.nodeIds.flatMap(id=>mem.get(id)??[]))],
  evidenceChain:p.hops.some(h=>h.evidence==="research_gap")?"contains_gap":"candidate_only",boundaries,warnings,causalConclusionAllowed:false,
  reconstruct:{graphVersion:g.version,nodeIds:p.nodeIds,edgeIds:p.hops.map(h=>h.edgeId)}};
}

/** Re-derives a path from the graph by its recorded ids. Returns false if any id or link no longer matches. */
export function verifyPathReconstruction(g:DomainBundle,path:CrossDepartmentPath):boolean{
 if(path.reconstruct.graphVersion!==g.version||path.reconstruct.edgeIds.length!==path.hops.length||path.reconstruct.nodeIds.length!==path.hops.length+1)return false;
 return path.hops.every((h,i)=>{
  const e=g.edges.find(x=>x.id===h.edgeId);
  if(!e||path.reconstruct.nodeIds[i]!==h.fromId||path.reconstruct.nodeIds[i+1]!==h.toId)return false;
  const ends=h.direction==="forward"?[e.subjectId,e.objectId]:[e.objectId,e.subjectId];
  return ends[0]===h.fromId&&ends[1]===h.toId&&e.predicate===h.predicate&&e.kind===h.evidence;
 });
}
