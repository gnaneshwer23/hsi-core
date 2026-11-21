import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessHsi10PilotReadinessU8Mode,
  assertHsi10PilotReadinessU8SoftLand,
  hsi10PilotReadinessSurfaceById,
  hsi10PilotReadinessU8Packet,
  type Hsi10PilotReadinessSuiteMode,
  type Hsi10PilotReadinessSurfaceId,
} from "../src/operations/hsi10PilotReadinessU8SoftLand";

describe("HSI 1.0 U8 pilot readiness soft-land", () => {
  test("documents five surfaces without claiming soak or invites", () => {
    const packet = hsi10PilotReadinessU8Packet();
    const summary = assertHsi10PilotReadinessU8SoftLand(packet);
    expect(summary.surfaceCount).toBe(5);
    expect(summary.soakAccepted).toBe(false);
    expect(summary.pilotReleaseSigned).toBe(false);
    expect(summary.pilotInviteAllowed).toBe(false);
    expect(summary.autoGraphPromotion).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.humanGate).toBe(8);
    expect(packet.checklistItem).toBe(8);
    expect(packet.honesty.checklist8BlockedUntilHuman8).toBe(true);
  });

  test("each surface refuses invites and auto promotion", () => {
    const surfaces: Hsi10PilotReadinessSurfaceId[] = [
      "next_f_soak_pilot_release",
      "ops_alert_and_kill_switch",
      "brief_usefulness_panel",
      "checklist_8_researcher_invite",
      "auto_graph_promotion",
    ];
    for (const surface of surfaces) {
      const row = hsi10PilotReadinessSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.pilotInviteAllowed).toBe(false);
      expect(row.autoGraphPromotion).toBe(false);
      expect(row.soakAccepted).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
    expect(
      hsi10PilotReadinessSurfaceById("checklist_8_researcher_invite").engineeringReady,
    ).toBe(false);
    expect(hsi10PilotReadinessSurfaceById("brief_usefulness_panel").engineeringReady).toBe(true);
  });

  test("mode assessor never invites pilots or claims soak", () => {
    const modes: Hsi10PilotReadinessSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessHsi10PilotReadinessU8Mode(mode);
      expect(assessment.mayClaimSoakAccepted).toBe(false);
      expect(assessment.mayClaimPilotReleaseSigned).toBe(false);
      expect(assessment.mayInvitePilotResearchers).toBe(false);
      expect(assessment.mayInventOnCall).toBe(false);
      expect(assessment.mayAutoPromoteGraph).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.pilotInviteAllowed).toBe(false);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/hsi-10-pilot-readiness-u8.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      soakAccepted: boolean;
      pilotInviteAllowed: boolean;
      autoGraphPromotion: boolean;
      references: { checklist_8_pilot_invite_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.soakAccepted).toBe(false);
    expect(pending.pilotInviteAllowed).toBe(false);
    expect(pending.autoGraphPromotion).toBe(false);
    expect(pending.references.checklist_8_pilot_invite_ref).toBe("BLOCKED_UNTIL_HUMAN_8");

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_10_PILOT_READINESS_U8_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("Blocked until Human #8 / NEXT-F");
  });

  test("reuse module paths exist on disk", () => {
    const root = join(import.meta.dir, "..");
    for (const path of hsi10PilotReadinessU8Packet().reuseModules) {
      readFileSync(join(root, path), "utf8");
    }
  });
});
