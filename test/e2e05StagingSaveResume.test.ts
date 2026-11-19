import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessE2e05SaveResumeMode,
  assertE2e05StagingSaveResumeSoftLand,
  e2e05PersistencePathById,
  e2e05StagingSaveResumePacket,
  type E2e05PersistencePathId,
  type E2e05SuiteMode,
} from "../src/operations/e2e05StagingSaveResume";

describe("PR-E2E-05 staging save/resume soft-land", () => {
  test("documents five paths without enabling production writes", () => {
    const packet = e2e05StagingSaveResumePacket();
    const summary = assertE2e05StagingSaveResumeSoftLand(packet);
    expect(summary.pathCount).toBe(5);
    expect(summary.productionWritesEnabled).toBe(false);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.migrationHoldsChanged).toBe(false);
    expect(packet.backlogId).toBe("PR-E2E-05");
    expect(packet.honesty.noProductionWrites).toBe(true);
    expect(packet.honesty.noHoldRemoval).toBe(true);
  });

  test("each path refuses production and stays unaccepted", () => {
    const paths: E2e05PersistencePathId[] = [
      "device_local_default",
      "graph_workspace_server",
      "investigation_compose",
      "dashboard_owned_list",
      "production_writes",
    ];
    for (const path of paths) {
      const row = e2e05PersistencePathById(path);
      expect(row.path).toBe(path);
      expect(row.productionAllowed).toBe(false);
      expect(row.acceptedForScope).toBe(false);
      expect(row.holdsUnchanged).toBe(true);
      expect(row.pathHints.length).toBeGreaterThan(0);
    }
    expect(e2e05PersistencePathById("device_local_default").defaultEnabled).toBe(true);
    expect(e2e05PersistencePathById("graph_workspace_server").defaultEnabled).toBe(false);
    expect(e2e05PersistencePathById("graph_workspace_server").stagingOwnerGated).toBe(true);
  });

  test("mode assessor never enables production writes or acceptance", () => {
    const modes: E2e05SuiteMode[] = ["check", "fixture"];
    for (const mode of modes) {
      const assessment = assessE2e05SaveResumeMode(mode);
      expect(assessment.mayClaimAcceptance).toBe(false);
      expect(assessment.mayEnableProductionWrites).toBe(false);
      expect(assessment.mayClaimLiveOwnedList).toBe(false);
      expect(assessment.ciSafe).toBe(true);
      expect(assessment.acceptedForScope).toBe(false);
      expect(assessment.reasons.length).toBeGreaterThan(0);
    }
  });

  test("pending worksheet and soft-land doc stay blocked / honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(join(root, "operations/staging/e2e-05-staging-save-resume.pending.json"), "utf8"),
    ) as {
      opsAcceptance: string;
      productionWritesEnabled: boolean;
      acceptedForScope: boolean;
      migrationHoldsChanged: boolean;
      references: { staging_target_ref: string; security_signer_ref: string };
    };
    expect(pending.opsAcceptance).toBe("BLOCKED");
    expect(pending.productionWritesEnabled).toBe(false);
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.migrationHoldsChanged).toBe(false);
    expect(pending.references.staging_target_ref).toBe("NOT_APPROVED");
    expect(pending.references.security_signer_ref).toBe("UNASSIGNED");

    const doc = readFileSync(
      join(root, "docs/engineering/E2E_05_STAGING_SAVE_RESUME_SOFT_LAND.md"),
      "utf8",
    );
    expect(doc).toContain("Not claimed");
    expect(doc).toContain("PR-E2E-05");
    expect(doc).toContain("production writes");
  });
});
