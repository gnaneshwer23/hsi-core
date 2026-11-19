import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextFMode,
  assessNextFPilotHonesty,
  assertNextFSoakPilotReleaseSoftLand,
  nextFSoakPilotReleasePacket,
  nextFSurfaceById,
  type NextFSuiteMode,
  type NextFSurfaceId,
} from "../src/operations/nextFSoakPilotReleaseSoftLand";

describe("NEXT-F soak / pilot release soft-land", () => {
  test("documents seven surfaces without claiming soak or signed pilot", () => {
    const packet = nextFSoakPilotReleasePacket();
    const summary = assertNextFSoakPilotReleaseSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.soakAccepted).toBe(false);
    expect(summary.pilotReleaseSigned).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.backlogId).toBe("NEXT-F");
    expect(packet.priority).toBe("P1");
    expect(packet.dependsOn).toEqual(["NEXT-E"]);
    expect(packet.alsoRequires).toBe("all_p0_p1_acceptance");
    expect(packet.honesty.noInventedOnCall).toBe(true);
    expect(packet.inventedFourteenDayEvidence).toBe(false);
  });

  test("each surface keeps soak and pilot claims false", () => {
    const surfaces: NextFSurfaceId[] = [
      "ops_alert_catalog",
      "kill_switch_spend_caps",
      "pilot_operations_store",
      "restore_rollback_drills",
      "fourteen_day_soak_evidence",
      "on_call_acknowledgement",
      "signed_invite_only_pilot",
    ];
    for (const surface of surfaces) {
      const row = nextFSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.soakAccepted).toBe(false);
      expect(row.pilotReleaseSigned).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows soak, pilot, or invented on-call", () => {
    const modes: NextFSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextFMode(mode);
      expect(assessment.mayClaimSoakAccepted).toBe(false);
      expect(assessment.mayClaimPilotReleaseSigned).toBe(false);
      expect(assessment.mayInventOnCall).toBe(false);
      expect(assessment.mayInventAlertDestinations).toBe(false);
      expect(assessment.mayAutoPromoteGraph).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.soakAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("pilot honesty stays fail-closed", () => {
    const honesty = assessNextFPilotHonesty();
    expect(honesty.mustNameSecurityAndOpsOwners).toBe(true);
    expect(honesty.mustWireRealKeysAndAlertDestination).toBe(true);
    expect(honesty.mustApproveLoadCapCohortPolicy).toBe(true);
    expect(honesty.mustRetainFourteenDayEvidence).toBe(true);
    expect(honesty.mustDrillRpoRtoAndKillSwitch).toBe(true);
    expect(honesty.mustKeepBriefAndGraphPromotionSeparate).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/next-f-soak-pilot-release.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      soakAccepted: boolean;
      pilotReleaseSigned: boolean;
      references: {
        next_e_acceptance_ref: string;
        on_call_owner_ref: string;
        alert_destination_ref: string;
        fourteen_day_soak_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.soakAccepted).toBe(false);
    expect(pending.pilotReleaseSigned).toBe(false);
    expect(pending.references.next_e_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.on_call_owner_ref).toBe("UNASSIGNED");
    expect(pending.references.alert_destination_ref).toBe("UNASSIGNED");
    expect(pending.references.fourteen_day_soak_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_F_SOAK_PILOT_RELEASE_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-F");
    expect(doc).toContain("soakAccepted");
    expect(doc).toContain("14-day");
  });
});
