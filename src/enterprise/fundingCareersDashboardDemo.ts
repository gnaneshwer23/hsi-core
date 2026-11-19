/**
 * Funding & Careers Dashboard — demonstration fixtures (Stage 4 shell H).
 *
 * Collaboration chrome for funding sketches, career pathways and industry /
 * collaborator discovery over the shared science engine. No invented award
 * rates, conversion %, or success claims. Durable org / funding store held.
 * Not CDS; no PHI.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
} from "./enterpriseDashboardDemo";

export const FUNDING_CAREERS_DASHBOARD_DEMO_SCHEMA =
  "hsi-funding-careers-dashboard-demo-1" as const;

export type FundingSketch = {
  id: string;
  title: string;
  sourceKind: "public_call_sketch" | "institutional_sketch";
  status: "illustrative_only";
  inventedAwardRate: false;
  inventedConversionPercent: false;
  note: string;
  nextSurface: string;
};

export type CareerPathway = {
  id: string;
  label: string;
  status: "proposed_not_enabled";
  durableStore: "held";
  note: string;
};

export type CollaboratorSketch = {
  id: string;
  displayName: string;
  kind: "academic_group" | "biotech_team" | "core_facility";
  permissionAware: true;
  autoIpBleed: false;
  note: string;
};

export type FundingCareersDashboardDemo = {
  schemaVersion: typeof FUNDING_CAREERS_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    fundingSketchCount: number;
    careerPathwayCount: number;
    collaboratorCount: number;
    opportunityCount: number;
    labelsAreDemonstration: true;
    durableFundingStore: "held";
    inventedAwardRate: false;
    inventedConversionPercent: false;
  };
  fundingSketches: readonly FundingSketch[];
  careerPathways: readonly CareerPathway[];
  collaborators: readonly CollaboratorSketch[];
  opportunities: readonly EnterpriseOpportunity[];
  governanceNote: string;
};

export function fundingCareersDashboardDemo(): FundingCareersDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: FUNDING_CAREERS_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Funding & careers (demonstration)",
    summary: {
      fundingSketchCount: 3,
      careerPathwayCount: 3,
      collaboratorCount: 3,
      opportunityCount: 2,
      labelsAreDemonstration: true,
      durableFundingStore: "held",
      inventedAwardRate: false,
      inventedConversionPercent: false,
    },
    fundingSketches: [
      {
        id: "fund-1",
        title: "Cross-domain mechanistic fellowship sketch",
        sourceKind: "public_call_sketch",
        status: "illustrative_only",
        inventedAwardRate: false,
        inventedConversionPercent: false,
        note: "Call text is illustrative — not a live funder feed or eligibility engine.",
        nextSurface: "/research/gaps",
      },
      {
        id: "fund-2",
        title: "Institutional seed grant sketch",
        sourceKind: "institutional_sketch",
        status: "illustrative_only",
        inventedAwardRate: false,
        inventedConversionPercent: false,
        note: "Requires durable org store and grants — held. No invented award odds.",
        nextSurface: "/academic",
      },
      {
        id: "fund-3",
        title: "Industry collaboration scoping sketch",
        sourceKind: "public_call_sketch",
        status: "illustrative_only",
        inventedAwardRate: false,
        inventedConversionPercent: false,
        note: "Company-confidential programmes never auto-share from this shell.",
        nextSurface: "/enterprise/biotech",
      },
    ],
    careerPathways: [
      {
        id: "career-1",
        label: "Early-career investigation trail",
        status: "proposed_not_enabled",
        durableStore: "held",
        note: "Links into Stage 2 journey — not a placement marketplace.",
      },
      {
        id: "career-2",
        label: "Supervision / mentoring sketch",
        status: "proposed_not_enabled",
        durableStore: "held",
        note: "Professor/student shells remain the academic chrome; this is not HR.",
      },
      {
        id: "career-3",
        label: "Industry secondment sketch",
        status: "proposed_not_enabled",
        durableStore: "held",
        note: "Permission-aware only; seats ≠ scientific clearance.",
      },
    ],
    collaborators: [
      {
        id: "collab-1",
        displayName: "Academic group sketch Alpha",
        kind: "academic_group",
        permissionAware: true,
        autoIpBleed: false,
        note: "Discoverability is opt-in / grant-scoped — not a public dump.",
      },
      {
        id: "collab-2",
        displayName: "Biotech discovery team sketch",
        kind: "biotech_team",
        permissionAware: true,
        autoIpBleed: false,
        note: "Confidential portfolios stay private by default.",
      },
      {
        id: "collab-3",
        displayName: "Core facility / omics sketch",
        kind: "core_facility",
        permissionAware: true,
        autoIpBleed: false,
        note: "Assay collaboration requests do not invent QC scores.",
      },
    ],
    opportunities: [
      {
        id: "fund-opp-1",
        question:
          "Which candidate gaps could justify a cross-domain fellowship application?",
        entities: ["Evidence gaps", "Cross-domain paths"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Not stated.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "High — funding fit is not scientific approval.",
        nextInvestigation: "/research/gaps",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "fund-opp-2",
        question:
          "Where might an academic group and biotech team share a non-confidential evidence review?",
        entities: ["Research Circles", "Disagreement packs"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Not stated.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Collaboration stays permission-aware; Circles store held.",
        nextInvestigation: "/enterprise/community",
        reviewStatus: "candidate_unreviewed",
      },
    ],
    governanceNote:
      "Stage 4 shell H — funding and careers preview. Illustrative calls and collaborator sketches only. Durable funding/org store held. No invented award rates, conversion percentages or success claims. Not CDS; no PHI. Seats ≠ scientific clearance.",
  };
}
