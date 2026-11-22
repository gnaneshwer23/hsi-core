import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessHsi10ContinuousJourneyMode,
  assertHsi10ContinuousJourneyEvidenceSoftLand,
  hsi10ContinuousJourneyEvidencePacket,
  hsi10ContinuousJourneySurfaceById,
  type Hsi10ContinuousJourneySuiteMode,
  type Hsi10ContinuousJourneySurfaceId,
} from "../src/operations/hsi10ContinuousJourneyEvidenceSoftLand";

describe("HSI 1.0 continuous journey evidence soft-land", () => {
  test("documents five surfaces without claiming acceptance or writes", () => {
    const packet = hsi10ContinuousJourneyEvidencePacket();
    const summary = assertHsi10ContinuousJourneyEvidenceSoftLand(packet);
    expect(summary.surfaceCount).toBe(5);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.journeyCompleteClaimed).toBe(false);
    expect(packet.checklistItems).toEqual([1, 5]);
    expect(packet.honesty.localE2eIsNotStagingGrant).toBe(true);
  });

  test("each surface refuses production and stays unaccepted", () => {
    const surfaces: Hsi10ContinuousJourneySurfaceId[] = [
      "local_playwright_continuous",
      "local_live_investigation",
      "device_local_save_reopen",
      "staging_grant_run",
      "production_writes",
    ];
    for (const surface of surfaces) {
      const row = hsi10ContinuousJourneySurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.productionAllowed).toBe(false);
      expect(row.acceptedForScope).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
    expect(hsi10ContinuousJourneySurfaceById("local_playwright_continuous").engineeringReady).toBe(
      true,
    );
    expect(hsi10ContinuousJourneySurfaceById("staging_grant_run").ownerEvidenceRequired).toBe(true);
    expect(hsi10ContinuousJourneySurfaceById("production_writes").engineeringReady).toBe(false);
  });

  test("mode assessor never verifies checklist #1/#5 or enables writes", () => {
    const modes: Hsi10ContinuousJourneySuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessHsi10ContinuousJourneyMode(mode);
      expect(assessment.mayClaimChecklist1Verified).toBe(false);
      expect(assessment.mayClaimChecklist5Verified).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayInventStagingUrl).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/hsi-10-continuous-journey-evidence.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      productionWritesEnabled: boolean;
      acceptedForScope: boolean;
      journeyCompleteClaimed: boolean;
      references: { staging_grant_run_ref: string; staging_target_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.productionWritesEnabled).toBe(false);
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.journeyCompleteClaimed).toBe(false);
    expect(pending.references.staging_grant_run_ref).toBe("NOT_STARTED");
    expect(pending.references.staging_target_ref).toBe("NOT_APPROVED");

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_10_CONTINUOUS_JOURNEY_EVIDENCE_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("checklist");
  });

  test("reuse module paths exist on disk", () => {
    const root = join(import.meta.dir, "..");
    const packet = hsi10ContinuousJourneyEvidencePacket();
    for (const rel of packet.reuseModules) {
      readFileSync(join(root, rel));
    }
  });
});
