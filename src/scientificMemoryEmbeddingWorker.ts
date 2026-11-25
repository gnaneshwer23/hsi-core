/** Explicit single-job fixture runner. No scheduler, network provider or production wiring. */
import {createScientificEmbeddingGateway,createSyntheticEmbeddingProvider} from "./scientificMemoryEmbeddingProvider";
import type {MemorySql} from "./db/scientificMemoryFixtureAdapter";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const scope=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
export type EmbeddingWorkerResult="idle"|"succeeded"|"lease_lost"|"failure_reported"|"unavailable";
export function createScientificEmbeddingFixtureWorker(sql:MemorySql){
 const gateway=createScientificEmbeddingGateway(createSyntheticEmbeddingProvider());
 return {async runOnce():Promise<EmbeddingWorkerResult>{
  try{
   const rows=await sql.unsafe("SELECT * FROM hsi_memory.claim_embedding()",[]);
   if(rows.length===0)return "idle";
   if(rows.length!==1)return "unavailable";
   const j=rows[0] as Record<string,unknown>|null;
   if(!j||typeof j.tenant_id!=="string"||!scope.test(j.tenant_id)||typeof j.scope_id!=="string"||!scope.test(j.scope_id)||typeof j.record_id!=="string"||!uuid.test(j.record_id)||typeof j.lease_id!=="string"||!uuid.test(j.lease_id)||typeof j.version!=="number"||!Number.isInteger(j.version)||j.version<1||j.version>2147483647||typeof j.body!=="string")return "unavailable";
   const keys=[j.tenant_id,j.scope_id,j.record_id,j.version,j.lease_id];
   let vector:number[];
   try{vector=await gateway.embed({text:j.body,dataClass:"synthetic_demo"});}
   catch{
    const result=await sql.unsafe("SELECT hsi_memory.fail_embedding($1::text,$2::text,$3::uuid,$4::integer,$5::uuid,$6::boolean) AS ok",[...keys,false]);
    return (result[0] as {ok?:unknown}|undefined)?.ok===true?"failure_reported":"lease_lost";
   }
   // Ambiguous database failures are left for lease recovery, not reported as provider failures.
   const result=await sql.unsafe("SELECT hsi_memory.finish_embedding($1::text,$2::text,$3::uuid,$4::integer,$5::uuid,$6::public.vector) AS ok",[...keys,JSON.stringify(vector)]);
   return (result[0] as {ok?:unknown}|undefined)?.ok===true?"succeeded":"lease_lost";
  }catch{return "unavailable";}
 },async recover(limit=25):Promise<number>{
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error("Invalid recovery limit");
  try{
   const rows=await sql.unsafe("SELECT hsi_memory.recover_embedding_jobs($1::integer) AS count",[limit]);
   const count=(rows[0] as {count?:unknown}|undefined)?.count;
   if(typeof count!=="number"||!Number.isInteger(count)||count<0||count>limit)throw Error();
   return count;
  }catch{throw Error("Recovery unavailable");}
 }};
}
