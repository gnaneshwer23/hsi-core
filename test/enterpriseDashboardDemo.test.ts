import { describe, expect, test } from "bun:test";
import { biotechDashboardDemo } from "../src/enterprise/biotechDashboardDemo";
import {
  assertEnterpriseDemoHonesty,
  enterpriseProfessorDemo,
  enterpriseStudentDemo,
} from "../src/enterprise/enterpriseDashboardDemo";

describe("enterprise dashboard demonstration fixtures", () => {
  test("professor demo keeps fail-closed honesty and labelled counts", () => {
    const demo = enterpriseProfessorDemo();
    const honesty = assertEnterpriseDemoHonesty(demo.honesty);
    expect(honesty.liveEvidence).toBe(false);
    expect(honesty.phiEnabled).toBe(false);
    expect(honesty.privateNotesAccessibleToProfessor).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.diseaseAgnosticPlatform).toBe(true);
    expect(honesty.demonstrationScenarioOnly).toBe(true);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.members).toHaveLength(7);
    expect(demo.treeNodes.length).toBeGreaterThanOrEqual(10);
    expect(demo.cohortPanel.enabled).toBe(false);
    for (const opp of demo.opportunities) {
      expect(opp.reviewStatus).toBe("candidate_unreviewed");
      expect(opp.supportingEvidence.toLowerCase()).not.toContain("doi.org");
    }
  });

  test("student demo separates feed kinds and blocks durable claims", () => {
    const demo = enterpriseStudentDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.feedItems.some((i) => i.kind === "hypothesis_demo")).toBe(true);
    expect(demo.feedItems.some((i) => i.kind === "publication_demo")).toBe(true);
    expect(demo.alerts.every((a) => a.kind === "demonstration")).toBe(true);
    expect(demo.honesty.scientificApproval).toBe(false);
  });

  test("biotech demo keeps fail-closed honesty and illustrative competitors", () => {
    const demo = biotechDashboardDemo();
    const honesty = assertEnterpriseDemoHonesty(demo.honesty);
    expect(honesty.liveEvidence).toBe(false);
    expect(honesty.phiEnabled).toBe(false);
    expect(honesty.productionWritesEnabled).toBe(false);
    expect(honesty.scientificApproval).toBe(false);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.targets.length).toBeGreaterThanOrEqual(3);
    expect(demo.competitors.every((c) => c.statusLabel === "illustrative_only")).toBe(
      true,
    );
    expect(demo.biomarkers.every((b) => b.verificationState === "unreviewed_candidate")).toBe(
      true,
    );
    expect(demo.portfolio.every((p) => p.decisionState === "human_review_required")).toBe(
      true,
    );
    for (const gap of demo.translationalGaps) {
      expect(gap.reviewStatus).toBe("candidate_unreviewed");
      expect(gap.supportingEvidence.toLowerCase()).not.toContain("doi.org");
    }
    expect(demo.governanceNote.toLowerCase()).toContain("confidential");
  });
});
