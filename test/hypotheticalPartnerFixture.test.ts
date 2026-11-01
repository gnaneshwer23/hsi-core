import { describe, expect, test } from "bun:test";
import {
  ALLOW_HYPOTHETICAL_PARTNER_ENV,
  REAL_PARTNER_REPLACEMENT,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
  buildPartnerFlipReadinessBundle,
  getPartnerLock,
  isAllowHypotheticalPartnerEnabled,
  isHypotheticalTestFixturePartner,
  isProductionPartnerSignedTrusted,
  partnerLockExportPointer,
} from "../src/index";

describe("named partner Apolo Pharma lock", () => {
  test("fixture off; Apolo Pharma drives lockedPilot", () => {
    expect(USE_HYPOTHETICAL_PARTNER_FIXTURE).toBe(false);

    const lock = getPartnerLock();
    expect(isHypotheticalTestFixturePartner(lock)).toBe(false);
    expect(lock.partner?.id).toBe("partner:apolo-pharma");
    expect(lock.partner?.label).toBe("Apolo Pharma");
    expect(lock.partner?.type).toBe("named_partner");
    expect(lock.partnerSigned).toBe(true);
    expect(lock.lockedPilot).toBe(true);
    expect(lock.legalBinding).toBe(true);
    expect(lock.agreementKind).toBe("legal_mou");
    expect(lock.isHypothetical).toBe(false);
    expect(lock.notALegalAgreement).toBe(false);
    expect(lock.testPilotMode).toBe(false);
    expect(lock.replaceWithRealPartner).toBe(false);
    expect(lock.testFixtureBanner).toBeNull();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.disease?.id).toBe("ra");
    expect(lock.honesty.some((h) => /operator-asserted/i.test(h))).toBe(true);

    const pointer = partnerLockExportPointer(lock);
    expect(pointer.partnerSigned).toBe(true);
    expect(pointer.lockedPilot).toBe(true);
    expect(pointer.isHypothetical).toBe(false);
    expect(pointer.agreementKind).toBe("legal_mou");
    expect(pointer.partner).toBe("partner:apolo-pharma");
  });

  test("production trust does not need ALLOW_HYPOTHETICAL_PARTNER for named legalBinding", () => {
    const lock = getPartnerLock();
    expect(isProductionPartnerSignedTrusted(lock, {})).toBe(true);
    expect(isAllowHypotheticalPartnerEnabled({})).toBe(false);
    expect(
      isAllowHypotheticalPartnerEnabled({
        [ALLOW_HYPOTHETICAL_PARTNER_ENV]: "1",
      }),
    ).toBe(true);
  });

  test("flip-readiness marks named_org pass; KPIs partner_agreed; licensing cleared", () => {
    const bundle = buildPartnerFlipReadinessBundle({
      generatedAt: "2026-11-01T20:00:00.000Z",
    });

    expect(bundle.partnerSigned).toBe(true);
    expect(bundle.lockedPilot).toBe(true);
    expect(bundle.isHypothetical).toBe(false);
    expect(bundle.summary.readyToFlipPartnerSigned).toBe(true);
    expect(bundle.summary.readyForRealPartnerReplacement).toBe(false);
    expect(bundle.summary.pass).toBeGreaterThanOrEqual(6);

    const byId = Object.fromEntries(
      bundle.flipRequirements.map((r) => [r.id, r]),
    );
    expect(byId.named_org.status).toBe("pass");
    expect(byId.question_confirm.status).toBe("pass");
    expect(byId.partner_signed_flip.status).toBe("pass");
    expect(byId.real_partner_replacement.status).toBe("pass");
    expect(byId.shortlist_row.status).toBe("pass");
    expect(byId.licensing.status).toBe("pass");
    expect(byId.thresholds.status).toBe("pass");
    expect(bundle.summary.blockingIds).not.toContain("licensing");

    expect(REAL_PARTNER_REPLACEMENT.partner.id).toBe("partner:apolo-pharma");
    expect(REAL_PARTNER_REPLACEMENT.partner.label).toBe("Apolo Pharma");
  });
});
