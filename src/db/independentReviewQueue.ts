/** Reviewer-only queue/history; excludes authors and already decided submissions. */
import {SQL} from "bun";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
export type ReviewQueueCursor={at:string;id:string};
export function parseReviewQueueCursor(value:unknown):ReviewQueueCursor|null{
 if(value===null)return null;const c=value as ReviewQueueCursor;
 if(!c||typeof c!=="object"||Object.keys(c).sort().join(",")!=="at,id"||typeof c.at!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3,6}Z$/.test(c.at)||!Number.isFinite(Date.parse(c.at))||typeof c.id!=="string"||!/^submission-[a-f0-9]{32}$/.test(c.id))throw Error("Invalid review queue cursor");return c;
}
export async function loadIndependentReviewQueue(input:{serverSessionToken:string|null;databaseUrl:string;neonProjectId?:string|null;cursor:ReviewQueueCursor|null}){
 const cursor=parseReviewQueueCursor(input.cursor),actor=await authenticateHsiNeonSession({...input,sessionToken:input.serverSessionToken});
 if(!actor?.roles.includes("scientific_reviewer")||!await verifyHsiReviewerAuthority({...input,principal:actor.principalId,reviewedAt:new Date().toISOString()}))throw Error("Active independent SSc reviewer required");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const rows=await sql`SELECT s.submission_id,s.investigation_id,s.package_hash,s.context_hash,s.submitted_at,
    to_char(s.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time,
    s.package_payload->'investigation'->>'question' AS question
   FROM hsi_review_submissions s JOIN hsi_interrogative_investigations i ON i.id=s.investigation_id
   WHERE s.submitted_by<>${actor.principalId} AND i.actor_principal<>${actor.principalId} AND i.state='awaiting_scientific_review'
    AND NOT EXISTS(SELECT 1 FROM hsi_review_decisions_v2 d WHERE d.submission_id=s.submission_id)
    AND (${cursor?.at??null}::timestamptz IS NULL OR (s.submitted_at,s.submission_id)<(${cursor?.at??null}::timestamptz,${cursor?.id??null}::text))
   ORDER BY s.submitted_at DESC,s.submission_id DESC LIMIT 26`;
  const items=rows.slice(0,25).map((r:Record<string,unknown>)=>({id:String(r.investigation_id),submissionId:String(r.submission_id),packageHash:String(r.package_hash),contextHash:String(r.context_hash),question:String(r.question),submittedAt:new Date(String(r.submitted_at)).toISOString()}));
  const history=await sql`SELECT decision_id,investigation_id,outcome,reviewed_at,decision_hash,decision_payload->>'packageHash' AS package_hash FROM hsi_review_decisions_v2 WHERE reviewer_principal=${actor.principalId} ORDER BY reviewed_at DESC,decision_id DESC LIMIT 25`;
  const last=rows[24];return {items,nextCursor:rows.length>25&&last?{at:String(last.cursor_time),id:String(last.submission_id)}:null,history:history.map((r:Record<string,unknown>)=>({decisionId:String(r.decision_id),id:String(r.investigation_id),outcome:String(r.outcome),reviewedAt:new Date(String(r.reviewed_at)).toISOString(),decisionHash:String(r.decision_hash),packageHash:String(r.package_hash)}))};
 }finally{await sql.close()}
}
