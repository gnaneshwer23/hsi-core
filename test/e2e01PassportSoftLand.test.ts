import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e01Mode,
  assessE2e01PassportHonesty,
  assertE2e01PassportSoftLand,
  e2e01PassportPacket,
  e2e01SurfaceById,
  type E2e01SuiteMode,
  type E2e01SurfaceId,
} from "../src/operations/e2e01PassportSoftLand";

describe("PR-E2E-01 passport soft-land", () => {
  test("documents seven surfaces without inventing context or enabling writes", () => {
    const packet = e2e01PassportPacket();
    const summary = assertE2e01PassportSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.inventedContext).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-01");
    expect(packet.priority).toBe("P1");
    expect(packet.implementationPr).toBe("#469");
    expect(packet.a21PassportUiPr).toBe("#449");
    expect(packet.honesty.missingFieldsStayExplicit).toBe(true);
    expect(packet.journeyAcceptanceClaimed).toBe(false);
  });

  test("each surface keeps invent/approval/write claims false", () => {
    const surfaces: E2e01SurfaceId[] = [
      "passport_builder",
      "passport_ui_panel",
      "investigation_workspace_default",
      "graph_edge_selection",
      "missing_field_honesty",
      "live_brief_passport_columns",
      "playwright_heading_assert",
    ];
    for (const surface of surfaces) {
      const row = e2e01SurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.inventedContext).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.productionWritesEnabled).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows invent, approval, writes, or journey acceptance", () => {
    const modes: E2e01SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e01Mode(mode);
      expect(assessment.mayInventContext).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayClaimJourneyAcceptance).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.inventedContext).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("passport honesty stays fail-closed", () => {
    const honesty = assessE2e01PassportHonesty();
    expect(honesty.mustShowMissingFieldsExplicitly).toBe(true);
    expect(honesty.mustNotInventTissueDoseSpecies).toBe(true);
    expect(honesty.mustKeepCandidateUnreviewedLabel).toBe(true);
    expect(honesty.mustRemainReadOnlyUi).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-01-passport.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      inventedContext: boolean;
      journeyAcceptanceClaimed: boolean;
      references: {
        implementation_pr_ref: string;
        journey_acceptance_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.inventedContext).toBe(false);
    expect(pending.journeyAcceptanceClaimed).toBe(false);
    expect(pending.references.implementation_pr_ref).toBe("#469");
    expect(pending.references.journey_acceptance_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_01_PASSPORT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-01");
    expect(doc).toContain("missing");
    expect(doc).toContain("passport");
  });
});
