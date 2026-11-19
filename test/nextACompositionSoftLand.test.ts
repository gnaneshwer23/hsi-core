import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextACompositionHonesty,
  assessNextAMode,
  assertNextACompositionSoftLand,
  nextACompositionPacket,
  nextASurfaceById,
  type NextASuiteMode,
  type NextASurfaceId,
} from "../src/operations/nextACompositionSoftLand";

describe("NEXT-A composition soft-land", () => {
  test("documents seven surfaces without authorizing live composition", () => {
    const packet = nextACompositionPacket();
    const summary = assertNextACompositionSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.liveCompositionAuthorized).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("NEXT-A");
    expect(packet.priority).toBe("P0");
    expect(packet.dependsOnTrackB).toEqual(["B1", "B5"]);
    expect(packet.honesty.adaptersExistCompositionBlocked).toBe(true);
    expect(packet.inventedRedactedReceipts).toBe(false);
  });

  test("each surface keeps live composition and invented receipts false", () => {
    const surfaces: NextASurfaceId[] = [
      "source_clearance_receipts",
      "operational_source_clearance",
      "e2e03_clearance_composition",
      "pinned_provider_transport",
      "staging_provider_operations",
      "dual_provider_harness",
      "redacted_live_receipts",
    ];
    for (const surface of surfaces) {
      const row = nextASurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.liveCompositionAuthorized).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.inventedReceipts).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows live composition or invented receipts", () => {
    const modes: NextASuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextAMode(mode);
      expect(assessment.mayClaimLiveComposition).toBe(false);
      expect(assessment.mayInventReceipts).toBe(false);
      expect(assessment.mayInventCredentials).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.liveCompositionAuthorized).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("composition honesty stays fail-closed", () => {
    const honesty = assessNextACompositionHonesty();
    expect(honesty.mustKeepClearanceDraftUntilB1).toBe(true);
    expect(honesty.mustKeepProvidersUnboundUntilB5).toBe(true);
    expect(honesty.mustNotTreatHarnessGreenAsComposition).toBe(true);
    expect(honesty.mustRequireRedactedRealReceipts).toBe(true);
    expect(honesty.mustKeepFaultTestsOnChosenRuntime).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/next-a-composition.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      liveCompositionAuthorized: boolean;
      references: {
        b1_clearance_ref: string;
        b5_provider_a_ref: string;
        redacted_receipt_packet_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.liveCompositionAuthorized).toBe(false);
    expect(pending.references.b1_clearance_ref).toBe("UNASSIGNED");
    expect(pending.references.b5_provider_a_ref).toBe("UNASSIGNED");
    expect(pending.references.redacted_receipt_packet_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_A_COMPOSITION_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-A");
    expect(doc).toContain("liveCompositionAuthorized");
    expect(doc).toContain("B1");
  });
});
