/** ARCH-002 Phase 3.8 — read-only, researcher-supervised graph workbench.
 * Composes canonical graph, evidence dossiers and scientific QA without granting
 * approval, publication, patient access or external source ingestion.
 */
import {validateHsiLogicalGraph,type HsiGraphNode,type HsiGraphRelationship} from "./livingHealthKnowledgeGraph";
import {assessHsiRelationshipDossier,type HsiRelationshipDossier} from "./hsiEvidenceTemporalDossier";
export type HsiWorkbenchQuery={focusNodeId:string;maxRelationships:number;includeDrafts:boolean};
export type HsiWorkbenchEdge={
 id:string;subjectId:string;predicate:string;objectId:string;
 epistemicType:HsiGraphRelationship["epistemicType"];reviewState:HsiGraphRelationship["reviewState"];
 evidenceAssessment:"missing"|"unassessed"|"supported"|"contested"|"context_limited";
 evidenceIds:readonly string[];warnings:readonly string[];
};
export type HsiWorkbenchResult={schemaVersion:"hsi-workbench-1";focusNodeId:string;nodes:readonly {id:string;label:string;kind:string;layer:HsiGraphNode["layer"]}[];relationships:readonly HsiWorkbenchEdge[];qa:{total:number;reviewed:number;contested:number;missingDossiers:number;warnings:readonly string[]};readOnly:true};
export function buildHsiResearchWorkbench(input:{
 nodes:readonly HsiGraphNode[];relationships:readonly HsiGraphRelationship[];
 dossiers:readonly HsiRelationshipDossier[];query:HsiWorkbenchQuery;
}):HsiWorkbenchResult{
 const {nodes,relationships,dossiers,query}=input;
 validateHsiLogicalGraph(nodes,relationships);
 if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(query.focusNodeId)||!Number.isInteger(query.maxRelationships)||query.maxRelationships<1||query.maxRelationships>100)throw Error("Invalid workbench query");
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const focus=byId.get(query.focusNodeId);
 if(!focus||focus.visibility==="restricted_clinical"||focus.layer==="patient_context")throw Error("Workbench cannot access patient context");
 const dossierMap=new Map<string,HsiRelationshipDossier>();
 for(const d of dossiers){
  if(dossierMap.has(d.relationship.id))throw Error("Duplicate evidence dossier");
  dossierMap.set(d.relationship.id,d);
 }
 const selected=relationships.filter(e=>(e.subjectId===query.focusNodeId||e.objectId===query.focusNodeId)&&e.visibility!=="restricted_clinical"&&e.layer!=="patient_context"&&(query.includeDrafts||e.reviewState==="approved")).slice(0,query.maxRelationships);
 const visible=new Set([query.focusNodeId]);
 const output:HsiWorkbenchEdge[]=selected.map(e=>{
  const subject=byId.get(e.subjectId)!,object=byId.get(e.objectId)!;
  if(subject.visibility==="restricted_clinical"||object.visibility==="restricted_clinical")throw Error("Restricted entity in research workbench");
  visible.add(subject.id);visible.add(object.id);
  const dossier=dossierMap.get(e.id);
  const warnings:string[]=[];
  let evidenceAssessment:HsiWorkbenchEdge["evidenceAssessment"]="missing";
  if(!dossier)warnings.push("Evidence dossier not attached");
  else {
   if(dossier.relationship.id!==e.id||dossier.relationship.version!==e.version)throw Error("Evidence dossier relationship mismatch");
   const assessment=assessHsiRelationshipDossier(dossier);
   evidenceAssessment=assessment.evidenceAssessment;
   warnings.push(...assessment.reasons);
  }
  if(e.reviewState!=="approved")warnings.push("Not scientifically approved");
  if(e.epistemicType==="computational_inference"||e.epistemicType==="unvalidated_hypothesis")warnings.push("Inference or hypothesis; not established evidence");
  return {id:e.id,subjectId:e.subjectId,predicate:e.predicate,objectId:e.objectId,epistemicType:e.epistemicType,reviewState:e.reviewState,evidenceAssessment,evidenceIds:e.sourceEvidenceIds,warnings};
 });
 const qaWarnings=output.flatMap(e=>e.warnings.map(w=>e.id+": "+w));
 return {schemaVersion:"hsi-workbench-1",focusNodeId:query.focusNodeId,
  nodes:nodes.filter(n=>visible.has(n.id)).map(n=>({id:n.id,label:n.preferredLabel,kind:n.kind,layer:n.layer})),
  relationships:output,qa:{total:output.length,reviewed:output.filter(e=>e.reviewState==="approved").length,
   contested:output.filter(e=>e.evidenceAssessment==="contested").length,
   missingDossiers:output.filter(e=>e.evidenceAssessment==="missing").length,warnings:qaWarnings},readOnly:true};
}
