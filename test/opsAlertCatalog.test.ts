import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
 assertOpsAlertCatalogSoftLand,
 opsAlertByKind,
 opsAlertCatalog,
 type OpsAlertKind,
} from "../src/operations/opsAlertCatalog";

describe("ops alert catalog (A1.3 soft-land)",()=>{
 test("documents exactly four Pack alerts without claiming on-call delivery",()=>{
  const catalog=opsAlertCatalog();
  const summary=assertOpsAlertCatalogSoftLand(catalog);
  expect(summary.alertCount).toBe(4);
  expect(summary.onCallDeliveryClaimed).toBe(false);
  expect(catalog.scientificApproval).toBe(false);
  expect(catalog.errorTrackingVendor).toBe("pending_D-120");
  expect(catalog.logDrain).toBe("pending_owner");
 });

 test("each kind resolves with force-test steps and honest delivery status",()=>{
  const kinds:OpsAlertKind[]=["error_spike","run_failure_rate","model_spend_cap","probe_failure"];
  for(const kind of kinds){
   const alert=opsAlertByKind(kind);
   expect(alert.kind).toBe(kind);
   expect(alert.onCallInvented).toBe(false);
   expect(alert.forceTestSteps.length).toBeGreaterThan(0);
   expect(alert.signalSources.length).toBeGreaterThan(0);
   expect(alert.deliveryStatus).toBe("documented_only");
  }
 });

 test("staging dry-run worksheet stays blocked and destination-null",()=>{
  const path=join(import.meta.dir,"../operations/staging/ops-alerts-dry-run.pending.json");
  const sheet=JSON.parse(readFileSync(path,"utf8")) as {
   opsAcceptance:string;
   onCallDeliveryClaimed:boolean;
   alerts:Array<{destinationAckRef:null|string;kind:string}>;
   honesty:{noInventedOnCallDestination:boolean};
  };
  expect(sheet.opsAcceptance).toBe("BLOCKED");
  expect(sheet.onCallDeliveryClaimed).toBe(false);
  expect(sheet.honesty.noInventedOnCallDestination).toBe(true);
  expect(sheet.alerts).toHaveLength(4);
  for(const alert of sheet.alerts){
   expect(alert.destinationAckRef).toBeNull();
  }
 });

 test("soft-land doc names the four alerts and non-claims",()=>{
  const doc=readFileSync(join(import.meta.dir,"../docs/engineering/A1_3_OPS_ERROR_ALERTS_SOFT_LAND.md"),"utf8");
  expect(doc).toContain("error_spike");
  expect(doc).toContain("run_failure_rate");
  expect(doc).toContain("model_spend_cap");
  expect(doc).toContain("probe_failure");
  expect(doc).toContain("Not invented");
  expect(doc).toContain("OPS-01");
  expect(doc).toContain("OPS-02");
 });
});
