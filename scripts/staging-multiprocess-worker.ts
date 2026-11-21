#!/usr/bin/env bun
/**
 * U38 multi-process worker — claim a durable checkpoint fence and print JSON.
 * Invoked by the suite runner as a separate OS process.
 */
import {createHsiNeonCheckpointStore} from "../src/db/hsiNeonCheckpointStore";
import {createHsiSqliteCheckpointStore} from "../src/db/hsiSqliteCheckpointStore";
import {startHsiCheckpoint, type HsiCheckpointStore} from "../src/hsiAgentDurableCheckpoint";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw Error(`Missing ${name}`);
  return v;
}

function openStore(): HsiCheckpointStore {
  const kind = requireEnv("HSI_MP_STORE_KIND");
  if (kind === "sqlite") {
    return createHsiSqliteCheckpointStore({databasePath: requireEnv("HSI_MP_STORE_PATH")});
  }
  if (kind === "neon") {
    return createHsiNeonCheckpointStore({
      databaseUrl: requireEnv("HSI_MP_DATABASE_URL"),
      neonProjectId: process.env.HSI_MP_NEON_PROJECT_ID,
    });
  }
  throw Error(`Unknown store kind: ${kind}`);
}

async function main(): Promise<void> {
  const action = requireEnv("HSI_MP_ACTION");
  const workerId = requireEnv("HSI_MP_WORKER_ID");
  if (action !== "claim") {
    console.log(JSON.stringify({ok: false, workerId, error: `unsupported action ${action}`}));
    process.exit(2);
  }

  const store = openStore();
  try {
    const checkpoint = await startHsiCheckpoint({
      store,
      investigationId: requireEnv("HSI_MP_INVESTIGATION_ID"),
      taskId: requireEnv("HSI_MP_TASK_ID"),
      inputHash: requireEnv("HSI_MP_INPUT_HASH"),
      startedAt: requireEnv("HSI_MP_STARTED_AT"),
    });
    console.log(JSON.stringify({ok: true, workerId, checkpoint, error: null}));
  } catch (error) {
    const message = error instanceof Error ? error.message : "claim failed";
    console.log(JSON.stringify({ok: false, workerId, checkpoint: null, error: message}));
    process.exit(0);
  }
}

main().catch((error) => {
  console.log(
    JSON.stringify({
      ok: false,
      workerId: process.env.HSI_MP_WORKER_ID ?? "unknown",
      checkpoint: null,
      error: error instanceof Error ? error.message : "worker failed",
    }),
  );
  process.exit(1);
});
