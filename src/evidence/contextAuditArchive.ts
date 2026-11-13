import type {InvestigationScopeId} from "../investigationScope";
import { createHash } from 'node:crypto';
import { canonicalEvidenceJson } from './researchEvidenceCorpus';
import { validateContextConflictAudit, type ContextConflictAudit } from './contextConflictAudit';
export const contextArchiveDigest = (text: string) =>
  createHash('sha256').update(text).digest('hex');
export const contextArchiveHash = (value: unknown) =>
  contextArchiveDigest(canonicalEvidenceJson(value));
export type AuditArchiveBinding = {
  tenantId: string;
  ownerPrincipal: string;
  investigationId: string;
  packageHash: string;
  contextHash: string;
  releaseId: string;
  releaseVersion: string;
  manifestHash: string;
  diseaseScope: InvestigationScopeId;
};
export type ArchivedContextAudit = {
  schemaVersion: 'hsi-context-audit-archive-1';
  binding: AuditArchiveBinding;
  audit: ContextConflictAudit;
  storedAt: string;
  archiveHash: string;
};
export function assertArchiveIntegrity(row: ArchivedContextAudit) {
  const { archiveHash, ...body } = row;
  validateContextConflictAudit(row.audit);
  const b = row.binding;
  if (
    row.schemaVersion !== 'hsi-context-audit-archive-1' ||
    archiveHash !== contextArchiveHash(body) ||
    !Number.isFinite(Date.parse(row.storedAt)) ||
    Object.keys(b).sort().join() !==
      'contextHash,diseaseScope,investigationId,manifestHash,ownerPrincipal,packageHash,releaseId,releaseVersion,tenantId' ||
    ![b.packageHash, b.contextHash, b.manifestHash].every((v) => /^[a-f0-9]{64}$/.test(v)) ||
    ![b.tenantId, b.ownerPrincipal, b.investigationId, b.releaseId, b.releaseVersion].every(
      (v) => typeof v === 'string' && !!v.trim() && v.length <= 255,
    ) ||
    b.investigationId !== row.audit.investigationId ||
    b.diseaseScope !== row.audit.diseaseScope ||
    b.releaseId !== row.audit.release.id ||
    b.releaseVersion !== row.audit.release.version ||
    b.manifestHash !== row.audit.release.manifestHash
  )
    throw Error('Audit archive integrity failure');
}
