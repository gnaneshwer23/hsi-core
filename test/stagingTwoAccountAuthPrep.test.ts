import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  HSI_STAGING_BRANCH_ID,
  HSI_STAGING_HOST_PREFIX,
} from "../src/db/neonGuard";
import {
  assessWriteGateHonestySamples,
  buildStagingTwoAccountAuthPrep,
  parseStagingTwoAccountAuthPrep,
} from "../src/ops/stagingTwoAccountAuthPrep";

const root = resolve(import.meta.dir, "..");

describe("staging two-account Auth prep (audit Phase #5)", () => {
  test("builds eng-CLEARED prep with ops BLOCKED and empty account slots", () => {
    const prep = buildStagingTwoAccountAuthPrep({
      generatedAt: "2026-11-08T11:00:00.000Z",
    });
    expect(prep.engineeringScaffold).toBe("CLEARED");
    expect(prep.opsAcceptance).toBe("BLOCKED");
    expect(prep.liveAuthVerified).toBe(false);
    expect(prep.researchWritesLiveVerified).toBe(false);
    expect(prep.productionResearchAccessGranted).toBe(false);
    expect(prep.summary.accountSlotsFilled).toBe(0);
    expect(prep.accountRosterSlots.every((s) => s.neonAuthUserId === null)).toBe(true);
    expect(prep.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED")).toBe(
      true,
    );
    expect(prep.checks.filter((c) => c.plane === "ops").every((c) => c.status === "PENDING_OPS")).toBe(true);
    expect(prep.writeGate.stagingBranchId).toBe(HSI_STAGING_BRANCH_ID);
    expect(prep.writeGate.stagingHostPrefix).toBe(HSI_STAGING_HOST_PREFIX);
    expect(prep.honesty.authSignupPolishDeferredForFounderGmail).toBe(true);
    expect(parseStagingTwoAccountAuthPrep(prep).prepHash).toBe(prep.prepHash);
  });

  test("write-gate honesty samples: staging enable, production refuse, autumn-snow refuse", () => {
    const samples = assessWriteGateHonestySamples();
    expect(samples.stagingWritesEnabled).toBe(true);
    expect(samples.productionWritesEnabled).toBe(false);
    expect(samples.autumnSnowRefused).toBe(true);
    expect(samples.defaultWritesDisabled).toBe(true);
  });

  test("refuses invented neon_auth principals in account slots", () => {
    const prep = buildStagingTwoAccountAuthPrep({
      generatedAt: "2026-11-08T11:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep;
    bad.accountRosterSlots[0]!.neonAuthUserId = "user_invented" as unknown as null;
    expect(() => parseStagingTwoAccountAuthPrep(bad)).toThrow("invent neon_auth");
  });

  test("refuses claiming opsAcceptance CLEARED or live auth verified", () => {
    const prep = buildStagingTwoAccountAuthPrep({
      generatedAt: "2026-11-08T11:00:00.000Z",
    });
    const bad = structuredClone(prep) as typeof prep & {opsAcceptance: string};
    bad.opsAcceptance = "CLEARED";
    expect(() => parseStagingTwoAccountAuthPrep(bad)).toThrow();
  });

  test("on-disk prep packet matches rebuild", () => {
    const onDisk = parseStagingTwoAccountAuthPrep(
      JSON.parse(readFileSync(resolve(root, "operations/staging/two-account-auth-prep.v1.json"), "utf8")),
    );
    const rebuilt = buildStagingTwoAccountAuthPrep({generatedAt: onDisk.generatedAt});
    expect(onDisk.prepHash).toBe(rebuilt.prepHash);
  });
});
