/**
 * Phase 2 Demo Research Universe — five domain scenarios sharing the catalog.
 * Fully synthetic comparison pairs + one curated bibliographic claim each.
 * Not scientifically reviewed. No production graph writes.
 */
import { buildScenarioBundle } from "./buildScenarioBundle";
import type { DemoUniverseBundle } from "../types";

const COMMON_LIMITATIONS = [
  "Comparison studies are fully synthetic fixtures for UI teaching.",
  "Verified publications contribute bibliographic metadata only; abstracts are not reproduced.",
  "Independent scientific review has not occurred.",
  "Not clinical advice; no patient data; cannot write to the production graph.",
] as const;

const BIBLIO_CTX = {
  model: "Bibliographic association context",
  tissue: "Not extracted from abstract in this demo",
  species: "Not extracted",
  exposure: "Not stated",
  endpoint: "Bibliographic link only",
  notes: "Attached to verified public metadata; no passage-level claims.",
} as const;

export const IMMUNE_INFLAMMATION_BUNDLE: DemoUniverseBundle = buildScenarioBundle({
  scenarioId: "immune-inflammation",
  investigationId: "DEMO-INV-002",
  projectId: "DEMO-PROJECT-002",
  domain: "immune-inflammation",
  domainIds: ["immune-inflammation", "disease-mechanisms"],
  title: "Cytokine programmes and myeloid signalling conflict",
  question:
    "How do conflicting cytokine and myeloid readouts shape an inflammation investigation without declaring a winner?",
  sharedNodeIds: [
    "DEMO-NODE-macrophage",
    "DEMO-NODE-cytokine",
    "DEMO-NODE-tnf",
    "DEMO-NODE-il6",
    "DEMO-NODE-tcell",
  ],
  mechanismNodeIds: [
    "DEMO-NODE-macrophage",
    "DEMO-NODE-cytokine",
    "DEMO-NODE-tnf",
    "DEMO-NODE-il6",
    "DEMO-NODE-tcell",
    "DEMO-NODE-ra",
  ],
  ownerId: "DEMO-RESEARCHER-002",
  organisationId: "DEMO-ORG-001",
  leadResearcherId: "DEMO-RESEARCHER-002",
  projectTitle: "Inflammation context comparison (demo)",
  idPrefix: "I",
  contexts: [
    {
      model: "Human PBMC cytokine panel (synthetic study I-A)",
      tissue: "Peripheral blood mononuclear cells",
      species: "Human (in vitro)",
      exposure: "Simulated low-dose stimulus A",
      endpoint: "IL-6 proxy readout",
      notes: "Fully synthetic experimental context.",
    },
    {
      model: "Synthetic synovial explant (synthetic study I-B)",
      tissue: "Synovial tissue",
      species: "Mouse (synthetic)",
      exposure: "Simulated high-dose stimulus A",
      endpoint: "Tissue TNF marker",
      notes: "Incompatible model vs I-A — teaches context comparison.",
    },
    BIBLIO_CTX,
  ],
  syntheticPair: {
    subjectNodeId: "DEMO-NODE-macrophage",
    objectNodeId: "DEMO-NODE-cytokine",
    supportsSummary:
      "Synthetic Study I-A reports a lower IL-6 proxy after simulated low-dose stimulus A in human PBMC. This is not a real experiment.",
    conflictsSummary:
      "Synthetic Study I-B reports a higher tissue TNF marker after simulated high-dose stimulus A in synovial explant. Model, dose and endpoint differ.",
    supportsLabel: "−19% (simulated)",
    conflictsLabel: "+22% (simulated)",
    supportsDirection: "lower",
    conflictsDirection: "higher",
    comparisonTitle: "Case I — PBMC cytokine panel vs synovial explant",
    whyTheyDiffer: [
      "Species/model: human PBMC culture vs synthetic mouse synovial explant",
      "Tissue: peripheral blood vs synovium",
      "Exposure: simulated low dose vs simulated high dose",
      "Endpoint: IL-6 proxy vs tissue TNF marker",
    ],
    abstention:
      "HSI demo abstains from ranking cytokine programmes. Context incompatibility is the teaching outcome.",
  },
  curatedClaim: {
    publicationId: "DEMO-PUB-002",
    subjectNodeId: "DEMO-NODE-tnf",
    objectNodeId: "DEMO-NODE-ra",
    predicate: "TNF pathway bibliographic association kept distinct from causation",
    summary:
      "Anti-TNF bibliographic metadata illustrates a separate inflammatory pathway association. It does not approve a demo edge as biology.",
    polarity: "limits",
    missingFields: ["Matched myeloid endpoints", "Dose–response", "Human interventional bridge"],
  },
  insufficientClaim: {
    subjectNodeId: "DEMO-NODE-il6",
    objectNodeId: "DEMO-NODE-tcell",
    predicate: "insufficient evidence for IL-6 → T-cell programme claim in this demo",
    summary:
      "No demo fixture establishes a causal IL-6 → T-cell programme edge. The gap is intentional for abstention behaviour.",
    missingFields: ["Human interventional evidence", "Subset phenotyping", "Confounders"],
  },
  edges: [
    {
      fromNodeId: "DEMO-NODE-macrophage",
      toNodeId: "DEMO-NODE-cytokine",
      predicate: "candidate myeloid influence on cytokine readout",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0, 1],
      uncertainty: "Opposite simulated directions under incompatible contexts; candidate only.",
    },
    {
      fromNodeId: "DEMO-NODE-tnf",
      toNodeId: "DEMO-NODE-ra",
      predicate: "bibliographic pathway association (illustrative)",
      provenance: "curated_demonstration_interpretation",
      claimIndexes: [2],
      uncertainty: "Bibliographic relevance only; not a treatment or target ranking.",
    },
    {
      fromNodeId: "DEMO-NODE-il6",
      toNodeId: "DEMO-NODE-tcell",
      predicate: "hypothesised IL-6 contribution to T-cell programme",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [3],
      uncertainty: "Insufficient evidence — edge retained to show abstention.",
    },
  ],
  gaps: [
    {
      text: "No matched human design in this demo links myeloid stimulus dose to both IL-6 and TNF endpoints.",
      relatedNodeIds: ["DEMO-NODE-macrophage", "DEMO-NODE-cytokine", "DEMO-NODE-tnf"],
    },
    {
      text: "Synthetic Study I-A and I-B cannot be pooled: model, tissue, dose and endpoint all differ.",
      relatedNodeIds: ["DEMO-NODE-cytokine", "DEMO-NODE-ra"],
    },
  ],
  hypothesis: {
    text: "In a matched human PBMC and synovial design, a defined stimulus may associate with coherent myeloid–cytokine readouts. This hypothesis is unvalidated and not a treatment recommendation.",
    supportingIndexes: [0, 2],
    opposingIndexes: [1, 3],
    proposedExperiment:
      "Pre-register a matched human observational or explant study with shared stimulus reporting, myeloid and cytokine endpoints, and explicit non-comparability rules for animal synovial assays.",
  },
  briefTitle: "Demo brief — cytokine programmes and myeloid signalling",
  limitations: COMMON_LIMITATIONS,
  nextDecisions: [
    "Treat conflicting synthetic results as a context-comparison exercise, not a winner.",
    "Do not promote the insufficient IL-6 → T-cell edge until stronger evidence exists.",
    "If moving beyond demo mode, replace synthetic studies with licensed source-linked records and human review.",
  ],
});

export const NEUROIMMUNE_SIGNALLING_BUNDLE: DemoUniverseBundle = buildScenarioBundle({
  scenarioId: "neuroimmune-signalling",
  investigationId: "DEMO-INV-003",
  projectId: "DEMO-PROJECT-003",
  domain: "neuroscience",
  domainIds: ["neuroscience", "immune-inflammation", "microbiome-metabolism"],
  title: "Microglia, barrier interface and gut–brain bibliographic context",
  question:
    "How should conflicting microglial readouts be held beside gut–brain bibliographic metadata without over-claiming?",
  sharedNodeIds: [
    "DEMO-NODE-microglia",
    "DEMO-NODE-blood-brain",
    "DEMO-NODE-synuclein",
    "DEMO-NODE-gut",
    "DEMO-NODE-cytokine",
  ],
  mechanismNodeIds: [
    "DEMO-NODE-microglia",
    "DEMO-NODE-blood-brain",
    "DEMO-NODE-synuclein",
    "DEMO-NODE-gut",
    "DEMO-NODE-cytokine",
  ],
  ownerId: "DEMO-RESEARCHER-001",
  organisationId: "DEMO-ORG-001",
  leadResearcherId: "DEMO-RESEARCHER-002",
  projectTitle: "Neuroimmune context comparison (demo)",
  idPrefix: "N",
  contexts: [
    {
      model: "Synthetic microglial culture (study N-A)",
      tissue: "Primary microglia (synthetic)",
      species: "Mouse (synthetic)",
      exposure: "Simulated inflammatory challenge low",
      endpoint: "Microglial activation proxy",
      notes: "Fully synthetic experimental context.",
    },
    {
      model: "Synthetic barrier co-culture (study N-B)",
      tissue: "Blood–brain barrier interface",
      species: "Human cell line (synthetic)",
      exposure: "Simulated inflammatory challenge high",
      endpoint: "Barrier permeability marker",
      notes: "Incompatible model vs N-A.",
    },
    BIBLIO_CTX,
  ],
  syntheticPair: {
    subjectNodeId: "DEMO-NODE-microglia",
    objectNodeId: "DEMO-NODE-cytokine",
    supportsSummary:
      "Synthetic Study N-A reports a lower microglial activation proxy after a simulated low inflammatory challenge. This is not a real experiment.",
    conflictsSummary:
      "Synthetic Study N-B reports a higher barrier permeability marker after a simulated high challenge. Cell system and endpoint differ from N-A.",
    supportsLabel: "−15% (simulated)",
    conflictsLabel: "+27% (simulated)",
    supportsDirection: "lower",
    conflictsDirection: "higher",
    comparisonTitle: "Case N — microglia culture vs barrier co-culture",
    whyTheyDiffer: [
      "Model: synthetic primary microglia vs barrier co-culture",
      "Species/system: mouse synthetic vs human cell line synthetic",
      "Exposure: low vs high simulated challenge",
      "Endpoint: microglial activation proxy vs permeability marker",
    ],
    abstention:
      "HSI demo abstains from declaring which neuroimmune readout is “correct”. Context mismatch is the teaching outcome.",
  },
  curatedClaim: {
    publicationId: "DEMO-PUB-001",
    subjectNodeId: "DEMO-NODE-gut",
    objectNodeId: "DEMO-NODE-synuclein",
    predicate: "bibliographic relevance to gut–neuroinflammation context (unreviewed)",
    summary:
      "Verified publication metadata is relevant to gut microbiota and neuroinflammation. No abstract text is reproduced; directionality is not approved biology.",
    polarity: "supports",
    missingFields: ["Tissue extraction", "Dose", "Human metabolic bridge", "Endpoint extraction"],
  },
  insufficientClaim: {
    subjectNodeId: "DEMO-NODE-blood-brain",
    objectNodeId: "DEMO-NODE-synuclein",
    predicate: "insufficient evidence for barrier → α-synuclein claim in this demo",
    summary:
      "No demo fixture establishes a causal barrier-interface → α-synuclein edge. Abstention is intentional.",
    missingFields: ["Human interventional evidence", "Matched kinetics", "Confounders"],
  },
  edges: [
    {
      fromNodeId: "DEMO-NODE-microglia",
      toNodeId: "DEMO-NODE-cytokine",
      predicate: "candidate microglial influence on inflammatory readout",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0, 1],
      uncertainty: "Opposite simulated directions under incompatible contexts.",
    },
    {
      fromNodeId: "DEMO-NODE-gut",
      toNodeId: "DEMO-NODE-synuclein",
      predicate: "bibliographic gut–neuroinflammation relevance (illustrative)",
      provenance: "curated_demonstration_interpretation",
      claimIndexes: [2],
      uncertainty: "Bibliographic relevance only; optional sealed refs not copied here.",
      sealedGraphEdgeIdRef: "HSI-C-GUT-001",
    },
    {
      fromNodeId: "DEMO-NODE-blood-brain",
      toNodeId: "DEMO-NODE-synuclein",
      predicate: "hypothesised barrier contribution to synuclein context",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [3],
      uncertainty: "Insufficient evidence — retained for abstention teaching.",
    },
  ],
  gaps: [
    {
      text: "No demo fixture matches microglial and barrier endpoints under one exposure protocol.",
      relatedNodeIds: ["DEMO-NODE-microglia", "DEMO-NODE-blood-brain"],
    },
    {
      text: "Gut–brain bibliographic metadata must not be treated as a causal metabolite or drug ranking.",
      relatedNodeIds: ["DEMO-NODE-gut", "DEMO-NODE-synuclein"],
    },
  ],
  hypothesis: {
    text: "In a matched neuroimmune design, coordinated microglial and barrier readouts may clarify when gut–brain bibliographic context is relevant. Unvalidated; not clinical advice.",
    supportingIndexes: [0, 2],
    opposingIndexes: [1, 3],
    proposedExperiment:
      "Pre-register a multi-model neuroimmune study with shared exposure reporting, microglial and barrier endpoints, and explicit rules against pooling incompatible systems.",
  },
  briefTitle: "Demo brief — neuroimmune signalling conflict",
  limitations: COMMON_LIMITATIONS,
  nextDecisions: [
    "Keep bibliographic gut–brain relevance separate from synthetic microglial conflicts.",
    "Do not promote the insufficient barrier → synuclein edge.",
    "Replace synthetic studies with licensed records before any scientific review.",
  ],
  relatedCuratedDisagreementCaseId: "gut-treg-vs-scfa-th17",
});

export const SINGLE_CELL_OMICS_BUNDLE: DemoUniverseBundle = buildScenarioBundle({
  scenarioId: "single-cell-omics",
  investigationId: "DEMO-INV-004",
  projectId: "DEMO-PROJECT-004",
  domain: "genomics-multi-omics",
  domainIds: ["genomics-multi-omics", "immune-inflammation"],
  title: "scRNA-seq cluster labels under conflicting assay contexts",
  question:
    "How should conflicting single-cell cluster annotations be compared without inventing validated cell-state biology?",
  sharedNodeIds: [
    "DEMO-NODE-scrnaseq",
    "DEMO-NODE-tcell",
    "DEMO-NODE-macrophage",
    "DEMO-NODE-cytokine",
    "DEMO-NODE-tnf",
  ],
  mechanismNodeIds: [
    "DEMO-NODE-scrnaseq",
    "DEMO-NODE-tcell",
    "DEMO-NODE-macrophage",
    "DEMO-NODE-cytokine",
    "DEMO-NODE-il6",
    "DEMO-NODE-tnf",
  ],
  ownerId: "DEMO-RESEARCHER-003",
  organisationId: "DEMO-ORG-002",
  leadResearcherId: "DEMO-RESEARCHER-003",
  projectTitle: "Single-cell annotation conflict (demo)",
  idPrefix: "S",
  contexts: [
    {
      model: "Synthetic droplet scRNA-seq (study S-A)",
      tissue: "PBMC dissociate (synthetic)",
      species: "Human (synthetic)",
      exposure: "Simulated mild stimulation",
      endpoint: "Cluster abundance — T-cell programme label",
      notes: "Fully synthetic cluster counts.",
    },
    {
      model: "Synthetic plate-based scRNA-seq (study S-B)",
      tissue: "Tissue digest (synthetic)",
      species: "Mouse (synthetic)",
      exposure: "Simulated strong stimulation",
      endpoint: "Cluster abundance — myeloid programme label",
      notes: "Incompatible chemistry and tissue vs S-A.",
    },
    BIBLIO_CTX,
  ],
  syntheticPair: {
    subjectNodeId: "DEMO-NODE-scrnaseq",
    objectNodeId: "DEMO-NODE-tcell",
    supportsSummary:
      "Synthetic Study S-A reports a lower labelled T-cell programme cluster fraction after mild stimulation. Invented counts only.",
    conflictsSummary:
      "Synthetic Study S-B reports a higher myeloid programme cluster fraction after strong stimulation in a different chemistry and species. Not comparable to S-A.",
    supportsLabel: "−12% cluster share (simulated)",
    conflictsLabel: "+31% cluster share (simulated)",
    supportsDirection: "lower",
    conflictsDirection: "higher",
    comparisonTitle: "Case S — droplet PBMC vs plate tissue digest",
    whyTheyDiffer: [
      "Chemistry: droplet vs plate-based synthetic scRNA-seq",
      "Tissue: PBMC vs tissue digest",
      "Species: human synthetic vs mouse synthetic",
      "Endpoint: T-cell programme label vs myeloid programme label",
    ],
    abstention:
      "HSI demo abstains from declaring a ground-truth cell state. Annotation conflict under mismatched assays is the teaching outcome.",
  },
  curatedClaim: {
    publicationId: "DEMO-PUB-002",
    subjectNodeId: "DEMO-NODE-tnf",
    objectNodeId: "DEMO-NODE-cytokine",
    predicate: "TNF bibliographic association kept outside cluster-label causation",
    summary:
      "Anti-TNF bibliographic metadata is kept as a separate inflammatory pathway association. It does not validate scRNA-seq cluster labels.",
    polarity: "limits",
    missingFields: ["Single-cell assay bridge", "Cluster ontology mapping"],
  },
  insufficientClaim: {
    subjectNodeId: "DEMO-NODE-scrnaseq",
    objectNodeId: "DEMO-NODE-il6",
    predicate: "insufficient evidence for cluster label → IL-6 pathway claim",
    summary:
      "No demo fixture establishes a causal scRNA-seq annotation → IL-6 pathway edge.",
    missingFields: ["Matched protein validation", "Batch controls", "Independent replication"],
  },
  edges: [
    {
      fromNodeId: "DEMO-NODE-scrnaseq",
      toNodeId: "DEMO-NODE-tcell",
      predicate: "candidate cluster annotation of T-cell programme",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0, 1],
      uncertainty: "Label conflict under incompatible assays; candidate only.",
    },
    {
      fromNodeId: "DEMO-NODE-macrophage",
      toNodeId: "DEMO-NODE-cytokine",
      predicate: "candidate myeloid programme linked to cytokine context",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [1],
      uncertainty: "Derived from synthetic Study S-B only.",
    },
    {
      fromNodeId: "DEMO-NODE-scrnaseq",
      toNodeId: "DEMO-NODE-il6",
      predicate: "hypothesised annotation link to IL-6 pathway",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [3],
      uncertainty: "Insufficient evidence — abstention edge.",
    },
  ],
  gaps: [
    {
      text: "No cross-chemistry, cross-species mapping is provided for cluster labels in this demo.",
      relatedNodeIds: ["DEMO-NODE-scrnaseq", "DEMO-NODE-tcell", "DEMO-NODE-macrophage"],
    },
    {
      text: "Bibliographic TNF association must not be used to validate single-cell annotations.",
      relatedNodeIds: ["DEMO-NODE-tnf", "DEMO-NODE-scrnaseq"],
    },
  ],
  hypothesis: {
    text: "Matched human multi-chemistry scRNA-seq with protein validation may reduce annotation conflict. Unvalidated; not a biomarker claim.",
    supportingIndexes: [0],
    opposingIndexes: [1, 3],
    proposedExperiment:
      "Pre-register a multi-assay single-cell study with shared ontology, protein confirmation and explicit non-pooling of incompatible chemistries.",
  },
  briefTitle: "Demo brief — single-cell annotation conflict",
  limitations: COMMON_LIMITATIONS,
  nextDecisions: [
    "Treat cluster-share deltas as simulated teaching numbers, not biology.",
    "Do not promote the insufficient annotation → IL-6 edge.",
    "Keep TNF bibliographic metadata outside omics validation claims.",
  ],
});

export const TISSUE_REMODELLING_BUNDLE: DemoUniverseBundle = buildScenarioBundle({
  scenarioId: "tissue-remodelling",
  investigationId: "DEMO-INV-005",
  projectId: "DEMO-PROJECT-005",
  domain: "organ-tissue-biology",
  domainIds: ["organ-tissue-biology", "disease-mechanisms"],
  title: "Fibroblast activation and ECM remodelling conflict",
  question:
    "How do conflicting fibroblast and ECM readouts illustrate tissue-remodelling uncertainty without claiming fibrosis efficacy?",
  sharedNodeIds: [
    "DEMO-NODE-fibroblast",
    "DEMO-NODE-ecm",
    "DEMO-NODE-tgfb",
    "DEMO-NODE-adipose",
    "DEMO-NODE-ssc",
    "DEMO-NODE-tnf",
  ],
  mechanismNodeIds: [
    "DEMO-NODE-fibroblast",
    "DEMO-NODE-ecm",
    "DEMO-NODE-tgfb",
    "DEMO-NODE-adipose",
    "DEMO-NODE-ssc",
    "DEMO-NODE-tnf",
  ],
  ownerId: "DEMO-RESEARCHER-003",
  organisationId: "DEMO-ORG-002",
  leadResearcherId: "DEMO-RESEARCHER-003",
  projectTitle: "Tissue remodelling context comparison (demo)",
  idPrefix: "T",
  contexts: [
    {
      model: "Synthetic fibroblast monolayer (study T-A)",
      tissue: "Dermal fibroblast culture",
      species: "Human (in vitro synthetic)",
      exposure: "Simulated low TGF-β cue",
      endpoint: "Activation marker proxy",
      notes: "Fully synthetic.",
    },
    {
      model: "Synthetic adipose ECM assay (study T-B)",
      tissue: "Adipose stroma",
      species: "Mouse (synthetic)",
      exposure: "Simulated high TGF-β cue",
      endpoint: "ECM deposition marker",
      notes: "Incompatible tissue and species vs T-A.",
    },
    BIBLIO_CTX,
  ],
  syntheticPair: {
    subjectNodeId: "DEMO-NODE-fibroblast",
    objectNodeId: "DEMO-NODE-ecm",
    supportsSummary:
      "Synthetic Study T-A reports a lower fibroblast activation proxy after a simulated low TGF-β cue. Not a real assay.",
    conflictsSummary:
      "Synthetic Study T-B reports higher ECM deposition after a simulated high TGF-β cue in adipose stroma. Not comparable to T-A.",
    supportsLabel: "−21% (simulated)",
    conflictsLabel: "+29% (simulated)",
    supportsDirection: "lower",
    conflictsDirection: "higher",
    comparisonTitle: "Case T — fibroblast monolayer vs adipose ECM assay",
    whyTheyDiffer: [
      "Tissue: dermal fibroblast culture vs adipose stroma",
      "Species: human synthetic vs mouse synthetic",
      "Exposure: low vs high simulated TGF-β cue",
      "Endpoint: activation marker vs ECM deposition marker",
    ],
    abstention:
      "HSI demo abstains from ranking remodelling interventions. Context incompatibility is the teaching outcome.",
  },
  curatedClaim: {
    publicationId: "DEMO-PUB-002",
    subjectNodeId: "DEMO-NODE-tnf",
    objectNodeId: "DEMO-NODE-ssc",
    predicate: "inflammatory bibliographic association kept distinct from fibrosis causation",
    summary:
      "Anti-TNF bibliographic metadata is kept separate from fibroblast–ECM causation. It does not rank a fibrosis target.",
    polarity: "limits",
    missingFields: ["Fibroblast assay bridge", "ECM endpoint extraction"],
  },
  insufficientClaim: {
    subjectNodeId: "DEMO-NODE-tgfb",
    objectNodeId: "DEMO-NODE-ssc",
    predicate: "insufficient evidence for TGF-β → SSc phenotype claim in this demo",
    summary:
      "No demo fixture establishes a causal TGF-β → systemic sclerosis phenotype edge.",
    missingFields: ["Human interventional evidence", "Matched tissue kinetics"],
  },
  edges: [
    {
      fromNodeId: "DEMO-NODE-fibroblast",
      toNodeId: "DEMO-NODE-ecm",
      predicate: "candidate fibroblast contribution to ECM remodelling",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0, 1],
      uncertainty: "Opposite simulated directions under incompatible contexts.",
    },
    {
      fromNodeId: "DEMO-NODE-tgfb",
      toNodeId: "DEMO-NODE-fibroblast",
      predicate: "candidate TGF-β cue to fibroblast activation",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0, 1],
      uncertainty: "Cue dose and tissue differ across synthetic studies.",
    },
    {
      fromNodeId: "DEMO-NODE-tgfb",
      toNodeId: "DEMO-NODE-ssc",
      predicate: "hypothesised pathway contribution to fibrosis phenotype",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [3],
      uncertainty: "Insufficient evidence — abstention edge.",
    },
  ],
  gaps: [
    {
      text: "No matched human design links fibroblast activation and ECM deposition under one TGF-β protocol.",
      relatedNodeIds: ["DEMO-NODE-fibroblast", "DEMO-NODE-ecm", "DEMO-NODE-tgfb"],
    },
    {
      text: "SSc phenotype language in this demo is illustrative only — not a diagnostic or efficacy claim.",
      relatedNodeIds: ["DEMO-NODE-ssc"],
    },
  ],
  hypothesis: {
    text: "A matched human fibroblast–ECM design with shared TGF-β reporting may clarify remodelling conflict. Unvalidated; not a treatment recommendation.",
    supportingIndexes: [0],
    opposingIndexes: [1, 3],
    proposedExperiment:
      "Pre-register a human tissue study with matched fibroblast and ECM endpoints, dose reporting, and explicit non-pooling of adipose animal assays.",
  },
  briefTitle: "Demo brief — tissue remodelling conflict",
  limitations: COMMON_LIMITATIONS,
  nextDecisions: [
    "Do not treat simulated ECM deltas as fibrosis efficacy.",
    "Keep TNF bibliographic metadata outside TGF-β → SSc claims.",
    "Promote abstention on insufficient TGF-β → SSc edge.",
  ],
});

export const COMPARATIVE_DISEASE_MECHANISMS_BUNDLE: DemoUniverseBundle = buildScenarioBundle({
  scenarioId: "comparative-disease-mechanisms",
  investigationId: "DEMO-INV-006",
  projectId: "DEMO-PROJECT-006",
  domain: "disease-mechanisms",
  domainIds: ["disease-mechanisms", "immune-inflammation", "organ-tissue-biology"],
  title: "RA vs SSc mechanism comparison under shared inflammation nodes",
  question:
    "How can RA and SSc phenotype contexts share inflammatory nodes while keeping disease claims non-causal and unreviewed?",
  sharedNodeIds: [
    "DEMO-NODE-ra",
    "DEMO-NODE-ssc",
    "DEMO-NODE-tnf",
    "DEMO-NODE-il6",
    "DEMO-NODE-fibroblast",
    "DEMO-NODE-cytokine",
  ],
  mechanismNodeIds: [
    "DEMO-NODE-ra",
    "DEMO-NODE-ssc",
    "DEMO-NODE-tnf",
    "DEMO-NODE-il6",
    "DEMO-NODE-fibroblast",
    "DEMO-NODE-cytokine",
  ],
  ownerId: "DEMO-RESEARCHER-002",
  organisationId: "DEMO-ORG-001",
  leadResearcherId: "DEMO-RESEARCHER-002",
  projectTitle: "Comparative disease mechanisms (demo)",
  idPrefix: "D",
  contexts: [
    {
      model: "Synthetic RA synovial panel (study D-A)",
      tissue: "Synovial fluid / tissue proxy",
      species: "Human (synthetic)",
      exposure: "Simulated inflammatory flare low",
      endpoint: "Cytokine composite — RA-labelled",
      notes: "Fully synthetic phenotype-labelled readout.",
    },
    {
      model: "Synthetic SSc dermal panel (study D-B)",
      tissue: "Dermal fibroblast-rich biopsy proxy",
      species: "Human (synthetic)",
      exposure: "Simulated inflammatory flare high",
      endpoint: "Fibroblast activation — SSc-labelled",
      notes: "Different tissue and phenotype label vs D-A.",
    },
    BIBLIO_CTX,
  ],
  syntheticPair: {
    subjectNodeId: "DEMO-NODE-cytokine",
    objectNodeId: "DEMO-NODE-ra",
    supportsSummary:
      "Synthetic Study D-A reports a lower RA-labelled cytokine composite after a simulated low flare. Invented phenotype label only.",
    conflictsSummary:
      "Synthetic Study D-B reports a higher SSc-labelled fibroblast activation after a simulated high flare. Tissue and phenotype differ — not a head-to-head disease ranking.",
    supportsLabel: "−17% (simulated)",
    conflictsLabel: "+25% (simulated)",
    supportsDirection: "lower",
    conflictsDirection: "higher",
    comparisonTitle: "Case D — RA synovial panel vs SSc dermal panel",
    whyTheyDiffer: [
      "Phenotype label: RA-labelled cytokine composite vs SSc-labelled fibroblast activation",
      "Tissue: synovial proxy vs dermal biopsy proxy",
      "Exposure: low vs high simulated flare",
      "Shared inflammatory vocabulary does not make the studies comparable",
    ],
    abstention:
      "HSI demo abstains from ranking RA vs SSc mechanisms. Shared nodes are for navigation, not causal equivalence.",
  },
  curatedClaim: {
    publicationId: "DEMO-PUB-002",
    subjectNodeId: "DEMO-NODE-tnf",
    objectNodeId: "DEMO-NODE-ra",
    predicate: "TNF bibliographic association with RA context (limits over-claim)",
    summary:
      "Anti-TNF bibliographic metadata illustrates an RA-relevant pathway association. It does not equate RA and SSc mechanisms or approve a target.",
    polarity: "limits",
    missingFields: ["SSc bridge", "Head-to-head design", "Fibroblast endpoints"],
  },
  insufficientClaim: {
    subjectNodeId: "DEMO-NODE-il6",
    objectNodeId: "DEMO-NODE-ssc",
    predicate: "insufficient evidence for IL-6 → SSc phenotype claim",
    summary:
      "No demo fixture establishes a causal IL-6 → SSc phenotype edge across disease contexts.",
    missingFields: ["Matched cross-disease design", "Human interventional evidence"],
  },
  edges: [
    {
      fromNodeId: "DEMO-NODE-cytokine",
      toNodeId: "DEMO-NODE-ra",
      predicate: "candidate inflammatory association with RA-labelled context",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [0],
      uncertainty: "Synthetic RA-labelled readout only.",
    },
    {
      fromNodeId: "DEMO-NODE-fibroblast",
      toNodeId: "DEMO-NODE-ssc",
      predicate: "candidate fibroblast association with SSc-labelled context",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [1],
      uncertainty: "Synthetic SSc-labelled readout only; not comparable to D-A.",
    },
    {
      fromNodeId: "DEMO-NODE-tnf",
      toNodeId: "DEMO-NODE-ra",
      predicate: "bibliographic TNF–RA association (illustrative)",
      provenance: "curated_demonstration_interpretation",
      claimIndexes: [2],
      uncertainty: "Bibliographic only; not cross-disease causation.",
    },
    {
      fromNodeId: "DEMO-NODE-il6",
      toNodeId: "DEMO-NODE-ssc",
      predicate: "hypothesised IL-6 contribution to SSc phenotype",
      provenance: "fully_synthetic_fixture",
      claimIndexes: [3],
      uncertainty: "Insufficient evidence — abstention edge.",
    },
  ],
  gaps: [
    {
      text: "Shared inflammatory nodes do not authorise pooling RA and SSc synthetic panels.",
      relatedNodeIds: ["DEMO-NODE-ra", "DEMO-NODE-ssc", "DEMO-NODE-cytokine"],
    },
    {
      text: "No head-to-head human design in this demo compares RA and SSc under matched exposures.",
      relatedNodeIds: ["DEMO-NODE-tnf", "DEMO-NODE-il6"],
    },
  ],
  hypothesis: {
    text: "A matched cross-disease observational design may clarify when shared inflammatory nodes diverge between RA and SSc contexts. Unvalidated; not diagnostic or therapeutic advice.",
    supportingIndexes: [0, 2],
    opposingIndexes: [1, 3],
    proposedExperiment:
      "Pre-register a cross-disease study with matched exposure reporting, disease-specific endpoints, and explicit non-equivalence rules for shared mechanism nodes.",
  },
  briefTitle: "Demo brief — comparative disease mechanisms",
  limitations: COMMON_LIMITATIONS,
  nextDecisions: [
    "Navigate shared nodes without equating RA and SSc causation.",
    "Keep TNF bibliographic limits visible beside synthetic conflicts.",
    "Abstain on insufficient IL-6 → SSc edge.",
  ],
});

export const PHASE2_BUNDLES: readonly DemoUniverseBundle[] = [
  IMMUNE_INFLAMMATION_BUNDLE,
  NEUROIMMUNE_SIGNALLING_BUNDLE,
  SINGLE_CELL_OMICS_BUNDLE,
  TISSUE_REMODELLING_BUNDLE,
  COMPARATIVE_DISEASE_MECHANISMS_BUNDLE,
];
