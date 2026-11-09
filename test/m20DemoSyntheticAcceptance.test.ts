import {describe, expect, test} from "bun:test";
import {
  assertDemoAcceptanceHonest,
  M20_DEMO_ACCOUNTS,
  M20_DEMO_HONESTY_BANNER,
  runM20DemoSyntheticAcceptance,
} from "../src/m20DemoSyntheticAcceptance";
import {RESEARCH_WORKSPACE_TEST_FIXTURE} from "../src/researchWorkspaceTestFixture";

describe("M20 demo synthetic acceptance", () => {
  test("clears demo rehearsal while keeping science and live ops blocked", () => {
    const report = runM20DemoSyntheticAcceptance({
      now: "2026-11-09T15:30:00.000Z",
      tipCommitHint: "test-tip",
    });
    assertDemoAcceptanceHonest(report);
    expect(report.journey).toHaveLength(22);
    expect(report.journey.every((s) => s.status === "passed")).toBe(true);
    expect(report.demoAcceptance).toBe("CLEARED");
    expect(report.scientificAcceptance).toBe("BLOCKED");
    expect(report.liveOpsAcceptance).toBe("BLOCKED");
    expect(report.productionReadyClaimed).toBe(false);
    expect(report.writesEnabledClaimed).toBe(false);
    expect(report.launchDecision).toBe("LIMITED_GO_SYNTHETIC_DEMO_ONLY");
    expect(report.honestyBanner).toBe(M20_DEMO_HONESTY_BANNER);
    expect(report.programme.investigationId).toBe(RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId);
  });

  test("demo accounts never embed passwords or neon_auth claims", () => {
    expect(M20_DEMO_ACCOUNTS).toHaveLength(3);
    for (const account of M20_DEMO_ACCOUNTS) {
      expect(account.passwordInRepo).toBe(false);
      expect(account.neonAuthProvisioned).toBe(false);
      expect(account.dataClass).toBe("synthetic_demo");
      expect(account.email.endsWith("@hsi.test")).toBe(true);
    }
    const researcher = M20_DEMO_ACCOUNTS.find((a) => a.role === "researcher")!;
    const reviewer = M20_DEMO_ACCOUNTS.find((a) => a.role === "independent_reviewer")!;
    expect(researcher.syntheticPrincipalId).not.toBe(reviewer.syntheticPrincipalId);
  });

  test("Gate B scientific stays BLOCKED even when Gate A demo passes", () => {
    const report = runM20DemoSyntheticAcceptance();
    const gateA = report.gates.find((g) => g.id === "A_functional_demo");
    const gateB = report.gates.find((g) => g.id === "B_scientific_live");
    expect(gateA?.status).toBe("PASS");
    expect(gateB?.status).toBe("BLOCKED");
  });
});
