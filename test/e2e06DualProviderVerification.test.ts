import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e06VerificationMode,
  assessVerificationAbstentionHonesty,
  assertE2e06DualProviderSoftLand,
  e2e06DualProviderVerificationPacket,
  e2e06VerificationSurfaceById,
  type E2e06SuiteMode,
  type E2e06VerificationSurfaceId,
} from "../src/operations/e2e06DualProviderVerification";

describe("PR-E2E-06 dual-provider verification soft-land", () => {
  test("documents seven surfaces without claiming gate pass", () => {
    const packet = e2e06DualProviderVerificationPacket();
    const summary = assertE2e06DualProviderSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.reliabilityGatePassClaimed).toBe(false);
    expect(summary.modelIndependenceVerified).toBe(false);
    expect(summary.liveProviderBindAuthorized).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-06");
    expect(packet.honesty.noGatePassClaim).toBe(true);
    expect(packet.honesty.independenceUnproven).toBe(true);
    expect(packet.inventedProviderCredentials).toBe(false);
  });

  test("each surface keeps independence and gate pass false", () => {
    const surfaces: E2e06VerificationSurfaceId[] = [
      "dual_model_challenge",
      "provider_reliability_boundary",
      "reliability_evaluation_harness",
      "scientific_reliability_gate",
      "investigation_workspace_verification_ui",
      "staging_provider_bind",
      "sme_gold_adjudication",
    ];
    for (const surface of surfaces) {
      const row = e2e06VerificationSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.reliabilityGatePassClaimed).toBe(false);
      expect(row.modelIndependenceVerified).toBe(false);
      expect(row.scientificAccuracyCalibrated).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows gate pass or live bind claims", () => {
    const modes: E2e06SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e06VerificationMode(mode);
      expect(assessment.mayClaimReliabilityGatePass).toBe(false);
      expect(assessment.mayClaimModelIndependence).toBe(false);
      expect(assessment.mayClaimLiveProviderBind).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.modelIndependenceVerified).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("abstention honesty stays fail-closed", () => {
    const honesty = assessVerificationAbstentionHonesty();
    expect(honesty.mustShowAbstentionWhenInsufficient).toBe(true);
    expect(honesty.mustNotClaimConsensusFromEmptyOpposing).toBe(true);
    expect(honesty.mustKeepCandidateUnreviewedLabel).toBe(true);
    expect(honesty.mustKeepModelIndependenceVerifiedFalse).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/e2e-06-dual-provider-verification.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      reliabilityGatePassClaimed: boolean;
      modelIndependenceVerified: boolean;
      liveProviderBindAuthorized: boolean;
      references: {
        provider_a_deployment_ref: string;
        provider_b_deployment_ref: string;
        sme_gold_packet_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.reliabilityGatePassClaimed).toBe(false);
    expect(pending.modelIndependenceVerified).toBe(false);
    expect(pending.liveProviderBindAuthorized).toBe(false);
    expect(pending.references.provider_a_deployment_ref).toBe("UNASSIGNED");
    expect(pending.references.provider_b_deployment_ref).toBe("UNASSIGNED");
    expect(pending.references.sme_gold_packet_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_06_DUAL_PROVIDER_VERIFICATION_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-06");
    expect(doc).toContain("modelIndependenceVerified");
  });
});
