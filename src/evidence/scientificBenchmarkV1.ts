/**
 * Refined-brief path `evaluation/scientific_benchmark_v1/` — alias scaffold over
 * `evaluation/independent-evaluation/` (PR 8). Not a parallel evaluation platform.
 *
 * Never invents SME ratings, live success, Gate C, MoU, PHI, or scientific validity.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "./researchEvidenceCorpus";
import {
  INDEPENDENT_EVAL_SUITE_VERSION,
  LIVE_INTEGRATION_ENV_FLAG,
  REQUIRED_BENCHMARK_QUESTION_DOMAINS,
  SCIENTIFIC_SCORECARD_DIMENSION_COUNT,
  assertBenchmarkDomainCoverage,
  assertQuestionsAvoidPinnedFixtures,
  buildIndependentEvaluationSuites,
  parseIndependentEvaluationSuites,
  type IndependentEvaluationSuitesManifest,
  type ScorecardDimensionId,
  type WalkthroughQuestionDomain,
} from "./independentEvaluationSuites";

export const SCIENTIFIC_BENCHMARK_V1_SCHEMA = "hsi-scientific-benchmark-v1-alias-1" as const;
export const SCIENTIFIC_BENCHMARK_V1_PATH = "evaluation/scientific_benchmark_v1" as const;
export const INDEPENDENT_EVALUATION_ALIAS_PATH = "evaluation/independent-evaluation" as const;

export type ScientificBenchmarkV1AliasManifest = {
  schemaVersion: typeof SCIENTIFIC_BENCHMARK_V1_SCHEMA;
  path: typeof SCIENTIFIC_BENCHMARK_V1_PATH;
  /** Canonical eng suite — do not duplicate as a second eval platform. */
  aliases: {
    canonicalPath: typeof INDEPENDENT_EVALUATION_ALIAS_PATH;
    suiteManifestRelativePath: "suite-manifest.v1.json";
    statusRelativePath: "STATUS.json";
    suiteVersion: typeof INDEPENDENT_EVAL_SUITE_VERSION;
    inventoryHash: string;
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
  liveSuiteGate: {
    envFlag: typeof LIVE_INTEGRATION_ENV_FLAG;
    requireExplicitOptIn: true;
    ciMustNotEnable: true;
    defaultStatus: "GATED_NOT_RUN";
  };
  scorecardDimensionIds: ScorecardDimensionId[];
  scorecardValuesAllNull: true;
  representativeQuestionDomains: WalkthroughQuestionDomain[];
  researcherWorkflowComparison: {
    status: "scaffold";
    sameQuestion: true;
    comparableInformationAccess: true;
    reportQualitySeparately: true;
    reportTimeBudgetSeparately: true;
    qualityScoresInvented: false;
    timeBudgetsInvented: false;
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
  };
  stopNote: string;
  inventoryHash: string;
};

export class ScientificBenchmarkV1Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScientificBenchmarkV1Error";
  }
}

function digest(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

export function buildScientificBenchmarkV1Alias(input: {
  generatedAt: string;
  repoRoot?: string;
  independentManifest?: IndependentEvaluationSuitesManifest;
}): ScientificBenchmarkV1AliasManifest {
  const root = input.repoRoot ?? resolve(import.meta.dir, "../..");
  const independent =
    input.independentManifest ??
    parseIndependentEvaluationSuites(
      buildIndependentEvaluationSuites({
        generatedAt: input.generatedAt,
        liveGateOpen: false,
        repoRoot: root,
      }),
    );

  if (independent.suiteVersion !== INDEPENDENT_EVAL_SUITE_VERSION) {
    throw new ScientificBenchmarkV1Error(
      "scientific_benchmark_v1 must alias the current independent-evaluation suite version",
    );
  }
  if (independent.suites.live.liveSuccessClaimed !== false) {
    throw new ScientificBenchmarkV1Error("Alias refuses liveSuccessClaimed=true");
  }
  if (independent.suites.scientific.smeSlotsFilled !== 0) {
    throw new ScientificBenchmarkV1Error("Alias refuses filled SME slots");
  }

  const scorecardDimensionIds = independent.suites.scientific.scorecard.map(
    (s) => s.dimensionId,
  );
  if (scorecardDimensionIds.length !== SCIENTIFIC_SCORECARD_DIMENSION_COUNT) {
    throw new ScientificBenchmarkV1Error(
      `Expected ${SCIENTIFIC_SCORECARD_DIMENSION_COUNT} scorecard dimensions`,
    );
  }
  if (independent.suites.scientific.scorecard.some((s) => s.value !== null)) {
    throw new ScientificBenchmarkV1Error("Scorecard values must stay null until SME");
  }

  const questions = independent.suites.scientific.representativeQuestions;
  assertQuestionsAvoidPinnedFixtures(questions);
  assertBenchmarkDomainCoverage(questions);

  const body: Omit<ScientificBenchmarkV1AliasManifest, "inventoryHash"> = {
    schemaVersion: SCIENTIFIC_BENCHMARK_V1_SCHEMA,
    path: SCIENTIFIC_BENCHMARK_V1_PATH,
    aliases: {
      canonicalPath: INDEPENDENT_EVALUATION_ALIAS_PATH,
      suiteManifestRelativePath: "suite-manifest.v1.json",
      statusRelativePath: "STATUS.json",
      suiteVersion: independent.suiteVersion,
      inventoryHash: independent.inventoryHash,
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
    liveSuiteGate: {
      envFlag: LIVE_INTEGRATION_ENV_FLAG,
      requireExplicitOptIn: true,
      ciMustNotEnable: true,
      defaultStatus: "GATED_NOT_RUN",
    },
    scorecardDimensionIds,
    scorecardValuesAllNull: true,
    representativeQuestionDomains: [...REQUIRED_BENCHMARK_QUESTION_DOMAINS],
    researcherWorkflowComparison: {
      status: "scaffold",
      sameQuestion: true,
      comparableInformationAccess: true,
      reportQualitySeparately: true,
      reportTimeBudgetSeparately: true,
      qualityScoresInvented: false,
      timeBudgetsInvented: false,
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
    },
    stopNote:
      "scientific_benchmark_v1 is an alias of independent-evaluation. Empty SME ratings; live gated; #2/#4/#5 PARKED. Not scientific validity or production readiness.",
  };

  return {...body, inventoryHash: digest(body)};
}

export function parseScientificBenchmarkV1Alias(
  value: unknown,
): ScientificBenchmarkV1AliasManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ScientificBenchmarkV1Error("Invalid scientific_benchmark_v1 alias manifest");
  }
  const manifest = value as ScientificBenchmarkV1AliasManifest;
  if (manifest.schemaVersion !== SCIENTIFIC_BENCHMARK_V1_SCHEMA) {
    throw new ScientificBenchmarkV1Error("Unsupported scientific_benchmark_v1 schema");
  }
  if (
    manifest.path !== SCIENTIFIC_BENCHMARK_V1_PATH ||
    manifest.aliases.canonicalPath !== INDEPENDENT_EVALUATION_ALIAS_PATH
  ) {
    throw new ScientificBenchmarkV1Error(
      "scientific_benchmark_v1 must alias evaluation/independent-evaluation",
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
    manifest.scorecardValuesAllNull !== true
  ) {
    throw new ScientificBenchmarkV1Error(
      "Alias cannot claim scientific validity, live success, or filled SME slots",
    );
  }
  if (
    manifest.liveSuiteGate.envFlag !== LIVE_INTEGRATION_ENV_FLAG ||
    manifest.liveSuiteGate.ciMustNotEnable !== true ||
    manifest.liveSuiteGate.defaultStatus !== "GATED_NOT_RUN"
  ) {
    throw new ScientificBenchmarkV1Error("Live suite must remain gated without success claim");
  }
  if (manifest.scorecardDimensionIds.length !== SCIENTIFIC_SCORECARD_DIMENSION_COUNT) {
    throw new ScientificBenchmarkV1Error(
      `Expected ${SCIENTIFIC_SCORECARD_DIMENSION_COUNT} scorecard dimensions`,
    );
  }
  for (const domain of REQUIRED_BENCHMARK_QUESTION_DOMAINS) {
    if (!manifest.representativeQuestionDomains.includes(domain)) {
      throw new ScientificBenchmarkV1Error(`Missing representative domain slot: ${domain}`);
    }
  }
  if (
    !manifest.researcherWorkflowComparison.reportQualitySeparately ||
    !manifest.researcherWorkflowComparison.reportTimeBudgetSeparately ||
    manifest.researcherWorkflowComparison.qualityScoresInvented ||
    manifest.researcherWorkflowComparison.timeBudgetsInvented
  ) {
    throw new ScientificBenchmarkV1Error(
      "Researcher workflow must keep quality/time separate with no invented scores",
    );
  }
  if (
    manifest.humanQueueBlocked.rightsQueue2 !== "PARKED" ||
    manifest.humanQueueBlocked.smeQueue4 !== "PARKED" ||
    manifest.humanQueueBlocked.liveJourneyQueue5 !== "PARKED"
  ) {
    throw new ScientificBenchmarkV1Error("Human queue #2/#4/#5 must remain PARKED");
  }
  if (!manifest.honesty.noParallelEvalPlatform) {
    throw new ScientificBenchmarkV1Error("Alias must declare no parallel eval platform");
  }

  const {inventoryHash, ...body} = manifest;
  const expected = digest(body);
  if (inventoryHash !== expected) {
    throw new ScientificBenchmarkV1Error("scientific_benchmark_v1 inventory hash mismatch");
  }
  return manifest;
}

export function loadIndependentSuiteHashIfPresent(repoRoot: string): string | null {
  const path = resolve(repoRoot, INDEPENDENT_EVALUATION_ALIAS_PATH, "suite-manifest.v1.json");
  if (!existsSync(path)) return null;
  const onDisk = parseIndependentEvaluationSuites(JSON.parse(readFileSync(path, "utf8")));
  return onDisk.inventoryHash;
}
