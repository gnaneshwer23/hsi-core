export type Status = "Prototype" | "In development" | "Planned" | "Illustrative";

export const nav = [
  {
    label: "Platform",
    items: [
      {
        label: "Scientific Memory Engine",
        to: "/platform/memory",
        desc: "Persistent, permissioned research memory",
      },
      {
        label: "Scientific AI Agents",
        to: "/platform/agents",
        desc: "Specialised agents that collaborate",
      },
      {
        label: "Contradiction Analysis",
        to: "/platform/contradiction-analysis",
        desc: "Evaluate conflicting evidence",
      },
      {
        label: "Research Workbench",
        to: "/platform/workbench",
        desc: "Interactive investigation preview",
      },
      {
        label: "Knowledge Graph",
        to: "/platform/knowledge-graph",
        desc: "Evidence-linked biological relations",
      },
      {
        label: "Discovery Engine",
        to: "/platform/discovery-engine",
        desc: "Gaps, hypotheses, experiment drafts",
      },
      {
        label: "Scientific Companion",
        to: "/platform/companion",
        desc: "Conversational, cited answers",
      },
    ],
  },
  {
    label: "Science",
    items: [
      { label: "Six scientific domains", to: "/science", desc: "Immunology to disease mechanisms" },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        label: "Solutions by research user",
        to: "/solutions",
        desc: "Students, labs, PIs, R&D, clinical",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Data Sources", to: "/data-sources", desc: "Connected and planned integrations" },
      { label: "Trust & Governance", to: "/trust", desc: "Provenance, uncertainty, oversight" },
      { label: "Early Access", to: "/early-access", desc: "Start a pilot request" },
    ],
  },
] as const;

export const domains = [
  {
    key: "immunology",
    name: "Immunology",
    color: "primary",
    summary: "Immune cell states, cytokine signalling, tolerance and inflammation across tissues.",
    questions: [
      "How do microbial metabolites tune regulatory T cell differentiation?",
      "Which checkpoint pathways diverge between tumour and chronic infection?",
    ],
    ids: ["FOXP3", "IL-10", "PD-L1"],
  },
  {
    key: "neuroscience",
    name: "Neuroscience",
    color: "helix",
    summary: "Neural circuits, glial biology, neuroinflammation and neurodegeneration.",
    questions: [
      "What evidence links microglial activation to early Parkinsonian pathology?",
      "How consistent are α-synuclein propagation models across species?",
    ],
    ids: ["SNCA", "TREM2", "LRRK2"],
  },
  {
    key: "microbiome",
    name: "Microbiome & Metabolism",
    color: "verify",
    summary: "Host–microbe interactions, metabolite signalling and systemic metabolic regulation.",
    questions: [
      "Which short-chain fatty acids show reproducible anti-inflammatory effects?",
      "Where do germ-free and human cohort findings disagree?",
    ],
    ids: ["SCFA", "GPR43", "AhR"],
  },
  {
    key: "genomics",
    name: "Genomics & Multi-omics",
    color: "helix",
    summary: "Variants, expression, epigenetic regulation and integrated omic layers.",
    questions: [
      "Which eQTLs co-localise with autoimmune risk loci?",
      "How do single-cell and bulk signatures reconcile?",
    ],
    ids: ["rs3761847", "HLA-DRB1", "scRNA-seq"],
  },
  {
    key: "organ",
    name: "Organ & Tissue Biology",
    color: "primary",
    summary: "Tissue architecture, organ crosstalk, regeneration and barrier function.",
    questions: [
      "How does intestinal barrier integrity relate to systemic inflammation?",
      "Which organoid findings translate to in vivo tissue?",
    ],
    ids: ["ZO-1", "LGR5", "CLDN2"],
  },
  {
    key: "disease",
    name: "Disease Mechanisms",
    color: "signal",
    summary: "Mechanistic pathways connecting molecular events to disease phenotypes.",
    questions: [
      "What mechanisms drive acquired PD-L1 resistance in NSCLC?",
      "Which inflammatory pathways are shared across IBD and Parkinson's disease?",
    ],
    ids: ["NSCLC", "IBD", "PD"],
  },
] as const;

export const agents = [
  {
    name: "Literature Synthesis",
    role: "Retrieves and summarises authorised literature with passage-level citations.",
    status: "Prototype" as Status,
  },
  {
    name: "Evidence Verification",
    role: "Checks claims against source passages, retractions and study design.",
    status: "In development" as Status,
  },
  {
    name: "Contradiction Detection",
    role: "Surfaces conflicting findings and the contextual variables behind them.",
    status: "In development" as Status,
  },
  {
    name: "Hypothesis Generation",
    role: "Proposes testable mechanistic hypotheses grounded in mapped evidence.",
    status: "Prototype" as Status,
  },
  {
    name: "Experimental Design",
    role: "Drafts experiment options, controls and readouts for expert review.",
    status: "Planned" as Status,
  },
  {
    name: "Multi-omics Correlation",
    role: "Relates findings across genomic, transcriptomic and metabolomic layers.",
    status: "Planned" as Status,
  },
];

export const personas = [
  {
    key: "students",
    name: "Students & Early Researchers",
    pain: "Overwhelming literature and unclear consensus.",
    value: [
      "Guided evidence maps for unfamiliar fields",
      "Transparent citations to learn from",
      "Investigation history that grows with your thesis",
    ],
  },
  {
    key: "postdocs",
    name: "Postdocs & Staff Scientists",
    pain: "Context lost between projects and departures.",
    value: [
      "Persistent memory of protocols and decisions",
      "Contradiction checks before committing to experiments",
      "Faster literature updates on your targets",
    ],
  },
  {
    key: "pis",
    name: "PIs & Laboratory Directors",
    pain: "Institutional knowledge walks out of the door.",
    value: [
      "Lab-wide memory with permission controls",
      "Gap analysis to inform grant strategy",
      "Oversight of evidence behind team conclusions",
    ],
  },
  {
    key: "departments",
    name: "Departments & Research Centres",
    pain: "Siloed groups duplicating effort.",
    value: [
      "Cross-group synthesis within institutional boundaries",
      "Data isolation per group or project",
      "Shared evidence standards",
    ],
  },
  {
    key: "rnd",
    name: "Biotech & Pharma R&D",
    pain: "Target decisions made on incomplete evidence.",
    value: [
      "Target evidence dossiers with uncertainty",
      "Mechanistic hypothesis exploration",
      "Traceable reasoning for review boards",
    ],
  },
  {
    key: "clinical",
    name: "Translational & Clinical Researchers",
    pain: "Gap between bench mechanisms and patient evidence.",
    value: [
      "Mechanism-to-trial evidence linking",
      "ClinicalTrials.gov context",
      "Explicit flags where human evidence is missing",
    ],
  },
];

export const sources: { name: string; type: string; status: Status }[] = [
  { name: "PubMed", type: "Literature", status: "Prototype" },
  { name: "Europe PMC", type: "Literature", status: "Planned" },
  { name: "OpenAlex", type: "Scholarly graph", status: "Planned" },
  { name: "Crossref", type: "Metadata & retractions", status: "Planned" },
  { name: "ClinicalTrials.gov", type: "Clinical", status: "Planned" },
  { name: "Open Targets", type: "Target evidence", status: "Planned" },
  { name: "UniProt", type: "Proteins", status: "Planned" },
  { name: "Reactome", type: "Pathways", status: "Planned" },
  { name: "Ensembl", type: "Genomes", status: "Planned" },
  { name: "GEO", type: "Expression data", status: "Planned" },
  { name: "Human Protein Atlas", type: "Tissue expression", status: "Planned" },
];
