import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e08Mode,
  assessE2e08ProfileHonesty,
  assertE2e08OnboardingProfileSoftLand,
  e2e08OnboardingProfilePacket,
  e2e08SurfaceById,
  type E2e08SuiteMode,
  type E2e08SurfaceId,
} from "../src/operations/e2e08OnboardingProfileSoftLand";

describe("PR-E2E-08 onboarding profile soft-land", () => {
  test("documents seven surfaces without applying schema or lifting 023", () => {
    const packet = e2e08OnboardingProfilePacket();
    const summary = assertE2e08OnboardingProfileSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.schemaApplied).toBe(false);
    expect(summary.migration023Lifted).toBe(false);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-08");
    expect(packet.priority).toBe("P2");
    expect(packet.implementationPr).toBe("#473");
    expect(packet.honesty.defaultIsLocalStorage).toBe(true);
    expect(packet.multiDeviceDurableClaimed).toBe(false);
  });

  test("each surface keeps schema, production, and holds fail-closed", () => {
    const surfaces: E2e08SurfaceId[] = [
      "device_local_default",
      "write_gate_fail_closed",
      "onboarding_profile_api",
      "memory_rehearsal_store",
      "migration_023_hold",
      "client_profile_sync",
      "staging_owner_enable",
    ];
    for (const surface of surfaces) {
      const row = e2e08SurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.schemaApplied).toBe(false);
      expect(row.acceptedForScope).toBe(false);
      expect(row.productionAllowed).toBe(false);
      expect(row.holdsUnchanged).toBe(true);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows schema, 023 lift, or durable sync claims", () => {
    const modes: E2e08SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e08Mode(mode);
      expect(assessment.mayClaimSchemaApplied).toBe(false);
      expect(assessment.mayLift023).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayClaimMultiDeviceDurable).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.schemaApplied).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("profile honesty stays fail-closed", () => {
    const honesty = assessE2e08ProfileHonesty();
    expect(honesty.mustDefaultToLocalStorage).toBe(true);
    expect(honesty.mustKeep023Held).toBe(true);
    expect(honesty.mustKeepAcceptedForScopeFalse).toBe(true);
    expect(honesty.mustNotClaimMemoryAsDurable).toBe(true);
    expect(honesty.mustRequireStagingPinsAndFlag).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/e2e-08-onboarding-profile.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      schemaApplied: boolean;
      migration023Lifted: boolean;
      references: {
        implementation_pr_ref: string;
        staging_enable_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.schemaApplied).toBe(false);
    expect(pending.migration023Lifted).toBe(false);
    expect(pending.references.implementation_pr_ref).toBe("#473");
    expect(pending.references.staging_enable_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_08_ONBOARDING_PROFILE_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-08");
    expect(doc).toContain("schemaApplied");
    expect(doc).toContain("023");
  });
});
