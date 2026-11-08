#!/usr/bin/env bun
/**
 * Roadmap R2 — Gold Evaluation Suite deepen (ENG CLEARED / SCIENCE BLOCKED).
 * Versioned manifest + empty SME/adjudication worksheets + unfilled splits +
 * baseline metric placeholders. Does not invent labels or freeze held-out gold.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildR2GoldEvaluationSuite,
  parseR2GoldEvaluationSuite,
} from "../src/evidence/r2GoldEvaluationSuite";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "evaluation/gold-evaluation-suite/r2");
const worksheetsDir = resolve(outDir, "worksheets");
const splitsDir = resolve(outDir, "splits");
const metricsDir = resolve(outDir, "metrics");
const outPath = resolve(outDir, "suite-manifest.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T15:45:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSame(path: string, expected: unknown): void {
  const onDisk = JSON.parse(readFileSync(path, "utf8"));
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
    throw new Error(`R2 artifact drift: ${path}`);
  }
}

const manifest = parseR2GoldEvaluationSuite(
  await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root}),
);

const smeAPath = resolve(worksheetsDir, "sme-annotator-a.pending.json");
const smeBPath = resolve(worksheetsDir, "sme-annotator-b.pending.json");
const adjudicationPath = resolve(worksheetsDir, "adjudication.pending.json");
const splitsPath = resolve(splitsDir, "study-grouped.slots.json");
const metricsPath = resolve(metricsDir, "baseline-placeholders.v1.json");

const status = {
  schemaVersion: "hsi-r2-gold-evaluation-suite-status-1",
  phase: "R2",
  roadmapPhase: "gold_evaluation_suite",
  generatedAt,
  engineeringScaffold: "CLEARED" as const,
  scientificAcceptance: "BLOCKED" as const,
  rightsAcceptance: "BLOCKED" as const,
  draftCaseCount: manifest.draftCaseCount,
  smeGoldFilled: false as const,
  frozenHeldOut: false as const,
  independentlyLabelledCases: 0 as const,
  adjudicatedCases: 0 as const,
  baselineMetricsScored: 0 as const,
  r1PacketsBoundToGold: 0 as const,
  gateCAutoApprove: false as const,
  legalBinding: false as const,
  draftBankHash: manifest.draftBankHash,
  goldV1SuiteHash: manifest.goldV1SuiteHash,
  r1InventoryHash: manifest.r1InventoryHash,
  engineeringChecksCleared: manifest.summary.engineeringChecksCleared,
  humanChecksPending: manifest.summary.humanChecksPending,
  parkedHumanResiduals: manifest.parkedHumanResiduals,
  note: "Eng harness only. Draft bank is not gold. Empty SME A/B + adjudication worksheets. Do not invent labels, adjudications, scientificAccuracy, MoU, or Gate C.",
  stopNote: manifest.stopNote,
  inventoryHash: manifest.inventoryHash,
};

if (checkOnly) {
  const onDisk = parseR2GoldEvaluationSuite(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.inventoryHash !== manifest.inventoryHash) {
    throw new Error(
      `R2 suite manifest drift: disk=${onDisk.inventoryHash} rebuilt=${manifest.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(manifest)) {
    throw new Error("R2 suite manifest body drift vs rebuild");
  }
  assertSame(smeAPath, manifest.worksheets.smeA);
  assertSame(smeBPath, manifest.worksheets.smeB);
  assertSame(adjudicationPath, manifest.worksheets.adjudication);
  assertSame(splitsPath, manifest.studyGroupedSplits);
  assertSame(metricsPath, manifest.baselineMetrics);
  assertSame(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        scientificAcceptance: onDisk.scientificAcceptance,
        rightsAcceptance: onDisk.rightsAcceptance,
        smeGoldFilled: onDisk.smeGoldFilled,
        frozenHeldOut: onDisk.frozenHeldOut,
        draftCaseCount: onDisk.draftCaseCount,
        independentlyLabelledCases: onDisk.summary.independentlyLabelledCases,
        adjudicatedCases: onDisk.summary.adjudicatedCases,
        baselineMetricsScored: onDisk.summary.baselineMetricsScored,
        engineeringChecksCleared: onDisk.summary.engineeringChecksCleared,
        humanChecksPending: onDisk.summary.humanChecksPending,
        inventoryHash: onDisk.inventoryHash,
        parkedHumanResiduals: onDisk.parkedHumanResiduals,
        stopNote: onDisk.stopNote,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

mkdirSync(worksheetsDir, {recursive: true});
mkdirSync(splitsDir, {recursive: true});
mkdirSync(metricsDir, {recursive: true});
writeJson(outPath, manifest);
writeJson(smeAPath, manifest.worksheets.smeA);
writeJson(smeBPath, manifest.worksheets.smeB);
writeJson(adjudicationPath, manifest.worksheets.adjudication);
writeJson(splitsPath, manifest.studyGroupedSplits);
writeJson(metricsPath, manifest.baselineMetrics);
writeJson(statusPath, status);

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: manifest.engineeringScaffold,
      scientificAcceptance: manifest.scientificAcceptance,
      rightsAcceptance: manifest.rightsAcceptance,
      smeGoldFilled: manifest.smeGoldFilled,
      frozenHeldOut: manifest.frozenHeldOut,
      inventoryHash: manifest.inventoryHash,
      humanMustSupplyCount: manifest.humanMustSupply.length,
      codeCanAutomateCount: manifest.codeCanAutomate.length,
      stopNote: manifest.stopNote,
    },
    null,
    2,
  ),
);
