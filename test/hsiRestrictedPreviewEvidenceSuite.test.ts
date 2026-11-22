import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiRestrictedPreviewEvidenceOwnerAuthorized,
  HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
  validateHsiRestrictedPreviewEvidenceOwnerApproval,
} from "../src/hsiRestrictedPreviewEvidenceAuthorization";
import {runHsiRestrictedPreviewEvidenceSuite} from "../src/operations/hsiRestrictedPreviewEvidenceRunner";
import {
  assertHsiRestrictedPreviewEvidenceLiveAuthorization,
  assertHsiRestrictedPreviewEvidenceSoftLand,
  assessHsiRestrictedPreviewEvidenceMode,
  buildHsiU12EvidenceFillProposal,
  hsiRestrictedPreviewEvidencePacket,
  hsiRestrictedPreviewEvidenceSurfaceById,
  type HsiRestrictedPreviewEvidenceSuiteMode,
} from "../src/operations/hsiRestrictedPreviewEvidenceSuite";

describe("U40 restricted-preview evidence runners", () => {
  test("owner approval refuses preview GO / checklist #1 / writes / invented hosts", () => {
    expect(() =>
      validateHsiRestrictedPreviewEvidenceOwnerApproval(
        HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL.restrictedPreviewClaimed).toBe(false);
    expect(HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL.checklist1Verified).toBe(false);
    expect(HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL.gateCAutoApprove).toBe(false);
    expect(() =>
      validateHsiRestrictedPreviewEvidenceOwnerApproval({
        ...HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
        restrictedPreviewClaimed: true as false,
      }),
    ).toThrow("preview GO");
  });

  test("documents seven surfaces without inventing staging hosts or acceptance", () => {
    const packet = hsiRestrictedPreviewEvidencePacket();
    const summary = assertHsiRestrictedPreviewEvidenceSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.restrictedPreviewClaimed).toBe(false);
    expect(summary.checklist1Verified).toBe(false);
    expect(packet.fillsSoftLand).toEqual(["U12", "HSI-1.0-CONTINUOUS-JOURNEY-EVIDENCE"]);
    expect(hsiRestrictedPreviewEvidenceSurfaceById("continuous_journey_staging_grant").engineeringReady).toBe(
      false,
    );
    expect(hsiRestrictedPreviewEvidenceSurfaceById("u12_worksheet_fill").engineeringReady).toBe(true);
  });

  test("mode assessor keeps checklist #1 and preview GO closed", () => {
    const modes: HsiRestrictedPreviewEvidenceSuiteMode[] = ["check", "fixture", "live"];
    for (const mode of modes) {
      const assessment = assessHsiRestrictedPreviewEvidenceMode(mode);
      expect(assessment.mayClaimRestrictedPreview).toBe(false);
      expect(assessment.mayClaimChecklist1Verified).toBe(false);
      expect(assessment.mayInventStagingUrl).toBe(false);
      expect(assessment.mayInventGrant).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      if (mode === "live") {
        expect(assessment.mayProposeU12WorksheetFill).toBe(true);
        expect(assessment.mayProbeStagingOrigin).toBe(true);
        expect(assessment.ciSafe).toBe(false);
      } else {
        expect(assessment.mayProposeU12WorksheetFill).toBe(false);
        expect(assessment.mayProbeStagingOrigin).toBe(false);
        expect(assessment.ciSafe).toBe(true);
      }
    }
  });

  test("live authorization refuses missing flags, mismatched origin, and localhost", () => {
    expect(() =>
      assertHsiRestrictedPreviewEvidenceLiveAuthorization({
        enabled: undefined,
        liveAuthorized: "1",
        origin: "https://preview.example-hsi.test",
        approvedOrigin: "https://preview.example-hsi.test",
      }),
    ).toThrow("HSI_PREVIEW_EVIDENCE_ENABLED");

    expect(() =>
      assertHsiRestrictedPreviewEvidenceLiveAuthorization({
        enabled: "1",
        liveAuthorized: "1",
        origin: "https://a.example-hsi.test",
        approvedOrigin: "https://b.example-hsi.test",
      }),
    ).toThrow("must match");

    expect(() =>
      assertHsiRestrictedPreviewEvidenceLiveAuthorization({
        enabled: "1",
        liveAuthorized: "1",
        origin: "http://localhost:3000",
        approvedOrigin: "http://localhost:3000",
      }),
    ).toThrow("https");
  });

  test("U12 fill proposal refuses placeholders and keeps acceptance closed", () => {
    expect(() =>
      buildHsiU12EvidenceFillProposal({
        stagingTargetRef: "NOT_APPROVED",
        previewGrantRef: "grant-real-abcdef12",
        stagingGrantRunRef: "run-real-abcdef12",
        continuousJourneyEvidenceDigest: "a".repeat(64),
        authProbeDigest: "b".repeat(64),
      }),
    ).toThrow("staging_target_ref");

    const proposal = buildHsiU12EvidenceFillProposal({
      stagingTargetRef: "staging-target-hsi-redacted-1",
      previewGrantRef: "preview-grant-hsi-redacted-1",
      stagingGrantRunRef: "staging-grant-run-hsi-redacted-1",
      continuousJourneyEvidenceDigest: "c".repeat(64),
      authProbeDigest: "d".repeat(64),
    });
    expect(proposal.restrictedPreviewClaimed).toBe(false);
    expect(proposal.checklist1Verified).toBe(false);
    expect(proposal.acceptedForScope).toBe(false);
    expect(proposal.references.staging_target_ref).toContain("staging-target");
  });

  test("authorized check and fixture runners stay CI-safe", async () => {
    assertHsiRestrictedPreviewEvidenceOwnerAuthorized(
      HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
    );
    for (const mode of ["check", "fixture"] as const) {
      const result = await runHsiRestrictedPreviewEvidenceSuite({
        authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
        mode,
      });
      expect(result.mode).toBe(mode);
      expect(result.restrictedPreviewClaimed).toBe(false);
      expect(result.checklist1Verified).toBe(false);
      expect(result.stagingHealth.probed).toBe(false);
      expect(result.u12FillProposal).toBeNull();
      expect(result.authSessionExpiryDistinct).toBe(true);
      expect(result.evidenceDigests.authHonesty.length).toBe(64);
    }
  });

  test("live mode with mock health proposes U12 fill without claiming preview GO", async () => {
    const prev = {
      enabled: process.env.HSI_PREVIEW_EVIDENCE_ENABLED,
      live: process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED,
      origin: process.env.HSI_PREVIEW_EVIDENCE_ORIGIN,
      approved: process.env.HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN,
    };
    process.env.HSI_PREVIEW_EVIDENCE_ENABLED = "1";
    process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED = "1";
    process.env.HSI_PREVIEW_EVIDENCE_ORIGIN = "https://preview.example-hsi.test";
    process.env.HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN = "https://preview.example-hsi.test";
    try {
      const result = await runHsiRestrictedPreviewEvidenceSuite({
        authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
        mode: "live",
        fillRefs: {
          stagingTargetRef: "staging-target-hsi-redacted-live",
          previewGrantRef: "preview-grant-hsi-redacted-live",
          stagingGrantRunRef: "staging-grant-run-hsi-redacted-live",
        },
        fetchImpl: async () =>
          new Response(JSON.stringify({writesEnabled: false, configurationValidated: true}), {
            status: 200,
            headers: {"content-type": "application/json"},
          }),
      });
      expect(result.stagingHealth.probed).toBe(true);
      expect(result.stagingHealth.writesEnabled).toBe(false);
      expect(result.u12FillProposal).not.toBeNull();
      expect(result.u12FillProposal?.restrictedPreviewClaimed).toBe(false);
      expect(result.checklist1Verified).toBe(false);
      expect(result.surfacesProbed).toContain("continuous_journey_staging_grant");
    } finally {
      for (const [key, value] of Object.entries(prev)) {
        const envKey =
          key === "enabled"
            ? "HSI_PREVIEW_EVIDENCE_ENABLED"
            : key === "live"
              ? "HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED"
              : key === "origin"
                ? "HSI_PREVIEW_EVIDENCE_ORIGIN"
                : "HSI_PREVIEW_EVIDENCE_APPROVED_ORIGIN";
        if (value === undefined) delete process.env[envKey];
        else process.env[envKey] = value;
      }
    }
  });

  test("live mode without env refuses before probe", async () => {
    const prevEnabled = process.env.HSI_PREVIEW_EVIDENCE_ENABLED;
    const prevLive = process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED;
    delete process.env.HSI_PREVIEW_EVIDENCE_ENABLED;
    delete process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED;
    try {
      await expect(
        runHsiRestrictedPreviewEvidenceSuite({
          authorization: HSI_RESTRICTED_PREVIEW_EVIDENCE_OWNER_APPROVAL,
          mode: "live",
        }),
      ).rejects.toThrow("HSI_PREVIEW_EVIDENCE_ENABLED");
    } finally {
      if (prevEnabled === undefined) delete process.env.HSI_PREVIEW_EVIDENCE_ENABLED;
      else process.env.HSI_PREVIEW_EVIDENCE_ENABLED = prevEnabled;
      if (prevLive === undefined) delete process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED;
      else process.env.HSI_PREVIEW_EVIDENCE_LIVE_AUTHORIZED = prevLive;
    }
  });

  test("pending worksheet and docs keep honesty closed", () => {
    const pending = JSON.parse(
      readFileSync(
        join(import.meta.dir, "../operations/staging/hsi-restricted-preview-evidence-u40.pending.json"),
        "utf8",
      ),
    ) as {
      restrictedPreviewClaimed: boolean;
      checklist1Verified: boolean;
      inventedStagingUrl: boolean;
    };
    expect(pending.restrictedPreviewClaimed).toBe(false);
    expect(pending.checklist1Verified).toBe(false);
    expect(pending.inventedStagingUrl).toBe(false);
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U40_RESTRICTED_PREVIEW_EVIDENCE_RUNNERS_2026-11-21.md",
      ),
      "utf8",
    );
    expect(doc).toContain("Always false");
    expect(doc).toContain("staging:preview-evidence");
  });
});
