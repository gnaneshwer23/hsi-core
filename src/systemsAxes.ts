/**
 * Multi-axis systems vision stubs — regenerable entity / predicate registries.
 *
 * Binding user intent: whole immune + gut–immune + brain–immune + diseases /
 * tissues / biomarkers + patient-data connections + AI / future tech.
 *
 * Honesty:
 * - "All" is the **target graph**, not one sprint.
 * - These are vocabulary / navigation stubs — not Gate C claims, not CDS.
 * - Every future claim edge still needs context + evidence + grades.
 * - Does **not** wipe RA Stage 1 lock or invent partnerSigned.
 * - No live PHI ingestion; patient-data plane is Stage 3+ / HITL / Akeno.
 *
 * See docs/HSI_SYSTEMS_VISION_MAP.md.
 */
import type { HsiEdgeType } from "./schema";
import {
  DISEASE_VERTICAL_STUBS,
  IMMUNE_CELL_SPINE_NODES,
  ISI_CONTROLLED_RELATIONSHIP_TYPES,
  ISI_RELATIONSHIP_TO_HSI_EDGE,
  buildImmuneCellSpineBundle,
  type DiseaseVerticalStub,
  type ImmuneCellSpineNode,
  type IsiControlledRelationshipType,
} from "./immuneCellSpine";
import {
  getVerticalDecision,
  verticalDecisionExportPointer,
  type HsiVerticalDecision,
} from "./verticalDecision";

export const SYSTEMS_VISION_SCHEMA = "hsi-systems-vision-1" as const;

/** High-level graph domains in the systems vision. */
export const SYSTEMS_GRAPH_DOMAINS = [
  "immune_cell_spine",
  "gut_microbiome_immune",
  "neuroimmune_brain_immune",
  "disease_tissue_biomarker",
  "patient_data_connections",
  "ai_future_tech",
] as const;
export type SystemsGraphDomain = (typeof SYSTEMS_GRAPH_DOMAINS)[number];

export const SYSTEMS_STAGE_GATES = ["stage1", "stage2", "stage3"] as const;
export type SystemsStageGate = (typeof SYSTEMS_STAGE_GATES)[number];

export type SystemsOwner =
  | "hsi"
  | "isi_product"
  | "aksh_hitl"
  | "akeno_clinical"
  | "shared_policy";

export type SystemsDomainOwnership = {
  domain: SystemsGraphDomain;
  label: string;
  hsiOwns: string;
  isiOwns: string;
  akshAkenoOwns: string;
  earliestStage: SystemsStageGate;
  deepSeedsPresent: boolean;
  notes: string;
};

/**
 * Ownership map: HSI = evidence grades / edges / provenance;
 * ISI = discovery UX; Aksh/Akeno = clinical HITL (gated).
 */
export const SYSTEMS_DOMAIN_OWNERSHIP: readonly SystemsDomainOwnership[] = [
  {
    domain: "immune_cell_spine",
    label: "Immune cell spine",
    hsiOwns:
      "Cell class/lineage/subset vocabulary, controlled relation types, graded claim edges, Gate C artifacts",
    isiOwns: "Cell-first explorer / neighbourhood UX / compare mode (consumes exports)",
    akshAkenoOwns: "No Stage 1 clinical surface on spine alone",
    earliestStage: "stage1",
    deepSeedsPresent: false,
    notes:
      "Vocabulary stubs in immuneCellSpine.ts; RA pathway seeds exist separately under partnerLock",
  },
  {
    domain: "gut_microbiome_immune",
    label: "Gut microbiome ↔ immune",
    hsiOwns:
      "Microbiome entity classes, gut–immune predicates, hypothesis-capable grades, provenance",
    isiOwns: "Discovery overlays / Ask–Radar for gut–immune neighbourhoods",
    akshAkenoOwns: "No live microbiome PHI; clinical translation only Stage 3+ HITL",
    earliestStage: "stage2",
    deepSeedsPresent: false,
    notes: "Entity + predicate stubs only — no curated claim edges yet",
  },
  {
    domain: "neuroimmune_brain_immune",
    label: "Neuroimmune / brain–immune",
    hsiOwns:
      "Brain-region / axis entity types, brain–immune predicates, evidence grades",
    isiOwns: "Discovery UX for neuroimmune pathways",
    akshAkenoOwns: "No neurological CDS from research packs",
    earliestStage: "stage2",
    deepSeedsPresent: false,
    notes: "Stubs only; every edge still needs context + evidence",
  },
  {
    domain: "disease_tissue_biomarker",
    label: "Diseases, tissues, biomarkers / LOINC",
    hsiOwns:
      "Disease/tissue/biomarker axis placeholders, LOINC marker links, MONDO/UBERON hints later",
    isiOwns: "Disease overlay UX; filter/compare",
    akshAkenoOwns: "HITL marker cards when cdsSurfacable; never invent LOINC",
    earliestStage: "stage1",
    deepSeedsPresent: true,
    notes:
      "RA/TNF + T2D markers partially seeded; tissue/disease axis stubs expand the catalog without SSc pivot",
  },
  {
    domain: "patient_data_connections",
    label: "Patient-data connections",
    hsiOwns:
      "Observation stubs (fixture/deid only), translation handoff shapes, what HSI never stores",
    isiOwns: "Research-only; no identifiable patients in product first release",
    akshAkenoOwns: "Stage 3+ HITL / partner TRE / Akeno — live PHI never in hsi-core",
    earliestStage: "stage3",
    deepSeedsPresent: false,
    notes:
      "HSI stores shapes + synthetic fixtures only; never raw PHI, EHR write-back, or live cohort ingest",
  },
  {
    domain: "ai_future_tech",
    label: "AI & future technology",
    hsiOwns:
      "Adapter registry metadata, AI capabilities/hard bans, model-proposal + embedding-slot schemas, ban on auto-promoting hsiGrade from model output",
    isiOwns: "Agent workbench runtime (Stage 2+); research plugins UX",
    akshAkenoOwns: "Care agents stay separate; no generative chem → clinic path",
    earliestStage: "stage2",
    deepSeedsPresent: false,
    notes:
      "AF3/Boltz/ESM/OpenMM/RDKit/REINVENT/TDC = P3 research adapters — see VISION_REPO_ALIGNMENT.md + HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
] as const;

// ── Gut microbiome entity classes ───────────────────────────────────────────

export const GUT_MICROBIOME_ENTITY_CLASSES = [
  "taxon",
  "community",
  "metabolite",
  "barrier_compartment",
  "mucosal_immune_interface",
] as const;
export type GutMicrobiomeEntityClass =
  (typeof GUT_MICROBIOME_ENTITY_CLASSES)[number];

export type GutMicrobiomeEntityStub = {
  id: string;
  entityClass: GutMicrobiomeEntityClass;
  label: string;
  /** Optional ontology hint (NCBI Taxon, ChEBI, UBERON, …) — null until curated. */
  ontologyHint: string | null;
  notes: string | null;
};

export const GUT_MICROBIOME_ENTITY_STUBS: readonly GutMicrobiomeEntityStub[] = [
  {
    id: "HSI-GM-taxon-placeholder",
    entityClass: "taxon",
    label: "Gut taxon (placeholder)",
    ontologyHint: "NCBITaxon",
    notes: "Navigation stub — not a species claim",
  },
  {
    id: "HSI-GM-community-placeholder",
    entityClass: "community",
    label: "Gut microbial community (placeholder)",
    ontologyHint: null,
    notes: "Dysbiosis / diversity frames need context + evidence per edge",
  },
  {
    id: "HSI-GM-metabolite-scfa",
    entityClass: "metabolite",
    label: "Short-chain fatty acid (class stub)",
    ontologyHint: "ChEBI",
    notes: "Common gut–immune mediator class — no disease claim edges yet",
  },
  {
    id: "HSI-GM-barrier-epithelium",
    entityClass: "barrier_compartment",
    label: "Intestinal epithelial barrier",
    ontologyHint: "UBERON",
    notes: null,
  },
  {
    id: "HSI-GM-interface-galt",
    entityClass: "mucosal_immune_interface",
    label: "Gut-associated lymphoid tissue (GALT)",
    ontologyHint: "UBERON",
    notes: "Bridge toward immune-cell spine (Peyer’s / MLN neighbourhood later)",
  },
] as const;

// ── Neuroimmune / brain–immune entity types ─────────────────────────────────

export const NEUROIMMUNE_ENTITY_TYPES = [
  "brain_region",
  "cns_compartment",
  "neuroimmune_axis",
  "glial_or_barrier_cell",
  "neuro_mediator",
] as const;
export type NeuroimmuneEntityType = (typeof NEUROIMMUNE_ENTITY_TYPES)[number];

export type NeuroimmuneEntityStub = {
  id: string;
  entityType: NeuroimmuneEntityType;
  label: string;
  ontologyHint: string | null;
  notes: string | null;
};

export const NEUROIMMUNE_ENTITY_STUBS: readonly NeuroimmuneEntityStub[] = [
  {
    id: "HSI-NI-region-hypothalamus",
    entityType: "brain_region",
    label: "Hypothalamus",
    ontologyHint: "UBERON",
    notes: "HPA-axis neighbourhood stub",
  },
  {
    id: "HSI-NI-compartment-bbb",
    entityType: "cns_compartment",
    label: "Blood–brain barrier",
    ontologyHint: "UBERON",
    notes: null,
  },
  {
    id: "HSI-NI-compartment-csf",
    entityType: "cns_compartment",
    label: "Cerebrospinal fluid",
    ontologyHint: "UBERON",
    notes: null,
  },
  {
    id: "HSI-NI-axis-hpa",
    entityType: "neuroimmune_axis",
    label: "HPA axis",
    ontologyHint: null,
    notes: "Axis stub — edges must carry context (stress, inflammation, disease)",
  },
  {
    id: "HSI-NI-axis-vagus",
    entityType: "neuroimmune_axis",
    label: "Vagus / cholinergic anti-inflammatory path (stub)",
    ontologyHint: null,
    notes: "Hypothesis-capable neighbourhood — not established claim edges",
  },
  {
    id: "HSI-NI-cell-microglia",
    entityType: "glial_or_barrier_cell",
    label: "Microglia",
    ontologyHint: "CL",
    notes: "CNS-resident myeloid — linkable later to immune-cell spine myeloid class",
  },
  {
    id: "HSI-NI-mediator-cytokine-cns",
    entityType: "neuro_mediator",
    label: "CNS cytokine / chemokine (class stub)",
    ontologyHint: null,
    notes: null,
  },
] as const;

// ── Disease / tissue / biomarker axis placeholders ──────────────────────────

export const DISEASE_TISSUE_BIOMARKER_LAYERS = [
  "disease",
  "tissue",
  "biomarker",
] as const;
export type DiseaseTissueBiomarkerLayer =
  (typeof DISEASE_TISSUE_BIOMARKER_LAYERS)[number];

export type DiseaseTissueBiomarkerStub = {
  id: string;
  layer: DiseaseTissueBiomarkerLayer;
  label: string;
  /** MONDO / UBERON / LOINC hint — null until curated. */
  ontologyHint: string | null;
  /** Ties to partnerLock / vertical stubs when known. */
  verticalId: string | null;
  notes: string | null;
};

export const DISEASE_TISSUE_BIOMARKER_STUBS: readonly DiseaseTissueBiomarkerStub[] =
  [
    {
      id: "HSI-DTB-disease-ra",
      layer: "disease",
      label: "Rheumatoid arthritis",
      ontologyHint: "MONDO",
      verticalId: "ra",
      notes: "Stage 1 scopeLocked vertical — deep seeds present elsewhere",
    },
    {
      id: "HSI-DTB-disease-ssc",
      layer: "disease",
      label: "Systemic sclerosis",
      ontologyHint: "MONDO",
      verticalId: "ssc",
      notes: "PRD MVP target — dual-track thin seeds present; do not wipe RA",
    },
    {
      id: "HSI-DTB-tissue-synovium",
      layer: "tissue",
      label: "Synovium / synovial joint",
      ontologyHint: "UBERON",
      verticalId: "ra",
      notes: "Tissue axis placeholder for RA neighbourhood",
    },
    {
      id: "HSI-DTB-tissue-gut-mucosa",
      layer: "tissue",
      label: "Intestinal mucosa",
      ontologyHint: "UBERON",
      verticalId: null,
      notes: "Shared with gut–immune axis",
    },
    {
      id: "HSI-DTB-tissue-cns",
      layer: "tissue",
      label: "Central nervous system (tissue stub)",
      ontologyHint: "UBERON",
      verticalId: null,
      notes: "Shared with neuroimmune axis",
    },
    {
      id: "HSI-DTB-biomarker-loinc-slot",
      layer: "biomarker",
      label: "Assay / LOINC-linked biomarker (slot)",
      ontologyHint: "LOINC",
      verticalId: null,
      notes:
        "Concrete LOINC codes live in markers.ts; this is the axis placeholder for catalog expansion",
    },
  ] as const;

// ── Cross-axis relationship predicates ──────────────────────────────────────

/**
 * Gut–immune and brain–immune predicates.
 * Prefer hypothesized_to / associates_with grades until evidence is curated.
 * Mapped to nearest Phase 0 HSI_EDGE_TYPES (same pattern as ISI_CONTROLLED_RELATIONSHIP_TYPES).
 */
export const SYSTEMS_CROSS_AXIS_PREDICATES = [
  // Gut ↔ immune
  "modulates_immune",
  "produces_metabolite_sensed_by",
  "compromises_barrier",
  "recruits_to_mucosa",
  "cross_reacts_with",
  // Brain ↔ immune
  "signals_via_axis",
  "crosses_bbb",
  "activates_glia",
  "suppresses_peripheral_inflammation",
  "associates_neuroimmune",
  // Shared hypothesis / measurement
  "hypothesized_gut_immune",
  "hypothesized_brain_immune",
  "measured_in_compartment",
] as const;

export type SystemsCrossAxisPredicate =
  (typeof SYSTEMS_CROSS_AXIS_PREDICATES)[number];

export const SYSTEMS_PREDICATE_TO_HSI_EDGE: Record<
  SystemsCrossAxisPredicate,
  HsiEdgeType
> = {
  modulates_immune: "associated_with",
  produces_metabolite_sensed_by: "upregulates",
  compromises_barrier: "worsens",
  recruits_to_mucosa: "associated_with",
  cross_reacts_with: "associated_with",
  signals_via_axis: "bridges_domain",
  crosses_bbb: "associated_with",
  activates_glia: "upregulates",
  suppresses_peripheral_inflammation: "inhibits",
  associates_neuroimmune: "associated_with",
  hypothesized_gut_immune: "associated_with",
  hypothesized_brain_immune: "associated_with",
  measured_in_compartment: "biomarker_of",
};

/** Predicates that must default to hypothesis / uncertain teaching until curated. */
export const SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES: readonly SystemsCrossAxisPredicate[] =
  [
    "hypothesized_gut_immune",
    "hypothesized_brain_immune",
    "cross_reacts_with",
    "signals_via_axis",
    "crosses_bbb",
    "associates_neuroimmune",
  ];

// ── Patient-data plane (what HSI stores vs never stores) ────────────────────

export type PatientDataPlaneRule = {
  id: string;
  stores: boolean;
  label: string;
  stage: SystemsStageGate | "never";
  owner: SystemsOwner;
  detail: string;
};

export const PATIENT_DATA_PLANE_RULES: readonly PatientDataPlaneRule[] = [
  {
    id: "hsi-observation-stub-shape",
    stores: true,
    label: "De-identified observation stub shapes (fixture / deid_aggregate)",
    stage: "stage1",
    owner: "hsi",
    detail:
      "HsiPatientObservationStub in schema — synthetic fixtures only; dataClass never raw PHI",
  },
  {
    id: "hsi-translation-handoff",
    stores: true,
    label: "Translation handoff candidates (deferred_until_hitl)",
    stage: "stage3",
    owner: "hsi",
    detail:
      "hsi-translation-handoff.* — Stage 3 scaffolding; clinicalActive=false; no live CDS",
  },
  {
    id: "hsi-never-raw-phi",
    stores: false,
    label: "Raw PHI / identifiable patient records",
    stage: "never",
    owner: "shared_policy",
    detail: "Never in hsi-core seeds, Neon red-wave evidence tables, or exports",
  },
  {
    id: "hsi-never-ehr-writeback",
    stores: false,
    label: "EHR write-back / auto-apply CDS",
    stage: "never",
    owner: "shared_policy",
    detail: "Aksh map pointers only; CDS closed until Gate C + established + product gates",
  },
  {
    id: "akeno-partner-cohorts",
    stores: false,
    label: "Live partner cohort / TRE patient data",
    stage: "stage3",
    owner: "akeno_clinical",
    detail:
      "Partner + Akeno after DPIA / governance — not ingested into HSI research packs",
  },
  {
    id: "aksh-hitl-cards",
    stores: true,
    label: "HITL card snapshots (cdsSurfacable=false on seeds)",
    stage: "stage1",
    owner: "aksh_hitl",
    detail: "Published map + stub cards; clinician product owns live chart context",
  },
] as const;

// ── AI / future tech: capabilities, hard bans, schema stubs (P3) ────────────

/**
 * What neural nets / future-tech adapters may buy in this stack.
 * See docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md.
 */
export const AI_FUTURE_TECH_CAPABILITIES = [
  {
    id: "representation_learning",
    label: "Representation learning",
    detail:
      "Embeddings over molecules, proteins, cells/omics, literature, and graph neighbourhoods — indexes and scorers, not truth",
  },
  {
    id: "pattern_discovery",
    label: "Pattern discovery",
    detail:
      "Cluster phenotypes, suggest missing edges, retrieve analogous pathways — outputs are hypotheses until Gate C",
  },
  {
    id: "ranking_retrieval",
    label: "Ranking / retrieval",
    detail:
      "Literature triage, biomarker candidate lists, R2 gap cards — never closes Gate C or sets established",
  },
  {
    id: "in_silico_scoring",
    label: "In-silico scoring",
    detail:
      "Structure/chem/ADMET-ish sandbox scores via P3 adapters — discovery-only; license-bound",
  },
  {
    id: "assistive_drafting",
    label: "Assistive drafting",
    detail:
      "Pack briefs, competing-explanation shells, curator checklists — human owns every promote",
  },
  {
    id: "research_agent_tools",
    label: "Bounded research agent tools",
    detail:
      "ISI 12-agent workbench as scoped tools under orchestrator + independent governance review — runtime Stage 2+",
  },
] as const;

export type AiFutureTechCapability = (typeof AI_FUTURE_TECH_CAPABILITIES)[number];

/** Hard bans — exported into hsi-systems-vision.json for consumers. */
export const AI_FUTURE_TECH_HARD_BANS = [
  {
    id: "no_replace_provenance",
    label: "Must not replace provenance",
    detail: "No edge without citable sources when claiming support",
  },
  {
    id: "no_invent_graded_edges",
    label: "Must not invent graded edges",
    detail: "No silent insert of established/approved from model output",
  },
  {
    id: "no_auto_clinical_decisions",
    label: "Must not auto clinical decisions",
    detail:
      "No diagnosis, prognosis, treatment, dosing, or EHR write-back from research surfaces",
  },
  {
    id: "no_promote_across_planes",
    label: "Must not promote generative/structure hypotheses to CDS",
    detail: "No chem/structure → Aksh card without Stage 3 product + governance gates",
  },
  {
    id: "no_raw_phi_in_hsi",
    label: "Must not train or store raw clinic PHI in HSI",
    detail: "No identifiable records or clinic sequences in seeds/exports/red-wave evidence",
  },
  {
    id: "no_collapse_uncertainty",
    label: "Must not collapse uncertainty",
    detail:
      "Models must not erase uncertain/hypothesized/unexplored into confident clinic language",
  },
  {
    id: "no_auto_approve_into_kg",
    label: "Must not auto-approve into KG",
    detail: "NN/agent proposals feed Gate C only; autoApproveIntoKg remains false",
  },
] as const;

export type AiFutureTechHardBan = (typeof AI_FUTURE_TECH_HARD_BANS)[number];

/**
 * Optional sidecar embedding metadata for nodes/edges — schema only.
 * Vectors are external refs or omitted until an eval harness exists.
 * Never a substitute for typed predicates or grades.
 */
export const EDGE_EMBEDDING_SLOT_SCHEMA = {
  schemaVersion: "hsi-edge-embedding-slot-1",
  status: "schema_stub" as const,
  fields: [
    "modelId",
    "weightsHash",
    "dimensions",
    "vectorRefOrOmit",
    "createdAt",
    "invalidatesOnModelBump",
  ] as const,
  mayFlipEvidenceGrade: false as const,
  notes:
    "Sidecar retrieval index only — cosine similarity ≠ mechanism; see HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
};

export type EdgeEmbeddingSlotSchema = typeof EDGE_EMBEDDING_SLOT_SCHEMA;

/**
 * Shape for NN/agent drafts that enter Gate C queues — not KG edges.
 * Runtime emitters live in ISI/adapters later; hsi-core owns the contract stub.
 */
export const MODEL_PROPOSAL_ARTIFACT_SCHEMA = {
  schemaVersion: "hsi-model-proposal-1",
  /** Wired into Gate C checklist as pending modelProposals (P1.5). */
  status: "wired_to_gate_c_pending" as const,
  requiredFields: [
    "proposalId",
    "sourceAdapterOrAgent",
    "proposedSubject",
    "proposedPredicate",
    "proposedObject",
    "contextNote",
    "evidenceHints",
    "suggestedTeachingStatus",
    "createdAt",
  ] as const,
  forbiddenFields: ["hsiGrade", "curationReview", "autoApprove"] as const,
  defaultSuggestedTeachingStatus: "hypothesized" as const,
  mayFlipEvidenceGrade: false as const,
  autoApproveIntoKg: false as const,
  gateCChecklistField: "modelProposals" as const,
  runtimeModule: "src/modelProposal.ts" as const,
  notes:
    "Proposers/scorers emit this artifact → human Gate C pending rows; never writes graded KG edges directly; autoApprove always false",
};

export type ModelProposalArtifactSchema = typeof MODEL_PROPOSAL_ARTIFACT_SCHEMA;

/** Offline eval intent — no training loop in Stage 1. */
export const MODEL_EVAL_HARNESS_STUB = {
  schemaVersion: "hsi-model-eval-harness-1",
  status: "stub" as const,
  intent:
    "Offline retrieval/ranking metrics against frozen public packs; TDC-style later",
  mayUseLivePhi: false as const,
  mayFlipEvidenceGrade: false as const,
  visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
};

export type ModelEvalHarnessStub = typeof MODEL_EVAL_HARNESS_STUB;

export type FutureTechAdapterStatus =
  | "deferred_p3"
  | "catalog_only"
  | "out_of_scope_stage1";

export type FutureTechAdapterStub = {
  id: string;
  label: string;
  role: string;
  status: FutureTechAdapterStatus;
  /** Never auto-promotes hsiGrade / Gate C. */
  mayFlipEvidenceGrade: false;
  licenseNote: string;
  visionDocRef: string;
};

export const FUTURE_TECH_ADAPTER_STUBS: readonly FutureTechAdapterStub[] = [
  {
    id: "adapter-tdc",
    label: "Therapeutics Data Commons (TDC)",
    role: "Offline ML eval benchmarks against graded claims",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "Per-task dataset licenses — cite TDC + underlying sets",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-af3",
    label: "AlphaFold3",
    role: "Structure prediction for mechanism hypotheses",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "Non-commercial / restricted — written license sign-off before adapter",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-boltz",
    label: "Boltz",
    role: "Open structure / complex prediction alternative",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "Check Apache/model weights; discovery-only",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-esm",
    label: "ESM",
    role: "Protein language embeddings / similarity helpers",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "Model card + weights; no PHI sequences from clinic",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-openmm",
    label: "OpenMM",
    role: "Molecular dynamics simulation plugin",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "LGPL/OpenMM; compute cost; not Gate C evidence",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-rdkit",
    label: "RDKit",
    role: "Cheminformatics descriptors for research claims",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "BSD-style; never invents clinical edges",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-reinvent4",
    label: "REINVENT4",
    role: "Generative molecular design sandbox",
    status: "deferred_p3",
    mayFlipEvidenceGrade: false,
    licenseNote: "Apache-2.0 typical; never clinic recommendation path",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
  {
    id: "adapter-isi-agents",
    label: "ISI 12-agent research workbench",
    role: "Supervised research agents (orchestrator + specialists)",
    status: "out_of_scope_stage1",
    mayFlipEvidenceGrade: false,
    licenseNote: "Runtime = ISI product; HSI holds Aksh catalog as pattern reuse only",
    visionDocRef: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
  },
] as const;

// ── Bundle ──────────────────────────────────────────────────────────────────

export type SystemsVisionBundle = {
  schemaVersion: typeof SYSTEMS_VISION_SCHEMA;
  notCds: true;
  autoApproveIntoKg: false;
  generatedAt: string | null;
  bindingIntent: string;
  /** Dual-track vertical decision (option A) — RA activeScope; SSc prdMvpTarget. */
  verticalStrategy: HsiVerticalDecision["verticalStrategy"];
  activeScope: HsiVerticalDecision["activeScope"];
  prdMvpTarget: HsiVerticalDecision["prdMvpTarget"];
  verticalDecision: ReturnType<typeof verticalDecisionExportPointer>;
  stageGates: {
    stage1: string;
    stage2: string;
    stage3: string;
  };
  domains: readonly SystemsDomainOwnership[];
  immuneCellSpine: {
    schemaVersion: string;
    cellCount: number;
    cells: readonly ImmuneCellSpineNode[];
    relationshipTypes: readonly IsiControlledRelationshipType[];
    relationshipToHsiEdge: typeof ISI_RELATIONSHIP_TO_HSI_EDGE;
    diseaseVerticals: readonly DiseaseVerticalStub[];
  };
  gutMicrobiome: {
    entityClasses: readonly GutMicrobiomeEntityClass[];
    entities: readonly GutMicrobiomeEntityStub[];
  };
  neuroimmune: {
    entityTypes: readonly NeuroimmuneEntityType[];
    entities: readonly NeuroimmuneEntityStub[];
  };
  diseaseTissueBiomarker: {
    layers: readonly DiseaseTissueBiomarkerLayer[];
    entities: readonly DiseaseTissueBiomarkerStub[];
  };
  crossAxisPredicates: {
    predicates: readonly SystemsCrossAxisPredicate[];
    toHsiEdge: typeof SYSTEMS_PREDICATE_TO_HSI_EDGE;
    hypothesisCapable: readonly SystemsCrossAxisPredicate[];
  };
  patientDataPlane: readonly PatientDataPlaneRule[];
  futureTechAdapters: readonly FutureTechAdapterStub[];
  aiFutureTech: {
    positionDoc: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md";
    capabilities: readonly AiFutureTechCapability[];
    hardBans: readonly AiFutureTechHardBan[];
    embeddingSlotSchema: EdgeEmbeddingSlotSchema;
    modelProposalArtifactSchema: ModelProposalArtifactSchema;
    evalHarnessStub: ModelEvalHarnessStub;
  };
  invariants: string[];
};

export function buildSystemsVisionBundle(opts?: {
  generatedAt?: string;
}): SystemsVisionBundle {
  const spine = buildImmuneCellSpineBundle();
  const vertical = getVerticalDecision();
  return {
    schemaVersion: SYSTEMS_VISION_SCHEMA,
    notCds: true,
    autoApproveIntoKg: false,
    generatedAt: opts?.generatedAt ?? null,
    bindingIntent:
      "Whole immune + gut–immune + brain–immune + diseases/cells/tissues/biomarkers + patient-data connections + AI/future tech — target connected graph, not a narrow single-pathway product forever",
    verticalStrategy: vertical.verticalStrategy,
    activeScope: vertical.activeScope,
    prdMvpTarget: vertical.prdMvpTarget,
    verticalDecision: verticalDecisionExportPointer(vertical),
    stageGates: {
      stage1:
        "Research evidence backbone — graded edges, RA/TNF working scope, immune spine vocabulary, LOINC markers; no PHI; no CDS",
      stage2:
        "Multi-axis curation — deepen gut–immune / neuroimmune / tissue–disease overlays; selected adapters; R2 validation; still research-first",
      stage3:
        "Patient / HITL / Akeno — translation handoff + partner governance; HSI never stores raw PHI; live CDS only after product gates",
    },
    domains: SYSTEMS_DOMAIN_OWNERSHIP,
    immuneCellSpine: {
      schemaVersion: spine.schemaVersion,
      cellCount: spine.cells.length,
      cells: IMMUNE_CELL_SPINE_NODES,
      relationshipTypes: ISI_CONTROLLED_RELATIONSHIP_TYPES,
      relationshipToHsiEdge: ISI_RELATIONSHIP_TO_HSI_EDGE,
      diseaseVerticals: DISEASE_VERTICAL_STUBS,
    },
    gutMicrobiome: {
      entityClasses: GUT_MICROBIOME_ENTITY_CLASSES,
      entities: GUT_MICROBIOME_ENTITY_STUBS,
    },
    neuroimmune: {
      entityTypes: NEUROIMMUNE_ENTITY_TYPES,
      entities: NEUROIMMUNE_ENTITY_STUBS,
    },
    diseaseTissueBiomarker: {
      layers: DISEASE_TISSUE_BIOMARKER_LAYERS,
      entities: DISEASE_TISSUE_BIOMARKER_STUBS,
    },
    crossAxisPredicates: {
      predicates: SYSTEMS_CROSS_AXIS_PREDICATES,
      toHsiEdge: SYSTEMS_PREDICATE_TO_HSI_EDGE,
      hypothesisCapable: SYSTEMS_HYPOTHESIS_CAPABLE_PREDICATES,
    },
    patientDataPlane: PATIENT_DATA_PLANE_RULES,
    futureTechAdapters: FUTURE_TECH_ADAPTER_STUBS,
    aiFutureTech: {
      positionDoc: "docs/HSI_AI_NEURAL_FUTURE_HEALTHCARE.md",
      capabilities: AI_FUTURE_TECH_CAPABILITIES,
      hardBans: AI_FUTURE_TECH_HARD_BANS,
      embeddingSlotSchema: EDGE_EMBEDDING_SLOT_SCHEMA,
      modelProposalArtifactSchema: MODEL_PROPOSAL_ARTIFACT_SCHEMA,
      evalHarnessStub: MODEL_EVAL_HARNESS_STUB,
    },
    invariants: [
      "Target graph ≠ one sprint — stubs are navigation vocabulary only.",
      "Every claim edge needs context + evidence + dual grade axes.",
      "RA Stage 1 scopeLocked remains authoritative; do not invent partnerSigned.",
      "Dual-track A: activeScope=ra-tnf; prdMvpTarget=ssc-tfh-b-il21 with thin seeds; RA comparison = Release 2; no wipe.",
      "Patient data: HSI stores shapes/fixtures/handoff only — never raw PHI.",
      "P3 bio adapters never auto-promote hsiGrade or Gate C.",
      "NN/agent proposals are model-proposal artifacts only — never autoApproveIntoKg.",
      "Embeddings are sidecar retrieval slots — not a substitute for typed predicates.",
      "notCds / autoApproveIntoKg=false on this export.",
      "Neon: red-wave only from this workspace.",
    ],
  };
}

export function serializeSystemsVision(
  bundle: SystemsVisionBundle = buildSystemsVisionBundle(),
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function isSystemsCrossAxisPredicate(
  v: unknown,
): v is SystemsCrossAxisPredicate {
  return (
    typeof v === "string" &&
    (SYSTEMS_CROSS_AXIS_PREDICATES as readonly string[]).includes(v)
  );
}

export function listGutMicrobiomeEntitiesByClass(
  entityClass: GutMicrobiomeEntityClass,
): GutMicrobiomeEntityStub[] {
  return GUT_MICROBIOME_ENTITY_STUBS.filter((e) => e.entityClass === entityClass);
}

export function listNeuroimmuneEntitiesByType(
  entityType: NeuroimmuneEntityType,
): NeuroimmuneEntityStub[] {
  return NEUROIMMUNE_ENTITY_STUBS.filter((e) => e.entityType === entityType);
}
