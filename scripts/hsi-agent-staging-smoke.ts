/** ARCH-009 staging-only database integration smoke test.
 * Invoke with HSI_STAGING_DATABASE_URL; no production URL is accepted.
 * Uses a transaction that is always rolled back. No patient data.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "../src/db/neonGuard";
const url=process.env.HSI_STAGING_DATABASE_URL;
if(!url)throw Error("HSI_STAGING_DATABASE_URL required");
const guard=assertHsiNeonDatabaseUrl(url,{neonProjectId:"red-wave-06625195"});
if(!guard.ok||!guard.host.includes(HSI_STAGING_HOST_PREFIX))throw Error("Refusing non-staging database");
const sql=new SQL(url,{tls:{rejectUnauthorized:true},connectionTimeout:10});
const key="hsi-smoke-"+crypto.randomUUID();
try{
 await sql.begin(async tx=>{
  const hash="a".repeat(64);
  const inserted=await tx`INSERT INTO hsi_agent_checkpoints(investigation_id,task_id,schema_version,attempt,state,version,input_hash,output_ref,error_code,started_at,finished_at) VALUES(${key},'planner','hsi-agent-checkpoint-1',1,'running',1,${hash},NULL,NULL,now(),NULL) RETURNING version`;
  if(inserted.length!==1)throw Error("Failed to claim checkpoint");
  const duplicate=await tx`INSERT INTO hsi_agent_checkpoints(investigation_id,task_id,schema_version,attempt,state,version,input_hash,output_ref,error_code,started_at,finished_at) VALUES(${key},'planner','hsi-agent-checkpoint-1',1,'running',1,${hash},NULL,NULL,now(),NULL) ON CONFLICT DO NOTHING RETURNING version`;
  if(duplicate.length!==0)throw Error("Duplicate checkpoint claim succeeded");
  const won=await tx`UPDATE hsi_agent_checkpoints SET version=2,state='completed',output_ref='artifact:smoke',finished_at=now() WHERE investigation_id=${key} AND task_id='planner' AND version=1 AND state='running' RETURNING version`;
  if(won.length!==1)throw Error("CAS completion failed");
  const stale=await tx`UPDATE hsi_agent_checkpoints SET version=2,state='failed',output_ref=NULL WHERE investigation_id=${key} AND task_id='planner' AND version=1 RETURNING version`;
  if(stale.length!==0)throw Error("Stale worker overwrote completion");
  // Force rollback after assertions. The thrown marker is swallowed outside.
  throw Error("HSI_SMOKE_ROLLBACK");
 });
}catch(e){if(!(e instanceof Error)||e.message!=="HSI_SMOKE_ROLLBACK")throw e}
finally{await sql.close()}
console.log("HSI staging smoke passed: checkpoint claim, duplicate rejection, CAS fencing; transaction rolled back");
