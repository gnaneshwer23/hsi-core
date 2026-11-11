/**
 * P0.2.5 read-only PostgreSQL authorization audit.
 * Returns NO-GO until tables exist, RLS is forced, restricted role has no
 * BYPASSRLS/ownership, and required grants are deliberately reviewed.
 * Does not grant roles, execute migrations or test live HTTP authorization.
 */
import {SQL} from "bun";
import {assertHsiNeonDatabaseUrl} from "./neonGuard";
export type AuthorizationFinding={name:string;passed:boolean;detail:string};
const TABLES=["hsi_contradiction_records","hsi_contradiction_review_events",
 "hsi_contradiction_tenant_memberships"] as const;
export function evaluateDatabaseAuthorization(input:{
 role:{name:string;bypassRls:boolean;superuser:boolean;canLogin:boolean};
 tables:readonly {name:string;exists:boolean;rlsEnabled:boolean;rlsForced:boolean;ownedByRole:boolean;
 canSelect:boolean;canInsert:boolean;canUpdate:boolean;canDelete:boolean}[];
}):{ready:boolean;findings:AuthorizationFinding[]}{
 const f:AuthorizationFinding[]=[];
 const check=(name:string,passed:boolean,detail:string)=>f.push({name,passed,detail});
 check("restricted_role",!input.role.superuser&&!input.role.bypassRls&&input.role.canLogin,
  "Role must be LOGIN, non-superuser and without BYPASSRLS");
 for(const name of TABLES){
  const t=input.tables.find(x=>x.name===name);
  check(name+"_rls",!!t?.exists&&!!t.rlsEnabled&&!!t.rlsForced&&!t.ownedByRole,
   "Table exists, ENABLE/FORCE RLS and restricted role does not own it");
  check(name+"_no_mutation",!!t&&!t.canUpdate&&!t.canDelete,
   "Restricted role cannot UPDATE or DELETE immutable records");
 }
 return {ready:f.every(x=>x.passed),findings:f};
}
export async function inspectContradictionAuthorization(input:{
 databaseUrl:string;neonProjectId?:string|null;restrictedRole:string
}){
 if(!/^[a-z_][a-z0-9_]{0,62}$/.test(input.restrictedRole))
  throw Error("Invalid restricted role name");
 const guard=assertHsiNeonDatabaseUrl(input.databaseUrl,{neonProjectId:input.neonProjectId});
 if(!guard.ok)throw Error("HSI database guard: "+guard.reason);
 const sql=new SQL(input.databaseUrl,{tls:{rejectUnauthorized:true},connectionTimeout:10});
 try{
  const roles=await sql`SELECT rolname,rolsuper,rolbypassrls,rolcanlogin
   FROM pg_roles WHERE rolname=${input.restrictedRole}`;
  if(roles.length!==1)throw Error("Restricted database role not found");
  const rows=await sql`SELECT c.relname,c.relrowsecurity,c.relforcerowsecurity,
   pg_get_userbyid(c.relowner) AS owner,
   has_table_privilege(${input.restrictedRole},c.oid,'SELECT') AS can_select,
   has_table_privilege(${input.restrictedRole},c.oid,'INSERT') AS can_insert,
   has_table_privilege(${input.restrictedRole},c.oid,'UPDATE') AS can_update,
   has_table_privilege(${input.restrictedRole},c.oid,'DELETE') AS can_delete
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relkind IN ('r','p')
   AND c.relname IN ('hsi_contradiction_records','hsi_contradiction_review_events',
     'hsi_contradiction_tenant_memberships')`;
  const r=roles[0]!;
  return evaluateDatabaseAuthorization({
   role:{name:String(r.rolname),superuser:r.rolsuper===true,bypassRls:r.rolbypassrls===true,
    canLogin:r.rolcanlogin===true},
   tables:rows.map(t=>({name:String(t.relname),exists:true,rlsEnabled:t.relrowsecurity===true,
    rlsForced:t.relforcerowsecurity===true,ownedByRole:t.owner===input.restrictedRole,
    canSelect:t.can_select===true,canInsert:t.can_insert===true,
    canUpdate:t.can_update===true,canDelete:t.can_delete===true}))
  });
 }finally{await sql.close();}
}
