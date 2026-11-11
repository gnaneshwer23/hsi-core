/** P1.12.3: server-only restricted Neon evidence connection.
 * No migrations, role grants, API routes or production environment changes.
 * The supplied URL must use a dedicated non-owner LOGIN role: NEVER the
 * neondb_owner connection or the staging-only SET ROLE workaround.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "../db/neonGuard";
import type {PostgresPool,PostgresConnection} from "./neonEvidenceDatabase";
import type {SqlRow} from "./transactionalEvidenceReview";

const IDENTIFIER=/^[a-z_][a-z0-9_]{0,62}$/;
export function createRestrictedNeonEvidencePool(input:{
  databaseUrl:string;neonProjectId?:string|null;expectedRole:string;
}):PostgresPool{
 const check=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!check.ok)throw new Error("HSI evidence database target rejected");
 if(!IDENTIFIER.test(input.expectedRole)||input.expectedRole==="neondb_owner"||
   input.expectedRole==="postgres")throw new Error("Invalid restricted evidence role");
 const parsed=new URL(input.databaseUrl);
 if(decodeURIComponent(parsed.username)!==input.expectedRole)
   throw new Error("Evidence connection must authenticate as restricted role");
 return {
  async connect():Promise<PostgresConnection>{
   const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10,max:1});
   try{
    const rows=await sql`SELECT current_user::text AS role_name,
       r.rolsuper AS superuser,r.rolbypassrls AS bypass_rls,
       r.rolcanlogin AS can_login,
       EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
         WHERE n.nspname='public' AND c.relname='hsi_research_evidence_snapshots'
           AND c.relowner=r.oid) AS owns_snapshots,
       EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
         WHERE n.nspname='public' AND c.relname='hsi_research_evidence_review_events'
           AND c.relowner=r.oid) AS owns_reviews
       FROM pg_roles r WHERE r.rolname=current_user`;
    const role=rows[0];
    if(rows.length!==1||role.role_name!==input.expectedRole||
      role.superuser!==false||role.bypass_rls!==false||role.can_login!==true||
      role.owns_snapshots!==false||role.owns_reviews!==false)
      throw new Error("Restricted evidence role verification failed");
    let closed=false;
    return {
      async query<T extends SqlRow=SqlRow>(statement:string,params?:readonly unknown[]){
        if(closed)throw new Error("Evidence connection already released");
        const result=await sql.unsafe(statement,[...(params??[])]);
        return {rows:result as T[]};
      },
      release(){
        if(!closed){closed=true;void sql.close();}
      },
    };
   }catch(error){await sql.close();throw error;}
  },
 };
}
