import {describe,expect,test} from "bun:test";
import {persistDraftEvidence,persistIndependentReview,type EvidenceDatabase}
 from "../src/evidence/transactionalEvidenceReview";
import type {StagedEvidenceSnapshot} from "../src/evidence/governedEvidenceStaging";
const hash="a".repeat(64);
const snapshot={snapshotId:`evidence.sha256.${hash}`,contentSha256:hash,
  state:"pending_independent_review",persisted:false,scientificApproval:false,
  visibility:"governed_research"} as StagedEvidenceSnapshot;
const researcher={subjectId:"researcher-1",organizationId:"org-1",
  roles:["researcher"] as const,authenticatedBy:"trusted_server_gateway" as const,
  authSessionId:"session-1"};
const reviewer={subjectId:"reviewer-2",organizationId:"org-1",
  roles:["scientific_reviewer"] as const,authenticatedBy:"trusted_server_gateway" as const,
  authSessionId:"session-2"};
const eventId="123e4567-e89b-42d3-a456-426614174000";
describe("P1.5 transactional evidence adapter",()=>{
 test("inserts pending evidence with parameterized SQL in transaction",async()=>{
  let calls=0;
  const db:EvidenceDatabase={transaction:async(_org,fn)=>fn({
    query:async(sql,params)=>{
      calls++;
      expect(sql).toContain("ON CONFLICT DO NOTHING");
      expect(params[0]).toBe("org-1");
      return [{snapshot_id:snapshot.snapshotId}] as never;
    },
  })};
  const result=await persistDraftEvidence({db,principal:researcher,
    snapshot,idempotencyKey:"request-12345"});
  expect(result.created).toBe(true);
  expect(calls).toBe(1);
 });
 test("rejects invalid idempotency key before transaction",async()=>{
  const db:EvidenceDatabase={transaction:async()=>{throw Error("DB must not run")}};
  await expect(persistDraftEvidence({db,principal:researcher,
    snapshot,idempotencyKey:"bad"})).rejects.toThrow("Invalid idempotency");
 });
 test("rejects self-review before writing event",async()=>{
  let queries=0;
  const db:EvidenceDatabase={transaction:async(_org,fn)=>fn({
    query:async()=>{queries++;return [{snapshot_id:snapshot.snapshotId,
      submitted_by:"researcher-1",status:"pending_review",
      reviewer_id:null,review_decision_id:null,reviewer_notes:null}] as never},
  })};
  await expect(persistIndependentReview({db,
    principal:{...reviewer,subjectId:"researcher-1"},
    snapshotId:snapshot.snapshotId,decision:"accepted",
    decisionId:eventId,notes:"review"})).rejects.toThrow("Independent");
  expect(queries).toBe(1);
 });
 test("records independent review event and status in same transaction",async()=>{
  const statements:string[]=[];
  const db:EvidenceDatabase={transaction:async(_org,fn)=>fn({
    query:async(sql)=>{
      statements.push(sql);
      if(sql.includes("SELECT snapshot_id"))return [{
        snapshot_id:snapshot.snapshotId,submitted_by:"researcher-1",
        status:"pending_review",reviewer_id:null,review_decision_id:null,
        reviewer_notes:null}] as never;
      if(sql.includes("INSERT INTO"))return [{event_id:eventId}] as never;
      return [{snapshot_id:snapshot.snapshotId}] as never;
    },
  })};
  const result=await persistIndependentReview({db,principal:reviewer,
    snapshotId:snapshot.snapshotId,decision:"accepted",
    decisionId:eventId,notes:"Reviewed"});
  expect(result.reviewerId).toBe("reviewer-2");
  expect(statements).toHaveLength(3);
  expect(statements[0]).toContain("FOR UPDATE");
 });
});
