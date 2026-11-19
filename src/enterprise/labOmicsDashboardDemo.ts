/**
 * Laboratory & Omics Dashboard — demonstration fixtures (Stage 4 shell D).
 *
 * Lab chrome over the shared science engine. Missing assay fields stay explicit.
 * No fake QC scores, invented feature counts, or unmeasured integration %.
 * Multi-omics rows remain candidate / unreviewed. Not CDS; no PHI.
 */

import {
  ENTERPRISE_HONESTY,
  assertEnterpriseDemoHonesty,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
} from "./enterpriseDashboardDemo";

export const LAB_OMICS_DASHBOARD_DEMO_SCHEMA =
  "hsi-lab-omics-dashboard-demo-1" as const;

export type LabAssayField = {
  id: string;
  label: string;
  value: string | null;
  missingExplicit: boolean;
};

export type LabAssayDemo = {
  id: string;
  name: string;
  modalityHint: string;
  fields: readonly LabAssayField[];
  methodsHonesty: string;
};

export type LabComparisonDemo = {
  id: string;
  title: string;
  verificationBound: true;
  note: string;
  nextSurface: string;
};

export type LabOmicsCandidate = {
  id: string;
  label: string;
  domains: readonly string[];
  reviewStatus: "candidate_unreviewed";
  note: string;
};

export type LabReproducibilityCheck = {
  id: string;
  label: string;
  status: "verification_pending" | "dual_model_available" | "retraction_flag_none";
  fakeQcScore: false;
  note: string;
};

export type LabPathwayMap = {
  id: string;
  title: string;
  honesty: "demo_or_source_linked_only";
  nextSurface: string;
};

export type LabEvidenceIntegration = {
  id: string;
  title: string;
  integrationQualityPercent: null;
  inventedFeatureCount: false;
  note: string;
  nextSurface: string;
};

export type LabOmicsDashboardDemo = {
  schemaVersion: typeof LAB_OMICS_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  programmeName: string;
  summary: {
    assayCount: number;
    comparisonCount: number;
    omicsCandidateCount: number;
    pathwayMapCount: number;
    labelsAreDemonstration: true;
    fakeQcScores: false;
  };
  assays: readonly LabAssayDemo[];
  comparisons: readonly LabComparisonDemo[];
  omicsCandidates: readonly LabOmicsCandidate[];
  reproducibility: readonly LabReproducibilityCheck[];
  pathways: readonly LabPathwayMap[];
  evidenceIntegration: readonly LabEvidenceIntegration[];
  opportunities: readonly EnterpriseOpportunity[];
  governanceNote: string;
};

export function labOmicsDashboardDemo(): LabOmicsDashboardDemo {
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  return {
    schemaVersion: LAB_OMICS_DASHBOARD_DEMO_SCHEMA,
    honesty,
    programmeName: "Laboratory & omics (demonstration)",
    summary: {
      assayCount: 2,
      comparisonCount: 2,
      omicsCandidateCount: 3,
      pathwayMapCount: 2,
      labelsAreDemonstration: true,
      fakeQcScores: false,
    },
    assays: [
      {
        id: "assay-1",
        name: "Bulk RNA-seq sketch (demo)",
        modalityHint: "Transcriptomics",
        methodsHonesty: "Methods fields incomplete until passport is filled on live brief.",
        fields: [
          { id: "f-lib", label: "Library prep", value: "stated_demo", missingExplicit: false },
          { id: "f-depth", label: "Sequencing depth", value: null, missingExplicit: true },
          { id: "f-batch", label: "Batch covariates", value: null, missingExplicit: true },
        ],
      },
      {
        id: "assay-2",
        name: "Proteomics panel sketch (demo)",
        modalityHint: "Proteomics",
        methodsHonesty: "Missing fields stay explicit — never invented.",
        fields: [
          { id: "f-plat", label: "Platform", value: "stated_demo", missingExplicit: false },
          { id: "f-norm", label: "Normalisation", value: null, missingExplicit: true },
        ],
      },
    ],
    comparisons: [
      {
        id: "cmp-1",
        title: "Structured experiment comparison (verification-bound)",
        verificationBound: true,
        note: "Open science study comparison — no unverified delta claims.",
        nextSurface: "/science/study-comparison",
      },
      {
        id: "cmp-2",
        title: "Methods honesty check",
        verificationBound: true,
        note: "Deep-link to methods sharing surface for stated gaps.",
        nextSurface: "/research/methods",
      },
    ],
    omicsCandidates: [
      {
        id: "omics-1",
        label: "Cross-domain transcript ↔ pathway candidate",
        domains: ["Transcriptomics", "Pathways"],
        reviewStatus: "candidate_unreviewed",
        note: "Not scientific gold — open domain KG / workspace.",
      },
      {
        id: "omics-2",
        label: "Protein abundance ↔ phenotype sketch",
        domains: ["Proteomics", "Phenotype"],
        reviewStatus: "candidate_unreviewed",
        note: "Association candidate only.",
      },
      {
        id: "omics-3",
        label: "Multi-omics integration placeholder",
        domains: ["Multi-omics"],
        reviewStatus: "candidate_unreviewed",
        note: "No invented integration quality %.",
      },
    ],
    reproducibility: [
      {
        id: "rep-1",
        label: "Dual-model verification availability",
        status: "dual_model_available",
        fakeQcScore: false,
        note: "Use live investigation verification fields — no fabricated QC score.",
      },
      {
        id: "rep-2",
        label: "Retraction / integrity flags",
        status: "retraction_flag_none",
        fakeQcScore: false,
        note: "Flags only when source-linked; none invented here.",
      },
      {
        id: "rep-3",
        label: "Reproducibility status",
        status: "verification_pending",
        fakeQcScore: false,
        note: "Pending human / dual-model check — not a pass percentage.",
      },
    ],
    pathways: [
      {
        id: "path-1",
        title: "Pathway mapping (research view)",
        honesty: "demo_or_source_linked_only",
        nextSurface: "/science/paths",
      },
      {
        id: "path-2",
        title: "GSEA-style research sketch",
        honesty: "demo_or_source_linked_only",
        nextSurface: "/science/paths",
      },
    ],
    evidenceIntegration: [
      {
        id: "ev-1",
        title: "Workspace evidence → brief",
        integrationQualityPercent: null,
        inventedFeatureCount: false,
        note: "Deep-link Stage 2 trail — no measured integration % in this shell.",
        nextSurface: "/research/workspace",
      },
    ],
    opportunities: [
      {
        id: "lab-gap-1",
        question: "Which assay metadata fields are still missing before comparison is trustworthy?",
        entities: ["Assay metadata", "Methods honesty"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Missing fields listed explicitly above.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "High until passport fields are stated.",
        nextInvestigation: "/research/methods",
        reviewStatus: "candidate_unreviewed",
      },
      {
        id: "lab-gap-2",
        question: "Does dual-model verification change confidence for the focus omics claim?",
        entities: ["Reproducibility", "Context Passport"],
        supportingEvidence: "Open live investigation for verification fields.",
        experimentalContext: "Fail-closed — not scientific gold.",
        conflictingEvidence: "Structured disagreement remains candidate.",
        uncertainty: "Human Gate C only.",
        nextInvestigation: "/research/workspace",
        reviewStatus: "candidate_unreviewed",
      },
    ],
    governanceNote:
      "Laboratory chrome only — not a separate science stack. No fake QC scores, invented feature counts, or unmeasured integration quality. Multi-omics rows stay candidate / unreviewed. Not CDS; no PHI.",
  };
}
