/**
 * First researcher pilot — demonstration fixtures (Stage 4 shell I / audit §I).
 *
 * Design shell for the proposed 3–5 researcher invite-only pilot. Never claims
 * pilot ready, invents users/testimonials, or invents conversion rates.
 * Org dashboards A–H remain demos — not the pilot centre. Prerequisites stay
 * owner-gated. Not CDS; no PHI.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
} from "./enterpriseDashboardDemo";

export const FIRST_PILOT_DASHBOARD_DEMO_SCHEMA =
  "hsi-first-pilot-dashboard-demo-1" as const;

export type PilotPrerequisite = {
  id: string;
  label: string;
  status: "owner_gated_blocked";
  inventsReady: false;
  note: string;
  nextSurface: string;
};

export type PilotSuccessSignal = {
  id: string;
  label: string;
  measure: string;
  inventsConversion: false;
  note: string;
};

export type PilotOutOfScope = {
  id: string;
  label: string;
  reason: string;
};

export type FirstPilotDashboardDemo = {
  schemaVersion: typeof FIRST_PILOT_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    proposedResearcherCount: "3-5";
    prerequisiteCount: number;
    successSignalCount: number;
    outOfScopeCount: number;
    labelsAreDemonstration: true;
    pilotReadyClaimed: false;
    inventsPilotConversion: false;
    inventsUsersOrTestimonials: false;
    stage2JourneyIsBuildCentre: true;
  };
  proposal: {
    size: string;
    scope: string;
    success: string;
    forbidden: string;
  };
  prerequisites: readonly PilotPrerequisite[];
  successSignals: readonly PilotSuccessSignal[];
  outOfScope: readonly PilotOutOfScope[];
  governanceNote: string;
};

export function firstPilotDashboardDemo(): FirstPilotDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: FIRST_PILOT_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "First researcher pilot (design)",
    summary: {
      proposedResearcherCount: "3-5",
      prerequisiteCount: 5,
      successSignalCount: 4,
      outOfScopeCount: 4,
      labelsAreDemonstration: true,
      pilotReadyClaimed: false,
      inventsPilotConversion: false,
      inventsUsersOrTestimonials: false,
      stage2JourneyIsBuildCentre: true,
    },
    proposal: {
      size: "3–5 biomedical researchers (academic or biotech discovery)",
      scope: "One disease-agnostic question each in their own domain",
      success:
        "Complete Stage 2 journey; rate usefulness; reopen once; state willingness to pay (Y/N/maybe)",
      forbidden:
        "Invented users, testimonials, fake conversion rates, or “pilot ready” claims",
    },
    prerequisites: [
      {
        id: "prereq-grants",
        label: "Staging research grants for invitees",
        status: "owner_gated_blocked",
        inventsReady: false,
        note: "Owner provisions grants — not invented in git.",
        nextSurface: "/research/account",
      },
      {
        id: "prereq-writes",
        label: "Write-scope packet (#5)",
        status: "owner_gated_blocked",
        inventsReady: false,
        note: "Production writes stay fail-closed until the packet is accepted.",
        nextSurface: "/docs",
      },
      {
        id: "prereq-source",
        label: "Source policy for permitted corpora",
        status: "owner_gated_blocked",
        inventsReady: false,
        note: "Clearance authority remains human-gated.",
        nextSurface: "/research/governance",
      },
      {
        id: "prereq-spend",
        label: "Model spend cap",
        status: "owner_gated_blocked",
        inventsReady: false,
        note: "Lean budget rule — no unbounded chat-style spend.",
        nextSurface: "/research/home",
      },
      {
        id: "prereq-invite",
        label: "Invite 3–5 researchers",
        status: "owner_gated_blocked",
        inventsReady: false,
        note: "No invented invitees or testimonials in this shell.",
        nextSurface: "/contact",
      },
    ],
    successSignals: [
      {
        id: "sig-journey",
        label: "Stage 2 journey completion",
        measure: "Checklist progress — never journey-complete claimed",
        inventsConversion: false,
        note: "Deep-link to live investigation workspace.",
      },
      {
        id: "sig-useful",
        label: "Researcher-rated usefulness",
        measure: "Local usefulness feedback",
        inventsConversion: false,
        note: "Device-local §H signal — not aggregate conversion.",
      },
      {
        id: "sig-reopen",
        label: "Reopen same investigation",
        measure: "Save/reopen continuity",
        inventsConversion: false,
        note: "Personal USP C — not org dashboard KPIs.",
      },
      {
        id: "sig-wtp",
        label: "Willingness to pay stated",
        measure: "Y / N / maybe — no checkout",
        inventsConversion: false,
        note: "Must not invent pilot conversion percentages.",
      },
    ],
    outOfScope: [
      {
        id: "oos-org",
        label: "Org dashboards A–H as pilot centre",
        reason: "Stage 4 demos only — Stage 2 journey remains the build centre.",
      },
      {
        id: "oos-cohorts",
        label: "Clinical cohorts / PHI",
        reason: "Clinical plane gated; not CDS; no PHI in hsi-core.",
      },
      {
        id: "oos-community",
        label: "Community posting / Circles writes",
        reason: "Circles durable store held; shared ≠ public.",
      },
      {
        id: "oos-checkout",
        label: "Paid checkout / revenue claims",
        reason: "Willingness signal only — no invented conversion.",
      },
    ],
    governanceNote:
      "Stage 4 shell I — first researcher pilot design (audit §I). Pilot ready is always false. No invented users, testimonials or conversion rates. Prerequisites stay owner-gated. Org dashboards A–H are demos, not the pilot centre. Stage 2 journey remains the build centre. Not CDS; no PHI.",
  };
}
