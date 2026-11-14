import {describe,it,expect} from "bun:test";
import {readFileSync} from "node:fs";
import {splitPostgresStatements,assertDisposableRehearsalTarget,PERSISTENCE_SCOPE_MIGRATIONS} from "../src/db/migrationRehearsal";
import {HELD_MIGRATION_IDS} from "../src/db/migrate";
describe("isolated migration rehearsal preparation",()=>{
 it("preserves quoted/dollar-quoted function bodies and nested comments",()=>{
  const sql=`-- comment ;\nCREATE FUNCTION f() RETURNS void AS $body$ BEGIN RAISE NOTICE 'quoted;'; END $body$ LANGUAGE plpgsql; /* outer ; /* inner ; */ */ SELECT 'it''s;', E'escape\\\';ok', "semi;column"; -- tail ;`;
  const statements=splitPostgresStatements(sql);expect(statements).toHaveLength(2);expect(statements[0]).toContain("RAISE NOTICE 'quoted;'");expect(statements[1]).toContain("\"semi;column\"");
 });
 it("rejects unterminated quote, dollar body and nested comment",()=>{
  for(const sql of ["SELECT 'oops","DO $$ BEGIN;","SELECT 1; /* open /* nested */"])expect(()=>splitPostgresStatements(sql)).toThrow("Unterminated");
 });
 it("splits the actual scope files without removing holds or including community writes",()=>{
  for(const name of PERSISTENCE_SCOPE_MIGRATIONS.contradiction_ledger)expect(splitPostgresStatements(readFileSync(`db/migrations/${name}.sql`,"utf8")).length).toBeGreaterThan(0);
  expect(HELD_MIGRATION_IDS).toHaveLength(11);expect(Object.values(PERSISTENCE_SCOPE_MIGRATIONS).flat().some(n=>n.startsWith("023"))).toBe(false);
 });
 it("requires an exact non-production expiring child pin before rehearsal",()=>{
  const now=Date.parse("2026-11-12T00:00:00Z"),pins={projectId:"fixture-hsi",productionBranchId:"fixture-production",disposableBranchId:"fixture-disposable"};
  const target={projectId:pins.projectId,branchId:pins.disposableBranchId,parentId:pins.productionBranchId,isDefault:false,isPrimary:false,expiresAt:new Date(now+3600000).toISOString()};
  expect(assertDisposableRehearsalTarget(target,pins,now).scopeActivationApproved).toBe(false);
  for(const change of [{projectId:"another-product"},{branchId:pins.productionBranchId},{parentId:null},{isDefault:true},{isPrimary:true},{expiresAt:null},{expiresAt:new Date(now-1).toISOString()}])expect(()=>assertDisposableRehearsalTarget({...target,...change},pins,now)).toThrow();
 });
});
