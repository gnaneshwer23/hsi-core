#!/usr/bin/env bun
/**
 * scientific_benchmark_v1 alias scaffold over independent-evaluation.
 * Default / --check: offline sealed alias. Never invents SME scores or live success.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildIndependentEvaluationSuites,
  parseIndependentEvaluationSuites,
} from "../src/evidence/independentEvaluationSuites";
import {
  buildScientificBenchmarkV1Alias,
  parseScientificBenchmarkV1Alias,
  SCIENTIFIC_BENCHMARK_V1_PATH,
} from "../src/evidence/scientificBenchmarkV1";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, SCIENTIFIC_BENCHMARK_V1_PATH);
const aliasPath = resolve(outDir, "alias-manifest.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const independentManifestPath = resolve(
  root,
  "evaluation/independent-evaluation/suite-manifest.v1.json",
);
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T23:55:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSame(path: string, expected: unknown): void {
  const onDisk = JSON.parse(readFileSync(path, "utf8"));
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
    throw new Error(`scientific_benchmark_v1 artifact drift: ${path}`);
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

const alias = parseScientificBenchmarkV1Alias(
  buildScientificBenchmarkV1Alias({
    generatedAt,
    repoRoot: root,
    independentManifest: independent,
  }),
);

const status = {
  schemaVersion: "hsi-scientific-benchmark-v1-status-1",
  path: SCIENTIFIC_BENCHMARK_V1_PATH,
  generatedAt,
  aliasesCanonicalPath: alias.aliases.canonicalPath,
  canonicalInventoryHash: alias.aliases.inventoryHash,
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
  note: "Alias of independent-evaluation. Not a parallel eval platform. #2/#4/#5 PARKED.",
};

if (checkOnly) {
  if (!existsSync(aliasPath) || !existsSync(statusPath)) {
    throw new Error("Missing scientific_benchmark_v1 artifacts; run prepare first");
  }
  const onDisk = parseScientificBenchmarkV1Alias(JSON.parse(readFileSync(aliasPath, "utf8")));
  if (onDisk.inventoryHash !== alias.inventoryHash) {
    throw new Error(
      `scientific_benchmark_v1 alias drift: disk=${onDisk.inventoryHash} rebuilt=${alias.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(alias)) {
    throw new Error("scientific_benchmark_v1 alias body drift vs rebuild");
  }
  assertSame(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: SCIENTIFIC_BENCHMARK_V1_PATH,
        aliases: onDisk.aliases.canonicalPath,
        scientificAcceptance: onDisk.scientificAcceptance,
        liveSuccessClaimed: onDisk.liveSuccessClaimed,
        smeSlotsFilled: onDisk.smeSlotsFilled,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

mkdirSync(outDir, {recursive: true});
writeJson(aliasPath, alias);
writeJson(statusPath, status);
console.log(
  JSON.stringify(
    {
      ok: true,
      wrote: [aliasPath, statusPath],
      aliases: alias.aliases.canonicalPath,
      scientificAcceptance: alias.scientificAcceptance,
      liveSuccessClaimed: alias.liveSuccessClaimed,
      smeSlotsFilled: alias.smeSlotsFilled,
    },
    null,
    2,
  ),
);
