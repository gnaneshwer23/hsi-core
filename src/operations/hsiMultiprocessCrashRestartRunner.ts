/**
 * U38 runner — spawns two OS workers for exclusive ownership + crash/restart.
 * Fixture uses SQLite; live uses Neon after disposable-target authorization.
 */
import {spawn} from "node:child_process";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHsiNeonCheckpointStore} from "../db/hsiNeonCheckpointStore";
import {createHsiSqliteCheckpointStore} from "../db/hsiSqliteCheckpointStore";
import {
  finishHsiCheckpoint,
  hashHsiCheckpointInput,
  recoverHsiCheckpoint,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "../hsiAgentDurableCheckpoint";
import {
  assertHsiMultiprocessLiveAuthorization,
  assessHsiMultiprocessCrashRestartMode,
  type HsiMultiprocessSuiteMode,
} from "./hsiMultiprocessCrashRestartSuite";

export const HSI_MULTIPROCESS_RUN_RESULT_SCHEMA =
  "hsi-multiprocess-crash-restart-run-1" as const;

export type HsiMultiprocessWorkerClaimResult = {
  workerId: string;
  pid: number;
  ok: boolean;
  checkpoint: HsiDurableCheckpoint | null;
  error: string | null;
};

export type HsiMultiprocessRunResult = {
  schemaVersion: typeof HSI_MULTIPROCESS_RUN_RESULT_SCHEMA;
  mode: HsiMultiprocessSuiteMode;
  exclusiveOwnerCount: 1;
  winnerWorkerId: string;
  loserWorkerId: string;
  winnerPid: number;
  loserPid: number;
  crashRestartPath: "abandon_then_retry";
  recoveredAttempt: number;
  implementedAsLiveOsMultiProcessE2E: boolean;
  implementedAsLiveNeonMultiProcessE2E: boolean;
  acceptedForScope: false;
  scientificApproval: false;
  gateCAutoApprove: false;
  productionWritesEnabled: false;
  inventedNeonHost: false;
};

function requireLiveEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw Error(`Missing required env ${name}`);
  return v;
}

async function spawnWorker(input: {
  workerScript: string;
  env: Record<string, string>;
}): Promise<{pid: number; stdout: string; stderr: string; code: number | null}> {
  return await new Promise((resolve, reject) => {
    const child = spawn("bun", ["--no-env-file", input.workerScript], {
      env: {...process.env, ...input.env},
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({pid: child.pid ?? 0, stdout, stderr, code});
    });
  });
}

function parseClaim(stdout: string): {
  ok: boolean;
  checkpoint: HsiDurableCheckpoint | null;
  error: string | null;
} {
  const line = stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .at(-1);
  if (!line) return {ok: false, checkpoint: null, error: "empty worker stdout"};
  const parsed = JSON.parse(line) as {
    ok?: boolean;
    checkpoint?: HsiDurableCheckpoint | null;
    error?: string | null;
  };
  return {
    ok: parsed.ok === true,
    checkpoint: parsed.checkpoint ?? null,
    error: parsed.error ?? null,
  };
}

async function raceTwoClaimers(input: {
  workerScript: string;
  storeKind: "sqlite" | "neon";
  storePath?: string;
  databaseUrl?: string;
  neonProjectId?: string;
  investigationId: string;
  taskId: string;
  inputHash: string;
  startedAt: string;
}): Promise<{
  winner: HsiMultiprocessWorkerClaimResult;
  loser: HsiMultiprocessWorkerClaimResult;
}> {
  const baseEnv = {
    HSI_MP_ACTION: "claim",
    HSI_MP_STORE_KIND: input.storeKind,
    HSI_MP_STORE_PATH: input.storePath ?? "",
    HSI_MP_DATABASE_URL: input.databaseUrl ?? "",
    HSI_MP_NEON_PROJECT_ID: input.neonProjectId ?? "",
    HSI_MP_INVESTIGATION_ID: input.investigationId,
    HSI_MP_TASK_ID: input.taskId,
    HSI_MP_INPUT_HASH: input.inputHash,
    HSI_MP_STARTED_AT: input.startedAt,
  };

  const [a, b] = await Promise.all([
    spawnWorker({
      workerScript: input.workerScript,
      env: {...baseEnv, HSI_MP_WORKER_ID: "worker-a"},
    }),
    spawnWorker({
      workerScript: input.workerScript,
      env: {...baseEnv, HSI_MP_WORKER_ID: "worker-b"},
    }),
  ]);

  const claimA = parseClaim(a.stdout);
  const claimB = parseClaim(b.stdout);
  const aResult: HsiMultiprocessWorkerClaimResult = {
    workerId: "worker-a",
    pid: a.pid,
    ok: claimA.ok,
    checkpoint: claimA.checkpoint,
    error: claimA.error ?? (a.code === 0 ? null : a.stderr.slice(0, 200)),
  };
  const bResult: HsiMultiprocessWorkerClaimResult = {
    workerId: "worker-b",
    pid: b.pid,
    ok: claimB.ok,
    checkpoint: claimB.checkpoint,
    error: claimB.error ?? (b.code === 0 ? null : b.stderr.slice(0, 200)),
  };

  const winners = [aResult, bResult].filter((r) => r.ok);
  const losers = [aResult, bResult].filter((r) => !r.ok);
  if (winners.length !== 1 || losers.length !== 1) {
    throw Error(
      `Expected exactly one exclusive owner across OS processes; winners=${winners.length} losers=${losers.length}`,
    );
  }
  return {winner: winners[0]!, loser: losers[0]!};
}

function openStore(input: {
  storeKind: "sqlite" | "neon";
  storePath?: string;
  databaseUrl?: string;
  neonProjectId?: string;
}): HsiCheckpointStore {
  if (input.storeKind === "sqlite") {
    if (!input.storePath) throw Error("SQLite store path required");
    return createHsiSqliteCheckpointStore({databasePath: input.storePath});
  }
  if (!input.databaseUrl) throw Error("Neon database URL required");
  return createHsiNeonCheckpointStore({
    databaseUrl: input.databaseUrl,
    neonProjectId: input.neonProjectId,
  });
}

/**
 * Run exclusive-ownership OS race then abandon-then-retry crash/restart
 * using a second process identity on the shared store.
 */
export async function runHsiMultiprocessCrashRestartSuite(input: {
  mode: HsiMultiprocessSuiteMode;
  workerScript: string;
  repoRoot: string;
}): Promise<HsiMultiprocessRunResult | {mode: "check"; ok: true; assessment: ReturnType<typeof assessHsiMultiprocessCrashRestartMode>}> {
  const assessment = assessHsiMultiprocessCrashRestartMode(input.mode);
  if (input.mode === "check") {
    return {mode: "check", ok: true, assessment};
  }

  let storeKind: "sqlite" | "neon" = "sqlite";
  let storePath: string | undefined;
  let databaseUrl: string | undefined;
  let neonProjectId: string | undefined;
  let tempDir: string | undefined;
  let implementedAsLiveNeonMultiProcessE2E = false;

  if (input.mode === "fixture") {
    tempDir = mkdtempSync(join(tmpdir(), "hsi-mp-u38-"));
    storePath = join(tempDir, "checkpoints.sqlite");
    storeKind = "sqlite";
  } else {
    if (process.env.HSI_MULTIPROCESS_E2E_ENABLED !== "1") {
      throw Error(
        "Live multi-process E2E refused: set HSI_MULTIPROCESS_E2E_ENABLED=1 only on a disposable HSI Neon branch",
      );
    }
    if (process.env.HSI_MULTIPROCESS_LIVE_AUTHORIZED !== "1") {
      throw Error(
        "Live multi-process E2E refused: set HSI_MULTIPROCESS_LIVE_AUTHORIZED=1 for an owner-reviewed disposable run",
      );
    }
    assertHsiMultiprocessLiveAuthorization({
      enabled: process.env.HSI_MULTIPROCESS_E2E_ENABLED,
      liveAuthorized: process.env.HSI_MULTIPROCESS_LIVE_AUTHORIZED,
      databaseUrl: process.env.HSI_MULTIPROCESS_DATABASE_URL,
      target: {
        projectId: requireLiveEnv("HSI_MULTIPROCESS_PROJECT_ID"),
        branchId: requireLiveEnv("HSI_MULTIPROCESS_DISPOSABLE_BRANCH_ID"),
        parentId: requireLiveEnv("HSI_MULTIPROCESS_PRODUCTION_BRANCH_ID"),
        isDefault: false,
        isPrimary: false,
        expiresAt: requireLiveEnv("HSI_MULTIPROCESS_TARGET_EXPIRES_AT"),
      },
      pins: {
        projectId: requireLiveEnv("HSI_MULTIPROCESS_PROJECT_ID"),
        productionBranchId: requireLiveEnv("HSI_MULTIPROCESS_PRODUCTION_BRANCH_ID"),
        disposableBranchId: requireLiveEnv("HSI_MULTIPROCESS_DISPOSABLE_BRANCH_ID"),
      },
    });
    databaseUrl = process.env.HSI_MULTIPROCESS_DATABASE_URL;
    neonProjectId = process.env.HSI_MULTIPROCESS_PROJECT_ID;
    storeKind = "neon";
    implementedAsLiveNeonMultiProcessE2E = true;
  }

  const investigationId = `inv-mp-${Date.now().toString(36)}`;
  const taskId = "planner";
  const inputHash = hashHsiCheckpointInput({
    suite: "u38-multiprocess",
    investigationId,
    taskId,
  });
  const startedAt = new Date().toISOString();

  try {
    const {winner, loser} = await raceTwoClaimers({
      workerScript: input.workerScript,
      storeKind,
      storePath,
      databaseUrl,
      neonProjectId,
      investigationId,
      taskId,
      inputHash,
      startedAt,
    });

    const store = openStore({storeKind, storePath, databaseUrl, neonProjectId});
    const running = await store.read(investigationId, taskId);
    if (!running || running.state !== "running" || !winner.checkpoint) {
      throw Error("Winner checkpoint missing after OS race");
    }

    // Crash: leave RUNNING (do not finish). Second identity abandons then retries.
    const failed = await finishHsiCheckpoint({
      store,
      checkpoint: running,
      state: "failed",
      errorCode: "worker_crash_simulated",
      finishedAt: new Date().toISOString(),
    });
    const recovered = await recoverHsiCheckpoint({
      store,
      investigationId,
      taskId,
      inputHash,
      approvedBy: "u38-harness-operator",
      recoveryReason: "U38 multi-process abandon_then_retry after simulated crash",
      startedAt: new Date().toISOString(),
    });
    if (recovered.attempt !== failed.attempt + 1 || recovered.state !== "running") {
      throw Error("Crash/restart recovery did not advance attempt");
    }

    if (!assessment.mayClaimLiveOsMultiProcessE2E) {
      throw Error("Mode assessment forbids OS multi-process claim");
    }
    if (implementedAsLiveNeonMultiProcessE2E && !assessment.mayClaimLiveNeonMultiProcessE2E) {
      throw Error("Mode assessment forbids Neon multi-process claim");
    }

    return {
      schemaVersion: HSI_MULTIPROCESS_RUN_RESULT_SCHEMA,
      mode: input.mode,
      exclusiveOwnerCount: 1,
      winnerWorkerId: winner.workerId,
      loserWorkerId: loser.workerId,
      winnerPid: winner.pid,
      loserPid: loser.pid,
      crashRestartPath: "abandon_then_retry",
      recoveredAttempt: recovered.attempt,
      implementedAsLiveOsMultiProcessE2E: true,
      implementedAsLiveNeonMultiProcessE2E,
      acceptedForScope: false,
      scientificApproval: false,
      gateCAutoApprove: false,
      productionWritesEnabled: false,
      inventedNeonHost: false,
    };
  } finally {
    if (tempDir) {
      try {
        rmSync(tempDir, {recursive: true, force: true});
      } catch {
        /* best-effort cleanup */
      }
    }
  }
}
