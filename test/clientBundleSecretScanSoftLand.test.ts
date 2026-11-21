import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertClientBundleSecretScanSoftLand,
  clientBundleSecretScanPacket,
} from "../src/operations/clientBundleSecretScanSoftLand";

describe("client bundle secret scan soft-land",()=>{
  test("documents PROD-QA-003 without claiming AppSec acceptance",()=>{
    const packet=clientBundleSecretScanPacket();
    const summary=assertClientBundleSecretScanSoftLand(packet);
    expect(summary.appSecAccepted).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("PROD-QA-003");
    expect(packet.honesty.cleanScanIsNotAppSecAcceptance).toBe(true);
    expect(packet.honesty.ciScanIsNotAppSecAcceptance).toBe(true);
  });

  test("pending worksheet and script stay honest",()=>{
    const root=join(import.meta.dir,"..");
    const pending=JSON.parse(
      readFileSync(join(root,"operations/staging/client-bundle-secret-scan.pending.json"),"utf8"),
    ) as {appSecAccepted:boolean;references:{appsec_reviewer_ref:string}};
    expect(pending.appSecAccepted).toBe(false);
    expect(pending.references.appsec_reviewer_ref).toBe("UNASSIGNED");
    readFileSync(join(root,"scripts/scan-client-bundle-secrets.ts"),"utf8");
    const doc=readFileSync(join(root,"docs/engineering/CLIENT_BUNDLE_SECRET_SCAN_SOFT_LAND.md"),"utf8");
    expect(doc).toContain("Never invent");
    const workflow=readFileSync(join(root,".github/workflows/research-foundation.yml"),"utf8");
    expect(workflow).toContain("scan:client-bundle");
    expect(workflow).toContain("not AppSec GO");
  });
});
