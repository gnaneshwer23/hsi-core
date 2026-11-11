/**
 * B-04.4: deterministic verification gates for B-04.3 candidate relationships.
 * AI extractors/critics may submit findings but cannot declare them verified.
 * This module has no LLM, network, database or graph-publishing side effects.
 */
import type {CandidateGraph} from "./contextualGraph";
import type {ContextualRelationshipV2} from "./universalInvestigation";
export type VerificationDisposition="candidate_checked"|"needs_evidence"|"exception_review";
export type VerificationFinding={code:"missing_source"|"unsupported_state"|"unsupported_predicate"|"invalid_context"|"missing_passage"|"contradictory_review"|"unverified_provenance"|"unreviewed_causality";message:string};
export interface VerificationReceipt{
 schemaVersion:"hsi-verification-receipt-1";edgeId:string;
 disposition:VerificationDisposition;checks:{sourceReferences:boolean;context:boolean;claimScope:boolean;passageGrounding:boolean};
 findings:VerificationFinding[];autoPublish:false;humanApproval:false;scientificTruthEstablished:false;
}
/** Metadata-only associations can be checked for internal integrity, not proven scientifically true. */
export function verifyCandidateRelationship(graph:CandidateGraph,edge:ContextualRelationshipV2):VerificationReceipt{
 if(!graph||graph.schemaVersion!=="hsi-contextual-candidate-graph-1"||graph.graphPromotable!==false||graph.scientificApproval!==false||graph.containsPhi!==false||!Array.isArray(graph.sources)||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw Error("Invalid candidate graph");
 if(!edge||!graph.edges.some(e=>e.id===edge.id&&e===edge))throw Error("Relationship not owned by graph");
 const findings:VerificationFinding[]=[];
 const flag=(code:VerificationFinding["code"],message:string)=>findings.push({code,message});
 const sourceIds=new Set(graph.sources.map(s=>s.sourceId));
 const nodes=new Set(graph.nodes.map(n=>n.id));
 const sourceReferences=Array.isArray(edge.sourceRefs)&&edge.sourceRefs.length>0&&edge.sourceRefs.every(x=>sourceIds.has(x));
 if(!sourceReferences)flag("missing_source","Source references are not all present in the candidate graph");
 const context=!!edge.context&&Array.isArray(edge.context.diseaseIds)&&edge.context.diseaseIds.length>0&&edge.context.diseaseIds.includes(edge.subjectId)&&nodes.has(edge.subjectId)&&nodes.has(edge.objectId)&&edge.context.tissueId===null&&edge.context.cellStateId===null;
 if(!context)flag("invalid_context","Metadata-only associations cannot claim tissue or cell specificity");
 const claimScope=edge.predicate==="associated_with"&&edge.state==="extracted_candidate"&&edge.review===null;
 if(!claimScope)flag("unsupported_predicate","Only unreviewed association candidates are supported by this verification gate");
 if(edge.review!==null)flag("contradictory_review","Candidate graph cannot contain an approval record");
 if(edge.predicate==="causes"||edge.predicate==="treats")flag("unreviewed_causality","Causal or therapeutic assertions require independently verified primary evidence");
 const referenced=graph.sources.filter(s=>edge.sourceRefs.includes(s.sourceId));
 if(referenced.some(s=>s.kind!=="target_disease"||s.accessClass!=="public"||s.passageUsePermitted!==false||s.licenceId!==null||s.metadata.associationNotCausality!==true||s.metadata.diseaseId!==edge.subjectId||s.canonicalId!==edge.objectId))flag("unverified_provenance","Source is not an eligible matching Open Targets association record");
 // No publication passages are present in the B-04.2 metadata contract.
 flag("missing_passage","No rights-verified source passage exists; mechanism or causality cannot be validated");
 const critical=findings.some(f=>f.code!=="missing_passage");
 return {schemaVersion:"hsi-verification-receipt-1",edgeId:edge.id,disposition:critical?"exception_review":sourceReferences&&context&&claimScope?"candidate_checked":"needs_evidence",checks:{sourceReferences,context,claimScope,passageGrounding:false},findings,autoPublish:false,humanApproval:false,scientificTruthEstablished:false};
}
export function verifyCandidateGraph(graph:CandidateGraph):VerificationReceipt[]{
 if(!graph||!Array.isArray(graph.edges)||graph.edges.length>1000)throw Error("Invalid verification batch");
 return graph.edges.map(e=>verifyCandidateRelationship(graph,e));
}
