/** Trusted backend recovery: authenticated operator, atomic checkpoint transition
 * and append-only decision record in one transaction. Migration 009 required.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {authenticateHsiNeonSession} from "./neonAuthResearchActor";
export async function authoriseAndRecoverHsiCheckpoint(input:{
 databaseUrl:string;neonProjectId?:string|null;serverSessionToken:string|null|undefined;
 investigationId:string;taskId:string;inputHash:string;reason:string;decisionId:string;staleAfterSeconds?:number;
}):Promise<{attempt:number;version:number;state:"running"}>{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const actor=await authenticateHsiNeonSession({sessionToken:input.serverSessionToken,databaseUrl:input.databaseUrl,neonProjectId:input.neonProjectId});
 if(!actor?.authenticated||!actor.roles.includes("research_admin"))throw Error("Authenticated research administrator required");
 if(!input.reason.trim()||input.reason.length>2000||!input.decisionId.trim()||!input.investigationId.trim()||!input.taskId.trim()||!/^[a-f0-9]{64}$/.test(input.inputHash))throw Error("Invalid recovery request");
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  return await sql.begin(async tx=>{
   const rows=await tx`SELECT version,attempt,state,input_hash FROM hsi_agent_checkpoints WHERE investigation_id=${input.investigationId} AND task_id=${input.taskId} FOR UPDATE`;
   if(rows.length!==1)throw Error("Checkpoint unavailable");
   const r=rows[0]!;
   if(String(r.input_hash)!==input.inputHash||!["failed","blocked","cancelled"].includes(String(r.state))||Number(r.attempt)>=3)throw Error("Checkpoint not recoverable");
   const version=Number(r.version)+1,attempt=Number(r.attempt)+1;
   await tx`INSERT INTO hsi_agent_recovery_decisions(decision_id,investigation_id,task_id,prior_version,next_version,operator_principal,reason) VALUES(${input.decisionId},${input.investigationId},${input.taskId},${r.version},${version},${actor.principalId},${input.reason})`;
   const updated=await tx`UPDATE hsi_agent_checkpoints SET version=${version},attempt=${attempt},state='running',output_ref=NULL,error_code=NULL,started_at=now(),finished_at=NULL,updated_at=now() WHERE investigation_id=${input.investigationId} AND task_id=${input.taskId} AND version=${r.version} RETURNING version`;
   if(updated.length!==1)throw Error("Recovery conflict");
   return {attempt,version,state:"running" as const};
  });
 }finally{await sql.close()}
}
