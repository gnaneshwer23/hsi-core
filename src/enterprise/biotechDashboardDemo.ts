/**
 * Biotech / Pharma Research Dashboard — demonstration fixtures (Stage 4 shell B).
 *
 * Targets, programmes, biomarkers and portfolio rows are illustrative.
 * Never invent pipeline success rates, competitor status as truth, or scientific gold.
 * Company-confidential programmes are never auto-shared. Not CDS; no PHI.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
  type EnterpriseTreeNode,
} from "./enterpriseDashboardDemo";

export const BIOTECH_DASHBOARD_DEMO_SCHEMA = "hsi-biotech-dashboard-demo-1" as const;

export type BiotechTarget = {
  id: string;
  name: string;
  modalityHint: string;
  pathway: string;
  evidenceState: "candidate_unreviewed";
  mechanismValidation: "not_scientific_gold";
};

export type BiotechCompetitorProgramme = {
  id: string;
  label: string;
  statusLabel: "illustrative_only";
  note: string;
};

export type BiotechBiomarker = {
  id: string;
  name: string;
  typeHint: string;
  sourceHonesty: string;
  verificationState: "unreviewed_candidate";
};

export type BiotechPortfolioItem = {
  id: string;
  title: string;
  decisionState: "human_review_required";
  note: string;
};

export type BiotechDashboardDemo = {
  schemaVersion: typeof BIOTECH_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    trackedTargetCount: number;
    mechanismMapCount: number;
    landscapeProgrammeCount: number;
    translationalGapCount: number;
    labelsAreDemonstration: true;
  };
  targets: readonly BiotechTarget[];
  targetTree: readonly EnterpriseTreeNode[];
  competitors: readonly BiotechCompetitorProgramme[];
  biomarkers: readonly BiotechBiomarker[];
  translationalGaps: readonly EnterpriseOpportunity[];
  portfolio: readonly BiotechPortfolioItem[];
  governanceNote: string;
  collaborationNote: string;
};

export function biotechDashboardDemo(): BiotechDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: BIOTECH_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Discovery / translational R&D (demonstration)",
    summary: {
      trackedTargetCount: 6,
      mechanismMapCount: 4,
      landscapeProgrammeCount: 3,
      translationalGapCount: 5,
      labelsAreDemonstration: true,
    },
    targets: [
      {
        id: "tgt-il21",
        name: "IL-21 signalling (demo focus)",
        modalityHint: "Pathway / cytokine axis",
        pathway: "Adaptive immune signalling",
        evidenceState: "candidate_unreviewed",
        mechanismValidation: "not_scientific_gold",
      },
      {
        id: "tgt-tfh",
        name: "Tfh expansion axis (demo)",
        modalityHint: "Cell-state context",
        pathway: "Germinal-centre biology",
        evidenceState: "candidate_unreviewed",
        mechanismValidation: "not_scientific_gold",
      },
      {
        id: "tgt-bcell",
        name: "B-cell response node (demo)",
        modalityHint: "Downstream phenotype",
        pathway: "Humoral immunity",
        evidenceState: "candidate_unreviewed",
        mechanismValidation: "not_scientific_gold",
      },
    ],
    targetTree: [
      {
        id: "bio-node-target",
        label: "Tracked targets (schematic)",
        domain: "Target intelligence",
        reviewStatus: "candidate",
        uncertainty: "high",
      },
      {
        id: "bio-node-mech",
        label: "Mechanism maps (unreviewed)",
        domain: "Mechanism validation",
        reviewStatus: "candidate",
        uncertainty: "high",
      },
      {
        id: "bio-node-land",
        label: "Therapeutic landscape sketch",
        domain: "Landscape",
        reviewStatus: "unreviewed",
        uncertainty: "high",
      },
      {
        id: "bio-node-bio",
        label: "Biomarker candidates",
        domain: "Biomarkers",
        reviewStatus: "candidate",
        uncertainty: "medium",
      },
      {
        id: "bio-node-gap",
        label: "Translational gaps",
        domain: "Translation",
        reviewStatus: "unreviewed",
        uncertainty: "high",
      },
    ],
    competitors: [
      {
        id: "comp-1",
        label: "Public programme sketch A",
        statusLabel: "illustrative_only",
        note: "Not a claim of pipeline stage, approval, or success rate.",
      },
      {
        id: "comp-2",
        label: "Public programme sketch B",
        statusLabel: "illustrative_only",
        note: "Wire authorised registries later — never invent competitor status.",
      },
      {
        id: "comp-3",
        label: "Confidential competitor slot",
        statusLabel: "illustrative_only",
        note: "Company-confidential programmes stay permission-gated and empty here.",
      },
    ],
    biomarkers: [
      {
        id: "bm-1",
        name: "Pathway activity marker (demo)",
        typeHint: "Molecular / RNA-linked candidate",
        sourceHonesty: "Source + verification state not promoted",
        verificationState: "unreviewed_candidate",
      },
      {
        id: "bm-2",
        name: "Protein abundance hint (demo)",
        typeHint: "Proteomics-linked candidate",
        sourceHonesty: "Not a validated clinical biomarker",
        verificationState: "unreviewed_candidate",
      },
    ],
    translationalGaps: [
      {
        id: "bio-gap-1",
        question: "Which public evidence supports or contradicts target X in pathway Y?",
        entities: ["Target X", "Pathway Y"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Not stated.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "High — competitor landscape is illustrative.",
        nextInvestigation: "/research/targets",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "bio-gap-2",
        question: "Where are translational biomarkers under-specified across programmes?",
        entities: ["Biomarkers", "Translational gaps"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Not stated.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Portfolio decisions require human review.",
        nextInvestigation: "/research/workspace",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "bio-gap-3",
        question: "Does dual-model verification change mechanism confidence for the focus claim?",
        entities: ["Mechanism validation", "Context Passport"],
        supportingEvidence: "Open live investigation for verification fields.",
        experimentalContext: "Fail-closed — not scientific gold.",
        conflictingEvidence: "Structured disagreement remains candidate.",
        uncertainty: "Human Gate C only.",
        nextInvestigation: "/research/workspace",
        reviewStatus: "candidate_unreviewed",
      },
    ],
    portfolio: [
      {
        id: "port-1",
        title: "Advance target intelligence brief",
        decisionState: "human_review_required",
        note: "Uses personal brief + usefulness signals — not an org portfolio write.",
      },
      {
        id: "port-2",
        title: "Park competitor sketch pending registry source",
        decisionState: "human_review_required",
        note: "No invented success rates or approval status.",
      },
    ],
    governanceNote:
      "Company-confidential programmes are never auto-shared. Collaboration requests stay permission-aware. Demonstration counts are not portfolio truth.",
    collaborationNote:
      "A biotech scientist can request collaboration with a university lab or clinical research team without exposing confidential portfolios or patient records.",
  };
}
