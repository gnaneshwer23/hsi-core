import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiStagingAcceptanceOrchestrationOwnerAuthorized,
  HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
  validateHsiStagingAcceptanceOrchestrationOwnerApproval,
} from "../src/hsiStagingAcceptanceOrchestrationAuthorization";
import {
  assessHsiStagingAcceptanceOrchestrationMode,
  runHsiStagingAcceptanceOrchestration,
} from "../src/operations/hsiStagingAcceptanceOrchestration";
import {
  assertHsiStagingAcceptanceOrchestrationSoftLand,
  hsiStagingAcceptanceOrchestrationSoftLandPacket,
  hsiStagingAcceptanceOrchestrationSurfaceById,
} from "../src/operations/hsiStagingAcceptanceOrchestrationSoftLand";
import {buildHsiU12EvidenceFillProposal} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";
import type {HsiU12PendingWorksheet} from "../src/operations/hsiU12EvidenceFillApply";

const REAL_REFS = {
  stagingTargetRef: "staging-host-digest-abcdef12",
  previewGrantRef: "preview-grant-digest-abcdef12",
  stagingGrantRunRef: "grant-run-digest-abcdef12",
  continuousJourneyEvidenceDigest: "journey-digest-abcdef12",
  authProbeDigest: "auth-probe-digest-abcdef12",
};

describe("U46 staging acceptance orchestration", () => {
  test("owner approval refuses preview GO / checklist #1 / invented hosts", () => {
    expect(() =>
      validateHsiStagingAcceptanceOrchestrationOwnerApproval(
        HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(() =>
      validateHsiStagingAcceptanceOrchestrationOwnerApproval({
        ...HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
        checklist1Verified: true as false,
      }),
    ).toThrow(/checklist|preview|invented/i);
    assertHsiStagingAcceptanceOrchestrationOwnerAuthorized(
      HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
    );
  });

  test("soft-land keeps preview GO and invented hosts closed", () => {
    const packet = hsiStagingAcceptanceOrchestrationSoftLandPacket();
    const summary = assertHsiStagingAcceptanceOrchestrationSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.restrictedPreviewClaimed).toBe(false);
    expect(hsiStagingAcceptanceOrchestrationSurfaceById("check_honesty").engineeringReady).toBe(
      true,
    );
    expect(
      hsiStagingAcceptanceOrchestrationSurfaceById("live_staging_grant").engineeringReady,
    ).toBe(false);
    expect(
      hsiStagingAcceptanceOrchestrationSurfaceById("preview_go_claim").engineeringReady,
    ).toBe(false);
  });

  test("mode assessment never allows checklist #1 or preview GO", () => {
    for (const mode of ["check", "fixture", "dry_apply"] as const) {
      const assessment = assessHsiStagingAcceptanceOrchestrationMode(mode);
      expect(assessment.mayClaimChecklist1).toBe(false);
      expect(assessment.mayClaimPreviewGo).toBe(false);
    }
    expect(assessHsiStagingAcceptanceOrchestrationMode("check").ciSafe).toBe(true);
    expect(assessHsiStagingAcceptanceOrchestrationMode("dry_apply").mayDryApplyProposal).toBe(
      true,
    );
  });

  test("check mode binds soft-lands without claiming acceptance", async () => {
    const result = await runHsiStagingAcceptanceOrchestration({
      authorization: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
      mode: "check",
    });
    expect(result.mode).toBe("check");
    expect(result.restrictedPreviewClaimed).toBe(false);
    expect(result.checklist1Verified).toBe(false);
    expect(result.acceptedForScope).toBe(false);
    expect(result.steps).toContain("bound_u46_u40_u43_u12_continuous_journey_soft_lands");
  });

  test("fixture mode runs U40 fixture and refuses placeholders", async () => {
    const result = await runHsiStagingAcceptanceOrchestration({
      authorization: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
      mode: "fixture",
    });
    expect(result.mode).toBe("fixture");
    expect(result.steps).toContain("u40_fixture_probe");
    expect(result.steps).toContain("u43_placeholder_fill_refused");
    expect(result.restrictedPreviewClaimed).toBe(false);
    expect(result.checklist1Verified).toBe(false);
  });

  test("dry_apply mode applies owner proposal without claiming checklist #1", async () => {
    const proposal = buildHsiU12EvidenceFillProposal(REAL_REFS);
    const u12Pending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-10-restricted-preview-readiness-u12.pending.json",
        ),
        "utf8",
      ),
    ) as HsiU12PendingWorksheet;
    const continuousJourneyPending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-10-continuous-journey-evidence.pending.json",
        ),
        "utf8",
      ),
    ) as HsiU12PendingWorksheet;

    const result = await runHsiStagingAcceptanceOrchestration({
      authorization: HSI_STAGING_ACCEPTANCE_ORCHESTRATION_OWNER_APPROVAL,
      mode: "dry_apply",
      proposal,
      u12Pending,
      continuousJourneyPending,
    });

    expect(result.applyDryRun?.applied).toBe(true);
    expect(result.applyDryRun?.restrictedPreviewClaimed).toBe(false);
    expect(result.applyDryRun?.checklist1Verified).toBe(false);
    expect(result.restrictedPreviewClaimed).toBe(false);
    expect(result.checklist1Verified).toBe(false);
  });

  test("pending worksheet and docs keep honesty", () => {
    const pending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-u46-staging-acceptance-orchestration.pending.json",
        ),
        "utf8",
      ),
    ) as {
      acceptedForScope: boolean;
      restrictedPreviewClaimed: boolean;
      checklist1Verified: boolean;
      inventedStagingUrl: boolean;
    };
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.restrictedPreviewClaimed).toBe(false);
    expect(pending.checklist1Verified).toBe(false);
    expect(pending.inventedStagingUrl).toBe(false);

    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U46_STAGING_ACCEPTANCE_ORCHESTRATION_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toMatch(/checklist #1/i);
    expect(doc).toMatch(/not claimed/i);
  });
});
