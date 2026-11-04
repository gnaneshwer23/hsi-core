/** Read-only decision history. Identity and scope are resolved only on the trusted backend. */
import {SQL} from "bun";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
import {verifyHsiReviewerAuthority} from "./reviewerAuthority";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
export type ReviewHistoryItem={decisionId:string;investigationId:string;outcome:string;reviewedAt:string;reviewerPrincipal:string;investigationHash:string;decisionHash:string};
export async function loadScientificReviewHistory(input:{serverSessionToken:string|null;databaseUrl:string;neonProjectId?:string|null;limit?:number}):Promise<{items:ReviewHistoryItem[]}>{
 const actor=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor?.authenticated||!actor.roles.includes("scientific_reviewer"))throw Error("Verified scientific reviewer required");
 if(!await verifyHsiReviewerAuthority({principal:actor.principalId,reviewedAt:new Date().toISOString(),databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId}))throw Error("Active SSc reviewer authority required");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database target denied");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const limit=Math.min(Math.max(input.limit??30,1),50);
  const rows=await sql`SELECT decision_id,investigation_id,outcome,reviewed_at,reviewer_principal,investigation_hash,decision_hash FROM hsi_interrogative_review_decisions WHERE reviewer_principal=${actor.principalId} ORDER BY reviewed_at DESC,decision_id DESC LIMIT ${limit}`;
  return {items:rows.map((r:Record<string,unknown>)=>({decisionId:String(r.decision_id),investigationId:String(r.investigation_id),outcome:String(r.outcome),reviewedAt:new Date(String(r.reviewed_at)).toISOString(),reviewerPrincipal:String(r.reviewer_principal),investigationHash:String(r.investigation_hash),decisionHash:String(r.decision_hash)}))};
 }finally{await sql.close()}
}
