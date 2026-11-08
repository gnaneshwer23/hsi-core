import {describe, expect, test} from "bun:test";
import {
  buildResearchWorkspaceTestInvestigation,
  RESEARCH_WORKSPACE_TEST_FIXTURE,
  fixtureManifestHash,
} from "../src/researchWorkspaceTestFixture";

describe("research workspace synthetic test fixture", () => {
  test("builds a valid draft with honesty markers and no science claims", () => {
    const {investigation, contentHash, manifestHash} = buildResearchWorkspaceTestInvestigation();
    expect(investigation.id).toBe(RESEARCH_WORKSPACE_TEST_FIXTURE.investigationId);
    expect(investigation.state).toBe("draft");
    expect(investigation.review).toBeNull();
    expect(investigation.question).toContain("TEST/SYNTHETIC FIXTURE");
    expect(investigation.conclusion.assessment).toBe("insufficient_evidence");
    expect(investigation.conclusion.limitations[0]).toContain("SYNTHETIC/TEST FIXTURE ONLY");
    expect(investigation.branches.every((b) => b.supporting.length === 0 && b.opposing.length === 0)).toBe(true);
    expect(manifestHash).toBe(fixtureManifestHash());
    expect(contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(investigation.release.manifestHash).toBe(manifestHash);
  });
});
