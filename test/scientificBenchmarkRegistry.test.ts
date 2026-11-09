/**
 * Milestone 7 PR1 — Scientific Benchmark Registry honesty.
 */
import {describe, expect, test} from "bun:test";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  M7_BENCHMARK_CATEGORY_COUNT,
  M7_BENCHMARK_CATEGORY_IDS,
  SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
  assertNoHeldOutLeakage,
  buildScientificBenchmarkRegistry,
  classifyReleaseGate,
  exposeExpertReferenceForEvaluation,
  parseScientificBenchmarkRegistry,
} from "../src/evidence/scientificBenchmarkRegistry";
import {
  SCIENTIFIC_BENCHMARK_V1_PATH,
  buildScientificBenchmarkV1Alias,
  parseScientificBenchmarkV1Alias,
} from "../src/evidence/scientificBenchmarkV1";
import {buildIndependentEvaluationSuites} from "../src/evidence/independentEvaluationSuites";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-09T10:30:00.000Z";
const registryPath = resolve(
  root,
  SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
  "registry-manifest.v1.json",
);
const registryStatusPath = resolve(
  root,
  SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
  "STATUS.json",
);
const aliasPath = resolve(root, SCIENTIFIC_BENCHMARK_V1_PATH, "alias-manifest.v1.json");

describe("scientific benchmark registry (M7 PR1)", () => {
  test("builds twelve category slots with empty SME and sealed held-out refs", () => {
    const registry = buildScientificBenchmarkRegistry({generatedAt});
    expect(registry.categories).toHaveLength(M7_BENCHMARK_CATEGORY_COUNT);
    expect(registry.categories.map((c) => c.categoryId)).toEqual([...M7_BENCHMARK_CATEGORY_IDS]);
    expect(registry.partitions.developmentCaseCount).toBe(M7_BENCHMARK_CATEGORY_COUNT);
    expect(registry.partitions.heldOutCaseCount).toBe(M7_BENCHMARK_CATEGORY_COUNT);
    expect(registry.smeSlotsFilled).toBe(0);
    expect(registry.heldOutFrozen).toBe(false);
    expect(registry.scientificAcceptance).toBe("BLOCKED");
    expect(registry.scientificValidityClaimed).toBe(false);
    expect(registry.liveSuccessClaimed).toBe(false);
    expect(registry.releaseGateClassification).toBe("scientific_evaluation_pending");
    expect(registry.numericAcceptanceThresholdsInvented).toBe(false);
    expect(registry.llmJudgeSoleAuthorityPermitted).toBe(false);
    expect(registry.wiresTo.noParallelEvalPlatform).toBe(true);
    expect(registry.wiresTo.scientificBenchmarkAliasPath).toBe(SCIENTIFIC_BENCHMARK_V1_PATH);
    expect(registry.honesty.m1ThroughM6NotScientificallyValidated).toBe(true);
    expect(registry.honesty.noPublicMarketingValidationClaim).toBe(true);
    expect(registry.categories.every((c) => c.smeReferenceFilled === false)).toBe(true);
    expect(
      registry.cases.every(
        (c) =>
          c.expertReferenceAssessment.payload === null &&
          c.expertReferenceAssessment.sealed &&
          !c.expertReferenceAssessment.injectableIntoPrompts,
      ),
    ).toBe(true);
    expect(parseScientificBenchmarkRegistry(registry).inventoryHash).toBe(registry.inventoryHash);
    assertNoHeldOutLeakage(registry);
  });

  test("development and held-out case ids stay disjoint", () => {
    const registry = buildScientificBenchmarkRegistry({generatedAt});
    const development = new Set(
      registry.cases.filter((c) => c.partition === "development").map((c) => c.caseId),
    );
    const heldOut = registry.cases
      .filter((c) => c.partition === "held_out")
      .map((c) => c.caseId);
    expect(heldOut.every((id) => !development.has(id))).toBe(true);
  });

  test("refuses inventing SME payload or LLM-sole authority on parse", () => {
    const registry = buildScientificBenchmarkRegistry({generatedAt});
    const bad = structuredClone(registry) as typeof registry;
    bad.cases[0]!.expertReferenceAssessment.payload = {
      answer: "invented",
    } as unknown as null;
    expect(() =>
      parseScientificBenchmarkRegistry({...bad, inventoryHash: "x".repeat(64)}),
    ).toThrow();

    const badRubric = structuredClone(registry) as typeof registry;
    badRubric.cases[0]!.scoringRubric.llmJudgeSoleAuthority = true as unknown as false;
    expect(() =>
      parseScientificBenchmarkRegistry({...badRubric, inventoryHash: "y".repeat(64)}),
    ).toThrow();
  });

  test("exposeExpertReference stays sealed null", () => {
    const registry = buildScientificBenchmarkRegistry({generatedAt});
    const exposed = exposeExpertReferenceForEvaluation(registry.cases[0]!);
    expect(exposed.payload).toBeNull();
    expect(exposed.sealed).toBe(true);
  });

  test("release gate classifier stays classification-only", () => {
    expect(
      classifyReleaseGate({
        engineeringScaffoldCleared: true,
        scientificAcceptanceCleared: false,
        criticalBlockersPresent: false,
      }),
    ).toBe("scientific_evaluation_pending");
    expect(
      classifyReleaseGate({
        engineeringScaffoldCleared: false,
        scientificAcceptanceCleared: false,
        criticalBlockersPresent: false,
      }),
    ).toBe("not_ready");
    expect(
      classifyReleaseGate({
        engineeringScaffoldCleared: true,
        scientificAcceptanceCleared: true,
        criticalBlockersPresent: false,
      }),
    ).toBe("scientific_evaluation_pending");
  });

  test("wires into scientific_benchmark_v1 alias without parallel platform", () => {
    const independent = buildIndependentEvaluationSuites({generatedAt, repoRoot: root});
    const registry = buildScientificBenchmarkRegistry({generatedAt});
    const alias = buildScientificBenchmarkV1Alias({
      generatedAt,
      repoRoot: root,
      independentManifest: independent,
      benchmarkRegistryInventoryHash: registry.inventoryHash,
    });
    expect(alias.benchmarkRegistry.wired).toBe(true);
    expect(alias.benchmarkRegistry.inventoryHash).toBe(registry.inventoryHash);
    expect(alias.benchmarkRegistry.noParallelEvalPlatform).toBe(true);
    expect(alias.honesty.m1ThroughM6NotScientificallyValidated).toBe(true);
    expect(alias.honesty.llmJudgeNotSoleAuthority).toBe(true);
    expect(parseScientificBenchmarkV1Alias(alias).inventoryHash).toBe(alias.inventoryHash);
  });

  test("sealed on-disk registry and alias match when present", () => {
    expect(existsSync(registryPath)).toBe(true);
    expect(existsSync(registryStatusPath)).toBe(true);
    expect(existsSync(aliasPath)).toBe(true);
    const registry = parseScientificBenchmarkRegistry(JSON.parse(readFileSync(registryPath, "utf8")));
    expect(registry.categories).toHaveLength(M7_BENCHMARK_CATEGORY_COUNT);
    expect(registry.smeSlotsFilled).toBe(0);
    expect(registry.heldOutFrozen).toBe(false);
    const status = JSON.parse(readFileSync(registryStatusPath, "utf8")) as {
      releaseGateClassification: string;
      smeSlotsFilled: number;
    };
    expect(status.releaseGateClassification).toBe("scientific_evaluation_pending");
    expect(status.smeSlotsFilled).toBe(0);
    const alias = parseScientificBenchmarkV1Alias(JSON.parse(readFileSync(aliasPath, "utf8")));
    expect(alias.benchmarkRegistry.inventoryHash).toBe(registry.inventoryHash);
  });
});
