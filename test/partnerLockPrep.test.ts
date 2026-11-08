import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HYPOTHETICAL_PARTNER_FIXTURE,
  USE_HYPOTHETICAL_PARTNER_FIXTURE,
} from "../src/hypotheticalPartnerFixture";
import {getPartnerLock} from "../src/partnerLock";
import {
  buildPartnerLockPrep,
  parsePartnerLockPrep,
} from "../src/ops/partnerLockPrep";

const root = resolve(import.meta.dir, "..");

describe("partner-lock prep (audit Phase #8)", () => {
  test("builds eng-CLEARED prep with founder BLOCKED and empty MoU slots", () => {
    const prep = buildPartnerLockPrep({
      generatedAt: "2026-11-08T12:00:00.000Z",
    });
    expect(USE_HYPOTHETICAL_PARTNER_FIXTURE).toBe(true);
    expect(prep.engineeringScaffold).toBe("CLEARED");
    expect(prep.founderAcceptance).toBe("BLOCKED");
    expect(prep.lockedPilot).toBe(false);
    expect(prep.legalBinding).toBe(false);
    expect(prep.agreementKind).toBe("hypothetical_test_only");
    expect(prep.summary.mouSlotsFilled).toBe(0);
    expect(prep.mouSlots.every((s) => s.organisationName === null)).toBe(true);
    expect(prep.mouSlots.every((s) => s.legalBindingAttested === false)).toBe(true);
    expect(prep.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED")).toBe(
      true,
    );
    expect(
      prep.checks
        .filter((c) => c.plane === "founder")
        .every((c) => c.status === "PENDING_FOUNDER" || c.status === "NO_GO"),
    ).toBe(true);
    expect(prep.activeFixture.partnerId).toBe(HYPOTHETICAL_PARTNER_FIXTURE.partner.id);
    expect(parsePartnerLockPrep(prep).prepHash).toBe(prep.prepHash);
  });

  test("live partnerLock honesty matches prep (fixture not MoU)", () => {
    const lock = getPartnerLock();
    expect(lock.scopeLocked).toBe(true);
    expect(lock.partnerSigned).toBe(true);
    expect(lock.legalBinding).toBe(false);
    expect(lock.lockedPilot).toBe(false);
    expect(lock.agreementKind).toBe("hypothetical_test_only");
    expect(lock.isHypothetical).toBe(true);
    expect(lock.partner?.id).toBe("test:hypothetical-isi-pilot-partner");
  });

  test("refuses invented MoU org / document fields in slots", () => {
    const prep = buildPartnerLockPrep({
      generatedAt: "2026-11-08T12:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.mouSlots[0]!.organisationName = "Invented Org Ltd" as unknown as null;
    expect(() => parsePartnerLockPrep(bad)).toThrow("invent MoU");
  });

  test("refuses claiming founderAcceptance CLEARED or legalBinding true", () => {
    const prep = buildPartnerLockPrep({
      generatedAt: "2026-11-08T12:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep & {founderAcceptance: string};
    bad.founderAcceptance = "CLEARED";
    expect(() => parsePartnerLockPrep(bad)).toThrow();
  });

  test("refuses legalBindingAttested on empty slots", () => {
    const prep = buildPartnerLockPrep({
      generatedAt: "2026-11-08T12:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.mouSlots[5]!.legalBindingAttested = true as unknown as false;
    expect(() => parsePartnerLockPrep(bad)).toThrow("invent MoU");
  });

  test("on-disk prep packet matches rebuild", () => {
    const onDisk = parsePartnerLockPrep(
      JSON.parse(readFileSync(resolve(root, "operations/partner/partner-lock-prep.v1.json"), "utf8")),
    );
    const rebuilt = buildPartnerLockPrep({generatedAt: onDisk.generatedAt});
    expect(onDisk.prepHash).toBe(rebuilt.prepHash);
  });
});
