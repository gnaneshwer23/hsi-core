import {describe,expect,test} from "bun:test";
import {
 assertCatalogComplete,
 catalogCoverage,
 evidenceKindForCheck,
 httpProbesForScope,
 probesForScope,
 ISOLATION_PROBE_CATALOG,
 HTTP_EXCLUDED_CHECKS,
} from "../src/db/isolationProbeCatalog";
import {PERSISTENCE_SECURITY_CHECKS} from "../src/db/persistenceSecurityAcceptance";
import {HELD_MIGRATION_IDS} from "../src/db/migrationHolds";
import {createStagingIsolationSuite} from "../src/db/stagingIsolationSuite";
import {PERSISTENCE_SCOPE_MIGRATIONS} from "../src/db/migrationRehearsal";

describe("isolation probe catalog (A3.2)",()=>{
 test("covers every persistence security check and excludes HTTP for catalogue/rehearsal/restore/write/concurrency",()=>{
  expect(()=>assertCatalogComplete()).not.toThrow();
  const{missing,covered,httpExcluded}=catalogCoverage();
  expect(missing).toEqual([]);
  expect(covered.length).toBe(PERSISTENCE_SECURITY_CHECKS.length);
  expect(new Set(httpExcluded)).toEqual(HTTP_EXCLUDED_CHECKS);
  for(const check of httpExcluded)expect(evidenceKindForCheck(check)).not.toBe("authenticated_http");
 });

 test("HTTP probes stay on real /api/research routes with distinct probe ids",()=>{
  const seen=new Set<string>();
  for(const p of ISOLATION_PROBE_CATALOG){
   expect(Object.hasOwn(PERSISTENCE_SCOPE_MIGRATIONS,p.scope)).toBe(true);
   if(p.kind!=="authenticated_http")continue;
   expect(p.probe.path.startsWith("/api/research/")).toBe(true);
   expect(p.probe.path.includes(`probe=${p.probe.id}`)).toBe(true);
   expect(p.probe.method).toBe("GET");
   expect(seen.has(p.probe.path)).toBe(false);
   seen.add(p.probe.path);
   expect(p.probe.path.includes("/interrogative/fixture")).toBe(false);
   expect(p.probe.path.includes("/live-investigation?")).toBe(false);
  }
 });

 test("scope coverage reports gaps honestly while global catalog is complete",()=>{
  expect(catalogCoverage().missing).toEqual([]);
  const graph=catalogCoverage("graph_workspace");
  expect(graph.covered.length).toBeGreaterThan(0);
  expect(graph.missing.length).toBeGreaterThan(0);
 });

 test("scope filters return catalog rows",()=>{
  expect(probesForScope("interrogative_workspace").length).toBeGreaterThan(5);
  expect(httpProbesForScope("graph_workspace").some(p=>p.id==="gw_e2e")).toBe(true);
  expect(httpProbesForScope("live_evidence").every(p=>p.path.startsWith("/api/research/live-investigations"))).toBe(true);
 });
});

describe("staging isolation suite (A3.2)",()=>{
 const sha="c".repeat(40);
 const schema="d".repeat(64);
 const runtime="e".repeat(64);
 const disposableTarget={
  projectId:"hsi-neon-project",
  branchId:"ep-hsi-disposable-rehearsal",
  parentId:"ep-hsi-production",
  isDefault:false as const,
  isPrimary:false as const,
  expiresAt:new Date(Date.now()+3_600_000).toISOString(),
 };
 const pins={
  projectId:"hsi-neon-project",
  productionBranchId:"ep-hsi-production",
  disposableBranchId:"ep-hsi-disposable-rehearsal",
 };

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
  expect(r.coverage.missing).toEqual([]);
  expect(r.coverage.scopeMissing.length).toBeGreaterThan(0);
  expect(r.note).toMatch(/No HTTP/);
 });

 test("fixture mode matches a synthetic positive control without accepting or leaking sessions",async()=>{
  const suite=createStagingIsolationSuite({mode:"fixture",scope:"interrogative_workspace",commitSha:sha});
  const r=await suite.run();
  expect(r.fixture).toBe(true);
  expect(r.acceptedForScope).toBe(false);
  expect(r.httpObservations.length).toBeGreaterThan(0);
  expect(r.httpObservations.every(o=>o.outcome==="matched")).toBe(true);
  const serialized=JSON.stringify(r).toLowerCase();
  expect(serialized).not.toContain("cookie");
  expect(serialized).not.toContain("synthetic=fixture");
  expect(serialized).not.toContain("session=");
 });

 test("fixture mode refuses scopes without a positive-control probe",async()=>{
  const suite=createStagingIsolationSuite({mode:"fixture",scope:"graph_workspace",commitSha:sha});
  await expect(suite.run()).rejects.toThrow(/positive-control/);
 });

 test("live mode refuses without owner enable + disposable pins",async()=>{
  const suite=createStagingIsolationSuite({mode:"live",scope:"interrogative_workspace",commitSha:sha,enabled:true});
  await expect(suite.run()).rejects.toThrow(/disposable target/);
  const disabled=createStagingIsolationSuite({mode:"live",scope:"interrogative_workspace",commitSha:sha});
  await expect(disabled.run()).rejects.toThrow(/disabled/);
 });

 test("live mode refuses fixture transport and mismatched pins",async()=>{
  const noTransport=createStagingIsolationSuite({
   mode:"live",
   scope:"graph_workspace",
   commitSha:sha,
   enabled:true,
   target:disposableTarget,
   pins,
   origin:"https://staging.invalid",
   approvedOrigin:"https://staging.invalid",
   routeSchemaHash:schema,
   runtimeConfigHash:runtime,
   authorize:async()=>true,
   session:async()=>null,
  });
  await expect(noTransport.run()).rejects.toThrow(/transport/);

  const badPins=createStagingIsolationSuite({
   mode:"live",
   scope:"graph_workspace",
   commitSha:sha,
   enabled:true,
   target:disposableTarget,
   pins:{...pins,disposableBranchId:"ep-hsi-production"},
   origin:"https://staging.invalid",
   approvedOrigin:"https://staging.invalid",
   productionOrigins:["https://www.humansuperintelligence.tech"],
   routeSchemaHash:schema,
   runtimeConfigHash:runtime,
   authorize:async()=>true,
   session:async()=>null,
   transport:async()=>Response.json({error:"unused"},{status:500}),
  });
  await expect(badPins.run()).rejects.toThrow(/Disposable HSI rehearsal target/);
 });

 test("live mode verifies disposable branch pin before probes and never accepts",async()=>{
  const suite=createStagingIsolationSuite({
   mode:"live",
   scope:"graph_workspace",
   commitSha:sha,
   enabled:true,
   target:disposableTarget,
   pins,
   origin:"https://staging.invalid",
   approvedOrigin:"https://staging.invalid",
   productionOrigins:["https://www.humansuperintelligence.tech"],
   routeSchemaHash:schema,
   runtimeConfigHash:runtime,
   authorize:async()=>false,
   session:async(actor)=>actor==="anonymous"?null:"synthetic=live",
   transport:async()=>Response.json({error:"session_required",probe:"gw_e2e"},{status:401}),
  });
  const r=await suite.run();
  expect(r.acceptedForScope).toBe(false);
  expect(r.productionUntouched).toBe(true);
  expect(r.fixture).toBe(false);
  expect(r.httpObservations[0]?.outcome).toBe("failed");
 });
});
