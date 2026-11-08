import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {parseN1PassageRightsInventory} from "../src/evidence/n1PassageRightsInventory";
import {
  buildR1BiomedicalSourcePackets,
  parseR1BiomedicalSourcePackets,
} from "../src/evidence/r1BiomedicalSourcePackets";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-08T15:30:00.000Z";

describe("R1 biomedical source packets", () => {
  test("builds eng-CLEARED inventory with science/rights BLOCKED and empty clearances", () => {
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    expect(inventory.engineeringScaffold).toBe("CLEARED");
    expect(inventory.scientificAcceptance).toBe("BLOCKED");
    expect(inventory.rightsAcceptance).toBe("BLOCKED");
    expect(inventory.summary.humanCleared).toBe(0);
    expect(inventory.summary.passageImported).toBe(0);
    expect(inventory.summary.packetSlotsReserved).toBe(12);
    expect(inventory.summary.packetSlotsRightsCleared).toBe(0);
    expect(inventory.packets).toHaveLength(12);
    expect(inventory.packets.every((p) => p.rightsStatus === "rights_pending_quarantine")).toBe(
      true,
    );
    expect(inventory.packets.every((p) => p.licenceEvidenceUri === null)).toBe(true);
    expect(inventory.packets.every((p) => p.passageTextImported === false)).toBe(true);
    expect(inventory.packets.every((p) => p.goldEvalBinding.bound === false)).toBe(true);
    expect(inventory.datasetLifecycleScaffold.smeGoldFilled).toBe(false);
    expect(inventory.parkedHumanResiduals).toContain("#2 N1 rights");
    expect(
      inventory.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED"),
    ).toBe(true);
    expect(
      inventory.checks
        .filter((c) => c.plane === "human")
        .every((c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED"),
    ).toBe(true);
    expect(parseR1BiomedicalSourcePackets(inventory).inventoryHash).toBe(inventory.inventoryHash);
  });

  test("binds N1 rights inventory hash and queue ids", () => {
    const rights = parseN1PassageRightsInventory(
      JSON.parse(
        readFileSync(resolve(root, "research/domain-graph/n1/rights-inventory.v1.json"), "utf8"),
      ),
    );
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    expect(inventory.n1RightsInventoryHash).toBe(rights.inventoryHash);
    expect(inventory.n1ReceiptHash).toBe(rights.n1ReceiptHash);
    expect(inventory.summary.humanCleared).toBe(rights.summary.humanCleared);
    expect(inventory.summary.passageImported).toBe(rights.summary.passageImported);
    const queueIds = inventory.packets.map((p) => p.queueId).sort();
    expect(queueIds).toEqual(rights.entries.map((e) => e.queueId).sort());
  });

  test("refuses invented licenceEvidenceUri on packets", () => {
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    const bad = structuredClone(inventory) as typeof inventory;
    bad.packets[0]!.licenceEvidenceUri = "https://example.invalid/licence" as unknown as null;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR1BiomedicalSourcePackets(sealed)).toThrow("rights-pending quarantine");
  });

  test("refuses claiming scientificAcceptance CLEARED", () => {
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    const bad = structuredClone(inventory) as typeof inventory & {scientificAcceptance: string};
    bad.scientificAcceptance = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR1BiomedicalSourcePackets(sealed)).toThrow();
  });

  test("refuses CLEARED human checks", () => {
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    const bad = structuredClone(inventory) as typeof inventory;
    const human = bad.checks.find((c) => c.plane === "human");
    expect(human).toBeDefined();
    human!.status = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR1BiomedicalSourcePackets(sealed)).toThrow("cannot be CLEARED");
  });

  test("refuses SME gold fill on lifecycle scaffold", () => {
    const inventory = buildR1BiomedicalSourcePackets({generatedAt, repoRoot: root});
    const bad = structuredClone(inventory) as typeof inventory;
    bad.datasetLifecycleScaffold.smeGoldFilled = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR1BiomedicalSourcePackets(sealed)).toThrow();
  });

  test("on-disk inventory matches rebuild", () => {
    const onDisk = parseR1BiomedicalSourcePackets(
      JSON.parse(
        readFileSync(resolve(root, "research/domain-graph/r1/source-packets.v1.json"), "utf8"),
      ),
    );
    const rebuilt = buildR1BiomedicalSourcePackets({
      generatedAt: onDisk.generatedAt,
      repoRoot: root,
    });
    expect(onDisk.inventoryHash).toBe(rebuilt.inventoryHash);
  });
});
