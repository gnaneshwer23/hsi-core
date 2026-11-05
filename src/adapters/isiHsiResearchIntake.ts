/** P0: compose a staged ISI graph with HSI's existing evidence verification queue.
 * Read-only research dossier. Neither imported graph nor publication metadata
 * can grant scientific approval or canonical ontology identity.
 */
import type {IsiStagedGraph} from "./isiGraphReleaseAdapter";
import type {SscEvidenceSnapshot} from "../evidence/sscEvidenceSnapshot";
import {verifySscEvidenceSnapshot} from "../evidence/sscEvidenceSnapshot";
export type IsiOntologyReview={isiId:string;hsiCanonicalId:string;reviewDecisionId:string;sourceRef:string;relation:"exact"|"related";status:"approved"|"pending"|"rejected"};
export type IsiHsiResearchIntake={
 schemaVersion:"hsi-isi-research-intake-1";
 graph:{sourceVersion:string;sourceHash:string;nodeCount:number;relationshipCount:number;rejectedCount:number};
 evidence:{datasetId:string;contentHash:string;claims:number;matchedMetadata:number;unmatchedMetadata:number};
 ontology:{mapped:{isiId:string;hsiCanonicalId:string;reviewDecisionId:string}[];pending:{isiId:string;label:string;kind:string}[]};
 graphPromotable:false;reviewRequired:true;containsPhi:false;
};
export function composeIsiHsiResearchIntake(input:{graph:IsiStagedGraph;evidence:SscEvidenceSnapshot;ontologyReviews?:readonly IsiOntologyReview[]}):IsiHsiResearchIntake{
 const {graph,evidence}=input;
 if(graph.schemaVersion!=="hsi-isi-staged-graph-1"||graph.graphPromotable!==false||graph.autoApprove!==false||graph.containsPhi!==false)throw Error("Untrusted ISI staging boundary");
 if(!/^[a-f0-9]{64}$/.test(graph.sourceHash)||!verifySscEvidenceSnapshot(evidence))throw Error("Invalid source or evidence integrity");
 if(graph.nodes.some(n=>n.reviewState!=="unreviewed"||n.canonicalHsiId!==null)||graph.relationships.some(r=>r.reviewState!=="unreviewed"||r.graphPromotable!==false))throw Error("Unexpected source promotion");
 const queued=new Set(graph.ontologyQueue.map(x=>x.isiId));
 if(queued.size!==graph.ontologyQueue.length)throw Error("Duplicate ISI mapping queue entries");
 const reviews=input.ontologyReviews??[],seen=new Set<string>();
 const mapped: IsiHsiResearchIntake["ontology"]["mapped"]=[];
 for(const review of reviews){
  if(!queued.has(review.isiId)||seen.has(review.isiId))throw Error("Unknown or duplicate ISI ontology decision");
  seen.add(review.isiId);
  if(review.status==="approved"){
   if(review.relation!=="exact"||!review.reviewDecisionId.trim()||!review.sourceRef.trim()||!review.hsiCanonicalId.trim())throw Error("Approved exact mapping requires human provenance");
   mapped.push({isiId:review.isiId,hsiCanonicalId:review.hsiCanonicalId,reviewDecisionId:review.reviewDecisionId});
  }
 }
 const approved=new Set(mapped.map(m=>m.isiId));
 return {
  schemaVersion:"hsi-isi-research-intake-1",
  graph:{sourceVersion:graph.sourceVersion,sourceHash:graph.sourceHash,nodeCount:graph.nodes.length,relationshipCount:graph.relationships.length,rejectedCount:graph.rejected.length},
  evidence:{datasetId:evidence.datasetId,contentHash:evidence.contentHash,claims:evidence.claimAssessments.length,matchedMetadata:evidence.claimAssessments.filter(x=>x.status==="metadata_matched_unreviewed").length,unmatchedMetadata:evidence.claimAssessments.filter(x=>x.status!=="metadata_matched_unreviewed").length},
  ontology:{mapped,pending:graph.ontologyQueue.filter(x=>!approved.has(x.isiId)).map(x=>({isiId:x.isiId,label:x.label,kind:x.kind}))},
  graphPromotable:false,reviewRequired:true,containsPhi:false
 };
}
