import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessHsi10ScientificReliabilityU7Mode,
  assertHsi10ScientificReliabilityU7SoftLand,
  hsi10ScientificReliabilitySurfaceById,
  hsi10ScientificReliabilityU7Packet,
  type Hsi10ScientificReliabilitySuiteMode,
  type Hsi10ScientificReliabilitySurfaceId,
} from "../src/operations/hsi10ScientificReliabilityU7SoftLand";

describe("HSI 1.0 U7 scientific reliability soft-land", () => {
  test("documents five surfaces without claiming gold or approval", () => {
    const packet = hsi10ScientificReliabilityU7Packet();
    const summary = assertHsi10ScientificReliabilityU7SoftLand(packet);
    expect(summary.surfaceCount).toBe(5);
    expect(summary.smeGoldFilled).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(summary.adjudicatedCases).toBe(0);
    expect(summary.acceptedForScope).toBe(false);
    expect(packet.humanGate).toBe(4);
    expect(packet.checklistItems).toEqual([3, 4, 7]);
    expect(packet.honesty.uiHonestyIsNotScientificGo).toBe(true);
  });

  test("each surface keeps gold claims empty", () => {
    const surfaces: Hsi10ScientificReliabilitySurfaceId[] = [
      "e2e10_sme_gold_vault",
      "next_d_expert_vault_freeze",
      "comparability_honesty_ui",
      "provisional_hypothesis_honesty_ui",
      "scientific_approval_public_claim",
    ];
    for (const surface of surfaces) {
      const row = hsi10ScientificReliabilitySurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.smeGoldFilled).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.adjudicatedCasesClaimed).toBe(0);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
    expect(hsi10ScientificReliabilitySurfaceById("e2e10_sme_gold_vault").ownerEvidenceRequired).toBe(
      true,
    );
    expect(
      hsi10ScientificReliabilitySurfaceById("comparability_honesty_ui").engineeringReady,
    ).toBe(true);
  });

  test("mode assessor never fills gold or claims scientific approval", () => {
    const modes: Hsi10ScientificReliabilitySuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessHsi10ScientificReliabilityU7Mode(mode);
      expect(assessment.mayClaimSmeGoldFilled).toBe(false);
      expect(assessment.mayClaimAdjudicatedCases).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayFreezeHeldOut).toBe(false);
      expect(assessment.mayInventSmeLabels).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/hsi-10-scientific-reliability-u7.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      smeGoldFilled: boolean;
      scientificApproval: boolean;
      adjudicatedCases: number;
      inventedSmeLabels: boolean;
      references: { human_4_sme_a_ref: string; human_4_adjudicated_cases_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.smeGoldFilled).toBe(false);
    expect(pending.scientificApproval).toBe(false);
    expect(pending.adjudicatedCases).toBe(0);
    expect(pending.inventedSmeLabels).toBe(false);
    expect(pending.references.human_4_sme_a_ref).toBe("UNASSIGNED");
    expect(pending.references.human_4_adjudicated_cases_ref).toBe("NOT_STARTED");

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_10_SCIENTIFIC_RELIABILITY_U7_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("Human **#4**");
    expect(doc).not.toMatch(/smeGoldFilled:\s*true/);
  });

  test("reuse module paths exist on disk", () => {
    const root = join(import.meta.dir, "..");
    for (const path of hsi10ScientificReliabilityU7Packet().reuseModules) {
      readFileSync(join(root, path), "utf8");
    }
  });
});
