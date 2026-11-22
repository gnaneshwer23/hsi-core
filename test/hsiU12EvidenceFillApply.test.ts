import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiU12EvidenceFillApplyOwnerAuthorized,
  HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
  validateHsiU12EvidenceFillApplyOwnerApproval,
} from "../src/hsiU12EvidenceFillApplyAuthorization";
import {
  applyHsiU12EvidenceFillProposal,
  type HsiU12PendingWorksheet,
} from "../src/operations/hsiU12EvidenceFillApply";
import {
  assertHsiU12EvidenceFillApplySoftLand,
  hsiU12EvidenceFillApplySoftLandPacket,
  hsiU12EvidenceFillApplySurfaceById,
} from "../src/operations/hsiU12EvidenceFillApplySoftLand";
import {buildHsiU12EvidenceFillProposal} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";

const REAL_REFS = {
  stagingTargetRef: "staging-host-digest-abcdef12",
  previewGrantRef: "preview-grant-digest-abcdef12",
  stagingGrantRunRef: "grant-run-digest-abcdef12",
  continuousJourneyEvidenceDigest: "journey-digest-abcdef12",
  authProbeDigest: "auth-probe-digest-abcdef12",
};

describe("U43 U12 evidence fill-apply", () => {
  test("owner approval refuses preview GO / checklist #1 / invented hosts", () => {
    expect(() =>
      validateHsiU12EvidenceFillApplyOwnerApproval(HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL),
    ).not.toThrow();
    expect(() =>
      validateHsiU12EvidenceFillApplyOwnerApproval({
        ...HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
        checklist1Verified: true as false,
      }),
    ).toThrow(/checklist|preview|invented/i);
  });

  test("soft-land keeps preview GO and invented hosts closed", () => {
    const packet = hsiU12EvidenceFillApplySoftLandPacket();
    const summary = assertHsiU12EvidenceFillApplySoftLand(packet);
    expect(summary.surfaceCount).toBe(6);
    expect(summary.restrictedPreviewClaimed).toBe(false);
    expect(hsiU12EvidenceFillApplySurfaceById("dry_run_apply").engineeringReady).toBe(true);
    expect(hsiU12EvidenceFillApplySurfaceById("preview_go_claim").engineeringReady).toBe(false);
  });

  test("dry-run apply fills refs without claiming acceptance", () => {
    assertHsiU12EvidenceFillApplyOwnerAuthorized(HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL);
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

    const result = applyHsiU12EvidenceFillProposal({
      authorization: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
      proposal,
      u12Pending,
      continuousJourneyPending,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.restrictedPreviewClaimed).toBe(false);
    expect(result.checklist1Verified).toBe(false);
    expect(result.u12Next.references.staging_target_ref).toBe(REAL_REFS.stagingTargetRef);
    expect(result.u12Next.references.preview_grant_ref).toBe(REAL_REFS.previewGrantRef);
    expect(result.continuousJourneyNext.references.checklist_1_evidence_ref).toBe(
      REAL_REFS.continuousJourneyEvidenceDigest,
    );
    expect(result.continuousJourneyNext.journeyCompleteClaimed).toBe(false);
    // Source pending files unchanged
    expect(u12Pending.references.staging_target_ref).toBe("NOT_APPROVED");
  });

  test("apply refuses pending worksheets that already claim preview GO", () => {
    const proposal = buildHsiU12EvidenceFillProposal(REAL_REFS);
    const u12Pending = {
      schemaVersion: "test",
      restrictedPreviewClaimed: true,
      references: {staging_target_ref: "NOT_APPROVED"},
    } as HsiU12PendingWorksheet;
    const continuousJourneyPending = {
      schemaVersion: "test",
      references: {staging_target_ref: "NOT_APPROVED"},
    } as HsiU12PendingWorksheet;
    expect(() =>
      applyHsiU12EvidenceFillProposal({
        authorization: HSI_U12_EVIDENCE_FILL_APPLY_OWNER_APPROVAL,
        proposal,
        u12Pending,
        continuousJourneyPending,
      }),
    ).toThrow(/preview GO|acceptance|journey complete/i);
  });

  test("docs keep U43 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U43_U12_EVIDENCE_FILL_APPLY_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toContain("dry-run");
    expect(doc).toMatch(/checklist #1|restrictedPreviewClaimed/i);
  });
});
