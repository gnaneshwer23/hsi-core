import { describe, expect, it } from "bun:test";
import {
  assessTrialCriteria,
  containsForbiddenEligibilityLanguage,
  CRITERION_STATE_LEGEND,
  CRITERION_STATES,
  getDemoPatientFixture,
  getDemoTrialStub,
  listDemoTrialStubs,
} from "../src/trialsCriteriaMvp";

describe("HSI Trials criteria MVP", () => {
  it("exposes exactly five criterion states with legend copy", () => {
    expect(CRITERION_STATES).toEqual([
      "satisfied",
      "not_satisfied",
      "unknown",
      "ambiguous",
      "requires_investigator_review",
    ]);
    expect(CRITERION_STATE_LEGEND).toHaveLength(5);
    expect(CRITERION_STATE_LEGEND.map((e) => e.state)).toEqual([...CRITERION_STATES]);
    // May discuss the ban; must not affirm enrolment suitability.
    expect(
      CRITERION_STATE_LEGEND.every(
        (e) => !/\bis confirmed eligible\b|\bpatient is eligible\b|\bfully eligible\b/i.test(e.meaning),
      ),
    ).toBe(true);
  });

  it("lists ≥2 synthetic trial stubs for the multi-trial picker", () => {
    const stubs = listDemoTrialStubs();
    expect(stubs.length).toBeGreaterThanOrEqual(2);
    expect(getDemoTrialStub("DEMO-NCT-SYNTH")).not.toBeNull();
    expect(getDemoTrialStub("DEMO-NCT-RA-TNF")).not.toBeNull();
    for (const t of stubs) {
      expect(t.criteria.length).toBeGreaterThanOrEqual(3);
      expect(t.registryNote.toLowerCase()).toContain("not a live");
    }
  });

  it("never confirms eligibility and uses unknown for omitted labs", () => {
    const patient = getDemoPatientFixture("syn-trial-patient-partial")!;
    const report = assessTrialCriteria({
      trialId: "DEMO-NCT-SYNTH",
      patient,
      now: new Date("2026-11-02T12:00:00.000Z"),
    });
    expect(report.confirmedEligible).toBe(false);
    expect(report.patientEligible).toBe(false);
    expect(report.overallLabel).toBe("criterion_assessment_only");
    expect(report.assessments).toHaveLength(5);
    expect(report.assessments.some((a) => a.state === "unknown")).toBe(true);
    expect(report.assessments.some((a) => a.state === "requires_investigator_review")).toBe(true);
    expect(report.assessments.some((a) => a.state === "satisfied")).toBe(true);
    expect(report.missingAttributes).toContain("ldh_u_l");
    for (const a of report.assessments) {
      expect(a.confirmedEligible).toBe(false);
      expect(a.majorityVote).toBe(false);
      expect(a.provenanceSource).toBe("fixture://trials-attrs");
    }
    expect(containsForbiddenEligibilityLanguage(JSON.stringify(report))).toBe(false);
  });

  it("assesses the RA stub with five states and confirmedEligible always false", () => {
    const patient = getDemoPatientFixture("syn-trial-patient-partial")!;
    const stub = getDemoTrialStub("DEMO-NCT-RA-TNF")!;
    const report = assessTrialCriteria({
      trialId: stub.trialId,
      criteria: stub.criteria,
      patient,
      now: new Date("2026-11-02T12:00:00.000Z"),
    });
    expect(report.trialId).toBe("DEMO-NCT-RA-TNF");
    expect(report.confirmedEligible).toBe(false);
    expect(report.patientEligible).toBe(false);
    expect(report.overallLabel).toBe("criterion_assessment_only");
    expect(report.assessments).toHaveLength(5);
    expect(report.assessments.some((a) => a.state === "unknown")).toBe(true);
    expect(report.assessments.some((a) => a.state === "requires_investigator_review")).toBe(true);
    expect(report.missingAttributes).toContain("das28");
    for (const a of report.assessments) {
      expect(a.confirmedEligible).toBe(false);
    }
  });

  it("marks age failure as not_satisfied without confirming eligibility", () => {
    const patient = getDemoPatientFixture("syn-trial-patient-fail-age")!;
    const report = assessTrialCriteria({ trialId: "DEMO-NCT-SYNTH", patient });
    const age = report.assessments.find((a) => a.criterionId === "c-age-18");
    expect(age?.state).toBe("not_satisfied");
    expect(report.confirmedEligible).toBe(false);
  });

  it("detects forbidden eligibility phrases", () => {
    expect(containsForbiddenEligibilityLanguage("Patient is confirmed eligible")).toBe(true);
    expect(containsForbiddenEligibilityLanguage("criterion assessment only")).toBe(false);
  });
});
