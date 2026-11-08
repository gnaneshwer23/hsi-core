/**
 * HSI Gold Evaluation Suite v1 — extends research-readiness / Phase E contracts.
 *
 * Engineering scaffold only. The 50-question bank stays draft. SME/expert gold
 * labels, licensed packets, and scientific scores remain empty slots.
 * Never invents labels, freezes held-out gold, or activates models.
 */
import {createHash} from "node:crypto";
import {canonicalGraphContext} from "./investigationGraphContext";
import {
  ASSISTANCE_METHOD,
  PROMPT_VERSION,
  SOURCE_SELECTION_INSTRUCTIONS,
} from "./scientificEvaluation";
import {parseQuestionDesignBank, prepareResearchReadiness} from "./researchReadiness";

export const GOLD_EVAL_SUITE_SCHEMA = "hsi-gold-evaluation-suite-1" as const;
export const GOLD_EVAL_SUITE_ID = "hsi-gold-evaluation-suite-v1" as const;
export const GOLD_EVAL_SUITE_VERSION = "1.0.0" as const;

export const GOLD_EVAL_CAPABILITIES = [
  "versioned_licensed_packets",
  "claim_level_spans",
  "species_tissue_study_context",
  "supporting_opposing_null",
  "sme_annotation_adjudication_slots",
  "study_grouped_splits",
  "citation_and_semantic_support_eval",
  "context_mismatch_and_abstention",
  "baseline_vs_candidate",
  "immutable_manifests_and_reports",
] as const;

export type GoldEvalCapability = (typeof GOLD_EVAL_CAPABILITIES)[number];

export type GoldEvalCapabilitySlot = {
  capability: GoldEvalCapability;
  status: "scaffolded" | "awaiting_rights" | "awaiting_sme" | "awaiting_thresholds";
  filled: false;
  draftBankBound: boolean;
  inventLabelsPermitted: false;
  scientificGold: false;
  notes: string;
};

export type GoldEvalStudySplitSlot = {
  schemaVersion: "hsi-gold-study-split-1";
  status: "awaiting_packet_binding";
  developmentStudyIds: [];
  heldOutStudyIds: [];
  leakageControlsDocumented: false;
  frozen: false;
};

export type GoldEvalMetricSlot = {
  metricId:
    | "citation_correctness"
    | "semantic_support"
    | "context_mismatch_detection"
    | "abstention_accuracy"
    | "opposition_null_coverage"
    | "baseline_vs_candidate_delta";
  value: null;
  labelledDenominator: 0;
  thresholdApproved: false;
};

export type GoldEvalBaselineRegistry = {
  schemaVersion: "hsi-gold-baseline-registry-1";
  methods: Array<{
    id: string;
    kind: "deterministic_extractive" | "lexical_retrieval";
    version: string;
    promptVersion: string | null;
    promptHash: string | null;
    externalModelCalled: false;
    activationAllowed: false;
    scientificAccuracy: null;
  }>;
  candidateModel: {
    status: "not_configured";
    activationAllowed: false;
    provider: null;
    modelVersion: null;
  };
};

export type GoldEvaluationSuiteV1 = {
  schemaVersion: typeof GOLD_EVAL_SUITE_SCHEMA;
  id: typeof GOLD_EVAL_SUITE_ID;
  version: typeof GOLD_EVAL_SUITE_VERSION;
  purpose: "engineering_scaffold_only";
  draftBankId: string;
  draftBankVersion: string;
  draftBankHash: string;
  scientificGroundTruthEstablished: false;
  modelActivationAllowed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  inventLabelsPermitted: false;
  containsPhi: false;
  capabilities: GoldEvalCapabilitySlot[];
  studyGroupedSplits: GoldEvalStudySplitSlot;
  smeSlots: {
    annotatorA: "awaiting_sme";
    annotatorB: "awaiting_sme";
    adjudication: "awaiting_sme";
    authorityVerified: false;
    independentlyLabelledCases: 0;
  };
  metrics: GoldEvalMetricSlot[];
  baselines: GoldEvalBaselineRegistry;
  immutableManifest: {
    schemaVersion: "hsi-gold-immutable-manifest-1";
    suiteHash: string;
    readinessBankHash: string;
    phaseEReference: "evaluation/phase-e/engineering-cases.json";
    reportStatus: "scaffold_only";
    scientificValidityEstablished: false;
  };
  blockers: string[];
};

type Digest = (text: string) => Promise<string>;

function capabilityNotes(capability: GoldEvalCapability): string {
  switch (capability) {
    case "versioned_licensed_packets":
      return "Bind each draft case to a rights-cleared packet hash; packets stay empty until licensing.";
    case "claim_level_spans":
      return "Annotation rows reserve claim/passage span fields; no invented spans.";
    case "species_tissue_study_context":
      return "Draft bank already requires species/tissue/stage/cell/assay/dose/timepoint/cohort context.";
    case "supporting_opposing_null":
      return "Packet design must retain supporting, opposing and null observations without erasure.";
    case "sme_annotation_adjudication_slots":
      return "Two pending annotator slots + adjudication remain empty; authorityVerified=false.";
    case "study_grouped_splits":
      return "Study-family partitions reserved; held-out freeze blocked until packets + labels exist.";
    case "citation_and_semantic_support_eval":
      return "Citation correctness and semantic-support metrics stay null without SME labels.";
    case "context_mismatch_and_abstention":
      return "Phase E / N4 patterns cover mismatch + abstention; gold scores remain unmeasured.";
    case "baseline_vs_candidate":
      return "Deterministic + lexical baselines registered; candidate model not configured.";
    case "immutable_manifests_and_reports":
      return "Suite hash pins draft bank + readiness; reports stay scaffold_only.";
    default: {
      const _exhaustive: never = capability;
      return _exhaustive;
    }
  }
}

function capabilityStatus(capability: GoldEvalCapability): GoldEvalCapabilitySlot["status"] {
  switch (capability) {
    case "versioned_licensed_packets":
      return "awaiting_rights";
    case "sme_annotation_adjudication_slots":
    case "claim_level_spans":
    case "supporting_opposing_null":
    case "species_tissue_study_context":
      return "awaiting_sme";
    case "citation_and_semantic_support_eval":
    case "context_mismatch_and_abstention":
    case "baseline_vs_candidate":
      return "awaiting_thresholds";
    case "study_grouped_splits":
    case "immutable_manifests_and_reports":
      return "scaffolded";
    default: {
      const _exhaustive: never = capability;
      return _exhaustive;
    }
  }
}

export async function buildGoldEvaluationSuiteV1(
  bankValue: unknown,
  digest: Digest = async (s) => createHash("sha256").update(s).digest("hex"),
): Promise<GoldEvaluationSuiteV1> {
  const bank = parseQuestionDesignBank(bankValue);
  const readiness = await prepareResearchReadiness(bankValue, digest);
  const draftBankHash = readiness.readiness.bankHash;
  const promptHash = await digest(SOURCE_SELECTION_INSTRUCTIONS);
  const lexicalMethodId = "hsi-lexical-retrieval-baseline-1";
  const lexicalConfigHash = await digest(
    canonicalGraphContext({
      method: lexicalMethodId,
      tokenizer: "whitespace_lowercase",
      ranking: "term_overlap",
      externalProvider: false,
    }),
  );

  const capabilities: GoldEvalCapabilitySlot[] = GOLD_EVAL_CAPABILITIES.map((capability) => ({
    capability,
    status: capabilityStatus(capability),
    filled: false,
    draftBankBound: true,
    inventLabelsPermitted: false,
    scientificGold: false,
    notes: capabilityNotes(capability),
  }));

  const baselines: GoldEvalBaselineRegistry = {
    schemaVersion: "hsi-gold-baseline-registry-1",
    methods: [
      {
        id: "deterministic-extractive-baseline",
        kind: "deterministic_extractive",
        version: ASSISTANCE_METHOD,
        promptVersion: PROMPT_VERSION,
        promptHash,
        externalModelCalled: false,
        activationAllowed: false,
        scientificAccuracy: null,
      },
      {
        id: lexicalMethodId,
        kind: "lexical_retrieval",
        version: lexicalConfigHash.slice(0, 16),
        promptVersion: null,
        promptHash: lexicalConfigHash,
        externalModelCalled: false,
        activationAllowed: false,
        scientificAccuracy: null,
      },
    ],
    candidateModel: {
      status: "not_configured",
      activationAllowed: false,
      provider: null,
      modelVersion: null,
    },
  };

  const metrics: GoldEvalMetricSlot[] = [
    "citation_correctness",
    "semantic_support",
    "context_mismatch_detection",
    "abstention_accuracy",
    "opposition_null_coverage",
    "baseline_vs_candidate_delta",
  ].map((metricId) => ({
    metricId: metricId as GoldEvalMetricSlot["metricId"],
    value: null,
    labelledDenominator: 0,
    thresholdApproved: false,
  }));

  const skeleton = {
    schemaVersion: GOLD_EVAL_SUITE_SCHEMA,
    id: GOLD_EVAL_SUITE_ID,
    version: GOLD_EVAL_SUITE_VERSION,
    purpose: "engineering_scaffold_only" as const,
    draftBankId: bank.id,
    draftBankVersion: bank.version,
    draftBankHash,
    scientificGroundTruthEstablished: false as const,
    modelActivationAllowed: false as const,
    graphPromotable: false as const,
    gateCAutoApprove: false as const,
    legalBinding: false as const,
    inventLabelsPermitted: false as const,
    containsPhi: false as const,
    capabilities,
    studyGroupedSplits: {
      schemaVersion: "hsi-gold-study-split-1" as const,
      status: "awaiting_packet_binding" as const,
      developmentStudyIds: [] as [],
      heldOutStudyIds: [] as [],
      leakageControlsDocumented: false as const,
      frozen: false as const,
    },
    smeSlots: {
      annotatorA: "awaiting_sme" as const,
      annotatorB: "awaiting_sme" as const,
      adjudication: "awaiting_sme" as const,
      authorityVerified: false as const,
      independentlyLabelledCases: 0 as const,
    },
    metrics,
    baselines,
    blockers: [
      ...readiness.readiness.blockers,
      "Do not treat the 50-question draft bank as gold or invent SME labels.",
      "Evaluate candidate/hybrid extractors only on permitted datasets after rights + SME gates.",
      "Keep generative model activation and predictive biological validity claims blocked.",
    ],
  };

  const suiteHash = await digest(canonicalGraphContext(skeleton));
  return {
    ...skeleton,
    immutableManifest: {
      schemaVersion: "hsi-gold-immutable-manifest-1",
      suiteHash,
      readinessBankHash: draftBankHash,
      phaseEReference: "evaluation/phase-e/engineering-cases.json",
      reportStatus: "scaffold_only",
      scientificValidityEstablished: false,
    },
  };
}

export function parseGoldEvaluationSuiteV1(value: unknown): GoldEvaluationSuiteV1 {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid gold evaluation suite");
  }
  const suite = value as GoldEvaluationSuiteV1;
  if (
    suite.schemaVersion !== GOLD_EVAL_SUITE_SCHEMA ||
    suite.id !== GOLD_EVAL_SUITE_ID ||
    suite.version !== GOLD_EVAL_SUITE_VERSION ||
    suite.purpose !== "engineering_scaffold_only" ||
    suite.scientificGroundTruthEstablished !== false ||
    suite.modelActivationAllowed !== false ||
    suite.graphPromotable !== false ||
    suite.gateCAutoApprove !== false ||
    suite.legalBinding !== false ||
    suite.inventLabelsPermitted !== false ||
    suite.containsPhi !== false ||
    suite.smeSlots.independentlyLabelledCases !== 0 ||
    suite.smeSlots.authorityVerified !== false ||
    suite.immutableManifest.scientificValidityEstablished !== false ||
    suite.immutableManifest.reportStatus !== "scaffold_only" ||
    !Array.isArray(suite.capabilities) ||
    suite.capabilities.length !== GOLD_EVAL_CAPABILITIES.length ||
    suite.capabilities.some((c) => c.filled !== false || c.scientificGold !== false) ||
    suite.metrics.some((m) => m.value !== null || m.thresholdApproved !== false) ||
    suite.baselines.candidateModel.activationAllowed !== false ||
    suite.studyGroupedSplits.frozen !== false
  ) {
    throw new Error("Gold evaluation suite honesty gates violated");
  }
  for (const capability of GOLD_EVAL_CAPABILITIES) {
    if (!suite.capabilities.some((c) => c.capability === capability)) {
      throw new Error("Missing gold evaluation capability slot: " + capability);
    }
  }
  return suite;
}
