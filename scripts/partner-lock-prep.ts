#!/usr/bin/env bun
/**
 * Audit Phase #8 — partner lock prep (ENG CLEARED / FOUNDER BLOCKED).
 * Offline harness only. Does not invent MoU text, named orgs, or legalBinding.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {buildPartnerLockPrep, parsePartnerLockPrep} from "../src/ops/partnerLockPrep";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "operations/partner");
const outPath = resolve(outDir, "partner-lock-prep.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T12:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const prep = buildPartnerLockPrep({generatedAt});
parsePartnerLockPrep(prep);

if (checkOnly) {
  const onDisk = parsePartnerLockPrep(JSON.parse(readFileSync(outPath, "utf8")));
  if (onDisk.prepHash !== prep.prepHash) {
    throw new Error(
      `partner-lock prep drift: disk=${onDisk.prepHash} rebuilt=${prep.prepHash}`,
    );
  }
  if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(prep)) {
    throw new Error("partner-lock prep body drift vs rebuild");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDisk.engineeringScaffold,
        founderAcceptance: onDisk.founderAcceptance,
        lockedPilot: onDisk.lockedPilot,
        legalBinding: onDisk.legalBinding,
        mouSlotsFilled: onDisk.summary.mouSlotsFilled,
        engineeringChecksCleared: onDisk.summary.engineeringChecksCleared,
        founderChecksPending: onDisk.summary.founderChecksPending,
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
  phase: "partner_lock",
  remediationPhase: "production_readiness_audit_phase_8",
  generatedAt,
  engineeringScaffold: "CLEARED",
  founderAcceptance: "BLOCKED",
  lockedPilot: false,
  legalBinding: false,
  agreementKind: "hypothetical_test_only",
  mouSlotsReserved: prep.summary.mouSlotsReserved,
  mouSlotsFilled: 0,
  engineeringChecksCleared: prep.summary.engineeringChecksCleared,
  founderChecksPending: prep.summary.founderChecksPending,
  note: "Eng harness only. Founder must obtain written partner confirm / MoU. Never invent legalBinding or MoU text. lockedPilot stays false under fixture.",
  prepHash: prep.prepHash,
});

console.log(
  JSON.stringify(
    {
      wrote: outPath,
      engineeringScaffold: prep.engineeringScaffold,
      founderAcceptance: prep.founderAcceptance,
      lockedPilot: prep.lockedPilot,
      legalBinding: prep.legalBinding,
      prepHash: prep.prepHash,
      founderMustDecideCount: prep.founderMustDecide.length,
      codeCanAutomateCount: prep.codeCanAutomate.length,
    },
    null,
    2,
  ),
);
