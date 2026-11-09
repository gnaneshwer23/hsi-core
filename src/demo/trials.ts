/**
 * Governed pre-screening. Unknown stays unknown.
 * A patient answer is an unverified self-report and never confirms eligibility.
 */
import { latestLab, type SyntheticPatient } from "./cohort";

export type CriterionResult = {
  id: string;
  label: string;
  state: "met" | "not_met" | "unknown";
  basis: string;
};

export type PrescreenReport = {
  pseudonym: string;
  criteria: CriterionResult[];
  confirmedEligible: false;
  selfReportVerified: false;
  unknownRemainsUnknown: boolean;
};

export function prescreen(patient: SyntheticPatient): PrescreenReport {
  const crp = latestLab(patient, "1988-5");
  const hba1c = latestLab(patient, "4548-4");
  const criteria: CriterionResult[] = [
    {
      id: "age",
      label: "Age 18 to 80 years",
      state: patient.ageYears >= 18 && patient.ageYears <= 80 ? "met" : "not_met",
      basis: "project pseudonym attribute",
    },
    {
      id: "ra",
      label: "Rheumatoid arthritis recorded",
      state: patient.condition.rheumatoidArthritis ? "met" : "not_met",
      basis: "condition flag on the synthetic record",
    },
    {
      id: "crp",
      label: "CRP at or above 5 mg/L",
      state: !crp || crp.missing || crp.value === null ? "unknown" : crp.value >= 5 ? "met" : "not_met",
      basis: crp?.missing ? "value absent; unknown stays unknown" : "latest LOINC 1988-5",
    },
    {
      id: "hba1c",
      label: "HbA1c recorded",
      state: hba1c && !hba1c.missing && hba1c.value !== null ? "met" : "unknown",
      basis: "latest LOINC 4548-4",
    },
    {
      id: "diet",
      label: "Diet pattern",
      state: "unknown",
      basis: "patient answer is an unverified self-report and does not meet the criterion",
    },
  ];
  return {
    pseudonym: patient.pseudonym,
    criteria,
    confirmedEligible: false,
    selfReportVerified: false,
    unknownRemainsUnknown: criteria.some((item) => item.state === "unknown"),
  };
}
