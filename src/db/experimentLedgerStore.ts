/**
 * Neon R/W helper for migration 017 `hsi_experiment_ledger_records` (Audit #7 companion).
 * Fail-closed: neonGuard + writesEnabled + staging-only writes.
 * Offline N7 fixtures remain authority; never claims real observation / graph / Gate C.
 */
import {SQL} from "bun";
import {
  parseExperimentLedgerRecord,
  type ExperimentLifecycle,
  type ExperimentRecord,
} from "../evidence/experimentLedger";
import {
  assertLedgerNeonReadable,
  assertLedgerNeonWritable,
  type LedgerNeonStoreConfig,
} from "./ledgerNeonWriteGate";

export type ExperimentLedgerStoreConfig = LedgerNeonStoreConfig;

export type ExperimentLedgerNeonRow = {
  id: string;
  version: number;
  parent_version: number | null;
  lifecycle: string;
  data_basis: string;
  fixture_honesty: boolean;
  programme: string;
  prediction: unknown;
  protocol: unknown;
  raw_artifacts: unknown;
  processing: unknown;
  qc: unknown;
  outcome: unknown;
  review_candidate: unknown;
  frozen_eval_pins: unknown;
  scientific_approval: boolean;
  graph_promotable: boolean;
  real_observation_claimed: boolean;
  content_hash: string;
  created_at: string | Date;
  archived_at: string | Date | null;
};

function isoFromDb(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function experimentLedgerRecordFromNeonRow(row: ExperimentLedgerNeonRow): ExperimentRecord {
  return parseExperimentLedgerRecord({
    id: row.id,
    version: Number(row.version),
    parentVersion: row.parent_version === null ? null : Number(row.parent_version),
    lifecycle: row.lifecycle,
    dataBasis: row.data_basis,
    fixtureHonesty: row.fixture_honesty,
    programme: row.programme,
    prediction: row.prediction,
    protocol: row.protocol,
    rawArtifacts: row.raw_artifacts,
    processing: row.processing,
    qc: row.qc,
    outcome: row.outcome,
    reviewCandidate: row.review_candidate,
    frozenEvalPins: row.frozen_eval_pins,
    scientificApproval: false,
    graphPromotable: false,
    realObservationClaimed: false,
    createdAt: isoFromDb(row.created_at),
    contentHash: row.content_hash,
  });
}

function archivedAtForLifecycle(lifecycle: ExperimentLifecycle, createdAt: string): string | null {
  return lifecycle === "withdrawn" ? createdAt : null;
}

export type ExperimentLedgerStore = {
  readLive(id: string): Promise<ExperimentRecord | null>;
  readVersion(id: string, version: number): Promise<ExperimentRecord | null>;
  insert(record: ExperimentRecord): Promise<ExperimentRecord>;
};

export function createExperimentLedgerStore(config: ExperimentLedgerStoreConfig): ExperimentLedgerStore {
  assertLedgerNeonReadable(config);
  const open = () =>
    new SQL(config.databaseUrl, {tls: {rejectUnauthorized: true}, connectionTimeout: 10});

  return {
    async readLive(id) {
      const sql = open();
      try {
        const rows = await sql`
          SELECT * FROM hsi_experiment_ledger_records
          WHERE id = ${id}
            AND archived_at IS NULL
            AND lifecycle <> 'withdrawn'
          ORDER BY version DESC
          LIMIT 1
        `;
        if (!rows.length) return null;
        return experimentLedgerRecordFromNeonRow(rows[0] as ExperimentLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },

    async readVersion(id, version) {
      const sql = open();
      try {
        const rows = await sql`
          SELECT * FROM hsi_experiment_ledger_records
          WHERE id = ${id} AND version = ${version}
          LIMIT 1
        `;
        if (!rows.length) return null;
        return experimentLedgerRecordFromNeonRow(rows[0] as ExperimentLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },

    async insert(record) {
      assertLedgerNeonWritable(config);
      const validated = parseExperimentLedgerRecord(record);
      if (
        validated.scientificApproval !== false ||
        validated.graphPromotable !== false ||
        validated.realObservationClaimed !== false
      ) {
        throw new Error("Experiment ledger Neon insert refuses approval / graph / real-observation claims");
      }
      const archivedAt = archivedAtForLifecycle(validated.lifecycle, validated.createdAt);
      const sql = open();
      try {
        const rows = await sql`
          INSERT INTO hsi_experiment_ledger_records (
            id, version, parent_version, lifecycle, data_basis, fixture_honesty, programme,
            prediction, protocol, raw_artifacts, processing, qc, outcome, review_candidate,
            frozen_eval_pins, scientific_approval, graph_promotable, real_observation_claimed,
            content_hash, created_at, archived_at
          ) VALUES (
            ${validated.id},
            ${validated.version},
            ${validated.parentVersion},
            ${validated.lifecycle},
            ${validated.dataBasis},
            ${validated.fixtureHonesty},
            ${validated.programme},
            ${JSON.stringify(validated.prediction)}::jsonb,
            ${validated.protocol === null ? null : JSON.stringify(validated.protocol)}::jsonb,
            ${JSON.stringify(validated.rawArtifacts)}::jsonb,
            ${validated.processing === null ? null : JSON.stringify(validated.processing)}::jsonb,
            ${validated.qc === null ? null : JSON.stringify(validated.qc)}::jsonb,
            ${validated.outcome === null ? null : JSON.stringify(validated.outcome)}::jsonb,
            ${validated.reviewCandidate === null ? null : JSON.stringify(validated.reviewCandidate)}::jsonb,
            ${JSON.stringify(validated.frozenEvalPins)}::jsonb,
            false,
            false,
            false,
            ${validated.contentHash},
            ${validated.createdAt}::timestamptz,
            ${archivedAt}::timestamptz
          )
          RETURNING *
        `;
        return experimentLedgerRecordFromNeonRow(rows[0] as ExperimentLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },
  };
}
