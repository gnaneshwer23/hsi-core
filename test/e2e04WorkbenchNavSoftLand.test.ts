import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e04Mode,
  assessE2e04NavHonesty,
  assertE2e04WorkbenchNavSoftLand,
  e2e04SurfaceById,
  e2e04WorkbenchNavPacket,
  type E2e04SuiteMode,
  type E2e04SurfaceId,
} from "../src/operations/e2e04WorkbenchNavSoftLand";

describe("PR-E2E-04 workbench nav soft-land", () => {
  test("documents seven surfaces without claiming journey acceptance", () => {
    const packet = e2e04WorkbenchNavPacket();
    const summary = assertE2e04WorkbenchNavSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.journeyAccepted).toBe(false);
    expect(summary.primaryLivePath).toBe("/research/workspace");
    expect(summary.rebuiltWorkbenches).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-04");
    expect(packet.priority).toBe("P1");
    expect(packet.implementationPr).toBe("#470");
    expect(packet.honesty.singlePrimaryPath).toBe(true);
    expect(packet.inventedRouteCount).toBe(false);
  });

  test("each surface keeps journey and rebuild claims false", () => {
    const surfaces: E2e04SurfaceId[] = [
      "live_investigation_primary",
      "research_home_entry",
      "legacy_workbench_redirects",
      "research_nav_items",
      "site_route_catalog",
      "authorised_decision_workbench",
      "primary_journey_honesty",
    ];
    for (const surface of surfaces) {
      const row = e2e04SurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.primaryPathClaimed).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.journeyAccepted).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows journey acceptance or rebuild", () => {
    const modes: E2e04SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e04Mode(mode);
      expect(assessment.mayClaimJourneyAccepted).toBe(false);
      expect(assessment.mayRebuildWorkbenches).toBe(false);
      expect(assessment.mayInventRouteCount).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.journeyAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("nav honesty stays fail-closed", () => {
    const honesty = assessE2e04NavHonesty();
    expect(honesty.mustKeepLiveWorkspacePrimary).toBe(true);
    expect(honesty.mustRedirectLegacyWorkbenchUrls).toBe(true);
    expect(honesty.mustNotRebuildSpecialisedTools).toBe(true);
    expect(honesty.mustKeepAskEvidenceGraphVerifyBriefOrder).toBe(true);
    expect(honesty.mustNotTreatSoftLandAsJourneyAcceptance).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-04-workbench-nav.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      journeyAccepted: boolean;
      primaryLivePath: string;
      references: {
        implementation_pr_ref: string;
        journey_acceptance_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.journeyAccepted).toBe(false);
    expect(pending.primaryLivePath).toBe("/research/workspace");
    expect(pending.references.implementation_pr_ref).toBe("#470");
    expect(pending.references.journey_acceptance_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_04_WORKBENCH_NAV_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-04");
    expect(doc).toContain("/research/workspace");
    expect(doc).toContain("journeyAccepted");
  });
});
