#!/usr/bin/env bun
/**
 * N6 blinded expert usefulness scaffold / check / eval / pilot-prep.
 * Offline only — no fabricated expert scores, Gate C, or Neon writes.
 */
import {createHash} from "node:crypto";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildBlindedArtifacts,
  buildBlindedRunManifest,
  buildBlindedUsefulnessProtocol,
  emptyExpertScorePacket,
  evaluateBlindedUsefulness,
  parseBlindedEvalReceipt,
  parseBlindedRunManifest,
  parseBlindedUsefulnessProtocol,
  parseExpertScorePacket,
  type BlindedUsefulnessProtocol,
} from "../src/evidence/blindedExpertUsefulness";
import {
  buildN6UsefulnessPilotPrep,
  parseN6UsefulnessPilotPrep,
} from "../src/evidence/n6UsefulnessPilotPrep";

const root = resolve(import.meta.dir, "..");
const n6Dir = resolve(root, "research/domain-graph/n6");
const check = process.argv.includes("--check");
const evalOnly = process.argv.includes("--eval");
const pilotPrep = process.argv.includes("--pilot-prep");
const generatedAt = "2026-11-07T23:00:00.000Z";
const pilotPrepGeneratedAt = "2026-11-08T12:00:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fileHash(path: string): string | null {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

function buildProtocol(): BlindedUsefulnessProtocol {
  return buildBlindedUsefulnessProtocol({generatedAt});
}

function main(): void {
  mkdirSync(n6Dir, {recursive: true});
  const protocolPath = resolve(n6Dir, "protocol.v1.json");
  const scoresPath = resolve(n6Dir, "scores.awaiting_reviewers.json");
  const runPath = resolve(n6Dir, "run-manifest.v1.json");
  const receiptPath = resolve(n6Dir, "eval.offline.receipt.json");
  const statusPath = resolve(n6Dir, "STATUS.json");
  const pilotPrepPath = resolve(n6Dir, "pilot-prep.v1.json");

  const n3KitHash = fileHash(resolve(root, "research/domain-graph/n3/benchmark-kit.v1.json"));
  const n4BriefReceiptHash = fileHash(resolve(root, "research/domain-graph/n4/brief.offline.receipt.json"));
  const n5CriteriaReceiptHash = fileHash(resolve(root, "research/domain-graph/n5/criteria.offline.receipt.json"));

  if (check || evalOnly || pilotPrep) {
    const protocol = parseBlindedUsefulnessProtocol(JSON.parse(readFileSync(protocolPath, "utf8")));
    const scores = parseExpertScorePacket(JSON.parse(readFileSync(scoresPath, "utf8")));
    const run = parseBlindedRunManifest(JSON.parse(readFileSync(runPath, "utf8")));
    const receipt = evaluateBlindedUsefulness(protocol, scores, run, generatedAt);
    parseBlindedEvalReceipt(receipt);

    if (pilotPrep) {
      const prep = buildN6UsefulnessPilotPrep({
        protocol,
        scores,
        run,
        receipt,
        generatedAt: pilotPrepGeneratedAt,
      });
      writeJson(pilotPrepPath, prep);
      writeJson(statusPath, {
        phase: "N6",
        programme: "gut_immune_t2d",
        generatedAt: pilotPrepGeneratedAt,
        questionCount: receipt.questionCount,
        conditionCount: receipt.conditionCount,
        packetCount: receipt.packetCount,
        scoredRows: receipt.scoredRows,
        engineeringHarness: receipt.engineeringHarness,
        independentBlindedReviewers: receipt.independentBlindedReviewers,
        scientificAcceptance: receipt.scientificAcceptance,
        usefulnessClaimed: false,
        usefulnessPilotGoNoGo: prep.usefulnessPilotGoNoGo,
        n3HumanLabelFreezePrerequisite: prep.n3HumanLabelFreezePrerequisite,
        reviewerSlotsFilled: prep.summary.reviewerSlotsFilled,
        pilotPrepHash: prep.prepHash,
        fabricatedExpertScoresPermitted: false,
        scientificApproval: false,
        n5Coexistence: "N5 uncommitted artifacts left intact; N6 pins n5 receipt hash when present",
        note: "Empty score packets + Phase #7 pilot-prep only. No expert usefulness scores were invented.",
      });
      console.log(
        JSON.stringify(
          {
            wrote: [pilotPrepPath],
            engineeringScaffold: prep.engineeringScaffold,
            usefulnessPilotGoNoGo: prep.usefulnessPilotGoNoGo,
            n3HumanLabelFreezePrerequisite: prep.n3HumanLabelFreezePrerequisite,
            scientificAcceptance: prep.scientificAcceptance,
            scoredRows: prep.scoredRows,
            reviewerSlotsFilled: prep.summary.reviewerSlotsFilled,
            engineeringChecksCleared: prep.summary.engineeringChecksCleared,
            humanChecksPending: prep.summary.humanChecksPending,
            prepHash: prep.prepHash,
          },
          null,
          2,
        ),
      );
      return;
    }

    if (check) {
      const expected = buildProtocol();
      if (canonicalEvidenceJson(protocol) !== canonicalEvidenceJson(expected)) {
        throw new Error("protocol.v1.json is stale relative to builder");
      }
      const expectedArtifacts = buildBlindedArtifacts(expected);
      const expectedScores = emptyExpertScorePacket(expected, expectedArtifacts);
      if (canonicalEvidenceJson(scores) !== canonicalEvidenceJson(expectedScores)) {
        throw new Error("scores.awaiting_reviewers.json is stale relative to protocol");
      }
      const expectedRun = buildBlindedRunManifest({
        protocol: expected,
        scorePacket: expectedScores,
        generatedAt,
        n3KitHash,
        n4BriefReceiptHash,
        n5CriteriaReceiptHash,
      });
      if (canonicalEvidenceJson(run) !== canonicalEvidenceJson(expectedRun)) {
        throw new Error("run-manifest.v1.json is stale relative to builder / pins");
      }
      if (receipt.scientificAcceptance !== "BLOCKED") {
        throw new Error("scientificAcceptance must stay BLOCKED");
      }
      if (receipt.independentBlindedReviewers !== "BLOCKED") {
        throw new Error("independentBlindedReviewers must stay BLOCKED for empty scores");
      }
      if (receipt.usefulnessDeltaVsBaseline !== null || receipt.usefulnessClaimed !== false) {
        throw new Error("Usefulness metrics must stay null / unclaimed");
      }
      if (receipt.scoredRows !== 0) {
        throw new Error("Expected zero scored rows in empty packet harness");
      }
      const onDisk = JSON.parse(readFileSync(receiptPath, "utf8"));
      if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(receipt)) {
        throw new Error("eval.offline.receipt.json is stale relative to runner");
      }
      const expectedPrep = buildN6UsefulnessPilotPrep({
        protocol: expected,
        scores: expectedScores,
        run: expectedRun,
        receipt,
        generatedAt: pilotPrepGeneratedAt,
      });
      const onDiskPrep = parseN6UsefulnessPilotPrep(JSON.parse(readFileSync(pilotPrepPath, "utf8")));
      if (canonicalEvidenceJson(onDiskPrep) !== canonicalEvidenceJson(expectedPrep)) {
        throw new Error("pilot-prep.v1.json is stale — re-run bun run n6:pilot-prep");
      }
      if (
        onDiskPrep.usefulnessPilotGoNoGo !== "NO_GO" ||
        onDiskPrep.n3HumanLabelFreezePrerequisite !== "BLOCKED" ||
        onDiskPrep.summary.reviewerSlotsFilled !== 0
      ) {
        throw new Error("pilot-prep must keep usefulness NO-GO and reviewer slots empty");
      }
      console.log(
        JSON.stringify(
          {
            ok: true,
            engineeringHarness: receipt.engineeringHarness,
            independentBlindedReviewers: receipt.independentBlindedReviewers,
            scientificAcceptance: receipt.scientificAcceptance,
            questionCount: receipt.questionCount,
            packetCount: receipt.packetCount,
            scoredRows: receipt.scoredRows,
            usefulnessClaimed: receipt.usefulnessClaimed,
            usefulnessPilotGoNoGo: onDiskPrep.usefulnessPilotGoNoGo,
            n3HumanLabelFreezePrerequisite: onDiskPrep.n3HumanLabelFreezePrerequisite,
            reviewerSlotsFilled: onDiskPrep.summary.reviewerSlotsFilled,
            prepHash: onDiskPrep.prepHash,
          },
          null,
          2,
        ),
      );
      return;
    }

    writeJson(receiptPath, receipt);
    console.log(JSON.stringify(receipt, null, 2));
    return;
  }

  const protocol = buildProtocol();
  const artifacts = buildBlindedArtifacts(protocol);
  const scores = emptyExpertScorePacket(protocol, artifacts);
  const run = buildBlindedRunManifest({
    protocol,
    scorePacket: scores,
    generatedAt,
    n3KitHash,
    n4BriefReceiptHash,
    n5CriteriaReceiptHash,
  });
  const receipt = evaluateBlindedUsefulness(protocol, scores, run, generatedAt);
  const prep = buildN6UsefulnessPilotPrep({
    protocol,
    scores,
    run,
    receipt,
    generatedAt: pilotPrepGeneratedAt,
  });

  writeJson(protocolPath, protocol);
  writeJson(scoresPath, scores);
  writeJson(runPath, run);
  writeJson(receiptPath, receipt);
  writeJson(pilotPrepPath, prep);
  writeJson(statusPath, {
    phase: "N6",
    programme: "gut_immune_t2d",
    generatedAt: pilotPrepGeneratedAt,
    questionCount: receipt.questionCount,
    conditionCount: receipt.conditionCount,
    packetCount: receipt.packetCount,
    scoredRows: receipt.scoredRows,
    engineeringHarness: receipt.engineeringHarness,
    independentBlindedReviewers: receipt.independentBlindedReviewers,
    scientificAcceptance: receipt.scientificAcceptance,
    usefulnessClaimed: false,
    usefulnessPilotGoNoGo: prep.usefulnessPilotGoNoGo,
    n3HumanLabelFreezePrerequisite: prep.n3HumanLabelFreezePrerequisite,
    reviewerSlotsFilled: prep.summary.reviewerSlotsFilled,
    pilotPrepHash: prep.prepHash,
    fabricatedExpertScoresPermitted: false,
    scientificApproval: false,
    n5Coexistence: "N5 uncommitted artifacts left intact; N6 pins n5 receipt hash when present",
    note: "Empty score packets + Phase #7 pilot-prep only. No expert usefulness scores were invented.",
  });

  console.log(
    JSON.stringify(
      {
        wrote: [protocolPath, scoresPath, runPath, receiptPath, pilotPrepPath, statusPath],
        engineeringHarness: receipt.engineeringHarness,
        independentBlindedReviewers: receipt.independentBlindedReviewers,
        scientificAcceptance: receipt.scientificAcceptance,
        usefulnessPilotGoNoGo: prep.usefulnessPilotGoNoGo,
        packetCount: receipt.packetCount,
        scoredRows: receipt.scoredRows,
        prepHash: prep.prepHash,
      },
      null,
      2,
    ),
  );
}

main();
