/** P1.7: server-only Postgres transaction bridge.
 * Supply a real trusted driver pool. Never import this module into browser code.
 * The dedicated role must be non-owner, non-BYPASSRLS, and granted scoped RLS policies.
 */
import type {EvidenceDatabase,EvidenceTransaction,SqlRow}
 from "./transactionalEvidenceReview";
export interface PostgresConnection{
 query<T extends SqlRow=SqlRow>(sql:string,params?:readonly unknown[]):
   Promise<{rows:T[]}>;
 release():void;
}
export interface PostgresPool{
 connect():Promise<PostgresConnection>;
}
const ORG=/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
export function createNeonEvidenceDatabase(pool:PostgresPool):EvidenceDatabase{
 return {
  async transaction<T>(organizationId:string,fn:(tx:EvidenceTransaction)=>Promise<T>):Promise<T>{
   if(!ORG.test(organizationId))throw new Error("Invalid organization scope");
   const client=await pool.connect();
   let began=false;
   try{
    await client.query("BEGIN");
    began=true;
    // Local claims disappear at transaction boundary. These alone do NOT
    // authenticate the user: a trusted gateway must verify the principal.
    await client.query("SELECT set_config('hsi.organization_id', $1, true)",[organizationId]);
    const tx:EvidenceTransaction={
      async query<R extends SqlRow=SqlRow>(sql:string,params:readonly unknown[]){
        if(!/^\s*(SELECT|INSERT|UPDATE)\b/i.test(sql))
          throw new Error("Unsupported evidence SQL operation");
        const result=await client.query<R>(sql,params);
        return result.rows;
      },
    };
    const result=await fn(tx);
    await client.query("COMMIT");
    began=false;
    return result;
   }catch(error){
    if(began){
      try{await client.query("ROLLBACK");}
      catch(rollbackError){throw new AggregateError([error,rollbackError],
        "Transaction and rollback both failed");}
    }
    throw error;
   }finally{client.release();}
  },
 };
}
