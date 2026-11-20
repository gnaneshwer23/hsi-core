import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessHsi10OwnerGatesMode,
  assertHsi10OwnerGatesWorksheet,
  hsi10OwnerGateById,
  hsi10OwnerGatesPacket,
  type Hsi10OwnerGateId,
  type Hsi10SuiteMode,
} from "../src/operations/hsi10OwnerGatesWorksheet";

describe("HSI 1.0 owner-gates worksheet soft-land", () => {
  test("documents four gates without claiming acceptance or pilot readiness", () => {
    const packet = hsi10OwnerGatesPacket();
    const summary = assertHsi10OwnerGatesWorksheet(packet);
    expect(summary.gateCount).toBe(4);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.pilotReadinessClaimed).toBe(false);
    expect(summary.signedPacketClaimed).toBe(false);
    expect(packet.backlogId).toBe("HSI-1.0-OWNER-GATES");
    expect(packet.productionWritesEnabled).toBe(false);
    expect(packet.gateCAutoApprove).toBe(false);
    expect(packet.honesty.pilotRequiresHuman8NextF).toBe(true);
    expect(packet.honesty.fixtureIsNotOwnerAcceptance).toBe(true);
  });

  test("each gate keeps acceptance claims false", () => {
    const gates: Hsi10OwnerGateId[] = [
      "acceptance_5_staging_save_reopen",
      "acceptance_6_two_user_isolation",
      "acceptance_7_expert_benchmark",
      "acceptance_8_decision_brief_pilot",
    ];
    for (const gate of gates) {
      const row = hsi10OwnerGateById(gate);
      expect(row.gate).toBe(gate);
      expect(row.acceptedForScope).toBe(false);
      expect(row.signedPacketClaimed).toBe(false);
      expect(row.pilotReadinessClaimed).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("checklist #8 stays blocked until Human #8 / NEXT-F", () => {
    const eight = hsi10OwnerGateById("acceptance_8_decision_brief_pilot");
    expect(eight.checklistItem).toBe(8);
    expect(eight.disposition).toBe("blocked_until_human_8_next_f");
  });

  test("mode assessor never allows owner acceptance or pilot invite", () => {
    const modes: Hsi10SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessHsi10OwnerGatesMode(mode);
      expect(assessment.mayClaimOwnerAcceptance).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayInventSmeGold).toBe(false);
      expect(assessment.mayInvitePilotResearchers).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
      expect(assessment.pilotReadinessClaimed).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/hsi-10-owner-gates.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      acceptedForScope: boolean;
      pilotReadinessClaimed: boolean;
      productionWritesEnabled: boolean;
      gateCAutoApprove: boolean;
      references: { checklist_8_pilot_invite_ref: string };
      gates: Record<string, { accepted: boolean }>;
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.pilotReadinessClaimed).toBe(false);
    expect(pending.productionWritesEnabled).toBe(false);
    expect(pending.gateCAutoApprove).toBe(false);
    expect(pending.references.checklist_8_pilot_invite_ref).toBe(
      "BLOCKED_UNTIL_HUMAN_8",
    );
    for (const gate of Object.values(pending.gates)) {
      expect(gate.accepted).toBe(false);
    }

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md"),
      "utf8",
    );
    expect(doc).toContain("Blocked until Human #8 / NEXT-F");
    expect(doc).toContain("Never invent");
  });

  test("reuse module paths exist on disk", () => {
    const root = join(import.meta.dir, "..");
    for (const path of hsi10OwnerGatesPacket().reuseModules) {
      readFileSync(join(root, path), "utf8");
    }
  });
});
