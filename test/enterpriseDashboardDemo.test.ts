import { describe, expect, test } from "bun:test";
import { biotechDashboardDemo } from "../src/enterprise/biotechDashboardDemo";
import { clinicalResearchDashboardDemo } from "../src/enterprise/clinicalResearchDashboardDemo";
import { communityDashboardDemo } from "../src/enterprise/communityDashboardDemo";
import { labOmicsDashboardDemo } from "../src/enterprise/labOmicsDashboardDemo";
import { participantDashboardDemo } from "../src/enterprise/participantDashboardDemo";
import { fundingCareersDashboardDemo } from "../src/enterprise/fundingCareersDashboardDemo";
import { firstPilotDashboardDemo } from "../src/enterprise/firstPilotDashboardDemo";
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

  test("clinical research demo stays synthetic, not CDS, association ≠ causation", () => {
    const demo = clinicalResearchDashboardDemo();
    const honesty = assertEnterpriseDemoHonesty(demo.honesty);
    expect(honesty.liveEvidence).toBe(false);
    expect(honesty.phiEnabled).toBe(false);
    expect(demo.summary.cdsEnabled).toBe(false);
    expect(demo.summary.phiEnabled).toBe(false);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.cohorts.every((c) => c.enabled === false)).toBe(true);
    expect(demo.cohorts.every((c) => c.dataClass === "synthetic_demonstration")).toBe(
      true,
    );
    expect(
      demo.trials.every((t) => t.eligibilityHonesty === "research_planning_not_bedside_cds"),
    ).toBe(true);
    expect(demo.associations.every((a) => a.associationNotCausation === true)).toBe(true);
    expect(demo.opsCharts.every((c) => c.dataClass === "synthetic_demonstration")).toBe(
      true,
    );
    expect(demo.boundaryNote.toLowerCase()).toContain("not a clinical decision");
    expect(demo.boundaryNote.toLowerCase()).toContain("phi");
  });

  test("lab omics demo keeps missing fields explicit and forbids fake QC", () => {
    const demo = labOmicsDashboardDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.summary.fakeQcScores).toBe(false);
    expect(demo.assays.some((a) => a.fields.some((f) => f.missingExplicit))).toBe(true);
    expect(demo.comparisons.every((c) => c.verificationBound === true)).toBe(true);
    expect(
      demo.omicsCandidates.every((o) => o.reviewStatus === "candidate_unreviewed"),
    ).toBe(true);
    expect(demo.reproducibility.every((r) => r.fakeQcScore === false)).toBe(true);
    expect(
      demo.evidenceIntegration.every(
        (e) => e.integrationQualityPercent === null && e.inventedFeatureCount === false,
      ),
    ).toBe(true);
    expect(demo.governanceNote.toLowerCase()).toContain("qc");
  });

  test("community demo keeps Circles held, no IP bleed, Gate C human-only", () => {
    const demo = communityDashboardDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.summary.circlesDurableStore).toBe("held");
    expect(demo.summary.autoIpBleed).toBe(false);
    expect(demo.circles.every((c) => c.durableStore === "held")).toBe(true);
    expect(demo.circles.every((c) => c.autoIpBleed === false)).toBe(true);
    expect(demo.evidenceReviews.every((r) => r.gateC === "human_only")).toBe(true);
    expect(demo.discussions.every((d) => d.vanityFeed === false)).toBe(true);
    expect(demo.discussions.every((d) => d.status === "proposed_not_enabled")).toBe(true);
    expect(demo.challenges.every((c) => c.sharedDefault === "not_public")).toBe(true);
    expect(demo.researchers.every((r) => r.grantScoped === true)).toBe(true);
    expect(demo.governanceNote.toLowerCase()).toContain("circles");
  });

  test("participant demo stays non-scientific, not CDS, no PHI, no invented enrollment", () => {
    const demo = participantDashboardDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.summary.phiEnabled).toBe(false);
    expect(demo.summary.cdsEnabled).toBe(false);
    expect(demo.summary.scientificDashboard).toBe(false);
    expect(demo.summary.realParticipantPath).toBe("blocked_adr0010");
    expect(demo.consentSlots.every((c) => c.phiCollected === false)).toBe(true);
    expect(demo.consentSlots.every((c) => c.status === "disabled_until_governance")).toBe(
      true,
    );
    expect(demo.contributionChannels.every((c) => c.enabled === false)).toBe(true);
    expect(demo.contributionChannels.every((c) => c.cdsEnabled === false)).toBe(true);
    expect(demo.contributionChannels.every((c) => c.scientificDashboard === false)).toBe(
      true,
    );
    expect(
      demo.updateSketches.every((u) => u.inventedEnrollmentPercent === false),
    ).toBe(true);
    expect(demo.governanceNote.toLowerCase()).toContain("phi");
    expect(demo.governanceNote.toLowerCase()).toContain("not a scientific dashboard");
  });

  test("funding careers demo forbids invented award rates and keeps store held", () => {
    const demo = fundingCareersDashboardDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.summary.durableFundingStore).toBe("held");
    expect(demo.summary.inventedAwardRate).toBe(false);
    expect(demo.summary.inventedConversionPercent).toBe(false);
    expect(demo.fundingSketches.every((f) => f.status === "illustrative_only")).toBe(
      true,
    );
    expect(demo.fundingSketches.every((f) => f.inventedAwardRate === false)).toBe(true);
    expect(
      demo.fundingSketches.every((f) => f.inventedConversionPercent === false),
    ).toBe(true);
    expect(demo.careerPathways.every((c) => c.durableStore === "held")).toBe(true);
    expect(demo.collaborators.every((c) => c.permissionAware === true)).toBe(true);
    expect(demo.collaborators.every((c) => c.autoIpBleed === false)).toBe(true);
    expect(
      demo.opportunities.every((o) => o.reviewStatus === "candidate_unreviewed"),
    ).toBe(true);
    expect(demo.governanceNote.toLowerCase()).toContain("award");
  });

  test("first pilot demo never claims ready or invents conversion/users", () => {
    const demo = firstPilotDashboardDemo();
    assertEnterpriseDemoHonesty(demo.honesty);
    expect(demo.summary.labelsAreDemonstration).toBe(true);
    expect(demo.summary.pilotReadyClaimed).toBe(false);
    expect(demo.summary.inventsPilotConversion).toBe(false);
    expect(demo.summary.inventsUsersOrTestimonials).toBe(false);
    expect(demo.summary.stage2JourneyIsBuildCentre).toBe(true);
    expect(demo.summary.proposedResearcherCount).toBe("3-5");
    expect(
      demo.prerequisites.every((p) => p.status === "owner_gated_blocked"),
    ).toBe(true);
    expect(demo.prerequisites.every((p) => p.inventsReady === false)).toBe(true);
    expect(demo.successSignals.every((s) => s.inventsConversion === false)).toBe(
      true,
    );
    expect(demo.outOfScope.some((o) => o.id === "oos-org")).toBe(true);
    expect(demo.outOfScope.some((o) => o.id === "oos-checkout")).toBe(true);
    expect(demo.governanceNote.toLowerCase()).toContain("pilot ready");
    expect(demo.governanceNote.toLowerCase()).toContain("stage 2");
  });
});
