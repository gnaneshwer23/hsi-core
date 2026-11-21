import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assessHsi10RestrictedPreviewReadinessU12Mode,
  assertHsi10RestrictedPreviewReadinessU12SoftLand,
  hsi10RestrictedPreviewReadinessU12Packet,
  hsi10RestrictedPreviewSurfaceById,
  type Hsi10RestrictedPreviewSuiteMode,
  type Hsi10RestrictedPreviewSurfaceId,
} from "../src/operations/hsi10RestrictedPreviewReadinessU12SoftLand";

describe("HSI 1.0 U12 restricted-preview readiness soft-land",()=>{
  test("documents seven surfaces without claiming preview or writes",()=>{
    const packet=hsi10RestrictedPreviewReadinessU12Packet();
    const summary=assertHsi10RestrictedPreviewReadinessU12SoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.restrictedPreviewClaimed).toBe(false);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(summary.inventedStagingUrl).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.stage).toBe("L1_restricted_preview");
    expect(packet.honesty.localE2eIsNotStagingGrant).toBe(true);
  });

  test("owner staging grant and preview GO stay gated",()=>{
    const surfaces:Hsi10RestrictedPreviewSurfaceId[]=[
      "continuous_journey_local_e2e",
      "ask_live_investigation_honesty",
      "device_local_save_reopen",
      "auth_grant_fail_closed",
      "production_writes_refused",
      "staging_grant_continuous_run",
      "owner_preview_go",
    ];
    for(const surface of surfaces){
      const row=hsi10RestrictedPreviewSurfaceById(surface);
      expect(row.restrictedPreviewClaimed).toBe(false);
      expect(row.productionWritesEnabled).toBe(false);
    }
    expect(hsi10RestrictedPreviewSurfaceById("continuous_journey_local_e2e").engineeringReady).toBe(true);
    expect(hsi10RestrictedPreviewSurfaceById("staging_grant_continuous_run").engineeringReady).toBe(false);
    expect(hsi10RestrictedPreviewSurfaceById("owner_preview_go").ownerEvidenceRequired).toBe(true);
  });

  test("mode assessor never claims preview or invents grants",()=>{
    const modes:Hsi10RestrictedPreviewSuiteMode[]=["check","fixture"];
    for(const mode of modes){
      const assessment=assessHsi10RestrictedPreviewReadinessU12Mode(mode);
      expect(assessment.mayClaimRestrictedPreview).toBe(false);
      expect(assessment.mayInventStagingUrl).toBe(false);
      expect(assessment.mayInventGrant).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayClaimChecklist1Verified).toBe(false);
      expect(assessment.ciSafe).toBe(true);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest",()=>{
    const root=join(import.meta.dir,"..");
    const pending=JSON.parse(
      readFileSync(
        join(root,"operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance:string;
      restrictedPreviewClaimed:boolean;
      inventedStagingUrl:boolean;
      references:{staging_target_ref:string;restricted_preview_go_ref:string};
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.restrictedPreviewClaimed).toBe(false);
    expect(pending.inventedStagingUrl).toBe(false);
    expect(pending.references.staging_target_ref).toBe("NOT_APPROVED");
    expect(pending.references.restricted_preview_go_ref).toBe("UNASSIGNED");

    const doc=readFileSync(
      join(root,"docs/engineering/HSI_10_RESTRICTED_PREVIEW_READINESS_U12_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("L1");
  });
});
