/**
 * N1 gut–immune–T2D bibliographic verification.
 * Default: offline fixture replay (reproducible). Pass --live to probe Europe PMC.
 * Never invents passage text, rights clearances or scientific approval.
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from "node:fs";
import {resolve} from "node:path";
import {materializeN1QueueFromExpansion, parseN1CandidateQueue} from "../src/evidence/n1CandidateQueue";
import {
  parseN1ImportReceipt,
  verifyN1CandidatesFromFixtures,
  verifyN1CandidatesLive,
} from "../src/evidence/n1SourceVerification";

const root = resolve(import.meta.dir, "..");
const live = process.argv.includes("--live");
const check = process.argv.includes("--check");
const n1Dir = resolve(root, "research/domain-graph/n1");
const receiptsDir = resolve(n1Dir, "receipts");
const fixturesDir = resolve(n1Dir, "fixtures");

const expansion = JSON.parse(readFileSync(resolve(root, "research/domain-graph/expansion.v1.json"), "utf8"));
const queueFromExpansion = materializeN1QueueFromExpansion(expansion);
const queuePath = resolve(n1Dir, "candidates.v1.json");
if (!check) {
  mkdirSync(n1Dir, {recursive: true});
  writeFileSync(queuePath, `${JSON.stringify(queueFromExpansion, null, 2)}\n`);
}
const queued = parseN1CandidateQueue(JSON.parse(readFileSync(queuePath, "utf8")));
if (JSON.stringify(queued) !== JSON.stringify(queueFromExpansion)) {
  throw new Error("N1 candidates.v1.json is stale relative to expansion.v1.json");
}

const generatedAt = "2026-11-07T21:20:00.000Z";

async function main() {
  mkdirSync(receiptsDir, {recursive: true});
  let receipt;
  if (live) {
    receipt = await verifyN1CandidatesLive({queue: queued});
  } else {
    const fixtures: Record<string, {httpStatus: number; bodyText: string}> = {};
    for (const candidate of queued.candidates) {
      const file = resolve(fixturesDir, `${candidate.queueId.toLowerCase().replace(/-/g, "_")}.europepmc.json`);
      if (!existsSync(file)) throw new Error(`Missing offline fixture: ${file}`);
      fixtures[candidate.queueId] = {httpStatus: 200, bodyText: readFileSync(file, "utf8")};
    }
    receipt = verifyN1CandidatesFromFixtures({
      queue: queued,
      fixtures,
      generatedAt,
      providerCapabilityDetail:
        "Offline replay of captured Europe PMC JSON fixtures. Live reachability is recorded separately in the status doc / --live receipt.",
    });
  }
  parseN1ImportReceipt(receipt);
  const outName = live ? "import.live.receipt.json" : "import.offline.receipt.json";
  const outPath = resolve(receiptsDir, outName);
  const content = `${JSON.stringify(receipt, null, 2)}\n`;
  if (check) {
    if (!existsSync(outPath) || readFileSync(outPath, "utf8") !== content) {
      throw new Error(`Stale N1 receipt: ${outName}`);
    }
  } else {
    writeFileSync(outPath, content);
  }
  console.log(JSON.stringify({
    mode: receipt.mode,
    liveAcceptance: receipt.liveAcceptance,
    receiptHash: receipt.receiptHash,
    summary: receipt.summary,
    mismatches: receipt.results.filter((r) => r.outcome === "identity_mismatch").map((r) => ({
      queueId: r.queueId,
      requestedTitle: r.requestedTitle,
      returnedTitle: r.matched?.title ?? null,
      doi: r.requestedDoi,
    })),
    scientificApproval: false,
    graphPromotable: false,
  }, null, 2));
}

await main();
