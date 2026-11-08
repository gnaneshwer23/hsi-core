#!/usr/bin/env bun
/**
 * Roadmap R1 — Biomedical evidence source-packet inventory (ENG CLEARED / SCIENCE BLOCKED).
 * Binds N1 rights inventory into reviewable packet slots. Does not clear rights or import passages.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildR1BiomedicalSourcePackets,
  parseR1BiomedicalSourcePackets,
} from "../src/evidence/r1BiomedicalSourcePackets";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "research/domain-graph/r1");
const outPath = resolve(outDir, "source-packets.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T15:30:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
parseR1BiomedicalSourcePackets(inventory);

if (checkOnly) {
  const onDisk = parseR1BiomedicalSourcePackets(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.inventoryHash !== inventory.inventoryHash) {
    throw new Error(
      `R1 source-packet inventory drift: disk=${onDisk.inventoryHash} rebuilt=${inventory.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(inventory)) {
    throw new Error("R1 source-packet inventory body drift vs rebuild");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        scientificAcceptance: onDisk.scientificAcceptance,
        rightsAcceptance: onDisk.rightsAcceptance,
        humanCleared: onDisk.summary.humanCleared,
        passageImported: onDisk.summary.passageImported,
        packetSlotsReserved: onDisk.summary.packetSlotsReserved,
        engineeringChecksCleared: onDisk.summary.engineeringChecksCleared,
        humanChecksPending: onDisk.summary.humanChecksPending,
        n1RightsInventoryHash: onDisk.n1RightsInventoryHash,
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
writeJson(outPath, inventory);
writeJson(statusPath, {
  schemaVersion: "hsi-r1-biomedical-source-packets-status-1",
  phase: "R1",
  roadmapPhase: "biomedical_evidence_datasets",
  generatedAt,
  engineeringScaffold: "CLEARED",
  scientificAcceptance: "BLOCKED",
  rightsAcceptance: "BLOCKED",
  humanCleared: 0,
  passageImported: 0,
  packetSlotsReserved: inventory.summary.packetSlotsReserved,
  packetSlotsRightsCleared: 0,
  ontologySlotsFilled: 0,
  contextSlotsFilled: 0,
  smeGoldFilled: false,
  gateCAutoApprove: false,
  legalBinding: false,
  n1RightsInventoryHash: inventory.n1RightsInventoryHash,
  n1ReceiptHash: inventory.n1ReceiptHash,
  engineeringChecksCleared: inventory.summary.engineeringChecksCleared,
  humanChecksPending: inventory.summary.humanChecksPending,
  parkedHumanResiduals: inventory.parkedHumanResiduals,
  note: "Eng harness only. Reviewable rights-pending source packets. Do not invent licenceEvidenceUri, passage import, SME gold, MoU, or Gate C.",
  stopNote: inventory.stopNote,
  inventoryHash: inventory.inventoryHash,
});

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: inventory.engineeringScaffold,
      scientificAcceptance: inventory.scientificAcceptance,
      rightsAcceptance: inventory.rightsAcceptance,
      inventoryHash: inventory.inventoryHash,
      humanMustSupplyCount: inventory.humanMustSupply.length,
      codeCanAutomateCount: inventory.codeCanAutomate.length,
      stopNote: inventory.stopNote,
    },
    null,
    2,
  ),
);
