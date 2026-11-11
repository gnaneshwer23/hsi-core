import {describe,expect,test} from "bun:test";
import {assertNoForgeableOwnerPolicy} from "../src/db/liveEvidencePolicyGate";
describe("A-01 policy fail-closed checks",()=>{
 test("rejects owner GUC policy",()=>{
  expect(()=>assertNoForgeableOwnerPolicy([{policyname:"owner",qual:"owner_id = current_setting('hsi.live_owner_id')",with_check:null}])).toThrow("forgeable");
 });
 test("rejects absent and blank policies",()=>{
  expect(()=>assertNoForgeableOwnerPolicy([])).toThrow();
  expect(()=>assertNoForgeableOwnerPolicy([{policyname:"x",qual:null,with_check:null}])).toThrow();
 });
 test("allows non-GUC syntax to proceed to independent review",()=>{
  expect(()=>assertNoForgeableOwnerPolicy([{policyname:"reviewed",qual:"owner_id = verified_owner()",with_check:"owner_id = verified_owner()"}])).not.toThrow();
 });
});
