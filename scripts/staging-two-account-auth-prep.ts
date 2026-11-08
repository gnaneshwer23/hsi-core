#!/usr/bin/env bun
/**
 * Audit Phase #5 — staging two-account Auth + research writes prep.
 * Offline harness only. Does not create neon_auth users, flip Vercel env,
 * grant roles, or enable production writes.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {
  buildStagingTwoAccountAuthPrep,
  parseStagingTwoAccountAuthPrep,
} from "../src/ops/stagingTwoAccountAuthPrep";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "operations/staging");
const outPath = resolve(outDir, "two-account-auth-prep.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T11:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const prep = buildStagingTwoAccountAuthPrep({generatedAt});
parseStagingTwoAccountAuthPrep(prep);

if (checkOnly) {
  const onDisk = parseStagingTwoAccountAuthPrep(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.prepHash !== prep.prepHash) {
    throw new Error(
      `staging two-account Auth prep drift: disk=${onDisk.prepHash} rebuilt=${prep.prepHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(prep)) {
    throw new Error("staging two-account Auth prep body drift vs rebuild");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        opsAcceptance: onDisk.opsAcceptance,
        accountSlotsFilled: onDisk.summary.accountSlotsFilled,
        engineeringChecksCleared: onDisk.summary.engineeringChecksCleared,
        opsChecksPending: onDisk.summary.opsChecksPending,
        prepHash: onDisk.prepHash,
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
  phase: "staging_two_account_auth",
  remediationPhase: "production_readiness_audit_phase_5",
  generatedAt,
  engineeringScaffold: "CLEARED",
  opsAcceptance: "BLOCKED",
  liveAuthVerified: false,
  researchWritesLiveVerified: false,
  accountSlotsReserved: prep.summary.accountSlotsReserved,
  accountSlotsFilled: 0,
  engineeringChecksCleared: prep.summary.engineeringChecksCleared,
  opsChecksPending: prep.summary.opsChecksPending,
  note: "Eng harness only. Founder must flip staging env / create two verified neon_auth accounts / grant access. No production writes. Auth signup polish for founder Gmail deferred.",
  prepHash: prep.prepHash,
});

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: prep.engineeringScaffold,
      opsAcceptance: prep.opsAcceptance,
      prepHash: prep.prepHash,
      founderMustFlipCount: prep.founderMustFlip.length,
      codeCanAutomateCount: prep.codeCanAutomate.length,
    },
    null,
    2,
  ),
);
