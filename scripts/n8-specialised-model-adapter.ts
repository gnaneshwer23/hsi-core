#!/usr/bin/env bun
/**
 * N8 bounded specialised / multimodal model adapter build/check.
 * Offline dry-run / fixture only — no paid APIs, live providers, Gate C or Neon writes.
 * Extends N4 optional model contract; does not claim N6 usefulness.
 */
import {createHash} from "node:crypto";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  DEFAULT_N4_INVESTIGATIONS,
  parseGroundedBrief,
  parseGroundedCorpus,
  runGroundedBriefSuite,
  type GroundedBrief,
} from "../src/evidence/groundedBrief";
import {
  buildN8AdapterStatus,
  buildN8ModelManifest,
  parseN8AdapterRunReceipt,
  parseN8ModelManifest,
  runBoundedSpecialisedModelAdapter,
  type N8AdapterRunReceipt,
} from "../src/evidence/specialisedModelAdapter";

const root = resolve(import.meta.dir, "..");
const n8Dir = resolve(root, "research/domain-graph/n8");
const check = process.argv.includes("--check");
const generatedAt = "2026-11-07T23:45:00.000Z";

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fileHash(path: string): string | null {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

function loadN4BriefsWithAdapterEnabled(): Array<{investigationId: string; brief: GroundedBrief}> {
  const corpusPath = resolve(root, "research/domain-graph/n4/corpus.v1.json");
  const corpus = parseGroundedCorpus(JSON.parse(readFileSync(corpusPath, "utf8")));
  const n3Freeze = (corpus.pins.n3KitHash ? "BLOCKED" : "UNKNOWN") as "BLOCKED" | "UNKNOWN";
  const suite = runGroundedBriefSuite({
    corpus,
    generatedAt: "2026-11-07T22:30:00.000Z",
    enableModelAdapter: true,
    n3HumanLabelFreeze: n3Freeze,
    n3EngineeringHarness: corpus.pins.n3KitHash ? "CLEARED" : "UNKNOWN",
  });
  return DEFAULT_N4_INVESTIGATIONS.map((q, i) => {
    const brief = suite.briefs[i];
    if (!brief) throw new Error(`Missing N4 brief for ${q.id}`);
    parseGroundedBrief(brief);
    if (!brief.pins.modelAdapterEnabled) throw new Error(`${q.id}: modelAdapterEnabled expected`);
    if (brief.outcome !== q.expectedOutcome) {
      throw new Error(`${q.id}: expected ${q.expectedOutcome}, got ${brief.outcome}`);
    }
    return {investigationId: q.id, brief};
  });
}

function buildReceipt(): N8AdapterRunReceipt {
  const briefs = loadN4BriefsWithAdapterEnabled();
  return runBoundedSpecialisedModelAdapter({
    activation: {
      optIn: true,
      acknowledgeActivationDisallowed: true,
      mode: "dry_run",
      includePublicStructureFixture: true,
      generatedAt,
      operatorNote:
        "N8 offline dry-run with public-structure multimodal fixture slot. Paid APIs not called; N6 usefulness BLOCKED.",
    },
    briefs,
    n4BriefReceiptHash: fileHash(resolve(root, "research/domain-graph/n4/brief.offline.receipt.json")),
    n6ProtocolHash: fileHash(resolve(root, "research/domain-graph/n6/protocol.v1.json")),
    n7LedgerHash: fileHash(resolve(root, "research/domain-graph/n7/ledger.v1.json")),
  });
}

function main(): void {
  mkdirSync(n8Dir, {recursive: true});
  const manifestPath = resolve(n8Dir, "manifest.v1.json");
  const receiptPath = resolve(n8Dir, "adapter.offline.receipt.json");
  const statusPath = resolve(n8Dir, "STATUS.json");
  const comparisonPath = resolve(n8Dir, "baseline-comparison.v1.json");

  if (check) {
    const manifest = parseN8ModelManifest(JSON.parse(readFileSync(manifestPath, "utf8")));
    const expectedManifest = buildN8ModelManifest();
    if (canonicalEvidenceJson(manifest) !== canonicalEvidenceJson(expectedManifest)) {
      throw new Error("manifest.v1.json is stale relative to builder");
    }
    const expected = buildReceipt();
    parseN8AdapterRunReceipt(expected);
    const onDisk = parseN8AdapterRunReceipt(JSON.parse(readFileSync(receiptPath, "utf8")));
    if (canonicalEvidenceJson(onDisk) !== canonicalEvidenceJson(expected)) {
      throw new Error("adapter.offline.receipt.json is stale relative to runner");
    }
    if (onDisk.groundedClaimAccepted !== false || onDisk.modelActivationAllowed !== false) {
      throw new Error("honesty gates must stay false");
    }
    if (onDisk.n6Usefulness !== "BLOCKED" || onDisk.paidApiCalled !== false) {
      throw new Error("N6 / paid-API honesty violated");
    }
    for (const row of onDisk.baselineComparison.rows) {
      if (!row.abstentionPreserved) throw new Error(`${row.investigationId}: abstention not preserved`);
    }
    console.log(
      JSON.stringify(
        {
          ok: true,
          engineeringHarness: onDisk.engineeringHarness,
          scientificAcceptance: onDisk.scientificAcceptance,
          n6Usefulness: onDisk.n6Usefulness,
          activationAllowed: onDisk.activationAllowed,
          paidApiCalled: onDisk.paidApiCalled,
          agreementRate: onDisk.baselineComparison.agreementRate,
          proposals: onDisk.proposals.map((p) => ({
            id: p.investigationId,
            outcome: p.proposedOutcome,
            uncertainty: p.uncertainty,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const manifest = buildN8ModelManifest();
  const receipt = buildReceipt();
  const status = buildN8AdapterStatus({
    receipt,
    n4BriefReceiptHash: fileHash(resolve(root, "research/domain-graph/n4/brief.offline.receipt.json")),
    n6ProtocolHash: fileHash(resolve(root, "research/domain-graph/n6/protocol.v1.json")),
    n7LedgerHash: fileHash(resolve(root, "research/domain-graph/n7/ledger.v1.json")),
  });

  writeJson(manifestPath, manifest);
  writeJson(receiptPath, receipt);
  writeJson(comparisonPath, receipt.baselineComparison);
  writeJson(statusPath, status);

  console.log(
    JSON.stringify(
      {
        wrote: [manifestPath, receiptPath, comparisonPath, statusPath],
        engineeringHarness: receipt.engineeringHarness,
        scientificAcceptance: receipt.scientificAcceptance,
        n6Usefulness: receipt.n6Usefulness,
        activationAllowed: false,
        paidApiCalled: false,
        agreementRate: receipt.baselineComparison.agreementRate,
        multimodalFixture: receipt.publicStructureFixture?.fixtureId ?? null,
      },
      null,
      2,
    ),
  );
}

main();
