import {describe,expect,test} from "bun:test";
import {
 assertCatalogComplete,
 catalogCoverage,
 evidenceKindForCheck,
 httpProbesForScope,
 probesForScope,
 ISOLATION_PROBE_CATALOG,
} from "../src/db/isolationProbeCatalog";
import {PERSISTENCE_SECURITY_CHECKS} from "../src/db/persistenceSecurityAcceptance";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";
import {createStagingIsolationSuite} from "../src/db/stagingIsolationSuite";
import {PERSISTENCE_SCOPE_MIGRATIONS} from "../src/db/migrationRehearsal";

describe("isolation probe catalog (A3.2)",()=>{
 test("covers every persistence security check and excludes HTTP for catalogue/rehearsal/restore",()=>{
  expect(()=>assertCatalogComplete()).not.toThrow();
  const{missing,covered,httpExcluded}=catalogCoverage();
  expect(missing).toEqual([]);
  expect(covered.length).toBe(PERSISTENCE_SECURITY_CHECKS.length);
  expect(httpExcluded).toEqual([
   "restricted_role_no_bypassrls",
   "production_readonly_confirmed",
   "migration_rollback_verified",
   "backup_restore_verified",
  ]);
  for(const check of httpExcluded)expect(evidenceKindForCheck(check)).not.toBe("authenticated_http");
 });

 test("HTTP probes stay on /api/research and known scopes",()=>{
  for(const p of ISOLATION_PROBE_CATALOG){
   expect(Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,p.scope)).toBe(true);
   if(p.kind!=="authenticated_http")continue;
   expect(p.probe.path.startsWith("/api/research/")).toBe(true);
   expect(p.probe.method).toBe("GET");
  }
 });

 test("scope filters return catalog rows",()=>{
  expect(probesForScope("interrogative_workspace").length).toBeGreaterThan(5);
  expect(httpProbesForScope("graph_workspace").some(p=>p.id==="gw_e2e")).toBe(true);
 });
});

describe("staging isolation suite (A3.2)",()=>{
 const sha="c".repeat(40);

 test("check mode is CI-safe and never accepts",async()=>{
  const suite=createStagingIsolationSuite({mode:"check",scope:"interrogative_workspace",commitSha:sha});
  const r=await suite.run();
  expect(r.schemaVersion).toBe("hsi-isolation-suite-1");
  expect(r.catalogComplete).toBe(true);
  expect(r.acceptedForScope).toBe(false);
  expect(r.productionActivationApproved).toBe(false);
  expect(r.scientificApproval).toBe(false);
  expect(r.productionUntouched).toBe(true);
  expect(r.heldMigrationsUnchanged).toBe(true);
  expect(r.heldMigrationCount).toBe(HELD_MIGRATION_IDS.length);
  expect(r.httpObservations).toEqual([]);
  expect(r.note).toMatch(/No HTTP/);
 });

 test("fixture mode matches a synthetic positive control without accepting",async()=>{
  const suite=createStagingIsolationSuite({mode:"fixture",scope:"interrogative_workspace",commitSha:sha});
  const r=await suite.run();
  expect(r.fixture).toBe(true);
  expect(r.acceptedForScope).toBe(false);
  expect(r.httpObservations.length).toBeGreaterThan(0);
  expect(r.httpObservations.every(o=>o.outcome==="matched")).toBe(true);
  expect(JSON.stringify(r)).not.toContain("cookie");
 });

 test("live mode refuses without owner enable + disposable pins",async()=>{
  const suite=createStagingIsolationSuite({mode:"live",scope:"interrogative_workspace",commitSha:sha,enabled:true});
  await expect(suite.run()).rejects.toThrow(/disposable target/);
  const disabled=createStagingIsolationSuite({mode:"live",scope:"interrogative_workspace",commitSha:sha});
  await expect(disabled.run()).rejects.toThrow(/disabled/);
 });

 test("live mode verifies disposable branch pin before probes",async()=>{
  const suite=createStagingIsolationSuite({
   mode:"live",
   scope:"graph_workspace",
   commitSha:sha,
   enabled:true,
   target:{
    projectId:"hsi-neon-project",
    branchId:"ep-hsi-disposable-rehearsal",
    parentId:"ep-hsi-production",
    isDefault:false,
    isPrimary:false,
    expiresAt:new Date(Date.now()+3_600_000).toISOString(),
   },
   pins:{
    projectId:"hsi-neon-project",
    productionBranchId:"ep-hsi-production",
    disposableBranchId:"ep-hsi-disposable-rehearsal",
   },
   origin:"https://staging.invalid",
   approvedOrigin:"https://staging.invalid",
   productionOrigins:["https://www.humansuperintelligence.tech"],
   authorize:async()=>false,
  });
  const r=await suite.run();
  // authorize false → observations fail, never accepted
  expect(r.acceptedForScope).toBe(false);
  expect(r.productionUntouched).toBe(true);
  expect(r.httpObservations[0]?.outcome).toBe("failed");
 });
});
