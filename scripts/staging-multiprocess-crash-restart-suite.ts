#!/usr/bin/env bun
/**
 * U38 — multi-process exclusive ownership + crash/restart suite CLI.
 * --check / --fixture are CI-safe. --live requires disposable HSI Neon env.
 */
import {join} from "node:path";
import {
  assertHsiMultiprocessCrashRestartSoftLand,
  assessHsiMultiprocessCrashRestartMode,
  hsiMultiprocessCrashRestartPacket,
  type HsiMultiprocessSuiteMode,
} from "../src/operations/hsiMultiprocessCrashRestartSuite";
import {runHsiMultiprocessCrashRestartSuite} from "../src/operations/hsiMultiprocessCrashRestartRunner";

const check = process.argv.includes("--check");
const fixture = process.argv.includes("--fixture");
const live = process.argv.includes("--live");

let mode: HsiMultiprocessSuiteMode = "check";
if (live) mode = "live";
else if (fixture) mode = "fixture";
else if (check) mode = "check";

const packet = hsiMultiprocessCrashRestartPacket();
const summary = assertHsiMultiprocessCrashRestartSoftLand(packet);
const assessment = assessHsiMultiprocessCrashRestartMode(mode);

if (mode === "check") {
  console.log(
    JSON.stringify(
      {
        mode,
        ok: true,
        surfaceCount: summary.surfaceCount,
        acceptedForScope: summary.acceptedForScope,
        inventedNeonHost: summary.inventedNeonHost,
        assessment,
        note: "Check mode only. Run --fixture for OS multi-process; --live needs disposable Neon.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (live && process.env.HSI_MULTIPROCESS_E2E_ENABLED !== "1") {
  console.error(
    JSON.stringify({
      error: "Live multi-process E2E refused",
      hint: "Set HSI_MULTIPROCESS_E2E_ENABLED=1 only on a disposable HSI Neon branch with owner authorization. Production untouched.",
    }),
  );
  process.exit(1);
}

const repoRoot = join(import.meta.dir, "..");
const workerScript = join(repoRoot, "scripts/staging-multiprocess-worker.ts");

try {
  const result = await runHsiMultiprocessCrashRestartSuite({
    mode,
    workerScript,
    repoRoot,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : "suite failed",
      mode,
      assessment,
    }),
  );
  process.exit(1);
}
