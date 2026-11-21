/** File-backed SQLite checkpoint CAS store for multi-process fixture E2E (U38).
 *
 * Proves exclusive ownership and crash/restart across OS processes without Neon.
 * Not a production persistence path. Live Neon uses `createHsiNeonCheckpointStore`.
 */
import {Database} from "bun:sqlite";
import {
  validateHsiCheckpoint,
  type HsiCheckpointStore,
  type HsiDurableCheckpoint,
} from "../hsiAgentDurableCheckpoint";

function toRecord(row: Record<string, unknown>): HsiDurableCheckpoint {
  return {
    schemaVersion: "hsi-agent-checkpoint-1",
    investigationId: String(row.investigation_id),
    taskId: String(row.task_id),
    attempt: Number(row.attempt),
    state: row.state as HsiDurableCheckpoint["state"],
    version: Number(row.version),
    inputHash: String(row.input_hash),
    outputRef: row.output_ref === null || row.output_ref === undefined ? null : String(row.output_ref),
    errorCode: row.error_code === null || row.error_code === undefined ? null : String(row.error_code),
    startedAt: String(row.started_at),
    finishedAt:
      row.finished_at === null || row.finished_at === undefined ? null : String(row.finished_at),
  };
}

/** Open (or create) a durable SQLite checkpoint store at `databasePath`. */
export function createHsiSqliteCheckpointStore(config: {
  databasePath: string;
}): HsiCheckpointStore {
  if (!config.databasePath.trim() || config.databasePath === ":memory:") {
    throw Error("SQLite multi-process store requires a durable filesystem path");
  }

  const open = () => {
    const db = new Database(config.databasePath, {create: true});
    db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    db.exec(`
      CREATE TABLE IF NOT EXISTS hsi_agent_checkpoints (
        investigation_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        schema_version TEXT NOT NULL CHECK(schema_version='hsi-agent-checkpoint-1'),
        attempt INTEGER NOT NULL CHECK(attempt BETWEEN 1 AND 3),
        state TEXT NOT NULL CHECK(state IN ('created','running','completed','blocked','failed','cancelled')),
        version INTEGER NOT NULL CHECK(version>0),
        input_hash TEXT NOT NULL CHECK(length(input_hash)=64),
        output_ref TEXT,
        error_code TEXT,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        PRIMARY KEY(investigation_id, task_id)
      );
    `);
    return db;
  };

  return {
    async read(investigationId, taskId) {
      const db = open();
      try {
        const row = db
          .query(
            `SELECT * FROM hsi_agent_checkpoints WHERE investigation_id=? AND task_id=? LIMIT 1`,
          )
          .get(investigationId, taskId) as Record<string, unknown> | null;
        if (!row) return null;
        const c = toRecord(row);
        validateHsiCheckpoint(c);
        return c;
      } finally {
        db.close();
      }
    },

    async compareAndSwap(expectedVersion, next) {
      validateHsiCheckpoint(next);
      const db = open();
      try {
        db.exec("BEGIN IMMEDIATE");
        try {
          if (expectedVersion === null) {
            if (next.version !== 1) {
              db.exec("ROLLBACK");
              return false;
            }
            const existing = db
              .query(
                `SELECT version FROM hsi_agent_checkpoints WHERE investigation_id=? AND task_id=?`,
              )
              .get(next.investigationId, next.taskId);
            if (existing) {
              db.exec("ROLLBACK");
              return false;
            }
            db.query(
              `INSERT INTO hsi_agent_checkpoints(
                investigation_id,task_id,schema_version,attempt,state,version,
                input_hash,output_ref,error_code,started_at,finished_at
              ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            ).run(
              next.investigationId,
              next.taskId,
              next.schemaVersion,
              next.attempt,
              next.state,
              next.version,
              next.inputHash,
              next.outputRef,
              next.errorCode,
              next.startedAt,
              next.finishedAt,
            );
            db.exec("COMMIT");
            return true;
          }

          if (next.version !== expectedVersion + 1) {
            db.exec("ROLLBACK");
            return false;
          }
          const result = db
            .query(
              `UPDATE hsi_agent_checkpoints SET
                attempt=?, state=?, version=?, input_hash=?, output_ref=?, error_code=?,
                started_at=?, finished_at=?
               WHERE investigation_id=? AND task_id=? AND version=? AND input_hash=?`,
            )
            .run(
              next.attempt,
              next.state,
              next.version,
              next.inputHash,
              next.outputRef,
              next.errorCode,
              next.startedAt,
              next.finishedAt,
              next.investigationId,
              next.taskId,
              expectedVersion,
              next.inputHash,
            );
          if (result.changes !== 1) {
            db.exec("ROLLBACK");
            return false;
          }
          db.exec("COMMIT");
          return true;
        } catch (error) {
          try {
            db.exec("ROLLBACK");
          } catch {
            /* already rolled back */
          }
          throw error;
        }
      } finally {
        db.close();
      }
    },
  };
}
