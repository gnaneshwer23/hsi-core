/**
 * Deterministic synthetic cohort for the local demonstration.
 * Every person is a project pseudonym. There are no real patients in this file.
 * Type 1 diabetes and type 2 diabetes stay distinct. Rheumatoid arthritis is the
 * immune-mediated thread and is not collapsed into either diabetes type.
 */

export const COHORT_SEED = 20261109;
export const COHORT_SIZE = 240;

export type DiabetesKind = "t1d" | "t2d" | "none";
export type CohortCondition = {
  diabetes: DiabetesKind;
  rheumatoidArthritis: boolean;
};

export type LabPoint = {
  at: string;
  loinc: string;
  display: string;
  value: number | null;
  unit: string;
  ucum: string;
  missing: boolean;
};

export type SyntheticPatient = {
  pseudonym: string;
  synthetic: true;
  consentScopes: readonly string[];
  permissionEpoch: number;
  condition: CohortCondition;
  sex: "female" | "male";
  ageYears: number;
  labs: LabPoint[];
  medications: readonly { name: string; status: "active" | "stopped" }[];
  diet: { pattern: string; selfReport: true; verified: false };
  microbiome: { faecalibacterium: number; prevotella: number; missing: boolean };
  wearables: { meanSteps: number; meanSleepHours: number; missing: boolean };
  encounters: readonly { at: string; kind: "outpatient" | "research_visit" }[];
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, values: readonly T[]): T {
  const index = Math.min(values.length - 1, Math.floor(rand() * values.length));
  return values[index] as T;
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function conditionFor(index: number): CohortCondition {
  const bucket = index % 10;
  if (bucket < 2) return { diabetes: "t1d", rheumatoidArthritis: false };
  if (bucket < 5) return { diabetes: "t2d", rheumatoidArthritis: false };
  if (bucket < 7) return { diabetes: "none", rheumatoidArthritis: true };
  if (bucket < 8) return { diabetes: "t2d", rheumatoidArthritis: true };
  return { diabetes: "none", rheumatoidArthritis: false };
}

export function generateSyntheticCohort(size = COHORT_SIZE, seed = COHORT_SEED): SyntheticPatient[] {
  const rand = mulberry32(seed);
  const patients: SyntheticPatient[] = [];
  for (let index = 0; index < size; index += 1) {
    const condition = conditionFor(index);
    const ageYears = 28 + Math.floor(rand() * 48);
    const female = rand() < 0.58;
    const hba1cBase = condition.diabetes === "t1d" ? 68 : condition.diabetes === "t2d" ? 58 : 36;
    const crpBase = condition.rheumatoidArthritis ? 18 : 3;
    const missingMicrobiome = rand() < 0.12;
    const missingWearable = rand() < 0.08;
    const missingCrp = index % 17 === 0;
    const labs: LabPoint[] = [];
    const encounters: { at: string; kind: "outpatient" | "research_visit" }[] = [];
    for (let visit = 0; visit < 4; visit += 1) {
      const at = `2024-${String(1 + visit * 3).padStart(2, "0")}-15`;
      encounters.push({ at, kind: visit % 2 === 0 ? "outpatient" : "research_visit" });
      const drift = (rand() - 0.4) * (visit + 1);
      labs.push({
        at,
        loinc: "4548-4",
        display: "HbA1c",
        value: round(hba1cBase + drift, 1),
        unit: "mmol/mol",
        ucum: "mmol/mol",
        missing: false,
      });
      labs.push({
        at,
        loinc: "1988-5",
        display: "C reactive protein",
        value: missingCrp ? null : round(Math.max(0.4, crpBase + drift), 1),
        unit: "mg/L",
        ucum: "mg/L",
        missing: missingCrp,
      });
      labs.push({
        at,
        loinc: "1558-6",
        display: "Fasting glucose",
        value: round((condition.diabetes === "none" ? 5.1 : 8.4) + drift / 10, 1),
        unit: "mmol/L",
        ucum: "mmol/L",
        missing: false,
      });
    }
    const medications = [
      ...(condition.diabetes === "t2d" ? [{ name: "metformin", status: "active" as const }] : []),
      ...(condition.diabetes === "t1d" ? [{ name: "insulin glargine", status: "active" as const }] : []),
      ...(condition.rheumatoidArthritis ? [{ name: "methotrexate", status: "active" as const }] : []),
      ...(condition.rheumatoidArthritis && rand() < 0.35 ? [{ name: "adalimumab", status: "stopped" as const }] : []),
    ];
    patients.push({
      pseudonym: `HSI-DEMO-${String(index + 1).padStart(4, "0")}`,
      synthetic: true,
      consentScopes: condition.rheumatoidArthritis
        ? ["research_profile", "trial_prescreen"]
        : ["research_profile"],
      permissionEpoch: 1,
      condition,
      sex: female ? "female" : "male",
      ageYears,
      labs,
      medications,
      diet: {
        pattern: pick(rand, ["high-fibre", "western", "mixed", "vegetarian"]),
        selfReport: true,
        verified: false,
      },
      microbiome: {
        faecalibacterium: missingMicrobiome ? 0 : round(rand() * 0.2, 3),
        prevotella: missingMicrobiome ? 0 : round(rand() * 0.15, 3),
        missing: missingMicrobiome,
      },
      wearables: {
        meanSteps: missingWearable ? 0 : 3000 + Math.floor(rand() * 9000),
        meanSleepHours: missingWearable ? 0 : round(5.5 + rand() * 3, 1),
        missing: missingWearable,
      },
      encounters,
    });
  }
  return patients;
}

export function latestLab(patient: SyntheticPatient, loinc: string): LabPoint | undefined {
  const points = patient.labs.filter((lab) => lab.loinc === loinc);
  return points[points.length - 1];
}
