import {describe, expect, test} from "bun:test";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {
  assertHsiRemainingAgentRolesSoftLand,
  hsiRemainingAgentRolesSoftLandPacket,
  hsiRemainingAgentRolesSurfaceById,
} from "../src/operations/hsiRemainingAgentRolesSoftLand";

describe("U44 remaining agent roles soft-land", () => {
  test("catalogues full_ssc surfaces and keeps LLM / Neon live gated", () => {
    const packet = hsiRemainingAgentRolesSoftLandPacket();
    const summary = assertHsiRemainingAgentRolesSoftLand(packet);
    expect(summary.surfaceCount).toBe(7);
    expect(summary.llmExecution).toBe(false);
    expect(summary.scientificApproval).toBe(false);
    expect(hsiRemainingAgentRolesSurfaceById("entity_resolver_checkpoint").engineeringReady).toBe(
      true,
    );
    expect(hsiRemainingAgentRolesSurfaceById("full_ssc_pipeline").engineeringReady).toBe(true);
    expect(hsiRemainingAgentRolesSurfaceById("llm_execution").engineeringReady).toBe(false);
    expect(hsiRemainingAgentRolesSurfaceById("neon_live_multiprocess").engineeringReady).toBe(
      false,
    );
  });

  test("docs keep U44 honesty", () => {
    const doc = readFileSync(
      join(import.meta.dir, "../docs/engineering/HSI_U44_REMAINING_AGENT_ROLES_2026-11-22.md"),
      "utf8",
    );
    expect(doc).toContain("full_ssc");
    expect(doc).toMatch(/entity_resolver/);
    expect(doc).toMatch(/No|not claimed/i);
  });
});
