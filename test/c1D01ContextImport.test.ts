import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessC1ApplyHonesty,
  assessC1ImportMode,
  assertC1D01ContextImportSoftLand,
  c1D01ContextImportPacket,
  c1ImportSurfaceById,
  type C1ImportSurfaceId,
  type C1SuiteMode,
} from "../src/operations/c1D01ContextImport";

describe("Track C1 D-01 context import soft-land", () => {
  test("documents seven surfaces without inventing proposals or promotion", () => {
    const packet = c1D01ContextImportPacket();
    const summary = assertC1D01ContextImportSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.graphPromotion).toBe(false);
    expect(summary.sealedProposedFillCountClaimed).toBe(0);
    expect(summary.scientificApproval).toBe(false);
    expect(packet.backlogId).toBe("C1");
    expect(packet.slice).toBe("D-01");
    expect(packet.honesty.noInventedCuratorFills).toBe(true);
    expect(packet.honesty.emptyProposalsLeaveGraphUnchanged).toBe(true);
    expect(packet.inventedCuratorProposals).toBe(false);
  });

  test("each surface keeps promotion and approval false", () => {
    const surfaces: C1ImportSurfaceId[] = [
      "sealed_completion_sheet",
      "csv_merge_proposals",
      "apply_overlay_cli",
      "fill_progress_ui",
      "edge_review_candidate_list",
      "empty_proposal_refuse",
      "post_apply_unreviewed_honesty",
    ];
    for (const surface of surfaces) {
      const row = c1ImportSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.graphPromotion).toBe(false);
      expect(row.scientificApproval).toBe(false);
      expect(row.autoPromotion).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows invent/promote claims", () => {
    const modes: C1SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessC1ImportMode(mode);
      expect(assessment.mayInventCuratorProposals).toBe(false);
      expect(assessment.mayPromoteEdges).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      expect(assessment.mayClaimGraphRelease).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.graphPromotion).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("apply honesty stays fail-closed", () => {
    const honesty = assessC1ApplyHonesty();
    expect(honesty.mustRefusePromotionFlags).toBe(true);
    expect(honesty.mustKeepReviewStatusUnreviewed).toBe(true);
    expect(honesty.mustKeepScientificClaimAllowedFalse).toBe(true);
    expect(honesty.mustKeepConfidenceNotCalibrated).toBe(true);
    expect(honesty.mustLeaveGraphUnchangedWhenNoProposals).toBe(true);
    expect(honesty.reasons.length).toBeGreaterThan(0);
  });

  test("pending worksheet, soft-land doc, and sealed sheet stay honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/c1-d01-context-import.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      graphPromotion: boolean;
      inventedCuratorProposals: boolean;
      sealedProposedFillCount: number;
      references: { curator_fill_owner_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.graphPromotion).toBe(false);
    expect(pending.inventedCuratorProposals).toBe(false);
    expect(pending.sealedProposedFillCount).toBe(0);
    expect(pending.references.curator_fill_owner_ref).toBe("UNASSIGNED");

    const sheet = JSON.parse(
      readFileSync(join(root, "research/domain-graph/context-completions.v1.json"), "utf8"),
    ) as {
      autoPromotion: boolean;
      scientificApproval: boolean;
      rows: Array<{
        proposed: { tissue: unknown; population: unknown; design: unknown };
      }>;
    };
    expect(sheet.autoPromotion).toBe(false);
    expect(sheet.scientificApproval).toBe(false);
    const filled = sheet.rows.filter(
      (r) =>
        r.proposed.tissue !== null ||
        r.proposed.population !== null ||
        r.proposed.design !== null,
    ).length;
    expect(filled).toBe(0);

    const doc = readFileSync(
      join(root, "docs/engineering/C1_D01_CONTEXT_IMPORT_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("Track C1");
    expect(doc).toContain("unreviewed");
  });
});
