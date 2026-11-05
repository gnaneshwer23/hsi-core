/** Phase 3.1: fail-closed alignment of ISI draft mechanism releases to HSI's canonical graph.
 * Mapping is a candidate projection only: never invent ontology equivalence or approval.
 */
import {validateIsiMechanismRelease,type IsiMechanismRelease} from "./isiMechanismReleaseAdapter";
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
export const PHASE_3_1_ALIGNMENT_VERSION="hsi-isi-canonical-alignment-1" as const;
export interface AlignmentResult {schemaVersion:typeof PHASE_3_1_ALIGNMENT_VERSION;releaseId:string;version:string;graphPromotable:false;reviewedByHuman:false;nodes:HsiGraphNode[];relationships:HsiGraphRelationship[];mappingGaps:Array<{nodeId:string;reason:string}>;provenanceGaps:Array<{relationshipId:string;reason:string}>}
const identifier=/^[A-Za-z0-9][A-Za-z0-9:_.-]{0,127}$/;
export function alignIsiMechanismRelease(input:unknown):AlignmentResult{
 const release:IsiMechanismRelease=validateIsiMechanismRelease(input);
 const nodes:HsiGraphNode[]=release.nodes.map(n=>({schemaVersion:"hsi-lhkg-node-1",id:n.id,layer:"human_biology",kind:n.kind,preferredLabel:n.preferredLabel,aliases:[],sourceIdentifiers:[],version:release.version,visibility:"governed_research",reviewState:"draft",sourceProvenance:[release.releaseId]}));
 const mappingGaps=nodes.map(n=>({nodeId:n.id,reason:"No independently reviewed canonical ontology mapping supplied"}));
 const provenanceGaps:AlignmentResult["provenanceGaps"]=[];
 const relationships:HsiGraphRelationship[]=release.relationships.map(e=>{
  if(!identifier.test(e.predicate))throw Error("Untrusted ISI predicate");
  if(!e.sourceEvidenceIds.length)provenanceGaps.push({relationshipId:e.id,reason:"No source evidence identifiers"});
  if(!e.context.sourceLocator?.trim())provenanceGaps.push({relationshipId:e.id,reason:"No precise source locator"});
  if(!e.context.studyContext?.trim())provenanceGaps.push({relationshipId:e.id,reason:"No study context"});
  return {schemaVersion:"hsi-lhkg-edge-1",id:e.id,subjectId:e.subjectId,predicate:e.predicate,objectId:e.objectId,layer:"human_biology",epistemicType:"association",visibility:"governed_research",reviewState:"draft",sourceEvidenceIds:[...e.sourceEvidenceIds],version:release.version,context:{...(e.context.model?{model:e.context.model}:{}),...(e.context.studyContext?{studyContext:e.context.studyContext}:{}),...(e.context.sourceLocator?{sourceLocator:e.context.sourceLocator}:{}),...(e.context.limitations?{limitations:e.context.limitations}:{})},causalClaim:false};
 });
 validateHsiLogicalGraph(nodes,relationships);
 return {schemaVersion:PHASE_3_1_ALIGNMENT_VERSION,releaseId:release.releaseId,version:release.version,graphPromotable:false,reviewedByHuman:false,nodes,relationships,mappingGaps,provenanceGaps};
}
