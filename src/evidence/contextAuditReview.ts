/** Audit-specific human assessment. Never evidence-brief or graph-publication approval. */
import { canonicalEvidenceJson } from './researchEvidenceCorpus';
import { rejectPhiPayload } from '../cdsPhiBoundary';
export type ContextAuditReviewRequest = {
  requestId: string;
  auditHash: string;
  decision: 'accept_with_limitations' | 'needs_evidence' | 'reject';
  rationale: string;
  limitations: string[];
  conflictOfInterestDeclared: true;
};
export type ContextAuditReview = ContextAuditReviewRequest & {
  schemaVersion: 'hsi-context-audit-review-1';
  id: string;
  requestHash: string;
  decisionHash: string;
  investigationId: string;
  packageHash: string;
  contextHash: string;
  archiveHash: string;
  tenantId: string;
  ownerPrincipal: string;
  reviewerPrincipal: string;
  diseaseScope: 'ssc' | 'ra';
  reviewedAt: string;
  scope: 'context_audit_only';
  scientificApproval: false;
  graphPromotable: false;
};
const hex = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const exact = (v: unknown, keys: string[]) => {
  if (
    !v ||
    typeof v !== 'object' ||
    Array.isArray(v) ||
    Object.keys(v).sort().join() !== keys.sort().join()
  )
    throw Error('Invalid audit review fields');
};
export function parseContextAuditReviewRequest(value: unknown): ContextAuditReviewRequest {
  exact(value, [
    'requestId',
    'auditHash',
    'decision',
    'rationale',
    'limitations',
    'conflictOfInterestDeclared',
  ]);
  const v = value as ContextAuditReviewRequest;
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.requestId) ||
    !hex(v.auditHash) ||
    !['accept_with_limitations', 'needs_evidence', 'reject'].includes(v.decision) ||
    typeof v.rationale !== 'string' ||
    !v.rationale.trim() ||
    v.rationale.length > 4000 ||
    !Array.isArray(v.limitations) ||
    v.limitations.length > 20 ||
    v.limitations.some((x) => typeof x !== 'string' || !x.trim() || x.length > 1000) ||
    (v.decision === 'accept_with_limitations' && !v.limitations.length) ||
    v.conflictOfInterestDeclared !== true ||
    !rejectPhiPayload({ textBlobs: [v.rationale, ...v.limitations] }).ok
  )
    throw Error('Invalid audit review request');
  return structuredClone(v);
}
export async function verifyContextAuditReview(
  value: ContextAuditReview,
  expected: {
    auditHash: string;
    investigationId: string;
    packageHash: string;
    contextHash: string;
    diseaseScope: 'ssc' | 'ra';
  },
  digest: (s: string) => Promise<string>,
) {
  const request = parseContextAuditReviewRequest(
    Object.fromEntries(
      [
        'requestId',
        'auditHash',
        'decision',
        'rationale',
        'limitations',
        'conflictOfInterestDeclared',
      ].map((k) => [k, value[k as keyof ContextAuditReview]]),
    ),
  );
  const { decisionHash, id: _id, ...body } = value;
  exact(value, [
    'schemaVersion',
    'id',
    'requestHash',
    'decisionHash',
    'investigationId',
    'packageHash',
    'contextHash',
    'archiveHash',
    'tenantId',
    'ownerPrincipal',
    'reviewerPrincipal',
    'diseaseScope',
    'reviewedAt',
    'scope',
    'scientificApproval',
    'graphPromotable',
    ...Object.keys(request),
  ]);
  if (
    value.schemaVersion !== 'hsi-context-audit-review-1' ||
    value.scope !== 'context_audit_only' ||
    value.scientificApproval !== false ||
    value.graphPromotable !== false ||
    value.ownerPrincipal === value.reviewerPrincipal ||
    ![value.tenantId, value.ownerPrincipal, value.reviewerPrincipal].every(
      (x) => typeof x === 'string' && !!x.trim() && x.length <= 255,
    ) ||
    !Number.isFinite(Date.parse(value.reviewedAt)) ||
    Object.entries(expected).some(([k, v]) => value[k as keyof ContextAuditReview] !== v) ||
    !hex(value.archiveHash) ||
    !hex(value.decisionHash) ||
    value.requestHash !== (await digest(canonicalEvidenceJson(request))) ||
    decisionHash !== (await digest(canonicalEvidenceJson(body))) ||
    value.id !== 'audit-review-' + decisionHash.slice(0, 32)
  )
    throw Error('Unbound audit review decision');
  return value;
}
