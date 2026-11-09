/**
 * scientific_benchmark_v1 alias — points at independent-evaluation; no parallel platform.
 */
import {describe, expect, test} from "bun:test";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  REQUIRED_BENCHMARK_QUESTION_DOMAINS,
  SCIENTIFIC_SCORECARD_DIMENSION_COUNT,
  buildIndependentEvaluationSuites,
} from "../src/evidence/independentEvaluationSuites";
import {
  SCIENTIFIC_BENCHMARK_V1_PATH,
  buildScientificBenchmarkV1Alias,
  parseScientificBenchmarkV1Alias,
} from "../src/evidence/scientificBenchmarkV1";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-08T23:55:00.000Z";
const aliasPath = resolve(root, SCIENTIFIC_BENCHMARK_V1_PATH, "alias-manifest.v1.json");
const statusPath = resolve(root, SCIENTIFIC_BENCHMARK_V1_PATH, "STATUS.json");
const independentPath = resolve(
  root,
  "evaluation/independent-evaluation/suite-manifest.v1.json",
);

describe("scientific_benchmark_v1 alias scaffold", () => {
  test("aliases independent-evaluation with blocked science and empty SME slots", () => {
    const independent = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const alias = buildScientificBenchmarkV1Alias({
      generatedAt,
      repoRoot: root,
      independentManifest: independent,
    });
    expect(alias.path).toBe(SCIENTIFIC_BENCHMARK_V1_PATH);
    expect(alias.aliases.canonicalPath).toBe("evaluation/independent-evaluation");
    expect(alias.aliases.inventoryHash).toBe(independent.inventoryHash);
    expect(alias.engineeringScaffold).toBe("CLEARED");
    expect(alias.scientificAcceptance).toBe("BLOCKED");
    expect(alias.liveSuccessClaimed).toBe(false);
    expect(alias.scientificValidityClaimed).toBe(false);
    expect(alias.productionReadinessClaimed).toBe(false);
    expect(alias.smeSlotsFilled).toBe(0);
    expect(alias.scorecardDimensionIds).toHaveLength(SCIENTIFIC_SCORECARD_DIMENSION_COUNT);
    expect(alias.scorecardValuesAllNull).toBe(true);
    expect(alias.representativeQuestionDomains).toEqual([...REQUIRED_BENCHMARK_QUESTION_DOMAINS]);
    expect(alias.researcherWorkflowComparison.reportQualitySeparately).toBe(true);
    expect(alias.researcherWorkflowComparison.reportTimeBudgetSeparately).toBe(true);
    expect(alias.researcherWorkflowComparison.qualityScoresInvented).toBe(false);
    expect(alias.humanQueueBlocked.rightsQueue2).toBe("PARKED");
    expect(alias.humanQueueBlocked.smeQueue4).toBe("PARKED");
    expect(alias.humanQueueBlocked.liveJourneyQueue5).toBe("PARKED");
    expect(alias.honesty.noParallelEvalPlatform).toBe(true);
    expect(alias.honesty.m1ThroughM6NotScientificallyValidated).toBe(true);
    expect(alias.honesty.llmJudgeNotSoleAuthority).toBe(true);
    expect(alias.benchmarkRegistry.wired).toBe(true);
    expect(alias.benchmarkRegistry.noParallelEvalPlatform).toBe(true);
    expect(parseScientificBenchmarkV1Alias(alias).inventoryHash).toBe(alias.inventoryHash);
  });

  test("sealed on-disk alias matches independent inventory hash when present", () => {
    expect(existsSync(aliasPath)).toBe(true);
    expect(existsSync(statusPath)).toBe(true);
    expect(existsSync(independentPath)).toBe(true);
    const alias = parseScientificBenchmarkV1Alias(JSON.parse(readFileSync(aliasPath, "utf8")));
    const independent = JSON.parse(readFileSync(independentPath, "utf8")) as {
      inventoryHash: string;
    };
    expect(alias.aliases.inventoryHash).toBe(independent.inventoryHash);
    const status = JSON.parse(readFileSync(statusPath, "utf8")) as {
      liveSuccessClaimed: boolean;
      smeSlotsFilled: number;
      scientificAcceptance: string;
    };
    expect(status.liveSuccessClaimed).toBe(false);
    expect(status.smeSlotsFilled).toBe(0);
    expect(status.scientificAcceptance).toBe("BLOCKED");
  });

  test("refuses inventing live success on alias", () => {
    const independent = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const alias = buildScientificBenchmarkV1Alias({
      generatedAt,
      repoRoot: root,
      independentManifest: independent,
    });
    const bad = structuredClone(alias) as typeof alias;
    bad.liveSuccessClaimed = true as unknown as false;
    expect(() => parseScientificBenchmarkV1Alias({...bad, inventoryHash: "x".repeat(64)})).toThrow();
  });
});
