import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
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
const generatedAt = "2026-11-08T14:00:00.000Z";

function loadSources() {
  const inventory = parseN1PassageRightsInventory(
    JSON.parse(readFileSync(resolve(root, "research/domain-graph/n1/rights-inventory.v1.json"), "utf8")),
  );
  return n1AttestationSourcesFromRightsInventory(inventory);
}

function loadLabelRows() {
  const labels = parseBenchmarkLabelPacket(
    JSON.parse(readFileSync(resolve(root, "research/domain-graph/n3/labels.awaiting_sme.json"), "utf8")),
  );
  return labels.rows.map((row) => ({
    itemId: row.itemId,
    itemHash: row.itemHash,
    expectedOutcome: null as null,
    annotatorId: null as null,
    labelledAt: null as null,
    rationale: null as null,
    disagreement: "none" as const,
    insufficientContext: row.insufficientContext,
  }));
}

describe("human-queue residual pack", () => {
  test("builds ENG CLEARED / HUMAN BLOCKED pack for residuals #2/#3/#4/#5/#8", () => {
    const pack = buildHumanQueueResidualPack({generatedAt});
    expect(pack.engineeringScaffold).toBe("CLEARED");
    expect(pack.humanAcceptance).toBe("BLOCKED");
    expect(pack.summary.residualCount).toBe(5);
    expect(pack.summary.n1HumanCleared).toBe(0);
    expect(pack.summary.citeSupports).toBe(0);
    expect(pack.summary.n3Labels).toBe(0);
    expect(pack.summary.stagingOpsAcceptance).toBe("BLOCKED");
    expect(pack.summary.partnerLockedPilot).toBe(false);
    expect(pack.citeHitlPointer.pinPublicCiteApproved).toBe(0);
    expect(pack.stopList.length).toBeGreaterThanOrEqual(6);
    expect(parseHumanQueueResidualPack(pack).packHash).toBe(pack.packHash);
  });

  test("N1 attestation worksheet stays empty of licenceEvidenceUri", () => {
    const sheet = buildN1AttestationWorksheet({generatedAt, sources: loadSources()});
    expect(sheet.rows).toHaveLength(12);
    expect(sheet.humanCleared).toBe(0);
    expect(sheet.passageImported).toBe(0);
    expect(sheet.rows.every((r) => r.attestation.licenceEvidenceUri === null)).toBe(true);
    expect(parseN1AttestationWorksheet(sheet).worksheetHash).toBe(sheet.worksheetHash);
  });

  test("refuses invented N1 licenceEvidenceUri", () => {
    const sheet = buildN1AttestationWorksheet({generatedAt, sources: loadSources()});
    const bad = structuredClone(sheet) as typeof sheet;
    bad.rows[0]!.attestation.licenceEvidenceUri = "https://example.com/fake-licence" as unknown as null;
    expect(() => parseN1AttestationWorksheet(bad)).toThrow("licenceEvidenceUri");
  });

  test("N3 SME worksheet stays unlabelled with empty roster", () => {
    const sheet = buildN3SmeLabelWorksheet({generatedAt, labelRows: loadLabelRows()});
    expect(sheet.summary.labelledRows).toBe(0);
    expect(sheet.summary.smeSlotsFilled).toBe(0);
    expect(sheet.rows).toHaveLength(24);
    expect(parseN3SmeLabelWorksheet(sheet).worksheetHash).toBe(sheet.worksheetHash);
  });

  test("refuses invented N3 expectedOutcome", () => {
    const sheet = buildN3SmeLabelWorksheet({generatedAt, labelRows: loadLabelRows()});
    const bad = structuredClone(sheet) as typeof sheet;
    bad.rows[0]!.expectedOutcome = "supports" as unknown as null;
    expect(() => parseN3SmeLabelWorksheet(bad)).toThrow("scientific labels");
  });

  test("staging ops worksheet keeps opsAcceptance BLOCKED and empty accounts", () => {
    const sheet = buildStagingOpsAcceptanceWorksheet({generatedAt});
    expect(sheet.opsAcceptance).toBe("BLOCKED");
    expect(sheet.productionWritesEnabled).toBe(false);
    expect(sheet.authAWwwUserConfirmed).toBe(true);
    expect(sheet.summary.accountSlotsFilled).toBe(0);
    expect(parseStagingOpsAcceptanceWorksheet(sheet).worksheetHash).toBe(sheet.worksheetHash);
  });

  test("refuses invented staging neon_auth principal", () => {
    const sheet = buildStagingOpsAcceptanceWorksheet({generatedAt});
    const bad = structuredClone(sheet) as typeof sheet;
    bad.accountSlots[0]!.neonAuthUserId = "user_invented" as unknown as null;
    expect(() => parseStagingOpsAcceptanceWorksheet(bad)).toThrow("neon_auth");
  });

  test("partner MoU worksheet keeps legalBinding false and empty slots", () => {
    const sheet = buildPartnerMouAttestationWorksheet({generatedAt});
    expect(sheet.legalBinding).toBe(false);
    expect(sheet.lockedPilot).toBe(false);
    expect(sheet.summary.mouSlotsFilled).toBe(0);
    expect(parsePartnerMouAttestationWorksheet(sheet).worksheetHash).toBe(sheet.worksheetHash);
  });

  test("refuses invented MoU organisationName", () => {
    const sheet = buildPartnerMouAttestationWorksheet({generatedAt});
    const bad = structuredClone(sheet) as typeof sheet;
    bad.mouSlots[0]!.organisationName = "Invented Org" as unknown as null;
    expect(() => parsePartnerMouAttestationWorksheet(bad)).toThrow("MoU");
  });

  test("on-disk pack + worksheets match rebuild when present", () => {
    const packPath = resolve(root, "operations/human-queue/human-queue.v1.json");
    let onDisk: ReturnType<typeof parseHumanQueueResidualPack>;
    try {
      onDisk = parseHumanQueueResidualPack(JSON.parse(readFileSync(packPath, "utf8")));
    } catch {
      return; // first generate pass may not have written yet
    }
    const rebuilt = buildHumanQueueResidualPack({generatedAt: onDisk.generatedAt});
    expect(onDisk.packHash).toBe(rebuilt.packHash);
  });
});
