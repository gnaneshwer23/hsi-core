#!/usr/bin/env bun
/**
 * N5 cohort / trial criteria research build/check.
 * Offline public-registry fixtures + synthetic cohorts only.
 * Never queries live registries, invents eligibility, or clears scientificAcceptance.
 */
import {createHash} from "node:crypto";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  N5_ENGINEERING_CTGOV_FIXTURE,
  N5_SYNTHETIC_COHORT_FACTS,
  buildN5RegistrySnapshot,
  parseCohortTrialCriteriaReport,
  parseN5RegistrySnapshot,
  runN5Suite,
  type N5RegistryCriteriaSnapshot,
  type SyntheticCohortFact,
} from "../src/evidence/cohortTrialCriteriaResearch";

const root = resolve(import.meta.dir, "..");
const n5Dir = resolve(root, "research/domain-graph/n5");
const check = process.argv.includes("--check");
const retrievedAt = "2026-11-07T20:00:00.000Z";
const asOf = "2026-11-07T22:45:00.000Z";
const generatedAt = "2026-11-07T22:45:00.000Z";

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

function buildSnapshot(): N5RegistryCriteriaSnapshot {
  return buildN5RegistrySnapshot({
    retrievedAt,
    asOf,
    clinicalTrialsGovJson: N5_ENGINEERING_CTGOV_FIXTURE,
  });
}

function loadFacts(): SyntheticCohortFact[] {
  return [...N5_SYNTHETIC_COHORT_FACTS];
}

function main(): void {
  mkdirSync(n5Dir, {recursive: true});
  mkdirSync(resolve(n5Dir, "fixtures"), {recursive: true});

  const snapshotPath = resolve(n5Dir, "registry-criteria.snapshot.v1.json");
  const factsPath = resolve(n5Dir, "synthetic-cohort.facts.v1.json");
  const receiptPath = resolve(n5Dir, "criteria.offline.receipt.json");
  const statusPath = resolve(n5Dir, "STATUS.json");
  const fixturePath = resolve(n5Dir, "fixtures/ctgov.engineering.v1.json");

  const n2LedgerHash = fileHash(resolve(root, "research/domain-graph/n2/ledger.v1.json"));
  const n3KitHash = fileHash(resolve(root, "research/domain-graph/n3/benchmark-kit.v1.json"));

  if (check) {
    const snapshot = parseN5RegistrySnapshot(JSON.parse(readFileSync(snapshotPath, "utf8")));
    const expected = buildSnapshot();
    if (canonicalEvidenceJson(snapshot) !== canonicalEvidenceJson(expected)) {
      throw new Error("registry-criteria.snapshot.v1.json is stale relative to builder");
    }
    const facts = JSON.parse(readFileSync(factsPath, "utf8")) as SyntheticCohortFact[];
    if (canonicalEvidenceJson(facts) !== canonicalEvidenceJson(loadFacts())) {
      throw new Error("synthetic-cohort.facts.v1.json is stale relative to fixture constants");
    }
    const receipt = runN5Suite({
      snapshot,
      facts,
      generatedAt,
      n2LedgerHash,
      n3KitHash,
    });
    for (const r of receipt.reports) parseCohortTrialCriteriaReport(r);
    if (receipt.scientificAcceptance !== "BLOCKED") {
      throw new Error("scientificAcceptance must stay BLOCKED");
    }
    if (receipt.confirmedEligible !== false || receipt.patientEligibilityAssessed !== false) {
      throw new Error("Eligibility honesty flags must stay false");
    }
    const onDisk = JSON.parse(readFileSync(receiptPath, "utf8"));
    if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(receipt)) {
      throw new Error("criteria.offline.receipt.json is stale relative to runner");
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          engineeringHarness: receipt.engineeringHarness,
          scientificAcceptance: receipt.scientificAcceptance,
          studies: receipt.reports.map((r) => ({
            nctId: r.nctId,
            satisfied: r.satisfiedCount,
            unknown: r.unknownCount,
            review: r.requiresInvestigatorReviewCount,
            confirmedEligible: r.confirmedEligible,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const snapshot = buildSnapshot();
  const facts = loadFacts();
  const receipt = runN5Suite({
    snapshot,
    facts,
    generatedAt,
    n2LedgerHash,
    n3KitHash,
  });

  writeJson(fixturePath, N5_ENGINEERING_CTGOV_FIXTURE);
  writeJson(snapshotPath, snapshot);
  writeJson(factsPath, facts);
  writeJson(receiptPath, receipt);
  writeJson(statusPath, {
    phase: "N5",
    programme: "gut_immune_t2d",
    generatedAt,
    asOf,
    snapshotHash: receipt.snapshotHash,
    studyCount: snapshot.studies.length,
    cohortSize: facts.length,
    engineeringHarness: receipt.engineeringHarness,
    scientificAcceptance: receipt.scientificAcceptance,
    confirmedEligible: false,
    patientEligibilityAssessed: false,
    liveRegistryQueried: false,
    enrolmentEnabled: false,
    note: "Engineering fixtures only. Public-registry criterion research — not live eligibility.",
  });

  console.log(
    JSON.stringify(
      {
        wrote: [fixturePath, snapshotPath, factsPath, receiptPath, statusPath],
        engineeringHarness: receipt.engineeringHarness,
        scientificAcceptance: receipt.scientificAcceptance,
        reports: receipt.reports.map((r) => ({
          nctId: r.nctId,
          inspections: r.inspections.length,
          satisfied: r.satisfiedCount,
          requiresInvestigatorReview: r.requiresInvestigatorReviewCount,
        })),
      },
      null,
      2,
    ),
  );
}

main();
