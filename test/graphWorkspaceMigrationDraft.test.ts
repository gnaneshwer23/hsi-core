import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";
import {splitPostgresStatements} from "../src/db/migrationRehearsal";

const ID="031_hsi_graph_workspace_storage",sql=readFileSync(`db/migrations/${ID}.sql`,"utf8");
test("031 is a draft and is held so db:migrate skips it",()=>{
 expect((HELD_MIGRATION_IDS as readonly string[]).includes(ID)).toBe(true);
 expect(sql.split("\n")[0]).toContain("DRAFT ONLY");expect(sql).toContain("ROLLBACK");
});
test("031 splits into statements and creates exactly the four tables",()=>{
 expect(splitPostgresStatements(sql).length).toBeGreaterThan(20);
 expect([...sql.matchAll(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g)].map(m=>m[1]).sort()).toEqual(["hsi_graph_investigations","hsi_ontology_mapping_recommendations","hsi_ontology_releases","hsi_ontology_terms"]);
});
test("every table is deny-by-default and never grants update, delete or truncate",()=>{
 for(const t of ["hsi_ontology_releases","hsi_ontology_terms","hsi_graph_investigations","hsi_ontology_mapping_recommendations"]){
  expect(sql).toContain(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`);expect(sql).toContain(`ALTER TABLE public.${t} FORCE ROW LEVEL SECURITY`);
 }
 expect(sql).toContain("FROM PUBLIC");expect(/GRANT\s/i.test(sql)).toBe(false);expect(/CREATE POLICY/i.test(sql)).toBe(false);expect(/current_setting/i.test(sql)).toBe(false);
});
test("recommendations have no approval column and investigations cannot carry approval",()=>{
 const rec=sql.slice(sql.indexOf("CREATE TABLE IF NOT EXISTS public.hsi_ontology_mapping_recommendations"),sql.indexOf("CREATE OR REPLACE FUNCTION public.hsi_mapping_recommendation_chain"));
 expect(/approv/i.test(rec.replace(/NOT an approved mapping/g,""))).toBe(false);
 expect(sql).toContain("record->>'scientificApproval'='false'");
});
test("the behavioural check script exists, is disposable-only, and covers each guarantee",()=>{
 const v=readFileSync("db/verify/031_graph_workspace_storage_checks.sql","utf8");
 expect(v).toContain("disposable");expect(v.trimEnd().endsWith("ROLLBACK;")).toBe(true);
 for(const k of ["broken chain","skipped revision","approval flag true","truncate","obsolete term","verified without principal","scalar record","missing approval key"])expect(v).toContain(k);
});

const P="032_hsi_graph_workspace_procedures",proc=readFileSync(`db/migrations/${P}.sql`,"utf8");
test("032 is held, a draft, and trusts no session or owner setting",()=>{
 expect((HELD_MIGRATION_IDS as readonly string[]).includes(P)).toBe(true);
 expect(proc.split("\n")[0]).toContain("DRAFT ONLY");expect(proc).toContain("ROLLBACK");
 expect(/current_setting\(/i.test(proc)).toBe(false);expect(/set_config\(/i.test(proc)).toBe(false);
 expect(splitPostgresStatements(proc).length).toBeGreaterThan(8);
});
test("every procedure is SECURITY DEFINER with a pinned search_path, revoked from PUBLIC, and validates the token first",()=>{
 const fns=[...proc.matchAll(/CREATE OR REPLACE FUNCTION public\.(hsi_graph_\w+)/g)].map(m=>m[1]);
 expect(fns.sort()).toEqual(["hsi_graph_get_investigation","hsi_graph_list_investigations","hsi_graph_list_recommendations","hsi_graph_ontology_lookup","hsi_graph_principal","hsi_graph_record_recommendation","hsi_graph_save_investigation"]);
 expect((proc.match(/SECURITY DEFINER SET search_path/g)??[]).length).toBe(fns.length);
 expect(proc).toContain("REVOKE ALL ON FUNCTION");
 for(const f of fns.filter(x=>x!=="hsi_graph_principal"))expect(proc.slice(proc.indexOf("FUNCTION public."+f+"(")).split("END $$;")[0]).toContain("public.hsi_graph_principal(p_token)");
});
test("the runtime role is granted EXECUTE on the six public procedures only, never the principal helper or tables",()=>{
 const grant=proc.slice(proc.indexOf("GRANT EXECUTE"));
 expect(grant).not.toContain("hsi_graph_principal");expect(/GRANT\s+(SELECT|INSERT|UPDATE|DELETE|ALL)/i.test(proc)).toBe(false);
 expect(proc).toContain("REVOKE ALL ON public.hsi_ontology_releases");
});
test("the procedure checks cover forged tokens, scoping, expiry, backdating and a non-superuser owner",()=>{
 const v=readFileSync("db/verify/032_graph_workspace_procedures_checks.sql","utf8");
 expect(v).toContain("NOSUPERUSER NOBYPASSRLS");expect(v.trimEnd()).toContain("ROLLBACK;");
 for(const k of ["forged guc still denied","expired","impersonated","revoked grant","backdated","B must not read A","B must see none"])expect(v).toContain(k);
});

const IMPORT="033_hsi_ontology_import_role",imp=readFileSync(`db/migrations/${IMPORT}.sql`,"utf8"),roles=readFileSync("db/roles/hsi_graph_roles.sql","utf8");
test("033 is a held draft that lets the import role insert reference data and nothing else",()=>{
 expect((HELD_MIGRATION_IDS as readonly string[]).includes(IMPORT)).toBe(true);expect(imp.split("\n")[0]).toContain("DRAFT ONLY");expect(imp).toContain("ROLLBACK");
 expect(/GRANT\s+(SELECT|UPDATE|DELETE|TRUNCATE|ALL)/i.test(imp)).toBe(false);expect(imp).toContain("GRANT INSERT ON public.hsi_ontology_releases,public.hsi_ontology_terms TO hsi_ontology_import");
 expect([...imp.matchAll(/CREATE POLICY (\w+) ON public\.(\w+) FOR (\w+) TO (\w+)/g)].map(m=>m.slice(1).join(" ")).sort()).toEqual(["hsi_ontology_import_insert hsi_ontology_releases INSERT hsi_ontology_import","hsi_ontology_import_insert hsi_ontology_terms INSERT hsi_ontology_import"]);
});
test("the roles file is an owner step, sets no password and never creates a privileged role",()=>{
 expect(roles.split("\n")[0]).toContain("NOT A MIGRATION");expect(/PASSWORD/i.test(roles.replace(/sets no passwords|Neon console|never in SQL/gi,"").replace(/--.*$/gm,""))).toBe(false);
 expect(roles.match(/NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION/g)?.length).toBe(2);expect(/\bBYPASSRLS\b/.test(roles.replace(/--.*$/gm,"").replace(/NOBYPASSRLS/g,""))).toBe(false);
 for(const r of ["hsi_graph_function_owner","hsi_graph_runtime","hsi_graph_runtime_login","hsi_ontology_import","hsi_ontology_import_login"])expect(roles).toContain(r);
 expect(roles).not.toContain("GRANT ALL");
});
test("the role checks assert unsafe attributes, no passwords and idempotence",()=>{
 const v=readFileSync("db/verify/033_roles_and_import_checks.sql","utf8");
 for(const k of ["unsafe attribute","must not set a password","Idempotent","import update release","runtime principal helper","import orphan term"])expect(v).toContain(k);expect(v.trimEnd().endsWith("ROLLBACK;")).toBe(true);
});

test("031 keeps PUBLIC away from the trigger functions, and the rehearsal result is recorded without real identifiers",()=>{
 expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.hsi_graph_block_mutation()");
 const result=readFileSync("docs/GRAPH_WORKSPACE_REHEARSAL_RESULT_20261114.md","utf8");
 expect(result).toContain("NOT accepted");expect(result).toContain("was **not** worked around");
 expect(/br-[a-z]+-[a-z]+-[a-z0-9]{6,}|red-wave-\d+|ep-[a-z]+-[a-z0-9-]+/.test(result)).toBe(false);
});
