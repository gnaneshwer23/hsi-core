import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {HsiReconciliationArtifactReader} from "../hsiAgentRecoveryReconciliation";
export function createHsiNeonReconciliationReader(config:{databaseUrl:string;neonProjectId?:string|null}):HsiReconciliationArtifactReader{
 const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return {async findCurrent(investigationId,taskId,attempt,version,inputHash){
  const sql=new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
  try{
   const rows=await sql`SELECT artifact_id,attempt,checkpoint_version,input_hash FROM hsi_agent_artifacts WHERE investigation_id=${investigationId} AND task_id=${taskId} AND attempt=${attempt} AND checkpoint_version=${version} AND input_hash=${inputHash} ORDER BY created_at LIMIT 2`;
   return rows.map((r:Record<string,unknown>)=>({artifactId:String(r.artifact_id),outputRef:"hsi-artifact:"+r.artifact_id,attempt:Number(r.attempt),checkpointVersion:Number(r.checkpoint_version),inputHash:String(r.input_hash)}));
  }finally{await sql.close()}
 }};
}
