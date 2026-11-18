import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const impl = join(root, "docs/implementation");

describe("HSI Phase 0 E2E product audit package", () => {
  test("master spec and Phase 0 deliverables exist", () => {
    for (const name of [
      "HSI_MASTER_E2E_PRODUCT_BUILD_SPEC.md",
      "00-current-state.md",
      "01-gap-matrix.md",
      "02-prioritised-backlog.md",
    ]) {
      expect(existsSync(join(impl, name))).toBe(true);
    }
  });

  test("spec centres scientific workflow and forbids greenfield rebuild", () => {
    const spec = readFileSync(join(impl, "HSI_MASTER_E2E_PRODUCT_BUILD_SPEC.md"), "utf8");
    expect(spec).toContain("working scientific investigation is the product centre");
    expect(spec).toContain("Do not");
    expect(spec).toContain("Phase 0");
    expect(spec).toContain("Biological Context Passport");
  });

  test("gap matrix uses required status vocabulary and cites PR 275", () => {
    const matrix = readFileSync(join(impl, "01-gap-matrix.md"), "utf8");
    for (const status of ["WORKING", "PARTIAL", "MOCKED", "BLOCKED", "MISSING", "UNVERIFIED"]) {
      expect(matrix).toContain(status);
    }
    const state = readFileSync(join(impl, "00-current-state.md"), "utf8");
    expect(state).toContain("275");
    expect(state).toContain("writesEnabledClaimed");
    expect(state).toContain("localStorage");
  });

  test("backlog proposes passport-first safe PR before homepage centre of gravity", () => {
    const backlog = readFileSync(join(impl, "02-prioritised-backlog.md"), "utf8");
    expect(backlog).toContain("PR-E2E-01");
    expect(backlog).toContain("Context Passport");
    expect(backlog).toContain("not homepage");
  });
});
