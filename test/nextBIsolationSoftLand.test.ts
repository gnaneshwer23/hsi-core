import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextBIsolationHonesty,
  assessNextBMode,
  assertNextBIsolationSoftLand,
  nextBIsolationPacket,
  nextBSurfaceById,
  type NextBSuiteMode,
  type NextBSurfaceId,
} from "../src/operations/nextBIsolationSoftLand";

describe("NEXT-B isolation soft-land", () => {
  test("documents seven surfaces without authorizing live acceptance", () => {
    const packet = nextBIsolationPacket();
    const summary = assertNextBIsolationSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.liveExecutionAuthorized).toBe(false);
    expect(summary.migrationHoldsChanged).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.backlogId).toBe("NEXT-B");
    expect(packet.priority).toBe("P0");
    expect(packet.dependsOnTrackB).toEqual(["B2"]);
    expect(packet.communityWrites).toBe("DEFERRED");
    expect(packet.honesty.noHoldRemoval).toBe(true);
    expect(packet.inventedSecuritySigner).toBe(false);
  });

  test("each surface keeps live execution and acceptance false", () => {
    const surfaces: NextBSurfaceId[] = [
      "isolation_suite_cli",
      "persistence_security_checks",
      "e2e02_acceptance_packet",
      "next_b_pending_worksheet",
      "two_researcher_http_runner",
      "per_scope_migration_packet",
      "migration_holds",
    ];
    for (const surface of surfaces) {
      const row = nextBSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.liveExecutionAuthorized).toBe(false);
      expect(row.acceptedForScope).toBe(false);
      expect(row.signedPacketClaimed).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows acceptance or hold changes", () => {
    const modes: NextBSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextBMode(mode);
      expect(assessment.mayClaimAcceptance).toBe(false);
      expect(assessment.mayEnableLiveExecution).toBe(false);
      expect(assessment.mayInventSigner).toBe(false);
      expect(assessment.mayChangeMigrationHolds).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("isolation honesty stays fail-closed", () => {
    const honesty = assessNextBIsolationHonesty();
    expect(honesty.mustKeepCheckFixtureNonAcceptance).toBe(true);
    expect(honesty.mustRequireTwoResearchersPlusReviewer).toBe(true);
    expect(honesty.mustKeepScopesSeparatelySigned).toBe(true);
    expect(honesty.mustKeepHoldsUnchanged).toBe(true);
    expect(honesty.mustKeepCommunityWritesDeferred).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/next-b-acceptance.pending.json"), "utf8"),
    ) as {
      status: string;
      liveExecutionAuthorized: boolean;
      migrationHoldsChanged: boolean;
      references: {
        researcher_a_ref: string;
        security_signer_ref: string;
      };
    };
    expect(pending.status).toBe("BLOCKED");
    expect(pending.liveExecutionAuthorized).toBe(false);
    expect(pending.migrationHoldsChanged).toBe(false);
    expect(pending.references.researcher_a_ref).toBe("UNASSIGNED");
    expect(pending.references.security_signer_ref).toBe("UNASSIGNED");

    const softPending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/next-b-isolation-soft-land.pending.json"),
        "utf8",
      ),
    ) as { opsAcceptance: string; liveExecutionAuthorized: boolean };
    expect(softPending.opsAcceptance).toBe("BLOCKED");
    expect(softPending.liveExecutionAuthorized).toBe(false);

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_B_ISOLATION_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-B");
    expect(doc).toContain("migrationHoldsChanged");
    expect(doc).toContain("B2");
  });
});
