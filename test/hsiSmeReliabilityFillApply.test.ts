import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiSmeReliabilityFillApplyOwnerAuthorized,
  HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
  validateHsiSmeReliabilityFillApplyOwnerApproval,
} from "../src/hsiSmeReliabilityFillApplyAuthorization";
import {
  applyHsiSmeReliabilityFillProposal,
  buildHsiSmeReliabilityFillProposal,
  type HsiSmeReliabilityPendingWorksheet,
} from "../src/operations/hsiSmeReliabilityFillApply";
import {
  assertHsiSmeReliabilityFillApplySoftLand,
  hsiSmeReliabilityFillApplySoftLandPacket,
  hsiSmeReliabilityFillApplySurfaceById,
} from "../src/operations/hsiSmeReliabilityFillApplySoftLand";

const REAL_REFS = {
  human4SmeARef: "sme-a-digest-abcdef12",
  human4SmeBRef: "sme-b-digest-abcdef12",
  human4AdjudicatorRef: "adjudicator-digest-abcdef12",
  human4PrivateVaultRef: ".hsi-private-benchmark",
  human4AdjudicatedCasesRef: "adjudicated-cases-digest-abcdef12",
};

describe("U48 SME reliability fill-apply", () => {
  test("owner approval refuses gold filled / invented labels", () => {
    expect(() =>
      validateHsiSmeReliabilityFillApplyOwnerApproval(
        HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
      ),
    ).not.toThrow();
    expect(() =>
      validateHsiSmeReliabilityFillApplyOwnerApproval({
        ...HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
        smeGoldFilled: true as false,
      }),
    ).toThrow(/gold|scientific|invented|adjudic/i);
    assertHsiSmeReliabilityFillApplyOwnerAuthorized(
      HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
    );
  });

  test("soft-land keeps gold and scientific approval closed", () => {
    const packet = hsiSmeReliabilityFillApplySoftLandPacket();
    const summary = assertHsiSmeReliabilityFillApplySoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.smeGoldFilled).toBe(false);
    expect(summary.adjudicatedCases).toBe(0);
    expect(hsiSmeReliabilityFillApplySurfaceById("dry_run_apply").engineeringReady).toBe(
      true,
    );
    expect(
      hsiSmeReliabilityFillApplySurfaceById("sme_gold_filled_claim").engineeringReady,
    ).toBe(false);
  });

  test("placeholder refs are refused", () => {
    expect(() =>
      buildHsiSmeReliabilityFillProposal({
        ...REAL_REFS,
        human4SmeARef: "UNASSIGNED",
      }),
    ).toThrow(/non-placeholder/i);
    expect(() =>
      buildHsiSmeReliabilityFillProposal({
        ...REAL_REFS,
        human4AdjudicatorRef: "fake-sme-example.com",
      }),
    ).toThrow(/invented/i);
  });

  test("dry-run apply fills refs without claiming gold", () => {
    const proposal = buildHsiSmeReliabilityFillProposal(REAL_REFS);
    const u7Pending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/hsi-10-scientific-reliability-u7.pending.json",
        ),
        "utf8",
      ),
    ) as HsiSmeReliabilityPendingWorksheet;
    const e2e10Pending = JSON.parse(
      readFileSync(
        join(
          import.meta.dir,
          "../operations/staging/e2e-10-sme-gold-vault.pending.json",
        ),
        "utf8",
      ),
    ) as HsiSmeReliabilityPendingWorksheet;

    const result = applyHsiSmeReliabilityFillProposal({
      authorization: HSI_SME_RELIABILITY_FILL_APPLY_OWNER_APPROVAL,
      proposal,
      u7Pending,
      e2e10Pending,
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.smeGoldFilled).toBe(false);
    expect(result.scientificApproval).toBe(false);
    expect(result.adjudicatedCases).toBe(0);
    expect(result.u7Next.references.human_4_sme_a_ref).toBe(REAL_REFS.human4SmeARef);
    expect(result.e2e10Next.references.sme_a_ref).toBe(REAL_REFS.human4SmeARef);
    expect(result.e2e10Next.references.private_vault_root_ref).toBe(
      REAL_REFS.human4PrivateVaultRef,
    );
    expect(result.appliedReferenceKeys).toHaveLength(5);
  });

  test("docs keep U48 honesty", () => {
    const doc = readFileSync(
      join(
        import.meta.dir,
        "../docs/engineering/HSI_U48_SME_RELIABILITY_FILL_APPLY_2026-11-22.md",
      ),
      "utf8",
    );
    expect(doc).toMatch(/Human #4/i);
    expect(doc).toMatch(/not claimed/i);
    expect(doc).toMatch(/0 \/ 8/);
  });
});
