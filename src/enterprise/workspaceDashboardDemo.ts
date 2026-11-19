/**
 * HSI multi-workspace dashboard demonstration catalog.
 *
 * Eight role views share one scientific intelligence engine. All counts,
 * profiles and opportunities are illustrative. Clinical cohort features stay
 * disabled. Roles ≠ subscriptions — enterprise admin does not unlock
 * confidential science.
 */

import {
  ENTERPRISE_HONESTY,
  type EnterpriseHonesty,
  type EnterpriseOpportunity,
  type EnterpriseTreeNode,
  assertEnterpriseDemoHonesty,
  enterpriseProfessorDemo,
  enterpriseStudentDemo,
} from "./enterpriseDashboardDemo";

export const WORKSPACE_DASHBOARD_DEMO_SCHEMA =
  "hsi-workspace-dashboard-demo-1" as const;

export type WorkspaceId =
  | "researcher"
  | "professor"
  | "student"
  | "biotech"
  | "clinical"
  | "laboratory"
  | "community"
  | "enterprise";

export type WorkspaceModule = {
  id: string;
  label: string;
};

export type WorkspaceDefinition = {
  id: WorkspaceId;
  label: string;
  shortLabel: string;
  tagline: string;
  audience: string;
  modules: readonly WorkspaceModule[];
  /** Delivery priority from stakeholder doctrine (1 = first). */
  buildPriority: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Clinical / PHI cohort UI must stay off until governance. */
  clinicalCohortsEnabled: false;
  /** Enterprise admin never auto-unlocks confidential science. */
  confidentialScienceAutoUnlock: false;
  investigationPath: string;
};

export type WorkspaceStat = {
  id: string;
  value: number;
  label: string;
  honesty: string;
};

export type WorkspaceAiCard = {
  id: string;
  kind: "cross_domain" | "hypothesis" | "discovery";
  title: string;
  body: string;
};

export type WorkspaceDemoPacket = {
  schemaVersion: typeof WORKSPACE_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  workspace: WorkspaceDefinition;
  stats: readonly WorkspaceStat[];
  domains: readonly string[];
  treeNodes: readonly EnterpriseTreeNode[];
  opportunities: readonly EnterpriseOpportunity[];
  aiCards: readonly WorkspaceAiCard[];
  collaborationNote: string;
  governanceNote: string;
};

export const WORKSPACE_DEFINITIONS: readonly WorkspaceDefinition[] = [
  {
    id: "researcher",
    label: "Individual researcher",
    shortLabel: "Researcher",
    tagline: "Personal investigations, gaps and source-linked briefs",
    audience: "Independent researchers and early-career scientists",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "investigations", label: "Investigations" },
      { id: "gaps", label: "Evidence & gaps" },
      { id: "profile", label: "Profile" },
    ],
    buildPriority: 1,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/workspace",
  },
  {
    id: "professor",
    label: "Professor / PI",
    shortLabel: "Professor",
    tagline: "Group intelligence tree, supervision and shared projects",
    audience: "Principal investigators and research group leads",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "tree", label: "Intelligence tree" },
      { id: "team", label: "Team" },
      { id: "opportunities", label: "Opportunities" },
    ],
    buildPriority: 1,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/workspace",
  },
  {
    id: "student",
    label: "Student / postdoc",
    shortLabel: "Student",
    tagline: "Personal research home with group context",
    audience: "PhD, master’s and postdoctoral researchers",
    modules: [
      { id: "overview", label: "My research" },
      { id: "feed", label: "Feed" },
      { id: "alerts", label: "Alerts" },
      { id: "gaps", label: "Gaps" },
    ],
    buildPriority: 1,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/workspace",
  },
  {
    id: "biotech",
    label: "Biotech / pharma R&D",
    shortLabel: "Biotech",
    tagline: "Targets, mechanisms, landscape and portfolio decisions",
    audience: "Discovery, translational and pharmaceutical R&D teams",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "targets", label: "Target intelligence" },
      { id: "landscape", label: "Therapeutic landscape" },
      { id: "gaps", label: "Translational gaps" },
    ],
    buildPriority: 2,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/workspace",
  },
  {
    id: "clinical",
    label: "Clinical research",
    shortLabel: "Clinical",
    tagline: "Approved cohort research — not clinical decision support",
    audience: "Clinician-scientists and clinical research teams",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "phenotypes", label: "Phenotypes" },
      { id: "trials", label: "Trial research" },
      { id: "cohorts", label: "Cohorts (disabled)" },
    ],
    buildPriority: 5,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/cohort",
  },
  {
    id: "laboratory",
    label: "Laboratory / omics",
    shortLabel: "Laboratory",
    tagline: "Experimental context, omics analysis and reproducibility",
    audience: "Experimental scientists, core facilities and bioinformaticians",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "experiments", label: "Experiments" },
      { id: "omics", label: "Omics explorer" },
      { id: "gaps", label: "Evidence & gaps" },
      { id: "collaborations", label: "Collaborations" },
    ],
    buildPriority: 4,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/workspace",
  },
  {
    id: "community",
    label: "Research network",
    shortLabel: "Community",
    tagline: "Circles, shared evidence reviews and scientific challenges",
    audience: "Societies, consortia and interdisciplinary networks",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "circles", label: "Research circles" },
      { id: "reviews", label: "Evidence reviews" },
      { id: "challenges", label: "Challenges" },
    ],
    buildPriority: 6,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/community-feed",
  },
  {
    id: "enterprise",
    label: "University / enterprise",
    shortLabel: "Enterprise",
    tagline: "Organisation administration — roles separate from subscriptions",
    audience: "Research administrators and institutional operators",
    modules: [
      { id: "overview", label: "Overview" },
      { id: "departments", label: "Departments" },
      { id: "access", label: "Access & roles" },
      { id: "subscriptions", label: "Subscriptions" },
    ],
    buildPriority: 3,
    clinicalCohortsEnabled: false,
    confidentialScienceAutoUnlock: false,
    investigationPath: "/research/dashboard",
  },
] as const;

const SHARED_DOMAINS = [
  "Immunology",
  "Genomics",
  "Neuroscience",
  "Microbiome",
  "Tissue biology",
  "Metabolism",
] as const;

const SHARED_AI: readonly WorkspaceAiCard[] = [
  {
    id: "ai-cross",
    kind: "cross_domain",
    title: "Cross-domain mechanism",
    body: "Compare immune signalling, metabolic state and tissue responses under matching experimental contexts — demonstration draft only.",
  },
  {
    id: "ai-hyp",
    kind: "hypothesis",
    title: "Hypothesis",
    body: "Candidate mechanistic question for review. Not a scientific finding; dual-model verification remains separate.",
  },
  {
    id: "ai-disc",
    kind: "discovery",
    title: "Related research groups",
    body: "Discover public research teams with complementary expertise and source-linked publications — illustrative matches only.",
  },
];

function statsFor(id: WorkspaceId): readonly WorkspaceStat[] {
  switch (id) {
    case "researcher":
      return [
        { id: "s1", value: 3, label: "Saved investigations", honesty: "Demo · not durable" },
        { id: "s2", value: 5, label: "Followed concepts", honesty: "Demonstration" },
        { id: "s3", value: 2, label: "Candidate gaps", honesty: "Not live gap ledger" },
        { id: "s4", value: 1, label: "Open briefs", honesty: "Not export-accepted" },
      ];
    case "professor": {
      const p = enterpriseProfessorDemo().summary;
      return [
        { id: "s1", value: p.researcherCount, label: "Group researchers", honesty: "Demonstration" },
        { id: "s2", value: p.topicCount, label: "Research topics", honesty: "Demonstration" },
        { id: "s3", value: p.candidateGapCount, label: "Candidate gaps", honesty: "Not live" },
        {
          id: "s4",
          value: p.crossDomainOpportunityCount,
          label: "Cross-domain opportunities",
          honesty: "Candidate questions",
        },
      ];
    }
    case "student":
      return [
        { id: "s1", value: 1, label: "Active question", honesty: "Demonstration" },
        { id: "s2", value: 4, label: "Interest tags", honesty: "Local demo" },
        { id: "s3", value: 3, label: "Feed items", honesty: "Placeholders" },
        { id: "s4", value: 2, label: "Candidate gaps", honesty: "Not live" },
      ];
    case "biotech":
      return [
        { id: "s1", value: 6, label: "Tracked targets", honesty: "Demonstration" },
        { id: "s2", value: 4, label: "Mechanism maps", honesty: "Candidate" },
        { id: "s3", value: 3, label: "Landscape programmes", honesty: "Public demo" },
        { id: "s4", value: 5, label: "Translational gaps", honesty: "Not portfolio truth" },
      ];
    case "clinical":
      return [
        { id: "s1", value: 0, label: "Approved cohorts", honesty: "Disabled · governance" },
        { id: "s2", value: 2, label: "Phenotype sketches", honesty: "Synthetic only" },
        { id: "s3", value: 3, label: "Trial research links", honesty: "Public metadata" },
        { id: "s4", value: 0, label: "PHI records", honesty: "Always zero here" },
      ];
    case "laboratory":
      return [
        { id: "s1", value: 4, label: "Example assays", honesty: "Demonstration" },
        { id: "s2", value: 3, label: "Omics datasets", honesty: "Demonstration" },
        { id: "s3", value: 5, label: "Context checks", honesty: "Not stated until extracted" },
        { id: "s4", value: 2, label: "Analysis briefs", honesty: "Not Gate C" },
      ];
    case "community":
      return [
        { id: "s1", value: 3, label: "Example circles", honesty: "Demonstration" },
        { id: "s2", value: 2, label: "Shared reviews", honesty: "Not live posts" },
        { id: "s3", value: 1, label: "Open challenges", honesty: "Illustration" },
        { id: "s4", value: 4, label: "Public experts", honesty: "Placeholder profiles" },
      ];
    case "enterprise":
      return [
        { id: "s1", value: 3, label: "Demo departments", honesty: "Not live org chart" },
        { id: "s2", value: 12, label: "Seat illustrations", honesty: "Not billing truth" },
        { id: "s3", value: 0, label: "Confidential unlocks", honesty: "Always zero" },
        { id: "s4", value: 2, label: "Role templates", honesty: "Demonstration" },
      ];
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function opportunitiesFor(id: WorkspaceId): readonly EnterpriseOpportunity[] {
  if (id === "professor" || id === "student" || id === "researcher") {
    return enterpriseProfessorDemo().opportunities;
  }
  if (id === "biotech") {
    return [
      {
        id: "bio-1",
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
        id: "bio-2",
        question: "Where are translational biomarkers under-specified across programmes?",
        entities: ["Biomarkers", "Translational gaps"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Not stated.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Portfolio decisions require human review.",
        nextInvestigation: "/research/workspace",
        reviewStatus: "candidate_unreviewed",
      },
    ];
  }
  if (id === "laboratory") {
    return [
      {
        id: "lab-1",
        question: "Do assay contexts align across omics datasets for the same pathway?",
        entities: ["Assay metadata", "Pathway mapping"],
        supportingEvidence: "Not linked in this demonstration.",
        experimentalContext: "Tissue / dose / model remain Not stated until extracted.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Reproducibility checks are illustrative.",
        nextInvestigation: "/research/methods",
        reviewStatus: "candidate_unreviewed",
      },
    ];
  }
  if (id === "clinical") {
    return [
      {
        id: "clin-1",
        question: "Which synthetic phenotype clusters align with public molecular signatures?",
        entities: ["Phenotypes", "Molecular signatures"],
        supportingEvidence: "Synthetic cohort tools only — no PHI.",
        experimentalContext: "Demonstration.",
        conflictingEvidence: "Not assessed.",
        uncertainty: "Live cohorts remain governance-blocked.",
        nextInvestigation: "/research/cohort",
        reviewStatus: "candidate_unreviewed",
      },
    ];
  }
  return enterpriseProfessorDemo().opportunities.slice(0, 2);
}

function treeFor(id: WorkspaceId): readonly EnterpriseTreeNode[] {
  if (id === "laboratory") {
    return [
      {
        id: "lab-imm",
        label: "Immune signalling assays",
        domain: "Immunology",
        reviewStatus: "candidate",
        uncertainty: "medium",
      },
      {
        id: "lab-gen",
        label: "Bulk and single-cell RNA",
        domain: "Genomics",
        reviewStatus: "candidate",
        uncertainty: "high",
      },
      {
        id: "lab-tis",
        label: "Tissue response panels",
        domain: "Tissue biology",
        reviewStatus: "unreviewed",
        uncertainty: "high",
      },
      {
        id: "lab-met",
        label: "Metabolic state readouts",
        domain: "Metabolism",
        reviewStatus: "candidate",
        uncertainty: "medium",
      },
    ];
  }
  return enterpriseProfessorDemo().treeNodes;
}

function governanceNote(id: WorkspaceId): string {
  switch (id) {
    case "clinical":
      return "Approved cohort analysis stays disabled until governance, security and ethics approval. This is not a clinical decision-making tool. PHI remains out of hsi-core.";
    case "enterprise":
      return "Subscription seats do not grant scientific clearance. University administrators do not gain confidential project data merely because an enterprise contract exists.";
    case "community":
      return "Public posting and participant identity verification are not enabled in this prototype.";
    case "biotech":
      return "Company-confidential programmes are never auto-shared. Collaboration requests stay permission-aware.";
    default:
      return "Demonstration UI only — no production organisation writes, no Gate C auto-approve, no invented MoUs.";
  }
}

function collaborationNote(id: WorkspaceId): string {
  switch (id) {
    case "biotech":
      return "A biotech scientist can request collaboration with a university lab or clinical team without exposing confidential portfolios or patient records.";
    case "laboratory":
      return "Omics analyses can attach to shared investigations when organisations explicitly share approved project scopes.";
    case "clinical":
      return "Only aggregate, approved findings would ever leave a clinical research workspace — never identifiable records from this shell.";
    case "enterprise":
      return "Departments host academic groups; identity and permissions stay separate from commercial subscriptions.";
    default:
      return "Researchers keep a durable scientific identity while joining groups and authorised cross-organisation investigations.";
  }
}

export function listWorkspaceDefinitions(): readonly WorkspaceDefinition[] {
  return WORKSPACE_DEFINITIONS;
}

export function getWorkspaceDefinition(
  id: string,
): WorkspaceDefinition | undefined {
  return WORKSPACE_DEFINITIONS.find((w) => w.id === id);
}

export function isWorkspaceId(value: string): value is WorkspaceId {
  return WORKSPACE_DEFINITIONS.some((w) => w.id === value);
}

/** Build a demonstration packet for one workspace role. */
export function workspaceDemoPacket(id: WorkspaceId): WorkspaceDemoPacket {
  const workspace = getWorkspaceDefinition(id);
  if (!workspace) {
    throw new Error(`unknown workspace id: ${id}`);
  }
  const honesty = assertEnterpriseDemoHonesty(ENTERPRISE_HONESTY);
  if (workspace.clinicalCohortsEnabled !== false) {
    throw new Error("clinical cohorts must stay disabled in workspace demos");
  }
  if (workspace.confidentialScienceAutoUnlock !== false) {
    throw new Error("enterprise must not auto-unlock confidential science");
  }
  return {
    schemaVersion: WORKSPACE_DASHBOARD_DEMO_SCHEMA,
    honesty,
    workspace,
    stats: statsFor(id),
    domains: [...SHARED_DOMAINS],
    treeNodes: treeFor(id),
    opportunities: opportunitiesFor(id),
    aiCards: SHARED_AI,
    collaborationNote: collaborationNote(id),
    governanceNote: governanceNote(id),
  };
}

/** Access-control checks for demonstration shells (fail-closed). */
export function assessWorkspaceAccess(id: WorkspaceId): {
  canViewDemoShell: true;
  canEnableClinicalCohorts: false;
  canAutoUnlockConfidentialScience: false;
  canWriteProductionOrgData: false;
  studentPrivateNotesVisibleToProfessor: false;
} {
  void id;
  return {
    canViewDemoShell: true,
    canEnableClinicalCohorts: false,
    canAutoUnlockConfidentialScience: false,
    canWriteProductionOrgData: false,
    studentPrivateNotesVisibleToProfessor: false,
  };
}

/** Professor/student fixtures remain available to academic shells. */
export function academicFixtures() {
  return {
    professor: enterpriseProfessorDemo(),
    student: enterpriseStudentDemo(),
  };
}
