import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiOwnerPacketFillApplyOwnerAuthorized,
  HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
  validateHsiOwnerPacketFillApplyOwnerApproval,
} from "../src/hsiOwnerPacketFillApplyAuthorization";
import {
  applyHsiOwnerPacketFillProposal,
  buildHsiOwnerPacketFillProposal,
  type HsiOwnerPacketPendingWorksheet,
} from "../src/operations/hsiOwnerPacketFillApply";
import {
  assertHsiOwnerPacketFillApplySoftLand,
  hsiOwnerPacketFillApplySoftLandPacket,
  hsiOwnerPacketFillApplySurfaceById,
} from "../src/operations/hsiOwnerPacketFillApplySoftLand";

const REAL_REFS = {
  human2ClearancePolicyRef: "clearance-policy-digest-abcdef12",
  human2ClearanceAuthorityRef: "clearance-authority-digest-abcdef12",
  human2ManagedSignerRef: "managed-signer-digest-abcdef12",
  human3IsolationSignerRef: "isolation-signer-digest-abcdef12",
  human3TwoUserHttpEvidenceRef: "two-user-http-digest-abcdef12",
  human5StagingWritePacketRef: "staging-write-packet-digest-abcdef12",
  human5StagingTargetRef: "staging-target-digest-abcdef12",
};

describe("U47 owner-packet fill-apply", () => {
  test("owner approval refuses Human gates closed / invented signers", () => {
    expect(() =>
      validateHsiOwnerPacketFillApplyOwnerApproval(
        HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(() =>
      validateHsiOwnerPacketFillApplyOwnerApproval({
        ...HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
        human2Closed: true as false,
      }),
    ).toThrow(/Human|#2|invented|signed/i);
    assertHsiOwnerPacketFillApplyOwnerAuthorized(
      HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
    );
  });

  test("soft-land keeps Human gates and invented signers closed", () => {
    const packet = hsiOwnerPacketFillApplySoftLandPacket();
    const summary = assertHsiOwnerPacketFillApplySoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.human2Closed).toBe(false);
    expect(hsiOwnerPacketFillApplySurfaceById("dry_run_apply").engineeringReady).toBe(true);
    expect(
      hsiOwnerPacketFillApplySurfaceById("human_2_closed_claim").engineeringReady,
    ).toBe(false);
  });

  test("placeholder refs are refused", () => {
    expect(() =>
      buildHsiOwnerPacketFillProposal({
        ...REAL_REFS,
        human2ClearancePolicyRef: "UNASSIGNED",
      }),
    ).toThrow(/non-placeholder/i);
    expect(() =>
      buildHsiOwnerPacketFillProposal({
        ...REAL_REFS,
        human5StagingTargetRef: "fake-signer-example.com",
      }),
    ).toThrow(/invented/i);
  });

  test("dry-run apply fills refs without claiming Human gates closed", () => {
    const proposal = buildHsiOwnerPacketFillProposal(REAL_REFS);
    const ownerPacketsPending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-10-owner-packets.pending.json",
        ),
        "utf8",
      ),
    ) as HsiOwnerPacketPendingWorksheet;

    const result = applyHsiOwnerPacketFillProposal({
      authorization: HSI_OWNER_PACKET_FILL_APPLY_OWNER_APPROVAL,
      proposal,
      ownerPacketsPending,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.human2Closed).toBe(false);
    expect(result.human3Closed).toBe(false);
    expect(result.human5Closed).toBe(false);
    expect(result.signedPacketClaimed).toBe(false);
    expect(result.acceptedForScope).toBe(false);
    expect(result.ownerPacketsNext.references.human_2_clearance_policy_ref).toBe(
      REAL_REFS.human2ClearancePolicyRef,
    );
    expect(result.ownerPacketsNext.references.human_5_staging_target_ref).toBe(
      REAL_REFS.human5StagingTargetRef,
    );
    expect(result.ownerPacketsNext.packets?.human_2_source_clearance?.accepted).toBe(
      false,
    );
    expect(result.appliedReferenceKeys).toHaveLength(7);
  });

  test("docs keep U47 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U47_OWNER_PACKET_FILL_APPLY_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toMatch(/Human #2/i);
    expect(doc).toMatch(/not claimed/i);
    expect(doc).toMatch(/0 \/ 8/);
  });
});
