#!/usr/bin/env bun
/**
 * PR 8 — Independent evaluation suites (deterministic · live · scientific).
 * Default / --check: offline sealed manifest. Pass --live only with
 * HSI_LIVE_INTEGRATION_EVAL=1 — never invents live success or SME scores.
 */
import {mkdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildIndependentEvaluationSuites,
  buildLiveIntegrationAttemptReceipt,
  isLiveIntegrationGateOpen,
  parseIndependentEvaluationSuites,
  LIVE_INTEGRATION_ENV_FLAG,
} from "../src/evidence/independentEvaluationSuites";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "evaluation/independent-evaluation");
const outPath = resolve(outDir, "suite-manifest.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const liveReceiptPath = resolve(outDir, "live-attempt.receipt.json");
const checkOnly = process.argv.includes("--check");
const liveRequested = process.argv.includes("--live");
const generatedAt = "2026-11-08T22:20:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function assertSame(path: string, expected: unknown): void {
  const onDisk = JSON.parse(readFileSync(path, "utf8"));
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
    throw new Error(`Independent evaluation artifact drift: ${path}`);
  }
}

if (liveRequested && !isLiveIntegrationGateOpen()) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: `Live suite refused: set ${LIVE_INTEGRATION_ENV_FLAG}=1 (and pass --live) to attempt live integration.`,
        liveSuccessClaimed: false,
        scientificValidityClaimed: false,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const liveGateOpen = liveRequested && isLiveIntegrationGateOpen();
const liveAttempt = buildLiveIntegrationAttemptReceipt({
  attemptedAt: new Date().toISOString(),
  gateOpen: liveGateOpen,
  // Gate open without operator-supplied stage evidence → honest failed placeholders.
  stageOutcomes: undefined,
});

const manifest = parseIndependentEvaluationSuites(
  buildIndependentEvaluationSuites({
    generatedAt,
    liveGateOpen: false, // sealed offline artifact always records gated-not-run
    liveAttempt: buildLiveIntegrationAttemptReceipt({
      attemptedAt: generatedAt,
      gateOpen: false,
    }),
    repoRoot: root,
  }),
);

const status = {
  schemaVersion: "hsi-independent-evaluation-status-1",
  phase: "PR8",
  programme: "backend_scientific_intelligence",
  generatedAt,
  engineeringScaffold: "CLEARED" as const,
  scientificAcceptance: "BLOCKED" as const,
  rightsAcceptance: "BLOCKED" as const,
  liveJourneyAcceptance: "BLOCKED" as const,
  productionReadinessClaimed: false as const,
  ciGreenIsNotScientificValidity: true as const,
  smeSlotsFilled: 0 as const,
  liveSuccessClaimed: false as const,
  liveSuiteStatus: manifest.suites.live.status,
  deterministicSuiteStatus: manifest.suites.deterministic.status,
  scientificSuiteStatus: manifest.suites.scientific.status,
  scorecardDimensions: manifest.suites.scientific.scorecard.length,
  failureModeContracts: manifest.suites.scientific.failureModeContracts.length,
  walkthroughQuestions: manifest.suites.scientific.representativeQuestions.length,
  parkedHumanResiduals: manifest.parkedHumanResiduals,
  gateCAutoApprove: false as const,
  legalBinding: false as const,
  inventoryHash: manifest.inventoryHash,
  stopNote: manifest.stopNote,
  note: "Three suites stay separate. Deterministic CI ≠ live success ≠ scientific validity. SME slots empty; live gated.",
};

if (checkOnly) {
  if (!existsSync(outPath) || !existsSync(statusPath)) {
    throw new Error("Missing independent evaluation artifacts; run prepare first");
  }
  const onDisk = parseIndependentEvaluationSuites(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.inventoryHash !== manifest.inventoryHash) {
    throw new Error(
      `Independent evaluation manifest drift: disk=${onDisk.inventoryHash} rebuilt=${manifest.inventoryHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(manifest)) {
    throw new Error("Independent evaluation manifest body drift vs rebuild");
  }
  assertSame(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        scientificAcceptance: onDisk.scientificAcceptance,
        liveJourneyAcceptance: onDisk.liveJourneyAcceptance,
        productionReadinessClaimed: onDisk.productionReadinessClaimed,
        smeSlotsFilled: onDisk.suites.scientific.smeSlotsFilled,
        liveSuccessClaimed: onDisk.suites.live.liveSuccessClaimed,
        liveSuiteStatus: onDisk.suites.live.status,
        inventoryHash: onDisk.inventoryHash,
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

if (liveRequested) {
  writeJson(liveReceiptPath, liveAttempt);
  console.log(
    JSON.stringify(
      {
        mode: "live_integration_attempt",
        gateOpen: liveAttempt.gateOpen,
        status: liveAttempt.status,
        liveSuccessClaimed: false,
        scientificValidityClaimed: false,
        stages: liveAttempt.stages.map((s) => ({
          hookId: s.hookId,
          outcome: s.outcome,
        })),
        receiptPath: liveReceiptPath,
        note: liveAttempt.note,
      },
      null,
      2,
    ),
  );
  // Live attempt must not flip sealed offline success claims.
  process.exit(liveAttempt.status === "skipped_gate" ? 1 : 0);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      wrote: [outPath, statusPath],
      engineeringScaffold: status.engineeringScaffold,
      scientificAcceptance: status.scientificAcceptance,
      liveJourneyAcceptance: status.liveJourneyAcceptance,
      smeSlotsFilled: status.smeSlotsFilled,
      liveSuccessClaimed: status.liveSuccessClaimed,
      inventoryHash: status.inventoryHash,
    },
    null,
    2,
  ),
);
