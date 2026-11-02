/**
 * Illustrative FHIR R4 mapping notes for Cap 9 synthetic timeline fixtures.
 * Notes only — not a FHIR SoT, not UK Core certified, not live EMIS.
 * syntheticOnly remains binding.
 */
import {
  CLINICAL_PROVIDERS,
  getSyntheticTimelineFixture,
  type ClinicalProvider,
  type TimelineEvent,
} from "./clinicalSyntheticTimeline";

export const CLINICAL_SYNTHETIC_FHIR_NOTES_SCHEMA =
  "hsi-clinical-synthetic-fhir-notes-1" as const;

export type FhirResourceHint = {
  resourceType: string;
  note: string;
};

/** Event kind → illustrative FHIR R4 resource (not a live mapping engine). */
export const EVENT_KIND_TO_FHIR: Record<TimelineEvent["kind"], FhirResourceHint> = {
  encounter: {
    resourceType: "Encounter",
    note: "Illustrative Encounter placeholder — class/type not UK Core–validated.",
  },
  lab: {
    resourceType: "Observation",
    note: "Illustrative Observation (laboratory) — LOINC codes are stubs, not ingested results.",
  },
  medication: {
    resourceType: "MedicationStatement",
    note: "Illustrative MedicationStatement — not a dispense/order feed.",
  },
  problem: {
    resourceType: "Condition",
    note: "Illustrative Condition — SNOMED stubs only; not problem-list SoT.",
  },
  vital: {
    resourceType: "Observation",
    note: "Illustrative vital Observation — spot values are synthetic.",
  },
};

/** Provider → illustrative FHIR system / provenance label. */
export const PROVIDER_TO_FHIR_SYSTEM: Record<
  ClinicalProvider,
  { illustrativeSystem: string; note: string }
> = {
  synthetic_gp: {
    illustrativeSystem: "urn:hsi:fixture:gp",
    note: "Synthetic GP slice — not EMIS / Vision / TPP live connector.",
  },
  synthetic_hospital: {
    illustrativeSystem: "urn:hsi:fixture:hospital",
    note: "Synthetic hospital slice — not EPR / PAS live connector.",
  },
  synthetic_lab: {
    illustrativeSystem: "urn:hsi:fixture:lab",
    note: "Synthetic lab slice — not LIMS / FHIR DiagnosticReport SoT.",
  },
  synthetic_pharmacy: {
    illustrativeSystem: "urn:hsi:fixture:pharmacy",
    note: "Synthetic pharmacy slice — not EPS / PMR live feed.",
  },
};

export type SyntheticFhirEventNote = {
  eventId: string;
  kind: TimelineEvent["kind"];
  resourceType: string;
  illustrativeSystem: string;
  codes: string[];
  note: string;
};

export type SyntheticFhirMappingNotes = {
  schemaVersion: typeof CLINICAL_SYNTHETIC_FHIR_NOTES_SCHEMA;
  fixtureId: string;
  syntheticOnly: true;
  containsPhi: false;
  liveEmis: false;
  fhirSoT: false;
  ukCoreCertified: false;
  smartOnFhir: false;
  eventKindCatalogue: typeof EVENT_KIND_TO_FHIR;
  providerCatalogue: typeof PROVIDER_TO_FHIR_SYSTEM;
  events: SyntheticFhirEventNote[];
  honesty: string[];
};

export function mapTimelineEventToFhirNote(event: TimelineEvent): SyntheticFhirEventNote {
  const kindHint = EVENT_KIND_TO_FHIR[event.kind];
  const providerHint = PROVIDER_TO_FHIR_SYSTEM[event.provider];
  return {
    eventId: event.id,
    kind: event.kind,
    resourceType: kindHint.resourceType,
    illustrativeSystem: providerHint.illustrativeSystem,
    codes: [...event.codes],
    note: `${kindHint.note} ${providerHint.note}`,
  };
}

/**
 * Build FHIR mapping notes for a synthetic fixture.
 * Fail-closed on unknown ids. Never claims live EMIS / FHIR SoT.
 */
export function buildSyntheticFhirMappingNotes(
  fixtureId: string,
): SyntheticFhirMappingNotes | null {
  const fixture = getSyntheticTimelineFixture(fixtureId);
  if (!fixture) return null;
  if (!fixture.syntheticOnly || fixture.containsPhi || fixture.liveEmis) {
    return null;
  }

  return {
    schemaVersion: CLINICAL_SYNTHETIC_FHIR_NOTES_SCHEMA,
    fixtureId: fixture.fixtureId,
    syntheticOnly: true,
    containsPhi: false,
    liveEmis: false,
    fhirSoT: false,
    ukCoreCertified: false,
    smartOnFhir: false,
    eventKindCatalogue: EVENT_KIND_TO_FHIR,
    providerCatalogue: PROVIDER_TO_FHIR_SYSTEM,
    events: fixture.events.map(mapTimelineEventToFhirNote),
    honesty: [
      "Illustrative FHIR R4 resource hints only — not a FHIR System of Record.",
      "syntheticOnly=true · liveEmis=false · fhirSoT=false · ukCoreCertified=false.",
      "No SMART-on-FHIR launch, no hospital federation, no PHI.",
      "Codes on events are stubs for demos; do not treat as ingested clinical data.",
      `Providers covered: ${CLINICAL_PROVIDERS.join(", ")}.`,
    ],
  };
}
