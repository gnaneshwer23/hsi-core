import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessHsi10OwnerPacketsMode,
  assertHsi10OwnerPacketsScaffold,
  hsi10OwnerPacketById,
  hsi10OwnerPacketsPacket,
  type Hsi10OwnerPacketId,
  type Hsi10OwnerPacketsSuiteMode,
} from "../src/operations/hsi10OwnerPacketsScaffold";

describe("HSI 1.0 U6 owner packets scaffold", () => {
  test("documents three packets without claiming acceptance or writes", () => {
    const packet = hsi10OwnerPacketsPacket();
    const summary = assertHsi10OwnerPacketsScaffold(packet);
    expect(summary.packetCount).toBe(3);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.signedPacketClaimed).toBe(false);
    expect(summary.migrationHoldsChanged).toBe(false);
    expect(packet.humanGates).toEqual([2, 3, 5]);
    expect(packet.honesty.noInventedMoU).toBe(true);
    expect(packet.honesty.noHoldRemoval).toBe(true);
  });

  test("each packet stays owner-gated with a usable checklist", () => {
    const ids: Hsi10OwnerPacketId[] = [
      "human_2_source_clearance",
      "human_3_isolation_review",
      "human_5_staging_persistence",
    ];
    for (const id of ids) {
      const row = hsi10OwnerPacketById(id);
      expect(row.packet).toBe(id);
      expect(row.disposition).toBe("owner_gated");
      expect(row.acceptedForScope).toBe(false);
      expect(row.signedPacketClaimed).toBe(false);
      expect(row.productionWritesEnabled).toBe(false);
      expect(row.inventedSigner).toBe(false);
      expect(row.engineeringReady).toBe(true);
      expect(row.pathHints.length).toBeGreaterThan(0);
      expect(row.ownerChecklist.length).toBeGreaterThanOrEqual(3);
    }
    expect(hsi10OwnerPacketById("human_2_source_clearance").checklistItem).toBe(2);
    expect(hsi10OwnerPacketById("human_3_isolation_review").checklistItem).toBe(6);
    expect(hsi10OwnerPacketById("human_5_staging_persistence").checklistItem).toBe(5);
  });

  test("mode assessor never closes Human #2/#3/#5 or lifts holds", () => {
    const modes: Hsi10OwnerPacketsSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessHsi10OwnerPacketsMode(mode);
      expect(assessment.mayClaimHuman2Closed).toBe(false);
      expect(assessment.mayClaimHuman3Closed).toBe(false);
      expect(assessment.mayClaimHuman5Closed).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayInventSigner).toBe(false);
      expect(assessment.mayLiftMigrationHolds).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/hsi-10-owner-packets.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      productionWritesEnabled: boolean;
      acceptedForScope: boolean;
      signedPacketClaimed: boolean;
      migrationHoldsChanged: boolean;
      inventedMoU: boolean;
      references: {
        human_2_clearance_policy_ref: string;
        human_3_isolation_signer_ref: string;
        human_5_staging_target_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.productionWritesEnabled).toBe(false);
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.signedPacketClaimed).toBe(false);
    expect(pending.migrationHoldsChanged).toBe(false);
    expect(pending.inventedMoU).toBe(false);
    expect(pending.references.human_2_clearance_policy_ref).toBe("UNASSIGNED");
    expect(pending.references.human_3_isolation_signer_ref).toBe("UNASSIGNED");
    expect(pending.references.human_5_staging_target_ref).toBe("NOT_APPROVED");

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("Human **#2 / #3 / #5**");
    expect(doc).not.toMatch(/acceptedForScope:\s*true/);
  });
});
