/** ARCH-009 operational verification harness for HSI staging only.
 * Requires HSI_STAGING_DATABASE_URL. Does not run automatically in CI.
 * Runs two independent Bun SQL connections against a single staging checkpoint.
 * All writes use unique test IDs and are deleted by rollback-contained transactions
 * where possible; operational test artifacts use explicit cleanup in finally.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl,HSI_STAGING_HOST_PREFIX} from "../src/db/neonGuard";
import {createHsiNeonCheckpointStore} from "../src/db/hsiNeonCheckpointStore";
import {createHsiNeonFencedArtifactStore} from "../src/db/hsiNeonFencedArtifactStore";
import {hashHsiCheckpointInput,startHsiCheckpoint,finishHsiCheckpoint} from "../src/hsiAgentDurableCheckpoint";
import {commitHsiFencedArtifact} from "../src/hsiFencedArtifact";
const url=process.env.HSI_STAGING_DATABASE_URL;
if(!url)throw Error("HSI_STAGING_DATABASE_URL is required");
const guard=assertHsiNeonDatabaseUrl(url,{neonProjectId:"red-wave-06625195"});
if(!guard.ok||!guard.host.includes(HSI_STAGING_HOST_PREFIX))throw Error("Refusing non-staging target");
const sql=new SQL(url,{tls:{rejectUnauthorized:true},connectionTimeout:10});
const id="hsi-e2e-"+crypto.randomUUID();
const store=createHsiNeonCheckpointStore({databaseUrl:url,neonProjectId:"red-wave-06625195"});
const artifacts=createHsiNeonFencedArtifactStore({databaseUrl:url,neonProjectId:"red-wave-06625195"});
const inputHash=hashHsiCheckpointInput({scenario:"multi-worker-restart"});
const base={store,investigationId:id,taskId:"planner",inputHash,startedAt:new Date().toISOString()};
const assert=(ok:unknown,message:string)=>{if(!ok)throw Error(message)};
try{
 const results=await Promise.allSettled([startHsiCheckpoint(base),startHsiCheckpoint(base)]);
 const winners=results.filter(r=>r.status==="fulfilled");
 assert(winners.length===1,"Exactly one worker must win initial checkpoint");
 const claimed=(winners[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof startHsiCheckpoint>>>).value;
 const persisted=await createHsiNeonCheckpointStore({databaseUrl:url,neonProjectId:"red-wave-06625195"}).read(id,"planner");
 assert(persisted?.version===1&&persisted.state==="running","Checkpoint must survive a new store instance");
 const fence={investigationId:id,taskId:"planner",attempt:claimed.attempt,checkpointVersion:claimed.version,inputHash};
 const [first,second]=await Promise.all([
  commitHsiFencedArtifact({store:artifacts,fence,logicalOutputId:"result",payload:"bounded research artifact"}),
  commitHsiFencedArtifact({store:artifacts,fence,logicalOutputId:"result",payload:"bounded research artifact"})
 ]);
 assert(first.artifactId===second.artifactId,"Idempotent concurrent writes must return same artifact");
 const completed=await finishHsiCheckpoint({store,checkpoint:claimed,state:"completed",outputRef:first.outputRef,finishedAt:new Date().toISOString()});
 assert(completed.version===2,"Completion must advance checkpoint version");
 const late=await Promise.allSettled([
  commitHsiFencedArtifact({store:artifacts,fence,logicalOutputId:"late",payload:"late result"}),
  finishHsiCheckpoint({store,checkpoint:claimed,state:"failed",errorCode:"late",finishedAt:new Date().toISOString()})
 ]);
 assert(late.every(x=>x.status==="rejected"),"Late artifact and stale worker completion must both fail");
 console.log("PASS multi-worker claim, restart persistence, concurrent idempotency, stale-worker fences");
}finally{
 // The test uses a unique investigation ID. Delete only test-owned records,
 // preserving referential integrity. Never clean arbitrary investigation IDs.
 try{
  await sql.begin(async tx=>{
   await tx`DELETE FROM hsi_agent_artifacts WHERE investigation_id=${id}`;
   await tx`DELETE FROM hsi_agent_checkpoints WHERE investigation_id=${id}`;
  });
 }catch(e){console.error("Manual cleanup required for test investigation",id);throw e}
 finally{await sql.close()}
}
