import {describe,expect,test} from "bun:test";
import {assertNoForgeableOwnerPolicy,assertVerifiedLiveOwnerPolicy,assertRestrictedLiveRuntime,assertAlignedLiveStagingHosts} from "../src/db/liveEvidencePolicyGate";
describe("A-01 policy fail-closed checks",()=>{
 test("accepts a pooled form of the same staging compute and rejects split identity/runtime targets",()=>{
  expect(()=>assertAlignedLiveStagingHosts("ep-fixture-stage.eu-west-2.aws.neon.tech","ep-fixture-stage-pooler.eu-west-2.aws.neon.tech","ep-fixture-stage")).not.toThrow();
  for(const [identity,runtime,pin] of [["ep-fixture-production.host","ep-fixture-stage-pooler.host","ep-fixture-stage"],["ep-fixture-stage.host","ep-fixture-stageevil.host","ep-fixture-stage"],["ep-hsi-staging.host","ep-hsi-staging-pooler.host","ep-hsi-staging"]])expect(()=>assertAlignedLiveStagingHosts(identity!,runtime!,pin!)).toThrow();
 });
 test("rejects owner login hidden behind SET ROLE and privileged memberships",()=>{
  const role={name:"hsi_live_runtime",login:"hsi_live_runtime",canlogin:true,inherit:false,bypass:false,superuser:false,createrole:false,createdb:false,table_exists:true,table_owner:false,auth_session_read:false,auth_user_read:false,schema_create:false,can_delete:false,can_truncate:false};
  expect(()=>assertRestrictedLiveRuntime([role],[])).not.toThrow();
  for(const change of [{login:"migration_owner"},{bypass:true},{inherit:true},{createrole:true},{table_owner:true},{auth_session_read:true},{auth_user_read:true},{schema_create:true},{can_truncate:true},{canlogin:false}])expect(()=>assertRestrictedLiveRuntime([{...role,...change}],[])).toThrow();
  expect(()=>assertRestrictedLiveRuntime([role],[{rolname:"privileged_owner_group"}])).toThrow();
 });
 const row={policyname:"hsi_live_verified_session_isolation",roles:["hsi_live_runtime"],cmd:"ALL",qual:"(owner_id = public.hsi_live_verified_owner())",with_check:"(owner_id = public.hsi_live_verified_owner())"};
 test("accepts only the exact reviewed owner equality and single runtime role",()=>{
  expect(()=>assertVerifiedLiveOwnerPolicy([row])).not.toThrow();
  for(const change of [{qual:row.qual+" OR true"},{with_check:"true OR "+row.with_check},{roles:["public"]},{cmd:"SELECT"},{qual:"owner_id = hsi_live_verified_owner"}])expect(()=>assertVerifiedLiveOwnerPolicy([{...row,...change}])).toThrow();
  expect(()=>assertVerifiedLiveOwnerPolicy([row,{...row,policyname:"extra_policy",qual:"true"}])).toThrow();
 });
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
