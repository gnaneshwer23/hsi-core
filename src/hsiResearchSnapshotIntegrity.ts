/** Phase 3.9 — deterministic version and access validation for graph/dossier joins.
 * Used after database reads; cannot replace RLS, session validation or an
 * atomic snapshot across stores. Reject ambiguous versions rather than guess.
 */
import type {HsiGraphNode,HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
import type {HsiRelationshipDossier} from "./hsiEvidenceTemporalDossier";
export function assertHsiResearchSnapshot(input:{
 nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[];
 dossiers:readonly HsiRelationshipDossier[];
}):void{
 const nodes=new Map<string,HsiGraphNode>();
 for(const n of input.nodes){
  if(n.layer==="patient_context"||n.visibility!=="governed_research"||nodes.has(n.id))throw Error("Ambiguous or restricted graph node snapshot");
  nodes.set(n.id,n);
 }
 const edges=new Map<string,HsiGraphRelationship>();
 for(const e of input.relationships){
  if(e.layer==="patient_context"||e.visibility!=="governed_research"||edges.has(e.id)||!nodes.has(e.subjectId)||!nodes.has(e.objectId))throw Error("Ambiguous or restricted graph edge snapshot");
  edges.set(e.id,e);
 }
 const seen=new Set<string>();
 for(const d of input.dossiers){
  const e=edges.get(d.relationship.id);
  if(!e||seen.has(d.relationship.id)||d.relationship.version!==e.version||d.relationship.subjectId!==e.subjectId||d.relationship.objectId!==e.objectId||d.relationship.predicate!==e.predicate||d.relationship.visibility!==e.visibility||d.relationship.reviewState!==e.reviewState)throw Error("Evidence dossier snapshot mismatch");
  seen.add(d.relationship.id);
 }
}
