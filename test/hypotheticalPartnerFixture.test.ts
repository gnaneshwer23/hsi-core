import { describe, expect, test } from "bun:test";
import {
  ALLOW_HYPOTHETICAL_PARTNER_ENV,
  HYPOTHETICAL_PARTNER_FIXTURE,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
  buildPartnerFlipReadinessBundle,
  getPartnerLock,
  isAllowHypotheticalPartnerEnabled,
  isHypotheticalTestFixturePartner,
  isProductionPartnerSignedTrusted,
  partnerLockExportPointer,
} from "../src/index";

describe("hypothetical test-fixture partner", () => {
  test("fixture is active with honest path-testing flags", () => {
    expect(USE_HYPOTHETICAL_PARTNER_FIXTURE).toBe(true);

    const lock = getPartnerLock();
    expect(isHypotheticalTestFixturePartner(lock)).toBe(true);
    expect(lock.partner?.id).toBe("test:hypothetical-isi-pilot-partner");
    expect(lock.partner?.type).toBe("hypothetical_test_fixture");
    expect(lock.partner?.label).toContain("Hypothetical ISI Pilot Partner");
    expect(lock.partnerSigned).toBe(true);
    expect(lock.lockedPilot).toBe(false);
    expect(lock.legalBinding).toBe(false);
    expect(lock.agreementKind).toBe("hypothetical_test_only");
    expect(lock.isHypothetical).toBe(true);
    expect(lock.notALegalAgreement).toBe(true);
    expect(lock.testPilotMode).toBe(true);
    expect(lock.replaceWithRealPartner).toBe(true);
    expect(lock.testFixtureBanner).toContain("TEST FIXTURE");
    expect(lock.scopeLocked).toBe(true);
    expect(lock.status).toBe("scope_locked");

    const pointer = partnerLockExportPointer(lock);
    expect(pointer.partnerSigned).toBe(true);
    expect(pointer.lockedPilot).toBe(false);
    expect(pointer.isHypothetical).toBe(true);
    expect(pointer.agreementKind).toBe("hypothetical_test_only");
  });

  test("production trust requires ALLOW_HYPOTHETICAL_PARTNER", () => {
    const lock = getPartnerLock();
    expect(isProductionPartnerSignedTrusted(lock, {})).toBe(false);
    expect(
      isProductionPartnerSignedTrusted(lock, {
        [ALLOW_HYPOTHETICAL_PARTNER_ENV]: "true",
      }),
    ).toBe(true);
    expect(isAllowHypotheticalPartnerEnabled({})).toBe(false);
    expect(
      isAllowHypotheticalPartnerEnabled({
        [ALLOW_HYPOTHETICAL_PARTNER_ENV]: "1",
      }),
    ).toBe(true);
  });

  test("flip-readiness marks named_org satisfied_by_fixture with real replacement pending", () => {
    const bundle = buildPartnerFlipReadinessBundle({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });

    expect(bundle.partnerSigned).toBe(true);
    expect(bundle.lockedPilot).toBe(false);
    expect(bundle.isHypothetical).toBe(true);
    expect(bundle.summary.readyToFlipPartnerSigned).toBe(false);
    expect(bundle.summary.readyForRealPartnerReplacement).toBe(true);
    expect(bundle.summary.satisfiedByFixture).toBeGreaterThanOrEqual(3);

    const byId = Object.fromEntries(
      bundle.flipRequirements.map((r) => [r.id, r]),
    );
    expect(byId.named_org.status).toBe("satisfied_by_fixture");
    expect(byId.named_org.pendingRealReplacementSteps?.length).toBeGreaterThan(
      0,
    );
    expect(byId.question_confirm.status).toBe("satisfied_by_fixture");
    expect(byId.partner_signed_flip.status).toBe("satisfied_by_fixture");
    expect(byId.real_partner_replacement.status).toBe("pending");
    expect(byId.licensing.status).toBe("pending");
    expect(byId.thresholds.status).toBe("pending");

    expect(HYPOTHETICAL_PARTNER_FIXTURE.partner.id).toBe(
      "test:hypothetical-isi-pilot-partner",
    );
  });
});
