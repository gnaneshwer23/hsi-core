import { describe, expect, it } from "bun:test";
import {
  CDS_PHI_AGENT_CHECKLIST,
  CDS_PHI_BOUNDARY_PROVENANCE,
  CDS_PHI_OUT_OF_SCOPE_FOR_HSI,
  HSI_CDS_PHI_INVARIANTS,
  assertHsiCdsPhiBoundary,
  buildCdsPhiBoundaryBundle,
  rejectLiveCdsClaim,
  rejectPhiPayload,
  serializeCdsPhiBoundary,
} from "../src/cdsPhiBoundary";

describe("CDS/PHI boundary (Aksh → HSI)", () => {
  it("locks hard invariants to refuse CDS and PHI", () => {
    expect(HSI_CDS_PHI_INVARIANTS.notCds).toBe(true);
    expect(HSI_CDS_PHI_INVARIANTS.autoSurfaceCds).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.containsPhi).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.mayUseLivePhi).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.clinicalActive).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.liveEmis).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.ehrWriteBack).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.mhraApprovedCds).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.phiToLlm).toBe(false);
    expect(HSI_CDS_PHI_INVARIANTS.autoApproveIntoKg).toBe(false);
  });

  it("rejects PHI payloads by flag and marker text", () => {
    expect(rejectPhiPayload({ containsPhi: true }).ok).toBe(false);
    expect(rejectPhiPayload({ mayUseLivePhi: true }).ok).toBe(false);
    expect(rejectPhiPayload({ phiToLlm: true }).ok).toBe(false);
    const textHit = rejectPhiPayload({
      textBlobs: ["Upload patient name and NHS number to the model"],
    });
    expect(textHit.ok).toBe(false);
    if (!textHit.ok) {
      expect(textHit.reasons).toContain("phi_marker_text");
    }
    expect(rejectPhiPayload({ containsPhi: false, textBlobs: ["RA anti-TNF research edge"] }).ok).toBe(
      true,
    );
  });

  it("rejects live CDS claims by flag and marker text", () => {
    expect(rejectLiveCdsClaim({ notCds: false }).ok).toBe(false);
    expect(rejectLiveCdsClaim({ autoSurfaceCds: true }).ok).toBe(false);
    expect(rejectLiveCdsClaim({ clinicalActive: true }).ok).toBe(false);
    expect(rejectLiveCdsClaim({ liveEmis: true }).ok).toBe(false);
    expect(rejectLiveCdsClaim({ ehrWriteBack: true }).ok).toBe(false);
    expect(rejectLiveCdsClaim({ mhraApprovedCds: true }).ok).toBe(false);
    const textHit = rejectLiveCdsClaim({
      textBlobs: ["This handoff enables live CDS auto-apply to EHR"],
    });
    expect(textHit.ok).toBe(false);
    if (!textHit.ok) {
      expect(textHit.reasons).toContain("live_cds_claim_text");
    }
    expect(
      rejectLiveCdsClaim({
        notCds: true,
        autoSurfaceCds: false,
        textBlobs: ["notCds research Discovery pack"],
      }).ok,
    ).toBe(true);
  });

  it("assertHsiCdsPhiBoundary throws on PHI or live CDS", () => {
    expect(() =>
      assertHsiCdsPhiBoundary({ containsPhi: true }, "fixture"),
    ).toThrow(/PHI/);
    expect(() =>
      assertHsiCdsPhiBoundary({ notCds: false }, "fixture"),
    ).toThrow(/Live CDS/);
    expect(() =>
      assertHsiCdsPhiBoundary({ autoApproveIntoKg: true }, "fixture"),
    ).toThrow(/autoApproveIntoKg/);
    assertHsiCdsPhiBoundary({
      notCds: true,
      autoSurfaceCds: false,
      containsPhi: false,
      autoApproveIntoKg: false,
    });
  });

  it("builds a notCds / no-PHI boundary bundle with Aksh provenance", () => {
    const bundle = buildCdsPhiBoundaryBundle(new Date("2026-11-01T00:00:00.000Z"));
    expect(bundle.schemaVersion).toBe("hsi-cds-phi-boundary-1");
    expect(bundle.notCds).toBe(true);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.autoSurfaceCds).toBe(false);
    expect(bundle.provenance.repo).toContain("aksh-health-redesign");
    expect(bundle.provenance.commit).toBe(CDS_PHI_BOUNDARY_PROVENANCE.commit);
    expect(bundle.outOfScopeForHsi.length).toBe(CDS_PHI_OUT_OF_SCOPE_FOR_HSI.length);
    expect(CDS_PHI_AGENT_CHECKLIST.length).toBeGreaterThanOrEqual(7);
    expect(bundle.honesty.some((h) => /No live CDS/i.test(h))).toBe(true);
    const json = JSON.parse(serializeCdsPhiBoundary(bundle));
    expect(json.notCds).toBe(true);
    expect(json.mayUseLivePhi).toBe(false);
  });
});
