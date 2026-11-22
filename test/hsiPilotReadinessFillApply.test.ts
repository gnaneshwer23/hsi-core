import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiPilotReadinessFillApplyOwnerAuthorized,
  HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
  validateHsiPilotReadinessFillApplyOwnerApproval,
} from "../src/hsiPilotReadinessFillApplyAuthorization";
import {
  applyHsiPilotReadinessFillProposal,
  buildHsiPilotReadinessFillProposal,
  type HsiPilotReadinessPendingWorksheet,
} from "../src/operations/hsiPilotReadinessFillApply";
import {
  assertHsiPilotReadinessFillApplySoftLand,
  hsiPilotReadinessFillApplySoftLandPacket,
  hsiPilotReadinessFillApplySurfaceById,
} from "../src/operations/hsiPilotReadinessFillApplySoftLand";

const REAL_REFS = {
  human8NextFOpsAcceptanceRef: "next-f-ops-acceptance-digest-abcdef12",
  onCallOwnerRef: "on-call-owner-digest-abcdef12",
  alertDestinationRef: "alert-destination-digest-abcdef12",
  fourteenDaySoakRef: "fourteen-day-soak-digest-abcdef12",
  signedPilotPacketRef: "signed-pilot-packet-digest-abcdef12",
};

describe("U49 pilot readiness fill-apply", () => {
  test("owner approval refuses soak / invites / invented on-call", () => {
    expect(() =>
      validateHsiPilotReadinessFillApplyOwnerApproval(
        HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(() =>
      validateHsiPilotReadinessFillApplyOwnerApproval({
        ...HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
        soakAccepted: true as false,
      }),
    ).toThrow(/soak|pilot|invite|invented/i);
    assertHsiPilotReadinessFillApplyOwnerAuthorized(
      HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
    );
  });

  test("soft-land keeps soak and checklist #8 invites closed", () => {
    const packet = hsiPilotReadinessFillApplySoftLandPacket();
    const summary = assertHsiPilotReadinessFillApplySoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.soakAccepted).toBe(false);
    expect(summary.pilotInviteAllowed).toBe(false);
    expect(hsiPilotReadinessFillApplySurfaceById("dry_run_apply").engineeringReady).toBe(
      true,
    );
    expect(
      hsiPilotReadinessFillApplySurfaceById("checklist_8_invite_claim").engineeringReady,
    ).toBe(false);
  });

  test("placeholder refs are refused", () => {
    expect(() =>
      buildHsiPilotReadinessFillProposal({
        ...REAL_REFS,
        onCallOwnerRef: "UNASSIGNED",
      }),
    ).toThrow(/non-placeholder/i);
    expect(() =>
      buildHsiPilotReadinessFillProposal({
        ...REAL_REFS,
        fourteenDaySoakRef: "fake-soak-example.com",
      }),
    ).toThrow(/invented/i);
  });

  test("dry-run apply fills refs without claiming soak or invites", () => {
    const proposal = buildHsiPilotReadinessFillProposal(REAL_REFS);
    const u8Pending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-10-pilot-readiness-u8.pending.json",
        ),
        "utf8",
      ),
    ) as HsiPilotReadinessPendingWorksheet;
    const nextFPending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/next-f-soak-pilot-release.pending.json",
        ),
        "utf8",
      ),
    ) as HsiPilotReadinessPendingWorksheet;

    const result = applyHsiPilotReadinessFillProposal({
      authorization: HSI_PILOT_READINESS_FILL_APPLY_OWNER_APPROVAL,
      proposal,
      u8Pending,
      nextFPending,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.soakAccepted).toBe(false);
    expect(result.pilotReleaseSigned).toBe(false);
    expect(result.pilotInviteAllowed).toBe(false);
    expect(result.u8Next.references.on_call_owner_ref).toBe(REAL_REFS.onCallOwnerRef);
    expect(result.u8Next.references.checklist_8_pilot_invite_ref).toBe(
      "BLOCKED_UNTIL_HUMAN_8",
    );
    expect(result.nextFNext.references.fourteen_day_soak_ref).toBe(
      REAL_REFS.fourteenDaySoakRef,
    );
    expect(result.appliedReferenceKeys).toHaveLength(5);
  });

  test("docs keep U49 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U49_PILOT_READINESS_FILL_APPLY_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toMatch(/Human #8/i);
    expect(doc).toMatch(/not claimed/i);
    expect(doc).toMatch(/0 \/ 8/);
  });
});
