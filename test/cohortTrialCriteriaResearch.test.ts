import {describe, expect, it} from "bun:test";
import {
  N5_ENGINEERING_CTGOV_FIXTURE,
  N5_SYNTHETIC_COHORT_FACTS,
  assessCohortTrialCriteria,
  buildN5RegistrySnapshot,
  classifyDiseaseAlias,
  parseCohortTrialCriteriaReport,
  parseEligibilityCriteriaText,
  runN5Suite,
} from "../src/evidence/cohortTrialCriteriaResearch";
import {CRITERION_STATES} from "../src/trialsCriteriaMvp";

const retrievedAt = "2026-11-07T20:00:00.000Z";
const asOf = "2026-11-07T22:45:00.000Z";
const generatedAt = "2026-11-07T22:45:00.000Z";

describe("N5 cohort / trial criteria research", () => {
  it("keeps T1D and T2D aliases narrow and leaves generic diabetes unresolved", () => {
    expect(classifyDiseaseAlias("Type 1 diabetes")).toBe("type_1_diabetes");
    expect(classifyDiseaseAlias("Diabetes Mellitus, Type 2")).toBe("type_2_diabetes");
    expect(classifyDiseaseAlias("Diabetes")).toBe("unresolved");
    expect(classifyDiseaseAlias("Diabetes mellitus")).toBe("unresolved");
  });

  it("parses structured age/condition rules with exact source spans", () => {
    const text = ["Age 8-45 years", "Diagnosis of Type 1 diabetes", "Investigator judgment required"].join(
      "\n",
    );
    const rules = parseEligibilityCriteriaText(text, "NCT99990061");
    expect(rules.some((r) => r.parseKind === "structured_age_bound" && r.operator === "gte")).toBe(true);
    expect(rules.some((r) => r.parseKind === "structured_age_bound" && r.operator === "lte")).toBe(true);
    expect(rules.some((r) => r.parseKind === "structured_condition_alias")).toBe(true);
    expect(rules.some((r) => r.parseKind === "unstructured_requires_review")).toBe(true);
    for (const r of rules) {
      if (r.sourceSpan.excerpt) {
        expect(text.slice(r.sourceSpan.start, r.sourceSpan.end)).toBe(r.sourceSpan.excerpt);
      }
    }
  });

  it("assesses synthetic cohort without confirming eligibility", () => {
    const snapshot = buildN5RegistrySnapshot({
      retrievedAt,
      asOf,
      clinicalTrialsGovJson: N5_ENGINEERING_CTGOV_FIXTURE,
    });
    const report = assessCohortTrialCriteria({
      snapshot,
      nctId: "NCT99990061",
      facts: [...N5_SYNTHETIC_COHORT_FACTS],
      generatedAt,
    });
    parseCohortTrialCriteriaReport(report);
    expect(report.confirmedEligible).toBe(false);
    expect(report.patientEligible).toBe(false);
    expect(report.patientEligibilityAssessed).toBe(false);
    expect(report.enrolmentEnabled).toBe(false);
    expect(report.liveRegistryQueried).toBe(false);
    expect(report.scientificAcceptance).toBe("BLOCKED");
    expect(report.engineeringHarness).toBe("CLEARED");
    expect(report.overallLabel).toBe("criterion_assessment_only");
    expect(report.satisfiedCount).toBeGreaterThan(0);
    expect(report.requiresInvestigatorReviewCount + report.unknownCount + report.ambiguousCount).toBeGreaterThan(
      0,
    );
    for (const i of report.inspections) {
      expect(CRITERION_STATES).toContain(i.state);
      expect(i.confirmedEligible).toBe(false);
    }
    // Age match on T1D profile must not collapse the whole assessment to eligibility.
    const ageHits = report.inspections.filter(
      (i) => i.caseId === "SYN-P-000101" && i.parseKind === "structured_age_bound" && i.state === "satisfied",
    );
    expect(ageHits.length).toBeGreaterThan(0);
    expect(report.confirmedEligible).toBe(false);
  });

  it("does not treat T2D profile as satisfying T1D condition alias", () => {
    const snapshot = buildN5RegistrySnapshot({
      retrievedAt,
      asOf,
      clinicalTrialsGovJson: N5_ENGINEERING_CTGOV_FIXTURE,
    });
    const report = assessCohortTrialCriteria({
      snapshot,
      nctId: "NCT99990061",
      facts: [N5_SYNTHETIC_COHORT_FACTS[1]!],
      generatedAt,
    });
    const condition = report.inspections.find((i) => i.parseKind === "structured_condition_alias");
    expect(condition?.state).toBe("not_satisfied");
    expect(report.confirmedEligible).toBe(false);
  });

  it("marks generic diabetes condition as ambiguous against T1D rule", () => {
    const snapshot = buildN5RegistrySnapshot({
      retrievedAt,
      asOf,
      clinicalTrialsGovJson: N5_ENGINEERING_CTGOV_FIXTURE,
    });
    const report = assessCohortTrialCriteria({
      snapshot,
      nctId: "NCT99990061",
      facts: [N5_SYNTHETIC_COHORT_FACTS[2]!],
      generatedAt,
    });
    const condition = report.inspections.find((i) => i.parseKind === "structured_condition_alias");
    expect(condition?.state).toBe("ambiguous");
  });

  it("runs the offline suite with honesty gates forced", () => {
    const snapshot = buildN5RegistrySnapshot({
      retrievedAt,
      asOf,
      clinicalTrialsGovJson: N5_ENGINEERING_CTGOV_FIXTURE,
    });
    const receipt = runN5Suite({
      snapshot,
      facts: [...N5_SYNTHETIC_COHORT_FACTS],
      generatedAt,
    });
    expect(receipt.reports).toHaveLength(2);
    expect(receipt.engineeringHarness).toBe("CLEARED");
    expect(receipt.scientificAcceptance).toBe("BLOCKED");
    expect(receipt.confirmedEligible).toBe(false);
    expect(receipt.patientEligibilityAssessed).toBe(false);
    expect(receipt.liveRegistryQueried).toBe(false);
  });

  it("rejects forbidden enrolment language in eligibility text", () => {
    expect(() =>
      parseEligibilityCriteriaText("Patient is confirmed eligible for enrolment", "NCT00000000"),
    ).toThrow(/forbidden/i);
  });
});
