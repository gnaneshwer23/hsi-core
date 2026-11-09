#!/usr/bin/env bun
/**
 * M8 PR1 — Incremental Evidence Monitoring check stub.
 * Default / --check: offline fixture receipt. Never invents live continuous discoveries.
 * --live without an explicit gate stays gated_not_run (fail-closed).
 */
import {createHash} from "node:crypto";
import {mkdirSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildIncrementalMonitoringPack,
  draftResearchTopicSubscription,
  runIncrementalEvidenceMonitoringCheck,
} from "../src/evidence/incrementalEvidenceMonitoring";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "evaluation/incremental-monitoring");
const checkOnly = process.argv.includes("--check");
const liveRequested = process.argv.includes("--live");
const generatedAt = "2026-11-09T12:30:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function hashValue(value: unknown): string {
  return createHash("sha256").update(canonicalEvidenceJson(value)).digest("hex");
}

const disease = draftResearchTopicSubscription({
  subscriptionId: "hsi-mon-ssc-disease-demo",
  topicKind: "disease",
  topicId: "MONDO_0005100",
  topicLabel: "systemic sclerosis",
  scheduleInterval: "daily_bounded",
  createdAt: generatedAt,
});

const pathway = draftResearchTopicSubscription({
  subscriptionId: "hsi-mon-il21-pathway-demo",
  topicKind: "pathway",
  topicId: "R-HSA-6785807",
  reactomePathwayId: "R-HSA-6785807",
  topicLabel: "Interleukin-21 signaling (stub)",
  scheduleInterval: "weekly_bounded",
  createdAt: generatedAt,
});

const pack = buildIncrementalMonitoringPack({
  subscriptions: [disease, pathway],
  generatedAt,
});

const offlineReceipt = runIncrementalEvidenceMonitoringCheck({
  subscription: disease,
  mode: "offline_fixture",
  generatedAt,
  priorEvidenceKeys: ["europe_pmc:19180481"],
  fixtureCandidates: [
    {provider: "europe_pmc", externalId: "19180481"},
    {provider: "europe_pmc", externalId: "24586782"},
  ],
});

const liveReceipt = runIncrementalEvidenceMonitoringCheck({
  subscription: disease,
  mode: "gated_live",
  // Explicit: --live alone does not enable network; gate stays closed in PR1 stub.
  liveGateEnabled: false,
  generatedAt,
});

const status = {
  schemaVersion: "hsi-incremental-monitoring-status-1",
  method: pack.method,
  version: pack.version,
  generatedAt,
  checkOnly,
  liveRequested,
  offlineStatus: offlineReceipt.status,
  liveStatus: liveReceipt.status,
  scientificAcceptance: "BLOCKED",
  engineeringHarness: "CLEARED",
  honesty: {
    fixturesAreNotLiveEvidence: true,
    continuousMonitoringIsNotValidatedScience: true,
    changeDetectionPipelineNotImplemented: true,
    unreviewedNotAutoApproved: true,
    noKafka: true,
    liveNetworkUsed: false,
  },
  packHash: hashValue(pack),
  offlineReceiptHash: offlineReceipt.receiptHash,
  liveReceiptHash: liveReceipt.receiptHash,
};

if (checkOnly) {
  if (offlineReceipt.status !== "skipped_offline") {
    throw new Error("Offline monitoring check must stay skipped_offline");
  }
  if (liveReceipt.status !== "gated_not_run") {
    throw new Error("Gated live monitoring must stay gated_not_run without explicit gate");
  }
  if (liveRequested) {
    console.log(
      "incremental-evidence-monitoring --check: live flag noted; PR1 stub remains gated_not_run (no invented live success)",
    );
  }
  console.log(
    `incremental-evidence-monitoring --check OK (subscriptions=${pack.subscriptions.length}; offline=${offlineReceipt.status}; live=${liveReceipt.status})`,
  );
  process.exit(0);
}

mkdirSync(outDir, {recursive: true});
writeJson(resolve(outDir, "subscription-pack.v1.json"), pack);
writeJson(resolve(outDir, "offline-check-receipt.v1.json"), offlineReceipt);
writeJson(resolve(outDir, "gated-live-check-receipt.v1.json"), liveReceipt);
writeJson(resolve(outDir, "STATUS.json"), status);

console.log(
  `Wrote incremental monitoring pack + receipts under evaluation/incremental-monitoring/ (${pack.subscriptions.length} subscriptions; live=${liveReceipt.status})`,
);
