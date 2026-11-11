/** P1.3: versioned, content-addressed evidence staging. No database writes. */
import {createHash} from "node:crypto";
import type {HsiGraphNode} from "../livingHealthKnowledgeGraph";
import {validateHsiLogicalGraph} from "../livingHealthKnowledgeGraph";
import type {BiomedicalSourceBundleResult} from "./biomedicalSourceBundle";

export type StagedEvidenceSnapshot={
 schemaVersion:"hsi-evidence-snapshot-1";
 snapshotId:string;
 contentSha256:string;
 sourceIds:readonly string[];
 sourceUrls:readonly string[];
 retrievedAt:readonly string[];
 nodes:readonly HsiGraphNode[];
 state:"pending_independent_review";
 visibility:"governed_research";
 persisted:false;
 scientificApproval:false;
};
export type EvidenceStagingResult=
 | {ok:false;reason:"invalid_bundle"|"invalid_provenance"|"invalid_graph";detail:string}
 | {ok:true;snapshot:StagedEvidenceSnapshot;reviewQueueItem:{
    snapshotId:string;status:"pending_independent_review";
    reviewDecisionId:null;authenticatedReviewerId:null;
  }};
export function stageBiomedicalEvidenceBundle(
 bundle:BiomedicalSourceBundleResult,
):EvidenceStagingResult{
 if(!bundle.ok)return {ok:false,reason:"invalid_bundle",detail:"Source bundle failed"};
 if(bundle.graphPersisted!==false||bundle.relationshipVerified!==false||
    bundle.scientificallyValidated!==false||bundle.evidenceState!=="provider_metadata_only")
   return {ok:false,reason:"invalid_bundle",detail:"Unsafe bundle state"};
 if(bundle.nodes.length!==2||bundle.sourceIds.length!==2||
    bundle.sourceUrls.length!==2||bundle.retrievedAt.length!==2||
    bundle.sourceIds.some(x=>!x.trim())||
    bundle.sourceUrls.some(x=>{try{return new URL(x).protocol!=="https:"}catch{return true}})||
    bundle.retrievedAt.some(x=>!Number.isFinite(Date.parse(x))))
   return {ok:false,reason:"invalid_provenance",detail:"Missing or malformed source provenance"};
 try{
   validateHsiLogicalGraph(bundle.nodes,[]);
   if(bundle.nodes.some(n=>n.reviewState!=="draft"||
      n.visibility!=="governed_research"||n.sourceProvenance.length===0))
      throw new Error("Source nodes must be governed drafts");
   const payload={schemaVersion:"hsi-evidence-snapshot-1" as const,
     sourceIds:[...bundle.sourceIds],sourceUrls:[...bundle.sourceUrls],
     retrievedAt:[...bundle.retrievedAt],nodes:bundle.nodes.map(n=>({
       ...n,aliases:[...n.aliases],sourceIdentifiers:n.sourceIdentifiers.map(x=>({...x})),
       sourceProvenance:[...n.sourceProvenance],
     }))};
   const contentSha256=createHash("sha256").update(JSON.stringify(payload)).digest("hex");
   const snapshot:StagedEvidenceSnapshot={...payload,
     snapshotId:`evidence.sha256.${contentSha256}`,contentSha256,
     state:"pending_independent_review",visibility:"governed_research",
     persisted:false,scientificApproval:false};
   return {ok:true,snapshot,reviewQueueItem:{
     snapshotId:snapshot.snapshotId,status:"pending_independent_review",
     reviewDecisionId:null,authenticatedReviewerId:null,
   }};
 }catch(e){
   return {ok:false,reason:"invalid_graph",
     detail:e instanceof Error?e.message:"Invalid draft graph"};
 }
}
