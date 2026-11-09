import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HELD_MIGRATION_IDS, MIGRATION_LEDGER_ALIASES, migrationAlreadyRecorded } from "../src/db/migrate";
import { findPublicCopyIssues } from "../scripts/check-public-copy";
import { capabilityLevel, renderStatusMarkdown, SUPERSEDED_BANNER } from "../scripts/generate-status";

describe("migration ledger", () => {
  test("numeric prefixes are unique", () => {
    const files = readdirSync(resolve("db/migrations")).filter((file) => file.endsWith(".sql")).sort();
    const prefixes = files.map((file) => file.match(/^(\d+)/)?.[1] ?? "");
    expect(prefixes.every((prefix) => prefix.length > 0)).toBe(true);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    expect(files).toContain("019_hsi_isi_research_review.sql");
    expect(files).toContain("020_hsi_lhkg_rls_policies.sql");
    expect(files).not.toContain("012_isi_research_review.sql");
  });

  test("renamed 012 is skipped when the old ledger id exists", () => {
    expect(migrationAlreadyRecorded("019_hsi_isi_research_review", ["012_isi_research_review"])).toBe(true);
    expect(migrationAlreadyRecorded("019_hsi_isi_research_review", [])).toBe(false);
    expect(MIGRATION_LEDGER_ALIASES["019_hsi_isi_research_review"]).toEqual(["012_isi_research_review"]);
  });

  test("RLS policies stay unapplied", () => {
    expect(HELD_MIGRATION_IDS).toContain("020_hsi_lhkg_rls_policies");
    const sql = readFileSync(resolve("db/migrations/020_hsi_lhkg_rls_policies.sql"), "utf8");
    expect(sql).toContain("CREATE POLICY hsi_lhkg_nodes_reader_select");
    expect(sql).toContain("FOR SELECT");
    expect(sql).not.toMatch(/FOR INSERT/);
    expect(sql).toContain("NOT APPLIED");
  });
});

describe("status page", () => {
  test("maps register vocabulary onto four levels", () => {
    expect(capabilityLevel(["implemented"])).toBe("implemented");
    expect(capabilityLevel(["implemented", "connected"])).toBe("implemented");
    expect(capabilityLevel(["implemented", "blocked"])).toBe("partial");
    expect(capabilityLevel(["synthetic_only"])).toBe("stub");
    expect(capabilityLevel(["planned"])).toBe("absent");
  });

  test("docs/STATUS.md matches the capability register", () => {
    const register = JSON.parse(readFileSync(resolve("operations/capability-register/capability-register.v1.json"), "utf8"));
    expect(readFileSync(resolve("docs/STATUS.md"), "utf8")).toBe(renderStatusMarkdown(register));
  });

  test("older status documents point at the generated page", () => {
    for (const path of [
      "docs/BUILD_STATUS_AND_NEXT.md",
      "docs/PRD_IMPLEMENTATION_AUDIT.md",
      "docs/OUTPUTS.md",
      "docs/engineering/PRODUCTION_READINESS_AUDIT_2026-11-08.md",
      "docs/engineering/HSI_CAPABILITY_REGISTER_2026-11-08.md",
    ]) {
      expect(readFileSync(resolve(path), "utf8").includes(SUPERSEDED_BANNER)).toBe(true);
    }
  });
});

describe("public copy", () => {
  test("user-facing pages avoid retired brand names", () => {
    expect(findPublicCopyIssues()).toEqual([]);
  });
});
