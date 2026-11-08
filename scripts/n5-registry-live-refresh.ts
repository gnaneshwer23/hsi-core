#!/usr/bin/env bun
/**
 * Audit Phase #9 — optional N5 live public-registry snapshot refresh.
 * Default / --check: offline replay of captured CT.gov fixtures (CI-safe).
 * Pass --live to probe ClinicalTrials.gov API v2 and refresh fixtures + receipt.
 * Never sets confirmedEligible=true · never invents enrolment · sci stays BLOCKED.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  N5_LIVE_REFRESH_NCT_IDS,
  assertLiveRefreshNctPins,
  parseN5LiveRefreshReceipt,
  runN5LiveRefreshFromFixtures,
  runN5LiveRefreshFromProvider,
} from "../src/evidence/n5RegistryLiveRefresh";

const root = resolve(import.meta.dir, "..");
const n5Dir = resolve(root, "research/domain-graph/n5");
const fixturesDir = resolve(n5Dir, "fixtures");
const receiptsDir = resolve(n5Dir, "receipts");
const live = process.argv.includes("--live");
const check = process.argv.includes("--check");

/** Frozen offline-replay stamps for captured live fixtures (reproducible check). */
const OFFLINE_REPLAY_RETRIEVED_AT = "2026-11-08T12:15:00.000Z";
const OFFLINE_REPLAY_AS_OF = "2026-11-08T12:20:00.000Z";
const OFFLINE_REPLAY_GENERATED_AT = "2026-11-08T12:20:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function loadCapturedBodies(): Record<string, {httpStatus: number; bodyText: string}> {
  const out: Record<string, {httpStatus: number; bodyText: string}> = {};
  for (const nctId of N5_LIVE_REFRESH_NCT_IDS) {
    const path = resolve(fixturesDir, `ctgov.live.${nctId.toLowerCase()}.json`);
    if (!existsSync(path)) throw new Error(`Missing captured live fixture: ${path}`);
    out[nctId] = {httpStatus: 200, bodyText: readFileSync(path, "utf8")};
  }
  return out;
}

async function main(): Promise<void> {
  assertLiveRefreshNctPins();
  mkdirSync(fixturesDir, {recursive: true});
  mkdirSync(receiptsDir, {recursive: true});

  const snapshotPath = resolve(n5Dir, "registry-criteria.live.snapshot.v1.json");
  const receiptPath = resolve(receiptsDir, "registry.live.receipt.json");
  const combinedFixturePath = resolve(fixturesDir, "ctgov.live.v1.json");
  const statusPath = resolve(n5Dir, "LIVE_REFRESH_STATUS.json");
  const offlineStatusPath = resolve(n5Dir, "STATUS.json");

  let providerReceiptHash: string | null = null;

  if (live) {
    const liveRun = await runN5LiveRefreshFromProvider();
    parseN5LiveRefreshReceipt(liveRun.receipt);
    providerReceiptHash = liveRun.receipt.receiptHash;
    for (const result of liveRun.lookupResults) {
      if (!result.ok) continue;
      writeFileSync(
        resolve(fixturesDir, `ctgov.live.${result.nctId.toLowerCase()}.json`),
        `${result.bodyText.trim()}\n`,
      );
    }
    // Sidecar: wall-clock live provider receipt (not the durable --check pin).
    writeJson(resolve(receiptsDir, "registry.live.provider.receipt.json"), liveRun.receipt);
  }

  // Durable artifacts always come from fixture replay with frozen stamps (CI-reproducible).
  const replay = runN5LiveRefreshFromFixtures({
    fixtureBodiesByNct: loadCapturedBodies(),
    retrievedAt: OFFLINE_REPLAY_RETRIEVED_AT,
    asOf: OFFLINE_REPLAY_AS_OF,
    generatedAt: OFFLINE_REPLAY_GENERATED_AT,
  });
  const receipt = replay.receipt;
  const fixtureJson = replay.fixtureJson;
  parseN5LiveRefreshReceipt(receipt);

  if (check) {
    const onDiskReceipt = parseN5LiveRefreshReceipt(JSON.parse(readFileSync(receiptPath, "utf8")));
    if (onDiskReceipt.receiptHash !== receipt.receiptHash) {
      throw new Error(
        `Live refresh receipt drift: disk=${onDiskReceipt.receiptHash} rebuilt=${receipt.receiptHash}`,
      );
    }
    if (canonicalEvidenceJson(onDiskReceipt) !== canonicalEvidenceJson(receipt)) {
      throw new Error("Live refresh receipt body drift vs rebuild");
    }
    const onDiskSnapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
    if (canonicalEvidenceJson(onDiskSnapshot) !== canonicalEvidenceJson(receipt.snapshot)) {
      throw new Error("Live snapshot drift vs rebuild");
    }
    if (receipt.confirmedEligible !== false || receipt.patientEligible !== false) {
      throw new Error("Eligibility honesty flags must stay false");
    }
    if (receipt.scientificAcceptance !== "BLOCKED") {
      throw new Error("scientificAcceptance must stay BLOCKED");
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: receipt.mode,
          engineeringHarness: receipt.engineeringHarness,
          scientificAcceptance: receipt.scientificAcceptance,
          confirmedEligible: receipt.confirmedEligible,
          liveRegistryQueried: receipt.liveRegistryQueried,
          liveStatusVerified: receipt.liveStatusVerified,
          pinnedNctIds: receipt.pinnedNctIds,
          studies: receipt.reports.map((r) => ({
            nctId: r.nctId,
            satisfied: r.satisfiedCount,
            unknown: r.unknownCount,
            review: r.requiresInvestigatorReviewCount,
            confirmedEligible: r.confirmedEligible,
          })),
          receiptHash: receipt.receiptHash,
        },
        null,
        2,
      ),
    );
    return;
  }

  writeJson(combinedFixturePath, fixtureJson);
  writeJson(snapshotPath, receipt.snapshot);
  writeJson(receiptPath, receipt);
  writeJson(statusPath, {
    phase: "N5",
    remediationPhase: "production_readiness_audit_phase_9",
    programme: "gut_immune_t2d",
    mode: receipt.mode,
    generatedAt: receipt.generatedAt,
    asOf: receipt.asOf,
    retrievedAt: receipt.retrievedAt,
    snapshotHash: receipt.snapshotHash,
    receiptHash: receipt.receiptHash,
    studyCount: receipt.snapshot.studies.length,
    pinnedNctIds: [...receipt.pinnedNctIds],
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    confirmedEligible: false,
    patientEligible: false,
    patientEligibilityAssessed: false,
    liveRegistryQueried: true,
    liveStatusVerified: false,
    enrolmentEnabled: false,
    inventedEligibilityPermitted: false,
    note: "Live public-registry snapshot refresh for research only. Not confirmed eligibility or enrolment.",
  });

  // Stamp offline STATUS.json with live-refresh sidecar pointer; keep offline eligibility false.
  if (existsSync(offlineStatusPath)) {
    const offline = JSON.parse(readFileSync(offlineStatusPath, "utf8")) as Record<string, unknown>;
    offline.liveRefresh = {
      remediationPhase: "production_readiness_audit_phase_9",
      statusPath: "research/domain-graph/n5/LIVE_REFRESH_STATUS.json",
      receiptPath: "research/domain-graph/n5/receipts/registry.live.receipt.json",
      snapshotPath: "research/domain-graph/n5/registry-criteria.live.snapshot.v1.json",
      engineeringHarness: "CLEARED",
      scientificAcceptance: "BLOCKED",
      confirmedEligible: false,
      liveRegistryQueried: true,
      liveStatusVerified: false,
      receiptHash: receipt.receiptHash,
      mode: receipt.mode,
    };
    writeJson(offlineStatusPath, offline);
  }

  console.log(
    JSON.stringify(
      {
        wrote: [combinedFixturePath, snapshotPath, receiptPath, statusPath],
        mode: receipt.mode,
        liveProviderProbed: live,
        providerReceiptHash,
        engineeringHarness: receipt.engineeringHarness,
        scientificAcceptance: receipt.scientificAcceptance,
        confirmedEligible: receipt.confirmedEligible,
        liveRegistryQueried: receipt.liveRegistryQueried,
        pinnedNctIds: receipt.pinnedNctIds,
        receiptHash: receipt.receiptHash,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
