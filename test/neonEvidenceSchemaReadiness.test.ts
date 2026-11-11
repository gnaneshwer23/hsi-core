import {describe,expect,test} from "bun:test";
import {inspectNeonEvidenceSchema,type ReadonlySqlClient}
 from "../src/evidence/neonEvidenceSchemaReadiness";
const names=["hsi_research_evidence_snapshots","hsi_research_evidence_review_events"];
const constraints=[
 "hsi_research_evidence_snapshots_pkey",
 "hsi_research_evidence_snapshots_organization_id_idempotency_key_key",
 "hsi_research_evidence_review_events_pkey",
 "hsi_research_evidence_review_events_organization_id_snapshot_id_key",
];
describe("P1.6 Neon schema readiness",()=>{
 test("fails closed on absent staging tables",async()=>{
  const db:ReadonlySqlClient={query:async()=>[]};
  const result=await inspectNeonEvidenceSchema(db);
  expect(result.readyForIntegrationTests).toBe(false);
  expect(result.migrationAppliedByThisCheck).toBe(false);
 });
 test("requires RLS, FORCE RLS and constraints",async()=>{
  const db:ReadonlySqlClient={query:async(sql)=>sql.includes("pg_constraint")
   ?constraints.map(conname=>({conname})) as never
   :names.map(tablename=>({tablename,rowsecurity:true,forcerowsecurity:true})) as never};
  const result=await inspectNeonEvidenceSchema(db);
  expect(result.readyForIntegrationTests).toBe(true);
 });
 test("rejects table with disabled RLS",async()=>{
  const db:ReadonlySqlClient={query:async(sql)=>sql.includes("pg_constraint")
   ?constraints.map(conname=>({conname})) as never
   :names.map((tablename,i)=>({tablename,rowsecurity:i!==0,forcerowsecurity:true})) as never};
  expect((await inspectNeonEvidenceSchema(db)).readyForIntegrationTests).toBe(false);
 });
});
