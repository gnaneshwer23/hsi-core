#!/usr/bin/env bun
/**
 * M7 PR1 — Scientific Benchmark Registry under scientific_benchmark_v1 alias.
 * Default / --check: offline sealed registry. Never invents SME scores or live success.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildIndependentEvaluationSuites,
  parseIndependentEvaluationSuites,
} from "../src/evidence/independentEvaluationSuites";
import {
  assertNoHeldOutLeakage,
  buildScientificBenchmarkRegistry,
  parseScientificBenchmarkRegistry,
  SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
} from "../src/evidence/scientificBenchmarkRegistry";
import {
  buildScientificBenchmarkV1Alias,
  parseScientificBenchmarkV1Alias,
  SCIENTIFIC_BENCHMARK_V1_PATH,
} from "../src/evidence/scientificBenchmarkV1";

const root = resolve(import.meta.dir, "..");
const registryDir = resolve(root, SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH);
const registryPath = resolve(registryDir, "registry-manifest.v1.json");
const registryStatusPath = resolve(registryDir, "STATUS.json");
const aliasDir = resolve(root, SCIENTIFIC_BENCHMARK_V1_PATH);
const aliasPath = resolve(aliasDir, "alias-manifest.v1.json");
const aliasStatusPath = resolve(aliasDir, "STATUS.json");
const independentManifestPath = resolve(
  root,
  "evaluation/independent-evaluation/suite-manifest.v1.json",
);
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-09T10:30:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSame(path: string, expected: unknown): void {
  const onDisk = JSON.parse(readFileSync(path, "utf8"));
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
    throw new Error(`scientific benchmark registry artifact drift: ${path}`);
  }
}

if (!existsSync(independentManifestPath)) {
  throw new Error(
    "Missing evaluation/independent-evaluation/suite-manifest.v1.json — run eval:independent:prepare first",
  );
}

const independent = parseIndependentEvaluationSuites(
  JSON.parse(readFileSync(independentManifestPath, "utf8")),
);
const rebuiltIndependent = parseIndependentEvaluationSuites(
  buildIndependentEvaluationSuites({
    generatedAt: independent.generatedAt,
    liveGateOpen: false,
    repoRoot: root,
  }),
);
if (independent.inventoryHash !== rebuiltIndependent.inventoryHash) {
  throw new Error(
    "independent-evaluation manifest drift vs rebuild — refresh with eval:independent:prepare",
  );
}

const registry = parseScientificBenchmarkRegistry(
  buildScientificBenchmarkRegistry({generatedAt}),
);
assertNoHeldOutLeakage(registry);

const registryStatus = {
  schemaVersion: "hsi-scientific-benchmark-registry-status-1",
  path: SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
  generatedAt,
  categoryCount: registry.categories.length,
  developmentCaseCount: registry.partitions.developmentCaseCount,
  heldOutCaseCount: registry.partitions.heldOutCaseCount,
  heldOutFrozen: registry.heldOutFrozen,
  smeSlotsFilled: registry.smeSlotsFilled,
  engineeringScaffold: registry.engineeringScaffold,
  scientificAcceptance: registry.scientificAcceptance,
  releaseGateClassification: registry.releaseGateClassification,
  numericAcceptanceThresholdsInvented: registry.numericAcceptanceThresholdsInvented,
  wiresTo: registry.wiresTo,
  humanQueueBlocked: registry.humanQueueBlocked,
  inventoryHash: registry.inventoryHash,
  stopNote: registry.stopNote,
  note: "M7 PR1 registry scaffold. Empty SME/held-out references. Not scientific validation.",
};

const alias = parseScientificBenchmarkV1Alias(
  buildScientificBenchmarkV1Alias({
    generatedAt,
    repoRoot: root,
    independentManifest: independent,
    benchmarkRegistryInventoryHash: registry.inventoryHash,
  }),
);

const aliasStatus = {
  schemaVersion: "hsi-scientific-benchmark-v1-status-1",
  path: SCIENTIFIC_BENCHMARK_V1_PATH,
  generatedAt,
  aliasesCanonicalPath: alias.aliases.canonicalPath,
  canonicalInventoryHash: alias.aliases.inventoryHash,
  benchmarkRegistryInventoryHash: alias.benchmarkRegistry.inventoryHash,
  engineeringScaffold: "CLEARED" as const,
  scientificAcceptance: "BLOCKED" as const,
  rightsAcceptance: "BLOCKED" as const,
  liveJourneyAcceptance: "BLOCKED" as const,
  productionReadinessClaimed: false as const,
  scientificValidityClaimed: false as const,
  liveSuccessClaimed: false as const,
  smeSlotsFilled: 0 as const,
  scorecardDimensions: alias.scorecardDimensionIds.length,
  representativeQuestionDomains: alias.representativeQuestionDomains,
  humanQueueBlocked: alias.humanQueueBlocked,
  inventoryHash: alias.inventoryHash,
  stopNote: alias.stopNote,
  note: "Alias of independent-evaluation + M7 registry scaffold. Not a parallel eval platform. #2/#4/#5 PARKED.",
};

if (checkOnly) {
  if (!existsSync(registryPath) || !existsSync(registryStatusPath)) {
    throw new Error("Missing scientific benchmark registry artifacts; run prepare first");
  }
  if (!existsSync(aliasPath) || !existsSync(aliasStatusPath)) {
    throw new Error("Missing scientific_benchmark_v1 alias artifacts; run prepare first");
  }
  const onDiskRegistry = parseScientificBenchmarkRegistry(JSON.parse(readFileSync(registryPath, "utf8")));
  if (onDiskRegistry.inventoryHash !== registry.inventoryHash) {
    throw new Error(
      `registry drift: disk=${onDiskRegistry.inventoryHash} rebuilt=${registry.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDiskRegistry) !== canonicalEvidenceJson(registry)) {
    throw new Error("registry body drift vs rebuild");
  }
  assertSame(registryStatusPath, registryStatus);

  const onDiskAlias = parseScientificBenchmarkV1Alias(JSON.parse(readFileSync(aliasPath, "utf8")));
  if (onDiskAlias.inventoryHash !== alias.inventoryHash) {
    throw new Error(
      `scientific_benchmark_v1 alias drift: disk=${onDiskAlias.inventoryHash} rebuilt=${alias.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDiskAlias) !== canonicalEvidenceJson(alias)) {
    throw new Error("scientific_benchmark_v1 alias body drift vs rebuild");
  }
  if (onDiskAlias.benchmarkRegistry.inventoryHash !== registry.inventoryHash) {
    throw new Error("alias registry inventoryHash must match sealed registry");
  }
  assertSame(aliasStatusPath, aliasStatus);
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: SCIENTIFIC_BENCHMARK_REGISTRY_RELATIVE_PATH,
        categories: onDiskRegistry.categories.length,
        developmentCases: onDiskRegistry.partitions.developmentCaseCount,
        heldOutCases: onDiskRegistry.partitions.heldOutCaseCount,
        scientificAcceptance: onDiskRegistry.scientificAcceptance,
        releaseGateClassification: onDiskRegistry.releaseGateClassification,
        smeSlotsFilled: onDiskRegistry.smeSlotsFilled,
        aliasInventoryHash: onDiskAlias.inventoryHash,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

mkdirSync(registryDir, {recursive: true});
writeJson(registryPath, registry);
writeJson(registryStatusPath, registryStatus);
mkdirSync(aliasDir, {recursive: true});
writeJson(aliasPath, alias);
writeJson(aliasStatusPath, aliasStatus);
console.log(
  JSON.stringify(
    {
      ok: true,
      wrote: [registryPath, registryStatusPath, aliasPath, aliasStatusPath],
      categories: registry.categories.length,
      scientificAcceptance: registry.scientificAcceptance,
      releaseGateClassification: registry.releaseGateClassification,
      smeSlotsFilled: registry.smeSlotsFilled,
      aliasInventoryHash: alias.inventoryHash,
    },
    null,
    2,
  ),
);
