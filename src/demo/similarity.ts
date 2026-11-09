/** Similar-patient mapping. Similarity never satisfies an eligibility criterion. */
import { latestLab, type SyntheticPatient } from "./cohort";

export type SimilarityHit = {
  pseudonym: string;
  distance: number;
  note: "similarity_is_not_eligibility";
};

function features(patient: SyntheticPatient): number[] {
  const hba1c = latestLab(patient, "4548-4");
  const crp = latestLab(patient, "1988-5");
  return [
    patient.ageYears / 100,
    (hba1c?.value ?? 0) / 100,
    (crp?.missing ? 0 : crp?.value ?? 0) / 50,
    patient.microbiome.faecalibacterium,
    patient.wearables.missing ? 0 : patient.wearables.meanSteps / 15000,
  ];
}

export function similarPatients(index: SyntheticPatient, cohort: readonly SyntheticPatient[], limit = 5): SimilarityHit[] {
  const base = features(index);
  return cohort
    .filter((patient) => patient.pseudonym !== index.pseudonym)
    .map((patient) => {
      const other = features(patient);
      const distance = Math.sqrt(base.reduce((sum, value, i) => sum + (value - (other[i] ?? 0)) ** 2, 0));
      return { pseudonym: patient.pseudonym, distance: Math.round(distance * 1000) / 1000, note: "similarity_is_not_eligibility" as const };
    })
    .sort((a, b) => a.distance - b.distance || a.pseudonym.localeCompare(b.pseudonym))
    .slice(0, limit);
}

export function similaritySatisfiesEligibility(reason: "similarity_only" | "documented_criterion"): false | "not_applicable" {
  if (reason === "similarity_only") return false;
  return "not_applicable";
}
