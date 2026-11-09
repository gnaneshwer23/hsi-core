/**
 * PR 8 — Independent evaluation suites (deterministic · live · scientific).
 *
 * Three separate suites that must NOT be conflated:
 * 1. Deterministic regression — schema, permissions, state transitions, failures (CI).
 * 2. Live integration — real provider queries / persistence / brief (env-gated scaffold).
 * 3. Scientific evaluation — blinded expert slots + scorecard contracts (empty until SME).
 *
 * Never invents live E2E scientific validation, SME gold scores, Gate C, MoU, or CDS/PHI.
 * CI green ≠ scientific validity. Extends R2 / Phase E / N6 honesty — no parallel eval platform.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
} from "./livingEvidenceExpansion";
import {SSC_INITIAL_PMIDS} from "../evidenceIngestion";

export const INDEPENDENT_EVAL_PROGRAMME = "backend_scientific_intelligence" as const;
export const INDEPENDENT_EVAL_PHASE = "PR8" as const;
export const INDEPENDENT_EVAL_SUITE_VERSION = "1.1.0" as const;
export const INDEPENDENT_EVAL_MANIFEST_SCHEMA =
  "hsi-independent-evaluation-suites-1" as const;

/** Env flag that must be set for live integration runs (never implied by CI). */
export const LIVE_INTEGRATION_ENV_FLAG = "HSI_LIVE_INTEGRATION_EVAL" as const;

export type EvalSuiteId =
  | "deterministic_regression"
  | "live_integration"
  | "scientific_evaluation";

export type ScorecardDimensionId =
  | "citation_correctness"
  | "citation_supports_statement"
  | "biological_context_accuracy"
  | "contradiction_retrieval"
  | "gap_assessment_precision"
  | "abstention_quality"
  | "unsupported_claim"
  | "brief_completeness"
  | "expert_rated_research_usefulness";

/** Expected sealed scorecard length — null values until SME (#4). */
export const SCIENTIFIC_SCORECARD_DIMENSION_COUNT = 9 as const;

/** Orthogonal failure modes — must stay distinct in suite design. */
export type ScientificFailureModeId =
  | "citation_points_to_real_source"
  | "citation_supports_statement"
  | "retrieved_evidence_matches_species_tissue_context"
  | "overall_conclusion_justified";

export type ScorecardField = {
  dimensionId: ScorecardDimensionId;
  /** Null until humans / live runs supply evidence — never invent. */
  value: null;
  labelledDenominator: 0;
  thresholdApproved: false;
  scientificAccuracy: null;
  notes: string;
};

export type FailureModeContract = {
  modeId: ScientificFailureModeId;
  distinctFrom: ScientificFailureModeId[];
  description: string;
  /** Engineering can assert the taxonomy exists; scoring stays human. */
  taxonomyContractTestable: true;
  scored: false;
};

export type WalkthroughQuestionDomain =
  | "autoimmune"
  | "inflammatory"
  | "translational"
  | "fibrosis"
  | "gut_immune_metabolic"
  | "contradiction"
  | "gap"
  | "abstention";

export type WalkthroughQuestion = {
  questionId: string;
  domain: WalkthroughQuestionDomain;
  question: string;
  /** Explicit: must not embed living-evidence / SSC fixture pins. */
  embedsPinnedFixtureIds: false;
  speciesHint: "human" | "mouse" | "mixed_unspecified";
  tissueHint: string;
  notes: string;
};

/** Domains required by the refined-brief scientific_benchmark_v1 scaffold. */
export const REQUIRED_BENCHMARK_QUESTION_DOMAINS: readonly WalkthroughQuestionDomain[] = [
  "autoimmune",
  "inflammatory",
  "translational",
  "fibrosis",
  "gut_immune_metabolic",
  "contradiction",
  "gap",
  "abstention",
] as const;

export type ResearcherWorkflowComparisonSlot = {
  questionId: string;
  arms: ["hsi_assisted", "conventional_researcher"];
  informationAccessComparable: true;
  /** Quality and time budgets recorded separately — never conflated into one score. */
  reportQualitySeparately: true;
  reportTimeBudgetSeparately: true;
  qualityScore: null;
  timeBudgetMinutes: null;
  recordedAt: null;
  recorder: null;
};

export type DeterministicRegressionSuite = {
  suiteId: "deterministic_regression";
  purpose: "schema_permissions_state_transitions_failure_handling";
  releaseEvidence: "reproducible_ci_results";
  status: "ENGINEERING_CLEARED";
  scientificValidityClaimed: false;
  contracts: Array<{
    contractId: string;
    description: string;
    ciRunnable: true;
    evidencePath: string;
  }>;
};

export type LiveIntegrationSuite = {
  suiteId: "live_integration";
  purpose: "real_provider_queries_persistence_brief_generation";
  releaseEvidence: "timestamped_runs_and_source_records";
  /** Default offline: gated; never fake live success. */
  status: "GATED_NOT_RUN" | "LIVE_ATTEMPTED";
  gate: {
    envFlag: typeof LIVE_INTEGRATION_ENV_FLAG;
    requireExplicitOptIn: true;
    ciMustNotEnable: true;
  };
  scientificValidityClaimed: false;
  liveSuccessClaimed: false;
  walkthroughHooks: Array<{
    hookId: string;
    stage: string;
    description: string;
    lastRunAt: null | string;
    lastOutcome: "not_run" | "skipped_gate" | "ok" | "failed_honest";
    sourceRecordIds: string[];
  }>;
  honestFailurePolicy: {
    reportProviderFailures: true;
    neverClaimSuccessWithoutTimestampedRun: true;
    neverTreatCiGreenAsLiveSuccess: true;
  };
};

export type ScientificEvaluationSuite = {
  suiteId: "scientific_evaluation";
  purpose: "context_claim_support_contradictions_usefulness";
  releaseEvidence: "blinded_expert_review_slots";
  status: "AWAITING_SME";
  scientificValidityClaimed: false;
  smeSlotsFilled: 0;
  inventScoresPermitted: false;
  scorecard: ScorecardField[];
  failureModeContracts: FailureModeContract[];
  expertReviewSlots: Array<{
    slotId: string;
    role: "sme_a" | "sme_b" | "adjudicator";
    filled: false;
    reviewerId: null;
    ratings: null;
  }>;
  researcherWorkflowComparison: {
    status: "scaffold";
    slots: ResearcherWorkflowComparisonSlot[];
  };
  representativeQuestions: WalkthroughQuestion[];
};

export type IndependentEvaluationSuitesManifest = {
  schemaVersion: typeof INDEPENDENT_EVAL_MANIFEST_SCHEMA;
  phase: typeof INDEPENDENT_EVAL_PHASE;
  programme: typeof INDEPENDENT_EVAL_PROGRAMME;
  suiteVersion: typeof INDEPENDENT_EVAL_SUITE_VERSION;
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  liveJourneyAcceptance: "BLOCKED";
  productionReadinessClaimed: false;
  ciGreenIsNotScientificValidity: true;
  gateCAutoApprove: false;
  legalBinding: false;
  inventSmeScoresPermitted: false;
  containsPhi: false;
  graphPromotable: false;
  redWaveOnly: true;
  suites: {
    deterministic: DeterministicRegressionSuite;
    live: LiveIntegrationSuite;
    scientific: ScientificEvaluationSuite;
  };
  /** Explicit non-conflation of the three suites. */
  suiteSeparation: {
    deterministicIsNotLive: true;
    deterministicIsNotScientific: true;
    liveIsNotScientific: true;
    ciPassDoesNotClearScience: true;
  };
  humanQueueBlocked: {
    rightsQueue2: "PARKED";
    smeQueue4: "PARKED";
    liveJourneyQueue5: "PARKED";
  };
  honesty: {
    noInventedLiveE2eValidation: true;
    noInventedSmeGold: true;
    noFakeLiveSuccess: true;
    noGateCAutoApprove: true;
    noInventedMoU: true;
    noLiveCdsPhi: true;
    fixturesAreNotLiveScience: true;
  };
  parkedHumanResiduals: string[];
  stopNote: string;
  inventoryHash: string;
};

export class IndependentEvaluationSuitesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IndependentEvaluationSuitesError";
  }
}

const PINNED_FIXTURE_IDS = new Set<string>([
  ...LIVING_EVIDENCE_PMID_PINS,
  ...SSC_INITIAL_PMIDS,
  ...LIVING_EVIDENCE_NCT_PINS,
  ...LIVING_EVIDENCE_DISEASE_PINS,
]);

/** Representative walkthrough questions — deliberately unpinned; one slot per benchmark domain. */
export const REPRESENTATIVE_WALKTHROUGH_QUESTIONS: readonly WalkthroughQuestion[] = [
  {
    questionId: "IEW-AI-001",
    domain: "autoimmune",
    question:
      "What human evidence links type I interferon pathway activity to cutaneous versus renal disease activity in systemic lupus erythematosus, and where do studies disagree?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "skin_and_kidney",
    notes: "Unpinned SLE interferon / tissue-context question for walkthrough checklist.",
  },
  {
    questionId: "IEW-IN-002",
    domain: "inflammatory",
    question:
      "Which human intestinal barrier and microbiome-associated findings are reported for ulcerative colitis relapse risk, and which opposing or null results should be retrieved?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "intestinal_mucosa",
    notes: "IBD barrier / inflammatory question without living-evidence PMID pins.",
  },
  {
    questionId: "IEW-TR-003",
    domain: "translational",
    question:
      "For IL-17 / IL-23 pathway inhibitors in plaque psoriasis, what registry-reported outcomes exist versus peer-reviewed efficacy claims, and what evidence remains missing?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "skin",
    notes: "Translational registry-vs-publication question; registration ≠ efficacy.",
  },
  {
    questionId: "IEW-FX-004",
    domain: "fibrosis",
    question:
      "What evidence supports or contradicts fibroblast activation protein as a fibrosis-relevant target in systemic sclerosis interstitial lung disease, across human tissue versus mouse models?",
    embedsPinnedFixtureIds: false,
    speciesHint: "mixed_unspecified",
    tissueHint: "lung",
    notes: "Fibrosis / species-tissue mismatch probe — distinct from citation identity correctness.",
  },
  {
    questionId: "IEW-GM-005",
    domain: "gut_immune_metabolic",
    question:
      "Which human studies link gut barrier integrity, microbial metabolites, and mucosal immune signalling to type 2 diabetes risk, and which findings remain correlative only?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "gut_and_metabolic",
    notes: "Gut–immune–metabolic programme slot; fixtures structural only — no SME ratings.",
  },
  {
    questionId: "IEW-CX-006",
    domain: "contradiction",
    question:
      "For anti-IL-6 pathway interventions in rheumatoid synovitis, which peer-reviewed findings report benefit versus null or opposing results that a researcher should surface side by side?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "synovium",
    notes: "Contradiction-retrieval slot; opposing/null findings must stay distinct from citation identity.",
  },
  {
    questionId: "IEW-GP-007",
    domain: "gap",
    question:
      "After surveying human evidence on tissue-resident memory T cells in psoriasis, which coverage gaps remain, and which claims would incorrectly treat incomplete search as verified novelty?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "skin",
    notes: "Gap-assessment precision slot; coverage incompleteness ≠ scientific novelty.",
  },
  {
    questionId: "IEW-AB-008",
    domain: "abstention",
    question:
      "In axial spondyloarthritis, which human studies associate IL-23 axis signalling with axial inflammation, and when should the system abstain for insufficient evidence?",
    embedsPinnedFixtureIds: false,
    speciesHint: "human",
    tissueHint: "axial_skeleton",
    notes: "Abstention-quality probe; not covered by pinned living-evidence fixtures.",
  },
] as const;

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function emptyScorecard(): ScorecardField[] {
  return [
    {
      dimensionId: "citation_correctness",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Points to a real source identity (PMID/DOI/NCT) — distinct from support.",
    },
    {
      dimensionId: "citation_supports_statement",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Cited source actually supports the associated statement — distinct from identity.",
    },
    {
      dimensionId: "biological_context_accuracy",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Species / tissue / experimental system match the question context.",
    },
    {
      dimensionId: "contradiction_retrieval",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Opposing or null findings surfaced when present in searchable literature.",
    },
    {
      dimensionId: "gap_assessment_precision",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Coverage incompleteness ≠ verified novelty; taxonomy classes stay distinct.",
    },
    {
      dimensionId: "abstention_quality",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Appropriate abstention when evidence is insufficient — not overclaim.",
    },
    {
      dimensionId: "unsupported_claim",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Substantive claims without source support — distinct from citation identity or abstention.",
    },
    {
      dimensionId: "brief_completeness",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Research brief covers required output elements for the workflow — not scientific validity.",
    },
    {
      dimensionId: "expert_rated_research_usefulness",
      value: null,
      labelledDenominator: 0,
      thresholdApproved: false,
      scientificAccuracy: null,
      notes: "Blinded expert usefulness slots — human queue #4 PARKED; never invent ratings.",
    },
  ];
}

function failureModeContracts(): FailureModeContract[] {
  return [
    {
      modeId: "citation_points_to_real_source",
      distinctFrom: [
        "citation_supports_statement",
        "retrieved_evidence_matches_species_tissue_context",
        "overall_conclusion_justified",
      ],
      description: "External id resolves to a real provider record.",
      taxonomyContractTestable: true,
      scored: false,
    },
    {
      modeId: "citation_supports_statement",
      distinctFrom: [
        "citation_points_to_real_source",
        "retrieved_evidence_matches_species_tissue_context",
        "overall_conclusion_justified",
      ],
      description: "Resolved source semantically supports the claim statement.",
      taxonomyContractTestable: true,
      scored: false,
    },
    {
      modeId: "retrieved_evidence_matches_species_tissue_context",
      distinctFrom: [
        "citation_points_to_real_source",
        "citation_supports_statement",
        "overall_conclusion_justified",
      ],
      description: "Evidence biological context matches the researcher question.",
      taxonomyContractTestable: true,
      scored: false,
    },
    {
      modeId: "overall_conclusion_justified",
      distinctFrom: [
        "citation_points_to_real_source",
        "citation_supports_statement",
        "retrieved_evidence_matches_species_tissue_context",
      ],
      description: "Aggregate conclusion is justified by assessed evidence — not identity alone.",
      taxonomyContractTestable: true,
      scored: false,
    },
  ];
}

export function assertQuestionsAvoidPinnedFixtures(
  questions: readonly WalkthroughQuestion[],
): void {
  for (const q of questions) {
    if (q.embedsPinnedFixtureIds !== false) {
      throw new IndependentEvaluationSuitesError(
        `Question ${q.questionId} must declare embedsPinnedFixtureIds=false`,
      );
    }
    for (const pin of PINNED_FIXTURE_IDS) {
      if (q.question.includes(pin) || q.questionId.includes(pin)) {
        throw new IndependentEvaluationSuitesError(
          `Walkthrough question ${q.questionId} must not embed pinned fixture id ${pin}`,
        );
      }
    }
  }
}

export function assertBenchmarkDomainCoverage(
  questions: readonly WalkthroughQuestion[],
): void {
  const present = new Set(questions.map((q) => q.domain));
  for (const domain of REQUIRED_BENCHMARK_QUESTION_DOMAINS) {
    if (!present.has(domain)) {
      throw new IndependentEvaluationSuitesError(
        `Scientific benchmark requires a representative question slot for domain ${domain}`,
      );
    }
  }
}

/** Whether the live integration suite may attempt provider calls. */
export function isLiveIntegrationGateOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[LIVE_INTEGRATION_ENV_FLAG] === "1" || env[LIVE_INTEGRATION_ENV_FLAG] === "true";
}

export type LiveIntegrationAttemptReceipt = {
  schemaVersion: "hsi-live-integration-attempt-1";
  attemptedAt: string;
  gateOpen: boolean;
  status: "skipped_gate" | "attempted";
  liveSuccessClaimed: false;
  scientificValidityClaimed: false;
  stages: Array<{
    hookId: string;
    outcome: "skipped_gate" | "ok" | "failed_honest";
    detail: string;
    sourceRecordIds: string[];
  }>;
  note: string;
};

/**
 * Live walkthrough scaffold. Without the env gate, returns an honest skipped receipt.
 * With the gate open, records an attempted structure — callers must supply real stage
 * outcomes; this helper never invents successful provider results.
 */
export function buildLiveIntegrationAttemptReceipt(input: {
  attemptedAt: string;
  gateOpen: boolean;
  /** Optional real stage outcomes when gate is open; empty → failed_honest placeholders. */
  stageOutcomes?: Array<{
    hookId: string;
    outcome: "ok" | "failed_honest";
    detail: string;
    sourceRecordIds?: string[];
  }>;
}): LiveIntegrationAttemptReceipt {
  if (!input.gateOpen) {
    return {
      schemaVersion: "hsi-live-integration-attempt-1",
      attemptedAt: input.attemptedAt,
      gateOpen: false,
      status: "skipped_gate",
      liveSuccessClaimed: false,
      scientificValidityClaimed: false,
      stages: [
        {
          hookId: "provider_query",
          outcome: "skipped_gate",
          detail: `Set ${LIVE_INTEGRATION_ENV_FLAG}=1 to attempt live provider queries.`,
          sourceRecordIds: [],
        },
        {
          hookId: "persist_metadata",
          outcome: "skipped_gate",
          detail: "Persistence not attempted while gate closed.",
          sourceRecordIds: [],
        },
        {
          hookId: "research_brief",
          outcome: "skipped_gate",
          detail: "Brief generation not attempted while gate closed.",
          sourceRecordIds: [],
        },
      ],
      note: "Live suite gated. Skipping is not live success. CI must not open this gate.",
    };
  }

  const defaults = [
    {
      hookId: "provider_query",
      outcome: "failed_honest" as const,
      detail:
        "Gate open but no timestamped provider outcomes supplied — refuse silent success.",
      sourceRecordIds: [] as string[],
    },
    {
      hookId: "persist_metadata",
      outcome: "failed_honest" as const,
      detail: "No persistence evidence supplied for this attempt.",
      sourceRecordIds: [] as string[],
    },
    {
      hookId: "research_brief",
      outcome: "failed_honest" as const,
      detail: "No brief generation evidence supplied for this attempt.",
      sourceRecordIds: [] as string[],
    },
  ];

  const byId = new Map((input.stageOutcomes ?? []).map((s) => [s.hookId, s]));
  const stages = defaults.map((d) => {
    const supplied = byId.get(d.hookId);
    if (!supplied) return d;
    return {
      hookId: supplied.hookId,
      outcome: supplied.outcome,
      detail: supplied.detail,
      sourceRecordIds: supplied.sourceRecordIds ?? [],
    };
  });

  return {
    schemaVersion: "hsi-live-integration-attempt-1",
    attemptedAt: input.attemptedAt,
    gateOpen: true,
    status: "attempted",
    liveSuccessClaimed: false,
    scientificValidityClaimed: false,
    stages,
    note:
      "Live attempt recorded honestly. liveSuccessClaimed remains false until humans verify timestamped source records. Scientific validity remains blocked.",
  };
}

export function buildIndependentEvaluationSuites(input: {
  generatedAt: string;
  liveGateOpen?: boolean;
  liveAttempt?: LiveIntegrationAttemptReceipt | null;
  checklistPublished?: boolean;
  limitationsReportPublished?: boolean;
  repoRoot?: string;
}): IndependentEvaluationSuitesManifest {
  const root = input.repoRoot ?? resolve(import.meta.dir, "../..");
  const checklistPath = resolve(
    root,
    "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md",
  );
  const matrixPath = resolve(
    root,
    "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_INTEGRATION_MATRIX.md",
  );
  const limitationsPublished =
    input.limitationsReportPublished ?? existsSync(checklistPath);
  if (!existsSync(matrixPath)) {
    throw new IndependentEvaluationSuitesError(
      "Integration matrix must exist under docs/engineering/",
    );
  }
  void input.checklistPublished;

  assertQuestionsAvoidPinnedFixtures(REPRESENTATIVE_WALKTHROUGH_QUESTIONS);
  assertBenchmarkDomainCoverage(REPRESENTATIVE_WALKTHROUGH_QUESTIONS);

  const liveGateOpen = input.liveGateOpen ?? false;
  const liveAttempt =
    input.liveAttempt ??
    buildLiveIntegrationAttemptReceipt({
      attemptedAt: input.generatedAt,
      gateOpen: liveGateOpen,
    });

  const liveHooks: LiveIntegrationSuite["walkthroughHooks"] = liveAttempt.stages.map(
    (s) => ({
      hookId: s.hookId,
      stage: s.hookId,
      description:
        s.hookId === "provider_query"
          ? "Real Europe PMC / Open Targets / CT.gov queries for unpinned walkthrough questions"
          : s.hookId === "persist_metadata"
            ? "Persist permitted metadata into candidate store (red-wave; write-gated)"
            : "Generate source-linked research brief without efficacy/eligibility inference",
      lastRunAt: liveAttempt.status === "skipped_gate" ? null : liveAttempt.attemptedAt,
      lastOutcome: s.outcome,
      sourceRecordIds: s.sourceRecordIds,
    }),
  );

  const researcherSlots: ResearcherWorkflowComparisonSlot[] =
    REPRESENTATIVE_WALKTHROUGH_QUESTIONS.map((q) => ({
      questionId: q.questionId,
      arms: ["hsi_assisted", "conventional_researcher"],
      informationAccessComparable: true,
      reportQualitySeparately: true,
      reportTimeBudgetSeparately: true,
      qualityScore: null,
      timeBudgetMinutes: null,
      recordedAt: null,
      recorder: null,
    }));

  const deterministic: DeterministicRegressionSuite = {
    suiteId: "deterministic_regression",
    purpose: "schema_permissions_state_transitions_failure_handling",
    releaseEvidence: "reproducible_ci_results",
    status: "ENGINEERING_CLEARED",
    scientificValidityClaimed: false,
    contracts: [
      {
        contractId: "phase1_state_non_conflation",
        description:
          "Source identity ≠ content access ≠ claim support ≠ scientific review states",
        ciRunnable: true,
        evidencePath: "test/backendScientificIntelligencePhase1Acceptance.test.ts",
      },
      {
        contractId: "provider_fail_not_empty",
        description: "provider_unavailable must not become successful empty / no evidence",
        ciRunnable: true,
        evidencePath: "test/dynamicEvidenceRetrieval.test.ts",
      },
      {
        contractId: "review_gate_intact",
        description: "validateScientificReview refuses unauthenticated / incomplete reviews",
        ciRunnable: true,
        evidencePath: "test/scientificReview.test.ts",
      },
      {
        contractId: "release_assessment_fail_closed",
        description: "assessReleaseClaim never auto-promotes draft living candidates",
        ciRunnable: true,
        evidencePath: "test/graphRelease.test.ts",
      },
      {
        contractId: "r2_sme_gold_empty",
        description: "R2 worksheets stay empty; scientificAcceptance=BLOCKED",
        ciRunnable: true,
        evidencePath: "test/r2GoldEvaluationSuite.test.ts",
      },
      {
        contractId: "scorecard_and_failure_mode_taxonomy",
        description:
          "PR 8 scorecard dimensions + orthogonal failure modes exist as contracts",
        ciRunnable: true,
        evidencePath: "test/independentEvaluationSuites.test.ts",
      },
      {
        contractId: "scientific_benchmark_v1_alias",
        description:
          "evaluation/scientific_benchmark_v1 aliases independent-evaluation (no parallel platform)",
        ciRunnable: true,
        evidencePath: "test/scientificBenchmarkV1.test.ts",
      },
      {
        contractId: "limitations_report_published",
        description: "Limitations report documents fixture-only / blocked / scientific limits",
        ciRunnable: true,
        evidencePath: limitationsPublished
          ? "docs/engineering/BACKEND_SCIENTIFIC_INTELLIGENCE_LIMITATIONS_REPORT.md"
          : "MISSING",
      },
    ],
  };

  const live: LiveIntegrationSuite = {
    suiteId: "live_integration",
    purpose: "real_provider_queries_persistence_brief_generation",
    releaseEvidence: "timestamped_runs_and_source_records",
    status: liveAttempt.status === "skipped_gate" ? "GATED_NOT_RUN" : "LIVE_ATTEMPTED",
    gate: {
      envFlag: LIVE_INTEGRATION_ENV_FLAG,
      requireExplicitOptIn: true,
      ciMustNotEnable: true,
    },
    scientificValidityClaimed: false,
    liveSuccessClaimed: false,
    walkthroughHooks: liveHooks,
    honestFailurePolicy: {
      reportProviderFailures: true,
      neverClaimSuccessWithoutTimestampedRun: true,
      neverTreatCiGreenAsLiveSuccess: true,
    },
  };

  const scientific: ScientificEvaluationSuite = {
    suiteId: "scientific_evaluation",
    purpose: "context_claim_support_contradictions_usefulness",
    releaseEvidence: "blinded_expert_review_slots",
    status: "AWAITING_SME",
    scientificValidityClaimed: false,
    smeSlotsFilled: 0,
    inventScoresPermitted: false,
    scorecard: emptyScorecard(),
    failureModeContracts: failureModeContracts(),
    expertReviewSlots: [
      {slotId: "sme_a", role: "sme_a", filled: false, reviewerId: null, ratings: null},
      {slotId: "sme_b", role: "sme_b", filled: false, reviewerId: null, ratings: null},
      {
        slotId: "adjudicator",
        role: "adjudicator",
        filled: false,
        reviewerId: null,
        ratings: null,
      },
    ],
    researcherWorkflowComparison: {
      status: "scaffold",
      slots: researcherSlots,
    },
    representativeQuestions: [...REPRESENTATIVE_WALKTHROUGH_QUESTIONS],
  };

  if (!limitationsPublished) {
    throw new IndependentEvaluationSuitesError(
      "Limitations report must be published under docs/engineering/ before sealing PR 8 manifest",
    );
  }

  const body: Omit<IndependentEvaluationSuitesManifest, "inventoryHash"> = {
    schemaVersion: INDEPENDENT_EVAL_MANIFEST_SCHEMA,
    phase: INDEPENDENT_EVAL_PHASE,
    programme: INDEPENDENT_EVAL_PROGRAMME,
    suiteVersion: INDEPENDENT_EVAL_SUITE_VERSION,
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    liveJourneyAcceptance: "BLOCKED",
    productionReadinessClaimed: false,
    ciGreenIsNotScientificValidity: true,
    gateCAutoApprove: false,
    legalBinding: false,
    inventSmeScoresPermitted: false,
    containsPhi: false,
    graphPromotable: false,
    redWaveOnly: true,
    suites: {deterministic, live, scientific},
    suiteSeparation: {
      deterministicIsNotLive: true,
      deterministicIsNotScientific: true,
      liveIsNotScientific: true,
      ciPassDoesNotClearScience: true,
    },
    humanQueueBlocked: {
      rightsQueue2: "PARKED",
      smeQueue4: "PARKED",
      liveJourneyQueue5: "PARKED",
    },
    honesty: {
      noInventedLiveE2eValidation: true,
      noInventedSmeGold: true,
      noFakeLiveSuccess: true,
      noGateCAutoApprove: true,
      noInventedMoU: true,
      noLiveCdsPhi: true,
      fixturesAreNotLiveScience: true,
    },
    parkedHumanResiduals: [
      "#2 N1 rights",
      "#4 SMEs",
      "#5 live researcher journey",
      "#8 MoU",
    ],
    stopNote:
      "Independent evaluation v1.1 scaffold (scientific_benchmark_v1 alias). Three suites stay separate. Deterministic CI ≠ live success ≠ scientific validity. SME gold slots empty; live integration gated; production readiness not claimed. Human queue #2/#4/#5 remain PARKED.",
  };

  return {...body, inventoryHash: digest(body)};
}

export function parseIndependentEvaluationSuites(
  value: unknown,
): IndependentEvaluationSuitesManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new IndependentEvaluationSuitesError("Invalid independent evaluation suites manifest");
  }
  const manifest = value as IndependentEvaluationSuitesManifest;
  if (
    manifest.schemaVersion !== INDEPENDENT_EVAL_MANIFEST_SCHEMA ||
    manifest.phase !== INDEPENDENT_EVAL_PHASE ||
    manifest.programme !== INDEPENDENT_EVAL_PROGRAMME ||
    manifest.suiteVersion !== INDEPENDENT_EVAL_SUITE_VERSION
  ) {
    throw new IndependentEvaluationSuitesError(
      "Unsupported independent evaluation suites schema",
    );
  }
  if (
    manifest.engineeringScaffold !== "CLEARED" ||
    manifest.scientificAcceptance !== "BLOCKED" ||
    manifest.rightsAcceptance !== "BLOCKED" ||
    manifest.liveJourneyAcceptance !== "BLOCKED" ||
    manifest.productionReadinessClaimed !== false ||
    manifest.ciGreenIsNotScientificValidity !== true ||
    manifest.gateCAutoApprove !== false ||
    manifest.legalBinding !== false ||
    manifest.inventSmeScoresPermitted !== false ||
    manifest.containsPhi !== false ||
    manifest.graphPromotable !== false ||
    manifest.redWaveOnly !== true
  ) {
    throw new IndependentEvaluationSuitesError(
      "Manifest cannot claim scientific acceptance, live journey clearance, or production readiness",
    );
  }

  const {deterministic, live, scientific} = manifest.suites;
  if (deterministic.suiteId !== "deterministic_regression") {
    throw new IndependentEvaluationSuitesError("Deterministic suite id mismatch");
  }
  if (deterministic.scientificValidityClaimed !== false) {
    throw new IndependentEvaluationSuitesError(
      "Deterministic suite must not claim scientific validity",
    );
  }
  if (live.suiteId !== "live_integration" || live.liveSuccessClaimed !== false) {
    throw new IndependentEvaluationSuitesError(
      "Live suite must keep liveSuccessClaimed=false in sealed scaffold",
    );
  }
  if (live.scientificValidityClaimed !== false) {
    throw new IndependentEvaluationSuitesError("Live suite must not claim scientific validity");
  }
  if (live.gate.envFlag !== LIVE_INTEGRATION_ENV_FLAG || live.gate.ciMustNotEnable !== true) {
    throw new IndependentEvaluationSuitesError("Live suite gate must stay explicit and CI-off");
  }
  if (
    scientific.suiteId !== "scientific_evaluation" ||
    scientific.smeSlotsFilled !== 0 ||
    scientific.inventScoresPermitted !== false ||
    scientific.scientificValidityClaimed !== false ||
    scientific.status !== "AWAITING_SME"
  ) {
    throw new IndependentEvaluationSuitesError(
      "Scientific suite must stay AWAITING_SME with empty slots",
    );
  }
  if (scientific.scorecard.some((s) => s.value !== null || s.scientificAccuracy !== null)) {
    throw new IndependentEvaluationSuitesError("Scorecard values must remain null placeholders");
  }
  if (scientific.scorecard.length !== SCIENTIFIC_SCORECARD_DIMENSION_COUNT) {
    throw new IndependentEvaluationSuitesError(
      `Expected ${SCIENTIFIC_SCORECARD_DIMENSION_COUNT} scorecard dimensions`,
    );
  }
  if (scientific.failureModeContracts.length !== 4) {
    throw new IndependentEvaluationSuitesError("Expected four orthogonal failure-mode contracts");
  }
  if (scientific.failureModeContracts.some((f) => f.scored !== false)) {
    throw new IndependentEvaluationSuitesError("Failure modes must remain unscored until SME");
  }
  if (scientific.expertReviewSlots.some((s) => s.filled || s.reviewerId !== null)) {
    throw new IndependentEvaluationSuitesError("Expert review slots must stay empty");
  }
  for (const slot of scientific.researcherWorkflowComparison.slots) {
    if (slot.qualityScore !== null || slot.timeBudgetMinutes !== null) {
      throw new IndependentEvaluationSuitesError(
        "Researcher workflow comparison slots must stay empty (quality and time separate)",
      );
    }
  }
  assertQuestionsAvoidPinnedFixtures(scientific.representativeQuestions);
  assertBenchmarkDomainCoverage(scientific.representativeQuestions);
  if (
    !manifest.suiteSeparation.deterministicIsNotLive ||
    !manifest.suiteSeparation.deterministicIsNotScientific ||
    !manifest.suiteSeparation.liveIsNotScientific ||
    !manifest.suiteSeparation.ciPassDoesNotClearScience
  ) {
    throw new IndependentEvaluationSuitesError("Suite separation honesty flags must stay true");
  }
  if (
    manifest.humanQueueBlocked.rightsQueue2 !== "PARKED" ||
    manifest.humanQueueBlocked.smeQueue4 !== "PARKED" ||
    manifest.humanQueueBlocked.liveJourneyQueue5 !== "PARKED"
  ) {
    throw new IndependentEvaluationSuitesError("Human queue #2/#4/#5 must remain PARKED");
  }
  if (typeof manifest.stopNote !== "string" || manifest.stopNote.length < 20) {
    throw new IndependentEvaluationSuitesError("Manifest must include an explicit STOP note");
  }

  const {inventoryHash, ...body} = manifest;
  const expected = digest(body);
  if (inventoryHash !== expected) {
    throw new IndependentEvaluationSuitesError(
      "Independent evaluation suites inventory hash mismatch",
    );
  }
  return manifest;
}

/** Offline helper used by tests — load sealed on-disk STATUS when present. */
export function loadIndependentEvalStatusIfPresent(repoRoot: string): unknown | null {
  const path = resolve(repoRoot, "evaluation/independent-evaluation/STATUS.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}
