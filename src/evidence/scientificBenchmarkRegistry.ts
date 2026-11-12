/**
 * Milestone 7 / PR1 — Scientific Benchmark Registry contracts.
 *
 * Extends `evaluation/scientific_benchmark_v1/` (alias of independent-evaluation).
 * Does NOT invent a parallel eval platform, SME scores, held-out gold labels,
 * Gate C auto-approve, MoU, PHI/CDS, public marketing validation claims, or
 * numeric pass thresholds after seeing results.
 *
 * LLM judges must not be the sole authority for scientific correctness.
 */
import {createHash} from "node:crypto";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  INDEPENDENT_EVALUATION_ALIAS_PATH,
  SCIENTIFIC_BENCHMARK_V1_PATH,
} from "./scientificBenchmarkV1";
import {LIVE_INTEGRATION_ENV_FLAG} from "./independentEvaluationSuites";

export const SCIENTIFIC_BENCHMARK_REGISTRY_SCHEMA =
  "hsi-scientific-benchmark-registry-1" as const;
export const SCIENTIFIC_BENCHMARK_REGISTRY_METHOD =
  "hsi.scientific_benchmark_registry.v1" as const;
export const SCIENTIFIC_BENCHMARK_REGISTRY_VERSION = "0.1.0" as const;
export const SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH =
  "evaluation/scientific_benchmark_v1/registry" as const;

/** Twelve M7 initial benchmark categories (structure slots; SME empty OK). */
export const M7_BENCHMARK_CATEGORY_IDS = [
  "literature_retrieval",
  "source_grounded_evidence_extraction",
  "biological_entity_resolution",
  "contextual_mechanism_investigation",
  "contradiction_classification",
  "counterevidence_retrieval",
  "hypothesis_evaluation",
  "experiment_discrimination",
  "translational_failure_investigation",
  "biomarker_subgroup_interpretation",
  "end_to_end_scientific_investigation",
  "abstention_uncertainty_handling",
] as const;
export type M7BenchmarkCategoryId = (typeof M7_BENCHMARK_CATEGORY_IDS)[number];

export const M7_BENCHMARK_CATEGORY_COUNT = 12 as const;

export type BenchmarkTaskType =
  | "retrieval"
  | "extraction"
  | "entity_resolution"
  | "mechanism"
  | "contradiction"
  | "opposing_retrieval"
  | "hypothesis"
  | "experiment"
  | "translational_failure"
  | "precision"
  | "e2e_investigation"
  | "abstention";

export type BenchmarkPartition = "development" | "held_out";

export type BenchmarkCaseEvaluationStatus =
  | "scaffold"
  | "draft"
  | "awaiting_expert_labels"
  | "labelled_pending_adjudication"
  | "frozen_held_out"
  | "scored"
  | "blocked";

/** Release-gate classifications only — no invented numeric thresholds. */
export type ScientificReleaseGateClassification =
  | "engineering_ready"
  | "scientific_evaluation_pending"
  | "research_pilot_ready"
  | "expanded_research_evaluation_ready"
  | "not_ready";

export type BenchmarkSourceRef = {
  kind: "pmid" | "doi" | "nct" | "release_claim" | "open_targets" | "uniprot" | "fixture" | "other";
  value: string;
  /** Locator honesty — identity ≠ claim support. */
  claimSupport: "not_assessed";
};

export type BenchmarkEntityRef = {
  kind: "concept" | "gene" | "protein" | "disease" | "cell_type" | "pathway" | "trial" | "other";
  id: string;
  label: string | null;
};

export type BenchmarkAnswerability =
  | "answerable_with_cited_evidence"
  | "partially_answerable"
  | "should_abstain"
  | "not_assessed";

/**
 * Expert reference stays held-out. PR1 keeps the payload null / sealed so it
 * cannot leak into prompts, retrieval indexes, or model tuning.
 */
export type ExpertReferenceAssessment = {
  sealed: true;
  /** Always null in PR1 — do not invent expert answers. */
  payload: null;
  injectableIntoPrompts: false;
  injectableIntoRetrievalIndexes: false;
  injectableIntoModelTuning: false;
  notes: string;
};

export type BenchmarkRubricSlot = {
  rubricId: string;
  dimensionIds: readonly string[];
  /** Anchors may exist as text; scores stay null until SME. */
  ordinalAnchorsDocumented: boolean;
  scoresInvented: false;
  llmJudgeSoleAuthority: false;
};

export type BenchmarkReviewerAssignment = {
  slotId: string;
  role: "sme_a" | "sme_b" | "adjudicator" | "methodology_reviewer" | "translational_reviewer";
  filled: false;
  reviewerId: null;
  ratings: null;
};

export type BenchmarkDatasetLicence = {
  datasetId: string;
  licence: string;
  rightsCleared: false | "pending_human";
  note: string;
};

export type ScientificBenchmarkCase = {
  caseId: string;
  categoryId: M7BenchmarkCategoryId;
  partition: BenchmarkPartition;
  researchDomain: string;
  diseaseOrBiologicalContext: string;
  researchQuestion: string;
  taskType: BenchmarkTaskType;
  sourceEvidenceRefs: readonly BenchmarkSourceRef[];
  /** ISO date (YYYY-MM-DD) or null when cutoff not set. */
  evidenceCutoffDate: string | null;
  relevantEntities: readonly BenchmarkEntityRef[];
  experimentalContext: string;
  knownAmbiguity: string;
  expectedAnswerability: BenchmarkAnswerability;
  expertReferenceAssessment: ExpertReferenceAssessment;
  scoringRubric: BenchmarkRubricSlot;
  reviewerAssignments: readonly BenchmarkReviewerAssignment[];
  datasetAndLicence: BenchmarkDatasetLicence;
  version: string;
  evaluationStatus: BenchmarkCaseEvaluationStatus;
  honesty: {
    fixturesAreNotLiveEvidence: true;
    expertReferenceHeldOut: true;
    noLeakageIntoPromptsIndexesOrTuning: true;
    smeScoresNotInvented: true;
    llmJudgeNotSoleAuthority: true;
  };
};

export type BenchmarkCategorySlot = {
  categoryId: M7BenchmarkCategoryId;
  ordinal: number;
  taskType: BenchmarkTaskType;
  label: string;
  developmentCaseIds: readonly string[];
  heldOutCaseIds: readonly string[];
  smeReferenceFilled: false;
  evaluationStatus: BenchmarkCaseEvaluationStatus;
};

export type ScientificBenchmarkRegistryManifest = {
  schemaVersion: typeof SCIENTIFIC_BENCHMARK_REGISTRY_SCHEMA;
  method: typeof SCIENTIFIC_BENCHMARK_REGISTRY_METHOD;
  version: typeof SCIENTIFIC_BENCHMARK_REGISTRY_VERSION;
  path: typeof SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH;
  generatedAt: string;
  /** Alias home — not a second eval platform. */
  wiresTo: {
    scientificBenchmarkAliasPath: typeof SCIENTIFIC_BENCHMARK_V1_PATH;
    independentEvaluationCanonicalPath: typeof INDEPENDENT_EVALUATION_ALIAS_PATH;
    noParallelEvalPlatform: true;
  };
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  liveJourneyAcceptance: "BLOCKED";
  productionReadinessClaimed: false;
  scientificValidityClaimed: false;
  liveSuccessClaimed: false;
  ciGreenIsNotScientificValidity: true;
  inventSmeScoresPermitted: false;
  smeSlotsFilled: 0;
  heldOutFrozen: false;
  llmJudgeSoleAuthorityPermitted: false;
  liveSuiteGate: {
    envFlag: typeof LIVE_INTEGRATION_ENV_FLAG;
    requireExplicitOptIn: true;
    ciMustNotEnable: true;
    defaultStatus: "GATED_NOT_RUN";
  };
  releaseGateClassification: ScientificReleaseGateClassification;
  /** Explicit: numeric thresholds not invented in PR1. */
  numericAcceptanceThresholdsInvented: false;
  categories: readonly BenchmarkCategorySlot[];
  cases: readonly ScientificBenchmarkCase[];
  partitions: {
    developmentCaseCount: number;
    heldOutCaseCount: number;
    developmentAndHeldOutDisjoint: true;
    leakagePrevention: {
      expertReferenceSealed: true;
      heldOutNotInPrompts: true;
      heldOutNotInRetrievalIndexes: true;
      heldOutNotInModelTuning: true;
      documented: true;
    };
  };
  humanQueueBlocked: {
    rightsQueue2: "PARKED";
    smeQueue4: "PARKED";
    liveJourneyQueue5: "PARKED";
  };
  honesty: {
    noParallelEvalPlatform: true;
    noInventedSmeGold: true;
    noFakeLiveSuccess: true;
    noGateCAutoApprove: true;
    noInventedMoU: true;
    noLiveCdsPhi: true;
    fixturesAreNotLiveScience: true;
    m1ThroughM6NotScientificallyValidated: true;
    noPublicMarketingValidationClaim: true;
    llmJudgeNotSoleAuthority: true;
  };
  stopNote: string;
  inventoryHash: string;
};

export class ScientificBenchmarkRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScientificBenchmarkRegistryError";
  }
}

const CATEGORY_META: Record<
  M7BenchmarkCategoryId,
  {ordinal: number; taskType: BenchmarkTaskType; label: string; domain: string; context: string}
> = {
  literature_retrieval: {
    ordinal: 1,
    taskType: "retrieval",
    label: "Literature retrieval",
    domain: "biomedical_literature",
    context: "general_immune_translational",
  },
  source_grounded_evidence_extraction: {
    ordinal: 2,
    taskType: "extraction",
    label: "Source-grounded evidence extraction",
    domain: "evidence_extraction",
    context: "citation_support",
  },
  biological_entity_resolution: {
    ordinal: 3,
    taskType: "entity_resolution",
    label: "Biological entity resolution",
    domain: "entity_resolution",
    context: "gene_protein_cell_pathway",
  },
  contextual_mechanism_investigation: {
    ordinal: 4,
    taskType: "mechanism",
    label: "Contextual mechanism investigation",
    domain: "mechanism_reasoning",
    context: "species_tissue_aware",
  },
  contradiction_classification: {
    ordinal: 5,
    taskType: "contradiction",
    label: "Contradiction classification",
    domain: "contradiction_intelligence",
    context: "opposing_findings",
  },
  counterevidence_retrieval: {
    ordinal: 6,
    taskType: "opposing_retrieval",
    label: "Counterevidence retrieval",
    domain: "opposing_evidence",
    context: "null_and_opposing",
  },
  hypothesis_evaluation: {
    ordinal: 7,
    taskType: "hypothesis",
    label: "Hypothesis evaluation",
    domain: "hypothesis_intelligence",
    context: "falsifiability_and_grounding",
  },
  experiment_discrimination: {
    ordinal: 8,
    taskType: "experiment",
    label: "Experiment discrimination",
    domain: "experiment_decision",
    context: "discriminating_designs",
  },
  translational_failure_investigation: {
    ordinal: 9,
    taskType: "translational_failure",
    label: "Translational failure investigation",
    domain: "translational_intelligence",
    context: "programme_outcome_labels",
  },
  biomarker_subgroup_interpretation: {
    ordinal: 10,
    taskType: "precision",
    label: "Biomarker and subgroup interpretation",
    domain: "precision_translational",
    context: "prognostic_vs_predictive",
  },
  end_to_end_scientific_investigation: {
    ordinal: 11,
    taskType: "e2e_investigation",
    label: "End-to-end scientific investigation",
    domain: "investigation_orchestration",
    context: "m1_through_m6_workflow",
  },
  abstention_uncertainty_handling: {
    ordinal: 12,
    taskType: "abstention",
    label: "Abstention and uncertainty handling",
    domain: "uncertainty",
    context: "insufficient_evidence",
  },
};

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function sealedExpertReference(categoryId: M7BenchmarkCategoryId): ExpertReferenceAssessment {
  return {
    sealed: true,
    payload: null,
    injectableIntoPrompts: false,
    injectableIntoRetrievalIndexes: false,
    injectableIntoModelTuning: false,
    notes: `Held-out expert reference for ${categoryId} remains empty until SME (#4). Must not leak into prompts, indexes, or tuning.`,
  };
}

function emptyReviewerAssignments(categoryId: M7BenchmarkCategoryId): BenchmarkReviewerAssignment[] {
  return [
    {
      slotId: `${categoryId}-sme-a`,
      role: "sme_a",
      filled: false,
      reviewerId: null,
      ratings: null,
    },
    {
      slotId: `${categoryId}-sme-b`,
      role: "sme_b",
      filled: false,
      reviewerId: null,
      ratings: null,
    },
    {
      slotId: `${categoryId}-adjudicator`,
      role: "adjudicator",
      filled: false,
      reviewerId: null,
      ratings: null,
    },
  ];
}

function scaffoldDevelopmentCase(categoryId: M7BenchmarkCategoryId): ScientificBenchmarkCase {
  const meta = CATEGORY_META[categoryId];
  const caseId = `M7-DEV-${String(meta.ordinal).padStart(2, "0")}-${categoryId}`;
  return {
    caseId,
    categoryId,
    partition: "development",
    researchDomain: meta.domain,
    diseaseOrBiologicalContext: meta.context,
    researchQuestion: `[scaffold] ${meta.label} — development slot; not gold; not scientifically validated.`,
    taskType: meta.taskType,
    sourceEvidenceRefs: [],
    evidenceCutoffDate: null,
    relevantEntities: [],
    experimentalContext: "not_specified_scaffold",
    knownAmbiguity: "Scaffold case — ambiguity and answerability not SME-assessed.",
    expectedAnswerability: "not_assessed",
    expertReferenceAssessment: sealedExpertReference(categoryId),
    scoringRubric: {
      rubricId: `rubric-${categoryId}-v0`,
      dimensionIds: [],
      ordinalAnchorsDocumented: false,
      scoresInvented: false,
      llmJudgeSoleAuthority: false,
    },
    reviewerAssignments: emptyReviewerAssignments(categoryId),
    datasetAndLicence: {
      datasetId: "hsi-m7-registry-scaffold-v0",
      licence: "UNLICENSED-internal-scaffold",
      rightsCleared: "pending_human",
      note: "Structural development slot only. Not a licensed gold packet. #2 rights remain PARKED.",
    },
    version: SCIENTIFIC_BENCHMARK_REGISTRY_VERSION,
    evaluationStatus: "scaffold",
    honesty: {
      fixturesAreNotLiveEvidence: true,
      expertReferenceHeldOut: true,
      noLeakageIntoPromptsIndexesOrTuning: true,
      smeScoresNotInvented: true,
      llmJudgeNotSoleAuthority: true,
    },
  };
}

function scaffoldHeldOutCase(categoryId: M7BenchmarkCategoryId): ScientificBenchmarkCase {
  const meta = CATEGORY_META[categoryId];
  const caseId = `M7-HO-${String(meta.ordinal).padStart(2, "0")}-${categoryId}`;
  return {
    caseId,
    categoryId,
    partition: "held_out",
    researchDomain: meta.domain,
    diseaseOrBiologicalContext: meta.context,
    researchQuestion: `[held-out scaffold] ${meta.label} — empty expert reference; not frozen gold.`,
    taskType: meta.taskType,
    sourceEvidenceRefs: [],
    evidenceCutoffDate: null,
    relevantEntities: [],
    experimentalContext: "not_specified_scaffold",
    knownAmbiguity: "Held-out scaffold — sealed expert payload null; do not tune on this partition.",
    expectedAnswerability: "not_assessed",
    expertReferenceAssessment: sealedExpertReference(categoryId),
    scoringRubric: {
      rubricId: `rubric-${categoryId}-heldout-v0`,
      dimensionIds: [],
      ordinalAnchorsDocumented: false,
      scoresInvented: false,
      llmJudgeSoleAuthority: false,
    },
    reviewerAssignments: emptyReviewerAssignments(categoryId),
    datasetAndLicence: {
      datasetId: "hsi-m7-registry-heldout-scaffold-v0",
      licence: "UNLICENSED-internal-scaffold",
      rightsCleared: "pending_human",
      note: "Held-out structural slot. frozenHeldOut remains false until SME + rights (#2/#4).",
    },
    version: SCIENTIFIC_BENCHMARK_REGISTRY_VERSION,
    evaluationStatus: "scaffold",
    honesty: {
      fixturesAreNotLiveEvidence: true,
      expertReferenceHeldOut: true,
      noLeakageIntoPromptsIndexesOrTuning: true,
      smeScoresNotInvented: true,
      llmJudgeNotSoleAuthority: true,
    },
  };
}

export function buildScientificBenchmarkRegistry(input: {
  generatedAt: string;
}): ScientificBenchmarkRegistryManifest {
  const cases: ScientificBenchmarkCase[] = [];
  const categories: BenchmarkCategorySlot[] = [];

  for (const categoryId of M7_BENCHMARK_CATEGORY_IDS) {
    const meta = CATEGORY_META[categoryId];
    const development = scaffoldDevelopmentCase(categoryId);
    const heldOut = scaffoldHeldOutCase(categoryId);
    cases.push(development, heldOut);
    categories.push({
      categoryId,
      ordinal: meta.ordinal,
      taskType: meta.taskType,
      label: meta.label,
      developmentCaseIds: [development.caseId],
      heldOutCaseIds: [heldOut.caseId],
      smeReferenceFilled: false,
      evaluationStatus: "scaffold",
    });
  }

  if (categories.length !== M7_BENCHMARK_CATEGORY_COUNT) {
    throw new ScientificBenchmarkRegistryError(
      `Expected ${M7_BENCHMARK_CATEGORY_COUNT} category slots`,
    );
  }

  const developmentCases = cases.filter((c) => c.partition === "development");
  const heldOutCases = cases.filter((c) => c.partition === "held_out");
  const developmentIds = new Set(developmentCases.map((c) => c.caseId));
  for (const held of heldOutCases) {
    if (developmentIds.has(held.caseId)) {
      throw new ScientificBenchmarkRegistryError("Development and held-out case IDs must be disjoint");
    }
  }

  const body: Omit<ScientificBenchmarkRegistryManifest, "inventoryHash"> = {
    schemaVersion: SCIENTIFIC_BENCHMARK_REGISTRY_SCHEMA,
    method: SCIENTIFIC_BENCHMARK_REGISTRY_METHOD,
    version: SCIENTIFIC_BENCHMARK_REGISTRY_VERSION,
    path: SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
    generatedAt: input.generatedAt,
    wiresTo: {
      scientificBenchmarkAliasPath: SCIENTIFIC_BENCHMARK_V1_PATH,
      independentEvaluationCanonicalPath: INDEPENDENT_EVALUATION_ALIAS_PATH,
      noParallelEvalPlatform: true,
    },
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    liveJourneyAcceptance: "BLOCKED",
    productionReadinessClaimed: false,
    scientificValidityClaimed: false,
    liveSuccessClaimed: false,
    ciGreenIsNotScientificValidity: true,
    inventSmeScoresPermitted: false,
    smeSlotsFilled: 0,
    heldOutFrozen: false,
    llmJudgeSoleAuthorityPermitted: false,
    liveSuiteGate: {
      envFlag: LIVE_INTEGRATION_ENV_FLAG,
      requireExplicitOptIn: true,
      ciMustNotEnable: true,
      defaultStatus: "GATED_NOT_RUN",
    },
    releaseGateClassification: "scientific_evaluation_pending",
    numericAcceptanceThresholdsInvented: false,
    categories,
    cases,
    partitions: {
      developmentCaseCount: developmentCases.length,
      heldOutCaseCount: heldOutCases.length,
      developmentAndHeldOutDisjoint: true,
      leakagePrevention: {
        expertReferenceSealed: true,
        heldOutNotInPrompts: true,
        heldOutNotInRetrievalIndexes: true,
        heldOutNotInModelTuning: true,
        documented: true,
      },
    },
    humanQueueBlocked: {
      rightsQueue2: "PARKED",
      smeQueue4: "PARKED",
      liveJourneyQueue5: "PARKED",
    },
    honesty: {
      noParallelEvalPlatform: true,
      noInventedSmeGold: true,
      noFakeLiveSuccess: true,
      noGateCAutoApprove: true,
      noInventedMoU: true,
      noLiveCdsPhi: true,
      fixturesAreNotLiveScience: true,
      m1ThroughM6NotScientificallyValidated: true,
      noPublicMarketingValidationClaim: true,
      llmJudgeNotSoleAuthority: true,
    },
    stopNote:
      "M7 PR1 Scientific Benchmark Registry scaffold under scientific_benchmark_v1 alias. Twelve category slots with empty SME/held-out references. Not scientific validation; M1–M6 not scientifically validated; no parallel eval platform; #2/#4/#5 PARKED.",
  };

  return {...body, inventoryHash: digest(body)};
}

export function parseScientificBenchmarkRegistry(
  value: unknown,
): ScientificBenchmarkRegistryManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ScientificBenchmarkRegistryError("Invalid scientific benchmark registry manifest");
  }
  const manifest = value as ScientificBenchmarkRegistryManifest;
  if (manifest.schemaVersion !== SCIENTIFIC_BENCHMARK_REGISTRY_SCHEMA) {
    throw new ScientificBenchmarkRegistryError("Unsupported scientific benchmark registry schema");
  }
  if (manifest.path !== SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH) {
    throw new ScientificBenchmarkRegistryError("Registry path must stay under scientific_benchmark_v1");
  }
  if (
    !manifest.wiresTo.noParallelEvalPlatform ||
    manifest.wiresTo.scientificBenchmarkAliasPath !== SCIENTIFIC_BENCHMARK_V1_PATH ||
    manifest.wiresTo.independentEvaluationCanonicalPath !== INDEPENDENT_EVALUATION_ALIAS_PATH
  ) {
    throw new ScientificBenchmarkRegistryError(
      "Registry must wire to scientific_benchmark_v1 alias of independent-evaluation",
    );
  }
  if (
    manifest.engineeringScaffold !== "CLEARED" ||
    manifest.scientificAcceptance !== "BLOCKED" ||
    manifest.rightsAcceptance !== "BLOCKED" ||
    manifest.liveJourneyAcceptance !== "BLOCKED" ||
    manifest.productionReadinessClaimed !== false ||
    manifest.scientificValidityClaimed !== false ||
    manifest.liveSuccessClaimed !== false ||
    manifest.inventSmeScoresPermitted !== false ||
    manifest.smeSlotsFilled !== 0 ||
    manifest.heldOutFrozen !== false ||
    manifest.llmJudgeSoleAuthorityPermitted !== false ||
    manifest.numericAcceptanceThresholdsInvented !== false
  ) {
    throw new ScientificBenchmarkRegistryError(
      "Registry cannot claim scientific validity, live success, filled SME, frozen held-out, or invented thresholds",
    );
  }
  if (manifest.categories.length !== M7_BENCHMARK_CATEGORY_COUNT) {
    throw new ScientificBenchmarkRegistryError(
      `Expected ${M7_BENCHMARK_CATEGORY_COUNT} category slots`,
    );
  }
  for (const categoryId of M7_BENCHMARK_CATEGORY_IDS) {
    if (!manifest.categories.some((c) => c.categoryId === categoryId)) {
      throw new ScientificBenchmarkRegistryError(`Missing category slot: ${categoryId}`);
    }
  }
  if (manifest.categories.some((c) => c.smeReferenceFilled !== false)) {
    throw new ScientificBenchmarkRegistryError("Category SME references must stay empty in PR1");
  }
  for (const benchmarkCase of manifest.cases) {
    if (benchmarkCase.expertReferenceAssessment.payload !== null) {
      throw new ScientificBenchmarkRegistryError("Expert reference payload must stay null until SME");
    }
    if (
      benchmarkCase.expertReferenceAssessment.injectableIntoPrompts ||
      benchmarkCase.expertReferenceAssessment.injectableIntoRetrievalIndexes ||
      benchmarkCase.expertReferenceAssessment.injectableIntoModelTuning
    ) {
      throw new ScientificBenchmarkRegistryError("Expert reference must not be injectable");
    }
    if (benchmarkCase.scoringRubric.scoresInvented || benchmarkCase.scoringRubric.llmJudgeSoleAuthority) {
      throw new ScientificBenchmarkRegistryError("Rubric must refuse invented scores and LLM-sole authority");
    }
    if (benchmarkCase.reviewerAssignments.some((r) => r.filled || r.reviewerId !== null || r.ratings !== null)) {
      throw new ScientificBenchmarkRegistryError("Reviewer assignments must stay empty");
    }
  }

  const developmentIds = new Set(
    manifest.cases.filter((c) => c.partition === "development").map((c) => c.caseId),
  );
  const heldOutIds = new Set(
    manifest.cases.filter((c) => c.partition === "held_out").map((c) => c.caseId),
  );
  for (const id of heldOutIds) {
    if (developmentIds.has(id)) {
      throw new ScientificBenchmarkRegistryError("Development and held-out partitions must be disjoint");
    }
  }
  if (
    !manifest.partitions.developmentAndHeldOutDisjoint ||
    !manifest.partitions.leakagePrevention.expertReferenceSealed ||
    !manifest.partitions.leakagePrevention.heldOutNotInPrompts ||
    !manifest.partitions.leakagePrevention.heldOutNotInRetrievalIndexes ||
    !manifest.partitions.leakagePrevention.heldOutNotInModelTuning
  ) {
    throw new ScientificBenchmarkRegistryError("Leakage prevention flags must remain true");
  }
  if (
    manifest.releaseGateClassification !== "scientific_evaluation_pending" &&
    manifest.releaseGateClassification !== "not_ready" &&
    manifest.releaseGateClassification !== "engineering_ready"
  ) {
    // Allow eng classifications only; refuse claiming pilot/expanded readiness in parse of PR1 artifacts.
    if (
      manifest.releaseGateClassification === "research_pilot_ready" ||
      manifest.releaseGateClassification === "expanded_research_evaluation_ready"
    ) {
      throw new ScientificBenchmarkRegistryError(
        "PR1 registry must not claim research_pilot_ready or expanded_research_evaluation_ready",
      );
    }
  }
  if (
    manifest.humanQueueBlocked.rightsQueue2 !== "PARKED" ||
    manifest.humanQueueBlocked.smeQueue4 !== "PARKED" ||
    manifest.humanQueueBlocked.liveJourneyQueue5 !== "PARKED"
  ) {
    throw new ScientificBenchmarkRegistryError("Human queue #2/#4/#5 must remain PARKED");
  }
  if (
    !manifest.honesty.noParallelEvalPlatform ||
    !manifest.honesty.m1ThroughM6NotScientificallyValidated ||
    !manifest.honesty.llmJudgeNotSoleAuthority ||
    !manifest.honesty.noPublicMarketingValidationClaim
  ) {
    throw new ScientificBenchmarkRegistryError("Registry honesty flags violated");
  }

  const {inventoryHash, ...body} = manifest;
  const expected = digest(body);
  if (inventoryHash !== expected) {
    throw new ScientificBenchmarkRegistryError("scientific benchmark registry inventory hash mismatch");
  }
  return manifest;
}

/** Exposed expert reference for a case — always sealed/null; fail-closed if mutated. */
export function exposeExpertReferenceForEvaluation(
  benchmarkCase: ScientificBenchmarkCase,
): ExpertReferenceAssessment {
  if (benchmarkCase.expertReferenceAssessment.payload !== null) {
    throw new ScientificBenchmarkRegistryError(
      "Refusing to expose non-null expert reference — leakage risk",
    );
  }
  return benchmarkCase.expertReferenceAssessment;
}

export function assertNoHeldOutLeakage(manifest: ScientificBenchmarkRegistryManifest): void {
  parseScientificBenchmarkRegistry(manifest);
  for (const benchmarkCase of manifest.cases) {
    if (benchmarkCase.partition !== "held_out") continue;
    if (benchmarkCase.expertReferenceAssessment.payload !== null) {
      throw new ScientificBenchmarkRegistryError("Held-out expert payload must be null");
    }
    if (
      benchmarkCase.expertReferenceAssessment.injectableIntoPrompts ||
      benchmarkCase.expertReferenceAssessment.injectableIntoRetrievalIndexes ||
      benchmarkCase.expertReferenceAssessment.injectableIntoModelTuning
    ) {
      throw new ScientificBenchmarkRegistryError("Held-out leakage flags must stay false");
    }
  }
  if (manifest.heldOutFrozen) {
    throw new ScientificBenchmarkRegistryError("heldOutFrozen must remain false until SME freeze");
  }
}

export function classifyReleaseGate(input: {
  engineeringScaffoldCleared: boolean;
  scientificAcceptanceCleared: boolean;
  criticalBlockersPresent: boolean;
}): ScientificReleaseGateClassification {
  if (input.criticalBlockersPresent || !input.engineeringScaffoldCleared) {
    return "not_ready";
  }
  if (!input.scientificAcceptanceCleared) {
    return "scientific_evaluation_pending";
  }
  // Scientific acceptance cleared is a future human decision — never auto-promote to pilot here.
  return "scientific_evaluation_pending";
}

/** Canonical 120-case acceptance profile; old R2/M7 inventories are authoring aliases, not additional final cases. */
export const IMMUNO_ACCEPTANCE_PROFILE_PATH="evaluation/independent-evaluation/immuno-v1" as const;
