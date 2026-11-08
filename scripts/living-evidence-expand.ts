#!/usr/bin/env bun
/**
 * Execution step 03 — Living evidence expansion harness.
 * Default / --check: offline replay of captured Europe PMC / Open Targets / CT.gov fixtures.
 * Pass --live to probe providers (rate-limited) and refresh fixtures + receipts.
 * Never invents humanCleared, passage import, Gate C, MoU, or O-04 trials attach.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
  assertLivingEvidencePins,
  parseLivingEvidenceExpansionReceipt,
  runLivingEvidenceExpansionFromFixtures,
  runLivingEvidenceExpansionFromProviders,
} from "../src/evidence/livingEvidenceExpansion";

const root = resolve(import.meta.dir, "..");
const dir = resolve(root, "research/domain-graph/living-evidence");
const fixturesDir = resolve(dir, "fixtures");
const receiptsDir = resolve(dir, "receipts");
const live = process.argv.includes("--live");
const check = process.argv.includes("--check");

const OFFLINE_RETRIEVED_AT = "2026-11-08T17:40:00.000Z";
const OFFLINE_AS_OF = "2026-11-08T17:45:00.000Z";
const OFFLINE_GENERATED_AT = "2026-11-08T17:45:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function loadFixtures(): {
  europePmcBodiesByPmid: Record<string, {httpStatus: number; bodyText: string}>;
  openTargetsBodiesByDiseaseId: Record<string, {httpStatus: number; bodyText: string}>;
  ctgovBodiesByNct: Record<string, {httpStatus: number; bodyText: string}>;
} {
  const europePmcBodiesByPmid: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const pmid of LIVING_EVIDENCE_PMID_PINS) {
    const path = resolve(fixturesDir, `europepmc.pmid.${pmid}.json`);
    if (!existsSync(path)) throw new Error(`Missing Europe PMC fixture: ${path}`);
    europePmcBodiesByPmid[pmid] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  const openTargetsBodiesByDiseaseId: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const diseaseId of LIVING_EVIDENCE_DISEASE_PINS) {
    const path = resolve(fixturesDir, `opentargets.disease.${diseaseId.toLowerCase()}.json`);
    if (!existsSync(path)) throw new Error(`Missing Open Targets fixture: ${path}`);
    openTargetsBodiesByDiseaseId[diseaseId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  const ctgovBodiesByNct: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const nctId of LIVING_EVIDENCE_NCT_PINS) {
    const path = resolve(fixturesDir, `ctgov.${nctId.toLowerCase()}.json`);
    if (!existsSync(path)) throw new Error(`Missing CT.gov fixture: ${path}`);
    ctgovBodiesByNct[nctId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  return {europePmcBodiesByPmid, openTargetsBodiesByDiseaseId, ctgovBodiesByNct};
}

async function main(): Promise<void> {
  assertLivingEvidencePins();
  mkdirSync(fixturesDir, {recursive: true});
  mkdirSync(receiptsDir, {recursive: true});

  const snapshotPath = resolve(dir, "expansion.v1.json");
  const receiptPath = resolve(receiptsDir, "expansion.receipt.json");
  const statusPath = resolve(dir, "STATUS.json");

  if (live) {
    const liveRun = await runLivingEvidenceExpansionFromProviders();
    parseLivingEvidenceExpansionReceipt(liveRun.receipt);
    writeJson(resolve(receiptsDir, "expansion.provider.receipt.json"), liveRun.receipt);
    // Refresh bibliographic / OT fixtures from live OK hits when present on disk already.
    console.log(
      JSON.stringify({
        mode: "live_provider_probe",
        bibliographicRetrieved: liveRun.receipt.bibliographicRetrieved,
        openTargetsRetrieved: liveRun.receipt.openTargetsRetrieved,
        registryEntitiesResolved: liveRun.receipt.registryEntitiesResolved,
        humanCleared: false,
        passageImported: false,
        scientificAcceptance: "BLOCKED",
      }),
    );
  }

  const replay = runLivingEvidenceExpansionFromFixtures({
    ...loadFixtures(),
    retrievedAt: OFFLINE_RETRIEVED_AT,
    asOf: OFFLINE_AS_OF,
    generatedAt: OFFLINE_GENERATED_AT,
  });
  const receipt = parseLivingEvidenceExpansionReceipt(replay.receipt);

  if (check) {
    if (!existsSync(receiptPath) || !existsSync(snapshotPath)) {
      throw new Error("Missing durable living-evidence artifacts; run without --check first");
    }
    const onDiskReceipt = parseLivingEvidenceExpansionReceipt(JSON.parse(readFileSync(receiptPath, "utf8")));
    if (onDiskReceipt.receiptHash !== receipt.receiptHash) {
      throw new Error(
        `Living evidence receipt drift: disk=${onDiskReceipt.receiptHash} rebuilt=${receipt.receiptHash}`,
      );
    }
    if (canonicalEvidenceJson(onDiskReceipt) !== canonicalEvidenceJson(receipt)) {
      throw new Error("Living evidence receipt body drift vs rebuild");
    }
    const onDiskSnapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
    if (canonicalEvidenceJson(onDiskSnapshot) !== canonicalEvidenceJson(receipt.snapshot)) {
      throw new Error("Living evidence snapshot drift vs rebuild");
    }
    if (receipt.humanCleared !== false || receipt.passageImported !== false) {
      throw new Error("Rights honesty flags must stay false");
    }
    console.log(
      JSON.stringify({
        ok: true,
        mode: "offline_fixture_replay",
        receiptHash: receipt.receiptHash,
        snapshotHash: receipt.snapshot.snapshotHash,
        bibliographicRetrieved: receipt.bibliographicRetrieved,
        openTargetsRetrieved: receipt.openTargetsRetrieved,
        graphRelationshipCandidates: receipt.graphRelationshipCandidates,
        humanCleared: false,
        passageImported: false,
        scientificAcceptance: "BLOCKED",
      }),
    );
    return;
  }

  writeJson(snapshotPath, receipt.snapshot);
  writeJson(receiptPath, receipt);
  writeJson(statusPath, {
    schemaVersion: "hsi-living-evidence-status-1",
    phase: "step_03",
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    rightsAcceptance: "BLOCKED",
    humanCleared: 0,
    passageImported: 0,
    graphPromotable: false,
    receiptHash: receipt.receiptHash,
    snapshotHash: receipt.snapshot.snapshotHash,
    pinnedPmids: LIVING_EVIDENCE_PMID_PINS,
    pinnedDiseaseIds: LIVING_EVIDENCE_DISEASE_PINS,
    pinnedNctIds: LIVING_EVIDENCE_NCT_PINS,
    nextMilestone: receipt.nextMilestone,
    generatedAt: OFFLINE_GENERATED_AT,
  });
  console.log(
    JSON.stringify({
      wrote: [snapshotPath, receiptPath, statusPath],
      receiptHash: receipt.receiptHash,
      snapshotHash: receipt.snapshot.snapshotHash,
      bibliographicRetrieved: receipt.bibliographicRetrieved,
      openTargetsRetrieved: receipt.openTargetsRetrieved,
      graphRelationshipCandidates: receipt.graphRelationshipCandidates,
      humanCleared: false,
      passageImported: false,
      unavailableCapabilities: receipt.unavailableCapabilities,
    }, null, 2),
  );
}

await main();
