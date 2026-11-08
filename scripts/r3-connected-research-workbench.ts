#!/usr/bin/env bun
/**
 * Roadmap R3 — Connected Research Workbench deepen (ENG CLEARED / SCIENCE BLOCKED).
 * Ask→retrieve→investigate→verify→review→export mapped to real APIs + synthetic fixture.
 * Does not invent passages, SME gold, MoU, Gate C, or production writes.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildR3ConnectedResearchWorkbench,
  parseR3ConnectedResearchWorkbench,
} from "../src/evidence/r3ConnectedResearchWorkbench";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "research/connected-workbench/r3");
const outPath = resolve(outDir, "workbench-journey.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T16:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSame(path: string, expected: unknown): void {
  const onDisk = JSON.parse(readFileSync(path, "utf8"));
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
    throw new Error(`R3 artifact drift: ${path}`);
  }
}

const manifest = parseR3ConnectedResearchWorkbench(
  await buildR3ConnectedResearchWorkbench({generatedAt, repoRoot: root}),
);

const status = {
  schemaVersion: "hsi-r3-connected-research-workbench-status-1",
  phase: "R3",
  roadmapPhase: "connected_research_workbench",
  generatedAt,
  engineeringScaffold: "CLEARED" as const,
  scientificAcceptance: "BLOCKED" as const,
  rightsAcceptance: "BLOCKED" as const,
  researcherJourneyCompleteClaimed: false as const,
  productionReadyClaimed: false as const,
  writesEnabledClaimed: false as const,
  stageCount: 6 as const,
  apiBoundStages: 6 as const,
  inspectablePassageStages: manifest.summary.inspectablePassageStages,
  hardCodedDemoContent: 0 as const,
  gateCAutoApprove: false as const,
  legalBinding: false as const,
  recordedPilotDecisionUnchanged: true as const,
  syntheticFixtureId: manifest.syntheticFixture.investigationId,
  mechanismWorkflowHash: manifest.mechanismWorkflow.workflowHash,
  engineeringChecksCleared: manifest.summary.engineeringChecksCleared,
  humanChecksPending: manifest.summary.humanChecksPending,
  parkedHumanResiduals: manifest.parkedHumanResiduals,
  note: "Eng harness only. Journey is API-mapped; inspectable passages come from backend responses. Synthetic fixture is not scientific gold. Do not invent MoU, Gate C, or production writes.",
  stopNote: manifest.stopNote,
  inventoryHash: manifest.inventoryHash,
};

if (checkOnly) {
  const onDisk = parseR3ConnectedResearchWorkbench(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.inventoryHash !== manifest.inventoryHash) {
    throw new Error(
      `R3 workbench journey drift: disk=${onDisk.inventoryHash} rebuilt=${manifest.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(manifest)) {
    throw new Error("R3 workbench journey body drift vs rebuild");
  }
  assertSame(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        scientificAcceptance: onDisk.scientificAcceptance,
        rightsAcceptance: onDisk.rightsAcceptance,
        researcherJourneyCompleteClaimed: onDisk.researcherJourneyCompleteClaimed,
        productionReadyClaimed: onDisk.productionReadyClaimed,
        stageCount: onDisk.summary.stageCount,
        apiBoundStages: onDisk.summary.apiBoundStages,
        inspectablePassageStages: onDisk.summary.inspectablePassageStages,
        hardCodedDemoContent: onDisk.summary.hardCodedDemoContent,
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

mkdirSync(outDir, {recursive: true});
writeJson(outPath, manifest);
writeJson(statusPath, status);

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: manifest.engineeringScaffold,
      scientificAcceptance: manifest.scientificAcceptance,
      rightsAcceptance: manifest.rightsAcceptance,
      researcherJourneyCompleteClaimed: manifest.researcherJourneyCompleteClaimed,
      inventoryHash: manifest.inventoryHash,
      humanMustSupplyCount: manifest.humanMustSupply.length,
      codeCanAutomateCount: manifest.codeCanAutomate.length,
      stopNote: manifest.stopNote,
    },
    null,
    2,
  ),
);
