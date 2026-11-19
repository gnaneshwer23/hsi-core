import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e07BriefHonesty,
  assessE2e07Mode,
  assertE2e07BriefPassportSoftLand,
  e2e07BriefPassportPacket,
  e2e07SurfaceById,
  type E2e07SuiteMode,
  type E2e07SurfaceId,
} from "../src/operations/e2e07BriefPassportSoftLand";

describe("PR-E2E-07 brief passport soft-land", () => {
  test("documents seven surfaces without accepting the brief", () => {
    const packet = e2e07BriefPassportPacket();
    const summary = assertE2e07BriefPassportSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.briefAccepted).toBe(false);
    expect(summary.verificationGatePassed).toBe(false);
    expect(summary.inventedBiologicalContext).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-07");
    expect(packet.priority).toBe("P1");
    expect(packet.implementationPr).toBe("#471");
    expect(packet.dependsOn).toEqual(["PR-E2E-01", "PR-E2E-05", "PR-E2E-06"]);
    expect(packet.honesty.limitationsAlwaysPresent).toBe(true);
  });

  test("each surface keeps brief and gate claims false", () => {
    const surfaces: E2e07SurfaceId[] = [
      "live_brief_passport_rows",
      "passport_evidence_table",
      "verification_status_labels",
      "limitations_honesty",
      "live_brief_v2_export",
      "research_brief_markdown",
      "exportable_source_linked_brief",
    ];
    for (const surface of surfaces) {
      const row = e2e07SurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.briefAccepted).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.verificationGatePassed).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows brief acceptance or gate pass", () => {
    const modes: E2e07SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e07Mode(mode);
      expect(assessment.mayClaimBriefAccepted).toBe(false);
      expect(assessment.mayClaimVerificationGatePass).toBe(false);
      expect(assessment.mayInventBiologicalContext).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.briefAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("brief honesty stays fail-closed", () => {
    const honesty = assessE2e07BriefHonesty();
    expect(honesty.mustKeepPassportColumnsSourceLinked).toBe(true);
    expect(honesty.mustSurfaceVerificationStatus).toBe(true);
    expect(honesty.mustSurfaceLimitations).toBe(true);
    expect(honesty.mustNotTreatLocatorAsProof).toBe(true);
    expect(honesty.mustNotClaimGatePassFromHarness).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-07-brief-passport.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      briefAccepted: boolean;
      verificationGatePassed: boolean;
      references: {
        implementation_pr_ref: string;
        brief_acceptance_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.briefAccepted).toBe(false);
    expect(pending.verificationGatePassed).toBe(false);
    expect(pending.references.implementation_pr_ref).toBe("#471");
    expect(pending.references.brief_acceptance_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_07_BRIEF_PASSPORT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-07");
    expect(doc).toContain("briefAccepted");
    expect(doc).toContain("passport");
  });
});
