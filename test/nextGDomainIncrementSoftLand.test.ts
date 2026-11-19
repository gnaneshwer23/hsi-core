import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextGIncrementHonesty,
  assessNextGMode,
  assertNextGDomainIncrementSoftLand,
  nextGDomainIncrementPacket,
  nextGSurfaceById,
  type NextGSuiteMode,
  type NextGSurfaceId,
} from "../src/operations/nextGDomainIncrementSoftLand";

describe("NEXT-G domain increment soft-land", () => {
  test("documents seven surfaces without accepting a domain increment", () => {
    const packet = nextGDomainIncrementPacket();
    const summary = assertNextGDomainIncrementSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.domainIncrementAccepted).toBe(false);
    expect(summary.plannerEnabled).toBe(false);
    expect(summary.communityLaunched).toBe(false);
    expect(summary.clinicalPhiEnabled).toBe(false);
    expect(packet.backlogId).toBe("NEXT-G");
    expect(packet.priority).toBe("P2");
    expect(packet.dependsOn).toEqual(["NEXT-C"]);
    expect(packet.honesty.clinicalPhiRemainsSeparate).toBe(true);
    expect(packet.inventedSourcePacks).toBe(false);
  });

  test("each surface keeps increment, planner, community, and PHI false", () => {
    const surfaces: NextGSurfaceId[] = [
      "controlled_expansion_candidate",
      "source_pack_and_scoped_reviewers",
      "source_refresh_rereview",
      "observed_failure_ledger",
      "optional_planner_comparison",
      "community_moderation_gate",
      "clinical_phi_boundary",
    ];
    for (const surface of surfaces) {
      const row = nextGSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.domainIncrementAccepted).toBe(false);
      expect(row.plannerEnabled).toBe(false);
      expect(row.communityLaunched).toBe(false);
      expect(row.clinicalPhiEnabled).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows increment, planner, community, or PHI", () => {
    const modes: NextGSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextGMode(mode);
      expect(assessment.mayClaimDomainIncrement).toBe(false);
      expect(assessment.mayEnablePlanner).toBe(false);
      expect(assessment.mayLaunchCommunity).toBe(false);
      expect(assessment.mayEnableClinicalPhi).toBe(false);
      expect(assessment.mayInventSourcePacks).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.domainIncrementAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("increment honesty stays fail-closed", () => {
    const honesty = assessNextGIncrementHonesty();
    expect(honesty.mustRequireP1CAcceptance).toBe(true);
    expect(honesty.mustCloseObservedFailureLedgerIndependently).toBe(true);
    expect(honesty.mustBindCurrentSourcePacksAndScopedReviewers).toBe(true);
    expect(honesty.mustPropagateSourceRefreshRereview).toBe(true);
    expect(honesty.mustKeepPlannerDeterministicUnlessPreregistered).toBe(true);
    expect(honesty.mustKeepClinicalPhiSeparate).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/next-g-domain-increment.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      domainIncrementAccepted: boolean;
      plannerEnabled: boolean;
      clinicalPhiEnabled: boolean;
      references: {
        next_c_acceptance_ref: string;
        failure_ledger_close_ref: string;
        source_pack_ref: string;
        scoped_reviewer_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.domainIncrementAccepted).toBe(false);
    expect(pending.plannerEnabled).toBe(false);
    expect(pending.clinicalPhiEnabled).toBe(false);
    expect(pending.references.next_c_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.failure_ledger_close_ref).toBe("NOT_STARTED");
    expect(pending.references.source_pack_ref).toBe("UNASSIGNED");
    expect(pending.references.scoped_reviewer_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_G_DOMAIN_INCREMENT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-G");
    expect(doc).toContain("domainIncrementAccepted");
    expect(doc).toContain("Clinical/PHI");
  });
});
