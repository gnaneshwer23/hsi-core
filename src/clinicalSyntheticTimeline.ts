/**
 * HSI Clinical — synthetic longitudinal timeline MVP.
 * Multi-provider fixtures + missing-info reports. syntheticOnly=true always.
 * No live EMIS / FHIR SoT / PHI. Cap 9 missing-information honesty.
 */
import {
  HSI_CDS_PHI_INVARIANTS,
  type HsiCdsPhiInvariants,
} from "./cdsPhiBoundary";

export const CLINICAL_SYNTHETIC_TIMELINE_SCHEMA = "hsi-clinical-synthetic-timeline-1" as const;

export const CLINICAL_PROVIDERS = [
  "synthetic_gp",
  "synthetic_hospital",
  "synthetic_lab",
  "synthetic_pharmacy",
] as const;
export type ClinicalProvider = (typeof CLINICAL_PROVIDERS)[number];

export type MissingInfoKind = "unavailable" | "not_recorded" | "not_applicable";

export type TimelineEvent = {
  id: string;
  provider: ClinicalProvider;
  occurredAt: string;
  kind: "encounter" | "lab" | "medication" | "problem" | "vital";
  label: string;
  /** Synthetic codes only — never real NHS numbers / MRNs. */
  codes: string[];
  sourceSystem: string;
};

export type MissingInfoItem = {
  attribute: string;
  kind: MissingInfoKind;
  whyItMatters: string;
  verificationStep: string;
};

export type SyntheticPatientFixture = {
  fixtureId: string;
  displayLabel: string;
  /** Always true — binding. */
  syntheticOnly: true;
  containsPhi: false;
  liveEmis: false;
  providers: ClinicalProvider[];
  events: TimelineEvent[];
  /** Intentionally omitted attributes for Cap 9 demos. */
  omittedAttributes: string[];
};

export type ClinicalTimelineView = {
  schemaVersion: typeof CLINICAL_SYNTHETIC_TIMELINE_SCHEMA;
  product: "HSI Clinical";
  maturity: "in_development";
  fixtureId: string;
  syntheticOnly: true;
  containsPhi: false;
  liveEmis: false;
  events: TimelineEvent[];
  missingInformation: MissingInfoItem[];
  providerCoverage: Record<ClinicalProvider, number>;
  invariants: HsiCdsPhiInvariants;
  honesty: string[];
};

/** Cap 9 omission catalogue — kinds vary; missing ≠ negative fact. */
const OMISSION_CATALOGUE: Record<
  string,
  Pick<MissingInfoItem, "kind" | "whyItMatters" | "verificationStep">
> = {
  HbA1c_last_90d: {
    kind: "not_recorded",
    whyItMatters: "Recent glycaemic control is task-critical for longitudinal T2D review.",
    verificationStep: "Request last HbA1c from authorised lab feed; do not invent a negative result.",
  },
  eGFR: {
    kind: "not_recorded",
    whyItMatters: "Renal function gates metformin and many dose adjustments.",
    verificationStep: "Pull structured eGFR from lab; mark unavailable if no authorised source.",
  },
  hospital_discharge_summary: {
    kind: "unavailable",
    whyItMatters: "Cross-provider continuity depends on discharge narrative when GP notes are thin.",
    verificationStep: "Confirm hospital connector scope; do not synthesise a discharge note.",
  },
  primary_care_med_list: {
    kind: "unavailable",
    whyItMatters: "Hospital slice without GP meds risks incomplete exposure history.",
    verificationStep: "Await primary-care feed or mark unavailable; do not invent a blank list as ‘no meds’.",
  },
  allergy_list: {
    kind: "not_recorded",
    whyItMatters: "Allergy unknowns are safety-critical; absence of rows is not ‘no allergies’.",
    verificationStep: "Query authorised allergy source; never assert NKDA from a gap.",
  },
  CRP: {
    kind: "not_recorded",
    whyItMatters: "Inflammatory activity is often required before mechanism hypotheses.",
    verificationStep: "Request CRP/ESR panel; do not treat omission as a normal result.",
  },
  paediatric_growth_chart: {
    kind: "not_applicable",
    whyItMatters: "Adult synthetic walkthrough — paediatric growth charts are out of scope for this fixture.",
    verificationStep: "Confirm age band; mark not_applicable rather than inventing a blank paediatric record.",
  },
  spirometry_fev1: {
    kind: "not_recorded",
    whyItMatters: "Obstructive pattern assessment needs structured spirometry when asthma/COPD is in play.",
    verificationStep: "Request authorised spirometry; do not invent FEV1 from narrative notes.",
  },
  inhaler_adherence_log: {
    kind: "unavailable",
    whyItMatters: "Device adherence feeds are often outside primary-care scope; gap ≠ non-adherence.",
    verificationStep: "Confirm inhaler-log connector; never assert non-adherence from absence.",
  },
};

/** Built-in multi-provider fixtures — no PHI. */
export const SYNTHETIC_TIMELINE_FIXTURES: readonly SyntheticPatientFixture[] = [
  {
    fixtureId: "syn-t2d-multi-provider-01",
    displayLabel: "Synthetic T2D longitudinal (GP + lab + pharmacy)",
    syntheticOnly: true,
    containsPhi: false,
    liveEmis: false,
    providers: ["synthetic_gp", "synthetic_lab", "synthetic_pharmacy"],
    omittedAttributes: ["HbA1c_last_90d", "eGFR", "hospital_discharge_summary"],
    events: [
      {
        id: "e1",
        provider: "synthetic_gp",
        occurredAt: "2025-06-12T09:00:00.000Z",
        kind: "problem",
        label: "Type 2 diabetes mellitus (synthetic problem)",
        codes: ["SNOMED:44054006"],
        sourceSystem: "fixture://gp",
      },
      {
        id: "e2",
        provider: "synthetic_gp",
        occurredAt: "2025-09-01T10:30:00.000Z",
        kind: "encounter",
        label: "GP review — glucose coaching (synthetic)",
        codes: ["ENCOUNTER:gp-review"],
        sourceSystem: "fixture://gp",
      },
      {
        id: "e3",
        provider: "synthetic_lab",
        occurredAt: "2025-03-20T14:00:00.000Z",
        kind: "lab",
        label: "Fasting glucose (synthetic LOINC stub)",
        codes: ["LOINC:1558-6"],
        sourceSystem: "fixture://lab",
      },
      {
        id: "e4",
        provider: "synthetic_pharmacy",
        occurredAt: "2025-09-02T11:00:00.000Z",
        kind: "medication",
        label: "Metformin (synthetic medication statement)",
        codes: ["RXNORM:6809"],
        sourceSystem: "fixture://pharmacy",
      },
    ],
  },
  {
    fixtureId: "syn-immuno-hospital-gap-02",
    displayLabel: "Synthetic immuno hospital slice with GP gap",
    syntheticOnly: true,
    containsPhi: false,
    liveEmis: false,
    providers: ["synthetic_hospital", "synthetic_lab"],
    omittedAttributes: ["primary_care_med_list", "allergy_list", "CRP"],
    events: [
      {
        id: "h1",
        provider: "synthetic_hospital",
        occurredAt: "2026-01-15T08:00:00.000Z",
        kind: "encounter",
        label: "Outpatient rheumatology (synthetic)",
        codes: ["ENCOUNTER:rheum-op"],
        sourceSystem: "fixture://hospital",
      },
      {
        id: "h2",
        provider: "synthetic_lab",
        occurredAt: "2026-01-10T12:00:00.000Z",
        kind: "lab",
        label: "RF / ACPA panel placeholder (synthetic)",
        codes: ["LOINC:11572-5"],
        sourceSystem: "fixture://lab",
      },
    ],
  },
  {
    fixtureId: "syn-asthma-multi-provider-03",
    displayLabel: "Synthetic asthma longitudinal (GP + hospital + pharmacy)",
    syntheticOnly: true,
    containsPhi: false,
    liveEmis: false,
    providers: ["synthetic_gp", "synthetic_hospital", "synthetic_pharmacy"],
    omittedAttributes: [
      "spirometry_fev1",
      "inhaler_adherence_log",
      "paediatric_growth_chart",
      "allergy_list",
    ],
    events: [
      {
        id: "a1",
        provider: "synthetic_gp",
        occurredAt: "2025-04-08T09:15:00.000Z",
        kind: "problem",
        label: "Asthma (synthetic problem)",
        codes: ["SNOMED:195967001"],
        sourceSystem: "fixture://gp",
      },
      {
        id: "a2",
        provider: "synthetic_gp",
        occurredAt: "2025-11-20T11:00:00.000Z",
        kind: "encounter",
        label: "GP asthma review (synthetic)",
        codes: ["ENCOUNTER:gp-asthma-review"],
        sourceSystem: "fixture://gp",
      },
      {
        id: "a3",
        provider: "synthetic_hospital",
        occurredAt: "2025-08-14T02:30:00.000Z",
        kind: "encounter",
        label: "ED attendance — wheeze (synthetic)",
        codes: ["ENCOUNTER:ed-wheeze"],
        sourceSystem: "fixture://hospital",
      },
      {
        id: "a4",
        provider: "synthetic_hospital",
        occurredAt: "2025-08-14T06:00:00.000Z",
        kind: "vital",
        label: "SpO2 spot check (synthetic)",
        codes: ["LOINC:59408-5"],
        sourceSystem: "fixture://hospital",
      },
      {
        id: "a5",
        provider: "synthetic_pharmacy",
        occurredAt: "2025-11-21T10:00:00.000Z",
        kind: "medication",
        label: "Beclometasone inhaler (synthetic medication statement)",
        codes: ["RXNORM:1998"],
        sourceSystem: "fixture://pharmacy",
      },
    ],
  },
] as const;

function emptyCoverage(): Record<ClinicalProvider, number> {
  return {
    synthetic_gp: 0,
    synthetic_hospital: 0,
    synthetic_lab: 0,
    synthetic_pharmacy: 0,
  };
}

export function listSyntheticTimelineFixtures(): readonly SyntheticPatientFixture[] {
  return SYNTHETIC_TIMELINE_FIXTURES;
}

export function getSyntheticTimelineFixture(fixtureId: string): SyntheticPatientFixture | null {
  return SYNTHETIC_TIMELINE_FIXTURES.find((f) => f.fixtureId === fixtureId) ?? null;
}

/**
 * Build Cap 9-style missing-information list from fixture omissions.
 * Missing ≠ negative Cat 1 fact.
 */
export function buildMissingInformation(fixture: SyntheticPatientFixture): MissingInfoItem[] {
  return fixture.omittedAttributes.map((attribute) => {
    const known = OMISSION_CATALOGUE[attribute];
    if (known) {
      return { attribute, ...known };
    }
    return {
      attribute,
      kind: "not_recorded" as const,
      whyItMatters: `Attribute “${attribute}” is omitted in this synthetic fixture — task-critical unknowns must stay visible.`,
      verificationStep: "Request from authorised source or mark unavailable; do not invent a negative result.",
    };
  });
}

export const MISSING_INFO_KIND_LABEL: Record<MissingInfoKind, string> = {
  unavailable: "unavailable",
  not_recorded: "not recorded",
  not_applicable: "not applicable",
};

export function buildClinicalTimelineView(fixtureId: string): ClinicalTimelineView | null {
  const fixture = getSyntheticTimelineFixture(fixtureId);
  if (!fixture) return null;
  if (!fixture.syntheticOnly || fixture.containsPhi || fixture.liveEmis) {
    return null; // fail closed
  }

  const events = [...fixture.events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const providerCoverage = emptyCoverage();
  for (const e of events) providerCoverage[e.provider] += 1;

  return {
    schemaVersion: CLINICAL_SYNTHETIC_TIMELINE_SCHEMA,
    product: "HSI Clinical",
    maturity: "in_development",
    fixtureId: fixture.fixtureId,
    syntheticOnly: true,
    containsPhi: false,
    liveEmis: false,
    events,
    missingInformation: buildMissingInformation(fixture),
    providerCoverage,
    invariants: { ...HSI_CDS_PHI_INVARIANTS },
    honesty: [
      "HSI Clinical synthetic timeline — In development.",
      "syntheticOnly=true · containsPhi=false · liveEmis=false.",
      "Multi-provider fixtures are illustrative; not a reconstructed real patient history.",
      "Missing-information items are meta about absence — not negative clinical facts.",
      "No live EMIS / EHR write-back / PHI→LLM.",
    ],
  };
}
