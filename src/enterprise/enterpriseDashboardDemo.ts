/**
 * HSI Enterprise dashboard demonstration fixtures (PR1 shells).
 *
 * All rows are illustrative. Never treat counts, names, or opportunity text as
 * live evidence, institutional truth, or scientific approval. Persistence and
 * production writes are out of scope for these fixtures.
 */

export const ENTERPRISE_DASHBOARD_DEMO_SCHEMA =
  "hsi-enterprise-dashboard-demo-1" as const;

export type EnterpriseDataClass = "demonstration";

export type EnterpriseHonesty = {
  dataClass: EnterpriseDataClass;
  liveEvidence: false;
  scientificApproval: false;
  productionWritesEnabled: false;
  phiEnabled: false;
  privateNotesAccessibleToProfessor: false;
};

export const ENTERPRISE_HONESTY: EnterpriseHonesty = {
  dataClass: "demonstration",
  liveEvidence: false,
  scientificApproval: false,
  productionWritesEnabled: false,
  phiEnabled: false,
  privateNotesAccessibleToProfessor: false,
};

export type EnterpriseMemberRole =
  | "postdoctoral"
  | "phd"
  | "masters"
  | "principal_investigator";

export type EnterpriseTeamMember = {
  id: string;
  name: string;
  role: EnterpriseMemberRole;
  topic: string;
  projectIds: readonly string[];
};

export type EnterpriseProject = {
  id: string;
  title: string;
  domain: string;
  status: "candidate" | "active_demo";
};

export type EnterpriseTreeNode = {
  id: string;
  label: string;
  domain: string;
  reviewStatus: "candidate" | "unreviewed";
  uncertainty: "high" | "medium" | "stated_absent";
};

export type EnterpriseOpportunity = {
  id: string;
  question: string;
  entities: readonly string[];
  supportingEvidence: string;
  experimentalContext: string;
  conflictingEvidence: string;
  uncertainty: string;
  nextInvestigation: string;
  reviewStatus: "candidate_unreviewed";
};

export type EnterpriseProfessorDemo = {
  schemaVersion: typeof ENTERPRISE_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  groupName: string;
  groupLead: string;
  summary: {
    researcherCount: number;
    topicCount: number;
    candidateGapCount: number;
    crossDomainOpportunityCount: number;
    labelsAreDemonstration: true;
  };
  projects: readonly EnterpriseProject[];
  members: readonly EnterpriseTeamMember[];
  treeNodes: readonly EnterpriseTreeNode[];
  opportunities: readonly EnterpriseOpportunity[];
  cohortPanel: {
    enabled: false;
    title: string;
    explanation: string;
  };
};

export type EnterpriseStudentDemo = {
  schemaVersion: typeof ENTERPRISE_DASHBOARD_DEMO_SCHEMA;
  honesty: EnterpriseHonesty;
  title: string;
  researcherName: string;
  roleLabel: string;
  researchQuestion: string;
  interests: readonly string[];
  supervisor: string;
  groupName: string;
  projects: readonly string[];
  savedInvestigations: readonly { id: string; title: string; status: string }[];
  alerts: readonly { id: string; text: string; kind: "demonstration" }[];
  candidateGaps: readonly string[];
  feedItems: readonly {
    id: string;
    kind: "publication_demo" | "hypothesis_demo" | "programme_demo";
    title: string;
    whyMatches: string;
  }[];
};

const PROJECTS: readonly EnterpriseProject[] = [
  {
    id: "proj-fibroblast",
    title: "Fibroblast activation in SSc skin",
    domain: "Fibrosis",
    status: "active_demo",
  },
  {
    id: "proj-cd40",
    title: "CD40/CD40L signalling",
    domain: "Immune signalling",
    status: "active_demo",
  },
  {
    id: "proj-bcell",
    title: "B-cell biology and autoantibodies",
    domain: "B-cell biology",
    status: "candidate",
  },
  {
    id: "proj-scrna",
    title: "Single-cell transcriptomics atlas",
    domain: "Genomics",
    status: "candidate",
  },
];

const MEMBERS: readonly EnterpriseTeamMember[] = [
  {
    id: "m-pd1",
    name: "Dr. Amira Hassan",
    role: "postdoctoral",
    topic: "Fibroblast activation",
    projectIds: ["proj-fibroblast"],
  },
  {
    id: "m-pd2",
    name: "Dr. Luca Bianchi",
    role: "postdoctoral",
    topic: "Immune signalling",
    projectIds: ["proj-cd40"],
  },
  {
    id: "m-phd1",
    name: "Elena Vargas",
    role: "phd",
    topic: "CD40/CD40L",
    projectIds: ["proj-cd40"],
  },
  {
    id: "m-phd2",
    name: "Noah Okonkwo",
    role: "phd",
    topic: "B-cell biology",
    projectIds: ["proj-bcell"],
  },
  {
    id: "m-phd3",
    name: "Sofia Berg",
    role: "phd",
    topic: "Autoantibodies",
    projectIds: ["proj-bcell"],
  },
  {
    id: "m-msc1",
    name: "Jamie Cole",
    role: "masters",
    topic: "Biomarkers",
    projectIds: ["proj-scrna"],
  },
  {
    id: "m-msc2",
    name: "Priya Nair",
    role: "masters",
    topic: "Single-cell transcriptomics",
    projectIds: ["proj-scrna"],
  },
];

const TREE_NODES: readonly EnterpriseTreeNode[] = [
  {
    id: "n-ssc",
    label: "Systemic sclerosis",
    domain: "Disease",
    reviewStatus: "candidate",
    uncertainty: "medium",
  },
  {
    id: "n-immuno",
    label: "Immunology",
    domain: "Immunology",
    reviewStatus: "unreviewed",
    uncertainty: "medium",
  },
  {
    id: "n-cd4",
    label: "CD4+ T-cell subsets",
    domain: "Immunology",
    reviewStatus: "candidate",
    uncertainty: "high",
  },
  {
    id: "n-bcell",
    label: "B-cell biology",
    domain: "Immunology",
    reviewStatus: "candidate",
    uncertainty: "medium",
  },
  {
    id: "n-cd40",
    label: "CD40/CD40L signalling",
    domain: "Immune signalling",
    reviewStatus: "candidate",
    uncertainty: "high",
  },
  {
    id: "n-fibrosis",
    label: "Fibrosis",
    domain: "Fibrosis",
    reviewStatus: "unreviewed",
    uncertainty: "medium",
  },
  {
    id: "n-vascular",
    label: "Vascular biology",
    domain: "Vascular",
    reviewStatus: "candidate",
    uncertainty: "high",
  },
  {
    id: "n-microbiome",
    label: "Gut microbiome",
    domain: "Microbiome",
    reviewStatus: "candidate",
    uncertainty: "high",
  },
  {
    id: "n-neuro",
    label: "Neuroimmune biology",
    domain: "Neuroimmune",
    reviewStatus: "unreviewed",
    uncertainty: "stated_absent",
  },
  {
    id: "n-omics",
    label: "Genomics and transcriptomics",
    domain: "Genomics",
    reviewStatus: "candidate",
    uncertainty: "medium",
  },
];

const OPPORTUNITIES: readonly EnterpriseOpportunity[] = [
  {
    id: "opp-micro-cd4",
    question:
      "Do microbiome metabolites modulate CD4+ T-cell signalling in systemic sclerosis?",
    entities: ["Gut microbiome", "CD4+ T-cell subsets", "Systemic sclerosis"],
    supportingEvidence: "Not linked in this demonstration — open a live investigation.",
    experimentalContext: "Not stated in demonstration fixtures.",
    conflictingEvidence: "Not assessed in demonstration fixtures.",
    uncertainty: "High — candidate question only.",
    nextInvestigation: "/research/workspace",
    reviewStatus: "candidate_unreviewed",
  },
  {
    id: "opp-bcell-fibro",
    question:
      "How might B-cell biology relate to fibroblast activation in SSc skin?",
    entities: ["B-cell biology", "Fibroblast activation", "Fibrosis"],
    supportingEvidence: "Not linked in this demonstration — inspect Context Passport on live edges.",
    experimentalContext: "Tissue and dose remain Not stated until extracted.",
    conflictingEvidence: "Not assessed in demonstration fixtures.",
    uncertainty: "High — mechanistic hypothesis is not causal proof.",
    nextInvestigation: "/research/knowledge-graph",
    reviewStatus: "candidate_unreviewed",
  },
  {
    id: "opp-neuro-vasc",
    question:
      "Is neuroimmune signalling associated with vascular dysfunction in SSc?",
    entities: ["Neuroimmune biology", "Vascular biology"],
    supportingEvidence: "Not linked in this demonstration.",
    experimentalContext: "Not stated.",
    conflictingEvidence: "Not assessed.",
    uncertainty: "Stated absent in demo tree — do not invent coverage.",
    nextInvestigation: "/research/workspace",
    reviewStatus: "candidate_unreviewed",
  },
  {
    id: "opp-mol-clin",
    question:
      "Which molecular profiles align with clinical phenotypes under review gates?",
    entities: ["Transcriptomics", "Clinical phenotypes"],
    supportingEvidence: "Synthetic cohort tools exist separately; PHI remains disabled.",
    experimentalContext: "Demonstration only — no patient identifiers.",
    conflictingEvidence: "Not assessed.",
    uncertainty: "Blocked on governance — cohort panel stays disabled.",
    nextInvestigation: "/research/cohort",
    reviewStatus: "candidate_unreviewed",
  },
];

/** Professor dashboard demonstration packet. */
export function enterpriseProfessorDemo(): EnterpriseProfessorDemo {
  return {
    schemaVersion: ENTERPRISE_DASHBOARD_DEMO_SCHEMA,
    honesty: ENTERPRISE_HONESTY,
    groupName: "Autoimmune Disease Research Unit",
    groupLead: "Prof. Claudia Lunardi",
    summary: {
      researcherCount: MEMBERS.length,
      topicCount: PROJECTS.length,
      candidateGapCount: 3,
      crossDomainOpportunityCount: OPPORTUNITIES.length,
      labelsAreDemonstration: true,
    },
    projects: PROJECTS,
    members: MEMBERS,
    treeNodes: TREE_NODES,
    opportunities: OPPORTUNITIES,
    cohortPanel: {
      enabled: false,
      title: "Patient research cohorts (disabled)",
      explanation:
        "Approved, pseudonymised datasets could eventually connect laboratory findings to phenotypes. Identifiable uploads, live clinical records and PHI processing stay off until separate governance, security and ethics approval.",
    },
  };
}

/** Student dashboard demonstration packet. */
export function enterpriseStudentDemo(): EnterpriseStudentDemo {
  return {
    schemaVersion: ENTERPRISE_DASHBOARD_DEMO_SCHEMA,
    honesty: ENTERPRISE_HONESTY,
    title: "CD40/CD40L signalling in systemic sclerosis",
    researcherName: "Elena Vargas",
    roleLabel: "PhD researcher",
    researchQuestion:
      "How does CD40/CD40L signalling relate to immune and fibrotic programmes in systemic sclerosis?",
    interests: [
      "CD40/CD40L",
      "Systemic sclerosis",
      "Immune signalling",
      "Experimental context",
    ],
    supervisor: "Prof. Claudia Lunardi",
    groupName: "Autoimmune Disease Research Unit",
    projects: ["CD40/CD40L signalling"],
    savedInvestigations: [
      {
        id: "inv-demo-1",
        title: "CD40L and fibroblast crosstalk (demonstration)",
        status: "candidate · not saved durably in this shell",
      },
    ],
    alerts: [
      {
        id: "al-1",
        text: "Demonstration alert — live digests require held migration 023 and owner enablement.",
        kind: "demonstration",
      },
    ],
    candidateGaps: [
      "Tissue context often Not stated in abstracts",
      "Independence of dual-model checks remains unverified",
    ],
    feedItems: [
      {
        id: "f1",
        kind: "publication_demo",
        title: "Demonstration: relevant paper placeholder",
        whyMatches: "Matches interest keywords CD40/CD40L — not a live literature pull.",
      },
      {
        id: "f2",
        kind: "hypothesis_demo",
        title: "AI-generated hypothesis placeholder",
        whyMatches: "Labelled AI draft — not a reviewed scientific finding.",
      },
      {
        id: "f3",
        kind: "programme_demo",
        title: "Public research programme placeholder",
        whyMatches: "Matches disease focus systemic sclerosis — demonstration only.",
      },
    ],
  };
}

export function assertEnterpriseDemoHonesty(
  honesty: EnterpriseHonesty,
): EnterpriseHonesty {
  if (honesty.dataClass !== "demonstration") {
    throw new Error("enterprise demo must remain demonstration-class");
  }
  if (
    honesty.liveEvidence !== false ||
    honesty.scientificApproval !== false ||
    honesty.productionWritesEnabled !== false ||
    honesty.phiEnabled !== false ||
    honesty.privateNotesAccessibleToProfessor !== false
  ) {
    throw new Error("enterprise demo must keep fail-closed honesty flags");
  }
  return honesty;
}
