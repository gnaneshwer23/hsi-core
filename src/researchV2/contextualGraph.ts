/**
 * B-04.3 public-source, in-memory candidate graph.
 * Metadata is NOT mechanistic evidence, review, causality, or trusted graph content.
 * This module deliberately has no database or network side effects.
 */
import type { PublicSourceRecord } from "./sourceAdapters";
import type { ContextualRelationshipV2 } from "./universalInvestigation";
import { assertRelationshipV2 } from "./universalInvestigation";

export type ScientificNodeKind = "disease"|"target"|"publication"|"tissue"|"cell"|"pathway"|"therapeutic_target";
export interface ScientificNode { id:string; kind:ScientificNodeKind; label:string; sourceRefs:string[]; status:"candidate"; }
export interface CandidateGraph {
 schemaVersion:"hsi-contextual-candidate-graph-1";
 nodes:ScientificNode[];
 edges:ContextualRelationshipV2[];
 sources:PublicSourceRecord[];
 containsPhi:false; clinicalAdvice:false; graphPromotable:false; scientificApproval:false;
}
export interface CuratedContextInput {
 /** Only attach these when explicitly supported by a separately checked source; never infer them from disease-target association scores. */
 sourceId:string;
 diseaseIds:string[];
 tissueId:string|null; cellId:string|null; pathwayId:string|null;
 species:string|null; method:string|null; cohortId:string|null; timepoint:string|null;
 /** Documented assertion extracted and checked by a researcher; not a trusted approval. */
 relationship:{subjectId:string;objectId:string;predicate:"associated_with"|"expressed_in"|"part_of";note:string}|null;
}
const idOk=(s:unknown):s is string=>typeof s==="string"&&/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/.test(s);
function safeLabel(v:unknown,fallback:string):string{return typeof v==="string"&&v.trim()&&v.length<=300?v:fallback}
export function buildCandidateGraph(sources:PublicSourceRecord[],contexts:CuratedContextInput[]=[]):CandidateGraph {
 if(!Array.isArray(sources)||sources.length>500||!Array.isArray(contexts)||contexts.length>500)throw Error("Invalid graph inputs");
 const bySource=new Map<string,PublicSourceRecord>(),nodes=new Map<string,ScientificNode>(),edges:ContextualRelationshipV2[]=[];
 function node(id:string,kind:ScientificNodeKind,label:string,sourceId:string){
  if(!idOk(id)||!idOk(sourceId))throw Error("Invalid graph node identifier");
  const prior=nodes.get(id);
  if(prior&&prior.kind!==kind)throw Error("Conflicting entity types");
  if(prior){if(!prior.sourceRefs.includes(sourceId))prior.sourceRefs.push(sourceId)}
  else nodes.set(id,{id,kind,label,sourceRefs:[sourceId],status:"candidate"});
 }
 for(const s of sources){
  if(!s||!idOk(s.sourceId)||bySource.has(s.sourceId)||s.accessClass!=="public"||s.passageUsePermitted!==false||s.licenceId!==null||!idOk(s.canonicalId))throw Error("Unsupported or duplicate public source");
  bySource.set(s.sourceId,s);
  if(s.kind==="publication"){
   node(s.canonicalId,"publication",safeLabel(s.metadata.title,s.canonicalId),s.sourceId);
  }else if(s.kind==="target_disease"){
   const diseaseId=s.metadata.diseaseId;
   if(!idOk(diseaseId)||!s.sourceId.startsWith("opentargets:")||typeof s.metadata.associationScore!=="number"||!Number.isFinite(s.metadata.associationScore)||s.metadata.associationScore<0||s.metadata.associationScore>1||s.metadata.associationNotCausality!==true)throw Error("Invalid association metadata");
   node(diseaseId,"disease",safeLabel(s.metadata.diseaseName,diseaseId),s.sourceId);
   node(s.canonicalId,"target",safeLabel(s.metadata.targetSymbol,s.canonicalId),s.sourceId);
   edges.push(assertRelationshipV2({
    id:"edge:"+s.sourceId,subjectId:diseaseId,predicate:"associated_with",objectId:s.canonicalId,
    context:{diseaseIds:[diseaseId],species:null,tissueId:null,cellStateId:null,cohortId:null,method:null,timepoint:null},
    sourceRefs:[s.sourceId],state:"extracted_candidate",uncertainty:"Open Targets aggregate association; not causal, not tissue/cell-specific, not an experimentally validated mechanism.",
    review:null,previousVersionId:null
   }));
  }else throw Error("Unsupported source kind");
 }
 for(const c of contexts){
  const source=bySource.get(c?.sourceId);
  if(!source||!Array.isArray(c.diseaseIds)||c.diseaseIds.some(x=>!idOk(x))||new Set(c.diseaseIds).size!==c.diseaseIds.length)throw Error("Invalid curated context");
  for(const value of [c.tissueId,c.cellId,c.pathwayId,c.species,c.method,c.cohortId,c.timepoint])if(value!==null&&(typeof value!=="string"||!value.trim()||value.length>128))throw Error("Invalid contextual qualifier");
  if(c.relationship!==null){
   // Bibliographic metadata and aggregate association scores cannot establish biological mechanisms.
   // Any additional claim needs an independently verified, passage-level source contract in a later milestone.
   throw Error("Contextual scientific relationships require verified passage-level evidence; metadata is insufficient");
  }
  if(c.tissueId)node(c.tissueId,"tissue",c.tissueId,c.sourceId);
  if(c.cellId)node(c.cellId,"cell",c.cellId,c.sourceId);
  if(c.pathwayId)node(c.pathwayId,"pathway",c.pathwayId,c.sourceId);
 }
 return {schemaVersion:"hsi-contextual-candidate-graph-1",nodes:[...nodes.values()],edges,sources:[...bySource.values()],containsPhi:false,clinicalAdvice:false,graphPromotable:false,scientificApproval:false};
}
/** Shared candidates across disease contexts are comparison prompts, not shared mechanisms. */
export function sharedTargetCandidates(graph:CandidateGraph,diseaseIds:string[]):{targetId:string;diseaseIds:string[];sourceRefs:string[];interpretation:"shared_association_candidate_not_mechanism"}[]{
 if(!graph||graph.graphPromotable!==false||graph.containsPhi!==false||!Array.isArray(diseaseIds)||new Set(diseaseIds).size!==diseaseIds.length||diseaseIds.length<2||diseaseIds.some(x=>!idOk(x)))throw Error("Invalid comparison");
 const byTarget=new Map<string,{diseases:Set<string>;refs:Set<string>}>();
 for(const e of graph.edges){
  if(e.predicate!=="associated_with"||e.state!=="extracted_candidate"||!diseaseIds.includes(e.subjectId))continue;
  const current=byTarget.get(e.objectId)??{diseases:new Set<string>(),refs:new Set<string>()};
  current.diseases.add(e.subjectId);e.sourceRefs.forEach(x=>current.refs.add(x));byTarget.set(e.objectId,current);
 }
 return [...byTarget].filter(([,v])=>v.diseases.size>=2).map(([targetId,v])=>({targetId,diseaseIds:[...v.diseases].sort(),sourceRefs:[...v.refs].sort(),interpretation:"shared_association_candidate_not_mechanism" as const})).sort((a,b)=>a.targetId.localeCompare(b.targetId));
}
