import type {EvidenceContext,ScientificEdge,TypedGraph} from "./typedGraphSchema";
export type ConflictType="opposing_effect"|"context_divergence"|"evidence_disagreement";
export type ConflictCandidate={id:string;type:ConflictType;edgeA:ScientificEdge;edgeB:ScientificEdge;contextDifferences:string[];sharedContext:string[];requiresReview:true;explanation:string};
const OPPOSITES=new Set(["ACTIVATES:INHIBITS","INHIBITS:ACTIVATES"]);
const CONTEXT_FIELDS=["tissue","cellState","disease","diseaseStage","species","assay","experimentalSetting","population"] as const;
function compareContext(a:EvidenceContext,b:EvidenceContext){
 const different:string[]=[],shared:string[]=[];
 for(const key of CONTEXT_FIELDS){if(a[key]&&b[key]){if(a[key]===b[key])shared.push(key+": "+a[key]);else different.push(key+": "+a[key]+" vs "+b[key])}}
 return {different,shared};
}
/** Flags candidate tensions only. Different contexts do not establish a scientific contradiction. */
export function detectConflictCandidates(graph:TypedGraph,includeDraft=false):ConflictCandidate[]{
 const edges=graph.edges.filter(e=>includeDraft||e.reviewStatus==="approved");
 const candidates:ConflictCandidate[]=[];
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const a=edges[i]!,b=edges[j]!;
  if(a.subjectId!==b.subjectId||a.objectId!==b.objectId||a.id===b.id)continue;
  if(a.predicate==="RELATED_TOPIC"||b.predicate==="RELATED_TOPIC")continue;
  const context=compareContext(a.context,b.context);
  const opposing=OPPOSITES.has(a.predicate+":"+b.predicate);
  const disagreement=a.evidenceStatus==="contested"||b.evidenceStatus==="contested";
  const divergent=context.different.length>0&&a.predicate===b.predicate;
  if(!opposing&&!disagreement&&!divergent)continue;
  const type:ConflictType=opposing?"opposing_effect":disagreement?"evidence_disagreement":"context_divergence";
  candidates.push({id:[a.id,b.id].sort().join("::"),type,edgeA:a,edgeB:b,contextDifferences:context.different,sharedContext:context.shared,requiresReview:true,explanation:type==="opposing_effect"?"Opposite directional predicates are reported for the same entities. Examine evidence and context before interpreting.":type==="context_divergence"?"Same relationship reported under different contexts; this may reflect biological specificity, not contradiction.":"At least one relationship has contested evidence. Independent assessment is required."});
 }
 return candidates;
}
export function conflictSummary(graph:TypedGraph,includeDraft=false){
 const candidates=detectConflictCandidates(graph,includeDraft);
 return {candidates,opposing:candidates.filter(c=>c.type==="opposing_effect").length,contextual:candidates.filter(c=>c.type==="context_divergence").length,disputed:candidates.filter(c=>c.type==="evidence_disagreement").length};
}
