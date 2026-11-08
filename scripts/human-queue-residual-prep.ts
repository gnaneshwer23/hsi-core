#!/usr/bin/env bun
/**
 * HUMAN QUEUE residual pack — eng-safe deepen of residuals #2/#3/#4/#5/#8.
 * Offline harness only. Never invents MoU, claim_support, SME labels, licence clearance,
 * Gate C auto-approve, or production writesEnabled.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {parseN1PassageRightsInventory} from "../src/evidence/n1PassageRightsInventory";
import {parseBenchmarkLabelPacket} from "../src/evidence/scientificBenchmark";
import {
  buildHumanQueueResidualPack,
  buildN1AttestationWorksheet,
  buildN3SmeLabelWorksheet,
  buildPartnerMouAttestationWorksheet,
  buildStagingOpsAcceptanceWorksheet,
  n1AttestationSourcesFromRightsInventory,
  parseHumanQueueResidualPack,
  parseN1AttestationWorksheet,
  parseN3SmeLabelWorksheet,
  parsePartnerMouAttestationWorksheet,
  parseStagingOpsAcceptanceWorksheet,
} from "../src/ops/humanQueueResidualPrep";

const root = resolve(import.meta.dir, "..");
const outDir = resolve(root, "operations/human-queue");
const packPath = resolve(outDir, "human-queue.v1.json");
const statusPath = resolve(outDir, "STATUS.json");
const n1WorksheetPath = resolve(root, "research/domain-graph/n1/attestation-worksheet.v1.json");
const n3WorksheetPath = resolve(root, "research/domain-graph/n3/sme-label-worksheet.v1.json");
const stagingWorksheetPath = resolve(root, "operations/staging/ops-acceptance-worksheet.v1.json");
const partnerWorksheetPath = resolve(root, "operations/partner/mou-attestation-worksheet.v1.json");
const rightsInventoryPath = resolve(root, "research/domain-graph/n1/rights-inventory.v1.json");
const labelsPath = resolve(root, "research/domain-graph/n3/labels.awaiting_sme.json");
const checkOnly = process.argv.includes("--check");
const generatedAt = "2026-11-08T14:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function buildAll() {
  const inventory = parseN1PassageRightsInventory(
    JSON.parse(readFileSync(rightsInventoryPath, "utf8")),
  );
  const labels = parseBenchmarkLabelPacket(JSON.parse(readFileSync(labelsPath, "utf8")));
  const n1 = buildN1AttestationWorksheet({
    generatedAt,
    sources: n1AttestationSourcesFromRightsInventory(inventory),
  });
  const n3 = buildN3SmeLabelWorksheet({
    generatedAt,
    labelRows: labels.rows.map((row) => ({
      itemId: row.itemId,
      itemHash: row.itemHash,
      expectedOutcome: null,
      annotatorId: null,
      labelledAt: null,
      rationale: null,
      disagreement: "none" as const,
      insufficientContext: row.insufficientContext,
    })),
  });
  const staging = buildStagingOpsAcceptanceWorksheet({generatedAt});
  const partner = buildPartnerMouAttestationWorksheet({generatedAt});
  const pack = buildHumanQueueResidualPack({generatedAt});
  parseN1AttestationWorksheet(n1);
  parseN3SmeLabelWorksheet(n3);
  parseStagingOpsAcceptanceWorksheet(staging);
  parsePartnerMouAttestationWorksheet(partner);
  parseHumanQueueResidualPack(pack);
  return {n1, n3, staging, partner, pack};
}

const built = buildAll();

if (checkOnly) {
  const onDiskPack = parseHumanQueueResidualPack(JSON.parse(readFileSync(packPath, "utf8")));
  const onDiskN1 = parseN1AttestationWorksheet(JSON.parse(readFileSync(n1WorksheetPath, "utf8")));
  const onDiskN3 = parseN3SmeLabelWorksheet(JSON.parse(readFileSync(n3WorksheetPath, "utf8")));
  const onDiskStaging = parseStagingOpsAcceptanceWorksheet(
    JSON.parse(readFileSync(stagingWorksheetPath, "utf8")),
  );
  const onDiskPartner = parsePartnerMouAttestationWorksheet(
    JSON.parse(readFileSync(partnerWorksheetPath, "utf8")),
  );
  if (onDiskPack.packHash !== built.pack.packHash) {
    throw new Error(`human-queue pack drift: disk=${onDiskPack.packHash} rebuilt=${built.pack.packHash}`);
  }
  if (canonicalEvidenceJson(onDiskN1) !== canonicalEvidenceJson(built.n1)) {
    throw new Error("N1 attestation worksheet drift vs rebuild");
  }
  if (canonicalEvidenceJson(onDiskN3) !== canonicalEvidenceJson(built.n3)) {
    throw new Error("N3 SME worksheet drift vs rebuild");
  }
  if (canonicalEvidenceJson(onDiskStaging) !== canonicalEvidenceJson(built.staging)) {
    throw new Error("Staging ops worksheet drift vs rebuild");
  }
  if (canonicalEvidenceJson(onDiskPartner) !== canonicalEvidenceJson(built.partner)) {
    throw new Error("Partner MoU worksheet drift vs rebuild");
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        engineeringScaffold: onDiskPack.engineeringScaffold,
        humanAcceptance: onDiskPack.humanAcceptance,
        residualCount: onDiskPack.summary.residualCount,
        n1HumanCleared: onDiskPack.summary.n1HumanCleared,
        citeSupports: onDiskPack.summary.citeSupports,
        n3Labels: onDiskPack.summary.n3Labels,
        stagingOpsAcceptance: onDiskPack.summary.stagingOpsAcceptance,
        partnerLockedPilot: onDiskPack.summary.partnerLockedPilot,
        packHash: onDiskPack.packHash,
        stopListCount: onDiskPack.stopList.length,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

mkdirSync(outDir, {recursive: true});
mkdirSync(resolve(root, "research/domain-graph/n1"), {recursive: true});
mkdirSync(resolve(root, "research/domain-graph/n3"), {recursive: true});
mkdirSync(resolve(root, "operations/staging"), {recursive: true});
mkdirSync(resolve(root, "operations/partner"), {recursive: true});

writeJson(n1WorksheetPath, built.n1);
writeJson(n3WorksheetPath, built.n3);
writeJson(stagingWorksheetPath, built.staging);
writeJson(partnerWorksheetPath, built.partner);
writeJson(packPath, built.pack);
writeJson(statusPath, {
  phase: "human_queue_residuals",
  remediationPhase: "production_readiness_human_queue_residuals",
  generatedAt,
  engineeringScaffold: "CLEARED",
  humanAcceptance: "BLOCKED",
  residualCount: 5,
  residuals: ["#2 N1 rights", "#3 ISI cite HITL", "#4 N3 SMEs", "#5 staging two-account", "#8 partner MoU"],
  n1HumanCleared: 0,
  passageImported: 0,
  citeSupports: 0,
  citePublicApproved: 0,
  n3Labels: 0,
  smeSlotsFilled: 0,
  stagingOpsAcceptance: "BLOCKED",
  partnerLockedPilot: false,
  note: "Eng-safe residual deepen only. Ranked #1–#10 scaffolds complete. Humans must finish attestation / HITL / SME / ops / MoU. Never invent clearance.",
  packHash: built.pack.packHash,
});

console.log(
  JSON.stringify(
    {
      wrote: [
        packPath,
        n1WorksheetPath,
        n3WorksheetPath,
        stagingWorksheetPath,
        partnerWorksheetPath,
        statusPath,
      ],
      engineeringScaffold: built.pack.engineeringScaffold,
      humanAcceptance: built.pack.humanAcceptance,
      residualCount: built.pack.summary.residualCount,
      packHash: built.pack.packHash,
      stopList: built.pack.stopList,
    },
    null,
    2,
  ),
);
