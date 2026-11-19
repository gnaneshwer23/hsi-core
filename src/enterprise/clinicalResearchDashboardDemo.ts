/**
 * Clinical Research Dashboard — demonstration fixtures (Stage 4 shell C).
 *
 * Synthetic / research-plane only. Not a clinical decision-making tool.
 * No PHI, no live CDS, no chart write-back. Association ≠ causation.
 * Enrollment / site charts use labelled demo counts — never invent conversion
 * or safety claims. Real patient data never enters this repo.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
} from "./enterpriseDashboardDemo";

export const CLINICAL_RESEARCH_DASHBOARD_DEMO_SCHEMA =
  "hsi-clinical-research-dashboard-demo-1" as const;

export type ClinicalCohortDemo = {
  id: string;
  label: string;
  dataClass: "synthetic_demonstration";
  enabled: false;
  note: string;
};

export type ClinicalPhenotypeDemo = {
  id: string;
  title: string;
  reviewStatus: "candidate_unreviewed";
  passportHonesty: string;
};

export type ClinicalObservationSeries = {
  id: string;
  label: string;
  points: readonly { t: string; valueLabel: string }[];
  dataClass: "synthetic_demonstration";
  note: string;
};

export type ClinicalTrialResearchRow = {
  id: string;
  title: string;
  phaseLabel: string;
  eligibilityHonesty: "research_planning_not_bedside_cds";
  note: string;
};

export type ClinicalAssociation = {
  id: string;
  claim: string;
  associationNotCausation: true;
  reviewStatus: "candidate_unreviewed";
  nextSurface: string;
};

export type ClinicalOpsChartDemo = {
  id: string;
  title: string;
  bars: readonly { label: string; value: number }[];
  dataClass: "synthetic_demonstration";
  note: string;
};

export type ClinicalResearchDashboardDemo = {
  schemaVersion: typeof CLINICAL_RESEARCH_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    syntheticCohortSlots: number;
    phenotypeCount: number;
    trialResearchCount: number;
    associationCount: number;
    labelsAreDemonstration: true;
    cdsEnabled: false;
    phiEnabled: false;
  };
  cohorts: readonly ClinicalCohortDemo[];
  phenotypes: readonly ClinicalPhenotypeDemo[];
  observations: readonly ClinicalObservationSeries[];
  trials: readonly ClinicalTrialResearchRow[];
  associations: readonly ClinicalAssociation[];
  opsCharts: readonly ClinicalOpsChartDemo[];
  opportunities: readonly EnterpriseOpportunity[];
  boundaryNote: string;
  collaborationNote: string;
};

export function clinicalResearchDashboardDemo(): ClinicalResearchDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: CLINICAL_RESEARCH_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Clinical research (demonstration · synthetic only)",
    summary: {
      syntheticCohortSlots: 2,
      phenotypeCount: 2,
      trialResearchCount: 2,
      associationCount: 3,
      labelsAreDemonstration: true,
      cdsEnabled: false,
      phiEnabled: false,
    },
    cohorts: [
      {
        id: "cohort-synth-1",
        label: "Synthetic cohort plane slot A",
        dataClass: "synthetic_demonstration",
        enabled: false,
        note: "Open /research/cohort for the live synthetic release-gate demo. Real cohorts stay owner-gated.",
      },
      {
        id: "cohort-synth-2",
        label: "Approved research cohort (held)",
        dataClass: "synthetic_demonstration",
        enabled: false,
        note: "Durable approved cohorts require ADR-0010 gates — disabled here.",
      },
    ],
    phenotypes: [
      {
        id: "pheno-1",
        title: "Research phenotype sketch (passport-linked)",
        reviewStatus: "candidate_unreviewed",
        passportHonesty: "Phenotype metadata for research — not chart write-back.",
      },
      {
        id: "pheno-2",
        title: "Context Passport fields (demo)",
        reviewStatus: "candidate_unreviewed",
        passportHonesty: "Missing experimental fields stay explicit on the live brief path.",
      },
    ],
    observations: [
      {
        id: "obs-1",
        label: "Illustrative longitudinal lab series",
        points: [
          { t: "t0", valueLabel: "demo" },
          { t: "t1", valueLabel: "demo" },
          { t: "t2", valueLabel: "demo" },
        ],
        dataClass: "synthetic_demonstration",
        note: "Synthetic series only in this repo — not a real patient trajectory.",
      },
    ],
    trials: [
      {
        id: "trial-row-1",
        title: "Illustrative trial topic overlap (research planning)",
        phaseLabel: "Phase labelled illustrative",
        eligibilityHonesty: "research_planning_not_bedside_cds",
        note: "Deep-link to /research/prescreen — never an eligibility decision.",
      },
      {
        id: "trial-row-2",
        title: "Criteria inspection support (synthetic)",
        phaseLabel: "Synthetic fixture",
        eligibilityHonesty: "research_planning_not_bedside_cds",
        note: "Investigators retain every eligibility judgement.",
      },
    ],
    associations: [
      {
        id: "assoc-1",
        claim: "Molecular ↔ clinical association candidate (demo)",
        associationNotCausation: true,
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/workspace",
      },
      {
        id: "assoc-2",
        claim: "Cross-domain evidence link sketch",
        associationNotCausation: true,
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/knowledge-graph",
      },
      {
        id: "assoc-3",
        claim: "Phenotype ↔ gap bridge (candidate)",
        associationNotCausation: true,
        reviewStatus: "candidate_unreviewed",
        nextSurface: "/research/gaps",
      },
    ],
    opsCharts: [
      {
        id: "ops-enroll",
        title: "Enrollment sketch (ops analytics demo)",
        bars: [
          { label: "Site A", value: 12 },
          { label: "Site B", value: 8 },
          { label: "Site C", value: 5 },
        ],
        dataClass: "synthetic_demonstration",
        note: "Labelled demo counts — not conversion, safety, or recruitment truth.",
      },
    ],
    opportunities: [
      {
        id: "clin-gap-1",
        question: "Which synthetic cohort definitions still need human review before any aggregate release?",
        entities: ["Synthetic cohort", "Release gate"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Synthetic plane only.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "High — real cohorts blocked by ADR-0010.",
        nextInvestigation: "/research/cohort",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "clin-gap-2",
        question: "Where does trial pre-screening need clinician judgement that software must not invent?",
        entities: ["Trial pre-screening", "Human review items"],
        supportingEvidence: "Open synthetic pre-screening surface.",
        experimentalContext: "Not bedside CDS.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Eligibility remains unconfirmed by design.",
        nextInvestigation: "/research/prescreen",
        reviewStatus: "candidate_unreviewed",
      },
    ],
    boundaryNote:
      "This shell is not a clinical decision-making tool. No PHI, no live CDS, no EHR write-back. Synthetic / demonstration data only until every ADR-0010 gate is closed with written owner approval.",
    collaborationNote:
      "Clinical research teams can request collaboration with academic or biotech shells without exposing patient records. Patient participation stays a future governed path.",
  };
}
