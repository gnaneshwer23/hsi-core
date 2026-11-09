#!/usr/bin/env bun
/**
 * M20 demo synthetic acceptance runner.
 * Usage:
 *   bun run m20:demo
 *   bun run m20:demo:check
 */
import {spawnSync} from "node:child_process";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  assertDemoAcceptanceHonest,
  runM20DemoSyntheticAcceptance,
} from "../src/m20DemoSyntheticAcceptance";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "operations/demo");
const evalDir = resolve(root, "evaluation/m20-demo-synthetic-acceptance");
const checkOnly = process.argv.includes("--check");

function main(): void {
  const tip = (() => {
    const result = spawnSync("git", ["rev-parse", "HEAD"], {cwd: root, encoding: "utf8"});
    const out = (result.stdout || "").trim();
    return result.status === 0 && out ? out : null;
  })();

  const report = runM20DemoSyntheticAcceptance({tipCommitHint: tip});
  assertDemoAcceptanceHonest(report);

  mkdirSync(outDir, {recursive: true});
  mkdirSync(evalDir, {recursive: true});

  const reportPath = resolve(outDir, "m20-demo-synthetic-acceptance.v1.json");
  const accountsPath = resolve(outDir, "m20-demo-accounts.v1.json");
  const statusPath = resolve(evalDir, "STATUS.json");

  const accountsPack = {
    schemaVersion: "hsi-m20-demo-accounts-1",
    honestyBanner: report.honestyBanner,
    passwordsInRepo: false,
    neonAuthProvisioned: false,
    accounts: report.accounts,
    howToUse:
      "Offline: bun run m20:demo. Staging neon_auth (optional later): create accounts matching emails only on ep-sweet-hill; never commit passwords; never invent user ids into human-queue worksheets.",
  };

  if (checkOnly) {
    const existing = JSON.parse(readFileSync(reportPath, "utf8")) as typeof report;
    assertDemoAcceptanceHonest(existing);
    if (existing.demoAcceptance !== "CLEARED" || existing.scientificAcceptance !== "BLOCKED") {
      throw new Error("Stored demo pack honesty failed");
    }
    if (existing.journey.length !== 22) throw new Error("Expected 22 journey steps");
    console.log(
      JSON.stringify(
        {
          ok: true,
          demoAcceptance: existing.demoAcceptance,
          scientificAcceptance: existing.scientificAcceptance,
          liveOpsAcceptance: existing.liveOpsAcceptance,
          launchDecision: existing.launchDecision,
          journeySteps: existing.journey.length,
          packHash: existing.packHash,
        },
        null,
        2,
      ),
    );
    return;
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  writeFileSync(accountsPath, JSON.stringify(accountsPack, null, 2) + "\n");
  writeFileSync(
    statusPath,
    JSON.stringify(
      {
        schemaVersion: "hsi-m20-demo-status-1",
        engineering: "CLEARED",
        demoAcceptance: report.demoAcceptance,
        scientificAcceptance: report.scientificAcceptance,
        liveOpsAcceptance: report.liveOpsAcceptance,
        launchDecision: report.launchDecision,
        productionReadyClaimed: false,
        packHash: report.packHash,
        tipCommitHint: report.tipCommitHint,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        wrote: [reportPath, accountsPath, statusPath],
        demoAcceptance: report.demoAcceptance,
        scientificAcceptance: report.scientificAcceptance,
        launchDecision: report.launchDecision,
        packHash: report.packHash,
      },
      null,
      2,
    ),
  );
}

main();
