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
 expect(sql).toContain("FROM PUBLIC");expect(/GRANT\s/i.test(sql)).toBe(false);expect(/FOR\s+(UPDATE|DELETE|ALL)\b/i.test(sql)).toBe(false);
});
test("recommendations have no approval column and investigations cannot carry approval",()=>{
 const rec=sql.slice(sql.indexOf("CREATE TABLE IF NOT EXISTS public.hsi_ontology_mapping_recommendations"),sql.indexOf("CREATE OR REPLACE FUNCTION public.hsi_mapping_recommendation_chain"));
 expect(/approv/i.test(rec.replace(/NOT an approved mapping/g,""))).toBe(false);
 expect(sql).toContain("record->>'scientificApproval'='false'");
});
test("the behavioural check script exists, is disposable-only, and covers each guarantee",()=>{
 const v=readFileSync("db/verify/031_graph_workspace_storage_checks.sql","utf8");
 expect(v).toContain("disposable");expect(v.trimEnd().endsWith("ROLLBACK;")).toBe(true);
 for(const k of ["broken chain","skipped revision","approval flag true","truncate","obsolete term","verified without principal","insert for another owner"])expect(v).toContain(k);
});
