/**
 * N1 #2 rights eng-assist: rebuild / check licence-lookup assist + fail-closed
 * attestation completeness. Never invents humanCleared or licenceEvidenceUri stamps.
 *
 * Usage:
 *   bun run n1:attestation:prep
 *   bun run n1:attestation:check
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseN1PassageRightsInventory} from "../src/evidence/n1PassageRightsInventory";
import {
  assertN1AttestationNotCleared,
  buildN1LicenceLookupAssist,
  loadCrossrefFixtureLookup,
  parseN1LicenceLookupAssist,
  reportN1AttestationCompleteness,
} from "../src/evidence/n1LicenceLookupAssist";
import {parseN1AttestationWorksheet} from "../src/ops/humanQueueResidualPrep";

const root = resolve(import.meta.dir, "..");
const check = process.argv.includes("--check");
const n1Dir = resolve(root, "research/domain-graph/n1");
const fixturesDir = resolve(n1Dir, "fixtures");
const inventoryPath = resolve(n1Dir, "rights-inventory.v1.json");
const worksheetPath = resolve(n1Dir, "attestation-worksheet.v1.json");
const assistPath = resolve(n1Dir, "licence-lookup-assist.v1.json");
const reportPath = resolve(n1Dir, "receipts/attestation-completeness.receipt.json");
const generatedAt = "2026-11-08T22:00:00.000Z";

function writeOrCheck(path: string, content: string, label: string) {
  if (check) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      throw new Error(`Stale N1 attestation artifact: ${label}`);
    }
    return;
  }
  writeFileSync(path, content);
}

function main() {
  mkdirSync(resolve(n1Dir, "receipts"), {recursive: true});
  const inventory = parseN1PassageRightsInventory(JSON.parse(readFileSync(inventoryPath, "utf8")));
  const worksheet = parseN1AttestationWorksheet(JSON.parse(readFileSync(worksheetPath, "utf8")));
  const lookups = Object.fromEntries(
    inventory.entries.map((entry) => {
      const fixture = resolve(
        fixturesDir,
        `${entry.queueId.toLowerCase().replace(/-/g, "_")}.crossref.json`,
      );
      if (!existsSync(fixture)) throw new Error(`Missing Crossref fixture: ${fixture}`);
      return [
        entry.queueId,
        loadCrossrefFixtureLookup({
          queueId: entry.queueId,
          doi: entry.doi,
          bodyText: readFileSync(fixture, "utf8"),
          retrievedAt: generatedAt,
        }),
      ];
    }),
  );
  const assist = buildN1LicenceLookupAssist({inventory, lookups, generatedAt});
  parseN1LicenceLookupAssist(assist);
  const report = reportN1AttestationCompleteness({worksheet, assist});
  assertN1AttestationNotCleared(report);

  const assistText = `${JSON.stringify(assist, null, 2)}\n`;
  const reportText = `${JSON.stringify(report, null, 2)}\n`;
  writeOrCheck(assistPath, assistText, "licence-lookup-assist.v1.json");
  writeOrCheck(reportPath, reportText, "attestation-completeness.receipt.json");

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: check ? "check" : "write",
        engPhaseStatus: assist.engPhaseStatus,
        rightsCleared: false,
        humanCleared: 0,
        passageImported: 0,
        factualCandidateUriObserved: assist.summary.factualCandidateUriObserved,
        ccUriUnderTdmOnly: assist.summary.ccUriUnderTdmOnly,
        lookedUpNoCandidateUri: assist.summary.lookedUpNoCandidateUri,
        stillNeedsHumanPrincipal: 12,
        gate: report.gate,
        incompleteIsNotCleared: true,
        note: "Rights not CLEARED until human attests; eng assist ≠ clearance.",
      },
      null,
      2,
    ),
  );
}

main();
