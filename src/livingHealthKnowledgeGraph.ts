/** ARCH-002 / Phase 3: canonical, governed LHK-G logical contract.
 * Distinct logical layers need not share physical storage. No PHI enters public graph.
 * A proposal is not a published scientific assertion.
 */
export const HSI_GRAPH_LAYERS=["patient_context","human_biology","gut_immune_metabolic","biomedical_evidence"] as const;
export type HsiGraphLayer=typeof HSI_GRAPH_LAYERS[number];
export const HSI_GRAPH_EPISTEMIC_TYPES=["patient_fact","established_evidence","association","computational_inference","unvalidated_hypothesis"] as const;
export type HsiGraphEpistemicType=typeof HSI_GRAPH_EPISTEMIC_TYPES[number];
export type HsiGraphReviewState="draft"|"in_review"|"approved"|"rejected"|"retired";
export type HsiGraphVisibility="restricted_clinical"|"governed_research"|"public_biomedical";
export type HsiGraphNode={
 schemaVersion:"hsi-lhkg-node-1";id:string;layer:HsiGraphLayer;kind:string;preferredLabel:string;
 aliases:readonly string[];sourceIdentifiers:readonly {system:string;value:string;mapping:"exact"|"broad"|"narrow"|"related"|"unreviewed"}[];
 version:string;visibility:HsiGraphVisibility;reviewState:HsiGraphReviewState;sourceProvenance:readonly string[];
};
export type HsiGraphRelationship={
 schemaVersion:"hsi-lhkg-edge-1";id:string;subjectId:string;predicate:string;objectId:string;
 layer:HsiGraphLayer;epistemicType:HsiGraphEpistemicType;visibility:HsiGraphVisibility;
 reviewState:HsiGraphReviewState;sourceEvidenceIds:readonly string[];version:string;
 context:Readonly<Record<string,string>>;causalClaim:boolean;reviewDecisionId?:string;
};
const id=/^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/;
const version=/^[0-9]+\.[0-9]+\.[0-9]+$/;
const allowed=(v:string,values:readonly string[])=>values.includes(v);
export function validateHsiGraphNode(n:HsiGraphNode):void{
 if(n.schemaVersion!=="hsi-lhkg-node-1"||!id.test(n.id)||!n.kind.trim()||!n.preferredLabel.trim()||!version.test(n.version))throw Error("Invalid canonical graph node");
 if(!allowed(n.layer,HSI_GRAPH_LAYERS)||!allowed(n.visibility,["restricted_clinical","governed_research","public_biomedical"]))throw Error("Unknown graph scope");
 if(n.layer==="patient_context"&&n.visibility!=="restricted_clinical")throw Error("Patient context must remain restricted");
 if(n.visibility==="public_biomedical"&&n.reviewState!=="approved")throw Error("Unapproved entity cannot be publicly exposed");
 for(const x of n.sourceIdentifiers)if(!x.system.trim()||!x.value.trim()||!allowed(x.mapping,["exact","broad","narrow","related","unreviewed"]))throw Error("Invalid ontology mapping");
}
export function validateHsiGraphRelationship(e:HsiGraphRelationship,nodes:ReadonlyMap<string,HsiGraphNode>):void{
 if(e.schemaVersion!=="hsi-lhkg-edge-1"||!id.test(e.id)||!e.predicate.trim()||!version.test(e.version))throw Error("Invalid canonical graph relationship");
 const subject=nodes.get(e.subjectId),object=nodes.get(e.objectId);
 if(!subject||!object)throw Error("Dangling graph relationship");
 if(!allowed(e.layer,HSI_GRAPH_LAYERS)||!allowed(e.epistemicType,HSI_GRAPH_EPISTEMIC_TYPES))throw Error("Unknown relationship classification");
 if(subject.layer==="patient_context"||object.layer==="patient_context"||e.layer==="patient_context"||e.epistemicType==="patient_fact"){
  if(e.visibility!=="restricted_clinical")throw Error("Clinical context cannot enter public or general research graph");
 }
 if(e.visibility==="public_biomedical"){
  if(subject.visibility!=="public_biomedical"||object.visibility!=="public_biomedical")throw Error("Public graph may not reference restricted nodes");
  if(e.reviewState!=="approved"||!e.reviewDecisionId?.trim()||e.sourceEvidenceIds.length===0)throw Error("Public assertion requires reviewed evidence");
  if(e.epistemicType==="patient_fact"||e.epistemicType==="unvalidated_hypothesis"||e.epistemicType==="computational_inference")throw Error("Nonvalidated claims cannot be published");
 }
 if(e.causalClaim&&e.epistemicType!=="established_evidence")throw Error("Association or inference cannot be asserted as causal");
 if(e.reviewState==="approved"&&(!e.reviewDecisionId?.trim()||e.sourceEvidenceIds.length===0))throw Error("Approved relationship lacks evidence and review");
 if(e.epistemicType==="patient_fact"&&e.layer!=="patient_context")throw Error("Patient fact in wrong layer");
}
export function validateHsiLogicalGraph(nodes:readonly HsiGraphNode[],edges:readonly HsiGraphRelationship[]):void{
 const map=new Map<string,HsiGraphNode>();
 for(const n of nodes){validateHsiGraphNode(n);if(map.has(n.id))throw Error("Duplicate graph node");map.set(n.id,n)}
 const seen=new Set<string>();
 for(const e of edges){if(seen.has(e.id))throw Error("Duplicate graph relationship");seen.add(e.id);validateHsiGraphRelationship(e,map)}
}
