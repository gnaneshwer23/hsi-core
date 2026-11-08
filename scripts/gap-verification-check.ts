#!/usr/bin/env bun
/**
 * Execution step 04 — gap verification harness.
 * Classifies recorded investigation gaps against local package + living-evidence fixtures.
 * Never invents SME gold, Gate C, MoU, or passage clearance.
 */
import {mkdirSync, writeFileSync, readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {
  LIVING_EVIDENCE_DISEASE_PINS,
  LIVING_EVIDENCE_NCT_PINS,
  LIVING_EVIDENCE_PMID_PINS,
  projectLivingEvidenceForOutcome,
  runLivingEvidenceExpansionFromFixtures,
} from "../src/evidence/livingEvidenceExpansion";
import {projectGapVerificationForOutcome} from "../src/evidence/gapVerification";
import {planSscInterrogation} from "../src/interrogativeQuestionEngine";

const root = resolve(import.meta.dir, "..");
const livingDir = resolve(root, "research/domain-graph/living-evidence");
const fixturesDir = resolve(livingDir, "fixtures");
const outDir = resolve(root, "research/domain-graph/gap-verification");
const check = process.argv.includes("--check");

const OFFLINE_RETRIEVED_AT = "2026-11-08T17:40:00.000Z";
const OFFLINE_AS_OF = "2026-11-08T17:45:00.000Z";
const OFFLINE_GENERATED_AT = "2026-11-08T17:45:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function loadFixtures() {
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

function main() {
  mkdirSync(outDir, {recursive: true});
  const {snapshot} = runLivingEvidenceExpansionFromFixtures({
    ...loadFixtures(),
    retrievedAt: OFFLINE_RETRIEVED_AT,
    asOf: OFFLINE_AS_OF,
    generatedAt: OFFLINE_GENERATED_AT,
  });
  const draft = planSscInterrogation({
    question: "Which SSc mechanism has source-linked evidence?",
    actorPrincipal: "harness-gap-verification",
    createdAt: OFFLINE_AS_OF,
    dataClass: "public_biomedical",
    focus: "systemic_sclerosis",
    release: {id: "HSI-GR-SSC-TEST", version: "1.0.0", manifestHash: "a".repeat(64)},
  });
  const livingEvidence = projectLivingEvidenceForOutcome({
    sourcePmids: LIVING_EVIDENCE_PMID_PINS,
    snapshot,
  });
  const report = projectGapVerificationForOutcome({
    asOf: OFFLINE_AS_OF,
    branches: draft.branches.map((b) => ({
      id: b.id,
      assessment: b.assessment,
      supportingClaimIds: [],
      opposingClaimIds: [],
      missingEvidence: b.missingEvidence,
      uncertainty: b.uncertainty,
    })),
    claimContexts: [],
    localSourcePmids: LIVING_EVIDENCE_PMID_PINS,
    contradictions: {recordedOpposingClaimIds: [], searchStatus: "not_recorded"},
    livingEvidence,
  });

  if (report.honesty.smeGoldFilled || report.honesty.scientificallyValidated || report.honesty.passageImportAuthorized) {
    throw new Error("Gap verification honesty flags must remain fail-closed");
  }
  if (report.status !== "classified_against_bound_evidence") {
    throw new Error(`Expected classified_against_bound_evidence, got ${report.status}`);
  }
  if (!report.items.some((i) => i.kind === "passage_rights_blocked" || i.kind === "oppose_search_incomplete")) {
    throw new Error("Expected passage-rights or oppose-search classifications from planner gaps");
  }

  const status = {
    pack: "gap-verification",
    phase: "step_04",
    asOf: OFFLINE_AS_OF,
    engineeringHarness: "CLEARED",
    scientificAcceptance: "BLOCKED",
    smeGoldFilled: false,
    expertLabelsAvailable: false,
    scientificallyValidated: false,
    passageImportAuthorized: false,
    livingEvidenceStatus: livingEvidence.status,
    matchedPmids: livingEvidence.matchedPmids,
    itemCount: report.items.length,
    summary: report.summary,
    unavailableCapabilities: report.unavailableCapabilities,
    nextMilestone: "step_05_translational_landscape_intelligence",
  };

  const reportPath = resolve(outDir, "gap-verification.v1.json");
  const statusPath = resolve(outDir, "STATUS.json");
  if (check) {
    if (!existsSync(reportPath) || !existsSync(statusPath)) {
      throw new Error("Missing gap-verification artifacts; run without --check first");
    }
    const prior = JSON.parse(readFileSync(reportPath, "utf8")) as typeof report;
    if (prior.honesty.scientificallyValidated !== false || prior.summary.abstain < 0) {
      throw new Error("Prior gap-verification artifact failed honesty check");
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: "check",
          itemCount: report.items.length,
          summary: report.summary,
          smeGoldFilled: false,
          nextMilestone: status.nextMilestone,
        },
        null,
        2,
      ),
    );
    return;
  }

  writeJson(reportPath, report);
  writeJson(statusPath, status);
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "write",
        reportPath: "research/domain-graph/gap-verification/gap-verification.v1.json",
        statusPath: "research/domain-graph/gap-verification/STATUS.json",
        itemCount: report.items.length,
        summary: report.summary,
        nextMilestone: status.nextMilestone,
      },
      null,
      2,
    ),
  );
}

main();
