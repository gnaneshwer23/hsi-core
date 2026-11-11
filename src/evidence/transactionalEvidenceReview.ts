/** P1.5 server-only transactional persistence adapter.
 * Caller MUST authenticate principal, authorize tenant and provide a scoped DB transaction.
 * Not a public HTTP endpoint. No graph publication or scientific validation.
 */
import type {StagedEvidenceSnapshot} from "./governedEvidenceStaging";
import {authorizeEvidenceSubmission,authorizeReviewDecision,
  type VerifiedResearchPrincipal,type EvidenceReviewRecord} from "./authenticatedEvidenceReview";

export type SqlRow=Record<string,unknown>;
export interface EvidenceTransaction{
  query<T extends SqlRow=SqlRow>(sql:string,params:readonly unknown[]):Promise<readonly T[]>;
}
export interface EvidenceDatabase{
  transaction<T>(organizationId:string,fn:(tx:EvidenceTransaction)=>Promise<T>):Promise<T>;
}
type SnapshotRow={snapshot_id:string;content_sha256:string;idempotency_key:string;
  submitted_by:string;status:EvidenceReviewRecord["status"];
  reviewer_id?:string|null;review_decision_id?:string|null;reviewer_notes?:string|null};
const assertKey=(key:string)=>{
 if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(key))
   throw new Error("Invalid idempotency key");
};
export async function persistDraftEvidence(input:{
  db:EvidenceDatabase;principal:VerifiedResearchPrincipal;
  snapshot:StagedEvidenceSnapshot;idempotencyKey:string;
}):Promise<{snapshotId:string;created:boolean;status:"pending_review"}>{
 const {db,principal,snapshot,idempotencyKey}=input;
 assertKey(idempotencyKey);
 const record=authorizeEvidenceSubmission(principal,snapshot);
 return db.transaction(principal.organizationId,async tx=>{
   const rows=await tx.query<SnapshotRow>(`
     INSERT INTO hsi_research_evidence_snapshots
       (organization_id,snapshot_id,content_sha256,payload,submitted_by,idempotency_key)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6)
     ON CONFLICT DO NOTHING
     RETURNING snapshot_id,content_sha256,idempotency_key,submitted_by,status
   `,[record.organizationId,snapshot.snapshotId,snapshot.contentSha256,
       JSON.stringify(snapshot),record.submittedBy,idempotencyKey]);
   if(rows.length===1)return {snapshotId:record.snapshotId,created:true as const,
     status:"pending_review" as const};
   const existing=await tx.query<SnapshotRow>(`
     SELECT snapshot_id,content_sha256,idempotency_key,submitted_by,status
     FROM hsi_research_evidence_snapshots
     WHERE organization_id=$1 AND idempotency_key=$2 FOR UPDATE
   `,[record.organizationId,idempotencyKey]);
   const match=existing[0];
   if(!match||match.snapshot_id!==record.snapshotId||
     match.content_sha256!==snapshot.contentSha256||
     match.submitted_by!==record.submittedBy)
     throw new Error("Idempotency key conflict or snapshot already exists");
   if(match.status!=="pending_review")
     throw new Error("Evidence already reviewed");
   return {snapshotId:match.snapshot_id,created:false as const,
     status:"pending_review" as const};
 });
}
export async function persistIndependentReview(input:{
 db:EvidenceDatabase;principal:VerifiedResearchPrincipal;
 snapshotId:string;decision:"accepted"|"rejected"|"needs_revision";
 decisionId:string;notes:string;
}):Promise<EvidenceReviewRecord>{
 const {db,principal,snapshotId,decision,decisionId,notes}=input;
 if(!/^evidence\.sha256\.[a-f0-9]{64}$/.test(snapshotId))
   throw new Error("Invalid snapshot ID");
 return db.transaction(principal.organizationId,async tx=>{
   const rows=await tx.query<SnapshotRow>(`
     SELECT snapshot_id,submitted_by,status
     FROM hsi_research_evidence_snapshots
     WHERE organization_id=$1 AND snapshot_id=$2 FOR UPDATE
   `,[principal.organizationId,snapshotId]);
   const found=rows[0];
   if(!found)throw new Error("Evidence not found in organization");
   const record:EvidenceReviewRecord={
     snapshotId,organizationId:principal.organizationId,
     submittedBy:found.submitted_by,status:found.status,
     reviewerId:null,reviewDecisionId:null,
     reviewerNotes:null};
   const next=authorizeReviewDecision({principal,record,decision,decisionId,notes});
   const inserted=await tx.query<{event_id:string}>(`
     INSERT INTO hsi_research_evidence_review_events
       (event_id,organization_id,snapshot_id,reviewer_id,decision,notes)
     VALUES ($1::uuid,$2,$3,$4,$5,$6)
     RETURNING event_id
   `,[decisionId,principal.organizationId,snapshotId,principal.subjectId,decision,notes]);
   if(inserted.length!==1)throw new Error("Review event not recorded");
   const updated=await tx.query<{snapshot_id:string}>(`
     UPDATE hsi_research_evidence_snapshots
     SET status=$3
     WHERE organization_id=$1 AND snapshot_id=$2 AND status='pending_review'
     RETURNING snapshot_id
   `,[principal.organizationId,snapshotId,decision]);
   if(updated.length!==1)throw new Error("Concurrent review conflict");
   return next;
 });
}
