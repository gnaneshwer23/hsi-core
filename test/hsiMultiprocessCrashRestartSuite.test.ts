import {describe, expect, test} from "bun:test";
import {join} from "node:path";
import {readFileSync} from "node:fs";
import {
  assertHsiMultiprocessCrashRestartSoftLand,
  assertHsiMultiprocessLiveAuthorization,
  assessHsiMultiprocessCrashRestartMode,
  hsiMultiprocessCrashRestartPacket,
  hsiMultiprocessSurfaceById,
  type HsiMultiprocessSuiteMode,
} from "../src/operations/hsiMultiprocessCrashRestartSuite";
import {runHsiMultiprocessCrashRestartSuite} from "../src/operations/hsiMultiprocessCrashRestartRunner";
import {createHsiSqliteCheckpointStore} from "../src/db/hsiSqliteCheckpointStore";
import {
  finishHsiCheckpoint,
  hashHsiCheckpointInput,
  startHsiCheckpoint,
} from "../src/hsiAgentDurableCheckpoint";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";

describe("U38 multi-process crash/restart suite soft-land", () => {
  test("documents six surfaces without inventing Neon hosts or acceptance", () => {
    const packet = hsiMultiprocessCrashRestartPacket();
    const summary = assertHsiMultiprocessCrashRestartSoftLand(packet);
    expect(summary.surfaceCount).toBe(6);
    expect(summary.acceptedForScope).toBe(false);
    expect(summary.inventedNeonHost).toBe(false);
    expect(packet.closesSoftLandGaps).toEqual(["U33", "U34"]);
    expect(hsiMultiprocessSurfaceById("disposable_neon_target").engineeringReady).toBe(false);
    expect(hsiMultiprocessSurfaceById("exclusive_ownership_os_race").engineeringReady).toBe(true);
  });

  test("mode assessor allows OS claim only for fixture/live and Neon only for live", () => {
    const modes: HsiMultiprocessSuiteMode[] = ["check", "fixture", "live"];
    for (const mode of modes) {
      const assessment = assessHsiMultiprocessCrashRestartMode(mode);
      expect(assessment.mayInventNeonHost).toBe(false);
      expect(assessment.mayClaimAcceptedForScope).toBe(false);
      expect(assessment.mayClaimScientificApproval).toBe(false);
      if (mode === "check") {
        expect(assessment.mayClaimLiveOsMultiProcessE2E).toBe(false);
        expect(assessment.mayClaimLiveNeonMultiProcessE2E).toBe(false);
        expect(assessment.ciSafe).toBe(true);
      } else if (mode === "fixture") {
        expect(assessment.mayClaimLiveOsMultiProcessE2E).toBe(true);
        expect(assessment.mayClaimLiveNeonMultiProcessE2E).toBe(false);
        expect(assessment.ciSafe).toBe(true);
      } else {
        expect(assessment.mayClaimLiveOsMultiProcessE2E).toBe(true);
        expect(assessment.mayClaimLiveNeonMultiProcessE2E).toBe(true);
        expect(assessment.ciSafe).toBe(false);
      }
    }
  });

  test("live authorization refuses missing flags and non-disposable targets", () => {
    expect(() =>
      assertHsiMultiprocessLiveAuthorization({
        enabled: undefined,
        liveAuthorized: "1",
        databaseUrl: "postgresql://u:p@ep-hsi-production.example/neondb",
        target: {
          projectId: "hsi-neon-project",
          branchId: "disp-1",
          parentId: "hsi-production-branch",
          isDefault: false,
          isPrimary: false,
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        },
        pins: {
          projectId: "hsi-neon-project",
          productionBranchId: "hsi-production-branch",
          disposableBranchId: "disp-1",
        },
      }),
    ).toThrow("HSI_MULTIPROCESS_E2E_ENABLED");

    expect(() =>
      assertHsiMultiprocessLiveAuthorization({
        enabled: "1",
        liveAuthorized: "1",
        databaseUrl: "postgresql://u:p@ep-hsi-production.example/neondb",
        target: {
          projectId: "hsi-neon-project",
          branchId: "hsi-production-branch",
          parentId: "hsi-production-branch",
          isDefault: true,
          isPrimary: true,
          expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        },
        pins: {
          projectId: "hsi-neon-project",
          productionBranchId: "hsi-production-branch",
          disposableBranchId: "disp-1",
        },
      }),
    ).toThrow("Disposable HSI rehearsal target not verified");
  });

  test("pending worksheet and soft-land doc stay honest", () => {
    const root = join(import.meta.dir, "..");
    const pending = JSON.parse(
      readFileSync(
        join(root, "operations/staging/hsi-multiprocess-crash-restart-u38.pending.json"),
        "utf8",
      ),
    ) as {
      opsAcceptance: string;
      acceptedForScope: boolean;
      inventedNeonHost: boolean;
      references: {disposable_neon_target_ref: string};
    };
    expect(pending.opsAcceptance).toBe("FIXTURE_OS_READY_NEON_LIVE_GATED");
    expect(pending.acceptedForScope).toBe(false);
    expect(pending.inventedNeonHost).toBe(false);
    expect(pending.references.disposable_neon_target_ref).toBe("NOT_APPROVED");

    const doc = readFileSync(
      join(root, "docs/engineering/HSI_U38_MULTIPROCESS_CRASH_RESTART_E2E_2026-11-21.md"),
      "utf8",
    );
    expect(doc).toContain("Never invent");
    expect(doc).toContain("U33");
    expect(doc).toContain("U34");
  });
});

describe("U38 SQLite CAS store", () => {
  test("compare-and-swap is exclusive across sequential openers", async () => {
    const dir = mkdtempSync(join(tmpdir(), "hsi-sqlite-cas-"));
    const path = join(dir, "cp.sqlite");
    try {
      const a = createHsiSqliteCheckpointStore({databasePath: path});
      const b = createHsiSqliteCheckpointStore({databasePath: path});
      const inputHash = hashHsiCheckpointInput({t: "sqlite-cas"});
      const startedAt = "2026-11-21T21:30:00.000Z";
      const first = await startHsiCheckpoint({
        store: a,
        investigationId: "inv-sqlite-1",
        taskId: "task",
        inputHash,
        startedAt,
      });
      await expect(
        startHsiCheckpoint({
          store: b,
          investigationId: "inv-sqlite-1",
          taskId: "task",
          inputHash,
          startedAt,
        }),
      ).rejects.toThrow();
      const finished = await finishHsiCheckpoint({
        store: a,
        checkpoint: first,
        state: "completed",
        outputRef: "out-1",
        finishedAt: "2026-11-21T21:30:01.000Z",
      });
      expect(finished.state).toBe("completed");
      const stored = await b.read("inv-sqlite-1", "task");
      expect(stored?.state).toBe("completed");
    } finally {
      rmSync(dir, {recursive: true, force: true});
    }
  });
});

describe("U38 fixture OS multi-process runner", () => {
  test("spawns two OS workers and recovers after simulated crash", async () => {
    const root = join(import.meta.dir, "..");
    const result = await runHsiMultiprocessCrashRestartSuite({
      mode: "fixture",
      workerScript: join(root, "scripts/staging-multiprocess-worker.ts"),
      repoRoot: root,
    });
    if (!("exclusiveOwnerCount" in result)) {
      throw new Error("expected fixture run result");
    }
    expect(result.exclusiveOwnerCount).toBe(1);
    expect(result.winnerWorkerId).not.toBe(result.loserWorkerId);
    expect(result.winnerPid).not.toBe(result.loserPid);
    expect(result.crashRestartPath).toBe("abandon_then_retry");
    expect(result.recoveredAttempt).toBe(2);
    expect(result.implementedAsLiveOsMultiProcessE2E).toBe(true);
    expect(result.implementedAsLiveNeonMultiProcessE2E).toBe(false);
    expect(result.acceptedForScope).toBe(false);
    expect(result.scientificApproval).toBe(false);
    expect(result.inventedNeonHost).toBe(false);
  }, 30_000);

  test("live mode without env refuses before spawn", async () => {
    const root = join(import.meta.dir, "..");
    const prev = process.env.HSI_MULTIPROCESS_E2E_ENABLED;
    delete process.env.HSI_MULTIPROCESS_E2E_ENABLED;
    try {
      await expect(
        runHsiMultiprocessCrashRestartSuite({
          mode: "live",
          workerScript: join(root, "scripts/staging-multiprocess-worker.ts"),
          repoRoot: root,
        }),
      ).rejects.toThrow("HSI_MULTIPROCESS_E2E_ENABLED");
    } finally {
      if (prev === undefined) delete process.env.HSI_MULTIPROCESS_E2E_ENABLED;
      else process.env.HSI_MULTIPROCESS_E2E_ENABLED = prev;
    }
  });
});
