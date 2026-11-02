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
    expect(bundle.partnerSigned).toBe(true); // fixture path-testing
    expect(bundle.lockedPilot).toBe(false);
    expect(bundle.productionPartnerSigned).toBe(false);
    expect(bundle.isHypothetical).toBe(true);
    expect(bundle.agreementKind).toBe("hypothetical_test_only");
    expect(bundle.legalBinding).toBe(false);
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
    expect(json.partnerSigned).toBe(true);
    expect(json.productionPartnerSigned).toBe(false);
    expect(json.lockedPilot).toBe(false);
  });

  test("partner flip-readiness: fixture path; real partner + licensing still pending", () => {
    const lock = getPartnerLock();
    expect(lock.partnerSigned).toBe(true);
    expect(lock.lockedPilot).toBe(false);
    expect(lock.isHypothetical).toBe(true);
    expect(lock.partner?.id).toBe("test:hypothetical-isi-pilot-partner");

    const bundle = buildPartnerFlipReadinessBundle({
      generatedAt: "2026-11-01T19:00:00.000Z",
      lock,
    });

    expect(bundle.schemaVersion).toBe(PARTNER_FLIP_READINESS_SCHEMA);
    expect(bundle.partnerSigned).toBe(true);
    expect(bundle.lockedPilot).toBe(false);
    expect(bundle.summary.readyToFlipPartnerSigned).toBe(false);
    expect(bundle.summary.readyForRealPartnerReplacement).toBe(true);
    expect(bundle.summary.satisfiedByFixture).toBeGreaterThanOrEqual(3);

    const byId = Object.fromEntries(
      bundle.flipRequirements.map((r) => [r.id, r]),
    );
    expect(byId.named_org.status).toBe("satisfied_by_fixture");
    expect(byId.question_confirm.status).toBe("satisfied_by_fixture");
    expect(byId.shortlist_row.status).toBe("satisfied_by_fixture");
    expect(byId.partner_signed_flip.status).toBe("satisfied_by_fixture");
    expect(byId.real_partner_replacement.status).toBe("pending");
    expect(byId.licensing.status).toBe("pending");
    expect(byId.thresholds.status).toBe("set_for_test");

    for (const r of bundle.flipRequirements) {
      expect([
        "pass",
        "fail",
        "pending",
        "satisfied_by_fixture",
        "set_for_test",
      ]).toContain(r.status);
    }

    const json = JSON.parse(serializePartnerFlipReadiness(bundle));
    expect(json.summary.readyToFlipPartnerSigned).toBe(false);
    expect(json.partnerSigned).toBe(true);
    expect(json.lockedPilot).toBe(false);
  });

  test("source licensing stub keeps curator reviews without partner corpus clearance", () => {
    const bundle = buildSourceLicensingStubBundle({
      generatedAt: "2026-11-01T19:00:00.000Z",
    });

    expect(bundle.schemaVersion).toBe(SOURCE_LICENSING_STUB_SCHEMA);
    expect(bundle.phase).toBe("P0.3-reviewed");
    expect(bundle.partnerSigned).toBe(false); // production-trusted signed only; fixture ignored
    expect(bundle.reviewDate).toBe("2026-11-01");
    expect(bundle.reviewMethod.length).toBeGreaterThan(40);
    expect(bundle.summary.pmidCount).toBeGreaterThan(20);
    expect(bundle.summary.needsReviewCount).toBe(0);
    expect(bundle.summary.okOaCount).toBeGreaterThan(0);
    expect(bundle.summary.restrictedCount).toBeGreaterThan(0);
    // Fixture: no named-partner clearance applied
    expect(bundle.partnerClearance).toBeFalsy();
    expect(bundle.summary.partnerClearedCount).toBe(0);
    expect(bundle.summary.clearanceScopeCounts.uncleared).toBe(
      bundle.summary.pmidCount,
    );

    const packs = new Set(bundle.rows.flatMap((r) => r.packs));
    expect(packs.has("ra_tnf")).toBe(true);
    expect(packs.has("ssc_tfh_b_il21")).toBe(true);
    expect(packs.has("gut_scfa")).toBe(true);
    expect(packs.has("neuro_vagus")).toBe(true);

    const allowed = new Set(["ok_cite", "ok_oa", "restricted", "unknown"]);
    for (const r of bundle.rows) {
      expect(allowed.has(r.licenseStatus)).toBe(true);
      expect(r.clearanceScope).toBe("uncleared");
      expect(r.partnerCleared).toBe(false);
      expect(r.pmid).toMatch(/^\d+$/);
      expect(r.europePmcUrl).toContain(r.pmid);
    }

    const byPmid = new Map(bundle.rows.map((r) => [r.pmid, r]));
    expect(byPmid.get("11244034")?.licenseStatus).toBe("restricted"); // RA TNF
    expect(byPmid.get("30760472")?.licenseStatus).toBe("restricted"); // SSc
    expect(byPmid.get("24226770")?.licenseStatus).toBe("restricted"); // gut butyrate
    expect(byPmid.get("10839541")?.licenseStatus).toBe("restricted"); // neuro vagus
    expect(byPmid.get("24586782")?.licenseStatus).toBe("ok_oa"); // PLOS CC BY
    expect(byPmid.get("37763102")?.licenseStatus).toBe("ok_oa"); // MDPI CC BY
    expect(byPmid.get("27382171")?.licenseStatus).toBe("ok_cite"); // PNAS free, no CC
    expect(byPmid.get("19625695")?.licenseStatus).toBe("ok_cite"); // J Nutr
    expect(byPmid.get("24350901")?.licenseStatus).toBe("restricted"); // CXCL4 NEJM
    expect(byPmid.get("24226773")?.licenseStatus).toBe("restricted"); // Arpaia Nature
    expect(byPmid.get("11901203")?.licenseStatus).toBe("ok_oa"); // Bernik JEM

    const json = JSON.parse(serializeSourceLicensingStub(bundle));
    expect(json.summary.partnerClearedCount).toBe(0);
    expect(json.summary.needsReviewCount).toBe(0);
  });
});
