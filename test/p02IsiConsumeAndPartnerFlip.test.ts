import { describe, expect, test } from "bun:test";
import {
  ISI_CONSUME_CONTRACT_SCHEMA,
  ISI_CONSUME_CONTRACT_VERSION,
  PARTNER_FLIP_READINESS_SCHEMA,
  SOURCE_LICENSING_STUB_SCHEMA,
  buildIsiConsumeContractBundle,
  buildPartnerFlipReadinessBundle,
  buildSourceLicensingStubBundle,
  getPartnerLock,
  serializeIsiConsumeContract,
  serializePartnerFlipReadiness,
  serializeSourceLicensingStub,
} from "../src/index";

describe("P0.2-HSI ISI consume contract + partner flip-readiness", () => {
  test("consume contract is machine-readable with Gate C + grades + Discovery paths", () => {
    const bundle = buildIsiConsumeContractBundle({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });

    expect(bundle.schemaVersion).toBe(ISI_CONSUME_CONTRACT_SCHEMA);
    expect(bundle.contractVersion).toBe(ISI_CONSUME_CONTRACT_VERSION);
    expect(bundle.phase).toBe("P0.2-HSI");
    expect(bundle.notCds).toBe(true);
    expect(bundle.autoApproveIntoKg).toBe(false);
    expect(bundle.containsPhi).toBe(false);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.lockedPilot).toBe(false);
    expect(bundle.vertical.askStaysRa).toBe(true);
    expect(bundle.gateC.statusOnPublish).toBe("pending");
    expect(bundle.gateC.autoApprove).toBe(false);
    expect(bundle.gateC.mayFlipHsiGradeFromChecklist).toBe(false);
    expect(bundle.grades.hsiGrades).toEqual([
      "established",
      "uncertain",
      "unexplored",
    ]);
    expect(bundle.summary.artifactCount).toBeGreaterThan(20);
    expect(bundle.summary.requiredCoreCount).toBeGreaterThanOrEqual(4);
    expect(bundle.compatibility.immunecityEditFromThisWorkspace).toBe(false);
    expect(bundle.compatibility.sharedEvidenceNeon).toBe(false);

    const keys = bundle.artifacts.map((a) => a.manifestKey);
    expect(keys).toContain("isiExport");
    expect(keys).toContain("gateCChecklistJson");
    expect(keys).toContain("partnerLockJson");
    expect(keys).toContain("isiConsumeContractJson");
    expect(keys).toContain("partnerFlipReadinessJson");
    expect(keys).toContain("sourceLicensingStubJson");

    for (const a of bundle.artifacts) {
      expect(a.autoApproveIntoKg).toBe(false);
    }
    for (const p of bundle.discoveryJsonPaths) {
      expect(p.notCds).toBe(true);
      expect(p.sitePath.startsWith("site/public/discovery/")).toBe(true);
    }

    const json = JSON.parse(serializeIsiConsumeContract(bundle));
    expect(json.partnerSigned).toBe(false);
  });

  test("partner flip-readiness stays honest: partnerSigned=false; fail/pending only", () => {
    const lock = getPartnerLock();
    expect(lock.partnerSigned).toBe(false);
    expect(lock.lockedPilot).toBe(false);

    const bundle = buildPartnerFlipReadinessBundle({
      generatedAt: "2026-11-01T19:00:00.000Z",
      lock,
    });

    expect(bundle.schemaVersion).toBe(PARTNER_FLIP_READINESS_SCHEMA);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.lockedPilot).toBe(false);
    expect(bundle.summary.readyToFlipPartnerSigned).toBe(false);
    expect(bundle.summary.pass).toBe(0);
    expect(bundle.summary.fail).toBeGreaterThanOrEqual(3);
    expect(bundle.summary.pending).toBeGreaterThanOrEqual(2);

    const byId = Object.fromEntries(
      bundle.flipRequirements.map((r) => [r.id, r]),
    );
    expect(byId.named_org.status).toBe("fail");
    expect(byId.question_confirm.status).toBe("fail");
    expect(byId.shortlist_row.status).toBe("fail");
    expect(byId.partner_signed_flip.status).toBe("fail");
    expect(byId.licensing.status).toBe("pending");
    expect(byId.thresholds.status).toBe("pending");
    expect(byId.outputs_refresh.status).toBe("pending");

    for (const r of bundle.flipRequirements) {
      expect(["pass", "fail", "pending"]).toContain(r.status);
    }

    const json = JSON.parse(serializePartnerFlipReadiness(bundle));
    expect(json.summary.readyToFlipPartnerSigned).toBe(false);
    expect(json.partnerSigned).toBe(false);
  });

  test("source licensing stub lists RA/SSc/gut/neuro PMIDs as needs_review", () => {
    const bundle = buildSourceLicensingStubBundle({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });

    expect(bundle.schemaVersion).toBe(SOURCE_LICENSING_STUB_SCHEMA);
    expect(bundle.partnerSigned).toBe(false);
    expect(bundle.summary.pmidCount).toBeGreaterThan(20);
    expect(bundle.summary.needsReviewCount).toBe(bundle.summary.pmidCount);
    expect(bundle.summary.partnerClearedCount).toBe(0);

    const packs = new Set(bundle.rows.flatMap((r) => r.packs));
    expect(packs.has("ra_tnf")).toBe(true);
    expect(packs.has("ssc_tfh_b_il21")).toBe(true);
    expect(packs.has("gut_scfa")).toBe(true);
    expect(packs.has("neuro_vagus")).toBe(true);

    for (const r of bundle.rows) {
      expect(r.licenseStatus).toBe("needs_review");
      expect(r.pmid).toMatch(/^\d+$/);
      expect(r.europePmcUrl).toContain(r.pmid);
    }

    // Known primary PMIDs from each pack
    const pmids = new Set(bundle.rows.map((r) => r.pmid));
    expect(pmids.has("11244034")).toBe(true); // RA TNF
    expect(pmids.has("30760472")).toBe(true); // SSc
    expect(pmids.has("24226770")).toBe(true); // gut butyrate
    expect(pmids.has("10839541")).toBe(true); // neuro vagus

    const json = JSON.parse(serializeSourceLicensingStub(bundle));
    expect(json.summary.partnerClearedCount).toBe(0);
  });
});
