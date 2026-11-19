import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessTrackBHonesty,
  assessTrackBMode,
  assertTrackBOwnerGatesSoftLand,
  trackBGateById,
  trackBOwnerGatesPacket,
  type TrackBGateId,
  type TrackBSuiteMode,
} from "../src/operations/trackBOwnerGates";

describe("Track B owner-gates soft-land", () => {
  test("documents five gates without inventing authorities", () => {
    const packet = trackBOwnerGatesPacket();
    const summary = assertTrackBOwnerGatesSoftLand(packet);
    expect(summary.gateCount).toBe(5);
    expect(summary.pilotReadinessClaimed).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("Track-B");
    expect(packet.honesty.noInventedSigner).toBe(true);
    expect(packet.honesty.noInventedCaps).toBe(true);
    expect(packet.inventedMoU).toBe(false);
    expect(packet.gateCAutoApprove).toBe(false);
  });

  test("each gate keeps acceptance and invented authority false", () => {
    const gates: TrackBGateId[] = ["B1", "B2", "B3", "B4", "B5"];
    for (const gate of gates) {
      const row = trackBGateById(gate);
      expect(row.gate).toBe(gate);
      expect(row.acceptedForScope).toBe(false);
      expect(row.signedPacketClaimed).toBe(false);
      expect(row.inventedAuthority).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
      expect(row.unblocks.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows invent or pilot-readiness claims", () => {
    const modes: TrackBSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessTrackBMode(mode);
      expect(assessment.mayInventSigner).toBe(false);
      expect(assessment.mayInventReviewers).toBe(false);
      expect(assessment.mayInventNumericCaps).toBe(false);
      expect(assessment.mayClaimPilotReadiness).toBe(false);
      expect(assessment.mayClaimAcceptance).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("owner-gate honesty stays fail-closed", () => {
    const honesty = assessTrackBHonesty();
    expect(honesty.mustKeepPolicyDraftUntilOwnerSigns).toBe(true);
    expect(honesty.mustKeepMigrationHoldsUntilDbReviewer).toBe(true);
    expect(honesty.mustKeepDualReviewBlockedUntilSmes).toBe(true);
    expect(honesty.mustKeepBenchmarkFloorsUnapproved).toBe(true);
    expect(honesty.mustKeepSpendCapsUnsetInGit).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/track-b-owner-gates.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      pilotReadinessClaimed: boolean;
      references: {
        b1_policy_signer_ref: string;
        b2_db_reviewer_ref: string;
        b5_spend_cap_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.pilotReadinessClaimed).toBe(false);
    expect(pending.references.b1_policy_signer_ref).toBe("UNASSIGNED");
    expect(pending.references.b2_db_reviewer_ref).toBe("UNASSIGNED");
    expect(pending.references.b5_spend_cap_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/TRACK_B_OWNER_GATES_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("Track B");
    expect(doc).toContain("B1");
    expect(doc).toContain("pilot readiness");
  });
});
