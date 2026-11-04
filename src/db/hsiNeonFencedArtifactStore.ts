/** ARCH-009: guarded Neon idempotent artifact sink. Migration 010 required.
 * The DB trigger locks and validates the checkpoint row at insertion.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
import type {HsiFencedArtifactStore,HsiFencedArtifact} from "../hsiFencedArtifact";
export function createHsiNeonFencedArtifactStore(input:{databaseUrl:string;neonProjectId?:string|null}):HsiFencedArtifactStore{
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 return {
  async commitIfCurrent({fence,idempotencyKey,contentHash,payload}):Promise<HsiFencedArtifact>{
   const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
   try{
    return await sql.begin(async tx=>{
     const cp=await tx`SELECT version,attempt,state,input_hash FROM hsi_agent_checkpoints WHERE investigation_id=${fence.investigationId} AND task_id=${fence.taskId} FOR UPDATE`;
     if(cp.length!==1||Number(cp[0]!.version)!==fence.checkpointVersion||Number(cp[0]!.attempt)!==fence.attempt||cp[0]!.state!=="running"||cp[0]!.input_hash!==fence.inputHash)throw Error("Stale or cancelled execution fence");
     const existing=await tx`SELECT artifact_id,content_hash FROM hsi_agent_artifacts WHERE idempotency_key=${idempotencyKey}`;
     if(existing.length){
      if(existing[0]!.content_hash!==contentHash)throw Error("Idempotency conflict: output differs");
      return {artifactId:String(existing[0]!.artifact_id),contentHash,outputRef:"hsi-artifact:"+existing[0]!.artifact_id,fence};
     }
     const artifactId="hsi-artifact-"+crypto.randomUUID();
     const rows=await tx`INSERT INTO hsi_agent_artifacts(artifact_id,idempotency_key,investigation_id,task_id,attempt,checkpoint_version,input_hash,content_hash,payload) VALUES(${artifactId},${idempotencyKey},${fence.investigationId},${fence.taskId},${fence.attempt},${fence.checkpointVersion},${fence.inputHash},${contentHash},${payload}) ON CONFLICT(idempotency_key) DO NOTHING RETURNING artifact_id`;
     if(rows.length===0){
      const raced=await tx`SELECT artifact_id,content_hash FROM hsi_agent_artifacts WHERE idempotency_key=${idempotencyKey}`;
      if(raced.length!==1||raced[0]!.content_hash!==contentHash)throw Error("Idempotency conflict");
      return {artifactId:String(raced[0]!.artifact_id),contentHash,outputRef:"hsi-artifact:"+raced[0]!.artifact_id,fence};
     }
     return {artifactId,contentHash,outputRef:"hsi-artifact:"+artifactId,fence};
    });
   }finally{await sql.close()}
  }
 };
}
