/** ARCH-009: trusted Neon checkpoint CAS adapter. Requires migration 009.
 * Never connect to a non-HSI Neon database.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import {validateHsiCheckpoint,type HsiCheckpointStore,type HsiDurableCheckpoint} from "../hsiAgentDurableCheckpoint";
export function createHsiNeonCheckpointStore(config:{databaseUrl:string;neonProjectId?:string|null}):HsiCheckpointStore{
 const guard=assertHsiNeonDatabaseUrl(config.databaseUrl,{neonProjectId:config.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const open=()=>new SQL(config.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 const toRecord=(r:Record<string,unknown>):HsiDurableCheckpoint=>({
  schemaVersion:"hsi-agent-checkpoint-1",investigationId:String(r.investigation_id),taskId:String(r.task_id),
  attempt:Number(r.attempt),state:r.state as HsiDurableCheckpoint["state"],version:Number(r.version),
  inputHash:String(r.input_hash),outputRef:r.output_ref===null?null:String(r.output_ref),
  errorCode:r.error_code===null?null:String(r.error_code),
  startedAt:new Date(r.started_at as string).toISOString(),
  finishedAt:r.finished_at===null?null:new Date(r.finished_at as string).toISOString()
 });
 return {
  async read(investigationId,taskId){
   const sql=open();try{const rows=await sql`SELECT * FROM hsi_agent_checkpoints WHERE investigation_id=${investigationId} AND task_id=${taskId} LIMIT 1`;
    if(!rows.length)return null;const c=toRecord(rows[0]!);validateHsiCheckpoint(c);return c;
   }finally{await sql.close()}
  },
  async compareAndSwap(expectedVersion,next){
   validateHsiCheckpoint(next);const sql=open();
   try{
    if(expectedVersion===null){
     if(next.version!==1)return false;
     const rows=await sql`INSERT INTO hsi_agent_checkpoints(investigation_id,task_id,schema_version,attempt,state,version,input_hash,output_ref,error_code,started_at,finished_at) VALUES(${next.investigationId},${next.taskId},${next.schemaVersion},${next.attempt},${next.state},${next.version},${next.inputHash},${next.outputRef},${next.errorCode},${next.startedAt}::timestamptz,${next.finishedAt}::timestamptz) ON CONFLICT DO NOTHING RETURNING version`;
     return rows.length===1;
    }
    if(next.version!==expectedVersion+1)return false;
    const rows=await sql`UPDATE hsi_agent_checkpoints SET attempt=${next.attempt},state=${next.state},version=${next.version},input_hash=${next.inputHash},output_ref=${next.outputRef},error_code=${next.errorCode},started_at=${next.startedAt}::timestamptz,finished_at=${next.finishedAt}::timestamptz,updated_at=now() WHERE investigation_id=${next.investigationId} AND task_id=${next.taskId} AND version=${expectedVersion} AND input_hash=${next.inputHash} RETURNING version`;
    return rows.length===1;
   }finally{await sql.close()}
  }
 };
}
