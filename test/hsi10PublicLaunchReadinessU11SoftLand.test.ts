import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assessHsi10PublicLaunchReadinessU11Mode,
  assertHsi10PublicLaunchReadinessU11SoftLand,
  hsi10PublicLaunchReadinessU11Packet,
  hsi10PublicLaunchSurfaceById,
  type Hsi10PublicLaunchSuiteMode,
  type Hsi10PublicLaunchSurfaceId,
} from "../src/operations/hsi10PublicLaunchReadinessU11SoftLand";

describe("HSI 1.0 U11 public launch readiness soft-land",()=>{
  test("documents seven surfaces without claiming launch or writes",()=>{
    const packet=hsi10PublicLaunchReadinessU11Packet();
    const summary=assertHsi10PublicLaunchReadinessU11SoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.publicLaunchClaimed).toBe(false);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(summary.premortemIsReleaseGate).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.stage).toBe("L0_public");
    expect(packet.honesty.premortemNotAGate).toBe(true);
  });

  test("owner L0 GO is recorded while unrestricted launch claims stay false",()=>{
    const surfaces:Hsi10PublicLaunchSurfaceId[]=[
      "public_qa_packet",
      "demo_universe_synthetic",
      "landing_honesty_labels",
      "production_probe_writes_false",
      "premortem_non_gate",
      "owner_visual_acceptance",
      "owner_public_launch_go",
    ];
    for(const surface of surfaces){
      const row=hsi10PublicLaunchSurfaceById(surface);
      expect(row.publicLaunchClaimed).toBe(false);
      expect(row.productionWritesEnabled).toBe(false);
      expect(row.scientificApproval).toBe(false);
    }
    expect(hsi10PublicLaunchSurfaceById("demo_universe_synthetic").engineeringReady).toBe(true);
    expect(hsi10PublicLaunchSurfaceById("owner_public_launch_go").engineeringReady).toBe(true);
    expect(hsi10PublicLaunchSurfaceById("owner_visual_acceptance").engineeringReady).toBe(true);
    expect(hsi10PublicLaunchSurfaceById("owner_public_launch_go").ownerSignOffRequired).toBe(true);
  });

  test("mode assessor never claims public launch or treats premortem as a gate",()=>{
    const modes:Hsi10PublicLaunchSuiteMode[]=["check","fixture"];
    for(const mode of modes){
      const assessment=assessHsi10PublicLaunchReadinessU11Mode(mode);
      expect(assessment.mayClaimPublicLaunch).toBe(false);
      expect(assessment.mayInventOwnerGo).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayTreatPremortemAsGate).toBe(false);
      expect(assessment.ciSafe).toBe(true);
    }
  });

  test("pending worksheet and docs stay blocked / honest",()=>{
    const root=join(import.meta.dir,"..");
    const pending=JSON.parse(
      readFileSync(join(root,"operations/staging/hsi-10-public-launch-readiness-u11.pending.json"),"utf8"),
    ) as {
      opsAcceptance:string;
      publicLaunchClaimed:boolean;
      premortemIsReleaseGate:boolean;
      inventedOwnerGo:boolean;
      references:{visual_acceptance_ref:string;public_launch_go_ref:string};
    };
    expect(pending.opsAcceptance).toBe("L0_OWNER_GO_RECORDED");
    expect(pending.publicLaunchClaimed).toBe(false);
    expect(pending.premortemIsReleaseGate).toBe(false);
    expect(pending.inventedOwnerGo).toBe(false);
    expect(pending.references.visual_acceptance_ref).toContain("HSI_PUBLIC_L0_DEPLOY_APPROVAL");
    expect(pending.references.public_launch_go_ref).toContain("HSI_PUBLIC_L0_DEPLOY_APPROVAL");

    const doc=readFileSync(
      join(root,"docs/engineering/HSI_10_PUBLIC_LAUNCH_READINESS_U11_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("L0");
    expect(doc).toContain("U36");
  });
});
