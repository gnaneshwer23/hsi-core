import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessNextCAuditHonesty,
  assessNextCMode,
  assertNextCDurableAuditSoftLand,
  nextCDurableAuditPacket,
  nextCSurfaceById,
  type NextCSuiteMode,
  type NextCSurfaceId,
} from "../src/operations/nextCDurableAuditSoftLand";

describe("NEXT-C durable audit soft-land", () => {
  test("documents seven surfaces without accepting a live journey", () => {
    const packet = nextCDurableAuditPacket();
    const summary = assertNextCDurableAuditSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.liveJourneyAccepted).toBe(false);
    expect(summary.graphPromotion).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.backlogId).toBe("NEXT-C");
    expect(packet.priority).toBe("P1");
    expect(packet.dependsOn).toEqual(["NEXT-A", "NEXT-B"]);
    expect(packet.honesty.noLegacyBriefTransfer).toBe(true);
    expect(packet.inventedAuditHashes).toBe(false);
  });

  test("each surface keeps journey and promotion false", () => {
    const surfaces: NextCSurfaceId[] = [
      "investigation_delivery",
      "bound_outcome_attachments",
      "authenticated_scientific_review",
      "immutable_review_decisions",
      "context_audit_archive",
      "rereview_outcome_guard",
      "ssc_ra_sle_saved_journey",
    ];
    for (const surface of surfaces) {
      const row = nextCSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.liveJourneyAccepted).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.graphPromotion).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows live journey or legacy transfer", () => {
    const modes: NextCSuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessNextCMode(mode);
      expect(assessment.mayClaimLiveJourney).toBe(false);
      expect(assessment.mayTransferLegacyBriefApproval).toBe(false);
      expect(assessment.mayPromoteToGraph).toBe(false);
      expect(assessment.mayInventAuditHashes).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.liveJourneyAccepted).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("audit honesty stays fail-closed", () => {
    const honesty = assessNextCAuditHonesty();
    expect(honesty.mustKeepImmutableAuditHashDecisions).toBe(true);
    expect(honesty.mustRetainFailuresAndEmptySearches).toBe(true);
    expect(honesty.mustDenyLegacyBriefTransfer).toBe(true);
    expect(honesty.mustKeepGraphPromotionSeparate).toBe(true);
    expect(honesty.mustRequireNextAAndBFirst).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/next-c-durable-audit.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      liveJourneyAccepted: boolean;
      references: {
        next_a_acceptance_ref: string;
        next_b_acceptance_ref: string;
        primary_domain_pack_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.liveJourneyAccepted).toBe(false);
    expect(pending.references.next_a_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.next_b_acceptance_ref).toBe("NOT_STARTED");
    expect(pending.references.primary_domain_pack_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/NEXT_C_DURABLE_AUDIT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("NEXT-C");
    expect(doc).toContain("liveJourneyAccepted");
    expect(doc).toContain("NEXT-A");
  });
});
