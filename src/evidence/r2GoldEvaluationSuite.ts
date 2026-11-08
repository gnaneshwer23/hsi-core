/**
 * Roadmap R2 — Gold Evaluation Suite (eng deepen).
 *
 * Extends Gold Eval Suite v1 + research-readiness toward the R2 exit shape
 * (versioned suite manifest · empty SME A/B + adjudication worksheets ·
 * study-grouped split slots · baseline metric placeholders). Draft 50-question
 * bank stays draft. Never invents SME labels, adjudications, scientific
 * accuracy scores, frozen held-out gold, Gate C, MoU, or CDS/PHI.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalGraphContext} from "../investigationGraphContext";
import {
  GOLD_EVAL_SUITE_ID,
  GOLD_EVAL_SUITE_SCHEMA,
  GOLD_EVAL_SUITE_VERSION,
  buildGoldEvaluationSuiteV1,
  parseGoldEvaluationSuiteV1,
  type GoldEvaluationSuiteV1,
} from "../goldEvaluationSuite";
import {
  parseQuestionDesignBank,
  type QuestionDesignBank,
} from "../researchReadiness";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  parseR1BiomedicalSourcePackets,
  type R1BiomedicalSourcePacketInventory,
} from "./r1BiomedicalSourcePackets";

export const R2_GOLD_SUITE_MANIFEST_SCHEMA = "hsi-r2-gold-evaluation-suite-1" as const;
export const R2_SUITE_VERSION = "1.0.0" as const;
export const R2_PROGRAMME = "gut_immune_t2d" as const;
export const R2_DRAFT_CASE_COUNT = 50 as const;

export type R2CheckStatus = "CLEARED" | "BLOCKED" | "PENDING_HUMAN" | "NO_GO";

export type R2CheckId =
  | "draft_bank_bound_unlabelled"
  | "gold_v1_suite_bound"
  | "versioned_suite_manifest"
  | "sme_worksheets_empty"
  | "adjudication_worksheet_empty"
  | "study_split_slots_unfilled"
  | "baseline_metric_placeholders"
  | "r2_checklist_published"
  | "r1_packets_unbound"
  | "human_sme_a_labels"
  | "human_sme_b_labels"
  | "human_adjudication"
  | "human_rights_cleared_packets"
  | "human_frozen_held_out_split"
  | "human_baseline_scientific_scores";

export type R2Check = {
  id: R2CheckId;
  title: string;
  plane: "engineering" | "human";
  status: R2CheckStatus;
  evidence: string;
};

export type R2SmeWorksheetRow = {
  caseId: string;
  caseHash: string;
  sourcePacketHash: null;
  expectedEvidenceIds: [];
  claimSpans: [];
  opposingEvidenceIds: [];
  nullObservationIds: [];
  acceptableAnswer: null;
  expectedOutcome: null;
  annotator: null;
  rationale: null;
  scientificAccuracy: null;
};

export type R2SmeWorksheet = {
  schemaVersion: "hsi-r2-sme-worksheet-1";
  worksheetId: "sme_a" | "sme_b";
  status: "awaiting_sme";
  authorityVerified: false;
  inventLabelsPermitted: false;
  labelledCases: 0;
  draftBankHash: string;
  rows: R2SmeWorksheetRow[];
};

export type R2AdjudicationRow = {
  caseId: string;
  caseHash: string;
  smeALabelPresent: false;
  smeBLabelPresent: false;
  disagreement: null;
  adjudicatedLabel: null;
  adjudicator: null;
  rationale: null;
  scientificAccuracy: null;
};

export type R2AdjudicationWorksheet = {
  schemaVersion: "hsi-r2-adjudication-worksheet-1";
  worksheetId: "adjudication";
  status: "awaiting_sme";
  authorityVerified: false;
  inventLabelsPermitted: false;
  independentlyLabelledCases: 0;
  adjudicatedCases: 0;
  draftBankHash: string;
  rows: R2AdjudicationRow[];
};

export type R2StudyGroupedSplitSlots = {
  schemaVersion: "hsi-r2-study-grouped-splits-1";
  status: "awaiting_packet_and_label_binding";
  developmentStudyIds: [];
  validationStudyIds: [];
  heldOutStudyIds: [];
  casePartitionAssignments: [];
  leakageControlsDocumented: false;
  frozenHeldOut: false;
  frozenAt: null;
  frozenBy: null;
};

export type R2BaselineMetricPlaceholder = {
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
  scientificAccuracy: null;
  baselineMethodId: string | null;
};

export type R2BaselineMetricsBlock = {
  schemaVersion: "hsi-r2-baseline-metrics-1";
  scientificAcceptance: "BLOCKED";
  thresholdsApproved: false;
  modelActivationAllowed: false;
  candidateConfigured: false;
  metrics: R2BaselineMetricPlaceholder[];
};

export type R2GoldEvaluationSuiteManifest = {
  schemaVersion: typeof R2_GOLD_SUITE_MANIFEST_SCHEMA;
  phase: "R2";
  programme: typeof R2_PROGRAMME;
  roadmapPhase: "gold_evaluation_suite";
  suiteVersion: typeof R2_SUITE_VERSION;
  generatedAt: string;
  engineeringScaffold: "CLEARED";
  scientificAcceptance: "BLOCKED";
  rightsAcceptance: "BLOCKED";
  smeGoldFilled: false;
  frozenHeldOut: false;
  draftBankIsNotGold: true;
  modelActivationAllowed: false;
  graphPromotable: false;
  gateCAutoApprove: false;
  legalBinding: false;
  inventLabelsPermitted: false;
  containsPhi: false;
  draftBankId: string;
  draftBankVersion: string;
  draftBankHash: string;
  draftCaseCount: typeof R2_DRAFT_CASE_COUNT;
  goldV1SuiteId: typeof GOLD_EVAL_SUITE_ID;
  goldV1SuiteSchema: typeof GOLD_EVAL_SUITE_SCHEMA;
  goldV1SuiteVersion: typeof GOLD_EVAL_SUITE_VERSION;
  goldV1SuiteHash: string;
  r1InventoryHash: string | null;
  r1PacketsBoundToGold: 0;
  honesty: {
    draftBankRemainsDraft: true;
    emptySmeWorksheetsAreNotLabels: true;
    emptyAdjudicationIsNotGold: true;
    unfilledSplitsAreNotFrozen: true;
    nullMetricsAreNotScores: true;
    scientificAcceptanceBlocked: true;
    noInventedSmeLabels: true;
    noInventedAdjudications: true;
    noInventedScientificAccuracy: true;
    noGateCAutoApprove: true;
    noInventedMoU: true;
    noLiveCdsPhi: true;
    redWaveOnlyForHsi: true;
  };
  exitShapeScaffold: {
    section: "roadmap_r2";
    targetExit: "frozen_split_plus_baseline_metrics";
    stepsDocumented: [
      "draft_50_question_bank",
      "independent_sme_a_labels",
      "independent_sme_b_labels",
      "adjudicated_cases",
      "study_grouped_frozen_split",
      "baseline_metrics_on_frozen_inputs",
    ];
    currentStep: "draft_50_question_bank";
    smeGoldFilled: false;
    frozenHeldOut: false;
  };
  worksheets: {
    smeA: R2SmeWorksheet;
    smeB: R2SmeWorksheet;
    adjudication: R2AdjudicationWorksheet;
  };
  studyGroupedSplits: R2StudyGroupedSplitSlots;
  baselineMetrics: R2BaselineMetricsBlock;
  checks: R2Check[];
  humanMustSupply: string[];
  codeCanAutomate: string[];
  summary: {
    draftCases: typeof R2_DRAFT_CASE_COUNT;
    smeALabelled: 0;
    smeBLabelled: 0;
    adjudicatedCases: 0;
    independentlyLabelledCases: 0;
    studyIdsAssigned: 0;
    frozenHeldOut: false;
    baselineMetricsScored: 0;
    scientificAcceptance: "BLOCKED";
    rightsAcceptance: "BLOCKED";
    smeGoldFilled: false;
    engineeringChecksCleared: number;
    engineeringChecksTotal: number;
    humanChecksPending: number;
    humanChecksTotal: number;
  };
  residualHumanSteps: string[];
  parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"];
  stopNote: string;
  inventoryHash: string;
};

export class R2GoldEvaluationSuiteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "R2GoldEvaluationSuiteError";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

function seal(
  body: Omit<R2GoldEvaluationSuiteManifest, "inventoryHash">,
): R2GoldEvaluationSuiteManifest {
  return {...body, inventoryHash: digest(body)};
}

async function syncDigest(text: string): Promise<string> {
  return createHash("sha256").update(text).digest("hex");
}

function emptySmeRow(caseId: string, caseHash: string): R2SmeWorksheetRow {
  return {
    caseId,
    caseHash,
    sourcePacketHash: null,
    expectedEvidenceIds: [],
    claimSpans: [],
    opposingEvidenceIds: [],
    nullObservationIds: [],
    acceptableAnswer: null,
    expectedOutcome: null,
    annotator: null,
    rationale: null,
    scientificAccuracy: null,
  };
}

function emptyAdjudicationRow(caseId: string, caseHash: string): R2AdjudicationRow {
  return {
    caseId,
    caseHash,
    smeALabelPresent: false,
    smeBLabelPresent: false,
    disagreement: null,
    adjudicatedLabel: null,
    adjudicator: null,
    rationale: null,
    scientificAccuracy: null,
  };
}

function checklistPresent(repoRoot: string): boolean {
  return existsSync(resolve(repoRoot, "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md"));
}

function loadDraftBank(repoRoot: string): QuestionDesignBank {
  const path = resolve(repoRoot, "evaluation/research-readiness/questions.draft.json");
  return parseQuestionDesignBank(JSON.parse(readFileSync(path, "utf8")));
}

function loadR1Inventory(repoRoot: string): R1BiomedicalSourcePacketInventory | null {
  const path = resolve(repoRoot, "research/domain-graph/r1/source-packets.v1.json");
  if (!existsSync(path)) return null;
  return parseR1BiomedicalSourcePackets(JSON.parse(readFileSync(path, "utf8")));
}

function buildChecks(input: {
  bank: QuestionDesignBank;
  goldV1: GoldEvaluationSuiteV1;
  r1: R1BiomedicalSourcePacketInventory | null;
  checklistPublished: boolean;
  smeA: R2SmeWorksheet;
  smeB: R2SmeWorksheet;
  adjudication: R2AdjudicationWorksheet;
  splits: R2StudyGroupedSplitSlots;
  metrics: R2BaselineMetricsBlock;
}): R2Check[] {
  const draftBound =
    input.bank.cases.length === R2_DRAFT_CASE_COUNT &&
    input.bank.scientificGroundTruthEstablished === false &&
    input.bank.purpose === "sme_design_only";
  const goldBound =
    input.goldV1.schemaVersion === GOLD_EVAL_SUITE_SCHEMA &&
    input.goldV1.smeSlots.independentlyLabelledCases === 0 &&
    input.goldV1.studyGroupedSplits.frozen === false;
  const worksheetsEmpty =
    input.smeA.labelledCases === 0 &&
    input.smeB.labelledCases === 0 &&
    input.smeA.rows.every((r) => r.acceptableAnswer === null && r.annotator === null) &&
    input.smeB.rows.every((r) => r.acceptableAnswer === null && r.annotator === null);
  const adjudicationEmpty =
    input.adjudication.adjudicatedCases === 0 &&
    input.adjudication.independentlyLabelledCases === 0 &&
    input.adjudication.rows.every((r) => r.adjudicatedLabel === null);
  const splitsUnfilled =
    input.splits.developmentStudyIds.length === 0 &&
    input.splits.heldOutStudyIds.length === 0 &&
    input.splits.frozenHeldOut === false;
  const metricsBlocked =
    input.metrics.scientificAcceptance === "BLOCKED" &&
    input.metrics.metrics.every((m) => m.value === null && m.scientificAccuracy === null);
  const r1Unbound =
    input.r1 === null ||
    (input.r1.summary.packetSlotsRightsCleared === 0 &&
      input.r1.packets.every((p) => p.goldEvalBinding.bound === false));

  return [
    {
      id: "draft_bank_bound_unlabelled",
      title: "50-question draft bank bound (not gold)",
      plane: "engineering",
      status: draftBound ? "CLEARED" : "BLOCKED",
      evidence:
        "evaluation/research-readiness/questions.draft.json · purpose=sme_design_only · scientificGroundTruthEstablished=false.",
    },
    {
      id: "gold_v1_suite_bound",
      title: "Gold Eval Suite v1 scaffold bound (empty SME slots)",
      plane: "engineering",
      status: goldBound ? "CLEARED" : "BLOCKED",
      evidence: "evaluation/gold-evaluation-suite/v1/suite.v1.json · independentlyLabelledCases=0.",
    },
    {
      id: "versioned_suite_manifest",
      title: "Versioned R2 suite manifest schema reserved",
      plane: "engineering",
      status: "CLEARED",
      evidence: `${R2_GOLD_SUITE_MANIFEST_SCHEMA} · suiteVersion=${R2_SUITE_VERSION}.`,
    },
    {
      id: "sme_worksheets_empty",
      title: "SME A/B worksheets reserved empty (50 rows)",
      plane: "engineering",
      status: worksheetsEmpty ? "CLEARED" : "BLOCKED",
      evidence: "sme_a/sme_b labelledCases=0 · annotator=null · inventLabelsPermitted=false.",
    },
    {
      id: "adjudication_worksheet_empty",
      title: "Adjudication worksheet reserved empty",
      plane: "engineering",
      status: adjudicationEmpty ? "CLEARED" : "BLOCKED",
      evidence: "adjudicatedCases=0 · adjudicatedLabel=null on all draft rows.",
    },
    {
      id: "study_split_slots_unfilled",
      title: "Study-grouped split slots unfilled / unfrozen",
      plane: "engineering",
      status: splitsUnfilled ? "CLEARED" : "BLOCKED",
      evidence: "development/heldOut studyIds=[] · frozenHeldOut=false.",
    },
    {
      id: "baseline_metric_placeholders",
      title: "Baseline metric placeholders with scientificAcceptance=BLOCKED",
      plane: "engineering",
      status: metricsBlocked ? "CLEARED" : "BLOCKED",
      evidence: "Six metric slots · value=null · scientificAccuracy=null · scientificAcceptance=BLOCKED.",
    },
    {
      id: "r2_checklist_published",
      title: "R2 gold evaluation suite checklist published",
      plane: "engineering",
      status: input.checklistPublished ? "CLEARED" : "BLOCKED",
      evidence: "docs/engineering/R2_GOLD_EVALUATION_SUITE_CHECKLIST.md",
    },
    {
      id: "r1_packets_unbound",
      title: "R1 source packets remain unbound to gold cases",
      plane: "engineering",
      status: r1Unbound ? "CLEARED" : "BLOCKED",
      evidence: "r1PacketsBoundToGold=0 · goldEvalBinding.bound=false while rights quarantine.",
    },
    {
      id: "human_sme_a_labels",
      title: "Independent SME A labels on draft cases",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Parked #4 SMEs — do not invent annotator identities or acceptableAnswer.",
    },
    {
      id: "human_sme_b_labels",
      title: "Independent SME B labels on draft cases",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Parked #4 SMEs — second independent pass required; worksheet stays empty.",
    },
    {
      id: "human_adjudication",
      title: "Accountable adjudication of SME disagreements",
      plane: "human",
      status: "PENDING_HUMAN",
      evidence: "Parked #4 — adjudicatedLabel remains null until real dual SME + adjudicator.",
    },
    {
      id: "human_rights_cleared_packets",
      title: "Rights-cleared packet hashes bound to gold cases",
      plane: "human",
      status: "BLOCKED",
      evidence: "Parked #2 N1 rights — sourcePacketHash=null; R1 packets quarantine.",
    },
    {
      id: "human_frozen_held_out_split",
      title: "Freeze study-grouped held-out split",
      plane: "human",
      status: "NO_GO",
      evidence: "frozenHeldOut=false until packets + adjudicated labels exist.",
    },
    {
      id: "human_baseline_scientific_scores",
      title: "Baseline metrics with scientific accuracy scores",
      plane: "human",
      status: "NO_GO",
      evidence: "scientificAcceptance=BLOCKED; null metric values are placeholders only.",
    },
  ];
}

/** Build fail-closed R2 gold evaluation suite deepen manifest. */
export async function buildR2GoldEvaluationSuite(input: {
  generatedAt: string;
  repoRoot?: string;
  bank?: QuestionDesignBank;
  goldV1?: GoldEvaluationSuiteV1;
  r1Inventory?: R1BiomedicalSourcePacketInventory | null;
}): Promise<R2GoldEvaluationSuiteManifest> {
  const root = input.repoRoot ?? resolve(import.meta.dir, "../..");
  const bank = input.bank ?? loadDraftBank(root);
  if (bank.cases.length !== R2_DRAFT_CASE_COUNT) {
    throw new R2GoldEvaluationSuiteError("R2 expects exactly 50 draft cases");
  }
  if (bank.scientificGroundTruthEstablished !== false) {
    throw new R2GoldEvaluationSuiteError("R2 refuses a bank that claims scientific ground truth");
  }

  const goldV1 =
    input.goldV1 ??
    parseGoldEvaluationSuiteV1(await buildGoldEvaluationSuiteV1(bank, syncDigest));
  if (goldV1.smeSlots.independentlyLabelledCases !== 0 || goldV1.studyGroupedSplits.frozen) {
    throw new R2GoldEvaluationSuiteError(
      "R2 refuses gold v1 suites that claim labels or frozen held-out splits",
    );
  }

  const r1 =
    input.r1Inventory !== undefined ? input.r1Inventory : loadR1Inventory(root);
  if (r1) {
    if (r1.datasetLifecycleScaffold.smeGoldFilled !== false) {
      throw new R2GoldEvaluationSuiteError("R2 refuses R1 inventories that claim smeGoldFilled");
    }
    if (r1.packets.some((p) => p.goldEvalBinding.bound)) {
      throw new R2GoldEvaluationSuiteError(
        "R2 eng scaffold cannot bind rights-uncleared R1 packets as gold",
      );
    }
  }

  const draftBankHash = digest(bank);
  const caseRows = await Promise.all(
    bank.cases.map(async (c) => {
      const caseHash = await syncDigest(canonicalGraphContext(c));
      return {caseId: c.id, caseHash};
    }),
  );

  const smeA: R2SmeWorksheet = {
    schemaVersion: "hsi-r2-sme-worksheet-1",
    worksheetId: "sme_a",
    status: "awaiting_sme",
    authorityVerified: false,
    inventLabelsPermitted: false,
    labelledCases: 0,
    draftBankHash,
    rows: caseRows.map((r) => emptySmeRow(r.caseId, r.caseHash)),
  };
  const smeB: R2SmeWorksheet = {
    ...structuredClone(smeA),
    worksheetId: "sme_b",
  };
  const adjudication: R2AdjudicationWorksheet = {
    schemaVersion: "hsi-r2-adjudication-worksheet-1",
    worksheetId: "adjudication",
    status: "awaiting_sme",
    authorityVerified: false,
    inventLabelsPermitted: false,
    independentlyLabelledCases: 0,
    adjudicatedCases: 0,
    draftBankHash,
    rows: caseRows.map((r) => emptyAdjudicationRow(r.caseId, r.caseHash)),
  };

  const studyGroupedSplits: R2StudyGroupedSplitSlots = {
    schemaVersion: "hsi-r2-study-grouped-splits-1",
    status: "awaiting_packet_and_label_binding",
    developmentStudyIds: [],
    validationStudyIds: [],
    heldOutStudyIds: [],
    casePartitionAssignments: [],
    leakageControlsDocumented: false,
    frozenHeldOut: false,
    frozenAt: null,
    frozenBy: null,
  };

  const baselineMetrics: R2BaselineMetricsBlock = {
    schemaVersion: "hsi-r2-baseline-metrics-1",
    scientificAcceptance: "BLOCKED",
    thresholdsApproved: false,
    modelActivationAllowed: false,
    candidateConfigured: false,
    metrics: [
      {
        metricId: "citation_correctness",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: "deterministic-extractive-baseline",
      },
      {
        metricId: "semantic_support",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: "deterministic-extractive-baseline",
      },
      {
        metricId: "context_mismatch_detection",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: "deterministic-extractive-baseline",
      },
      {
        metricId: "abstention_accuracy",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: "deterministic-extractive-baseline",
      },
      {
        metricId: "opposition_null_coverage",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: null,
      },
      {
        metricId: "baseline_vs_candidate_delta",
        value: null,
        labelledDenominator: 0,
        thresholdApproved: false,
        scientificAccuracy: null,
        baselineMethodId: "hsi-lexical-retrieval-baseline-1",
      },
    ],
  };

  const checks = buildChecks({
    bank,
    goldV1,
    r1,
    checklistPublished: checklistPresent(root),
    smeA,
    smeB,
    adjudication,
    splits: studyGroupedSplits,
    metrics: baselineMetrics,
  });
  const eng = checks.filter((c) => c.plane === "engineering");
  const human = checks.filter((c) => c.plane === "human");
  const engCleared = eng.filter((c) => c.status === "CLEARED").length;
  const humanPending = human.filter(
    (c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED",
  ).length;

  if (engCleared !== eng.length) {
    throw new R2GoldEvaluationSuiteError(
      "Engineering R2 checks must all CLEARED before writing artifact",
    );
  }
  if (humanPending !== human.length) {
    throw new R2GoldEvaluationSuiteError(
      "Human R2 checks must remain PENDING_HUMAN/NO_GO/BLOCKED while SME gold is empty",
    );
  }

  return seal({
    schemaVersion: R2_GOLD_SUITE_MANIFEST_SCHEMA,
    phase: "R2",
    programme: R2_PROGRAMME,
    roadmapPhase: "gold_evaluation_suite",
    suiteVersion: R2_SUITE_VERSION,
    generatedAt: input.generatedAt,
    engineeringScaffold: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    smeGoldFilled: false,
    frozenHeldOut: false,
    draftBankIsNotGold: true,
    modelActivationAllowed: false,
    graphPromotable: false,
    gateCAutoApprove: false,
    legalBinding: false,
    inventLabelsPermitted: false,
    containsPhi: false,
    draftBankId: bank.id,
    draftBankVersion: bank.version,
    draftBankHash,
    draftCaseCount: R2_DRAFT_CASE_COUNT,
    goldV1SuiteId: GOLD_EVAL_SUITE_ID,
    goldV1SuiteSchema: GOLD_EVAL_SUITE_SCHEMA,
    goldV1SuiteVersion: GOLD_EVAL_SUITE_VERSION,
    goldV1SuiteHash: goldV1.immutableManifest.suiteHash,
    r1InventoryHash: r1?.inventoryHash ?? null,
    r1PacketsBoundToGold: 0,
    honesty: {
      draftBankRemainsDraft: true,
      emptySmeWorksheetsAreNotLabels: true,
      emptyAdjudicationIsNotGold: true,
      unfilledSplitsAreNotFrozen: true,
      nullMetricsAreNotScores: true,
      scientificAcceptanceBlocked: true,
      noInventedSmeLabels: true,
      noInventedAdjudications: true,
      noInventedScientificAccuracy: true,
      noGateCAutoApprove: true,
      noInventedMoU: true,
      noLiveCdsPhi: true,
      redWaveOnlyForHsi: true,
    },
    exitShapeScaffold: {
      section: "roadmap_r2",
      targetExit: "frozen_split_plus_baseline_metrics",
      stepsDocumented: [
        "draft_50_question_bank",
        "independent_sme_a_labels",
        "independent_sme_b_labels",
        "adjudicated_cases",
        "study_grouped_frozen_split",
        "baseline_metrics_on_frozen_inputs",
      ],
      currentStep: "draft_50_question_bank",
      smeGoldFilled: false,
      frozenHeldOut: false,
    },
    worksheets: {smeA, smeB, adjudication},
    studyGroupedSplits,
    baselineMetrics,
    checks,
    humanMustSupply: [
      "Independent SME A labels on the 50 draft cases (do not invent; parked #4).",
      "Independent SME B labels on the same cases (separate accountable annotator).",
      "Adjudication of disagreements with recorded adjudicator authority.",
      "Human #2: rights-cleared packet hashes before binding sourcePacketHash to cases.",
      "Study-grouped development / validation / held-out freeze after adjudicated gold.",
      "Baseline metric scores on the frozen held-out split — scientificAcceptance stays BLOCKED until then.",
    ],
    codeCanAutomate: [
      "Bind draft bank (50) + Gold Eval Suite v1 suiteHash into versioned R2 manifest.",
      "Reserve empty SME A/B + adjudication worksheets with caseId/caseHash rows.",
      "Reserve unfilled study-grouped split slots with frozenHeldOut=false.",
      "Publish baseline metric placeholders with scientificAcceptance=BLOCKED.",
      "Keep smeGoldFilled=false and refuse invented labels / scores.",
      "Seal inventoryHash + offline prepare/check harness.",
      "Operator checklist + Audit R2 receipt (ENG CLEARED / SCIENCE BLOCKED).",
    ],
    summary: {
      draftCases: R2_DRAFT_CASE_COUNT,
      smeALabelled: 0,
      smeBLabelled: 0,
      adjudicatedCases: 0,
      independentlyLabelledCases: 0,
      studyIdsAssigned: 0,
      frozenHeldOut: false,
      baselineMetricsScored: 0,
      scientificAcceptance: "BLOCKED",
      rightsAcceptance: "BLOCKED",
      smeGoldFilled: false,
      engineeringChecksCleared: engCleared,
      engineeringChecksTotal: eng.length,
      humanChecksPending: humanPending,
      humanChecksTotal: human.length,
    },
    residualHumanSteps: [
      "Parked: do not fix human queue #2 rights, #4 SMEs, #3 cite HITL, #5 staging, #8 MoU in this eng phase.",
      "Keep smeGoldFilled=false / frozenHeldOut=false / independentlyLabelledCases=0.",
      "Do not invent SME labels, adjudications, or scientificAccuracy scores.",
      "Do not treat the 50-question draft bank as gold.",
      "Do not invent MoU, Gate C auto-approve, CDS-PHI, or autumn-snow Neon writes.",
      "When #2+#4 clear, re-run R2 prepare to promote worksheets — not before.",
    ],
    parkedHumanResiduals: ["#2 N1 rights", "#3 cite HITL", "#4 SMEs", "#5 staging", "#8 MoU"],
    stopNote:
      "R2 eng deepen complete. Scientific acceptance remains BLOCKED. Draft bank is not gold. SME A/B + adjudication worksheets stay empty; frozenHeldOut=false; baseline metric placeholders are not scores. Human #2/#4 explicitly parked — do not invent labels, adjudications, or scientific accuracy.",
  });
}

export function parseR2GoldEvaluationSuite(value: unknown): R2GoldEvaluationSuiteManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new R2GoldEvaluationSuiteError("Invalid R2 gold evaluation suite manifest");
  }
  const manifest = value as R2GoldEvaluationSuiteManifest;
  if (
    manifest.schemaVersion !== R2_GOLD_SUITE_MANIFEST_SCHEMA ||
    manifest.phase !== "R2" ||
    manifest.roadmapPhase !== "gold_evaluation_suite" ||
    manifest.programme !== R2_PROGRAMME ||
    manifest.suiteVersion !== R2_SUITE_VERSION
  ) {
    throw new R2GoldEvaluationSuiteError("Unsupported R2 gold evaluation suite schema");
  }
  if (
    manifest.engineeringScaffold !== "CLEARED" ||
    manifest.scientificAcceptance !== "BLOCKED" ||
    manifest.rightsAcceptance !== "BLOCKED" ||
    manifest.smeGoldFilled !== false ||
    manifest.frozenHeldOut !== false ||
    manifest.draftBankIsNotGold !== true ||
    manifest.modelActivationAllowed !== false ||
    manifest.graphPromotable !== false ||
    manifest.gateCAutoApprove !== false ||
    manifest.legalBinding !== false ||
    manifest.inventLabelsPermitted !== false ||
    manifest.containsPhi !== false ||
    manifest.draftCaseCount !== R2_DRAFT_CASE_COUNT ||
    manifest.r1PacketsBoundToGold !== 0 ||
    manifest.summary.smeALabelled !== 0 ||
    manifest.summary.smeBLabelled !== 0 ||
    manifest.summary.adjudicatedCases !== 0 ||
    manifest.summary.independentlyLabelledCases !== 0 ||
    manifest.summary.studyIdsAssigned !== 0 ||
    manifest.summary.frozenHeldOut !== false ||
    manifest.summary.baselineMetricsScored !== 0 ||
    manifest.summary.scientificAcceptance !== "BLOCKED" ||
    manifest.summary.smeGoldFilled !== false ||
    manifest.exitShapeScaffold.smeGoldFilled !== false ||
    manifest.exitShapeScaffold.frozenHeldOut !== false ||
    manifest.studyGroupedSplits.frozenHeldOut !== false ||
    manifest.baselineMetrics.scientificAcceptance !== "BLOCKED" ||
    manifest.worksheets.smeA.labelledCases !== 0 ||
    manifest.worksheets.smeB.labelledCases !== 0 ||
    manifest.worksheets.adjudication.adjudicatedCases !== 0
  ) {
    throw new R2GoldEvaluationSuiteError(
      "R2 manifest cannot claim SME gold, frozen held-out, scores, or scientific acceptance",
    );
  }
  if (
    !Array.isArray(manifest.worksheets.smeA.rows) ||
    manifest.worksheets.smeA.rows.length !== R2_DRAFT_CASE_COUNT ||
    !Array.isArray(manifest.worksheets.smeB.rows) ||
    manifest.worksheets.smeB.rows.length !== R2_DRAFT_CASE_COUNT ||
    !Array.isArray(manifest.worksheets.adjudication.rows) ||
    manifest.worksheets.adjudication.rows.length !== R2_DRAFT_CASE_COUNT
  ) {
    throw new R2GoldEvaluationSuiteError("R2 worksheets must reserve exactly 50 empty case rows");
  }
  for (const row of [
    ...manifest.worksheets.smeA.rows,
    ...manifest.worksheets.smeB.rows,
  ]) {
    if (
      row.acceptableAnswer !== null ||
      row.annotator !== null ||
      row.scientificAccuracy !== null ||
      row.sourcePacketHash !== null
    ) {
      throw new R2GoldEvaluationSuiteError("R2 SME worksheets must stay empty of labels");
    }
  }
  for (const row of manifest.worksheets.adjudication.rows) {
    if (
      row.adjudicatedLabel !== null ||
      row.adjudicator !== null ||
      row.scientificAccuracy !== null ||
      row.smeALabelPresent !== false ||
      row.smeBLabelPresent !== false
    ) {
      throw new R2GoldEvaluationSuiteError("R2 adjudication worksheet must stay empty");
    }
  }
  if (
    manifest.baselineMetrics.metrics.some(
      (m) => m.value !== null || m.scientificAccuracy !== null || m.thresholdApproved !== false,
    )
  ) {
    throw new R2GoldEvaluationSuiteError("R2 baseline metrics must remain null placeholders");
  }
  if (!Array.isArray(manifest.checks) || manifest.checks.length === 0) {
    throw new R2GoldEvaluationSuiteError("R2 checks missing");
  }
  for (const check of manifest.checks) {
    if (check.plane === "human" && check.status === "CLEARED") {
      throw new R2GoldEvaluationSuiteError(
        `Human check ${check.id} cannot be CLEARED while R2 SME gold is empty`,
      );
    }
  }
  if (typeof manifest.stopNote !== "string" || manifest.stopNote.length < 20) {
    throw new R2GoldEvaluationSuiteError("R2 manifest must include an explicit STOP note");
  }
  const {inventoryHash, ...body} = manifest;
  const expected = digest(body);
  if (inventoryHash !== expected) {
    throw new R2GoldEvaluationSuiteError("R2 gold evaluation suite inventory hash mismatch");
  }
  return manifest;
}
