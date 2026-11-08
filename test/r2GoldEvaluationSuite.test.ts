import {describe, expect, test} from "bun:test";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";
import {
  buildR2GoldEvaluationSuite,
  parseR2GoldEvaluationSuite,
} from "../src/evidence/r2GoldEvaluationSuite";

const root = resolve(import.meta.dir, "..");
const generatedAt = "2026-11-08T15:45:00.000Z";

describe("R2 gold evaluation suite", () => {
  test("builds eng-CLEARED manifest with science BLOCKED and empty SME gold", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    expect(manifest.engineeringScaffold).toBe("CLEARED");
    expect(manifest.scientificAcceptance).toBe("BLOCKED");
    expect(manifest.rightsAcceptance).toBe("BLOCKED");
    expect(manifest.smeGoldFilled).toBe(false);
    expect(manifest.frozenHeldOut).toBe(false);
    expect(manifest.draftBankIsNotGold).toBe(true);
    expect(manifest.draftCaseCount).toBe(50);
    expect(manifest.summary.independentlyLabelledCases).toBe(0);
    expect(manifest.summary.adjudicatedCases).toBe(0);
    expect(manifest.summary.baselineMetricsScored).toBe(0);
    expect(manifest.r1PacketsBoundToGold).toBe(0);
    expect(manifest.worksheets.smeA.rows).toHaveLength(50);
    expect(manifest.worksheets.smeB.rows).toHaveLength(50);
    expect(manifest.worksheets.adjudication.rows).toHaveLength(50);
    expect(manifest.baselineMetrics.scientificAcceptance).toBe("BLOCKED");
    expect(manifest.baselineMetrics.metrics.every((m) => m.value === null)).toBe(true);
    expect(manifest.studyGroupedSplits.frozenHeldOut).toBe(false);
    expect(manifest.parkedHumanResiduals).toContain("#4 SMEs");
    expect(
      manifest.checks.filter((c) => c.plane === "engineering").every((c) => c.status === "CLEARED"),
    ).toBe(true);
    expect(
      manifest.checks
        .filter((c) => c.plane === "human")
        .every((c) => c.status === "PENDING_HUMAN" || c.status === "NO_GO" || c.status === "BLOCKED"),
    ).toBe(true);
    expect(parseR2GoldEvaluationSuite(manifest).inventoryHash).toBe(manifest.inventoryHash);
  });

  test("refuses invented SME labels on worksheets", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.worksheets.smeA.rows[0]!.acceptableAnswer = "invented" as unknown as null;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR2GoldEvaluationSuite(sealed)).toThrow("empty of labels");
  });

  test("refuses claiming scientificAcceptance CLEARED", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest & {scientificAcceptance: string};
    bad.scientificAcceptance = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR2GoldEvaluationSuite(sealed)).toThrow();
  });

  test("refuses frozen held-out claims", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.frozenHeldOut = true as unknown as false;
    bad.studyGroupedSplits.frozenHeldOut = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR2GoldEvaluationSuite(sealed)).toThrow();
  });

  test("refuses CLEARED human checks", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    const human = bad.checks.find((c) => c.plane === "human");
    expect(human).toBeDefined();
    human!.status = "CLEARED";
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR2GoldEvaluationSuite(sealed)).toThrow("cannot be CLEARED");
  });

  test("refuses smeGoldFilled=true", async () => {
    const manifest = await buildR2GoldEvaluationSuite({generatedAt, repoRoot: root});
    const bad = structuredClone(manifest) as typeof manifest;
    bad.smeGoldFilled = true as unknown as false;
    const {inventoryHash: _drop, ...body} = bad;
    void _drop;
    const sealed = {
      ...body,
      inventoryHash: createHash("sha256").update(canonicalEvidenceJson(body)).digest("hex"),
    };
    expect(() => parseR2GoldEvaluationSuite(sealed)).toThrow();
  });

  test("on-disk manifest matches rebuild", async () => {
    const onDisk = parseR2GoldEvaluationSuite(
      JSON.parse(
        readFileSync(
          resolve(root, "evaluation/gold-evaluation-suite/r2/suite-manifest.v1.json"),
          "utf8",
        ),
      ),
    );
    const rebuilt = await buildR2GoldEvaluationSuite({
      generatedAt: onDisk.generatedAt,
      repoRoot: root,
    });
    expect(onDisk.inventoryHash).toBe(rebuilt.inventoryHash);
  });
});
