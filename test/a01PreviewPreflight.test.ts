import {describe,it,expect} from "bun:test";
import {inspectA01Preview} from "../src/db/a01PreviewPreflight";
describe("A-01 preview-only preflight",()=>{
 it("fails closed when role and migration are missing",async()=>{
  const report=await inspectA01Preview({query:async()=>[]});
  expect(report.readyForIndependentReview).toBe(false);
  expect(report.readyForLiveWrites).toBe(false);
  expect(report.checks.every(c=>!c.pass)).toBe(true);
 });
 it("fails closed when database queries throw",async()=>{
  const report=await inspectA01Preview({query:async()=>{throw Error("permission denied")}});
  expect(report.readyForIndependentReview).toBe(false);
  expect(report.readyForLiveWrites).toBe(false);
 });
 it("rejects an RLS-bypassing runtime role",async()=>{
  const report=await inspectA01Preview({query:async sql=>sql.includes("FROM pg_roles")?[{rolname:"hsi_live_runtime",rolcanlogin:true,rolinherit:false,rolbypassrls:true,rolsuper:false,rolcreaterole:false,rolcreatedb:false}]:[]});
  expect(report.checks.find(c=>c.id==="runtime-role")?.pass).toBe(false);
 });
});
