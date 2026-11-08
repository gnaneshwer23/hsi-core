#!/usr/bin/env bun
/**
 * Audit Phase #10 — N7/N8 real-data / licensed-model prep (ENG CLEARED / SCIENCE NO-GO).
 * Offline harness only. Does not invent wet-lab runs, partner data, licences, or MoU.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {buildN7N8RealDataPrep, parseN7N8RealDataPrep} from "../src/evidence/n7n8RealDataPrep";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "research/domain-graph/n7n8");
const outPath = resolve(outDir, "real-data-prep.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T13:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const prep = buildN7N8RealDataPrep({generatedAt});
parseN7N8RealDataPrep(prep);

if (checkOnly) {
  const onDisk = parseN7N8RealDataPrep(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.prepHash !== prep.prepHash) {
    throw new Error(
      `N7/N8 real-data prep drift: disk=${onDisk.prepHash} rebuilt=${prep.prepHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(prep)) {
    throw new Error("N7/N8 real-data prep body drift vs rebuild");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        scientificAcceptance: onDisk.scientificAcceptance,
        nearTermGoNoGo: onDisk.nearTermGoNoGo,
        realDataSlotsFilled: onDisk.summary.realDataSlotsFilled,
        engineeringChecksCleared: onDisk.summary.engineeringChecksCleared,
        humanChecksPending: onDisk.summary.humanChecksPending,
        prepHash: onDisk.prepHash,
        stopNote: onDisk.stopNote,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

mkdirSync(outDir, {recursive: true});
writeJson(outPath, prep);
writeJson(statusPath, {
  schemaVersion: "hsi-n7n8-real-data-status-1",
  phase: "N7_N8",
  remediationPhase: "production_readiness_audit_phase_10",
  generatedAt,
  engineeringScaffold: "CLEARED",
  scientificAcceptance: "BLOCKED",
  nearTermGoNoGo: "NO_GO",
  realObservationClaimed: false,
  modelActivationAllowed: false,
  liveProviderCalled: false,
  realDataSlotsReserved: prep.summary.realDataSlotsReserved,
  realDataSlotsFilled: 0,
  engineeringChecksCleared: prep.summary.engineeringChecksCleared,
  humanChecksPending: prep.summary.humanChecksPending,
  note: "Eng harness only. Near-term NO-GO for real N7 observations / N8 licensed models. Never invent wet-lab, partner data, MoU, or live provider calls. Further progress = human residuals (#2/#3/#4/#5/#8).",
  stopNote: prep.stopNote,
  prepHash: prep.prepHash,
});

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: prep.engineeringScaffold,
      scientificAcceptance: prep.scientificAcceptance,
      nearTermGoNoGo: prep.nearTermGoNoGo,
      prepHash: prep.prepHash,
      humanMustSupplyCount: prep.humanMustSupply.length,
      codeCanAutomateCount: prep.codeCanAutomate.length,
      stopNote: prep.stopNote,
    },
    null,
    2,
  ),
);
