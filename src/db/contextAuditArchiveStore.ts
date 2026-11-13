/** Durable same-host ISOLATED REFERENCE, not a Neon adapter or serverless filesystem store.
 * No runtime grants, migrations or live acceptance follow from opening this file.
 */
import { Database } from 'bun:sqlite';
import {
  openSync,
  closeSync,
  lstatSync,
  realpathSync,
  chmodSync,
  constants,
  existsSync,
} from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import { canonicalEvidenceJson } from '../evidence/researchEvidenceCorpus';
import type { ContextAuditReview } from '../evidence/contextAuditReview';
import {
  contextArchiveHash,
  assertArchiveIntegrity,
  type ArchivedContextAudit,
} from '../evidence/contextAuditArchive';
export {
  contextArchiveHash,
  contextArchiveDigest,
  assertArchiveIntegrity,
} from '../evidence/contextAuditArchive';
export type { AuditArchiveBinding, ArchivedContextAudit } from '../evidence/contextAuditArchive';
export type ContextAuditArchiveStore = ReturnType<typeof openContextAuditArchive>;
export function openContextAuditArchive(input: { path: string; mode: 'isolated_reference' }) {
  if (
    input.mode !== 'isolated_reference' ||
    !isAbsolute(input.path) ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  )
    throw Error('Explicit isolated same-host audit store required');
  const parent = lstatSync(dirname(input.path));
  if (
    !parent.isDirectory() ||
    parent.isSymbolicLink() ||
    (parent.mode & 0o077) !== 0 ||
    (typeof process.getuid === 'function' && parent.uid !== process.getuid()) ||
    realpathSync(dirname(input.path)) !== dirname(input.path)
  )
    throw Error('Private canonical audit directory required');
  if (!existsSync(input.path)) {
    const fd = openSync(
      input.path,
      constants.O_CREAT | constants.O_EXCL | constants.O_RDWR | constants.O_NOFOLLOW,
      0o600,
    );
    closeSync(fd);
  }
  const stat = lstatSync(input.path);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.nlink !== 1 ||
    (stat.mode & 0o077) !== 0 ||
    (typeof process.getuid === 'function' && stat.uid !== process.getuid())
  )
    throw Error('Private regular audit file required');
  const db = new Database(input.path, { strict: true });
  db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
  db.exec(`CREATE TABLE IF NOT EXISTS context_audits(tenant_id TEXT NOT NULL,investigation_id TEXT NOT NULL,owner_principal TEXT NOT NULL,version INTEGER NOT NULL,audit_hash TEXT NOT NULL,archive_hash TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(tenant_id,investigation_id,version),UNIQUE(tenant_id,investigation_id,audit_hash));
    CREATE TABLE IF NOT EXISTS context_audit_reviews(tenant_id TEXT NOT NULL,investigation_id TEXT NOT NULL,audit_hash TEXT NOT NULL,decision_hash TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(tenant_id,investigation_id,audit_hash));
    CREATE TRIGGER IF NOT EXISTS context_audits_no_update BEFORE UPDATE ON context_audits BEGIN SELECT RAISE(ABORT,'Immutable audit'); END;
    CREATE TRIGGER IF NOT EXISTS context_audits_no_delete BEFORE DELETE ON context_audits BEGIN SELECT RAISE(ABORT,'Immutable audit'); END;
    CREATE TRIGGER IF NOT EXISTS context_reviews_no_update BEFORE UPDATE ON context_audit_reviews BEGIN SELECT RAISE(ABORT,'Immutable audit review'); END;
    CREATE TRIGGER IF NOT EXISTS context_reviews_no_delete BEFORE DELETE ON context_audit_reviews BEGIN SELECT RAISE(ABORT,'Immutable audit review'); END;`);
  const decode = (row: unknown): ArchivedContextAudit | null => {
    if (!row) return null;
    const r = row as {
      payload: string;
      audit_hash: string;
      archive_hash: string;
      owner_principal: string;
      tenant_id: string;
      investigation_id: string;
      version: number;
    };
    const v = JSON.parse(r.payload) as ArchivedContextAudit;
    assertArchiveIntegrity(v);
    if (
      v.archiveHash !== r.archive_hash ||
      v.audit.auditHash !== r.audit_hash ||
      v.binding.ownerPrincipal !== r.owner_principal ||
      v.binding.tenantId !== r.tenant_id ||
      v.binding.investigationId !== r.investigation_id ||
      v.audit.version !== r.version
    )
      throw Error('Audit index integrity failure');
    return v;
  };
  const latest = (tenant: string, id: string) =>
    decode(
      db
        .query(
          'SELECT * FROM context_audits WHERE tenant_id=? AND investigation_id=? ORDER BY version DESC LIMIT 1',
        )
        .get(tenant, id),
    );
  const read = (tenant: string, id: string, hash: string) =>
    decode(
      db
        .query(
          'SELECT * FROM context_audits WHERE tenant_id=? AND investigation_id=? AND audit_hash=?',
        )
        .get(tenant, id, hash),
    );
  const review = (tenant: string, id: string, hash: string): ContextAuditReview | null => {
    const r = db
      .query(
        'SELECT payload,decision_hash FROM context_audit_reviews WHERE tenant_id=? AND investigation_id=? AND audit_hash=?',
      )
      .get(tenant, id, hash) as { payload: string; decision_hash: string } | null;
    if (!r) return null;
    const v = JSON.parse(r.payload) as ContextAuditReview;
    const { decisionHash, id: _, ...body } = v;
    if (
      v.tenantId !== tenant ||
      v.investigationId !== id ||
      v.auditHash !== hash ||
      decisionHash !== r.decision_hash ||
      contextArchiveHash(body) !== decisionHash ||
      v.id !== 'audit-review-' + decisionHash.slice(0, 32)
    )
      throw Error('Audit review integrity failure');
    return v;
  };
  return {
    latest,
    read,
    review,
    append(row: ArchivedContextAudit) {
      assertArchiveIntegrity(row);
      return db
        .transaction(() => {
          const b = row.binding,
            old = read(b.tenantId, b.investigationId, row.audit.auditHash);
          if (old) {
            if (
              canonicalEvidenceJson({
                ...old,
                storedAt: row.storedAt,
                archiveHash: row.archiveHash,
              }) !== canonicalEvidenceJson(row)
            )
              throw Error('Audit replay binding conflict');
            return old;
          }
          const tip = latest(b.tenantId, b.investigationId);
          if (
            row.audit.version !== (tip?.audit.version ?? 0) + 1 ||
            row.audit.parentAuditHash !== (tip?.audit.auditHash ?? null) ||
            (tip && canonicalEvidenceJson(tip.binding) !== canonicalEvidenceJson(b))
          )
            throw Error('Stale parent or changed audit scope');
          db.query('INSERT INTO context_audits VALUES(?,?,?,?,?,?,?)').run(
            b.tenantId,
            b.investigationId,
            b.ownerPrincipal,
            row.audit.version,
            row.audit.auditHash,
            row.archiveHash,
            canonicalEvidenceJson(row),
          );
          return structuredClone(row);
        })
        .immediate();
    },
    decide(row: ArchivedContextAudit, value: ContextAuditReview) {
      return db
        .transaction(() => {
          const b = row.binding,
            current = read(b.tenantId, b.investigationId, row.audit.auditHash),
            tip = latest(b.tenantId, b.investigationId);
          if (
            !current ||
            current.archiveHash !== value.archiveHash ||
            tip?.audit.auditHash !== row.audit.auditHash ||
            value.ownerPrincipal !== b.ownerPrincipal ||
            value.tenantId !== b.tenantId ||
            value.investigationId !== b.investigationId ||
            value.ownerPrincipal === value.reviewerPrincipal
          )
            throw Error('Current independently reviewed audit required');
          const prior = review(b.tenantId, b.investigationId, row.audit.auditHash);
          if (prior) {
            if (
              prior.requestHash === value.requestHash &&
              prior.reviewerPrincipal === value.reviewerPrincipal
            )
              return prior;
            throw Error('Audit already decided');
          }
          db.query('INSERT INTO context_audit_reviews VALUES(?,?,?,?,?)').run(
            b.tenantId,
            b.investigationId,
            row.audit.auditHash,
            value.decisionHash,
            canonicalEvidenceJson(value),
          );
          return structuredClone(value);
        })
        .immediate();
    },
    close() {
      db.close();
      for (const suffix of ['', '-wal', '-shm'])
        if (existsSync(input.path + suffix)) chmodSync(input.path + suffix, 0o600);
    },
  };
}
