/**
 * Research Participant contribution preview — demonstration fixtures (Stage 4 shell G).
 *
 * Separate governed experience for research participants — **not** a scientific
 * dashboard and **not** CDS. No PHI in this repo. Consent / contribution chrome
 * stays synthetic and disabled until ADR-0010 clinical-plane gates close.
 * Never invent enrollment %, conversion, or safety claims.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
} from "./enterpriseDashboardDemo";

export const PARTICIPANT_DASHBOARD_DEMO_SCHEMA =
  "hsi-participant-dashboard-demo-1" as const;

export type ParticipantConsentSlot = {
  id: string;
  label: string;
  status: "disabled_until_governance";
  dataClass: "synthetic_demonstration";
  phiCollected: false;
  note: string;
};

export type ParticipantContributionChannel = {
  id: string;
  label: string;
  enabled: false;
  scientificDashboard: false;
  cdsEnabled: false;
  nextSurface: string;
  note: string;
};

export type ParticipantUpdateSketch = {
  id: string;
  title: string;
  status: "proposed_not_enabled";
  inventedEnrollmentPercent: false;
  note: string;
};

export type ParticipantDashboardDemo = {
  schemaVersion: typeof PARTICIPANT_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    consentSlotCount: number;
    contributionChannelCount: number;
    updateSketchCount: number;
    labelsAreDemonstration: true;
    phiEnabled: false;
    cdsEnabled: false;
    scientificDashboard: false;
    realParticipantPath: "blocked_adr0010";
  };
  consentSlots: readonly ParticipantConsentSlot[];
  contributionChannels: readonly ParticipantContributionChannel[];
  updateSketches: readonly ParticipantUpdateSketch[];
  governanceNote: string;
};

export function participantDashboardDemo(): ParticipantDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: PARTICIPANT_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Research participant contribution (demonstration)",
    summary: {
      consentSlotCount: 3,
      contributionChannelCount: 3,
      updateSketchCount: 2,
      labelsAreDemonstration: true,
      phiEnabled: false,
      cdsEnabled: false,
      scientificDashboard: false,
      realParticipantPath: "blocked_adr0010",
    },
    consentSlots: [
      {
        id: "consent-study",
        label: "Study information sheet (sketch)",
        status: "disabled_until_governance",
        dataClass: "synthetic_demonstration",
        phiCollected: false,
        note: "Illustrative consent step only — no identifiers or signatures are stored here.",
      },
      {
        id: "consent-data-use",
        label: "Research data-use preferences (sketch)",
        status: "disabled_until_governance",
        dataClass: "synthetic_demonstration",
        phiCollected: false,
        note: "Preferences would live on the clinical plane after ADR-0010 gates — never in hsi-core.",
      },
      {
        id: "consent-withdraw",
        label: "Withdrawal pathway (sketch)",
        status: "disabled_until_governance",
        dataClass: "synthetic_demonstration",
        phiCollected: false,
        note: "Withdrawal must remain available in any future governed path; this shell cannot enact it.",
      },
    ],
    contributionChannels: [
      {
        id: "chan-survey",
        label: "Approved research questionnaires",
        enabled: false,
        scientificDashboard: false,
        cdsEnabled: false,
        nextSurface: "/research/cohort",
        note: "Synthetic cohort tools only — no participant answers accepted here.",
      },
      {
        id: "chan-sample",
        label: "Biosample logistics notices",
        enabled: false,
        scientificDashboard: false,
        cdsEnabled: false,
        nextSurface: "/research/methods",
        note: "Logistics notices are not lab results and not clinical advice.",
      },
      {
        id: "chan-update",
        label: "Study update receipts",
        enabled: false,
        scientificDashboard: false,
        cdsEnabled: false,
        nextSurface: "/contact",
        note: "Future receipts would be permission-aware; this preview does not send messages.",
      },
    ],
    updateSketches: [
      {
        id: "upd-1",
        title: "How study findings may be summarised for participants",
        status: "proposed_not_enabled",
        inventedEnrollmentPercent: false,
        note: "No enrollment, conversion or safety percentages are shown or claimed.",
      },
      {
        id: "upd-2",
        title: "Where to ask a study team question",
        status: "proposed_not_enabled",
        inventedEnrollmentPercent: false,
        note: "Contact paths stay informational — not triage, not CDS.",
      },
    ],
    governanceNote:
      "Stage 4 shell G — research participant contribution preview. Not a scientific dashboard, not a clinical decision-making tool, and not CDS. PHI stays out of hsi-core. Real participant pathways require ADR-0010 clinical-plane gates. No invented enrollment, conversion or safety metrics.",
  };
}
