/** Trusted HSI backend: independently authenticated, transactional scientific review.
 * No agent or browser-provided reviewer identity is accepted.
 * Requires migration 008; this module never publishes graph claims.
 */
import {SQL} from "bun";
import {createHash} from "node:crypto";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {validateInterrogativeInvestigation,type InterrogativeInvestigation} from "../interrogativeContracts";
import {validateHsiScientificReview,type HsiScientificReviewDecision,type VerifiedScientificReviewer} from "../interrogativeScientificReview";
const canonical=(x:unknown):string=>Array.isArray(x)?"["+x.map(canonical).join(",")+"]":x&&typeof x==="object"?"{"+Object.entries(x as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}":JSON.stringify(x)??"null";
const hash=(x:unknown)=>createHash("sha256").update(canonical(x)).digest("hex");
type Config={databaseUrl:string;neonProjectId?:string|null;serverSessionToken:string|null|undefined};
async function verifiedActor(input:Config){
 const actor=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor?.authenticated||!actor.principalId.trim())throw Error("Verified HSI session required");
 return actor;
}
function connection(input:Config){
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
}
/** Submit an immutable investigation snapshot for independent review. */
export async function submitInterrogativeForReview(input:Config&{investigationId:string}):Promise<{state:"awaiting_scientific_review"}>{
 const actor=await verifiedActor(input);
 if(!actor.roles.some(r=>r==="researcher"||r==="research_admin"))throw Error("Researcher grant required");
 const sql=connection(input);
 try{
  await sql.begin(async tx=>{
   const rows=await tx`SELECT payload,content_hash,state FROM hsi_interrogative_investigations WHERE id=${input.investigationId} AND actor_principal=${actor.principalId} FOR UPDATE`;
   if(rows.length!==1)throw Error("Investigation not found or access denied");
   const i=rows[0]!.payload as InterrogativeInvestigation;
   validateInterrogativeInvestigation(i);
   if(hash(i)!==String(rows[0]!.content_hash)||i.state!=="draft"||rows[0]!.state!=="draft")throw Error("Investigation state or hash mismatch");
   const next={...i,state:"awaiting_scientific_review" as const};
   validateInterrogativeInvestigation(next);
   // Bun SQL JSON-encodes objects; JSON.stringify would store a jsonb string scalar.
   await tx`UPDATE hsi_interrogative_investigations SET payload=${next},content_hash=${hash(next)},state='awaiting_scientific_review' WHERE id=${i.id}`;
  });
  return {state:"awaiting_scientific_review"};
 }finally{await sql.close()}
}
/** One-shot human decision, locked and atomically persisted with updated investigation state. */
export async function recordAuthenticatedScientificReview(input:Config&{decision:HsiScientificReviewDecision}):Promise<{decisionId:string;outcome:HsiScientificReviewDecision["outcome"]}>{
 const actor=await verifiedActor(input);
 if(!actor.roles.includes("scientific_reviewer"))throw Error("Scientific reviewer grant required");
 const d=input.decision;
 if(d.reviewerPrincipal!==actor.principalId)throw Error("Reviewer principal mismatch");
 if(!await verifyHsiReviewerAuthority({principal:actor.principalId,reviewedAt:d.reviewedAt,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId}))throw Error("Current SSc reviewer authority required");
 const reviewer:VerifiedScientificReviewer={principalId:actor.principalId,authenticated:true,role:"scientific_reviewer",scope:"ssc",authorityVerifiedAt:new Date().toISOString()};
 const sql=connection(input);
 try{
  await sql.begin(async tx=>{
   const rows=await tx`SELECT payload,content_hash,state FROM hsi_interrogative_investigations WHERE id=${d.investigationId} FOR UPDATE`;
   if(rows.length!==1)throw Error("Investigation not found");
   const i=rows[0]!.payload as InterrogativeInvestigation;
   validateInterrogativeInvestigation(i);
   if(hash(i)!==String(rows[0]!.content_hash)||rows[0]!.state!=="awaiting_scientific_review")throw Error("Investigation integrity or state mismatch");
   validateHsiScientificReview({investigation:i,reviewer,decision:d});
   const existing=await tx`SELECT decision_id FROM hsi_interrogative_review_decisions WHERE investigation_id=${i.id}`;
   if(existing.length)throw Error("Review already decided");
   const next:InterrogativeInvestigation={...i,state:d.outcome==="approve_with_limitations"?"reviewed":d.outcome==="reject"?"rejected":"draft",review:d.outcome==="approve_with_limitations"?{reviewerPrincipal:actor.principalId,reviewDecisionId:d.decisionId,reviewedAt:d.reviewedAt}:null};
   validateInterrogativeInvestigation(next);
   await tx`INSERT INTO hsi_interrogative_review_decisions (decision_id,investigation_id,investigation_hash,reviewer_principal,outcome,decision_payload,decision_hash,reviewed_at) VALUES (${d.decisionId},${i.id},${hash(i)},${actor.principalId},${d.outcome},${d},${hash(d)},${d.reviewedAt}::timestamptz)`;
   await tx`UPDATE hsi_interrogative_investigations SET payload=${next},content_hash=${hash(next)},state=${next.state} WHERE id=${i.id}`;
  });
  return {decisionId:d.decisionId,outcome:d.outcome};
 }finally{await sql.close()}
}
