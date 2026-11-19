import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e03CompositionMode,
  assessPassageAbstractEgress,
  assertE2e03ClearanceCompositionSoftLand,
  e2e03RetrievalSurfaceById,
  e2e03SourceClearanceCompositionPacket,
  type E2e03CompositionMode,
  type E2e03RetrievalSurfaceId,
} from "../src/operations/e2e03SourceClearanceComposition";

describe("PR-E2E-03 source clearance composition soft-land", () => {
  test("documents nine surfaces without inventing policy approval", () => {
    const packet = e2e03SourceClearanceCompositionPacket();
    const summary = assertE2e03ClearanceCompositionSoftLand(packet);
    expect(summary.surfaceCount).toBe(9);
    expect(summary.policySigned).toBe(false);
    expect(summary.policyDraftStatus).toBe("DRAFT");
    expect(summary.livePassageRetrievalAuthorized).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-03");
    expect(packet.scientificApproval).toBe(false);
    expect(packet.honesty.noInventedPolicyApproval).toBe(true);
    expect(packet.honesty.draftPolicyRemainsDraft).toBe(true);
    expect(packet.policyApprovalRef).toBeNull();
  });

  test("each surface refuses uncleared passage egress", () => {
    const surfaces: E2e03RetrievalSurfaceId[] = [
      "scientific_abstract_api",
      "live_sources_abstracts",
      "investigation_live_run",
      "open_access_sections",
      "literature_search_metadata",
      "scientific_pubmed",
      "investigation_trace",
      "dynamic_evidence_metadata",
      "live_search_cleared_path",
    ];
    for (const surface of surfaces) {
      const row = e2e03RetrievalSurfaceById(surface);
      expect(row.surface).toBe(surface);
      expect(row.passageOrAbstractWithoutReceiptAllowed).toBe(false);
      expect(row.pathHints.length).toBeGreaterThan(0);
      expect(row.notes.length).toBeGreaterThan(0);
    }
  });

  test("mode assessor never allows uncleared passage claims", () => {
    const modes: E2e03CompositionMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e03CompositionMode(mode);
      expect(assessment.mayClaimPolicySigned).toBe(false);
      expect(assessment.mayReturnPassageOrAbstractWithoutReceipt).toBe(false);
      expect(assessment.mayClaimLiveClearance).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.policyDraftStatus).toBe("DRAFT");
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("abstract egress assessor stays fail-closed", () => {
    const egress = assessPassageAbstractEgress();
    expect(egress.mayReturnPassageOrAbstractWithoutReceipt).toBe(false);
    expect(egress.sourceClearanceVerified).toBe(false);
    expect(egress.passageReuseAuthorized).toBe(false);
    expect(egress.policySigned).toBe(false);
    expect(egress.policyDraftStatus).toBe("DRAFT");
    expect(egress.reasons.some((r) => r.includes("DRAFT"))).toBe(true);
  });

  test("pending worksheet and soft-land doc stay blocked / DRAFT", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-03-source-clearance.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      policyDraftStatus: string;
      policySigned: boolean;
      policyApprovalRef: null;
      livePassageRetrievalAuthorized: boolean;
      references: {
        policy_approver_ref: string;
        clearance_authority_ref: string;
        managed_signer_ref: string;
      };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.policyDraftStatus).toBe("DRAFT");
    expect(pending.policySigned).toBe(false);
    expect(pending.policyApprovalRef).toBeNull();
    expect(pending.livePassageRetrievalAuthorized).toBe(false);
    expect(pending.references.policy_approver_ref).toBe("UNASSIGNED");
    expect(pending.references.clearance_authority_ref).toBe("UNASSIGNED");
    expect(pending.references.managed_signer_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_03_SOURCE_CLEARANCE_COMPOSITION_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-03");
    expect(doc).toContain("DRAFT");

    const draft = readFileSync(join(root, "docs/SOURCE_CLEARANCE_POLICY_DRAFT.md"), "utf8");
    expect(draft).toContain("Status: DRAFT");
    expect(draft).not.toMatch(/Status:\s*APPROVED/i);
  });
});
