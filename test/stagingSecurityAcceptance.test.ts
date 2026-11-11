import {describe,expect,test} from "bun:test";
import {inspectStagingSecurityAcceptance} from "../src/evidence/stagingSecurityAcceptance";
import type {ReadonlySqlClient} from "../src/evidence/neonEvidenceSchemaReadiness";

describe("P1.10 fail-closed staging acceptance",()=>{
 test("rejects absent role, policies and schema",async()=>{
  const db:ReadonlySqlClient={query:async()=>[]};
  const result=await inspectStagingSecurityAcceptance(db);
  expect(result.schemaReady).toBe(false);
  expect(result.applicationRolePresent).toBe(false);
  expect(result.expectedPoliciesPresent).toBe(false);
  expect(result.readyForSyntheticIntegrationTests).toBe(false);
 });
 test("rejects superuser/bypassRLS even when role exists",async()=>{
  const db:ReadonlySqlClient={query:async(sql)=>{
   if(sql.includes("FROM pg_roles")&&sql.includes("rolbypassrls"))
    return [{rolname:"hsi_evidence_app",rolbypassrls:true,rolsuper:false}] as never;
   return [] as never;
  }};
  const result=await inspectStagingSecurityAcceptance(db);
  expect(result.applicationRoleCannotBypassRls).toBe(false);
  expect(result.readyForSyntheticIntegrationTests).toBe(false);
 });
});
