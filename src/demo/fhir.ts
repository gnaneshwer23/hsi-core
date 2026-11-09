/**
 * FHIR R4 projection at the boundary of the synthetic cohort.
 * The bundle uses the project pseudonym. It is not a hospital record.
 */
import type { SyntheticPatient } from "./cohort";

export type FhirBundle = {
  resourceType: "Bundle";
  type: "collection";
  timestamp: string;
  entry: { resource: Record<string, unknown> }[];
};

export function toFhirBundle(patient: SyntheticPatient): FhirBundle {
  const patientResource = {
    resourceType: "Patient",
    id: patient.pseudonym,
    meta: { tag: [{ system: "https://hsi.example/synthetic", code: "synthetic-demonstration" }] },
    identifier: [{ system: "https://hsi.example/pseudonym", value: patient.pseudonym }],
    gender: patient.sex,
    extension: [
      {
        url: "https://hsi.example/consent-scopes",
        valueString: patient.consentScopes.join(" "),
      },
    ],
  };
  const conditions = [
    ...(patient.condition.diabetes === "t1d"
      ? [{ code: "46635009", display: "Type 1 diabetes mellitus" }]
      : []),
    ...(patient.condition.diabetes === "t2d"
      ? [{ code: "44054006", display: "Type 2 diabetes mellitus" }]
      : []),
    ...(patient.condition.rheumatoidArthritis
      ? [{ code: "69896004", display: "Rheumatoid arthritis" }]
      : []),
  ].map((item, index) => ({
    resource: {
      resourceType: "Condition",
      id: `${patient.pseudonym}-condition-${index + 1}`,
      subject: { reference: `Patient/${patient.pseudonym}` },
      code: { coding: [{ system: "http://snomed.info/sct", ...item }] },
      verificationStatus: { coding: [{ code: "unconfirmed" }] },
    },
  }));
  const observations = patient.labs.map((lab, index) => ({
    resource: {
      resourceType: "Observation",
      id: `${patient.pseudonym}-obs-${index + 1}`,
      status: lab.missing ? "cancelled" : "final",
      subject: { reference: `Patient/${patient.pseudonym}` },
      effectiveDateTime: lab.at,
      code: { coding: [{ system: "http://loinc.org", code: lab.loinc, display: lab.display }] },
      ...(lab.missing
        ? { dataAbsentReason: { coding: [{ code: "unknown" }] } }
        : { valueQuantity: { value: lab.value, unit: lab.unit, system: "http://unitsofmeasure.org", code: lab.ucum } }),
    },
  }));
  const medications = patient.medications.map((med, index) => ({
    resource: {
      resourceType: "MedicationStatement",
      id: `${patient.pseudonym}-med-${index + 1}`,
      status: med.status,
      subject: { reference: `Patient/${patient.pseudonym}` },
      medicationCodeableConcept: { text: med.name },
    },
  }));
  const encounters = patient.encounters.map((encounter, index) => ({
    resource: {
      resourceType: "Encounter",
      id: `${patient.pseudonym}-enc-${index + 1}`,
      status: "finished",
      class: { code: encounter.kind },
      subject: { reference: `Patient/${patient.pseudonym}` },
      period: { start: encounter.at },
    },
  }));
  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: "2024-10-15T00:00:00Z",
    entry: [{ resource: patientResource }, ...conditions, ...observations, ...medications, ...encounters],
  };
}
