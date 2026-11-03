import { describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createSourceRegistry, importSourceMetadata, parseSourceRegistry } from "../src/sourceRegistry";
import { HSI_T2D_IMMUNO_SEED_EDGES } from "../src/seed/t2dImmunoMetabolic";

const initial = () => createSourceRegistry(HSI_T2D_IMMUNO_SEED_EDGES);
const envelope = (status = "not_checked") => ({
  schemaVersion: "hsi-source-metadata-import-1", provider: "manual_metadata", retrievedAt: "2026-11-02T12:00:00.000Z",
  records: [{ pmid: "11244034", title: "Test metadata fixture", doi: null, publishedAt: null, licence: null, retractionStatus: status }],
});

describe("research source registry", () => {
  it("deduplicates real seed locators without creating verified source metadata", () => {
    const registry = initial();
    expect(registry.sources.length).toBeGreaterThan(0);
    expect(new Set(registry.sources.map((source) => source.pmid)).size).toBe(registry.sources.length);
    expect(registry.sources.every((source) => source.revisions.length === 0)).toBe(true);
    expect(registry.claimSupport).toBe("not_assessed");
    expect(registry.sources.find((source) => source.pmid === "11244034")!.claimIds.length).toBeGreaterThan(1);
  });

  it("is idempotent for unchanged metadata and preserves earlier versions on retraction", () => {
    const first = importSourceMetadata(initial(), envelope());
    const again = importSourceMetadata(first.registry, { ...envelope(), retrievedAt: "2026-11-03T12:00:00.000Z" });
    expect(again.added).toBe(0);
    expect(again.unchanged).toBe(1);
    expect(again.registry).toEqual(first.registry);
    const retracted = importSourceMetadata(first.registry, envelope("retracted"));
    const source = retracted.registry.sources.find((source) => source.pmid === "11244034")!;
    expect(source.revisions.length).toBe(2);
    expect(source.revisions[0]!.metadata.retractionStatus).toBe("not_checked");
    expect(source.revisions[1]!.metadata.retractionStatus).toBe("retracted");
    expect(retracted.registry.claimSupport).toBe("not_assessed");
    expect(parseSourceRegistry(retracted.registry)).toEqual(retracted.registry);
    const stale = importSourceMetadata(retracted.registry, { ...envelope(), retrievedAt: "2026-11-01T12:00:00.000Z" });
    expect(stale.quarantined.length).toBe(1);
    expect(stale.registry).toEqual(retracted.registry);
  });

  it("quarantines unknown fields, missing status, invalid identifiers/dates and out-of-corpus sources", () => {
    const row = envelope().records[0]!;
    for (const mutation of [{ ...row, patientName: "fixture" }, { ...row, pmid: "999999999" }, { ...row, doi: "javascript:alert(1)" }, { ...row, retractionStatus: undefined }, { ...row, publishedAt: "2026-02-31" }]) {
      const result = importSourceMetadata(initial(), { ...envelope(), records: [mutation] });
      expect(result.added).toBe(0);
      expect(result.quarantined.length).toBe(1);
      expect(result.registry).toEqual(initial());
      expect(JSON.stringify(result.quarantined)).not.toContain("patientName");
    }
  });

  it("rejects tampering, unsafe registry envelopes and unknown import versions", () => {
    const imported = importSourceMetadata(initial(), envelope()).registry;
    imported.sources.find((source) => source.pmid === "11244034")!.revisions[0]!.metadata.title = "tampered";
    expect(() => parseSourceRegistry(imported)).toThrow("content hash");
    expect(() => parseSourceRegistry({ ...initial(), containsPhi: true })).toThrow();
    expect(() => parseSourceRegistry({ ...initial(), patient: {} })).toThrow();
    expect(() => importSourceMetadata(initial(), { ...envelope(), schemaVersion: "unknown" })).toThrow();
    for (const retrievedAt of ["2026-02-31T12:00:00.000Z", "2026-11-02T12:00:00", "yesterday"]) {
      expect(() => importSourceMetadata(initial(), { ...envelope(), retrievedAt })).toThrow("timestamp");
    }
    expect(() => importSourceMetadata({ ...initial(), containsPhi: true } as never, envelope())).toThrow();
    const duplicated = importSourceMetadata(initial(), { ...envelope(), records: [envelope().records[0], envelope().records[0]] });
    expect(duplicated.quarantined[0]?.reason).toContain("Duplicate PMID");
  });

  it("CLI preserves the existing registry on a rejected import and refuses reinitialisation", () => {
    const directory = mkdtempSync(join(tmpdir(), "hsi-registry-test-"));
    try {
      const registry = join(directory, "registry.json");
      const input = join(directory, "input.json");
      writeFileSync(registry, JSON.stringify(initial()));
      const original = readFileSync(registry, "utf8");
      writeFileSync(input, JSON.stringify({ ...envelope(), records: [{ ...envelope().records[0], observation: 42 }] }));
      const cli = resolve(import.meta.dir, "../src/cli/source-registry.ts");
      expect(Bun.spawnSync([process.execPath, cli, "import", input, registry]).exitCode).toBe(1);
      expect(readFileSync(registry, "utf8")).toBe(original);
      expect(existsSync(`${registry}.lock`)).toBe(false);
      writeFileSync(`${registry}.lock`, "test-owned lock");
      writeFileSync(input, JSON.stringify(envelope()));
      expect(Bun.spawnSync([process.execPath, cli, "import", input, registry]).exitCode).toBe(1);
      expect(readFileSync(registry, "utf8")).toBe(original);
      expect(Bun.spawnSync([process.execPath, cli, "init", registry]).exitCode).toBe(1);
      expect(readFileSync(registry, "utf8")).toBe(original);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});
