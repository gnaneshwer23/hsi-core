/**
 * Neon R/W helper for migration 016 `hsi_evidence_ledger_records` (Audit #7 companion).
 * Fail-closed: neonGuard + writesEnabled + staging-only writes.
 * Offline N2 fixtures remain authority until operators intentionally persist rows.
 * Never invents scientific approval, entailment, Gate C, or autumn-snow writes.
 */
import {SQL} from "bun";
import {
  parseEvidenceLedgerRecord,
  type EvidenceLedgerRecord,
  type LedgerRecordStatus,
} from "../evidence/evidenceLedger";
import {
  assertLedgerNeonReadable,
  assertLedgerNeonWritable,
  type LedgerNeonStoreConfig,
} from "./ledgerNeonWriteGate";

export type EvidenceLedgerStoreConfig = LedgerNeonStoreConfig;

export type EvidenceLedgerNeonRow = {
  id: string;
  version: number;
  parent_version: number | null;
  assertion_kind: string;
  assertion: string;
  subject_id: string;
  predicate: string;
  object_id: string;
  context: unknown;
  lineage: unknown;
  status: string;
  prediction_freeze: unknown;
  observation_protocol: unknown;
  legacy_epistemic_type: string | null;
  scientific_approval: boolean;
  graph_promotable: boolean;
  claim_entailment_assessed: boolean;
  content_hash: string;
  created_at: string | Date;
  archived_at: string | Date | null;
};

function isoFromDb(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Map a Neon row into a validated EvidenceLedgerRecord (domain types remain authority). */
export function evidenceLedgerRecordFromNeonRow(row: EvidenceLedgerNeonRow): EvidenceLedgerRecord {
  return parseEvidenceLedgerRecord({
    id: row.id,
    version: Number(row.version),
    parentVersion: row.parent_version === null ? null : Number(row.parent_version),
    assertionKind: row.assertion_kind,
    assertion: row.assertion,
    subjectId: row.subject_id,
    predicate: row.predicate,
    objectId: row.object_id,
    context: row.context,
    lineage: row.lineage,
    status: row.status,
    predictionFreeze: row.prediction_freeze,
    observationProtocol: row.observation_protocol,
    legacyEpistemicType: row.legacy_epistemic_type,
    scientificApproval: false,
    graphPromotable: false,
    claimEntailmentAssessed: false,
    createdAt: isoFromDb(row.created_at),
    contentHash: row.content_hash,
  });
}

function archivedAtForStatus(status: LedgerRecordStatus, createdAt: string): string | null {
  return status === "draft" ? null : createdAt;
}

export type EvidenceLedgerStore = {
  readLive(id: string): Promise<EvidenceLedgerRecord | null>;
  readVersion(id: string, version: number): Promise<EvidenceLedgerRecord | null>;
  /** Insert a validated record. Refuses when writesEnabled=false or non-staging. */
  insert(record: EvidenceLedgerRecord): Promise<EvidenceLedgerRecord>;
};

export function createEvidenceLedgerStore(config: EvidenceLedgerStoreConfig): EvidenceLedgerStore {
  assertLedgerNeonReadable(config);
  const open = () =>
    new SQL(config.databaseUrl, {tls: {rejectUnauthorized: true}, connectionTimeout: 10});

  return {
    async readLive(id) {
      const sql = open();
      try {
        const rows = await sql`
          SELECT * FROM hsi_evidence_ledger_records
          WHERE id = ${id} AND status = 'draft'
          ORDER BY version DESC
          LIMIT 1
        `;
        if (!rows.length) return null;
        return evidenceLedgerRecordFromNeonRow(rows[0] as EvidenceLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },

    async readVersion(id, version) {
      const sql = open();
      try {
        const rows = await sql`
          SELECT * FROM hsi_evidence_ledger_records
          WHERE id = ${id} AND version = ${version}
          LIMIT 1
        `;
        if (!rows.length) return null;
        return evidenceLedgerRecordFromNeonRow(rows[0] as EvidenceLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },

    async insert(record) {
      assertLedgerNeonWritable(config);
      const validated = parseEvidenceLedgerRecord(record);
      if (
        validated.scientificApproval !== false ||
        validated.graphPromotable !== false ||
        validated.claimEntailmentAssessed !== false
      ) {
        throw new Error("Evidence ledger Neon insert refuses approval / graph / entailment claims");
      }
      const archivedAt = archivedAtForStatus(validated.status, validated.createdAt);
      const sql = open();
      try {
        const rows = await sql`
          INSERT INTO hsi_evidence_ledger_records (
            id, version, parent_version, assertion_kind, assertion,
            subject_id, predicate, object_id, context, lineage, status,
            prediction_freeze, observation_protocol, legacy_epistemic_type,
            scientific_approval, graph_promotable, claim_entailment_assessed,
            content_hash, created_at, archived_at
          ) VALUES (
            ${validated.id},
            ${validated.version},
            ${validated.parentVersion},
            ${validated.assertionKind},
            ${validated.assertion},
            ${validated.subjectId},
            ${validated.predicate},
            ${validated.objectId},
            ${JSON.stringify(validated.context)}::jsonb,
            ${JSON.stringify(validated.lineage)}::jsonb,
            ${validated.status},
            ${validated.predictionFreeze === null ? null : JSON.stringify(validated.predictionFreeze)}::jsonb,
            ${validated.observationProtocol === null ? null : JSON.stringify(validated.observationProtocol)}::jsonb,
            ${validated.legacyEpistemicType},
            false,
            false,
            false,
            ${validated.contentHash},
            ${validated.createdAt}::timestamptz,
            ${archivedAt}::timestamptz
          )
          RETURNING *
        `;
        return evidenceLedgerRecordFromNeonRow(rows[0] as EvidenceLedgerNeonRow);
      } finally {
        await sql.close();
      }
    },
  };
}
