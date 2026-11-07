#!/usr/bin/env bun
/**
 * N4 grounded brief baseline build/check.
 * Deterministic lexical retrieval; abstain-first; no default model calls.
 * Offline only — does not write Neon, invent paper claims, or clear groundedClaimAccepted.
 */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseEvidenceLedger} from "../src/evidence/evidenceLedger";
import {parseN1ImportReceipt} from "../src/evidence/n1SourceVerification";
import {parseScientificBenchmarkKit} from "../src/evidence/scientificBenchmark";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  DEFAULT_N4_INVESTIGATIONS,
  buildGroundedCorpusFromPrerequisites,
  engineeringButyratePassage,
  parseGroundedBrief,
  parseGroundedCorpus,
  runGroundedBriefSuite,
  type GroundedCorpus,
  type GroundedCorpusRecord,
} from "../src/evidence/groundedBrief";

const root = resolve(import.meta.dir, "..");
const n4Dir = resolve(root, "research/domain-graph/n4");
const check = process.argv.includes("--check");
const generatedAt = "2026-11-07T22:30:00.000Z";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function loadOptionalJson(path: string): unknown | null {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function buildCorpus(): GroundedCorpus {
  const n1Raw = loadOptionalJson(resolve(root, "research/domain-graph/n1/receipts/import.offline.receipt.json"));
  const ledgerRaw = loadOptionalJson(resolve(root, "research/domain-graph/n2/ledger.v1.json"));
  const kitRaw = loadOptionalJson(resolve(root, "research/domain-graph/n3/benchmark-kit.v1.json"));

  const n1Receipt = n1Raw ? parseN1ImportReceipt(n1Raw) : null;
  const ledger = ledgerRaw ? parseEvidenceLedger(ledgerRaw) : null;
  const n3Kit = kitRaw ? parseScientificBenchmarkKit(kitRaw) : null;
  const passage = engineeringButyratePassage();

  const base = buildGroundedCorpusFromPrerequisites({
    n1Receipt,
    ledger,
    n3Kit,
    passages: [passage],
    purpose: "engineering_fixture",
    generatedAt,
  });

  // Attach engineering passage to the butyrate finding so Q-04 can exercise source_summary structure.
  const records: GroundedCorpusRecord[] = base.records.map((r) =>
    r.recordId === "N2-R-001"
      ? {...r, passageIds: [passage.passageId], species: r.species ?? "mouse"}
      : r,
  );

  return parseGroundedCorpus({...base, records});
}

function main(): void {
  mkdirSync(n4Dir, {recursive: true});
  const corpusPath = resolve(n4Dir, "corpus.v1.json");
  const receiptPath = resolve(n4Dir, "brief.offline.receipt.json");
  const statusPath = resolve(n4Dir, "STATUS.json");
  const investigationsPath = resolve(n4Dir, "investigations.v1.json");

  if (check) {
    const corpus = parseGroundedCorpus(JSON.parse(readFileSync(corpusPath, "utf8")));
    const expected = buildCorpus();
    if (canonicalEvidenceJson(corpus) !== canonicalEvidenceJson(expected)) {
      throw new Error("corpus.v1.json is stale relative to N1/N2/N3 prerequisites + builder");
    }
    const n3Freeze = (expected.pins.n3KitHash ? "BLOCKED" : "UNKNOWN") as "BLOCKED" | "UNKNOWN";
    const receipt = runGroundedBriefSuite({
      corpus,
      generatedAt,
      n3HumanLabelFreeze: n3Freeze,
      n3EngineeringHarness: expected.pins.n3KitHash ? "CLEARED" : "UNKNOWN",
    });
    for (const b of receipt.briefs) parseGroundedBrief(b);
    for (const q of DEFAULT_N4_INVESTIGATIONS) {
      const brief = receipt.briefs.find((b) => b.question === q.question);
      if (!brief) throw new Error(`Missing brief for ${q.id}`);
      if (brief.outcome !== q.expectedOutcome) {
        throw new Error(`${q.id}: expected outcome ${q.expectedOutcome}, got ${brief.outcome}`);
      }
      if (brief.groundedClaimAccepted !== false) throw new Error("groundedClaimAccepted must stay false");
    }
    const onDisk = JSON.parse(readFileSync(receiptPath, "utf8"));
    if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(receipt)) {
      throw new Error("brief.offline.receipt.json is stale relative to runner");
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          engineeringHarness: receipt.engineeringHarness,
          scientificAcceptance: receipt.scientificAcceptance,
          groundedClaimAccepted: receipt.groundedClaimAccepted,
          briefs: receipt.briefs.map((b) => ({outcome: b.outcome, hits: b.hits.length})),
        },
        null,
        2,
      ),
    );
    return;
  }

  const corpus = buildCorpus();
  const n3Freeze = (corpus.pins.n3KitHash ? "BLOCKED" : "UNKNOWN") as "BLOCKED" | "UNKNOWN";
  const receipt = runGroundedBriefSuite({
    corpus,
    generatedAt,
    n3HumanLabelFreeze: n3Freeze,
    n3EngineeringHarness: corpus.pins.n3KitHash ? "CLEARED" : "UNKNOWN",
  });

  writeJson(corpusPath, corpus);
  writeJson(investigationsPath, {
    schemaVersion: "hsi-n4-investigations-1",
    phase: "N4",
    programme: "gut_immune_t2d",
    generatedAt,
    investigations: DEFAULT_N4_INVESTIGATIONS,
  });
  writeJson(receiptPath, receipt);
  writeJson(statusPath, {
    phase: "N4",
    programme: "gut_immune_t2d",
    generatedAt,
    engineeringHarness: receipt.engineeringHarness,
    scientificAcceptance: receipt.scientificAcceptance,
    groundedClaimAccepted: false,
    modelActivationAllowed: false,
    briefCount: receipt.briefs.length,
    outcomes: Object.fromEntries(
      DEFAULT_N4_INVESTIGATIONS.map((q, i) => [q.id, receipt.briefs[i]?.outcome ?? null]),
    ),
    pins: {
      n1ReceiptHash: corpus.pins.n1ReceiptHash,
      n2LedgerHash: corpus.pins.n2LedgerHash,
      n3KitHash: corpus.pins.n3KitHash,
    },
    note: "Deterministic baseline only. Metadata-only N1 hits abstain. groundedClaimAccepted remains false.",
  });

  console.log(
    JSON.stringify(
      {
        wrote: [corpusPath, investigationsPath, receiptPath, statusPath],
        engineeringHarness: receipt.engineeringHarness,
        scientificAcceptance: receipt.scientificAcceptance,
        groundedClaimAccepted: false,
        outcomes: receipt.briefs.map((b) => b.outcome),
      },
      null,
      2,
    ),
  );
}

main();
